/* udf_drv.c — 可复用 PUC Lua 5.4 in WASM 模块：把 29 个 lib 编进去，
   导出 lua_call(name, input_json) -> 结果字符串。
   回调库的 _duckdb_call/_duckdb_query 通过 EM_JS 桥到宿主（DuckDB-Wasm 第二连接）。
   编译：em++ -x c++  + PUC Lua 全源 + 本文件。
   依赖头：cur_embed.h（由构建脚本生成，定义 CUR_N/CUR_NAME/CUR_LIB/CUR_CALLER）。
*/
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <string>
#include <emscripten.h>   /* EM_JS 宏 + Module 访问（必须在 EM_JS 使用前）*/
#include "lua.h"
#include "lualib.h"
#include "lauxlib.h"
#include "cur_embed.h"   /* CUR_N, CUR_NAME[], CUR_LIB[], CUR_CALLER[] */

static lua_State *g_L = NULL;
static char g_result[262144];   /* 结果复用缓冲（ccall 'string' 会立即拷贝走）*/
static int g_stage = -1;        /* 诊断：init 进行到哪一步（-1=未开始 0=newstate 1=reg 2=libs 3=callers 4=done）*/

/* ---- 宿主桥：回调库调用 DuckDB（宿主在 Module 上注入 _host_*）----
   实测：emcc 3.1.6 的 EM_JS(std::string) 返回有 emval 惰性首调错位；
   EM_JS(char*) 返回在循环反复调用时临时缓冲被复用→悬空→heap OOB wasm trap。
   终极方案：EM_JS(void) 不返回值，JS 用文档化的 stringToUTF8 把结果写进 C 提供的
   wasm 堆缓冲（outbuf），无 emval 生命周期问题、无返回值转换。 */
EM_JS(void, em_host_call_fill, (const char* sql, char* outbuf, int maxlen), {
  var s_sql = UTF8ToString(sql);          /* emcc 3.1.6 EM_JS 不自动转 char* → 手动 */
  var fn = Module._host_duckdb_call;
  var s = (typeof fn === 'function') ? fn(s_sql) : 'error: no host hook (call)';
  if (typeof s !== 'string') s = String(s);
  stringToUTF8(s, outbuf, maxlen);
});
EM_JS(void, em_host_query_fill, (const char* sql, char* outbuf, int maxlen), {
  var s_sql = UTF8ToString(sql);          /* emcc 3.1.6 EM_JS 不自动转 char* → 手动 */
  var fn = Module._host_duckdb_query;
  var s = (typeof fn === 'function') ? fn(s_sql) : '{"rows":[],"err":"no host hook (query)"}';
  if (typeof s !== 'string') s = String(s);
  stringToUTF8(s, outbuf, maxlen);
});

/* Lua 侧 C 桩：__dbc(sql)->'ok'/'error:..'; __dbq(sql)->JSON 字符串
   各自持有独立 wasm 堆缓冲，stringToUTF8 原地填充。 */
static char g_hostbuf[65536];
static int l_dbc(lua_State *L) {
  const char *sql = luaL_checkstring(L, 1);
  g_hostbuf[0] = 0;
  em_host_call_fill(sql, g_hostbuf, (int)sizeof g_hostbuf);
  lua_pushstring(L, g_hostbuf);
  return 1;
}
static char g_qbuf[65536];
static int l_dbq(lua_State *L) {
  const char *sql = luaL_checkstring(L, 1);
  g_qbuf[0] = 0;
  em_host_query_fill(sql, g_qbuf, (int)sizeof g_qbuf);
  lua_pushstring(L, g_qbuf);
  return 1;
}

