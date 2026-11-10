
var L20Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(L20Module) {
  L20Module = L20Module || {};



// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof L20Module != 'undefined' ? L20Module : {};

// See https://caniuse.com/mdn-javascript_builtins_object_assign

// Set up the promise that indicates the Module is initialized
var readyPromiseResolve, readyPromiseReject;
Module['ready'] = new Promise(function(resolve, reject) {
  readyPromiseResolve = resolve;
  readyPromiseReject = reject;
});

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

// Normally we don't log exceptions but instead let them bubble out the top
// level where the embedding environment (e.g. the browser) can handle
// them.
// However under v8 and node we sometimes exit the process direcly in which case
// its up to use us to log the exception before exiting.
// If we fix https://github.com/emscripten-core/emscripten/issues/15080
// this may no longer be needed under node.
function logExceptionOnExit(e) {
  if (e instanceof ExitStatus) return;
  let toLog = e;
  err('exiting due to exception: ' + toLog);
}

var fs;
var nodePath;
var requireNodeFS;

if (ENVIRONMENT_IS_NODE) {
  if (ENVIRONMENT_IS_WORKER) {
    scriptDirectory = require('path').dirname(scriptDirectory) + '/';
  } else {
    scriptDirectory = __dirname + '/';
  }

// include: node_shell_read.js


requireNodeFS = () => {
  // Use nodePath as the indicator for these not being initialized,
  // since in some environments a global fs may have already been
  // created.
  if (!nodePath) {
    fs = require('fs');
    nodePath = require('path');
  }
};

read_ = function shell_read(filename, binary) {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    return binary ? ret : ret.toString();
  }
  requireNodeFS();
  filename = nodePath['normalize'](filename);
  return fs.readFileSync(filename, binary ? undefined : 'utf8');
};

readBinary = (filename) => {
  var ret = read_(filename, true);
  if (!ret.buffer) {
    ret = new Uint8Array(ret);
  }
  return ret;
};

readAsync = (filename, onload, onerror) => {
  var ret = tryParseAsDataURI(filename);
  if (ret) {
    onload(ret);
  }
  requireNodeFS();
  filename = nodePath['normalize'](filename);
  fs.readFile(filename, function(err, data) {
    if (err) onerror(err);
    else onload(data.buffer);
  });
};

// end include: node_shell_read.js
  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  // Without this older versions of node (< v15) will log unhandled rejections
  // but return 0, which is not normally the desired behaviour.  This is
  // not be needed with node v15 and about because it is now the default
  // behaviour:
  // See https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  process['on']('unhandledRejection', function(reason) { throw reason; });

  quit_ = (status, toThrow) => {
    if (keepRuntimeAlive()) {
      process['exitCode'] = status;
      throw toThrow;
    }
    logExceptionOnExit(toThrow);
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (typeof document != 'undefined' && document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE, this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  // If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
  // they are removed because they could contain a slash.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }

  // Differentiate the Web Worker from the Node Worker case, as reading must
  // be done differently.
  {
// include: web_or_worker_shell_read.js


  read_ = (url) => {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  }

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = (url, onload, onerror) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = () => {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  }

// end include: web_or_worker_shell_read.js
  }

  setWindowTitle = (title) => document.title = title;
} else
{
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message




var STACK_ALIGN = 16;
var POINTER_SIZE = 4;

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length - 1] === '*') {
        return POINTER_SIZE;
      } else if (type[0] === 'i') {
        const bits = Number(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

// include: runtime_functions.js


// Wraps a JS function as a wasm function with a given signature.
function convertJsFunctionToWasm(func, sig) {

  // If the type reflection proposal is available, use the new
  // "WebAssembly.Function" constructor.
  // Otherwise, construct a minimal wasm module importing the JS function and
  // re-exporting it.
  if (typeof WebAssembly.Function == "function") {
    var typeNames = {
      'i': 'i32',
      'j': 'i64',
      'f': 'f32',
      'd': 'f64'
    };
    var type = {
      parameters: [],
      results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
    };
    for (var i = 1; i < sig.length; ++i) {
      type.parameters.push(typeNames[sig[i]]);
    }
    return new WebAssembly.Function(type, func);
  }

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    'e': {
      'f': func
    }
  });
  var wrappedFunc = instance.exports['f'];
  return wrappedFunc;
}

var freeTableIndexes = [];

// Weak map of functions in the table to their indexes, created on first use.
var functionsInTableMap;

function getEmptyTableSlot() {
  // Reuse a free index if there is one, otherwise grow.
  if (freeTableIndexes.length) {
    return freeTableIndexes.pop();
  }
  // Grow the table
  try {
    wasmTable.grow(1);
  } catch (err) {
    if (!(err instanceof RangeError)) {
      throw err;
    }
    throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
  }
  return wasmTable.length - 1;
}

function updateTableMap(offset, count) {
  for (var i = offset; i < offset + count; i++) {
    var item = getWasmTableEntry(i);
    // Ignore null values.
    if (item) {
      functionsInTableMap.set(item, i);
    }
  }
}

/**
 * Add a function to the table.
 * 'sig' parameter is required if the function being added is a JS function.
 * @param {string=} sig
 */
function addFunction(func, sig) {

  // Check if the function is already in the table, to ensure each function
  // gets a unique index. First, create the map if this is the first use.
  if (!functionsInTableMap) {
    functionsInTableMap = new WeakMap();
    updateTableMap(0, wasmTable.length);
  }
  if (functionsInTableMap.has(func)) {
    return functionsInTableMap.get(func);
  }

  // It's not in the table, add it now.

  var ret = getEmptyTableSlot();

  // Set the new value.
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    setWasmTableEntry(ret, func);
  } catch (err) {
    if (!(err instanceof TypeError)) {
      throw err;
    }
    var wrapped = convertJsFunctionToWasm(func, sig);
    setWasmTableEntry(ret, wrapped);
  }

  functionsInTableMap.set(func, ret);

  return ret;
}

function removeFunction(index) {
  functionsInTableMap.delete(getWasmTableEntry(index));
  freeTableIndexes.push(index);
}

// end include: runtime_functions.js
// include: runtime_debug.js


// end include: runtime_debug.js
var tempRet0 = 0;
var setTempRet0 = (value) => { tempRet0 = value; };
var getTempRet0 = () => tempRet0;



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime = Module['noExitRuntime'] || true;

if (typeof WebAssembly != 'object') {
  abort('no native wasm support detected');
}

// include: runtime_safe_heap.js


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @param {number} ptr
    @param {number} value
    @param {string} type
    @param {number|boolean=} noSafe */
function setValue(ptr, value, type = 'i8', noSafe) {
  if (type.charAt(type.length-1) === '*') type = 'i32';
    switch (type) {
      case 'i1': HEAP8[((ptr)>>0)] = value; break;
      case 'i8': HEAP8[((ptr)>>0)] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)] = tempI64[0],HEAP32[(((ptr)+(4))>>2)] = tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @param {number} ptr
    @param {string} type
    @param {number|boolean=} noSafe */
function getValue(ptr, type = 'i8', noSafe) {
  if (type.charAt(type.length-1) === '*') type = 'i32';
    switch (type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return Number(HEAPF64[((ptr)>>3)]);
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}

// end include: runtime_safe_heap.js
// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implemenation here for now.
    abort(text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  return func;
}

// C calling interface.
/** @param {string|null=} returnType
    @param {Array=} argTypes
    @param {Arguments|Array=} args
    @param {Object=} opts */
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);
  function onDone(ret) {
    if (stack !== 0) stackRestore(stack);
    return convertReturnValue(ret);
  }

  ret = onDone(ret);
  return ret;
}

/** @param {string=} returnType
    @param {Array=} argTypes
    @param {Object=} opts */
function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

// include: runtime_legacy.js


var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call

/**
 * allocate(): This function is no longer used by emscripten but is kept around to avoid
 *             breaking external users.
 *             You should normally not use allocate(), and instead allocate
 *             memory using _malloc()/stackAlloc(), initialize it with
 *             setValue(), and so forth.
 * @param {(Uint8Array|Array<number>)} slab: An array of data.
 * @param {number=} allocator : How to allocate memory, see ALLOC_*
 */
function allocate(slab, allocator) {
  var ret;

  if (allocator == ALLOC_STACK) {
    ret = stackAlloc(slab.length);
  } else {
    ret = _malloc(slab.length);
  }

  if (!slab.subarray && !slab.slice) {
    slab = new Uint8Array(slab);
  }
  HEAPU8.set(slab, ret);
  return ret;
}

// end include: runtime_legacy.js
// include: runtime_strings.js


// runtime_strings.js: Strings related runtime functions that are part of both MINIMAL_RUNTIME and regular runtime.

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(heap, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(heap.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = heap[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = heap[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = heap[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heap[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  ;
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   heap: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      heap[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      heap[outIdx++] = 0xC0 | (u >> 6);
      heap[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      heap[outIdx++] = 0xE0 | (u >> 12);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      heap[outIdx++] = 0xF0 | (u >> 18);
      heap[outIdx++] = 0x80 | ((u >> 12) & 63);
      heap[outIdx++] = 0x80 | ((u >> 6) & 63);
      heap[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  heap[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}

// end include: runtime_strings.js
// include: runtime_strings_extra.js


// runtime_strings_extra.js: Strings related runtime functions that are available only in regular runtime.

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf-16le') : undefined;

function UTF16ToString(ptr, maxBytesToRead) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  var maxIdx = idx + maxBytesToRead / 2;
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var str = '';

    // If maxBytesToRead is not passed explicitly, it will be undefined, and the for-loop's condition
    // will always evaluate to true. The loop is then terminated on the first null char.
    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) break;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }

    return str;
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)] = codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr, maxBytesToRead) {
  var i = 0;

  var str = '';
  // If maxBytesToRead is not passed explicitly, it will be undefined, and this
  // will always evaluate to true. This saves on code size.
  while (!(i >= maxBytesToRead / 4)) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0) break;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
  return str;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)] = codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)] = 0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated
    @param {boolean=} dontAddNull */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

/** @param {boolean=} dontAddNull */
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)] = str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)] = 0;
}

// end include: runtime_strings_extra.js
// Memory management

var HEAP,
/** @type {!ArrayBuffer} */
  buffer,
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var TOTAL_STACK = 134217728;

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 536870912;

// include: runtime_init_table.js
// In regular non-RELOCATABLE mode the table is exported
// from the wasm module and this will be assigned once
// the exports are available.
var wasmTable;

// end include: runtime_init_table.js
// include: runtime_stack_check.js


// end include: runtime_stack_check.js
// include: runtime_assertions.js


// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;
var runtimeKeepaliveCounter = 0;

function keepRuntimeAlive() {
  return noExitRuntime || runtimeKeepaliveCounter > 0;
}

function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;

  
if (!Module["noFSInit"] && !FS.init.initialized)
  FS.init();
FS.ignorePermissions = false;

TTY.init();
  callRuntimeCallbacks(__ATINIT__);
}

function exitRuntime() {
  runtimeExited = true;
}

function postRun() {

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data

/** @param {string|number=} what */
function abort(what) {
  {
    if (Module['onAbort']) {
      Module['onAbort'](what);
    }
  }

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  what += '. Build with -s ASSERTIONS=1 for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // defintion for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.

  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

// {{MEM_INITIALIZER}}

// include: memoryprofiler.js


// end include: memoryprofiler.js
// include: URIUtils.js


// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  // Prefix of data URIs emitted by SINGLE_FILE and related options.
  return filename.startsWith(dataURIPrefix);
}

// Indicates whether filename is delivered via file protocol (as opposed to http/https)
function isFileURI(filename) {
  return filename.startsWith('file://');
}

// end include: URIUtils.js
var wasmBinaryFile;
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABloOAgAA8YAF/AX9gA39/fwF/YAJ/fwF/YAJ/fwBgBH9/f38Bf2ADf39/AGABfwBgBH9/f38AYAV/f39/fwBgAAF/YAF8AXxgBX9/f39/AX9gAABgBn9/f39/fwBgBX9+fn5+AGAGf39/f39/AX9gA39+fwF+YAF/AXxgAn9/AX5gAnx8AXxgB39/f39/f38Bf2ABfAF+YAJ8fwF8YAR/fn5/AGACf3wAYAJ/fgBgA39/fgF/YAN/f34AYAJ/fwF8YAN/fn4BfmADfHx/AXxgA3x+fgF8YAZ/fH9/f38Bf2ACfn8Bf2AEfn5+fgF/YAN/f38BfGADf39/AX5gA39/fAF8YAN/f34BfmADf3x/AGAJf39/f39/f39/AGAEf39+fgF+YAR/f35/AGACf34Bf2ABfwF+YAZ/f35/f38AYAN8f38Bf2ADf3x8AXxgAn5+AX5gAnx/AX9gAn98AXxgAX4Bf2ACfn4Bf2ADf35+AGAHf39/f39/fwBgA35/fwF/YAJ/fQBgAn5+AXxgBH9/fn8BfmAEf35/fwF/AuCFgIAAHwNlbnYIaW52b2tlX3YABgNlbnYbX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF80AAIDZW52C2dldFRlbXBSZXQwAAkDZW52Emxsdm1fZWhfdHlwZWlkX2ZvcgAAA2VudhFfX2N4YV9iZWdpbl9jYXRjaAAAA2Vudg5pbnZva2VfaWlpaWlpaQAUA2VudgtpbnZva2VfaWlpaQAEA2VudgppbnZva2VfdmlpAAUDZW52G19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMgAJA2Vudg9fX2N4YV9lbmRfY2F0Y2gADANlbnYbX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF8zAAADZW52EV9fcmVzdW1lRXhjZXB0aW9uAAYDZW52EWVtX2hvc3RfY2FsbF9maWxsAAUDZW52EmVtX2hvc3RfcXVlcnlfZmlsbAAFA2VudgVhYm9ydAAMA2VudhhfX2N4YV9hbGxvY2F0ZV9leGNlcHRpb24AAANlbnYLX19jeGFfdGhyb3cABQNlbnYMaW52b2tlX2lpaWlpAAsDZW52BHRpbWUAAANlbnYFY2xvY2sACQNlbnYVZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAEDZW52Dl9f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aiIDakEBaiADQX9GGyIDQX9HDQALIAFBf3MgAmoiA0H///8HakGAgIAQTw0CIAUgA0EHdCAGQf8AcXJBgP///wdqNgIACw8LIAEgAjYCAA8LIAAoAghBzhwQuAIAC24BA38gACgCACEBIAEgACgCCCgCNCABKAI0IAAoAhAgAUEUakEEQf////8DQaMPEN8CIgI2AjQgACAAKAIQIgNBAWo2AhAgAiADQQJ0akG4/v//BzYCACAAIAEgACgCCCgCCBC5ASAAKAIQQX9qC4MBAQN/IAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GjDxDfAiIENgI0IAAgACgCECIFQQFqNgIQIAQgBUECdGpByABBxgAgAkEBRhtBxwAgAhsgAUEHdHIgAkEQdEGAgARqcjYCACAAIAMgACgCCCgCCBC5AQsSAQF/IAAgACgCECIBNgIUIAELEAAgACABIAJB/wEgAhDAAQvXAgEIfwJAAkAgAUF/Rg0AIANBB3RBgP8BcSEFIAAoAgAoAjQhBiADQf8BRiEHA0AgBiABQQJ0aiEIAkACQCABQQFIDQBBkMYOIAhBfGoiCSgCAEH/AHFqLQAAQRBxDQELIAghCQsgCCgCACEKAkACQCAJKAIAIgtB/wBxQcMARyIMDQACQAJAIAcNACALQRB2Qf8BcSADRg0AIAtB/4B+cSAFciELDAELIAtBgIACcSALQQl2QYD/AXFyQcIAciELCyAJIAs2AgAgDA0AIAFBf3MgAmoiCUH///8HakGAgIAQSQ0BIAAoAghBzhwQuAIACyABQX9zIARqIglB////B2pBgICAEE8NAwsgCCAJQQd0IAgoAgBB/wBxckGA////B2o2AgBBfyABIApBB3ZBgYCAeGoiCGpBAWogCEF/RhsiAUF/Rw0ACwsPCyAAKAIIQc4cELgCAAseAQF/IAAgACgCECICNgIUIAAgASACQf8BIAIQwAELagEDfyAAKAIAIQIgAiAAKAIIKAI0IAIoAjQgACgCECACQRRqQQRB/////wNBow8Q3wIiAzYCNCAAIAAoAhAiBEEBajYCECADIARBAnRqIAE2AgAgACACIAAoAggoAggQuQEgACgCEEF/agt2AQN/IAAoAgAhBCAEIAAoAggoAjQgBCgCNCAAKAIQIARBFGpBBEH/////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QAJAAkAgAi0ABSIFQRhxRQ0AIAMgAigCADYCACAAIAIQpQIMAQsgAiAFQfgBcSIFQQRyIgM6AAUCQAJAAkACQCACLQAEQXhqDgIAAQILIAIgBCgCaDYCKCAEIAI2AmggAiADQcQBcToABQwCCyACKAIIIAJBEGpGDQAgAiADQcQBcToABQwBCyACIAVBJHI6AAULIAIhAwsgAygCACICDQALCyABIAEoAmAiAjYCmAEgASACNgKUASABIAI2ApABAkAgASgCeCICRQ0AIAFB+ABqIQMgACgCECEEA0ACQAJAIAItAAUiBUEYcUUNACADIAIoAgA2AgAgACACEKUCDAELIAIgBUH4AXEiBUEEciIDOgAFAkACQAJAAkAgAi0ABEF4ag4CAAECCyACIAQoAmg2AiggBCACNgJoIAIgA0HEAXE6AAUMAgsgAigCCCACQRBqRg0AIAIgA0HEAXE6AAUMAQsgAiAFQSRyOgAFCyACIQMLIAMoAgAiAg0ACwsgAUEANgIUIAFBAToATiABIAEoAgwgASgCCGo2AhAgACABEK8CC8QDAQR/IAAoAhAiAUEEOgBSAkAgAS0ATkUNACABLQBMQRhxIQICQCABKAJYIgNFDQADQCADIAMtAAVBwAFxIAJyOgAFIAMoAgAiAw0ACwsgAUEANgKIASABQgA3A4ABAkAgASgCYCIDRQ0AA0AgAyADLQAFQcABcSACcjoABSADKAIAIgMNAAsLAkAgASgCeCIDRQ0AA0AgAyADLQAFQcABcSACcjoABSADKAIAIgMNAAsLIAFBADYCmAEgAUIANwOQASABQQg7AE0gAUEANgIUCyABQQA2AhQgAUH4AGohAwNAIAMiAigCACIDDQALAkAgASgCYCIDIAEoApQBRg0AA0ACQCADIgMgASgCkAFHDQAgASADKAIANgKQAQsgASADKAIANgJgIAMgAigCADYCACACIAM2AgAgAyECIAEoAmAiAyABKAKUAUcNAAsLAkAgACgCECIDKAJ4RQ0AA0AgABCsAiADKAJ4DQALCwJAIAEoAlgiAyABKAKkASIERg0AA0AgAygCACECIAAgAxClAiACIQMgAiAERw0ACwsCQCABKAJ8IgNFDQADQCADKAIAIQEgACADEKUCIAEhAyABDQALCwuCAwEGfyMAQRBrIgEkACAAKAIQIgIgAigC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EKgCGiABLQBNDQALCwJAIAAQqQIiBSADQQN2IANqTw0AIAAgARCqAiABQQAgASgCDCABKAIIakHkAG4gAS0AUGxrEI0DDwsgASABKAIMIAEoAghqNgIQIAAoAhAiBkEDOgBNIAZB2ABqIgMhBANAAkAgBCgCACICRQ0AAkACQCACLQAFIgcgACgCEC0ATCIIQRhzcUUNACAEIAIoAgA2AgAgACACEKUCDAELIAIgB0HAAXEgCEEYcXI6AAUgAiEECyAEKAIAIQILIARBACACGyIEIANGDQALIAYgBDYCXAJAIAAoAhAiAi0ATUEIRg0AA0AgABCoAhogAi0ATUEIRw0ACwsgASABKAIMIAEoAghqIAEoAhBB5ABuIgAgAS0AVEECdCICbEH/////ByACQf////8HIABuSRtrIgBBH3UgAHEQjQMgASAFNgIUDwsgASgCECIFQeQAbiECAkAgASgCDCIEQQFIDQAgASgCCCAEaiABLQBRIAJsQQJ0IgMgBWpNDQAgAS0ATEEYcSEEAkAgASgCWCICRQ0AA0AgAiACLQAFQcABcSAEcjoABSACKAIAIgINAAsLIAFBADYCiAEgAUIANwOAAQJAIAEoAmAiAkUNAANAIAIgAi0ABUHAAXEgBHI6AAUgAigCACICDQALCwJAIAEoAngiAkUNAANAIAIgAi0ABUHAAXEgBHI6AAUgAigCACICDQALCyABQQA2ApgBIAFCADcDkAEgAUEIOwBNIAFBADYCFCAAIAEQpwIhACABKAIMIAEoAghqIgIgA0EBdiAFakkNAiABIAA2AhQgASACIAEoAhBB5ABuIgAgAS0AVEECdCIEbEH/////ByAEQf////8HIABuSRtrIgBBH3UgAHEQjQMPCwJAIAEoAowBIgJFDQACQCACIAEoAogBIgNGDQADQAJAIAItAAUiBEEHcUEDRw0AIAIgBEEHczoABSAEQSBxRQ0AIAEgAhCfAgsgAigCACICIANHDQALCyABQQA2AowBCwJAIAEoAmAiAiABKAKYASIDRg0AA0ACQCACLQAFIgRBB3FBA0cNACACIARBB3M6AAUgBEEgcUUNACABIAIQnwILIAIoAgAiAiADRw0ACwsCQCABKAJ4IgJFDQADQAJAIAItAAUiBEEHcUEDRw0AIAIgBEEHczoABSAEQSBxRQ0AIAEgAhCfAgsgAigCACICDQALCyAAEKkCGiABQQM6AE0gAUHYAGohBAJAIAEoAlgiAiABKAKAASIHRg0AIAEtAExBGHEhCANAAkACQCACLQAFIgNBGHFFDQAgBCACKAIANgIAIAAgAhClAgwBCwJAAkAgA0EHcSIEDQAgAiAIIANBwAFxckEBcjoABQwBCyACIARB6MAOai0AACADQfgBcXI6AAUgBEF/akEBSw0AIAEoAowBDQAgASACNgKMAQsgAiEECyAEKAIAIgIgB0cNAAsLAkAgBCgCACICIAEoAoQBIghGDQAgAS0ATEEYcSEGIAQhAwNAAkACQCACLQAFIgdBGHFFDQAgAyACKAIANgIAIAAgAhClAgwBCwJAAkAgB0EHcSIDDQAgAiAGIAdBwAFxckEBcjoABQwBCyACIANB6MAOai0AACAHQfgBcXI6AAUgA0F/akEBSw0AIAEoAowBDQAgASACNgKMAQsgAiEDCyADKAIAIgIgCEcNAAsLIAFB4ABqIQMgASABKAKEATYCiAEgBCgCACECIAEgASgCWDYCgAEgASACNgKEAQJAIAEoAmAiAiABKAKQASIHRg0AIAEtAExBGHEhCANAAkACQCACLQAFIgRBGHFFDQAgAyACKAIANgIAIAAgAhClAgwBCwJAAkAgBEEHcSIDDQAgAiAIIARBwAFxckEBcjoABQwBCyACIANB6MAOai0AACAEQfgBcXI6AAULIAIhAwsgAygCACICIAdHDQALCwJAIAMoAgAiAiABKAKUASIIRg0AIAEtAExBGHEhBiADIQQDQAJAAkAgAi0ABSIHQRhxRQ0AIAQgAigCADYCACAAIAIQpQIMAQsCQAJAIAdBB3EiBA0AIAIgBiAHQcABcXJBAXI6AAUMAQsgAiAEQejADmotAAAgB0H4AXFyOgAFCyACIQQLIAQoAgAiAiAIRw0ACwsgASABKAKUATYCmAEgAygCACECIAEgASgCYDYCkAEgASACNgKUAQJAIAEoAngiAkUNACABQfgAaiEEIAEtAExBGHEhBwNAAkACQCACLQAFIgNBGHFFDQAgBCACKAIANgIAIAAgAhClAgwBCwJAAkAgA0EHcSIEDQAgAiAHIANBwAFxckEBcjoABQwBCyACIARB6MAOai0AACADQfgBcXI6AAULIAIhBAsgBCgCACICDQALCyAAIAEQ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ByAGIAg2AgggBiAHNgIACyAGIAYoAgQiB0EBajYCBCAHIAYoAgBqIAQ6AAAgACgCOCIGIAYoAgAiB0F/ajYCAAJAAkAgB0UNACAGIAYoAgQiB0EBajYCBCAHLQAAIQYMAQsgBhCUBCEGCyAAIAY2AgACQCABRQ0AIAEgACAAKAI8IgYoAgAgAmogBigCBCACQQF0axC6AjYCAAsgA0EQaiQADwsgAEG1HEEAELkCAAsgAEG1HEEAELkCAAtgAQF/QQAhAgJAIAAoAgAgAUcNACAAKAI4IgIgAigCACIBQX9qNgIAAkACQCABRQ0AIAIgAigCBCIBQQFqNgIEIAEtAAAhAgwBCyACEJQEIQILIAAgAjYCAEEBIQILIAILsQMBBH8gACgCACEBAkACQAJAIAAoAjwiAigCBEEBaiACKAIIIgNNDQAgA0H/////B08NASAAKAI0IAIoAgAgAyADQQF0IgQQ4QIhAyACIAQ2AgggAiADNgIACyACIAIoAgQiA0EBajYCBCADIAIoAgBqIAE6AAAgACgCOCICIAIoAgAiA0F/ajYCAAJAAkAgA0UNACACIAIoAgQiA0EBajYCBCADLQAAIQIMAQsgAhCUBCECCyAAIAI2AgACQCACQbC+DmpBAWotAABBEHENAAJAIAJBf0YNAAJAIAAoAjwiAygCBEEBaiADKAIIIgFNDQAgAUH/////B08NBCAAKAI0IAMoAgAgASABQQF0IgQQ4QIhASADIAQ2AgggAyABNgIACyADIAMoAgQiAUEBajYCBCABIAMoAgBqIAI6AAAgACgCOCICIAIoAgAiA0F/ajYCAAJAAkAgA0UNACACIAIoAgQiA0EBajYCBCADLQAAIQIMAQsgAhCUBCECCyAAIAI2AgALIABBxc4AQaQCELkCAAsgAhDrAg8LIABBtRxBABC5AgALIABBtRxBABC5AgALegECfwJAAkAgACgCPCICKAIEQQFqIAIoAggiA00NACADQf////8HTw0BIAAoAjQgAigCACADIANBAXQiABDhAiEDIAIgADYCCCACIAM2AgALIAIgAigCBCIAQQFqNgIEIAAgAigCAGogAToAAA8LIABBtRxBABC5AgAL/AYBBn8jAEEQayICJAAgACgCACEDAkACQAJAAkACQAJAIAAoAjwiBCgCBEEBaiAEKAIIIgVNDQAg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ADoABiAAIAAoAhw2AjQgAEEBQQAgASABQQFGGxCMAiEBIAAoAhxBEGohAgJAAkAgAUUNACAAIAEgAhD6AQwBCyAAIAI2AgwLIABBOGogACgCDEHAAmoiAjYCACAAIAIgACgCHGtBBHVBABD9ARogAQvDBAEDfyMAQRBrIgIkAEEAIQMCQCABQQBBCEHgBiAAEQQAIgRFDQBBACEDIARB3ABqQQA2AgAgBEHgAGpCADcCACAEQQA2AgQgBCAANgJ4IARBxAFqQQg6AAAgBEEIakGIEDsBACAEQRRqIARB+ABqNgIAIARBGGpBADYCACAEQTBqIARBBGoiADYCACAEQQpqQYACNgEAIARBNGpBADYCACAEQfAAakEANgIAIARBIGpCADcCACAEQdABaiAANgIAIARB6ABqQgA3AgAgBEHUBmpCADcCACAEQfwAaiABNgIAIARB9ABqQQA2AgAgBEHkAGpBgIAENgIAIARBnAJqIAA2AgBBABASIQEgAkHMADYCDCACIAA2AgQgAiABNgIAIAIgAjYCCCAEQcABaiACQQRqQQwgARCaAzYCACAEQZgBakEANgIAIARBmAJqQQA2AgAgBEGoAWpBADoAACAEQZABakIANwMAIARBygFqQQI7AQAgBEHHAWpBADoAACAEQcUBakEIOwAAIARB1AFqQQBBxAAQqAQaIARBzgFqQQ06AAAgBEHMAWpBsjI7AQAgBEG4AWpBAzoAACAEQbABakIANwMAIARBjAFqQQA2AgAgBEGAAWpC4AY3AwAgBEGIA2pCADcCACAEQcgBakGUMjsBACAEQZADakIANwIAIARBmANqQgA3AgAgBEGgA2pCADcCACAEQagDakEANgIAAkAgAEHNAEEAEPwBDQAgACEDDAELIAAQlgMLIAJBEGokACADC60CAQN/IAAoAhAhAiAAIABB0AVBABDmAiIDNgIkIAAgAzYCHEEAIQMDQCAAKAIcIANBBHRqQQA6AAggA0EBaiIDQS1HDQALIABBPGpCADcCACAAIAAoAhwiAzYCDCAAQdQAakGAgAg2AgAgAEHEAGpBADYCACAAIAM2AjQgACADQYAFajYCGCADQQA6AAggACAAQTRqNgIUIABBOGogACgCDCIDQdACajYCACAAIANBEGo2AgwgABDSAyEDIAJBMGpBxQA6AAAgAiADNgIo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AWohAwsgACADQX9zECsPCyAAIAFBBRB7CwuSAQEDfiAAQQFBBxDdAyAAQQEQjgFCAXwhAQJAAkACQCAAECpBfmoOAgEAAgsCQCAAQQIQfyICQn98IAFUDQAgAEECQdAPEHAaCwJAIAEgAlcNAANAIABBASABQn98IgMQTRogAEEBIAEQVSADIQEgAyACVQ0ACwsgAiEBCyAAQQEgARBVQQAPCyAAQYbaAEEAEHELWAICfwF+IAAgABAqIgFBARBQIABBAUEBEC0CQCABQQFIDQAgAa0hAwNAIABBASADEFUgA0IBVSECIANCf3whAyACDQALCyAAIAGsEEIgAEEBQfwYEFRBAQusAQIDfgF/IABBAkIBEIEBIQECQAJAIABBAxAwQQBKDQAgAEEBEI4BIQIMAQsgAEEDEH8hAgtBACEEAkACQCACIAFTDQBBASEEAkAgAiABfSIDQv7///8HVg0AIAAgA0IBfCIDpxAmRSEECyAEDQECQCACIAFXDQADQCAAQQEgARBNGiABQgF8IgEgAlINAAsLIABBASACEE0aIAOnIQQLIAQPCyAAQZIbQQAQcQuGAQEDfiAAQQFBBxDdAyAAQQEQjgEhAQJAIAEgAEECIAEQgQEiAlENACACQn98IAFYDQAgAEECQdAPEHAaCyAAQQEgAhBNGgJAIAIgAVkNAANAIABBASACQgF8IgMQTRogAEEBIAIQVSADIQIgAyABUg0ACyABIQILIAAQQCAAQQEgAhBVQQELuAICBX4CfyAAQQIQfyEBIABBAxB/IQIgAEEEEH8hAyAAQQUQMCEGIABBAUEBEN0DIABBBUEBIAZBAEobIgdBAhDdAwJAIAIgAVMNAAJAIAFCAFUNACACIAFC////////////AHxTDQAgAEEDQcghEHAaCwJAIAMgAiABfSIEQv///////////wCFVw0AIABBBEHgJhBwGgsCQAJAIAMgAlUNACADIAFXDQAgBkEBSA0BIABBASAHQQAQNw0BC0IAIQUgBEIAUw0BIAIgAX1CAXwhBANAIABBASAFIAF8EE0aIAAgByAFIAN8EFUgBUIBfCIFIARSDQAMAgsACyAEQgBTDQADQCAAQQEgBCABfBBNGiAAIAcgBCADfBBVIARCAFUhBiAEQn98IQQgBg0ACwsgACAHEC9BAQtgAQF+IABBAUEHEN0D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DQggAkH/AXFBBEcNCSABIAEoAgAiAkF/ajYCAAJAAkAgAkUNACABIAEoAgQiAkEBajYCBCACLQAAIQIMAQsgARCUBCECCyACQX9GDQogAkH/AXFBCEcNCyABIAEoAgAiAkF/ajYCAAJAAkAgAkUNACABIAEoAgQiAkEBajYCBCACLQAAIQIMAQsgARCUBCECCyACQX9GDQwgAkH/AXFBCEcNDSABIANBwABqQQgQlgQNDiADKQNAQvisAVINDyABIANBwABqQQgQlgQNECADKwNARAAAAAAAKHdAYg0RIAEgASgCACICQX9qNgIAAkACQCACRQ0AIAEgASgCBCICQQFqNgIEIAItAAAhAQwBCyABEJQEIQELIAFBf0YNEiAAIAFB/wFxEJQCIQEgACgCDCICQcYAOgAIIAIgATYCACAAEIECIAEgABCbAiICNgIMAkAgAS0ABUEgcUUNACACLQAFQRhxRQ0AIAAgASACEJ4CCyADQTBqIAEoAgxBABD2AyADQdAAaiQAIAEPCyADQTBqQekaEPcDAAsgA0EwakHGGhD3AwALIANBMGpB6RoQ9wMACyADQTBqQYgcEPcDAAsgA0EwakHpGhD3AwALIANBMGpB+BsQ9wMACyADQTBqQekaEPcDAAsgA0EwakHZGhD3AwALIANBMGpB6RoQ9wMACyADQd0WNgIgIANBMGogAEGZHCADQSBqEPICEPcDAAsgA0EwakHpGhD3AwALIANBvxM2AhAgA0EwaiAAQZkcIANBEGoQ8gIQ9wMACyADQTBqQekaEPcDAAsgA0GTFDYCACADQTBqIABBmRwgAxDyAhD3AwALIANBMGpB6RoQ9wMACyADQTBqQfAbEPcDAAsgA0EwakHpGhD3AwALIANBMGpB2hsQ9wMACyADQTBqQekaEPcDAAu7HQEHfyMAQRBrIgMkACABIAAgARD4AyIEIAIgBBs2AkwgAEEEaiEEQQAhBQJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAA0AgBCgCACICIAIoAgAiBkF/ajYCAAJAAkAgBkUNACACIAIoAgQiBkEBajYCBCAGLQAAIQIMAQsgAhCUBCECCyACQX9G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IuM6rZA/okTrDXYkS3upP6CiRFE90KBmDbE/oKJEbiBMxc1Ftz+gokT/gwCSJEnCP6CiRA1VVVVVVdU/oKIhBQJAIAJB///v/gNLDQAgACAAIAYgBaCioQ8LIANBA3QiAkHwzg5qKwMAIAAgBiAFoKIgAkGQzw5qKwMAoSAAoaEiAJogACABQgBTGyEACyAACwUAIAC9C8YDAwF+BX8BfAJAAkAgARCfBEL///////////8Ag0KAgICAgICA+P8AVg0AIAAQnwRC////////////AINCgYCAgICAgPj/AFQNAQsgACABoA8LAkAgAb0iAkIgiKciA0GAgMCAfGogAqciBHINACAAEJwEDwsgA0EedkECcSIFIAC9IgJCP4inciEGAkACQCACQiCIp0H/////B3EiByACp3INACAAIQgCQAJAIAYOBAMDAAEDC0QYLURU+yEJQA8LRBgtRFT7IQnADwsCQCADQf////8HcSIDIARyDQBEGC1EVPsh+T8gAKYPCwJAAkAgA0GAgMD/B0cNACAHQYCAwP8HRw0BIAZBA3RBsM8OaisDAA8LAkACQCAHQYCAwP8HRg0AIANBgICAIGogB08NAQtEGC1EVPsh+T8gAKYPCwJAAkAgBUUNAEQAAAAAAAAAACEIIAdBgICAIGogA0kNAQsgACABoxCvBBCcBCEICwJAAkACQCAGDgMEAAECCyAImg8LRBgtRFT7IQlAIAhEB1wUMyamobygoQ8LIAhEB1wUMyamobygRBgtRFT7IQnAoA8LIAZBA3RB0M8OaisDACEICyAICwUAIAC9CwQAQQELAgALkgEBA3xEAAAAAAAA8D8gACAAoiICRAAAAAAAAOA/oiIDoSIERAAAAAAAAPA/IAShIAOhIAIgAiACIAJEkBXLGaAB+j6iRHdRwRZswVa/oKJETFVVVVVVpT+goiACIAKiIgMgA6IgAiACRNQ4iL7p+qi9okTEsbS9nu4hPqCiRK1SnIBPfpK+oKKgoiAAIAGioaCgC+cSAhB/A3wjAEGwBGsiBSQAIAJBfWpBGG0iBkEAIAZBAEobIgdBaGwgAmohCAJAIARBAnRB8M8OaigCACIJIANBf2oiCmpBAEgNACAJIANqIQsgByAKayECQQAhBgNAAkACQCACQQBODQBEAAAAAAAAAAAhFQwBCyACQQJ0QYDQDmoo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AEF/DwsgACAAKAIsIAAoAjBqIgI2AgggACACNgIEIAFBG3RBH3ULQQECfyMAQRBrIgEkAEF/IQICQCAAELUEDQAgACABQQ9qQQEgACgCIBEBAEEBRw0AIAEtAA8hAgsgAUEQaiQAIAILBQAgAJwLqwQCBH4CfwJAAkAgAb0iAkIBhiIDUA0AIAJC////////////AINCgICAgICAgPj/AFYNACAAvSIEQjSIp0H/D3EiBkH/D0cNAQsgACABoiIBIAGjDwsCQCAEQgGGIgUgA1YNACAARAAAAAAAAAAAoiAAIAUgA1EbDwsgAkI0iKdB/w9xIQcCQAJAIAYNAEEAIQYCQCAEQgyGIgNCAFMNAANAIAZBf2ohBiADQgGGIgNCf1UNAAsLIARBASAGa62GIQMMAQsgBEL/////////B4NCgICAgICAgAiEIQMLAkACQCAHDQBBACEHAkAgAkIMhiIFQgBTDQADQCAHQX9qIQcgBUIBhiIFQn9VDQALCyACQQEgB2uthiECDAELIAJC/////////weDQoCAgICAgIAIhCECCwJAIAYgB0wNAANAAkAgAyACfSIFQgBTDQAgBSEDIAVCAFINACAARAAAAAAAAAAAog8LIANCAYYhAyAGQX9qIgYgB0oNAAsgByEGCwJAIAMgAn0iBUIAUw0AIAUhAyAFQgBSDQAgAEQAAAAAAAAAAKIPCwJAAkAgA0L/////////B1gNACADIQUMAQsDQCAGQX9qIQYgA0KAgICAgICABFQhByADQgGGIgUhAyAHDQALCyAEQoCAgICAgICAgH+DIQMCQAJAIAZBAUgNACAFQoCAgICAgIB4fCAGrUI0hoQhBQwBCyAFQQEgBmutiCEFCyAFIAOEvwt0AQF/QQIhAQJAIABBKxCBBQ0AIAAtAABB8gBHIQELIAFBgAFyIAEgAEH4ABCBBRsiAUGAgCByIAEgAEHlABCBBRsiASABQcAAciAALQAAIgBB8gBGGyIBQYAEciABIABB9wBGGyIBQYAIciABIABB4QBGGwsOACAAKAI8IAEgAhDrBAvlAgEHfyMAQSBrIgMkACADIAAoAhwiBDYCECAAKAIUIQUgAyACNgIcIAMgATYCGCADIAUgBGsiATYCFCABIAJqIQYgA0EQaiEEQQIhBwJAAkACQAJAAkAgACgCPCADQRBqQQIg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AiADQQN2QRxxaiIEIAQoAgBBASADdHI2AgAgAS0AASEDIAFBAWohASADDQALCyAAIQQgAC0AACIDRQ0AIAAhAQNAAkAgAiADQQN2QRxxaigCACADdkEBcUUNACABIQQMAgsgAS0AASEDIAFBAWoiBCEBIAMNAAsLIAJBIGokACAEIABrCxYAIAAgACABEI8FaiIAQQAgAC0AABsL5AEBA38jAEEgayICQRhqQgA3AwAgAkEQakIANwMAIAJCADcDCCACQgA3AwACQCABLQAAIgMNAEEADwsCQCABLQABDQAgACEBA0AgASIEQQFqIQEgBC0AACADRg0ACyAEIABrDwsDQCACIANBA3ZBHHFqIgQgBCgCAEEBIAN0cjYCACABLQABIQMgAUEBaiEBIAMNAAsgACEEAkAgAC0AACIDRQ0AIAAhAQNAAkAgAiADQQN2QRxxaigCACADdkEBcQ0AIAEhBAwCCyABLQABIQMgAUEBaiIEIQEgAw0ACwsgBCAAawtHAQJ/IAAgATcDcCAAIAAoAiwgACgCBCICa6w3A3ggACgCCCEDAkAgAVANACADIAJrrCABVw0AIAIgAadqIQMLIAAgAzYCaAvdAQIDfwJ+IAApA3ggACgCBCIBIAAoAiwiAmusfCEEAkACQAJAIAApA3AiBVANACAEIAVZDQELIAAQtgQiAkF/Sg0BIAAoAgQhASAAKAIsIQILIABCfzcDcCAAIAE2AmggACAEIAIgAWusfDcDeEF/DwsgBEIBfCEEIAAoAgQhASAAKAIIIQMCQCAAKQNwIgVCAFENACAFIAR9IgUgAyABa6xZDQAgASAFp2ohAwsgACADNgJoIAAgBCAAKAIsIgMgAWusfDcDeAJAIAEgA0sNACABQX9qIAI6AAALIAILNQAgACABNwMAIAAgBEIwiKdBgIACcSACQjCIp0H//wFxcq1CMIYgAkL///////8/g4Q3AwgL5wIBAX8jAEHQAGsiBCQAAkACQCADQYCAAUgNACAEQSBqIAEgAkIAQoCAgICAgID//wAQzAUgBEEgakEIaikDACECIAQpAyAhAQJAIANB//8BTw0AIANBgYB/aiEDDAILIARBEGogASACQgBCgICAgICAgP//ABDMBSADQf3/AiADQf3/AkgbQYKAfmohAyAEQRBqQQhqKQMAIQIgBCkDECEBDAELIANBgYB/Sg0AIARBwABqIAEgAkIAQoCAgICAgIA5EMwFIARBwABqQQhqKQMAIQIgBCkDQCEBAkAgA0H0gH5NDQAgA0GN/wBqIQMMAQsgBEEwaiABIAJCAEKAgICAgICAORDMBSADQeiBfSADQeiBfUobQZr+AWohAyAEQTBqQQhqKQMAIQIgBCkDMCEBCyAEIAEgAkIAIANB//8Aaq1CMIYQzAUgACAEQQhqKQMANwMIIAAgBCkDADcDACAEQdAAaiQAC0sCAX4CfyABQv///////z+DIQICQAJAIAFCMIinQf//AXEiA0H//wFGDQBBBCEEIAMNAUECQQMgAiAAhFAbDwsgAiAAhFAhBAsgBAvbBgIEfwN+IwBBgAFrIgUkAAJAAkACQCADIARCAEIAEMEFRQ0AIAMgBBCWBSEGIAJCMIinIgdB//8BcSIIQf//AUYNACAGDQELIAVBEGogASACIAMgBBDMBSAFIAUpAxAiBCAFQRBqQQhqKQMAIgMgBCADEMMFIAVBCGopAwAhAiAFKQMAIQQMAQsCQCABIAitQjCGIAJC////////P4OEIgkgAyAEQjCIp0H//wFxIgatQjCGIARC////////P4OEIgoQwQVBAEoNAAJAIAEgCSADIAoQwQVFDQAgASEEDAILIAVB8ABqIAEgAkIAQgAQzAUgBUH4AGopAwAhAiAFKQNwIQQMAQsCQAJAIAhFDQAgASEEDAELIAVB4ABqIAEgCUIAQoCAgICAgMC7wAAQzAUgBUHoAGopAwAiCUIwiKdBiH9qIQggBSkDYCEECwJAIAYNACAFQdAAaiADIApCAEKAgICAgIDAu8AAEMwFIAVB2ABqKQMAIgpCMIinQYh/aiEGIAUpA1AhAwsgCkL///////8/g0KAgICAgIDAAIQhCyAJQv///////z+DQoCAgICAgMAAhCEJAkAgCCAGTA0AA0ACQAJAIAkgC30gBCADVK19IgpCAFMNAAJAIAogBCADfSIEhEIAUg0AIAVBIGogASACQgBCABDMBSAFQShqKQMAIQIgBSkDICEEDAULIApCAYYgBEI/iIQhCQwBCyAJQgGGIARCP4iEIQkLIARCAYYhBCAIQX9qIgggBkoNAAsgBiEICwJAAkAgCSALfSAEIANUrX0iCkIAWQ0AIAkhCgwBCyAKIAQgA30iBIRCAFINACAFQTBqIAEgAkIAQgAQzAUgBUE4aikDACECIAUpAzAhBAwBCwJAIApC////////P1YNAANAIARCP4ghAyAIQX9qIQggBEIBhiEEIAMgCkIBhoQiCkKAgICAgIDAAFQNAAsLIAdBgIACcSEGAkAgCEEASg0AIAVBwABqIAQgCkL///////8/gyAIQfgAaiAGcq1CMIaEQgBCgICAgICAwMM/EMwFIAVByABqKQMAIQIgBSkDQCEEDAELIApC////////P4MgCCAGcq1CMIaEIQILIAAgBDcDACAAIAI3AwggBUGAAWokAAscACAAIAJC////////////AIM3AwggACABNwMAC44JAgZ/A34jAEEwayIEJABCACEKAkACQCACQQJLDQAgAUEEaiEFIAJBAnQiAkG82w9qKAIAIQYgAkGw2w9qKAIAIQcDQAJAAkAgASgCBCICIAEoAmhGDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEJMFIQILIAIQ3gQNAAtBASEIAkACQCACQVVqDgMAAQABC0F/QQEgAkEtRhshCAJAIAEoAgQiAiABKAJoRg0AIAUgAkEBajYCACACLQAAIQIMAQsgARCTBSECC0EAIQkCQAJAAkADQCACQSByIAlBnwhqLAAARw0BAkAgCUEGSw0AAkAgASgCBCICIAEoAmhGDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEJMFIQILIAlBAWoiCUEIRw0ADAILAAsCQCAJQQNGDQAgCUEIRg0BIANFDQIgCUEESQ0CIAlBCEYNAQsCQCABKQNwIgpCAFMNACAFIAUoAgBBf2o2AgALIANFDQAgCUEESQ0AIApCAFMhAQNAAkAgAQ0AIAUgBSgCAEF/ajYCAAsgCUF/aiIJQQNLDQALCyAEIAiyQwAAgH+UEMYFIARBCGopAwAhCyAEKQMAIQoMAgsCQAJAAkAgCQ0AQQAhCQNAIAJBIHIgCUHyGGosAABHDQECQCAJQQFLDQACQCABKAIEIgIgASgCaEYNACAFIAJBAWo2AgAgAi0AACECDAELIAEQkwUhAgsgCUEBaiIJQQNHDQAMAgsACwJAAkAgCQ4EAAEBAgELAkAgAkEwRw0AAkACQCABKAIEIgkgASgCaEYNACAFIAlBAWo2AgAgCS0AACEJDAELIAEQkwUhCQsCQCAJQV9xQdgA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BHMQrQUgAEEwIBQgEkEAEK0FIAAgDSASEKcFIABBICAMIA8gEUGAwABzEK0FDAELC0EAIQsMAwtBPSEWCxCXBCAWNgIAC0F/IQsLIAdB0ABqJAAgCwsZAAJAIAAtAABBIHENACABIAIgABDPBBoLC3QBA39BACEBAkAgACgCACwAABDaBA0AQQAPCwNAIAAoAgAhAkF/IQMCQCABQcyZs+YASw0AQX8gAiwAAEFQaiIDIAFBCmwiAWogAyABQf////8Hc0obIQMLIAAgAkEBajYCACADIQEgAiwAARDaBA0ACyADC7YEAAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAIAFBd2oOEgABAgUDBAYHCAkKCwwNDg8QERILIAIgAigCACIBQQRqNgIAIAAgASgCADYCAA8LIAIgAigCACIBQQRqNgIAIAAgATQCADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATUCADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATQCADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATUCADcDAA8LIAIgAigCAEEHakF4cSIBQQhqNgIAIAAgASkDADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATIBADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATMBADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATAAADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATEAADcDAA8LIAIgAigCAEEHakF4cSIBQQhqNgIAIAAgASkDADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATUCADcDAA8LIAIgAigCAEEHakF4cSIBQQhqNgIAIAAgASkDADcDAA8LIAIgAigCAEEHakF4cSIBQQhqNgIAIAAgASkDADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATQCADcDAA8LIAIgAigCACIBQQRqNgIAIAAgATUCADcDAA8LIAIgAigCAEEHakF4cSIBQQhqNgIAIAAgASsDADkDAA8LIAAgAiADEQMACws+AQF/AkAgAFANAANAIAFBf2oiASAAp0EPcUGg3w9qLQAAIAJyOgAAIABCD1YhAyAAQgSIIQAgAw0ACwsgAQs2AQF/AkAgAFANAANAIAFBf2oiASAAp0EHcUEwcjoAACAAQgdWIQIg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iP4nIgRBASABQQN2dCIBcQ0AQQAgBCABcjYCiP4nIAMhAQwBCyADKAIIIQELIAMgADYCCCABIAA2AgwgACADNgIMIAAgATYCCA8LQR8hAwJAIAFB////B0sNACABQQh2IgMgA0GA/j9qQRB2QQhxIgN0IgQgBEGA4B9qQRB2QQRxIgR0IgYgBkGAgA9qQRB2QQJxIgZ0QQ92IAMgBHIgBnJrIgNBAXQgASADQRVqdkEBcXJBHGohAwsgACADNgIcIABCADcCECADQQJ0QbiAKGohBAJAAkACQEEAKAKM/iciBkEBIAN0IgJxDQBBACAGIAJyNgKM/icgBCAANgIAIAAgBDYCGAwBCyABQQBBGSADQQF2ayADQR9GG3QhAyAEKAIAIQYDQCAGIgQoAgRBeHEgAUYNAiADQR12IQYgA0EBdCEDIAQgBkEEcWpBEGoiAigCACIGDQALIAIgADYCACAAIAQ2AhgLIAAgADYCDCAAIAA2AggPCyAEKAIIIgEgADYCDCAEIAA2AgggAEEANgIYIAAgBDYCDCAAIAE2AggLCwcAPwBBEHQLVAECf0EAKALc5w8iASAAQQNqQXxxIgJqIQACQAJAIAJFDQAgACABTQ0BCwJAIAAQvQVNDQAgABAcRQ0BC0EAIAA2AtznDyABDwsQlwRBMDYCAEF/C+gKAgR/BH4jAEHwAGsiBSQAIARC////////////AIMhCQJAAkACQCABUCIGIAJC////////////AIMiCkKAgICAgIDAgIB/fEKAgICAgIDAgIB/VCAKUBsNACADQgBSIAlCgICAgICAwICAf3wiC0KAgICAgIDAgIB/ViALQoCAgICAgMCAgH9RGw0BCwJAIAYgCkKAgICAgIDA//8AVCAKQoCAgICAgMD//wBRGw0AIAJCgICAgICAIIQhBCABIQMMAgsCQCADUCAJQoCAgICAgMD//wBUIAlCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCEEDAILAkAgASAKQoCAgICAgMD//wCFhEIAUg0AQoCAgICAgOD//wAgAiADIAGFIAQgAoVCgICAgICAgICAf4WEUCIGGyEEQgAgASAGGyEDDAILIAMgCUKAgICAgIDA//8AhYRQDQECQCABIAqEQgBSDQAgAyAJhEIAUg0CIAMgAYMhAyAEIAKDIQQMAgsgAyAJhFBFDQAgASEDIAIhBAwBCyADIAEgAyABViAJIApWIAkgClEbIgcbIQogBCACIAcbIglC////////P4MhCyACIAQgBxsiDEIwiKdB//8BcSEIAkAgCUIwiKdB//8BcSIGDQAgBUHgAGogCiALIAogCyALUCIGG3kgBkEGdK18pyIGQXFqEMAFQRAgBmshBiAFQegAaikDACELIAUpA2AhCgsgASADIAcbIQMgDEL///////8/gyEEAkAgCA0AIAVB0ABqIAMgBCADIAQgBFAiBxt5IAdBBnStfKciB0FxahDABUEQIAdrIQggBUHYAGopAwAhBCAFKQNQIQMLIARCA4YgA0I9iIRCgICAgICAgASEIQIgC0IDhiAKQj2IhCEEIANCA4YhASAJIAyFIQMCQCAGIAhGDQACQCAGIAhrIgdB/wBNDQBCACECQgEhAQwBCyAFQcAAaiABIAJBgAEgB2sQwAUgBUEwaiABIAIgBxDLBSAFKQMwIAUpA0AgBUHAAGpBCGopAwCEQgBSrYQhASAFQTBqQQhqKQMAIQILIARCgICAgICAgASEIQwgCkIDhiELAkACQCADQn9VDQBCACEDQgAhBCALIAGFIAwgAoWEUA0CIAsgAX0hCiAMIAJ9IAsgAVStfSIEQv////////8DVg0BIAVBIGogCiAEIAogBCAEUCIHG3kgB0EGdK18p0F0aiIHEMAFIAYgB2shBiAFQShqKQMAIQQgBSkDICEKDAELIAIgDHwgASALfCIKIAFUrXwiBEKAgICAgICACINQDQAgCkIBiCAEQj+GhCAKQgGDhCEKIAZBAWohBiAEQgGIIQQLIAlCgICAgICAgICAf4MhAQJAIAZB//8BSA0AIAFCgICAgICAwP//AIQhBEIAIQMMAQtBACEHAkACQCAGQQBMDQAgBiEHDAELIAVBEGogCiAEIAZB/wBqEMAFIAUgCiAEQQEgBmsQywUgBSkDACAFKQMQIAVBEGpBCGopAwCEQgBSrYQhCiAFQQhqKQMAIQQLIApCA4ggBEI9hoQhAyAHrUIwhiAEQgOIQv///////z+DhCABhCEEIAqnQQdxIQYCQAJAAkACQAJAEMkFDgMAAQIDCyAEIAMgBkEES618IgogA1StfCEEAkAgBkEERg0AIAohAwwDCyAEIApCAYMiASAKfCIDIAFUrXwhBAwDCyAEIAMgAUIAUiAGQQBHca18IgogA1StfCEEIAohAwwBCyAEIAMgAVAgBkEAR3GtfCIKIANUrXwhBCAKIQMLIAZFDQELEMoFGgsgACADNwMAIAAgBDcDCCAFQfAAaiQAC1MBAX4CQAJAIANBwABxRQ0AIAEgA0FAaq2GIQJCACEBDAELIANFDQAgAUHAACADa62IIAIgA60iBIaEIQIgASAEhiEBCyAAIAE3AwAgACACNwMIC+ABAgF/An5BASEEAkAgAEIAUiABQv///////////wCDIgVCgICAgICAwP//AFYgBUKAgICAgIDA//8AURsNACACQgBSIANC////////////AIMiBkKAgICAgIDA//8AViAGQoCAgICAgMD//wBRGw0AAkAgAiAAhCAGIAWEhFBFDQBBAA8LAkAgAyABg0IAUw0AQX8hBCAAIAJUIAEgA1MgASADURsNASAAIAKFIAEgA4WEQgBSDwtBfyEEIAAgAlYgASADVSABIANRGw0AIAAgAoUgASADhYRCAFIhBAsgBAvYAQIBfwJ+QX8hBAJAIABCAFIgAUL///////////8AgyIFQoCAgICAgMD//wBWIAVCgICAgICAwP//AFEbDQAgAkIAUiADQv///////////wCDIgZCgICAgICAwP//AFYgBkKAgICAgIDA//8AURsNAAJAIAIgAIQgBiAFhIRQRQ0AQQAPCwJAIAMgAYNCAFMNACAAIAJUIAEgA1MgASADURsNASAAIAKFIAEgA4WEQgBSDwsgACACViABIANVIAEgA1EbDQAgACAChSABIAOFhEIAUiEECyAEC98QAgV/Dn4jAEHQAmsiBSQAIARC////////P4MhCiACQv///////z+DIQsgBCAChUKAgICAgICAgIB/gyEMIARCMIinQf//AXEhBgJAAkACQCACQjCIp0H//wFxIgdBgYB+akGCgH5JDQBBACEIIAZBgYB+akGBgH5LDQELAkAgAVAgAkL///////////8AgyINQoCAgICAgMD//wBUIA1CgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEMDAILAkAgA1AgBEL///////////8AgyICQoCAgICAgMD//wBUIAJCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCEMIAMhAQwCCwJAIAEgDUKAgICAgIDA//8AhYRCAFINAAJAIAMgAkKAgICAgIDA//8AhYRQRQ0AQgAhAUKAgICAgIDg//8AIQwMAwsgDEKAgICAgIDA//8AhCEMQgAhAQwCCwJAIAMgAkKAgICAgIDA//8AhYRCAFINAEIAIQEMAgsCQCABIA2EQgBSDQBCgICAgICA4P//ACAMIAMgAoRQGyEMQgAhAQwCCwJAIAMgAoRCAFINACAMQoCAgICAgMD//wCEIQxCACEBDAILQQAhCAJAIA1C////////P1YNACAFQcACaiABIAsgASALIAtQIggbeSAIQQZ0rXynIghBcWoQwAVBECAIayEIIAVByAJqKQMAIQsgBSkDwAIhAQsgAkL///////8/Vg0AIAVBsAJqIAMgCiADIAogClAiCRt5IAlBBnStfKciCUFxahDABSAJIAhqQXBqIQggBUG4AmopAwAhCiAFKQOwAiEDCyAFQaACaiADQjGIIApCgICAgICAwACEIg5CD4aEIgJCAEKAgICAsOa8gvUAIAJ9IgRCABDNBSAFQZACakIAIAVBoAJqQQhqKQMAfUIAIARCABDNBSAFQYACaiAFKQOQAkI/iCAFQZACakEIaikDAEIBhoQiBEIAIAJCABDNBSAFQfABaiAEQgBCACAFQYACakEIaikDAH1CABDNBSAFQeABaiAFKQPwAUI/iCAFQfABakEIaikDAEIBhoQiBEIAIAJCABDNBSAFQdABaiAEQgBCACAFQeABakEIaikDAH1CABDNBSAFQcABaiAFKQPQAUI/iCAFQdABakEIaikDAEIBhoQiBEIAIAJCABDNBSAFQbABaiAEQgBCACAFQcABakEIaikDAH1CABDNBSAFQaABaiACQgAgBSkDsAFCP4ggBUGwAWpBCGopAwBCAYaEQn98IgRCABDNBSAFQZABaiADQg+GQgAgBEIAEM0FIAVB8ABqIARCAEIAIAVBoAFqQQhqKQMAIAUpA6ABIgogBUGQAWpBCGopAwB8IgIgClStfCACQgFWrXx9QgAQzQUgBUGAAWpCASACfUIAIARCABDNBSAIIAcgBmtqIQYCQAJAIAUpA3AiD0IBhiIQIAUpA4ABQj+IIAVBgAFqQQhqKQMAIhFCAYaEfCINQpmTf3wiEkIgiCICIAtCgICAgICAwACEIhNCAYYgAUI/iIQiFEIgiCIEfiILIAFCAYYiFUIgiCIKIAVB8ABqQQhqKQMAQgGGIA9CP4iEIBFCP4h8IA0gEFStfCASIA1UrXxCf3wiD0IgiCINfnwiECALVK0gECAPQv////8PgyILIBRC/////w+DIg9+fCIRIBBUrXwgDSAEfnwgCyAEfiIWIA8gDX58IhAgFlStQiCGIBBCIIiEfCARIBBCIIZ8IhAgEVStfCAQIBJC/////w+DIhIgD34iFiACIAp+fCIRIBZUrSARIAsgFUL+////D4MiFn58IhcgEVStfHwiESAQVK18IBEgEiAEfiIQIBYgDX58IgQgAiAPfnwiDSALIAp+fCILQiCIIAQgEFStIA0gBFStfCALIA1UrXxCIIaEfCIEIBFUrXwgBCAXIAIgFn4iAiASIAp+fCIKQiCIIAogAlStQiCGhHwiAiAXVK0gAiALQiCGfCACVK18fCICIARUrXwiBEL/////////AFYNACAFQdAAaiACIAQgAyAOEM0FIAFCMYYgBUHQAGpBCGopAwB9IAUpA1AiAUIAUq19IQ0gBkH+/wBqIQZCACABfSEKDAELIAVB4ABqIAJCAYggBEI/hoQiAiAEQgGIIgQgAyAOEM0FIAFCMIYgBUHgAGpBCGopAwB9IAUpA2AiCkIAUq19IQ0gBkH//wBqIQZCACAKfSEKIAEhFSATIRQLAkAgBkH//wFIDQAgDEKAgICAgIDA//8AhCEMQgAhAQwBCwJAAkAgBkEBSA0AIA1CAYYgCkI/iIQhDSAGrUIwhiAEQv///////z+DhCELIApCAYYhBAwBCwJAIAZBj39KDQBCACEBDAILIAVBwABqIAIgBEEBIAZrEMsFIAVBMGogFSAUIAZB8ABqEMAFIAVBIGogAyAOIAUpA0AiAiAFQcAAakEIaikDACILEM0FIAVBMGpBCGopAwAgBUEgakEIaikDAEIBhiAFKQMgIgFCP4iEfSAFKQMwIgQgAUIBhiIBVK19IQ0gBCABfSEECyAFQRBqIAMgDkIDQgAQzQUgBSADIA5CBUIAEM0FIAsgAiACQgGDIgEgBHwiBCADViANIAQgAVStfCIBIA5WIAEgDlEbrXwiAyACVK18IgIgAyACQoCAgICAgMD//wBUIAQgBSkDEFYgASAFQRBqQQhqKQMAIgJWIAEgAlEbca18IgIgA1StfCIDIAIgA0KAgICAgIDA//8AVCAEIAUpAwBWIAEgBUEIaikDACIEViABIARRG3GtfCIBIAJUrXwgDIQhDAsgACABNwMAIAAgDDcDCCAFQdACaiQACyAAAkBBACgC+IEoDQBBACABNgL8gShBACAANgL4gSgLC44CAgJ/A34jAEEQayICJAACQAJAIAG9IgRC////////////AIMiBUKAgICAgICAeHxC/////////+//AFYNACAFQjyGIQYgBUIEiEKAgICAgICAgDx8IQUMAQsCQCAFQoCAgICAgID4/wBUDQAgBEI8hiEGIARCBIhCgICAgICAwP//AIQhBQwBCwJAIAVQRQ0AQgAhBkIAIQUMAQsgAiAFQgAgBKdnQSBqIAVCIIinZyAFQoCAgIAQVBsiA0ExahDABSACQQhqKQMAQoCAgICAgMAAhUGM+AAgA2utQjCGhCEFIAIpAwAhBgsgACAGNwMAIAAgBSAEQoCAgICAgICAgH+DhDcDCCACQRBqJAAL4QECA38CfiMAQRBrIgIkAAJAAkAgAbwiA0H/////B3EiBEGAgIB8akH////3B0sNACAErUIZhkKAgICAgICAwD98IQVCACEGDAELAkAgBEGAgID8B0kNACADrUIZhkKAgICAgIDA//8AhCEFQgAhBgwBCwJAIAQNAEIAIQZCACEFDAELIAIgBK1CACAEZyIEQdEAahDABSACQQhqKQMAQoCAgICAgMAAhUGJ/wAgBGutQjCGhCEFIAIpAwAhBgsgACAGNwMAIAAgBSADQYCAgIB4ca1CIIaENwMIIAJBEGokAAuNAQICfwJ+IwBBEGsiAiQAAkACQCABDQBCACEEQgAhBQwBCyACIAEgAUEfdSIDcyADayIDrUIAIANnIgNB0QBqEMAFIAJBCGopAwBCgICAgICAwACFQZ6AASADa61CMIZ8IAFBgICAgHhxrUIghoQhBSACKQMAIQQLIAAgBDcDACAAIAU3AwggAkEQaiQAC3ICAX8CfiMAQRBrIgIkAAJAAkAgAQ0AQgAhA0IAIQQMAQsgAiABrUIAIAFnIgFB0QBqEMAFIAJBCGopAwBCgICAgICAwACFQZ6AASABa61CMIZ8IQQgAikDACEDCyAAIAM3AwAgACAENwMIIAJBEGokAAsEAEEACwQAQQALUwEBfgJAAkAgA0HAAHFFDQAgAiADQUBqrYghAUIAIQIMAQsgA0UNACACQcAAIANrrYYgASADrSIEiIQhASACIASIIQILIAAgATcDACAAIAI3AwgLnAsCBX8PfiMAQeAAayIFJAAgBEL///////8/gyEKIAQgAoVCgICAgICAgICAf4MhCyACQv///////z+DIgxCIIghDSAEQjCIp0H//wFxIQYCQAJAAkAgAkIwiKdB//8BcSIHQYGAfmpBgoB+SQ0AQQAhCCAGQYGAfmpBgYB+Sw0BCwJAIAFQIAJC////////////AIMiDkKAgICAgIDA//8AVCAOQoCAgICAgMD//wBRGw0AIAJCgICAgICAIIQhCwwCCwJAIANQIARC////////////AIMiAkKAgICAgIDA//8AVCACQoCAgICAgMD//wBRGw0AIARCgICAgICAIIQhCyADIQEMAgsCQCABIA5CgICAgICAwP//AIWEQgBSDQACQCADIAKEUEUNAEKAgICAgIDg//8AIQtCACEBDAMLIAtCgICAgICAwP//AIQhC0IAIQEMAgsCQCADIAJCgICAgICAwP//AIWEQgBSDQAgASAOhCECQgAhAQJAIAJQRQ0AQoCAgICAgOD//wAhCwwDCyALQoCAgICAgMD//wCEIQsMAgsCQCABIA6EQgBSDQBCACEBDAILAkAgAyAChEIAUg0AQgAhAQwCC0EAIQgCQCAOQv///////z9WDQAgBUHQAGogASAMIAEgDCAMUCIIG3kgCEEGdK18pyIIQXFqEMAFQRAgCGshCCAFQdgAaikDACIMQiCIIQ0gBSkDUCEBCyACQv///////z9WDQAgBUHAAGogAyAKIAMgCiAKUCIJG3kgCUEGdK18pyIJQXFqEMAFIAggCWtBEGohCCAFQcgAaikDACEKIAUpA0AhAwsgA0IPhiIOQoCA/v8PgyICIAFCIIgiBH4iDyAOQiCIIg4gAUL/////D4MiAX58IhBCIIYiESACIAF+fCISIBFUrSACIAxC/////w+DIgx+IhMgDiAEfnwiESAKQg+GIANCMYiEIhRC/////w+DIgMgAX58IgogEEIgiCAQIA9UrUIghoR8Ig8gAiANQoCABIQiEH4iFSAOIAx+fCINIBRCIIhCgICAgAiEIgIgAX58IhQgAyAEfnwiFkIghnwiF3whASAHIAZqIAhqQYGAf2ohBgJAAkAgAiAEfiIYIA4gEH58IgQgGFStIAQgAyAMfnwiDiAEVK18IAIgEH58IA4gESATVK0gCiARVK18fCIEIA5UrXwgAyAQfiIDIAIgDH58IgIgA1StQiCGIAJCIIiEfCAEIAJCIIZ8IgIgBFStfCACIBZCIIggDSAVVK0gFCANVK18IBYgFFStfEIghoR8IgQgAlStfCAEIA8gClStIBcgD1StfHwiAiAEVK18IgRCgICAgICAwACDUA0AIAZBAWohBgwBCyASQj+IIQMgBEIBhiACQj+IhCEEIAJCAYYgAUI/iIQhAiASQgGGIRIgAyABQgGGhCEBCwJAIAZB//8BSA0AIAtCgICAgICAwP//AIQhC0IAIQEMAQsCQAJAIAZBAEoNAAJAQQEgBmsiB0GAAUkNAEIAIQEMAwsgBUEwaiASIAEgBkH/AGoiBhDABSAFQSBqIAIgBCAGEMAFIAVBEGogEiABIAcQywUgBSACIAQgBxDLBSAFKQMgIAUpAxCEIAUpAzAgBUEwakEIaikDAIRCAFKthCESIAVBIGpBCGopAwAgBUEQakEIaikDAIQhASAFQQhqKQMAIQQgBSkDACECDAELIAatQjCGIARC////////P4OEIQQLIAQgC4QhCwJAIBJQIAFCf1UgAUKAgICAgICAgIB/URsNACALIAJCAXwiASACVK18IQsMAQsCQCASIAFCgICAgICAgICAf4WEQgBRDQAgAiEBDAELIAsgAiACQgGDfCIBIAJUrXwhCwsgACABNwMAIAAgCzcDCCAFQeAAaiQAC3UBAX4gACAEIAF+IAIgA358IANCIIgiAiABQiCIIgR+fCADQv////8PgyIDIAFC/////w+DIgF+IgVCIIggAyAEfnwiA0IgiHwgA0L/////D4MgAiABfnwiAUIgiHw3AwggACABQiCGIAVC/////w+DhDcDAAtIAQF/IwBBEGsiBSQAIAUgASACIAMgBEKAgICAgICAgIB/hRC/BSAFKQMAIQQgACAFQQhqKQMANwMIIAAgBDcDACAFQRBqJAAL5AMCAn8CfiMAQSBrIgIkAAJAAkAgAUL///////////8AgyIEQoCAgICAgMD/Q3wgBEKAgICAgIDAgLx/fFoNACAAQjyIIAFCBIaEIQQCQCAAQv//////////D4MiAEKBgICAgICAgAhUDQAgBEKBgICAgICAgMAAfCEFDAILIARCgICAgICAgIDAAHwhBSAAQoCAgICAgICACFINASAFIARCAYN8IQUMAQsCQCAAUCAEQoCAgICAgMD//wBUIARCgICAgICAwP//AFEbDQAgAEI8iCABQgSGhEL/////////A4NCgICAgICAgPz/AIQhBQwBC0KAgICAgICA+P8AIQUgBEL///////+//8MAVg0AQgAhBSAEQjCIpyIDQZH3AEkNACACQRBqIAAgAUL///////8/g0KAgICAgIDAAIQiBCADQf+If2oQwAUgAiAAIARBgfgAIANrEMsFIAIpAwAiBEI8iCACQQhqKQMAQgSGhCEFAkAgBEL//////////w+DIAIpAxAgAkEQakEIaikDAIRCAFKthCIEQoGAgICAgICACFQNACAFQgF8IQUMAQsgBEKAgICAgICAgAhSDQAgBUIBgyAFfCEFCyACQSBqJAAgBSABQoCAgICAgICAgH+DhL8LBQAQDgALBwAgACgCAAsJABDTBRDUBQALCQBB4OcPENEFC6EBAEEAQQA2AviBKCAAEABBACgC+IEoIQBBAEEANgL4gSgCQAJAIABBAUYNAEEAQQA2AviBKEGBAUHFzwBBABAHQQAoAviBKCEAQQBBADYC+IEoIABBAUcNAQtBABAKIQAQAhogABAEGkEAQQA2AviBKEGBAUGrFkEAEAdBACgC+IEoIQBBAEEANgL4gSggAEEBRw0AQQAQChoQAhoQ0gULAAsHACAAELkFCwcAIAAQ8QULAgALAgALCgAgABDWBRDVBQsKACAAENYFENUFCwoAIAAQ1gUQ1QULCgAgABDWBRDVBQsLACAAIAFBABDeBQswAAJAIAINACAAKAIEIAEoAgRGDwsCQCAAIAFHDQBBAQ8LIAAQ3wUgARDfBRCDBUULBwAgACgCBAuwAQECfyMAQcAAayIDJABBASEEAkAgACABQQAQ3gUNAEEAIQQgAUUNAEEAIQQgAUHU3w9BhOAPQQAQ4QUiAUUNACADQQhqQQRyQQBBNBCoBBogA0EBNgI4IANBfzYCFCADIAA2AhAgAyABNgIIIAEgA0EIaiACKAIAQQEgASgCACgCHBEHAAJAIAMoAiAiBEEBRw0AIAIgAygCGDYCAAsgBEEBRiEECyADQcAAaiQAIAQLzAIBA38jAEHAAGsiBCQAIAAoAgAi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byBzaG9ydABhc3NlcnQAaW5zZXJ0AHJlc3RhcnQAX19ibm90AGNvdW50AHByaW50AGNvZGVwb2ludABjb21tZW50AGNvbnN0YW50AHVsdABfX2x0AGxpbWl0AHJhd3NldABvZmZzZXQAcmF3Z2V0AGNvbGxlY3QAc2VsZWN0AGJ0AGZsb2F0AHZhcmlhYmxlLWxlbmd0aCBmb3JtYXQAcmVwZWF0AF9fY29uY2F0AHdyb25nIG51bWJlciBvZiBhcmd1bWVudHMAY29uc3RhbnRzAHRvbyBtYW55IHJlc3VsdHMAaXBhaXJzAF9fcGFpcnMAZnVuY3Rpb24gb3IgZXhwcmVzc2lvbiBuZWVkcyB0b28gbWFueSByZWdpc3RlcnMAX2NhbGxlcnMAc3BlY2lmaWVyICclJXEnIGNhbm5vdCBoYXZlIG1vZGlmaWVycwBsYWJlbHMvZ290b3MAc3RyaW5nIGNvbnRhaW5zIHplcm9zAGFjb3MAdG9vIG1hbnkgbmVzdGVkIGZ1bmN0aW9ucwB0b28gbWFueSB1cHZhbHVlcwBhdHRlbXB0IHRvIGNvbXBhcmUgdHdvICVzIHZhbHVlcwB0b28gbWFueSBjYXB0dXJlcwBjb3JlIGFuZCBsaWJyYXJ5IGhhdmUgaW5jb21wYXRpYmxlIG51bWVyaWMgdHlwZXMAY2h1bmsgaGFzIHRvbyBtYW55IGxpbmVzAGxvY2FsIHZhcmlhYmxlcwBvcGNvZGVzAGZpbmFsIHBvc2l0aW9uIG91dCBvZiBib3VuZHMAaW5pdGlhbCBwb3NpdGlvbiBvdXQgb2YgYm91bmRzAF9saWJzAGFicwBhdHRlbXB0IHRvICVzIGEgJXMgdmFsdWUlcwBAJXMAJXMgZXhwZWN0ZWQsIGdvdCAlcwBjYW5ub3QgJXMgJXMAJXMgbmVhciAlcwB0b28gbWFueSAlcyAobGltaXQgaXMgJWQpIGluICVzAGF0dGVtcHQgdG8gY29tcGFyZSAlcyB3aXRoICVzAGNhbm5vdCAlcyAlczogJXMAQ0FMTEVSX1JVTl9GQUlMICVzOiAlcwBMSUJfUlVOX0ZBSUwgJXM6ICVzAENBTExFUl9MT0FEX0ZBSUwgJXM6ICVzAElOSVRfQ1hYRVggc3RhZ2U9JWQ6ICVzACVzOiVkOiAlcwBDQUxMRVJfQ1hYRVg6ICVzAEVSUjogJXMAcXIAX19ieG9yAGZvciBpdGVyYXRvcgBzeW50YXggZXJyb3IAZmxvb3IAZm9yAF9fYm9yAF9fc2hyAGxvd2VyAGludmFsaWQgbG9uZyBzdHJpbmcgZGVsaW1pdGVyAHJzaV9zY29yZXIAdXBwZXIAY2FsbGVyAG1heGludGVnZXIAdG9pbnRlZ2VyAG1pbmludGVnZXIAb2JqZWN0IGxlbmd0aCBpcyBub3QgYW4gaW50ZWdlcgBsdWFfSW50ZWdlcgAlZC1ieXRlIGludGVnZXIgZG9lcyBub3QgZml0IGludG8gTHVhIEludGVnZXIAdG9udW1iZXIAbWFsZm9ybWVkIG51bWJlcgBsdWFfTnVtYmVyAGNpZHIAY2hhcgBfX2VxAF9fZGJxAGV4cABzdG9wACdfX25ld2luZGV4JyBjaGFpbiB0b28gbG9uZzsgcG9zc2libGUgbG9vcAAnX19pbmRleCcgY2hhaW4gdG9vIGxvbmc7IHBvc3NpYmxlIGxvb3AAZHVtcABzdGVwAHJlcABQcAAlczogJXAAcHJvdG8AZ290bwBhdHRlbXB0IHRvIGRpdmlkZSBieSB6ZXJvACdmb3InIHN0ZXAgaXMgemVybwBkbwBtYXJrZG93bgByZXR1cm4AY2hhcnBhdHRlcm4AbWlzc2luZyAnWycgYWZ0ZXIgJyUlZicgaW4gcGF0dGVybgB3YXJuAGpzb24AdGVybWluYXRlX2hhbmRsZXIgdW5leHBlY3RlZGx5IHRocmV3IGFuIGV4Y2VwdGlvbgBJbnN0cnVjdGlvbgBtYWluIGZ1bmN0aW9uAHVuYWJsZSB0byBkdW1wIGdpdmVuIGZ1bmN0aW9uAGNhbm5vdCB1c2UgJy4uLicgb3V0c2lkZSBhIHZhcmFyZyBmdW5jdGlvbgBudW1iZXIlcyBoYXMgbm8gaW50ZWdlciByZXByZXNlbnRhdGlvbgBudW1iZXIgaGFzIG5vIGludGVnZXIgcmVwcmVzZW50YXRpb24AcGVyZm9ybSBiaXR3aXNlIG9wZXJhdGlvbiBvbgBwZXJmb3JtIGFyaXRobWV0aWMgb24AYXNpbgBtaW4APXN0ZGluAG1haW4AcmVvcGVuAHJhd2xlbgBfX2xlbgB0aGVuAGF0YW4AbmFuAGJvb2xlYW4AYmlnbnVtAHZhbHVlIGhhcyBubyBsaXRlcmFsIGZvcm0AcmFuZG9tAF9fdW5tAHRyZ20Ac2V0c3RlcG11bABfX211bAB1bmV4cGVjdGVkIHN5bWJvbAB4bWwAeWFtbAB4cGNhbGwAX19jYWxsAHVudGlsAHRhYmxlIGluZGV4IGlzIG5pbABjZWlsAF9fc2hsAHJhd2VxdWFsAGluY3JlbWVudGFsAGdlbmVyYXRpb25hbABsb2NhbABnbG9iYWwAU2wAaG9vawBub3QgYSBiaW5hcnkgY2h1bmsAY29ycnVwdGVkIGNodW5rAHRydW5jYXRlZCBjaHVuawBjbmNoZWNrAG5vdCBlbm91Z2ggc3RhY2sAdG9vIG1hbnkgcmVzdWx0cyB0byB1bnBhY2sAYnJlYWsAcHNpAHBpAHRvbWxpbmkAanNvbnBhdGgAbWF0aABqc29ucGF0Y2gAZmxvYXQgZm9ybWF0IG1pc21hdGNoAGludGVnZXIgZm9ybWF0IG1pc21hdGNoAHZlcnNpb24gbWlzbWF0Y2gAJXMgc2l6ZSBtaXNtYXRjaABnbWF0Y2gAbG9nAGxleGljYWwgZWxlbWVudCB0b28gbG9uZwBjb250cm9sIHN0cnVjdHVyZSB0b28gbG9uZwBzdHJpbmcgc2xpY2UgdG9vIGxvbmcAcGdyb3V0aW5nAGludmFsaWQgb3JkZXIgZnVuY3Rpb24gZm9yIHNvcnRpbmcAX190b3N0cmluZwBiaW5hcnkgc3RyaW5nAGludmFsaWQgdXNlIG9mICclYycgaW4gcmVwbGFjZW1lbnQgc3RyaW5nAGJhZCBmb3JtYXQgZm9yIGNvbnN0YW50IHN0cmluZwB0YWJsZSBvciBzdHJpbmcAaW5pdGlhbCBwb3NpdGlvbiBvdXQgb2Ygc3RyaW5nAHVuZmluaXNoZWQgc3RyaW5nAGVycm9yIG9iamVjdCBpcyBub3QgYSBzdHJpbmcAcmVhZGVyIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGEgc3RyaW5nACdfX3Rvc3RyaW5nJyBtdXN0IHJldHVybiBhIHN0cmluZwBpc3J1bm5pbmcAZXJyb3IgaW4gZXJyb3IgaGFuZGxpbmcAYXJyYXkgdG9vIGJpZwBtZW1vcnkgYWxsb2NhdGlvbiBlcnJvcjogYmxvY2sgdG9vIGJpZwBkZWcAJS4xNGcAZ2V0IGxlbmd0aCBvZgBpbmYAc2VsZgBlbHNlaWYAb2ZmAG1vZGYAdmVyc2lvbiBtaXNtYXRjaDogYXBwLiBuZWVkcyAlZiwgTHVhIGNvcmUgcHJvdmlkZXMgJWYAcGFja3NpemUAc3RyaW5nIGxlbmd0aCBkb2VzIG5vdCBmaXQgaW4gZ2l2ZW4gc2l6ZQBzdHJpbmcgbG9uZ2VyIHRoYW4gZ2l2ZW4gc2l6ZQByZW1vdmUAdG9vIG1hbnkgZWxlbWVudHMgdG8gbW92ZQB0cnVlAHVwdmFsdWUAbm8gdmFsdWUAaW5pdGlhbCB2YWx1ZQB2YXJpYWJsZSAnJXMnIGdvdCBhIG5vbi1jbG9zYWJsZSB2YWx1ZQBpbml0aWFsIHBvc2l0aW9uIGlzIGEgY29udGludWF0aW9uIGJ5dGUAY29uY2F0ZW5hdGUAc2V0cGF1c2UAcmV2ZXJzZQBfX2Nsb3NlAGVsc2UAZmFsc2UAaW52YWxpZCBwYXR0ZXJuIGNhcHR1cmUAdW5maW5pc2hlZCBjYXB0dXJlAHR5cGUAaHRtbF9lc2NhcGUAX19uYW1lAHdoaWxlAGRvZmlsZQBsb2FkZmlsZQBzZXRtZXRhdGFibGUAZ2V0bWV0YXRhYmxlAF9fbWV0YXRhYmxlAGNhbm5vdCBjaGFuZ2UgYSBwcm90ZWN0ZWQgbWV0YXRhYmxlAHN0cmluZy9mdW5jdGlvbi90YWJsZQBuaWwgb3IgdGFibGUAX19sZQBodWdlAGZvcm1hdCByZXN1bHQgdG9vIGxhcmdlAGJ1ZmZlciB0b28gbGFyZ2UAcmVzdWx0aW5nIHN0cmluZyB0b28gbGFyZ2UAVVRGLTggdmFsdWUgdG9vIGxhcmdlAGRlY2ltYWwgZXNjYXBlIHRvbyBsYXJnZQBpbmRleCBvdXQgb2YgcmFuZ2UAdmFsdWUgb3V0IG9mIHJhbmdlAGJhc2Ugb3V0IG9mIHJhbmdlAGNvbGxlY3RnYXJiYWdlAGx0cmVlAF9fbW9kZQBpbnZhbGlkIFVURi04IGNvZGUAaW52YWxpZCBlc2NhcGUgc2VxdWVuY2UARWUAZm1vZABfX21vZABtZXRhbWV0aG9kAGRlc3RpbmF0aW9uIHdyYXAgYXJvdW5kAGZpbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGo9X2xpYnMuanNvbjsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPWouZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17YT0xLGI9J3gnLGM9e3RydWUsZmFsc2UsMi41fX0gZW5kOyBpZiBwLm9wPT0nZGVjb2RlJyB0aGVuIHJldHVybiAnZGVjb2RlLT4nLi5qLmVuY29kZShqLmRlY29kZShwLnYpKSBlbmQ7IHJldHVybiAnZW5jb2RlLT4nLi5qLmVuY29kZShwLnYgb3IgcCkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmNpZHI7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9JzE5Mi4xNjguMS4wLzI0J30gZW5kOyByZXR1cm4gJ2NpZHItPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5qc29ucGF0aDsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0neyJhIjp7ImIiOlt7ImMiOjF9LHsiYyI6Mn1dfX0nLGU9JyQuYS5iWypdLmMnfSBlbmQ7IHJldHVybiAnanAtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy54bWw7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9Jzxyb290IGF0dHI9IjEiPjxhPjE8L2E+PGI+Mi41PC9iPjwvcm9vdD4nfSBlbmQ7IHJldHVybiAneG1sLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuaHRtbF9lc2NhcGU7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9JzxhIGhyZWY9IngiPiAmICJxIicsb3A9J2VzY2FwZSd9IGVuZDsgcmV0dXJuICdodG1sLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMudG9tbGluaTsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0nW3NlY11cbm5hbWUgPSAieCJcbm4gPSAzXG5iID0gdHJ1ZScsb3A9J3RvbWwnfSBlbmQ7IHJldHVybiAndG9tbC0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnlhbWw7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9J2E6IDFcbmI6IFsxLCAyLCAzXVxuYzpcbiAgZDogdHJ1ZSd9IGVuZDsgcmV0dXJuICd5YW1sLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMucHNpOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0ncHNpJyxyYXdfZT17MSwyLDMsNCw1LDYsNyw4LDksMTB9LHJhd19hPXsyLDIsMyw0LDQsNSw2LDcsOCwxMn0sYmlucz01fSBlbmQ7IHJldHVybiAncHNpLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuanNvbnBhdGNoOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0nYXBwbHknLGRvYz0neyJhIjoxLCJiIjpbMSwyXX0nLHBhdGNoPSdbeyJvcCI6InJlcGxhY2UiLCJwYXRoIjoiL2EiLCJ2YWx1ZSI6OX1dJ30gZW5kOyByZXR1cm4gJ3BhdGNoLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuZW50aXR5OyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0nbWF0Y2gnLGE9J2pvaG4gc21pdGgnLGI9J2pvbiBzbWl0aCd9IGVuZDsgcmV0dXJuICdlbnRpdHkubWF0Y2gtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5yc2lfc2NvcmVyOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0nc2NvcmUnLGY9e2NyZWRpdF9zY29yZT03MjAsYmFsYW5jZV9yYXRpbz0wLjMsbW9udGhzX2FjdGl2ZT0yNCxpbnF1aXJpZXM9Mn19IGVuZDsgcmV0dXJuICdyc2kuc2NvcmUtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5sdHJlZTsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17cGF0aD0nYS5iLmMuZCcsb3A9J25sZXZlbCd9IGVuZDsgcmV0dXJuICdsdHJlZS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnBncm91dGluZzsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17b3A9J3Nob3J0ZXN0X3BhdGgnLGVkZ2VzPXt7c3JjPTEsdGd0PTIsdz0xfSx7c3JjPTIsdGd0PTMsdz0yfSx7c3JjPTEsdGd0PTMsdz0xMH0se3NyYz0zLHRndD00LHc9MX19LHNyYz0xLHRndD00fSBlbmQ7IHJldHVybiAnc2hvcnRlc3QoMS0+NCktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5zb3VuZGV4OyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXt2PSdSb2JlcnQnLG9wPSdzb3VuZGV4J30gZW5kOyByZXR1cm4gJ3NvdW5kZXgoJy4udG9zdHJpbmcocC52KS4uJyktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5jbmNoZWNrOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXt2PScxMTAxMDUxOTQ5MTIzMTAwMlgnLG9wPSdpZF9jYXJkJ30gZW5kOyByZXR1cm4gJ2NuY2hlY2soJy4udG9zdHJpbmcocC52KS4uJyktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy50cmdtOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0nc2ltJyxhPSdEdWNrREInLGI9J2R1Y2tkYid9IGVuZDsgcmV0dXJuICd0cmdtLicuLnAub3AuLicoJy4udG9zdHJpbmcocC5hKS4uJywnLi50b3N0cmluZyhwLmIpLi4nKS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmZ1enp5OyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0namFybycsYT0nbWFydGhhJyxiPSdtYXJodGEnfSBlbmQ7IHJldHVybiAnZnV6enkoJy4uKHAub3Agb3IgJ2xldicpLi4nLCAnLi50b3N0cmluZyhwLmEpLi4nLCcuLnRvc3RyaW5nKHAuYikuLicpLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMubWFya2Rvd247IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9JyMgVGl0bGVcblxucGFyYSAqKmJvbGQqKiBgY29kZWBcblxuLSBpdGVtMVxuLSBpdGVtMicsb3A9J3N0YXRzJ30gZW5kOyByZXR1cm4gJ21kKCcuLihwLm9wIG9yICdzdGF0cycpLi4nKS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnFyOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXt2PSdEdWNrREIrV0FTTScsb3A9J2luZm8nfSBlbmQ7IHJldHVybiAncXIoJy4uKHAub3Agb3IgJ2luZm8nKS4uJyktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5iYXNleHg7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdiYXNlODVfZW5jJyxoZXg9JzAwZTFmMCd9IGVuZDsgcmV0dXJuICdiYXNleHgoJy4uKHAub3Agb3IgJz8nKS4uJyktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5iaWdudW07IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdmYWN0JyxuPTI1fSBlbmQ7IHJldHVybiAnYmlnbnVtKCcuLihwLm9wIG9yICc/JykuLicpLT4nLi50b3N0cmluZyhmKHApKSBlbmQAX19iYW5kACVsbGQAZmllbGQAaGV4YWRlY2ltYWwgZGlnaXQgZXhwZWN0ZWQAZnVuY3Rpb24gYXJndW1lbnRzIGV4cGVjdGVkACVzIGV4cGVjdGVkAHZhbHVlIGV4cGVjdGVkACc9JyBvciAnaW4nIGV4cGVjdGVkADxuYW1lPiBvciAnLi4uJyBleHBlY3RlZAB0ZXJtaW5hdGVfaGFuZGxlciB1bmV4cGVjdGVkbHkgcmV0dXJuZWQAcmFuZG9tc2VlZABfX2FkZAByYWQAbG9hZAB0aHJlYWQAXCUwM2QAXCVkAElOSVRfVU5LTk9XTkVYIHN0YWdlPSVkAGludmFsaWQgY2FwdHVyZSBpbmRleCAlJSVkAGJyZWFrIG91dHNpZGUgbG9vcCBhdCBsaW5lICVkAGZ1bmN0aW9uIGF0IGxpbmUgJWQAbm8gdmlzaWJsZSBsYWJlbCAnJXMnIGZvciA8Z290bz4gYXQgbGluZSAlZABsYWJlbCAnJXMnIGFscmVhZHkgZGVmaW5lZCBvbiBsaW5lICVkAF9fZ2MAX19kYmMAZ3N1YgBfX3N1YgByYgByd2EAG0x1YQBsaWdodCB1c2VyZGF0YQAlYQBpbnRlZ3JhbCBzaXplICglZCkgb3V0IG9mIGxpbWl0cyBbMSwlZF0APVtDXQAiXQB4WABfRU5WACVVAC54WG5OAHRhYmxlIGluZGV4IGlzIE5hTgBfVkVSU0lPTgBOQU4AJUkAX0cASU5GAF9MT0FERUQAQwA9PwA8aW50ZWdlcj4APG51bWJlcj4APHN0cmluZz4APGVvZj4APG5hbWU+AD4+AH49AD49AD09ADw9ADw8ADo6AC0xZTk5OTkALTAxMjM0NTY3ODkAdXRmOABMdWEgNS40AGZvcm1hdCBhc2tzIGZvciBhbGlnbm1lbnQgbm90IHBvd2VyIG9mIDIALTAALSMwAC8vAF9HLgAtKyMwIDEyMzQ1Njc4OS4ALi4uAF4kKis/LihbJS0ALSsAX1VCT1gqACh0ZW1wb3JhcnkpAChDIHRlbXBvcmFyeSkAQ0FMTEVSX1VOS05PV05FWCAod2FzbSB0cmFwIC8gbm9uLWN4eCkAc3RhY2sgb3ZlcmZsb3cgKCVzKQAlczogYmFkIGJpbmFyeSBmb3JtYXQgKCVzKQBjYWxsaW5nICclcycgb24gYmFkIHNlbGYgKCVzKQBiYWQgYXJndW1lbnQgIyVkICglcykAYmFkIGFyZ3VtZW50ICMlZCB0byAnJXMnICglcykAYmFkICdmb3InICVzIChudW1iZXIgZXhwZWN0ZWQsIGdvdCAlcykAaW52YWxpZCByZXBsYWNlbWVudCB2YWx1ZSAoYSAlcykAKG51bGwpAChuaWwpACh2YXJhcmcpAGludmFsaWQgZm9ybWF0ICh0b28gbG9uZykAKG5vbi1zdHJpbmcpAChmb3Igc3RhdGUpAChubyBuYW1lKQA9KGxvYWQpAHRvbyBtYW55ICVzIChsaW1pdCBpcyAlZCkAJXMgZXhwZWN0ZWQgKHRvIGNsb3NlICVzIGF0IGxpbmUgJWQpAHVuZmluaXNoZWQgbG9uZyAlcyAoc3RhcnRpbmcgYXQgbGluZSAlZCkAKDAvMCkAYXR0ZW1wdCB0byBsb2FkIGEgJXMgY2h1bmsgKG1vZGUgaXMgJyVzJykAICglcyAnJXMnKQBtYWxmb3JtZWQgcGF0dGVybiAobWlzc2luZyBhcmd1bWVudHMgdG8gJyUlYicpAG1hbGZvcm1lZCBwYXR0ZXJuIChtaXNzaW5nICddJykAbWFsZm9ybWVkIHBhdHRlcm4gKGVuZHMgd2l0aCAnJSUnKQAgKABtaXNzaW5nICd9JwBtaXNzaW5nICd7JwB1bmZpbmlzaGVkIHN0cmluZyBmb3IgZm9ybWF0ICd6JwBpbnZhbGlkIGtleSB0byAnbmV4dCcAd3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byAnaW5zZXJ0JwBpbnZhbGlkIGNvbnZlcnNpb24gJyVzJyB0byAnZm9ybWF0JwBpbnZhbGlkIHZhbHVlICglcykgYXQgaW5kZXggJUkgaW4gdGFibGUgZm9yICdjb25jYXQnAGludmFsaWQgb3B0aW9uICclcycAPGdvdG8gJXM+IGF0IGxpbmUgJWQganVtcHMgaW50byB0aGUgc2NvcGUgb2YgbG9jYWwgJyVzJwB1bmtub3duIGF0dHJpYnV0ZSAnJXMnAGF0dGVtcHQgdG8gYXNzaWduIHRvIGNvbnN0IHZhcmlhYmxlICclcycAZXJyb3I6IHVua25vd24gbGliICclcycAYXR0ZW1wdCB0byAlcyBhICclcycgd2l0aCBhICclcycAaW52YWxpZCBjb252ZXJzaW9uIHNwZWNpZmljYXRpb246ICclcycAaW52YWxpZCBvcHRpb24gJyUlJWMnIHRvICdsdWFfcHVzaGZzdHJpbmcnAG1pc3Npbmcgc2l6ZSBmb3IgZm9ybWF0IG9wdGlvbiAnYycAaW52YWxpZCBmb3JtYXQgb3B0aW9uICclYycAaW52YWxpZCBuZXh0IG9wdGlvbiBmb3Igb3B0aW9uICdYJwAnPFwlZD4nAGF0dGVtcHQgdG8gcGVyZm9ybSAnbiUlMCcAW3N0cmluZyAiAGFzc2VydGlvbiBmYWlsZWQhAGVycm9yIGluIABMdWEgd2FybmluZzogACVzOiVkOiAALSswIAAtKyMwIAAgDAoNCQsALS0gQGxpYjogYmlnbnVtCi0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDku7vmhI/nsr7luqbmlbTmlbDov5DnrpfvvIjnuq8gTHVh77yM6Zu25L6d6LWW77yJ4oCU4oCU6KGlIER1Y2tEQiBCSUdOVU0g5LmY5rOV5Lii57K+5bqm55qE5Z2R77yaCi0tICAgICAgICBCSUdOVU0qQklHTlVNIOe7k+aenOexu+Wei+mAgOWMluS4uiBET1VCTEXvvIjlsL7mlbDkuKLlpLHvvInvvIznqI3lpKfnm7TmjqUgT3ZlcmZsb3cgaW4KLS0gICAgICAgIG11bHRpcGxpY2F0aW9uIG9mIElOVDEyOO+8iDEuNS54IOS4jiAyLjAuMCBMVFMg5a6e5rWL6KGM5Li65LiA6Ie077yJ44CC5pysIGxpYiDnlKgKLS0gICAgICAgIGJhc2UgMTBeNyBsaW1icyDlgZrnsr7noa7ljYHov5vliLblpKfmlbTmlbDvvJphZGQvc3ViL211bC9kaXZtb2QvcG93L21vZC9mYWN0L2NtcO+8jAotLSAgICAgICAg6L6T5YWl6L6T5Ye65Z2H5Li65Y2B6L+b5Yi25a2X56ym5Liy77yI5Y+v5bim6LSf5Y+377yJ77yMU1FMIOS+p+mbtueyvuW6puaNn+WkseOAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yJCi0tIEByZXF1aXJlczog5peg77yI57qvIEx1Ye+8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0KLS0g55So5rOV77yIbHVhaml0X3Mg5Y+M5b2i5oCB77yac3RydWN0IOWtl+mdoumHj+aIliBKU09OIOWtl+espuS4suWdh+WPr++8jGVudHJ5KCkg6Ieq6YCC6YWN77yJ77yaCi0tICAgU0VMRUNUIGx1YWppdF9zKCdiaWdudW0nLCB7J29wJzonbXVsJywKLS0gICAgICdhJzonMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwJywKLS0gICAgICdiJzonOTg3NjU0MzIxMDk4NzY1NDMyMTA5ODc2NTQzMjEwJ30pOwotLSAgIC0tIOKGkiB7InIiOiIxMjE5MzI2MzExMzcwMjE3OTUyMjYxODUwMzI3ODk5MzU2MDc1ODM4ODQwNzgwMzIyODM0NzI1NDA3MzAxNjk2MDcyOTAwIn0KLS0KLS0gICBvcCDliJfooajvvIhhL2Ig5Li65Y2B6L+b5Yi25pW05pWw5a2X56ym5Liy77ybZGl2IOS4uuaIquaWremZpOazle+8jG1vZCDnrKblj7fpmo/ooqvpmaTmlbDvvInvvJoKLS0gICAgIG11bCAgYSpiICAgICAgICDihpIge3I6Ii4uLiJ9Ci0tICAgICBhZGQgIGErYiAgICAgICAg4oaSIHtyOiIuLi4ifQotLSAgICAgc3ViICBhLWIgICAgICAgIOKGkiB7cjoiLi4uIn0KLS0gICAgIGRpdiAgYS9iICAgICAgICDihpIge3E6IuWVhiIsIG06IuS9meaVsCJ9Ci0tICAgICBtb2QgIGEgbW9kIGIgICAg4oaSIHtyOiIuLi4ifQotLSAgICAgcG93ICBhKipuICAgICAgIOKGkiB7cjoiLi4uIn3vvIhuIOS4uumdnui0n+aVtOaVsO+8jOasoeaVsOi1sOW5s+aWueS5mO+8iQotLSAgICAgZmFjdCBuISAgICAgICAgIOKGkiB7cjoiLi4uIn3vvIhuIOS4uumdnui0n+aVtOaVsO+8iQotLSAgICAgY21wICBhPD0+YiAgICAgIOKGkiB7cjotMXwwfDF9Ci0tCi0tIOmUmeivr+i/lOWbnu+8mnsic3RhdHVzIjoiRXJyb3IiLCJtZXNzYWdlIjouLi5977yI5LiN6Z2Z6buYIE5VTEzvvIkKLS0KLS0g6aqM6K+B6K6w5b2V77yIMjAyNi0xMC0yMiwgbHVhaml0IENMSSArIGR1Y2tkYiB2Mi4wLjAgRTJF77yM5LiOIFB5dGhvbiBpbnQg6YCQ5L2N5a+55ouN77yJ77yaCi0tICAgMzDkvY3DlzMw5L2NIOS4jiBQeXRob24g5a6M5YWo5LiA6Ie0IOKck++8iER1Y2tEQiBCSUdOVU0g5ZCM6L6T5YWlIE92ZXJmbG9377yJCi0tICAgMTIzNDU2Nzg5Kjk4NzY1NDMyMSA9IDEyMTkzMjYzMTExMjYzNTI2OSDinJPvvIhEdWNrREIgQklHTlVNIOS4ouaIkCAxLjIxOS4uLmUrMTfvvIkKLS0gICDpmo/mnLogNTAwIOe7hO+8iOKJpDgwIOS9jSDDlyDiiaQ4MCDkvY3vvIzlkKvotJ/mlbDvvIltdWwvYWRkL3N1YiDlr7nmi40gMCDlpLHphY0g4pyTCi0tICAgMTAwISAvIDIqKjI1NiAvIDfDtzMg5ZWG5L2ZIOS4jiBQeXRob24g5LiA6Ie0IOKckwotLQotLSDosIPnlKjmlrnms6jmhI/vvJpsdWFqaXRfcyDnmoTlj4LmlbDlgLzlv4XpobvkvKAqKuWtl+espuS4sioq77yIJ2EnOicxMjMuLi4n77yJ77yM5Lyg5pWw5a2X5a2X6Z2i6YePCi0tIOS8muWFiOiiq+Wuv+S4u+i9rCBET1VCTEXvvIzotoXov4cgMl41MyDlsLHlt7Lnu4/lnKjlhaXlj6PkuKLkuobnsr7luqbigJTigJTmnKwgbGliIOWPquS/neivgeWtl+espuS4sgotLSDlhaXlj6PlkI7nmoTnsr7noa7mgKfjgIIKCmxvY2FsIEJBU0UgPSAxMDAwMDAwMCAgICAgICAgICAtLSAxMF4377ya5LmY56evIDEwXjE0IDwgMl41M++8jOWPjOeyvuW6puWuieWFqApsb2NhbCBCQVNFX0RJR0lUUyA9IDcKCi0tID09PT09PT09PT09PSDmnoHnroAgSlNPTiBlbmNvZGXvvIjoh6rljIXlkKvvvIzkuI4gbGluYWxnLmx1YSDlkIzmrL7vvIkgPT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGpzb25fZW5jb2RlKHYpCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgICBpZiB2ID09IG1hdGguaHVnZSB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgICBpZiB2ID09IC1tYXRoLmh1Z2UgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyUuMTdnJywgdikKICBlbHNlaWYgdCA9PSAnc3RyaW5nJyB0aGVuCiAgICByZXR1cm4gJyInIC4uIHY6Z3N1YignWyVjIlxcXScsIGZ1bmN0aW9uKGMpCiAgICAgIGxvY2FsIG0gPSB7IFsnXG4nXSA9ICdcXG4nLCBbJ1xyJ10gPSAnXFxyJywgWydcdCddID0gJ1xcdCcsIFsnIiddID0gJ1xcIicsIFsnXFwnXSA9ICdcXFxcJyB9CiAgICAgIHJldHVybiBtW2NdIG9yIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBjOmJ5dGUoKSkKICAgIGVuZCkgLi4gJyInCiAgZWxzZWlmIHQgPT0gJ2Jvb2xlYW4nIHRoZW4KICAgIHJldHVybiB2IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJwogIGVsc2VpZiB0ID09ICduaWwnIHRoZW4KICAgIHJldHVybiAnbnVsbCcKICBlbHNlaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGxvY2FsIG4gPSAjdgogICAgaWYgbiA+IDAgdGhlbgogICAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICAgIGZvciBpID0gMSwgbiBkbyBwYXJ0c1tpXSA9IGpzb25fZW5jb2RlKHZbaV0pIGVuZAogICAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICAgIGVuZAogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIGssIHZhbCBpbiBwYWlycyh2KSBkbwogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IGpzb25fZW5jb2RlKGspIC4uICc6JyAuLiBqc29uX2VuY29kZSh2YWwpCiAgICBlbmQKICAgIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX2RlY29kZShzKQogIGlmIHR5cGUocykgfj0gJ3N0cmluZycgdGhlbiByZXR1cm4gcyBlbmQKICBsb2NhbCBwb3MgPSAxCiAgbG9jYWwgZnVuY3Rpb24gc2tpcHdzKCkKICAgIHdoaWxlIHBvcyA8PSAjcyBhbmQgczpzdWIocG9zLCBwb3MpOm1hdGNoKCclcycpIGRvIHBvcyA9IHBvcyArIDEgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gcGFyc2UoKQogICAgc2tpcHdzKCkKICAgIGxvY2FsIGMgPSBzOnN1Yihwb3MsIHBvcykKICAgIGlmIGMgPT0gJ3snIHRoZW4KICAgICAgcG9zID0gcG9zICsgMQogICAgICBsb2NhbCB0ID0ge30KICAgICAgc2tpcHdzKCkKICAgICAgaWYgczpzdWIocG9zLCBwb3MpID09ICd9JyB0aGVuIHBvcyA9IHBvcyArIDEgcmV0dXJuIHQgZW5kCiAgICAgIHdoaWxlIHRydWUgZG8KICAgICAgICBsb2NhbCBrID0gcGFyc2UoKQogICAgICAgIHNraXB3cygpCiAgICAgICAgaWYgczpzdWIocG9zLCBwb3MpIH49ICc6JyB0aGVuIHJldHVybiBuaWwgZW5kCiAgICAgICAgcG9zID0gcG9zICsgMQogICAgICAgIHRba10gPSBwYXJzZSgpCiAgICAgICAgc2tpcHdzKCkKICAgICAgICBsb2NhbCBjYyA9IHM6c3ViKHBvcywgcG9zKQogICAgICAgIGlmIGNjID09ICcsJyB0aGVuIHBvcyA9IHBvcyArIDEKICAgICAgICBlbHNlaWYgY2MgPT0gJ30nIHRoZW4gcG9zID0gcG9zICsgMSBicmVhawogICAgICAgIGVsc2UgcmV0dXJuIG5pbCBlbmQKICAgICAgZW5kCiAgICAgIHJldHVybiB0CiAgICBlbHNlaWYgYyA9PSAnWycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGxvY2FsIHQgPSB7fQogICAgICBza2lwd3MoKQogICAgICBpZiBzOnN1Yihwb3MsIHBvcykgPT0gJ10nIHRoZW4gcG9zID0gcG9zICsgMSByZXR1cm4gdCBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHRbI3QgKyAxXSA9IHBhcnNlKCkKICAgICAgICBza2lwd3MoKQogICAgICAgIGxvY2FsIGNjID0gczpzdWIocG9zLCBwb3MpCiAgICAgICAgaWYgY2MgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICAgIGVsc2VpZiBjYyA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxIGJyZWFrCiAgICAgICAgZWxzZSByZXR1cm4gbmlsIGVuZAogICAgICBlbmQKICAgICAgcmV0dXJuIHQKICAgIGVsc2VpZiBjID09ICciJyB0aGVuCiAgICAgIHBvcyA9IHBvcyArIDEKICAgICAgbG9jYWwgb3V0ID0ge30KICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIGxvY2FsIGNoID0gczpzdWIocG9zLCBwb3MpCiAgICAgICAgaWYgY2ggPT0gJyInIHRoZW4gcG9zID0gcG9zICsgMSBicmVhayBlbmQKICAgICAgICBpZiBjaCA9PSAnXFwnIHRoZW4KICAgICAgICAgIGxvY2FsIG54dCA9IHM6c3ViKHBvcyArIDEsIHBvcyArIDEpCiAgICAgICAgICBpZiBueHQgPT0gJ24nIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcbicKICAgICAgICAgIGVsc2VpZiBueHQgPT0gJ3QnIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcdCcKICAgICAgICAgIGVsc2VpZiBueHQgPT0gJ3InIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdccicKICAgICAgICAgIGVsc2VpZiBueHQgPT0gJ1xcJyB0aGVuIG91dFsjb3V0ICsgMV0gPSAnXFwnCiAgICAgICAgICBlbHNlaWYgbnh0ID09ICciJyB0aGVuIG91dFsjb3V0ICsgMV0gPSAnIicKICAgICAgICAgIGVsc2Ugb3V0WyNvdXQgKyAxXSA9IG54dCBlbmQKICAgICAgICAgIHBvcyA9IHBvcyArIDEKICAgICAgICBlbHNlCiAgICAgICAgICBvdXRbI291dCArIDFdID0gY2gKICAgICAgICBlbmQKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGVuZAogICAgICByZXR1cm4gdGFibGUuY29uY2F0KG91dCkKICAgIGVsc2VpZiBjID09ICd0JyB0aGVuIHBvcyA9IHBvcyArIDQgcmV0dXJuIHRydWUKICAgIGVsc2VpZiBjID09ICdmJyB0aGVuIHBvcyA9IHBvcyArIDUgcmV0dXJuIGZhbHNlCiAgICBlbHNlaWYgYyA9PSAnbicgdGhlbiBwb3MgPSBwb3MgKyA0IHJldHVybiBuaWwKICAgIGVsc2UKICAgICAgbG9jYWwgYiwgZSA9IHM6ZmluZCgnWy0lZCUuZUUrXSsnLCBwb3MpCiAgICAgIGlmIG5vdCBiIHRoZW4gcmV0dXJuIG5pbCBlbmQKICAgICAgbG9jYWwgbnVtID0gdG9udW1iZXIoczpzdWIoYiwgZSkpCiAgICAgIHBvcyA9IGUgKyAxCiAgICAgIHJldHVybiBudW0KICAgIGVuZAogIGVuZAogIHJldHVybiBwYXJzZSgpCmVuZAoKLS0gPT09PT09PT09PT09IOWkp+aVtOaVsOaguOW/g++8mntzaWduPS0xfDEsIGQ9e2xpbWJzLi4u5bCP56uvLCBiYXNlIDFlN319ID09PT09PT09PT09PQoKbG9jYWwgZnVuY3Rpb24gbm9ybSh4KSAgLS0g5Y676auY5L2N6Zu277yb5YWo6Zu2IOKGkiBzaWduPTEg5Y2VIGxpbWIgMAogIHdoaWxlICN4LmQgPiAxIGFuZCB4LmRbI3guZF0gPT0gMCBkbyB4LmRbI3guZF0gPSBuaWwgZW5kCiAgaWYgI3guZCA9PSAxIGFuZCB4LmRbMV0gPT0gMCB0aGVuIHguc2lnbiA9IDEgZW5kCiAgcmV0dXJuIHgKZW5kCgpsb2NhbCBmdW5jdGlvbiBiaWdfZnJvbV9zdHJpbmcocykKICBpZiB0eXBlKHMpID09ICdudW1iZXInIHRoZW4gcyA9IHN0cmluZy5mb3JtYXQoJyVkJywgcykgZW5kICAtLSDiiaQyXjUzIOaJjeWuieWFqAogIGlmIHR5cGUocykgfj0gJ3N0cmluZycgb3Igbm90IHM6bWF0Y2goJ15bLStdPyVkKyQnKSB0aGVuCiAgICByZXR1cm4gbmlsLCAnaW52YWxpZCBpbnRlZ2VyIHN0cmluZzogJyAuLiB0b3N0cmluZyhzKQogIGVuZAogIGxvY2FsIHNpZ24gPSAxCiAgcyA9IHM6Z3N1YignXlstK10nLCBmdW5jdGlvbihjKSBpZiBjID09ICctJyB0aGVuIHNpZ24gPSAtMSBlbmQgcmV0dXJuICcnIGVuZCkKICBzID0gczpnc3ViKCdeMCsnLCAnJykgb3IgJycKICBpZiBzID09ICcnIHRoZW4gcyA9ICcwJyBlbmQKICBsb2NhbCBkID0ge30KICAtLSDku47kvY7kvY3otbfmr48gNyDkvY3kuIDkuKogbGltYgogIGxvY2FsIGkgPSAjcwogIHdoaWxlIGkgPiAwIGRvCiAgICBsb2NhbCBsbyA9IGkgLSBCQVNFX0RJR0lUUyArIDEKICAgIGlmIGxvIDwgMSB0aGVuIGxvID0gMSBlbmQKICAgIGRbI2QgKyAxXSA9IHRvbnVtYmVyKHM6c3ViKGxvLCBpKSkKICAgIGkgPSBsbyAtIDEKICBlbmQKICByZXR1cm4gbm9ybSh7IHNpZ24gPSBzaWduLCBkID0gZCB9KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGJpZ190b19zdHJpbmcoeCkKICBsb2NhbCBoaSA9IHN0cmluZy5mb3JtYXQoJyVkJywgeC5kWyN4LmRdKQogIGxvY2FsIHBhcnRzID0geyB4LnNpZ24gPCAwIGFuZCAnLScgb3IgJycsIGhpIH0KICBmb3IgaSA9ICN4LmQgLSAxLCAxLCAtMSBkbwogICAgcGFydHNbI3BhcnRzICsgMV0gPSBzdHJpbmcuZm9ybWF0KCclMDdkJywgeC5kW2ldKQogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQocGFydHMpCmVuZAoKbG9jYWwgZnVuY3Rpb24gaXNfemVybyh4KSByZXR1cm4gI3guZCA9PSAxIGFuZCB4LmRbMV0gPT0gMCBlbmQKCmxvY2FsIGZ1bmN0aW9uIHVjbXAoYSwgYikgIC0tIOe7neWvueWAvOavlOi+gwogIGlmICNhLmQgfj0gI2IuZCB0aGVuIHJldHVybiAjYS5kIDwgI2IuZCBhbmQgLTEgb3IgMSBlbmQKICBmb3IgaSA9ICNhLmQsIDEsIC0xIGRvCiAgICBpZiBhLmRbaV0gfj0gYi5kW2ldIHRoZW4gcmV0dXJuIGEuZFtpXSA8IGIuZFtpXSBhbmQgLTEgb3IgMSBlbmQKICBlbmQKICByZXR1cm4gMAplbmQKCmxvY2FsIGZ1bmN0aW9uIHVhZGQoYSwgYikgIC0tIHxhfCt8YnwKICBsb2NhbCBkLCBjYXJyeSA9IHt9LCAwCiAgbG9jYWwgbiA9IG1hdGgubWF4KCNhLmQsICNiLmQpCiAgZm9yIGkgPSAxLCBuIGRvCiAgICBsb2NhbCB0ID0gKGEuZFtpXSBvciAwKSArIChiLmRbaV0gb3IgMCkgKyBjYXJyeQogICAgaWYgdCA+PSBCQVNFIHRoZW4gZFtpXSA9IHQgLSBCQVNFIGNhcnJ5ID0gMSBlbHNlIGRbaV0gPSB0IGNhcnJ5ID0gMCBlbmQKICBlbmQKICBpZiBjYXJyeSA+IDAgdGhlbiBkWyNkICsgMV0gPSBjYXJyeSBlbmQKICByZXR1cm4geyBzaWduID0gMSwgZCA9IGQgfQplbmQKCmxvY2FsIGZ1bmN0aW9uIHVzdWIoYSwgYikgIC0tIHxhfC18YnzvvIzopoHmsYIgfGF8Pj18YnwKICBsb2NhbCBkLCBib3Jyb3cgPSB7fSwgMAogIGZvciBpID0gMSwgI2EuZCBkbwogICAgbG9jYWwgdCA9IGEuZFtpXSAtIChiLmRbaV0gb3IgMCkgLSBib3Jyb3cKICAgIGlmIHQgPCAwIHRoZW4gZFtpXSA9IHQgKyBCQVNFIGJvcnJvdyA9IDEgZWxzZSBkW2ldID0gdCBib3Jyb3cgPSAwIGVuZAogIGVuZAogIHJldHVybiBub3JtKHsgc2lnbiA9IDEsIGQgPSBkIH0pCmVuZAoKbG9jYWwgZnVuY3Rpb24gYmlnX2FkZChhLCBiKQogIGlmIGEuc2lnbiA9PSBiLnNpZ24gdGhlbgogICAgbG9jYWwgciA9IHVhZGQoYSwgYikgci5zaWduID0gYS5zaWduIHJldHVybiBub3JtKHIpCiAgZW5kCiAgbG9jYWwgYyA9IHVjbXAoYSwgYikKICBpZiBjID09IDAgdGhlbiByZXR1cm4geyBzaWduID0gMSwgZCA9IHsgMCB9IH0gZW5kCiAgaWYgYyA+IDAgdGhlbgogICAgbG9jYWwgciA9IHVzdWIoYSwgYikgci5zaWduID0gYS5zaWduIHJldHVybiByCiAgZWxzZQogICAgbG9jYWwgciA9IHVzdWIoYiwgYSkgci5zaWduID0gYi5zaWduIHJldHVybiByCiAgZW5kCmVuZAoKbG9jYWwgZnVuY3Rpb24gYmlnX25lZyhhKSByZXR1cm4gaXNfemVybyhhKSBhbmQgYSBvciB7IHNpZ24gPSAtYS5zaWduLCBkID0gYS5kIH0gZW5kCmxvY2FsIGZ1bmN0aW9uIGJpZ19zdWIoYSwgYikgcmV0dXJuIGJpZ19hZGQoYSwgYmlnX25lZyhiKSkgZW5kCgpsb2NhbCBmdW5jdGlvbiBiaWdfbXVsKGEsIGIpCiAgaWYgaXNfemVybyhhKSBvciBpc196ZXJvKGIpIHRoZW4gcmV0dXJuIHsgc2lnbiA9IDEsIGQgPSB7IDAgfSB9IGVuZAogIGxvY2FsIGQgPSB7fQogIGZvciBpID0gMSwgI2EuZCArICNiLmQgZG8gZFtpXSA9IDAgZW5kCiAgZm9yIGkgPSAxLCAjYS5kIGRvCiAgICBsb2NhbCBjYXJyeSA9IDAKICAgIGxvY2FsIGFpID0gYS5kW2ldCiAgICBmb3IgaiA9IDEsICNiLmQgZG8KICAgICAgLS0gdCDiiaQgKDFlNy0xKSArICgxZTctMSnCtygxZTctMSkgKyAoMWU3LTEpIDwgMWUxNO+8jOWPjOeyvuW6pueyvuehrgogICAgICBsb2NhbCB0ID0gZFtpICsgaiAtIDFdICsgYWkgKiBiLmRbal0gKyBjYXJyeQogICAgICBkW2kgKyBqIC0gMV0gPSB0ICUgQkFTRQogICAgICBjYXJyeSA9IG1hdGguZmxvb3IodCAvIEJBU0UpCiAgICBlbmQKICAgIC0tIOWwviBjYXJyeSDov5vkvY3lj6/og73orqkgZFtpKyNiLmRdIOKJpSBCQVNF77yM6aG76L+e6ZSB5b2S5LiA5YyWCiAgICBsb2NhbCBrID0gaSArICNiLmQKICAgIGRba10gPSAoZFtrXSBvciAwKSArIGNhcnJ5CiAgICB3aGlsZSBkW2tdID49IEJBU0UgZG8KICAgICAgZFtrXSA9IGRba10gLSBCQVNFCiAgICAgIGsgPSBrICsgMQogICAgICBkW2tdID0gKGRba10gb3IgMCkgKyAxCiAgICBlbmQKICBlbmQKICByZXR1cm4gbm9ybSh7IHNpZ24gPSBhLnNpZ24gKiBiLnNpZ24sIGQgPSBkIH0pCmVuZAoKLS0g5oiq5pat6Zmk5rOV77ya6L+U5ZueICjllYYsIOS9meaVsCnvvIznrKblj7for63kuYnlkIwgQy9MdWHvvIjkvZnmlbDnrKblj7fpmo/ooqvpmaTmlbDvvIkKbG9jYWwgZnVuY3Rpb24gYmlnX2Rpdm1vZChhLCBiKQogIGlmIGlzX3plcm8oYikgdGhlbiByZXR1cm4gbmlsLCAnZGl2aXNpb24gYnkgemVybycgZW5kCiAgaWYgdWNtcChhLCBiKSA8IDAgdGhlbiByZXR1cm4geyBzaWduID0gMSwgZCA9IHsgMCB9IH0sIGEgZW5kCiAgLS0g6YCQIGxpbWIg5ZWG5L2N5Lyw6K6hICsg57K+5YyW77yIbGltYiDnuqfplb/pmaTvvIxiYXNlIDFlN++8iQogIGxvY2FsIHEgPSB7IHNpZ24gPSAxLCBkID0ge30gfQogIGxvY2FsIHIgPSB7IHNpZ24gPSAxLCBkID0geyAwIH0gfQogIGZvciBpID0gI2EuZCwgMSwgLTEgZG8KICAgIC0tIHIgPSByKkJBU0UgKyBhLmRbaV0KICAgIGlmIGlzX3plcm8ocikgdGhlbiByLmQgPSB7IGEuZFtpXSB9IGVsc2UgdGFibGUuaW5zZXJ0KHIuZCwgMSwgYS5kW2ldKSByID0gbm9ybShyKSBlbmQKICAgIC0tIOS8sOiuoeWVhuS9je+8mnIgLyBi77yIYiDmnIDpq5ggbGltYiDiiaUgMSDml7bkvLDorqHnlKjmta7ngrnliJ3lgLzlho3nsr7ljJbvvIkKICAgIGxvY2FsIGxvLCBoaSA9IDAsIEJBU0UgLSAxCiAgICB3aGlsZSBsbyA8IGhpIGRvCiAgICAgIGxvY2FsIG1pZCA9IG1hdGguZmxvb3IoKGxvICsgaGkgKyAxKSAvIDIpCiAgICAgIGxvY2FsIHByb2JlID0geyBzaWduID0gMSwgZCA9IHsgbWlkIH0gfQogICAgICBpZiB1Y21wKGJpZ19tdWwoYiwgcHJvYmUpLCByKSA8PSAwIHRoZW4gbG8gPSBtaWQgZWxzZSBoaSA9IG1pZCAtIDEgZW5kCiAgICBlbmQKICAgIHEuZFtpXSA9IGxvCiAgICBpZiBsbyA+IDAgdGhlbiByID0gdXN1YihyLCBiaWdfbXVsKGIsIHsgc2lnbiA9IDEsIGQgPSB7IGxvIH0gfSkpIGVuZAogIGVuZAogIHEgPSBub3JtKHEpCiAgciA9IG5vcm0ocikKICBxLnNpZ24gPSBhLnNpZ24gKiBiLnNpZ24KICBpZiBpc196ZXJvKHEpIHRoZW4gcS5zaWduID0gMSBlbmQKICByLnNpZ24gPSBhLnNpZ24gIC0tIOS9meaVsOespuWPt+maj+iiq+mZpOaVsAogIGlmIGlzX3plcm8ocikgdGhlbiByLnNpZ24gPSAxIGVuZAogIHJldHVybiBxLCByCmVuZAoKbG9jYWwgZnVuY3Rpb24gYmlnX3BvdyhhLCBuKSAgLS0gbiDiiaUgMCDmlbTmlbDvvIjmma7pgJrmlbTmlbDvvIkKICBsb2NhbCByZXN1bHQgPSB7IHNpZ24gPSAxLCBkID0geyAxIH0gfQogIGxvY2FsIGJhc2UgPSBhCiAgd2hpbGUgbiA+IDAgZG8KICAgIGlmIG4gJSAyID09IDEgdGhlbiByZXN1bHQgPSBiaWdfbXVsKHJlc3VsdCwgYmFzZSkgZW5kCiAgICBiYXNlID0gYmlnX211bChiYXNlLCBiYXNlKQogICAgbiA9IG1hdGguZmxvb3IobiAvIDIpCiAgZW5kCiAgcmV0dXJuIHJlc3VsdAplbmQKCmxvY2FsIGZ1bmN0aW9uIGJpZ19jbXAoYSwgYikKICBpZiBhLnNpZ24gfj0gYi5zaWduIHRoZW4gcmV0dXJuIGEuc2lnbiA8IGIuc2lnbiBhbmQgLTEgb3IgMSBlbmQKICBsb2NhbCBjID0gdWNtcChhLCBiKQogIHJldHVybiBhLnNpZ24gPiAwIGFuZCBjIG9yIC1jCmVuZAoKLS0gPT09PT09PT09PT09IG9wIOWIhuWPkSA9PT09PT09PT09PT0KCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2ludCh2LCBuYW1lKQogIGlmIHR5cGUodikgPT0gJ251bWJlcicgdGhlbgogICAgaWYgdiB+PSBtYXRoLmZsb29yKHYpIHRoZW4gcmV0dXJuIG5pbCwgbmFtZSAuLiAnIG11c3QgYmUgYW4gaW50ZWdlcicgZW5kCiAgICByZXR1cm4gdgogIGVuZAogIGlmIHR5cGUodikgPT0gJ3N0cmluZycgYW5kIHY6bWF0Y2goJ15bLStdPyVkKyQnKSB0aGVuCiAgICByZXR1cm4gdG9udW1iZXIodikKICBlbmQKICByZXR1cm4gbmlsLCBuYW1lIC4uICcgbXVzdCBiZSBhbiBpbnRlZ2VyIChnb3QgJyAuLiB0b3N0cmluZyh2KSAuLiAnKScKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICAtLSDmqKHlnZfooajliIblj5Hlj6rorqQgLnJ1bu+8mkpTT04g5a2X56ym5Liy5Y+C5pWw5Zyo5q2k6Ieq6Kej56CB77yIZW50cnkg55qE5YWc5bqV5ZCM5qC35L+d55WZ77yJCiAgaWYgdHlwZShwKSA9PSAnc3RyaW5nJyB0aGVuCiAgICBsb2NhbCBvaywgZGVjb2RlZCA9IHBjYWxsKGpzb25fZGVjb2RlLCBwKQogICAgaWYgbm90IG9rIG9yIHR5cGUoZGVjb2RlZCkgfj0gJ3RhYmxlJyB0aGVuCiAgICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnYmFkIGpzb24gcGFyYW1zOiAnIC4uIHRvc3RyaW5nKHApIH0pCiAgICBlbmQKICAgIHAgPSBkZWNvZGVkCiAgZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAncGFyYW1zIG11c3QgYmUgYSB0YWJsZS9zdHJ1Y3QnIH0pCiAgZW5kCiAgbG9jYWwgb3AgPSBwLm9wCiAgaWYgb3AgPT0gbmlsIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnbWlzc2luZyBvcCcgfSkKICBlbmQKCiAgaWYgb3AgPT0gJ2ZhY3QnIHRoZW4KICAgIGxvY2FsIG4sIGVyciA9IHBhcnNlX2ludChwLm4sICduJykKICAgIGlmIG5vdCBuIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKHsgc3RhdHVzID0gJ0Vycm9yJywgbWVzc2FnZSA9IGVyciB9KSBlbmQKICAgIGlmIG4gPCAwIG9yIG4gPiAyMDAwMCB0aGVuCiAgICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnbiBvdXQgb2YgcmFuZ2UgWzAsMjAwMDBdOiAnIC4uIG4gfSkKICAgIGVuZAogICAgbG9jYWwgciA9IHsgc2lnbiA9IDEsIGQgPSB7IDEgfSB9CiAgICBmb3IgaSA9IDIsIG4gZG8gciA9IGJpZ19tdWwociwgeyBzaWduID0gMSwgZCA9IHsgaSB9IH0pIGVuZAogICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgciA9IGJpZ190b19zdHJpbmcocikgfSkKICBlbmQKCiAgaWYgb3AgPT0gJ3BvdycgdGhlbgogICAgbG9jYWwgbiwgZXJyID0gcGFyc2VfaW50KHAubiwgJ24nKQogICAgaWYgbm90IG4gdGhlbiByZXR1cm4ganNvbl9lbmNvZGUoeyBzdGF0dXMgPSAnRXJyb3InLCBtZXNzYWdlID0gZXJyIH0pIGVuZAogICAgaWYgbiA8IDAgb3IgbiA+IDEwMDAwIHRoZW4KICAgICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgc3RhdHVzID0gJ0Vycm9yJywgbWVzc2FnZSA9ICduIG91dCBvZiByYW5nZSBbMCwxMDAwMF06ICcgLi4gbiB9KQogICAgZW5kCiAgICBsb2NhbCBhLCBhZXJyID0gYmlnX2Zyb21fc3RyaW5nKHAuYSkKICAgIGlmIG5vdCBhIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKHsgc3RhdHVzID0gJ0Vycm9yJywgbWVzc2FnZSA9IGFlcnIgfSkgZW5kCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfcG93KGEsIG4pKSB9KQogIGVuZAoKICAtLSDlhbbkvZkgb3Ag6YO96KaBIGHjgIFiCiAgbG9jYWwgYSwgYWVyciA9IGJpZ19mcm9tX3N0cmluZyhwLmEpCiAgaWYgbm90IGEgdGhlbiByZXR1cm4ganNvbl9lbmNvZGUoeyBzdGF0dXMgPSAnRXJyb3InLCBtZXNzYWdlID0gYWVyciB9KSBlbmQKICBsb2NhbCBiLCBiZXJyID0gYmlnX2Zyb21fc3RyaW5nKHAuYikKICBpZiBub3QgYiB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSBiZXJyIH0pIGVuZAoKICBpZiBvcCA9PSAnbXVsJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfbXVsKGEsIGIpKSB9KQogIGVsc2VpZiBvcCA9PSAnYWRkJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfYWRkKGEsIGIpKSB9KQogIGVsc2VpZiBvcCA9PSAnc3ViJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfc3ViKGEsIGIpKSB9KQogIGVsc2VpZiBvcCA9PSAnbW9kJyB0aGVuCiAgICBsb2NhbCBxLCBtID0gYmlnX2Rpdm1vZChhLCBiKQogICAgaWYgbm90IHEgdGhlbiByZXR1cm4ganNvbl9lbmNvZGUoeyBzdGF0dXMgPSAnRXJyb3InLCBtZXNzYWdlID0gbSB9KSBlbmQKICAgIHJldHVybiBqc29uX2VuY29kZSh7IHIgPSBiaWdfdG9fc3RyaW5nKG0pIH0pCiAgZWxzZWlmIG9wID09ICdjbXAnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh7IHIgPSBiaWdfY21wKGEsIGIpIH0pCiAgZWxzZWlmIG9wID09ICdkaXYnIHRoZW4KICAgIGxvY2FsIHEsIG0gPSBiaWdfZGl2bW9kKGEsIGIpCiAgICBpZiBub3QgcSB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSBtIH0pIGVuZAogICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgcSA9IGJpZ190b19zdHJpbmcocSksIG0gPSBiaWdfdG9fc3RyaW5nKG0pIH0pCiAgZW5kCgogIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAndW5rbm93biBvcDogJyAuLiB0b3N0cmluZyhvcCkgfSkKZW5kCgotLSBlbnRyeShyYXcp77yac3RydWN077yIdGFibGXvvInnm7TnlKjvvJtKU09OIOWtl+espuS4suWGheiBlCBkZWNvZGXvvIh0b19sYW5jZSDnuqblrprvvInjgIIKLS0g6aG25bGCIHJldHVybiBlbnRyee+8iOS4gOS4qiBmdW5jdGlvbu+8ie+8jOa7oei2syBxdWlja19jb21waWxlL2luc3RhbGwg55qECi0tICJtdXN0IHJldHVybiBhIGZ1bmN0aW9uIiDlpZHnuqbvvJtsdWFqaXRfcygnYmlnbnVtJywgPHN0cnVjdHxqc29uPikg5Y2V5Y+C6L+b5YWlIGVudHJ544CCCmxvY2FsIGZ1bmN0aW9uIGVudHJ5KHJhdykKICBpZiB0eXBlKHJhdykgPT0gJ3N0cmluZycgdGhlbgogICAgbG9jYWwgb2ssIGRlY29kZWQgPSBwY2FsbChqc29uX2RlY29kZSwgcmF3KQogICAgaWYgbm90IG9rIG9yIHR5cGUoZGVjb2RlZCkgfj0gJ3RhYmxlJyB0aGVuCiAgICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnRU5UUllfRVJSOiBiYWQganNvbiBwYXJhbXMnIH0pCiAgICBlbmQKICAgIHJhdyA9IGRlY29kZWQKICBlbmQKICBsb2NhbCBvaywgciA9IHBjYWxsKHJ1biwgcmF3KQogIGlmIG5vdCBvayB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnRU5UUllfRVJSOiAnIC4uIHRvc3RyaW5nKHIpIH0pIGVuZAogIHJldHVybiByCmVuZAoKcmV0dXJuIGVudHJ5CgB3cmFwIGVycjogJXMKAC0tIEBsaWI6IGpzb24KLS0gQGNhdGVnb3J5OiBwYXJzZXIKLS0gQGRlc2M6IEpTT04g6Kej5p6QL+e8luegge+8iOe6ryBMdWHvvIkKLS0gQHNvdXJjZTogdmVuZG9yZWQgaHR0cHM6Ly9naXRodWIuY29tL3J4aS9qc29uLmx1YSAoTUlULCByeGkgMjAyMCkKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKHZlbmRvcmVkIHJ4aS9qc29uLmx1YSwgcnhpIDIwMjApCi0tIEBtYXR1cml0eTogYXVkaXRlZAotLQotLSBqc29uLmx1YQotLQotLSBDb3B5cmlnaHQgKGMpIDIwMjAgcnhpCi0tCi0tIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YKLS0gdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgIlNvZnR3YXJlIiksIHRvIGRlYWwgaW4KLS0gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0bwotLSB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcwotLSBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8KLS0gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOgotLQotLSBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwKLS0gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS4KLS0KLS0gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IKLS0gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksCi0tIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRQotLSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSCi0tIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sCi0tIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFCi0tIFNPRlRXQVJFLgotLQoKbG9jYWwganNvbiA9IHsgX3ZlcnNpb24gPSAiMC4xLjIiIH0KCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLS0gRW5jb2RlCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KCmxvY2FsIGVuY29kZQoKbG9jYWwgZXNjYXBlX2NoYXJfbWFwID0gewogIFsgIlxcIiBdID0gIlxcIiwKICBbICJcIiIgXSA9ICJcIiIsCiAgWyAiXGIiIF0gPSAiYiIsCiAgWyAiXGYiIF0gPSAiZiIsCiAgWyAiXG4iIF0gPSAibiIsCiAgWyAiXHIiIF0gPSAiciIsCiAgWyAiXHQiIF0gPSAidCIsCn0KCmxvY2FsIGVzY2FwZV9jaGFyX21hcF9pbnYgPSB7IFsgIi8iIF0gPSAiLyIgfQpmb3IgaywgdiBpbiBwYWlycyhlc2NhcGVfY2hhcl9tYXApIGRvCiAgZXNjYXBlX2NoYXJfbWFwX2ludlt2XSA9IGsKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZXNjYXBlX2NoYXIoYykKICByZXR1cm4gIlxcIiAuLiAoZXNjYXBlX2NoYXJfbWFwW2NdIG9yIHN0cmluZy5mb3JtYXQoInUlMDR4IiwgYzpieXRlKCkpKQplbmQKCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfbmlsKHZhbCkKICByZXR1cm4gIm51bGwiCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVuY29kZV90YWJsZSh2YWwsIHN0YWNrKQogIGxvY2FsIHJlcyA9IHt9CiAgc3RhY2sgPSBzdGFjayBvciB7fQoKICAtLSBDaXJjdWxhciByZWZlcmVuY2U/CiAgaWYgc3RhY2tbdmFsXSB0aGVuIGVycm9yKCJjaXJjdWxhciByZWZlcmVuY2UiKSBlbmQKCiAgc3RhY2tbdmFsXSA9IHRydWUKCiAgaWYgcmF3Z2V0KHZhbCwgMSkgfj0gbmlsIG9yIG5leHQodmFsKSA9PSBuaWwgdGhlbgogICAgLS0gVHJlYXQgYXMgYXJyYXkgLS0gY2hlY2sga2V5cyBhcmUgdmFsaWQgYW5kIGl0IGlzIG5vdCBzcGFyc2UKICAgIGxvY2FsIG4gPSAwCiAgICBmb3IgayBpbiBwYWlycyh2YWwpIGRvCiAgICAgIGlmIHR5cGUoaykgfj0gIm51bWJlciIgdGhlbgogICAgICAgIGVycm9yKCJpbnZhbGlkIHRhYmxlOiBtaXhlZCBvciBpbnZhbGlkIGtleSB0eXBlcyIpCiAgICAgIGVuZAogICAgICBuID0gbiArIDEKICAgIGVuZAogICAgaWYgbiB+PSAjdmFsIHRoZW4KICAgICAgZXJyb3IoImludmFsaWQgdGFibGU6IHNwYXJzZSBhcnJheSIpCiAgICBlbmQKICAgIC0tIEVuY29kZQogICAgZm9yIGksIHYgaW4gaXBhaXJzKHZhbCkgZG8KICAgICAgdGFibGUuaW5zZXJ0KHJlcywgZW5jb2RlKHYsIHN0YWNrKSkKICAgIGVuZAogICAgc3RhY2tbdmFsXSA9IG5pbAogICAgcmV0dXJuICJbIiAuLiB0YWJsZS5jb25jYXQocmVzLCAiLCIpIC4uICJdIgoKICBlbHNlCiAgICAtLSBUcmVhdCBhcyBhbiBvYmplY3QKICAgIGZvciBrLCB2IGluIHBhaXJzKHZhbCkgZG8KICAgICAgaWYgdHlwZShrKSB+PSAic3RyaW5nIiB0aGVuCiAgICAgICAgZXJyb3IoImludmFsaWQgdGFibGU6IG1peGVkIG9yIGludmFsaWQga2V5IHR5cGVzIikKICAgICAgZW5kCiAgICAgIHRhYmxlLmluc2VydChyZXMsIGVuY29kZShrLCBzdGFjaykgLi4gIjoiIC4uIGVuY29kZSh2LCBzdGFjaykpCiAgICBlbmQKICAgIHN0YWNrW3ZhbF0gPSBuaWwKICAgIHJldHVybiAieyIgLi4gdGFibGUuY29uY2F0KHJlcywgIiwiKSAuLiAifSIKICBlbmQKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX3N0cmluZyh2YWwpCiAgcmV0dXJuICciJyAuLiB2YWw6Z3N1YignWyV6XDEtXDMxXFwiXScsIGVzY2FwZV9jaGFyKSAuLiAnIicKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX251bWJlcih2YWwpCiAgLS0gQ2hlY2sgZm9yIE5hTiwgLWluZiBhbmQgaW5mCiAgaWYgdmFsIH49IHZhbCBvciB2YWwgPD0gLW1hdGguaHVnZSBvciB2YWwgPj0gbWF0aC5odWdlIHRoZW4KICAgIGVycm9yKCJ1bmV4cGVjdGVkIG51bWJlciB2YWx1ZSAnIiAuLiB0b3N0cmluZyh2YWwpIC4uICInIikKICBlbmQKICByZXR1cm4gc3RyaW5nLmZvcm1hdCgiJS4xNGciLCB2YWwpCmVuZAoKCmxvY2FsIHR5cGVfZnVuY19tYXAgPSB7CiAgWyAibmlsIiAgICAgXSA9IGVuY29kZV9uaWwsCiAgWyAidGFibGUiICAgXSA9IGVuY29kZV90YWJsZSwKICBbICJzdHJpbmciICBdID0gZW5jb2RlX3N0cmluZywKICBbICJudW1iZXIiICBdID0gZW5jb2RlX251bWJlciwKICBbICJib29sZWFuIiBdID0gdG9zdHJpbmcsCn0KCgplbmNvZGUgPSBmdW5jdGlvbih2YWwsIHN0YWNrKQogIGxvY2FsIHQgPSB0eXBlKHZhbCkKICBsb2NhbCBmID0gdHlwZV9mdW5jX21hcFt0XQogIGlmIGYgdGhlbgogICAgcmV0dXJuIGYodmFsLCBzdGFjaykKICBlbmQKICBlcnJvcigidW5leHBlY3RlZCB0eXBlICciIC4uIHQgLi4gIiciKQplbmQKCgpmdW5jdGlvbiBqc29uLmVuY29kZSh2YWwpCiAgcmV0dXJuICggZW5jb2RlKHZhbCkgKQplbmQKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIERlY29kZQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpsb2NhbCBwYXJzZQoKbG9jYWwgZnVuY3Rpb24gY3JlYXRlX3NldCguLi4pCiAgbG9jYWwgcmVzID0ge30KICBmb3IgaSA9IDEsIHNlbGVjdCgiIyIsIC4uLikgZG8KICAgIHJlc1sgc2VsZWN0KGksIC4uLikgXSA9IHRydWUKICBlbmQKICByZXR1cm4gcmVzCmVuZAoKbG9jYWwgc3BhY2VfY2hhcnMgICA9IGNyZWF0ZV9zZXQoIiAiLCAiXHQiLCAiXHIiLCAiXG4iKQpsb2NhbCBkZWxpbV9jaGFycyAgID0gY3JlYXRlX3NldCgiICIsICJcdCIsICJcciIsICJcbiIsICJdIiwgIn0iLCAiLCIpCmxvY2FsIGVzY2FwZV9jaGFycyAgPSBjcmVhdGVfc2V0KCJcXCIsICIvIiwgJyInLCAiYiIsICJmIiwgIm4iLCAiciIsICJ0IiwgInUiKQpsb2NhbCBsaXRlcmFscyAgICAgID0gY3JlYXRlX3NldCgidHJ1ZSIsICJmYWxzZSIsICJudWxsIikKCmxvY2FsIGxpdGVyYWxfbWFwID0gewogIFsgInRydWUiICBdID0gdHJ1ZSwKICBbICJmYWxzZSIgXSA9IGZhbHNlLAogIFsgIm51bGwiICBdID0gbmlsLAp9CgoKbG9jYWwgZnVuY3Rpb24gbmV4dF9jaGFyKHN0ciwgaWR4LCBzZXQsIG5lZ2F0ZSkKICBmb3IgaSA9IGlkeCwgI3N0ciBkbwogICAgaWYgc2V0W3N0cjpzdWIoaSwgaSldIH49IG5lZ2F0ZSB0aGVuCiAgICAgIHJldHVybiBpCiAgICBlbmQKICBlbmQKICByZXR1cm4gI3N0ciArIDEKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZGVjb2RlX2Vycm9yKHN0ciwgaWR4LCBtc2cpCiAgbG9jYWwgbGluZV9jb3VudCA9IDEKICBsb2NhbCBjb2xfY291bnQgPSAxCiAgZm9yIGkgPSAxLCBpZHggLSAxIGRvCiAgICBjb2xfY291bnQgPSBjb2xfY291bnQgKyAxCiAgICBpZiBzdHI6c3ViKGksIGkpID09ICJcbiIgdGhlbgogICAgICBsaW5lX2NvdW50ID0gbGluZV9jb3VudCArIDEKICAgICAgY29sX2NvdW50ID0gMQogICAgZW5kCiAgZW5kCiAgZXJyb3IoIHN0cmluZy5mb3JtYXQoIiVzIGF0IGxpbmUgJWQgY29sICVkIiwgbXNnLCBsaW5lX2NvdW50LCBjb2xfY291bnQpICkKZW5kCgoKbG9jYWwgZnVuY3Rpb24gY29kZXBvaW50X3RvX3V0ZjgobikKICAtLSBodHRwOi8vc2NyaXB0cy5zaWwub3JnL2Ntcy9zY3JpcHRzL3BhZ2UucGhwP3NpdGVfaWQ9bnJzaSZpZD1pd3MtYXBwZW5kaXhhCiAgbG9jYWwgZiA9IG1hdGguZmxvb3IKICBpZiBuIDw9IDB4N2YgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKG4pCiAgZWxzZWlmIG4gPD0gMHg3ZmYgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKGYobiAvIDY0KSArIDE5MiwgbiAlIDY0ICsgMTI4KQogIGVsc2VpZiBuIDw9IDB4ZmZmZiB0aGVuCiAgICByZXR1cm4gc3RyaW5nLmNoYXIoZihuIC8gNDA5NikgKyAyMjQsIGYobiAlIDQwOTYgLyA2NCkgKyAxMjgsIG4gJSA2NCArIDEyOCkKICBlbHNlaWYgbiA8PSAweDEwZmZmZiB0aGVuCiAgICByZXR1cm4gc3RyaW5nLmNoYXIoZihuIC8gMjYyMTQ0KSArIDI0MCwgZihuICUgMjYyMTQ0IC8gNDA5NikgKyAxMjgsCiAgICAgICAgICAgICAgICAgICAgICAgZihuICUgNDA5NiAvIDY0KSArIDEyOCwgbiAlIDY0ICsgMTI4KQogIGVuZAogIGVycm9yKCBzdHJpbmcuZm9ybWF0KCJpbnZhbGlkIHVuaWNvZGUgY29kZXBvaW50ICcleCciLCBuKSApCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3VuaWNvZGVfZXNjYXBlKHMpCiAgbG9jYWwgbjEgPSB0b251bWJlciggczpzdWIoMSwgNCksICAxNiApCiAgbG9jYWwgbjIgPSB0b251bWJlciggczpzdWIoNywgMTApLCAxNiApCiAgIC0tIFN1cnJvZ2F0ZSBwYWlyPwogIGlmIG4yIHRoZW4KICAgIHJldHVybiBjb2RlcG9pbnRfdG9fdXRmOCgobjEgLSAweGQ4MDApICogMHg0MDAgKyAobjIgLSAweGRjMDApICsgMHgxMDAwMCkKICBlbHNlCiAgICByZXR1cm4gY29kZXBvaW50X3RvX3V0ZjgobjEpCiAgZW5kCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3N0cmluZyhzdHIsIGkpCiAgbG9jYWwgcmVzID0gIiIKICBsb2NhbCBqID0gaSArIDEKICBsb2NhbCBrID0gagoKICB3aGlsZSBqIDw9ICNzdHIgZG8KICAgIGxvY2FsIHggPSBzdHI6Ynl0ZShqKQoKICAgIGlmIHggPCAzMiB0aGVuCiAgICAgIGRlY29kZV9lcnJvcihzdHIsIGosICJjb250cm9sIGNoYXJhY3RlciBpbiBzdHJpbmciKQoKICAgIGVsc2VpZiB4ID09IDkyIHRoZW4gLS0gYFxgOiBFc2NhcGUKICAgICAgcmVzID0gcmVzIC4uIHN0cjpzdWIoaywgaiAtIDEpCiAgICAgIGogPSBqICsgMQogICAgICBsb2NhbCBjID0gc3RyOnN1YihqLCBqKQogICAgICBpZiBjID09ICJ1IiB0aGVuCiAgICAgICAgbG9jYWwgaGV4ID0gc3RyOm1hdGNoKCJeW2REXVs4OWFBYkJdJXgleFxcdSV4JXgleCV4IiwgaiArIDEpCiAgICAgICAgICAgICAgICAgb3Igc3RyOm1hdGNoKCJeJXgleCV4JXgiLCBqICsgMSkKICAgICAgICAgICAgICAgICBvciBkZWNvZGVfZXJyb3Ioc3RyLCBqIC0gMSwgImludmFsaWQgdW5pY29kZSBlc2NhcGUgaW4gc3RyaW5nIikKICAgICAgICByZXMgPSByZXMgLi4gcGFyc2VfdW5pY29kZV9lc2NhcGUoaGV4KQogICAgICAgIGogPSBqICsgI2hleAogICAgICBlbHNlCiAgICAgICAgaWYgbm90IGVzY2FwZV9jaGFyc1tjXSB0aGVuCiAgICAgICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBqIC0gMSwgImludmFsaWQgZXNjYXBlIGNoYXIgJyIgLi4gYyAuLiAiJyBpbiBzdHJpbmciKQogICAgICAgIGVuZAogICAgICAgIHJlcyA9IHJlcyAuLiBlc2NhcGVfY2hhcl9tYXBfaW52W2NdCiAgICAgIGVuZAogICAgICBrID0gaiArIDEKCiAgICBlbHNlaWYgeCA9PSAzNCB0aGVuIC0tIGAiYDogRW5kIG9mIHN0cmluZwogICAgICByZXMgPSByZXMgLi4gc3RyOnN1YihrLCBqIC0gMSkKICAgICAgcmV0dXJuIHJlcywgaiArIDEKICAgIGVuZAoKICAgIGogPSBqICsgMQogIGVuZAoKICBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgY2xvc2luZyBxdW90ZSBmb3Igc3RyaW5nIikKZW5kCgoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfbnVtYmVyKHN0ciwgaSkKICBsb2NhbCB4ID0gbmV4dF9jaGFyKHN0ciwgaSwgZGVsaW1fY2hhcnMpCiAgbG9jYWwgcyA9IHN0cjpzdWIoaSwgeCAtIDEpCiAgbG9jYWwgbiA9IHRvbnVtYmVyKHMpCiAgaWYgbm90IG4gdGhlbgogICAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImludmFsaWQgbnVtYmVyICciIC4uIHMgLi4gIiciKQogIGVuZAogIHJldHVybiBuLCB4CmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2xpdGVyYWwoc3RyLCBpKQogIGxvY2FsIHggPSBuZXh0X2NoYXIoc3RyLCBpLCBkZWxpbV9jaGFycykKICBsb2NhbCB3b3JkID0gc3RyOnN1YihpLCB4IC0gMSkKICBpZiBub3QgbGl0ZXJhbHNbd29yZF0gdGhlbgogICAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImludmFsaWQgbGl0ZXJhbCAnIiAuLiB3b3JkIC4uICInIikKICBlbmQKICByZXR1cm4gbGl0ZXJhbF9tYXBbd29yZF0sIHgKZW5kCgoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfYXJyYXkoc3RyLCBpKQogIGxvY2FsIHJlcyA9IHt9CiAgbG9jYWwgbiA9IDEKICBpID0gaSArIDEKICB3aGlsZSAxIGRvCiAgICBsb2NhbCB4CiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICAtLSBFbXB0eSAvIGVuZCBvZiBhcnJheT8KICAgIGlmIHN0cjpzdWIoaSwgaSkgPT0gIl0iIHRoZW4KICAgICAgaSA9IGkgKyAxCiAgICAgIGJyZWFrCiAgICBlbmQKICAgIC0tIFJlYWQgdG9rZW4KICAgIHgsIGkgPSBwYXJzZShzdHIsIGkpCiAgICByZXNbbl0gPSB4CiAgICBuID0gbiArIDEKICAgIC0tIE5leHQgdG9rZW4KICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpLCBzcGFjZV9jaGFycywgdHJ1ZSkKICAgIGxvY2FsIGNociA9IHN0cjpzdWIoaSwgaSkKICAgIGkgPSBpICsgMQogICAgaWYgY2hyID09ICJdIiB0aGVuIGJyZWFrIGVuZAogICAgaWYgY2hyIH49ICIsIiB0aGVuIGRlY29kZV9lcnJvcihzdHIsIGksICJleHBlY3RlZCAnXScgb3IgJywnIikgZW5kCiAgZW5kCiAgcmV0dXJuIHJlcywgaQplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9vYmplY3Qoc3RyLCBpKQogIGxvY2FsIHJlcyA9IHt9CiAgaSA9IGkgKyAxCiAgd2hpbGUgMSBkbwogICAgbG9jYWwga2V5LCB2YWwKICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpLCBzcGFjZV9jaGFycywgdHJ1ZSkKICAgIC0tIEVtcHR5IC8gZW5kIG9mIG9iamVjdD8KICAgIGlmIHN0cjpzdWIoaSwgaSkgPT0gIn0iIHRoZW4KICAgICAgaSA9IGkgKyAxCiAgICAgIGJyZWFrCiAgICBlbmQKICAgIC0tIFJlYWQga2V5CiAgICBpZiBzdHI6c3ViKGksIGkpIH49ICciJyB0aGVuCiAgICAgIGRlY29kZV9lcnJvcihzdHIsIGksICJleHBlY3RlZCBzdHJpbmcgZm9yIGtleSIpCiAgICBlbmQKICAgIGtleSwgaSA9IHBhcnNlKHN0ciwgaSkKICAgIC0tIFJlYWQgJzonIGRlbGltaXRlcgogICAgaSA9IG5leHRfY2hhcihzdHIsIGksIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgaWYgc3RyOnN1YihpLCBpKSB+PSAiOiIgdGhlbgogICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgJzonIGFmdGVyIGtleSIpCiAgICBlbmQKICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpICsgMSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICAtLSBSZWFkIHZhbHVlCiAgICB2YWwsIGkgPSBwYXJzZShzdHIsIGkpCiAgICAtLSBTZXQKICAgIHJlc1trZXldID0gdmFsCiAgICAtLSBOZXh0IHRva2VuCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICBsb2NhbCBjaHIgPSBzdHI6c3ViKGksIGkpCiAgICBpID0gaSArIDEKICAgIGlmIGNociA9PSAifSIgdGhlbiBicmVhayBlbmQKICAgIGlmIGNociB+PSAiLCIgdGhlbiBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgJ30nIG9yICcsJyIpIGVuZAogIGVuZAogIHJldHVybiByZXMsIGkKZW5kCgoKbG9jYWwgY2hhcl9mdW5jX21hcCA9IHsKICBbICciJyBdID0gcGFyc2Vfc3RyaW5nLAogIFsgIjAiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiMSIgXSA9IHBhcnNlX251bWJlciwKICBbICIyIiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjMiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiNCIgXSA9IHBhcnNlX251bWJlciwKICBbICI1IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjYiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiNyIgXSA9IHBhcnNlX251bWJlciwKICBbICI4IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjkiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiLSIgXSA9IHBhcnNlX251bWJlciwKICBbICJ0IiBdID0gcGFyc2VfbGl0ZXJhbCwKICBbICJmIiBdID0gcGFyc2VfbGl0ZXJhbCwKICBbICJuIiBdID0gcGFyc2VfbGl0ZXJhbCwKICBbICJbIiBdID0gcGFyc2VfYXJyYXksCiAgWyAieyIgXSA9IHBhcnNlX29iamVjdCwKfQoKCnBhcnNlID0gZnVuY3Rpb24oc3RyLCBpZHgpCiAgbG9jYWwgY2hyID0gc3RyOnN1YihpZHgsIGlkeCkKICBsb2NhbCBmID0gY2hhcl9mdW5jX21hcFtjaHJdCiAgaWYgZiB0aGVuCiAgICByZXR1cm4gZihzdHIsIGlkeCkKICBlbmQKICBkZWNvZGVfZXJyb3Ioc3RyLCBpZHgsICJ1bmV4cGVjdGVkIGNoYXJhY3RlciAnIiAuLiBjaHIgLi4gIiciKQplbmQKCgpmdW5jdGlvbiBqc29uLmRlY29kZShzdHIpCiAgaWYgdHlwZShzdHIpIH49ICJzdHJpbmciIHRoZW4KICAgIGVycm9yKCJleHBlY3RlZCBhcmd1bWVudCBvZiB0eXBlIHN0cmluZywgZ290ICIgLi4gdHlwZShzdHIpKQogIGVuZAogIGxvY2FsIHJlcywgaWR4ID0gcGFyc2Uoc3RyLCBuZXh0X2NoYXIoc3RyLCAxLCBzcGFjZV9jaGFycywgdHJ1ZSkpCiAgaWR4ID0gbmV4dF9jaGFyKHN0ciwgaWR4LCBzcGFjZV9jaGFycywgdHJ1ZSkKICBpZiBpZHggPD0gI3N0ciB0aGVuCiAgICBkZWNvZGVfZXJyb3Ioc3RyLCBpZHgsICJ0cmFpbGluZyBnYXJiYWdlIikKICBlbmQKICByZXR1cm4gcmVzCmVuZAoKCnJldHVybiBqc29uCgBfZHVja2RiX2NhbGwgPSBmdW5jdGlvbihzcWwpIHJldHVybiBfX2RiYyhzcWwpIGVuZApfZHVja2RiX3F1ZXJ5ID0gZnVuY3Rpb24oc3FsKQogIGxvY2FsIHMgPSBfX2RicShzcWwpCiAgbG9jYWwgb2ssIGogPSBwY2FsbChfbGlicy5qc29uLmRlY29kZSwgcykKICBpZiBub3Qgb2sgb3IgdHlwZShqKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIG5pbCwgJ2RlY29kZV9lcnI6ICcgLi4gdG9zdHJpbmcoaikgZW5kCiAgcmV0dXJuIGoucm93cywgai5lcnIKZW5kCgAtLSBAbGliOiBqc29ucGF0aAotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogUkZDIDk1MzUgSlNPTlBhdGgg5a6e55So5a2Q6ZuG77yI6Ieq5ZCr57qvIEx1Ye+8jOaXoCBGRknvvInigJTigJQgRHVja0RCIOWGheW7uiBqc29uX2V4dHJhY3QKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tICAgICAgIOWPquaUr+aMgeeugOWNleaIkOWRmC/ntKLlvJXot6/lvoTvvIzkuI3mlK/mjIHpgJrphY0gKuOAgemAkuW9kuS4i+mZjSAkLi5444CB6L+H5ruk6LCT6K+NIFs/KEAuYT4xKV3jgIIKLS0gICAgICAg5pys5bqT6KGl6b2Q77yMcXVlcnkoZG9jLCBleHByKSDihpIg5ZG95Lit5YC8IEpTT04g5pWw57uE77yI5paH5qGj6aG65bqP77yM5L+d55WZ6YeN5aSN77yJ44CCCi0tICAgICAgIOaUr+aMgeWtkOmbhu+8miQg5qC577ybLm5hbWUgLyBbJ25hbWUnXSDmiJDlkZjvvJsqIOmAmumFje+8m1tuXS9bLW5dIOaVsOe7hOe0ouW8le+8mwotLSAgICAgICAkLi5uYW1lIC8gLi5uYW1lIOmAkuW9kuS4i+mZje+8m1s/KEAucGF0aCBvcCBsaXRlcmFsKV0g6L+H5ruk77yIb3A6ID0gIT0gPCA8PSA+ID4977yMCi0tICAgICAgIOWPryBhbmQg57uE5ZCI77yMQC5rZXkg5pegIG9wIOaXtuihqOWtmOWcqOaAp++8ieOAggotLSAgICAgICBvcCDpgInpobnvvIh2ID0gSlNPTiDmlofmoaPlrZfnrKbkuLLvvIxlID0gSlNPTlBhdGgg6KGo6L6+5byP77yJ77yaCi0tICAgICAgICAgJ3F1ZXJ5JyAg4oaSIOWRveS4reWAvCBKU09OIOaVsOe7hO+8iOm7mOiupO+8iQotLSAgICAgICAgICdleGlzdHMnIOKGkiB0cnVlL2ZhbHNl77yI5piv5ZCm6Iez5bCR5LiA5Liq5ZG95Lit77yJCi0tICAgICAgICAgJ2NvdW50JyAg4oaSIOWRveS4reS4quaVsO+8iOaVsOWtl++8iQotLSAgICAgICAgICdmaXJzdCcgIOKGkiDpppbkuKrlkb3kuK3lgLzvvIjml6DliJkgbnVsbO+8iQotLSAgICAgICDms6jmhI/vvJpMdWEg6KGo5a2Y5LiN5LqGIG51bGzvvIzlgLzph4znmoQgbnVsbCDmjInnvLrlpLHlpITnkIbvvJvmlbDnu4Tku6UgMS1iYXNlZCDooajlrZjlgqjvvIwKLS0gICAgICAgSlNPTlBhdGgg55qEIDAtYmFzZWQg5LiL5qCH5YaF6YOo6L2s5o2i77yI6LSf5LiL5qCHIFstMV095pyr5L2N77yJ44CCCi0tICAgICAgIOmqjOivge+8mmxpYnMvcGFyc2VyL2pzb25wYXRoX3ZlcmlmeS5wee+8iFB5dGhvbiDlj4LogIPlrp7njrAgKyBSRkMgOTUzNSDplJrngrnkuqTlj4nmoKHpqozvvInjgIIKCmxvY2FsIGpwID0ge30KCi0tID09PT09PT09PT09PT09PT09PT09PSDoh6rlkKsgSlNPTiDop6PnoIEgPT09PT09PT09PT09PT09PT09PT09Ci0tIOiusOW9leWvueixoemUrueahCoq5paH5qGj77yI5paH5pys77yJ6aG65bqPKirvvIhSRkMgOTUzNSDnu5PmnpzpobvmjInmlofmoaPpobrluo/vvIzogIwgTHVhIOihqOaXoOW6j++8ieOAggotLSDnlKjlvLHms6jlhozooajpgb/lhY3lvJXnlKjms4TmvI/vvJvop6PnoIHlkI4gc29ydGVkX2tleXMoKSDmjInmraTpobrluo/ovpPlh7rjgIIKbG9jYWwga2V5X29yZGVyID0gc2V0bWV0YXRhYmxlKHt9LCB7X19tb2RlID0gJ2snfSkKbG9jYWwgZnVuY3Rpb24ganNvbl9kZWNvZGUocykKICBsb2NhbCBwb3MgPSAxCiAgbG9jYWwgZnVuY3Rpb24gZXJyKG0sIHApIGVycm9yKCdqc29uOiAnLi5tLi4ocCBhbmQgKCcgQCAnLi5wKSBvciAnJyksIDApIGVuZAogIGxvY2FsIGZ1bmN0aW9uIHdzKCkKICAgIHdoaWxlIHRydWUgZG8KICAgICAgbG9jYWwgYyA9IHM6c3ViKHBvcyxwb3MpCiAgICAgIGlmIGM9PScgJyBvciBjPT0nXHQnIG9yIGM9PSdcbicgb3IgYz09J1xyJyB0aGVuIHBvcyA9IHBvcysxIGVsc2UgYnJlYWsgZW5kCiAgICBlbmQKICBlbmQKICBsb2NhbCBwYXJzZV92YWx1ZQogIGxvY2FsIGZ1bmN0aW9uIHBhcnNlX3N0cmluZygpCiAgICBpZiBzOnN1Yihwb3MscG9zKSB+PSAnIicgdGhlbiBlcnIoJ2V4cGVjdGVkIHN0cmluZycsIHBvcykgZW5kCiAgICBwb3MgPSBwb3MgKyAxCiAgICBsb2NhbCBidWYgPSB7fQogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBsb2NhbCBjID0gczpzdWIocG9zLHBvcykKICAgICAgaWYgYyA9PSAnJyB0aGVuIGVycigndW50ZXJtaW5hdGVkIHN0cmluZycsIHBvcykgZW5kCiAgICAgIGlmIGMgPT0gJyInIHRoZW4gcG9zID0gcG9zICsgMTsgYnJlYWsgZW5kCiAgICAgIGlmIGMgPT0gJ1xcJyB0aGVuCiAgICAgICAgbG9jYWwgZSA9IHM6c3ViKHBvcysxLHBvcysxKTsgcG9zID0gcG9zICsgMgogICAgICAgIGlmIGU9PSciJyB0aGVuIHRhYmxlLmluc2VydChidWYsJyInKQogICAgICAgIGVsc2VpZiBlPT0nXFwnIHRoZW4gdGFibGUuaW5zZXJ0KGJ1ZiwnXFwnKQogICAgICAgIGVsc2VpZiBlPT0nLycgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCcvJykKICAgICAgICBlbHNlaWYgZT09J2InIHRoZW4gdGFibGUuaW5zZXJ0KGJ1ZiwnXGInKQogICAgICAgIGVsc2VpZiBlPT0nZicgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCdcZicpCiAgICAgICAgZWxzZWlmIGU9PSduJyB0aGVuIHRhYmxlLmluc2VydChidWYsJ1xuJykKICAgICAgICBlbHNlaWYgZT09J3InIHRoZW4gdGFibGUuaW5zZXJ0KGJ1ZiwnXHInKQogICAgICAgIGVsc2VpZiBlPT0ndCcgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCdcdCcpCiAgICAgICAgZWxzZWlmIGU9PSd1JyB0aGVuCiAgICAgICAgICBsb2NhbCBoID0gczpzdWIocG9zLHBvcyszKTsgcG9zID0gcG9zICsgNAogICAgICAgICAgbG9jYWwgY3AgPSB0b251bWJlcihoLDE2KSBvciAwCiAgICAgICAgICBpZiBjcCA8IDB4ODAgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCBzdHJpbmcuY2hhcihjcCkpCiAgICAgICAgICBlbHNlaWYgY3AgPCAweDgwMCB0aGVuIHRhYmxlLmluc2VydChidWYsIHN0cmluZy5jaGFyKDB4QzArbWF0aC5mbG9vcihjcC82NCksIDB4ODArY3AlNjQpKQogICAgICAgICAgZWxzZSB0YWJsZS5pbnNlcnQoYnVmLCBzdHJpbmcuY2hhcigweEUwK21hdGguZmxvb3IoY3AvNDA5NiksIDB4ODArbWF0aC5mbG9vcihjcC82NCklNjQsIDB4ODArY3AlNjQpKSBlbmQKICAgICAgICBlbHNlIGVycignYmFkIGVzY2FwZScsIHBvcy0yKSBlbmQKICAgICAgZWxzZSB0YWJsZS5pbnNlcnQoYnVmLCBjKTsgcG9zID0gcG9zICsgMSBlbmQKICAgIGVuZAogICAgcmV0dXJuIHRhYmxlLmNvbmNhdChidWYpCiAgZW5kCiAgcGFyc2VfdmFsdWUgPSBmdW5jdGlvbigpCiAgICB3cygpCiAgICBsb2NhbCBjID0gczpzdWIocG9zLHBvcykKICAgIGlmIGMgPT0gJycgdGhlbiBlcnIoJ3VuZXhwZWN0ZWQgZW5kJywgcG9zKSBlbmQKICAgIGlmIGMgPT0gJyInIHRoZW4gcmV0dXJuIHBhcnNlX3N0cmluZygpIGVuZAogICAgaWYgYyA9PSAneycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxOyBsb2NhbCB0ID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MscG9zKSA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gdCBlbmQKICAgICAga2V5X29yZGVyW3RdID0ge30KICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBrID0gcGFyc2Vfc3RyaW5nKCkKICAgICAgICBrZXlfb3JkZXJbdF1bI2tleV9vcmRlclt0XSsxXSA9IGsKICAgICAgICB3cygpCiAgICAgICAgaWYgczpzdWIocG9zLHBvcykgfj0gJzonIHRoZW4gZXJyKCdleHBlY3RlZCA6JywgcG9zKSBlbmQKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgICAgbG9jYWwgdiA9IHBhcnNlX3ZhbHVlKCkKICAgICAgICB0W2tdID0gdgogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBjMiA9IHM6c3ViKHBvcyxwb3MpCiAgICAgICAgaWYgYzIgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICAgIGVsc2VpZiBjMiA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxOyBicmVhawogICAgICAgIGVsc2UgZXJyKCdleHBlY3RlZCAsIG9yIH0nLCBwb3MpIGVuZAogICAgICBlbmQKICAgICAgcmV0dXJuIHQKICAgIGVuZAogICAgaWYgYyA9PSAnWycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxOyBsb2NhbCB0ID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MscG9zKSA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gdCBlbmQKICAgICAgbG9jYWwgbiA9IDAKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIGxvY2FsIHYgPSBwYXJzZV92YWx1ZSgpOyBuID0gbiArIDE7IHRbbl0gPSB2CiAgICAgICAgd3MoKQogICAgICAgIGxvY2FsIGMyID0gczpzdWIocG9zLHBvcykKICAgICAgICBpZiBjMiA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIGMyID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDE7IGJyZWFrCiAgICAgICAgZWxzZSBlcnIoJ2V4cGVjdGVkICwgb3IgXScsIHBvcykgZW5kCiAgICAgIGVuZAogICAgICByZXR1cm4gdAogICAgZW5kCiAgICBpZiBjID09ICd0JyB0aGVuIGlmIHM6c3ViKHBvcyxwb3MrMyk9PSd0cnVlJyB0aGVuIHBvcz1wb3MrNDsgcmV0dXJuIHRydWUgZW5kIGVycignYmFkIGxpdGVyYWwnLCBwb3MpIGVuZAogICAgaWYgYyA9PSAnZicgdGhlbiBpZiBzOnN1Yihwb3MscG9zKzQpPT0nZmFsc2UnIHRoZW4gcG9zPXBvcys1OyByZXR1cm4gZmFsc2UgZW5kIGVycignYmFkIGxpdGVyYWwnLCBwb3MpIGVuZAogICAgaWYgYyA9PSAnbicgdGhlbiBpZiBzOnN1Yihwb3MscG9zKzMpPT0nbnVsbCcgdGhlbiBwb3M9cG9zKzQ7IHJldHVybiBuaWwgZW5kIGVycignYmFkIGxpdGVyYWwnLCBwb3MpIGVuZAogICAgbG9jYWwgbnVtID0gczptYXRjaCgnXi0/JWQrJS4/JWQqW2VFXT9bKy1dPyVkKicsIHBvcykKICAgIGlmIG51bSBhbmQgbnVtIH49ICcnIHRoZW4gcG9zID0gcG9zICsgI251bTsgcmV0dXJuIHRvbnVtYmVyKG51bSkgZW5kCiAgICBlcnIoJ3VuZXhwZWN0ZWQgY2hhciAnLi5jLCBwb3MpCiAgZW5kCiAgbG9jYWwgdiA9IHBhcnNlX3ZhbHVlKCkKICB3cygpCiAgaWYgcG9zIDw9ICNzIHRoZW4gZXJyKCd0cmFpbGluZyBkYXRhJywgcG9zKSBlbmQKICByZXR1cm4gdgplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PSDoh6rlkKsgSlNPTiDnvJbnoIEgPT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGpzb25fZXNjYXBlKHN0cikKICByZXR1cm4gKHN0cjpnc3ViKCdbJXpcMS1cMzFcXCJdJywgZnVuY3Rpb24oYykKICAgIGxvY2FsIG0gPSB7IFsnXFwnXT0nXFxcXCcsIFsnIiddPSdcXCInLCBbJ1xuJ109J1xcbicsIFsnXHInXT0nXFxyJywKICAgICAgICAgICAgICAgIFsnXHQnXT0nXFx0JywgWydcYiddPSdcXGInLCBbJ1xmJ109J1xcZicgfQogICAgaWYgbVtjXSB0aGVuIHJldHVybiBtW2NdIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBzdHI6Ynl0ZSgpKQogIGVuZCkpCmVuZApsb2NhbCBqc29uX2VuY29kZQpsb2NhbCBmdW5jdGlvbiBlbmNvZGUodikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICdib29sZWFuJyB0aGVuIHJldHVybiB2IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJyBlbmQKICBpZiB0ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgPT0gbWF0aC5mbG9vcih2KSBhbmQgbWF0aC5hYnModikgPCAxZTE1IHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkJywgdikgZW5kCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS4xNWcnLCB2KQogIGVuZAogIGlmIHQgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gJyInLi5qc29uX2VzY2FwZSh2KS4uJ1wiJyBlbmQKICBpZiB0ID09ICd0YWJsZScgdGhlbgogICAgbG9jYWwgaXNhcnIsIG4gPSB0cnVlLCAwCiAgICBmb3IgayBpbiBwYWlycyh2KSBkbwogICAgICBuID0gbiArIDEKICAgICAgaWYgdHlwZShrKSB+PSAnbnVtYmVyJyB0aGVuIGlzYXJyID0gZmFsc2UgYnJlYWsgZW5kCiAgICBlbmQKICAgIGlmIGlzYXJyIHRoZW4KICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaSA9IDEsIG4gZG8gcGFydHNbaV0gPSBlbmNvZGUodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycuLnRhYmxlLmNvbmNhdChwYXJ0cywgJywnKS4uJ10nCiAgICBlbmQKICAgIGxvY2FsIGtleXMgPSB7fQogICAgZm9yIGsgaW4gcGFpcnModikgZG8ga2V5c1sja2V5cysxXSA9IGsgZW5kCiAgICB0YWJsZS5zb3J0KGtleXMsIGZ1bmN0aW9uKGEsYikgcmV0dXJuIHRvc3RyaW5nKGEpIDwgdG9zdHJpbmcoYikgZW5kKQogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIF8sIGsgaW4gaXBhaXJzKGtleXMpIGRvIHBhcnRzWyNwYXJ0cysxXSA9ICciJy4uanNvbl9lc2NhcGUoaykuLiciOiAnLi5lbmNvZGUodltrXSkgZW5kCiAgICByZXR1cm4gJ3snLi50YWJsZS5jb25jYXQocGFydHMsICcsICcpLi4nfScKICBlbmQKICByZXR1cm4gJ251bGwnCmVuZApqc29uX2VuY29kZSA9IGVuY29kZQoKLS0gPT09PT09PT09PT09PT09PT09PT09IOW3peWFtyA9PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gaXNfYXJyYXkodCkKICBpZiB0eXBlKHQpIH49ICd0YWJsZScgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgZm9yIGsgaW4gcGFpcnModCkgZG8gaWYgdHlwZShrKSB+PSAnbnVtYmVyJyB0aGVuIHJldHVybiBmYWxzZSBlbmQgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgpsb2NhbCBmdW5jdGlvbiBzb3J0ZWRfa2V5cyh0KQogIGxvY2FsIHJlYyA9IGtleV9vcmRlclt0XQogIGlmIHJlYyB0aGVuCiAgICAtLSDmlofmoaPvvIjmlofmnKzvvInpobrluo/vvJrov4fmu6Tmjonlt7LkuI3lnKjooajkuK3nmoTplK4KICAgIGxvY2FsIG91dCA9IHt9CiAgICBmb3IgXywgayBpbiBpcGFpcnMocmVjKSBkbyBpZiB0W2tdIH49IG5pbCB0aGVuIG91dFsjb3V0KzFdID0gayBlbmQgZW5kCiAgICBpZiAjb3V0ID4gMCB0aGVuIHJldHVybiBvdXQgZW5kCiAgZW5kCiAgbG9jYWwga2V5cyA9IHt9CiAgZm9yIGsgaW4gcGFpcnModCkgZG8ga2V5c1sja2V5cysxXSA9IGsgZW5kCiAgdGFibGUuc29ydChrZXlzLCBmdW5jdGlvbihhLGIpIHJldHVybiB0b3N0cmluZyhhKSA8IHRvc3RyaW5nKGIpIGVuZCkKICByZXR1cm4ga2V5cwplbmQKCi0tIOaMieaIkOWRmOi3r+W+hOWPliAwLWJhc2VkIOS4i+agh++8iOaVsOe7hO+8ieaIlumUru+8iOWvueixoe+8iQpsb2NhbCBmdW5jdGlvbiBnZXRfcGF0aChub2RlLCBrZXlzKQogIGxvY2FsIGN1ciA9IG5vZGUKICBmb3IgaSA9IDEsICNrZXlzIGRvCiAgICBsb2NhbCBrID0ga2V5c1tpXQogICAgaWYgY3VyID09IG5pbCBvciB0eXBlKGN1cikgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiBuaWwgZW5kCiAgICBpZiBpc19hcnJheShjdXIpIGFuZCBrOm1hdGNoKCdeJS0/JWQrJCcpIHRoZW4KICAgICAgbG9jYWwgaWR4ID0gdG9udW1iZXIoaykKICAgICAgaWYgaWR4IDwgMCB0aGVuIGlkeCA9ICNjdXIgKyBpZHggKyAxIGVsc2UgaWR4ID0gaWR4ICsgMSBlbmQKICAgICAgaWYgaWR4IDwgMSBvciBpZHggPiAjY3VyIHRoZW4gcmV0dXJuIG5pbCBlbmQKICAgICAgY3VyID0gY3VyW2lkeF0KICAgIGVsc2UKICAgICAgY3VyID0gY3VyW2tdCiAgICAgIGlmIGN1ciA9PSBuaWwgdGhlbiByZXR1cm4gbmlsIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIGN1cgplbmQKCi0tIOaKiuebuOWvueaIkOWRmOi3r+W+hCAiYS5iWzBdLmMiIOino+aekOaIkCBrZXlzIOaVsOe7hApsb2NhbCBmdW5jdGlvbiBwYXJzZV9tZW1iZXJfcGF0aChwKQogIGxvY2FsIGtleXMgPSB7fQogIGxvY2FsIGksIG4gPSAxLCAjcAogIGxvY2FsIGZ1bmN0aW9uIHJlYWRfbmFtZSgpCiAgICBsb2NhbCBqID0gaQogICAgd2hpbGUgaiA8PSBuIGFuZCBwOnN1YihqLGopIH49ICcuJyBhbmQgcDpzdWIoaixqKSB+PSAnWycgZG8gaiA9IGogKyAxIGVuZAogICAgbG9jYWwgbmFtZSA9IHA6c3ViKGksIGotMSkKICAgIGlmIG5hbWUgfj0gJycgdGhlbiBrZXlzWyNrZXlzKzFdID0gbmFtZSBlbmQKICAgIHJldHVybiBqCiAgZW5kCiAgd2hpbGUgaSA8PSBuIGRvCiAgICBsb2NhbCBjID0gcDpzdWIoaSxpKQogICAgaWYgYyA9PSAnLicgdGhlbgogICAgICBpID0gaSArIDEKICAgICAgaSA9IHJlYWRfbmFtZSgpCiAgICBlbHNlaWYgYyA9PSAnWycgdGhlbgogICAgICBsb2NhbCBjbG9zZSA9IHA6ZmluZCgnXScsIGkpCiAgICAgIGlmIG5vdCBjbG9zZSB0aGVuIGJyZWFrIGVuZAogICAgICBsb2NhbCBpbm5lciA9IHA6c3ViKGkrMSwgY2xvc2UtMSkKICAgICAgbG9jYWwgcSA9IGlubmVyOm1hdGNoKCdeIiguKikiJCcpIG9yIGlubmVyOm1hdGNoKCJeJyguKiknJCIpCiAgICAgIGtleXNbI2tleXMrMV0gPSBxIG9yIGlubmVyCiAgICAgIGkgPSBjbG9zZSArIDEKICAgIGVsc2UKICAgICAgLS0g5byV5a+85q6177yI6aaW5Liq5a2X56ym5piv5ZCN5a2X55qE5LiA6YOo5YiG77yM5aaCICJwcmljZSIgLyAiYS5iIiDnmoQgImEi77yJCiAgICAgIGkgPSByZWFkX25hbWUoKQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIGtleXMKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT0g6L+H5ruk5rGC5YC8ID09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBldmFsX2NsYXVzZQpsb2NhbCBmdW5jdGlvbiBldmFsX2ZpbHRlcihub2RlLCBleHByKQogIC0tIGV4cHIg5b2i5aaCICc/KEAuYSA+IDMgYW5kIEAuYiA9ICJ4IiknIOKGkiDmir3lh7ogQC5hLi4uIOmDqOWIhgogIGxvY2FsIGJvZHkgPSBleHByOm1hdGNoKCdeJT8lKCguKiklKSVzKiQnKSBvciBleHByCiAgYm9keSA9IGJvZHk6Z3N1YignXiVzKycsJycpOmdzdWIoJyVzKyQnLCcnKQogIC0tIOaMiSAiIGFuZCAiIOaLhuWtkOWPpQogIGxvY2FsIGNsYXVzZXMsIGN1ciwgaSA9IHt9LCAnJywgMQogIGxvY2FsIGZ1bmN0aW9uIGZsdXNoKCkgaWYgY3VyIH49ICcnIHRoZW4gY2xhdXNlc1sjY2xhdXNlcysxXSA9IGN1ciBlbmQgY3VyID0gJycgZW5kCiAgd2hpbGUgaSA8PSAjYm9keSBkbwogICAgaWYgYm9keTpzdWIoaSxpKzIpID09ICdhbmQnIGFuZCBib2R5OnN1YihpLTEsaS0xKT09JyAnIGFuZCBib2R5OnN1YihpKzMsaSszKT09JyAnIHRoZW4KICAgICAgZmx1c2goKTsgaSA9IGkgKyAzCiAgICAgIHdoaWxlIGJvZHk6c3ViKGksaSkgPT0gJyAnIGRvIGkgPSBpICsgMSBlbmQKICAgIGVsc2UKICAgICAgY3VyID0gY3VyIC4uIGJvZHk6c3ViKGksaSk7IGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgZmx1c2goKQogIGZvciBfLCBjbCBpbiBpcGFpcnMoY2xhdXNlcykgZG8KICAgIGlmIG5vdCBldmFsX2NsYXVzZShub2RlLCBjbCkgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgotLSDlnKjlrZDlj6XkuK3mib7liLDnrKzkuIDkuKrmr5TovoPov5DnrpfnrKbnmoTkvY3nva7vvIjlvJXlj7flhoXnmoTov5DnrpfnrKbkuI3nrpfvvInjgILov5Tlm54gb3AsIGxlZnQsIHJpZ2h044CCCmxvY2FsIGZ1bmN0aW9uIGZpbmRfb3AoY2xhdXNlKQogIGxvY2FsIGkgPSAxCiAgbG9jYWwgbiA9ICNjbGF1c2UKICBsb2NhbCBpbnEgPSBuaWwKICB3aGlsZSBpIDw9IG4gZG8KICAgIGxvY2FsIGMgPSBjbGF1c2U6c3ViKGksaSkKICAgIGlmIGlucSB0aGVuCiAgICAgIGlmIGMgPT0gaW5xIHRoZW4gaW5xID0gbmlsIGVuZAogICAgICBpID0gaSArIDEKICAgIGVsc2UKICAgICAgaWYgYyA9PSAnIicgb3IgYyA9PSAiJyIgdGhlbgogICAgICAgIGlucSA9IGM7IGkgPSBpICsgMQogICAgICBlbHNlCiAgICAgICAgLS0g5YWI6K+V5Lik5L2N6L+Q566X56ym77yM5YaN6K+V5LiA5L2NCiAgICAgICAgbG9jYWwgdHdvID0gY2xhdXNlOnN1YihpLCBpKzEpCiAgICAgICAgaWYgdHdvID09ICc8PScgb3IgdHdvID09ICc+PScgb3IgdHdvID09ICchPScgdGhlbgogICAgICAgICAgbG9jYWwgbGVmdCA9IGNsYXVzZTpzdWIoMSwgaS0xKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIGxvY2FsIHJpZ2h0ID0gY2xhdXNlOnN1YihpKzIpOmdzdWIoJ14lcysnLCcnKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIHJldHVybiB0d28sIGxlZnQsIHJpZ2h0CiAgICAgICAgZW5kCiAgICAgICAgaWYgYyA9PSAnPCcgb3IgYyA9PSAnPicgb3IgYyA9PSAnPScgdGhlbgogICAgICAgICAgbG9jYWwgbGVmdCA9IGNsYXVzZTpzdWIoMSwgaS0xKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIGxvY2FsIHJpZ2h0ID0gY2xhdXNlOnN1YihpKzEpOmdzdWIoJ14lcysnLCcnKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIHJldHVybiBjLCBsZWZ0LCByaWdodAogICAgICAgIGVuZAogICAgICAgIGkgPSBpICsgMQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiBuaWwsIG5pbCwgbmlsCmVuZAoKZXZhbF9jbGF1c2UgPSBmdW5jdGlvbihub2RlLCBjbGF1c2UpCiAgY2xhdXNlID0gY2xhdXNlOmdzdWIoJ14lcysnLCcnKTpnc3ViKCclcyskJywnJykKICBsb2NhbCBvcCwgbGVmdCwgcmlnaHQgPSBmaW5kX29wKGNsYXVzZSkKICAtLSDml6Dov5DnrpfnrKYg4oaSIOWtmOWcqOaApwogIGlmIG5vdCBvcCB0aGVuCiAgICBsb2NhbCByZWwgPSBjbGF1c2U6Z3N1YignXkAlLicsJycpOmdzdWIoJ15AJywnJykKICAgIGxvY2FsIGxrZXlzID0gcGFyc2VfbWVtYmVyX3BhdGgocmVsKQogICAgbG9jYWwgbHZhbCA9ICgjbGtleXMgPT0gMCkgYW5kIG5vZGUgb3IgZ2V0X3BhdGgobm9kZSwgbGtleXMpCiAgICByZXR1cm4gbHZhbCB+PSBuaWwKICBlbmQKICAtLSDmr5TovoPlvI8KICBsb2NhbCByZWwgPSBsZWZ0OmdzdWIoJ15AJS4nLCcnKTpnc3ViKCdeQCcsJycpCiAgbG9jYWwgbGtleXMgPSBwYXJzZV9tZW1iZXJfcGF0aChyZWwpCiAgbG9jYWwgbHZhbCA9ICgjbGtleXMgPT0gMCkgYW5kIG5vZGUgb3IgZ2V0X3BhdGgobm9kZSwgbGtleXMpCiAgLS0g5Y+z5a2X6Z2i6YePCiAgbG9jYWwgcnZhbAogIGlmIHJpZ2h0ID09ICd0cnVlJyB0aGVuIHJ2YWwgPSB0cnVlCiAgZWxzZWlmIHJpZ2h0ID09ICdmYWxzZScgdGhlbiBydmFsID0gZmFsc2UKICBlbHNlaWYgcmlnaHQgPT0gJ251bGwnIG9yIHJpZ2h0ID09ICduaWwnIHRoZW4gcnZhbCA9IG5pbAogIGVsc2VpZiByaWdodDptYXRjaCgnXiUtPyVkKyUuPyVkKiQnKSB0aGVuIHJ2YWwgPSB0b251bWJlcihyaWdodCkKICBlbHNlCiAgICBsb2NhbCBxID0gcmlnaHQ6bWF0Y2goJ14iKC4qKSIkJykgb3IgcmlnaHQ6bWF0Y2goIl4nKC4qKSckIikKICAgIHJ2YWwgPSBxIG9yIHJpZ2h0CiAgZW5kCiAgaWYgb3AgPT0gJz0nIHRoZW4gcmV0dXJuIGx2YWwgPT0gcnZhbCBlbmQKICBpZiBvcCA9PSAnIT0nIHRoZW4gcmV0dXJuIGx2YWwgfj0gcnZhbCBlbmQKICBsb2NhbCBhLCBiID0gdG9udW1iZXIobHZhbCksIHRvbnVtYmVyKHJ2YWwpCiAgaWYgYSA9PSBuaWwgb3IgYiA9PSBuaWwgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgb3AgPT0gJzwnIHRoZW4gcmV0dXJuIGEgPCBiIGVuZAogIGlmIG9wID09ICc8PScgdGhlbiByZXR1cm4gYSA8PSBiIGVuZAogIGlmIG9wID09ICc+JyB0aGVuIHJldHVybiBhID4gYiBlbmQKICByZXR1cm4gYSA+PSBiCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09IEpTT05QYXRoIOaxguWAvCA9PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcXVlcnkocm9vdCwgZXhwcikKICBleHByID0gZXhwcjpnc3ViKCdeJXMrJywnJyk6Z3N1YignJXMrJCcsJycpCiAgaWYgZXhwciA9PSAnJyBvciBleHByOnN1YigxLDEpIH49ICckJyB0aGVuIGVycm9yKCdqc29ucGF0aDogbXVzdCBzdGFydCB3aXRoICQnLCAwKSBlbmQKICAtLSDop6PmnpDmiJAgc3RlcHMKICBsb2NhbCBzdGVwcyA9IHt9CiAgbG9jYWwgaSwgbiA9IDIsICNleHByCiAgd2hpbGUgaSA8PSBuIGRvCiAgICBsb2NhbCBjID0gZXhwcjpzdWIoaSxpKQogICAgaWYgYyA9PSAnLicgdGhlbgogICAgICBpZiBleHByOnN1YihpLCBpKzEpID09ICcuLicgdGhlbgogICAgICAgIGkgPSBpICsgMgogICAgICAgIGxvY2FsIGogPSBpCiAgICAgICAgd2hpbGUgaiA8PSBuIGFuZCBleHByOnN1YihqLGopIH49ICcuJyBhbmQgZXhwcjpzdWIoaixqKSB+PSAnWycgZG8gaiA9IGogKyAxIGVuZAogICAgICAgIGxvY2FsIG5hbWUgPSBleHByOnN1YihpLCBqLTEpCiAgICAgICAgaWYgbmFtZSB+PSAnJyB0aGVuIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdyZWN1cnNpdmUnLCBuYW1lPW5hbWV9IGVuZAogICAgICAgIGkgPSBqCiAgICAgIGVsc2UKICAgICAgICBpID0gaSArIDEKICAgICAgICBpZiBleHByOnN1YihpLGkpID09ICcqJyB0aGVuCiAgICAgICAgICBzdGVwc1sjc3RlcHMrMV0gPSB7a2luZD0nd2lsZGNhcmQnfQogICAgICAgICAgaSA9IGkgKyAxCiAgICAgICAgZWxzZQogICAgICAgICAgbG9jYWwgaiA9IGkKICAgICAgICAgIHdoaWxlIGogPD0gbiBhbmQgZXhwcjpzdWIoaixqKSB+PSAnLicgYW5kIGV4cHI6c3ViKGosaikgfj0gJ1snIGRvIGogPSBqICsgMSBlbmQKICAgICAgICAgIGxvY2FsIG5hbWUgPSBleHByOnN1YihpLCBqLTEpCiAgICAgICAgICBpZiBuYW1lID09ICcnIHRoZW4gZXJyb3IoJ2pzb25wYXRoOiBlbXB0eSBtZW1iZXInLCAwKSBlbmQKICAgICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdtZW1iZXInLCBuYW1lPW5hbWV9CiAgICAgICAgICBpID0gagogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVsc2VpZiBjID09ICcqJyB0aGVuCiAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSd3aWxkY2FyZCd9CiAgICAgIGkgPSBpICsgMQogICAgZWxzZWlmIGMgPT0gJ1snIHRoZW4KICAgICAgbG9jYWwgaiwgaW5xID0gaSArIDEsIG5pbAogICAgICB3aGlsZSBqIDw9IG4gZG8KICAgICAgICBsb2NhbCBjaCA9IGV4cHI6c3ViKGosaikKICAgICAgICBpZiBpbnEgdGhlbgogICAgICAgICAgaWYgY2ggPT0gaW5xIGFuZCBleHByOnN1YihqLTEsai0xKSB+PSAnXFwnIHRoZW4gaW5xID0gbmlsIGVuZAogICAgICAgIGVsc2UKICAgICAgICAgIGlmIGNoID09ICciJyBvciBjaCA9PSAiJyIgdGhlbiBpbnEgPSBjaAogICAgICAgICAgZWxzZWlmIGNoID09ICddJyB0aGVuIGJyZWFrIGVuZAogICAgICAgIGVuZAogICAgICAgIGogPSBqICsgMQogICAgICBlbmQKICAgICAgaWYgbm90IChqIDw9IG4pIHRoZW4gZXJyb3IoJ2pzb25wYXRoOiB1bnRlcm1pbmF0ZWQgWycsIDApIGVuZAogICAgICBsb2NhbCBpbm5lciA9IGV4cHI6c3ViKGkrMSwgai0xKQogICAgICBpID0gaiArIDEKICAgICAgaWYgaW5uZXI6bWF0Y2goJ14lLT8lZCskJykgdGhlbgogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdpbmRleCcsIGlkeD10b251bWJlcihpbm5lcil9CiAgICAgIGVsc2VpZiBpbm5lcjpzdWIoMSwxKSA9PSAnPycgdGhlbgogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdmaWx0ZXInLCBleHByPWlubmVyfQogICAgICBlbHNlaWYgaW5uZXI6bWF0Y2goJ14iJykgb3IgaW5uZXI6bWF0Y2goIl4nIikgdGhlbgogICAgICAgIGxvY2FsIHEgPSBpbm5lcjptYXRjaCgnXiIoLiopIiQnKSBvciBpbm5lcjptYXRjaCgiXicoLiopJyQiKQogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdtZW1iZXInLCBuYW1lPXF9CiAgICAgIGVsc2VpZiBpbm5lciA9PSAnKicgdGhlbgogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSd3aWxkY2FyZCd9CiAgICAgIGVsc2UKICAgICAgICBzdGVwc1sjc3RlcHMrMV0gPSB7a2luZD0nbWVtYmVyJywgbmFtZT1pbm5lcn0KICAgICAgZW5kCiAgICBlbHNlCiAgICAgIGVycm9yKCdqc29ucGF0aDogdW5leHBlY3RlZCBjaGFyICcuLmMuLicgQCAnLi5pLCAwKQogICAgZW5kCiAgZW5kCgogIGxvY2FsIGN1cnJlbnQgPSB7IHtwYXRoPScnLCB2YWx1ZT1yb290fSB9CiAgZm9yIF8sIHN0ZXAgaW4gaXBhaXJzKHN0ZXBzKSBkbwogICAgbG9jYWwgbmV4dCA9IHt9CiAgICBpZiBzdGVwLmtpbmQgPT0gJ21lbWJlcicgdGhlbgogICAgICBmb3IgXywgbSBpbiBpcGFpcnMoY3VycmVudCkgZG8KICAgICAgICBsb2NhbCBub2RlID0gbS52YWx1ZQogICAgICAgIGlmIHR5cGUobm9kZSkgPT0gJ3RhYmxlJyBhbmQgbm9kZVtzdGVwLm5hbWVdIH49IG5pbCB0aGVuCiAgICAgICAgICBuZXh0WyNuZXh0KzFdID0ge3BhdGg9bS5wYXRoLi4nLicuLnN0ZXAubmFtZSwgdmFsdWU9bm9kZVtzdGVwLm5hbWVdfQogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVsc2VpZiBzdGVwLmtpbmQgPT0gJ2luZGV4JyB0aGVuCiAgICAgIGZvciBfLCBtIGluIGlwYWlycyhjdXJyZW50KSBkbwogICAgICAgIGxvY2FsIG5vZGUgPSBtLnZhbHVlCiAgICAgICAgaWYgdHlwZShub2RlKSA9PSAndGFibGUnIGFuZCBpc19hcnJheShub2RlKSB0aGVuCiAgICAgICAgICBsb2NhbCBpZHggPSBzdGVwLmlkeAogICAgICAgICAgaWYgaWR4IDwgMCB0aGVuIGlkeCA9ICNub2RlICsgaWR4ICsgMSBlbHNlIGlkeCA9IGlkeCArIDEgZW5kCiAgICAgICAgICBpZiBpZHggPj0gMSBhbmQgaWR4IDw9ICNub2RlIHRoZW4KICAgICAgICAgICAgbmV4dFsjbmV4dCsxXSA9IHtwYXRoPW0ucGF0aC4uJ1snLi50b3N0cmluZyhzdGVwLmlkeCkuLiddJywgdmFsdWU9bm9kZVtpZHhdfQogICAgICAgICAgZW5kCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZWxzZWlmIHN0ZXAua2luZCA9PSAnd2lsZGNhcmQnIHRoZW4KICAgICAgZm9yIF8sIG0gaW4gaXBhaXJzKGN1cnJlbnQpIGRvCiAgICAgICAgbG9jYWwgbm9kZSA9IG0udmFsdWUKICAgICAgICBpZiB0eXBlKG5vZGUpID09ICd0YWJsZScgdGhlbgogICAgICAgICAgaWYgaXNfYXJyYXkobm9kZSkgdGhlbgogICAgICAgICAgICBmb3IgaWR4ID0gMSwgI25vZGUgZG8gbmV4dFsjbmV4dCsxXSA9IHtwYXRoPW0ucGF0aC4uJ1snLi4oaWR4LTEpLi4nXScsIHZhbHVlPW5vZGVbaWR4XX0gZW5kCiAgICAgICAgICBlbHNlCiAgICAgICAgICAgIGZvciBfLCBrIGluIGlwYWlycyhzb3J0ZWRfa2V5cyhub2RlKSkgZG8KICAgICAgICAgICAgICBuZXh0WyNuZXh0KzFdID0ge3BhdGg9bS5wYXRoLi4nLicuLmssIHZhbHVlPW5vZGVba119CiAgICAgICAgICAgIGVuZAogICAgICAgICAgZW5kCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZWxzZWlmIHN0ZXAua2luZCA9PSAncmVjdXJzaXZlJyB0aGVuCiAgICAgIGxvY2FsIGZ1bmN0aW9uIGZpbmRfYWxsKG5vZGUsIHBhdGgpCiAgICAgICAgaWYgbm9kZSA9PSBuaWwgb3IgdHlwZShub2RlKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGVuZAogICAgICAgIGlmIGlzX2FycmF5KG5vZGUpIHRoZW4KICAgICAgICAgIGZvciBpZHggPSAxLCAjbm9kZSBkbyBmaW5kX2FsbChub2RlW2lkeF0sIHBhdGguLidbJy4uKGlkeC0xKS4uJ10nKSBlbmQKICAgICAgICBlbHNlCiAgICAgICAgICBmb3IgXywgayBpbiBpcGFpcnMoc29ydGVkX2tleXMobm9kZSkpIGRvCiAgICAgICAgICAgIGxvY2FsIGNwID0gcGF0aC4uJy4nLi5rCiAgICAgICAgICAgIGlmIGsgPT0gc3RlcC5uYW1lIHRoZW4gbmV4dFsjbmV4dCsxXSA9IHtwYXRoPWNwLCB2YWx1ZT1ub2RlW2tdfSBlbmQKICAgICAgICAgICAgZmluZF9hbGwobm9kZVtrXSwgY3ApCiAgICAgICAgICBlbmQKICAgICAgICBlbmQKICAgICAgZW5kCiAgICAgIGZvciBfLCBtIGluIGlwYWlycyhjdXJyZW50KSBkbyBmaW5kX2FsbChtLnZhbHVlLCBtLnBhdGgpIGVuZAogICAgZWxzZWlmIHN0ZXAua2luZCA9PSAnZmlsdGVyJyB0aGVuCiAgICAgIC0tIOi/h+a7pO+8muiLpeiKgueCueaYr+aVsOe7hO+8jOWvueavj+S4qioq5YWD57SgKirmsYIgQO+8iEpTT05QYXRoIOe7j+WFuOivreS5ie+8jOWQjCBqcS9nanNvbi9Hb2Vzc25lcu+8ie+8mwogICAgICAtLSDlkKbliJnlr7nmlbTkuKroioLngrnmsYIgQOOAguWRveS4reWNs+i+k+WHuuivpe+8iOWFg+e0oO+8ieWAvOOAggogICAgICBsb2NhbCBmdW5jdGlvbiBmaWx0ZXJfbm9kZShub2RlLCBwYXRoKQogICAgICAgIGlmIGlzX2FycmF5KG5vZGUpIHRoZW4KICAgICAgICAgIGZvciBpZHggPSAxLCAjbm9kZSBkbwogICAgICAgICAgICBpZiBldmFsX2ZpbHRlcihub2RlW2lkeF0sIHN0ZXAuZXhwcikgdGhlbgogICAgICAgICAgICAgIG5leHRbI25leHQrMV0gPSB7cGF0aD1wYXRoLi4nWycuLihpZHgtMSkuLiddJywgdmFsdWU9bm9kZVtpZHhdfQogICAgICAgICAgICBlbmQKICAgICAgICAgIGVuZAogICAgICAgIGVsc2VpZiBldmFsX2ZpbHRlcihub2RlLCBzdGVwLmV4cHIpIHRoZW4KICAgICAgICAgIG5leHRbI25leHQrMV0gPSB7cGF0aD1wYXRoLCB2YWx1ZT1ub2RlfQogICAgICAgIGVuZAogICAgICBlbmQKICAgICAgZm9yIF8sIG0gaW4gaXBhaXJzKGN1cnJlbnQpIGRvIGZpbHRlcl9ub2RlKG0udmFsdWUsIG0ucGF0aCkgZW5kCiAgICBlbmQKICAgIGN1cnJlbnQgPSBuZXh0CiAgZW5kCiAgcmV0dXJuIGN1cnJlbnQKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT0g5YWl5Y+jID09PT09PT09PT09PT09PT09PT09PQpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHt2ID0gcCwgZSA9ICckJ30gZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGlucHV0In0nIGVuZAogIGxvY2FsIGRvYyA9IHAudgogIGlmIG5vdCBkb2Mgb3IgZG9jID09ICcnIHRoZW4gcmV0dXJuICd7ImVycm9yIjoibWlzc2luZyB2IChqc29uIGRvYykifScgZW5kCiAgbG9jYWwgZXhwciA9IHAuZSBvciBwLmV4cHIgb3IgJyQnCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdxdWVyeScKCiAgbG9jYWwgb2ssIHBhcnNlZCA9IHBjYWxsKGpzb25fZGVjb2RlLCBkb2MpCiAgaWYgbm90IG9rIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiaW52YWxpZCBqc29uIGRvYzogJyAuLiBqc29uX2VzY2FwZSh0b3N0cmluZyhwYXJzZWQpKSAuLiAnIn0nIGVuZAoKICBsb2NhbCBvazIsIG1hdGNoZWQgPSBwY2FsbChxdWVyeSwgcGFyc2VkLCBleHByKQogIGlmIG5vdCBvazIgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJqc29ucGF0aDogJyAuLiBqc29uX2VzY2FwZSh0b3N0cmluZyhtYXRjaGVkKSkgLi4gJyJ9JyBlbmQKCiAgaWYgb3AgPT0gJ2NvdW50JyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoI21hdGNoZWQpCiAgZWxzZWlmIG9wID09ICdleGlzdHMnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSgjbWF0Y2hlZCA+IDApCiAgZWxzZWlmIG9wID09ICdmaXJzdCcgdGhlbgogICAgcmV0dXJuIGpzb25fZW5jb2RlKG1hdGNoZWRbMV0gYW5kIG1hdGNoZWRbMV0udmFsdWUgb3IgbmlsKQogIGVsc2UKICAgIGxvY2FsIHZhbHMgPSB7fQogICAgZm9yIF8sIG0gaW4gaXBhaXJzKG1hdGNoZWQpIGRvIHZhbHNbI3ZhbHMrMV0gPSBtLnZhbHVlIGVuZAogICAgcmV0dXJuIGpzb25fZW5jb2RlKHZhbHMpCiAgZW5kCmVuZAoALS0gQGxpYjogY25jaGVjawotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzog5Lit5Zu95pWw5o2u5qCh6aqM5L2N566X5rOV5YWo5a625qG277yI57qvIEx1Ye+8jOiHquWMheWQq++8ieOAggotLSAgICAgICBvcD0naWRfY2FyZCfvvJoxOCDkvY3ouqvku73or4HvvIhHQiAxMTY0My0xOTk5IOWKoOadg+agoemqjOS9jSArIFjvvInvvIzlhbzlrrkgMTUg5L2N6ICB5Y+377ybCi0tICAgICAgIG9wPSd1c2NjJ++8mue7n+S4gOekvuS8muS/oeeUqOS7o+eggSAxOCDkvY3vvIhHQiAzMjEwMC0yMDE177yMMzEg5a2X56ym6ZuG5Yqg5p2DIG1vZCAzMe+8ie+8mwotLSAgICAgICBvcD0nYmFua19jYXJkJ++8mumTtuihjOWNoSBMdWhu77yITU9ELTEw77yMMTPigJMxOSDkvY3vvInvvJsKLS0gICAgICAgb3A9J3Bob25lJ++8muWkp+mZhuaJi+acuuWPt++8iDExIOS9je+8jDFbMy05XSDmrrXov5HkvLzvvIzlrp7nlKjmoKHpqozvvInvvJsKLS0gICAgICAgb3A9J2lkX2V4dHJhY3Qn77ya6Lqr5Lu96K+BIOKGkiDljLrliJIv5Ye655SfL+aAp+WIqyBKU09O77ybCi0tICAgICAgIG9wPSdpZF8xNXRvMTgn77yaMTUg5L2N6ICB5Y+3IOKGkiAxOCDkvY3vvIjnrKwgNyDkvY3liY3mj5IgJzE5JyArIOmHjeeul+agoemqjOS9je+8ieOAggotLSAgICAgICDlkITmoKHpqowgb3Ag6L+U5ZueIEpTT07vvJp7InZhbGlkIjp0cnVlfGZhbHNlLCJyZWFzb24iOiIuLi4ife+8iOmFjSBqc29uX2V4dHJhY3Qg55So77yJ44CCCi0tIEBzb3VyY2U6IG9yaWdpbmFs77yIZHVja2RiLWx1YWppdCDns7vliJfvvIzoh6rljIXlkKvml6DlpJbpg6jkvp3otZbvvIkKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSDplJrngrnvvIjlt7Lpqozor4HvvInvvJrouqvku73or4EgMTEwMTA1MTk0OTEyMzEwMDJYIOacieaViCAvIDExMDEwNTE5NDkxMjMxMDAyMCDml6DmlYjvvJsKLS0gICBVU0NDIDkxMzUwMTAwTTAwMDEwMFk0MyDmnInmlYggLyDigKY0NCDml6DmlYjvvJvpk7booYzljaEgNDExMTExMTExMTExMTExMSDmnInmlYjvvJvmiYvmnLogMTM4MDAxMzgwMDAg5pyJ5pWI44CCCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0nY25jaGVjaycpOwotLSAgIOi6q+S7veivgTogIFNFTEVDVCBqc29uX2V4dHJhY3QobHVhaml0X3MoJ2NuY2hlY2snLCB7djogJzExMDEwNTE5NDkxMjMxMDAyWCcsIG9wOiAnaWRfY2FyZCd9KSwgJyQudmFsaWQnKTsKLS0gICBVU0NDOiAgICBTRUxFQ1QgbHVhaml0X3MoJ2NuY2hlY2snLCB7djogJzkxMzUwMTAwTTAwMDEwMFk0MycsIG9wOiAndXNjYyd9KTsKLS0gICDpk7booYw6ICAgIFNFTEVDVCBsdWFqaXRfcygnY25jaGVjaycsIHt2OiAnNDExMTExMTExMTExMTExMScsIG9wOiAnYmFua19jYXJkJ30pOwotLSAgIOaJi+acujogICAgU0VMRUNUIGx1YWppdF9zKCdjbmNoZWNrJywge3Y6ICcxMzgwMDEzODAwMCcsIG9wOiAncGhvbmUnfSk7Ci0tICAg6Lqr5Lu96K+B5a2X5q61OiBTRUxFQ1QgbHVhaml0X3MoJ2NuY2hlY2snLCB7djogJzExMDEwNTE5NDkxMjMxMDAyWCcsIG9wOiAnaWRfZXh0cmFjdCd9KTsKLS0gICAgICAgICAgICAg4oaSIHsicmVnaW9uIjoiMTEwMTA1IiwiYmlydGgiOiIxOTQ5LTEyLTMxIiwic2V4IjoiTSJ9CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEpTT04g57yW56CB77yI57K+566A6Ieq5YyF5ZCr77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHM6Z3N1YignWyVjIlxcXScsIGZ1bmN0aW9uKGMpCiAgICBpZiBjID09ICciJyB0aGVuIHJldHVybiAnXFwiJwogICAgZWxzZWlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcKICAgIGVsc2VpZiBjID09ICdcbicgdGhlbiByZXR1cm4gJ1xcbicKICAgIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2UgcmV0dXJuIGMgZW5kCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBqYm9vbChiKSByZXR1cm4gYiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCgpsb2NhbCBmdW5jdGlvbiByZXN1bHQodmFsaWQsIHJlYXNvbikKICByZXR1cm4gJ3sidmFsaWQiOicgLi4gamJvb2wodmFsaWQpIC4uICcsInJlYXNvbiI6IicgLi4ganNvbl9lc2NhcGUodG9zdHJpbmcocmVhc29uKSkgLi4gJyJ9JwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6Lqr5Lu96K+B77yIR0IgMTE2NDMtMTk5Oe+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIElEX1dFSUdIVFMgPSB7IDcsIDksIDEwLCA1LCA4LCA0LCAyLCAxLCA2LCAzLCA3LCA5LCAxMCwgNSwgOCwgNCwgMiB9CmxvY2FsIElEX0NIRUNLID0geyBbJzAnXT0nMScsIFsnMSddPScwJywgWycyJ109J1gnLCBbJzMnXT0nOScsIFsnNCddPSc4JywKICAgICAgICAgICAgICAgICAgIFsnNSddPSc3JywgWyc2J109JzYnLCBbJzcnXT0nNScsIFsnOCddPSc0JywgWyc5J109JzMnLCBbJzEwJ109JzInIH0KCmxvY2FsIGZ1bmN0aW9uIGlkX2NhcmRfY2hlY2sodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKTp1cHBlcigpKQogIGlmICNzIH49IDE4IHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mVv+W6pumhu+S4uiAxOCDkvY3vvIgxNSDkvY3ogIHlj7fkuI3mlK/mjIHmoKHpqozkvY3vvIknKSBlbmQKICBpZiBub3QgczptYXRjaCgnXiVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWRbJWRYXSQnKSB0aGVuCiAgICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5ZCr6Z2e5rOV5a2X56ym77yIMTcg5L2N5pWw5a2XICsg5pyr5L2N5pWw5a2X5oiWIFjvvIknKQogIGVuZAogIGxvY2FsIHN1bSA9IDAKICBmb3IgaSA9IDEsIDE3IGRvCiAgICBzdW0gPSBzdW0gKyAodG9udW1iZXIoczpzdWIoaSwgaSkpIG9yIDApICogSURfV0VJR0hUU1tpXQogIGVuZAogIGxvY2FsIGV4cGVjdCA9IElEX0NIRUNLW3Rvc3RyaW5nKHN1bSAlIDExKV0KICBsb2NhbCBnb3QgPSBzOnN1YigxOCwgMTgpCiAgaWYgZXhwZWN0ID09IGdvdCB0aGVuIHJldHVybiByZXN1bHQodHJ1ZSwgJ09LJykgZW5kCiAgcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+agoemqjOS9jeS4jeespu+8muacn+acmyAnIC4uIGV4cGVjdCAuLiAn77yM5a6e5Li6ICcgLi4gZ290KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGlkX2V4dHJhY3QodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKTp1cHBlcigpKQogIGxvY2FsIHJlZ2lvbiwgYmlydGgsIHNleAogIGlmICNzID09IDE4IHRoZW4KICAgIGlmIG5vdCBzOm1hdGNoKCdeJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZFslZFhdJCcpIHRoZW4KICAgICAgcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mdnuazlei6q+S7veivgScpCiAgICBlbmQKICAgIHJlZ2lvbiA9IHM6c3ViKDEsIDYpCiAgICBiaXJ0aCA9IHM6c3ViKDcsIDE0KQogICAgc2V4ID0gKHRvbnVtYmVyKHM6c3ViKDE3LCAxNykpIG9yIDApICUgMiA9PSAxIGFuZCAnTScgb3IgJ0YnCiAgZWxzZWlmICNzID09IDE1IHRoZW4KICAgIGlmIG5vdCBzOm1hdGNoKCdeJWQrJCcpIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mdnuazlei6q+S7veivgScpIGVuZAogICAgcmVnaW9uID0gczpzdWIoMSwgNikKICAgIGJpcnRoID0gJzE5JyAuLiBzOnN1Yig3LCAxMikKICAgIHNleCA9ICh0b251bWJlcihzOnN1YigxNSwgMTUpKSBvciAwKSAlIDIgPT0gMSBhbmQgJ00nIG9yICdGJwogIGVsc2UKICAgIHJldHVybiByZXN1bHQoZmFsc2UsICfplb/luqbpobvkuLogMTUg5oiWIDE4IOS9jScpCiAgZW5kCiAgbG9jYWwgYnkgPSBiaXJ0aDpzdWIoMSwgNCkKICBsb2NhbCBibSA9IGJpcnRoOnN1Yig1LCA2KQogIGxvY2FsIGJkID0gYmlydGg6c3ViKDcsIDgpCiAgcmV0dXJuICd7InJlZ2lvbiI6IicgLi4ganNvbl9lc2NhcGUocmVnaW9uKSAuLiAnIiwiYmlydGgiOiInLi4KICAgICAgICAganNvbl9lc2NhcGUoYnkgLi4gJy0nIC4uIGJtIC4uICctJyAuLiBiZCkgLi4gJyIsInNleCI6IicgLi4gc2V4IC4uICcifScKZW5kCgotLSAxNSDkvY3ogIHlj7cg4oaSIDE4IOS9je+8iEdCIDExNjQzLTE5OTnvvInvvJrnrKwgNyDkvY3liY3mj5IgJzE5J++8iOS4lue6quWBh+iuviAxOTAwc++8ie+8jAotLSDmnKvkvY3mjIkgMTcg5L2N5Yqg5p2D6YeN566X5qCh6aqM5L2N77yI5ZCMIGlkX2NhcmQg55qEIElEX1dFSUdIVFMvSURfQ0hFQ0vvvInjgIIKbG9jYWwgZnVuY3Rpb24gaWRfMTV0bzE4KHYpCiAgbG9jYWwgcyA9ICh0b3N0cmluZyh2KTpnc3ViKCclcysnLCAnJyk6dXBwZXIoKSkKICBpZiAjcyB+PSAxNSB0aGVuCiAgICByZXR1cm4gJ3siaWQxOCI6bnVsbCwiZXJyb3IiOiLplb/luqbpobvkuLogMTUg5L2N77yIMTgg5L2N5peg6ZyA6L2s5o2i77yJIn0nCiAgZW5kCiAgaWYgbm90IHM6bWF0Y2goJ14lZCskJykgdGhlbgogICAgcmV0dXJuICd7ImlkMTgiOm51bGwsImVycm9yIjoiMTUg5L2N6ICB5Y+36aG75YWo5pWw5a2XIn0nCiAgZW5kCiAgbG9jYWwgczE3ID0gczpzdWIoMSwgNikgLi4gJzE5JyAuLiBzOnN1Yig3LCAxNSkKICBsb2NhbCBzdW0gPSAwCiAgZm9yIGkgPSAxLCAxNyBkbwogICAgc3VtID0gc3VtICsgKHRvbnVtYmVyKHMxNzpzdWIoaSwgaSkpIG9yIDApICogSURfV0VJR0hUU1tpXQogIGVuZAogIGxvY2FsIGNoZWNrID0gSURfQ0hFQ0tbdG9zdHJpbmcoc3VtICUgMTEpXQogIHJldHVybiAneyJpZDE1IjoiJyAuLiBzIC4uICciLCJpZDE4IjoiJyAuLiBzMTcgLi4gY2hlY2sgLi4gJyJ9JwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g57uf5LiA56S+5Lya5L+h55So5Luj56CB77yIR0IgMzIxMDAtMjAxNe+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIFVTQ0NfQ0hBUlMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISktMTU5QUVJUVVdYWScgIC0tIDMxIOWtl+espu+8jOWOuyBJIE8gUyBWIFoKbG9jYWwgdXNjY19tYXAgPSB7fQpmb3IgaSA9IDEsIDMxIGRvIHVzY2NfbWFwW1VTQ0NfQ0hBUlM6c3ViKGksIGkpXSA9IGkgLSAxIGVuZApsb2NhbCBVU0NDX1dFSUdIVFMgPSB7IDEsIDMsIDksIDI3LCAxOSwgMjYsIDE2LCAxNywgMjAsIDI5LCAyNSwgMTMsIDgsIDI0LCAxMCwgMzAsIDI4IH0KCmxvY2FsIGZ1bmN0aW9uIHVzY2NfY2hlY2sodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKTp1cHBlcigpKQogIGlmICNzIH49IDE4IHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mVv+W6pumhu+S4uiAxOCDkvY0nKSBlbmQKICBsb2NhbCBzdW0gPSAwCiAgZm9yIGkgPSAxLCAxNyBkbwogICAgbG9jYWwgY2ggPSBzOnN1YihpLCBpKQogICAgbG9jYWwgdmFsID0gdXNjY19tYXBbY2hdCiAgICBpZiB2YWwgPT0gbmlsIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+S9jee9riAnIC4uIGkgLi4gJyDlrZfnrKYgJyAuLiBjaCAuLiAnIOS4jeWcqCAzMSDlrZfnrKbpm4YnKSBlbmQKICAgIHN1bSA9IHN1bSArIHZhbCAqIFVTQ0NfV0VJR0hUU1tpXQogIGVuZAogIGxvY2FsIGMxOCA9IDMxIC0gKHN1bSAlIDMxKQogIGxvY2FsIGV4cGVjdCA9IChjMTggPj0gMzEpIGFuZCAnMCcgb3IgVVNDQ19DSEFSUzpzdWIoYzE4ICsgMSwgYzE4ICsgMSkKICBsb2NhbCBnb3QgPSBzOnN1YigxOCwgMTgpCiAgaWYgZXhwZWN0ID09IGdvdCB0aGVuIHJldHVybiByZXN1bHQodHJ1ZSwgJ09LJykgZW5kCiAgcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+agoemqjOS9jeS4jeespu+8muacn+acmyAnIC4uIGV4cGVjdCAuLiAn77yM5a6e5Li6ICcgLi4gZ290KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6ZO26KGM5Y2h77yITHVobiAvIE1PRC0xMO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGx1aG5fdmFsaWQocykKICBsb2NhbCBzdW0sIGFsdCA9IDAsIGZhbHNlCiAgZm9yIGkgPSAjcywgMSwgLTEgZG8KICAgIGxvY2FsIGQgPSB0b251bWJlcihzOnN1YihpLCBpKSkKICAgIGlmIGQgPT0gbmlsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogICAgaWYgYWx0IHRoZW4KICAgICAgZCA9IGQgKiAyCiAgICAgIGlmIGQgPiA5IHRoZW4gZCA9IGQgLSA5IGVuZAogICAgZW5kCiAgICBzdW0gPSBzdW0gKyBkCiAgICBhbHQgPSBub3QgYWx0CiAgZW5kCiAgcmV0dXJuIHN1bSAlIDEwID09IDAKZW5kCgpsb2NhbCBmdW5jdGlvbiBiYW5rX2NhcmRfY2hlY2sodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKSkKICBpZiBub3QgczptYXRjaCgnXiVkKyQnKSB0aGVuIHJldHVybiByZXN1bHQoZmFsc2UsICflkKvpnZ7mlbDlrZflrZfnrKYnKSBlbmQKICBpZiAjcyA8IDEzIG9yICNzID4gMTkgdGhlbiByZXR1cm4gcmVzdWx0KGZhbHNlLCAn6ZW/5bqm6aG75Li6IDEz4oCTMTkg5L2NJykgZW5kCiAgaWYgbHVobl92YWxpZChzKSB0aGVuIHJldHVybiByZXN1bHQodHJ1ZSwgJ0x1aG4gT0snKSBlbmQKICByZXR1cm4gcmVzdWx0KGZhbHNlLCAnTHVobiDmoKHpqozlpLHotKUnKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5omL5py65Y+377yI5aSn6ZmG77yM5a6e55So6L+R5Ly877yaMVszLTldICsgOSDkvY3vvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwaG9uZV9jaGVjayh2KQogIGxvY2FsIHMgPSAodG9zdHJpbmcodik6Z3N1YignJXMrJywgJycpKQogIGlmIG5vdCBzOm1hdGNoKCdeJWQrJCcpIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+WQq+mdnuaVsOWtl+Wtl+espicpIGVuZAogIGlmICNzIH49IDExIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mVv+W6pumhu+S4uiAxMSDkvY0nKSBlbmQKICBpZiBzOm1hdGNoKCdeMVszLTldJykgdGhlbgogICAgcmV0dXJuIHJlc3VsdCh0cnVlLCAnT0vvvIgxWzMtOV0g5q6177yJJykKICBlbmQKICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5Y+35q615LiN56ym77yI6Z2eIDFbMy05XSDlvIDlpLTvvIknKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gVURGIOWIhuWPkeWMheijhQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIE9QUyA9IHsKICBpZF9jYXJkID0gaWRfY2FyZF9jaGVjaywKICB1c2NjID0gdXNjY19jaGVjaywKICBiYW5rX2NhcmQgPSBiYW5rX2NhcmRfY2hlY2ssCiAgcGhvbmUgPSBwaG9uZV9jaGVjaywKICBpZF8xNXRvMTggPSBpZF8xNXRvMTgsCn0KCnJldHVybiBmdW5jdGlvbihwKQogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuCiAgICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5Y+C5pWw6aG75Li66KGoIHt2PS4uLiwgb3A9Li4ufScpCiAgZW5kCiAgbG9jYWwgdiA9IHAudgogIGlmIHYgPT0gbmlsIG9yIHYgPT0gJycgdGhlbiByZXR1cm4gcmVzdWx0KGZhbHNlLCAn56m65YC8JykgZW5kCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdpZF9jYXJkJwogIGlmIG9wID09ICdpZF9leHRyYWN0JyB0aGVuCiAgICByZXR1cm4gaWRfZXh0cmFjdCh2KQogIGVuZAogIGxvY2FsIGZuID0gT1BTW29wXQogIGlmIG5vdCBmbiB0aGVuCiAgICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5pyq55+lIG9w77yaJyAuLiBvcCAuLiAn77yI5Y+v6YCJIGlkX2NhcmQvdXNjYy9iYW5rX2NhcmQvcGhvbmUvaWRfZXh0cmFjdC9pZF8xNXRvMTjvvIknKQogIGVuZAogIHJldHVybiBmbih2KQplbmQKAC0tIEBsaWI6IGJhc2V4eAotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzogYmFzZTg1IChSRkMgMTkyNCDlrZfnrKbpm4YpICsgYmFzZTU4IChCaXRjb2luKSDlpKfmlbTlnovnvJbop6PnoIHjgIIKLS0gICAgICAg6KGl6b2QIER1Y2tEQiDnlKjmiLflsYIgZ2Fw77yadG9fYmFzZSDlj6rmlK/mjIEgMi0zNu+8jGZyb21fYmFzZSDlj6rmlK/mjIEgYmFzZTY077yMYmFzZTg1LzU4IOe8uuWkseOAggotLSAgICAgICBvcD0nYmFzZTg1X2VuYycgICDvvJpwLmhleCDihpIgYmFzZTg1IOS4su+8iOWtl+espumbhiA9IFJGQzE5MjQg55qEIDg1IOWtl+espu+8mjAtOSBhLXogQS1aICsgMTIg56ym5Y+377yJCi0tICAgICAgIG9wPSdiYXNlODVfZGVjJyAgIO+8mnAudu+8iGJhc2U4NSDkuLLvvInihpIgaGV4Ci0tICAgICAgIG9wPSdiYXNlNThfZW5jJyAgIO+8mnAuaGV4IOKGkiBCaXRjb2luIGJhc2U1OCDkuLLvvIjlrZfnrKbpm4bml6AgMCBPIEkgbO+8jOWJjeWvvOmbtuWtl+iKgiDihpIgJzEn77yM5Y+v6YCG77yJCi0tICAgICAgIG9wPSdiYXNlNThfZGVjJyAgIO+8mnAudu+8iGJhc2U1OCDkuLLvvInihpIgaGV4Ci0tICAgICAgIOKaoO+4jyBJL08g5pivIGhleCDkuLLvvIhsdWFqaXRfcyDlj6rov5Tlm54gVkFSQ0hBUu+8jOS6jOi/m+WItui1sCBoZXjigJTigJTmnKzns7vliJfnuqblrprvvInjgIIKLS0gICAgICAg566X5rOV77ya5qCH5YeG5aSn5pW05Z6LIGJhc2UtTu+8iOS4jiBCaXRjb2luIGJhc2U1OCDlupPlkIznrpfms5XvvInjgIIKLS0gICAgICAgICAqIOWJjeWvvOmbtuWtl+iKgiDihpIgTiDkuKrmoIforrDlrZfnrKbvvIhiYXNlNTg9JzEnIC8gYmFzZTg1PScwJ++8ie+8jGRlY29kZSDmjInmoIforrDmlbDov5jljp/liY3lr7zpm7blrZfoioLvvIwKLS0gICAgICAgICAgIOWFqOmbtuS4siByb3VuZHRyaXAg57K+56Gu44CCCi0tICAgICAgICAgKiDms6jmhI/vvJpiYXNlODUg55So55qE5pivIFJGQzE5MjQg55qEKirlrZfnrKbpm4YqKu+8jOS9hue8luino+eggei1sOWkp+aVtOWei++8iOmdniBSRkMxOTI0IOeahCA1MiDlrZfoioLliIbnu4QKLS0gICAgICAgICAgIOa1geagvOW8j++8ieKAlOKAlOaJgOS7peS4juecnyBSRkMxOTI0IOa1geS4jemAkOWtl+iKguWFvOWuue+8jOS9huS9nOS4uue8luino+eggeW3peWFtyByb3VuZHRyaXAg57K+56Gu44CB6K+t5LmJ5riF5pmw44CCCi0tICAgICAgICAgICDpnIDopoHnnJ8gUkZDMTkyNCDmtYHmoLzlvI/ml7blj6bor7TjgIIKLS0gICAgICAgNjQg5L2N5a6J5YWo77yI56Gs57qm5p2f77yJ77ya5pys5py6IEx1YUpJVCDljp/nlJ/mlbTmlbAgMzIg5L2NIC8gZG91YmxlIDUzIOS9jSDihpIg5aSn5pW05Z6L6LWwKirlrZfoioLmlbDnu4QqKgotLSAgICAgICAgICAg6YCQ5a2X6IqC6L+b5L2N77yI5q+P5q2lIGN1ciA9IGJ5dGUqYmFzZStjYXJyeSA8IDI1NSo4NSs4NSA8IDJeMTfvvIxkb3VibGUg57K+56Gu77yJ77yMCi0tICAgICAgICAgICDml6DpnIAgRkZJ44CB5pegIDY0IOS9jeWtl+mdoumHj+OAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQtbGlicyDns7vliJfvvInvvJtiYXNlNTgg5a+56b2QIEJpdGNvaW4g5qCH5YeGCi0tIEByZXF1aXJlczog5peg77yI57qvIEx1Ye+8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWTvvIjlr7nmi40gcHl0aG9uMyBvcmFjbGXvvIxyb3VuZHRyaXAg5YWo6L+H77yM6KeBIHRlc3RfYmFzZXh4LnNxbO+8iQotLQotLSBVc2FnZToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSdiYXNleHgnKTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2Jhc2V4eCcsIHtoZXg6JzY4NjU2YzZjNmYnLCBvcDonYmFzZTg1X2VuYyd9KTsgICDihpIgJzFnNEkxPm0nCi0tICAgU0VMRUNUIGx1YWppdF9zKCdiYXNleHgnLCB7djonMWc0STE+bScsIG9wOidiYXNlODVfZGVjJ30pOyAgICAgICAgIOKGkiAnNjg2NTZjNmM2ZicKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2Jhc2V4eCcsIHtoZXg6J2RlYWRiZWVmJywgb3A6J2Jhc2U1OF9lbmMnfSk7ICAgICAg4oaSICc2aDhjUU4nCi0tICAgU0VMRUNUIGx1YWppdF9zKCdiYXNleHgnLCB7djonNmg4Y1FOJywgb3A6J2Jhc2U1OF9kZWMnfSk7ICAgICAgICAgIOKGkiAnZGVhZGJlZWYnCgotLSBSRkMgMTkyNCBiYXNlODUgYWxwaGFiZXQgKDg1IGNoYXJzOiAwLTkgYS16IEEtWiArICEjJCUmKCkqKy07PD0+P0BeX2B7fH1+KQpsb2NhbCBBODUgPSAiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVohIyQlJigpKistOzw9Pj9AXl9ge3x9fiIKbG9jYWwgQTg1X01BUCA9IHt9CmZvciBpID0gMSwgI0E4NSBkbyBBODVfTUFQW0E4NTpzdWIoaSwgaSldID0gaSAtIDEgZW5kCgotLSBCaXRjb2luIGJhc2U1OCBhbHBoYWJldCAoNTggY2hhcnMsIG5vIDAgTyBJIGwpCmxvY2FsIEE1OCA9ICIxMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RVVldYWVphYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6Igpsb2NhbCBBNThfTUFQID0ge30KZm9yIGkgPSAxLCAjQTU4IGRvIEE1OF9NQVBbQTU4OnN1YihpLCBpKV0gPSBpIC0gMSBlbmQKCmxvY2FsIGZ1bmN0aW9uIGhleF90b19ieXRlcyhoKQogIGxvY2FsIG4gPSAjaAogIGlmIG4gJSAyIH49IDAgdGhlbiBlcnJvcignaGV4IG11c3QgaGF2ZSBldmVuIGxlbmd0aCcpIGVuZAogIHJldHVybiAoaDpzdWIoMSwgbik6Z3N1YignLi4nLCBmdW5jdGlvbihjYykgcmV0dXJuIHN0cmluZy5jaGFyKHRvbnVtYmVyKGNjLCAxNikpIGVuZCkpCmVuZAoKbG9jYWwgZnVuY3Rpb24gYnl0ZXNfdG9faGV4KGIpCiAgcmV0dXJuIChiOmdzdWIoJy4nLCBmdW5jdGlvbihjKSByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJTAyeCcsIGM6Ynl0ZSgpKSBlbmQpKQplbmQKCi0tIOaVsOWJjeWvvOmbtuWtl+iKguaVsApsb2NhbCBmdW5jdGlvbiBjb3VudF9sZWFkaW5nX3plcm8oZGF0YSkKICBsb2NhbCBjID0gMAogIGZvciBpID0gMSwgI2RhdGEgZG8KICAgIGlmIGRhdGE6c3ViKGksIGkpOmJ5dGUoKSA9PSAwIHRoZW4gYyA9IGMgKyAxIGVsc2UgYnJlYWsgZW5kCiAgZW5kCiAgcmV0dXJuIGMKZW5kCgotLSDlpKfnq6/lrZfoioLmlbDnu4TpmaTku6XlsI8gYmFzZe+8mui/lOWbniAo5Ymp5L2Z5a2X6IqC5pWw57uELCDkvZnmlbAp44CC5q+P5q2lIGN1cjwyXjE3IOeyvuehruOAggpsb2NhbCBmdW5jdGlvbiBkaXZfYnl0ZXNfYmUoZGF0YSwgYmFzZSkKICBsb2NhbCByZW0gPSAwCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaSA9IDEsICNkYXRhIGRvCiAgICBsb2NhbCBjdXIgPSByZW0gKiAyNTYgKyBkYXRhOnN1YihpLCBpKTpieXRlKCkKICAgIGxvY2FsIHEgPSBtYXRoLmZsb29yKGN1ciAvIGJhc2UpCiAgICByZW0gPSBjdXIgLSBxICogYmFzZQogICAgb3V0W2ldID0gcQogIGVuZAogIC0tIOWOu+WJjeWvvOmbtuWtl+iKggogIGxvY2FsIGogPSAxCiAgd2hpbGUgaiA8PSAjb3V0IGFuZCBvdXRbal0gPT0gMCBkbyBqID0gaiArIDEgZW5kCiAgaWYgaiA+ICNvdXQgdGhlbiByZXR1cm4gJycsIHJlbSBlbmQKICBsb2NhbCByZXN0ID0ge30KICBmb3IgaSA9IGosICNvdXQgZG8gcmVzdFsjcmVzdCArIDFdID0gc3RyaW5nLmNoYXIob3V0W2ldKSBlbmQKICByZXR1cm4gdGFibGUuY29uY2F0KHJlc3QpLCByZW0KZW5kCgotLSDlpKfnq6/lrZfoioLmlbDnu4TkuZjlsI8gYmFzZSDlho3liqAgdu+8iGRlY29kZSDnlKjvvInvvJrov5Tlm57mlrDlrZfoioLmlbDnu4TjgILmr4/mraUgY3VyPDJeMTcg57K+56Gu44CCCmxvY2FsIGZ1bmN0aW9uIG11bGFkZF9ieXRlc19iZShkYXRhLCBiYXNlLCB2KQogIC0tIOS7juS9juS9jSjlj7Mp5b6A6auY5L2NKOW3pinkuZjvvIzov5vkvY3lvoDlt6bkvKAKICBsb2NhbCBvdXQgPSB7fQogIGxvY2FsIGNhcnJ5ID0gdgogIGZvciBpID0gI2RhdGEsIDEsIC0xIGRvCiAgICBsb2NhbCBjdXIgPSBkYXRhOnN1YihpLCBpKTpieXRlKCkgKiBiYXNlICsgY2FycnkKICAgIG91dFtpXSA9IGN1ciAlIDI1NgogICAgY2FycnkgPSBtYXRoLmZsb29yKGN1ciAvIDI1NikKICBlbmQKICAtLSDlpITnkIbpq5jkvY3muqLlh7oKICBsb2NhbCBoZWFkID0ge30KICB3aGlsZSBjYXJyeSA+IDAgZG8KICAgIGhlYWRbI2hlYWQgKyAxXSA9IGNhcnJ5ICUgMjU2CiAgICBjYXJyeSA9IG1hdGguZmxvb3IoY2FycnkgLyAyNTYpCiAgZW5kCiAgLS0g57uE6KOF77yaaGVhZO+8iOmrmOS9jea6ouWHuu+8iSsgb3V077yI5Y6f6ZW/77yM5Y+z5a+56b2Q77yJCiAgbG9jYWwgYWxsID0ge30KICBmb3IgaSA9IDEsICNoZWFkIGRvIGFsbFsjYWxsICsgMV0gPSBoZWFkW2ldIGVuZAogIGZvciBpID0gMSwgI2RhdGEgZG8KICAgIGFsbFsjYWxsICsgMV0gPSBvdXRbaV0KICBlbmQKICBsb2NhbCBieXRlcyA9IHt9CiAgZm9yIGkgPSAxLCAjYWxsIGRvIGJ5dGVzWyNieXRlcyArIDFdID0gc3RyaW5nLmNoYXIoYWxsW2ldKSBlbmQKICBsb2NhbCByZXMgPSB0YWJsZS5jb25jYXQoYnl0ZXMpCiAgLS0g5Y675YmN5a+86Zu25a2X6IqC77yI5pyA5bCP6KGo56S677yJCiAgbG9jYWwgayA9IDEKICB3aGlsZSBrIDw9ICNyZXMgYW5kIHJlczpzdWIoaywgayk6Ynl0ZSgpID09IDAgZG8gayA9IGsgKyAxIGVuZAogIGlmIGsgPiAjcmVzIHRoZW4gcmV0dXJuICcnIGVuZAogIHJldHVybiByZXM6c3ViKGspCmVuZAoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX2dlbmVyaWMoaCwgYWxwaGEsIG1hcF91bnVzZWQsIGJhc2UsIG1hcmtlcikKICBsb2NhbCBkYXRhID0gaGV4X3RvX2J5dGVzKGgpCiAgaWYgI2RhdGEgPT0gMCB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBsZWFkID0gY291bnRfbGVhZGluZ196ZXJvKGRhdGEpCiAgbG9jYWwgcmVzdCA9IGRhdGE6c3ViKGxlYWQgKyAxKQogIGlmIHJlc3QgPT0gJycgdGhlbgogICAgLS0g5YWo6Zu25LiyIOKGkiBsZWFkIOS4quagh+iusAogICAgcmV0dXJuIHN0cmluZy5yZXAobWFya2VyLCBsZWFkKQogIGVuZAogIGxvY2FsIGNoYXJzID0ge30KICBsb2NhbCB3b3JrID0gcmVzdAogIHdoaWxlIHdvcmsgfj0gJycgZG8KICAgIHdvcmssIHIgPSBkaXZfYnl0ZXNfYmUod29yaywgYmFzZSkKICAgIGNoYXJzWyNjaGFycyArIDFdID0gYWxwaGE6c3ViKHIgKyAxLCByICsgMSkKICBlbmQKICBsb2NhbCByZXYgPSB7fQogIGZvciBpID0gI2NoYXJzLCAxLCAtMSBkbyByZXZbI3JldiArIDFdID0gY2hhcnNbaV0gZW5kCiAgcmV0dXJuIHN0cmluZy5yZXAobWFya2VyLCBsZWFkKSAuLiB0YWJsZS5jb25jYXQocmV2KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGRlY29kZV9nZW5lcmljKHMsIGFscGhhX3VudXNlZCwgbWFwLCBiYXNlLCBtYXJrZXIpCiAgaWYgcyA9PSAnJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBsZWFkID0gMAogIGZvciBpID0gMSwgI3MgZG8KICAgIGlmIHM6c3ViKGksIGkpID09IG1hcmtlciB0aGVuIGxlYWQgPSBsZWFkICsgMSBlbHNlIGJyZWFrIGVuZAogIGVuZAogIGxvY2FsIHJlc3QgPSBzOnN1YihsZWFkICsgMSkKICBpZiByZXN0ID09ICcnIHRoZW4KICAgIC0tIOWFqOaYr+agh+iusCDihpIgbGVhZCDkuKrpm7blrZfoioIKICAgIHJldHVybiBzdHJpbmcucmVwKCcwMCcsIGxlYWQpCiAgZW5kCiAgbG9jYWwgYnl0ZXMgPSAnJyAgLS0g5aSn56uv77yM5pyA5bCP6KGo56S6CiAgZm9yIGkgPSAxLCAjcmVzdCBkbwogICAgbG9jYWwgdiA9IG1hcFtyZXN0OnN1YihpLCBpKV0KICAgIGlmIHYgPT0gbmlsIHRoZW4gcmV0dXJuICdFUlI6IGludmFsaWQgY2hhcjogJyAuLiByZXN0OnN1YihpLCBpKSBlbmQKICAgIGJ5dGVzID0gbXVsYWRkX2J5dGVzX2JlKGJ5dGVzLCBiYXNlLCB2KQogIGVuZAogIHJldHVybiBzdHJpbmcucmVwKCcwMCcsIGxlYWQpIC4uIGJ5dGVzX3RvX2hleChieXRlcykKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgb3AgPSBwLm9wCiAgaWYgb3AgPT0gJ2Jhc2U4NV9lbmMnIHRoZW4KICAgIHJldHVybiBlbmNvZGVfZ2VuZXJpYyhwLmhleCBvciBwLnYgb3IgJycsIEE4NSwgQTg1X01BUCwgODUsICcwJykKICBlbHNlaWYgb3AgPT0gJ2Jhc2U4NV9kZWMnIHRoZW4KICAgIHJldHVybiBkZWNvZGVfZ2VuZXJpYyhwLnYgb3IgcC5oZXggb3IgJycsIEE4NSwgQTg1X01BUCwgODUsICcwJykKICBlbHNlaWYgb3AgPT0gJ2Jhc2U1OF9lbmMnIHRoZW4KICAgIHJldHVybiBlbmNvZGVfZ2VuZXJpYyhwLmhleCBvciBwLnYgb3IgJycsIEE1OCwgQTU4X01BUCwgNTgsICcxJykKICBlbHNlaWYgb3AgPT0gJ2Jhc2U1OF9kZWMnIHRoZW4KICAgIHJldHVybiBkZWNvZGVfZ2VuZXJpYyhwLnYgb3IgcC5oZXggb3IgJycsIEE1OCwgQTU4X01BUCwgNTgsICcxJykKICBlbmQKICByZXR1cm4gJ0VSUjogdW5rbm93biBvcCAnIC4uIHRvc3RyaW5nKG9wKQplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIGxvY2FsIG9rLCByID0gcGNhbGwocnVuLCBwKQogIGlmIG9rIHRoZW4gcmV0dXJuIHIgZW5kCiAgcmV0dXJuICdFUlI6ICcgLi4gdG9zdHJpbmcocikKZW5kCgAtLSBAbGliOiBzb3VuZGV4Ci0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDnvo7lm70gU291bmRleCDpn7PnvJbnoIEgKyBkaWZmZXJlbmNlIOebuOS8vOW6pu+8iFNRTGl0ZSBleHRlbnNpb24tZnVuY3Rpb25zLmMg55qEIHNvdW5kZXgoKS9kaWZmZXJlbmNlKCnvvInjgIIKLS0gICAgICAgRHVja0RCIOWOn+eUn+WPquaciSBsZXZlbnNodGVpbu+8iOe8lui+kei3neemu++8ie+8jOayoeaciemfs+i/keWMuemFjSDihpIg6L+Z5piv5a2X56ym5LiyIGdhcCDph4zllK/kuIDnnJ/nvLrlj6PjgIIKLS0gICAgICAgb3A9J3NvdW5kZXgnICAg77yacC52IOKGkiA0IOS9jSBTb3VuZGV4IOe8luegge+8iCdSMTYzJyDlvaLlvI/vvIzmoIflh4bnvo7lm70gU291bmRleO+8iQotLSAgICAgICBvcD0nZGlmZmVyZW5jZSc6IHAuYSArIHAuYiDihpIgMC00IOaVtOaVsO+8iOS4pOS4qiBTb3VuZGV4IOe8lueggemAkOS9jeebuOWQjOeahOS9jeaVsO+8jAotLSAgICAgICAgICAgICAgICAgICAgICAgIOS4jiBTUUxpdGUgZGlmZmVyZW5jZSgpIOivreS5ieS4gOiHtO+8muWvueWQhOiHqiBzb3VuZGV4IOWQjumAkOS9jeavlOi+g++8iQotLSAgICAgICDnrpfms5UgPSDmoIflh4bnvo7lm70gU291bmRleO+8iENlbnN1cyDop4TliJnvvInvvJoKLS0gICAgICAgICAqIOWPquS/neeVmeWtl+avje+8jOmmluWtl+avjeS/neeVme+8iOmmluWtl+avjeWQjOeggeS5n+iuoe+8iQotLSAgICAgICAgICogQkZQVj0xIENHSktRU1haPTIgRFQ9MyBMPTQgTU49NSBSPTbvvIzlhbbkvZnlhYPpn7MoQUVJT1Up5LiN57yW56CB5LiUKirph43nva4qKuWJjeeggQotLSAgICAgICAgICogSC9XL1kg5LiN57yW56CB5L2GKirkuI3ph43nva4qKuWJjeegge+8iOWQjOeggeiiqyBIL1cvWSDpmpTlvIDku43nrpfnm7jpgrvlkIznoIHvvIzlj6rlj5bkuIDmrKHvvIkKLS0gICAgICAgICAqIOi/nue7reWQjOeggeWPquWPluesrOS4gOS4qu+8m+S4jei2s+ihpSAwIOWIsCA0IOS9jQotLSBAc291cmNlOiDmoIflh4bnvo7lm70gU291bmRleO+8iFUuUy4gQ2Vuc3Vz77yJ77yb6K+t5LmJ5a+56b2QIFNRTGl0ZSBleHRlbnNpb24tZnVuY3Rpb25zLmMKLS0gQHJlcXVpcmVzOiDml6DvvIjnuq8gTHVh77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZO+8iOWvueaLjSBweXRob24zIOagh+WHhiBTb3VuZGV4IG9yYWNsZe+8jOingSB0ZXN0X3NvdW5kZXguc3Fs77yJCi0tCi0tIFVzYWdlOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3NvdW5kZXgnKTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3NvdW5kZXgnLCB7djonUm9iZXJ0Jywgb3A6J3NvdW5kZXgnfSk7ICAgICAgICAgIOKGkiAnUjE2MycKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3NvdW5kZXgnLCB7djonUmFiYXJ0Jywgb3A6J3NvdW5kZXgnfSk7ICAgICAgICAgIOKGkiAnUjE2MycKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3NvdW5kZXgnLCB7YTonUm9iZXJ0JywgYjonUmFiYXJ0Jywgb3A6J2RpZmZlcmVuY2UnfSk7IOKGkiA0Cgpsb2NhbCBjb2RlID0gewogIEI9JzEnLCBGPScxJywgUD0nMScsIFY9JzEnLAogIEM9JzInLCBHPScyJywgSj0nMicsIEs9JzInLCBRPScyJywgUz0nMicsIFg9JzInLCBaPScyJywKICBEPSczJywgVD0nMycsCiAgTD0nNCcsCiAgTT0nNScsIE49JzUnLAogIFI9JzYnLAp9CmxvY2FsIEhXWSA9IHsgSD10cnVlLCBXPXRydWUsIFk9dHJ1ZSB9Cgpsb2NhbCBmdW5jdGlvbiBzb3VuZGV4KHdvcmQpCiAgbG9jYWwgdyA9ICcnCiAgZm9yIGNoIGluIHRvc3RyaW5nKHdvcmQpOnVwcGVyKCk6Z21hdGNoKCclYScpIGRvCiAgICB3ID0gdyAuLiBjaAogIGVuZAogIGlmIHcgPT0gJycgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgcmVzID0gdzpzdWIoMSwgMSkKICBsb2NhbCBwcmV2ID0gY29kZVt3OnN1YigxLCAxKV0KICBmb3IgaSA9IDIsICN3IGRvCiAgICBsb2NhbCBjID0gdzpzdWIoaSwgaSkKICAgIGxvY2FsIGQgPSBjb2RlW2NdCiAgICBpZiBkID09IG5pbCB0aGVuCiAgICAgIGlmIEhXWVtjXSB0aGVuCiAgICAgICAgLS0gSC9XL1nvvJrkuI3ph43nva4gcHJldu+8iOS4jemHjeWkjeebuOmCu+WQjOegge+8iQogICAgICBlbHNlCiAgICAgICAgcHJldiA9IG5pbCAgLS0g5YWD6Z+z562J77ya6YeN572uIHByZXbvvIjliIbpmpTnrKbvvIkKICAgICAgZW5kCiAgICBlbHNlCiAgICAgIGlmIGQgfj0gcHJldiB0aGVuCiAgICAgICAgcmVzID0gcmVzIC4uIGQKICAgICAgICBwcmV2ID0gZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiAocmVzIC4uICcwMDAnKTpzdWIoMSwgNCkKZW5kCgpsb2NhbCBmdW5jdGlvbiBkaWZmZXJlbmNlKGEsIGIpCiAgbG9jYWwgc2EsIHNiID0gc291bmRleChhKSwgc291bmRleChiKQogIGxvY2FsIG4gPSAjc2EgPCAjc2IgYW5kICNzYSBvciAjc2IKICBsb2NhbCBzYW1lID0gMAogIGZvciBpID0gMSwgbiBkbwogICAgaWYgc2E6c3ViKGksIGkpID09IHNiOnN1YihpLCBpKSB0aGVuIHNhbWUgPSBzYW1lICsgMSBlbmQKICBlbmQKICByZXR1cm4gdG9zdHJpbmcoc2FtZSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdzb3VuZGV4JwogIGlmIG9wID09ICdzb3VuZGV4JyB0aGVuCiAgICByZXR1cm4gc291bmRleChwLnYgb3IgJycpCiAgZWxzZWlmIG9wID09ICdkaWZmZXJlbmNlJyB0aGVuCiAgICByZXR1cm4gZGlmZmVyZW5jZShwLmEgb3IgJycsIHAuYiBvciAnJykKICBlbmQKICByZXR1cm4gJ0VSUjogdW5rbm93biBvcCAnIC4uIHRvc3RyaW5nKG9wKQplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIGxvY2FsIG9rLCByID0gcGNhbGwocnVuLCBwKQogIGlmIG9rIHRoZW4gcmV0dXJuIHIgZW5kCiAgcmV0dXJuICdFUlI6ICcgLi4gdG9zdHJpbmcocikKZW5kCgAtLSBAbGliOiByc2lfc2NvcmVyCi0tIEBjYXRlZ29yeTogbWwKLS0gQGRlc2M6IOaJp+ihjOeJueW+geaJk+WIhumAieaLqeWZqO+8iOS4lueVjOaooeWei+S9juS/neecn+eJiO+8ieKAlOKAlOWAmemAieWKqOS9nOWFiOS9juaIkOacrOivlei3keaNleiOt+aJp+ihjOeJueW+ge+8jAotLSAgICAgICAg54m55b6B5Yqg5p2D5ZKM77yI5oSf55+l5py6L+mAu+i+keWbnuW9kuW8j+aJk+WIhu+8iemAieWHuiBhcmdtYXgg5YCZ6YCJ77yb5Y6G5Y+yIHBhc3MvZmFpbCDlj6/lnKjnur8KLS0gICAgICAgIOaEn+efpeacuumHjeS8sOadg+mHje+8iExlYXJu4oaSUmV0YWluIOeahOS9juS/neecn+etieS7t+eJqe+8ieOAggotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0gICDorr7orqHvvJpSU0ktQW55dGhpbmfvvIhhclhpdiAyNjEwLjEzOTEy77yJ55So5LiW55WM5qih5Z6L77yISkVQQSDmvZznqbrpl7TpooTmtYvvvInlr7nlgJnpgInliqjkvZwKLS0gICDmiZPliIbpgInmi6nvvJvmnKzlupPmmK/lhbbkvY7kv53nnJ/nrYnku7fnianigJTigJTnlKjjgIzmiafooYznibnlvoHliqDmnYPlkozjgI3mm7/ku6PmvZznqbrpl7TpooTmtYvvvJoKLS0gICAgIDEpIOWAmemAieWFiOS9juaIkOacrOivlei3kSDihpIg5o2V6I635omn6KGM54m55b6B77yIZXhlY19vay9yb3dfY291bnQvbGF0ZW5jeV9tcy9udWxsX3JhdGUvLi4u77yJCi0tICAgICAyKSBzY29yZSA9IOaEn+efpeacuuWKoOadg+WSjO+8iGV4ZWNfb2sg5p2D6YeN5pyA6auY77yM5oql6ZSZ5YCZ6YCJ5aSn6LSf5YiG77yJCi0tICAgICAzKSBzZWxlY3QgPSDkuIDnu4TlgJnpgInph4zlj5YgYXJnbWF477yI5bm25YiX5oyJIGNhbmRpZGF0ZV9pZCDlrZflhbjluo/vvIznoa7lrprmgKfvvIkKLS0gICAgIDQpIHVwZGF0ZV93ZWlnaHRzID0g55So5Y6G5Y+y77yI54m55b6BK+acgOe7iCBwYXNzL2ZhaWzvvInlnKjnur/mhJ/nn6XmnLrmm7TmlrDmnYPph40rYmlhcwotLSAgICAgIOKAlOKAlOOAjOS4lueVjOaooeWei+mAguW6lOOAjeeahOS9juS/neecn+eJiO+8iOaJk+WIhuWktOWtpuS8muWBj+WQkeiiq+mqjOivgeaIkOWKn+eahOeJueW+gee7hOWQiO+8ieOAggotLQotLSAgIOWPguaVsOW9ouaAge+8muaJgOacieWFpeWPgu+8iGZlYXR1cmVzL3dlaWdodHMvY2FuZGlkYXRlcy9oaXN0b3J577yJ5pei5Y+v5Lul5pivIFNRTCDkvqcKLS0gICDnu5PmnoTljJbooajvvIhzdHJ1Y3QgLyBsaXN0KHN0cnVjdCnvvInvvIzkuZ/lj6/ku6XmmK8gSlNPTiDlrZfnrKbkuLLigJTigJTmnKzlupPlhoXnva7pm7bkvp3otZYKLS0gICBKU09OIOino+egge+8jOWboOatpCB1cGRhdGVfd2VpZ2h0cyDov5Tlm57nmoQgSlNPTiDlj6/nm7TmjqXlm57lloLnu5nkuIvkuIDova7nmoQgd2VpZ2h0czog5Y+C5pWw44CCCi0tICAg54m55b6B5a2X5q6177yI5Z2H5Y+v57y655yB77yM57y655yBPeaXoOivgeaNruKGkuS4reaAp+WIhu+8jOWUryBleGVjX29rIOe8uuecgeaMiSAwL+Wksei0pSDlpITnkIbvvInvvJoKLS0gICAgIGV4ZWNfb2sgICAgICAgIERPVUJMRSAg6K+V6LeR5piv5ZCm5oiQ5YqfIDEvMO+8iOaguOW/g+S/oeWPt++8iQotLSAgICAgcm93X2NvdW50ICAgICAgRE9VQkxFICDkuqflh7rooYzmlbDvvIjkuI4gZXhwZWN0X3Jvd3Mg5a+554Wn5YGa5ZCI55CG5oCn5YiG77yJCi0tICAgICBleHBlY3Rfcm93cyAgICBET1VCTEUgIOacn+acm+ihjOaVsO+8iOiwg+eUqOaWuee7meWHuu+8m+e8uuecgeWImeihjOaVsOWIhuS4reaAp++8iQotLSAgICAgcm93X3RvbGVyYW5jZSAgRE9VQkxFICDooYzmlbDlrrnlt67mr5TkvovvvIjnvLrnnIEgMC4177yJCi0tICAgICBsYXRlbmN5X21zICAgICBET1VCTEUgIOaJp+ihjOW7tui/n++8iOi2hSBsYXRlbmN5X2J1ZGdldF9tcyDnur/mgKfmg6nnvZrvvIznvLrnnIHpooTnrpcgMjAwMG1z77yJCi0tICAgICBudWxsX3JhdGUgICAgICBET1VCTEUgIOe7k+aenOmbhuepuuWAvOeOhyAwLi4x77yI57q/5oCn5oOp572a77yJCi0tICAgICBlcnJvcl9jbGFzcyAgICBWQVJDSEFSICAnb2snLyd0aW1lb3V0Jy8nc3ludGF4Jy8nc2VtYW50aWNzJy8ncnVudGltZScvJ2RhdGEnLydvdGhlcicKLS0KLS0gICBvcCDliIblj5HvvIhsdWFqaXRfcygncnNpX3Njb3JlcicsIHtvcDouLi4sIC4uLn0p77yJ77yaCi0tICAgICBmZWF0dXJlcyAgICAgICB7Zjp7Li4ufX0gICAgICAgICAgICAgICAgICAgICAgICAgIOKGkiDlvZLkuIDljJbnibnlvoEgKyDpgJDnibnlvoHln7rnoYDliIYgSlNPTgotLSAgICAgc2NvcmUgICAgICAgICAge2Y6ey4uLn0sIHdlaWdodHM6ey4uLn0sIGJpYXM/fSAgICDihpIge3Njb3JlLCBjb250cmlidXRpb25zfSBKU09OCi0tICAgICBzZWxlY3QgICAgICAgICB7Y2FuZGlkYXRlczpbe2NhbmRpZGF0ZV9pZCwgZmVhdHVyZXM6ey4uLn19LC4uLl0sCi0tICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0czp7Li4ufSwgYmlhcz8sIH0gICAgICAgICAgIOKGkiB7c2VsZWN0ZWRfaWQsIHNjb3JlLCByYW5raW5nfQotLSAgICAgdXBkYXRlX3dlaWdodHMge2hpc3Rvcnk6W3tmZWF0dXJlczp7Li4ufSwgcGFzczoxfDB8Ym9vbH0sLi4uXSwKLS0gICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzOnsuLi59LCBscj8sIGVwb2Nocz8sIGJpYXM/fSDihpIge3dlaWdodHMsIGJpYXMsIHNhbXBsZXMsIHVwZGF0ZXN9Ci0tICAgICBkZWZhdWx0X3dlaWdodHMge30gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKGkiDlh7rljoLmnYPph40gSlNPTgotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6IFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0ncnNpX3Njb3JlcicpOwotLSAgIHNjb3JlOiAgIFNFTEVDVCBsdWFqaXRfcygncnNpX3Njb3JlcicsCi0tICAgICAgICAgICAgICB7b3A6J3Njb3JlJywgZjp7ZXhlY19vazoxLCByb3dfY291bnQ6MTAwMCwgZXhwZWN0X3Jvd3M6MTAwMCwKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRlbmN5X21zOjEyMCwgbnVsbF9yYXRlOjAuMDEsIGVycm9yX2NsYXNzOidvayd9fSk7Ci0tICAgc2VsZWN0OiAgU0VMRUNUIGx1YWppdF9zKCdyc2lfc2NvcmVyJywKLS0gICAgICAgICAgICAgIHtvcDonc2VsZWN0JywgY2FuZGlkYXRlczpbCi0tICAgICAgICAgICAgICAgICB7Y2FuZGlkYXRlX2lkOidjMScsIGZlYXR1cmVzOntleGVjX29rOjEsIHJvd19jb3VudDoxMDAwLAotLSAgICAgICAgICAgICAgICAgICBleHBlY3Rfcm93czoxMDAwLCBsYXRlbmN5X21zOjEyMCwgbnVsbF9yYXRlOjAuMDEsIGVycm9yX2NsYXNzOidvayd9fSwKLS0gICAgICAgICAgICAgICAgIHtjYW5kaWRhdGVfaWQ6J2MyJywgZmVhdHVyZXM6e2V4ZWNfb2s6MCwgcm93X2NvdW50OjAsCi0tICAgICAgICAgICAgICAgICAgIGxhdGVuY3lfbXM6OTAsIGVycm9yX2NsYXNzOidzeW50YXgnfX1dfSk7Ci0tICAg4oaSICd7InNlbGVjdGVkX2lkIjoiYzEiLCJzY29yZSI6Mi45OCwicmFua2luZyI6Wy4uLl19JwotLSAgIGxlYXJuOiAgIFNFTEVDVCBsdWFqaXRfcygncnNpX3Njb3JlcicsCi0tICAgICAgICAgICAgICB7b3A6J3VwZGF0ZV93ZWlnaHRzJywKLS0gICAgICAgICAgICAgICBoaXN0b3J5Olt7ZmVhdHVyZXM6e2V4ZWNfb2s6MSxyb3dfY291bnQ6NTAwLGV4cGVjdF9yb3dzOjUwMH0scGFzczp0cnVlfSwKLS0gICAgICAgICAgICAgICAgICAgICAgICB7ZmVhdHVyZXM6e2V4ZWNfb2s6MCxyb3dfY291bnQ6MCxlcnJvcl9jbGFzczonc3ludGF4J30scGFzczpmYWxzZX1dfSk7Ci0tCi0tIOivmuWunui+ueeVjO+8mgotLSAgICog5p2D6YeN5piv5omL5bel5YWI6aqML+aEn+efpeacuuWcqOe6v+abtOaWsO+8jOS4jeaYr+a9nOepuumXtOaooeWei++8m+eJueW+gS3nu5PmnpzlvLrnm7jlhbPml7bmnInmlYjvvIwKLS0gICAgIOW8seebuOWFs+aXtumAgOWMluS4uiBzdGF0aWMg5qGj77yI5a6e6aqM5a+554Wn57uE5Y2z6aqM5q2k54K577yJ44CCCi0tICAgKiDmiZPliIbkuI3lgZogc2lnbW9pZO+8iOaOkuW6j+eUqOmAlO+8jGFyZ21heCDkuI3lj5jvvInvvJvovpPlh7rkv53nlZkgNiDkvY3mnInmlYjlsI/mlbDjgIIKLS0gICAqIEx1YUpJVCDmlbDlrZfmmK8gZG91Ymxl77yaMl41MyDlhoXmlbTmlbDml6DmjZ/jgIIKLS0gICAqIOmAieaLqeetlueVpe+8iHJhbmRvbS9zdGF0aWMvZnVsbO+8ieWcqCBTUUwg5L6n57uE5ZCI77yacmFuZG9tIOeUqCBEdWNrREIgcmFuZG9tKCnvvIwKLS0gICAgIHN0YXRpYyA9IOS7hSB7ZXhlY19vazoxfSDmnYPph43vvIxmdWxsID0g5YWo54m55b6B5p2D6YeN77yI5oiWIHVwZGF0ZV93ZWlnaHRzIOS6p+eJqe+8ieOAggoKbG9jYWwgcnNpID0ge30KCmxvY2FsIGZ1bmN0aW9uIGpzb25fc3RyKHMpCiAgcmV0dXJuICciJyAuLiB0b3N0cmluZyhzKTpnc3ViKCdbJWMiXFxdJywgZnVuY3Rpb24oYykKICAgIGxvY2FsIG0gPSB7IFsnXG4nXSA9ICdcXG4nLCBbJ1xyJ10gPSAnXFxyJywgWydcdCddID0gJ1xcdCcsIFsnIiddID0gJ1xcIicsIFsnXFwnXSA9ICdcXFxcJyB9CiAgICByZXR1cm4gbVtjXSBvciBzdHJpbmcuZm9ybWF0KCdcXHUlMDR4JywgYzpieXRlKCkpCiAgZW5kKSAuLiAnIicKZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX251bSh2KQogIGlmIHR5cGUodikgfj0gJ251bWJlcicgb3IgdiB+PSB2IG9yIHYgPT0gbWF0aC5odWdlIG9yIHYgPT0gLW1hdGguaHVnZSB0aGVuCiAgICByZXR1cm4gJ251bGwnCiAgZW5kCiAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyUuNmcnLCB2KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGpzb25fZW5jb2RlKHYpCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICdudW1iZXInIHRoZW4gcmV0dXJuIGpzb25fbnVtKHYpIGVuZAogIGlmIHQgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4ganNvbl9zdHIodikgZW5kCiAgaWYgdCA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCiAgaWYgdCA9PSAnbmlsJyB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgaWYgdCB+PSAndGFibGUnIHRoZW4gcmV0dXJuICdudWxsJyBlbmQKICBsb2NhbCBuID0gI3YKICBpZiBuID4gMCB0aGVuCiAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICBmb3IgaSA9IDEsIG4gZG8gcGFydHNbaV0gPSBqc29uX2VuY29kZSh2W2ldKSBlbmQKICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogIGVuZAogIGxvY2FsIHBhcnRzID0ge30KICBsb2NhbCBrZXlzID0ge30KICBmb3IgayBpbiBwYWlycyh2KSBkbyBrZXlzWyNrZXlzICsgMV0gPSBrIGVuZAogIHRhYmxlLnNvcnQoa2V5cywgZnVuY3Rpb24oYSwgYikgcmV0dXJuIHRvc3RyaW5nKGEpIDwgdG9zdHJpbmcoYikgZW5kKQogIGZvciBfLCBrIGluIGlwYWlycyhrZXlzKSBkbwogICAgcGFydHNbI3BhcnRzICsgMV0gPSBqc29uX3N0cihrKSAuLiAnOicgLi4ganNvbl9lbmNvZGUodltrXSkKICBlbmQKICByZXR1cm4gJ3snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnfScKZW5kCgpsb2NhbCBmdW5jdGlvbiByNih4KSByZXR1cm4gbWF0aC5mbG9vcih4ICogMWU2ICsgMC41KSAvIDFlNiBlbmQKCi0tIOaegeeugCBKU09OIOino+egge+8iOiHquWMheWQq++8jOmbtuS+nei1lu+8ie+8mm9iamVjdC9hcnJheS9zdHJpbmcvbnVtYmVyL3RydWUvZmFsc2UvbnVsbAotLSDmlK/mjIEgXCIgXFwgXC8gXG4gXHIgXHQgXGIgXGYg5LiOIFx1WFhYWO+8iOWQqyBVVEYtOCDnvJbnoIHvvIkKbG9jYWwgZnVuY3Rpb24ganNvbl9kZWNvZGUocykKICBpZiB0eXBlKHMpIH49ICdzdHJpbmcnIHRoZW4gZXJyb3IoJ2pzb25fZGVjb2RlOiBub3QgYSBzdHJpbmcnKSBlbmQKICBsb2NhbCBwb3MgPSAxCiAgbG9jYWwgZnVuY3Rpb24gZXJyKG0pIGVycm9yKCdqc29uOiAnIC4uIG0gLi4gJyBhdCBwb3MgJyAuLiBwb3MsIDApIGVuZAogIGxvY2FsIGZ1bmN0aW9uIHdzKCkKICAgIHdoaWxlIHBvcyA8PSAjcyBkbwogICAgICBsb2NhbCBjID0gczpzdWIocG9zLCBwb3MpCiAgICAgIGlmIGMgPT0gJyAnIG9yIGMgPT0gJ1x0JyBvciBjID09ICdcbicgb3IgYyA9PSAnXHInIHRoZW4gcG9zID0gcG9zICsgMSBlbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gdXRmOChjcCkKICAgIGlmIGNwIDwgMTI4IHRoZW4gcmV0dXJuIHN0cmluZy5jaGFyKGNwKSBlbmQKICAgIGlmIGNwIDwgMjA0OCB0aGVuCiAgICAgIHJldHVybiBzdHJpbmcuY2hhcigxOTIgKyBtYXRoLmZsb29yKGNwIC8gNjQpLCAxMjggKyBjcCAlIDY0KQogICAgZW5kCiAgICByZXR1cm4gc3RyaW5nLmNoYXIoMjI0ICsgbWF0aC5mbG9vcihjcCAvIDQwOTYpLAogICAgICAgICAgICAgICAgICAgICAgIDEyOCArIG1hdGguZmxvb3IoY3AgLyA2NCkgJSA2NCwgMTI4ICsgY3AgJSA2NCkKICBlbmQKICBsb2NhbCBwYXJzZV92YWx1ZQogIGxvY2FsIGZ1bmN0aW9uIHBhcnNlX3N0cmluZygpCiAgICBwb3MgPSBwb3MgKyAxCiAgICBsb2NhbCBvdXQgPSB7fQogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBsb2NhbCBjID0gczpzdWIocG9zLCBwb3MpCiAgICAgIGlmIGMgPT0gJycgdGhlbiBlcnIoJ3VudGVybWluYXRlZCBzdHJpbmcnKSBlbmQKICAgICAgaWYgYyA9PSAnIicgdGhlbiBwb3MgPSBwb3MgKyAxIGJyZWFrIGVuZAogICAgICBpZiBjID09ICdcXCcgdGhlbgogICAgICAgIGxvY2FsIGUgPSBzOnN1Yihwb3MgKyAxLCBwb3MgKyAxKQogICAgICAgIGlmIGUgPT0gJ3UnIHRoZW4KICAgICAgICAgIGxvY2FsIGhleCA9IHM6c3ViKHBvcyArIDIsIHBvcyArIDUpCiAgICAgICAgICBsb2NhbCBjcCA9IHRvbnVtYmVyKGhleCwgMTYpCiAgICAgICAgICBpZiBjcCA9PSBuaWwgdGhlbiBlcnIoJ2JhZCB1bmljb2RlIGVzY2FwZScpIGVuZAogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHV0ZjgoY3ApCiAgICAgICAgICBwb3MgPSBwb3MgKyA2CiAgICAgICAgZWxzZWlmIGUgPT0gJ24nIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcbic7IHBvcyA9IHBvcyArIDIKICAgICAgICBlbHNlaWYgZSA9PSAncicgdGhlbiBvdXRbI291dCArIDFdID0gJ1xyJzsgcG9zID0gcG9zICsgMgogICAgICAgIGVsc2VpZiBlID09ICd0JyB0aGVuIG91dFsjb3V0ICsgMV0gPSAnXHQnOyBwb3MgPSBwb3MgKyAyCiAgICAgICAgZWxzZWlmIGUgPT0gJ2InIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcYic7IHBvcyA9IHBvcyArIDIKICAgICAgICBlbHNlaWYgZSA9PSAnZicgdGhlbiBvdXRbI291dCArIDFdID0gJ1xmJzsgcG9zID0gcG9zICsgMgogICAgICAgIGVsc2VpZiBlID09ICciJyBvciBlID09ICdcXCcgb3IgZSA9PSAnLycgdGhlbgogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IGU7IHBvcyA9IHBvcyArIDIKICAgICAgICBlbHNlIGVycignYmFkIGVzY2FwZScpIGVuZAogICAgICBlbHNlCiAgICAgICAgb3V0WyNvdXQgKyAxXSA9IGM7IHBvcyA9IHBvcyArIDEKICAgICAgZW5kCiAgICBlbmQKICAgIHJldHVybiB0YWJsZS5jb25jYXQob3V0KQogIGVuZAogIHBhcnNlX3ZhbHVlID0gZnVuY3Rpb24oKQogICAgd3MoKQogICAgbG9jYWwgYyA9IHM6c3ViKHBvcywgcG9zKQogICAgaWYgYyA9PSAneycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGxvY2FsIG9iaiA9IHt9CiAgICAgIHdzKCkKICAgICAgaWYgczpzdWIocG9zLCBwb3MpID09ICd9JyB0aGVuIHBvcyA9IHBvcyArIDEgcmV0dXJuIG9iaiBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHdzKCkKICAgICAgICBpZiBzOnN1Yihwb3MsIHBvcykgfj0gJyInIHRoZW4gZXJyKCdleHBlY3RlZCBvYmplY3Qga2V5JykgZW5kCiAgICAgICAgbG9jYWwgayA9IHBhcnNlX3N0cmluZygpCiAgICAgICAgd3MoKQogICAgICAgIGlmIHM6c3ViKHBvcywgcG9zKSB+PSAnOicgdGhlbiBlcnIoJ2V4cGVjdGVkIDonKSBlbmQKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgICAgb2JqW2tdID0gcGFyc2VfdmFsdWUoKQogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBkID0gczpzdWIocG9zLCBwb3MpCiAgICAgICAgaWYgZCA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIGQgPT0gJ30nIHRoZW4gcG9zID0gcG9zICsgMSBicmVhawogICAgICAgIGVsc2UgZXJyKCdleHBlY3RlZCAsIG9yIH0nKSBlbmQKICAgICAgZW5kCiAgICAgIHJldHVybiBvYmoKICAgIGVsc2VpZiBjID09ICdbJyB0aGVuCiAgICAgIHBvcyA9IHBvcyArIDEKICAgICAgbG9jYWwgYXJyID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MsIHBvcykgPT0gJ10nIHRoZW4gcG9zID0gcG9zICsgMSByZXR1cm4gYXJyIGVuZAogICAgICB3aGlsZSB0cnVlIGRvCiAgICAgICAgYXJyWyNhcnIgKyAxXSA9IHBhcnNlX3ZhbHVlKCkKICAgICAgICB3cygpCiAgICAgICAgbG9jYWwgZCA9IHM6c3ViKHBvcywgcG9zKQogICAgICAgIGlmIGQgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICAgIGVsc2VpZiBkID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDEgYnJlYWsKICAgICAgICBlbHNlIGVycignZXhwZWN0ZWQgLCBvciBdJykgZW5kCiAgICAgIGVuZAogICAgICByZXR1cm4gYXJyCiAgICBlbHNlaWYgYyA9PSAnIicgdGhlbgogICAgICByZXR1cm4gcGFyc2Vfc3RyaW5nKCkKICAgIGVsc2VpZiBjID09ICd0JyB0aGVuCiAgICAgIGlmIHM6c3ViKHBvcywgcG9zICsgMykgPT0gJ3RydWUnIHRoZW4gcG9zID0gcG9zICsgNCByZXR1cm4gdHJ1ZQogICAgICBlbHNlIGVycignYmFkIGxpdGVyYWwnKSBlbmQKICAgIGVsc2VpZiBjID09ICdmJyB0aGVuCiAgICAgIGlmIHM6c3ViKHBvcywgcG9zICsgNCkgPT0gJ2ZhbHNlJyB0aGVuIHBvcyA9IHBvcyArIDUgcmV0dXJuIGZhbHNlCiAgICAgIGVsc2UgZXJyKCdiYWQgbGl0ZXJhbCcpIGVuZAogICAgZWxzZWlmIGMgPT0gJ24nIHRoZW4KICAgICAgaWYgczpzdWIocG9zLCBwb3MgKyAzKSA9PSAnbnVsbCcgdGhlbiBwb3MgPSBwb3MgKyA0IHJldHVybiBuaWwKICAgICAgZWxzZSBlcnIoJ2JhZCBsaXRlcmFsJykgZW5kCiAgICBlbHNlCiAgICAgIGxvY2FsIG51bSA9IHM6bWF0Y2goJ1stK10/JWQqJS4/JWQrW2VFXT9bLStdPyVkKicsIHBvcykKICAgICAgICAgICAgICAgIG9yIHM6bWF0Y2goJyVkKyUuPyVkKltlRV1bLStdPyVkKycsIHBvcykKICAgICAgICAgICAgICAgIG9yIHM6bWF0Y2goJyVkKycsIHBvcykKICAgICAgaWYgbm90IG51bSBvciBudW0gPT0gJycgdGhlbiBlcnIoJ2JhZCB2YWx1ZScpIGVuZAogICAgICBsb2NhbCB2ID0gdG9udW1iZXIobnVtKQogICAgICBwb3MgPSBwb3MgKyAjbnVtCiAgICAgIHJldHVybiB2CiAgICBlbmQKICBlbmQKICBsb2NhbCB2ID0gcGFyc2VfdmFsdWUoKQogIHdzKCkKICBpZiBwb3MgPD0gI3MgdGhlbiBlcnIoJ3RyYWlsaW5nIGRhdGEnKSBlbmQKICByZXR1cm4gdgplbmQKCi0tIOWPguaVsOW9kuS4gO+8mnRhYmxlIOebtOeUqO+8m0pTT04g5a2X56ym5LiyIOKGkiDop6PnoIHmiJAgdGFibGXvvIjmlK/mjIHmioogdXBkYXRlX3dlaWdodHMg55qECi0tIOi/lOWbniBKU09OIOebtOaOpeWbnuWWgue7mSB3ZWlnaHRzOi9mZWF0dXJlczovY2FuZGlkYXRlczog5Y+C5pWw77yJCmxvY2FsIGZ1bmN0aW9uIGFzX3RhYmxlKHgpCiAgaWYgdHlwZSh4KSA9PSAndGFibGUnIHRoZW4gcmV0dXJuIHggZW5kCiAgaWYgdHlwZSh4KSA9PSAnc3RyaW5nJyBhbmQgeCB+PSAnJyB0aGVuCiAgICBsb2NhbCBvaywgdCA9IHBjYWxsKGpzb25fZGVjb2RlLCB4KQogICAgaWYgb2sgYW5kIHR5cGUodCkgPT0gJ3RhYmxlJyB0aGVuIHJldHVybiB0IGVuZAogIGVuZAogIHJldHVybiBuaWwKZW5kCgoKbG9jYWwgREVGQVVMVF9XRUlHSFRTID0gewogIGV4ZWNfb2sgPSAyLjAsICAgICAgLS0g5pyA6auY5p2D6YeN77ya5oql6ZSZ5YCZ6YCJ55u05o6l5aSn6LSf5YiGCiAgcm93X2NvdW50ID0gMS4wLCAgICAtLSDooYzmlbDlkIjnkIbmgKcKICBsYXRlbmN5X21zID0gMC41LCAgIC0tIOW7tui/n+aDqee9mgogIG51bGxfcmF0ZSA9IDEuMCwgICAgLS0g56m65YC8546H5oOp572aCiAgZXJyb3JfY2xhc3MgPSAwLjIsICAtLSDplJnor6/nsbvliKvljLrliIbluqYKfQoKLS0g5p2D6YeN5b2S5LiA77ya5pi+5byP57uZ55qE5p2D6YeN6KGo5Y+q55So57uZ5a6a55qE6ZSu77yI5aaCIHN0YXRpYyDmoaMge2V4ZWNfb2s6MX0g4oaSIOecn+eahOWPqueciyBleGVjX29r77yJ77ybCi0tIOacquaPkOS+my/nqbrooagg4oaSIOWHuuWOguWFqOeJueW+geadg+mHje+8iOS/neaMgSB1cGRhdGVfd2VpZ2h0cyDliY3lkI7mnYPph43lkIzmnoTvvIkKbG9jYWwgZnVuY3Rpb24gbm9ybV93ZWlnaHRzKHcpCiAgdyA9IGFzX3RhYmxlKHcpCiAgaWYgdyBhbmQgbmV4dCh3KSB+PSBuaWwgdGhlbgogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBrLCB2IGluIHBhaXJzKHcpIGRvIG91dFtrXSA9IHRvbnVtYmVyKHYpIG9yIDAgZW5kCiAgICByZXR1cm4gb3V0CiAgZW5kCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaywgdiBpbiBwYWlycyhERUZBVUxUX1dFSUdIVFMpIGRvIG91dFtrXSA9IHYgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIG5vcm1fZmVhdHVyZXMoZikKICBmID0gYXNfdGFibGUoZikgb3Ige30KICBsb2NhbCBvdXQgPSB7fQogIG91dC5leGVjX29rID0gdG9udW1iZXIoZi5leGVjX29rKSB+PSBuaWwgYW5kIHRvbnVtYmVyKGYuZXhlY19vaykgb3IgMAogIGlmIG91dC5leGVjX29rID49IDEgdGhlbiBvdXQuZXhlY19vayA9IDEgZWxzZWlmIG91dC5leGVjX29rIDw9IDAgdGhlbiBvdXQuZXhlY19vayA9IDAgZW5kCiAgb3V0LnJvd19jb3VudCA9IHRvbnVtYmVyKGYucm93X2NvdW50KQogIG91dC5leHBlY3Rfcm93cyA9IHRvbnVtYmVyKGYuZXhwZWN0X3Jvd3MpCiAgb3V0LnJvd190b2xlcmFuY2UgPSB0b251bWJlcihmLnJvd190b2xlcmFuY2UpIG9yIDAuNQogIG91dC5sYXRlbmN5X21zID0gdG9udW1iZXIoZi5sYXRlbmN5X21zKQogIG91dC5sYXRlbmN5X2J1ZGdldF9tcyA9IHRvbnVtYmVyKGYubGF0ZW5jeV9idWRnZXRfbXMpIG9yIDIwMDAKICBvdXQubnVsbF9yYXRlID0gdG9udW1iZXIoZi5udWxsX3JhdGUpCiAgb3V0LmVycm9yX2NsYXNzID0gdG9zdHJpbmcoZi5lcnJvcl9jbGFzcyBvciAnb2snKQogIGlmIG91dC5lcnJvcl9jbGFzcyB+PSAnb2snIGFuZCBvdXQuZXhlY19vayA9PSAxIHRoZW4KICAgIG91dC5lcnJvcl9jbGFzcyA9ICdvaycgLS0g5oiQ5Yqf5Y205qCH6ZSZ6K+v57G75Yir77ya5LulIGV4ZWNfb2sg5Li65YeGCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGVycm9yX2NsYXNzX3Njb3JlKGNscykKICBsb2NhbCB0ID0geyBvayA9IDAuMCwgdGltZW91dCA9IC0wLjYsIHN5bnRheCA9IC0wLjksIHNlbWFudGljcyA9IC0wLjcsCiAgICAgICAgICAgICAgcnVudGltZSA9IC0wLjgsIGRhdGEgPSAtMC41LCBvdGhlciA9IC0wLjQgfQogIHJldHVybiB0W2Nsc10gb3IgLTAuNAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6YCQ54m55b6B5Z+656GA5YiG77yIWy0xLDFd77yM56ym5Y+3PeaWueWQke+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJhc2Vfc2NvcmVzKGYpCiAgbG9jYWwgcyA9IHt9CiAgLS0gMSkgZXhlY19va++8muaIkOWKnyArMSAvIOWksei0pSDiiJIx77yI5p2D6YeN5pyA5aSnIOKGkiDmiqXplJnlgJnpgInlpKfotJ/liIbvvIkKICBzLmV4ZWNfb2sgPSAoZi5leGVjX29rID09IDEpIGFuZCAxIG9yIC0xCiAgLS0gMikg6KGM5pWw5ZCI55CG5oCn77yaMSDiiJIgbWluKDEsIHxyb3fiiJJleHBlY3R8IC8gbWF4KGV4cGVjdMK3dG9sLCAxKSnvvJswIOihjCB2cyDmnInmnJ/mnJsg4oaSIOKIkjEKICBpZiBmLnJvd19jb3VudCB+PSBuaWwgYW5kIGYuZXhwZWN0X3Jvd3Mgfj0gbmlsIGFuZCBmLmV4cGVjdF9yb3dzID4gMCB0aGVuCiAgICBpZiBmLnJvd19jb3VudCA9PSAwIHRoZW4KICAgICAgcy5yb3dfY291bnQgPSAtMQogICAgZWxzZQogICAgICBsb2NhbCB0b2wgPSBtYXRoLm1heChmLmV4cGVjdF9yb3dzICogZi5yb3dfdG9sZXJhbmNlLCAxKQogICAgICBsb2NhbCBkZXYgPSBtYXRoLmFicyhmLnJvd19jb3VudCAtIGYuZXhwZWN0X3Jvd3MpIC8gdG9sCiAgICAgIHMucm93X2NvdW50ID0gMSAtIG1hdGgubWluKDEsIGRldikKICAgIGVuZAogIGVsc2UKICAgIHMucm93X2NvdW50ID0gMCAtLSDml6DmnJ/mnJvlgLzlj6/lr7nnhacg4oaSIOS4reaApwogIGVuZAogIC0tIDMpIOW7tui/n+aDqee9mu+8mumihOeul+WGhSAw77yb6LaF6aKE566X57q/5oCn5YiwIOKIkjHvvIgyw5cg6aKE566X5bCB6aG277yJCiAgaWYgZi5sYXRlbmN5X21zIH49IG5pbCB0aGVuCiAgICBsb2NhbCBiID0gbWF0aC5tYXgoZi5sYXRlbmN5X2J1ZGdldF9tcywgMSkKICAgIGlmIGYubGF0ZW5jeV9tcyA8PSBiIHRoZW4gcy5sYXRlbmN5X21zID0gMAogICAgZWxzZSBzLmxhdGVuY3lfbXMgPSAtbWF0aC5taW4oMSwgKGYubGF0ZW5jeV9tcyAtIGIpIC8gYikgZW5kCiAgZWxzZQogICAgcy5sYXRlbmN5X21zID0gMAogIGVuZAogIC0tIDQpIG51bGwg546H5oOp572a77yaMCDihpIgMO+8m+KJpTAuNSDihpIg4oiSMQogIGlmIGYubnVsbF9yYXRlIH49IG5pbCB0aGVuCiAgICBsb2NhbCBuciA9IG1hdGgubWF4KDAsIG1hdGgubWluKDEsIGYubnVsbF9yYXRlKSkKICAgIHMubnVsbF9yYXRlID0gLW5yICogMgogIGVsc2UKICAgIHMubnVsbF9yYXRlID0gMAogIGVuZAogIC0tIDUpIOmUmeivr+exu+WIq+WfuuehgOWIhu+8iOS4jiBleGVjX29rPTAg5Y+g5Yqg77yM5o+Q5L6b5bm25YiX5pe255qE5Yy65YiG5bqm77yJCiAgcy5lcnJvcl9jbGFzcyA9IGVycm9yX2NsYXNzX3Njb3JlKGYuZXJyb3JfY2xhc3MpCiAgcmV0dXJuIHMKZW5kCgotLSDmhJ/nn6XmnLrliqDmnYPmgLvliIbvvIh6ID0gYmlhcyArIM6jIHfCt2Jhc2XvvJvmjpLluo/nlKjvvIzkuI3lgZogc2lnbW9pZO+8iQpsb2NhbCBmdW5jdGlvbiB3ZWlnaHRlZF9zY29yZShmLCB3LCBiaWFzKQogIGxvY2FsIHMgPSBiYXNlX3Njb3Jlcyhub3JtX2ZlYXR1cmVzKGYpKQogIGxvY2FsIHRvdGFsID0gYmlhcyBvciAwCiAgbG9jYWwgZGV0YWlsID0ge30KICBmb3IgayBpbiBwYWlycyh3KSBkbwogICAgbG9jYWwgYiA9IHNba10gb3IgMAogICAgdG90YWwgPSB0b3RhbCArIHdba10gKiBiCiAgICBkZXRhaWxba10gPSB7IGJhc2UgPSBiLCB3ZWlnaHQgPSB3W2tdLCBjb250cmliID0gd1trXSAqIGIgfQogIGVuZAogIHJldHVybiB0b3RhbCwgZGV0YWlsLCBzCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBvcCDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBvcF9mZWF0dXJlcyhwKQogIGxvY2FsIGYgPSBub3JtX2ZlYXR1cmVzKHAuZiBvciBwLmZlYXR1cmVzIG9yIHt9KQogIGxvY2FsIHMgPSBiYXNlX3Njb3JlcyhmKQogIGxvY2FsIGJzID0ge30KICBmb3IgaywgdiBpbiBwYWlycyhzKSBkbyBic1trXSA9IHI2KHYpIGVuZAogIHJldHVybiBqc29uX2VuY29kZSh7IG5vcm1hbGl6ZWQgPSBmLCBiYXNlX3Njb3JlcyA9IGJzIH0pCmVuZAoKbG9jYWwgZnVuY3Rpb24gb3Bfc2NvcmUocCkKICBsb2NhbCB3ID0gbm9ybV93ZWlnaHRzKHAud2VpZ2h0cykKICBsb2NhbCBiaWFzID0gdG9udW1iZXIocC5iaWFzKSBvciAwCiAgbG9jYWwgdG90YWwsIGRldGFpbCA9IHdlaWdodGVkX3Njb3JlKHAuZiBvciBwLmZlYXR1cmVzLCB3LCBiaWFzKQogIGxvY2FsIGQgPSB7fQogIGZvciBrLCB2IGluIHBhaXJzKGRldGFpbCkgZG8KICAgIGRba10gPSB7IGJhc2UgPSB2LmJhc2UsIHdlaWdodCA9IHYud2VpZ2h0LCBjb250cmliID0gcjYodi5jb250cmliKSB9CiAgZW5kCiAgcmV0dXJuIGpzb25fZW5jb2RlKHsgc2NvcmUgPSByNih0b3RhbCksIGJpYXMgPSByNihiaWFzKSwgY29udHJpYnV0aW9ucyA9IGQgfSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9zZWxlY3QocCkKICBsb2NhbCB3ID0gbm9ybV93ZWlnaHRzKHAud2VpZ2h0cykKICBsb2NhbCBiaWFzID0gdG9udW1iZXIocC5iaWFzKSBvciAwCiAgbG9jYWwgY2FuZHMgPSBhc190YWJsZShwLmNhbmRpZGF0ZXMpIG9yIHt9CiAgbG9jYWwgbiA9ICNjYW5kcwogIGlmIG4gPT0gMCB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IGVycm9yID0gJ25vIGNhbmRpZGF0ZXMnIH0pIGVuZAogIGxvY2FsIHNjb3JlZCA9IHt9CiAgZm9yIGkgPSAxLCBuIGRvCiAgICBsb2NhbCBjID0gY2FuZHNbaV0KICAgIGxvY2FsIHRvdGFsID0gd2VpZ2h0ZWRfc2NvcmUoYy5mZWF0dXJlcyBvciBjLmYgb3Ige30sIHcsIGJpYXMpCiAgICBzY29yZWRbaV0gPSB7IGNhbmRpZGF0ZV9pZCA9IHRvc3RyaW5nKGMuY2FuZGlkYXRlX2lkIG9yICgnYycgLi4gaSkpLAogICAgICAgICAgICAgICAgICBzY29yZSA9IHI2KHRvdGFsKSwgcmFuayA9IDAgfQogIGVuZAogIGxvY2FsIG9yZGVyID0ge30KICBmb3IgaSA9IDEsIG4gZG8gb3JkZXJbaV0gPSBpIGVuZAogIHRhYmxlLnNvcnQob3JkZXIsIGZ1bmN0aW9uKGEsIGIpCiAgICBpZiBzY29yZWRbYV0uc2NvcmUgfj0gc2NvcmVkW2JdLnNjb3JlIHRoZW4KICAgICAgcmV0dXJuIHNjb3JlZFthXS5zY29yZSA+IHNjb3JlZFtiXS5zY29yZQogICAgZW5kCiAgICByZXR1cm4gc2NvcmVkW2FdLmNhbmRpZGF0ZV9pZCA8IHNjb3JlZFtiXS5jYW5kaWRhdGVfaWQgLS0g5bm25YiX77ya5a2X5YW45bqP77yI56Gu5a6a5oCn77yJCiAgZW5kKQogIGZvciByLCBpIGluIGlwYWlycyhvcmRlcikgZG8gc2NvcmVkW2ldLnJhbmsgPSByIGVuZAogIGxvY2FsIHJhbmtpbmcgPSB7fQogIGZvciBpID0gMSwgbiBkbyByYW5raW5nW2ldID0gc2NvcmVkW2ldIGVuZAogIHRhYmxlLnNvcnQocmFua2luZywgZnVuY3Rpb24oYSwgYikgcmV0dXJuIGEucmFuayA8IGIucmFuayBlbmQpCiAgcmV0dXJuIGpzb25fZW5jb2RlKHsKICAgIHNlbGVjdGVkX2lkID0gc2NvcmVkW29yZGVyWzFdXS5jYW5kaWRhdGVfaWQsCiAgICBzY29yZSA9IHNjb3JlZFtvcmRlclsxXV0uc2NvcmUsCiAgICBiaWFzID0gcjYoYmlhcyksCiAgICByYW5raW5nID0gcmFua2luZywKICB9KQplbmQKCi0tIOWcqOe6v+aEn+efpeacuu+8iExlYXJu4oaSUmV0YWluIOS9juS/neecn+eJiO+8ie+8mgotLSDpgJDmnaHljoblj7IgKHg954m55b6B5Z+656GA5YiGLCB5PcKxMSnvvJroi6UgecK3KGJpYXMgKyB3wrd4KSDiiaQgMCDihpIgdyArPSBscsK3ecK3eCwgYmlhcyArPSBscsK3eQpsb2NhbCBmdW5jdGlvbiBvcF91cGRhdGVfd2VpZ2h0cyhwKQogIGxvY2FsIHcgPSBub3JtX3dlaWdodHMocC53ZWlnaHRzKQogIGxvY2FsIGxyID0gdG9udW1iZXIocC5scikgb3IgMC4xCiAgbG9jYWwgZXBvY2hzID0gbWF0aC5tYXgoMSwgbWF0aC5mbG9vcih0b251bWJlcihwLmVwb2Nocykgb3IgMykpCiAgbG9jYWwgYmlhcyA9IHRvbnVtYmVyKHAuYmlhcykgb3IgMAogIGxvY2FsIGhpc3RvcnkgPSBhc190YWJsZShwLmhpc3RvcnkpIG9yIHt9CiAgbG9jYWwgbiA9ICNoaXN0b3J5CiAgbG9jYWwgdXBkYXRlcyA9IDAKICBmb3IgXyA9IDEsIGVwb2NocyBkbwogICAgZm9yIGkgPSAxLCBuIGRvCiAgICAgIGxvY2FsIGggPSBoaXN0b3J5W2ldCiAgICAgIGxvY2FsIHkgPSAoaC5wYXNzID09IHRydWUgb3IgaC5wYXNzID09IDEgb3IgaC5wYXNzID09ICcxJykgYW5kIDEgb3IgLTEKICAgICAgbG9jYWwgcyA9IGJhc2Vfc2NvcmVzKG5vcm1fZmVhdHVyZXMoaC5mZWF0dXJlcyBvciBoLmYgb3Ige30pKQogICAgICBsb2NhbCB6ID0gYmlhcwogICAgICBmb3IgayBpbiBwYWlycyh3KSBkbyB6ID0geiArIHdba10gKiAoc1trXSBvciAwKSBlbmQKICAgICAgaWYgeSAqIHogPD0gMCB0aGVuCiAgICAgICAgZm9yIGsgaW4gcGFpcnModykgZG8gd1trXSA9IHdba10gKyBsciAqIHkgKiAoc1trXSBvciAwKSBlbmQKICAgICAgICBiaWFzID0gYmlhcyArIGxyICogeQogICAgICAgIHVwZGF0ZXMgPSB1cGRhdGVzICsgMQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGxvY2FsIG91dF93ID0ge30KICBmb3IgaywgdiBpbiBwYWlycyh3KSBkbyBvdXRfd1trXSA9IHI2KHYpIGVuZAogIHJldHVybiBqc29uX2VuY29kZSh7IHdlaWdodHMgPSBvdXRfdywgYmlhcyA9IHI2KGJpYXMpLAogICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXMgPSBuLCB1cGRhdGVzID0gdXBkYXRlcywgbHIgPSBsciwgZXBvY2hzID0gZXBvY2hzIH0pCmVuZAoKbG9jYWwgZnVuY3Rpb24gcnVuKHApCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKHsgZXJyb3IgPSAnZXhwZWN0ZWQgdGFibGUgcGFyYW0nIH0pIGVuZAogIGxvY2FsIG9wID0gcC5vcCBvciAnc2NvcmUnCiAgaWYgb3AgPT0gJ2ZlYXR1cmVzJyB0aGVuIHJldHVybiBvcF9mZWF0dXJlcyhwKSBlbmQKICBpZiBvcCA9PSAnc2NvcmUnIHRoZW4gcmV0dXJuIG9wX3Njb3JlKHApIGVuZAogIGlmIG9wID09ICdzZWxlY3QnIHRoZW4gcmV0dXJuIG9wX3NlbGVjdChwKSBlbmQKICBpZiBvcCA9PSAndXBkYXRlX3dlaWdodHMnIHRoZW4gcmV0dXJuIG9wX3VwZGF0ZV93ZWlnaHRzKHApIGVuZAogIGlmIG9wID09ICdkZWZhdWx0X3dlaWdodHMnIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKERFRkFVTFRfV0VJR0hUUykgZW5kCiAgcmV0dXJuIGpzb25fZW5jb2RlKHsgZXJyb3IgPSAndW5rbm93biBvcDogJyAuLiB0b3N0cmluZyhvcCkgfSkKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogdG9tbGluaQotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogVE9NTCArIElOSSDphY3nva7op6PmnpDvvIjnuq8gTHVh77yM6Ieq5YyF5ZCr77yJ4oaSIEpTT04g5a2X56ym5Liy77yI6YWNIGpzb25fZXh0cmFjdCDlsZXlvIDvvInjgIIKLS0gICAgICAgb3A9J3RvbWwn77yaVE9NTCDlrZDpm4Yg4oaSIEpTT07jgILmlK/mjIHvvJpbc2VjdGlvbl0gLyBbYS5iXSDltYzlpZfjgIFrZXkgPSDmoIfph48KLS0gICAgICAgICAgICAgICAgICDvvIhzdHJpbmcvaW50L2Zsb2F0L2Jvb2zvvInjgIHlpJrooYzlrZfnrKbkuLLvvIgiIiIuLiIiIu+8ieOAgeazqOmHiiAj44CBCi0tICAgICAgICAgICAgICAgICAg6KGM5YaF6KGoIHsgayA9IHYgfeOAgeihjOWGheaVsOe7hCBbIC4uIF3jgIHngrnot6/lvoQga2V544CCCi0tICAgICAgICAgICAgICAgICAg6K+a5a6e6L6555WM77ya5pegIGRhdGUtdGltZSDkuJPpl6jnsbvlnovvvIjlvZPlrZfnrKbkuLLvvInjgIHml6DmlbDnu4TooaggW1suLl1d44CBCi0tICAgICAgICAgICAgICAgICAg5peg6KO4IGtleSDkuYvlpJbnmoTlvJXlj7cga2V5IOS5i+WkluWkjeadgue7k+aehOOAgeaXoOWkmuaWh+aho+OAggotLSAgICAgICBvcD0naW5pJ++8mklOSSDihpIgSlNPTuOAguaUr+aMge+8mltzZWN0aW9uXSDliIbnu4TvvIjml6DliIbnu4TlvZLlhaXmoLnvvInjgIFrZXkgPSB2YWx1ZeOAgQotLSAgICAgICAgICAgICAgICAgIOazqOmHiiA7IOS4jiAj77yI6KGM6aaW77yJ44CB5YC857G75Z6L5ZeF5o6i77yIaW50L2Zsb2F0L2Jvb2wv5YW25L2Z5Li65a2X56ym5Liy77yJ44CCCi0tICAgICAgIOS4pOiAhemDvei/lOWbniBKU09OIOWvueixoeWtl+espuS4su+8m+epuuaWh+S7tui/lOWbniAne30n44CCCi0tIEBzb3VyY2U6IG9yaWdpbmFs77yIZHVja2RiLWx1YWppdCDns7vliJfvvIzoh6rljIXlkKvml6DlpJbpg6jkvp3otZbvvIkKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3RvbWxpbmknKTsKLS0gICB0b21sOiAgICAgU0VMRUNUIGx1YWppdF9zKCd0b21saW5pJywge3Y6ICdbZGJdXG5ob3N0ID0gIngiXG5wb3J0ID0gNTQzMlxuJywgb3A6J3RvbWwnfSk7Ci0tICAgICAgICAgICAgIOKGkiAneyJkYiI6eyJob3N0IjoieCIsInBvcnQiOjU0MzJ9fScKLS0gICBpbmk6ICAgICAgU0VMRUNUIGx1YWppdF9zKCd0b21saW5pJywge3Y6ICdbc2VjXVxuayA9IDNcbicsIG9wOidpbmknfSk7Ci0tICAgICAgICAgICAgIOKGkiAneyJzZWMiOnsiayI6M319JwotLSAgIGRyaWxsOiAgICBTRUxFQ1QganNvbl9leHRyYWN0KGx1YWppdF9zKCd0b21saW5pJywge3Y6PXQsIG9wOj0ndG9tbCd9KSwgJyQuZGIucG9ydCcpOwoKbG9jYWwgdG9tbGluaSA9IHt9CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOmAmueUqOW3peWFtwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHRyaW0ocykgcmV0dXJuIChzOmdzdWIoJ14lcyonLCAnJyk6Z3N1YignJXMqJCcsICcnKSkgZW5kCgpsb2NhbCBmdW5jdGlvbiBzdHJpcF9jb21tZW50KHMpCiAgLS0gVE9NTO+8miMg6LW35aeL5rOo6YeK77yI5LiN5Zyo5byV5Y+35YaF77yJCiAgbG9jYWwgb3V0LCBpbnEgPSB7fSwgZmFsc2UKICBmb3IgaSA9IDEsICNzIGRvCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJyInIHRoZW4gaW5xID0gbm90IGlucSBlbmQKICAgIGlmIGMgPT0gJyMnIGFuZCBub3QgaW5xIHRoZW4gYnJlYWsgZW5kCiAgICBvdXRbI291dCArIDFdID0gYwogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQob3V0KQplbmQKCi0tIOino+aekCBUT01ML0lOSSDlj7PkvqfmoIfph4/lgLzvvIjluKblvJXlj7flrZfnrKbkuLIgLyBib29sIC8gbnVtYmVyIC8g6KGM5YaF6KGoIC8g6KGM5YaF5pWw57uE77yJCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3RvbWxfdmFsdWUocmF3KQogIHJhdyA9IHRyaW0ocmF3KQogIGlmIHJhdyA9PSAnJyB0aGVuIHJldHVybiBuaWwgZW5kCiAgLS0g5aSa6KGM5a2X56ym5Liy77yI566A5YyW77ya5Y2V6KGM5YaFICIiIi4uIiIi77yJCiAgaWYgcmF3Om1hdGNoKCdeIiIiJykgYW5kIHJhdzptYXRjaCgnIiIiJCcpIHRoZW4KICAgIHJldHVybiByYXc6c3ViKDQsIC00KQogIGVuZAogIC0tIOWPjOW8leWPt+Wtl+espuS4sgogIGlmIHJhdzptYXRjaCgnXiInKSB0aGVuCiAgICBsb2NhbCBib2R5ID0gcmF3Om1hdGNoKCdeIiguKikiJXMqJCcpCiAgICBpZiBib2R5IHRoZW4KICAgICAgcmV0dXJuIChib2R5OmdzdWIoJ1xcKFtucnQiXFxdKScsIGZ1bmN0aW9uKGMpCiAgICAgICAgaWYgYyA9PSAnbicgdGhlbiByZXR1cm4gJ1xuJyBlbHNlaWYgYyA9PSAncicgdGhlbiByZXR1cm4gJ1xyJwogICAgICAgIGVsc2VpZiBjID09ICd0JyB0aGVuIHJldHVybiAnXHQnIGVsc2UgcmV0dXJuIGMgZW5kCiAgICAgIGVuZCkpCiAgICBlbmQKICAgIHJldHVybiBuaWwKICBlbmQKICAtLSDljZXlvJXlj7flrZfnrKbkuLLvvIhUT01MIGxpdGVyYWzvvIzml6DovazkuYnvvIkKICBpZiByYXc6bWF0Y2goIl4nIikgdGhlbgogICAgcmV0dXJuIHJhdzptYXRjaCgiXicoLiopJyVzKiQiKQogIGVuZAogIC0tIOihjOWGheihqCB7IGsgPSB2LCAuLi4gfQogIGlmIHJhdzptYXRjaCgnXiV7JykgYW5kIHJhdzptYXRjaCgnJX0kJykgdGhlbgogICAgbG9jYWwgaW5uZXIgPSByYXc6bWF0Y2goJ14leyguLSklfSQnKQogICAgbG9jYWwgb2JqID0ge30KICAgIGZvciBwYXJ0IGluIGlubmVyOmdtYXRjaCgnKFteLHt9XSspJykgZG8KICAgICAgbG9jYWwgaywgdiA9IHBhcnQ6bWF0Y2goJ14lcyooWyV3JS5fLV0rKSVzKj0lcyooLiopJXMqJCcpCiAgICAgIGlmIGsgdGhlbiBvYmpba10gPSBwYXJzZV90b21sX3ZhbHVlKHYpIGVuZAogICAgZW5kCiAgICByZXR1cm4gb2JqCiAgZW5kCiAgLS0g6KGM5YaF5pWw57uEIFsgYSwgYiwgLi4uIF0KICBpZiByYXc6bWF0Y2goJ14lWycpIGFuZCByYXc6bWF0Y2goJyVdJCcpIHRoZW4KICAgIGxvY2FsIGlubmVyID0gcmF3Om1hdGNoKCdeJVsoLi0pJV0kJykKICAgIGxvY2FsIGFyciA9IHt9CiAgICBmb3IgaXRlbSBpbiBpbm5lcjpnbWF0Y2goJyhbXixcXFslXV0rKScpIGRvCiAgICAgIGxvY2FsIHYgPSBwYXJzZV90b21sX3ZhbHVlKGl0ZW0pCiAgICAgIGlmIHYgfj0gbmlsIHRoZW4gYXJyWyNhcnIgKyAxXSA9IHYgZW5kCiAgICBlbmQKICAgIHJldHVybiBhcnIKICBlbmQKICAtLSBib29sCiAgbG9jYWwgbG93ID0gcmF3Omxvd2VyKCkKICBpZiBsb3cgPT0gJ3RydWUnIHRoZW4gcmV0dXJuIHRydWUgZW5kCiAgaWYgbG93ID09ICdmYWxzZScgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgLS0gZmxvYXQgLyBpbnQKICBsb2NhbCBuID0gdG9udW1iZXIocmF3KQogIGlmIG4gdGhlbiByZXR1cm4gbiBlbmQKICByZXR1cm4gcmF3ICAtLSDlhZzlupXvvJrlvZPlrZfnrKbkuLIKZW5kCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9pbmlfdmFsdWUocmF3KQogIHJhdyA9IHRyaW0ocmF3KQogIGxvY2FsIGxvdyA9IHJhdzpsb3dlcigpCiAgaWYgbG93ID09ICd0cnVlJyBvciBsb3cgPT0gJ3llcycgb3IgbG93ID09ICdvbicgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBsb3cgPT0gJ2ZhbHNlJyBvciBsb3cgPT0gJ25vJyBvciBsb3cgPT0gJ29mZicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKHJhdykKICBpZiBuIHRoZW4gcmV0dXJuIG4gZW5kCiAgLS0g5Y675byV5Y+3CiAgaWYgcmF3Om1hdGNoKCdeIicpIGFuZCByYXc6bWF0Y2goJyIkJykgdGhlbiByZXR1cm4gcmF3OnN1YigyLCAtMikgZW5kCiAgaWYgcmF3Om1hdGNoKCJeJyIpIGFuZCByYXc6bWF0Y2goIickIikgdGhlbiByZXR1cm4gcmF3OnN1YigyLCAtMikgZW5kCiAgcmV0dXJuIHJhdwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gSlNPTiDnvJbnoIEKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBqc29uX2VzY2FwZShzKQogIHJldHVybiAodG9zdHJpbmcocyk6Z3N1YignKFtcXFwiXG5cdFxyXSknLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnXFwnIHRoZW4gcmV0dXJuICdcXFxcJyBlbHNlaWYgYyA9PSAnIicgdGhlbiByZXR1cm4gJ1xcIicKICAgIGVsc2VpZiBjID09ICdcbicgdGhlbiByZXR1cm4gJ1xcbicgZWxzZWlmIGMgPT0gJ1x0JyB0aGVuIHJldHVybiAnXFx0JwogICAgZWxzZWlmIGMgPT0gJ1xyJyB0aGVuIHJldHVybiAnXFxyJyBlbHNlIHJldHVybiBjIGVuZAogIGVuZCkpCmVuZAoKbG9jYWwgVCA9IHt9CmxvY2FsIGZ1bmN0aW9uIGp0eXBlKHYpIHJldHVybiB0eXBlKHYpIGVuZApsb2NhbCBmdW5jdGlvbiBpc190YWJsZSh2KSByZXR1cm4gdHlwZSh2KSA9PSAndGFibGUnIGVuZApsb2NhbCBmdW5jdGlvbiBpc19hcnJheSh0KQogIC0tIOS4peagvO+8muaJgOaciemUruS4uiAxLi4jdCDnmoTov57nu63mlbTmlbAKICBpZiAjdCA9PSAwIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGxvY2FsIG4gPSAjdAogIGlmIG4gPT0gMCB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBmb3IgaSA9IDEsIG4gZG8KICAgIGlmIHRbaV0gPT0gbmlsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGVuZAogIGxvY2FsIGNvdW50ID0gMAogIGZvciBrIGluIHBhaXJzKHQpIGRvCiAgICBjb3VudCA9IGNvdW50ICsgMQogICAgaWYgdHlwZShrKSB+PSAnbnVtYmVyJyBvciBrIH49IG1hdGguZmxvb3Ioaykgb3IgayA8IDEgb3IgayA+IG4gdGhlbgogICAgICByZXR1cm4gZmFsc2UKICAgIGVuZAogIGVuZAogIHJldHVybiBjb3VudCA9PSBuCmVuZAoKZnVuY3Rpb24gVC5lbmNvZGUodikKICBsb2NhbCB0ID0ganR5cGUodikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgaWYgdCA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdG9zdHJpbmcodikgZW5kCiAgaWYgdCA9PSAnbnVtYmVyJyB0aGVuCiAgICBpZiB2ICUgMSA9PSAwIHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkJywgdikgZW5kCiAgICByZXR1cm4gdG9zdHJpbmcodikKICBlbmQKICBpZiB0ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICciJyAuLiBqc29uX2VzY2FwZSh2KSAuLiAnIicgZW5kCiAgaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGlmIGlzX2FycmF5KHYpIHRoZW4KICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaSA9IDEsICN2IGRvIHBhcnRzWyNwYXJ0cyArIDFdID0gVC5lbmNvZGUodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogICAgZW5kCiAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICBmb3IgaywgdmFsIGluIHBhaXJzKHYpIGRvCiAgICAgIHBhcnRzWyNwYXJ0cyArIDFdID0gJyInIC4uIGpzb25fZXNjYXBlKHRvc3RyaW5nKGspKSAuLiAnIjonIC4uIFQuZW5jb2RlKHZhbCkKICAgIGVuZAogICAgcmV0dXJuICd7JyAuLiB0YWJsZS5jb25jYXQocGFydHMsICcsJykgLi4gJ30nCiAgZW5kCiAgcmV0dXJuICdudWxsJwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gVE9NTCDop6PmnpAKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwYXJzZV90b21sKHRleHQpCiAgbG9jYWwgcm9vdCA9IHt9CiAgbG9jYWwgY3VycmVudCA9IHJvb3QKICBmb3IgbGluZSBpbiAodGV4dCAuLiAnXG4nKTpnbWF0Y2goJyguLSlccj9cbicpIGRvCiAgICBsb2NhbCByYXcgPSBzdHJpcF9jb21tZW50KGxpbmUpCiAgICByYXcgPSB0cmltKHJhdykKICAgIGlmIHJhdyA9PSAnJyB0aGVuIGdvdG8gY29udCBlbmQKICAgIC0tIOihqOWktCBbc2VjdGlvbl0gLyBbYS5iXQogICAgbG9jYWwgc2VjID0gcmF3Om1hdGNoKCdeJVsoLi0pJV0lcyokJykKICAgIGlmIHNlYyB0aGVuCiAgICAgIHNlYyA9IHNlYzpnc3ViKCclWyVdJywgJycpICAtLSDljrvmjokgW1suLl1dIOaui+eVme+8iOivmuWunui+ueeVjO+8muaVsOe7hOihqOaMieWNleihqOWkhOeQhu+8iQogICAgICBzZWMgPSB0cmltKHNlYykKICAgICAgY3VycmVudCA9IHJvb3QKICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgcCBpbiBzZWM6Z21hdGNoKCdbJXclXyUtXSsnKSBkbyBwYXJ0c1sjcGFydHMgKyAxXSA9IHAgZW5kCiAgICAgIGZvciBpID0gMSwgI3BhcnRzIC0gMSBkbwogICAgICAgIGxvY2FsIGsgPSBwYXJ0c1tpXQogICAgICAgIGlmIG5vdCBjdXJyZW50W2tdIHRoZW4gY3VycmVudFtrXSA9IHt9IGVuZAogICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tdCiAgICAgIGVuZAogICAgICBpZiAjcGFydHMgPiAwIHRoZW4KICAgICAgICBsb2NhbCBrID0gcGFydHNbI3BhcnRzXQogICAgICAgIGlmIG5vdCBjdXJyZW50W2tdIHRoZW4gY3VycmVudFtrXSA9IHt9IGVuZAogICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tdCiAgICAgIGVuZAogICAgICBnb3RvIGNvbnQKICAgIGVuZAogICAgLS0ga2V5ID0gdmFsdWXvvIjngrnot6/lvoQga2V5IOWmgiBhLmIuYyDltYzlpZfvvIkKICAgIGxvY2FsIGtleSwgdmFscmF3ID0gcmF3Om1hdGNoKCdeKFsldyVfJS0uJXclXyUtXSspJXMqPSVzKiguKikkJykKICAgIGlmIGtleSB0aGVuCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIHAgaW4ga2V5OmdtYXRjaCgnWyV3JV8lLV0rJykgZG8gcGFydHNbI3BhcnRzICsgMV0gPSBwIGVuZAogICAgICBsb2NhbCB0YXJnZXQgPSBjdXJyZW50CiAgICAgIGZvciBpID0gMSwgI3BhcnRzIC0gMSBkbwogICAgICAgIGxvY2FsIGsgPSBwYXJ0c1tpXQogICAgICAgIGlmIG5vdCB0YXJnZXRba10gdGhlbiB0YXJnZXRba10gPSB7fSBlbmQKICAgICAgICB0YXJnZXQgPSB0YXJnZXRba10KICAgICAgZW5kCiAgICAgIHRhcmdldFtwYXJ0c1sjcGFydHNdXSA9IHBhcnNlX3RvbWxfdmFsdWUodmFscmF3KQogICAgZW5kCiAgICA6OmNvbnQ6OgogIGVuZAogIHJldHVybiBULmVuY29kZShyb290KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gSU5JIOino+aekAotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2luaSh0ZXh0KQogIGxvY2FsIHJvb3QgPSB7fQogIGxvY2FsIGN1cnJlbnQgPSByb290CiAgZm9yIGxpbmUgaW4gKHRleHQgLi4gJ1xuJyk6Z21hdGNoKCcoLi0pXHI/XG4nKSBkbwogICAgbG9jYWwgcmF3ID0gbGluZQogICAgcmF3ID0gdHJpbShyYXcpCiAgICBpZiByYXcgPT0gJycgdGhlbiBnb3RvIGNvbnQgZW5kCiAgICBpZiByYXc6bWF0Y2goJ147Jykgb3IgcmF3Om1hdGNoKCdeIycpIHRoZW4gZ290byBjb250IGVuZAogICAgbG9jYWwgc2VjID0gcmF3Om1hdGNoKCdeJVsoLi0pJV0lcyokJykKICAgIGlmIHNlYyB0aGVuCiAgICAgIGN1cnJlbnQgPSByb290CiAgICAgIGxvY2FsIGsgPSB0cmltKHNlYykKICAgICAgaWYgbm90IGN1cnJlbnRba10gdGhlbiBjdXJyZW50W2tdID0ge30gZW5kCiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tdCiAgICAgIGdvdG8gY29udAogICAgZW5kCiAgICBsb2NhbCBrZXksIHZhbHJhdyA9IHJhdzptYXRjaCgnXihbXj07I10rKSVzKls9Ol0lcyooLiopJCcpCiAgICBpZiBrZXkgdGhlbgogICAgICBjdXJyZW50W3RyaW0oa2V5KV0gPSBwYXJzZV9pbmlfdmFsdWUodmFscmF3KQogICAgZW5kCiAgICA6OmNvbnQ6OgogIGVuZAogIHJldHVybiBULmVuY29kZShyb290KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5YiG5Y+RCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcnVuKHApCiAgaWYgdHlwZShwKSA9PSAnc3RyaW5nJyB0aGVuIHAgPSB7IHYgPSBwIH0gZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICd7fScgZW5kCiAgbG9jYWwgdGV4dCA9IHAudiBvciAnJwogIGxvY2FsIG9wID0gcC5vcCBvciAndG9tbCcKICBpZiBvcCA9PSAnaW5pJyB0aGVuIHJldHVybiBwYXJzZV9pbmkodGV4dCkgZW5kCiAgcmV0dXJuIHBhcnNlX3RvbWwodGV4dCkKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogcXIKLS0gQGNhdGVnb3J5OiB1ZGYKLS0gQGRlc2M6IFFSIOeggeeUn+aIkO+8iOe6ryBMdWHvvIzoh6rljIXlkKvvvIzml6AgRkZJ77yJ4oCU4oCU5oqK5paH5pys57yW56CB5oiQIFFSIOaooeWdl+efqemYteOAggotLSAgICAgICBCeXRlIOaooeW8j++8iOS7u+aEjyBVVEYtOCDmlofmnKzvvInjgIFFQyDnuqfliKsgTC9NL1EvSOOAgeiHquWKqOmAiSBtYXNr77yIcGVuYWx0eSDmnIDlsI/vvInjgIIKLS0gICAgICAg5biD5bGAL+e6oOmUmeeul+azleenu+akjeiHquW8gOa6kOWPguiAg+WunueOsO+8iHB5dGhvbi1xcmNvZGUgLyBOYXl1a2nvvIxNSVQvQXBhY2hl77yJ77yMCi0tICAgICAgIOW4uOmHj+S4jua1geeoi+mAkOS4gOWvuem9kO+8jOWPr+eUqCBaWGluZy/miYvmnLrmiavnoIHni6znq4vpqozor4HjgIIKLS0gICAgICAgb3Ag6YCJ6aG577yaCi0tICAgICAgICAgJ21hdHJpeCcg4oaSIEpTT04g5LqM57u05pWw57uE77yIMT3mt7HoibIgMD3mtYXoibLvvIkKLS0gICAgICAgICAnc3ZnJyAgICDihpIg5a6M5pW0IFNWR++8iOeZveW6lSArIDQg5qih5Z2X6Z2Z5Yy677yMMSDmqKHlnZc9c2NhbGUgcHjvvIzpu5jorqQgNO+8iQotLSAgICAgICAgICdpbmZvJyAgIOKGkiB7dmVyc2lvbixzaXplLGVjLG1hc2ssY29kZXdvcmRzLGRhdGFfY2FwYWNpdHl9Ci0tICAgICAgIOivmuWunui+ueeVjO+8mueJiOacrCAx4oCTNu+8iOe6piDiiaQxMzIg5a2X6IqCIEJ5dGUg6LSf6L2977yJ77yM5LuFIEJ5dGUg5qih5byP77yI5peg5pWw5YC8L+Wtl+avjS8KLS0gICAgICAg5rGJ5a2X5Y6L57yp5qih5byP77yJ44CC5pu05aSn6LSf6L29L+WkmuaooeW8j+ivt+i1sOWOn+eUn+i3r+W+hOOAggotLSBAc291cmNlOiDluIPlsYDnp7vmpI3oh6ogcHl0aG9uLXFyY29kZShNSVQpIOS4jiBOYXl1a2kgUVIgQ29kZSBnZW5lcmF0b3IoQXBhY2hlLTIuMCkg55qE5YWs5byA566X5rOVCi0tIEByZXF1aXJlczog5peg77yI55SoIEx1YUpJVCDljp/nlJ/kvY3ov5DnrpcgJiB+IHwgPDwgPj7vvJvnuq8gTHVhIDUuMSDpnIAgYml0IOW6k++8iQotLSBAbGljZW5zZTogTUlUIChhbGdvcml0aG0gbGF5b3V0KSAvIEFwYWNoZS0yLjAgKE5heXVraSBRUiBnZW5lcmF0b3IpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0ncXInKTsKLS0gICBzdmc6ICAgICAgU0VMRUNUIGx1YWppdF9zKCdxcicsIHt2OiAnaHR0cHM6Ly9leC5jb20nLCBvcDogJ3N2ZycsIGVjOiAnTSd9KTsKLS0gICBtYXRyaXg6ICAgU0VMRUNUIGx1YWppdF9zKCdxcicsIHt2OiAnaGVsbG8nLCBvcDogJ21hdHJpeCd9KTsKLS0gICBzaXplOiAgICAgU0VMRUNUIGpzb25fZXh0cmFjdChsdWFqaXRfcygncXInLHt2Oj0neCcsb3A6PSdpbmZvJ30pLCAnJC5zaXplJyk7Ci0tICAg5qCh6aqM77ya55Sf5oiQIFNWRyDihpIgWlhpbmcv5omL5py65omr56CB6Kej56CB5Zue5Y6f5paH77yM5Y2z6K+B5piO57yW56CB5q2j56Gu44CCCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEdGKDI1NinvvIhRUiDlpJrpobnlvI8gMHgxMWTvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBFWFAsIExPRyA9IHt9LCB7fQpkbwogIGxvY2FsIHggPSAxCiAgZm9yIGkgPSAwLCAyNTQgZG8KICAgIEVYUFtpXSA9IHgKICAgIExPR1t4XSA9IGkKICAgIHggPSB4ICogMgogICAgaWYgeCA+PSAyNTYgdGhlbiB4ID0geCB+IDB4MTFkIGVuZAogIGVuZAplbmQKbG9jYWwgZnVuY3Rpb24gZ2ZfbXVsKGEsIGIpCiAgaWYgYSA9PSAwIG9yIGIgPT0gMCB0aGVuIHJldHVybiAwIGVuZAogIHJldHVybiBFWFBbKExPR1thXSArIExPR1tiXSkgJSAyNTVdCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBSZWVkLVNvbG9tb27vvIhOYXl1a2kg566X5rOV77yaZGl2aXNvciArIHJlbWFpbmRlcu+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHJzX2Rpdmlzb3IoZGVncmVlKQogIGxvY2FsIHJlc3VsdCA9IHt9CiAgZm9yIGogPSAxLCBkZWdyZWUgZG8gcmVzdWx0W2pdID0gMCBlbmQKICByZXN1bHRbZGVncmVlXSA9IDEKICBsb2NhbCByb290ID0gMQogIGZvciBpID0gMSwgZGVncmVlIGRvCiAgICBmb3IgaiA9IDEsIGRlZ3JlZSBkbwogICAgICByZXN1bHRbal0gPSBnZl9tdWwocmVzdWx0W2pdLCByb290KQogICAgICBpZiBqIDwgZGVncmVlIHRoZW4gcmVzdWx0W2pdID0gcmVzdWx0W2pdIH4gcmVzdWx0W2ogKyAxXSBlbmQKICAgIGVuZAogICAgcm9vdCA9IGdmX211bChyb290LCAyKQogIGVuZAogIHJldHVybiByZXN1bHQKZW5kCgpsb2NhbCBmdW5jdGlvbiByc19lbmNvZGUoZGF0YSwgZWNfbGVuKQogIGxvY2FsIGRpdmlzb3IgPSByc19kaXZpc29yKGVjX2xlbikKICBsb2NhbCByZXN1bHQgPSB7fQogIGZvciBqID0gMSwgZWNfbGVuIGRvIHJlc3VsdFtqXSA9IDAgZW5kCiAgZm9yIGkgPSAxLCAjZGF0YSBkbwogICAgbG9jYWwgZmFjdG9yID0gZGF0YVtpXSB+IHJlc3VsdFsxXQogICAgZm9yIGogPSAxLCBlY19sZW4gLSAxIGRvIHJlc3VsdFtqXSA9IHJlc3VsdFtqICsgMV0gZW5kCiAgICByZXN1bHRbZWNfbGVuXSA9IDAKICAgIGZvciBqID0gMSwgZWNfbGVuIGRvCiAgICAgIHJlc3VsdFtqXSA9IHJlc3VsdFtqXSB+IGdmX211bChmYWN0b3IsIGRpdmlzb3Jbal0pCiAgICBlbmQKICBlbmQKICByZXR1cm4gcmVzdWx0CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDniYjmnKwv57qg6ZSZ5Z2X6KGo77yIcHl0aG9uLXFyY29kZSBiYXNlLnB577yM54mI5pysIDHigJM277yJCi0tICAgZW50cnkgPSB7Y291bnQsIHRvdGFsX2NvZGV3b3JkcywgZGF0YV9jb2Rld29yZHN977ybZWMgPSB0b3RhbCAtIGRhdGEKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBSUyA9IHsKICBbMV0gPSB7IEwgPSB7ezEsMjYsMTl9fSwgTSA9IHt7MSwyNiwxNn19LCBRID0ge3sxLDI2LDEzfX0sIEggPSB7ezEsMjYsOX19IH0sCiAgWzJdID0geyBMID0ge3sxLDQ0LDM0fX0sIE0gPSB7ezEsNDQsMjh9fSwgUSA9IHt7MSw0NCwyMn19LCBIID0ge3sxLDQ0LDE2fX0gfSwKICBbM10gPSB7IEwgPSB7ezEsNzAsNTV9fSwgTSA9IHt7MSw3MCw0NH19LCBRID0ge3syLDM1LDE3fX0sIEggPSB7ezIsMzUsMTN9fSB9LAogIFs0XSA9IHsgTCA9IHt7MSwxMDAsODB9fSwgTSA9IHt7Miw1MCwzMn19LCBRID0ge3syLDUwLDI0fX0sIEggPSB7ezQsMjUsOX19IH0sCiAgWzVdID0geyBMID0ge3sxLDEzNCwxMDh9fSwgTSA9IHt7Miw2Nyw0M319LAogICAgICAgICAgUSA9IHt7MiwzMywxNX0sezIsMzQsMTZ9fSwgSCA9IHt7MiwzMywxMX0sezIsMzQsMTJ9fSB9LAogIFs2XSA9IHsgTCA9IHt7Miw4Niw2OH19LCBNID0ge3s0LDQzLDI3fX0sIFEgPSB7ezQsNDMsMTl9fSwgSCA9IHt7NCw0MywxNX19IH0sCn0KbG9jYWwgRUNfQklUUyA9IHsgTSA9IDAsIEwgPSAxLCBRID0gMiwgSCA9IDMgfSAgIC0tIOagvOW8j+S/oeaBr+mHjCBFQyDnmoQgMiDkvY3nvJbnoIEKbG9jYWwgQUxJR04gPSB7IFsyXSA9IHs2LDE4fSwgWzNdID0gezYsMjJ9LCBbNF0gPSB7NiwyNn0sIFs1XSA9IHs2LDMwfSwgWzZdID0gezYsMzR9IH0KCmxvY2FsIGZ1bmN0aW9uIGRhdGFfdG90YWxfb2YodiwgZWMpCiAgbG9jYWwgdCA9IDAKICBmb3IgXywgZSBpbiBpcGFpcnMoUlNbdl1bZWNdKSBkbyB0ID0gdCArIGVbMV0gKiBlWzNdIGVuZAogIHJldHVybiB0CmVuZAoKbG9jYWwgZnVuY3Rpb24gY2hvb3NlX3ZlcnNpb24oZGF0YWxlbiwgZWMpCiAgZm9yIHYgPSAxLCA2IGRvCiAgICBsb2NhbCBuZWVkID0gNCArIDggKyA4ICogZGF0YWxlbiAgIC0tIG1vZGUoNCkgKyBjb3VudCg4LCB2MS05KSArIGRhdGEKICAgIGlmIG5lZWQgPD0gZGF0YV90b3RhbF9vZih2LCBlYykgKiA4IHRoZW4gcmV0dXJuIHYgZW5kCiAgZW5kCiAgcmV0dXJuIG5pbAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5pWw5o2u5L2N5rWB77yIQnl0ZSDmqKHlvI8gMDEwMO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJ1aWxkX2JpdHN0cmVhbSh0ZXh0LCBkYXRhX3RvdGFsKQogIGxvY2FsIGJpdHMgPSB7fQogIGxvY2FsIGZ1bmN0aW9uIHB1c2godmFsLCBuKQogICAgZm9yIGkgPSBuIC0gMSwgMCwgLTEgZG8gYml0c1sjYml0cyArIDFdID0gKHZhbCA+PiBpKSAmIDEgZW5kCiAgZW5kCiAgcHVzaCg0LCA0KQogIHB1c2goI3RleHQsIDgpCiAgZm9yIGkgPSAxLCAjdGV4dCBkbyBwdXNoKHRleHQ6Ynl0ZShpKSwgOCkgZW5kCiAgbG9jYWwgY2FwID0gZGF0YV90b3RhbCAqIDgKICBmb3IgXyA9IDEsIDQgZG8gaWYgI2JpdHMgPCBjYXAgdGhlbiBiaXRzWyNiaXRzICsgMV0gPSAwIGVsc2UgYnJlYWsgZW5kIGVuZAogIGlmICNiaXRzICUgOCB+PSAwIHRoZW4KICAgIGZvciBfID0gMSwgOCAtICgjYml0cyAlIDgpIGRvIGJpdHNbI2JpdHMgKyAxXSA9IDAgZW5kCiAgZW5kCiAgbG9jYWwgcGFkID0gMHhFQwogIHdoaWxlICNiaXRzIDwgY2FwIGRvCiAgICBwdXNoKHBhZCwgOCkKICAgIHBhZCA9IChwYWQgPT0gMHhFQykgYW5kIDB4MTEgb3IgMHhFQwogIGVuZAogIGxvY2FsIGJ5dGVzID0ge30KICBmb3IgaSA9IDEsICNiaXRzLCA4IGRvCiAgICBsb2NhbCBiID0gMAogICAgZm9yIGogPSAwLCA3IGRvIGIgPSBiICogMiArIChiaXRzW2kgKyBqXSBvciAwKSBlbmQKICAgIGJ5dGVzWyNieXRlcyArIDFdID0gYgogIGVuZAogIHJldHVybiBieXRlcwplbmQKCi0tIOWIhuWdlyArIFJTICsg5Lqk57uHCmxvY2FsIGZ1bmN0aW9uIG1ha2VfY29kZXdvcmRzKGRhdGFfYnl0ZXMsIHZlcnNpb24sIGVjKQogIGxvY2FsIGVudHJpZXMgPSBSU1t2ZXJzaW9uXVtlY10KICBsb2NhbCBibG9ja3MsIHBvcyA9IHt9LCAxCiAgZm9yIF8sIGUgaW4gaXBhaXJzKGVudHJpZXMpIGRvCiAgICBmb3IgXyA9IDEsIGVbMV0gZG8KICAgICAgbG9jYWwgYmxrID0ge30KICAgICAgZm9yIGkgPSAxLCBlWzNdIGRvCiAgICAgICAgYmxrW2ldID0gZGF0YV9ieXRlc1twb3NdIG9yIDAKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGVuZAogICAgICBsb2NhbCBlY3cgPSByc19lbmNvZGUoYmxrLCBlWzJdIC0gZVszXSkKICAgICAgYmxvY2tzWyNibG9ja3MgKyAxXSA9IHsgZGF0YSA9IGJsaywgZWMgPSBlY3csIGRsID0gZVszXSwgZWwgPSBlWzJdIC0gZVszXSB9CiAgICBlbmQKICBlbmQKICBsb2NhbCBtYXhkLCBtYXhlID0gMCwgMAogIGZvciBfLCBiIGluIGlwYWlycyhibG9ja3MpIGRvCiAgICBpZiBiLmRsID4gbWF4ZCB0aGVuIG1heGQgPSBiLmRsIGVuZAogICAgaWYgYi5lbCA+IG1heGUgdGhlbiBtYXhlID0gYi5lbCBlbmQKICBlbmQKICBsb2NhbCBvdXQgPSB7fQogIGZvciBpID0gMSwgbWF4ZCBkbwogICAgZm9yIF8sIGIgaW4gaXBhaXJzKGJsb2NrcykgZG8KICAgICAgaWYgaSA8PSBiLmRsIHRoZW4gb3V0WyNvdXQgKyAxXSA9IGIuZGF0YVtpXSBlbmQKICAgIGVuZAogIGVuZAogIGZvciBpID0gMSwgbWF4ZSBkbwogICAgZm9yIF8sIGIgaW4gaXBhaXJzKGJsb2NrcykgZG8KICAgICAgaWYgaSA8PSBiLmVsIHRoZW4gb3V0WyNvdXQgKyAxXSA9IGIuZWNbaV0gZW5kCiAgICBlbmQKICBlbmQKICByZXR1cm4gb3V0CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDmoLzlvI/kv6Hmga8gQkNIKDE1LDUpICBHMTU9MHg1MzcsIEcxNV9NQVNLPTB4NTQxMgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJjaF9kaWdpdCh4KQogIGxvY2FsIGQgPSAwCiAgd2hpbGUgeCB+PSAwIGRvIGQgPSBkICsgMSB4ID0geCA+PiAxIGVuZAogIHJldHVybiBkCmVuZApsb2NhbCBmdW5jdGlvbiBiY2hfZm9ybWF0KGRhdGEpCiAgbG9jYWwgRzE1LCBHMTVfTUFTSyA9IDB4NTM3LCAweDU0MTIKICBsb2NhbCBkID0gZGF0YSA8PCAxMAogIHdoaWxlIGJjaF9kaWdpdChkKSAtIGJjaF9kaWdpdChHMTUpID49IDAgZG8KICAgIGQgPSBkIH4gKEcxNSA8PCAoYmNoX2RpZ2l0KGQpIC0gYmNoX2RpZ2l0KEcxNSkpKQogIGVuZAogIHJldHVybiAoZGF0YSA8PCAxMCkgfiBkIH4gRzE1X01BU0sKZW5kCgotLSBtYXNrIOWHveaVsO+8iHB5dGhvbi1xcmNvZGUgdXRpbC5tYXNrX2Z1bmPvvIwocm93LCBjb2wp77yJCmxvY2FsIGZ1bmN0aW9uIG1hc2tfdmFsKG0sIHIsIGMpCiAgaWYgbSA9PSAwIHRoZW4gcmV0dXJuIChyICsgYykgJSAyID09IDAKICBlbHNlaWYgbSA9PSAxIHRoZW4gcmV0dXJuIHIgJSAyID09IDAKICBlbHNlaWYgbSA9PSAyIHRoZW4gcmV0dXJuIGMgJSAzID09IDAKICBlbHNlaWYgbSA9PSAzIHRoZW4gcmV0dXJuIChyICsgYykgJSAzID09IDAKICBlbHNlaWYgbSA9PSA0IHRoZW4gcmV0dXJuIChtYXRoLmZsb29yKHIgLyAyKSArIG1hdGguZmxvb3IoYyAvIDMpKSAlIDIgPT0gMAogIGVsc2VpZiBtID09IDUgdGhlbiByZXR1cm4gKHIgKiBjKSAlIDIgKyAociAqIGMpICUgMyA9PSAwCiAgZWxzZWlmIG0gPT0gNiB0aGVuIHJldHVybiAoKHIgKiBjKSAlIDIgKyAociAqIGMpICUgMykgJSAyID09IDAKICBlbHNlIHJldHVybiAoKHIgKiBjKSAlIDMgKyAociArIGMpICUgMikgJSAyID09IDAgZW5kCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDnn6npmLXmnoTlu7rvvIhweXRob24tcXJjb2RlIG1haW4ucHkg5biD5bGA77yMMC1iYXNlZCBbcl1bY13vvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBzaXplX29mKHYpIHJldHVybiAxNyArIDQgKiB2IGVuZAoKbG9jYWwgZnVuY3Rpb24gYnVpbGRfbWF0cml4KGNvZGV3b3JkcywgdmVyc2lvbiwgZWMsIG1hc2spCiAgbG9jYWwgc2l6ZSA9IHNpemVfb2YodmVyc2lvbikKICBsb2NhbCBncmlkLCByZXNlcnZlZCA9IHt9LCB7fQogIGZvciByID0gMCwgc2l6ZSAtIDEgZG8KICAgIGdyaWRbcl0sIHJlc2VydmVkW3JdID0ge30sIHt9CiAgICBmb3IgYyA9IDAsIHNpemUgLSAxIGRvIGdyaWRbcl1bY10gPSAwIHJlc2VydmVkW3JdW2NdID0gZmFsc2UgZW5kCiAgZW5kCgogIC0tIDEpIOWumuS9jeWbvuahiCArIOWIhumalOWMugogIGxvY2FsIGZ1bmN0aW9uIGZpbmRlcihyMCwgYzApCiAgICBmb3IgciA9IC0xLCA3IGRvCiAgICAgIGZvciBjID0gLTEsIDcgZG8KICAgICAgICBsb2NhbCByciwgY2MgPSByMCArIHIsIGMwICsgYwogICAgICAgIGlmIHJyID49IDAgYW5kIGNjID49IDAgYW5kIHJyIDwgc2l6ZSBhbmQgY2MgPCBzaXplIHRoZW4KICAgICAgICAgIGxvY2FsIHYgPSAwCiAgICAgICAgICBpZiByID49IDAgYW5kIHIgPD0gNiBhbmQgYyA+PSAwIGFuZCBjIDw9IDYgdGhlbgogICAgICAgICAgICBsb2NhbCBib3JkZXIgPSAociA9PSAwIG9yIHIgPT0gNiBvciBjID09IDAgb3IgYyA9PSA2KQogICAgICAgICAgICBsb2NhbCBjb3JlID0gKHIgPj0gMiBhbmQgciA8PSA0IGFuZCBjID49IDIgYW5kIGMgPD0gNCkKICAgICAgICAgICAgdiA9IChib3JkZXIgb3IgY29yZSkgYW5kIDEgb3IgMAogICAgICAgICAgZW5kCiAgICAgICAgICBncmlkW3JyXVtjY10gPSB2CiAgICAgICAgICByZXNlcnZlZFtycl1bY2NdID0gdHJ1ZQogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGZpbmRlcigwLCAwKQogIGZpbmRlcigwLCBzaXplIC0gNykKICBmaW5kZXIoc2l6ZSAtIDcsIDApCgogIC0tIDIpIOaXtuW6j+WbvuahiO+8iOihjCA2IC8g5YiXIDbvvIzlgbbmlbDlnZDmoIfmt7HoibLvvIkKICBmb3IgaSA9IDAsIHNpemUgLSAxIGRvCiAgICBpZiBub3QgcmVzZXJ2ZWRbaV1bNl0gdGhlbgogICAgICBncmlkW2ldWzZdID0gKGkgJSAyID09IDApIGFuZCAxIG9yIDAKICAgICAgcmVzZXJ2ZWRbaV1bNl0gPSB0cnVlCiAgICBlbmQKICAgIGlmIG5vdCByZXNlcnZlZFs2XVtpXSB0aGVuCiAgICAgIGdyaWRbNl1baV0gPSAoaSAlIDIgPT0gMCkgYW5kIDEgb3IgMAogICAgICByZXNlcnZlZFs2XVtpXSA9IHRydWUKICAgIGVuZAogIGVuZAoKICAtLSAzKSDlr7npvZDlm77moYjvvIh2MivvvJvkuI4gZmluZGVyL3RpbWluZyDph43lj6DlpITot7Pov4fvvIkKICBsb2NhbCBwb3MgPSBBTElHTlt2ZXJzaW9uXQogIGlmIHBvcyB0aGVuCiAgICBmb3IgXywgcm93IGluIGlwYWlycyhwb3MpIGRvCiAgICAgIGZvciBfLCBjb2wgaW4gaXBhaXJzKHBvcykgZG8KICAgICAgICBpZiBub3QgcmVzZXJ2ZWRbcm93XVtjb2xdIHRoZW4KICAgICAgICAgIGZvciByID0gLTIsIDIgZG8KICAgICAgICAgICAgZm9yIGMgPSAtMiwgMiBkbwogICAgICAgICAgICAgIGxvY2FsIHJyLCBjYyA9IHJvdyArIHIsIGNvbCArIGMKICAgICAgICAgICAgICBpZiByciA+PSAwIGFuZCBjYyA+PSAwIGFuZCByciA8IHNpemUgYW5kIGNjIDwgc2l6ZSB0aGVuCiAgICAgICAgICAgICAgICBsb2NhbCBkYXJrID0gKG1hdGguYWJzKHIpID09IDIgb3IgbWF0aC5hYnMoYykgPT0gMiBvciAociA9PSAwIGFuZCBjID09IDApKSBhbmQgMSBvciAwCiAgICAgICAgICAgICAgICBncmlkW3JyXVtjY10gPSBkYXJrCiAgICAgICAgICAgICAgICByZXNlcnZlZFtycl1bY2NdID0gdHJ1ZQogICAgICAgICAgICAgIGVuZAogICAgICAgICAgICBlbmQKICAgICAgICAgIGVuZAogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAoKICAtLSA0KSDmoLzlvI/kv6Hmga8gKyDlm7rlrprmmpfmqKHlnZfvvIjlhYjmlL7nva7vvIzmlbDmja7mlL7nva7ml7bot7Pov4cgcmVzZXJ2ZWTvvIkKICBsb2NhbCBiaXRzID0gYmNoX2Zvcm1hdCgoRUNfQklUU1tlY10gPDwgMykgfCBtYXNrKQogIGZvciBpID0gMCwgMTQgZG8gICAtLSDnq5blkJHvvIjliJcgOO+8iQogICAgbG9jYWwgbW9kID0gKGJpdHMgPj4gaSkgJiAxCiAgICBsb2NhbCByCiAgICBpZiBpIDwgNiB0aGVuIHIgPSBpCiAgICBlbHNlaWYgaSA8IDggdGhlbiByID0gaSArIDEKICAgIGVsc2UgciA9IHNpemUgLSAxNSArIGkgZW5kCiAgICBncmlkW3JdWzhdID0gbW9kCiAgICByZXNlcnZlZFtyXVs4XSA9IHRydWUKICBlbmQKICBmb3IgaSA9IDAsIDE0IGRvICAgLS0g5qiq5ZCR77yI6KGMIDjvvIkKICAgIGxvY2FsIG1vZCA9IChiaXRzID4+IGkpICYgMQogICAgbG9jYWwgYwogICAgaWYgaSA8IDggdGhlbiBjID0gc2l6ZSAtIGkgLSAxCiAgICBlbHNlaWYgaSA9PSA4IHRoZW4gYyA9IDE1IC0gaQogICAgZWxzZSBjID0gMTUgLSBpIC0gMSBlbmQKICAgIGdyaWRbOF1bY10gPSBtb2QKICAgIHJlc2VydmVkWzhdW2NdID0gdHJ1ZQogIGVuZAogIGdyaWRbc2l6ZSAtIDhdWzhdID0gMQogIHJlc2VydmVkW3NpemUgLSA4XVs4XSA9IHRydWUKCiAgLS0gNSkg5pWw5o2uIHppZ3phZyArIG1hc2vvvIjku47lj7PkuIvvvIzlj4zliJfmraXov5vvvIzot7PliJcgNu+8iQogIGxvY2FsIHRvdGFsX2JpdHMgPSAjY29kZXdvcmRzICogOAogIGxvY2FsIGJ5dGVJbmRleCwgYml0SW5kZXggPSAwLCA3CiAgbG9jYWwgcm93ID0gc2l6ZSAtIDEKICBsb2NhbCBpbmMgPSAtMQogIGZvciBjb2wgPSBzaXplIC0gMSwgMSwgLTIgZG8KICAgIGlmIGNvbCA8PSA2IHRoZW4gY29sID0gY29sIC0gMSBlbmQgICAtLSDot7Pov4fph4/ml7bliJcgNgogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBmb3IgXywgYyBpbiBpcGFpcnMoeyBjb2wsIGNvbCAtIDEgfSkgZG8KICAgICAgICBpZiBub3QgcmVzZXJ2ZWRbcm93XVtjXSB0aGVuCiAgICAgICAgICBsb2NhbCBkYXJrID0gMAogICAgICAgICAgaWYgYnl0ZUluZGV4IDwgI2NvZGV3b3JkcyB0aGVuCiAgICAgICAgICAgIGRhcmsgPSAoY29kZXdvcmRzW2J5dGVJbmRleCArIDFdID4+IGJpdEluZGV4KSAmIDEKICAgICAgICAgIGVuZAogICAgICAgICAgaWYgbWFza192YWwobWFzaywgcm93LCBjKSB0aGVuIGRhcmsgPSBkYXJrIH4gMSBlbmQKICAgICAgICAgIGdyaWRbcm93XVtjXSA9IGRhcmsKICAgICAgICAgIHJlc2VydmVkW3Jvd11bY10gPSB0cnVlCiAgICAgICAgICBiaXRJbmRleCA9IGJpdEluZGV4IC0gMQogICAgICAgICAgaWYgYml0SW5kZXggPT0gLTEgdGhlbgogICAgICAgICAgICBieXRlSW5kZXggPSBieXRlSW5kZXggKyAxCiAgICAgICAgICAgIGJpdEluZGV4ID0gNwogICAgICAgICAgZW5kCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgICByb3cgPSByb3cgKyBpbmMKICAgICAgaWYgcm93IDwgMCBvciBzaXplIDw9IHJvdyB0aGVuCiAgICAgICAgcm93ID0gcm93IC0gaW5jCiAgICAgICAgaW5jID0gLWluYwogICAgICAgIGJyZWFrCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCgogIHJldHVybiBncmlkCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBQZW5hbHR577yINCDmnaHop4TliJnvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwZW5hbHR5KGdyaWQsIHNpemUpCiAgbG9jYWwgdG90YWwgPSAwCiAgbG9jYWwgZnVuY3Rpb24gc2NhbihsaW5lKQogICAgbG9jYWwgcywgcnVuLCBwcmV2ID0gMCwgMSwgbGluZVsxXQogICAgZm9yIGkgPSAyLCAjbGluZSBkbwogICAgICBpZiBsaW5lW2ldID09IHByZXYgdGhlbgogICAgICAgIHJ1biA9IHJ1biArIDEKICAgICAgICBpZiBydW4gPT0gNSB0aGVuIHMgPSBzICsgMyBlbmQKICAgICAgICBpZiBydW4gPiA1IHRoZW4gcyA9IHMgKyAxIGVuZAogICAgICBlbHNlCiAgICAgICAgcnVuLCBwcmV2ID0gMSwgbGluZVtpXQogICAgICBlbmQKICAgIGVuZAogICAgcmV0dXJuIHMKICBlbmQKICBmb3IgciA9IDAsIHNpemUgLSAxIGRvCiAgICBsb2NhbCByb3csIGNvbCA9IHt9LCB7fQogICAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbyByb3dbYyArIDFdID0gZ3JpZFtyXVtjXSBlbmQKICAgIHRvdGFsID0gdG90YWwgKyBzY2FuKHJvdykKICAgIGZvciByciA9IDAsIHNpemUgLSAxIGRvIGNvbFtyciArIDFdID0gZ3JpZFtycl1bY10gZW5kCiAgICB0b3RhbCA9IHRvdGFsICsgc2Nhbihjb2wpCiAgZW5kCiAgZm9yIHIgPSAwLCBzaXplIC0gMiBkbwogICAgZm9yIGMgPSAwLCBzaXplIC0gMiBkbwogICAgICBsb2NhbCB2ID0gZ3JpZFtyXVtjXQogICAgICBpZiBncmlkW3JdW2MgKyAxXSA9PSB2IGFuZCBncmlkW3IgKyAxXVtjXSA9PSB2IGFuZCBncmlkW3IgKyAxXVtjICsgMV0gPT0gdiB0aGVuCiAgICAgICAgdG90YWwgPSB0b3RhbCArIDMKICAgICAgZW5kCiAgICBlbmQKICBlbmQKICBsb2NhbCBmdW5jdGlvbiBtYXRjaDExKGxpbmUsIGlkeCkKICAgIGxvY2FsIHAxID0geyAxLDAsMSwxLDEsMCwxLDAsMCwwLDAgfQogICAgbG9jYWwgcDIgPSB7IDAsMCwwLDAsMSwwLDEsMSwxLDAsMSB9CiAgICBmb3IgXywgcCBpbiBpcGFpcnMoeyBwMSwgcDIgfSkgZG8KICAgICAgbG9jYWwgb2sgPSB0cnVlCiAgICAgIGZvciBrID0gMSwgMTEgZG8KICAgICAgICBpZiBsaW5lW2lkeCArIGsgLSAxXSB+PSBwW2tdIHRoZW4gb2sgPSBmYWxzZSBicmVhayBlbmQKICAgICAgZW5kCiAgICAgIGlmIG9rIHRoZW4gcmV0dXJuIHRydWUgZW5kCiAgICBlbmQKICAgIHJldHVybiBmYWxzZQogIGVuZAogIGZvciByID0gMCwgc2l6ZSAtIDEgZG8KICAgIGxvY2FsIGxpbmUgPSB7fQogICAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbyBsaW5lW2MgKyAxXSA9IGdyaWRbcl1bY10gZW5kCiAgICBmb3IgaSA9IDEsICNsaW5lIC0gMTAgZG8gaWYgbWF0Y2gxMShsaW5lLCBpKSB0aGVuIHRvdGFsID0gdG90YWwgKyA0MCBlbmQgZW5kCiAgZW5kCiAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbwogICAgbG9jYWwgbGluZSA9IHt9CiAgICBmb3IgciA9IDAsIHNpemUgLSAxIGRvIGxpbmVbciArIDFdID0gZ3JpZFtyXVtjXSBlbmQKICAgIGZvciBpID0gMSwgI2xpbmUgLSAxMCBkbyBpZiBtYXRjaDExKGxpbmUsIGkpIHRoZW4gdG90YWwgPSB0b3RhbCArIDQwIGVuZCBlbmQKICBlbmQKICBsb2NhbCBkYXJrID0gMAogIGZvciByID0gMCwgc2l6ZSAtIDEgZG8gZm9yIGMgPSAwLCBzaXplIC0gMSBkbyBkYXJrID0gZGFyayArIGdyaWRbcl1bY10gZW5kIGVuZAogIGxvY2FsIHRvdCA9IHNpemUgKiBzaXplCiAgdG90YWwgPSB0b3RhbCArIG1hdGguZmxvb3IobWF0aC5hYnMoZGFyayAqIDIwIC0gdG90ICogMTApIC8gdG90KSAqIDEwCiAgcmV0dXJuIHRvdGFsCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDkuLvmtYHnqIsKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBlbmNvZGUodGV4dCwgZWMpCiAgaWYgZWMgPT0gbmlsIG9yIG5vdCBFQ19CSVRTW2VjXSB0aGVuIGVjID0gJ00nIGVuZAogIGxvY2FsIHZlcnNpb24gPSBjaG9vc2VfdmVyc2lvbigjdGV4dCwgZWMpCiAgaWYgbm90IHZlcnNpb24gdGhlbgogICAgcmV0dXJuIG5pbCwgJ2RhdGEgdG9vIGxvbmcgZm9yIFFSIHYxLTYgKCcgLi4gI3RleHQgLi4gJyBieXRlcyknCiAgZW5kCiAgbG9jYWwgZGF0YV90b3RhbCA9IGRhdGFfdG90YWxfb2YodmVyc2lvbiwgZWMpCiAgbG9jYWwgZGF0YV9ieXRlcyA9IGJ1aWxkX2JpdHN0cmVhbSh0ZXh0LCBkYXRhX3RvdGFsKQogIGxvY2FsIGNvZGV3b3JkcyA9IG1ha2VfY29kZXdvcmRzKGRhdGFfYnl0ZXMsIHZlcnNpb24sIGVjKQoKICBsb2NhbCBiZXN0X21hc2ssIGJlc3RfcGVuLCBiZXN0X2dyaWQgPSAwLCBuaWwsIG5pbAogIGZvciBtID0gMCwgNyBkbwogICAgbG9jYWwgZyA9IGJ1aWxkX21hdHJpeChjb2Rld29yZHMsIHZlcnNpb24sIGVjLCBtKQogICAgbG9jYWwgcCA9IHBlbmFsdHkoZywgc2l6ZV9vZih2ZXJzaW9uKSkKICAgIGlmIG5vdCBiZXN0X3BlbiBvciBwIDwgYmVzdF9wZW4gdGhlbgogICAgICBiZXN0X3BlbiwgYmVzdF9tYXNrLCBiZXN0X2dyaWQgPSBwLCBtLCBnCiAgICBlbmQKICBlbmQKICByZXR1cm4gewogICAgdmVyc2lvbiA9IHZlcnNpb24sIHNpemUgPSBzaXplX29mKHZlcnNpb24pLCBlYyA9IGVjLCBtYXNrID0gYmVzdF9tYXNrLAogICAgY29kZXdvcmRzID0gI2NvZGV3b3JkcywgZGF0YV9jYXBhY2l0eSA9IGRhdGFfdG90YWwsIGdyaWQgPSBiZXN0X2dyaWQsCiAgfQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6L6T5Ye6Ci0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gZ3JpZF90b19qc29uKGdyaWQsIHNpemUpCiAgbG9jYWwgcm93cyA9IHt9CiAgZm9yIHIgPSAwLCBzaXplIC0gMSBkbwogICAgbG9jYWwgY2VsbHMgPSB7fQogICAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbyBjZWxsc1tjICsgMV0gPSB0b3N0cmluZyhncmlkW3JdW2NdKSBlbmQKICAgIHJvd3NbciArIDFdID0gJ1snIC4uIHRhYmxlLmNvbmNhdChjZWxscywgJywnKSAuLiAnXScKICBlbmQKICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChyb3dzLCAnLCcpIC4uICddJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGdyaWRfdG9fc3ZnKGdyaWQsIHNpemUsIHNjYWxlKQogIHNjYWxlID0gc2NhbGUgb3IgNAogIGxvY2FsIHF1aWV0ID0gNAogIGxvY2FsIHB4ID0gKHNpemUgKyAyICogcXVpZXQpICogc2NhbGUKICBsb2NhbCBvdXQgPSB7fQogIG91dFsjb3V0ICsgMV0gPSBzdHJpbmcuZm9ybWF0KAogICAgJzxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iJWQiIGhlaWdodD0iJWQiIHZpZXdCb3g9IjAgMCAlZCAlZCI+JywKICAgIHB4LCBweCwgcHgsIHB4KQogIG91dFsjb3V0ICsgMV0gPSAnPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPicKICBmb3IgciA9IDAsIHNpemUgLSAxIGRvCiAgICBmb3IgYyA9IDAsIHNpemUgLSAxIGRvCiAgICAgIGlmIGdyaWRbcl1bY10gPT0gMSB0aGVuCiAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHN0cmluZy5mb3JtYXQoCiAgICAgICAgICAnPHJlY3QgeD0iJWQiIHk9IiVkIiB3aWR0aD0iJWQiIGhlaWdodD0iJWQiIGZpbGw9IiMwMDAwMDAiLz4nLAogICAgICAgICAgKGMgKyBxdWlldCkgKiBzY2FsZSwgKHIgKyBxdWlldCkgKiBzY2FsZSwgc2NhbGUsIHNjYWxlKQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIG91dFsjb3V0ICsgMV0gPSAnPC9zdmc+JwogIHJldHVybiB0YWJsZS5jb25jYXQob3V0LCAnJykKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJiYWQgaW5wdXQifScgZW5kCiAgbG9jYWwgdGV4dCA9IHAudiBvciAnJwogIGxvY2FsIGVjID0gcC5lYyBvciAnTScKICBsb2NhbCBvcCA9IHAub3Agb3IgJ3N2ZycKICBsb2NhbCByZXMsIGVyciA9IGVuY29kZSh0ZXh0LCBlYykKICBpZiBub3QgcmVzIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiJyAuLiB0b3N0cmluZyhlcnIpIC4uICcifScgZW5kCiAgaWYgb3AgPT0gJ21hdHJpeCcgdGhlbgogICAgcmV0dXJuIGdyaWRfdG9fanNvbihyZXMuZ3JpZCwgcmVzLnNpemUpCiAgZWxzZWlmIG9wID09ICdzdmcnIHRoZW4KICAgIHJldHVybiBncmlkX3RvX3N2ZyhyZXMuZ3JpZCwgcmVzLnNpemUsIHRvbnVtYmVyKHAuc2NhbGUpIG9yIDQpCiAgZWxzZWlmIG9wID09ICdpbmZvJyB0aGVuCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgKICAgICAgJ3sidmVyc2lvbiI6JWQsInNpemUiOiVkLCJlYyI6IiVzIiwibWFzayI6JWQsImNvZGV3b3JkcyI6JWQsImRhdGFfY2FwYWNpdHkiOiVkfScsCiAgICAgIHJlcy52ZXJzaW9uLCByZXMuc2l6ZSwgZWMsIHJlcy5tYXNrLCByZXMuY29kZXdvcmRzLCByZXMuZGF0YV9jYXBhY2l0eSkKICBlbHNlaWYgb3AgPT0gJ2NvZGV3b3JkcycgdGhlbgogICAgLS0g6LCD6K+VL+agoemqjO+8mui/lOWbniDmlbDmja4rRUMg5YWo6YOo56CB5a2X77yIaGV4IOaVsOe7hO+8ie+8jOS4juWPguiAg+WunueOsOmAkOWtl+iKguavlOWvuQogICAgbG9jYWwgZGF0YV90b3RhbCA9IGRhdGFfdG90YWxfb2YocmVzLnZlcnNpb24sIHJlcy5lYykKICAgIGxvY2FsIGRiID0gYnVpbGRfYml0c3RyZWFtKHRleHQsIGRhdGFfdG90YWwpCiAgICBsb2NhbCBjdyA9IG1ha2VfY29kZXdvcmRzKGRiLCByZXMudmVyc2lvbiwgcmVzLmVjKQogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIGkgPSAxLCAjY3cgZG8gcGFydHNbaV0gPSBzdHJpbmcuZm9ybWF0KCciJTAyWCInLCBjd1tpXSkgZW5kCiAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICBlbmQKICByZXR1cm4gJ3t9JwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBjaWRyCi0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDnvZHnu5wgQ0lEUiAvIElQIOW3peWFt++8iOe6ryBMdWHvvIzoh6rljIXlkKvvvInigJTigJREdWNrREIg5peg5YaF5bu6IENJRFIvSVB2NC9JUHY2IOWHveaVsO+8jAotLSAgICAgICDmnKzlupPooaXkuIrvvJpJUCDop6PmnpDjgIFDSURSIOaIkOWRmOWIpOWumuOAgee9kee7nC/lub/mkq0v6KeE5qih44CB5YWs56eB572R5YiG57G744CCCi0tICAgICAgIOWQjOaXtuaUr+aMgSBJUHY077yIMzIg5L2N77yJ5LiOIElQdjbvvIgxMjgg5L2N77yM5oyJIDgg5LiqIDE2IOS9jSBoZXh0ZXQg5aSE55CG77yM5LiN5L6d6LWW5aSn5pW05pWw77yJ44CCCi0tICAgICAgIG9wIOmAiemhue+8mgotLSAgICAgICAgICd2ZXJzaW9uJyAg4oaSIDQg5oiWIDbvvIhvcD12ZXJzaW9uLCB2PTxpcD7vvIkKLS0gICAgICAgICAnaXAyaW50JyAgIOKGkiBJUHY0IOWNgei/m+WItuaVtOaVsO+8m0lQdjYg6L+U5ZueIDMyIOS9jSBoZXgg5Liy77yITHVhIDUuMSDlj4znsr7luqbmlL7kuI3kuIsgMTI4IOS9je+8iQotLSAgICAgICAgICdpbnQyaXAnICAg4oaSIElQdjQg5pW05pWwIOKGkiDngrnliIbkuLIKLS0gICAgICAgICAnaW5fY2lkcicgIOKGkiBib29s77yIdj08aXA+LCBjaWRyPTxuZXQvcHJlZml4Pu+8iQotLSAgICAgICAgICdjaWRyX2luZm8n4oaSIHtuZXR3b3JrLCBicm9hZGNhc3QsIHByZWZpeCwgc2l6ZSwgbWFzaywgaXNfdjZ977yIdj08Y2lkcj7vvJtzaXplIOi2hSAyXjUzIOaXtui/lOWbniAiMl5OIu+8iQotLSAgICAgICAgICdjbGFzc2lmeScg4oaSIHB1YmxpYy9wcml2YXRlL2xvb3BiYWNrL2xpbmstbG9jYWwvbXVsdGljYXN0L3Vuc3BlY2lmaWVkL3Jlc2VydmVkCi0tICAgICAgICAgJ25ldCcgICAgICDihpIg572R57uc5Zyw5Z2A5Liy77yIdj08Y2lkcj7vvIkKLS0gICAgICAgICAnYnJvYWRjYXN0J+KGkiDlub/mkq3lnLDlnYDkuLLvvIjku4UgSVB2NO+8m0lQdjYg6L+U5Zue5pyr5Zyw5Z2A77yJCi0tICAgICAgIOivmuWunui+ueeVjO+8mklQdjYgem9uZSDntKLlvJUgLyDljYHlha3ov5vliLYgSVB2NO+8iDB477yJLyBJUHY0LW1hcHBlZCDku4XmjInnuq/lnLDlnYDlpITnkIbvvJsKLS0gICAgICAgOjpmZmZmOmEuYi5jLmQg6L+Z57G75pig5bCE5Zyw5Z2A5oyJIElQdjYg6Kej5p6Q77yI5LiN6Ieq5Yqo6ZmN57qn5Li6IHY077yJ44CCCi0tICAgICAgIGNsYXNzaWZ5IOWvuem9kCBQeXRob24gaXBhZGRyZXNzIOivreS5ie+8iDIyNC0yMzkgbXVsdGljYXN044CBMjQwKy80IHByaXZhdGXjgIFDR05BVCAxMDAuNjQvMTAgcHVibGlj77yJ77ybCi0tICAgICAgIOW3suefpSAxIOWkhOW3ruW8gu+8mjE6MjozOjQ6NTo2Ojc6OCDmnKzlupPliKQgcHVibGlj77yI5q2j56Gu77yJ77yMUHl0aG9uIGlzX3Jlc2VydmVkIOivr+WIpCByZXNlcnZlZOOAggotLSBAc291cmNlOiDoh6rljIXlkKsKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCk6Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdjaWRyJywge29wOiAnaW5fY2lkcicsIHY6ICcxOTIuMTY4LjEuNScsIGNpZHI6ICcxOTIuMTY4LjAuMC8xNid9KTsgIC0tIHRydWUKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2NpZHInLCB7b3A6ICdjaWRyX2luZm8nLCB2OiAnMTAuMC4wLjAvOCd9KTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2NpZHInLCB7b3A6ICdjbGFzc2lmeScsIHY6ICcxNzIuMTYuNS45J30pOyAgLS0gcHJpdmF0ZQoKbG9jYWwgZnVuY3Rpb24gdG9oZXgobiwgd2lkdGgpCiAgbG9jYWwgcyA9IHN0cmluZy5mb3JtYXQoJyV4JywgbikKICB3aGlsZSAjcyA8IHdpZHRoIGRvIHMgPSAnMCcgLi4gcyBlbmQKICByZXR1cm4gcwplbmQKCi0tIOino+aekCBJUHY0IOKGkiA0IOS4qiBvY3RldO+8iDAtMjU177yJ77yM5aSx6LSlIG5pbApsb2NhbCBmdW5jdGlvbiBwYXJzZV92NChzKQogIGxvY2FsIGEsIGIsIGMsIGQgPSBzOm1hdGNoKCdeKCVkKyklLiglZCspJS4oJWQrKSUuKCVkKykkJykKICBpZiBub3QgYSB0aGVuIHJldHVybiBuaWwgZW5kCiAgbG9jYWwgbyA9IHsgdG9udW1iZXIoYSksIHRvbnVtYmVyKGIpLCB0b251bWJlcihjKSwgdG9udW1iZXIoZCkgfQogIGZvciBfLCB4IGluIGlwYWlycyhvKSBkbwogICAgaWYgeCA8IDAgb3IgeCA+IDI1NSB0aGVuIHJldHVybiBuaWwgZW5kCiAgZW5kCiAgcmV0dXJuIG8KZW5kCgotLSDop6PmnpAgSVB2NiDihpIgOCDkuKogMTYtYml0IGhleHRldO+8iDAtNjU1MzXvvInvvIzmlK/mjIEgOjog5Y6L57yp77yM5aSx6LSlIG5pbApsb2NhbCBmdW5jdGlvbiBwYXJzZV92NihzKQogIGxvY2FsIGxvdyA9IHM6bG93ZXIoKQogIGxvY2FsIHBhcnRzCiAgbG9jYWwgbnAgPSAobG93OmdzdWIoJzo6JywgJycpIGFuZCAoc2VsZWN0KDIsIGxvdzpnc3ViKCc6OicsICcnKSkgKyAxKSkKICBsb2NhbCBkY29sb24gPSBsb3c6ZmluZCgnOjonLCAxLCB0cnVlKQogIGlmIGRjb2xvbiB0aGVuCiAgICBpZiAobG93OmdzdWIoJzo6JywgJycpOmdzdWIoJ3gnLCAnJykgPT0gJycpIGFuZCBsb3cgfj0gJzo6JyBhbmQgbG93IH49ICc6OjonIHRoZW4gZW5kCiAgICBpZiBsb3c6bWF0Y2goJzo6Lio6OicpIHRoZW4gcmV0dXJuIG5pbCBlbmQgICAgICAgICAgLS0g5aSa5LiqIDo6CiAgICBsb2NhbCBiZWZvcmUgPSBsb3c6bWF0Y2goJ14oLiopOjonKSBvciAnJwogICAgbG9jYWwgYWZ0ZXIgPSBsb3c6bWF0Y2goJzo6KC4qKSQnKSBvciAnJwogICAgbG9jYWwgbGVmdCwgcmlnaHQgPSB7fSwge30KICAgIGZvciBwIGluIGJlZm9yZTpnbWF0Y2goJ1teOl0rJykgZG8gbGVmdFsjbGVmdCArIDFdID0gcCBlbmQKICAgIGZvciBwIGluIGFmdGVyOmdtYXRjaCgnW146XSsnKSBkbyByaWdodFsjcmlnaHQgKyAxXSA9IHAgZW5kCiAgICBsb2NhbCBwYWQgPSA4IC0gKCNsZWZ0ICsgI3JpZ2h0KQogICAgaWYgcGFkIDwgMCB0aGVuIHJldHVybiBuaWwgZW5kCiAgICBwYXJ0cyA9IHt9CiAgICBmb3IgaSA9IDEsICNsZWZ0IGRvCiAgICAgIGxvY2FsIGggPSB0b251bWJlcihsZWZ0W2ldLCAxNikKICAgICAgaWYgbm90IGggb3IgaCA+IDB4RkZGRiBvciAjbGVmdFtpXSA+IDQgdGhlbiByZXR1cm4gbmlsIGVuZAogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IGgKICAgIGVuZAogICAgZm9yIF8gPSAxLCBwYWQgZG8gcGFydHNbI3BhcnRzICsgMV0gPSAwIGVuZAogICAgZm9yIGkgPSAxLCAjcmlnaHQgZG8KICAgICAgbG9jYWwgaCA9IHRvbnVtYmVyKHJpZ2h0W2ldLCAxNikKICAgICAgaWYgbm90IGggb3IgaCA+IDB4RkZGRiBvciAjcmlnaHRbaV0gPiA0IHRoZW4gcmV0dXJuIG5pbCBlbmQKICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSBoCiAgICBlbmQKICBlbHNlCiAgICBwYXJ0cyA9IHt9CiAgICBmb3IgcCBpbiBsb3c6Z21hdGNoKCdbXjpdKycpIGRvCiAgICAgIGxvY2FsIGggPSB0b251bWJlcihwLCAxNikKICAgICAgaWYgbm90IGggb3IgaCA+IDB4RkZGRiBvciAjcCA+IDQgdGhlbiByZXR1cm4gbmlsIGVuZAogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IGgKICAgIGVuZAogICAgaWYgI3BhcnRzIH49IDggdGhlbiByZXR1cm4gbmlsIGVuZAogIGVuZAogIGlmICNwYXJ0cyB+PSA4IHRoZW4gcmV0dXJuIG5pbCBlbmQKICByZXR1cm4gcGFydHMKZW5kCgotLSDnu5/kuIDop6PmnpDvvJrov5Tlm54ge3Y9NHw2LCB3b3Jkcz1bLi4uXSwgd2JpdHM9MzJ8MTZ9IOaIliBuaWwKbG9jYWwgZnVuY3Rpb24gcGFyc2VfYW55KHMpCiAgaWYgbm90IHMgb3IgcyA9PSAnJyB0aGVuIHJldHVybiBuaWwgZW5kCiAgcyA9IHM6bWF0Y2goJ14lcyooLi0pJXMqJCcpCiAgbG9jYWwgdjQgPSBwYXJzZV92NChzKQogIGlmIHY0IHRoZW4KICAgIGxvY2FsIGkgPSB2NFsxXSAqIDE2Nzc3MjE2ICsgdjRbMl0gKiA2NTUzNiArIHY0WzNdICogMjU2ICsgdjRbNF0KICAgIHJldHVybiB7IHYgPSA0LCB3b3JkcyA9IHsgaSB9LCB3Yml0cyA9IDMyIH0KICBlbmQKICBsb2NhbCB2NiA9IHBhcnNlX3Y2KHMpCiAgaWYgdjYgdGhlbiByZXR1cm4geyB2ID0gNiwgd29yZHMgPSB2Niwgd2JpdHMgPSAxNiB9IGVuZAogIHJldHVybiBuaWwKZW5kCgotLSDmjIkgcHJlZml4IOS9jeaOqeeggeavlOi+g+S4pOS4quWQjOeJiOacrCBJUO+8iHdvcmRzIOaVsOe7hCArIHdiaXRz77yJCmxvY2FsIGZ1bmN0aW9uIGlwX21hdGNoZXNfbWFzayhpcHcsIG5ldHcsIHdiaXRzLCBwcmVmaXgpCiAgZm9yIGkgPSAxLCAjaXB3IGRvCiAgICBsb2NhbCBiaXRzX2JlZm9yZSA9IChpIC0gMSkgKiB3Yml0cwogICAgaWYgcHJlZml4ID4gYml0c19iZWZvcmUgdGhlbgogICAgICBsb2NhbCB0YWtlID0gbWF0aC5taW4od2JpdHMsIHByZWZpeCAtIGJpdHNfYmVmb3JlKQogICAgICBsb2NhbCBtYXNrID0gKCgyIF4gd2JpdHMpIC0gMSkgPDwgKHdiaXRzIC0gdGFrZSkKICAgICAgaWYgKGlwd1tpXSAmIG1hc2spIH49IChuZXR3W2ldICYgbWFzaykgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgICBlbmQKICBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCi0tIOWJjee8gOaOqeegge+8iOmZkOWItuWcqCB3Yml0cyDlhoXvvInigJTigJQg5YWz6ZSu77ya55SoICgyXnRha2UtMSk8PCh3Yml0cy10YWtlKe+8jAotLSDkuI3og73nlKggKDJed2JpdHMtMSk8PCh3Yml0cy10YWtlKe+8iOWQjuiAheWvuSB3Yml0cz0zMiDkvJrmuqLlh7rliLAgNjQg5L2N77yMTHVhSklUICYg5pivIDY0IOS9jSDihpIg5rGh5p+T77yJ44CCCmxvY2FsIGZ1bmN0aW9uIG5ldG1hc2sod2JpdHMsIHRha2UpCiAgaWYgdGFrZSA+PSB3Yml0cyB0aGVuIHJldHVybiAoMiBeIHdiaXRzKSAtIDEgZW5kCiAgaWYgdGFrZSA8PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgcmV0dXJuICgyIF4gdGFrZSAtIDEpIDw8ICh3Yml0cyAtIHRha2UpCmVuZAoKLS0g5bqU55So572R57uc5o6p56CBIOKGkiDmlrAgd29yZHPvvIjnlKjkuo4gbmV0d29yayAvIG1hc2sg6L6T5Ye677yJCmxvY2FsIGZ1bmN0aW9uIGFwcGx5X21hc2soaXB3LCB3Yml0cywgcHJlZml4KQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIGkgPSAxLCAjaXB3IGRvCiAgICBsb2NhbCBiaXRzX2JlZm9yZSA9IChpIC0gMSkgKiB3Yml0cwogICAgbG9jYWwgdGFrZSA9IHByZWZpeCAtIGJpdHNfYmVmb3JlCiAgICBpZiB0YWtlID4gMCB0aGVuCiAgICAgIG91dFtpXSA9IGlwd1tpXSAmIG5ldG1hc2sod2JpdHMsIHRha2UpCiAgICBlbHNlCiAgICAgIG91dFtpXSA9IDAKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCi0tIOS4u+acuuS9jeaOqeegge+8iOe9kee7nOaOqeeggeeahOihpe+8jOmZkOWItuWcqCB3Yml0cyDlhoXvvIk9IGZ1bGwgWE9SIG5ldG1hc2sKbG9jYWwgZnVuY3Rpb24gaW52ZXJ0X21hc2soaXB3LCB3Yml0cywgcHJlZml4KQogIGxvY2FsIG91dCA9IHt9CiAgbG9jYWwgZnVsbCA9ICgyIF4gd2JpdHMpIC0gMQogIGZvciBpID0gMSwgI2lwdyBkbwogICAgbG9jYWwgYml0c19iZWZvcmUgPSAoaSAtIDEpICogd2JpdHMKICAgIGxvY2FsIHRha2UgPSBwcmVmaXggLSBiaXRzX2JlZm9yZQogICAgaWYgdGFrZSA+IDAgdGhlbgogICAgICBvdXRbaV0gPSBmdWxsIH4gbmV0bWFzayh3Yml0cywgdGFrZSkKICAgIGVsc2UKICAgICAgb3V0W2ldID0gZnVsbAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIHdvcmRzX3RvX3N0cih3LCB3Yml0cykKICBpZiB3Yml0cyA9PSAzMiB0aGVuCiAgICBsb2NhbCBpID0gd1sxXQogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkLiVkLiVkLiVkJywgKGkgPj4gMjQpICYgMjU1LCAoaSA+PiAxNikgJiAyNTUsIChpID4+IDgpICYgMjU1LCBpICYgMjU1KQogIGVuZAogIGxvY2FsIGggPSB7fQogIGZvciBpID0gMSwgOCBkbyBoW2ldID0gc3RyaW5nLmZvcm1hdCgnJXgnLCB3W2ldKSBlbmQgICAtLSDml6DliY3lr7zpm7bvvIhJUHY2IOaDr+S+i++8iQogIC0tIOaKmOWPoOacgOmVvyAwIOauteS4uiA6OgogIGxvY2FsIGJlc3QsIGJzdGFydCwgYmxlbiA9IG5pbCwgMSwgMQogIGxvY2FsIGkgPSAxCiAgd2hpbGUgaSA8PSA4IGRvCiAgICBpZiB3W2ldID09IDAgdGhlbgogICAgICBsb2NhbCBqID0gaQogICAgICB3aGlsZSBqIDw9IDggYW5kIHdbal0gPT0gMCBkbyBqID0gaiArIDEgZW5kCiAgICAgIGxvY2FsIGxlbiA9IGogLSBpCiAgICAgIGlmIGxlbiA+IGJsZW4gdGhlbiBibGVuLCBic3RhcnQsIGJlc3QgPSBsZW4sIGksIGkgZW5kCiAgICAgIGkgPSBqCiAgICBlbHNlIGkgPSBpICsgMSBlbmQKICBlbmQKICBsb2NhbCBvdXQKICBpZiBibGVuID49IDIgYW5kIGJlc3QgdGhlbgogICAgbG9jYWwgbGVmdCwgcmlnaHQgPSB7fSwge30KICAgIGZvciBrID0gMSwgYnN0YXJ0IC0gMSBkbyBsZWZ0WyNsZWZ0ICsgMV0gPSBoW2tdIGVuZAogICAgZm9yIGsgPSBic3RhcnQgKyBibGVuLCA4IGRvIHJpZ2h0WyNyaWdodCArIDFdID0gaFtrXSBlbmQKICAgIG91dCA9IHRhYmxlLmNvbmNhdChsZWZ0LCAnOicpIC4uICc6OicgLi4gdGFibGUuY29uY2F0KHJpZ2h0LCAnOicpCiAgICBpZiBvdXQgPT0gJzo6JyB0aGVuIG91dCA9ICc6OicgZW5kCiAgZWxzZQogICAgb3V0ID0gdGFibGUuY29uY2F0KGgsICc6JykKICBlbmQKICByZXR1cm4gb3V0CmVuZAoKLS0g5YiG57G777yIUkZDIDE5MTggLyAxMjcvOCAvIDE2OS4yNTQvMTYgLyAxMDAuNjQvMTAgLyDlpJrmkq0gLyB1bnNwZWNpZmllZO+8iQpsb2NhbCBmdW5jdGlvbiBjbGFzc2lmeShpcCkKICBpZiBpcC52ID09IDQgdGhlbgogICAgbG9jYWwgbyA9IHsgKGlwLndvcmRzWzFdID4+IDI0KSAmIDI1NSwgKGlwLndvcmRzWzFdID4+IDE2KSAmIDI1NSwgKGlwLndvcmRzWzFdID4+IDgpICYgMjU1LCBpcC53b3Jkc1sxXSAmIDI1NSB9CiAgICBpZiBvWzFdID09IDAgdGhlbiByZXR1cm4gJ3Vuc3BlY2lmaWVkJyBlbmQKICAgIGlmIG9bMV0gPT0gMTAgdGhlbiByZXR1cm4gJ3ByaXZhdGUnIGVuZAogICAgaWYgb1sxXSA9PSAxMjcgdGhlbiByZXR1cm4gJ2xvb3BiYWNrJyBlbmQKICAgIGlmIG9bMV0gPT0gMTY5IGFuZCBvWzJdID09IDI1NCB0aGVuIHJldHVybiAnbGluay1sb2NhbCcgZW5kCiAgICBpZiBvWzFdID09IDE3MiBhbmQgb1syXSA+PSAxNiBhbmQgb1syXSA8PSAzMSB0aGVuIHJldHVybiAncHJpdmF0ZScgZW5kCiAgICBpZiBvWzFdID09IDE5MiBhbmQgb1syXSA9PSAxNjggdGhlbiByZXR1cm4gJ3ByaXZhdGUnIGVuZAogICAgaWYgb1sxXSA+PSAyMjQgYW5kIG9bMV0gPD0gMjM5IHRoZW4gcmV0dXJuICdtdWx0aWNhc3QnIGVuZCAgIC0tIDIyNC4wLjAuMC80CiAgICBpZiBvWzFdID49IDI0MCB0aGVuIHJldHVybiAncHJpdmF0ZScgZW5kICAgICAgICAgICAgICAgICAgICAgLS0gMjQwLjAuMC4wLzTvvIjlr7npvZAgUHl0aG9uIGlzX3ByaXZhdGXvvJtDR05BVCAxMDAuNjQvMTAg5b2SIHB1YmxpY++8iQogICAgcmV0dXJuICdwdWJsaWMnCiAgZWxzZQogICAgbG9jYWwgdyA9IGlwLndvcmRzCiAgICBpZiB3WzFdID09IDAgYW5kIHdbMl0gPT0gMCBhbmQgd1szXSA9PSAwIGFuZCB3WzRdID09IDAgYW5kIHdbNV0gPT0gMCBhbmQgd1s2XSA9PSAwCiAgICAgICBhbmQgd1s3XSA9PSAwIGFuZCB3WzhdID09IDAgdGhlbiByZXR1cm4gJ3Vuc3BlY2lmaWVkJyBlbmQKICAgIGlmIHdbMV0gPT0gMCBhbmQgd1syXSA9PSAwIGFuZCB3WzNdID09IDAgYW5kIHdbNF0gPT0gMCBhbmQgd1s1XSA9PSAwIGFuZCB3WzZdID09IDAKICAgICAgIGFuZCB3WzddID09IDAgYW5kIHdbOF0gPT0gMSB0aGVuIHJldHVybiAnbG9vcGJhY2snIGVuZAogICAgLS0g5YmN57yA5YiG57G75oyJIHdbMV0g55qEIGxlYWRpbmcgYml0c++8iOS4jeaYryB3Wzdd77yB77yJCiAgICBpZiAod1sxXSAmIDB4RkYwMCkgPT0gMHhGRjAwIHRoZW4gcmV0dXJuICdtdWx0aWNhc3QnIGVuZCAgICAgICAgICAgLS0gZmYwMDo6LzgKICAgIGlmICh3WzFdICYgMHhGRkMwKSA9PSAweEZFODAgdGhlbiByZXR1cm4gJ2xpbmstbG9jYWwnIGVuZCAgICAgICAgICAtLSBmZTgwOjovMTAKICAgIGlmICh3WzFdICYgMHhGRTAwKSA9PSAweEZDMDAgdGhlbiByZXR1cm4gJ3ByaXZhdGUnIGVuZCAgICAgICAgICAgICAtLSBmYzAwOjovNyAoVUxBKQogICAgaWYgd1sxXSA9PSAweDIwMDEgYW5kIHdbMl0gPT0gMHgwZGI4IHRoZW4gcmV0dXJuICdwcml2YXRlJyBlbmQgICAgIC0tIDIwMDE6ZGI4OjovMzIgZG9jdW1lbnRhdGlvbgogICAgcmV0dXJuICdwdWJsaWMnCiAgZW5kCmVuZAoKbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHRvc3RyaW5nKHMpOmdzdWIoJyhbXFxcIlxuXHRccl0pJywgZnVuY3Rpb24oYykKICAgIGlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcgZWxzZWlmIGMgPT0gJyInIHRoZW4gcmV0dXJuICdcXCInCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicgZWxzZSByZXR1cm4gYyBlbmQKICBlbmQpKQplbmQKCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbiBwID0geyB2ID0gcCB9IGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpbnB1dCJ9JyBlbmQKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2NsYXNzaWZ5JwogIGxvY2FsIHYgPSBwLnYKICBpZiBub3QgdiB0aGVuIHJldHVybiAneyJlcnJvciI6Im1pc3NpbmcgdiJ9JyBlbmQKCiAgaWYgb3AgPT0gJ3ZlcnNpb24nIHRoZW4KICAgIGxvY2FsIGlwID0gcGFyc2VfYW55KHYpCiAgICBpZiBub3QgaXAgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJiYWQgaXAifScgZW5kCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgneyJ2ZXJzaW9uIjolZH0nLCBpcC52KQogIGVsc2VpZiBvcCA9PSAnaXAyaW50JyB0aGVuCiAgICBsb2NhbCBpcCA9IHBhcnNlX2FueSh2KQogICAgaWYgbm90IGlwIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGlwIn0nIGVuZAogICAgaWYgaXAudiA9PSA0IHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJ3sidmFsdWUiOiVkLCJ2NiI6ZmFsc2V9JywgaXAud29yZHNbMV0pIGVuZAogICAgbG9jYWwgaGV4ID0gJycKICAgIGZvciBpID0gMSwgOCBkbyBoZXggPSBoZXggLi4gdG9oZXgoaXAud29yZHNbaV0sIDQpIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ3sidmFsdWUiOiIlcyIsInY2Ijp0cnVlfScsIGhleCkKICBlbHNlaWYgb3AgPT0gJ2ludDJpcCcgdGhlbgogICAgbG9jYWwgbiA9IHRvbnVtYmVyKHAubikgb3IgdG9udW1iZXIodikKICAgIGlmIG5vdCBuIG9yIG4gPCAwIG9yIG4gPiAweEZGRkZGRkZGIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGludCJ9JyBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCciJWQuJWQuJWQuJWQiJywgKG4gPj4gMjQpICYgMjU1LCAobiA+PiAxNikgJiAyNTUsIChuID4+IDgpICYgMjU1LCBuICYgMjU1KQogIGVsc2VpZiBvcCA9PSAnaW5fY2lkcicgdGhlbgogICAgbG9jYWwgY2lkciA9IHAuY2lkciBvciB2Om1hdGNoKCdeKC4rKS8oJWQrKSQnKQogICAgbG9jYWwgaXAgPSBwYXJzZV9hbnkodikKICAgIGlmIG5vdCBpcCB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpcCJ9JyBlbmQKICAgIGxvY2FsIG5ldHN0ciwgcGZ4c3RyCiAgICBpZiBwLmNpZHIgdGhlbgogICAgICBuZXRzdHIsIHBmeHN0ciA9IHAuY2lkcjptYXRjaCgnXiguKykvKCVkKykkJykKICAgIGVsc2UKICAgICAgbmV0c3RyLCBwZnhzdHIgPSB2Om1hdGNoKCdeKC4rKS8oJWQrKSQnKQogICAgZW5kCiAgICBpZiBub3QgbmV0c3RyIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGNpZHIsIG5lZWQgYS9iIn0nIGVuZAogICAgbG9jYWwgcHJlZml4ID0gdG9udW1iZXIocGZ4c3RyKQogICAgbG9jYWwgbmV0ID0gcGFyc2VfYW55KG5ldHN0cikKICAgIGlmIG5vdCBuZXQgb3IgbmV0LnYgfj0gaXAudiBvciBwcmVmaXggPCAwIG9yIHByZWZpeCA+IChpcC52ID09IDQgYW5kIDMyIG9yIDEyOCkgdGhlbgogICAgICByZXR1cm4gJ3siZXJyb3IiOiJiYWQgY2lkciBvciB2ZXJzaW9uIG1pc21hdGNoIn0nCiAgICBlbmQKICAgIGxvY2FsIGlubmV0ID0gaXBfbWF0Y2hlc19tYXNrKGlwLndvcmRzLCBuZXQud29yZHMsIGlwLndiaXRzLCBwcmVmaXgpCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgneyJpbiI6JXMsInYiOiVkfScsIHRvc3RyaW5nKGlubmV0KSwgaXAudikKICBlbHNlaWYgb3AgPT0gJ25ldCcgb3Igb3AgPT0gJ2Jyb2FkY2FzdCcgb3Igb3AgPT0gJ2NpZHJfaW5mbycgdGhlbgogICAgbG9jYWwgbmV0c3RyLCBwZnhzdHIgPSAocC52KTptYXRjaCgnXiguKykvKCVkKykkJykKICAgIGlmIG5vdCBuZXRzdHIgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJuZWVkIGEvYiJ9JyBlbmQKICAgIGxvY2FsIHByZWZpeCA9IHRvbnVtYmVyKHBmeHN0cikKICAgIGxvY2FsIG5ldCA9IHBhcnNlX2FueShuZXRzdHIpCiAgICBpZiBub3QgbmV0IG9yIHByZWZpeCA8IDAgb3IgcHJlZml4ID4gKG5ldC52ID09IDQgYW5kIDMyIG9yIDEyOCkgdGhlbgogICAgICByZXR1cm4gJ3siZXJyb3IiOiJiYWQgY2lkciJ9JwogICAgZW5kCiAgICBsb2NhbCBuZXR3ID0gYXBwbHlfbWFzayhuZXQud29yZHMsIG5ldC53Yml0cywgcHJlZml4KQogICAgbG9jYWwgbmV0c3RyX291dCA9IHdvcmRzX3RvX3N0cihuZXR3LCBuZXQud2JpdHMpCiAgICBpZiBvcCA9PSAnbmV0JyB0aGVuIHJldHVybiBzdHJpbmcuZm9ybWF0KCciJXMiJywgbmV0c3RyX291dCkgZW5kCiAgICBsb2NhbCBpbnYgPSBpbnZlcnRfbWFzayhuZXQud29yZHMsIG5ldC53Yml0cywgcHJlZml4KQogICAgbG9jYWwgYmNhc3R3ID0ge30KICAgIGZvciBpID0gMSwgI25ldC53b3JkcyBkbyBiY2FzdHdbaV0gPSBuZXR3W2ldIHwgaW52W2ldIGVuZAogICAgbG9jYWwgYmNhc3Rfb3V0ID0gd29yZHNfdG9fc3RyKGJjYXN0dywgbmV0LndiaXRzKQogICAgaWYgb3AgPT0gJ2Jyb2FkY2FzdCcgdGhlbiByZXR1cm4gc3RyaW5nLmZvcm1hdCgnIiVzIicsIGJjYXN0X291dCkgZW5kCiAgICAtLSBjaWRyX2luZm8KICAgIGxvY2FsIHdpZHRoID0gbmV0LndiaXRzICogI25ldC53b3JkcwogICAgbG9jYWwgZnJlZSA9IHdpZHRoIC0gcHJlZml4CiAgICBsb2NhbCBzaXplCiAgICBpZiBmcmVlIDw9IDUyIHRoZW4gc2l6ZSA9IDIgXiBmcmVlCiAgICBlbHNlIHNpemUgPSBzdHJpbmcuZm9ybWF0KCciMl4lZCInLCBmcmVlKSBlbmQKICAgIC0tIOaOqeeggSA9IOWvueWFqCAxIOWtl+mbhuW6lOeUqCAvcHJlZml4CiAgICBsb2NhbCBvbmVzID0ge30KICAgIGZvciBpID0gMSwgI25ldC53b3JkcyBkbyBvbmVzW2ldID0gKDIgXiBuZXQud2JpdHMpIC0gMSBlbmQKICAgIGxvY2FsIG1hc2t3ID0gYXBwbHlfbWFzayhvbmVzLCBuZXQud2JpdHMsIHByZWZpeCkKICAgIGxvY2FsIG1hc2tzdHIKICAgIGlmIG5ldC52ID09IDQgdGhlbgogICAgICBsb2NhbCBtID0gbWFza3dbMV0KICAgICAgbWFza3N0ciA9IHN0cmluZy5mb3JtYXQoJyVkLiVkLiVkLiVkJywgKG0gPj4gMjQpICYgMjU1LCAobSA+PiAxNikgJiAyNTUsIChtID4+IDgpICYgMjU1LCBtICYgMjU1KQogICAgZWxzZQogICAgICBtYXNrc3RyID0gd29yZHNfdG9fc3RyKG1hc2t3LCBuZXQud2JpdHMpCiAgICBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCd7Im5ldHdvcmsiOiIlcyIsImJyb2FkY2FzdCI6IiVzIiwicHJlZml4IjolZCwic2l6ZSI6JXMsIm1hc2siOiIlcyIsImlzX3Y2Ijolc30nLAogICAgICBqc29uX2VzY2FwZShuZXRzdHJfb3V0KSwganNvbl9lc2NhcGUoYmNhc3Rfb3V0KSwgcHJlZml4LCBzaXplLCBqc29uX2VzY2FwZShtYXNrc3RyKSwgdG9zdHJpbmcobmV0LnYgPT0gNikpCiAgZWxzZWlmIG9wID09ICdjbGFzc2lmeScgdGhlbgogICAgbG9jYWwgaXAgPSBwYXJzZV9hbnkodikKICAgIGlmIG5vdCBpcCB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpcCJ9JyBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCd7ImNsYXNzIjoiJXMiLCJ2IjolZH0nLCBjbGFzc2lmeShpcCksIGlwLnYpCiAgZW5kCiAgcmV0dXJuICd7ImVycm9yIjoidW5rbm93biBvcCJ9JwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBqc29ucGF0Y2gKLS0gQGNhdGVnb3J5OiBwYXJzZXIKLS0gQGRlc2M6IFJGQyA2OTAyIEpTT04gUGF0Y2jvvIhhZGQvcmVtb3ZlL3JlcGxhY2UvbW92ZS9jb3B5L3Rlc3TvvIkrIFJGQyA2OTAxIEpTT04gUG9pbnRlcgotLSAgICAgICArIOWfuuehgCBkaWZmIOKAlOKAlCBEdWNrREIg5YaF5bu6IGpzb25fbWVyZ2VfcGF0Y2jvvIhSRkMgNzM4Nu+8ieS9huayoeaciSBSRkMgNjkwMiDmk43kvZzmlbDnu4QgLwotLSAgICAgICBKU09OIFBvaW50ZXLvvIzmnKzlupPooaXpvZDjgILoh6rljIXlkKvvvJrlhoXltYzkuIDkuKrnuq8gTHVhIEpTT04g57yW6Kej56CB5Zmo77yIVVRGLTgg5Y6f5qC36YCP5Lyg77yJ77yMCi0tICAgICAgIOS4jeS+nei1luWklumDqCBqc29uLmx1Ye+8jOS+v+S6juenu+akjeOAggotLSAgICAgICBvcCDpgInpobnvvIhkb2MgLyBwYXRjaCAvIHZhbHVlIOWdh+S4uiBKU09OIOe8lueggeWtl+espuS4su+8ie+8mgotLSAgICAgICAgICdhcHBseScge2RvYywgcGF0Y2h9ICAgICAgICAg4oaSIOW6lOeUqCBwYXRjaO+8iFJGQyA2OTAyIOaVsOe7hO+8ieWQjueahOaWh+aho++8iEpTT04g5a2X56ym5Liy77yJCi0tICAgICAgICAgJ2dldCcgICB7ZG9jLCBwYXRofSAgICAgICAgICDihpIgSlNPTiBQb2ludGVyIOWkhOeahOWAvO+8iEpTT04g57yW56CB77yb57y65aSxL+epuiDihpIgbnVsbO+8iQotLSAgICAgICAgICdzZXQnICAge2RvYywgcGF0aCwgdmFsdWV9ICAg4oaSIOWcqOivpeWkhCB1cHNlcnQgdmFsdWXvvIjniLbnuqfpobvlrZjlnKjvvInlkI7nmoTmlofmoaMKLS0gICAgICAgICAndGVzdCcgIHtkb2MsIHBhdGgsIHZhbHVlfSAgIOKGkiDor6XlpITlgLzmmK/lkKbnrYnkuo4gdmFsdWUg4oaSICJ0cnVlIi8iZmFsc2UiCi0tICAgICAgICAgJ2RpZmYnICB7YSwgYn0gICAgICAgICAgICAgICDihpIg55SxIGEg5Y+Y5o2i5YiwIGIg55qEIFJGQyA2OTAyIHBhdGNo77yISlNPTiDmlbDnu4TlrZfnrKbkuLLvvIwKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg5pWw57uE562J6ZW/6YCQ5YWD57Sg6YCS5b2S44CB5LiN562J6ZW/5pW05L2TIHJlcGxhY2XvvIzpnZ7mnIDlsI/kvYbmraPnoa7vvIkKLS0gICAgICAg6K+a5a6e6L6555WM77yacGF0Y2gg5YaFIHZhbHVlIOS4gOW+i+aYr+W3suino+eggeeahCBKU09OIOWAvO+8m0pTT04gbnVsbCDkuI4ga2V5IOe8uuWkseWcqCBMdWEg6YeM5ZCM5Li6IG5pbO+8jAotLSAgICAgICDmlYUgcGF0Y2gg5LitICJ2YWx1ZSI6bnVsbCDop4bkuLrnvLrlpLHvvIhhZGQg5oiQIG5vLW9w77yJ77yb5b6q546v5byV55So57yW56CB5Li6IG51bGzjgIIKLS0gQHNvdXJjZTog6Ieq5YyF5ZCr77yISlNPTiDnvJbop6PnoIHlj4LogIMgcnhpL2pzb24ubHVhIE1JVCDmgJ3ot6/oh6rlhpnvvJtSRkMgNjkwMS82OTAy77yJCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0KLS0gVXNhZ2U6Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdqc29ucGF0Y2gnLCB7b3A6J2FwcGx5JywgZG9jOid7ImEiOjF9JywKLS0gICAgIHBhdGNoOidbeyJvcCI6ImFkZCIsInBhdGgiOiIvYiIsInZhbHVlIjoyfSx7Im9wIjoidGVzdCIsInBhdGgiOiIvYSIsInZhbHVlIjoxfV0nfSk7Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdqc29ucGF0Y2gnLCB7b3A6J2dldCcsIGRvYzonW3sieCI6N30sInkiXScsIHBhdGg6Jy8wL3gnfSk7ICAtLSA3Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdqc29ucGF0Y2gnLCB7b3A6J2RpZmYnLCBhOid7ImEiOjEsImIiOlsxLDJdfScsIGI6J3siYSI6OSwiYyI6dHJ1ZX0nfSk7CgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIOWGheW1jCBKU09OIOe8luino+egge+8iOe6ryBMdWHvvIxVVEYtOCDljp/moLfpgI/kvKDvvIkKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpsb2NhbCBqcCA9IHt9Cgpsb2NhbCBFU0MgPSB7IFsnXFwnXT0nXFxcXCcsIFsnIiddPSdcXCInLCBbJ1xuJ109J1xcbicsIFsnXHQnXT0nXFx0JywKICAgICAgICAgICAgICBbJ1xyJ109J1xccicsIFsnXGInXT0nXFxiJywgWydcZiddPSdcXGYnIH0KbG9jYWwgZnVuY3Rpb24gZW5jX3N0cihzKQogIHJldHVybiAnIicgLi4gdG9zdHJpbmcocyk6Z3N1YignWyV6XDEtXDMxXFwiXScsIGZ1bmN0aW9uKGMpCiAgICBpZiBFU0NbY10gdGhlbiByZXR1cm4gRVNDW2NdIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBjOmJ5dGUoKSkKICBlbmQpIC4uICciJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGlzX2FycmF5KHQpCiAgaWYgdHlwZSh0KSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGxvY2FsIG4sIGkgPSAwLCAxCiAgZm9yIGsgaW4gcGFpcnModCkgZG8KICAgIGlmIHR5cGUoaykgfj0gJ251bWJlcicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgICBuID0gbiArIDEKICBlbmQKICBpZiBuID09IDAgdGhlbiByZXR1cm4gZmFsc2UgZW5kICAgICAgICAgIC0tIOepuuihqOaMieWvueixoQogIHdoaWxlIHRbaV0gfj0gbmlsIGRvIGkgPSBpICsgMSBlbmQKICByZXR1cm4gaSAtIDEgPT0gbgplbmQKCmxvY2FsIGZ1bmN0aW9uIHV0ZjhmdWxsKG4pCiAgaWYgbiA8IDB4ODAgdGhlbiByZXR1cm4gc3RyaW5nLmNoYXIobikgZW5kCiAgaWYgbiA8IDB4ODAwIHRoZW4gcmV0dXJuIHN0cmluZy5jaGFyKDB4QzArbWF0aC5mbG9vcihuLzY0KSwgMHg4MCsobiU2NCkpIGVuZAogIGlmIG4gPCAweDEwMDAwIHRoZW4KICAgIHJldHVybiBzdHJpbmcuY2hhcigweEUwK21hdGguZmxvb3Iobi80MDk2KSwgMHg4MCsobWF0aC5mbG9vcihuLzY0KSU2NCksIDB4ODArKG4lNjQpKQogIGVuZAogIHJldHVybiBzdHJpbmcuY2hhcigweEYwK21hdGguZmxvb3Iobi8yNjIxNDQpLCAweDgwKyhtYXRoLmZsb29yKG4vNDA5NiklNjQpLAogICAgICAgICAgICAgICAgICAgICAweDgwKyhtYXRoLmZsb29yKG4vNjQpJTY0KSwgMHg4MCsobiU2NCkpCmVuZAoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlKHYsIHNlZW4pCiAgc2VlbiA9IHNlZW4gb3Ige30KICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgbG9jYWwgdHYgPSB0eXBlKHYpCiAgaWYgdHYgPT0gJ2Jvb2xlYW4nIHRoZW4gcmV0dXJuIHYgYW5kICd0cnVlJyBvciAnZmFsc2UnIGVuZAogIGlmIHR2ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiBvciB2ID09IG1hdGguaHVnZSBvciB2ID09IC1tYXRoLmh1Z2UgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgaWYgdiA9PSBtYXRoLmZsb29yKHYpIGFuZCBtYXRoLmFicyh2KSA8IDFlMTUgdGhlbiByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJWQnLCB2KSBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCclLjE3ZycsIHYpCiAgZW5kCiAgaWYgdHYgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gZW5jX3N0cih2KSBlbmQKICBpZiB0diA9PSAndGFibGUnIHRoZW4KICAgIGlmIHNlZW5bdl0gdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgc2Vlblt2XSA9IHRydWUKICAgIGlmIGlzX2FycmF5KHYpIHRoZW4KICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaSA9IDEsICN2IGRvIHBhcnRzW2ldID0gZW5jb2RlKHZbaV0sIHNlZW4pIGVuZAogICAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICAgIGVsc2UKICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaywgdmFsIGluIHBhaXJzKHYpIGRvCiAgICAgICAgcGFydHNbI3BhcnRzKzFdID0gZW5jX3N0cih0b3N0cmluZyhrKSkgLi4gJzonIC4uIGVuY29kZSh2YWwsIHNlZW4pCiAgICAgIGVuZAogICAgICByZXR1cm4gJ3snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnfScKICAgIGVuZAogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgpsb2NhbCBmdW5jdGlvbiBkZWNvZGUoc3RyKQogIGxvY2FsIHBvcyA9IDEKICBsb2NhbCBmdW5jdGlvbiB3cygpCiAgICB3aGlsZSBwb3MgPD0gI3N0ciBkbwogICAgICBsb2NhbCBjID0gc3RyOnN1Yihwb3MscG9zKQogICAgICBpZiBjPT0nICcgb3IgYz09J1x0JyBvciBjPT0nXG4nIG9yIGM9PSdccicgdGhlbiBwb3MgPSBwb3MrMSBlbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZXJyID0gZnVuY3Rpb24obXNnKSBlcnJvcignanNvbjogJyAuLiBtc2cgLi4gJyBAJyAuLiBwb3MsIDApIGVuZAogIGxvY2FsIGZ1bmN0aW9uIGhleDQocywgaSkKICAgIGxvY2FsIGggPSBzOnN1YihpLCBpKzMpCiAgICBsb2NhbCBuID0gdG9udW1iZXIoaCwgMTYpCiAgICBpZiBub3QgbiB0aGVuIGVycignYmFkIFxcdScpIGVuZAogICAgcmV0dXJuIG4sIGkgKyA0CiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gcGFyc2Vfc3RyaW5nKCkKICAgIHBvcyA9IHBvcyArIDEKICAgIGxvY2FsIG91dCA9IHt9CiAgICB3aGlsZSBwb3MgPD0gI3N0ciBkbwogICAgICBsb2NhbCBjID0gc3RyOnN1Yihwb3MscG9zKQogICAgICBpZiBjID09ICciJyB0aGVuIHBvcyA9IHBvcyArIDE7IHJldHVybiB0YWJsZS5jb25jYXQob3V0KSBlbmQKICAgICAgaWYgYyA9PSAnXFwnIHRoZW4KICAgICAgICBsb2NhbCBlID0gc3RyOnN1Yihwb3MrMSwgcG9zKzEpCiAgICAgICAgaWYgZT09JyInIHRoZW4gb3V0WyNvdXQrMV09JyInOyBwb3M9cG9zKzIKICAgICAgICBlbHNlaWYgZT09J1xcJyB0aGVuIG91dFsjb3V0KzFdPSdcXCc7IHBvcz1wb3MrMgogICAgICAgIGVsc2VpZiBlPT0nLycgdGhlbiBvdXRbI291dCsxXT0nLyc7IHBvcz1wb3MrMgogICAgICAgIGVsc2VpZiBlPT0nYicgdGhlbiBvdXRbI291dCsxXT0nXGInOyBwb3M9cG9zKzIKICAgICAgICBlbHNlaWYgZT09J2YnIHRoZW4gb3V0WyNvdXQrMV09J1xmJzsgcG9zPXBvcysyCiAgICAgICAgZWxzZWlmIGU9PSduJyB0aGVuIG91dFsjb3V0KzFdPSdcbic7IHBvcz1wb3MrMgogICAgICAgIGVsc2VpZiBlPT0ncicgdGhlbiBvdXRbI291dCsxXT0nXHInOyBwb3M9cG9zKzIKICAgICAgICBlbHNlaWYgZT09J3QnIHRoZW4gb3V0WyNvdXQrMV09J1x0JzsgcG9zPXBvcysyCiAgICAgICAgZWxzZWlmIGU9PSd1JyB0aGVuCiAgICAgICAgICBsb2NhbCBjcCwgbnAgPSBoZXg0KHN0ciwgcG9zKzIpOyBwb3MgPSBucAogICAgICAgICAgaWYgY3AgPj0gMHhEODAwIGFuZCBjcCA8PSAweERCRkYKICAgICAgICAgICAgIGFuZCBzdHI6c3ViKHBvcyxwb3MrMSk9PSdcXCcgYW5kIHN0cjpzdWIocG9zKzIscG9zKzIpPT0ndScgdGhlbgogICAgICAgICAgICBsb2NhbCBsbywgbnAyID0gaGV4NChzdHIsIHBvcysyKQogICAgICAgICAgICBpZiBsbyA+PSAweERDMDAgYW5kIGxvIDw9IDB4REZGRiB0aGVuCiAgICAgICAgICAgICAgY3AgPSAweDEwMDAwICsgKChjcCAtIDB4RDgwMCkgKiAxMDI0KSArIChsbyAtIDB4REMwMCkKICAgICAgICAgICAgICBwb3MgPSBucDIKICAgICAgICAgICAgZW5kCiAgICAgICAgICBlbmQKICAgICAgICAgIG91dFsjb3V0KzFdID0gdXRmOGZ1bGwoY3ApCiAgICAgICAgZWxzZSBlcnIoJ2JhZCBlc2NhcGUnKSBlbmQKICAgICAgZWxzZQogICAgICAgIG91dFsjb3V0KzFdID0gYzsgcG9zID0gcG9zICsgMQogICAgICBlbmQKICAgIGVuZAogICAgZXJyKCd1bnRlcm1pbmF0ZWQgc3RyaW5nJykKICBlbmQKICBsb2NhbCBwYXJzZV92YWx1ZQogIGxvY2FsIGZ1bmN0aW9uIHBhcnNlX251bWJlcigpCiAgICBsb2NhbCBzID0gc3RyOm1hdGNoKCdeJS0/JWQrJS4/JWQqW2VFXT9bKy1dPyVkKicsIHBvcykKICAgIGlmIG5vdCBzIG9yIHMgPT0gJycgdGhlbiBlcnIoJ2JhZCBudW1iZXInKSBlbmQKICAgIHBvcyA9IHBvcyArICNzCiAgICByZXR1cm4gdG9udW1iZXIocykKICBlbmQKICBsb2NhbCBmdW5jdGlvbiBwYXJzZV9hcnJheSgpCiAgICBwb3MgPSBwb3MgKyAxOyB3cygpCiAgICBsb2NhbCBhcnIgPSB7fQogICAgaWYgc3RyOnN1Yihwb3MscG9zKSA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gYXJyIGVuZAogICAgd2hpbGUgdHJ1ZSBkbwogICAgICB3cygpOyBhcnJbI2FycisxXSA9IHBhcnNlX3ZhbHVlKCk7IHdzKCkKICAgICAgbG9jYWwgYyA9IHN0cjpzdWIocG9zLHBvcykKICAgICAgaWYgYyA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgIGVsc2VpZiBjID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDE7IHJldHVybiBhcnIKICAgICAgZWxzZSBlcnIoJ2JhZCBhcnJheScpIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gcGFyc2Vfb2JqZWN0KCkKICAgIHBvcyA9IHBvcyArIDE7IHdzKCkKICAgIGxvY2FsIG9iaiA9IHt9CiAgICBpZiBzdHI6c3ViKHBvcyxwb3MpID09ICd9JyB0aGVuIHBvcyA9IHBvcyArIDE7IHJldHVybiBvYmogZW5kCiAgICB3aGlsZSB0cnVlIGRvCiAgICAgIHdzKCkKICAgICAgaWYgc3RyOnN1Yihwb3MscG9zKSB+PSAnIicgdGhlbiBlcnIoJ2V4cGVjdGVkIGtleScpIGVuZAogICAgICBsb2NhbCBrID0gcGFyc2Vfc3RyaW5nKCk7IHdzKCkKICAgICAgaWYgc3RyOnN1Yihwb3MscG9zKSB+PSAnOicgdGhlbiBlcnIoJ2V4cGVjdGVkIDonKSBlbmQKICAgICAgcG9zID0gcG9zICsgMTsgd3MoKQogICAgICBvYmpba10gPSBwYXJzZV92YWx1ZSgpOyB3cygpCiAgICAgIGxvY2FsIGMgPSBzdHI6c3ViKHBvcyxwb3MpCiAgICAgIGlmIGMgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICBlbHNlaWYgYyA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gb2JqCiAgICAgIGVsc2UgZXJyKCdiYWQgb2JqZWN0JykgZW5kCiAgICBlbmQKICBlbmQKICBwYXJzZV92YWx1ZSA9IGZ1bmN0aW9uKCkKICAgIHdzKCkKICAgIGxvY2FsIGMgPSBzdHI6c3ViKHBvcyxwb3MpCiAgICBpZiBjID09ICciJyB0aGVuIHJldHVybiBwYXJzZV9zdHJpbmcoKSBlbmQKICAgIGlmIGMgPT0gJ3snIHRoZW4gcmV0dXJuIHBhcnNlX29iamVjdCgpIGVuZAogICAgaWYgYyA9PSAnWycgdGhlbiByZXR1cm4gcGFyc2VfYXJyYXkoKSBlbmQKICAgIGlmIGMgPT0gJ3QnIHRoZW4gaWYgc3RyOnN1Yihwb3MscG9zKzMpPT0ndHJ1ZScgdGhlbiBwb3M9cG9zKzQ7IHJldHVybiB0cnVlIGVuZCBlcnIoJ2xpdGVyYWwnKSBlbmQKICAgIGlmIGMgPT0gJ2YnIHRoZW4gaWYgc3RyOnN1Yihwb3MscG9zKzQpPT0nZmFsc2UnIHRoZW4gcG9zPXBvcys1OyByZXR1cm4gZmFsc2UgZW5kIGVycignbGl0ZXJhbCcpIGVuZAogICAgaWYgYyA9PSAnbicgdGhlbiBpZiBzdHI6c3ViKHBvcyxwb3MrMyk9PSdudWxsJyB0aGVuIHBvcz1wb3MrNDsgcmV0dXJuIG5pbCBlbmQgZXJyKCdsaXRlcmFsJykgZW5kCiAgICBpZiBjID09ICctJyBvciAoYyA+PSAnMCcgYW5kIGMgPD0gJzknKSB0aGVuIHJldHVybiBwYXJzZV9udW1iZXIoKSBlbmQKICAgIGVycigndW5leHBlY3RlZCAnIC4uIHRvc3RyaW5nKGMpKQogIGVuZAogIHJldHVybiBwYXJzZV92YWx1ZSgpCmVuZAoKanAuZW5jb2RlID0gZW5jb2RlCmpwLmRlY29kZSA9IGRlY29kZQoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQotLSBkZWVwIGNvcHkgLyBlcXVhbAotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCmxvY2FsIGZ1bmN0aW9uIGRlZXBfY29weSh2KQogIGlmIHR5cGUodikgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiB2IGVuZAogIGxvY2FsIGMgPSB7fQogIGZvciBrLCB2YWwgaW4gcGFpcnModikgZG8gY1trXSA9IGRlZXBfY29weSh2YWwpIGVuZAogIHJldHVybiBjCmVuZAoKbG9jYWwgZnVuY3Rpb24gZGVlcF9lcShhLCBiKQogIGlmIGEgPT0gbmlsIG9yIGIgPT0gbmlsIHRoZW4gcmV0dXJuIChhID09IG5pbCBhbmQgYiA9PSBuaWwpIG9yCiAgICAodHlwZShhKT09J3RhYmxlJyBhbmQgbmV4dChhKT09bmlsIGFuZCBiPT1uaWwpIG9yCiAgICAodHlwZShiKT09J3RhYmxlJyBhbmQgbmV4dChiKT09bmlsIGFuZCBhPT1uaWwpIGVuZAogIGlmIHR5cGUoYSkgfj0gdHlwZShiKSB0aGVuCiAgICAtLSB7fSDkuI4gbnVsbCDop4bkuLrkuI3nrYnvvIzkvYYgTHVhIOaXoOazleWMuuWIhu+8m+i/memHjOaMieexu+Wei+S4peagvAogICAgcmV0dXJuIGZhbHNlCiAgZW5kCiAgaWYgdHlwZShhKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGEgPT0gYiBlbmQKICBmb3IgaywgdmFsIGluIHBhaXJzKGEpIGRvCiAgICBpZiBub3QgZGVlcF9lcSh2YWwsIGJba10pIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGVuZAogIGZvciBrIGluIHBhaXJzKGIpIGRvCiAgICBpZiBhW2tdID09IG5pbCBhbmQgbm90ICh0eXBlKGFba10pPT0ndGFibGUnKSB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLS0gUkZDIDY5MDEgSlNPTiBQb2ludGVyCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KbG9jYWwgZnVuY3Rpb24gc3BsaXRfcGF0aChwdHIpCiAgbG9jYWwgdG9rZW5zID0ge30KICBpZiBwdHIgPT0gJycgdGhlbiByZXR1cm4gdG9rZW5zIGVuZAogIGlmIHB0cjpzdWIoMSwxKSB+PSAnLycgdGhlbiBlcnJvcigncG9pbnRlciBtdXN0IGJlICIiIG9yIHN0YXJ0IHdpdGggLycpIGVuZAogIGxvY2FsIGkgPSAyCiAgd2hpbGUgaSA8PSAjcHRyIGRvCiAgICBsb2NhbCBqID0gcHRyOmZpbmQoJy8nLCBpLCB0cnVlKQogICAgaWYgbm90IGogdGhlbiBqID0gI3B0ciArIDEgZW5kCiAgICBsb2NhbCB0b2sgPSBwdHI6c3ViKGksIGotMSk6Z3N1YignfjEnLCcvJyk6Z3N1YignfjAnLCd+JykKICAgIHRva2Vuc1sjdG9rZW5zKzFdID0gdG9rCiAgICBpID0gaiArIDEKICBlbmQKICByZXR1cm4gdG9rZW5zCmVuZAoKbG9jYWwgZnVuY3Rpb24gZ2V0X2F0KGRvYywgdG9rZW5zKQogIGxvY2FsIGN1ciA9IGRvYwogIGZvciBpID0gMSwgI3Rva2VucyBkbwogICAgbG9jYWwgdG9rID0gdG9rZW5zW2ldCiAgICBpZiBpc19hcnJheShjdXIpIHRoZW4KICAgICAgbG9jYWwgaXggPSB0b251bWJlcih0b2spCiAgICAgIGlmIG5vdCBpeCBvciBpeCA8IDAgb3IgaXggPj0gI2N1ciB0aGVuIGVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UgYXQgIicuLnRvay4uJyInKSBlbmQKICAgICAgY3VyID0gY3VyW2l4ICsgMV0gICAgICAgICAgICAgICAtLSBSRkMgNjkwMSDmlbDnu4TkuIvmoIcgMC1iYXNlZCDihpIgTHVhIDEtYmFzZWQKICAgIGVsc2UKICAgICAgY3VyID0gY3VyW3Rva10KICAgIGVuZAogICAgaWYgY3VyID09IG5pbCBhbmQgaSA8ICN0b2tlbnMgdGhlbiBlcnJvcigncG9pbnRlciBwYXRoIG1pc3NpbmcgYXQgIicuLnRvay4uJyInKSBlbmQKICBlbmQKICByZXR1cm4gY3VyCmVuZAoKbG9jYWwgZnVuY3Rpb24gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgbG9jYWwgY3VyID0gZG9jCiAgZm9yIGkgPSAxLCAjdG9rZW5zIC0gMSBkbwogICAgbG9jYWwgdG9rID0gdG9rZW5zW2ldCiAgICBpZiBpc19hcnJheShjdXIpIHRoZW4KICAgICAgbG9jYWwgaXggPSB0b251bWJlcih0b2spCiAgICAgIGlmIG5vdCBpeCBvciBpeCA8IDAgb3IgaXggPj0gI2N1ciB0aGVuIGVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UgYXQgIicuLnRvay4uJyInKSBlbmQKICAgICAgY3VyID0gY3VyW2l4ICsgMV0KICAgIGVsc2UKICAgICAgY3VyID0gY3VyW3Rva10KICAgIGVuZAogICAgaWYgY3VyID09IG5pbCB0aGVuIGVycm9yKCdwb2ludGVyIHBhdGggbWlzc2luZyBhdCAiJy4udG9rLi4nIicpIGVuZAogIGVuZAogIHJldHVybiBjdXIsIHRva2Vuc1sjdG9rZW5zXQplbmQKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLS0gUkZDIDY5MDIg5pON5L2cCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KbG9jYWwgZnVuY3Rpb24gb3BfYWRkKGRvYywgcHRyLCB2YWwpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgaWYgI3Rva2VucyA9PSAwIHRoZW4gcmV0dXJuIGRlZXBfY29weSh2YWwpIGVuZAogIGxvY2FsIHBhcmVudCwga2V5ID0gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgaWYgaXNfYXJyYXkocGFyZW50KSB0aGVuCiAgICBpZiBrZXkgPT0gJy0nIHRoZW4gcGFyZW50WyNwYXJlbnQrMV0gPSBkZWVwX2NvcHkodmFsKQogICAgZWxzZQogICAgICBsb2NhbCBpZHggPSB0b251bWJlcihrZXkpCiAgICAgIGlmIG5vdCBpZHggdGhlbiBlcnJvcignYmFkIGFycmF5IGluZGV4ICInLi5rZXkuLiciJykgZW5kCiAgICAgIGlmIGlkeCA8IDAgb3IgaWR4ID4gI3BhcmVudCB0aGVuIGVycm9yKCdpbmRleCBvdXQgb2YgYm91bmRzJykgZW5kCiAgICAgIGZvciBpID0gI3BhcmVudCwgaWR4LCAtMSBkbyBwYXJlbnRbaSsxXSA9IHBhcmVudFtpXSBlbmQgICAtLSBpZHggMC1iYXNlZO+8jOaPkuWFpeS9jSA9IGlkeCsxCiAgICAgIHBhcmVudFtpZHgrMV0gPSBkZWVwX2NvcHkodmFsKQogICAgZW5kCiAgZWxzZQogICAgcGFyZW50W2tleV0gPSBkZWVwX2NvcHkodmFsKQogIGVuZAogIHJldHVybiBkb2MKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9yZW1vdmUoZG9jLCBwdHIpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgaWYgI3Rva2VucyA9PSAwIHRoZW4gZXJyb3IoJ2Nhbm5vdCByZW1vdmUgd2hvbGUgZG9jdW1lbnQnKSBlbmQKICBsb2NhbCBwYXJlbnQsIGtleSA9IHJlc29sdmVfcGFyZW50KGRvYywgdG9rZW5zKQogIGlmIGlzX2FycmF5KHBhcmVudCkgdGhlbgogICAgbG9jYWwgaWR4ID0gdG9udW1iZXIoa2V5KQogICAgaWYgbm90IGlkeCBvciBpZHggPCAwIG9yIGlkeCA+PSAjcGFyZW50IHRoZW4gZXJyb3IoJ2JhZCBpbmRleCAiJy4ua2V5Li4nIicpIGVuZAogICAgZm9yIGkgPSBpZHggKyAxLCAjcGFyZW50IC0gMSBkbyBwYXJlbnRbaV0gPSBwYXJlbnRbaSsxXSBlbmQKICAgIHBhcmVudFsjcGFyZW50XSA9IG5pbAogIGVsc2UKICAgIGlmIHBhcmVudFtrZXldID09IG5pbCB0aGVuIGVycm9yKCdrZXkgbm90IGZvdW5kICInLi5rZXkuLiciJykgZW5kCiAgICBwYXJlbnRba2V5XSA9IG5pbAogIGVuZAogIHJldHVybiBkb2MKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9yZXBsYWNlKGRvYywgcHRyLCB2YWwpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgaWYgI3Rva2VucyA9PSAwIHRoZW4gcmV0dXJuIGRlZXBfY29weSh2YWwpIGVuZAogIGxvY2FsIHBhcmVudCwga2V5ID0gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgaWYgaXNfYXJyYXkocGFyZW50KSB0aGVuCiAgICBsb2NhbCBpZHggPSB0b251bWJlcihrZXkpCiAgICBpZiBub3QgaWR4IG9yIGlkeCA8IDAgb3IgaWR4ID49ICNwYXJlbnQgdGhlbiBlcnJvcignaW5kZXggbm90IGZvdW5kICInLi5rZXkuLiciJykgZW5kCiAgICBwYXJlbnRbaWR4KzFdID0gZGVlcF9jb3B5KHZhbCkKICBlbHNlCiAgICBpZiBwYXJlbnRba2V5XSA9PSBuaWwgdGhlbiBlcnJvcigna2V5IG5vdCBmb3VuZCAiJy4ua2V5Li4nIicpIGVuZAogICAgcGFyZW50W2tleV0gPSBkZWVwX2NvcHkodmFsKQogIGVuZAogIHJldHVybiBkb2MKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF90ZXN0KGRvYywgcHRyLCB2YWwpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgbG9jYWwgdiA9ICgjdG9rZW5zID09IDApIGFuZCBkb2Mgb3IgZ2V0X2F0KGRvYywgdG9rZW5zKQogIHJldHVybiBkZWVwX2VxKHYsIHZhbCkKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9tb3ZlKGRvYywgZnJvbSwgcHRyKQogIGxvY2FsIGZ0b2tlbnMgPSBzcGxpdF9wYXRoKGZyb20pCiAgbG9jYWwgdmFsID0gKCNmdG9rZW5zID09IDApIGFuZCBkZWVwX2NvcHkoZG9jKSBvciBkZWVwX2NvcHkoZ2V0X2F0KGRvYywgZnRva2VucykpCiAgbG9jYWwgbmV3ZG9jID0gb3BfcmVtb3ZlKGRvYywgZnJvbSkKICByZXR1cm4gb3BfYWRkKG5ld2RvYywgcHRyLCB2YWwpCmVuZAoKbG9jYWwgZnVuY3Rpb24gb3BfY29weShkb2MsIGZyb20sIHB0cikKICBsb2NhbCBmdG9rZW5zID0gc3BsaXRfcGF0aChmcm9tKQogIGxvY2FsIHZhbCA9ICgjZnRva2VucyA9PSAwKSBhbmQgZGVlcF9jb3B5KGRvYykgb3IgZGVlcF9jb3B5KGdldF9hdChkb2MsIGZ0b2tlbnMpKQogIHJldHVybiBvcF9hZGQoZG9jLCBwdHIsIHZhbCkKZW5kCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIGRpZmbvvIhhIOKGkiBiIOeahCBSRkMgNjkwMiBwYXRjaO+8m+mdnuacgOWwj+S9huato+ehru+8iQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCmxvY2FsIGZ1bmN0aW9uIGVzY19wdHIocykKICByZXR1cm4gczpnc3ViKCd+JywnfjAnKTpnc3ViKCcvJywnfjEnKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGRpZmYoYSwgYiwgcGF0aCkKICBsb2NhbCBwYXRjaCA9IHt9CiAgaWYgZGVlcF9lcShhLCBiKSB0aGVuIHJldHVybiBwYXRjaCBlbmQKICBpZiB0eXBlKGEpIH49ICd0YWJsZScgb3IgdHlwZShiKSB+PSAndGFibGUnIG9yCiAgICAgKHR5cGUoYSl+PSd0YWJsZScpIG9yICh0eXBlKGIpfj0ndGFibGUnKSB0aGVuCiAgICB0YWJsZS5pbnNlcnQocGF0Y2gsIHtvcD0ncmVwbGFjZScsIHBhdGg9cGF0aCwgdmFsdWU9ZGVlcF9jb3B5KGIpfSkKICAgIHJldHVybiBwYXRjaAogIGVuZAogIGlmIGlzX2FycmF5KGEpIGFuZCBpc19hcnJheShiKSB0aGVuCiAgICBpZiAjYSB+PSAjYiB0aGVuCiAgICAgIHRhYmxlLmluc2VydChwYXRjaCwge29wPSdyZXBsYWNlJywgcGF0aD1wYXRoLCB2YWx1ZT1kZWVwX2NvcHkoYil9KQogICAgZWxzZQogICAgICBmb3IgaSA9IDEsICNhIGRvCiAgICAgICAgbG9jYWwgc3ViID0gZGlmZihhW2ldLCBiW2ldLCBwYXRoIC4uICcvJyAuLiAoaS0xKSkKICAgICAgICBmb3IgXywgbyBpbiBpcGFpcnMoc3ViKSBkbyBwYXRjaFsjcGF0Y2grMV0gPSBvIGVuZAogICAgICBlbmQKICAgIGVuZAogICAgcmV0dXJuIHBhdGNoCiAgZW5kCiAgbG9jYWwgc2VlbiA9IHt9CiAgZm9yIGssIHYgaW4gcGFpcnMoYSkgZG8KICAgIGxvY2FsIHAgPSBwYXRoIC4uICcvJyAuLiBlc2NfcHRyKHRvc3RyaW5nKGspKQogICAgaWYgYltrXSA9PSBuaWwgdGhlbgogICAgICB0YWJsZS5pbnNlcnQocGF0Y2gsIHtvcD0ncmVtb3ZlJywgcGF0aD1wfSkKICAgIGVsc2UKICAgICAgbG9jYWwgc3ViID0gZGlmZih2LCBiW2tdLCBwKQogICAgICBmb3IgXywgbyBpbiBpcGFpcnMoc3ViKSBkbyBwYXRjaFsjcGF0Y2grMV0gPSBvIGVuZAogICAgICBzZWVuW2tdID0gdHJ1ZQogICAgZW5kCiAgZW5kCiAgZm9yIGssIHYgaW4gcGFpcnMoYikgZG8KICAgIGlmIG5vdCBzZWVuW2tdIHRoZW4KICAgICAgdGFibGUuaW5zZXJ0KHBhdGNoLCB7b3A9J2FkZCcsIHBhdGg9cGF0aCAuLiAnLycgLi4gZXNjX3B0cih0b3N0cmluZyhrKSksIHZhbHVlPWRlZXBfY29weSh2KX0pCiAgICBlbmQKICBlbmQKICByZXR1cm4gcGF0Y2gKZW5kCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIOWFpeWPowotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpbnB1dCJ9JyBlbmQKICBsb2NhbCBvcCA9IHAub3AKCiAgbG9jYWwgZnVuY3Rpb24gamRlYyhzKQogICAgbG9jYWwgb2ssIHYgPSBwY2FsbChqcC5kZWNvZGUsIHRvc3RyaW5nKHMpKQogICAgaWYgbm90IG9rIHRoZW4gcmV0dXJuIG5pbCwgdG9zdHJpbmcodikgZW5kCiAgICByZXR1cm4gdgogIGVuZAogIGxvY2FsIGZ1bmN0aW9uIGVycmoobXNnKSByZXR1cm4gJ3siZXJyb3IiOicgLi4gZW5jX3N0cih0b3N0cmluZyhtc2cpKSAuLiAnfScgZW5kCgogIGxvY2FsIGRvYywgZGVyciA9IGpkZWMocC5kb2MpCiAgaWYgcC5kb2Mgfj0gbmlsIGFuZCBkZXJyIHRoZW4gcmV0dXJuIGVycmooJ2RvYyBub3QgdmFsaWQganNvbjogJyAuLiBkZXJyKSBlbmQKICBpZiBkb2MgPT0gbmlsIHRoZW4gZG9jID0ge30gZW5kCgogIGlmIG9wID09ICdhcHBseScgdGhlbgogICAgbG9jYWwgcGF0Y2gsIHBlcnIgPSBqZGVjKHAucGF0Y2gpCiAgICBpZiBwZXJyIHRoZW4gcmV0dXJuIGVycmooJ3BhdGNoIG5vdCB2YWxpZCBqc29uOiAnIC4uIHBlcnIpIGVuZAogICAgaWYgbm90IGlzX2FycmF5KHBhdGNoKSB0aGVuIHJldHVybiBlcnJqKCdwYXRjaCBtdXN0IGJlIGFuIGFycmF5JykgZW5kCiAgICBmb3IgaSwgbyBpbiBpcGFpcnMocGF0Y2gpIGRvCiAgICAgIGlmIHR5cGUobykgfj0gJ3RhYmxlJyBvciBvLm9wID09IG5pbCB0aGVuIHJldHVybiBlcnJqKCdiYWQgb3AgYXQgJy4uaSkgZW5kCiAgICAgIGxvY2FsIG9rLCByZXMgPSBwY2FsbChmdW5jdGlvbigpCiAgICAgICAgaWYgby5vcCA9PSAnYWRkJyB0aGVuIGRvYyA9IG9wX2FkZChkb2MsIG8ucGF0aCwgby52YWx1ZSkKICAgICAgICBlbHNlaWYgby5vcCA9PSAncmVtb3ZlJyB0aGVuIGRvYyA9IG9wX3JlbW92ZShkb2MsIG8ucGF0aCkKICAgICAgICBlbHNlaWYgby5vcCA9PSAncmVwbGFjZScgdGhlbiBkb2MgPSBvcF9yZXBsYWNlKGRvYywgby5wYXRoLCBvLnZhbHVlKQogICAgICAgIGVsc2VpZiBvLm9wID09ICd0ZXN0JyB0aGVuCiAgICAgICAgICBpZiBub3Qgb3BfdGVzdChkb2MsIG8ucGF0aCwgby52YWx1ZSkgdGhlbiBlcnJvcigndGVzdCBmYWlsZWQgYXQgIicuLnRvc3RyaW5nKG8ucGF0aCkuLiciKScpIGVuZAogICAgICAgIGVsc2VpZiBvLm9wID09ICdtb3ZlJyB0aGVuCiAgICAgICAgICBsb2NhbCBmdCA9IHNwbGl0X3BhdGgoby5mcm9tKQogICAgICAgICAgbG9jYWwgdmFsID0gKCNmdD09MCkgYW5kIGRlZXBfY29weShkb2MpIG9yIGRlZXBfY29weShnZXRfYXQoZG9jLCBmdCkpCiAgICAgICAgICBkb2MgPSBvcF9yZW1vdmUoZG9jLCBvLmZyb20pCiAgICAgICAgICBkb2MgPSBvcF9hZGQoZG9jLCBvLnRvLCB2YWwpCiAgICAgICAgZWxzZWlmIG8ub3AgPT0gJ2NvcHknIHRoZW4gZG9jID0gb3BfY29weShkb2MsIG8uZnJvbSwgby50bykKICAgICAgICBlbHNlIGVycm9yKCd1bmtub3duIG9wICInLi50b3N0cmluZyhvLm9wKS4uJyInKSBlbmQKICAgICAgZW5kKQogICAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gZXJyaignb3AgJy4uaS4uJyAoJy4udG9zdHJpbmcoby5vcCkuLicpIGZhaWxlZDogJy4udG9zdHJpbmcocmVzKSkgZW5kCiAgICBlbmQKICAgIHJldHVybiBqcC5lbmNvZGUoZG9jKQogIGVsc2VpZiBvcCA9PSAnZ2V0JyB0aGVuCiAgICBsb2NhbCBvaywgdiA9IHBjYWxsKGZ1bmN0aW9uKCkKICAgICAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aCh0b3N0cmluZyhwLnBhdGgpKQogICAgICByZXR1cm4gKCN0b2tlbnMgPT0gMCkgYW5kIGRvYyBvciBnZXRfYXQoZG9jLCB0b2tlbnMpCiAgICBlbmQpCiAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gZXJyaih0b3N0cmluZyh2KSkgZW5kCiAgICByZXR1cm4ganAuZW5jb2RlKHYpCiAgZWxzZWlmIG9wID09ICdzZXQnIHRoZW4KICAgIGxvY2FsIHZhbCwgdmVyciA9IGpkZWMocC52YWx1ZSkKICAgIGlmIHZlcnIgdGhlbiByZXR1cm4gZXJyaigndmFsdWUgbm90IHZhbGlkIGpzb246ICcgLi4gdmVycikgZW5kCiAgICBsb2NhbCBvaywgcmVzID0gcGNhbGwoZnVuY3Rpb24oKQogICAgICBsb2NhbCB0b2tlbnMgPSBzcGxpdF9wYXRoKHRvc3RyaW5nKHAucGF0aCkpCiAgICAgIGlmICN0b2tlbnMgPT0gMCB0aGVuIGRvYyA9IGRlZXBfY29weSh2YWwpOyByZXR1cm4gZW5kCiAgICAgIGxvY2FsIHBhcmVudCwga2V5ID0gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgICAgIGlmIGlzX2FycmF5KHBhcmVudCkgdGhlbgogICAgICAgIGxvY2FsIGlkeCA9IHRvbnVtYmVyKGtleSkKICAgICAgICBpZiBub3QgaWR4IG9yIGlkeCA8IDAgb3IgaWR4ID49ICNwYXJlbnQgdGhlbiBlcnJvcignYmFkIGFycmF5IGluZGV4JykgZW5kCiAgICAgICAgcGFyZW50W2lkeCsxXSA9IGRlZXBfY29weSh2YWwpCiAgICAgIGVsc2UKICAgICAgICBwYXJlbnRba2V5XSA9IGRlZXBfY29weSh2YWwpCiAgICAgIGVuZAogICAgZW5kKQogICAgaWYgbm90IG9rIHRoZW4gcmV0dXJuIGVycmoodG9zdHJpbmcocmVzKSkgZW5kCiAgICByZXR1cm4ganAuZW5jb2RlKGRvYykKICBlbHNlaWYgb3AgPT0gJ3Rlc3QnIHRoZW4KICAgIGxvY2FsIHZhbCwgdmVyciA9IGpkZWMocC52YWx1ZSkKICAgIGlmIHZlcnIgdGhlbiByZXR1cm4gZXJyaigndmFsdWUgbm90IHZhbGlkIGpzb246ICcgLi4gdmVycikgZW5kCiAgICBsb2NhbCBvaywgZXEgPSBwY2FsbChmdW5jdGlvbigpCiAgICAgIGxvY2FsIHRva2VucyA9IHNwbGl0X3BhdGgodG9zdHJpbmcocC5wYXRoKSkKICAgICAgbG9jYWwgdiA9ICgjdG9rZW5zID09IDApIGFuZCBkb2Mgb3IgZ2V0X2F0KGRvYywgdG9rZW5zKQogICAgICByZXR1cm4gZGVlcF9lcSh2LCB2YWwpCiAgICBlbmQpCiAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gZXJyaih0b3N0cmluZyhlcSkpIGVuZAogICAgcmV0dXJuIChlcSBhbmQgJ3RydWUnIG9yICdmYWxzZScpCiAgZWxzZWlmIG9wID09ICdkaWZmJyB0aGVuCiAgICBsb2NhbCBhLCBhZXJyID0gamRlYyhwLmEpCiAgICBsb2NhbCBiLCBiZXJyID0gamRlYyhwLmIpCiAgICBpZiBhZXJyIHRoZW4gcmV0dXJuIGVycmooJ2Egbm90IHZhbGlkIGpzb246ICcgLi4gYWVycikgZW5kCiAgICBpZiBiZXJyIHRoZW4gcmV0dXJuIGVycmooJ2Igbm90IHZhbGlkIGpzb246ICcgLi4gYmVycikgZW5kCiAgICBpZiBhID09IG5pbCB0aGVuIGEgPSB7fSBlbmQKICAgIGlmIGIgPT0gbmlsIHRoZW4gYiA9IHt9IGVuZAogICAgbG9jYWwgcGF0Y2ggPSBkaWZmKGEsIGIsICcnKQogICAgcmV0dXJuIGpwLmVuY29kZShwYXRjaCkKICBlbmQKICByZXR1cm4gJ3siZXJyb3IiOiJ1bmtub3duIG9wIn0nCmVuZAoKcmV0dXJuIGZ1bmN0aW9uKHApCiAgcmV0dXJuIHJ1bihwKQplbmQKAC0tIEBsaWI6IG1hcmtkb3duCi0tIEBjYXRlZ29yeTogcGFyc2VyCi0tIEBkZXNjOiBNYXJrZG93biDnu5PmnoTmj5Dlj5bvvIjnuq8gTHVh77yM6Ieq5YyF5ZCr77yJ4oCU4oCU5LuOIC5tZCDmlofmnKzmir3nu5PmnoTljJblhYPntKDvvIwKLS0gICAgICAg6L+U5ZueIEpTT04g5pWw57uEL+Wvueixoe+8iOmFjSBqc29uX2V4dHJhY3QgLyBqc29uIOWxleW8gO+8ieOAguS4jea4suafkyBIVE1M77yM5Y+q5YGa57uT5p6E6Kej5p6Q44CCCi0tICAgICAgIG9wIOmAiemhue+8mgotLSAgICAgICAgICd0b2MnICAgICAg4oaSIFt7bGV2ZWwsIHRleHQsIGxpbmV9XSAg5qCH6aKY55uu5b2VCi0tICAgICAgICAgJ2xpbmtzJyAgICDihpIgW3t0ZXh0LCBocmVmfV0gICAgICAgICDooYzlhoXpk77mjqUgW3RleHRdKHVybCkgKyDlm77niYcgIVsuLl0odXJsKQotLSAgICAgICAgICdjb2RlJyAgICAg4oaSIFt7bGFuZywgdGV4dCwgbGluZX1dICAg5Zu05qCP5Luj56CB5Z2XIGBgYGxhbmcgLi4uIGBgYAotLSAgICAgICAgICdsaXN0cycgICAg4oaSIFt7b3JkZXJlZCwgaW5kZW50LCB0ZXh0fV0gIOWIl+ihqOmhuQotLSAgICAgICAgICdxdW90ZXMnICAg4oaSIFt7dGV4dH1dICAgICAgICAgICAgICAg5byV55So5Z2XID4gLi4uCi0tICAgICAgICAgJ3N0YXRzJyAgICDihpIge2hlYWRpbmdzLCBsaW5rcywgY29kZSwgbGlzdHMsIHF1b3RlcywgbGluZXN9ICDorqHmlbAKLS0gICAgICAgICAncGxhaW4nICAgIOKGkiDnuq/mlofmnKzvvIjljrvlhajpg6ggbWFya2Rvd24g5qCH6K6w77yJCi0tICAgICAgIOS7o+eggeWdl+WGheWuueWFiOiiqyLmiqDlh7oi77yM5YW25Lit55qEICMvW10vLSDkuI3kvJrooqvor6/liKTkuLrmoIfpopgv6ZO+5o6lL+WIl+ihqOOAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yM6Ieq5YyF5ZCr5peg5aSW6YOo5L6d6LWW77yJCi0tIEByZXF1aXJlczog5pegCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J21hcmtkb3duJyk7Ci0tICAgdG9jOiAgICAgIFNFTEVDVCBsdWFqaXRfcygnbWFya2Rvd24nLCB7djogbWQsIG9wOiAndG9jJ30pOwotLSAgIOaKvSB1cmw6ICAgU0VMRUNUIGpzb25fZXh0cmFjdChsdWFqaXRfcygnbWFya2Rvd24nLCB7djo9bSwgb3A6PSdsaW5rcyd9KSwgJyRbMF0uaHJlZicpOwotLSAgIOe7n+iuoTogICAgIFNFTEVDVCBqc29uX2V4dHJhY3QobHVhaml0X3MoJ21hcmtkb3duJywge3Y6PW0sIG9wOj0nc3RhdHMnfSksICckLmhlYWRpbmdzJyk7CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEpTT04g57yW56CB77yI6Ieq5YyF5ZCr77yM5LiOIHRvbWxpbmkg5ZCM6aOO5qC877yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHRvc3RyaW5nKHMpOmdzdWIoJyhbXFxcIlxuXHRccl0pJywgZnVuY3Rpb24oYykKICAgIGlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcgZWxzZWlmIGMgPT0gJyInIHRoZW4gcmV0dXJuICdcXCInCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicgZWxzZSByZXR1cm4gYyBlbmQKICBlbmQpKQplbmQKCmxvY2FsIFQgPSB7fQpmdW5jdGlvbiBULmVuY29kZSh2KQogIGxvY2FsIHQgPSB0eXBlKHYpCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogIGlmIHQgPT0gJ2Jvb2xlYW4nIHRoZW4gcmV0dXJuIHRvc3RyaW5nKHYpIGVuZAogIGlmIHQgPT0gJ251bWJlcicgdGhlbgogICAgaWYgdiAlIDEgPT0gMCBhbmQgbWF0aC5hYnModikgPCAxZTE1IHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkJywgdikgZW5kCiAgICByZXR1cm4gdG9zdHJpbmcodikKICBlbmQKICBpZiB0ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICciJyAuLiBqc29uX2VzY2FwZSh2KSAuLiAnIicgZW5kCiAgaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGxvY2FsIGlzYXJyLCBuID0gdHJ1ZSwgMAogICAgZm9yIGsgaW4gcGFpcnModikgZG8KICAgICAgbiA9IG4gKyAxCiAgICAgIGlmIHR5cGUoaykgfj0gJ251bWJlcicgdGhlbiBpc2FyciA9IGZhbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgICBpZiBpc2FyciBhbmQgbiA9PSAjdiB0aGVuCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIGkgPSAxLCAjdiBkbyBwYXJ0c1sjcGFydHMgKyAxXSA9IFQuZW5jb2RlKHZbaV0pIGVuZAogICAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICAgIGVuZAogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIGssIHZhbCBpbiBwYWlycyh2KSBkbwogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9ICciJyAuLiBqc29uX2VzY2FwZSh0b3N0cmluZyhrKSkgLi4gJyI6JyAuLiBULmVuY29kZSh2YWwpCiAgICBlbmQKICAgIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOihjOW3peWFtwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHRyaW0ocykgcmV0dXJuICh0b3N0cmluZyhzKTpnc3ViKCdeJXMqJywgJycpOmdzdWIoJyVzKiQnLCAnJykpIGVuZAoKLS0g56iz5YGl5oyJ5Y2V5a2X56ymIHNwbGl0CmxvY2FsIGZ1bmN0aW9uIHRleHRfc3BsaXQocywgYykKICBsb2NhbCBvdXQsIHN0YXJ0ID0ge30sIDEKICB3aGlsZSB0cnVlIGRvCiAgICBsb2NhbCBpID0gczpmaW5kKGMsIHN0YXJ0LCB0cnVlKQogICAgaWYgbm90IGkgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gczpzdWIoc3RhcnQpCiAgICAgIGJyZWFrCiAgICBlbmQKICAgIG91dFsjb3V0ICsgMV0gPSBzOnN1YihzdGFydCwgaSAtIDEpCiAgICBzdGFydCA9IGkgKyAxCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCi0tIOWOu+aOieihjOWGhSBtYXJrZG93biDmoLzlvI/vvIzkv53nlZnlj6/or7vmlofmnKwKbG9jYWwgZnVuY3Rpb24gc3RyaXBfaW5saW5lKHMpCiAgcyA9IHM6Z3N1YignISVbJywgJ1snKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tIOWbvueJh+agh+iusCDihpIg6ZO+5o6lCiAgcyA9IChzOmdzdWIoJyUqJSooW14lKl0rKSUqJSonLCAnJTEnKSkgICAgICAgICAgICAgIC0tICoqYm9sZCoqCiAgcyA9IChzOmdzdWIoJ19fKFteX10rKV9fJywgJyUxJykpICAgICAgICAgICAgICAgICAgIC0tIF9fYm9sZF9fCiAgcyA9IChzOmdzdWIoJ2ArKFteYF0rKWArJywgJyUxJykpICAgICAgICAgICAgICAgICAgIC0tIGBjb2RlYAogIHMgPSAoczpnc3ViKCd+fihbXn5dKyl+ficsICclMScpKSAgICAgICAgICAgICAgICAgICAtLSB+fmRlbH5+CiAgcyA9IChzOmdzdWIoJyVbKFteJV1dKiklXSUoKFteKV0qKSUpJywgJyUxJykpICAgICAgIC0tIFt0ZXh0XSh1cmwpIOKGkiB0ZXh0CiAgcyA9IHM6Z3N1YignXiVzKiMrJXMqJywgJycpICAgICAgICAgICAgICAgICAgICAgICAgIC0tIOaui+eVmSAjCiAgcyA9IHM6Z3N1YignXiVzKj4lcyonLCAnJykgICAgICAgICAgICAgICAgICAgICAgICAgIC0tIOaui+eVmSA+CiAgcmV0dXJuIHRyaW0ocykKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOino+aekO+8muaLhuaIkCAo5pmu6YCa6KGM5bim6KGM5Y+3ICsgaW5fY29kZSDmoIforrAsIOWbtOagj+S7o+eggeWdlykKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwYXJzZSh0ZXh0KQogIGxvY2FsIGNvZGVfYmxvY2tzLCBsaW5lcyA9IHt9LCB7fQogIGxvY2FsIGluX2NvZGUsIGJ1ZiwgbGFuZywgc3RhcnRfbGluZSA9IGZhbHNlLCBuaWwsICcnLCAwCiAgZm9yIGksIHJhdyBpbiBpcGFpcnModGV4dF9zcGxpdCh0ZXh0LCAnXG4nKSkgZG8KICAgIGxvY2FsIGxpbmUgPSByYXc6Z3N1YignXHIkJywgJycpICAgLS0gQ1JMRiDihpIgTEYKICAgIGlmIGluX2NvZGUgdGhlbgogICAgICBpZiBsaW5lOm1hdGNoKCdeJXMqYGBgJykgb3IgbGluZTptYXRjaCgnXiVzKn5+ficpIHRoZW4KICAgICAgICBjb2RlX2Jsb2Nrc1sjY29kZV9ibG9ja3MgKyAxXSA9IHsKICAgICAgICAgIGxhbmcgPSBsYW5nLCB0ZXh0ID0gdGFibGUuY29uY2F0KGJ1ZiwgJ1xuJyksIGxpbmUgPSBzdGFydF9saW5lLAogICAgICAgIH0KICAgICAgICBpbl9jb2RlID0gZmFsc2UKICAgICAgZWxzZQogICAgICAgIGJ1ZlsjYnVmICsgMV0gPSBsaW5lCiAgICAgIGVuZAogICAgICBsaW5lc1sjbGluZXMgKyAxXSA9IHsgbm8gPSBpLCB0ZXh0ID0gbGluZSwgaW5fY29kZSA9IHRydWUgfQogICAgZWxzZQogICAgICBsb2NhbCBmZW5jZSA9IGxpbmU6bWF0Y2goJ14lcypgYGAoLiopJCcpIG9yIGxpbmU6bWF0Y2goJ14lcyp+fn4oLiopJCcpCiAgICAgIGlmIGZlbmNlIHRoZW4KICAgICAgICBpbl9jb2RlLCBsYW5nLCBidWYsIHN0YXJ0X2xpbmUgPSB0cnVlLCB0cmltKGZlbmNlKSwge30sIGkKICAgICAgICBsaW5lc1sjbGluZXMgKyAxXSA9IHsgbm8gPSBpLCB0ZXh0ID0gbGluZSwgaW5fY29kZSA9IHRydWUgfQogICAgICBlbHNlCiAgICAgICAgbGluZXNbI2xpbmVzICsgMV0gPSB7IG5vID0gaSwgdGV4dCA9IGxpbmUgfQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGlmIGluX2NvZGUgYW5kIGJ1ZiB0aGVuCiAgICBjb2RlX2Jsb2Nrc1sjY29kZV9ibG9ja3MgKyAxXSA9IHsKICAgICAgbGFuZyA9IGxhbmcsIHRleHQgPSB0YWJsZS5jb25jYXQoYnVmLCAnXG4nKSwgbGluZSA9IHN0YXJ0X2xpbmUsCiAgICB9CiAgZW5kCiAgcmV0dXJuIGxpbmVzLCBjb2RlX2Jsb2NrcwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5ZCEIG9wIOaPkOWPluWZqO+8iOWdh+i3s+i/hyBpbl9jb2RlIOihjO+8jOmBv+WFjeaKiuS7o+eggeWGheWuueivr+WIpOS4uue7k+aehO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3RfdG9jKGxpbmVzKQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIF8sIGwgaW4gaXBhaXJzKGxpbmVzKSBkbwogICAgaWYgbm90IGwuaW5fY29kZSB0aGVuCiAgICAgIGxvY2FsIGhhc2hlcywgdGV4dCA9IGwudGV4dDptYXRjaCgnXigjKyklcysoLiopJCcpCiAgICAgIGlmIGhhc2hlcyB0aGVuCiAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHsgbGV2ZWwgPSAjaGFzaGVzLCB0ZXh0ID0gc3RyaXBfaW5saW5lKHRleHQpLCBsaW5lID0gbC5ubyB9CiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3RfbGlua3MobGluZXMpCiAgbG9jYWwgb3V0LCBzZWVuID0ge30sIHt9CiAgZm9yIF8sIGwgaW4gaXBhaXJzKGxpbmVzKSBkbwogICAgaWYgbm90IGwuaW5fY29kZSB0aGVuCiAgICAgIGZvciB0ZXh0LCBocmVmIGluIGwudGV4dDpnbWF0Y2goJyVbKFteJV1dKiklXSUoKFteKV0rKSUpJykgZG8KICAgICAgICBocmVmID0gdHJpbShocmVmKQogICAgICAgIGlmIGhyZWYgfj0gJycgYW5kIG5vdCBzZWVuW2hyZWZdIHRoZW4KICAgICAgICAgIHNlZW5baHJlZl0gPSB0cnVlCiAgICAgICAgICBvdXRbI291dCArIDFdID0geyB0ZXh0ID0gc3RyaXBfaW5saW5lKHRleHQpLCBocmVmID0gaHJlZiB9CiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3RfbGlzdHMobGluZXMpCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgXywgbCBpbiBpcGFpcnMobGluZXMpIGRvCiAgICBpZiBub3QgbC5pbl9jb2RlIHRoZW4KICAgICAgbG9jYWwgc3AgPSBsLnRleHQ6bWF0Y2goJ14oJXMqKScpCiAgICAgIGxvY2FsIG9yZGVyZWQsIGl0ZW0gPSBsLnRleHQ6bWF0Y2goJ14lcyooJWQrKVsuKV1bIFx0XSsoLiopJCcpCiAgICAgIGlmIGl0ZW0gdGhlbgogICAgICAgIG91dFsjb3V0ICsgMV0gPSB7IG9yZGVyZWQgPSB0cnVlLCBpbmRlbnQgPSAjc3AsIHRleHQgPSBzdHJpcF9pbmxpbmUoaXRlbSkgfQogICAgICBlbHNlCiAgICAgICAgbG9jYWwgaXRlbTIgPSBsLnRleHQ6bWF0Y2goJ14lcypbLSorXVsgXHRdKyguKikkJykKICAgICAgICBpZiBpdGVtMiB0aGVuCiAgICAgICAgICBvdXRbI291dCArIDFdID0geyBvcmRlcmVkID0gZmFsc2UsIGluZGVudCA9ICNzcCwgdGV4dCA9IHN0cmlwX2lubGluZShpdGVtMikgfQogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiBleHRyYWN0X3F1b3RlcyhsaW5lcykKICBsb2NhbCBvdXQgPSB7fQogIGZvciBfLCBsIGluIGlwYWlycyhsaW5lcykgZG8KICAgIGlmIG5vdCBsLmluX2NvZGUgdGhlbgogICAgICBsb2NhbCBxID0gbC50ZXh0Om1hdGNoKCdeJXMqPitbJXNdKiguKikkJykKICAgICAgaWYgcSB0aGVuCiAgICAgICAgbG9jYWwgdCA9IHN0cmlwX2lubGluZShxKQogICAgICAgIGlmIHQgfj0gJycgdGhlbiBvdXRbI291dCArIDFdID0geyB0ZXh0ID0gdCB9IGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiBleHRyYWN0X3BsYWluKGxpbmVzKQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIF8sIGwgaW4gaXBhaXJzKGxpbmVzKSBkbwogICAgaWYgbm90IGwuaW5fY29kZSB0aGVuCiAgICAgIGxvY2FsIHMgPSBsLnRleHQKICAgICAgcyA9IHM6Z3N1YignXiVzKmBgYC4qJCcsICcnKSAgICAgICAgICAgICAgICAgICAgIC0tIOWbtOagj+ihjAogICAgICBzID0gczpnc3ViKCdeJXMqIyslcyonLCAnJykgICAgICAgICAgICAgICAgICAgICAgLS0g5qCH6aKYICMKICAgICAgcyA9IHM6Z3N1YignXiVzKj4rWyVzXSonLCAnJykgICAgICAgICAgICAgICAgICAgIC0tIOW8leeUqAogICAgICBzID0gczpnc3ViKCdeJXMqJWQrWy4pXVsgXHRdKycsICcnKSAgICAgICAgICAgICAgLS0g5pyJ5bqP5bqP5Y+3CiAgICAgIHMgPSBzOmdzdWIoJ14lcypbLSorXVsgXHRdKycsICcnKSAgICAgICAgICAgICAgICAtLSDml6Dluo/nrKYKICAgICAgcyA9IChzOmdzdWIoJyVbKFteJV1dKiklXSUoKFteKV0qKSUpJywgJyUxJykpICAgIC0tIOmTvuaOpSDihpIg5paH5pysCiAgICAgIHMgPSBzdHJpcF9pbmxpbmUocykKICAgICAgb3V0WyNvdXQgKyAxXSA9IHMKICAgIGVuZAogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQob3V0LCAnXG4nKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3Rfc3RhdHMobGluZXMsIGNvZGVfYmxvY2tzKQogIHJldHVybiB7CiAgICBoZWFkaW5ncyA9ICNleHRyYWN0X3RvYyhsaW5lcyksCiAgICBsaW5rcyA9ICNleHRyYWN0X2xpbmtzKGxpbmVzKSwKICAgIGNvZGUgPSAjY29kZV9ibG9ja3MsCiAgICBsaXN0cyA9ICNleHRyYWN0X2xpc3RzKGxpbmVzKSwKICAgIHF1b3RlcyA9ICNleHRyYWN0X3F1b3RlcyhsaW5lcyksCiAgICBsaW5lcyA9ICNsaW5lcywKICB9CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJ1tdJyBlbmQKICBsb2NhbCB0ZXh0ID0gcC52IG9yICcnCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdzdGF0cycKICBsb2NhbCBsaW5lcywgY29kZV9ibG9ja3MgPSBwYXJzZSh0ZXh0KQoKICBpZiBvcCA9PSAndG9jJyB0aGVuIHJldHVybiBULmVuY29kZShleHRyYWN0X3RvYyhsaW5lcykpCiAgZWxzZWlmIG9wID09ICdsaW5rcycgdGhlbiByZXR1cm4gVC5lbmNvZGUoZXh0cmFjdF9saW5rcyhsaW5lcykpCiAgZWxzZWlmIG9wID09ICdjb2RlJyB0aGVuIHJldHVybiBULmVuY29kZShjb2RlX2Jsb2NrcykKICBlbHNlaWYgb3AgPT0gJ2xpc3RzJyB0aGVuIHJldHVybiBULmVuY29kZShleHRyYWN0X2xpc3RzKGxpbmVzKSkKICBlbHNlaWYgb3AgPT0gJ3F1b3RlcycgdGhlbiByZXR1cm4gVC5lbmNvZGUoZXh0cmFjdF9xdW90ZXMobGluZXMpKQogIGVsc2VpZiBvcCA9PSAncGxhaW4nIHRoZW4gcmV0dXJuIGV4dHJhY3RfcGxhaW4obGluZXMpCiAgZWxzZWlmIG9wID09ICdzdGF0cycgdGhlbiByZXR1cm4gVC5lbmNvZGUoZXh0cmFjdF9zdGF0cyhsaW5lcywgY29kZV9ibG9ja3MpKQogIGVuZAogIHJldHVybiAnW10nCmVuZAoKcmV0dXJuIGZ1bmN0aW9uKHApCiAgcmV0dXJuIHJ1bihwKQplbmQKAC0tIEBsaWI6IGVudGl0eQotLSBAY2F0ZWdvcnk6IGVudGl0eQotLSBAZGVzYzog5a6e5L2T6Kej5p6QL+iusOW9lemTvuaOpeeuoemBk++8iOe6ryBMdWHvvIzoh6rljIXlkKvvvIxVVEYtOCDmhJ/nn6XvvInigJTigJRibG9ja2luZyDihpIg55u45Ly85bqm5omT5YiGIOKGkiDov57pgJrliIbph4/ogZrnsbvjgIIKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tICAgICAgIG9wPSdibG9jayfvvJrnlJ/miJAgYmxvY2tpbmcg6ZSu44CCcC52IOWtl+espuS4su+8m3AubW9kZToKLS0gICAgICAgICAnc291bmRleCfvvIjoi7Hmloflp5PmsI/nu4/lhbggU291bmRleO+8jDQg5a2X56ym77yJ77ybCi0tICAgICAgICAgJ2ZpcnN0MyfvvIjmoIflh4bljJblkI7pppYgMyDlrZfnrKbvvIzkuK3oi7HmlofpgJrnlKjvvInvvJsKLS0gICAgICAgICAnbmdyYW0n77yIYmlncmFtIOmbhuWQiOaMieWIhumalOespuaLvOmUru+8jHAubiDpu5jorqQgMu+8ie+8mwotLSAgICAgICAgICdub3JtJ++8iOWPquWBmuagh+WHhuWMlu+8muWwj+WGmS/ljrvnqbrnmb0v5Y675qCH54K577yM6L+U5Zue5YWo5Liy77yJ44CCCi0tICAgICAgIOagh+WHhuWMlue7n+S4gO+8muWwj+WGmSDihpIg5oqY5Y+g56m655m9IOKGkiDljrvmoIfngrnvvIjkv53nlZkgQ0pLIOWtl+avjeaVsOWtl++8ieOAggotLSAgICAgICBvcD0nbWF0Y2gn77ya5Lik5Liy55u45Ly85bqmIOKIiFswLDFd44CC6buY6K6kIEphcm8tV2lua2xlcu+8iOWJjee8gOWKoOadgyBwPTAuMjXvvIxwLnAg5Y+v6LCD77yJ77ybCi0tICAgICAgICAgcC5tZXRyaWM9J2phcm8nfCdqdyd8J2xldifvvIhsZXYg5pe25Li6IDHiiJLlvZLkuIDljJbnvJbovpHot53nprvvvInjgIIKLS0gICAgICAgb3A9J3Jlc29sdmUn77ya5a6M5pW0566h6YGT77yI5bCP6KeE5qih5Y6f5Z6L77yM5Yeg55m+5p2h5YaF77yJ44CCcC5yZWNvcmRzID0geyB7aWQ9Li4uLCBuYW1lPS4uLiwgY2l0eT0uLi4sIC4uLn0sIC4uLiB977ybCi0tICAgICAgICAgcC5rZXlfZmllbGRzID0geyAnbmFtZScsICdjaXR5JyB977yI5Y+C5LiOIGJsb2NraW5nK+aJk+WIhueahOWtl+aute+8jOm7mOiupCB7J25hbWUnfe+8ie+8mwotLSAgICAgICAgIHAudGhyZXNob2xkID0g5omT5YiG6ZiI5YC877yI6buY6K6kIDAuODjvvIxKVyDlj6PlvoTvvInvvJsKLS0gICAgICAgICBwLmJsb2NrX21vZGUgPSAnZmlyc3QzJ3wnc291bmRleCfvvIjpu5jorqQgZmlyc3Qz77yM5Lit6Iux5paH6YCa55So77yJ44CCCi0tICAgICAgIOa1geeoi++8mumAkOiusOW9leeUn+aIkCBibG9ja2luZyDplK4g4oaSIOWQjOmUrue7hOWGheS4pOS4pOaJk+WIhu+8iOWkmuWtl+auteWPluWKoOadg+W5s+Wdh++8jHAud2VpZ2h0cyDlj6/osIPvvIkKLS0gICAgICAg4oaSIOi2hemYiOWAvOi/nui+uSDihpIgdW5pb24tZmluZCDov57pgJrliIbph48g4oaSIGNhbm9uaWNhbCDlj5bnu4TlhoUgbmFtZSDmnIDplb/orrDlvZXjgIIKLS0gICAgICAg6L+U5ZueIEpTT07vvJp7IGNsdXN0ZXJzOiBbIHtjbHVzdGVyLCBpZHM6Wy4uLl0sIGNhbm9uaWNhbCwgc2l6ZSwgbWVtYmVyczpbe2lkLG5hbWUsc2NvcmV9XX0sIC4uLiBdLAotLSAgICAgICAgICAgICAgICAgICAgcGFpcnM6IOi/nui+ueaVsCwgdW5pcTog5Y6f5aeL6K6w5b2V5pWwIH0KLS0g6K+a5a6e6L6555WM77yac291bmRleCDlj6rlr7noi7HmlofmnInmlYjvvIjkuK3mloflkI3or7fnlKggZmlyc3QzL25ncmFt77yJ77ybYmxvY2tpbmcg5piv5Y+s5Zue5o6n5Yi277yM5ryP5LqGCi0tIOmUruWwsea8j+S6humFjeWvueKAlOKAlOeUn+S6p+W7uuiuruWkmumUruW5tuiBlO+8iOmmljMgKyBzb3VuZGV4ICsgbmdyYW0g5ZCE6LeR5LiA6YGN5YaN5bm277yJ77yb5omT5YiG6ZiI5YC86ZyA5oyJCi0tIOaVsOaNruWIhuW4g+iwg++8iOWOn+WeiyAwLjg4IOaYr+iLseaWh+WQjee7j+mqjOWAvO+8jOS4reaWh+WQjeW7uuiuriAwLjg1fjAuOTAg5a6e5rWL77yJ44CCcmVzb2x2ZSDmmK/lhajlhoXlrZgKLS0g5a6e546w77yM5LiH57qn5Lul5LiK6K+35pS5IFNRTCDnq68gam9pbiArIG1hdGNoIOaJk+WIhu+8iGZ1enp5LnNpbXJhbmsg55qE5oCd6Lev77yJ44CCCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0nZW50aXR5Jyk7Ci0tICAgYmxvY2s6ICAgIFNFTEVDVCBsdWFqaXRfcygnZW50aXR5Jywge3Y6J0pvaG4gU21pdGgnLCBtb2RlOidzb3VuZGV4Jywgb3A6J2Jsb2NrJ30pOyAg4oaSICdKNTMyJwotLSAgIG1hdGNoOiAgICBTRUxFQ1QgbHVhaml0X3MoJ2VudGl0eScsIHthOidtYXJ0aGEnLCBiOidtYXJodGEnLCBvcDonbWF0Y2gnfSk7ICAgICAgICAgIOKGkiAnMC45ODYxJwotLSAgIHJlc29sdmU6ICBTRUxFQ1QgbHVhaml0X3MoJ2VudGl0eScsIHtyZWNvcmRzOlt7aWQ6MSxuYW1lOidBbGljZSBDaGVuJyxjaXR5OidIWid9LAotLSAgICAgICAgICAgICB7aWQ6MixuYW1lOidBbGljZSBDaGVuJyxjaXR5OidIYW5nemhvdSd9LHtpZDozLG5hbWU6J0JvYicsY2l0eTonU0gnfV0sCi0tICAgICAgICAgICAgIGtleV9maWVsZHM6WyduYW1lJywnY2l0eSddLCBvcDoncmVzb2x2ZSd9KTsKLS0gICAgICAgICAgICAg4oaSICd7ImNsdXN0ZXJzIjpbeyJjbHVzdGVyIjoxLCJpZHMiOlsxLDJdLCJjYW5vbmljYWwiOiJBbGljZSBDaGVuIiwuLi59XX0nCgpsb2NhbCBlbnRpdHkgPSB7fQpsb2NhbCBqc29uX2VuY29kZSAgLS0g5YmN5ZCR5aOw5piO77yI5a6a5LmJ5Zyo5paH5Lu25ZCO6YOo77yM6LCD55So5Y+R55Sf5ZyoIGNodW5rIOWKoOi9veWujOaIkOWQju+8iQoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVVEYtOCDku6PnoIHngrnvvIjkuI4gZnV6enkgbGliIOWQjOe6puWumu+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHV0ZjhjcChzKQogIGxvY2FsIGNwcyA9IHt9CiAgbG9jYWwgaSwgbiA9IDEsICNzCiAgd2hpbGUgaSA8PSBuIGRvCiAgICBsb2NhbCBiMSA9IHM6Ynl0ZShpKQogICAgbG9jYWwgY3AsIGxlbgogICAgaWYgYjEgPCAweDgwIHRoZW4gY3AsIGxlbiA9IGIxLCAxCiAgICBlbHNlaWYgYjEgPj0gMHhDMCBhbmQgYjEgPCAweEUwIHRoZW4KICAgICAgY3AgPSAoYjEgLSAweEMwKSAqIDY0ICsgKChzOmJ5dGUoaSArIDEpIG9yIDApIC0gMHg4MCk7IGxlbiA9IDIKICAgIGVsc2VpZiBiMSA+PSAweEUwIGFuZCBiMSA8IDB4RjAgdGhlbgogICAgICBsb2NhbCBiMiwgYjMgPSBzOmJ5dGUoaSArIDEpIG9yIDAsIHM6Ynl0ZShpICsgMikgb3IgMAogICAgICBjcCA9IChiMSAtIDB4RTApICogNDA5NiArIChiMiAtIDB4ODApICogNjQgKyAoYjMgLSAweDgwKTsgbGVuID0gMwogICAgZWxzZWlmIGIxID49IDB4RjAgYW5kIGIxIDwgMHhGOCB0aGVuCiAgICAgIGxvY2FsIGIyLCBiMywgYjQgPSBzOmJ5dGUoaSArIDEpIG9yIDAsIHM6Ynl0ZShpICsgMikgb3IgMCwgczpieXRlKGkgKyAzKSBvciAwCiAgICAgIGNwID0gKGIxIC0gMHhGMCkgKiAyNjIxNDQgKyAoYjIgLSAweDgwKSAqIDQwOTYgKyAoYjMgLSAweDgwKSAqIDY0ICsgKGI0IC0gMHg4MCk7IGxlbiA9IDQKICAgIGVsc2UgY3AsIGxlbiA9IGIxLCAxIGVuZAogICAgY3BzWyNjcHMgKyAxXSA9IGNwCiAgICBpID0gaSArIGxlbgogIGVuZAogIHJldHVybiBjcHMKZW5kCgpsb2NhbCBmdW5jdGlvbiBpc19hbG51bShjcCkKICByZXR1cm4gKGNwID49IDQ4IGFuZCBjcCA8PSA1Nykgb3IgKGNwID49IDY1IGFuZCBjcCA8PSA5MCkgb3IgKGNwID49IDk3IGFuZCBjcCA8PSAxMjIpCiAgICBvciBjcCA+PSAweDRFMDAgYW5kIGNwIDw9IDB4OUZGRiAgLS0gQ0pLIOWfuuacrOWMugplbmQKCi0tIOagh+WHhuWMlu+8muWwj+WGmSArIOaKmOWPoOepuueZvSArIOWOu+agh+eCue+8iOS/neeVmeWtl+avjeaVsOWtl+S4jiBDSkvvvIkKbG9jYWwgZnVuY3Rpb24gbm9ybShzKQogIGxvY2FsIG91dCA9IHt9CiAgbG9jYWwgcHJldl9zcGFjZSA9IGZhbHNlCiAgZm9yIF8sIGNwIGluIGlwYWlycyh1dGY4Y3AocykpIGRvCiAgICBpZiBjcCA+PSA2NSBhbmQgY3AgPD0gOTAgdGhlbiBjcCA9IGNwICsgMzIgZW5kCiAgICBpZiBpc19hbG51bShjcCkgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gY3AKICAgICAgcHJldl9zcGFjZSA9IGZhbHNlCiAgICBlbHNlaWYgY3AgPT0gMzIgb3IgY3AgPT0gOSB0aGVuCiAgICAgIGlmIG5vdCBwcmV2X3NwYWNlIGFuZCAjb3V0ID4gMCB0aGVuIG91dFsjb3V0ICsgMV0gPSAzMiBlbmQKICAgICAgcHJldl9zcGFjZSA9IHRydWUKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiB0b3N0cihjcHMpCiAgbG9jYWwgcGFydHMgPSB7fQogIGZvciBfLCBjcCBpbiBpcGFpcnMoY3BzKSBkbwogICAgaWYgY3AgPD0gMHg3RiB0aGVuCiAgICAgIHBhcnRzWyNwYXJ0cyArIDFdID0gc3RyaW5nLmNoYXIoY3ApCiAgICBlbHNlaWYgY3AgPD0gMHg3RkYgdGhlbgogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IHN0cmluZy5jaGFyKDB4QzAgKyBtYXRoLmZsb29yKGNwIC8gNjQpLCAweDgwICsgY3AgJSA2NCkKICAgIGVsc2VpZiBjcCA8PSAweEZGRkYgdGhlbgogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IHN0cmluZy5jaGFyKDB4RTAgKyBtYXRoLmZsb29yKGNwIC8gNDA5NiksCiAgICAgICAgMHg4MCArIG1hdGguZmxvb3IoY3AgLyA2NCkgJSA2NCwgMHg4MCArIGNwICUgNjQpCiAgICBlbHNlCiAgICAgIHBhcnRzWyNwYXJ0cyArIDFdID0gc3RyaW5nLmNoYXIoMHhGMCArIG1hdGguZmxvb3IoY3AgLyAyNjIxNDQpLAogICAgICAgIDB4ODAgKyBtYXRoLmZsb29yKGNwIC8gNDA5NikgJSA2NCwgMHg4MCArIG1hdGguZmxvb3IoY3AgLyA2NCkgJSA2NCwgMHg4MCArIGNwICUgNjQpCiAgICBlbmQKICBlbmQKICByZXR1cm4gdGFibGUuY29uY2F0KHBhcnRzKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gSmFybyAvIEphcm8tV2lua2xlciAvIExldmVuc2h0ZWlu77yI5Luj56CB54K557qn77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gamFybyhBLCBCKQogIGxvY2FsIGxhLCBsYiA9ICNBLCAjQgogIGlmIGxhID09IDAgYW5kIGxiID09IDAgdGhlbiByZXR1cm4gMSBlbmQKICBpZiBsYSA9PSAwIG9yIGxiID09IDAgdGhlbiByZXR1cm4gMCBlbmQKICBsb2NhbCBtYXRjaF9kaXN0ID0gbWF0aC5mbG9vcihtYXRoLm1heChsYSwgbGIpIC8gMikgLSAxCiAgaWYgbWF0Y2hfZGlzdCA8IDAgdGhlbiBtYXRjaF9kaXN0ID0gMCBlbmQKICBsb2NhbCBhX21hdGNoLCBiX21hdGNoID0ge30sIHt9CiAgbG9jYWwgbWF0Y2hlcyA9IDAKICBmb3IgaSA9IDEsIGxhIGRvCiAgICBsb2NhbCBsbyA9IG1hdGgubWF4KDEsIGkgLSBtYXRjaF9kaXN0KQogICAgbG9jYWwgaGkgPSBtYXRoLm1pbihsYiwgaSArIG1hdGNoX2Rpc3QpCiAgICBmb3IgaiA9IGxvLCBoaSBkbwogICAgICBpZiBub3QgYl9tYXRjaFtqXSBhbmQgQVtpXSA9PSBCW2pdIHRoZW4KICAgICAgICBhX21hdGNoW2ldLCBiX21hdGNoW2pdID0gdHJ1ZSwgdHJ1ZQogICAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICsgMQogICAgICAgIGJyZWFrCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgaWYgbWF0Y2hlcyA9PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgbG9jYWwgdCwgayA9IDAsIDEKICBmb3IgaSA9IDEsIGxhIGRvCiAgICBpZiBhX21hdGNoW2ldIHRoZW4KICAgICAgd2hpbGUgbm90IGJfbWF0Y2hba10gZG8gayA9IGsgKyAxIGVuZAogICAgICBpZiBBW2ldIH49IEJba10gdGhlbiB0ID0gdCArIDEgZW5kCiAgICAgIGsgPSBrICsgMQogICAgZW5kCiAgZW5kCiAgbG9jYWwgbSA9IG1hdGNoZXMKICByZXR1cm4gKG0gLyBsYSArIG0gLyBsYiArIChtIC0gdCAvIDIpIC8gbSkgLyAzCmVuZAoKbG9jYWwgZnVuY3Rpb24gancoQSwgQiwgcCkKICBsb2NhbCBqID0gamFybyhBLCBCKQogIC0tIOWFseWQjOWJjee8gO+8iOS4iumZkCA077yJCiAgbG9jYWwgbCA9IDAKICBmb3IgaSA9IDEsIG1hdGgubWluKCNBLCAjQiwgNCkgZG8KICAgIGlmIEFbaV0gPT0gQltpXSB0aGVuIGwgPSBsICsgMSBlbHNlIGJyZWFrIGVuZAogIGVuZAogIHJldHVybiBqICsgbCAqIChwIG9yIDAuMjUpICogKDEgLSBqKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGxldihBLCBCKQogIGxvY2FsIG0sIG4gPSAjQSwgI0IKICBpZiBtID09IDAgdGhlbiByZXR1cm4gbiBlbmQKICBpZiBuID09IDAgdGhlbiByZXR1cm4gbSBlbmQKICBsb2NhbCBwcmV2ID0ge30KICBmb3IgaiA9IDAsIG4gZG8gcHJldltqXSA9IGogZW5kCiAgZm9yIGkgPSAxLCBtIGRvCiAgICBsb2NhbCBjdXIgPSB7IFswXSA9IGkgfQogICAgbG9jYWwgYWkgPSBBW2ldCiAgICBmb3IgaiA9IDEsIG4gZG8KICAgICAgY3VyW2pdID0gbWF0aC5taW4ocHJldltqXSArIDEsIGN1cltqIC0gMV0gKyAxLCBwcmV2W2ogLSAxXSArIChhaSA9PSBCW2pdIGFuZCAwIG9yIDEpKQogICAgZW5kCiAgICBwcmV2ID0gY3VyCiAgZW5kCiAgcmV0dXJuIHByZXZbbl0KZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIFNvdW5kZXjvvIjoi7HmlofvvJvpnZ7lrZfmr43lvIDlpLTov5Tlm54gJyfvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBTT1VOREVYX01BUCA9IHsgWydiJ109JzEnLFsnZiddPScxJyxbJ3AnXT0nMScsWyd2J109JzEnLAogIFsnYyddPScyJyxbJ2cnXT0nMicsWydqJ109JzInLFsnayddPScyJyxbJ3EnXT0nMicsWydzJ109JzInLFsneCddPScyJyxbJ3onXT0nMicsCiAgWydkJ109JzMnLFsndCddPSczJyxbJ2wnXT0nNCcsWydtJ109JzUnLFsnbiddPSc1JyxbJ3InXT0nNicgfQpsb2NhbCBWT1dFTFMgPSB7IGEgPSB0cnVlLCBlID0gdHJ1ZSwgaSA9IHRydWUsIG8gPSB0cnVlLCB1ID0gdHJ1ZSwgeSA9IHRydWUgfQoKbG9jYWwgZnVuY3Rpb24gc291bmRleChzKQogIGxvY2FsIG91dCA9IHt9CiAgbG9jYWwgcHJldl9jb2RlCiAgZm9yIGkgPSAxLCAjcyBkbwogICAgbG9jYWwgYyA9IHM6c3ViKGksIGkpOmxvd2VyKCkKICAgIGlmIGkgPT0gMSB0aGVuCiAgICAgIG91dFsxXSA9IHN0cmluZy51cHBlcihjKQogICAgZWxzZWlmIFNPVU5ERVhfTUFQW2NdIHRoZW4KICAgICAgbG9jYWwgY29kZSA9IFNPVU5ERVhfTUFQW2NdCiAgICAgIGlmIGNvZGUgfj0gcHJldl9jb2RlIHRoZW4KICAgICAgICBvdXRbI291dCArIDFdID0gY29kZQogICAgICAgIHByZXZfY29kZSA9IGNvZGUKICAgICAgZW5kCiAgICBlbHNlaWYgVk9XRUxTW2NdIHRoZW4KICAgICAgcHJldl9jb2RlID0gbmlsICAtLSDlhYPpn7PliIbpmpTvvJrlhYHorrjlkIznoIHlho3njrAKICAgIGVuZAogICAgaWYgI291dCA+PSA0IHRoZW4gYnJlYWsgZW5kCiAgZW5kCiAgd2hpbGUgI291dCA8IDQgZG8gb3V0WyNvdXQgKyAxXSA9ICcwJyBlbmQKICByZXR1cm4gdGFibGUuY29uY2F0KG91dCkKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEJsb2NraW5nIOmUrgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJsb2NrX2tleSh2LCBtb2RlLCBuKQogIGxvY2FsIGNwcyA9IG5vcm0odikKICBpZiAjY3BzID09IDAgdGhlbiByZXR1cm4gJycgZW5kCiAgbW9kZSA9IG1vZGUgb3IgJ2ZpcnN0MycKICBpZiBtb2RlID09ICdub3JtJyB0aGVuCiAgICByZXR1cm4gdG9zdHIoY3BzKQogIGVsc2VpZiBtb2RlID09ICdzb3VuZGV4JyB0aGVuCiAgICByZXR1cm4gc291bmRleCh0b3N0cihjcHMpKQogIGVsc2VpZiBtb2RlID09ICduZ3JhbScgdGhlbgogICAgbG9jYWwgayA9IG4gb3IgMgogICAgbG9jYWwgZ3JhbXMgPSB7fQogICAgaWYgI2NwcyA8IGsgdGhlbiByZXR1cm4gdG9zdHIoY3BzKSBlbmQKICAgIGZvciBpID0gMSwgI2NwcyAtIGsgKyAxIGRvCiAgICAgIGdyYW1zWyNncmFtcyArIDFdID0gdG9zdHJpbmcoY3BzW2ldKQogICAgZW5kCiAgICB0YWJsZS5zb3J0KGdyYW1zKQogICAgcmV0dXJuIHRhYmxlLmNvbmNhdChncmFtcywgJywnKQogIGVsc2UgIC0tIGZpcnN0MwogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBpID0gMSwgbWF0aC5taW4oMywgI2NwcykgZG8gb3V0WyNvdXQgKyAxXSA9IGNwc1tpXSBlbmQKICAgIHJldHVybiB0b3N0cihvdXQpCiAgZW5kCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDnm7jkvLzluqbvvIjlpJrlrZfmrrXliqDmnYPvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBmaWVsZF9zY29yZShyMSwgcjIsIGZpZWxkcywgd2VpZ2h0cywgbWV0cmljLCBwKQogIGxvY2FsIHRvdGFsX3csIGFjYyA9IDAsIDAKICBmb3IgaSwgZiBpbiBpcGFpcnMoZmllbGRzKSBkbwogICAgbG9jYWwgdjEsIHYyID0gcjFbZl0sIHIyW2ZdCiAgICBpZiB2MSB+PSBuaWwgYW5kIHYyIH49IG5pbCBhbmQgdG9zdHJpbmcodjEpIH49ICcnIGFuZCB0b3N0cmluZyh2Mikgfj0gJycgdGhlbgogICAgICBsb2NhbCBBLCBCID0gbm9ybSh0b3N0cmluZyh2MSkpLCBub3JtKHRvc3RyaW5nKHYyKSkKICAgICAgbG9jYWwgc2MKICAgICAgaWYgbWV0cmljID09ICdsZXYnIHRoZW4KICAgICAgICBzYyA9IDEgLSBsZXYoQSwgQikgLyBtYXRoLm1heCgjQSwgI0IsIDEpCiAgICAgIGVsc2UKICAgICAgICBzYyA9IGp3KEEsIEIsIHAucCBvciAwLjI1KQogICAgICBlbmQKICAgICAgbG9jYWwgdyA9IHdlaWdodHMgYW5kIHdlaWdodHNbaV0gb3IgMQogICAgICB0b3RhbF93LCBhY2MgPSB0b3RhbF93ICsgdywgYWNjICsgdyAqIHNjCiAgICBlbmQKICBlbmQKICBpZiB0b3RhbF93ID09IDAgdGhlbiByZXR1cm4gMCBlbmQKICByZXR1cm4gYWNjIC8gdG90YWxfdwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gVW5pb24tRmluZAotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIG1ha2VfdWYobikKICByZXR1cm4gc2V0bWV0YXRhYmxlKHsgcGFyZW50ID0ge30sIHNpemUgPSB7fSB9LCB7CiAgICBfX2luZGV4ID0gewogICAgICBmaW5kID0gZnVuY3Rpb24oc2VsZiwgeCkKICAgICAgICBsb2NhbCBwID0gc2VsZi5wYXJlbnQKICAgICAgICB3aGlsZSBwW3hdIH49IHggZG8gcFt4XSA9IHBbcFt4XV07IHggPSBwW3hdIGVuZAogICAgICAgIHJldHVybiB4CiAgICAgIGVuZCwKICAgICAgdW5pb24gPSBmdW5jdGlvbihzZWxmLCB4LCB5KQogICAgICAgIGxvY2FsIHAsIHMgPSBzZWxmLnBhcmVudCwgc2VsZi5zaXplCiAgICAgICAgbG9jYWwgcngsIHJ5ID0gc2VsZjpmaW5kKHgpLCBzZWxmOmZpbmQoeSkKICAgICAgICBpZiByeCA9PSByeSB0aGVuIHJldHVybiBlbmQKICAgICAgICBpZiBzW3J4XSA8IHNbcnldIHRoZW4gcngsIHJ5ID0gcnksIHJ4IGVuZAogICAgICAgIHBbcnldID0gcng7IHNbcnhdID0gc1tyeF0gKyBzW3J5XQogICAgICBlbmQKICAgIH0KICB9KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gcmVzb2x2Ze+8muWujOaVtOeuoemBkwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHJlc29sdmUocCkKICBsb2NhbCByZWNvcmRzID0gcC5yZWNvcmRzCiAgaWYgdHlwZShyZWNvcmRzKSB+PSAndGFibGUnIG9yICNyZWNvcmRzID09IDAgdGhlbgogICAgLS0g5bm26KGM5pWw57uE5qih5byP77yIU1FMIOS+p+WFvOWuue+8mkxJU1Qtb2YtU1RSVUNUIOahpeaOpeaaguS4jeaUr+aMge+8jOeUqOWkmuWIlyBMSVNUIOS7o+abv++8iQogICAgLS0g5L6L77yaeydvcCc6J3Jlc29sdmUnLCAnbmFtZSc6WydBbGljZSBDaGVuJywnQm9iIExpJ10sICdjaXR5JzpbJ0hhbmd6aG91JywnU0gnXSwgJ2lkJzpbMSwyXX0KICAgIGxvY2FsIGFycnMsIG4gPSB7fSwgMAogICAgbG9jYWwgQ09OVFJPTCA9IHsgb3AgPSB0cnVlLCByZWNvcmRzID0gdHJ1ZSwga2V5X2ZpZWxkcyA9IHRydWUsIHdlaWdodHMgPSB0cnVlLAogICAgICAgICAgICAgICAgICAgICAgdGhyZXNob2xkID0gdHJ1ZSwgYmxvY2tfbW9kZSA9IHRydWUsIG1ldHJpYyA9IHRydWUsIHAgPSB0cnVlIH0KICAgIGZvciBrLCB2IGluIHBhaXJzKHApIGRvCiAgICAgIGlmIHR5cGUodikgPT0gJ3RhYmxlJyBhbmQgdHlwZSh2WzFdKSB+PSAnbmlsJyBhbmQgbm90IENPTlRST0xba10gdGhlbgogICAgICAgIGFycnNba10gPSB2CiAgICAgICAgbiA9IG1hdGgubWF4KG4sICN2KQogICAgICBlbmQKICAgIGVuZAogICAgaWYgbiA9PSAwIHRoZW4gcmV0dXJuICd7ImVycm9yIjoicmVjb3JkcyByZXF1aXJlZCIsImNsdXN0ZXJzIjpbXX0nIGVuZAogICAgcmVjb3JkcyA9IHt9CiAgICBmb3IgaSA9IDEsIG4gZG8KICAgICAgcmVjb3Jkc1tpXSA9IHt9CiAgICAgIGZvciBrLCB2IGluIHBhaXJzKGFycnMpIGRvCiAgICAgICAgaWYgdltpXSB+PSBuaWwgdGhlbiByZWNvcmRzW2ldW2tdID0gdltpXSBlbmQKICAgICAgZW5kCiAgICBlbmQKICAgIGlmIG5vdCBwLmtleV9maWVsZHMgdGhlbgogICAgICBsb2NhbCBrcyA9IHt9CiAgICAgIGZvciBrIGluIHBhaXJzKGFycnMpIGRvIGlmIGsgfj0gJ2lkJyB0aGVuIGtzWyNrcyArIDFdID0gayBlbmQgZW5kCiAgICAgIHAua2V5X2ZpZWxkcyA9IGtzCiAgICBlbmQKICBlbmQKICBsb2NhbCBmaWVsZHMgPSBwLmtleV9maWVsZHMgb3IgeyAnbmFtZScgfQogIGxvY2FsIHdlaWdodHMgPSBwLndlaWdodHMKICBsb2NhbCB0aHJlc2hvbGQgPSBwLnRocmVzaG9sZCBvciAwLjg4CiAgbG9jYWwgYmxvY2tfbW9kZSA9IHAuYmxvY2tfbW9kZSBvciAnZmlyc3QzJwogIGxvY2FsIG1ldHJpYyA9IHAubWV0cmljIG9yICdqdycKCiAgLS0gMS4gYmxvY2tpbmfvvJrplK4g4oaSIOiusOW9leS4i+agh+e7hAogIGxvY2FsIGJ1Y2tldHMgPSB7fQogIGxvY2FsIHVuaXEgPSAwCiAgZm9yIGksIHIgaW4gaXBhaXJzKHJlY29yZHMpIGRvCiAgICBsb2NhbCBrZXkgPSBibG9ja19rZXkodG9zdHJpbmcocltmaWVsZHNbMV1dIG9yICcnKSwgYmxvY2tfbW9kZSkKICAgIGlmIGtleSB+PSAnJyB0aGVuCiAgICAgIHVuaXEgPSB1bmlxICsgMQogICAgICBidWNrZXRzW2tleV0gPSBidWNrZXRzW2tleV0gb3Ige30KICAgICAgYnVja2V0c1trZXldWyNidWNrZXRzW2tleV0gKyAxXSA9IGkKICAgIGVuZAogIGVuZAoKICAtLSAyLiDnu4TlhoXkuKTkuKTmiZPliIYg4oaSIOi2hemYiOWAvOi/nui+uQogIGxvY2FsIG4gPSAjcmVjb3JkcwogIGxvY2FsIHVmID0gbWFrZV91ZihuKQogIGZvciBpID0gMSwgbiBkbyB1Zi5wYXJlbnRbaV0sIHVmLnNpemVbaV0gPSBpLCAxIGVuZAogIGxvY2FsIHBhaXJfY291bnQgPSAwCiAgbG9jYWwgc2VlbiA9IHt9CiAgZm9yIGtleSwgaWR4cyBpbiBwYWlycyhidWNrZXRzKSBkbwogICAgaWYgI2lkeHMgPiAxIHRoZW4KICAgICAgZm9yIGEgPSAxLCAjaWR4cyAtIDEgZG8KICAgICAgICBmb3IgYiA9IGEgKyAxLCAjaWR4cyBkbwogICAgICAgICAgbG9jYWwgaSwgaiA9IGlkeHNbYV0sIGlkeHNbYl0KICAgICAgICAgIGxvY2FsIGVkZ2Vfa2V5ID0gaSA8IGogYW5kIChpICogMTAwMDAwICsgaikgb3IgKGogKiAxMDAwMDAgKyBpKQogICAgICAgICAgaWYgbm90IHNlZW5bZWRnZV9rZXldIHRoZW4KICAgICAgICAgICAgc2VlbltlZGdlX2tleV0gPSB0cnVlCiAgICAgICAgICAgIGxvY2FsIHNjID0gZmllbGRfc2NvcmUocmVjb3Jkc1tpXSwgcmVjb3Jkc1tqXSwgZmllbGRzLCB3ZWlnaHRzLCBtZXRyaWMsIHApCiAgICAgICAgICAgIGlmIHNjID49IHRocmVzaG9sZCB0aGVuCiAgICAgICAgICAgICAgdWY6dW5pb24oaSwgaikKICAgICAgICAgICAgICBwYWlyX2NvdW50ID0gcGFpcl9jb3VudCArIDEKICAgICAgICAgICAgZW5kCiAgICAgICAgICBlbmQKICAgICAgICBlbmQKICAgICAgZW5kCiAgICBlbmQKICBlbmQKCiAgLS0gMy4g6L+e6YCa5YiG6YePIOKGkiDovpPlh7oKICBsb2NhbCBncm91cHMgPSB7fQogIGZvciBpID0gMSwgbiBkbwogICAgbG9jYWwgcm9vdCA9IHVmOmZpbmQoaSkKICAgIGdyb3Vwc1tyb290XSA9IGdyb3Vwc1tyb290XSBvciB7fQogICAgZ3JvdXBzW3Jvb3RdWyNncm91cHNbcm9vdF0gKyAxXSA9IGkKICBlbmQKICBsb2NhbCBjbHVzdGVycywgY2lkID0ge30sIDAKICBmb3Igcm9vdCwgaWRzIGluIHBhaXJzKGdyb3VwcykgZG8KICAgIGNpZCA9IGNpZCArIDEKICAgIGxvY2FsIGNhbm9uLCBjYW5vbl9sZW4gPSAnJywgMAogICAgbG9jYWwgbWVtYmVycyA9IHt9CiAgICBmb3IgXywgaSBpbiBpcGFpcnMoaWRzKSBkbwogICAgICBsb2NhbCBuYW1lID0gdG9zdHJpbmcocmVjb3Jkc1tpXVtmaWVsZHNbMV1dIG9yICcnKQogICAgICBtZW1iZXJzWyNtZW1iZXJzICsgMV0gPSB7IGlkID0gcmVjb3Jkc1tpXS5pZCBvciBpLCBuYW1lID0gbmFtZSB9CiAgICAgIGlmICNuYW1lID4gY2Fub25fbGVuIHRoZW4gY2Fub24sIGNhbm9uX2xlbiA9IG5hbWUsICNuYW1lIGVuZAogICAgZW5kCiAgICB0YWJsZS5zb3J0KG1lbWJlcnMsIGZ1bmN0aW9uKHgsIHkpIHJldHVybiB0b3N0cmluZyh4LmlkKSA8IHRvc3RyaW5nKHkuaWQpIGVuZCkKICAgIGNsdXN0ZXJzW2NpZF0gPSB7IGNsdXN0ZXIgPSBjaWQsIGlkcyA9IHt9LCBjYW5vbmljYWwgPSBjYW5vbiwgc2l6ZSA9ICNpZHMsIG1lbWJlcnMgPSBtZW1iZXJzIH0KICAgIGZvciBfLCBtIGluIGlwYWlycyhtZW1iZXJzKSBkbyBjbHVzdGVyc1tjaWRdLmlkc1sjY2x1c3RlcnNbY2lkXS5pZHMgKyAxXSA9IG0uaWQgZW5kCiAgZW5kCgogIGxvY2FsIG91dCA9IHsgY2x1c3RlcnMgPSBjbHVzdGVycywgcGFpcnMgPSBwYWlyX2NvdW50LCB1bmlxID0gdW5pcSwgcmVjb3JkcyA9IG4gfQogIHJldHVybiBqc29uX2VuY29kZShvdXQpCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDlhoXogZQgSlNPTiDnvJbnoIHlmajvvIjlj6rnvJbnoIHmnKwgbGliIOiHquS6p+e7k+aehO+8jOmbtuWklumDqOS+nei1lu+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGVzY19zdHIocykKICByZXR1cm4gJyInIC4uIHRvc3RyaW5nKHMpOmdzdWIoJ1slelwxLVwzMSJcXF0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnIicgdGhlbiByZXR1cm4gJ1xcIicKICAgIGVsc2VpZiBjID09ICdcXCcgdGhlbiByZXR1cm4gJ1xcXFwnCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nCiAgICBlbHNlaWYgYyA9PSAnXHInIHRoZW4gcmV0dXJuICdcXHInCiAgICBlbHNlaWYgYyA9PSAnXHQnIHRoZW4gcmV0dXJuICdcXHQnCiAgICBlbHNlIHJldHVybiBzdHJpbmcuZm9ybWF0KCdcXHUlMDR4JywgYzpieXRlKCkpIGVuZAogIGVuZCkgLi4gJyInCmVuZApqc29uX2VuY29kZSA9IGZ1bmN0aW9uKHYpCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICduaWwnIHRoZW4gcmV0dXJuICdudWxsJwogIGVsc2VpZiB0ID09ICdib29sZWFuJyB0aGVuIHJldHVybiB2IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJwogIGVsc2VpZiB0ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJWcnLCB2KQogIGVsc2VpZiB0ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuIGVzY19zdHIodikKICBlbHNlaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGxvY2FsIGlzX2FyciwgbiA9IHRydWUsICN2CiAgICBmb3IgayBpbiBwYWlycyh2KSBkbyBpZiB0eXBlKGspIH49ICdudW1iZXInIG9yIGsgPCAxIG9yIGsgPiBuIHRoZW4gaXNfYXJyID0gZmFsc2UgYnJlYWsgZW5kIGVuZAogICAgbG9jYWwgcGFydHMgPSB7fQogICAgaWYgaXNfYXJyIHRoZW4KICAgICAgZm9yIGkgPSAxLCBuIGRvIHBhcnRzW2ldID0ganNvbl9lbmNvZGUodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogICAgZWxzZQogICAgICBmb3IgaywgdmFsIGluIHBhaXJzKHYpIGRvCiAgICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSBqc29uX2VuY29kZShrKSAuLiAnOicgLi4ganNvbl9lbmNvZGUodmFsKQogICAgICBlbmQKICAgICAgcmV0dXJuICd7JyAuLiB0YWJsZS5jb25jYXQocGFydHMsICcsJykgLi4gJ30nCiAgICBlbmQKICBlbmQKICByZXR1cm4gJ251bGwnCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdtYXRjaCcKICBpZiBvcCA9PSAnYmxvY2snIHRoZW4KICAgIHJldHVybiBibG9ja19rZXkocC52IG9yICcnLCBwLm1vZGUsIHAubikKICBlbHNlaWYgb3AgPT0gJ21hdGNoJyB0aGVuCiAgICBsb2NhbCBBLCBCID0gbm9ybSh0b3N0cmluZyhwLmEgb3IgJycpKSwgbm9ybSh0b3N0cmluZyhwLmIgb3IgJycpKQogICAgbG9jYWwgbWV0cmljID0gcC5tZXRyaWMgb3IgJ2p3JwogICAgaWYgbWV0cmljID09ICdqYXJvJyB0aGVuIHJldHVybiBzdHJpbmcuZm9ybWF0KCclLjRmJywgamFybyhBLCBCKSkKICAgIGVsc2VpZiBtZXRyaWMgPT0gJ2xldicgdGhlbgogICAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS40ZicsIDEgLSBsZXYoQSwgQikgLyBtYXRoLm1heCgjQSwgI0IsIDEpKQogICAgZWxzZQogICAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS40ZicsIGp3KEEsIEIsIHAucCBvciAwLjI1KSkKICAgIGVuZAogIGVsc2VpZiBvcCA9PSAncmVzb2x2ZScgdGhlbgogICAgcmV0dXJuIHJlc29sdmUocCkKICBlbmQKICByZXR1cm4gJycKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogcHNpCi0tIEBjYXRlZ29yeTogcXVhbGl0eQotLSBAZGVzYzog5pWw5o2u5ryC56e75qOA5rWL77yI57qvIEx1Ye+8jOiHquWMheWQq++8ieKAlOKAlFBTSe+8iFBvcHVsYXRpb24gU3RhYmlsaXR5IEluZGV477yJLyBLTCDmlaPluqYgLyDljaHmlrnjgIIKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tICAgICAgIG9wPSdwc2kn77ya5Lik5Liq5YiG5biD5LmL6Ze055qEIFBTSe+8iOWNoOavlOWIhueuseeJiO+8ieOAgui+k+WFpSBwLmUgPSDmnJ/mnJso5Y+C6ICDKeWNoOavlOaVsOe7hOOAgXAuYSA9IOWunumZheWNoOavlOaVsOe7hO+8mwotLSAgICAgICAgICAgICAgICAg5oiWIHAucmF3X2UvcC5yYXdfYSA9IOWOn+Wni+aVsOWAvOaVsOe7hO+8iOiHquWKqOetieWuveWIhueuse+8jHAuYmlucyDpu5jorqQgMTDvvInvvJsKLS0gICAgICAgICAgICAgICAgIOaIliBwLnJhd19lL3AucmF3X2EgKyBwLmJyZWFrcyA9IOaYvuW8j+i+ueeVjOaVsOe7hO+8iOiHquWKqOWBmuWNoOavlOaNoueul++8ieOAggotLSAgICAgICDlhazlvI/vvJpQU0kgPSDOo19pIChBX2kg4oiSIEVfaSkgw5cgbG4oQV9pIC8gRV9pKe+8jOWNoOavlOS4uiAwIOaXtuaMiSAwLjAwMDEg5LiL6ZmQ5aSE55CG77yI5Lia55WM5oOv5L6L77yJ44CCCi0tICAgICAgIOWIpOivu++8iOmjjuaOpy/mqKHlnovnm5Hmjqfmg6/kvovvvInvvJpQU0kgPCAwLjEwIOaXoOa8guenu++8mzAuMTB+MC4yNSDkuK3nrYnmvILnp7vvvJs+IDAuMjUg5pi+6JGX5ryC56e777yI6ZyA6LCD5p+l77yJ44CCCi0tICAgICAgIG9wPSdrbCfvvJpLTCDmlaPluqYgRF9LTChB4oCWRSnvvIhuYXRz77yJ77yM5ZCM5YiG566x57qm5a6a44CCCi0tICAgICAgIG9wPSdjaGkyJ++8muWNoeaWuee7n+iuoemHjyDOoyAoQV9p4oiSRV9pKcKyL0Vfae+8iOmikeaVsOeJiOmcgCBwLmNvdW50c19h77yb5Y2g5q+U54mI6Ieq5Yqo5oyJIE4g5o2i566X77yMTj1wLm7vvInjgIIKLS0gICAgICAgb3A9J3JlcG9ydCfvvJrkuIDmrKHov5Tlm54ge3BzaSwga2wsIGNoaTIsIGJpbnMsIHZlcmRpY3QsIG59IEpTT04g5a2X56ym5Liy77yIU1FMIOS+pyBqc29uX2V4dHJhY3TvvInjgIIKLS0g6K+a5a6e6L6555WM77ya562J5a695YiG566x5a+56ZW/5bC+5YiG5biD5pWP5oSf4oCU4oCU6YeN5bC+5pWw5o2u6K+35pi+5byP5LygIHAuYnJlYWtz77yb5Y2g5q+U5pWw57uE5b+F6aG7562J6ZW/77ybUFNJIOaYrwotLSDml6DmlrnlkJHmjIfmoIfvvIjkuI3ljLrliIbosIHpq5josIHkvY7vvInvvIzphY3lkIjpgJDnrrHlt67lvILnnIvmlrnlkJHjgILnu5/orqHmmL7okZfmgKfor7fphY3lkIjljaHmlrnkuLTnlYzlgLzlnKggU1FMIOS+p+WIpOaWreOAggotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3BzaScpOwotLSAgIHBzaTogICAgICBTRUxFQ1QgbHVhaml0X3MoJ3BzaScsIHtyYXdfZTpbMSwyLDMsNCw1XSwgcmF3X2E6WzEsMiw0LDgsMTZdLCBvcDoncHNpJ30pOwotLSAgICAgICAgICAgICDihpIgJzAuMTE1NifvvIjmnJ/mnJvlnYfljIAgdnMg5a6e6ZmF5oyH5pWw77ya5Lit562J5ryC56e777yJCi0tICAgcmVwb3J0OiAgIFNFTEVDVCBsdWFqaXRfcygncHNpJywge3Jhd19lOlsuLi5dLCByYXdfYTpbLi4uXSwgb3A6J3JlcG9ydCd9KTsgIOKGkiAneyJwc2kiOjAuMTIsLi4ufScKCmxvY2FsIHBzaSA9IHt9CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOW3peWFtwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGFzX2FycmF5KHgpCiAgaWYgdHlwZSh4KSA9PSAnc3RyaW5nJyB0aGVuCiAgICBsb2NhbCBvdXQgPSB7fQogICAgZm9yIHBhcnQgaW4gKHggLi4gJywnKTpnbWF0Y2goJyguLSksJykgZG8KICAgICAgb3V0WyNvdXQgKyAxXSA9IHRvbnVtYmVyKHBhcnQpIG9yIDAKICAgIGVuZAogICAgcmV0dXJuIG91dAogIGVuZAogIHJldHVybiB4CmVuZAoKLS0g562J5a695YiG566x77ya5oqK5pWw5YC85pWw57uE5Y6L5oiQIGJpbnMg5Liq5qG255qE6K6h5pWwCmxvY2FsIGZ1bmN0aW9uIGhpc3RfZXF1YWwodmFsdWVzLCBiaW5zLCBsbywgaGkpCiAgbG9jYWwgbiA9ICN2YWx1ZXMKICBpZiBuID09IDAgdGhlbiByZXR1cm4ge30gZW5kCiAgbG8gPSBsbyBvciBtYXRoLmh1Z2UKICBoaSA9IGhpIG9yIC1tYXRoLmh1Z2UKICBmb3IgaSA9IDEsIG4gZG8KICAgIGxvY2FsIHYgPSB2YWx1ZXNbaV0KICAgIGlmIHYgPCBsbyB0aGVuIGxvID0gdiBlbmQKICAgIGlmIHYgPiBoaSB0aGVuIGhpID0gdiBlbmQKICBlbmQKICBpZiBoaSA8PSBsbyB0aGVuIGhpID0gbG8gKyAxIGVuZCAgLS0g5bi46YeP5YiX77ya5Y2V5qG25YWc5bqVCiAgbG9jYWwgdyA9IChoaSAtIGxvKSAvIGJpbnMKICBsb2NhbCBjb3VudHMgPSB7fQogIGZvciBpID0gMSwgYmlucyBkbyBjb3VudHNbaV0gPSAwIGVuZAogIGZvciBpID0gMSwgbiBkbwogICAgbG9jYWwgYiA9IG1hdGguZmxvb3IoKHZhbHVlc1tpXSAtIGxvKSAvIHcpICsgMQogICAgaWYgYiA8IDEgdGhlbiBiID0gMSBlbHNlaWYgYiA+IGJpbnMgdGhlbiBiID0gYmlucyBlbmQKICAgIGNvdW50c1tiXSA9IGNvdW50c1tiXSArIDEKICBlbmQKICByZXR1cm4gY291bnRzLCBsbywgaGkKZW5kCgotLSDmmL7lvI/ovrnnlYzliIbnrrHvvIhwLmJyZWFrcyA9IOWNh+W6j+i+ueeVjOaVsOe7hO+8jOWmgiB7LTEsMCwxLDEwfSDihpIgNCDkuKrmobbvvIkKbG9jYWwgZnVuY3Rpb24gaGlzdF9icmVha3ModmFsdWVzLCBicmVha3MpCiAgbG9jYWwgY291bnRzID0ge30KICBmb3IgaSA9IDEsICNicmVha3MgKyAxIGRvIGNvdW50c1tpXSA9IDAgZW5kCiAgZm9yIGkgPSAxLCAjdmFsdWVzIGRvCiAgICBsb2NhbCB2ID0gdmFsdWVzW2ldCiAgICBsb2NhbCBiID0gI2JyZWFrcyArIDEKICAgIGZvciBqID0gMSwgI2JyZWFrcyBkbwogICAgICBpZiB2IDw9IGJyZWFrc1tqXSB0aGVuIGIgPSBqIGJyZWFrIGVuZAogICAgZW5kCiAgICBjb3VudHNbYl0gPSBjb3VudHNbYl0gKyAxCiAgZW5kCiAgcmV0dXJuIGNvdW50cwplbmQKCi0tIOiuoeaVsCDihpIg5Y2g5q+U77yI5LiL6ZmQIDAuMDAwMSDpmLLpmaTpm7bvvIzkuJrnlYwgUFNJIOaDr+S+i++8iQpsb2NhbCBmdW5jdGlvbiB0b19zaGFyZShjb3VudHMsIG4pCiAgbG9jYWwgc2hhcmUgPSB7fQogIGZvciBpID0gMSwgI2NvdW50cyBkbwogICAgc2hhcmVbaV0gPSAoY291bnRzW2ldIG9yIDApIC8gbWF0aC5tYXgobiwgMSkKICAgIGlmIHNoYXJlW2ldIDwgMC4wMDAxIHRoZW4gc2hhcmVbaV0gPSAwLjAwMDEgZW5kCiAgZW5kCiAgcmV0dXJuIHNoYXJlCmVuZAoKbG9jYWwgZnVuY3Rpb24gZm10NCh4KSByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS40ZicsIHggKyAwKSBlbmQKbG9jYWwgZnVuY3Rpb24gcm91bmQ0KHgpIHJldHVybiBtYXRoLmZsb29yKHggKiAxMDAwMCArIDAuNSkgLyAxMDAwMCBlbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5qC45b+D77yaUFNJIC8gS0wgLyBDaGky77yI5Y2g5q+U5pWw57uE57qn77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcHNpX2NvcmUoc2hhcmVfZSwgc2hhcmVfYSkKICBsb2NhbCB0b3RhbCA9IDAKICBmb3IgaSA9IDEsICNzaGFyZV9lIGRvCiAgICBsb2NhbCBlLCBhID0gc2hhcmVfZVtpXSwgc2hhcmVfYVtpXQogICAgdG90YWwgPSB0b3RhbCArIChhIC0gZSkgKiBtYXRoLmxvZyhhIC8gZSkKICBlbmQKICByZXR1cm4gdG90YWwKZW5kCgpsb2NhbCBmdW5jdGlvbiBrbF9jb3JlKHNoYXJlX2UsIHNoYXJlX2EpCiAgbG9jYWwgdG90YWwgPSAwCiAgZm9yIGkgPSAxLCAjc2hhcmVfZSBkbwogICAgbG9jYWwgZSwgYSA9IHNoYXJlX2VbaV0sIHNoYXJlX2FbaV0KICAgIHRvdGFsID0gdG90YWwgKyBhICogbWF0aC5sb2coYSAvIGUpCiAgZW5kCiAgcmV0dXJuIHRvdGFsCmVuZAoKbG9jYWwgZnVuY3Rpb24gY2hpMl9jb3JlKGNvdW50c19lLCBjb3VudHNfYSwgbl9hKQogIGxvY2FsIHRvdGFsID0gMAogIGZvciBpID0gMSwgI2NvdW50c19lIGRvCiAgICBsb2NhbCBlID0gY291bnRzX2VbaV0gb3IgMAogICAgbG9jYWwgYSA9IGNvdW50c19hW2ldIG9yIDAKICAgIGlmIGUgPiAwIHRoZW4KICAgICAgdG90YWwgPSB0b3RhbCArIChhIC0gZSAqIG5fYSAvIChjb3VudHNfZS50b3RhbF9uIG9yICNjb3VudHNfZSkpIF4gMiAvIGUKICAgIGVuZAogIGVuZAogIHJldHVybiB0b3RhbAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5YiG5Y+RCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcnVuKHApCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIG9wID0gcC5vcCBvciAncHNpJwoKICAtLSDlvZLkuIDljJbovpPlhaXvvJrkvJjlhYjljp/lp4vmlbDlgLzmlbDnu4TvvIjoh6rliqjliIbnrrHvvInvvIzlhbbmrKHmmL7lvI/ljaDmr5TmlbDnu4QKICBsb2NhbCBzaGFyZV9lLCBzaGFyZV9hLCBjb3VudHNfZSwgY291bnRzX2EKICBpZiBwLnJhd19lIGFuZCBwLnJhd19hIHRoZW4KICAgIGxvY2FsIHZlLCB2YSA9IGFzX2FycmF5KHAucmF3X2UpLCBhc19hcnJheShwLnJhd19hKQogICAgaWYgcC5icmVha3MgYW5kIHR5cGUocC5icmVha3MpID09ICd0YWJsZScgdGhlbgogICAgICBjb3VudHNfZSwgY291bnRzX2EgPSBoaXN0X2JyZWFrcyh2ZSwgcC5icmVha3MpLCBoaXN0X2JyZWFrcyh2YSwgcC5icmVha3MpCiAgICBlbHNlCiAgICAgIGxvY2FsIGJpbnMgPSBwLmJpbnMgb3IgMTAKICAgICAgbG9jYWwgY2UsIGxvLCBoaSA9IGhpc3RfZXF1YWwodmUsIGJpbnMpCiAgICAgIGxvY2FsIGNhID0gaGlzdF9lcXVhbCh2YSwgYmlucywgbG8sIGhpKSAgLS0g5a+56b2Q5Yiw5ZCM5LiA6L6555WMCiAgICAgIGNvdW50c19lLCBjb3VudHNfYSA9IGNlLCBjYQogICAgZW5kCiAgICBsb2NhbCBuZSwgbmEgPSAjdmUsICN2YQogICAgY291bnRzX2UudG90YWxfbiwgY291bnRzX2EudG90YWxfbiA9IG5lLCBuYQogICAgc2hhcmVfZSwgc2hhcmVfYSA9IHRvX3NoYXJlKGNvdW50c19lLCBuZSksIHRvX3NoYXJlKGNvdW50c19hLCBuYSkKICBlbHNlCiAgICBzaGFyZV9lLCBzaGFyZV9hID0gYXNfYXJyYXkocC5lKSwgYXNfYXJyYXkocC5hKQogICAgaWYgI3NoYXJlX2Ugfj0gI3NoYXJlX2EgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJzaGFyZSBhcnJheXMgbGVuZ3RoIG1pc21hdGNoIn0nIGVuZAogICAgZm9yIGkgPSAxLCAjc2hhcmVfZSBkbwogICAgICBpZiBzaGFyZV9lW2ldIDwgMC4wMDAxIHRoZW4gc2hhcmVfZVtpXSA9IDAuMDAwMSBlbmQKICAgICAgaWYgc2hhcmVfYVtpXSA8IDAuMDAwMSB0aGVuIHNoYXJlX2FbaV0gPSAwLjAwMDEgZW5kCiAgICBlbmQKICBlbmQKCiAgaWYgb3AgPT0gJ3BzaScgdGhlbiByZXR1cm4gZm10NChwc2lfY29yZShzaGFyZV9lLCBzaGFyZV9hKSkgZW5kCiAgaWYgb3AgPT0gJ2tsJyB0aGVuIHJldHVybiBmbXQ0KGtsX2NvcmUoc2hhcmVfZSwgc2hhcmVfYSkpIGVuZAogIGlmIG9wID09ICdjaGkyJyB0aGVuCiAgICBpZiBub3QgY291bnRzX2UgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJjaGkyIG5lZWRzIHJhdyBhcnJheXMifScgZW5kCiAgICByZXR1cm4gZm10NChjaGkyX2NvcmUoY291bnRzX2UsIGNvdW50c19hLCBjb3VudHNfYS50b3RhbF9uIG9yIDEpKQogIGVuZAogIGlmIG9wID09ICdyZXBvcnQnIHRoZW4KICAgIGxvY2FsIHBzaXYgPSBwc2lfY29yZShzaGFyZV9lLCBzaGFyZV9hKQogICAgbG9jYWwga2x2ID0ga2xfY29yZShzaGFyZV9lLCBzaGFyZV9hKQogICAgbG9jYWwgY2hpMnYgPSBjb3VudHNfZSBhbmQgY2hpMl9jb3JlKGNvdW50c19lLCBjb3VudHNfYSwgY291bnRzX2EudG90YWxfbiBvciAxKSBvciBuaWwKICAgIGxvY2FsIHZlcmRpY3QKICAgIGlmIHBzaXYgPCAwLjEwIHRoZW4gdmVyZGljdCA9ICduby1kcmlmdCcKICAgIGVsc2VpZiBwc2l2IDw9IDAuMjUgdGhlbiB2ZXJkaWN0ID0gJ21vZGVyYXRlLWRyaWZ0JwogICAgZWxzZSB2ZXJkaWN0ID0gJ3NpZ25pZmljYW50LWRyaWZ0JyBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KAogICAgICAneyJwc2kiOiVzLCJrbCI6JXMsImNoaTIiOiVzLCJ2ZXJkaWN0IjoiJXMiLCJiaW5zIjolZH0nLAogICAgICBzdHJpbmcuZm9ybWF0KCclLjRmJywgcm91bmQ0KHBzaXYpKSwKICAgICAgc3RyaW5nLmZvcm1hdCgnJS40ZicsIHJvdW5kNChrbHYpKSwKICAgICAgY2hpMnYgYW5kIHN0cmluZy5mb3JtYXQoJyUuNGYnLCByb3VuZDQoY2hpMnYpKSBvciAnbnVsbCcsCiAgICAgIHZlcmRpY3QsICNzaGFyZV9lKQogIGVuZAogIHJldHVybiAnJwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiB0cmdtCi0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDlrZfnrKbkuInlhYPnu4Tnm7jkvLzluqbvvIjnp7vmpI0gUG9zdGdyZVNRTCBwZ190cmdt77yM6YCQ5L2N5a+55ouNIFBHIOWbnuW9kua1i+ivle+8ieOAggotLSAgICAgICBwZ190cmdtIOeahOebuOS8vOW6puS4jiBmdXp6eSDlupPnmoTnvJbovpHot53nprvml4/vvIhsZXYvamFyby9qd++8ieaYr+S4pOWll+S4jeWQjOeul+azle+8mgotLSAgICAgICBwZ190cmdtID0g5oqK5q+P5Liq5Y2V6K+N5bCP5YaZ5ZCO5oyJICIgIOWNleivjSAiIO+8iDIg5YmN57yA56m65qC8KzEg5ZCO57yA56m65qC877yJ5ruR56qX5Y+W5omA5pyJCi0tICAgICAgIDMg5a2X6IqC5LiJ5YWD57uE77yM5Lik5Liy5Y+W5LiJ5YWD57uE6ZuG5ZCI77yMc2ltaWxhcml0eSA9IHxB4oipQnwgLyB8QeKIqkJ877yISmFjY2FyZO+8ieOAggotLSAgICAgICBvcD0nc2ltJyAgIO+8mnNpbWlsYXJpdHkoYSxiKSDiiIhbMCwxXe+8jOi2iuWkp+i2iuWDj++8iFBHIGBzaW1pbGFyaXR5YCDlh73mlbAgLyBgJWAg5pON5L2c56ym55qE5qCH6YeP5qC45b+D77yJCi0tICAgICAgIG9wPSdkaXN0JyAg77yaMSAtIHNpbWlsYXJpdHnvvIzot53nprvvvIhQRyBgPC0+YCDmk43kvZznrKbvvIkKLS0gICAgICAgb3A9J3BjdCcgICDvvJpib29s77yMc2ltaWxhcml0eSA+PSAocC50aHJlc2hvbGQg6buY6K6kIDAuMynvvIznrYnku7cgUEcg55qEIGBhICUgYmAKLS0gICAgICAgb3A9J3dwY3QnICDvvJpib29s77yMc2ltaWxhcml0eSA+PSAocC50aHJlc2hvbGQg6buY6K6kIDAuNinvvIxgJWAg55qE5a2X6Z2i6ZiI5YC854mI77yIUEcgd29yZF9zaW1pbGFyaXR5IOaYr+WPpuS4gOWll+S9jee9rueul+azle+8jOingeS4i+i+ueeVjO+8iQotLSAgICAgICBvcD0ndHJnbScgIO+8mnNob3dfdHJnbShzKSDihpIg5o6S5bqP5Y676YeN5ZCO55qE5LiJ5YWD57uE6ZuG5ZCI77yM56uW57q/5YiG6ZqU77yIUEcgYHNob3dfdHJnbWDvvIkKLS0gICAgICAg5LiJ5YWD57uE5ZyoICoqVVRGLTgg5a2X6IqCKiog5LiK5YGa77yI5LiOIFBHIOS4gOiHtO+8muWkmuWtl+iKguWtl+espue7jyBjb21wYWN0X3RyaWdyYW0g5Y6L5oiQIDMg5a2X6IqC77yMCi0tICAgICAgIOS9hue6ryBBU0NJSSDlnLrmma/ljbPlrZfoioLkuInlhYPnu4TvvJtQRyDlm57lvZLmtYvor5XlhaggQVNDSUnvvIzpgJDkvY3kuIDoh7TvvInjgIIKLS0gICAgICAg5Y2V6K+NID0g5pyA5aSnIGFsbnVtIOi/nue7reaute+8iElTV09SRENIUu+8ie+8jOWwj+WGmeWMluWQjuWPguS4ju+8iEFTQ0lJIOWwj+WGme+8ieOAggotLSBAc291cmNlOiDnp7vmpI3oh6ogUG9zdGdyZVNRTCBjb250cmliL3BnX3RyZ20vdHJnbV9vcC5j77yITFBBRERJTkc9Mi9SUEFERElORz0xLCBDQUxDU01MPWNvdW50LyhsZW4xK2xlbjItY291bnQp77yJCi0tIEByZXF1aXJlczogbm9uZe+8iOe6ryBMdWHvvIzml6AgRkZJ77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0Ke+8m+eul+azlea6kOiHqiBQb3N0Z3JlU1FM77yIUG9zdGdyZVNRTCBMaWNlbnNl77yM5YW85a6577yJCi0tIEBtYXR1cml0eTogdGVzdGVk77yI5a+55ouNIFBHIOWbnuW9kua1i+ivlSA2MjArIOe7hCBzaW1pbGFyaXR5IOacn+acm+WAvO+8jOingSB0ZXN0X3RyZ20ubHVh77yJCi0tIOivmuWunui+ueeVjO+8muKRoCDmnKzlrp7njrDkuLrmoIfph4/nm7jkvLzluqbvvIwqKuS4jeWQqyBHSU4vR2lTVCDntKLlvJUqKu+8iER1Y2tEQiDml6Dlr7nlupTntKLlvJXmir3osaHvvIzliIbmnpDlnLrmma/pgJDooYznrpfljbPlj6/vvIwKLS0gICDnmb7kuIfooYzlhoXlj6/mjqXlj5fvvJvopoHntKLlvJXliqDpgJ/pnIAgQyDmianlsZXvvInjgILikaEgUEcg55qEIHdvcmRfc2ltaWxhcml0eSAvIHN0cmljdF93b3JkX3NpbWlsYXJpdHkKLS0gICDmmK/ln7rkuo7kuInlhYPnu4QqKuS9jee9rioq55qE5Y+m5LiA5aWX566X5rOV77yIY2FsY193b3JkX3NpbWlsYXJpdHnvvInvvIzmnKzlupPmnKrlrp7njrDigJTigJTpnIDopoHml7blj6bliqDjgIIKLS0gICDikaIg5aSa5a2X6IqC77yIQ0pL77yJ6LWwIFBHIOeahCBjb21wYWN0X3RyaWdyYW0g5Y6L57yp6Lev5b6E77yM5pys5bqT5oyJIFVURi04IOWtl+iKguS4ieWFg+e7hOi/keS8vO+8iEFTQ0lJIOmAkOS9jeS4gOiHtO+8jAotLSAgIENKSyDkuI4gUEcg5Y+v6IO95pyJIDEgdWxwIOe6p+W3ruW8gu+8jOaWh+aho+agh+azqO+8ieOAggotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3RyZ20nKTsKLS0gICBzaW06ICAgICAgU0VMRUNUIGx1YWppdF9zKCd0cmdtJywge2E6J3F3ZXJ0eXUwOTg4JywgYjoncXdlcnR5dTA5ODAnLCBvcDonc2ltJ30pOyAg4oaSICcwLjcxNDI4NicKLS0gICBwY3Q6ICAgICAgU0VMRUNUIGx1YWppdF9zKCd0cmdtJywge2E6J1dPV2EgJywgYjond293Jywgb3A6J3BjdCd9KTsgICAgICAgICAgICAgICDihpIgJ3RydWUnCi0tICAgdHJnbTogICAgIFNFTEVDVCBsdWFqaXRfcygndHJnbScsIHt2OidhIGIgYycsIG9wOid0cmdtJ30pOyAgICAgICAgICAgICAgICAgICAgICAgIOKGkiAnICBhfCAgYnwgIGN8IGEgfCBiIHwgYyAnCmxvY2FsIHRyZ20gPSB7fQoKbG9jYWwgZnVuY3Rpb24gaXNfd29yZGNoYXIoYikKICAtLSBBU0NJSSBhbG51be+8iFBHIElTV09SRENIUiDlr7kgQVNDSUkg562J5Lu377ybbXVsdGlieXRlIOS4iyBQRyDnlKggdF9pc2FsbnVtX3dpdGhfbGVu77yM6L+Z6YeM5oyJ5a2X6IqC77yJCiAgcmV0dXJuIChiID49IDB4MzAgYW5kIGIgPD0gMHgzOSkKICAgICAgb3IgKGIgPj0gMHg0MSBhbmQgYiA8PSAweDVBKQogICAgICBvciAoYiA+PSAweDYxIGFuZCBiIDw9IDB4N0EpCmVuZAoKbG9jYWwgZnVuY3Rpb24gbG93ZXJfYXNjaWkoYikKICBpZiBiID49IDB4NDEgYW5kIGIgPD0gMHg1QSB0aGVuIHJldHVybiBiICsgMzIgZW5kCiAgcmV0dXJuIGIKZW5kCgotLSDlj5bkuIDkuKrlrZfnrKbkuLLnmoTmiYDmnInljZXor43vvIjmnIDlpKcgYWxudW0g5q6177yJ77yM5q+P5Liq5bCP5YaZ5YyW77yM6L+U5ZueIHt3b3JkLCAuLi59CmxvY2FsIGZ1bmN0aW9uIHdvcmRzKHMpCiAgbG9jYWwgb3V0ID0ge30KICBsb2NhbCBpLCBuID0gMSwgI3MKICB3aGlsZSBpIDw9IG4gZG8KICAgIGxvY2FsIGIgPSBzOmJ5dGUoaSkKICAgIGlmIGlzX3dvcmRjaGFyKGIpIHRoZW4KICAgICAgbG9jYWwgaiA9IGkKICAgICAgbG9jYWwgYnVmID0ge30KICAgICAgd2hpbGUgaiA8PSBuIGRvCiAgICAgICAgbG9jYWwgYyA9IHM6Ynl0ZShqKQogICAgICAgIGlmIG5vdCBpc193b3JkY2hhcihjKSB0aGVuIGJyZWFrIGVuZAogICAgICAgIGJ1ZlsjYnVmICsgMV0gPSBzOmJ5dGUoaikKICAgICAgICBqID0gaiArIDEKICAgICAgZW5kCiAgICAgIC0tIGxvd2VyY2FzZQogICAgICBmb3IgaywgY2IgaW4gaXBhaXJzKGJ1ZikgZG8gYnVmW2tdID0gbG93ZXJfYXNjaWkoY2IpIGVuZAogICAgICBvdXRbI291dCArIDFdID0gc3RyaW5nLmNoYXIodW5wYWNrKGJ1ZikpCiAgICAgIGkgPSBqCiAgICBlbHNlCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCi0tIOWNleS4quWNleivjSDihpIg5LiJ5YWD57uE6ZuG5ZCI77yIIiAgdyAiIOeahCAzIOWtl+iKgua7keeql++8jFNldDogdHJnbS0+dHJ1Ze+8iQpsb2NhbCBmdW5jdGlvbiB3b3JkX3RyaWdyYW1zKHcsIHNldCkKICBsb2NhbCBwID0gJyAgJyAuLiB3IC4uICcgJyAgIC0tIDIg5YmN57yA56m65qC8ICsgdyArIDEg5ZCO57yA56m65qC8CiAgbG9jYWwgbGVuID0gI3AKICBpZiBsZW4gPCAzIHRoZW4gcmV0dXJuIGVuZAogIGZvciBpID0gMSwgbGVuIC0gMiBkbwogICAgbG9jYWwgdCA9IHA6c3ViKGksIGkgKyAyKQogICAgaWYgbm90IHNldFt0XSB0aGVuIHNldFt0XSA9IHRydWUgZW5kCiAgZW5kCmVuZAoKLS0g5a2X56ym5LiyIOKGkiDkuInlhYPnu4Tpm4blkIjvvIhTZXTvvIkKbG9jYWwgZnVuY3Rpb24gZ2VuZXJhdGVfc2V0KHMpCiAgbG9jYWwgc2V0ID0ge30KICBmb3IgXywgdyBpbiBpcGFpcnMod29yZHMocykpIGRvCiAgICB3b3JkX3RyaWdyYW1zKHcsIHNldCkKICBlbmQKICByZXR1cm4gc2V0CmVuZAoKLS0g5Lik5LiqIFNldCDmsYIgfEHiiKlCfCDkuI4gfEHiiKpCfApsb2NhbCBmdW5jdGlvbiBpbnRlcl91bmlvbihBLCBCKQogIGxvY2FsIGNvdW50LCBsZW5BLCBsZW5CID0gMCwgMCwgMAogIGZvciBfIGluIHBhaXJzKEEpIGRvIGxlbkEgPSBsZW5BICsgMSBlbmQKICBmb3IgXyBpbiBwYWlycyhCKSBkbyBsZW5CID0gbGVuQiArIDEgZW5kCiAgaWYgbGVuQSA9PSAwIG9yIGxlbkIgPT0gMCB0aGVuIHJldHVybiAwLCAwIGVuZAogIGZvciB0IGluIHBhaXJzKEEpIGRvCiAgICBpZiBCW3RdIHRoZW4gY291bnQgPSBjb3VudCArIDEgZW5kCiAgZW5kCiAgbG9jYWwgdW5pb24gPSBsZW5BICsgbGVuQiAtIGNvdW50CiAgcmV0dXJuIGNvdW50LCB1bmlvbgplbmQKCmxvY2FsIGZ1bmN0aW9uIHNpbWlsYXJpdHkoYSwgYikKICBsb2NhbCBBLCBCID0gZ2VuZXJhdGVfc2V0KHRvc3RyaW5nKGEpKSwgZ2VuZXJhdGVfc2V0KHRvc3RyaW5nKGIpKQogIGxvY2FsIGNvdW50LCB1bmlvbiA9IGludGVyX3VuaW9uKEEsIEIpCiAgaWYgdW5pb24gPT0gMCB0aGVuIHJldHVybiAwLjAgZW5kCiAgcmV0dXJuIGNvdW50IC8gdW5pb24KZW5kCgotLSDmjpLluo/ljrvph43lkI7mjInlrZflhbjluo/ov5Tlm57kuInlhYPnu4TliJfooajvvIhQRyBzaG93X3RyZ20g5o6S5bqP5Li65a2X6IqC5bqP77yJCmxvY2FsIGZ1bmN0aW9uIHNob3dfdHJnbShzKQogIGxvY2FsIHNldCA9IGdlbmVyYXRlX3NldCh0b3N0cmluZyhzKSkKICBsb2NhbCBhcnIgPSB7fQogIGZvciB0IGluIHBhaXJzKHNldCkgZG8gYXJyWyNhcnIgKyAxXSA9IHQgZW5kCiAgdGFibGUuc29ydChhcnIpICAgLS0g5a2X6IqC5bqP77yITHVhIHN0cmluZyDmr5TovoMgPSDlrZfoioLluo/vvIkKICByZXR1cm4gdGFibGUuY29uY2F0KGFyciwgJ3wnKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGZtdDYoeCkKICAtLSBQRyBmbG9hdDQgKyBleHRyYV9mbG9hdF9kaWdpdHM9MCDmmL7npLrnuqYgNiDkvY3lsI/mlbAKICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS42ZicsIHggKyAwKQplbmQKCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbiBwID0geyB2ID0gcCB9IGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBhID0gcC5hIG9yIHAudiBvciAnJwogIGxvY2FsIGIgPSBwLmIgb3IgJycKICBsb2NhbCBvcCA9IHAub3Agb3IgJ3NpbScKICBpZiBvcCA9PSAnc2ltJyB0aGVuCiAgICByZXR1cm4gZm10NihzaW1pbGFyaXR5KGEsIGIpKQogIGVsc2VpZiBvcCA9PSAnZGlzdCcgdGhlbgogICAgcmV0dXJuIGZtdDYoMSAtIHNpbWlsYXJpdHkoYSwgYikpCiAgZWxzZWlmIG9wID09ICdwY3QnIHRoZW4KICAgIGxvY2FsIHRoID0gKHAudGhyZXNob2xkIG9yIHAudGgpIG9yIDAuMwogICAgcmV0dXJuIHRvc3RyaW5nKHNpbWlsYXJpdHkoYSwgYikgPj0gdGgpCiAgZWxzZWlmIG9wID09ICd3cGN0JyB0aGVuCiAgICBsb2NhbCB0aCA9IChwLnRocmVzaG9sZCBvciBwLnRoKSBvciAwLjYKICAgIHJldHVybiB0b3N0cmluZyhzaW1pbGFyaXR5KGEsIGIpID49IHRoKQogIGVsc2VpZiBvcCA9PSAndHJnbScgdGhlbgogICAgcmV0dXJuIHNob3dfdHJnbShhKQogIGVuZAogIHJldHVybiAnJwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBsdHJlZQotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzog5bGC57qn6Lev5b6E77yI56e75qSNIFBvc3RncmVTUUwgbHRyZWUg5omp5bGV77yM6YCQ5L2N5a+55ouNIFBHIOWbnuW9kua1i+ivle+8ieOAgmx0cmVlIOaYr+OAjOeCueWIhuWxgue6p+i3r+W+hOOAjQotLSAgICAgICDnsbvlnovvvIjlpoIgJ1RvcC5DaGlsZDEuQ2hpbGQyJ++8ie+8jOeUqOS6juWIhuexu+agkS/nm67lvZXmoJEv5YiG57G757yW56CB55qE5YyF5ZCr44CB5YWs5YWx56WW5YWI44CB5a2Q6Lev5b6E6L+Q566X44CCCi0tICAgICAgIER1Y2tEQiDml6Dljp/nlJ8gbHRyZWUg57G75Z6L77yM5pys5bqT5oqK6Lev5b6E5b2T5a2X56ym5Liy44CB5oyJICcuJyDliIfliIblsYLnuqfvvIzpgJDlh73mlbDnp7vmpI0gUEcg6K+t5LmJ77yaCi0tICAgICAgIG9wPSdubGV2ZWwnICAg77yacC5wYXRoIOKGkiDlsYLnuqfmlbDvvIhQRyBgbmxldmVsYO+8ie+8jCcxLjIuMy40J+KGkjQKLS0gICAgICAgb3A9J3RleHQnICAgICDvvJpwLnBhdGgg4oaSIOWOn+agt+Wtl+espuS4su+8iFBHIGBsdHJlZTJ0ZXh0YO+8jOagoemqjOmdnuepuuWxgue6p++8iQotLSAgICAgICBvcD0nc3VibHRyZWUnIO+8mnAucGF0aCArIHAuc3RhcnQgKyBwLnN0b3Ag4oaSIOWPliBbc3RhcnQsc3RvcCkg5bGC57qn77yIMCDotbfvvIxzdG9wIOS4jeWQq++8ie+8iFBHIGBzdWJsdHJlZWDvvIkKLS0gICAgICAgICAgICAgICAgICAgICAgICdUb3AuQ2hpbGQxLkNoaWxkMicgc3RhcnQ9MSBzdG9wPTIg4oaSICdDaGlsZDEnCi0tICAgICAgIG9wPSdzdWJwYXRoJyAg77yacC5wYXRoICsgcC5zdGFydCArIChwLmxlbiDlj6/pgIkpIOKGkiBQRyBgc3VicGF0aGDvvIhzdGFydC9sZW4g5Y+v5Li66LSf77yMbGVuPTAg6KGo5Yiw5pyr5bC+77yJCi0tICAgICAgICAgICAgICAgICAgICAgICBzdWJwYXRoKHgsMCnihpLlhajkuLLvvJtzdWJwYXRoKHgsMSnihpLku47nrKwgMSDnuqfvvJtzdWJwYXRoKHgsLTEsMSnihpLmnKvnuqcKLS0gICAgICAgb3A9J2xjYScgICAgICDvvJpwLnBhdGhz77yI5pWw57uE77yJ4oaSIOacgOmVv+WFrOWFseelluWFiO+8iFBHIGBsY2Fg77yJ77yM5peg5YWs5YWx56WW5YWIL+WQq+epuui3r+W+hCDihpIgTlVMTO+8iOi/lOWbnuepuuS4su+8iQotLSAgICAgICAgICAgICAgICAgICAgICAgbGNhKCcxLjIuMycsJzEuMi4zLjQuNS42JynihpInMS4yJ++8m2xjYSgnMScp4oaSTlVMTAotLSAgICAgICBvcD0naXNwYXJlbnQnIO+8mnAucGFyZW50ICsgcC5jaGlsZCDihpIgcGFyZW50IOaYr+WQpiBjaGlsZCDnmoTliY3nvIDlsYLnuqfvvIhQRyBgaXNwYXJlbnRgL2A8QGDvvIkKLS0gICAgICAgICAgICAgICAgICAgICAgICdUb3AnIGlzcGFyZW50ICdUb3AuQ2hpbGQxJ+KGknRydWUKLS0gICAgICAgb3A9J2Rlc2MnICAgICDvvJpjaGlsZCDmmK/lkKbkuLogcGFyZW50IOeahOWtkO+8iOWQq+iHqui6q++8ieKAlOKAlOetieS7tyBpc3BhcmVudChwYXJlbnQsY2hpbGQp77yMUEcgYCFAYAotLSAgICAgICBvcD0nY29udGFpbnMnIO+8mnAuYSArIHAuYiDihpIgYiDmmK/lkKbkvZzkuLrov57nu63lrZDot6/lvoTlh7rnjrDlnKggYSDlhoXvvIhQRyBgQGAvYGx0cmVlX2luZGV4YD49MO+8iQotLSAgICAgICAgICAgICAgICAgICAgICAgJ2EuYi5jLmQnIGNvbnRhaW5zICdiLmMn4oaSdHJ1ZQotLSAgICAgICBvcD0nY29uY2F0JyAgIO+8mnAuYSB8fCBwLmIg5bGC57qn5ou85o6l77yIUEcgYHx8YO+8iQotLSAgICAgICBvcD0nY21wJyAgICAgIO+8mnAuYSArIHAuYiDihpIg5bGC57qn5a2X5YW45bqP5q+U6L6DIC0xLzAvMe+8iFBHIGA8PT5g77yM5L6bIFNRTCDnianljJbplK7mjpLluo/vvIkKLS0gICAgICAg5bGC57qn5LiK6ZmQIDY1NTM177yI5a+56b2QIFBHIExUUkVFX01BWF9MRVZFTFPvvInjgIIKLS0gQHNvdXJjZTog56e75qSN6IeqIFBvc3RncmVTUUwgY29udHJpYi9sdHJlZS9sdHJlZV9vcC5j77yIbGNhX2lubmVyL2lubmVyX3N1Ymx0cmVlL2lubmVyX2lzcGFyZW5077yJCi0tIEByZXF1aXJlczogbm9uZe+8iOe6ryBMdWHvvIzml6AgRkZJ77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0Ke+8m+eul+azlea6kOiHqiBQb3N0Z3JlU1FM77yIUG9zdGdyZVNRTCBMaWNlbnNl77yM5YW85a6577yJCi0tIEBtYXR1cml0eTogdGVzdGVk77yI5a+55ouNIFBHIGx0cmVlLm91dCDlm57lvZLmnJ/mnJvlgLzvvIzop4EgdGVzdF9sdHJlZS5sdWHvvIkKLS0g6K+a5a6e6L6555WM77ya4pGgIGx0cmVlIOeahCBHaVNUIOe0ouW8le+8iGA8QGAvYEBgIOi1sOe0ouW8le+8ieaXoOWvueW6lOKAlOKAlER1Y2tEQiDml6Dor6XntKLlvJXmir3osaHvvIzpgJDooYznrpfjgIIKLS0gICDikaEgbGNhIOeahOOAjOWFrOWFseelluWFiOmVv+W6piDiiaQg6aaW6Lev5b6E5bGC5pWwLTHjgI3or63kuYnkuKXmoLznhafmkKzvvIjpppbot6/lvoToh6rouqvkuI3nrpfnpZblhYjvvInjgIIKLS0KLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQsIHNjYWxhciBtb2RlKToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSdsdHJlZScpOwotLSAgIG5sZXZlbDogICBTRUxFQ1QgbHVhaml0X2koJ2x0cmVlJywge3BhdGg6JzEuMi4zLjQnLCBvcDonbmxldmVsJ30pOyAgICAgICAgICDihpIgNAotLSAgIHN1YnBhdGg6ICBTRUxFQ1QgbHVhaml0X3MoJ2x0cmVlJywge3BhdGg6J1RvcC5DaGlsZDEuQ2hpbGQyJywgc3RhcnQ6MSwgb3A6J3N1YnBhdGgnfSk7IOKGkiAnQ2hpbGQxLkNoaWxkMicKLS0gICBsY2E6ICAgICAgU0VMRUNUIGx1YWppdF9zKCdsdHJlZScsIHtwYXRoczpbJzEuMi4zJywnMS4yLjMuNC41LjYnXSwgb3A6J2xjYSd9KTsgICAgICAgICDihpIgJzEuMicKLS0gICBpc3BhcmVudDogU0VMRUNUIGx1YWppdF9iKCdsdHJlZScsIHtwYXJlbnQ6J1RvcCcsIGNoaWxkOidUb3AuQ2hpbGQxJywgb3A6J2lzcGFyZW50J30pOyDihpIgdHJ1ZQoKbG9jYWwgTUFYX0xFVkVMUyA9IDY1NTM1CgotLSDliIfliIblsYLnuqfvvJrmjIkgJy4nIOWIhu+8jOS/neeVmeepuuWxgue6p++8iFBHIOWFgeiuuOepuiBsYWJlbO+8iQpsb2NhbCBmdW5jdGlvbiBzcGxpdF9sZXZlbHMocGF0aCkKICBsb2NhbCBvdXQgPSB7fQogIGlmIHBhdGggPT0gbmlsIHRoZW4gcmV0dXJuIG91dCBlbmQKICBpZiBwYXRoID09ICcnIHRoZW4gcmV0dXJuIG91dCBlbmQKICBmb3IgcGFydCBpbiAocGF0aCAuLiAnLicpOmdtYXRjaCgnKC4tKSUuJykgZG8KICAgIG91dFsjb3V0ICsgMV0gPSBwYXJ0CiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGpvaW5fbGV2ZWxzKGxldmVscykKICByZXR1cm4gdGFibGUuY29uY2F0KGxldmVscywgJy4nKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGNoZWNrX2xldmVscyhuKQogIGlmIG4gPiBNQVhfTEVWRUxTIHRoZW4KICAgIGVycm9yKCgnbnVtYmVyIG9mIGx0cmVlIGxldmVscyAoJWQpIGV4Y2VlZHMgdGhlIG1heGltdW0gYWxsb3dlZCAoJWQpJyk6Zm9ybWF0KG4sIE1BWF9MRVZFTFMpKQogIGVuZAplbmQKCmxvY2FsIGZ1bmN0aW9uIG5sZXZlbChwYXRoKQogIHJldHVybiAjc3BsaXRfbGV2ZWxzKHBhdGgpCmVuZAoKLS0gaW5uZXJfc3VibHRyZWUocGF0aCwgc3RhcnQsIGVuZCnvvJowIOi1t++8jFtzdGFydCxlbmQp77yMZW5kIOWQq+WIsCBudW1sZXZlbCDkuLrmraIKbG9jYWwgZnVuY3Rpb24gaW5uZXJfc3VibHRyZWUocGF0aCwgc3RhcnRwb3MsIGVuZHBvcykKICBsb2NhbCBsZXZlbHMgPSBzcGxpdF9sZXZlbHMocGF0aCkKICBsb2NhbCBubCA9ICNsZXZlbHMKICBpZiBzdGFydHBvcyA8IDAgb3IgZW5kcG9zIDwgMCBvciBzdGFydHBvcyA+PSBubCBvciBzdGFydHBvcyA+IGVuZHBvcyB0aGVuCiAgICBlcnJvcignaW52YWxpZCBwb3NpdGlvbnMnKQogIGVuZAogIGlmIGVuZHBvcyA+IG5sIHRoZW4gZW5kcG9zID0gbmwgZW5kCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaSA9IHN0YXJ0cG9zLCBlbmRwb3MgLSAxIGRvIG91dFsjb3V0ICsgMV0gPSBsZXZlbHNbaSArIDFdIGVuZAogIGNoZWNrX2xldmVscygjb3V0KQogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiBsY2FfaW5uZXIoYXJyKQogIGxvY2FsIGxlbiA9ICNhcnIKICBpZiBsZW4gPD0gMCB0aGVuIHJldHVybiBuaWwgZW5kCiAgbG9jYWwgZmlyc3QgPSBzcGxpdF9sZXZlbHMoYXJyWzFdKQogIGlmICNmaXJzdCA9PSAwIHRoZW4gcmV0dXJuIG5pbCBlbmQKICBsb2NhbCBudW0gPSAjZmlyc3QgLSAxICAgLS0g5YWs5YWx56WW5YWI6ZW/5bqmIOKJpCDpppbot6/lvoTlsYLmlbAgLSAxCiAgZm9yIGlkeCA9IDIsIGxlbiBkbwogICAgbG9jYWwgcCA9IHNwbGl0X2xldmVscyhhcnJbaWR4XSkKICAgIGlmICNwID09IDAgdGhlbgogICAgICByZXR1cm4gbmlsCiAgICBlbHNlaWYgI3AgPT0gMSB0aGVuCiAgICAgIG51bSA9IDAKICAgIGVsc2UKICAgICAgbG9jYWwgdG1wID0gbWF0aC5taW4obnVtLCAjcCAtIDEpCiAgICAgIGxvY2FsIG4gPSAwCiAgICAgIGZvciBpID0gMCwgdG1wIC0gMSBkbwogICAgICAgIGlmIGZpcnN0W2kgKyAxXSA9PSBwW2kgKyAxXSB0aGVuCiAgICAgICAgICBuID0gaSArIDEKICAgICAgICBlbHNlCiAgICAgICAgICBicmVhawogICAgICAgIGVuZAogICAgICBlbmQKICAgICAgbnVtID0gbgogICAgZW5kCiAgZW5kCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaSA9IDEsIG51bSBkbyBvdXRbaV0gPSBmaXJzdFtpXSBlbmQKICByZXR1cm4gb3V0CmVuZAoKbG9jYWwgZnVuY3Rpb24gaXNwYXJlbnQocGFyZW50LCBjaGlsZCkKICBsb2NhbCBwbCA9IHNwbGl0X2xldmVscyhwYXJlbnQpCiAgbG9jYWwgY2wgPSBzcGxpdF9sZXZlbHMoY2hpbGQpCiAgaWYgI3BsID4gI2NsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGZvciBpID0gMSwgI3BsIGRvCiAgICBpZiBwbFtpXSB+PSBjbFtpXSB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCi0tIGx0cmVlX2luZGV4KGEsIGIsIHN0YXJ0Ke+8mmIg5piv5ZCm5L2c5Li66L+e57ut5a2Q6Lev5b6E5Ye6546w5ZyoIGEg5YaF77yI5LuOIHN0YXJ0IOe6p++8jDAg6LW377yJCmxvY2FsIGZ1bmN0aW9uIGx0cmVlX2luZGV4KGEsIGIsIHN0YXJ0KQogIGxvY2FsIGFsID0gc3BsaXRfbGV2ZWxzKGEpCiAgbG9jYWwgYmwgPSBzcGxpdF9sZXZlbHMoYikKICBpZiBzdGFydCA8IDAgdGhlbgogICAgaWYgLXN0YXJ0ID49ICNhbCB0aGVuIHN0YXJ0ID0gMCBlbHNlIHN0YXJ0ID0gI2FsICsgc3RhcnQgZW5kCiAgZW5kCiAgaWYgI2FsIC0gc3RhcnQgPCAjYmwgb3IgI2FsID09IDAgb3IgI2JsID09IDAgdGhlbiByZXR1cm4gLTEgZW5kCiAgZm9yIGkgPSBzdGFydCwgI2FsIC0gI2JsIGRvCiAgICBsb2NhbCBvayA9IHRydWUKICAgIGZvciBqID0gMSwgI2JsIGRvCiAgICAgIGlmIGFsW2kgKyBqXSB+PSBibFtqXSB0aGVuIG9rID0gZmFsc2UgYnJlYWsgZW5kCiAgICBlbmQKICAgIGlmIG9rIHRoZW4gcmV0dXJuIGkgZW5kCiAgZW5kCiAgcmV0dXJuIC0xCmVuZAoKLS0g5bGC57qn5a2X5YW45bqP5q+U6L6D77yIUEcgbHRyZWVfY29tcGFyZe+8mumAkOe6pyBtZW1jbXDvvIzplb/luqbkuI3lkIzlj5bnn63plb/lt67vvIzmnIDlkI7mr5TlsYLmlbDvvIkKbG9jYWwgZnVuY3Rpb24gY21wKGEsIGIpCiAgbG9jYWwgYWwsIGJsID0gc3BsaXRfbGV2ZWxzKGEpLCBzcGxpdF9sZXZlbHMoYikKICBsb2NhbCBhbiwgYm4gPSAjYWwsICNibAogIGxvY2FsIG4gPSBtYXRoLm1pbihhbiwgYm4pCiAgZm9yIGkgPSAxLCBuIGRvCiAgICBpZiBhbFtpXSB+PSBibFtpXSB0aGVuCiAgICAgIGlmIGFsW2ldIDwgYmxbaV0gdGhlbiByZXR1cm4gLTEgZW5kCiAgICAgIHJldHVybiAxCiAgICBlbmQKICAgIC0tIOWQjOWJjee8gOS9humVv+W6puS4jeWQjO+8iOS4gOS4qiBsYWJlbCDmmK/lj6bkuIDkuKrnmoTnnJ/liY3nvIDvvIkKICAgIGlmICNhbFtpXSB+PSAjYmxbaV0gdGhlbgogICAgICBpZiAjYWxbaV0gPCAjYmxbaV0gdGhlbiByZXR1cm4gLTEgZW5kCiAgICAgIHJldHVybiAxCiAgICBlbmQKICBlbmQKICBpZiBhbiB+PSBibiB0aGVuCiAgICBpZiBhbiA8IGJuIHRoZW4gcmV0dXJuIC0xIGVuZAogICAgcmV0dXJuIDEKICBlbmQKICByZXR1cm4gMAplbmQKCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbiBwID0geyBwYXRoID0gcCB9IGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBvcCA9IHAub3Agb3IgJ3RleHQnCiAgaWYgb3AgPT0gJ25sZXZlbCcgdGhlbgogICAgcmV0dXJuIG5sZXZlbChwLnBhdGgpCiAgZWxzZWlmIG9wID09ICd0ZXh0JyB0aGVuCiAgICByZXR1cm4gdG9zdHJpbmcocC5wYXRoIG9yICcnKQogIGVsc2VpZiBvcCA9PSAnc3VibHRyZWUnIHRoZW4KICAgIGxvY2FsIGxzID0gaW5uZXJfc3VibHRyZWUodG9zdHJpbmcocC5wYXRoKSwgcC5zdGFydCwgcC5zdG9wKQogICAgcmV0dXJuIGpvaW5fbGV2ZWxzKGxzKQogIGVsc2VpZiBvcCA9PSAnc3VicGF0aCcgdGhlbgogICAgbG9jYWwgcGF0aCA9IHRvc3RyaW5nKHAucGF0aCkKICAgIGxvY2FsIGxldmVscyA9IHNwbGl0X2xldmVscyhwYXRoKQogICAgbG9jYWwgbmwgPSAjbGV2ZWxzCiAgICBsb2NhbCBzdGFydCA9IHAuc3RhcnQKICAgIGxvY2FsIGhhc19sZW4gPSAocC5sZW4gfj0gbmlsKQogICAgbG9jYWwgbGVuID0gaGFzX2xlbiBhbmQgcC5sZW4gb3IgMAogICAgaWYgc3RhcnQgPCAwIHRoZW4gc3RhcnQgPSBubCArIHN0YXJ0IGVuZCAgIC0tIFBHIOWFiOW9kuS4gOWMliBzdGFydAogICAgbG9jYWwgZW5kcAogICAgaWYgbGVuIDwgMCB0aGVuCiAgICAgIGVuZHAgPSBubCArIGxlbgogICAgZWxzZWlmIGxlbiA9PSAwIHRoZW4KICAgICAgLS0gUEc6IGxlbj09MCDml7bvvIwzLWFyZyDihpIgZW5kPXN0YXJ077yI56m677yJ77ybMi1hcmfvvIjmnKrnu5kgbGVu77yJ4oaSIGVuZD1NQVjvvIjliLDmnKvlsL7vvIkKICAgICAgZW5kcCA9IGhhc19sZW4gYW5kIHN0YXJ0IG9yIE1BWF9MRVZFTFMKICAgIGVsc2UKICAgICAgZW5kcCA9IHN0YXJ0ICsgbGVuCiAgICBlbmQKICAgIGlmIGVuZHAgPiBubCB0aGVuIGVuZHAgPSBubCBlbmQKICAgIGlmIHN0YXJ0IDwgMCBvciBlbmRwIDwgMCBvciBzdGFydCA+PSBubCBvciBzdGFydCA+IGVuZHAgdGhlbgogICAgICByZXR1cm4gJ0VSUjogaW52YWxpZCBwb3NpdGlvbnMnCiAgICBlbmQKICAgIGxvY2FsIGxzID0gaW5uZXJfc3VibHRyZWUocGF0aCwgc3RhcnQsIGVuZHApCiAgICByZXR1cm4gam9pbl9sZXZlbHMobHMpCiAgZWxzZWlmIG9wID09ICdsY2EnIHRoZW4KICAgIGxvY2FsIHBhdGhzID0gcC5wYXRocwogICAgaWYgdHlwZShwYXRocykgPT0gJ3N0cmluZycgdGhlbiBwYXRocyA9IHsgcGF0aHMgfSBlbmQKICAgIGlmIHR5cGUocGF0aHMpIH49ICd0YWJsZScgb3IgI3BhdGhzID09IDAgdGhlbiByZXR1cm4gJycgZW5kCiAgICBsb2NhbCByID0gbGNhX2lubmVyKHBhdGhzKQogICAgaWYgciA9PSBuaWwgdGhlbiByZXR1cm4gJycgZW5kICAgLS0gUEcg6L+U5ZueIE5VTEwKICAgIHJldHVybiBqb2luX2xldmVscyhyKQogIGVsc2VpZiBvcCA9PSAnaXNwYXJlbnQnIHRoZW4KICAgIHJldHVybiB0b3N0cmluZyhpc3BhcmVudCh0b3N0cmluZyhwLnBhcmVudCksIHRvc3RyaW5nKHAuY2hpbGQpKSkKICBlbHNlaWYgb3AgPT0gJ2Rlc2MnIHRoZW4KICAgIHJldHVybiB0b3N0cmluZyhpc3BhcmVudCh0b3N0cmluZyhwLnBhcmVudCksIHRvc3RyaW5nKHAuY2hpbGQpKSkKICBlbHNlaWYgb3AgPT0gJ2NvbnRhaW5zJyB0aGVuCiAgICByZXR1cm4gdG9zdHJpbmcobHRyZWVfaW5kZXgodG9zdHJpbmcocC5hKSwgdG9zdHJpbmcocC5iKSwgcC5zdGFydCBvciAwKSA+PSAwKQogIGVsc2VpZiBvcCA9PSAnY29uY2F0JyB0aGVuCiAgICBsb2NhbCBhbCwgYmwgPSBzcGxpdF9sZXZlbHModG9zdHJpbmcocC5hKSksIHNwbGl0X2xldmVscyh0b3N0cmluZyhwLmIpKQogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBpID0gMSwgI2FsIGRvIG91dFtpXSA9IGFsW2ldIGVuZAogICAgZm9yIGkgPSAxLCAjYmwgZG8gb3V0WyNvdXQgKyAxXSA9IGJsW2ldIGVuZAogICAgY2hlY2tfbGV2ZWxzKCNvdXQpCiAgICByZXR1cm4gam9pbl9sZXZlbHMob3V0KQogIGVsc2VpZiBvcCA9PSAnY21wJyB0aGVuCiAgICByZXR1cm4gdG9zdHJpbmcoY21wKHRvc3RyaW5nKHAuYSksIHRvc3RyaW5nKHAuYikpKQogIGVuZAogIHJldHVybiAnJwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBmdXp6eQotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzog5a2X56ym5Liy55u45Ly85bqmL+i3neemu+eul+azle+8iOe6ryBMdWHvvIzoh6rljIXlkKvvvIxVVEYtOCDmhJ/nn6XvvInjgIIKLS0gICAgICAgb3A9J2xldifvvJrnvJbovpHot53nprvvvIhMZXZlbnNodGVpbu+8jOS7o+eggeeCuee6p++8ie+8mwotLSAgICAgICBvcD0nbm9ybWxldifvvJrlvZLkuIDljJbnvJbovpHot53nprsgPSBsZXYgLyBtYXgobGVuKe+8jOKIiFswLDFd77yM6LaK5bCP6LaK5YOP77ybCi0tICAgICAgIG9wPSdqYXJvJ++8mkphcm8g55u45Ly85bqmIOKIiFswLDFd77yI5a+555+t5LiyL+Wnk+WQjeWPi+Wlve+8ie+8mwotLSAgICAgICBvcD0nancn77yaSmFyby1XaW5rbGVyIOebuOS8vOW6piDiiIhbMCwxXe+8iOWJjee8gOWKoOadg++8jOm7mOiupCBwPTAuMjXvvIxgcC5wYCDlj6/osIPvvInvvJsKLS0gICAgICAgb3A9J3NpbSfvvJrpu5jorqTlj5YganfvvIhgcC5tZXRyaWNgPSdqdyd8J2phcm8nfCdsZXYnIOmAieaMh+agh++8jGxldiDml7bkuLogMS1ub3JtbGV277yJ77ybCi0tICAgICAgIG9wPSdzaW1yYW5rJ++8mue7meWumuWAmemAieWIl+ihqCBgcC5jYW5kc2AgKyDnm67moIcgYHAudmDvvIzmjInnm7jkvLzluqbpmY3luo/ov5Tlm54KLS0gICAgICAgICAgICAgICAgICAgICAiaWR4OnNjb3JlIiDliJfooajvvIjorrDlvZXpk77mjqUgLyDlp5PlkI3ljLnphY0gLyDljrvph43nmoTmiZPliIbmoLjlv4PvvInjgIIKLS0gICAgICAg5omA5pyJ566X5rOV5ZyoICoqVVRGLTgg6Kej56CB5ZCO55qEIFVuaWNvZGUg5Luj56CB54K5Kiog5LiK6L+b6KGM77yI5Lit5paH5a2X56ymPTEg5Liq5Y2V5YWD77yMCi0tICAgICAgIOmBv+WFjeWtl+iKgue6p+mAgOWMlu+8mueOi+Wwj+aYjiB2cyDnjovlsI/msJEg5a2X6IqC57qnIGp3IOS8mumUmeivr+W+lyAxLjDvvIzku6PnoIHngrnnuqflvpcgMC44NzXvvInjgIIKLS0gQHNvdXJjZTogb3JpZ2luYWzvvIhkdWNrZGItbHVhaml0IOezu+WIl++8jOiHquWMheWQq+aXoOWklumDqOS+nei1lu+8iQotLSBAcmVxdWlyZXM6IG5vbmUKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tIOivmuWunui+ueeVjO+8mkphcm8tV2lua2xlciDliY3nvIDplb/luqbkuIrpmZAgNO+8iOe7j+WFuOWumuS5ie+8ie+8m2BzaW1yYW5rYCDlgJnpgInmlbDku6Xnmb7orqHkuLrmnIDkvbPvvIwKLS0g5LiH57qn5Lul5LiK6K+35pS56LWwIFNRTCDnq68gam9pbiArIOacrOWHveaVsOaJk+WIhuOAgmxldiDnlKggTyhsZW5fYSDDlyBsZW5fYikgRFDvvIjnn63kuLLmnIDkvJjvvInjgIIKLS0KLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQsIHNjYWxhciBtb2RlKToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSdmdXp6eScpOwotLSAgIGxldjogICAgICBTRUxFQ1QgbHVhaml0X3MoJ2Z1enp5Jywge2E6J2tpdHRlbicsIGI6J3NpdHRpbmcnLCBvcDonbGV2J30pOyAgIOKGkiAnMycKLS0gICBub3JtbGV2OiAgU0VMRUNUIGx1YWppdF9zKCdmdXp6eScsIHthOidraXR0ZW4nLCBiOidzaXR0aW5nJywgb3A6J25vcm1sZXYnfSk7LS0g4oaSICcwLjQyODYnCi0tICAganc6ICAgICAgIFNFTEVDVCBsdWFqaXRfcygnZnV6enknLCB7YTonbWFydGhhJywgYjonbWFyaHRhJywgb3A6J2p3J30pOyAgICDihpIgJzAuOTg2MScKLS0gICBzaW1yYW5rOiAgU0VMRUNUIGx1YWppdF9zKCdmdXp6eScsIHt2OifljJfkuqwnLAotLSAgICAgICAgICAgICAgICBjYW5kczogWyfljJfkuqwnLCfljJfkuqzkuIrmtbcnLCfkuqwnLCfljJfkuqzkuIrmtbflub/lt54nXSwgb3A6J3NpbXJhbmsnfSk7Ci0tICAgICAgICAgICAgIOKGkiAnMToxLjAwMDAgNDowLjg3NTAgMjowLjc1MDAgMzowLjYyNTAnICAoaWR4IDEtYmFzZWQsIHNjb3JlPWp3KQoKbG9jYWwgZnV6enkgPSB7fQoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVVEYtOCDop6PnoIHvvJrlrZfnrKbkuLIg4oaSIOS7o+eggeeCueaVsOe7hO+8iEJNUCArIOWinuihpeW5s+mdou+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHV0ZjhjcChzKQogIGxvY2FsIGNwcyA9IHt9CiAgbG9jYWwgaSA9IDEKICBsb2NhbCBuID0gI3MKICB3aGlsZSBpIDw9IG4gZG8KICAgIGxvY2FsIGIxID0gczpieXRlKGkpCiAgICBsb2NhbCBjcCwgbGVuCiAgICBpZiBiMSA8IDB4ODAgdGhlbgogICAgICBjcCwgbGVuID0gYjEsIDEKICAgIGVsc2VpZiBiMSA+PSAweEMwIGFuZCBiMSA8IDB4RTAgdGhlbgogICAgICBsb2NhbCBiMiA9IHM6Ynl0ZShpICsgMSkgb3IgMAogICAgICBjcCA9IChiMSAtIDB4QzApICogNjQgKyAoYjIgLSAweDgwKQogICAgICBsZW4gPSAyCiAgICBlbHNlaWYgYjEgPj0gMHhFMCBhbmQgYjEgPCAweEYwIHRoZW4KICAgICAgbG9jYWwgYjIsIGIzID0gczpieXRlKGkgKyAxKSBvciAwLCBzOmJ5dGUoaSArIDIpIG9yIDAKICAgICAgY3AgPSAoYjEgLSAweEUwKSAqIDQwOTYgKyAoYjIgLSAweDgwKSAqIDY0ICsgKGIzIC0gMHg4MCkKICAgICAgbGVuID0gMwogICAgZWxzZWlmIGIxID49IDB4RjAgYW5kIGIxIDwgMHhGOCB0aGVuCiAgICAgIGxvY2FsIGIyLCBiMywgYjQgPSBzOmJ5dGUoaSArIDEpIG9yIDAsIHM6Ynl0ZShpICsgMikgb3IgMCwgczpieXRlKGkgKyAzKSBvciAwCiAgICAgIGNwID0gKGIxIC0gMHhGMCkgKiAyNjIxNDQgKyAoYjIgLSAweDgwKSAqIDQwOTYgKyAoYjMgLSAweDgwKSAqIDY0ICsgKGI0IC0gMHg4MCkKICAgICAgbGVuID0gNAogICAgZWxzZQogICAgICBjcCwgbGVuID0gYjEsIDEgIC0tIOmdnuazlei1t+Wni+Wtl+iKgu+8muaMieWNleWtl+iKguWFnOW6lQogICAgZW5kCiAgICBjcHNbI2NwcyArIDFdID0gY3AKICAgIGkgPSBpICsgbGVuCiAgZW5kCiAgcmV0dXJuIGNwcwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gTGV2ZW5zaHRlaW4g57yW6L6R6Led56a777yI5Luj56CB54K55pWw57uE57qn77yMTyhtwrduKSBEUO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGxldl9jcChBLCBCKQogIGxvY2FsIG0sIG4gPSAjQSwgI0IKICBpZiBtID09IDAgdGhlbiByZXR1cm4gbiBlbmQKICBpZiBuID09IDAgdGhlbiByZXR1cm4gbSBlbmQKICBpZiBBID09IEIgdGhlbiByZXR1cm4gMCBlbmQKICBsb2NhbCBwcmV2ID0ge30KICBmb3IgaiA9IDAsIG4gZG8gcHJldltqXSA9IGogZW5kCiAgZm9yIGkgPSAxLCBtIGRvCiAgICBsb2NhbCBjdXIgPSB7IFswXSA9IGkgfQogICAgbG9jYWwgYWkgPSBBW2ldCiAgICBmb3IgaiA9IDEsIG4gZG8KICAgICAgbG9jYWwgYyA9IChhaSA9PSBCW2pdKSBhbmQgMCBvciAxCiAgICAgIGN1cltqXSA9IG1hdGgubWluKHByZXZbal0gKyAxLCBjdXJbaiAtIDFdICsgMSwgcHJldltqIC0gMV0gKyBjKQogICAgZW5kCiAgICBwcmV2ID0gY3VyCiAgZW5kCiAgcmV0dXJuIHByZXZbbl0KZW5kCgpsb2NhbCBmdW5jdGlvbiBsZXYoYSwgYikKICBpZiBhID09IGIgdGhlbiByZXR1cm4gMCBlbmQKICBsb2NhbCBBLCBCID0gdXRmOGNwKGEpLCB1dGY4Y3AoYikKICByZXR1cm4gbGV2X2NwKEEsIEIpCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBKYXJvIOebuOS8vOW6pu+8iOS7o+eggeeCueaVsOe7hOe6p++8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGphcm9fY3AoQSwgQikKICBsb2NhbCBtMSwgbTIgPSAjQSwgI0IKICBpZiBtMSA9PSAwIGFuZCBtMiA9PSAwIHRoZW4gcmV0dXJuIDEgZW5kCiAgaWYgbTEgPT0gMCBvciBtMiA9PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgaWYgbTEgPT0gMSBhbmQgbTIgPT0gMSB0aGVuIHJldHVybiAoQVsxXSA9PSBCWzFdKSBhbmQgMSBvciAwIGVuZAogIGxvY2FsIG1kID0gbWF0aC5mbG9vcihtYXRoLm1heChtMSwgbTIpIC8gMikgLSAxCiAgaWYgbWQgPCAwIHRoZW4gbWQgPSAwIGVuZAogIGxvY2FsIGJ1c2VkLCBhbWF0Y2hlZCwgbSA9IHt9LCB7fSwgMAogIGZvciBpID0gMSwgbTEgZG8KICAgIGxvY2FsIGxvID0gaSA+IG1kIGFuZCAoaSAtIG1kKSBvciAxCiAgICBsb2NhbCBoaSA9IGkgKyBtZCA8PSBtMiBhbmQgKGkgKyBtZCkgb3IgbTIKICAgIGZvciBqID0gbG8sIGhpIGRvCiAgICAgIGlmIG5vdCBidXNlZFtqXSBhbmQgQVtpXSA9PSBCW2pdIHRoZW4KICAgICAgICBidXNlZFtqXSA9IHRydWUKICAgICAgICBhbWF0Y2hlZFtpXSA9IHRydWUKICAgICAgICBtID0gbSArIDEKICAgICAgICBicmVhawogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGlmIG0gPT0gMCB0aGVuIHJldHVybiAwIGVuZAogIGxvY2FsIHRyYW5zLCBrID0gMCwgMQogIGZvciBpID0gMSwgbTEgZG8KICAgIGlmIGFtYXRjaGVkW2ldIHRoZW4KICAgICAgd2hpbGUgbm90IGJ1c2VkW2tdIGRvIGsgPSBrICsgMSBlbmQKICAgICAgaWYgQVtpXSB+PSBCW2tdIHRoZW4gdHJhbnMgPSB0cmFucyArIDEgZW5kCiAgICAgIGsgPSBrICsgMQogICAgZW5kCiAgZW5kCiAgbG9jYWwgZCA9IHRyYW5zIC8gMgogIHJldHVybiAobSAvIG0xICsgbSAvIG0yICsgKG0gLSBkKSAvIG0pIC8gMwplbmQKCmxvY2FsIGZ1bmN0aW9uIGphcm8oYSwgYikKICByZXR1cm4gamFyb19jcCh1dGY4Y3AoYSksIHV0ZjhjcChiKSkKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEphcm8tV2lua2xlcu+8iOWJjee8gOWKoOadg++8jOe7j+WFuOWJjee8gOS4iumZkCA077yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gandfY3AoQSwgQiwgcCkKICBwID0gcCBvciAwLjI1CiAgbG9jYWwgbTEsIG0yID0gI0EsICNCCiAgaWYgbTEgPT0gMCBhbmQgbTIgPT0gMCB0aGVuIHJldHVybiAxIGVuZAogIGlmIG0xID09IDAgb3IgbTIgPT0gMCB0aGVuIHJldHVybiAwIGVuZAogIGxvY2FsIGogPSBqYXJvX2NwKEEsIEIpCiAgaWYgaiA+IDAuNyB0aGVuCiAgICBsb2NhbCBsID0gMAogICAgd2hpbGUgbCA8IDQgYW5kIGwgPCBtMSBhbmQgbCA8IG0yIGFuZCBBW2wgKyAxXSA9PSBCW2wgKyAxXSBkbwogICAgICBsID0gbCArIDEKICAgIGVuZAogICAgaWYgbCA+IDAgdGhlbiBqID0gaiArIGwgKiBwICogKDEgLSBqKSBlbmQKICBlbmQKICByZXR1cm4gagplbmQKCmxvY2FsIGZ1bmN0aW9uIGp3KGEsIGIsIHApCiAgcmV0dXJuIGp3X2NwKHV0ZjhjcChhKSwgdXRmOGNwKGIpLCBwKQplbmQKCmxvY2FsIGZ1bmN0aW9uIG5vcm1sZXYoYSwgYikKICBsb2NhbCBBLCBCID0gdXRmOGNwKGEpLCB1dGY4Y3AoYikKICBsb2NhbCBteCA9IG1hdGgubWF4KCNBLCAjQikKICBpZiBteCA9PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgcmV0dXJuIGxldl9jcChBLCBCKSAvIG14CmVuZAoKbG9jYWwgZnVuY3Rpb24gZm10NCh4KQogIHJldHVybiBzdHJpbmcuZm9ybWF0KCclLjRmJywgeCArIDApCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgYSA9IHAuYSBvciAnJwogIGxvY2FsIGIgPSBwLmIgb3IgJycKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2p3JwogIGlmIG9wID09ICdsZXYnIHRoZW4KICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCclZCcsIGxldihhLCBiKSkKICBlbHNlaWYgb3AgPT0gJ25vcm1sZXYnIHRoZW4KICAgIHJldHVybiBmbXQ0KG5vcm1sZXYoYSwgYikpCiAgZWxzZWlmIG9wID09ICdqYXJvJyB0aGVuCiAgICByZXR1cm4gZm10NChqYXJvKGEsIGIpKQogIGVsc2VpZiBvcCA9PSAnancnIHRoZW4KICAgIHJldHVybiBmbXQ0KGp3KGEsIGIsIHAucCBvciAwLjI1KSkKICBlbHNlaWYgb3AgPT0gJ3NpbScgdGhlbgogICAgbG9jYWwgbWV0cmljID0gcC5tZXRyaWMgb3IgJ2p3JwogICAgaWYgbWV0cmljID09ICdqdycgdGhlbiByZXR1cm4gZm10NChqdyhhLCBiLCBwLnAgb3IgMC4yNSkpCiAgICBlbHNlaWYgbWV0cmljID09ICdqYXJvJyB0aGVuIHJldHVybiBmbXQ0KGphcm8oYSwgYikpCiAgICBlbHNlIHJldHVybiBmbXQ0KDEgLSBub3JtbGV2KGEsIGIpKSBlbmQKICBlbHNlaWYgb3AgPT0gJ3NpbXJhbmsnIHRoZW4KICAgIGxvY2FsIHRhcmdldCA9IHAudiBvciBhCiAgICBsb2NhbCBjYW5kcyA9IHAuY2FuZHMKICAgIGlmIHR5cGUoY2FuZHMpID09ICdzdHJpbmcnIHRoZW4KICAgICAgLS0g5YW85a6577ya5Lul5o2i6KGM5oiW56uW57q/5YiG6ZqUCiAgICAgIGNhbmRzID0ge30KICAgICAgZm9yIHBhcnQgaW4gKGNhbmRzIC4uICdcbicpOmdtYXRjaCgnKC4tKVxuJykgZG8KICAgICAgICBpZiBwYXJ0IH49ICcnIHRoZW4gY2FuZHNbI2NhbmRzICsgMV0gPSBwYXJ0IGVuZAogICAgICBlbmQKICAgIGVuZAogICAgaWYgdHlwZShjYW5kcykgfj0gJ3RhYmxlJyB0aGVuIGNhbmRzID0ge30gZW5kCiAgICBsb2NhbCBwMCA9IHAucCBvciAwLjI1CiAgICBsb2NhbCBzY29yZWQgPSB7fQogICAgZm9yIGksIGMgaW4gaXBhaXJzKGNhbmRzKSBkbwogICAgICBzY29yZWRbI3Njb3JlZCArIDFdID0geyBpZHggPSBpLCBzY29yZSA9IGp3KHRhcmdldCwgdG9zdHJpbmcoYyksIHAwKSB9CiAgICBlbmQKICAgIHRhYmxlLnNvcnQoc2NvcmVkLCBmdW5jdGlvbih4LCB5KQogICAgICBpZiB4LnNjb3JlIH49IHkuc2NvcmUgdGhlbiByZXR1cm4geC5zY29yZSA+IHkuc2NvcmUgZW5kCiAgICAgIHJldHVybiB4LmlkeCA8IHkuaWR4CiAgICBlbmQpCiAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICBmb3IgaSwgcyBpbiBpcGFpcnMoc2NvcmVkKSBkbwogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IHN0cmluZy5mb3JtYXQoJyVkOiVzJywgcy5pZHgsIGZtdDQocy5zY29yZSkpCiAgICBlbmQKICAgIHJldHVybiB0YWJsZS5jb25jYXQocGFydHMsICcgJykKICBlbmQKICByZXR1cm4gJycKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogaHRtbF9lc2NhcGUKLS0gQGNhdGVnb3J5OiB1ZGYKLS0gQGRlc2M6IEhUTUwg5a6e5L2T6L2s5LmJL+WPjei9rOS5ie+8iCYgPCA+ICIgJ++8m+aVsOWAvOWunuS9k+S4jeino+egge+8iQotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yJCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQpOgotLSAgIGluc3RhbGw6IFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0naHRtbF9lc2NhcGUnKTsKLS0gICBlc2NhcGU6ICBTRUxFQ1QgbHVhaml0X3MoJ2h0bWxfZXNjYXBlJywge3Y6ICc8YSBocmVmPSJ4Ij4nLCBvcDogJ2VzY2FwZSd9KTsKLS0gICB1bmVzY2FwZTpTRUxFQ1QgbHVhaml0X3MoJ2h0bWxfZXNjYXBlJywge3Y6ICcmbHQ7YSZndDsnLCBvcDogJ3VuZXNjYXBlJ30pOwpsb2NhbCBNQVBfRVNDID0geyBbJyYnXSA9ICcmYW1wOycsIFsnPCddID0gJyZsdDsnLCBbJz4nXSA9ICcmZ3Q7JywgWyciJ10gPSAnJnF1b3Q7JywgWyInIl0gPSAnJiMzOTsnIH0KCnJldHVybiBmdW5jdGlvbihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbgogICAgcmV0dXJuIChwOmdzdWIoJ1smPD4iXCddJywgTUFQX0VTQykpCiAgZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIHYgPSBwLnYgb3IgJycKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2VzY2FwZScKICBpZiBvcCA9PSAndW5lc2NhcGUnIHRoZW4KICAgIC0tIEx1YSA1LjEgcGF0dGVybiBoYXMgbm8gfCBhbHRlcm5hdGlvbjogY2hhaW4gZ3N1YnMsICZhbXA7IGxhc3QgdG8gYXZvaWQgZG91YmxlLWRlY29kZQogICAgdiA9IHY6Z3N1YignJmx0OycsICc8Jyk6Z3N1YignJmd0OycsICc+Jyk6Z3N1YignJnF1b3Q7JywgJyInKTpnc3ViKCcmIzM5OycsICInIikKICAgIHJldHVybiAodjpnc3ViKCcmYW1wOycsICcmJykpCiAgZW5kCiAgcmV0dXJuICh2OmdzdWIoJ1smPD4iXCddJywgTUFQX0VTQykpCmVuZAoALS0gQGxpYjogeWFtbAotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogWUFNTCDop6PmnpAv57yW56CB77yI57qvIEx1Ye+8jOiHquWMheWQq++8ieOAguaUr+aMge+8muW1jOWll+aYoOWwhC/luo/liJfjgIHooYzlhoXmtYHlvI8gWy4uXSB7Li5944CBCi0tICAgICAgIOW8leWPty/oo7jmoIfph4/vvIhpbnQvZmxvYXQvaGV4L2Jvb2wvbnVsbO+8ieOAgeazqOmHiuOAgeWdl+agh+mHjyB8IOS4jiA+44CCCi0tICAgICAgIG9wPSdsb2FkJ++8mllBTUwg5paH5pysIOKGkiBKU09OIOWtl+espuS4su+8iOmFjSBqc29uX2V4dHJhY3Qg5bGV5byA77yJ77ybCi0tICAgICAgIG9wPSdlbmNvZGUn77yaSlNPTiDlrZfnrKbkuLIg4oaSIFlBTUwg5paH5pys44CCCi0tIEBzb3VyY2U6IG9yaWdpbmFs77yIZHVja2RiLWx1YWppdCDns7vliJfvvIzoh6rljIXlkKvml6DlpJbpg6jkvp3otZbvvJtKU09OIOe8luino+eggeS4uueyvueugOWGheW1jOWunueOsO+8iQotLSBAcmVxdWlyZXM6IG5vbmUKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tIOaUr+aMgeWtkOmbhu+8iOivmuWunui+ueeVjO+8ie+8muWdl+aYoOWwhC/luo/liJcv5rWB6ZuG5ZCIL+W8leWPt+S4juijuOagh+mHjy/ms6jph4ov5Z2X5qCH6YePKHwsPinjgIIKLS0g5pyq5pSv5oyB77ya6ZSa54K5ICYg5Yir5ZCNICrjgIHlpJrmlofmoaMgLS0t44CB6KGM5YaF5qCH562+ICEh44CB5aSN5p2C5aSa6KGM6KO45qCH6YeP5oqY6KGM44CCCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0neWFtbCcpOwotLSAgIGxvYWQ6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3lhbWwnLCB7djogJ2E6IDFcbmI6XG4gIGM6IDInLCBvcDogJ2xvYWQnfSk7Ci0tICAgICAgICAgICAgIOKGkiAneyJhIjoxLCJiIjp7ImMiOjJ9fScKLS0gICBkcmlsbDogICAgU0VMRUNUIGpzb25fZXh0cmFjdChsdWFqaXRfcygneWFtbCcsIHt2Oj15YW1sX3RleHQsIG9wOj0nbG9hZCd9KSwgJyQuYi5jJyk7Ci0tICAgZW5jb2RlOiAgIFNFTEVDVCBsdWFqaXRfcygneWFtbCcsIHt2OiAneyJhIjoxLCJiIjpbMSwyXX0nLCBvcDogJ2VuY29kZSd9KTsKLS0gICAgICAgICAgICAg4oaSICdhOiAxXG5iOlxuICAtIDFcbiAgLSAyXG4nCgpsb2NhbCB5YW1sID0ge30KCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5qCH6YeP6Kej5p6QCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgWU5VTEwgPSB7IF9feW51bGwgPSB0cnVlIH0gICAtLSBZQU1MIG51bGwg5ZOo5YW177yISlNPTiDnvJbnoIHkuLogbnVsbO+8iQoKbG9jYWwgZnVuY3Rpb24gZHFfdW5lc2NhcGUocykKICByZXR1cm4gKHM6Z3N1YignJVsoXFwpLiJcblx0XHIvMGFiZnV2JV0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnbicgdGhlbiByZXR1cm4gJ1xuJwogICAgZWxzZWlmIGMgPT0gJ3QnIHRoZW4gcmV0dXJuICdcdCcKICAgIGVsc2VpZiBjID09ICdyJyB0aGVuIHJldHVybiAnXHInCiAgICBlbHNlaWYgYyA9PSAnMCcgdGhlbiByZXR1cm4gJ1wwJwogICAgZWxzZWlmIGMgPT0gJ2EnIHRoZW4gcmV0dXJuICdcYScKICAgIGVsc2VpZiBjID09ICdiJyB0aGVuIHJldHVybiAnXGInCiAgICBlbHNlaWYgYyA9PSAnZicgdGhlbiByZXR1cm4gJ1xmJwogICAgZWxzZWlmIGMgPT0gJ3YnIHRoZW4gcmV0dXJuICdcdicKICAgIGVsc2VpZiBjID09ICd1JyB0aGVuCiAgICAgIC0tIFx1WFhYWCDlnKjnuq8gQVNDSUkg5a2Q6ZuG5YaF6Kej56CB77yb6Z2eIEFTQ0lJIOi/lOWbnuWNoOS9je+8iOe9leingeS6jumFjee9ru+8iQogICAgICBsb2NhbCBoZXggPSBjICAtLSBwbGFjZWhvbGRlcjsgcmVhbCBoYW5kbGluZyBiZWxvdwogICAgICByZXR1cm4gJz8nCiAgICBlbmQKICAgIHJldHVybiBjCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9udW1iZXIocykKICBpZiBzOm1hdGNoKCdeMFt4WF1bMC05YS1mQS1GXSskJykgdGhlbiByZXR1cm4gdG9udW1iZXIocywgMTYpIGVuZAogIGlmIHM6bWF0Y2goJ15bLStdPyVkKyQnKSB0aGVuIHJldHVybiB0b251bWJlcihzKSBlbmQKICBpZiBzOm1hdGNoKCdeWy0rXT8lZCslLiVkKiQnKSBvciBzOm1hdGNoKCdeWy0rXT8lZColLiVkKyQnKSB0aGVuCiAgICByZXR1cm4gdG9udW1iZXIocykKICBlbmQKICBpZiBzOm1hdGNoKCdeWy0rXT8lZCslLj8lZCpbZUVdWy0rXT8lZCskJykgdGhlbiByZXR1cm4gdG9udW1iZXIocykgZW5kCiAgcmV0dXJuIG5pbAplbmQKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3NjYWxhcihyYXcpCiAgbG9jYWwgcyA9IHJhdzptYXRjaCgnXiVzKiguLSklcyokJykgIC0tIHRyaW0KICBpZiBzID09ICcnIG9yIHMgPT0gJ34nIG9yIHM6bG93ZXIoKSA9PSAnbnVsbCcgdGhlbiByZXR1cm4gWU5VTEwgZW5kCiAgbG9jYWwgbG93ID0gczpsb3dlcigpCiAgaWYgbG93ID09ICd0cnVlJyBvciBsb3cgPT0gJ3llcycgb3IgbG93ID09ICdvbicgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBsb3cgPT0gJ2ZhbHNlJyBvciBsb3cgPT0gJ25vJyBvciBsb3cgPT0gJ29mZicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgczptYXRjaCgnXiIuKiInKSB0aGVuCiAgICBsb2NhbCBib2R5ID0gczpzdWIoMiwgLTIpCiAgICAtLSDlpITnkIbovazkuYnvvIjlkKsgXHVYWFhYIOWfuuehgCBBU0NJSe+8iQogICAgYm9keSA9IGJvZHk6Z3N1YignXFx1KCV4JXgleCV4KScsIGZ1bmN0aW9uKGgpCiAgICAgIGxvY2FsIGNvZGUgPSB0b251bWJlcihoLCAxNikKICAgICAgaWYgY29kZSBhbmQgY29kZSA8IDEyOCB0aGVuIHJldHVybiBzdHJpbmcuY2hhcihjb2RlKSBlbmQKICAgICAgcmV0dXJuICc/JwogICAgZW5kKQogICAgYm9keSA9IGRxX3VuZXNjYXBlKGJvZHkpCiAgICByZXR1cm4gYm9keQogIGVuZAogIGlmIHM6bWF0Y2goIl4nLionIikgdGhlbgogICAgcmV0dXJuIChzOnN1YigyLCAtMik6Z3N1YigiJyciLCAiJyIpKQogIGVuZAogIGxvY2FsIG4gPSBwYXJzZV9udW1iZXIocykKICBpZiBuIH49IG5pbCB0aGVuIHJldHVybiBuIGVuZAogIHJldHVybiBzCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDooYzlhoXmtYHpm4blkIggIFsgLi4gXSAvIHsgLi4gfQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHNraXBfd3MocywgaSkKICB3aGlsZSBpIDw9ICNzIGRvCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJyAnIG9yIGMgPT0gJ1x0JyB0aGVuIGkgPSBpICsgMSBlbHNlIGJyZWFrIGVuZAogIGVuZAogIHJldHVybiBpCmVuZAoKbG9jYWwgcGFyc2VfZmxvdyAgLS0g5YmN5ZCR5aOw5piO77yIZmxvd192YWx1ZSDpgJLlvZLosIPnlKjlroPvvIkKCmxvY2FsIGZ1bmN0aW9uIGZsb3dfdmFsdWUocywgaSkKICBpID0gc2tpcF93cyhzLCBpKQogIGxvY2FsIGMgPSBzOnN1YihpLCBpKQogIGlmIGMgPT0gJ1snIG9yIGMgPT0gJ3snIHRoZW4KICAgIGxvY2FsIHYsIGogPSBwYXJzZV9mbG93KHMsIGkpCiAgICByZXR1cm4gdiwgagogIGVuZAogIGlmIGMgPT0gJyInIHRoZW4KICAgIGxvY2FsIGogPSBpICsgMQogICAgd2hpbGUgaiA8PSAjcyBkbwogICAgICBpZiBzOnN1YihqLCBqKSA9PSAnXFwnIHRoZW4gaiA9IGogKyAyCiAgICAgIGVsc2VpZiBzOnN1YihqLCBqKSA9PSAnIicgdGhlbiBicmVhawogICAgICBlbHNlIGogPSBqICsgMSBlbmQKICAgIGVuZAogICAgcmV0dXJuIHBhcnNlX3NjYWxhcihzOnN1YihpLCBqKSksIGogKyAxCiAgZW5kCiAgaWYgYyA9PSAiJyIgdGhlbgogICAgbG9jYWwgaiA9IGkgKyAxCiAgICB3aGlsZSBqIDw9ICNzIGRvCiAgICAgIGlmIHM6c3ViKGosIGogKyAxKSA9PSAiJyciIHRoZW4gaiA9IGogKyAyCiAgICAgIGVsc2VpZiBzOnN1YihqLCBqKSA9PSAiJyIgdGhlbiBicmVhawogICAgICBlbHNlIGogPSBqICsgMSBlbmQKICAgIGVuZAogICAgcmV0dXJuIHBhcnNlX3NjYWxhcihzOnN1YihpLCBqKSksIGogKyAxCiAgZW5kCiAgLS0g6KO45qCH6YeP77ya6K+75YiwICwgXSB9IDrvvIjmmKDlsITplK7nmoTlhpLlj7fvvInkuLrmraIKICBsb2NhbCBzdGFydCA9IGkKICB3aGlsZSBpIDw9ICNzIGRvCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJywnIG9yIGMgPT0gJ10nIG9yIGMgPT0gJ30nIG9yIGMgPT0gJzonIHRoZW4gYnJlYWsgZW5kCiAgICBpID0gaSArIDEKICBlbmQKICByZXR1cm4gcGFyc2Vfc2NhbGFyKHM6c3ViKHN0YXJ0LCBpIC0gMSkpLCBpCmVuZAoKcGFyc2VfZmxvdyA9IGZ1bmN0aW9uKHMsIGkpCiAgbG9jYWwgYyA9IHM6c3ViKGksIGkpCiAgaWYgYyA9PSAnWycgdGhlbgogICAgbG9jYWwgYXJyLCBvdXQgPSB7fSwge30KICAgIGkgPSBpICsgMQogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBpID0gc2tpcF93cyhzLCBpKQogICAgICBpZiBzOnN1YihpLCBpKSA9PSAnXScgdGhlbiByZXR1cm4gb3V0LCBpICsgMSBlbmQKICAgICAgbG9jYWwgdiwgaiA9IGZsb3dfdmFsdWUocywgaSkKICAgICAgb3V0WyNvdXQgKyAxXSA9IHYKICAgICAgaSA9IHNraXBfd3MocywgaikKICAgICAgaWYgczpzdWIoaSwgaSkgPT0gJywnIHRoZW4gaSA9IGkgKyAxCiAgICAgIGVsc2VpZiBzOnN1YihpLCBpKSA9PSAnXScgdGhlbiByZXR1cm4gb3V0LCBpICsgMQogICAgICBlbHNlIGVycm9yKCd5YW1sOiBmbG93IGxpc3Qg5pyf5pybICwg5oiWIF3vvIzkvY3nva4gJyAuLiBpKSBlbmQKICAgIGVuZAogIGVsc2VpZiBjID09ICd7JyB0aGVuCiAgICBsb2NhbCBvdXQgPSB7fQogICAgaSA9IGkgKyAxCiAgICB3aGlsZSB0cnVlIGRvCiAgICAgIGkgPSBza2lwX3dzKHMsIGkpCiAgICAgIGlmIHM6c3ViKGksIGkpID09ICd9JyB0aGVuIHJldHVybiBvdXQsIGkgKyAxIGVuZAogICAgICAtLSBrZXkKICAgICAgbG9jYWwga2V5LCBqCiAgICAgIGlmIHM6c3ViKGksIGkpID09ICciJyBvciBzOnN1YihpLCBpKSA9PSAiJyIgdGhlbgogICAgICAgIGtleSwgaiA9IGZsb3dfdmFsdWUocywgaSkKICAgICAgICBrZXkgPSB0b3N0cmluZyhrZXkpCiAgICAgICAgaSA9IHNraXBfd3MocywgaikKICAgICAgZWxzZQogICAgICAgIGxvY2FsIHN0YXJ0ID0gaQogICAgICAgIHdoaWxlIGkgPD0gI3MgYW5kIHM6c3ViKGksIGkpIH49ICc6JyBkbyBpID0gaSArIDEgZW5kCiAgICAgICAga2V5ID0gKHM6c3ViKHN0YXJ0LCBpIC0gMSk6bWF0Y2goJ14lcyooLi0pJXMqJCcpKQogICAgICAgIGkgPSBpICsgMSAgLS0g6Lez6L+HICc6JwogICAgICBlbmQKICAgICAgbG9jYWwgdiwgajIgPSBmbG93X3ZhbHVlKHMsIGkpCiAgICAgIG91dFtrZXldID0gdgogICAgICBpID0gc2tpcF93cyhzLCBqMikKICAgICAgaWYgczpzdWIoaSwgaSkgPT0gJywnIHRoZW4gaSA9IGkgKyAxCiAgICAgIGVsc2VpZiBzOnN1YihpLCBpKSA9PSAnfScgdGhlbiByZXR1cm4gb3V0LCBpICsgMQogICAgICBlbHNlIGVycm9yKCd5YW1sOiBmbG93IG1hcCDmnJ/mnJsgLCDmiJYgfe+8jOS9jee9riAnIC4uIGkpIGVuZAogICAgZW5kCiAgZW5kCiAgZXJyb3IoJ3lhbWw6IOmdnuazlea1gembhuWQiOi1t+WniycpCmVuZAoKLS0g5Yik5pat5YC85piv5ZCm5Li65rWB6ZuG5ZCICmxvY2FsIGZ1bmN0aW9uIGlzX2Zsb3cocykKICBsb2NhbCB0ID0gczptYXRjaCgnXiVzKiguKikkJykKICByZXR1cm4gdDpzdWIoMSwgMSkgPT0gJ1snIG9yIHQ6c3ViKDEsIDEpID09ICd7JwplbmQKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3ZhbHVlX2lubGluZShzKQogIGlmIGlzX2Zsb3cocykgdGhlbgogICAgbG9jYWwgc3RhcnQgPSAjczptYXRjaCgnXiVzKicpICsgMQogICAgbG9jYWwgdiA9IHBhcnNlX2Zsb3cocywgc3RhcnQpCiAgICByZXR1cm4gdgogIGVuZAogIHJldHVybiBwYXJzZV9zY2FsYXIocykKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOazqOmHiuWJpeemuwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHN0cmlwX2NvbW1lbnQobGluZSkKICBsb2NhbCBpbl9zLCBpbl9kID0gZmFsc2UsIGZhbHNlCiAgZm9yIGkgPSAxLCAjbGluZSBkbwogICAgbG9jYWwgYyA9IGxpbmU6c3ViKGksIGkpCiAgICBpZiBpbl9kIHRoZW4KICAgICAgaWYgYyA9PSAnXFwnIHRoZW4gaSA9IGkgKyAxCiAgICAgIGVsc2VpZiBjID09ICciJyB0aGVuIGluX2QgPSBmYWxzZSBlbmQKICAgIGVsc2VpZiBpbl9zIHRoZW4KICAgICAgaWYgYyA9PSAiJyIgdGhlbiBpbl9zID0gZmFsc2UgZW5kCiAgICBlbHNlCiAgICAgIGlmIGMgPT0gJyInIHRoZW4gaW5fZCA9IHRydWUKICAgICAgZWxzZWlmIGMgPT0gIiciIHRoZW4gaW5fcyA9IHRydWUKICAgICAgZWxzZWlmIGMgPT0gJyMnIHRoZW4KICAgICAgICBpZiBpID09IDEgb3IgbGluZTpzdWIoaSAtIDEsIGkgLSAxKTptYXRjaCgnJXMnKSB0aGVuCiAgICAgICAgICByZXR1cm4gbGluZTpzdWIoMSwgaSAtIDEpCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIGxpbmUKZW5kCgpsb2NhbCBmdW5jdGlvbiBpc19tYXBfbGluZSh0ZXh0KQogIC0tIGtleSDlkI7ntKfot58gJzogJyDmiJbooYzlsL4gJzonCiAgcmV0dXJuIHRleHQ6bWF0Y2goJ14oW146JXNdW146XSolcyopOiVzKiguKikkJykgb3IKICAgICAgICAgdGV4dDptYXRjaCgnXigiLio/Iik6KC4qKSQnKSBvcgogICAgICAgICB0ZXh0Om1hdGNoKCJeKC4qPycpOiguKikkIikKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOS4u+Wdl+ino+aekOWZqAotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIHBhcnNlX3NlcXVlbmNlICAtLSDliY3lkJHlo7DmmI7vvIhwYXJzZV9ibG9jayDpgJLlvZLosIPnlKjvvIkKbG9jYWwgcGFyc2VfbWFwcGluZyAgIC0tIOWJjeWQkeWjsOaYju+8iHBhcnNlX2Jsb2NrIOmAkuW9kuiwg+eUqO+8iQoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfYmxvY2sobGluZXMsIGksIGluZGVudCkKICBsb2NhbCBsaW5lID0gbGluZXNbaV0KICBpZiBub3QgbGluZSB0aGVuIHJldHVybiBZTlVMTCwgaSBlbmQKICBsb2NhbCB0ID0gbGluZS50ZXh0CiAgLS0g5bqP5YiX6aG5CiAgaWYgdCA9PSAnLScgb3IgdDpzdWIoMSwgMikgPT0gJy0gJyB0aGVuCiAgICByZXR1cm4gcGFyc2Vfc2VxdWVuY2UobGluZXMsIGksIGluZGVudCkKICBlbmQKICAtLSDmmKDlsIQKICBpZiB0Om1hdGNoKCdeKFteOiVzXVteOl0qJXMqKTolcyooLiopJCcpIG9yIHQ6bWF0Y2goJ14iJykgYW5kIHQ6bWF0Y2goJ14iJXMqIjonKSB0aGVuCiAgICByZXR1cm4gcGFyc2VfbWFwcGluZyhsaW5lcywgaSwgaW5kZW50KQogIGVuZAogIC0tIOijuOagh+mHjwogIHJldHVybiBwYXJzZV9zY2FsYXIodCksIGkgKyAxCmVuZAoKbG9jYWwgZnVuY3Rpb24gc3BsaXRfa2V5KHRleHQpCiAgLS0g5LyY5YWI77ya5pyq5Yqg5byV5Y+3IGtlee+8iOmmluS4qiAnOiAnIOaIluihjOWwviAnOifvvIkKICBsb2NhbCBrZXksIHZhbCA9IHRleHQ6bWF0Y2goJ14oW146JXNdW146XSolcyopOiVzKiguKikkJykKICBpZiBrZXkgdGhlbiByZXR1cm4ga2V5LCB2YWwgZW5kCiAgLS0g5Y+M5byV5Y+3IGtleQogIGtleSwgdmFsID0gdGV4dDptYXRjaCgnXigiKC4tKSIpOiguKikkJykKICBpZiBrZXkgdGhlbiByZXR1cm4ga2V5LCB2YWwgZW5kCiAgLS0g5Y2V5byV5Y+3IGtleQogIGtleSwgdmFsID0gdGV4dDptYXRjaCgiXihcJyguLSlcJyk6KC4qKSQiKQogIGlmIGtleSB0aGVuIHJldHVybiBrZXksIHZhbCBlbmQKICByZXR1cm4gbmlsLCBuaWwKZW5kCgpwYXJzZV9tYXBwaW5nID0gZnVuY3Rpb24obGluZXMsIGksIGluZGVudCkKICBsb2NhbCBvdXQgPSB7fQogIHdoaWxlIGkgPD0gI2xpbmVzIGRvCiAgICBsb2NhbCBsaW5lID0gbGluZXNbaV0KICAgIGlmIGxpbmUuaW5kZW50IDwgaW5kZW50IHRoZW4gYnJlYWsgZW5kCiAgICBpZiBsaW5lLmluZGVudCA+IGluZGVudCB0aGVuCiAgICAgIGVycm9yKCd5YW1sOiDmhI/lpJbnvKnov5vvvIjooYzlhoXlrrkgJyAuLiBsaW5lLnRleHQgLi4gJ++8iScpCiAgICBlbmQKICAgIGlmIGxpbmUudGV4dCA9PSAnLScgb3IgbGluZS50ZXh0OnN1YigxLCAyKSA9PSAnLSAnIHRoZW4gYnJlYWsgZW5kCiAgICBsb2NhbCBrZXksIHZhbCA9IHNwbGl0X2tleShsaW5lLnRleHQpCiAgICBpZiBub3Qga2V5IHRoZW4KICAgICAgZXJyb3IoJ3lhbWw6IOaXoOazleino+aekOaYoOWwhOihjCAiJyAuLiBsaW5lLnRleHQgLi4gJyInKQogICAgZW5kCiAgICAtLSDop6PlvJXlj7cga2V5CiAgICBrZXkgPSBrZXk6bWF0Y2goJ14lcyooLi0pJXMqJCcpCiAgICBpZiBrZXk6c3ViKDEsIDEpID09ICciJyB0aGVuIGtleSA9IGtleTpzdWIoMiwgLTIpCiAgICBlbHNlaWYga2V5OnN1YigxLCAxKSA9PSAiJyIgdGhlbiBrZXkgPSAoa2V5OnN1YigyLCAtMik6Z3N1YigiJyciLCAiJyIpKSBlbmQKCiAgICBsb2NhbCB2dHJpbSA9IHZhbDptYXRjaCgnXiVzKiguLSklcyokJykgb3IgJycKICAgIGlmIHZ0cmltID09ICcnIHRoZW4KICAgICAgLS0g56m65YC877ya6KaB5LmI5bWM5aWX5Z2X77yM6KaB5LmIIG51bGwKICAgICAgbG9jYWwgbnggPSBsaW5lc1tpICsgMV0KICAgICAgaWYgbnggYW5kIG54LmluZGVudCA+IGluZGVudCBhbmQgbm90IChueC50ZXh0ID09ICctJyBvciBueC50ZXh0OnN1YigxLDIpPT0nLSAnKSB0aGVuCiAgICAgICAgbG9jYWwgY2hpbGQsIGkyID0gcGFyc2VfYmxvY2sobGluZXMsIGkgKyAxLCBueC5pbmRlbnQpCiAgICAgICAgb3V0W2tleV0gPSBjaGlsZAogICAgICAgIGkgPSBpMgogICAgICBlbHNlaWYgbnggYW5kIG54LmluZGVudCA+IGluZGVudCBhbmQgKG54LnRleHQgPT0gJy0nIG9yIG54LnRleHQ6c3ViKDEsMik9PSctICcpIHRoZW4KICAgICAgICBsb2NhbCBjaGlsZCwgaTIgPSBwYXJzZV9zZXF1ZW5jZShsaW5lcywgaSArIDEsIG54LmluZGVudCkKICAgICAgICBvdXRba2V5XSA9IGNoaWxkCiAgICAgICAgaSA9IGkyCiAgICAgIGVsc2UKICAgICAgICBvdXRba2V5XSA9IFlOVUxMCiAgICAgICAgaSA9IGkgKyAxCiAgICAgIGVuZAogICAgZWxzZWlmIHZ0cmltOm1hdGNoKCdeWyV8Pl1bJSstXT8lcyolZCokJykgdGhlbgogICAgICAtLSDlnZfmoIfph48gfCDmiJYgPgogICAgICBsb2NhbCBmb2xkZWQgPSB2dHJpbTpzdWIoMSwgMSkgPT0gJz4nCiAgICAgIGxvY2FsIGNvbnRlbnRfaW5kZW50LCBnYXRoZXJlZCA9IG5pbCwge30KICAgICAgbG9jYWwgaiA9IGkgKyAxCiAgICAgIHdoaWxlIGogPD0gI2xpbmVzIGRvCiAgICAgICAgbG9jYWwgbmwgPSBsaW5lc1tqXQogICAgICAgIGlmIG5sLmluZGVudCA8PSBpbmRlbnQgYW5kIG5sLmluZGVudCA+PSAwIGFuZCBubC5pbmRlbnQgfj0gaW5kZW50IHRoZW4KICAgICAgICAgIC0tIOe8qei/m+WbnuiQveWIsOWQjOe6pyDihpIg57uT5p2fCiAgICAgICAgICBicmVhawogICAgICAgIGVuZAogICAgICAgIGlmIG5sLmluZGVudCA8IGluZGVudCB0aGVuIGJyZWFrIGVuZAogICAgICAgIGlmIG5sLmluZGVudCA9PSBpbmRlbnQgdGhlbiBicmVhayBlbmQgIC0tIOWQjOe6p+aWsCBrZXkKICAgICAgICBpZiBjb250ZW50X2luZGVudCA9PSBuaWwgdGhlbiBjb250ZW50X2luZGVudCA9IG5sLmluZGVudCBlbmQKICAgICAgICBnYXRoZXJlZFsjZ2F0aGVyZWQgKyAxXSA9IG5sLnRleHQKICAgICAgICBqID0gaiArIDEKICAgICAgZW5kCiAgICAgIGxvY2FsIGpvaW5lZAogICAgICBpZiBmb2xkZWQgdGhlbgogICAgICAgIC0tIOaKmOWPoO+8muWNleaNouihjOKGkuepuuagvO+8jOepuuihjOKGkuaNouihjO+8iOeugOWMlu+8muWFqOmDqOS7peepuuagvOi/nuaOpe+8jOS/neeVmeauteiQveepuuihjO+8iQogICAgICAgIGpvaW5lZCA9IHRhYmxlLmNvbmNhdChnYXRoZXJlZCwgJyAnKQogICAgICBlbHNlCiAgICAgICAgam9pbmVkID0gdGFibGUuY29uY2F0KGdhdGhlcmVkLCAnXG4nKQogICAgICBlbmQKICAgICAgb3V0W2tleV0gPSBqb2luZWQKICAgICAgaSA9IGoKICAgIGVsc2UKICAgICAgb3V0W2tleV0gPSBwYXJzZV92YWx1ZV9pbmxpbmUodnRyaW0pCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dCwgaQplbmQKCnBhcnNlX3NlcXVlbmNlID0gZnVuY3Rpb24obGluZXMsIGksIGluZGVudCkKICBsb2NhbCBvdXQgPSB7fQogIHdoaWxlIGkgPD0gI2xpbmVzIGRvCiAgICBsb2NhbCBsaW5lID0gbGluZXNbaV0KICAgIGlmIGxpbmUuaW5kZW50IH49IGluZGVudCB0aGVuIGJyZWFrIGVuZAogICAgaWYgbm90IChsaW5lLnRleHQgPT0gJy0nIG9yIGxpbmUudGV4dDpzdWIoMSwgMikgPT0gJy0gJykgdGhlbiBicmVhayBlbmQKICAgIGxvY2FsIGNvbnRlbnQgPSBsaW5lLnRleHQ6c3ViKDIpCiAgICBsb2NhbCBsZWFkID0gI2NvbnRlbnQ6bWF0Y2goJ14lcyonKSAgLS0g56C05oqY5Y+35ZCO55qE56m65qC85pWw77yIJy0gJyDpgJrluLjkuLogMe+8iQogICAgbG9jYWwgY29udGVudF9pbmRlbnQgPSBpbmRlbnQgKyAxICsgbGVhZAogICAgLS0g5ZCI5bm25pys6aG577ya6aaW6KGM77yI6IulIGNvbnRlbnQg6Z2e56m677yJKyDlkI7nu63nvKnov5sgPj0gY29udGVudF9pbmRlbnQg55qE6KGMCiAgICBsb2NhbCBtZXJnZWQgPSB7fQogICAgaWYgKGNvbnRlbnQ6bWF0Y2goJ14lcyooLi0pJXMqJCcpKSB+PSAnJyB0aGVuCiAgICAgIG1lcmdlZFsjbWVyZ2VkICsgMV0gPSB7IGluZGVudCA9IGNvbnRlbnRfaW5kZW50LCB0ZXh0ID0gY29udGVudDptYXRjaCgnXiVzKiguLSklcyokJykgfQogICAgZW5kCiAgICBpID0gaSArIDEKICAgIHdoaWxlIGkgPD0gI2xpbmVzIGFuZCBsaW5lc1tpXS5pbmRlbnQgPj0gY29udGVudF9pbmRlbnQgZG8KICAgICAgbWVyZ2VkWyNtZXJnZWQgKyAxXSA9IGxpbmVzW2ldCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgICBpZiAjbWVyZ2VkID09IDAgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gWU5VTEwKICAgIGVsc2UKICAgICAgb3V0WyNvdXQgKyAxXSA9IHBhcnNlX2Jsb2NrKG1lcmdlZCwgMSwgY29udGVudF9pbmRlbnQpCiAgICBlbmQKICBlbmQKICByZXR1cm4gb3V0LCBpCmVuZAoKbG9jYWwgZnVuY3Rpb24gcHJlcGFyZV9saW5lcyhzcmMpCiAgbG9jYWwgbGluZXMgPSB7fQogIGZvciByYXcgaW4gKHNyYyAuLiAnXG4nKTpnbWF0Y2goJyhbXlxuXSopXG4nKSBkbwogICAgbG9jYWwgbm9fY29tbWVudCA9IHN0cmlwX2NvbW1lbnQocmF3KQogICAgLS0g5b+955Wl56m66KGMIC8g5LuF57yp6L+bCiAgICBpZiBub19jb21tZW50Om1hdGNoKCdeJXMqJCcpIHRoZW4gZ290byBjb250aW51ZSBlbmQKICAgIC0tIOaWh+aho+WIhumalOespiAtLS0g5pqC5oyJ57uT5p2f5b2T5YmN5Z2X5aSE55CG77yI5Y2V5paH5qGj77yM55u05o6l6Lez6L+H77yJCiAgICBpZiBub19jb21tZW50Om1hdGNoKCdeJXMqJS0lLS0lcyokJykgdGhlbiBnb3RvIGNvbnRpbnVlIGVuZAogICAgbG9jYWwgaW5kZW50ID0gIyhub19jb21tZW50Om1hdGNoKCdeJXMqJykgb3IgJycpCiAgICBsb2NhbCB0ZXh0ID0gbm9fY29tbWVudDptYXRjaCgnXiVzKiguKikkJykKICAgIGlmIHRleHQ6bWF0Y2goJ1x0JykgdGhlbgogICAgICAtLSDnvKnov5vlhoXlh7rnjrAgdGFi77yaWUFNTCDnpoHnlKjvvIzlrr3mnb7lpITnkIbkuLrmiqXplJkKICAgICAgZXJyb3IoJ3lhbWw6IOe8qei/m+S4reS4jeWFgeiuuOS9v+eUqOWItuihqOespicpCiAgICBlbmQKICAgIGxpbmVzWyNsaW5lcyArIDFdID0geyBpbmRlbnQgPSBpbmRlbnQsIHRleHQgPSB0ZXh0IH0KICAgIDo6Y29udGludWU6OgogIGVuZAogIHJldHVybiBsaW5lcwplbmQKCmZ1bmN0aW9uIHlhbWwubG9hZChzcmMpCiAgaWYgdHlwZShzcmMpIH49ICdzdHJpbmcnIHRoZW4gcmV0dXJuIG5pbCBlbmQKICBpZiBzcmM6bWF0Y2goJ14lcyokJykgdGhlbiByZXR1cm4gWU5VTEwgZW5kCiAgLS0g5Y675o6JIEJPTQogIHNyYyA9IChzcmM6Z3N1YignXiVib20nLCAnJykpCiAgbG9jYWwgbGluZXMgPSBwcmVwYXJlX2xpbmVzKHNyYykKICBpZiAjbGluZXMgPT0gMCB0aGVuIHJldHVybiBZTlVMTCBlbmQKICBsb2NhbCB2YWwgPSBwYXJzZV9ibG9jayhsaW5lcywgMSwgbGluZXNbMV0uaW5kZW50KQogIHJldHVybiB2YWwKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEpTT04g5YaF5bWM57yW6Kej56CB77yI57K+566A77yM6Ieq5YyF5ZCr77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHM6Z3N1YignWyVjIlxcXScsIGZ1bmN0aW9uKGMpCiAgICBpZiBjID09ICciJyB0aGVuIHJldHVybiAnXFwiJwogICAgZWxzZWlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcKICAgIGVsc2VpZiBjID09ICdcbicgdGhlbiByZXR1cm4gJ1xcbicKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicKICAgIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2UgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBjOmJ5dGUoKSkgZW5kCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBpc19hcnJheSh0KQogIGxvY2FsIG4gPSAwCiAgZm9yIGsgaW4gcGFpcnModCkgZG8KICAgIGlmIHR5cGUoaykgfj0gJ251bWJlcicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgICBuID0gbiArIDEKICBlbmQKICBmb3IgaSA9IDEsIG4gZG8gaWYgdFtpXSA9PSBuaWwgdGhlbiByZXR1cm4gZmFsc2UgZW5kIGVuZAogIHJldHVybiB0cnVlCmVuZAoKbG9jYWwganNvbl9lbmNvZGVfdmFsCgpqc29uX2VuY29kZV92YWwgPSBmdW5jdGlvbih2KQogIGlmIHYgPT0gbmlsIHRoZW4gcmV0dXJuICdudWxsJyBlbmQKICBpZiB2ID09IFlOVUxMIHRoZW4gcmV0dXJuICdudWxsJyBlbmQKICBsb2NhbCB0diA9IHR5cGUodikKICBpZiB0diA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCiAgaWYgdHYgPT0gJ251bWJlcicgdGhlbgogICAgaWYgdiB+PSB2IG9yIHYgPT0gbWF0aC5odWdlIG9yIHYgPT0gLW1hdGguaHVnZSB0aGVuIHJldHVybiAnbnVsbCcgZW5kICAtLSBOYU4vSW5mCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJWcnLCB2KQogIGVuZAogIGlmIHR2ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICciJyAuLiBqc29uX2VzY2FwZSh2KSAuLiAnIicgZW5kCiAgaWYgdHYgPT0gJ3RhYmxlJyB0aGVuCiAgICBpZiBpc19hcnJheSh2KSB0aGVuCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIGkgPSAxLCAjdiBkbyBwYXJ0c1tpXSA9IGpzb25fZW5jb2RlX3ZhbCh2W2ldKSBlbmQKICAgICAgcmV0dXJuICdbJyAuLiB0YWJsZS5jb25jYXQocGFydHMsICcsJykgLi4gJ10nCiAgICBlbHNlCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIGssIHZhbCBpbiBwYWlycyh2KSBkbwogICAgICAgIGlmIHZhbCB+PSBuaWwgdGhlbgogICAgICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSAnIicgLi4ganNvbl9lc2NhcGUodG9zdHJpbmcoaykpIC4uICciOicgLi4ganNvbl9lbmNvZGVfdmFsKHZhbCkKICAgICAgICBlbmQKICAgICAgZW5kCiAgICAgIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwogICAgZW5kCiAgZW5kCiAgcmV0dXJuICdudWxsJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGpzb25fZW5jb2RlKHYpIHJldHVybiBqc29uX2VuY29kZV92YWwodikgZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX2RlY29kZShzKQogIGxvY2FsIHBvcyA9IDEKICBsb2NhbCBmdW5jdGlvbiB3cygpCiAgICB3aGlsZSBwb3MgPD0gI3MgZG8KICAgICAgbG9jYWwgYyA9IHM6c3ViKHBvcywgcG9zKQogICAgICBpZiBjID09ICcgJyBvciBjID09ICdcdCcgb3IgYyA9PSAnXG4nIG9yIGMgPT0gJ1xyJyB0aGVuIHBvcyA9IHBvcyArIDEgZWxzZSBicmVhayBlbmQKICAgIGVuZAogIGVuZAogIGxvY2FsIGZ1bmN0aW9uIHZhbHVlKCkKICAgIHdzKCkKICAgIGxvY2FsIGMgPSBzOnN1Yihwb3MsIHBvcykKICAgIGlmIGMgPT0gJ3snIHRoZW4KICAgICAgcG9zID0gcG9zICsgMQogICAgICBsb2NhbCB0ID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MsIHBvcykgPT0gJ30nIHRoZW4gcG9zID0gcG9zICsgMSByZXR1cm4gdCBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBrCiAgICAgICAgaWYgczpzdWIocG9zLCBwb3MpIH49ICciJyB0aGVuIGVycm9yKCdqc29uOiDmnJ/mnJvlrZfnrKbkuLLplK4nKSBlbmQKICAgICAgICBsb2NhbCBfLCBlID0gczpmaW5kKCciJywgcG9zLCB0cnVlKQogICAgICAgIC0tIOaJvuWIsOacqui9rOS5ieW8leWPtwogICAgICAgIGxvY2FsIGogPSBwb3MgKyAxCiAgICAgICAgd2hpbGUgaiA8PSAjcyBkbwogICAgICAgICAgaWYgczpzdWIoaiwgaikgPT0gJ1xcJyB0aGVuIGogPSBqICsgMgogICAgICAgICAgZWxzZWlmIHM6c3ViKGosIGopID09ICciJyB0aGVuIGJyZWFrCiAgICAgICAgICBlbHNlIGogPSBqICsgMSBlbmQKICAgICAgICBlbmQKICAgICAgICBrID0gKHM6c3ViKHBvcyArIDEsIGogLSAxKTpnc3ViKCdcXCguKScsIGZ1bmN0aW9uKHgpCiAgICAgICAgICBpZiB4ID09ICduJyB0aGVuIHJldHVybiAnXG4nIGVsc2VpZiB4ID09ICd0JyB0aGVuIHJldHVybiAnXHQnIGVsc2UgcmV0dXJuIHggZW5kCiAgICAgICAgZW5kKSkKICAgICAgICBwb3MgPSBqICsgMQogICAgICAgIHdzKCkKICAgICAgICBpZiBzOnN1Yihwb3MsIHBvcykgfj0gJzonIHRoZW4gZXJyb3IoJ2pzb246IOacn+acmyA6JykgZW5kCiAgICAgICAgcG9zID0gcG9zICsgMQogICAgICAgIHRba10gPSB2YWx1ZSgpCiAgICAgICAgd3MoKQogICAgICAgIGlmIHM6c3ViKHBvcywgcG9zKSA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIHM6c3ViKHBvcywgcG9zKSA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxIHJldHVybiB0CiAgICAgICAgZWxzZSBlcnJvcignanNvbjog5pyf5pybICwg5oiWIH0nKSBlbmQKICAgICAgZW5kCiAgICBlbHNlaWYgYyA9PSAnWycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGxvY2FsIGFyciA9IHt9CiAgICAgIHdzKCkKICAgICAgaWYgczpzdWIocG9zLCBwb3MpID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDEgcmV0dXJuIGFyciBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIGFyclsjYXJyICsgMV0gPSB2YWx1ZSgpCiAgICAgICAgd3MoKQogICAgICAgIGlmIHM6c3ViKHBvcywgcG9zKSA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIHM6c3ViKHBvcywgcG9zKSA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxIHJldHVybiBhcnIKICAgICAgICBlbHNlIGVycm9yKCdqc29uOiDmnJ/mnJsgLCDmiJYgXScpIGVuZAogICAgICBlbmQKICAgIGVsc2VpZiBjID09ICciJyB0aGVuCiAgICAgIGxvY2FsIGogPSBwb3MgKyAxCiAgICAgIHdoaWxlIGogPD0gI3MgZG8KICAgICAgICBpZiBzOnN1YihqLCBqKSA9PSAnXFwnIHRoZW4gaiA9IGogKyAyCiAgICAgICAgZWxzZWlmIHM6c3ViKGosIGopID09ICciJyB0aGVuIGJyZWFrCiAgICAgICAgZWxzZSBqID0gaiArIDEgZW5kCiAgICAgIGVuZAogICAgICBsb2NhbCBib2R5ID0gczpzdWIocG9zICsgMSwgaiAtIDEpCiAgICAgIGJvZHkgPSAoYm9keTpnc3ViKCdcXHUoJXgleCV4JXgpJywgZnVuY3Rpb24oaCkKICAgICAgICBsb2NhbCBjb2RlID0gdG9udW1iZXIoaCwgMTYpCiAgICAgICAgaWYgY29kZSBhbmQgY29kZSA8IDEyOCB0aGVuIHJldHVybiBzdHJpbmcuY2hhcihjb2RlKSBlbmQKICAgICAgICByZXR1cm4gJz8nCiAgICAgIGVuZCkpCiAgICAgIGJvZHkgPSAoYm9keTpnc3ViKCdcXCguKScsIGZ1bmN0aW9uKHgpCiAgICAgICAgaWYgeCA9PSAnbicgdGhlbiByZXR1cm4gJ1xuJyBlbHNlaWYgeCA9PSAndCcgdGhlbiByZXR1cm4gJ1x0JwogICAgICAgIGVsc2VpZiB4ID09ICdyJyB0aGVuIHJldHVybiAnXHInIGVsc2VpZiB4ID09ICcvJyB0aGVuIHJldHVybiAnLycKICAgICAgICBlbHNlaWYgeCA9PSAnYicgdGhlbiByZXR1cm4gJ1xiJyBlbHNlaWYgeCA9PSAnZicgdGhlbiByZXR1cm4gJ1xmJyBlbHNlIHJldHVybiB4IGVuZAogICAgICBlbmQpKQogICAgICBwb3MgPSBqICsgMQogICAgICByZXR1cm4gYm9keQogICAgZWxzZWlmIGMgPT0gJ3QnIHRoZW4gcG9zID0gcG9zICsgNCByZXR1cm4gdHJ1ZQogICAgZWxzZWlmIGMgPT0gJ2YnIHRoZW4gcG9zID0gcG9zICsgNSByZXR1cm4gZmFsc2UKICAgIGVsc2VpZiBjID09ICduJyB0aGVuIHBvcyA9IHBvcyArIDQgcmV0dXJuIFlOVUxMCiAgICBlbHNlCiAgICAgIGxvY2FsIG51bSA9IHM6bWF0Y2goJ14lLT8lZCslLj8lZCpbZUVdP1slKyUtXT8lZConLCBwb3MpCiAgICAgIGlmIG51bSB0aGVuIHBvcyA9IHBvcyArICNudW0gcmV0dXJuIHRvbnVtYmVyKG51bSkgZW5kCiAgICAgIGVycm9yKCdqc29uOiDml6Dms5Xop6PmnpDlgLzvvIzkvY3nva4gJyAuLiBwb3MpCiAgICBlbmQKICBlbmQKICByZXR1cm4gdmFsdWUoKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gWUFNTCDnvJbnoIHvvIh0YWJsZSDihpIg5paH5pys77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gbmVlZHNfcXVvdGUocykKICBpZiBzID09ICcnIHRoZW4gcmV0dXJuIHRydWUgZW5kCiAgaWYgczptYXRjaCgnXiVzJykgb3IgczptYXRjaCgnJXMkJykgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBzOm1hdGNoKCdeWy0/OiwjJiohfD4lQGAiXCddJykgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBzOm1hdGNoKCdbOiVzXScpIHRoZW4gcmV0dXJuIHRydWUgZW5kICAgICAgICAgIC0tIOWGkuWPt+aIluepuueZvQogIGlmIHM6bG93ZXIoKSA9PSAndHJ1ZScgb3Igczpsb3dlcigpID09ICdmYWxzZScgb3Igczpsb3dlcigpID09ICdudWxsJwogICAgIG9yIHM6bG93ZXIoKSA9PSAneWVzJyBvciBzOmxvd2VyKCkgPT0gJ25vJyBvciBzOmxvd2VyKCkgPT0gJ29uJyBvciBzOmxvd2VyKCkgPT0gJ29mZicgdGhlbgogICAgcmV0dXJuIHRydWUKICBlbmQKICBpZiB0b251bWJlcihzKSB+PSBuaWwgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBzOm1hdGNoKCdbJWNdJykgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICByZXR1cm4gZmFsc2UKZW5kCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfc2NhbGFyKHYpCiAgaWYgdiA9PSBuaWwgb3IgdiA9PSBZTlVMTCB0aGVuIHJldHVybiAnficgZW5kCiAgaWYgdHlwZSh2KSA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCiAgaWYgdHlwZSh2KSA9PSAnbnVtYmVyJyB0aGVuIHJldHVybiBzdHJpbmcuZm9ybWF0KCclZycsIHYpIGVuZAogIGxvY2FsIHMgPSB0b3N0cmluZyh2KQogIGlmIG5lZWRzX3F1b3RlKHMpIHRoZW4KICAgIHJldHVybiAnIicgLi4ganNvbl9lc2NhcGUocykgLi4gJyInCiAgZW5kCiAgcmV0dXJuIHMKZW5kCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfdGFibGUodCwgaW5kZW50KQogIGxvY2FsIHBhZCA9IHN0cmluZy5yZXAoJyAgJywgaW5kZW50KQogIGxvY2FsIG91dCA9IHt9CiAgaWYgaXNfYXJyYXkodCkgdGhlbgogICAgaWYgI3QgPT0gMCB0aGVuIHJldHVybiAnW10nIGVuZAogICAgZm9yIGkgPSAxLCAjdCBkbwogICAgICBsb2NhbCB2ID0gdFtpXQogICAgICBpZiB0eXBlKHYpID09ICd0YWJsZScgYW5kIG5vdCAodiA9PSBZTlVMTCkgdGhlbgogICAgICAgIC0tIOWGheiBlOihqO+8mue8qei/m+S4gOWxggogICAgICAgIGxvY2FsIHN1YiA9IGVuY29kZV90YWJsZSh2LCBpbmRlbnQgKyAxKQogICAgICAgIGlmIGlzX2FycmF5KHYpIHRoZW4KICAgICAgICAgIG91dFsjb3V0ICsgMV0gPSBwYWQgLi4gJy1cbicgLi4gc3ViCiAgICAgICAgZWxzZQogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHBhZCAuLiAnLVxuJyAuLiBzdWIKICAgICAgICBlbmQKICAgICAgZWxzZQogICAgICAgIG91dFsjb3V0ICsgMV0gPSBwYWQgLi4gJy0gJyAuLiBlbmNvZGVfc2NhbGFyKHYpCiAgICAgIGVuZAogICAgZW5kCiAgICByZXR1cm4gdGFibGUuY29uY2F0KG91dCwgJ1xuJykKICBlbHNlCiAgICBsb2NhbCBua2V5cyA9IDAKICAgIGZvciBfIGluIHBhaXJzKHQpIGRvIG5rZXlzID0gbmtleXMgKyAxIGVuZAogICAgaWYgbmtleXMgPT0gMCB0aGVuIHJldHVybiAne30nIGVuZAogICAgLS0g56iz5a6a6aG65bqP77ya5pWw5a2X6ZSu5Y2H5bqP77yM5YW25L2Z5oyJ5Ye6546w6aG65bqP6L+R5Ly877yIcGFpcnMg6aG65bqP5LiN5a6a77yM5YGa566A5Y2V5o6S5bqP77yJCiAgICBsb2NhbCBrZXlzID0ge30KICAgIGZvciBrIGluIHBhaXJzKHQpIGRvIGtleXNbI2tleXMgKyAxXSA9IGsgZW5kCiAgICB0YWJsZS5zb3J0KGtleXMsIGZ1bmN0aW9uKGEsIGIpCiAgICAgIGlmIHR5cGUoYSkgfj0gdHlwZShiKSB0aGVuIHJldHVybiB0eXBlKGEpIDwgdHlwZShiKSBlbmQKICAgICAgcmV0dXJuIHRvc3RyaW5nKGEpIDwgdG9zdHJpbmcoYikKICAgIGVuZCkKICAgIGZvciBfLCBrIGluIGlwYWlycyhrZXlzKSBkbwogICAgICBsb2NhbCB2ID0gdFtrXQogICAgICBsb2NhbCBrZXlzdHIgPSB0eXBlKGspID09ICdzdHJpbmcnIGFuZCAobmVlZHNfcXVvdGUoaykgYW5kICgnIicgLi4ganNvbl9lc2NhcGUoaykgLi4gJyInKSBvciBrKSBvciB0b3N0cmluZyhrKQogICAgICBpZiB0eXBlKHYpID09ICd0YWJsZScgYW5kIHYgfj0gWU5VTEwgdGhlbgogICAgICAgIGlmIChpc19hcnJheSh2KSBhbmQgI3YgPT0gMCkgb3IgKChub3QgaXNfYXJyYXkodikpIGFuZCAoZnVuY3Rpb24oKSBsb2NhbCBjPTAgZm9yIF8gaW4gcGFpcnModikgZG8gYz1jKzEgZW5kIHJldHVybiBjPT0wIGVuZCkoKSkgdGhlbgogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHBhZCAuLiBrZXlzdHIgLi4gJzogJyAuLiAoaXNfYXJyYXkodikgYW5kICdbXScgb3IgJ3t9JykKICAgICAgICBlbHNlCiAgICAgICAgICBvdXRbI291dCArIDFdID0gcGFkIC4uIGtleXN0ciAuLiAnOicKICAgICAgICAgIG91dFsjb3V0ICsgMV0gPSBlbmNvZGVfdGFibGUodiwgaW5kZW50ICsgMSkKICAgICAgICBlbmQKICAgICAgZWxzZQogICAgICAgIG91dFsjb3V0ICsgMV0gPSBwYWQgLi4ga2V5c3RyIC4uICc6ICcgLi4gZW5jb2RlX3NjYWxhcih2KQogICAgICBlbmQKICAgIGVuZAogICAgcmV0dXJuIHRhYmxlLmNvbmNhdChvdXQsICdcbicpCiAgZW5kCmVuZAoKZnVuY3Rpb24geWFtbC5lbmNvZGUodCkKICBpZiB0ID09IG5pbCBvciB0ID09IFlOVUxMIHRoZW4gcmV0dXJuICd+XG4nIGVuZAogIGlmIHR5cGUodCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiBlbmNvZGVfc2NhbGFyKHQpIC4uICdcbicgZW5kCiAgcmV0dXJuIGVuY29kZV90YWJsZSh0LCAwKSAuLiAnXG4nCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVREYg5YiG5Y+R5YyF6KOFCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KcmV0dXJuIGZ1bmN0aW9uKHApCiAgaWYgdHlwZShwKSA9PSAnc3RyaW5nJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeWFtbC5sb2FkKHApKQogIGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2xvYWQnCiAgaWYgb3AgPT0gJ2xvYWQnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh5YW1sLmxvYWQocC52IG9yICcnKSkKICBlbHNlaWYgb3AgPT0gJ2VuY29kZScgdGhlbgogICAgbG9jYWwgdCA9IHAudgogICAgaWYgdHlwZSh0KSA9PSAnc3RyaW5nJyB0aGVuIHQgPSBqc29uX2RlY29kZSh0KSBlbmQKICAgIHJldHVybiB5YW1sLmVuY29kZSh0KQogIGVsc2VpZiBvcCA9PSAnZW5jb2RlX2Zyb21fbHVhJyB0aGVuCiAgICAtLSBwLnYg55u05o6l5pivIEx1YSDooajvvIhEdWNrREIgTElTVC9TVFJVQ1Qg5Lyg5YWl77yJCiAgICByZXR1cm4geWFtbC5lbmNvZGUocC52KQogIGVuZAogIHJldHVybiAnJwplbmQKAC0tIEBsaWI6IHhtbAotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogWE1MIOino+aekO+8iOe6ryBMdWHvvIzoh6rljIXlkKvvvInjgIJ4bWwyanMg6aOO5qC85a+56LGh5YyW77ya5bGe5oCnIOKGkiBA5ZCN77yM6YeN5aSN5a2Q5qCH562+IOKGkiDmlbDnu4TvvIwKLS0gICAgICAg5Y+25a2Q5paH5pysIOKGkiDlrZfnrKbkuLLjgIJvcD0nbG9hZCfvvJpYTUwg5paH5pysIOKGkiBKU09OIOWtl+espuS4su+8iOmFjSBqc29uX2V4dHJhY3Qg5bGV5byA77yJ77ybCi0tICAgICAgIG9wPSdmaW5kJ++8mueugOWNlei3r+W+hCAvL3RhZy9zdWIg4oaSIOWMuemFjeiKgueCuSBKU09OIOaVsOe7hO+8iHRhZyDmiJYgJyon77yJ77ybCi0tICAgICAgIG9wPSdhdHRyJ++8mui3r+W+hCvlsZ7mgKflkI0g4oaSIOWxnuaAp+WAvO+8m29wPSd0ZXh0J++8muWOu+mZpOaJgOacieagh+etvueahOe6r+aWh+acrOOAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yM6Ieq5YyF5ZCr5peg5aSW6YOo5L6d6LWW77yJCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0g5pSv5oyB5a2Q6ZuG77yI6K+a5a6e6L6555WM77yJ77ya5YWD57SgL+WxnuaApy/mlofmnKwvQ0RBVEEv5rOo6YeKL1BJL+WjsOaYji/lrp7kvZMoJmFtcDvnrYkrJiNOTjsrJiN4Tk47KeOAggotLSDmnKrmlK/mjIHvvJrlkb3lkI3nqbrpl7TliY3nvIDvvIjkv53nlZnljp/moLfkvZwgdGFnIOWQje+8ieOAgURURCDlrp7kvZPlrprkuYnjgIFYU0TjgIIKLS0KLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQsIHNjYWxhciBtb2RlKToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSd4bWwnKTsKLS0gICBsb2FkOiAgICAgU0VMRUNUIGx1YWppdF9zKCd4bWwnLCB7djogJzxhPjxiPjE8L2I+PGI+MjwvYj48L2E+Jywgb3A6ICdsb2FkJ30pOwotLSAgICAgICAgICAgICDihpIgeyJhIjp7ImIiOlsiMSIsIjIiXX19Ci0tICAgZHJpbGw6ICAgIFNFTEVDVCBqc29uX2V4dHJhY3QobHVhaml0X3MoJ3htbCcsIHt2OiB4LCBvcDogJ2xvYWQnfSksICckLmEuYlswXScpOwotLSAgIGZpbmQ6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3htbCcsIHt2OiB4LCBvcDogJ2ZpbmQnLCBwYXRoOiAnLy9ib29rL3RpdGxlJ30pOwotLSAgIGF0dHI6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3htbCcsIHt2OiB4LCBvcDogJ2F0dHInLCBwYXRoOiAnLy9ib29rJywgbmFtZTogJ2lkJ30pOwotLSAgIHRleHQ6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3htbCcsIHt2OiAnPHA+aGkgPGI+Ym9sZDwvYj48L3A+Jywgb3A6ICd0ZXh0J30pOyAg4oaSICJoaSBib2xkIgoKbG9jYWwgeG1sID0ge30KCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5a6e5L2T6Kej56CBCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgRU5UID0geyBhbXAgPSAnJicsIGx0ID0gJzwnLCBndCA9ICc+JywgcXVvdCA9ICciJywgYXBvcyA9ICInIiB9Cgpsb2NhbCBmdW5jdGlvbiBkZWNvZGVfZW50aXRpZXMocykKICBzID0gKHM6Z3N1YignJiN4KFswLTlhLWZBLUZdKyk7JywgZnVuY3Rpb24oaCkKICAgIGxvY2FsIGMgPSB0b251bWJlcihoLCAxNikKICAgIHJldHVybiBjIGFuZCBjIDwgMTI4IGFuZCBzdHJpbmcuY2hhcihjKSBvciAnPycKICBlbmQpKQogIHMgPSAoczpnc3ViKCcmIyhbMC05XSspOycsIGZ1bmN0aW9uKGgpCiAgICBsb2NhbCBjID0gdG9udW1iZXIoaCkKICAgIHJldHVybiBjIGFuZCBjIDwgMTI4IGFuZCBzdHJpbmcuY2hhcihjKSBvciAnPycKICBlbmQpKQogIHMgPSAoczpnc3ViKCcmKFslYV1bJXddKik7JywgZnVuY3Rpb24obikgcmV0dXJuIEVOVFtuXSBvciAoJyYnIC4uIG4gLi4gJzsnKSBlbmQpKQogIHJldHVybiBzCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDor43ms5Ug4oaSIOivreazleagkQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIG1ha2Vfbm9kZShuYW1lKQogIHJldHVybiB7IG5hbWUgPSBuYW1lLCBhdHRycyA9IHt9LCBjb250ZW50ID0ge30sIGNoaWxkcmVuID0ge30gfQplbmQKCi0tIOWcqCBwb3Mg5aSE6Kej5p6Q5LiA5Liq5a6M5pW05YWD57Sg77yM6L+U5ZueIChub2RlLCBuZXdwb3MpCmxvY2FsIHBhcnNlX2VsZW1lbnQKCmxvY2FsIGZ1bmN0aW9uIHNraXBfd3MocywgaSkKICB3aGlsZSBpIDw9ICNzIGFuZCBzOnN1YihpLCBpKTptYXRjaCgnJXMnKSBkbyBpID0gaSArIDEgZW5kCiAgcmV0dXJuIGkKZW5kCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9hdHRyaWJ1dGVzKHMsIGkpCiAgbG9jYWwgYXR0cnMgPSB7fQogIHdoaWxlIHRydWUgZG8KICAgIGkgPSBza2lwX3dzKHMsIGkpCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJy8nIG9yIGMgPT0gJz4nIG9yIGMgPT0gJycgdGhlbiByZXR1cm4gYXR0cnMsIGkgZW5kCiAgICBsb2NhbCBuYW1lID0gczptYXRjaCgnKFslYV8lOiUtXVsldyU6JS4lLV0qKScsIGkpCiAgICBpZiBub3QgbmFtZSB0aGVuIGVycm9yKCd4bWw6IOmdnuazleWxnuaAp+WQje+8jOS9jee9riAnIC4uIGkpIGVuZAogICAgaSA9IGkgKyAjbmFtZQogICAgaSA9IHNraXBfd3MocywgaSkKICAgIGlmIHM6c3ViKGksIGkpIH49ICc9JyB0aGVuIGVycm9yKCd4bWw6IOWxnuaApyAnIC4uIG5hbWUgLi4gJyDnvLogPe+8jOS9jee9riAnIC4uIGkpIGVuZAogICAgaSA9IHNraXBfd3MocywgaSArIDEpCiAgICBsb2NhbCBxID0gczpzdWIoaSwgaSkKICAgIGlmIHEgfj0gJyInIGFuZCBxIH49ICInIiB0aGVuCiAgICAgIGVycm9yKCd4bWw6IOWxnuaApyAnIC4uIG5hbWUgLi4gJyDlgLznvLrlvJXlj7fvvIzkvY3nva4gJyAuLiBpKQogICAgZW5kCiAgICBsb2NhbCBlID0gczpmaW5kKHEsIGkgKyAxLCB0cnVlKQogICAgaWYgbm90IGUgdGhlbiBlcnJvcigneG1sOiDlsZ7mgKcgJyAuLiBuYW1lIC4uICcg5byV5Y+35pyq6Zet5ZCIJykgZW5kCiAgICBhdHRyc1tuYW1lXSA9IGRlY29kZV9lbnRpdGllcyhzOnN1YihpICsgMSwgZSAtIDEpKQogICAgaSA9IGUgKyAxCiAgZW5kCmVuZAoKcGFyc2VfZWxlbWVudCA9IGZ1bmN0aW9uKHMsIGkpCiAgLS0gc1tpXSA9PSAnPCfvvIxzW2krMV0g5piv5ZCN56ew6aaW5a2X56ymCiAgbG9jYWwgbmFtZSA9IHM6bWF0Y2goJ1slYV8lOiUtXVsldyU6JS4lLV0qJywgaSArIDEpCiAgaWYgbm90IG5hbWUgdGhlbiBlcnJvcigneG1sOiDpnZ7ms5XlhYPntKDlkI3vvIzkvY3nva4gJyAuLiBpKSBlbmQKICBpID0gaSArIDEgKyAjbmFtZQogIGxvY2FsIG5vZGUgPSBtYWtlX25vZGUobmFtZSkKICBsb2NhbCBhdHRycywgaiA9IHBhcnNlX2F0dHJpYnV0ZXMocywgaSkKICBub2RlLmF0dHJzID0gYXR0cnMKICBpID0gagogIGxvY2FsIGMgPSBzOnN1YihpLCBpKQogIGlmIGMgPT0gJy8nIHRoZW4KICAgIC0tIOiHqumXreWQiAogICAgaWYgczpzdWIoaSArIDEsIGkgKyAxKSB+PSAnPicgdGhlbiBlcnJvcigneG1sOiDoh6rpl63lkIjmoIfnrb4gJyAuLiBuYW1lIC4uICcg6Z2e5rOVJykgZW5kCiAgICByZXR1cm4gbm9kZSwgaSArIDIKICBlbHNlaWYgYyA9PSAnPicgdGhlbgogICAgaSA9IGkgKyAxCiAgZWxzZQogICAgZXJyb3IoJ3htbDog5YWD57SgICcgLi4gbmFtZSAuLiAnIOagh+etvue7k+adn+mdnuazle+8jOS9jee9riAnIC4uIGkpCiAgZW5kCiAgLS0g5YaF5a6577ya5pyJ5bqPICh0ZXh0fGVsZW1lbnQpIOWIl+ihqO+8jOebtOWIsCA8L25hbWU+CiAgbG9jYWwgY29udGVudCA9IG5vZGUuY29udGVudAogIHdoaWxlIGkgPD0gI3MgZG8KICAgIGlmIHM6c3ViKGksIGkpID09ICc8JyB0aGVuCiAgICAgIGxvY2FsIGMyID0gczpzdWIoaSArIDEsIGkgKyAxKQogICAgICBpZiBjMiA9PSAnLycgdGhlbgogICAgICAgIC0tIOe7k+adn+agh+etvgogICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz4nLCBpKQogICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDog57uT5p2f5qCH562+5pyq6Zet5ZCI77yM5L2N572uICcgLi4gaSkgZW5kCiAgICAgICAgbG9jYWwgaW5uZXIgPSBzOnN1YihpICsgMiwgZSAtIDEpCiAgICAgICAgbG9jYWwgZW5hbWUgPSBpbm5lcjptYXRjaCgnXihbJWFfJTolLV1bJXclOiUuJS1dKiklcyokJykKICAgICAgICBpZiBub3QgZW5hbWUgdGhlbiBlcnJvcigneG1sOiDnu5PmnZ/moIfnrb7pnZ7ms5XvvIzkvY3nva4gJyAuLiBpKSBlbmQKICAgICAgICBpZiBlbmFtZSB+PSBuYW1lIHRoZW4KICAgICAgICAgIGVycm9yKCd4bWw6IOagh+etvuS4jeWMuemFje+8jOacn+acmyA8LycgLi4gbmFtZSAuLiAnPu+8jOS9jee9riAnIC4uIGkpCiAgICAgICAgZW5kCiAgICAgICAgcmV0dXJuIG5vZGUsIGUgKyAxCiAgICAgIGVsc2VpZiBjMiA9PSAnIScgdGhlbgogICAgICAgIC0tIENEQVRBIOaIliDms6jph4og5oiWIERPQ1RZUEUKICAgICAgICBpZiBzOnN1YihpICsgMSwgaSArIDgpID09ICchW0NEQVRBWycgdGhlbgogICAgICAgICAgbG9jYWwgZSA9IHM6ZmluZCgnXV0+JywgaSwgdHJ1ZSkKICAgICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDogQ0RBVEEg5pyq6Zet5ZCIJykgZW5kCiAgICAgICAgICB0YWJsZS5pbnNlcnQoY29udGVudCwgeyB0ID0gJ3RleHQnLCB2ID0gczpzdWIoaSArIDksIGUgLSAxKSB9KQogICAgICAgICAgaSA9IGUgKyAzCiAgICAgICAgZWxzZWlmIHM6c3ViKGkgKyAxLCBpICsgMykgPT0gJyEtLScgdGhlbgogICAgICAgICAgbG9jYWwgZSA9IHM6ZmluZCgnLS0+JywgaSwgdHJ1ZSkKICAgICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDog5rOo6YeK5pyq6Zet5ZCIJykgZW5kCiAgICAgICAgICBpID0gZSArIDMKICAgICAgICBlbHNlCiAgICAgICAgICAtLSBET0NUWVBFIC8g5YW25LuW5aOw5piO77yM6Lez6L+H5YiwID4KICAgICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz4nLCBpLCB0cnVlKQogICAgICAgICAgaWYgbm90IGUgdGhlbiBlcnJvcigneG1sOiDlo7DmmI7mnKrpl63lkIgnKSBlbmQKICAgICAgICAgIGkgPSBlICsgMQogICAgICAgIGVuZAogICAgICBlbHNlaWYgYzIgPT0gJz8nIHRoZW4KICAgICAgICAtLSBQSSA8PyAuLi4gPz4KICAgICAgICBsb2NhbCBlID0gczpmaW5kKCc/PicsIGksIHRydWUpCiAgICAgICAgaWYgbm90IGUgdGhlbiBlcnJvcigneG1sOiBQSSDmnKrpl63lkIgnKSBlbmQKICAgICAgICBpID0gZSArIDIKICAgICAgZWxzZQogICAgICAgIC0tIOWtkOWFg+e0oAogICAgICAgIGxvY2FsIGNoaWxkLCBuaSA9IHBhcnNlX2VsZW1lbnQocywgaSkKICAgICAgICBub2RlLmNoaWxkcmVuWyNub2RlLmNoaWxkcmVuICsgMV0gPSBjaGlsZAogICAgICAgIHRhYmxlLmluc2VydChjb250ZW50LCB7IHQgPSAnZWwnLCB2ID0gY2hpbGQgfSkKICAgICAgICBpID0gbmkKICAgICAgZW5kCiAgICBlbHNlCiAgICAgIC0tIOaWh+acrO+8mue0r+enr+WIsOS4i+S4gOS4qiAnPCcKICAgICAgbG9jYWwgZSA9IHM6ZmluZCgnPCcsIGkpCiAgICAgIGxvY2FsIGNodW5rCiAgICAgIGlmIGUgdGhlbgogICAgICAgIGNodW5rID0gczpzdWIoaSwgZSAtIDEpCiAgICAgICAgaSA9IGUKICAgICAgZWxzZQogICAgICAgIGNodW5rID0gczpzdWIoaSkKICAgICAgICBpID0gI3MgKyAxCiAgICAgIGVuZAogICAgICB0YWJsZS5pbnNlcnQoY29udGVudCwgeyB0ID0gJ3RleHQnLCB2ID0gZGVjb2RlX2VudGl0aWVzKGNodW5rKSB9KQogICAgZW5kCiAgZW5kCiAgZXJyb3IoJ3htbDog5YWD57SgICcgLi4gbmFtZSAuLiAnIOacqumXreWQiCcpCmVuZAoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfZG9jdW1lbnQocykKICAtLSDljrvmjokgQk9NCiAgcyA9IChzOmdzdWIoJ14lYm9tJywgJycpKQogIGxvY2FsIGkgPSBza2lwX3dzKHMsIDEpCiAgbG9jYWwgcm9vdCA9IG5pbAogIHdoaWxlIGkgPD0gI3MgZG8KICAgIGlmIHM6c3ViKGksIGkpID09ICc8JyB0aGVuCiAgICAgIGxvY2FsIGMyID0gczpzdWIoaSArIDEsIGkgKyAxKQogICAgICBpZiBjMiA9PSAnIScgdGhlbgogICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz4nLCBpLCB0cnVlKQogICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDog5aOw5piO5pyq6Zet5ZCIJykgZW5kCiAgICAgICAgaSA9IGUgKyAxCiAgICAgIGVsc2VpZiBjMiA9PSAnPycgdGhlbgogICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz8+JywgaSwgdHJ1ZSkKICAgICAgICBpZiBub3QgZSB0aGVuIGVycm9yKCd4bWw6IFBJIOacqumXreWQiCcpIGVuZAogICAgICAgIGkgPSBlICsgMgogICAgICBlbHNlCiAgICAgICAgbG9jYWwgbm9kZSwgbmkgPSBwYXJzZV9lbGVtZW50KHMsIGkpCiAgICAgICAgaWYgcm9vdCA9PSBuaWwgdGhlbgogICAgICAgICAgcm9vdCA9IG5vZGUKICAgICAgICBlbHNlCiAgICAgICAgICAtLSDlpJrmoLnvvJrljIXkuIDlsYIKICAgICAgICAgIGxvY2FsIHdyYXBwZXIgPSBtYWtlX25vZGUoJyNyb290JykKICAgICAgICAgIHdyYXBwZXIuY2hpbGRyZW5bI3dyYXBwZXIuY2hpbGRyZW4gKyAxXSA9IHJvb3QKICAgICAgICAgIHdyYXBwZXIuY2hpbGRyZW5bI3dyYXBwZXIuY2hpbGRyZW4gKyAxXSA9IG5vZGUKICAgICAgICAgIHJvb3QgPSB3cmFwcGVyCiAgICAgICAgZW5kCiAgICAgICAgaSA9IG5pCiAgICAgICAgaSA9IHNraXBfd3MocywgaSkKICAgICAgZW5kCiAgICBlbHNlCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgaWYgbm90IHJvb3QgdGhlbiBlcnJvcigneG1sOiDnqbrmlofmoaMnKSBlbmQKICByZXR1cm4gcm9vdAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5qCRIOKGkiB4bWwyanMg6aOO5qC8IEpTT04g5YW85a656KGoCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gY29sbGVjdF90ZXh0KG5vZGUpCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgXywgaXQgaW4gaXBhaXJzKG5vZGUuY29udGVudCkgZG8KICAgIGlmIGl0LnQgPT0gJ3RleHQnIHRoZW4KICAgICAgb3V0WyNvdXQgKyAxXSA9IGl0LnYKICAgIGVsc2UKICAgICAgbG9jYWwgc3ViID0gY29sbGVjdF90ZXh0KGl0LnYpCiAgICAgIGlmIHN1YiB+PSAnJyB0aGVuIG91dFsjb3V0ICsgMV0gPSBzdWIgZW5kCiAgICBlbmQKICBlbmQKICByZXR1cm4gKHRhYmxlLmNvbmNhdChvdXQpOmdzdWIoJyVzKycsICcgJyk6bWF0Y2goJ14lcyooLi0pJXMqJCcpKQplbmQKCmxvY2FsIGZ1bmN0aW9uIG9iamVjdGlmeShub2RlKQogIGxvY2FsIGhhc19lbCA9ICNub2RlLmNoaWxkcmVuID4gMAogIC0tIOS7juacieW6jyBjb250ZW50IOaPkOWPluaWh+acrAogIGxvY2FsIHRleHRfaXRlbXMgPSB7fQogIGZvciBfLCBpdCBpbiBpcGFpcnMobm9kZS5jb250ZW50KSBkbwogICAgaWYgaXQudCA9PSAndGV4dCcgdGhlbiB0ZXh0X2l0ZW1zWyN0ZXh0X2l0ZW1zICsgMV0gPSBpdC52IGVuZAogIGVuZAogIGxvY2FsIHJhd3R4dCA9IHRhYmxlLmNvbmNhdCh0ZXh0X2l0ZW1zKQogIGxvY2FsIHR4dCA9IHJhd3R4dDptYXRjaCgnXiVzKiguLSklcyokJykKICBpZiBub3QgaGFzX2VsIHRoZW4KICAgIC0tIOWPtuWtkAogICAgaWYgbmV4dChub2RlLmF0dHJzKSB0aGVuCiAgICAgIGxvY2FsIHJlc3VsdCA9IHt9CiAgICAgIGZvciBrLCB2IGluIHBhaXJzKG5vZGUuYXR0cnMpIGRvIHJlc3VsdFsnQCcgLi4ga10gPSB2IGVuZAogICAgICBpZiB0eHQgfj0gJycgdGhlbiByZXN1bHRbJyN0ZXh0J10gPSB0eHQgZW5kCiAgICAgIHJldHVybiByZXN1bHQKICAgIGVuZAogICAgcmV0dXJuIHR4dAogIGVuZAogIC0tIOacieWtkOWFg+e0oAogIGxvY2FsIHJlc3VsdCA9IHt9CiAgZm9yIGssIHYgaW4gcGFpcnMobm9kZS5hdHRycykgZG8gcmVzdWx0WydAJyAuLiBrXSA9IHYgZW5kCiAgbG9jYWwgZ3JvdXBzLCBvcmRlciA9IHt9LCB7fQogIGZvciBfLCBjaCBpbiBpcGFpcnMobm9kZS5jaGlsZHJlbikgZG8KICAgIGlmIGdyb3Vwc1tjaC5uYW1lXSA9PSBuaWwgdGhlbgogICAgICBncm91cHNbY2gubmFtZV0gPSB7fQogICAgICBvcmRlclsjb3JkZXIgKyAxXSA9IGNoLm5hbWUKICAgIGVuZAogICAgdGFibGUuaW5zZXJ0KGdyb3Vwc1tjaC5uYW1lXSwgY2gpCiAgZW5kCiAgaWYgdHh0IH49ICcnIHRoZW4gcmVzdWx0WycjdGV4dCddID0gdHh0IGVuZAogIGZvciBfLCBubSBpbiBpcGFpcnMob3JkZXIpIGRvCiAgICBsb2NhbCBsaXN0ID0gZ3JvdXBzW25tXQogICAgaWYgI2xpc3QgPT0gMSB0aGVuCiAgICAgIHJlc3VsdFtubV0gPSBvYmplY3RpZnkobGlzdFsxXSkKICAgIGVsc2UKICAgICAgbG9jYWwgYXJyID0ge30KICAgICAgZm9yIF8sIGNoIGluIGlwYWlycyhsaXN0KSBkbyBhcnJbI2FyciArIDFdID0gb2JqZWN0aWZ5KGNoKSBlbmQKICAgICAgcmVzdWx0W25tXSA9IGFycgogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHJlc3VsdAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6Lev5b6E5Yy56YWN77yILy9kZXNjZW5kYW50IOS4jiAvY2hpbGTvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBzcGxpdChzLCBzZXApCiAgbG9jYWwgb3V0ID0ge30KICBsb2NhbCBzdGFydCA9IDEKICB3aGlsZSB0cnVlIGRvCiAgICBsb2NhbCBhLCBiID0gczpmaW5kKHNlcCwgc3RhcnQpCiAgICBpZiBhIHRoZW4KICAgICAgb3V0WyNvdXQgKyAxXSA9IHM6c3ViKHN0YXJ0LCBhIC0gMSkKICAgICAgc3RhcnQgPSBiICsgMQogICAgZWxzZQogICAgICBvdXRbI291dCArIDFdID0gczpzdWIoc3RhcnQpCiAgICAgIGJyZWFrCiAgICBlbmQKICBlbmQKICByZXR1cm4gb3V0CmVuZAoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfcGF0aChwYXRoKQogIGxvY2FsIHN0ZXBzID0ge30KICBsb2NhbCBtYXJrZWQgPSBwYXRoOmdzdWIoJy8vJywgJy9eLycpICAtLSDov57nu63mlpzmnaDmoIforrDkuLrlkI7ku6MKICBsb2NhbCBkZXNjID0gZmFsc2UKICBmb3IgXywgcGFydCBpbiBpcGFpcnMoc3BsaXQobWFya2VkLCAnLycpKSBkbwogICAgaWYgcGFydCA9PSAnJyB0aGVuCiAgICAgIC0tIOaXoAogICAgZWxzZWlmIHBhcnQgPT0gJ14nIHRoZW4KICAgICAgZGVzYyA9IHRydWUKICAgIGVsc2UKICAgICAgc3RlcHNbI3N0ZXBzICsgMV0gPSB7IHRhZyA9IHBhcnQsIG1vZGUgPSBkZXNjIGFuZCAnZGVzYycgb3IgJ2NoaWxkJyB9CiAgICAgIGRlc2MgPSBmYWxzZQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHN0ZXBzCmVuZAoKbG9jYWwgZnVuY3Rpb24gYWxsX2Rlc2NlbmRhbnRzKG5vZGUsIG91dCkKICBmb3IgXywgY2ggaW4gaXBhaXJzKG5vZGUuY2hpbGRyZW4pIGRvCiAgICBvdXRbI291dCArIDFdID0gY2gKICAgIGFsbF9kZXNjZW5kYW50cyhjaCwgb3V0KQogIGVuZAplbmQKCmxvY2FsIGZ1bmN0aW9uIG1hdGNoX3BhdGgocm9vdCwgcGF0aCkKICBsb2NhbCBzdGVwcyA9IHBhcnNlX3BhdGgocGF0aCkKICBpZiAjc3RlcHMgPT0gMCB0aGVuIHJldHVybiB7fSBlbmQKICBsb2NhbCBzZXQgPSB7IHJvb3QgfQogIGxvY2FsIHNlZW4gPSB7fQogIGZvciBfLCBzdGVwIGluIGlwYWlycyhzdGVwcykgZG8KICAgIGxvY2FsIG5leHRfc2V0ID0ge30KICAgIGZvciBfLCBub2RlIGluIGlwYWlycyhzZXQpIGRvCiAgICAgIGxvY2FsIGNhbmRzCiAgICAgIGlmIHN0ZXAubW9kZSA9PSAnZGVzYycgdGhlbgogICAgICAgIGNhbmRzID0ge30KICAgICAgICBhbGxfZGVzY2VuZGFudHMobm9kZSwgY2FuZHMpCiAgICAgIGVsc2UKICAgICAgICBjYW5kcyA9IG5vZGUuY2hpbGRyZW4KICAgICAgZW5kCiAgICAgIGZvciBfLCBjaCBpbiBpcGFpcnMoY2FuZHMpIGRvCiAgICAgICAgaWYgKGNoLm5hbWUgPT0gc3RlcC50YWcgb3Igc3RlcC50YWcgPT0gJyonKSBhbmQgbm90IHNlZW5bY2hdIHRoZW4KICAgICAgICAgIHNlZW5bY2hdID0gdHJ1ZQogICAgICAgICAgbmV4dF9zZXRbI25leHRfc2V0ICsgMV0gPSBjaAogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogICAgc2V0ID0gbmV4dF9zZXQKICBlbmQKICByZXR1cm4gc2V0CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBKU09OIOe8luino+egge+8iOS4jiB5YW1sIOW6k+S4gOiHtOeahOeyvueugOWunueOsO+8jOiHquWMheWQq++8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGpzb25fZXNjYXBlKHMpCiAgcmV0dXJuIChzOmdzdWIoJ1slYyJcXF0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnIicgdGhlbiByZXR1cm4gJ1xcIicKICAgIGVsc2VpZiBjID09ICdcXCcgdGhlbiByZXR1cm4gJ1xcXFwnCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nCiAgICBlbHNlaWYgYyA9PSAnXHInIHRoZW4gcmV0dXJuICdcXHInCiAgICBlbHNlaWYgYyA9PSAnXHQnIHRoZW4gcmV0dXJuICdcXHQnCiAgICBlbHNlIHJldHVybiBzdHJpbmcuZm9ybWF0KCdcXHUlMDR4JywgYzpieXRlKCkpIGVuZAogIGVuZCkpCmVuZAoKbG9jYWwgZnVuY3Rpb24gaXNfYXJyYXkodCkKICBsb2NhbCBuID0gMAogIGZvciBrIGluIHBhaXJzKHQpIGRvCiAgICBpZiB0eXBlKGspIH49ICdudW1iZXInIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogICAgbiA9IG4gKyAxCiAgZW5kCiAgZm9yIGkgPSAxLCBuIGRvIGlmIHRbaV0gPT0gbmlsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZCBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCmxvY2FsIGpzb25fZW5jb2RlX3ZhbAoKanNvbl9lbmNvZGVfdmFsID0gZnVuY3Rpb24odikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgbG9jYWwgdHYgPSB0eXBlKHYpCiAgaWYgdHYgPT0gJ2Jvb2xlYW4nIHRoZW4gcmV0dXJuIHYgYW5kICd0cnVlJyBvciAnZmFsc2UnIGVuZAogIGlmIHR2ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiBvciB2ID09IG1hdGguaHVnZSBvciB2ID09IC1tYXRoLmh1Z2UgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVnJywgdikKICBlbmQKICBpZiB0diA9PSAnc3RyaW5nJyB0aGVuIHJldHVybiAnIicgLi4ganNvbl9lc2NhcGUodikgLi4gJyInIGVuZAogIGlmIHR2ID09ICd0YWJsZScgdGhlbgogICAgaWYgaXNfYXJyYXkodikgdGhlbgogICAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICAgIGZvciBpID0gMSwgI3YgZG8gcGFydHNbaV0gPSBqc29uX2VuY29kZV92YWwodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogICAgZWxzZQogICAgICBsb2NhbCBrZXlzID0ge30KICAgICAgZm9yIGsgaW4gcGFpcnModikgZG8ga2V5c1sja2V5cyArIDFdID0gayBlbmQKICAgICAgdGFibGUuc29ydChrZXlzLCBmdW5jdGlvbihhLCBiKSByZXR1cm4gdG9zdHJpbmcoYSkgPCB0b3N0cmluZyhiKSBlbmQpCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIF8sIGsgaW4gaXBhaXJzKGtleXMpIGRvCiAgICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSAnIicgLi4ganNvbl9lc2NhcGUodG9zdHJpbmcoaykpIC4uICciOicgLi4ganNvbl9lbmNvZGVfdmFsKHZba10pCiAgICAgIGVuZAogICAgICByZXR1cm4gJ3snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnfScKICAgIGVuZAogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX2VuY29kZSh2KSByZXR1cm4ganNvbl9lbmNvZGVfdmFsKHYpIGVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVREYg5YiG5Y+R5YyF6KOFCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gbG9hZF93cmFwcGVkKHNyYykKICBsb2NhbCByb290ID0gcGFyc2VfZG9jdW1lbnQoc3JjKQogIHJldHVybiB7IFtyb290Lm5hbWVdID0gb2JqZWN0aWZ5KHJvb3QpIH0KZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZShsb2FkX3dyYXBwZWQocCkpCiAgZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIHYgPSBwLnYgb3IgJycKICBpZiB2ID09ICcnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIG9wID0gcC5vcCBvciAnbG9hZCcKICBsb2NhbCByb290ID0gcGFyc2VfZG9jdW1lbnQodikKICBpZiBvcCA9PSAnbG9hZCcgdGhlbgogICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgW3Jvb3QubmFtZV0gPSBvYmplY3RpZnkocm9vdCkgfSkKICBlbHNlaWYgb3AgPT0gJ2ZpbmQnIHRoZW4KICAgIGxvY2FsIG5vZGVzID0gbWF0Y2hfcGF0aChyb290LCBwLnBhdGggb3IgJycpCiAgICBsb2NhbCBhcnIgPSB7fQogICAgZm9yIF8sIG4gaW4gaXBhaXJzKG5vZGVzKSBkbwogICAgICBhcnJbI2FyciArIDFdID0gb2JqZWN0aWZ5KG4pCiAgICBlbmQKICAgIHJldHVybiBqc29uX2VuY29kZShhcnIpCiAgZWxzZWlmIG9wID09ICdhdHRyJyB0aGVuCiAgICBsb2NhbCBub2RlcyA9IG1hdGNoX3BhdGgocm9vdCwgcC5wYXRoIG9yICcnKQogICAgaWYgI25vZGVzID4gMCBhbmQgbm9kZXNbMV0uYXR0cnNbcC5uYW1lXSB+PSBuaWwgdGhlbgogICAgICByZXR1cm4gbm9kZXNbMV0uYXR0cnNbcC5uYW1lXQogICAgZW5kCiAgICByZXR1cm4gbmlsCiAgZWxzZWlmIG9wID09ICd0ZXh0JyB0aGVuCiAgICByZXR1cm4gY29sbGVjdF90ZXh0KHJvb3QpCiAgZW5kCiAgcmV0dXJuICcnCmVuZAoAUEFOSUM6IHVucHJvdGVjdGVkIGVycm9yIGluIGNhbGwgdG8gTHVhIEFQSSAoJXMpCgAtLSBAbGliOiBwZ3JvdXRpbmcKLS0gQGNhdGVnb3J5OiB1ZGYKLS0gQGRlc2M6IOe9kee7nOacgOefrei3r++8iHBncm91dGluZyDmoLjlv4PnrpflrZAgc2hvcnRlc3RfcGF0aCDnmoQgRGlqa3N0cmEg5a6e546w77yJ77yM57qvIEx1YeOAgembtiBGRknjgIEKLS0gICAgICAg5Y2V5paH5Lu244CC6L6T5YWl5LiA57uE6L65IChzcmNfbm9kZSwgdGd0X25vZGUsIGNvc3Qp77yM6L6T5Ye65rqQ4oaS55uu55qE5pyA55+t6Lev5b6E6IqC54K55bqP5YiXICsg5oC75Luj5Lu344CCCi0tICAgICAgIOS4jiBQRyBwZ3JvdXRpbmcg55qEIF9wZ3JfZGlqa3N0cmEg6K+t5LmJ5a+56b2Q77ya5oyJIGNvc3Qg5Yqg5p2D44CB5peg6LSf5p2D6KaB5rGC77yIRGlqa3N0cmHvvInjgIIKLS0gICAgICAg6buY6K6k5pyJ5ZCR5Zu+77yIZGlyZWN0ZWQ9dHJ1Ze+8ie+8m2RpcmVjdGVkPWZhbHNlIOaXtui+ueinhuS4uuWPjOWQke+8iOaXoOWQke+8ieOAggotLSAgICAgICDlpJrnm67moIcv5aSa5rqQ77yacGdyb3V0aW5nIOeahCBfcGdyX2tkaWprc3RyYSDlj5jkvZPvvIhrIOadoeacgOefrei3r+W+hO+8ieWPr+WQjue7reWKoOOAggotLSAgICAgICDlj4LmlbDvvIhzdHJ1Y3TvvInvvJoKLS0gICAgICAgICBlZGdlcyAgIDogYXJyYXkgb2YgW3UsIHYsIHdd77yIdS92IOaVtOaVsOiKgueCue+8jHcg5pWw5YC85Luj5Lu377yM5b+F6aG7ID4wIOaIliA+PTDvvIkKLS0gICAgICAgICBzcmMgICAgIDog5rqQ6IqC54K577yI5pW05pWw77yJCi0tICAgICAgICAgdGd0ICAgICA6IOebrueahOiKgueCue+8iOaVtOaVsO+8iQotLSAgICAgICAgIGRpcmVjdGVkOiBib29s77yM6buY6K6kIHRydWUKLS0gQHNvdXJjZTogRGlqa3N0cmEg566X5rOV77yb5o6l5Y+j5a+56b2QIHBncm91dGluZ++8iGh0dHBzOi8vcGdyb3V0aW5nLmdpdGh1Yi5pb++8iQotLSBAcmVxdWlyZXM6IG5vbmXvvIjljZXmlofku7boh6rljIXlkKvvvIkKLS0gQGxpY2Vuc2U6IE1JVAotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSBVc2FnZToKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnaW5zdGFsbCcsIHNxbF9uYW1lIDo9ICdwZ3JvdXRpbmcnKTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3Bncm91dGluZycsIHtlZGdlczpbWzEsMiwxXSxbMiwzLDJdLFsxLDMsNV1dLCBzcmM6MSwgdGd0OjMsIG9wOidzaG9ydGVzdF9wYXRoJ30pOwotLSAgIC0+IHsicGF0aCI6WzEsMiwzXSwiY29zdCI6MywiZXhpc3RzIjp0cnVlfQoKLS0g5LqM5Y+J5aCG5LyY5YWI6Zif5YiX77yI5pWw57uEIFtrZXksIG5vZGVd77yJCmxvY2FsIGZ1bmN0aW9uIG5ld19oZWFwKCkKICBsb2NhbCBoID0ge2EgPSB7fSwgbiA9IDB9CiAgbG9jYWwgZnVuY3Rpb24gdXAoaSkKICAgIHdoaWxlIGkgPiAxIGRvCiAgICAgIGxvY2FsIHAgPSBtYXRoLmZsb29yKGkgLyAyKQogICAgICBpZiBoLmFbaV1bMV0gPCBoLmFbcF1bMV0gdGhlbiBoLmFbaV0sIGguYVtwXSA9IGguYVtwXSwgaC5hW2ldOyBpID0gcCBlbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gZG93bihpKQogICAgbG9jYWwgbiA9IGgubgogICAgd2hpbGUgMiAqIGkgPD0gbiBkbwogICAgICBsb2NhbCBjID0gMiAqIGkKICAgICAgaWYgYyArIDEgPD0gbiBhbmQgaC5hW2MrMV1bMV0gPCBoLmFbY11bMV0gdGhlbiBjID0gYyArIDEgZW5kCiAgICAgIGlmIGguYVtpXVsxXSA+IGguYVtjXVsxXSB0aGVuIGguYVtpXSwgaC5hW2NdID0gaC5hW2NdLCBoLmFbaV07IGkgPSBjIGVsc2UgYnJlYWsgZW5kCiAgICBlbmQKICBlbmQKICBoLnB1c2ggPSBmdW5jdGlvbihrZXksIG5vZGUpCiAgICBoLm4gPSBoLm4gKyAxCiAgICBoLmFbaC5uXSA9IHtrZXksIG5vZGV9CiAgICB1cChoLm4pCiAgZW5kCiAgaC5wb3AgPSBmdW5jdGlvbigpCiAgICBsb2NhbCB0b3AgPSBoLmFbMV0KICAgIGguYVsxXSA9IGguYVtoLm5dCiAgICBoLm4gPSBoLm4gLSAxCiAgICBpZiBoLm4gPiAwIHRoZW4gZG93bigxKSBlbmQKICAgIHJldHVybiB0b3BbMV0sIHRvcFsyXQogIGVuZAogIGguZW1wdHkgPSBmdW5jdGlvbigpIHJldHVybiBoLm4gPT0gMCBlbmQKICByZXR1cm4gaAplbmQKCmxvY2FsIGZ1bmN0aW9uIGpzb25fZXNjYXBlKHMpCiAgcmV0dXJuIChzOmdzdWIoJ1slYyJcXF0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicgZWxzZWlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcKICAgIGVsc2VpZiBjID09ICciJyB0aGVuIHJldHVybiAnXFwiJyBlbmQKICAgIHJldHVybiAoJ1xcdSUwNHgnKTpmb3JtYXQoYzpieXRlKCkpCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBidWlsZChkKQogIGFzc2VydCh0eXBlKGQpID09ICd0YWJsZScsICdwZ3JvdXRpbmc6IGV4cGVjdGVkIGRhdGEgdGFibGUgKHVudXNlZDsgc3RhdGVsZXNzKScpCiAgcmV0dXJuIGZ1bmN0aW9uKHApCiAgICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHt2ID0gcH0gZW5kCiAgICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJiYWQgaW5wdXQifScgZW5kCiAgICBsb2NhbCBvcCA9IHAub3Agb3IgJ3Nob3J0ZXN0X3BhdGgnCiAgICBsb2NhbCBlZGdlcyA9IHAuZWRnZXMKICAgIGxvY2FsIHNyYywgdGd0ID0gcC5zcmMsIHAudGd0CiAgICBpZiBvcCA9PSAnc2hvcnRlc3RfcGF0aCcgdGhlbgogICAgICBpZiB0eXBlKGVkZ2VzKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICd7ImVycm9yIjoibWlzc2luZyBlZGdlcyJ9JyBlbmQKICAgICAgaWYgc3JjID09IG5pbCBvciB0Z3QgPT0gbmlsIHRoZW4gcmV0dXJuICd7ImVycm9yIjoibWlzc2luZyBzcmMvdGd0In0nIGVuZAogICAgICBsb2NhbCBkaXJlY3RlZCA9IChwLmRpcmVjdGVkIH49IGZhbHNlKSAgLS0gZGVmYXVsdCB0cnVlCiAgICAgIC0tIGJ1aWxkIGFkamFjZW5jeQogICAgICBsb2NhbCBhZGogPSB7fQogICAgICBmb3IgXywgZSBpbiBpcGFpcnMoZWRnZXMpIGRvCiAgICAgICAgbG9jYWwgdSwgdiwgdyA9IGVbMV0sIGVbMl0sIGVbM10KICAgICAgICBpZiB0eXBlKHUpIH49ICdudW1iZXInIG9yIHR5cGUodikgfj0gJ251bWJlcicgb3IgdHlwZSh3KSB+PSAnbnVtYmVyJyB0aGVuCiAgICAgICAgICByZXR1cm4gJ3siZXJyb3IiOiJlZGdlIG11c3QgYmUgW3Usdix3XSBudW1lcmljIn0nCiAgICAgICAgZW5kCiAgICAgICAgYWRqW3VdID0gYWRqW3VdIG9yIHt9CiAgICAgICAgYWRqW3VdWyNhZGpbdV0rMV0gPSB7dG8gPSB2LCB3ID0gd30KICAgICAgICBpZiBub3QgZGlyZWN0ZWQgdGhlbgogICAgICAgICAgYWRqW3ZdID0gYWRqW3ZdIG9yIHt9CiAgICAgICAgICBhZGpbdl1bI2Fkalt2XSsxXSA9IHt0byA9IHUsIHcgPSB3fQogICAgICAgIGVuZAogICAgICBlbmQKICAgICAgaWYgc3JjID09IHRndCB0aGVuCiAgICAgICAgcmV0dXJuICd7InBhdGgiOlsnIC4uIHRvc3RyaW5nKHNyYykgLi4gJ10sImNvc3QiOjAsImV4aXN0cyI6dHJ1ZX0nCiAgICAgIGVuZAogICAgICAtLSBEaWprc3RyYQogICAgICBsb2NhbCBkaXN0ID0ge1tzcmNdID0gMH0KICAgICAgbG9jYWwgcHJldiA9IHt9CiAgICAgIGxvY2FsIHZpc2l0ZWQgPSB7fQogICAgICBsb2NhbCBoID0gbmV3X2hlYXAoKQogICAgICBoLnB1c2goMCwgc3JjKQogICAgICB3aGlsZSBub3QgaC5lbXB0eSgpIGRvCiAgICAgICAgbG9jYWwga2V5LCB1ID0gaC5wb3AoKQogICAgICAgIGlmIHZpc2l0ZWRbdV0gdGhlbiBnb3RvIGNvbnRpbnVlIGVuZAogICAgICAgIHZpc2l0ZWRbdV0gPSB0cnVlCiAgICAgICAgaWYgdSA9PSB0Z3QgdGhlbiBicmVhayBlbmQKICAgICAgICBmb3IgXywgYSBpbiBpcGFpcnMoYWRqW3VdIG9yIHt9KSBkbwogICAgICAgICAgbG9jYWwgdiwgdyA9IGEudG8sIGEudwogICAgICAgICAgaWYgbm90IHZpc2l0ZWRbdl0gdGhlbgogICAgICAgICAgICBsb2NhbCBuZCA9IGtleSArIHcKICAgICAgICAgICAgaWYgZGlzdFt2XSA9PSBuaWwgb3IgbmQgPCBkaXN0W3ZdIHRoZW4KICAgICAgICAgICAgICBkaXN0W3ZdID0gbmQKICAgICAgICAgICAgICBwcmV2W3ZdID0gdQogICAgICAgICAgICAgIGgucHVzaChuZCwgdikKICAgICAgICAgICAgZW5kCiAgICAgICAgICBlbmQKICAgICAgICBlbmQKICAgICAgICA6OmNvbnRpbnVlOjoKICAgICAgZW5kCiAgICAgIGlmIGRpc3RbdGd0XSA9PSBuaWwgdGhlbgogICAgICAgIHJldHVybiAneyJwYXRoIjpbXSwiY29zdCI6bnVsbCwiZXhpc3RzIjpmYWxzZX0nCiAgICAgIGVuZAogICAgICAtLSByZWNvbnN0cnVjdCBwYXRoCiAgICAgIGxvY2FsIHBhdGggPSB7fQogICAgICBsb2NhbCBjdXIgPSB0Z3QKICAgICAgd2hpbGUgY3VyIH49IG5pbCBkbwogICAgICAgIHBhdGhbI3BhdGgrMV0gPSBjdXIKICAgICAgICBjdXIgPSBwcmV2W2N1cl0KICAgICAgZW5kCiAgICAgIGxvY2FsIHJldiA9IHt9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WcdkgXC+Lj0AAAAAAODmPwAAAAAAAAAAANDIU/d71T/vQF3u7a0fPQAAAAAAwOY/AAAAAAAAAAAAYFnfvdXVP9xlpAgqCwq9IPIDALjyAwBI8wMATm8gZXJyb3IgaW5mb3JtYXRpb24ASWxsZWdhbCBieXRlIHNlcXVlbmNlAERvbWFpbiBlcnJvcgBSZXN1bHQgbm90IHJlcHJlc2VudGFibGUATm90IGEgdHR5AFBlcm1pc3Npb24gZGVuaWVkAE9wZXJhdGlvbiBub3QgcGVybWl0dGVkAE5vIHN1Y2ggZmlsZSBvciBkaXJlY3RvcnkATm8gc3VjaCBwcm9jZXNzAEZpbGUgZXhpc3RzAFZhbHVlIHRvbyBsYXJnZSBmb3IgZGF0YSB0eXBlAE5vIHNwYWNlIGxlZnQgb24gZGV2aWNlAE91dCBvZiBtZW1vcnkAUmVzb3VyY2UgYnVzeQBJbnRlcnJ1cHRlZCBzeXN0ZW0gY2FsbABSZXNvdXJjZSB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZQBJbnZhbGlkIHNlZWsAQ3Jvc3MtZGV2aWNlIGxpbmsAUmVhZC1vbmx5IGZpbGUgc3lzdGVtAERpcmVjdG9yeSBub3QgZW1wdHkAQ29ubmVjdGlvbiByZXNldCBieSBwZWVyAE9wZXJhdGlvbiB0aW1lZCBvdXQAQ29ubmVjdGlvbiByZWZ1c2VkAEhvc3QgaXMgZG93bgBIb3N0IGlzIHVucmVhY2hhYmxlAEFkZHJlc3MgaW4gdXNlAEJyb2tlbiBwaXBlAEkvTyBlcnJvcgBObyBzdWNoIGRldmljZSBvciBhZGRyZXNzAEJsb2NrIGRldmljZSByZXF1aXJlZABObyBzdWNoIGRldmljZQBOb3QgYSBkaXJlY3RvcnkASXMgYSBkaXJlY3RvcnkAVGV4dCBmaWxlIGJ1c3kARXhlYyBmb3JtYXQgZXJyb3IASW52YWxpZCBhcmd1bWVudABBcmd1bWVudCBsaXN0IHRvbyBsb25nAFN5bWJvbGljIGxpbmsgbG9vcABGaWxlbmFtZSB0b28gbG9uZwBUb28gbWFueSBvcGVuIGZpbGVzIGluIHN5c3RlbQBObyBmaWxlIGRlc2NyaXB0b3JzIGF2YWlsYWJsZQBCYWQgZmlsZSBkZXNjcmlwdG9yAE5vIGNoaWxkIHByb2Nlc3MAQmFkIGFkZHJlc3MARmlsZSB0b28gbGFyZ2UAVG9vIG1hbnkgbGlua3MATm8gbG9ja3MgYXZhaWxhYmxlAFJlc291cmNlIGRlYWRsb2NrIHdvdWxkIG9jY3VyAFN0YXRlIG5vdCByZWNvdmVyYWJsZQBQcmV2aW91cyBvd25lciBkaWVkAE9wZXJhdGlvbiBjYW5jZWxlZABGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWQATm8gbWVzc2FnZSBvZiBkZXNpcmVkIHR5cGUASWRlbnRpZmllciByZW1vdmVkAERldmljZSBub3QgYSBzdHJlYW0ATm8gZGF0YSBhdmFpbGFibGUARGV2aWNlIHRpbWVvdXQAT3V0IG9mIHN0cmVhbXMgcmVzb3VyY2VzAExpbmsgaGFzIGJlZW4gc2V2ZXJlZABQcm90b2NvbCBlcnJvcgBCYWQgbWVzc2FnZQBGaWxlIGRlc2NyaXB0b3IgaW4gYmFkIHN0YXRlAE5vdCBhIHNvY2tldABEZXN0aW5hdGlvbiBhZGRyZXNzIHJlcXVpcmVkAE1lc3NhZ2UgdG9vIGxhcmdlAFByb3RvY29sIHdyb25nIHR5cGUgZm9yIHNvY2tldABQcm90b2NvbCBub3QgYXZhaWxhYmxlAFByb3RvY29sIG5vdCBzdXBwb3J0ZWQAU29ja2V0IHR5cGUgbm90IHN1cHBvcnRlZABOb3Qgc3VwcG9ydGVkAFByb3RvY29sIGZhbWlseSBub3Qgc3VwcG9ydGVkAEFkZHJlc3MgZmFtaWx5IG5vdCBzdXBwb3J0ZWQgYnkgcHJvdG9jb2wAQWRkcmVzcyBub3QgYXZhaWxhYmxlAE5ldHdvcmsgaXMgZG93bgBOZXR3b3JrIHVucmVhY2hhYmxlAENvbm5lY3Rpb24gcmVzZXQgYnkgbmV0d29yawBDb25uZWN0aW9uIGFib3J0ZWQATm8gYnVmZmVyIHNwYWNlIGF2YWlsYWJsZQBTb2NrZXQgaXMgY29ubmVjdGVkAFNvY2tldCBub3QgY29ubmVjdGVkAENhbm5vdCBzZW5kIGFmdGVyIHNvY2tldCBzaHV0ZG93bgBPcGVyYXRpb24gYWxyZWFkeSBpbiBwcm9ncmVzcwBPcGVyYXRpb24gaW4gcHJvZ3Jl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';
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }

function getBinary(file) {
  try {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    var binary = tryParseAsDataURI(file);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(file);
    } else {
      throw "both async and sync fetching of the wasm failed";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // If we don't have the binary yet, try to to load it asynchronously.
  // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
  // See https://github.com/github/fetch/pull/92#issuecomment-140665932
  // Cordova or Electron apps are typically loaded from a file:// url.
  // So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
    if (typeof fetch == 'function'
      && !isFileURI(wasmBinaryFile)
    ) {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        if (!response['ok']) {
          throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
        }
        return response['arrayBuffer']();
      }).catch(function () {
          return getBinary(wasmBinaryFile);
      });
    }
    else {
      if (readAsync) {
        // fetch is not available or url is file => try XHR (readAsync uses XHR internally)
        return new Promise(function(resolve, reject) {
          readAsync(wasmBinaryFile, function(response) { resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))) }, reject)
        });
      }
    }
  }

  // Otherwise, getBinary should be able to get it synchronously
  return Promise.resolve().then(function() { return getBinary(wasmBinaryFile); });
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_snapshot_preview1': asmLibraryArg,
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    var exports = instance.exports;

    Module['asm'] = exports;

    wasmMemory = Module['asm']['memory'];
    updateGlobalBufferAndViews(wasmMemory.buffer);

    wasmTable = Module['asm']['__indirect_function_table'];

    addOnInit(Module['asm']['__wasm_call_ctors']);

    removeRunDependency('wasm-instantiate');
  }
  // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(result['instance']);
  }

  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(function (instance) {
      return instance;
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);

      abort(reason);
    });
  }

  function instantiateAsync() {
    if (!wasmBinary &&
        typeof WebAssembly.instantiateStreaming == 'function' &&
        !isDataURI(wasmBinaryFile) &&
        // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
        !isFileURI(wasmBinaryFile) &&
        typeof fetch == 'function') {
      return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
        // Suppress closure warning here since the upstream definition for
        // instantiateStreaming only allows Promise<Repsponse> rather than
        // an actual Response.
        // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
        /** @suppress {checkTypes} */
        var result = WebAssembly.instantiateStreaming(response, info);

        return result.then(
          receiveInstantiationResult,
          function(reason) {
            // We expect the most common failure cause to be a bad MIME type for the binary,
            // in which case falling back to ArrayBuffer instantiation should work.
            err('wasm streaming compile failed: ' + reason);
            err('falling back to ArrayBuffer instantiation');
            return instantiateArrayBuffer(receiveInstantiationResult);
          });
      });
    } else {
      return instantiateArrayBuffer(receiveInstantiationResult);
    }
  }

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  // If instantiation fails, reject the module ready promise.
  instantiateAsync().catch(readyPromiseReject);
  return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = {
  
};
function em_host_call_fill(sql,outbuf,maxlen){ var s_sql = UTF8ToString(sql); var fn = Module._host_duckdb_call; var s = (typeof fn === 'function') ? fn(s_sql) : 'error: no host hook (call)'; if (typeof s !== 'string') s = String(s); stringToUTF8(s, outbuf, maxlen); }
function em_host_query_fill(sql,outbuf,maxlen){ var s_sql = UTF8ToString(sql); var fn = Module._host_duckdb_query; var s = (typeof fn === 'function') ? fn(s_sql) : '{"rows":[],"err":"no host hook (query)"}'; if (typeof s !== 'string') s = String(s); stringToUTF8(s, outbuf, maxlen); }





  function callRuntimeCallbacks(callbacks) {
      while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == 'function') {
          callback(Module); // Pass the module as the first argument.
          continue;
        }
        var func = callback.func;
        if (typeof func == 'number') {
          if (callback.arg === undefined) {
            getWasmTableEntry(func)();
          } else {
            getWasmTableEntry(func)(callback.arg);
          }
        } else {
          func(callback.arg === undefined ? null : callback.arg);
        }
      }
    }

  function withStackSave(f) {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    }
  function demangle(func) {
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  var wasmTableMirror = [];
  function getWasmTableEntry(funcPtr) {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    }

  function handleException(e) {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    }

  function jsStackTrace() {
      var error = new Error();
      if (!error.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error();
        } catch(e) {
          error = e;
        }
        if (!error.stack) {
          return '(no stack trace available)';
        }
      }
      return error.stack.toString();
    }

  function setWasmTableEntry(idx, func) {
      wasmTable.set(idx, func);
      wasmTableMirror[idx] = func;
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function ___cxa_allocate_exception(size) {
      // Thrown object is prepended by exception metadata block
      return _malloc(size + 16) + 16;
    }

  /** @constructor */
  function ExceptionInfo(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 16;
  
      this.set_type = function(type) {
        HEAP32[(((this.ptr)+(4))>>2)] = type;
      };
  
      this.get_type = function() {
        return HEAP32[(((this.ptr)+(4))>>2)];
      };
  
      this.set_destructor = function(destructor) {
        HEAP32[(((this.ptr)+(8))>>2)] = destructor;
      };
  
      this.get_destructor = function() {
        return HEAP32[(((this.ptr)+(8))>>2)];
      };
  
      this.set_refcount = function(refcount) {
        HEAP32[((this.ptr)>>2)] = refcount;
      };
  
      this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[(((this.ptr)+(12))>>0)] = caught;
      };
  
      this.get_caught = function () {
        return HEAP8[(((this.ptr)+(12))>>0)] != 0;
      };
  
      this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(((this.ptr)+(13))>>0)] = rethrown;
      };
  
      this.get_rethrown = function () {
        return HEAP8[(((this.ptr)+(13))>>0)] != 0;
      };
  
      // Initialize native structure fields. Should be called once after allocated.
      this.init = function(type, destructor) {
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
      }
  
      this.add_ref = function() {
        var value = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = value + 1;
      };
  
      // Returns true if last reference released.
      this.release_ref = function() {
        var prev = HEAP32[((this.ptr)>>2)];
        HEAP32[((this.ptr)>>2)] = prev - 1;
        return prev === 1;
      };
    }
  
    /**
     * @constructor
     * @param {number=} ptr
     */
  function CatchInfo(ptr) {
  
      this.free = function() {
        _free(this.ptr);
        this.ptr = 0;
      };
  
      this.set_base_ptr = function(basePtr) {
        HEAP32[((this.ptr)>>2)] = basePtr;
      };
  
      this.get_base_ptr = function() {
        return HEAP32[((this.ptr)>>2)];
      };
  
      this.set_adjusted_ptr = function(adjustedPtr) {
        HEAP32[(((this.ptr)+(4))>>2)] = adjustedPtr;
      };
  
      this.get_adjusted_ptr_addr = function() {
        return this.ptr + 4;
      }
  
      this.get_adjusted_ptr = function() {
        return HEAP32[(((this.ptr)+(4))>>2)];
      };
  
      // Get pointer which is expected to be received by catch clause in C++ code. It may be adjusted
      // when the pointer is casted to some of the exception object base classes (e.g. when virtual
      // inheritance is used). When a pointer is thrown this method should return the thrown pointer
      // itself.
      this.get_exception_ptr = function() {
        // Work around a fastcomp bug, this code is still included for some reason in a build without
        // exceptions support.
        var isPointer = ___cxa_is_pointer_type(
          this.get_exception_info().get_type());
        if (isPointer) {
          return HEAP32[((this.get_base_ptr())>>2)];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) return adjusted;
        return this.get_base_ptr();
      };
  
      this.get_exception_info = function() {
        return new ExceptionInfo(this.get_base_ptr());
      };
  
      if (ptr === undefined) {
        this.ptr = _malloc(8);
        this.set_adjusted_ptr(0);
      } else {
        this.ptr = ptr;
      }
    }
  
  var exceptionCaught =  [];
  
  function exception_addRef(info) {
      info.add_ref();
    }
  
  var uncaughtExceptionCount = 0;
  function ___cxa_begin_catch(ptr) {
      var catchInfo = new CatchInfo(ptr);
      var info = catchInfo.get_exception_info();
      if (!info.get_caught()) {
        info.set_caught(true);
        uncaughtExceptionCount--;
      }
      info.set_rethrown(false);
      exceptionCaught.push(catchInfo);
      exception_addRef(info);
      return catchInfo.get_exception_ptr();
    }

  var exceptionLast = 0;
  
  function ___cxa_free_exception(ptr) {
        return _free(new ExceptionInfo(ptr).ptr);
    }
  function exception_decRef(info) {
      // A rethrown exception can reach refcount 0; it must not be discarded
      // Its next handler will clear the rethrown flag and addRef it, prior to
      // final decRef and destruction here
      if (info.release_ref() && !info.get_rethrown()) {
        var destructor = info.get_destructor();
        if (destructor) {
          // In Wasm, destructors return 'this' as in ARM
          getWasmTableEntry(destructor)(info.excPtr);
        }
        ___cxa_free_exception(info.excPtr);
      }
    }
  function ___cxa_end_catch() {
      // Clear state flag.
      _setThrew(0);
      // Call destructor if one is registered then clear it.
      var catchInfo = exceptionCaught.pop();
  
      exception_decRef(catchInfo.get_exception_info());
      catchInfo.free();
      exceptionLast = 0; // XXX in decRef?
    }

  function ___resumeException(catchInfoPtr) {
      var catchInfo = new CatchInfo(catchInfoPtr);
      var ptr = catchInfo.get_base_ptr();
      if (!exceptionLast) { exceptionLast = ptr; }
      catchInfo.free();
      throw ptr;
    }
  function ___cxa_find_matching_catch_2() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }

  function ___cxa_find_matching_catch_3() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }

  function ___cxa_find_matching_catch_4() {
      var thrown = exceptionLast;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0); return ((0)|0);
      }
      var info = new ExceptionInfo(thrown);
      var thrownType = info.get_type();
      var catchInfo = new CatchInfo();
      catchInfo.set_base_ptr(thrown);
      catchInfo.set_adjusted_ptr(thrown);
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0); return ((catchInfo.ptr)|0);
      }
      var typeArray = Array.prototype.slice.call(arguments);
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        var caughtType = typeArray[i];
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        if (___cxa_can_catch(caughtType, thrownType, catchInfo.get_adjusted_ptr_addr())) {
          setTempRet0(caughtType); return ((catchInfo.ptr)|0);
        }
      }
      setTempRet0(thrownType); return ((catchInfo.ptr)|0);
    }

  function ___cxa_throw(ptr, type, destructor) {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = ptr;
      uncaughtExceptionCount++;
      throw ptr;
    }


  var PATH = {splitPath:function(filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function(parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function(path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function(path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function(path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function(path) {
        return PATH.splitPath(path)[3];
      },join:function() {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function(l, r) {
        return PATH.normalize(l + '/' + r);
      }};
  
  function getRandomDevice() {
      if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
        // for modern web browsers
        var randomBuffer = new Uint8Array(1);
        return function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
      } else
      if (ENVIRONMENT_IS_NODE) {
        // for nodejs with or without crypto support included
        try {
          var crypto_module = require('crypto');
          // nodejs has crypto support
          return function() { return crypto_module['randomBytes'](1)[0]; };
        } catch (e) {
          // nodejs doesn't have crypto support
        }
      }
      // we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
      return function() { abort("randomDevice"); };
    }
  
  var PATH_FS = {resolve:function() {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function(from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY = {ttys:[],init:function () {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function(stream) {
          // flush any pending line data
          stream.tty.ops.flush(stream.tty);
        },flush:function(stream) {
          stream.tty.ops.flush(stream.tty);
        },read:function(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function(tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              // we will read data by chunks of BUFSIZE
              var BUFSIZE = 256;
              var buf = Buffer.alloc(BUFSIZE);
              var bytesRead = 0;
  
              try {
                bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
              } catch(e) {
                // Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
                // reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
                if (e.toString().includes('EOF')) bytesRead = 0;
                else throw e;
              }
  
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString('utf-8');
              } else {
                result = null;
              }
            } else
            if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },flush:function(tty) {
          if (tty.output && tty.output.length > 0) {
            out(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },flush:function(tty) {
          if (tty.output && tty.output.length > 0) {
            err(UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  function zeroMemory(address, size) {
      HEAPU8.fill(0, address, address + size);
    }
  
  function alignMemory(size, alignment) {
      return Math.ceil(size / alignment) * alignment;
    }
  function mmapAlloc(size) {
      abort();
    }
  var MEMFS = {ops_table:null,mount:function(mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.timestamp = node.timestamp;
        }
        return node;
      },getFileDataAsTypedArray:function(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },resizeFileStorage:function(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },node_ops:{getattr:function(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function(node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function(parent, name) {
          throw FS.genericErrors[44];
        },mknod:function(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function(old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.parent.timestamp = Date.now()
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          new_dir.timestamp = old_node.parent.timestamp;
          old_node.parent = new_dir;
        },unlink:function(parent, name) {
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },rmdir:function(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.timestamp = Date.now();
        },readdir:function(node) {
          var entries = ['.', '..'];
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        }},stream_ops:{read:function(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function(stream, buffer, offset, length, position, canOwn) {
          // If the buffer is located in main memory (HEAP), and if
          // memory can grow, we can't hold on to references of the
          // memory buffer, as they may get invalidated. That means we
          // need to do copy its contents.
          if (buffer.buffer === HEAP8.buffer) {
            canOwn = false;
          }
  
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },llseek:function(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },allocate:function(stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function(stream, address, length, position, prot, flags) {
          if (address !== 0) {
            // We don't currently support location hints for the address of the mapping
            throw new FS.ErrnoError(28);
          }
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents.buffer === buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            HEAP8.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function(stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          if (mmapFlags & 2) {
            // MAP_PRIVATE calls need not to be synced back to underlying fs
            return 0;
          }
  
          var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  /** @param {boolean=} noRunDep */
  function asyncLoad(url, onload, onerror, noRunDep) {
      var dep = !noRunDep ? getUniqueRunDependency('al ' + url) : '';
      readAsync(url, function(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      }, function(event) {
        if (onerror) {
          onerror();
        } else {
          throw 'Loading data file "' + url + '" failed.';
        }
      });
      if (dep) addRunDependency(dep);
    }
  var FS = {root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:(path, opts = {}) => {
        path = PATH_FS.resolve(FS.cwd(), path);
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(32);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter((p) => !!p), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(32);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:(node) => {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:(parentid, name) => {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:(node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:(node) => {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:(parent, name) => {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:(parent, name, mode, rdev) => {
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:(node) => {
        FS.hashRemoveNode(node);
      },isRoot:(node) => {
        return node === node.parent;
      },isMountpoint:(node) => {
        return !!node.mounted;
      },isFile:(mode) => {
        return (mode & 61440) === 32768;
      },isDir:(mode) => {
        return (mode & 61440) === 16384;
      },isLink:(mode) => {
        return (mode & 61440) === 40960;
      },isChrdev:(mode) => {
        return (mode & 61440) === 8192;
      },isBlkdev:(mode) => {
        return (mode & 61440) === 24576;
      },isFIFO:(mode) => {
        return (mode & 61440) === 4096;
      },isSocket:(mode) => {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:(str) => {
        var flags = FS.flagModes[str];
        if (typeof flags == 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:(flag) => {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:(node, perms) => {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },mayLookup:(dir) => {
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },mayCreate:(dir, name) => {
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:(dir, name, isdir) => {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },mayOpen:(node, flags) => {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
              (flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:(fd_start = 0, fd_end = FS.MAX_OPEN_FDS) => {
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },getStream:(fd) => FS.streams[fd],createStream:(stream, fd_start, fd_end) => {
        if (!FS.FSStream) {
          FS.FSStream = /** @constructor */ function(){};
          FS.FSStream.prototype = {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          };
        }
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:(fd) => {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:(stream) => {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:() => {
          throw new FS.ErrnoError(70);
        }},major:(dev) => ((dev) >> 8),minor:(dev) => ((dev) & 0xff),makedev:(ma, mi) => ((ma) << 8 | (mi)),registerDevice:(dev, ops) => {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:(dev) => FS.devices[dev],getMounts:(mount) => {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:(populate, callback) => {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err('warning: ' + FS.syncFSRequests + ' FS.syncfs operations in flight at once, probably just doing extra work');
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:(type, opts, mountpoint) => {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:(mountpoint) => {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      },lookup:(parent, name) => {
        return parent.node_ops.lookup(parent, name);
      },mknod:(path, mode, dev) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:(path, mode) => {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:(path, mode) => {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdirTree:(path, mode) => {
        var dirs = path.split('/');
        var d = '';
        for (var i = 0; i < dirs.length; ++i) {
          if (!dirs[i]) continue;
          d += '/' + dirs[i];
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },mkdev:(path, mode, dev) => {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:(oldpath, newpath) => {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:(old_path, new_path) => {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existant directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:(path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:(path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
      },unlink:(path) => {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:(path) => {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:(path, dontFollow) => {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
      },lstat:(path) => {
        return FS.stat(path, true);
      },chmod:(path, mode, dontFollow) => {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:(path, mode) => {
        FS.chmod(path, mode, true);
      },fchmod:(fd, mode) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
      },chown:(path, uid, gid, dontFollow) => {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:(path, uid, gid) => {
        FS.chown(path, uid, gid, true);
      },fchown:(fd, uid, gid) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:(path, len) => {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:(fd, len) => {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
      },utime:(path, atime, mtime) => {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:(path, flags, mode, fd_start, fd_end) => {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path == 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },close:(stream) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },isClosed:(stream) => {
        return stream.fd === null;
      },llseek:(stream, offset, whence) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:(stream, buffer, offset, length, position) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:(stream, buffer, offset, length, position, canOwn) => {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:(stream, offset, length) => {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:(stream, address, length, position, prot, flags) => {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, address, length, position, prot, flags);
      },msync:(stream, buffer, offset, length, mmapFlags) => {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:(stream) => 0,ioctl:(stream, cmd, arg) => {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:(path, opts = {}) => {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:(path, data, opts = {}) => {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },cwd:() => FS.currentPath,chdir:(path) => {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:() => {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:() => {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device = getRandomDevice();
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:() => {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: () => {
            var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
            node.node_ops = {
              lookup: (parent, name) => {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(8);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:() => {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
      },ensureErrnoError:() => {
        if (FS.ErrnoError) return;
        FS.ErrnoError = /** @this{Object} */ function ErrnoError(errno, node) {
          this.node = node;
          this.setErrno = /** @this{Object} */ function(errno) {
            this.errno = errno;
          };
          this.setErrno(errno);
          this.message = 'FS error';
  
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [44].forEach((code) => {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:() => {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },init:(input, output, error) => {
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:() => {
        FS.init.initialized = false;
        // Call musl-internal function to close all stdio streams, so nothing is
        // left in internal buffers.
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:(canRead, canWrite) => {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },findObject:(path, dontResolveLastLink) => {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          return null;
        }
      },analyzePath:(path, dontResolveLastLink) => {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createPath:(parent, path, canRead, canWrite) => {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:(parent, name, properties, canRead, canWrite) => {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:(parent, name, data, canRead, canWrite, canOwn) => {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:(parent, name, input, output) => {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: (stream) => {
            stream.seekable = false;
          },
          close: (stream) => {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: (stream, buffer, offset, length, pos /* ignored */) => {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: (stream, buffer, offset, length, pos) => {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },forceLoadFile:(obj) => {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(read_(obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
      },createLazyFile:(parent, name, url, canRead, canWrite) => {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        /** @constructor */
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = /** @this{Object} */ function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (from, to) => {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          };
          var lazyArray = this;
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
            return lazyArray.chunks[chunkNum];
          });
  
          if (usesGzip || !datalength) {
            // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
            chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperties(lazyArray, {
            length: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._length;
              }
            },
            chunkSize: {
              get: /** @this{Object} */ function() {
                if (!this.lengthKnown) {
                  this.cacheLength();
                }
                return this._chunkSize;
              }
            }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: /** @this {FSNode} */ function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            FS.forceLoadFile(node);
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, () => {
            if (onerror) onerror();
            removeRunDependency(dep);
          })) {
            return;
          }
          finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          asyncLoad(url, (byteArray) => processData(byteArray), onerror);
        } else {
          processData(url);
        }
      },indexedDB:() => {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:() => {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(paths, onload, onerror) => {
        onload = onload || (() => {});
        onerror = onerror || (() => {});
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = () => {
          out('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach((path) => {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = () => { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = () => { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:(paths, onload, onerror) => {
        onload = onload || (() => {});
        onerror = onerror || (() => {});
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = () => {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach((path) => {
            var getRequest = files.get(path);
            getRequest.onsuccess = () => {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = () => { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SYSCALLS = {DEFAULT_POLLMASK:5,calculateAt:function(dirfd, path, allowEmpty) {
        if (path[0] === '/') {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = FS.getStream(dirfd);
          if (!dirstream) throw new FS.ErrnoError(8);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return PATH.join2(dir, path);
      },doStat:function(func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -54;
          }
          throw e;
        }
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = 0;
        HEAP32[(((buf)+(8))>>2)] = stat.ino;
        HEAP32[(((buf)+(12))>>2)] = stat.mode;
        HEAP32[(((buf)+(16))>>2)] = stat.nlink;
        HEAP32[(((buf)+(20))>>2)] = stat.uid;
        HEAP32[(((buf)+(24))>>2)] = stat.gid;
        HEAP32[(((buf)+(28))>>2)] = stat.rdev;
        HEAP32[(((buf)+(32))>>2)] = 0;
        (tempI64 = [stat.size>>>0,(tempDouble=stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
        HEAP32[(((buf)+(48))>>2)] = 4096;
        HEAP32[(((buf)+(52))>>2)] = stat.blocks;
        HEAP32[(((buf)+(56))>>2)] = (stat.atime.getTime() / 1000)|0;
        HEAP32[(((buf)+(60))>>2)] = 0;
        HEAP32[(((buf)+(64))>>2)] = (stat.mtime.getTime() / 1000)|0;
        HEAP32[(((buf)+(68))>>2)] = 0;
        HEAP32[(((buf)+(72))>>2)] = (stat.ctime.getTime() / 1000)|0;
        HEAP32[(((buf)+(76))>>2)] = 0;
        (tempI64 = [stat.ino>>>0,(tempDouble=stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[(((buf)+(80))>>2)] = tempI64[0],HEAP32[(((buf)+(84))>>2)] = tempI64[1]);
        return 0;
      },doMsync:function(addr, stream, len, flags, offset) {
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },doMkdir:function(path, mode) {
        // remove a trailing slash, if one - /a/b/ has basename of '', but
        // we want to create b in the context of this function
        path = PATH.normalize(path);
        if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
        FS.mkdir(path, mode, 0);
        return 0;
      },doMknod:function(path, mode, dev) {
        // we don't want this in the JS API as it uses mknod to create all nodes.
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default: return -28;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },doReadlink:function(path, buf, bufsize) {
        if (bufsize <= 0) return -28;
        var ret = FS.readlink(path);
  
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf+len];
        stringToUTF8(ret, buf, bufsize+1);
        // readlink is one of the rare functions that write out a C string, but does never append a null to the output buffer(!)
        // stringToUTF8() always appends a null byte, so restore the character under the null byte after the write.
        HEAP8[buf+len] = endChar;
  
        return len;
      },doAccess:function(path, amode) {
        if (amode & ~7) {
          // need a valid mode
          return -28;
        }
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      },doDup:function(path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },doReadv:function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.read(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break; // nothing more to read
        }
        return ret;
      },doWritev:function(stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.write(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },varargs:undefined,get:function() {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },getStreamFromFD:function(fd) {
        var stream = FS.getStream(fd);
        if (!stream) throw new FS.ErrnoError(8);
        return stream;
      },get64:function(low, high) {
        return low;
      }};
  function ___syscall_dup3(fd, suggestFD, flags) {
  try {
  
      var old = SYSCALLS.getStreamFromFD(fd);
      if (old.fd === suggestFD) return -28;
      return SYSCALLS.doDup(old.path, old.flags, suggestFD);
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function setErrNo(value) {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    }
  function ___syscall_fcntl64(fd, cmd, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -28;
          }
          var newStream;
          newStream = FS.open(stream.path, stream.flags, 0, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 5:
        /* case 5: Currently in musl F_GETLK64 has same value as F_GETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */ {
          
          var arg = SYSCALLS.get();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 6:
        case 7:
        /* case 6: Currently in musl F_SETLK64 has same value as F_SETLK, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
        /* case 7: Currently in musl F_SETLKW64 has same value as F_SETLKW, so omitted to avoid duplicate case blocks. If that changes, uncomment this */
          
          
          return 0; // Pretend that the locking is successful.
        case 16:
        case 8:
          return -28; // These are for sockets. We don't have them fully implemented yet.
        case 9:
          // musl trusts getown return values, due to a bug where they must be, as they overlap with errors. just return -1 here, so fnctl() returns that, and we set errno ourselves.
          setErrNo(28);
          return -1;
        default: {
          return -28;
        }
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function ___syscall_ioctl(fd, op, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509:
        case 21505: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21510:
        case 21511:
        case 21512:
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = SYSCALLS.get();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.get();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        default: abort('bad ioctl syscall ' + op);
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function ___syscall_open(path, flags, varargs) {
  SYSCALLS.varargs = varargs;
  try {
  
      var pathname = SYSCALLS.getStr(path);
      var mode = varargs ? SYSCALLS.get() : 0;
      var stream = FS.open(pathname, flags, mode);
      return stream.fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function _abort() {
      abort('');
    }

  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return ((Date.now() - _clock.start) * (1000000 / 1000))|0;
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.copyWithin(dest, src, src + num);
    }

  function _emscripten_get_heap_max() {
      // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
      // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
      // for any code that deals with heap sizes, which would require special
      // casing all heap size related code to treat 0 specially.
      return 2147483648;
    }
  
  function emscripten_realloc_buffer(size) {
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - buffer.byteLength + 65535) >>> 16); // .grow() takes a delta compared to the previous size
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1 /*success*/;
      } catch(e) {
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    }
  function _emscripten_resize_heap(requestedSize) {
      var oldSize = HEAPU8.length;
      requestedSize = requestedSize >>> 0;
      // With pthreads, races can happen (another thread might increase the size
      // in between), so return a failure, and let the caller retry.
  
      // Memory resize rules:
      // 1.  Always increase heap size to at least the requested size, rounded up
      //     to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
      //     geometrically: increase the heap size according to
      //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
      //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
      //     linearly: increase the heap size by at least
      //     MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
      //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4.  If we were unable to allocate as much memory, it may be due to
      //     over-eager decision to excessively reserve due to (3) above.
      //     Hence if an allocation fails, cut down on the amount of excess
      //     growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      var maxHeapSize = _emscripten_get_heap_max();
      if (requestedSize > maxHeapSize) {
        return false;
      }
  
      let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
  
      // Loop through potential heap size increases. If we attempt a too eager
      // reservation that fails, cut down on the attempted size and reserve a
      // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
  
          return true;
        }
      }
      return false;
    }

  function _fd_close(fd) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function _fd_read(fd, iov, iovcnt, pnum) {
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = SYSCALLS.doReadv(stream, iov, iovcnt);
      HEAP32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
  try {
  
      
      var stream = SYSCALLS.getStreamFromFD(fd);
      var HIGH_OFFSET = 0x100000000; // 2^32
      // use an unsigned operator on low and shift high by 32-bits
      var offset = offset_high * HIGH_OFFSET + (offset_low >>> 0);
  
      var DOUBLE_LIMIT = 0x20000000000000; // 2^53
      // we also check for equality since DOUBLE_LIMIT + 1 == DOUBLE_LIMIT
      if (offset <= -DOUBLE_LIMIT || offset >= DOUBLE_LIMIT) {
        return -61;
      }
  
      FS.llseek(stream, offset, whence);
      (tempI64 = [stream.position>>>0,(tempDouble=stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math.min((+(Math.floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function _fd_write(fd, iov, iovcnt, pnum) {
  try {
  
      ;
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = SYSCALLS.doWritev(stream, iov, iovcnt);
      HEAP32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return e.errno;
  }
  }

  function _getTempRet0() {
      return getTempRet0();
    }

  function _llvm_eh_typeid_for(type) {
      return type;
    }

  function _setTempRet0(val) {
      setTempRet0(val);
    }

  function _time(ptr) {
      ;
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)] = ret;
      }
      return ret;
    }

  var FSNode = /** @constructor */ function(parent, name, mode, rdev) {
    if (!parent) {
      parent = this;  // root node sets parent to itself
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292/*292*/ | 73/*73*/;
  var writeMode = 146/*146*/;
  Object.defineProperties(FSNode.prototype, {
   read: {
    get: /** @this{FSNode} */function() {
     return (this.mode & readMode) === readMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= readMode : this.mode &= ~readMode;
    }
   },
   write: {
    get: /** @this{FSNode} */function() {
     return (this.mode & writeMode) === writeMode;
    },
    set: /** @this{FSNode} */function(val) {
     val ? this.mode |= writeMode : this.mode &= ~writeMode;
    }
   },
   isFolder: {
    get: /** @this{FSNode} */function() {
     return FS.isDir(this.mode);
    }
   },
   isDevice: {
    get: /** @this{FSNode} */function() {
     return FS.isChrdev(this.mode);
    }
   }
  });
  FS.FSNode = FSNode;
  FS.staticInit();;
var ASSERTIONS = false;



/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {string} input The string to decode.
 */
var decodeBase64 = typeof atob == 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE == 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf['buffer'], buf['byteOffset'], buf['byteLength']);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


var asmLibraryArg = {
  "__cxa_allocate_exception": ___cxa_allocate_exception,
  "__cxa_begin_catch": ___cxa_begin_catch,
  "__cxa_end_catch": ___cxa_end_catch,
  "__cxa_find_matching_catch_2": ___cxa_find_matching_catch_2,
  "__cxa_find_matching_catch_3": ___cxa_find_matching_catch_3,
  "__cxa_find_matching_catch_4": ___cxa_find_matching_catch_4,
  "__cxa_throw": ___cxa_throw,
  "__resumeException": ___resumeException,
  "__syscall_dup3": ___syscall_dup3,
  "__syscall_fcntl64": ___syscall_fcntl64,
  "__syscall_ioctl": ___syscall_ioctl,
  "__syscall_open": ___syscall_open,
  "abort": _abort,
  "clock": _clock,
  "em_host_call_fill": em_host_call_fill,
  "em_host_query_fill": em_host_query_fill,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_close": _fd_close,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write,
  "getTempRet0": _getTempRet0,
  "invoke_iiii": invoke_iiii,
  "invoke_iiiii": invoke_iiiii,
  "invoke_iiiiiii": invoke_iiiiiii,
  "invoke_v": invoke_v,
  "invoke_vii": invoke_vii,
  "llvm_eh_typeid_for": _llvm_eh_typeid_for,
  "setTempRet0": _setTempRet0,
  "time": _time
};
var asm = createWasm();
/** @type {function(...*):?} */
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
  return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["__wasm_call_ctors"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _diag_stage = Module["_diag_stage"] = function() {
  return (_diag_stage = Module["_diag_stage"] = Module["asm"]["diag_stage"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _lua_prewarm = Module["_lua_prewarm"] = function() {
  return (_lua_prewarm = Module["_lua_prewarm"] = Module["asm"]["lua_prewarm"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _lua_lib_run = Module["_lua_lib_run"] = function() {
  return (_lua_lib_run = Module["_lua_lib_run"] = Module["asm"]["lua_lib_run"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___errno_location = Module["___errno_location"] = function() {
  return (___errno_location = Module["___errno_location"] = Module["asm"]["__errno_location"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _free = Module["_free"] = function() {
  return (_free = Module["_free"] = Module["asm"]["free"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _malloc = Module["_malloc"] = function() {
  return (_malloc = Module["_malloc"] = Module["asm"]["malloc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var _setThrew = Module["_setThrew"] = function() {
  return (_setThrew = Module["_setThrew"] = Module["asm"]["setThrew"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackSave = Module["stackSave"] = function() {
  return (stackSave = Module["stackSave"] = Module["asm"]["stackSave"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackRestore = Module["stackRestore"] = function() {
  return (stackRestore = Module["stackRestore"] = Module["asm"]["stackRestore"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var stackAlloc = Module["stackAlloc"] = function() {
  return (stackAlloc = Module["stackAlloc"] = Module["asm"]["stackAlloc"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___cxa_can_catch = Module["___cxa_can_catch"] = function() {
  return (___cxa_can_catch = Module["___cxa_can_catch"] = Module["asm"]["__cxa_can_catch"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = function() {
  return (___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = Module["asm"]["__cxa_is_pointer_type"]).apply(null, arguments);
};

/** @type {function(...*):?} */
var dynCall_jiji = Module["dynCall_jiji"] = function() {
  return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
};


function invoke_v(index) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)();
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (e !== e+0) throw e;
    _setThrew(1, 0);
  }
}




// === Auto-generated postamble setup entry stuff ===

Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
Module["UTF8ToString"] = UTF8ToString;
Module["stringToUTF8"] = stringToUTF8;
Module["lengthBytesUTF8"] = lengthBytesUTF8;

var calledRun;

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    readyPromiseResolve(Module);
    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}
Module['run'] = run;

/** @param {boolean|number=} implicit */
function exit(status, implicit) {
  EXITSTATUS = status;

  if (keepRuntimeAlive()) {
  } else {
    exitRuntime();
  }

  procExit(status);
}

function procExit(code) {
  EXITSTATUS = code;
  if (!keepRuntimeAlive()) {
    if (Module['onExit']) Module['onExit'](code);
    ABORT = true;
  }
  quit_(code, new ExitStatus(code));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

run();







  return L20Module.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = L20Module;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return L20Module; });
else if (typeof exports === 'object')
  exports["L20Module"] = L20Module;
