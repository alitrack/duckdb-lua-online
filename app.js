/* app.js — DuckDB-Wasm(blocking, 主线程) + 3×Lua-wasm 在线展示
   架构:
     DuckDB(blocking) ←SQL→ lua_lib UDF ←ccall→ Lua-wasm(L20/L7/LU)
     Lua 回调库 →_host_duckdb_*→ JS 桥 → DuckDB 第二连接(同线程, 避免 UDF 重入死锁)
   依赖:
     duckdb-browser-blocking.bundle.js  (本地 1.3MB esbuild IIFE, window.DuckDB; wasm 仍从 jsDelivr 拉)
     lua20.js / lua7.js / luajp.js       (SINGLE_FILE MODULARIZE, 工厂 L20Module/L7Module/LUModule)
*/
"use strict";

const DDB = window.DuckDB;
const ARROW = window.Arrow;
if (!DDB) { throw new Error("DuckDB bundle 未加载 (ddw.bundle.js)"); }
if (!ARROW) { throw new Error("apache-arrow 未加载 (ddw.bundle.js)"); }

/* 30 库 → 所在模块映射 */
const L7NAMES  = ["etl","incremental","scd2","to_lance","export","rbac","demo_e2e"];
const LUNAMES  = ["jieba","pinyin"];
function moduleOf(name){
  if (L7NAMES.includes(name)) return "L7";
  if (LUNAMES.includes(name)) return "LU";
  return "L20";
}

const S = {
  db: null, conn: null, conn2: null,
  lua: { L20:null, L7:null, LU:null },
  results: [],
};

const $ = id => document.getElementById(id);
const setBadge = (id, t) => { $(id).textContent = t; };
const status   = (id, h) => { $(id).innerHTML = h; };
const pre      = (id, t) => { $(id).textContent = t; };

/* Arrow IPC 字节 → 行数组。
   实测 API（apache-arrow 17）: runQuery 返回原始 IPC 字节, A.tableFromIPC 解码;
   table.numRows 是属性(非方法); 取值用 getChild(col).at(i)（table.get 在此构建返回 null）*/
function dec(res){
  if (!res) return [];
  try {
    const tbl = ARROW.tableFromIPC(res);
    const nr = tbl.numRows;                       // 属性, 非方法
    const names = tbl.getColumnNames ? tbl.getColumnNames()
              : (tbl.schema ? tbl.schema.names : []);
    const out = [];
    for (let i=0;i<nr;i++){
      const row = {};
      for (const c of names){
        const v = tbl.getChild ? tbl.getChild(c) : null;
        row[c] = v && v.at ? v.at(i) : null;
      }
      out.push(row);
    }
    return out;
  } catch(e){ return [[ "decode-fail", e.message ]]; }
}

/* ============ 加载 DuckDB（blocking 主线程, 本地 bundle + 本地 wasm, 零 CDN）============ */
function localBundles(){
  // 与 getJsDelivrBundles() 同结构, 但指向同目录本地文件。
  // 关键: mvp/eh 是两套不同 wasm(mvp 用 JS-shim C++ EH, 需 env.__cxa_throw;
  //       eh 用原生 wasm-exceptions, 无该 import)。selectBundle 按平台特性二选一,
  //       必须各自给对的二进制, 否则 instantiate 报 "env __cxa_throw requires a callable"。
  return {
    mvp:{ mainModule:"duckdb-mvp.wasm", mainWorker:null, pthreadWorker:null },
    eh: { mainModule:"duckdb-eh.wasm",   mainWorker:null, pthreadWorker:null },
  };
}
// ===== 控制台错误捕获（调试可见）=====
window.__errs = [];
(function(){
  const orig = console.error;
  console.error = function(){ try{ window.__errs.push("console.error: " + Array.from(arguments).map(String).join(" ").slice(0,300)); }catch(e){} return orig.apply(console, arguments); };
  window.addEventListener("error", e => { window.__errs.push("onerror: " + (e.message||"") + " @" + (e.filename||"").split("/").pop() + ":" + e.lineno); });
  window.addEventListener("unhandledrejection", e => { window.__errs.push("unhandledrejection: " + (e.reason && (e.reason.message||e.reason)||e.reason)); });
  const d = document.getElementById("info-out");
  setInterval(()=>{ const n = window.__errs.length; if(n>0){ const el=document.getElementById("dbg"); if(el) el.textContent = window.__errs.slice(-3).join("\n"); } }, 500);
})();