static void load_lib(lua_State *L, const char *name, const char *libsrc) {
  /* _libs 表在栈顶。失败路径先 pop 掉 loadbuffer 留下的错误串，再压值，
     保证 setfield(L,-2) 的 -2 始终指向表（否则 PANIC: index a string）。*/
  if (luaL_loadbuffer(L, libsrc, strlen(libsrc), name)) {
    const char *msg = lua_tostring(L, -1);
    lua_pop(L, 1);
    lua_pushfstring(L, "LOAD_FAIL %s: %s", name, msg);
    lua_setfield(L, -2, name);
    return;
  }
  if (lua_pcall(L, 0, 1, 0)) {
    const char *msg = lua_tostring(L, -1);
    lua_pop(L, 1);
    lua_pushfstring(L, "LIB_RUN_FAIL %s: %s", name, msg);
  }
  lua_setfield(L, -2, name);   /* _libs[name] = 顶层返回 */
  /* 同时挂成全局别名：回调库内部用全局名（etl/demo_e2e/scd2/...）互相引用 */
  lua_getfield(L, -1, name);
  lua_setglobal(L, name);
}
static void load_caller(lua_State *L, const char *name, const char *callersrc) {
  /* _callers 表在栈顶；caller chunk = `return function(...) ... end`。
     失败路径先 pop 掉 loadbuffer 留下的错误串，保证 setfield(L,-2) 指向表。*/
  g_stage = 2030;                      /* 进入 load_caller */
  if (luaL_loadbuffer(L, callersrc, strlen(callersrc), "caller")) {
    const char *msg = lua_tostring(L, -1);
    lua_pop(L, 1);
    lua_pushfstring(L, "CALLER_LOAD_FAIL %s: %s", name, msg);
    lua_setfield(L, -2, name);
    return;
  }
  g_stage = 2031;                      /* loadbuffer 成功 */
  if (lua_pcall(L, 0, 1, 0)) {
    const char *msg = lua_tostring(L, -1);
    lua_pop(L, 1);
    lua_pushfstring(L, "CALLER_RUN_FAIL %s: %s", name, msg);
  }
  g_stage = 2032;                      /* pcall 完成 */
  lua_setfield(L, -2, name);   /* _callers[name] = function */
}

static void lua_init(void) {
  if (g_L) return;
  g_stage = 0;
  g_L = luaL_newstate();
  g_stage = 1;
  luaL_requiref(g_L, LUA_GNAME,        luaopen_base,   1);
  luaL_requiref(g_L, LUA_STRLIBNAME,   luaopen_string, 1);
  luaL_requiref(g_L, LUA_TABLIBNAME,   luaopen_table,  1);
  luaL_requiref(g_L, LUA_MATHLIBNAME,  luaopen_math,   1);
  luaL_requiref(g_L, LUA_UTF8LIBNAME,  luaopen_utf8,   1);
  /* 5.1 全局 unpack shim */
  lua_getglobal(g_L, "table"); lua_getfield(g_L, -1, "unpack");
  lua_setglobal(g_L, "unpack"); lua_pop(g_L, 1);
  g_stage = 2;

  /* 宿主桥 C 桩 */
  lua_register(g_L, "__dbc", l_dbc);
  lua_register(g_L, "__dbq", l_dbq);

  /* _libs 表 + 载入所有 lib（json 在最前，供其它 caller 解码 input）*/
  lua_newtable(g_L); lua_setglobal(g_L, "_libs");
  lua_getglobal(g_L, "_libs");
  for (int i = 0; i < CUR_N; i++) { load_lib(g_L, CUR_NAME[i], CUR_LIB[i]); g_stage = 100 + i; }
  lua_pop(g_L, 1);
  g_stage = 200;

  /* _callers 表 + 载入所有 caller（细粒度 stage 定位 trap 点）*/
  g_stage = 201;
  lua_newtable(g_L); lua_setglobal(g_L, "_callers");
  g_stage = 202;
  lua_getglobal(g_L, "_callers");
  g_stage = 203;
  for (int i = 0; i < CUR_N; i++) { load_caller(g_L, CUR_NAME[i], CUR_CALLER[i]); g_stage = 300 + i; }
  lua_pop(g_L, 1);
  g_stage = 400;

  /* _duckdb_call/_duckdb_query 包装（用 _libs.json 解码 query 结果）*/
  const char *wraps =
    "_duckdb_call = function(sql) return __dbc(sql) end\n"
    "_duckdb_query = function(sql)\n"
    "  local s = __dbq(sql)\n"
    "  local ok, j = pcall(_libs.json.decode, s)\n"
    "  if not ok or type(j) ~= 'table' then return nil, 'decode_err: ' .. tostring(j) end\n"
    "  return j.rows, j.err\n"
    "end\n";
  if (luaL_dostring(g_L, wraps)) {
    fprintf(stderr, "wrap err: %s\n", lua_tostring(g_L, -1));
    lua_pop(g_L, 1);
  }
  g_stage = 500;
}
/* 诊断导出：init 当前阶段（500=完成, 100+i=载入第 i 个 lib, 300+i=第 i 个 caller, -1=未开始）*/
extern "C" int diag_stage(void) { return g_stage; }
/* 预热导出：模块加载后立即调用（在 DuckDB UDF 帧之外、最小栈深处完成 21×编译）*/
extern "C" int lua_prewarm(void) { lua_init(); return g_stage; }

