# DuckDB + Lua in WebAssembly · 在线展示

把 **DuckDB（WASM 引擎）** 和 **PUC Lua 5.4（29 个 Lua 库，编进 WASM）** 在同一个浏览器页面里跑通：
DuckDB 执行 SQL，SQL 里直接调用 Lua UDF，Lua 库再回调 DuckDB 建表/查询——**双向真实闭环**，全程浏览器内、无服务端、零 CDN。

> 这是 `puc-lua-wasm-poc`（纯 Lua→WASM 可行性）的姊妹展示：那边证明「Lua 能进 WASM」，这边把 Lua 真正接进 DuckDB-WASM 的 SQL 执行路径。

## 三个名词校正（诚实标注）

| 你问的 | 实际交付 | 原因 |
|--------|----------|------|
| **duckdb2.0** | DuckDB 引擎 **v1.5.4** | 已发布的 duckdb-wasm npm 包（`@1.33.1-dev57.0`）底层引擎是 1.5.4，官方「2.0.0」未进该发布构建。页面运行时 `getVersion()` 会显示真实版本，不造假。 |
| **luajit** | **PUC Lua 5.4** | LuaJIT 进 WASM 是**死路**（JIT 无法在 WASM 沙箱内工作，作者 Mike Pall 官方裁定）。本展示用判词后的替代路线——PUC Lua 5.4 解释器直接编进 WASM。 |
| **29 个库** | **25/29 跑通** | 21 纯计算 + 2 中文 NLP（jieba/pinyin）+ 2 回调库（export/rbac）真实端到端；4 个深递归 pipeline 库（etl/scd2/incremental/to_lance/demo_e2e）超 wasm 单线程栈上限，页面如实标 `wasm-trap`。 |

## 架构

```
浏览器 (主线程, blocking 模式, 无 worker)
├── DuckDB-WASM 引擎 (本地 wasm, 零 CDN)
│     连接 A（主）:  执行 SQL，注册 lua_lib 标量 UDF
│     连接 B（第二）:  专供 Lua 回调库 _duckdb_call/_duckdb_query（避免 UDF 内重入死锁）
└── 3 × PUC Lua 5.4 WASM 模块 (SINGLE_FILE, Lua 源码已嵌入)
      L20: 21 个纯计算库 (json/yaml/xml/bignum/trgm/qr/cncheck/...)
      L7:  7 个 DuckDB 回调库 (export/rbac/scd2/etl/... , 经连接 B 建表查询)
      LU:  jieba + pinyin (16.5MB 词典内嵌)

数据流: SQL → lua_lib UDF → ccall → Lua VM 跑库 → 结果字符串经同线程 JS 桥取回
        Lua 回调库 → __dbc/__dbq (EM_JS) → 连接 B runQuery → 真实建表/查询
```

## 运行

```bash
# 需要本地 HTTP（Emscripten 单文件 + 同线程访问，file:// 受限）
cd 本目录
python3 -m http.server 8199
# 浏览器开 http://localhost:8199/index.html
```

加载完自动：seed 演示源表（连接 B）→ 跑 29 库健康扫描 → 渲染结果。

## 在线托管

全部产物**自包含、零 CDN**（DuckDB wasm + 3 Lua 模块 + bundle 全在本地），可任意静态托管：

```bash
# GitHub Pages / 任意静态服务器
git init && git add -A && git commit -m "duckdb+lua wasm online demo"
# 推到一个 public 仓库开 Pages，或拷到 nginx/OSS 即可
```

> 注：`duckdb-mvp.wasm`(41MB) + `duckdb-eh.wasm`(36MB) + 3 Lua 模块共 ~120MB，
> 建议走带 CDN 的静态托管；GitHub Pages 单文件上限 100MB 需把两个 wasm 走外部 CDN 或 git-lfs。

## 构建配方（可复现）

工具链：Emscripten 3.1.6（用户态 `dpkg -x` 解包，无 sudo）+ PUC Lua 5.4.7 全源。