async function loadDuckDB(){
  const bundles = localBundles();
  status("scan-status", "加载 DuckDB（本地 bundle + 本地 wasm 41MB）…");
  // 加 60s 硬超时，把挂起的错误暴露出来
  const timeout = new Promise((_,rej)=>setTimeout(()=>rej(new Error("createDuckDB 60s 超时（wasm 未就绪）")), 60000));
  const created = DDB.createDuckDB(bundles, new DDB.VoidLogger(), DDB.BROWSER_RUNTIME);
  S.db = await Promise.race([created, timeout]);
  await S.db.instantiate(()=>{});
  S.db.open({ path:":memory:", query:{ castBigIntToDouble:true, castDecimalToDouble:true } });
  S.conn  = S.db.connect();
  S.conn2 = S.db.connect();
  setBadge("b-engine", (S.db.getVersion ? S.db.getVersion() : "?"));
  return DDB;
}

/* ============ 加载 3 个 Lua-wasm 模块（MODULARIZE 异步工厂）============ */
async function loadLuaMod(factoryName, key){
  const fac = window[factoryName];
  if (!fac) throw new Error("工厂缺失: " + factoryName);
  const m = await fac({});
  // 注意 emcc 3.1.6 的 cwrap 签名: cwrap(ident, returnType, argTypes, opts)
  m._run = m.cwrap("lua_lib_run", "string", ["string","string"]);
  // 预热：把 21×(库+caller) 编译提前到模块加载时（不在 DuckDB UDF 帧内），
  // 避免首次 lua_lib_run 在 UDF 执行帧里做重量级 init
  try {
    const pre = m.cwrap("lua_prewarm", "number", []);
    const stage = pre();
    if (stage < 500) console.warn("[lua] prewarm 未完成 stage="+stage+" ("+factoryName+")");
  } catch(e) { console.warn("[lua] prewarm 异常 ("+factoryName+"):", e.message); }
  S.lua[key] = m;
  return m;
}

/* ============ 注册 lua_lib UDF + 回调 host 桥 ============ */
function registerUDF(){
  S.results = [];
  const udf = (name, input) => {
    const nm  = (typeof name  === "string") ? name  : "";
    const inp = (typeof input === "string") ? input : "";
    const M = S.lua[moduleOf(nm)];
    let r;
    try { r = M ? M._run(nm, inp) : "MODULE_NOT_LOADED:" + moduleOf(nm); }
    catch(e){ r = "RUN_ERROR:" + (typeof e === "string" ? e : e && e.message ? e.message : "wasm-trap:" + String(e)); }
    S.results.push(r);
    return S.results.length - 1;        // 返回 DOUBLE 索引（本构建 VARCHAR UDF 返回有上游 NUL 缺陷）
  };
  // 实测可用形态: 4-arg binding, 数值 conn id, Float64 返回（varchar 返回会 NUL）
  S.db.createScalarFunction(S.conn._conn, "lua_lib", new ARROW.Float64(), udf);

  // 回调库 host 桥 → 第二连接（同线程, 避免 UDF 重入死锁）; runQuery 也要数值 conn id
  // 关键：EM_JS 胶水访问的是各模块自己的 Module 对象，必须挂到模块上（不是 window）
  const hooks = {
    _host_duckdb_call: (sql) => {
      try { S.db.runQuery(S.conn2._conn, sql); return "ok"; }
      catch(e){ return "error: " + e.message; }
    },
    _host_duckdb_query: (sql) => {
      try {
        const rows = dec(S.db.runQuery(S.conn2._conn, sql));
        return JSON.stringify({ rows, err: null });
      } catch(e){ return JSON.stringify({ rows: [], err: e.message }); }
    },
  };
  for (const k of Object.keys(S.lua)) {
    S.lua[k]._host_duckdb_call = hooks._host_duckdb_call;
    S.lua[k]._host_duckdb_query = hooks._host_duckdb_query;
  }
  // 同时挂 window（调试/兼容）
  window._host_duckdb_call = hooks._host_duckdb_call;
  window._host_duckdb_query = hooks._host_duckdb_query;
}