/* 导出：跑指定 lib 的 caller，返回结果字符串。
   注意：不能叫 lua_call —— 与 Lua 自身 API 符号冲突；
   extern "C" + 非 static —— 供 Emscripten EXPORTED_FUNCTIONS 导出。*/
extern "C" const char *lua_lib_run(const char *name, const char *input) {
  try {
    lua_init();
  } catch (std::exception &e) {
    snprintf(g_result, sizeof g_result, "INIT_CXXEX stage=%d: %s", g_stage, e.what());
    return g_result;
  } catch (...) {
    snprintf(g_result, sizeof g_result, "INIT_UNKNOWNEX stage=%d", g_stage);
    return g_result;
  }
  lua_getglobal(g_L, "_callers");
  lua_getfield(g_L, -1, name);
  if (!lua_isfunction(g_L, -1)) {
    lua_pop(g_L, 2);
    snprintf(g_result, sizeof g_result, "error: unknown lib '%s'", name);
    return g_result;
  }
  lua_pushstring(g_L, input ? input : "");
  const int errtop = lua_gettop(g_L);
  int pcr = 0; const char *errmsg = 0;
  try {
    pcr = lua_pcall(g_L, 1, 1, 0);
    if (pcr) errmsg = lua_tostring(g_L, -1);
  } catch (std::exception &e) {
    lua_settop(g_L, errtop - 1);
    snprintf(g_result, sizeof g_result, "CALLER_CXXEX: %s", e.what());
    return g_result;
  } catch (...) {
    lua_settop(g_L, errtop - 1);
    snprintf(g_result, sizeof g_result, "CALLER_UNKNOWNEX (wasm trap / non-cxx)");
    return g_result;
  }
  if (pcr) {
    snprintf(g_result, sizeof g_result, "ERR: %s", errmsg ? errmsg : "(non-string)");
    lua_pop(g_L, 1);
    return g_result;
  }
  const char *r = lua_tostring(g_L, -1);
  lua_pop(g_L, 1);
  if (!r) { snprintf(g_result, sizeof g_result, "(nil)"); return g_result; }
  strncpy(g_result, r, sizeof g_result - 1);
  g_result[sizeof g_result - 1] = 0;
  return g_result;
}

/* MODULARIZE 构建不需要 main；非 modular 自检 main */
#ifndef EMSCRIPTEN
int main(void) {
  for (int i = 0; i < CUR_N; i++) {
    const char *r = lua_lib_run(CUR_NAME[i], "");
    printf("%s | %s\n", CUR_NAME[i], r);
  }
  return 0;
}
#endif
