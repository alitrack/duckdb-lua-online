#!/usr/bin/env python3
# gen_all_embed.py — 生成 3 个 wasm 模块的嵌入头：
#   L20  : 20 纯计算 + trgm(21)，function(p) 型，无需 DuckDB
#   L7   : 7 回调库，需 _duckdb_call/_duckdb_query（EM_JS 注入）
#   LJP  : jieba + pinyin（超大 dict）
# 每库一个自包含 Lua caller 块：function(input_json) -> 结果字符串。
# 用法见各 caller。json 解码用 _libs.json（已嵌入）。
import os
import sys as _sys
B = _sys.argv[1] if len(_sys.argv) > 1 else "/mnt/d/wsl2/duckdb-luajit-libs/libs"
OUTDIR = _sys.argv[2] if len(_sys.argv) > 2 else "/home/lhy/wasm/poc"

def cstr(s):
    out=[]
    for ch in s:
        o=ord(ch)
        if ch=='\\': out.append('\\\\')
        elif ch=='"': out.append('\\"')
        elif o<0x20: out.append('\\n' if ch=='\n' else ('\\t' if ch=='\t' else ('\\r' if ch=='\r' else '\\x%02x'%o)))
        else: out.append(ch)
    return '"'+"".join(out)+'"'

# name -> (relpath, caller_lua)
# caller 形如: function(input_json) ... return <string> end
L20 = {
 "json": ("parser/json.lua",
  "function(input_json) local j=_libs.json; local p; if input_json and input_json~='' then p=j.decode(input_json) else p={a=1,b='x',c={true,false,2.5}} end; "
  "if p.op=='decode' then return 'decode->'..j.encode(j.decode(p.v)) end; return 'encode->'..j.encode(p.v or p) end"),
 "jsonpatch": ("parser/jsonpatch.lua",
  "function(input_json) local f=_libs.jsonpatch; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='apply',doc='{\"a\":1,\"b\":[1,2]}',patch='[{\"op\":\"replace\",\"path\":\"/a\",\"value\":9}]'} end; "
  "return 'patch->'..tostring(f(p)) end"),
 "jsonpath": ("parser/jsonpath.lua",
  "function(input_json) local f=_libs.jsonpath; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='{\"a\":{\"b\":[{\"c\":1},{\"c\":2}]}}',e='$.a.b[*].c'} end; "
  "return 'jp->'..tostring(f(p)) end"),
 "markdown": ("parser/markdown.lua",
  "function(input_json) local f=_libs.markdown; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='# Title\\n\\npara **bold** `code`\\n\\n- item1\\n- item2',op='stats'} end; "
  "return 'md('..(p.op or 'stats')..')->'..tostring(f(p)) end"),
 "tomlini": ("parser/tomlini.lua",
  "function(input_json) local f=_libs.tomlini; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='[sec]\\nname = \"x\"\\nn = 3\\nb = true',op='toml'} end; "
  "return 'toml->'..tostring(f(p)) end"),
 "xml": ("parser/xml.lua",
  "function(input_json) local f=_libs.xml; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='<root attr=\"1\"><a>1</a><b>2.5</b></root>'} end; "
  "return 'xml->'..tostring(f(p)) end"),
 "yaml": ("parser/yaml.lua",
  "function(input_json) local f=_libs.yaml; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='a: 1\\nb: [1, 2, 3]\\nc:\\n  d: true'} end; "
  "return 'yaml->'..tostring(f(p)) end"),
 "bignum": ("udf/bignum.lua",
  "function(input_json) local f=_libs.bignum; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='fact',n=25} end; "
  "return 'bignum('..(p.op or '?')..')->'..tostring(f(p)) end"),
 "cidr": ("udf/cidr.lua",
  "function(input_json) local f=_libs.cidr; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='192.168.1.0/24'} end; "
  "return 'cidr->'..tostring(f(p)) end"),
 "basexx": ("udf/basexx.lua",
  "function(input_json) local f=_libs.basexx; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='base85_enc',hex='00e1f0'} end; "
  "return 'basexx('..(p.op or '?')..')->'..tostring(f(p)) end"),
 "fuzzy": ("udf/fuzzy.lua",
  "function(input_json) local f=_libs.fuzzy; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='jaro',a='martha',b='marhta'} end; "
  "return 'fuzzy('..(p.op or 'lev')..', '..tostring(p.a)..','..tostring(p.b)..')->'..tostring(f(p)) end"),
 "html_escape": ("udf/html_escape.lua",
  "function(input_json) local f=_libs.html_escape; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='<a href=\"x\"> & \"q\"',op='escape'} end; "
  "return 'html->'..tostring(f(p)) end"),
 "ltree": ("udf/ltree.lua",
  "function(input_json) local f=_libs.ltree; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={path='a.b.c.d',op='nlevel'} end; "
  "return 'ltree->'..tostring(f(p)) end"),
 "pgrouting": ("udf/pgrouting.lua",
  "function(input_json) local f=_libs.pgrouting; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='shortest_path',edges={{src=1,tgt=2,w=1},{src=2,tgt=3,w=2},{src=1,tgt=3,w=10},{src=3,tgt=4,w=1}},src=1,tgt=4} end; "
  "return 'shortest(1->4)->'..tostring(f(p)) end"),
 "qr": ("udf/qr.lua",
  "function(input_json) local f=_libs.qr; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='DuckDB+WASM',op='info'} end; "
  "return 'qr('..(p.op or 'info')..')->'..tostring(f(p)) end"),
 "soundex": ("udf/soundex.lua",
  "function(input_json) local f=_libs.soundex; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='Robert',op='soundex'} end; "
  "return 'soundex('..tostring(p.v)..')->'..tostring(f(p)) end"),
 "entity": ("entity/entity.lua",
  "function(input_json) local f=_libs.entity; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='match',a='john smith',b='jon smith'} end; "
  "return 'entity.match->'..tostring(f(p)) end"),
 "rsi_scorer": ("ml/rsi_scorer.lua",
  "function(input_json) local f=_libs.rsi_scorer; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='score',f={credit_score=720,balance_ratio=0.3,months_active=24,inquiries=2}} end; "
  "return 'rsi.score->'..tostring(f(p)) end"),
 "psi": ("quality/psi.lua",
  "function(input_json) local f=_libs.psi; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='psi',raw_e={1,2,3,4,5,6,7,8,9,10},raw_a={2,2,3,4,4,5,6,7,8,12},bins=5} end; "
  "return 'psi->'..tostring(f(p)) end"),
 "cncheck": ("udf/cncheck.lua",
  "function(input_json) local f=_libs.cncheck; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={v='11010519491231002X',op='id_card'} end; "
  "return 'cncheck('..tostring(p.v)..')->'..tostring(f(p)) end"),
 "trgm": ("trgm.lua",
  "function(input_json) local f=_libs.trgm; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='sim',a='DuckDB',b='duckdb'} end; "
  "return 'trgm.'..p.op..'('..tostring(p.a)..','..tostring(p.b)..')->'..tostring(f(p)) end"),
}

