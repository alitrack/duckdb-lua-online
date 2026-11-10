# DuckDB + PUC Lua in WebAssembly — Online Demo

> 中文版见 [README_cn.md](README_cn.md) · Chinese version: [README_cn.md](README_cn.md)

**Run DuckDB and a real Lua VM (29 Lua libraries) inside the browser.** DuckDB executes SQL; SQL calls a genuine scalar UDF `lua_lib(name, input)`; the Lua VM computes with 29 embedded libraries; and 7 of those libraries call **back** into DuckDB (second connection) to create tables, run queries, export CSV — a real bidirectional closed loop, all client-side, **zero CDN, zero server**.

| Online demo | Source & build | Siblings |
|---|---|---|
| https://alitrack.github.io/duckdb-lua-online/ | https://github.com/alitrack/duckdb-lua-online | [duckdb-luajit](https://github.com/alitrack/duckdb-luajit) (main project) · [puc-lua-wasm-poc](https://github.com/alitrack/puc-lua-wasm-poc) (feasibility research, private) |

## Relationship to duckdb-luajit

[duckdb-luajit](https://github.com/alitrack/duckdb-luajit) (v0.33, MIT) is a **native** DuckDB extension that embeds **LuaJIT** — JIT-compiled UDFs, `_duckdb_call`/`_duckdb_query` SQL-callback bridge, ~1MB. This repo is its **WASM sibling**: it answers *"what if the Lua side has to run in a WebAssembly sandbox (the browser)?"*

| | duckdb-luajit (main) | this repo (WASM sibling) |
|---|---|---|
| Host | native DuckDB | DuckDB-Wasm (browser, blocking mode) |
| Lua | **LuaJIT** (JIT, ~1MB) | **PUC Lua 5.4** (interpreter, source embedded in WASM) |
| Why the swap | JIT can't work | LuaJIT **cannot** run in WASM (JIT needs executable memory; author Mike Pall has ruled it out) — so the interpreter route is the only viable one |
| Libraries | same 29-portable lib set | same 29 libs, compiled into 3 WASM modules |
| Callback bridge | `_duckdb_call/_duckdb_query` native C | same contract, bridged via `EM_JS` to a **second DuckDB connection** (avoids UDF reentrancy deadlock) |

The 29 libs and their callback contract are identical to duckdb-luajit — if this validates, the same libs ship into duckdb-wasm without rewrites.

## Three term corrections (honest labeling)

| You might expect | What actually ships | Why |
|---|---|---|
| **DuckDB 2.0** | DuckDB engine **v1.5.4** (runtime `getVersion()`) | The published `@duckdb/duckdb-wasm` npm package (1.33.1-dev57.0) is built on engine 1.5.4; the official 2.0 line is not in this published build. The page prints the real runtime version — no fake badge. |
| **LuaJIT** | **PUC Lua 5.4** | LuaJIT → WASM is a proven dead end (JIT in a sandbox). This is the post-verdict alternative: PUC interpreter compiled to WASM. (5.4 chosen over 5.5 — see [Q&A](#why-lua-54-not-55).) |
| **29 libs all green** | **29/30 OK** | All 21 pure-compute + jieba/pinyin + 6 callback libs (export/rbac/scd2/etl/incremental/demo_e2e) verified end-to-end against real DuckDB. The 5 previously-"failing" callback libs were a **misdiagnosis** (see pitfall 7): not deep recursion — a missing `-sDISABLE_EXCEPTION_CATCHING=0` made Lua errors escape as a bare number that the scan mislabeled `wasm-trap`. Fixed build: all green. `to_lance` reports its real blocker honestly: the Lance extension has no duckdb-wasm build (lance-duckdb extension was removed from DuckDB core; Lance-on-WASM blocked on Tokio/DataFusion per lance-format/lance#3587). |

## Architecture

```
Browser (main thread, blocking mode, no worker)
├── DuckDB-WASM engine (local wasm, zero CDN)
│     Connection A (primary): runs SQL, holds the lua_lib scalar UDF
│     Connection B (second):  exclusively for Lua callback libs (_duckdb_call/_duckdb_query)
└── 3 × PUC Lua 5.4 WASM modules (SINGLE_FILE, Lua sources embedded)
      L20: 21 pure-compute libs (json/yaml/xml/bignum/trgm/qr/cncheck/…)
      L7:  7 DuckDB-callback libs (export/rbac/scd2/etl/… → Connection B)
      LU:  jieba + pinyin (16.5MB dictionaries embedded)

Data flow:
  SQL → lua_lib UDF → ccall → Lua VM runs the lib → result string via same-thread JS bridge
  Lua callback libs → __dbc/__dbq (EM_JS) → Connection B runQuery → real CREATE TABLE / SELECT
```

## Run

```bash
# local (Emscripten single-file + same-thread access needs http, not file://)
cd duckdb-lua-online
python3 -m http.server 8199
# open http://localhost:8199/index.html
```

On load it auto-seeds demo source tables (Connection B) → runs the 29-lib health scan → renders results.

## Online hosting

Everything is **self-contained, zero-CDN** (DuckDB wasm + 3 Lua modules + bundle all local), so any static host works. Currently live on **GitHub Pages** (legacy build). Note the total payload is ~120MB — fine on any real CDN/static host; GitHub Pages serves it (verified: `content-length` byte-identical to local), first load is just slow on modest bandwidth.

To fork & host your own: [Fork](https://github.com/alitrack/duckdb-lua-online/fork) → enable Pages on `main/`.

## Build recipe (reproducible)

Toolchain: Emscripten 3.1.6 (user-space via `dpkg -x`, no sudo) + PUC Lua 5.4.7 full sources.

```bash
# each Lua module (L20 shown)
em++ -O1 -x c++ -I$SRC udf_drv.c $LUA_SRC \
  -sMODULARIZE=1 -sEXPORT_NAME=L20Module \
  -sEXPORTED_FUNCTIONS=_lua_lib_run,_lua_prewarm,_diag_stage,_malloc,_free \
  -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,stringToUTF8,UTF8ToString,lengthBytesUTF8,HEAPU8 \
  -sSINGLE_FILE=1 -sALLOW_TABLE_GROWTH=1 -sALLOW_MEMORY_GROWTH=1 \
  -sTOTAL_STACK=<stack> -sINITIAL_MEMORY=<mem> -o luaXX.js
# L20/LU: TOTAL_STACK=32MB   L7: TOTAL_STACK=128MB（回调库经 DuckDB 帧调用，栈余量保守）
# 修复后的 L7 还需 -sDISABLE_EXCEPTION_CATCHING=0（见坑 7）
# Lua sources are embedded as C string headers (gen_all_embed.py → cur_embed.h)
# DuckDB bundle: esbuild bundles @duckdb/duckdb-wasm(browser-blocking) + apache-arrow into one IIFE
```

## Key pitfalls hit (empirical, not guessed)

1. **duckdb-wasm blocking's VARCHAR UDF return has an upstream NUL bug** (byte buffer never passed to the result descriptor; present in both blocking and worker builds) → UDF returns a **DOUBLE index** instead; the string travels over a same-thread JS bridge.
2. **`createScalarFunction` return type must be `new Arrow.Float64()`** (not `Utf8`); `runQuery` returns **raw Arrow IPC bytes** — decode with `Arrow.tableFromIPC`, read via `getChild(col).at(i)` (`table.get` returns null in this build).
3. **mvp/eh are two different wasm binaries** (mvp uses JS-shim C++ EH needing `env.__cxa_throw`; eh uses native wasm-exceptions). `localBundles()` must point each slot at the correct binary.
4. **emcc 3.1.6 `EM_JS` does NOT auto-convert `char*` args to JS strings** (it passes a raw pointer) → glue must `UTF8ToString(sql)` manually; `EM_JS(std::string)` return has an emval lazy-first-call offset; `EM_JS(char*)` return dangles in loops → **final form: `EM_JS(void)` + JS `stringToUTF8` writing into a C-provided wasm-heap buffer**.
5. **cwrap signature is 3.1.6 legacy order** `cwrap(ident, returnType, argTypes, opts)`.
6. **callers are anonymous function expressions** — as a chunk's first statement that's a syntax error → wrap as `return function(...) ... end`; `luaL_loadbuffer` failure path must `lua_pop` the error string before `setfield`, or the -2 index lands on a string → **unprotected PANIC (manifests as a number punching through, uncatchable by C++ catch)**.
7. **L7 callback libs "wasm-trap" — misdiagnosis corrected (2026-11-10)**: the original row claimed "deep-recursive pipeline libs exceed the single-thread WASM stack" (trap address scaled with `TOTAL_STACK`). Refuted: all 5 libs are iterative (Kahn queue / `for` loops), and the identical C driver + libs run clean under native C++/setjmp with caught Lua errors, zero overflows. True root cause: the production L7 build **omitted `-sDISABLE_EXCEPTION_CATCHING=0`** — under `LUA_USE_CPP`, a raised Lua error surfaces as a C++ exception that `lua_pcall`'s (compiler-stripped) C++ catch can't catch → it crosses the wasm boundary as a **bare JS number** (a heap address ≈134M) → the page's catch-all mislabeled it `wasm-trap:<n>`. The instance survives (it's a JS throw, not a fatal trap). Fix: add the flag — all 5 then report clean caught Lua error strings. Secondary: the demo callers had param bugs (scd2 `attr_cols` named a non-existent column; incremental seeded no source table; to_lance passed `target` where the lib reads `dest`) — hooking the host bridge and logging every SQL surfaced each one.

## Q&A

### Why PUC Lua, not LuaJIT?
LuaJIT's whole value is the JIT, which needs executable memory and on-the-fly code generation — impossible in a WASM sandbox (and ruled out by the author). The PUC 5.4 interpreter compiles to WASM cleanly; this repo proves the 29-lib workload runs.

### Why Lua 5.4, not 5.5?
- The 29 libraries are **written and regression-tested against the 5.4 API surface** (duckdb-luajit's native extension ships 5.4-compatible libs; LuaJIT is 5.1+2JIT). 5.5 changes are mostly additive (global-var declarations, named vararg, incremental GC) but also drop/deprecate some 5.1-era behavior the libs rely on (e.g. the `unpack` global — 5.4 still provides it, 5.5 removed it entirely).
- 5.4 is the **last version where `unpack` exists** as a global and the C API is identical to what every existing port targets; switching to 5.5 means re-validating all 29 libs plus the C embed layer (a separate validation pass), while buying nothing the demo needs.
- The wasm build here is a **feasibility/bridge PoC**, not a runtime upgrade — 5.4 is the lowest-risk choice that keeps the lib set green. A 5.5 port is a clean follow-up once the libs are re-baselined.

## Directory

```
index.html            dark high-contrast single page (links + copyright footer)
app.js                DuckDB load + UDF registration + 3-module orchestration + 29-lib scan
ddw.bundle.js         DuckDB-WASM + apache-arrow combined IIFE (esbuild, 1.3MB)
lua20.js / lua7.js / luajp.js   3 Lua-WASM modules (SINGLE_FILE)
duckdb-mvp.wasm / duckdb-eh.wasm   DuckDB engine wasm (local, zero CDN)
```

## License

MIT. Dependencies: DuckDB (MIT) · DuckDB-Wasm (MIT) · PUC Lua (MIT) · Apache Arrow (Apache-2.0) · the 29 Lua libs (distributed with duckdb-luajit, MIT) · jieba/pinyin dictionaries (their respective upstream licenses).