/* ============ 跑一次 UDF（SQL 行内）并取回结果 ============ */
function runUDF(lib){
  const sql = `SELECT lua_lib('${lib}', '') AS idx`;
  S.results = [];
  const rows = dec(S.db.runQuery(S.conn._conn, sql));
  let out = "";
  if (rows.length){
    const idx = rows[0].idx;
    out = (typeof idx === "number" && S.results[idx] !== undefined) ? S.results[idx] : JSON.stringify(rows[0]);
  }
  return { sql, rows, out };
}

/* ============ ① 计算库 ============ */
function runCalc(){
  const lib = $("calc-lib").value;
  if (!S.lua[moduleOf(lib)]) return status("calc-status","<span class='err'>模块未加载</span>");
  $("run-calc").disabled = true;
  const t0 = performance.now();
  try {
    const r = runUDF(lib);
    $("calc-sql").textContent = "SQL: " + r.sql;
    pre("calc-out", r.out);
    status("calc-status", `<span class='ok'>完成</span> · ${(performance.now()-t0).toFixed(0)}ms · ${r.rows.length} 行`);
  } catch(e){
    status("calc-status", `<span class='err'>${e.message}</span>`);
    pre("calc-out", "ERROR: " + e.message);
  }
  $("run-calc").disabled = false;
}

/* ============ ② 回调库 ============ */
function runCB(){
  const lib = $("cb-lib").value;
  if (!S.lua.L7) return status("cb-status","<span class='err'>L7 未加载</span>");
  $("run-cb").disabled = true;
  const t0 = performance.now();
  try {
    const r = runUDF(lib);
    pre("cb-out", r.out);
    status("cb-status", `<span class='ok'>完成</span> · ${(performance.now()-t0).toFixed(0)}ms`);
  } catch(e){
    status("cb-status", `<span class='err'>${e.message}</span>`);
    pre("cb-out", "ERROR: " + e.message);
  }
  $("run-cb").disabled = false;
}

/* ============ ③ 中文 NLP ============ */
function runNLP(){
  const lib = $("nlp-lib").value;
  if (!S.lua.LU) return status("nlp-status","<span class='err'>LU 未加载</span>");
  $("run-nlp").disabled = true;
  const t0 = performance.now();
  try {
    const r = runUDF(lib);
    pre("nlp-out", r.out);
    status("nlp-status", `<span class='ok'>完成</span> · ${(performance.now()-t0).toFixed(0)}ms`);
  } catch(e){
    status("nlp-status", `<span class='err'>${e.message}</span>`);
    pre("nlp-out", "ERROR: " + e.message);
  }
  $("run-nlp").disabled = false;
}

/* ============ ④ 30 库健康扫描 ============ */
const ALL30 = ["json","jsonpatch","jsonpath","markdown","tomlini","xml","yaml",
  "bignum","cidr","basexx","fuzzy","html_escape","ltree","pgrouting","qr",
  "soundex","entity","rsi_scorer","psi","cncheck","trgm","etl","incremental",
  "scd2","to_lance","export","rbac","demo_e2e","jieba","pinyin"];

function runScan(){
  $("run-scan").disabled = true;
  const lines = []; let ok=0, fail=0;
  const t0 = performance.now();
  for (const lib of ALL30){
    const M = S.lua[moduleOf(lib)];
    let r, ms; const t1 = performance.now();
    try { r = M ? M._run(lib, "") : "MODULE_NOT_LOADED"; }
    catch(e){ r = "RUN_ERROR:" + (typeof e === "string" ? e : e && e.message ? e.message : "wasm-trap:" + String(e)); }
    ms = (performance.now()-t1).toFixed(0);
    const bad = /FAIL|ERROR|error:|RUN_ERROR|MODULE_NOT_LOADED|^ERR |^FAILED/.test(r);
    bad ? fail++ : ok++;
    lines.push(`${lib.padEnd(14)} [${bad?"FAIL":"OK  ".slice(0,4)}] ${ms}ms  ${String(r).slice(0,92).replace(/\n/g," ")}`);
  }
  pre("scan-out", lines.join("\n"));
  setBadge("b-libs", `${ok}/${ALL30.length}`);
  status("scan-status", `<span class='${fail?"warn":"ok"}'>完成</span> · OK ${ok} / FAIL ${fail} · 总 ${(performance.now()-t0).toFixed(0)}ms`);
  $("run-scan").disabled = false;
}