# L7 = 7 回调库 + json（_duckdb_query 包装用 _libs.json.decode 解宿主返回）
L7 = {
 "json": ("parser/json.lua",
  "function(input_json) local j=_libs.json; return 'json lib loaded: ' .. tostring(type(j.encode)) end"),
 "etl": ("etl/etl.lua",
  "function(input_json) local m=_libs.etl; if type(m)~='table' or not m.run then return 'etl module shape: '..tostring(type(m)) end; "
  "  -- 演示 etl.run 审计包装：跑一个会成功的 fn + 一个会失败被重试捕获的 fn\n"
  "  local ok1,res1=pcall(m.run,'demo_ok','{\"x\":1}',function() return {1,2,3} end)\n"
  "  local ok2,res2=pcall(m.run,'demo_fail','{}',function() error('intentional fail') end)\n"
  "  return 'run_ok='..tostring(ok1)..'(rows='..(ok1 and #res1 or '-')..') run_fail_caught='..tostring(not ok2) end"),
 "incremental": ("etl/incremental.lua",
  "function(input_json) local m=_libs.incremental; local p={target='demo_wm',source='demo_wm_src',mode='ts',ts_col='ts',id_col='id'}; "
  "local ok,res=pcall(m.run,p); if not ok then return 'ERR '..tostring(res) end; return 'ok: '..tostring(res) end"),
 "scd2": ("etl/scd2.lua",
  "function(input_json) local f=_libs['scd2']; if type(f)~='table' or not f.run then return 'scd2 shape: '..tostring(type(f)) end; "
  "local p={target='demo_scd2',source='demo_scd2_src',key_col='id',ts_col='ts',attr_cols={'status'}}; "
  "local ok,res=pcall(f.run,p); if not ok then return 'ERR '..tostring(res) end; return 'ok: '..tostring(res) end"),
 "to_lance": ("etl/to_lance.lua",
  "function(input_json) local m=_libs.to_lance; local p={source='demo_scd2_src',dest='mem://demo_lance',mode='ts',ts_col='ts',id_col='id'}; "
  "local ok,res=pcall(m.run,p); if not ok then return 'ERR '..tostring(res) end; return 'ok: '..tostring(res) end"),
 "export": ("export/export.lua",
  "function(input_json) local f=_libs.export; local p={tbl='demo_export_src',file='mem://demo_export.csv',format='csv'}; "
  "local ok,res=pcall(f,p); if not ok then return 'ERR '..tostring(res) end; return 'ok: '..tostring(res) end"),
 "rbac": ("security/rbac.lua",
  "function(input_json) local f=_libs.rbac; if type(f)~='function' then return 'rbac shape: '..tostring(type(f)) end; "
  "local ok1, r1 = pcall(f, {op='setup'}); "
  "local ok2, r2 = pcall(f, {op='status'}); "
  "local ok3, r3 = pcall(f, {op='authz', sid='s1', q='SELECT * FROM public_data'}); "
  "return 'setup='..tostring(r1)..' | status='..tostring(r2).."
  "' | authz(read public_data, no session)='..tostring(r3) end"),
 "demo_e2e": ("etl/demo_e2e.lua",
  "function(input_json) local f=_libs.demo_e2e; local ok,res=pcall(f,{}); if not ok then return 'ERR '..tostring(res) end; return tostring(res) end"),
}

