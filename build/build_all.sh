#!/bin/bash
# 三模块统一构建（L20/L7/LU 各自参数）。已验证产物见 repo 根目录 lua20.js/lua7.js/luajp.js。
# 用法: Emscripten 与 PUC Lua 5.4.7 路径通过环境变量覆盖（默认 WSL 用户态工具链）：
#   EMCC=/path/to/em++ LUA_SRC=/path/to/lua-5.4.7/src LIBS=/path/to/duckdb-luajit-libs/libs bash build_all.sh [all|l20|l7|lujp]
# 关键 flag 说明：
#   -sDISABLE_EXCEPTION_CATCHING=0  三模块必须带。emcc 3.1.6 默认禁用 catch，缺它时任何库
#     抛出的 Lua 错误穿透成裸 JS 数字、被页面误标 wasm-trap（2026-11-10 实证，见 README 坑 7）。
#   -sSINGLE_FILE=1  Lua 源码经 gen_embed_all.py 嵌入 C 字符串头，无外部文件依赖。
set -u
EMCC=${EMCC:-/home/lhy/wasm/bin/em++}
LUA_SRC=${LUA_SRC:-/home/lhy/lua-5.4.7/src}
LIBS=${LIBS:-/mnt/d/wsl2/duckdb-luajit-libs/libs}
OUT=${OUT:-$(cd "$(dirname "$0")/.." && pwd)}
BUILD=${BUILD:=$(pwd)}
LUA_C=$(ls "$LUA_SRC"/*.c | grep -v -E "lua\.c|onelua\.c")
TARGET="${1:-all}"

gen() { python3 "$BUILD/gen_embed_all.py" "$LIBS" "$BUILD"; }

build_one() {  # $1=模块名(l20|l7|lujp)  $2=EXPORT_NAME  $3=栈  $4=初始内存  $5=驱动文件
  local M=$1 NAME=$2 STACK=$3 MEM=$4 DRV=$5 OUTNAME
  case $M in l20) OUTNAME=lua20.js;; l7) OUTNAME=lua7.js;; lujp) OUTNAME=luajp.js;; esac
  echo "=== 构建 $M（$NAME）==="
  timeout 550 "$EMCC" -O1 -x c++ -I"$LUA_SRC" -I"$BUILD" \
    "$BUILD/$DRV" $LUA_C \
    -sMODULARIZE=1 -sEXPORT_NAME="$NAME" \
    -sEXPORTED_FUNCTIONS="_lua_lib_run,_lua_prewarm,_diag_stage,_malloc,_free" \
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap,stringToUTF8,UTF8ToString,lengthBytesUTF8,HEAPU8 \
    -sSINGLE_FILE=1 -sALLOW_TABLE_GROWTH=1 -sALLOW_MEMORY_GROWTH=1 \
    -sDISABLE_EXCEPTION_CATCHING=0 \
    -sTOTAL_STACK="$STACK" -sINITIAL_MEMORY="$MEM" \
    -o "$OUT/$OUTNAME" 2>&1 | grep -iE "error|undefined symbol" | head -8
  ls -la "$OUT/$OUTNAME" | awk '{print "->", $5"B"}'
}

if [ "$TARGET" = "all" ] || [ "$TARGET" = "l20" ]; then
  gen
  { echo "#pragma once"; echo "#define CUR_N L20_N"; echo "#define CUR_NAME L20_NAME"; echo "#define CUR_LIB L20_LIB"; echo "#define CUR_CALLER L20_CALLER"; echo '#include "l20_embed.h"'; } > "$BUILD/cur_embed.h"
  build_one l20 L20Module 134217728 536870912 udf_drv.c
fi
if [ "$TARGET" = "all" ] || [ "$TARGET" = "l7" ]; then
  gen
  { echo "#pragma once"; echo "#define CUR_N L7_N"; echo "#define CUR_NAME L7_NAME"; echo "#define CUR_LIB L7_LIB"; echo "#define CUR_CALLER L7_CALLER"; echo '#include "l7_embed.h"'; } > "$BUILD/cur_embed.h"
  build_one l7 L7Module 134217728 402653184 udf_drv_fix.c
fi
if [ "$TARGET" = "all" ] || [ "$TARGET" = "lujp" ]; then
  gen
  { echo "#pragma once"; echo "#define CUR_N LJP_N"; echo "#define CUR_NAME LJP_NAME"; echo "#define CUR_LIB LJP_LIB"; echo "#define CUR_CALLER LJP_CALLER"; echo '#include "ljp_embed.h"'; } > "$BUILD/cur_embed.h"
  build_one lujp LUModule 8388608 33554432 udf_drv.c
fi
echo "DONE"