/* ============ 引擎信息 ============ */
/* seed 演示源表（export/scd2 需要真实源表才有端到端结果）*/
function seedDemoTables(){
  const c = S.conn2._conn;
  const ddls = [
    "CREATE OR REPLACE TABLE demo_export_src AS SELECT 1 AS id, 'alpha' AS name, 10.5 AS amt UNION ALL SELECT 2, 'beta', 20.5 UNION ALL SELECT 3, 'gamma', 30.5",
    "CREATE OR REPLACE TABLE demo_scd2_src AS SELECT 1 AS id, 'active' AS status, TIMESTAMP '2024-01-01 00:00:00' AS ts UNION ALL SELECT 2, 'inactive', TIMESTAMP '2024-01-02 00:00:00'",
    "CREATE OR REPLACE TABLE demo_e2e_src AS SELECT 1 AS id, 'x' AS category, 1.0 AS val",
    "CREATE OR REPLACE TABLE demo_wm_src AS SELECT 1 AS id, TIMESTAMP '2024-01-01 00:00:00' AS ts UNION ALL SELECT 2, TIMESTAMP '2024-01-02 00:00:00'",
    "CREATE OR REPLACE TABLE demo_wm AS SELECT * FROM demo_wm_src WHERE FALSE",
  ];
  for (const s of ddls){ try { S.db.runQuery(c, s); } catch(e){} }
}

function showInfo(){
  const info = [
    "DuckDB 引擎版本: " + (S.db.getVersion ? S.db.getVersion() : "?"),
    "模式: blocking（主线程, 无 worker）双连接 —— 主(UDF) + 第二(回调)",
    "Lua: PUC Lua 5.4（LuaJIT 进 WASM 死路 → 判词后替代路线）",
    "UDF: lua_lib(name, input) → DOUBLE 索引（本构建 VARCHAR UDF 返回有上游 NUL 缺陷, 字符串经同线程 JS 桥取回）",
    "Lua 源码: 已嵌入 WASM (SINGLE_FILE), 30 库分 3 模块 (L20=21计算 / L7=7回调 / LU=2中文)",
    "词典: jieba+pinyin 内嵌 16.5MB",
    "DuckDB bundle: 本地 esbuild IIFE (1.3MB); wasm 主模块本地 (duckdb-mvp/eh.wasm, 零 CDN)",
    "注: 5 个回调库曾误报 wasm-trap——真因是构建缺 -sDISABLE_EXCEPTION_CATCHING=0, Lua 错误穿透成裸数字(app.js 误标 trap); 已修复。to_lance 需 Lance 扩展(浏览器 bundle 未带), 如实报缺依赖",
  ];
  pre("info-out", info.join("\n"));
}

/* ============ 主流程 ============ */
async function main(){
  try {
    status("scan-status", "[1/6] 加载 DuckDB…"); await loadDuckDB();
    status("scan-status", "[2/6] 加载 L20 模块…"); await loadLuaMod("L20Module","L20");
    status("scan-status", "[3/6] 加载 L7 模块…");  await loadLuaMod("L7Module","L7");
    status("scan-status", "[4/6] 加载 LJP 模块…"); await loadLuaMod("LJPModule","LU");
    status("scan-status", "[5/6] 注册 UDF…");      registerUDF();
    status("scan-status", "[6/6] 完成");
    setBadge("b-lua", "PUC 5.4 ×3");
    showInfo();
    seedDemoTables();      // 给 export/scd2 备好真实源表（第二连接, 双连接契约）
    runScan();             // 自动跑 30 库健康扫描（演示一眼见结果）
    runCalc();
    runNLP();
  } catch(e){
    console.error(e);
    status("scan-status", `<span class='err'>初始化失败 @ ${window.__step||'?'}: ${e.message}</span>`);
    pre("info-out", "ERROR: " + (e.stack || e.message));
  }
}
// 步骤追踪（调试）
window.__step="start";

$("run-calc").onclick = runCalc;
$("run-cb").onclick   = runCB;
$("run-nlp").onclick  = runNLP;
$("run-scan").onclick = runScan;
main();