# jieba/pinyin 的 build(DATA) 返回 function(p)：p 可 table 或 string，返回 JSON 字符串
LJP = {
 "jieba": ("udf/jieba.lua",
  "function(input_json) local f=_libs.jieba; local p; if input_json and input_json~='' then p={v=input_json,op='cut'} else p={v='北京大学在北京市卖苹果',op='cut'} end; "
  "local ok,r=pcall(f,p); if not ok then return 'ERR '..tostring(r) end; return 'cut('..p.v..')->'..tostring(r) end"),
 "pinyin": ("udf/pinyin.lua",
  "function(input_json) local f=_libs.pinyin; local p; if input_json and input_json~='' then p={v=input_json,op='pinyin'} else p={v='重庆一丁不识龟龙片甲',op='pinyin'} end; "
  "local ok,r=pcall(f,p); if not ok then return 'ERR '..tostring(r) end; return 'py('..p.v..')->'..tostring(r) end"),
}

def emit(path, name, d):
    keys=list(d.keys())
    out=["// auto-generated", "#ifndef %s_EMBED_H"%name, "#define %s_EMBED_H"%name,
         "typedef struct { const char*name; const char*lib; const char*caller; } %s_ITEM;"%name,
         "static const int %s_N = %d;"%(name,len(keys))]
    out.append("static const char* %s_NAME[] = {"%name)
    for n in keys: out.append("  "+cstr(n)+",")
    out.append("};")
    out.append("static const char* %s_LIB[] = {"%name)
    for n in keys:
        src=open(os.path.join(B,d[n][0]),encoding="utf-8").read()
        assert '\x00' not in src, n
        out.append("  "+cstr(src)+",")
    out.append("};")
    out.append("static const char* %s_CALLER[] = {"%name)
    for n in keys:
        caller = d[n][1]
        # caller 是匿名函数表达式 function(...) ... end —— 作为 chunk 首语句是语法错误，
        # 必须包成 `return function(...) ... end` 求值出函数值
        if not caller.lstrip().startswith("return"):
            caller = "return " + caller
        out.append("  "+cstr(caller)+",")
    out.append("};")
    out.append("#endif")
    open(path,"w",encoding="utf-8").write("\n".join(out))
    print("%s -> %s  %d libs  %dB"%(name, path, len(keys), os.path.getsize(path)))

# trgm 源单独放（不在 libs 目录）——从 /tmp/poc/trgm_src.h 或已知位置
# 先找 trgm.lua
trgm_candidates=[os.path.join(B,"udf/trgm.lua"), os.path.join(B,"trgm.lua")]
for c in trgm_candidates:
    if os.path.exists(c):
        L20["trgm"]=(os.path.relpath(c,B),"function(input_json) local f=_libs.trgm; local p; if input_json and input_json~='' then p=_libs.json.decode(input_json) else p={op='sim',a='DuckDB',b='duckdb'} end; return 'trgm.'..p.op..'('..tostring(p.a)..','..tostring(p.b)..')->'..tostring(f(p)) end")
        break
else:
    # 找不到就保留占位（build 脚本会从 /tmp 补）
    print("WARN: trgm.lua 未在 libs 找到，保留占位路径 trgm.lua")

emit(os.path.join(OUTDIR,"l20_embed.h"),"L20",L20)
emit(os.path.join(OUTDIR,"l7_embed.h"),"L7",L7)
emit(os.path.join(OUTDIR,"ljp_embed.h"),"LJP",LJP)
print("DONE")
