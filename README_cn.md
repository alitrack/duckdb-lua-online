# DuckDB + PUC Lua in WebAssembly — 在线演示

> English version: [README.md](README.md)

**在浏览器里同时跑 DuckDB 和真实 Lua 虚拟机（29 个 Lua 库）。** DuckDB 执行 SQL，SQL 行内调用真正的标量 UDF `lua_lib(库名, 输入)`，Lua 虚拟机用 29 个内嵌库真实计算；其中 7 个回调库还会**反向**驱动 DuckDB（第二连接）建表、查询、导出 CSV —— 一条真实的双向闭环，全在浏览器端，**零 CDN、零服务端**。

| 在线演示 | 源码与构建 | 关联仓库 |
|---|---|---|
| https://alitrack.github.io/duckdb-lua-online/ | https://github.com/alitrack/duckdb-lua-online | [duckdb-luajit](https://github.com/alitrack/duckdb-luajit)（主项目）· [puc-lua-wasm-poc](https://github.com/alitrack/puc-lua-wasm-poc)（可行性研究，私有） |

## 与 duckdb-luajit 的关系

[duckdb-luajit](https://github.com/alitrack/duckdb-luajit)（v0.33，MIT）是**原生** DuckDB 扩展，内嵌 **LuaJIT**：JIT 编译 UDF、`_duckdb_call`/`_duckdb_query` SQL 回调桥、约 1MB。本仓是它的 **WASM 姊妹仓**，回答的问题是：**「如果 Lua 侧必须跑在 WebAssembly 沙箱（浏览器）里，会怎样？」**

| | duckdb-luajit（主项目） | 本仓（WASM 姊妹仓） |
|---|---|---|
| 宿主 | 原生 DuckDB | DuckDB-Wasm（浏览器，blocking 模式） |
| Lua | **LuaJIT**（JIT，约 1MB） | **PUC Lua 5.4**（解释器，源码嵌入 WASM） |
| 为何换 | JIT 无法在沙箱工作 | LuaJIT **进不了** WASM（JIT 需要可执行内存；作者 Mike Pall 已裁定不可行）——解释器路线是唯一可行解 |
| 库 | 同一套 29 个可移植库 | 同样 29 个库，编进 3 个 WASM 模块 |
| 回调桥 | `_duckdb_call/_duckdb_query` 原生 C | 同一契约，经 `EM_JS` 桥到**第二条 DuckDB 连接**（避免 UDF 重入死锁） |

29 个库及其回调契约与 duckdb-luajit 完全一致——若本演示验证通过，这 29 个库可**不改代码**直接搬进 duckdb-wasm。

## 三个名词校正（诚实标注）

| 你可能期望 | 实际交付 | 原因 |
|---|---|---|
| **DuckDB 2.0** | DuckDB 引擎 **v1.5.4**（运行时 `getVersion()`） | 已发布的 `@duckdb/duckdb-wasm` npm 包（1.33.1-dev57.0）底层引擎是 1.5.4，官方 2.0 还没进这个发布构建。页面打印真实运行时版本——不造假徽章。 |
| **LuaJIT** | **PUC Lua 5.4** | LuaJIT → WASM 已证死路（JIT 在沙箱里无法工作）。这是判词后的替代路线：PUC 解释器编进 WASM。（选 5.4 而非 5.5 —— 见 [Q&A](#为什么用-lua-54-而不是-55)。） |
| **29 库全绿** | **29/30 OK** | 21 纯计算 + jieba/pinyin + 6 回调库（export/rbac/scd2/etl/incremental/demo_e2e）对真实 DuckDB 端到端验证通过。原先"失败"的 5 个回调库是**误诊**（见坑 7）：不是深递归——构建缺 `-sDISABLE_EXCEPTION_CATCHING=0`，Lua 错误穿透成裸数字被扫描误标 `wasm-trap`。修复后构建全绿。`to_lance` 如实报出真实阻塞：Lance 扩展无 duckdb-wasm 构建（lance-duckdb 已从 DuckDB 核心移除；Lance 上 WASM 被 Tokio/DataFusion 卡住，lance-format/lance#3587）。 |

## 架构

```
浏览器（主线程，blocking 模式，无 worker）
├── DuckDB-WASM 引擎（本地 wasm，零 CDN）
│     连接 A（主）:    执行 SQL，持有 lua_lib 标量 UDF
│     连接 B（第二）:  专供 Lua 回调库（_duckdb_call/_duckdb_query）
└── 3 × PUC Lua 5.4 WASM 模块（SINGLE_FILE，Lua 源码已嵌入）
      L20: 21 个纯计算库（json/yaml/xml/bignum/trgm/qr/cncheck/…）
      L7:  7 个 DuckDB 回调库（export/rbac/scd2/etl/… → 连接 B）
      LU:  jieba + pinyin（16.5MB 词典内嵌）

数据流:
  SQL → lua_lib UDF → ccall → Lua VM 跑库 → 结果字符串经同线程 JS 桥取回
  Lua 回调库 → __dbc/__dbq (EM_JS) → 连接 B runQuery → 真实 CREATE TABLE / SELECT
```

## 运行

```bash
# 本地（Emscripten 单文件 + 同线程访问需要 http，不是 file://）
cd duckdb-lua-online
python3 -m http.server 8199
# 浏览器开 http://localhost:8199/index.html
```

加载完自动：seed 演示源表（连接 B）→ 跑 29 库健康扫描 → 渲染结果。

## 在线托管

全部产物**自包含、零 CDN**（DuckDB wasm + 3 Lua 模块 + bundle 全在本地），任意静态托管即可。当前已在 **GitHub Pages**（legacy 构建）上线。注意总载荷约 120MB——真实 CDN/静态托管都没问题；GitHub Pages 也能伺服（已验证 `content-length` 与本地逐字节一致），只是普通带宽首次加载偏慢。

要 Fork 自己托管：[Fork](https://github.com/alitrack/duckdb-lua-online/fork) → 在你的 fork 上开 Pages（`main/`）。

## 构建配方（可复现）

工具链：Emscripten 3.1.6（用户态 `dpkg -x` 解包，无 sudo）+ PUC Lua 5.4.7 全源码。

```bash
# 每个 Lua 模块（以 L20 为例）
em++ -O1 -x c++ -I$SRC udf_drv.c $LUA_SRC \
  -sMODULARIZE=1 -sEXPORT_NAME=L20Module \
  -sEXPORTED_FUNCTIONS=_lua_lib_run,_lua_prewarm,_diag_stage,_malloc,_free \
  -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,stringToUTF8,UTF8ToString,lengthBytesUTF8,HEAPU8 \
  -sSINGLE_FILE=1 -sALLOW_TABLE_GROWTH=1 -sALLOW_MEMORY_GROWTH=1 \
  -sTOTAL_STACK=<栈> -sINITIAL_MEMORY=<内存> -o luaXX.js
# 三模块统一带 -sDISABLE_EXCEPTION_CATCHING=0（见坑 7：emcc 3.1.6 默认禁用 catch，
#   缺此 flag 时任何库抛出的 Lua 错误都穿透成裸 JS 数字、被扫描误标 wasm-trap）
# 栈/内存：L7=128MB/512MB   L20=128MB/512MB   LU=8MB/32MB
# Lua 源码经 gen_all_embed.py 嵌入成 C 字符串头（cur_embed.h）
# DuckDB bundle: esbuild 把 @duckdb/duckdb-wasm(browser-blocking) + apache-arrow 打成一个 IIFE
```

## 踩过的关键坑（实证，非猜测）

1. **duckdb-wasm blocking 的 VARCHAR UDF 返回有上游 NUL 缺陷**（byte buffer 没传回结果描述符，blocking/worker 两构建都有）→ 改 UDF 返回 **DOUBLE 索引**，字符串走同线程 JS 桥。
2. **`createScalarFunction` 返回类型必须 `new Arrow.Float64()`**（不是 `Utf8`）；`runQuery` 返回**原始 Arrow IPC 字节**，用 `Arrow.tableFromIPC` 解码，取值用 `getChild(col).at(i)`（`table.get` 在此构建返回 null）。
3. **mvp/eh 是两套不同 wasm 二进制**（mvp 用 JS-shim C++ EH 需 `env.__cxa_throw`，eh 用原生 wasm-exceptions）。`localBundles()` 必须各指向正确二进制。
4. **emcc 3.1.6 的 `EM_JS` 不会自动把 `char*` 参数转成 JS 字符串**（传的是原始指针）→ 胶水里手动 `UTF8ToString(sql)`；`EM_JS(std::string)` 返回有 emval 惰性首调错位，`EM_JS(char*)` 返回在循环中缓冲复用悬空 → **最终用 `EM_JS(void)` + JS `stringToUTF8` 写进 C 提供的 wasm 堆缓冲**。
5. **cwrap 签名是 3.1.6 旧顺序** `cwrap(ident, returnType, argTypes, opts)`。
6. **caller 是匿名函数表达式**，作 chunk 首语句是语法错误 → 包成 `return function(...) ... end`；`luaL_loadbuffer` 失败路径必须先 `lua_pop` 掉错误串再 `setfield`，否则 -2 指向字符串 → **unprotected PANIC（表现为穿透成数字、C++ catch 接不住）**。
7. **L7 回调库"5 个失败"——误诊已纠正（2026-11-10）**：原始行称"深递归 pipeline 库超 wasm 单线程栈"（trap 地址随 `TOTAL_STACK` 同比缩放）。已被证伪：5 个库源码全是迭代（Kahn queue / `for` 循环），且同一份 C 驱动+库在 native C++/setjmp 下全部产出干净捕获的 Lua 错误串、零栈溢出。真根因：生产 L7 构建**漏了 `-sDISABLE_EXCEPTION_CATCHING=0`**——`LUA_USE_CPP` 下抛出的 Lua 错误变成 C++ 异常，`lua_pcall` 的 C++ catch 被编译器剥离接不住 → 穿过 wasm 边界成为**裸 JS 数字**（堆地址 ≈134M）→ 页面兜底 catch 误标 `wasm-trap:<n>`（实例其实活着，是 JS throw 非致命 trap）。修法：加该 flag，5 个库全部转为正常捕获的 Lua 错误串。**系统性排查**：最小 A/B 实验证实 emcc 3.1.6 **默认就是 catch 禁用**，所以 **L20 也有同种隐患**（给 yaml/xml/jsonpatch/json/bignum 喂畸形输入全部抛裸堆地址）——已补 flag 重建，畸形输入转为捕获错误串、扫描零回归；LU 的构建本就带该 flag。三模块现统一显式开启。次要问题：demo caller 参数错（scd2 `attr_cols` 写了源表不存在的列；incremental 没种子表；to_lance 传 `target` 键但库读 `dest`）——hook host 桥逐条记 SQL 后逐一现形。

## Q&A

### 为什么用 PUC Lua，而不是 LuaJIT？
LuaJIT 的核心价值是 JIT，它需要可执行内存和运行时码生成——WASM 沙箱里不可能（且已被作者裁定不可行）。PUC 5.4 解释器能干净地编进 WASM，本仓证明了 29 库的工作负载能跑。

### 为什么用 Lua 5.4，而不是 5.5？
- 这 29 个库是**按 5.4 API 面写的、并按 5.4 回归验证的**（duckdb-luajit 原生扩展分发的库是 5.4 兼容的；LuaJIT 是 5.1+2JIT）。5.5 的改动大多是增量（全局变量声明、命名 vararg、增量 GC），但同时移除了一些库依赖的 5.1 时代行为（例如 `unpack` 全局——5.4 还有，5.5 彻底删了）。
- 5.4 是**最后一个 `unpack` 还作为全局存在、且 C API 与所有现有移植目标完全一致**的版本；换 5.5 意味着要重新验证全部 29 个库 + C 嵌入层（一次独立的验证工作），而对本演示买不到任何它需要的能力。
- 本 wasm 构建是**可行性/桥接 PoC**，不是运行时升级——5.4 是让这套库保持绿色的最低风险选择。5.5 移植是库重新基线化之后的干净后续工作。

## 目录

```
index.html            深色高对比单页（含链接 + 版权 footer）
app.js                DuckDB 加载 + UDF 注册 + 3 模块编排 + 29 库扫描
ddw.bundle.js         DuckDB-WASM + apache-arrow 合并 IIFE（esbuild，1.3MB）
lua20.js / lua7.js / luajp.js   3 个 Lua-WASM 模块（SINGLE_FILE）
duckdb-mvp.wasm / duckdb-eh.wasm   DuckDB 引擎 wasm（本地，零 CDN）
```

## 许可

MIT。依赖：DuckDB（MIT）· DuckDB-Wasm（MIT）· PUC Lua（MIT）· Apache Arrow（Apache-2.0）· 29 个 Lua 库（随 duckdb-luajit 分发，MIT）· jieba/pinyin 词典（各自上游许可）。