```bash
# 每个 Lua 模块（以 L20 为例）
em++ -O1 -x c++ -I$SRC udf_drv.c $LUA_SRC \
  -sMODULARIZE=1 -sEXPORT_NAME=L20Module \
  -sEXPORTED_FUNCTIONS=_lua_lib_run,_lua_prewarm,_diag_stage,_malloc,_free \
  -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,stringToUTF8,UTF8ToString,lengthBytesUTF8,HEAPU8 \
  -sSINGLE_FILE=1 -sALLOW_TABLE_GROWTH=1 -sALLOW_MEMORY_GROWTH=1 \
  -sTOTAL_STACK=<栈> -sINITIAL_MEMORY=<内存> -o luaXX.js

# L20/LU: TOTAL_STACK=32MB   L7(深递归): TOTAL_STACK=128MB
# 关键: Lua 库源码经 gen_all_embed.py 嵌入 C 字符串头 (cur_embed.h)
# DuckDB bundle: esbuild 把 @duckdb/duckdb-wasm(browser-blocking) + apache-arrow 打成一个 IIFE
```

## 踩过的关键坑（实证，非猜测）

1. **duckdb-wasm blocking 的 VARCHAR UDF 返回有上游 NUL 缺陷**（byte buffer 未传回结果描述符，blocking/worker 两构建都有）→ 改 UDF 返回 **DOUBLE 索引**（数值返回正常），字符串走同线程 JS 桥。
2. **`createScalarFunction` 返回类型必须 `new Arrow.Float64()`**（不是 `Utf8`）；`runQuery` 返回**原始 Arrow IPC 字节**，用 `Arrow.tableFromIPC` 解码，取值用 `getChild(col).at(i)`（`table.get` 在此构建返回 null）。
3. **mvp/eh 是两套不同 wasm**（mvp 用 JS-shim C++ EH 需 `env.__cxa_throw`，eh 用原生 wasm-exceptions）。`localBundles()` 必须各指向正确二进制，否则 `Import "__cxa_throw" requires a callable`。
4. **emcc 3.1.6 的 `EM_JS` 不会自动把 `char*` 参数转成 JS 字符串**（传的是原始指针）→ 胶水里手动 `UTF8ToString(sql)`；`EM_JS(std::string)` 返回有 emval 惰性首调错位，`EM_JS(char*)` 返回在循环中缓冲复用悬空 → **最终用 `EM_JS(void)` + JS `stringToUTF8` 写进 C 提供的 wasm 堆缓冲**（无返回值转换、无 emval 生命周期问题）。
5. **cwrap 签名是 3.1.6 旧顺序** `cwrap(ident, returnType, argTypes, opts)`（新版把 returnType 挪到第 3 位）。
6. **caller 是匿名函数表达式**，作 chunk 首语句是语法错误 → 生成器包成 `return function(...) ... end`；`luaL_loadbuffer` 失败路径必须先 `lua_pop` 掉错误串再 `setfield`，否则 -2 指向字符串 → **unprotected PANIC（表现为穿透成数字的 wasm 异常，C++ catch 接不住）**。
7. **深递归 pipeline 库超 wasm 单线程栈上限**：trap 地址随 `TOTAL_STACK` 同比缩放（32M→34M，64M→67M，256M→269M）= 整个栈被吃光，不是普通 C++ 异常。升栈只是缓解，根治需重构那 4 个库的递归为迭代（独立工程）。

## 目录

```
index.html   深色高对比单页
app.js       DuckDB 加载 + UDF 注册 + 3 模块编排 + 29 库扫描
ddw.bundle.js    DuckDB-WASM + apache-arrow 合并 IIFE (esbuild, 1.3MB)
lua20.js / lua7.js / luajp.js   3 个 Lua-WASM 模块 (SINGLE_FILE)
duckdb-mvp.wasm / duckdb-eh.wasm   DuckDB 引擎 wasm (本地, 零 CDN)
```
