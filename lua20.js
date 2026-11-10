
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
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABloOAgAA8YAF/AX9gA39/fwF/YAJ/fwF/YAJ/fwBgBH9/f38Bf2ADf39/AGABfwBgBH9/f38AYAV/f39/fwBgAXwBfGAAAX9gBX9/f39/AX9gBn9/f39/fwBgBX9+fn5+AGAAAGAGf39/f39/AX9gA39+fwF+YAF/AXxgAn9/AX5gAnx8AXxgAXwBfmACfH8BfGAEf35+fwBgAn98AGACf34AYAN/f34Bf2ADf39+AGACf38BfGAHf39/f39/fwF/YAN/fn4BfmADfHx/AXxgA3x+fgF8YAZ/fH9/f38Bf2ACfn8Bf2AEfn5+fgF/YAN/f38BfGADf39/AX5gA39/fAF8YAN/f34BfmADf3x/AGAJf39/f39/f39/AGAEf39+fgF+YAR/f35/AGACf34Bf2ABfwF+YAZ/f35/f38AYAN8f38Bf2ADf3x8AXxgAn5+AX5gAnx/AX9gAn98AXxgAX4Bf2ACfn4Bf2ADf35+AGAHf39/f39/fwBgA35/fwF/YAJ/fQBgAn5+AXxgBH9/fn8BfmAEf35/fwF/AqWDgIAAEgNlbnYMZW1faG9zdF9jYWxsAAMDZW52DWVtX2hvc3RfcXVlcnkAAwNlbnYFYWJvcnQADgNlbnYYX19jeGFfYWxsb2NhdGVfZXhjZXB0aW9uAAADZW52C19fY3hhX3Rocm93AAUDZW52BHRpbWUAAANlbnYFY2xvY2sACgNlbnYVZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAEDZW52Dl9fc3lzY2FsbF9vcGVuAAEDZW52EV9fc3lzY2FsbF9mY250bDY0AAEDZW52D19fc3lzY2FsbF9pb2N0bAABFndhc2lfc25hcHNob3RfcHJldmlldzEIZmRfd3JpdGUABBZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxB2ZkX3JlYWQABBZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxCGZkX2Nsb3NlAAADZW52Dl9fc3lzY2FsbF9kdXAzAAEDZW52FmVtc2NyaXB0ZW5fcmVzaXplX2hlYXAAAANlbnYLc2V0VGVtcFJldDAABhZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxB2ZkX3NlZWsACwPYhYCAANYFDgoKDgAAAgYCAhECAAMDBQUDAgICAgIBAwQCIyQCARICAgYXGAECAQEFAwMCAgEZAhkFAgMFBRoDBwIIDwMLBAEAAgMDAwIFBQEBAQIDAwIGBgEBAQEBAwIEBAEFBQMbJRIDJgUFAwEBBQIBCwECARIBBwoEAAUFJwAFAAAAAAABAAAAAAABAAABAAEAAAAAAAAAAAAAAAADAQUFDwUABQAFCAMCBAMDGgEFBQMDAwUFAgMDBQIFAwEDBQcEBQIIKAgPBQMIBwYBBAEBBQIHBQQDBQYFBwUFBAACBAUDAQEGAQYGCAMFBQsEAgEFBQELBAsFAwICAwIDBgMEAAMBBQMDAwEFAgMDAgAAAwYGAAYDAwEFAwADBgIDBQEIBgIGAAUCAAMCAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcBAQLBgUEAQALKQgAAgIDAQUDAQUADwYGAwUGAwMFAQQDBwIHAwcIAwMDAwcDAwAGBgYDAgIDBgUDAgEAAwUGBgECAwIBAAAAAAQAAgAAAAABBwAAAAAAAAAACwAAAgQBAAUAAAAAAAAAAAEBBwcCAyoFAAMrAgICCAcsAAAFAAAAAAAABwEGAQECCAgICwYMLQQPBwcBBQMCAAAAAAAAAAACAi4BAQgIAQEBAQEDBR0dLzADAAcBCgkJCQkJFBMUAAYTCzEeCQEBMgkREQkfCQYAAAAAAAAJEwAQAQEAAAICAQACAgICAAAGAgQBARUBBAAAAAAABgAAAAAAAAAAAAAVAgYGChEJCQkJEAEBCg4AEzMfCgoKDhUBAgIJBAkAEAICAgECAgICAgAAAQEBAgICGAANFjQNNQcMNhIHGwAeCQAAAgscBQAHNyEhCAEgAxQBBAEAAQIABgICAwoADRYiIg0XOAMDCgoWDQ0NOQAGBgYACgAGBgYGBgYBAQABBAcHBwEBAgIIBwgIDAwACgYAOgs7BIWAgIAAAXAAiQEFh4CAgAABAYBAgIACBoqAgIAAAX8BQZD+n8AACwfEgYCAAA0GbWVtb3J5AgARX193YXNtX2NhbGxfY3RvcnMAEgpkaWFnX3N0YWdlABMLbHVhX3ByZXdhcm0AFAtsdWFfbGliX3J1bgAYGV9faW5kaXJlY3RfZnVuY3Rpb25fdGFibGUBABBfX2Vycm5vX2xvY2F0aW9uAIoEBGZyZWUArAUGbWFsbG9jAKsFCXN0YWNrU2F2ZQDiBQxzdGFja1Jlc3RvcmUA4wUKc3RhY2tBbGxvYwDkBQxkeW5DYWxsX2ppamkA5gUJkoKAgAABAEEBC4gBjQGYA84DugLsAxYXT31/hgGHAYgBiQGMAYsBkgGVAZgBmQGbAZ0BjgGQAZEBjwGTAZQBlgGXAZoBnAGeAZ8BoAGhAaIBowGkAaUBpgGnAagBqQGoArsCvAK9Ar4CvwLAAsECwgLDAsQCxQLGAscCyALJAsoCywLMAs0CzgLPAtAC0QKHA4gDnAOhA5kDmgObA50DnwOgA6IDpQOmA6cDqAOpA6oDqwOsA64DrwOzA7UDtgO3A7gDuQO6A7sDzwPRA9ID0wPUA9UD1gPyA/MD7QPuA+8D8APxA60ErgSvBLEE8gTzBKIFowWnBcgFywXJBcoFzwXMBdIF4AXeBdUFzQXfBd0F1gXOBdgFCvDujYAA1gUFABDqBAsJAEEAKALA4g8LCwAQFUEAKALA4g8LxgcBBX8jAEHQAGsiACQAAkBBACgCsOgPDQBBAEEANgLA4g8QhQEhAUEAQQE2AsDiD0EAIAE2ArDoDyABQdnRAEEBQQEQhAFBACgCsOgPQd4eQQJBARCEAUEAKAKw6A9B9yNBA0EBEIQBQQAoArDoD0HwGkEEQQEQhAFBACgCsOgPQb/SAEEFQQEQhAFBACgCsOgPQfcjED4aQQAoArDoD0F/QcsaEEAaQQAoArDoD0HLGhBGQQAoArDoD0F+EB9BAEECNgLA4g9BACgCsOgPQQZBABA7QQAoArDoD0HG0AAQRkEAKAKw6A9BB0EAEDtBACgCsOgPQYQUEEZBACgCsOgPQQBBABBEQQAoArDoD0HnDxBGQQAoArDoD0HnDxA+GkEAIQIDQCACQQJ0IgNBwLgOaigCACEEAkACQEEAKAKw6A8iASAEIAQQ/gQgA0Hgtw5qKAIAIgNBABB+RQ0AIAFBf0EAEDAhBCABQX4QHyAAIAQ2AkQgACADNgJAIAFBvREgAEHAAGoQOhogAUF+IAMQSAwBCwJAIAFBAEEBQQBBAEEAEE5FDQAgAUF/QQAQMCEEIAFBfhAfIAAgBDYCNCAAIAM2AjAgAUGiESAAQTBqEDoaCyABQX4gAxBIIAFBfyADEEAaIAEgAxBGC0EAIAJB5ABqNgLA4g8gAkEBaiICQRVHDQALQQAoArDoD0F+EB9BAEHJATYCwOIPQQAoArDoD0EAQQAQREEAKAKw6A9Bkw0QRkEAQcoBNgLA4g9BACgCsOgPQZMNED4aQQBBywE2AsDiD0EAIQIDQEEAQe4PNgLA4g8gAkECdCIBQeC3DmooAgAhBCABQaC5DmooAgAhAwJAAkBBACgCsOgPIgEgAyADEP4EQc8SQQAQfkUNACABQX9BABAwIQMgAUF+EB8gACADNgIkIAAgBDYCICABQbYRIABBIGoQOhoMAQtBAEHvDzYCwOIPAkAgAUEAQQFBAEEAQQAQTkUNACABQX9BABAwIQMgAUF+EB8gACADNgIUIAAgBDYCECABQYsRIABBEGoQOhoLQQBB8A82AsDiDwsgAUF+IAQQSEEAIAJBrAJqNgLA4g8gAkEBaiICQRVHDQALQQAoArDoD0F+EB9BAEGQAzYCwOIPAkACQEEAKAKw6A9BupgCEIABDQBBACgCsOgPQQBBf0EAQQBBABBORQ0BCyAAQQAoArDoD0F/QQAQMDYCAEEAKALgyA9Bl8sBIAAQtAQaQQAoArDoD0F+EB8LQQBB9AM2AsDiDwsgAEHQAGokAAvfAQEFfyMAQSBrIgEkAAJAIABBAUEAEG0iAhD+BCIDQXBPDQACQAJAIANBCksNACABIAM6AAsgASEEDAELIANBEGpBcHEiBRDCBSEEIAEgBUGAgICAeHI2AgggASAENgIAIAEgAzYCBAsCQCADRQ0AIAQgAiADEJoEGgsgBCADakEAOgAAIAFBEGogARAAAkAgASwAC0F/Sg0AIAEoAgAQwwULIAAgASgCECABQRBqIAEsABtBAEgbEDgaAkAgASwAG0F/Sg0AIAEoAhAQwwULIAFBIGokAEEBDwsgARAZAAvfAQEFfyMAQSBrIgEkAAJAIABBAUEAEG0iAhD+BCIDQXBPDQACQAJAIANBCksNACABIAM6AAsgASEEDAELIANBEGpBcHEiBRDCBSEEIAEgBUGAgICAeHI2AgggASAENgIAIAEgAzYCBAsCQCADRQ0AIAQgAiADEJoEGgsgBCADakEAOgAAIAFBEGogARABAkAgASwAC0F/Sg0AIAEoAgAQwwULIAAgASgCECABQRBqIAEsABtBAEgbEDgaAkAgASwAG0F/Sg0AIAEoAhAQwwULIAFBIGokAEEBDwsgARAZAAugAgEDfyMAQSBrIgIkABAVQQAoArDoD0GTDRA+GkEAKAKw6A9BfyAAEEAaQQAoArDoD0F/ECQhA0EAKAKw6A8hBAJAAkAgA0EGRg0AIARBfRAfIAIgADYCEEHA6A9BgIAQQc/aACACQRBqEPAEGgwBCyAEIAFB1bcOIAEbEDgaQQAoArDoD0EBQQFBAEEAQQAQTiEDQQAoArDoD0F/QQAQMCEAAkAgA0UNACACIAA2AgBBwOgPQYCAEEHYESACEPAEGkEAKAKw6A9BfhAfDAELQQAoArDoD0F+EB8CQCAADQBBAEEALwCaVTsBxOgPQQBBACgAllU2AsDoDwwBC0HA6A8gAEH//w8QgQUaQQBBADoAv+gfCyACQSBqJABBwOgPCwgAIAAQxAUAC1YBAn8gACgCFCECQQEhAwJAIAAoAhggACgCDGtBBHUgAUoNACAAIAFBABDzASEDCwJAIANFDQAgAigCBCAAKAIMIAFBBHRqIgBPDQAgAiAANgIECyADCxsBAX8gACgCECIAKAKgASECIAAgATYCoAEgAgsLAEQAAAAAAIB/QAspAAJAIAFBf2pB2PNCSQ0AIAAoAgwgACgCFCgCAGtBBHUgAWohAQsgAQsWACAAKAIMIAAoAhQoAgBrQXBqQQR1C7IBAQJ/AkACQCABQQBIDQAgACgCFCgCACABQQR0aiAAKAIMa0EQaiICQQR1IQEgAkEBSA0BIAFBASABQQFIGyEDA0AgACAAKAIMIgJBEGo2AgwgAkEAOgAIIAFBAUohAiABQX9qIQEgAg0ACyADQX9qIQEMAQsgAUEBaiEBCyAAKAIMIAFBBHRqIQICQCABQX9KDQAgACgCJCACSQ0AIAAgAkF/QQAQjQIhAgsgACACNgIMCzoBAX8CQAJAIAFBAUgNACAAKAIUIQIMAQsgAEEMaiECCyAAIAIoAgAgAUEEdGpBf0EAEI0CQQA6AAgLywICA38BfiAAKAIMQXBqIQMCQAJAIAFBAU4NACAAQQxqIQAMAQsgACgCFCEACwJAIAAoAgAgAUEEdGoiACAAIAJBBHQiAWtBcGogAyABayACQQBIGyIETw0AIAAhASAEIQIDQCABKQMAIQYgASACKQMANwMAIAEtAAghBSABIAItAAg6AAggAiAFOgAIIAIgBjcDACABQRBqIgEgAkFwaiICSQ0ACwsCQCAEQRBqIgEgA08NACADIQIDQCABKQMAIQYgASACKQMANwMAIAEtAAghBSABIAItAAg6AAggAiAFOgAIIAIgBjcDACABQRBqIgEgAkFwaiICSQ0ACwsCQCAAIANPDQADQCAAKQMAIQYgACADKQMANwMAIAAtAAghASAAIAMtAAg6AAggAyABOgAIIAMgBjcDACAAQRBqIgAgA0FwaiIDSQ0ACwsL0AMBAn8gACgCFCEDAkACQCABQQFIDQAgAygCACABQQR0aiIBIAAoAgxJDQEgACgCEEE4aiEBDAELAkAgAUHZ80JIDQAgACgCDCABQQR0aiEBDAELAkAgAUHY80JHDQAgACgCEEEoaiEBDAELAkAgAygCACIELQAIQeYARw0AAkBB2PNCIAFrIAQoAgAiBC0ABkoNACAEQdfzQiABa0EEdGpBEGohAQwCCyAAKAIQQThqIQEMAQsgACgCEEE4aiEBCwJAAkAgAkEBSA0AIAMoAgAgAkEEdGoiAyAAKAIMSQ0BIAAoAhBBOGohAwwBCwJAIAJB2fNCSA0AIAAoAgwgAkEEdGohAwwBCwJAIAJB2PNCRw0AIAAoAhBBKGohAwwBCwJAIAMoAgAiAy0ACEHmAEcNAAJAQdjzQiACayADKAIAIgMtAAZKDQAgA0HX80IgAmtBBHRqQRBqIQMMAgsgACgCEEE4aiEDDAELIAAoAhBBOGohAwsgAyABKQMANwMAIAMgAS0ACDoACAJAIAJB1/NCSg0AIAEtAAhBwABxRQ0AIAAoAhQoAgAoAgAiAi0ABUEgcUUNACABKAIAIgEtAAVBGHFFDQAgACACIAEQkQILC+IBAQJ/IAAoAhQhAiAAKAIMIQMCQAJAIAFBAUgNACACKAIAIAFBBHRqIgEgA0kNASAAKAIQQThqIQEMAQsCQCABQdnzQkgNACADIAFBBHRqIQEMAQsCQCABQdjzQkcNACAAKAIQQShqIQEMAQsCQCACKAIAIgItAAhB5gBHDQACQEHY80IgAWsgAigCACICLQAGSg0AIAJB1/NCIAFrQQR0akEQaiEBDAILIAAoAhBBOGohAQwBCyAAKAIQQThqIQELIAMgASkDADcDACADIAEtAAg6AAggACAAKAIMQRBqNgIMC+IBAQF/IAAoAhQhAgJAAkAgAUEBSA0AIAIoAgAgAUEEdGoiASAAKAIMSQ0BIAAoAhBBOGohAQwBCwJAIAFB2fNCSA0AIAAoAgwgAUEEdGohAQwBCwJAIAFB2PNCRw0AIAAoAhBBKGohAQwBCwJAIAIoAgAiAi0ACEHmAEcNAAJAQdjzQiABayACKAIAIgItAAZKDQAgAkHX80IgAWtBBHRqQRBqIQEMAgsgACgCEEE4aiEBDAELIAAoAhBBOGohAQsCQCABLQAIQQ9xIgINACABIAAoAhBBOGpHDQBBfyECCyACCxIAIAFBAnRB0MgOakEEaigCAAvIAQEBfyAAKAIUIQICQAJAIAFBAUgNACACKAIAIAFBBHRqIgEgACgCDEkNASAAKAIQQThqIQEMAQsCQCABQdnzQkgNACAAKAIMIAFBBHRqIQEMAQsCQCABQdjzQkcNACAAKAIQQShqIQEMAQsCQCACKAIAIgItAAhB5gBHDQACQEHY80IgAWsgAigCACICLQAGSg0AIAJB1/NCIAFrQQR0akEQaiEBDAILIAAoAhBBOGohAQwBCyAAKAIQQThqIQELIAEtAAhBA0YL/gEBAn8jAEEQayICJAAgACgCFCEDAkACQCABQQFIDQAgAygCACABQQR0aiIBIAAoAgxJDQEgACgCEEE4aiEBDAELAkAgAUHZ80JIDQAgACgCDCABQQR0aiEBDAELAkAgAUHY80JHDQAgACgCEEEoaiEBDAELAkAgAygCACIDLQAIQeYARw0AAkBB2PNCIAFrIAMoAgAiAy0ABkoNACADQdfzQiABa0EEdGpBEGohAQwCCyAAKAIQQThqIQEMAQsgACgCEEE4aiEBCwJAAkAgAS0ACEETRw0AIAIgASsDADkDCEEBIQEMAQsgASACQQhqEPUDIQELIAJBEGokACABC84BAQF/IAAoAhQhAgJAAkAgAUEBSA0AIAIoAgAgAUEEdGoiASAAKAIMSQ0BIAAoAhBBOGohAQwBCwJAIAFB2fNCSA0AIAAoAgwgAUEEdGohAQwBCwJAIAFB2PNCRw0AIAAoAhBBKGohAQwBCwJAIAIoAgAiAi0ACEHmAEcNAAJAQdjzQiABayACKAIAIgItAAZKDQAgAkHX80IgAWtBBHRqQRBqIQEMAgsgACgCEEE4aiEBDAELIAAoAhBBOGohAQsgAS0ACEEPcUF9akECSQu4AwECfyAAKAIUIQMCQAJAIAFBAUgNACADKAIAIAFBBHRqIgEgACgCDEkNASAAKAIQQThqIQEMAQsCQCABQdnzQkgNACAAKAIMIAFBBHRqIQEMAQsCQCABQdjzQkcNACAAKAIQQShqIQEMAQsCQCADKAIAIgQtAAhB5gBHDQACQEHY80IgAWsgBCgCACIELQAGSg0AIARB1/NCIAFrQQR0akEQaiEBDAILIAAoAhBBOGohAQwBCyAAKAIQQThqIQELAkACQCACQQFIDQAgAygCACACQQR0aiICIAAoAgxJDQEgACgCEEE4aiECDAELAkAgAkHZ80JIDQAgACgCDCACQQR0aiECDAELAkAgAkHY80JHDQAgACgCEEEoaiECDAELAkAgAygCACIDLQAIQeYARw0AAkBB2PNCIAJrIAMoAgAiAy0ABkoNACADQdfzQiACa0EEdGpBEGohAgwCCyAAKAIQQThqIQIMAQsgACgCEEE4aiECCwJAIAEtAAhBD3ENACABIAAoAhBBOGpHDQBBAA8LAkAgAi0ACEEPcQ0AIAIgACgCEEE4akcNAEEADwtBACABIAIQ/wMLZgECfwJAIAFBcmpBfkkNACAAKAIMIgIgAkFwaiIDKQMANwMAIAIgA0EIai0AADoACCAAIAAoAgxBEGo2AgwLIAAgASAAKAIMIgJBYGoiAyACQXBqIAMQ3QIgACAAKAIMQXBqNgIMC+gDAQJ/IAAoAhQhBAJAAkAgAUEBSA0AIAQoAgAgAUEEdGoiASAAKAIMSQ0BIAAoAhBBOGohAQwBCwJAIAFB2fNCSA0AIAAoAgwgAUEEdGohAQwBCwJAIAFB2PNCRw0AIAAoAhBBKGohAQwBCwJAIAQoAgAiBS0ACEHmAEcNAAJAQdjzQiABayAFKAIAIgUtAAZKDQAgBUHX80IgAWtBBHRqQRBqIQEMAgsgACgCEEE4aiEBDAELIAAoAhBBOGohAQsCQAJAIAJBAUgNACAEKAIAIAJBBHRqIgIgACgCDEkNASAAKAIQQThqIQIMAQsCQCACQdnzQkgNACAAKAIMIAJBBHRqIQIMAQsCQCACQdjzQkcNACAAKAIQQShqIQIMAQsCQCAEKAIAIgQtAAhB5gBHDQACQEHY80IgAmsgBCgCACIELQAGSg0AIARB1/NCIAJrQQR0akEQaiECDAILIAAoAhBBOGohAgwBCyAAKAIQQThqIQILAkAgAS0ACEEPcQ0AIAEgACgCEEE4akcNAEEADwsCQCACLQAIQQ9xDQAgAiAAKAIQQThqRw0AQQAPC0EAIQQCQAJAAkACQCADDgMAAQIDCyAAIAEgAhD/Aw8LIAAgASACEPsDDwsgACABIAIQ/QMhBAsgBAsjAAJAIAEgACgCDBDfAiIBRQ0AIAAgACgCDEEQajYCDAsgAQudAgICfwF8IwBBEGsiAyQAIANCADcDCCAAKAIUIQQCQAJAIAFBAUgNACAEKAIAIAFBBHRqIgEgACgCDEkNASAAKAIQQThqIQEMAQsCQCABQdnzQkgNACAAKAIMIAFBBHRqIQEMAQsCQCABQdjzQkcNACAAKAIQQShqIQEMAQsCQCAEKAIAIgQtAAhB5gBHDQACQEHY80IgAWsgBCgCACIELQAGSg0AIARB1/NCIAFrQQR0akEQaiEBDAILIAAoAhBBOGohAQwBCyAAKAIQQThqIQELAkACQCABLQAIQRNHDQAgAyABKwMAOQMIQQEhAQwBCyABIANBCGoQ9QMhAQsCQCACRQ0AIAIgATYCAAsgAysDCCEFIANBEGokACAFC58CAgJ/AX4jAEEQayIDJAAgA0IANwMIIAAoAhQhBAJAAkAgAUEBSA0AIAQoAgAgAUEEdGoiASAAKAIMSQ0BIAAoAhBBOGohAQwBCwJAIAFB2fNCSA0AIAAoAgwgAUEEdGohAQwBCwJAIAFB2PNCRw0AIAAoAhBBKGohAQwBCwJAIAQoAgAiBC0ACEHmAEcNAAJAQdjzQiABayAEKAIAIgQtAAZKDQAgBEHX80IgAWtBBHRqQRBqIQEMAgsgACgCEEE4aiEBDAELIAAoAhBBOGohAQsCQAJAIAEtAAhBA0cNACADIAEpAwA3AwhBASEBDAELIAEgA0EIakEAEPgDIQELAkAgAkUNACACIAE2AgALIAMpAwghBSADQRBqJAAgBQvTAQEBfyAAKAIUIQICQAJAIAFBAUgNACACKAIAIAFBBHRqIgEgACgCDEkNASAAKAIQQThqIQEMAQsCQCABQdnzQkgNACAAKAIMIAFBBHRqIQEMAQsCQCABQdjzQkcNACAAKAIQQShqIQEMAQsCQCACKAIAIgItAAhB5gBHDQACQEHY80IgAWsgAigCACICLQAGSg0AIAJB1/NCIAFrQQR0akEQaiEBDAILIAAoAhBBOGohAQwBCyAAKAIQQThqIQELIAEtAAgiAUEBRyABQQ9xQQBHcQv7AwEBfyAAKAIUIQMCQAJAIAFBAUgNACADKAIAIAFBBHRqIgMgACgCDEkNASAAKAIQQThqIQMMAQsCQCABQdnzQkgNACAAKAIMIAFBBHRqIQMMAQsCQCABQdjzQkcNACAAKAIQQShqIQMMAQsCQCADKAIAIgMtAAhB5gBHDQACQEHY80IgAWsgAygCACIDLQAGSg0AIANB1/NCIAFrQQR0akEQaiEDDAILIAAoAhBBOGohAwwBCyAAKAIQQThqIQMLAkACQAJAAkAgAy0ACEEPcUF9ag4CAQIAC0EAIQAgAkUNAiACQQA2AgBBAA8LIAAgAxDhAgJAIAAoAhAoAgxBAUgNACAAEKECCyAAKAIUIQMCQCABQQFIDQAgAygCACABQQR0aiIDIAAoAgxJDQEgACgCEEE4aiEDDAELAkAgAUHZ80JIDQAgACgCDCABQQR0aiEDDAELAkAgAUHY80JHDQAgACgCEEEoaiEDDAELAkAgAygCACIDLQAIQeYARw0AAkBB2PNCIAFrIAMoAgAiAy0ABkoNACADQdfzQiABa0EEdGpBEGohAwwCCyAAKAIQQThqIQMMAQsgACgCEEE4aiEDCwJAIAJFDQACQCADKAIAIgEtAAciAEH/AUcNACABKAIMIQALIAIgADYCAAsgAygCAEEQaiEACyAAC5sCAgF/AX4gACgCFCECAkACQCABQQFIDQAgAigCACABQQR0aiIBIAAoAgxJDQEgACgCEEE4aiEBDAELAkAgAUHZ80JIDQAgACgCDCABQQR0aiEBDAELAkAgAUHY80JHDQAgACgCEEEoaiEBDAELAkAgAigCACICLQAIQeYARw0AAkBB2PNCIAFrIAIoAgAiAi0ABkoNACACQdfzQiABa0EEdGpBEGohAQwCCyAAKAIQQThqIQEMAQsgACgCEEE4aiEBC0IAIQMCQAJAAkACQAJAIAEtAAhBP3FBfGoOEQADBAIEBAQEBAQEBAQEBAQBBAsgASgCADEABw8LIAEoAgA1AgwPCyABKAIANQIIDwsgASgCABDNAyEDCyADC4UCAQF/IAAoAhQhAgJAAkAgAUEBSA0AIAIoAgAgAUEEdGoiASAAKAIMSQ0BIAAoAhBBOGohAQwBCwJAIAFB2fNCSA0AIAAoAgwgAUEEdGohAQwBCwJAIAFB2PNCRw0AIAAoAhBBKGohAQwBCwJAIAIoAgAiAi0ACEHmAEcNAAJAQdjzQiABayACKAIAIgItAAZKDQAgAkHX80IgAWtBBHRqQRBqIQEMAgsgACgCEEE4aiEBDAELIAAoAhBBOGohAQtBACEAAkACQAJAIAEtAAhBD3FBfmoOBgECAgICAAILIAEoAgAiASABLwEGIgFBBHRBGGpBECABG2oPCyABKAIAIQALIAALugIBAX8gACgCFCECAkACQCABQQFIDQAgAigCACABQQR0aiIBIAAoAgxJDQEgACgCEEE4aiEBDAELAkAgAUHZ80JIDQAgACgCDCABQQR0aiEBDAELAkAgAUHY80JHDQAgACgCEEEoaiEBDAELAkAgAigCACICLQAIQeYARw0AAkBB2PNCIAFrIAIoAgAiAi0ABkoNACACQdfzQiABa0EEdGpBEGohAQwCCyAAKAIQQThqIQEMAQsgACgCEEE4aiEBCwJAAkACQAJAIAEtAAgiAkE/cUF+ag4VAAEBAQEAAQEBAQEBAQEBAQEBAQECAQtBACEAAkAgAkEPcUF+ag4GAgMDAwMAAwsgASgCACIBIAEvAQYiAUEEdEEYakEQIAEbag8LQQAhACACQcAAcUUNAQsgASgCACEACyAACxkAIAAoAgxBADoACCAAIAAoAgxBEGo2AgwLJAEBfyAAKAIMIgJBEzoACCACIAE5AwAgACAAKAIMQRBqNgIMCyQBAX8gACgCDCICQQM6AAggAiABNwMAIAAgACgCDEEQajYCDAtlAAJAAkAgAg0AIABB1bcOEJYDIQIMAQsgACABIAIQkwMhAgsgACgCDCIBIAI2AgAgASACLQAEQcAAcjoACCAAIAAoAgxBEGo2AgwCQCAAKAIQKAIMQQFIDQAgABChAgsgAkEQagtsAQF/AkACQCABDQBBACEBIAAoAgxBADoACAwBCyAAIAEQlgMhASAAKAIMIgIgATYCACACIAEtAARBwAByOgAIIAFBEGohAQsgACAAKAIMQRBqNgIMAkAgACgCECgCDEEBSA0AIAAQoQILIAELJAAgACABIAIQ4gIhAgJAIAAoAhAoAgxBAUgNACAAEKECCyACCz0BAX8jAEEQayIDJAAgAyACNgIMIAAgASACEOICIQICQCAAKAIQKAIMQQFIDQAgABChAgsgA0EQaiQAIAILuAEBAn8CQCACDQAgACgCDCICQRY6AAggAiABNgIA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CwsPCyAAKAIIQfMbEKsCAAseAQF/IAAgACgCECICNgIUIAAgASACQf8BIAIQtAELagEDfyAAKAIAIQIgAiAAKAIIKAI0IAIoAjQgACgCECACQRRqQQRB/////wNBow8Q0gIiAzYCNCAAIAAoAhAiBEEBajYCECADIARBAnRqIAE2AgAgACACIAAoAggoAggQrQEgACgCEEF/agt2AQN/IAAoAgAhBCAEIAAoAggoAjQgBCgCNCAAKAIQIARBFGpBBEH/////A0GjDxDSAiIFNgI0IAAgACgCECIGQQFqNgIQIAUgBkECdGogAkEHdCABciADQQ90cjYCACAAIAQgACgCCCgCCBCtASAAKAIQQX9qCz0BAX8CQAJAIAAtADQgAWoiASAAKAIAIgItAAhMDQAgAUH/AU4NASACIAE6AAgLDwsgACgCCEHjDBCrAgALRAEBfwJAAkAgAC0ANCABaiIBIAAoAgAiAi0ACEwNACABQf8BTg0BIAIgAToACAsgACABOgA0DwsgACgCCEHjDBCrAgALugEBBH8jAEEQayIDJAACQAJAIAJC//97fEKAgHhUDQAgACgCACEEIAQgACgCCCgCNCAEKAI0IAAoAhAgBEEUakEEQf////8DQaMPENICIgU2AjQgACAAKAIQIgZBAWo2AhAgBSAGQQJ0aiABQQd0IAKnQQ90QYCA/v8HanJBAXI2AgAgACAEIAAoAggoAggQrQEMAQsgA0EDOgAIIAMgAjcDACAAIAEgACADIAMQuwEQvAELIANBEGokAAvOAgEGfyMAQRBrIgMkACAAKAIAIQQgACgCCCIFKAI0IQYCQAJAIAUoAkAgARDBAyIHLQAIQQNHDQAgACgCHCAHKAIAIghMDQAgAi0ACCAEKAIwIAhBBHRqIgUtAAhzQT9xDQBBACAFIAIQ/wMNAQsgBCgCECEFIAAoAhwhCCADQQM6AAggAyAIrDcDACAGIAAoAggoAkAgASAHIAMQywMgBCAGIAQoAjAgCCAEQRBqQRBB////D0G5DBDSAiIBNgIwAkAgBSAEKAIQIgdODQADQCABIAVBBHRqQQA6AAggBUEBaiIFIAdHDQALCyABIAhBBHRqIgUgAikDADcDACAFIAItAAg6AAggACAAKAIcQQFqNgIcIAItAAhBwABxRQ0AIAQtAAVBIHFFDQAgAigCACIF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QQZqENIBDA8LAkAgBw0AIAVBCGpBEGoiByACQRBqIggpAwA3AwAgBUEIakEIaiIJIAJBCGoiBikDADcDACAFIAIpAwA3AwggCCADQRBqIgopAwA3AwAgBiADQQhqIggpAwA3AwAgAiADKQMANwMAIAogBykDADcDACAIIAkpAwA3AwAgAyAFKQMINwMACyAAIAEgAiADIAQQ0wEMDgsgAygCAEEGRw0AIAMoAhAgAygCFEcNACADKQMIIgxCgH98QoF+VA0AIAAgAiADQRVB/wAgDKciAWtBACAEQS9BBxDSASAAKAIQQQJ0IAAoAgAoAjRqQX5qIAFBEHRBgID8A2pBEHY6AAAMDQsCQCADKAIQIAMoAhRHDQAgAygCAEF5akF+SQ0AIAAgAxDQAUUNACAAIAIgAyABQRZqIAMoAghBACAEQTAgAUEGahDSAQwNCyAAIAEgAiADIAQQ0wEMDAtBACEHAkAgAigCACIIQQZHDQAgBUEIakEQaiIHIAJBEGoiCSkDADcDACAFQQhqQQhqIgYgAkEIaiIKKQMANwMAIAUgAikDADcDCCAJIANBEGoiCykDADcDACAKIANBCGoiCSkDADcDACACIAMpAwA3AwAgCyAHKQMANwMAIAkgBikDADcDACADIAUpAwg3AwBBASEHCwJAIAMoAgBBBkcNACAAIAMQ0AFFDQAgACACIAMgAUEWaiADKAIIIAcgBEEwIAFBBmoQ0gEMDAsCQCAIQQZHDQAgBUEIakEQaiIHIAJBEGoiCCkDADcDACAFQQhqQQhqIgkgAkEIaiIGKQMANwMAIAUgAikDADcDCCAIIANBEGoiCikDADcDACAGIANBCGoiCCkDADcDACACIAMpAwA3AwAgCiAHKQMANwMAIAggCSkDADcDACADIAUpAwg3AwALIAAgASACIAMgBBDTAQwLCwJAIAIoAgBBBkcNACACKAIQIAIoAhRHDQAgAikDCEL/fnxCgH5UDQAgBUEIakEQaiIHIAJBEGoiASkDADcDACAFQQhqQQhqIgggAkEIaiIJKQMANwMAIAUgAikDADcDCCABIANBEGoiBikDADcDACAJIANBCGoiASkDADcDACACIAMpAwA3AwAgBiAHKQMANwMAIAEgCCkDADcDACADIAUpAwg3AwAgACACIANBISABKAIAQf8AakEBIARBL0EQENIBDAsLIAAgAiADQSAgBEEQENQBDQogAEEKIAIgAyAEENMBDAoLAkAgAygCAEEGRw0AIAMoAhAgAygCFEcNACADKQMIQv9+fEKAflQNACAAIAIgA0EgIAMoAghB/wBqQQAgBEEvQREQ0gEMCgsgAEELIAIgAyAEENMBDAkLAkAgAigCAEEIRg0AIAVBCGpBEGoiBCACQRBqIgcpAwA3AwAgBUEIakEIaiIIIAJBCGoiCSkDADcDACAFIAIpAwA3AwggByADQRBqIgYpAwA3AwAgCSADQQhqIgcpAwA3AwAgAiADKQMANwMAIAYgBCkDADcDACAHIAgpAwA3AwAgAyAFKQMINwMACyAAIAIQvwECQAJAIAIoAgBBCEcNACACQQhqIQQgAigCECACKAIURg0BIAQoAgAgABDnAkgNACAAIAIgAigCCBDBAQwBCyAAIAIQwAEgAkEIaiEECyAEKAIAIQZBASEJQQAhBwJAAkACQAJAIAMoAgBBe2oOAgABAwtBACEHAkAgAysDCCAFQQhqQQAQ9gNFDQBBASEHDAILQQEhCQwCCyAFIAMpAwg3AwhBACEHCwJAIAMoAhAgAygCFEYNAAwBCwJAIAUpAwgiDEL/fnxCgH5aDQAMAQsgDKdB/wBqIQRBACEJC0E9IQgCQCAJRQ0AAkACQCAAIAMQxwFFDQAgA0EIaiEEQTwhCAwBCyAAIAMQvwECQCADKAIAQQhHDQAgA0EIaiEEQTkhCCADKAIQIAMoAhRGDQEgBCgCACAAEOcCSA0AIAAgAyADKAIIEMEBDAELIAAgAxDAASADQQhqIQRBOSEICyAEKAIAIQQLIAAgAiADENUBIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GjDxDSAiIJNgI0IAAgACgCECIKQQFqNgIQIAkgCkECdGogB0EYdCABQQ1GQQ90ciAEQRB0ciAIIAZBB3RycjYCACAAIAMgACgCCCgCCBCtASAAKAIAIQMgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBow8Q0gIiATYCNCAAIAAoAhAiBEEBajYCECABIARBAnRqQbj+//8HNgIAIAAgAyAAKAIIKAIIEK0BIAAoAhAhACACQRA2AgAgAiAAQX9qNgIIDAgLIAVBCGpBEGoiBCACQRBqIgcpAwA3AwAgBUEIakEIaiIIIAJBCGoiCSkDADcDACAFIAIpAwA3AwggByADQRBqIgYpAwA3AwAgCSADQQhqIgcpAwA3AwAgAiADKQMANwMAIAYgBCkDADcDACAHIAgpAwA3AwAgAyAFKQMINwMAIAFBfWohAQtBASEIQQAhBAJAAkACQAJAIAMoAgBBe2oOAgABAwtBACEEAkAgAysDCCAFQQhqQQAQ9gNFDQBBASEEDAILQQEhCAwCCyAFIAMpAwg3AwhBACEECwJAIAMoAhAgAygCFEYNAAwBCwJAIAUpAwgiDEL/fnxCgH5aDQAMAQsgDKdB/wBqIQdBACEICwJAAkAgCA0AIAAgAhC/AQJAAkAgAigCAEEIRw0AIAJBCGohCCACKAIQIAIoAhRGDQEgCCgCACAAEOcCSA0AIAAgAiACKAIIEMEBDAELIAAgAhDAASACQQhqIQgLIAgoAgAhCEEwIQkMAQtBASEIAkACQAJAAkAgAigCAEF7ag4CAAEDCwJAIAIrAwggBUEIakEAEPYDRQ0AQQEhBAwCC0EBIQgMAgsgBSACKQMINwMICyACKAIQIAIoAhRHDQAgBSkDCCIMQv9+fEKAflQNACAMp0H/AGohB0EAIQgLAkAgCA0AIAAgAxC/AQJAAkAgAygCAEEIRw0AIANBCGohCCADKAIQIAMoAhRGDQEgCCgCACAAEOcCSA0AIAAgAyADKAIIEMEBDAELIAAgAxDAASADQQhqIQgLIAgoAgAhCEEyIQkMAQsgACACEL8BAkACQCACKAIAQQhHDQAgAkEIaiEHIAIoAhAgAigCFEYNASAHKAIAIAAQ5wJIDQAgACACIAIoAggQwQEMAQsgACACEMABIAJBCGohBwsgBygCACEIIAAgAxC/AQJAAkAgAygCAEEIRw0AIANBCGohByADKAIQIAMoAhRGDQEgBygCACAAEOcCSA0AIAAgAyADKAIIEMEBDAELIAAgAxDAASADQQhqIQcLIAcoAgAhB0EsIQkLIAAgAiADENUBIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GjDxDSAiIGNgI0IAAgACgCECIKQQFqNgIQIAYgCkECdGogBEEYdCAIQQd0ciABIAlqciAHQRB0ckGAgAJyNgIAIAAgAyAAKAIIKAIIEK0BIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GjDxDSAiIBNgI0IAAgACgCECIEQQFqNgIQIAEgBEECdGpBuP7//wc2AgAgACADIAAoAggoAggQrQEgACgCECEAIAJBEDYCACACIABBf2o2AggMBgsgAyAGNgIUDAQLIAAoAghB8xsQqwIACyADIAY2AhAMAQsgACgCCEHzGxCrAgALIAIgAykDADcDACACQRBqIANBEGopAwA3AwAgAkEIaiADQQhqKQMANwMADAELIAIgAykDADcDACACQRBqIANBEGopAwA3AwAgAkEIaiADQQhqKQMANwMACyAFQSBqJAALkwQBBH8gACABEL8BAkACQCABKAIAQQhHDQAgASgCECABKAIURg0BIAEoAgggABDnAkgNACAAIAEgASgCCBDBAQwBCyAAIAEQwAELIAAoAgAhCSABKAIIIQogCSAAKAIIKAI0IAkoAjQgACgCECAJQRRqQQRB/////wNBow8Q0gIiCzYCNCAAIAAoAhAiDEEBajYCECALIAxBAnRqIARBGHQgA3IgCkEQdHI2AgAgACAJIAAoAggoAggQrQEgACgCECEJIAAgASACENUBIAFBETYCACABIAlBf2o2AggCQAJAIAAoAhAgACgCACIBKAJAakF/aiwAACIJQYB/Rg0AIAAgACgCGCAJazYCGCAAIAAtADVBf2o6ADUMAQsgAEGBAToANSAAIAAoAiRBf2o2AiQLIAAgASAGEK0BIAAoAgAhASABIAAoAggoAjQgASgCNCAAKAIQIAFBFGpBBEH/////A0GjDxDSAiIJNgI0IAAgACgCECIDQQFqNgIQIAkgA0ECdGogBUEPdCAEQRB0ciAHciAIQRh0ciAKQQd0cjYCACAAIAEgACgCCCgCCBCtAQJAIAAoAhAgACgCACIBKAJAakF/aiwAACIJQYB/Rg0AIAAgACgCGCAJazYCGCAAIAAtADVBf2o6ADUgACABIAYQrQEPCyAAQYEBOgA1IAAgACgCJEF/ajYCJCAAIAEgBhCtAQtmACAAIAMQvwECQAJAIAMoAgBBCEcNACADKAIQIAMoAhRGDQEgAygCCCAAEOcCSA0AIAAgAyADKAIIEMEBDAELIAAgAxDAAQsgACACIAMgAUEiaiADKAIIQQAgBEEuIAFBBmoQ0gEL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ACICDQALCyABQQA2AogBIAFCADcDgAECQCABKAJgIgJFDQADQCACIAItAAVBwAFxIARyOgAFIAIoAgAiAg0ACwsCQCABKAJ4IgJFDQADQCACIAItAAVBwAFxIARyOgAFIAIoAgAiAg0ACwsgAUEANgKYASABQgA3A5ABIAFBCDsATSABQQA2AhQgACABEJoCIQAgASgCDCABKAIIaiICIANBAXYgBWpJDQIgASAANgIUIAEgAiABKAIQQeQAbiIAIAEtAFRBAnQiBGxB/////wcgBEH/////ByAAbkkbayIAQR91IABxEIADDwsCQCABKAKMASICRQ0AAkAgAiABKAKIASIDRg0AA0ACQCACLQAFIgRBB3FBA0cNACACIARBB3M6AAUgBEEgcUUNACABIAIQkgILIAIoAgAiAiADRw0ACwsgAUEANgKMAQsCQCABKAJgIgIgASgCmAEiA0YNAANAAkAgAi0ABSIEQQdxQQNHDQAgAiAEQQdzOgAFIARBIHFFDQAgASACEJICCyACKAIAIgIgA0cNAAsLAkAgASgCeCICRQ0AA0ACQCACLQAFIgRBB3FBA0cNACACIARBB3M6AAUgBEEgcUUNACABIAIQkgILIAIoAgAiAg0ACwsgABCcAhogAUEDOgBNIAFB2ABqIQQCQCABKAJYIgIgASgCgAEiB0YNACABLQBMQRhxIQgDQAJAAkAgAi0ABSIDQRhxRQ0AIAQgAigCADYCACAAIAIQmAIMAQsCQAJAIANBB3EiBA0AIAIgCCADQcABcXJBAXI6AAUMAQsgAiAEQai/DmotAAAgA0H4AXFyOgAFIARBf2pBAUsNACABKAKMAQ0AIAEgAjYCjAELIAIhBAsgBCgCACICIAdHDQALCwJAIAQoAgAiAiABKAKEASIIRg0AIAEtAExBGHEhBiAEIQMDQAJAAkAgAi0ABSIHQRhxRQ0AIAMgAigCADYCACAAIAIQmAIMAQsCQAJAIAdBB3EiAw0AIAIgBiAHQcABcXJBAXI6AAUMAQsgAiADQai/DmotAAAgB0H4AXFyOgAFIANBf2pBAUsNACABKAKMAQ0AIAEgAjYCjAELIAIhAwsgAygCACICIAhHDQALCyABQeAAaiEDIAEgASgChAE2AogBIAQoAgAhAiABIAEoAlg2AoABIAEgAjYChAECQCABKAJgIgIg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QAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEEDAELIAMQhwQhBAsgACAENgIAQS4hAwJAIARBLkcNACAAKAI4IgUgBSgCACIGQX9qNgIAAkACQCAGRQ0AIAUgBSgCBCIGQQFqNgIEIAYtAAAhBQwBCyAFEIcEIQULIAAgBTYCACAEQS5HDQBBlwIhAyAAKAIAQS5HDQMgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxCHBCEDCyAAIAM2AgBBmAIhAwwDCyAAKAIAQfC8DmpBAWotAABBAnFFDQILIAAgARC3AiEDDAELAkAgBEHwvA5qQQFqLQAAQQFxRQ0AA0AgACgCACEFAkAgACgCPCIDKAIEQQFqIAMoAggiBE0NACAEQf////8HTw0SIAAoAjQgAygCACAEIARBAXQiBhDUAiEEIAMgBjYCCCADIAQ2AgALIAMgAygCBCIEQQFqNgIEIAQgAygCAGogBToAACAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhAwwBCyADEIcEIQMLIAAgAzYCACADQfC8DmpBAWotAABBA3ENAAsgASAAIAAoAjwiAygCACADKAIEEK0CIgA2AgBBowIhAyAALQAEQQRHDQEgAC0ABiIARQ0BIABB/wFqIQMMAQsgACgCOCIDIAMoAgAiBUF/ajYCAAJAAkAgBUUNACADIAMoAgQiBUEBajYCBCAFLQAAIQMMAQsgAxCHBCEDCyAAIAM2AgAgBCEDCyACQRBqJAAgAw8LIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgALIABB2htBABCsAgAL1gEBA38gACgCACEBIAAoAjgiAiACKAIAIgNBf2o2AgACQAJAIANFDQAgAiACKAIEIgNBAWo2AgQgAy0AACECDAELIAIQhwQhAgsgACACNgIAAkACQCAC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CVoNASAAIAM2AggLIAAoAgwgCKdBBHRqIQEMAQtBfyAALQAHdEF/c0EBciEBIAAoAhAhAgJAAkAgA0EASA0AIAMgAW8hAQwBCyAHIAGsgqchAQsgAiABQRhsaiEBA0ACQCABLQAJQQNHDQAgASkDECAHUQ0CCyABIAEoAgwiA0EYbGohASADDQALQejHDiEBCyABLQAIQQ9xDQELIAStDwsgBEEBIAQbrSEHIAVBf0ohAwJAAkACQANAIAciCEL//////////z9WDQECQAJAAkAgCEIBhiIHQn98IgkgADUCCCIKVA0AIAMNASAJQgAgCn2DIApaDQEgACAHPgIICyAAKAIMIAmnQQR0aiEBDAELIAAoAhAhAQJAAkAgB0L/////B1YNACAHp0F/IAAtAAd0QX9zQQFybyEEDAELIAdBfyAALQAHdEF/c0EBcqyCpyEECyABIARBGGxqIQEDQAJAIAEtAAlBA0cNACABKQMQIAdRDQILIAEgASgCDCIEQRhsaiEBIAQNAAtB6McOIQELIAEtAAhBD3ENAAwCCwALAkACQCAFQX9KDQBCACAANQIIIgd9Qv7//////////wCDIAdaDQAgAEF/NgIIIAAoAgxBYGohAQwBCyAAKAIQQv///////////wBBfyAALQAHdEF/c0EBcqyCp0EYbGohAQNAAkAgAS0ACUEDRw0AIAEpAxBC////////////AFENAgsgASABKAIMIgRBGGxqIQEgBA0AC0Hoxw4hAQtC////////////ACEHIAEtAAhBD3ENAQsCQCAHIgkgCH1CAloNACAIDwsgBUF/SiEDIAghBwNAAkACQAJAIAkgB3wiC0IBiCIIQn98IgogADUCCCIMVA0AIAMNASAKQgAgDH2DIAxaDQEgACAIPgIICyAAKAIMIAqnQQR0aiEBDAELIAAoAhAhAQJAAkAgC0L/////D1YNACAIp0F/IAAtAAd0QX9zQQFybyEEDAELIAhBfyAALQAHdEF/c0EBcqyCpyEECyABIARBGGxqIQEDQAJAIAEtAAlBA0cNACABKQMQIAhRDQILIAEgASgCDCIEQRhsaiEBIAQNAAtB6McOIQELIAkgCCABLQAIQQ9xIgEbIgkgCCAHIAEbIgd9QgFWDQALCyAHCycAIABEAAAAAACAf0BBiAEQigEgAEEAQQcQRCAAQYDIDkEAEHZBAQuZAgIDfwJ+IwBBwARrIgEkACAAQQFBBRDQAyAAQQEQggEhBCAAQQJB1bcOIAFBLGoQbCECIABBA0IBEHUhBSAAQQQgBBB1IQQgACABQTBqEF8CQCAFIARZDQADQCAAQQEgBRBBGgJAIABBfxAoDQAgACAAQX8QJBAlIQMgASAFNwMYIAEgAzYCECAAQY7ZACABQRBqEGUaCyABQTBqEGIgAUEwaiACIAEoAiwQdyAFQgF8IgUgBFINAAsgBCEFCwJAIAUgBFINACAAQQEgBRBBGgJAIABBfxAoDQAgACAAQX8QJBAlIQIgASAFNwMIIAEgAjYCACAAQY7ZACABEGUaCyABQTBqEGILIAFBMGoQYyABQcAEaiQAQQELoAEBAX8CQCAAIAEQJEEFRg0AAkAgACABEEVFDQBBASEDAkAgAkEBcUUNACAAQfYIEDgaQQIhAyAAQX4QQkUNAQsCQCACQQJxRQ0AIABB6wgQOBogACADQX9zEEJFDQEgA0EBaiEDCwJAIAJBBHFFDQAgAEGHGBA4GiAAIANBf3MQQkUNASADQQFqIQMLIAAgA0F/cxAfDwsgACABQQUQbwsLkgEBA34gAEEBQQcQ0AMgAEEBEIIBQgF8IQECQAJAAkAgABAeQX5qDgIBAAILAkAgAEECEHMiAkJ/fCABVA0AIABBAkHQDxBkGgsCQCABIAJXDQADQCAAQQEgAUJ/fCIDEEEaIABBASABEEkgAyEBIAMgAlUNAAsLIAIhAQsgAEEBIAEQSUEADwsgAEHE2ABBABBlC1gCAn8BfiAAIAAQHiIBQQEQRCAAQQFBARAhAkAgAUEBSA0AIAGtIQMDQCAAQQEgAxBJIANCAVUhAiADQn98IQMgAg0ACwsgACABrBA2IABBAUGhGBBIQQELqwECA34BfyAAQQJCARB1IQECQAJAIABBAxAkQQBKDQAgAEEBEIIBIQIMAQsgAEEDEHMhAgtBACEEAkACQCACIAFTDQBBASEEAkAgAiABfSIDQv7///8HVg0AIAAgA0IBfCIDpxAaRSEECyAEDQECQCACIAFXDQADQCAAQQEgARBBGiABQgF8IgEgAlINAAsLIABBASACEEEaIAOnIQQLIAQPCyAAQbcaQQAQZQuFAQEDfiAAQQFBBxDQAyAAQQEQggEhAQJAIAEgAEECIAEQdSICUQ0AIAJCf3wgAVgNACAAQQJB0A8QZBoLIABBASACEEEaAkAgAiABWQ0AA0AgAEEBIAJCAXwiAxBBGiAAQQEgAhBJIAMhAiADIAFSDQALIAEhAgsgABA0IABBASACEElBAQu4AgIFfgJ/IABBAhBzIQEgAEEDEHMhAiAAQQQQcyEDIABBBRAkIQYgAEEBQQEQ0AMgAEEFQQEgBkEAShsiB0ECENADAkAgAiABUw0AAkAgAUIAVQ0AIAIgAUL///////////8AfFMNACAAQQNB+iAQZBoLAkAgAyACIAF9IgRC////////////AIVXDQAgAEEEQZImEGQaCwJAAkAgAyACVQ0AIAMgAVcNACAGQQFIDQEgAEEBIAdBABArDQELQgAhBSAEQgBTDQEgAiABfUIBfCEEA0AgAEEBIAUgAXwQQRogACAHIAUgA3wQSSAFQgF8IgUgBFINAAwCCwALIARCAFMNAANAIABBASAEIAF8EEEaIAAgByAEIAN8EEkgBEIAVSEGIARCf3whBCAGDQALCyAAIAcQI0EBC2ABAX4gAEEBQQcQ0AMCQCAAQQEQggEiAUICUw0AAkAgAUL/////B1MNACAAQQFBhx8QZBoLAkAgAEECECRBAUgNACAAQQJBBhBvCyAAQQIQHyAAQQEgAadBABDXAwtBAAvMBQIEfwN+IwBBEGsiBCQAAkADQCACIAFNDQEgAEEBIAGtIggQQRogAEEBIAKtIgkQQRoCQAJAIABBf0F+ENgDRQ0AIABBASAIEEkgAEEBIAkQSQwBCyAAQX0QHwtBACEFAkAgAiABayIGQQFGDQACQAJAAkAgBkHkAEkNACADDQELIAIgAWpBAXYhBwwBCyAGQQJ2IgcgAWogAyAHQQF0cGohBwsgAEEBIAetIgoQQRogAEEBIAgQQRoCQAJAIABBfkF/ENgDRQ0AIABBASAKEEkgAEEBIAgQSQwBCyAAQX4QHyAAQQEgCRBBGgJAIABBf0F+ENgDRQ0AIABBASAKEEkgAEEBIAkQSQwBCyAAQX0QHwsgBkECRg0AIABBASAKEEEaIABBfxAjIABBASACQX9qIgetIgkQQRogCSEIIAEhBiAHIQUDQCAAQQEgChBJIABBASAIEEkgAEEBIAZBAWoiBq0iChBBGgJAIABBf0F+ENgDRQ0AA0ACQCAGIAdHDQAgAEGuHEEAEGUaCyAAQX4QHyAAQQEgBkEBaiIGrSIKEEEaIABBf0F+ENgDDQALCyAAQQEgBUF/aiIFrSIIEEEaAkAgAEF9QX8Q2ANFDQADQAJAIAUgBk8NACAAQa4cQQAQZRoLIABBfhAfIABBASAFQX9qIgWtIggQQRogAEF9QX8Q2AMNAAsLIAUgBk8NAAsgAEF+EB8gAEEBIAkQSSAAQQEgChBJAkACQCAGIAFrIgcgAiAGayIFTw0AIAAgASAGQX9qIAMQ1wMgBkEBaiEBDAELIAAgBkEBaiACIAMQ1wMgBkF/aiECIAUhBwtBASEFIAIgAWtBB3YgB00NAEEAIQMQBiEGIARBABAFNgIMIAQgBjYCCEEAIQYDQCAEQQhqIAZBAnRqKAIAIANqIQMgBkEBaiIGQQJHDQALCyAFDQALCyAEQRBqJAALTAACQCAAQQIQJA0AIAAgASACQQEQKw8LIABBAhAjIAAgAUF/ahAjIAAgAkF+ahAjIABBAkEBQQBBABBNIABBfxAvIQIgAEF+EB8gAgtSAQN/QQAhAQNAIAAgAUECdCICQYDJDmooAgAQlgMhAyAAKAIQIAJqQawBaiADNgIAIAAgACgCECACakGsAWooAgAQlAIgAUEBaiIBQRlHDQALCywAAkAgACACEMgDIgItAAhBD3ENACAAIAAtAAZBASABdHI6AAZBACECCyACC3oBAX8CQAJAAkACQCABLQAIQQ9xIgNBe2oOAwACAQILIAEoAgBBGGohAQwCCyABKAIAQQxqIQEMAQsgACgCECADQQJ0akGQAmohAQsgACgCECEAAkAgASgCACIBRQ0AIAEgACACQQJ0akGsAWooAgAQyAMPCyAAQThqC48BAQJ/AkACQAJAAkACQCABLQAIIgJBu39qDgMAAwEDCyABKAIAKAIYIgMNASACQccARw0CCyABKAIAKAIMIgNFDQELAkAgAyAAQfMiEJYDEMgDIgMtAAhBD3EiAEEERw0AIAMoAgBBEGohAgsgAEEERg0BCyABLQAIQQ9xQQJ0QdDIDmpBBGooAgAhAgsgAguQAQEBfyAAKAIMIgUgASkDADcDACAFIAEtAAg6AAggBSACKQMANwMQIAVBGGogAi0ACDoAACAFIAMpAwA3AyAgBUEoaiADLQAIOgAAIAUgBCkDADcDMCAFQThqIAQtAAg6AAAgACAFQcAAajYCDAJAIAAoAhQtACJBCnENACAAIAVBABD+AQ8LIAAgBUEAEP8BC7cBAQJ/IAAoAhwhBSAAKAIMIgYgASkDADcDACAGIAEtAAg6AAggBiACKQMANwMQIAZBGGogAi0ACDoAACAGIAMpAwA3AyAgBkEoaiADLQAIOgAAIAAgACgCDEEwajYCDAJAAkAgACgCFC0AIkEKcQ0AIAAgBkEBEP4BDAELIAAgBkEBEP8BCyAAIAAoAgxBcGoiBjYCDCAAKAIcIAQgBWtqIgAgBikDADcDACAAIAZBCGotAAA6AAgLcAACQAJAIAAgASACIAMgBBDgAw0AAkACQCAEQXNqQQVJDQAgBEETRw0BCwJAIAEtAAhBD3FBA0cNACACLQAIQQ9xQQNGDQMLIAAgASACQbEXEOcBAAsgACABIAJBzhcQ5wEACw8LIAAgASACEOgBAAvPAwECfwJAAkACQAJAIAEtAAhBD3EiBUF7ag4DAAIBAgsgASgCAEEYaiEGDAILIAEoAgBBDGohBgwBCyAAKAIQIAVBAnRqQZACaiEGCyAAKAIQIQUCQAJAIAYoAgAiBkUNACAGIAUgBEECdGpBrAFqKAIAEMgDIQUMAQsgBUE4aiEFCwJAIAUtAAhBD3ENAAJAAkACQAJAIAItAAhBD3EiBUF7ag4DAAIBAgsgAigCAEEYaiEFDAILIAIoAgBBDGohBQwBCyAAKAIQIAVBAnRqQZACaiEFCyAAKAIQIQYCQCAFKAIAIgVFDQAgBSAGIARBAnRqQawBaigCABDIAyEFDAELIAZBOGohBQsCQCAFLQAIQQ9xDQBBAA8LIAAoAhwhBCAAKAIMIgYgBSkDADcDACAGIAUtAAg6AAggBiABKQMANwMQIAZBGGogAS0ACDoAACAGIAIpAwA3AyAgBkEoaiACLQAIOgAAIAAgACgCDEEwajYCDAJAAkAgACgCFC0AIkEKcQ0AIAAgBkEBEP4BDAELIAAgBkEBEP8BCyAAIAAoAgxBcGoiBTYCDCAAKAIcIAMgBGtqIgAgBSkDADcDACAAIAVBCGotAAA6AAhBAQsvAQJ/AkAgACAAKAIMIgFBYGoiAiABQXBqIgEgAkEWEOADDQAgACACIAEQ5gEACwviAQACQAJAAkACQCADRQ0AIAAgAiABIAQgBRDgAw0BAkACQCAFQXNqQQVJDQAgBUETRw0BCwJAIAItAAhBD3FBA0cNACABLQAIQQ9xQQNGDQQLIAAgAiABQbEXEOcBAAsgACACIAFBzhcQ5wEACyAAIAEgAiAEIAUQ4AMNAAJAAkAgBUFzakEFSQ0AIAVBE0cNAQsCQCABLQAIQQ9xQQNHDQAgAi0ACEEPcUEDRg0ECyAAIAEgAkGxFxDnAQALIAAgASACQc4XEOcBAAsPCyAAIAIgARDoAQALIAAgASACEOgBAAsxAQF/IwBBEGsiBiQAIAZBAzoACCAGIAI3AwAgACABIAYgAyAEIAUQ4gMgBkEQaiQACzkAAkAgACABIAIgACgCDCADEOADRQ0AIAAoAgwtAAgiAEEBRyAAQQ9xQQBHcQ8LIAAgASACEOkBAAuFAQEBfyMAQRBrIgYkAAJAAkAgBEUNACAGIAK3OQMAQRMhBAwBCyAGIAKsNwMAQQMhBAsgBiAEOgAIAkAgACAGIAEgAxsiBCABIAYgAxsiAyAAKAIMIAUQ4AMNACAAIAQgAxDpAQALIAAoAgwtAAghACAGQRBqJAAgAEEBRyAAQQ9xQQBHcQvxAQEEfyACQRhqIAAoAgwgAigCAGtBBHUiBCABQX9zajYCAEEBIQUCQCAAKAIYIAAoAgxrQQR1IAMtAAhBAWoiA0oNACAAIANBARDzARoLIAAgACgCDCIDQRBqNgIMIAMgAigCACIGKQMANwMAIAMgBi0ACDoACAJAIAFBAUgNAANAIAAgACgCDCIDQRBqNgIMIAMgAigCACAFQQR0IgZqIgcpAwA3AwAgAyAHLQAIOgAIIAIoAgAgBmpBADoACCAFIAFHIQMgBUEBaiEFIAMNAAsLIAIgAigCACAEQQR0IgVqNgIAIAIgAigCBCAFajYCBAv6AQEEfyABQRhqKAIAIQQCQCADQX9KDQACQCAAKAIYIAAoAgxrQQR1IARKDQAgAiAAKAIcayEDAkAgACgCECgCDEEBSA0AIAAQoQILIAAgBEEBEPMBGiAAKAIcIANqIQILIAAgAiAEQQR0ajYCDCAEIQMLQQAhAAJAIANBAUgNACAEQQFIDQBBACEAQQAgBGtBBHQhBQNAIAIgAEEEdCIGaiIHIAEoAgAgBWogBmoiBikDADcDACAHIAYtAAg6AAggAEEBaiIAIANODQEgACAESA0ACwsCQCAAIANODQADQCACIABBBHRqQQA6AAggAEEBaiIAIANHDQALCwvHCAEDfyMAQdAAayIDJAACQAJAAkACQCACLQAAIgRBQ2oOBAACAgABCyACQQFqIQUMAgtB6RwhBSAEQRtGDQELIAIhBQsgAyABNgI0IAMgADYCMCADIAU2AjgCQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCABIANBwABqQQMQiQQNAEHf0AAgA0HAAGpBAxDgBA0BIAEgASgCACICQX9qNgIAAkACQCACRQ0AIAEgASgCBCICQQFqNgIEIAItAAAhAgwBCyABEIcEIQILIAJBf0YNAiACQf8BcUHUAEcNAyABIAEoAgAiAkF/ajYCAAJAAkAgAkUNACABIAEoAgQiAkEBajYCBCACLQAAIQIMAQsgARCHBCECCyACQX9GDQQgAkH/AXENBSABIANBwABqQQYQiQQNBkHPtw4gA0HAAGpBBhDgBA0HIAEgASgCACICQX9qNgIAAkACQCACRQ0AIAEgASgCBCICQQFqNgIEIAItAAAhAgwBCyABEIcEIQILIAJBf0YNCCACQf8BcUEERw0JIAEgASgCACICQX9qNgIAAkACQCACRQ0AIAEgASgCBCICQQFqNgIEIAItAAAhAgwBCyABEIcEIQILIAJBf0YNCiACQf8BcUEIRw0LIAEgASgCACICQX9qNgIAAkACQCACRQ0AIAEgASgCBCICQQFqNgIEIAItAAAhAgwBCyABEIcEIQILIAJBf0YNDCACQf8BcUEIRw0NIAEgA0HAAGpBCBCJBA0OIAMpA0BC+KwBUg0PIAEgA0HAAGpBCBCJBA0QIAMrA0BEAAAAAAAod0BiDREgASABKAIAIgJBf2o2AgACQAJAIAJFDQAgASABKAIEIgJBAWo2AgQgAi0AACEBDAELIAEQhwQhAQsgAUF/Rg0SIAAgAUH/AXEQhwIhASAAKAIMIgJBxgA6AAggAiABNgIAIAAQ9QEgASAAEI4CIgI2AgwCQCABLQAFQSBxRQ0AIAItAAVBGHFFDQAgACABIAIQkQILIANBMGogASgCDEEAEOkDIANB0ABqJAAgAQ8LIANBMGpBjhoQ6gMACyADQTBqQesZEOoDAAsgA0EwakGOGhDqAwALIANBMGpBrRsQ6gMACyADQTBqQY4aEOoDAAsgA0EwakGdGxDqAwALIANBMGpBjhoQ6gMACyADQTBqQf4ZEOoDAAsgA0EwakGOGhDqAwALIANBghY2AiAgA0EwaiAAQb4bIANBIGoQ5QIQ6gMACyADQTBqQY4aEOoDAAsgA0GWEzYCECADQTBqIABBvhsgA0EQahDlAhDqAwALIANBMGpBjhoQ6gMACyADQeoTNgIAIANBMGogAEG+GyADEOUCEOoDAAsgA0EwakGOGhDqAwALIANBMGpBlRsQ6gMACyADQTBqQY4aEOoDAAsgA0EwakH/GhDqAwALIANBMGpBjhoQ6gMAC7sdAQd/IwBBEGsiAyQAIAEgACABEOsDIgQgAiAEGzYCTCAAQQRqIQRBACEFAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkADQCAEKAIAIgIgAigCACIGQX9qNgIAAkACQCAGRQ0AIAIgAigCBCIGQQFqNgIEIAYtAAAhAgwBCyACEIcEIQILIAJBf0YNASAFQf///wdPDQIgAkH/AHEgBUEHdHIhBSACQYABcUUNAAsgASAFNgIoQQAhBQNAIAQoAgAiAiACKAIAIgZBf2o2AgACQAJAIAZFDQAgAiACKAIEIgZBAWo2AgQgBi0AACECDAELIAIQhwQhAgsgAkF/Rg0DIAVB////B08NBCACQf8AcSAFQQd0ciEFIAJBgAFxRQ0ACyABIAU2AiwgBCgCACICIAIoAgAiBUF/ajYCAAJAAkAgBUUNACACIAIoAgQiBUEBajYCBCAFLQAAIQIMAQsgAhCHBCECCyACQX9GDQQgASACOgAGIAQoAgAiAiACKAIAIgVBf2o2AgACQAJAIAVFDQAgAiACKAIEIgVBAWo2AgQgBS0AACECDAELIAIQhwQhAgsgAkF/Rg0FIAEgAjoAByAEKAIAIgIgAigCACIFQX9qNgIAAkACQCAFRQ0AIAIgAigCBCIFQQFqNgIEIAUtAAAhAgwBCyACEIcEIQILIAJBf0YNBiABIAI6AAhBACEFA0AgBCgCACICIAIoAgAiBkF/ajYCAAJAAkAgBkUNACACIAIoAgQiBkEBajYCBCAGLQAAIQIMAQsgAhCHBCECCyACQX9GDQggBUH///8HTw0JIAJB/wBxIAVBB3RyIQUgAkGAAXFFDQALIAAoAgAhBiAFQYGAgIB8akH/////e00NCUEAIQIgBiAFQQJ0IgdBABDZAiEGIAEgBTYCFCABIAY2AjQgBCgCACAGIAcQiQQNCgNAIAQoAgAiBSAFKAIAIgZBf2o2AgACQAJAIAZFDQAgBSAFKAIEIgZBAWo2AgQgBi0AACEFDAELIAUQhwQhBQsgBUF/Rg0MIAJB////B08NDSAFQf8AcSACQQd0ciECIAVBgAFxRQ0ACyAAKAIAIQYgAkGBgICAf2pB/////35NDQ1BACEFIAYgAkEEdEEAENkCIQYgASACNgIQIAEgBjYCMAJAIAJBAEwNAANAIAYgBUEEdGpBADoACCAFQQFqIgUgAkcNAAtBACEGIAJBAEwNAANAIAEoAjAhCCAEKAIAIgUgBSgCACIHQX9qNgIAAkACQCAHRQ0AIAUgBSgCBCIHQQFqNgIEIActAAAhBQwBCyAFEIcEIQULIAVBf0YNECAIIAZBBHRqIQcCQAJAAkACQAJAIAVB/wFxDhUDAwQBAgQEBAQEBAQEBAQEBAMEAAIECyAEKAIAIANBCGpBCBCJBA0VIAcgAysDCDkDAEETIQUMAgsgBCgCACADQQhqQQgQiQQNFSAHIAMpAwg3AwBBAyEFDAELIAAgARDrAyIFRQ0VIAcgBTYCACAFLQAEQcAAciEFCyAHIAU6AAgLIAZBAWoiBiACRw0ACwtBACECA0AgBCgCACIFIAUoAgAiBkF/ajYCAAJAAkAgBkUNACAFIAUoAgQiBkEBajYCBCAGLQAAIQUMAQsgBRCHBCEFCyAFQX9GDRMgAkH///8HTw0UIAVB/wBxIAJBB3RyIQIgBUGAAXFFDQALIAAoAgAhBiACQYGAgIB+akH/////fU0NFEEAIQUgBiACQQN0QQAQ2QIhBiABIAI2AgwgASAGNgI8AkAgAkEATA0AA0AgBiAFQQN0akEANgIAIAVBAWoiBSACRw0AC0EAIQYgAkEATA0AA0AgBCgCACIFIAUoAgAiB0F/ajYCAAJAAkAgB0UNACAFIAUoAgQiB0EBajYCBCAHLQAAIQUMAQsgBRCHBCEFCyAFQX9GDRcgASgCPCAGQQN0IgdqIAU6AAQgBCgCACIFIAUoAgAiCEF/ajYCAAJAAkAgCEUNACAFIAUoAgQiCEEBajYCBCAILQAAIQUMAQsgBRCHBCEFCyAFQX9GDRggASgCPCAHaiAFOgAFIAQoAgAiBSAFKAIAIghBf2o2AgACQAJAIAhFDQAgBSAFKAIEIghBAWo2AgQgCC0AACEFDAELIAUQhwQhBQsgBUF/Rg0ZIAEoAjwgB2ogBToABiAGQQFqIgYgAkcNAAsLQQAhAgNAIAQoAgAiBSAFKAIAIgZBf2o2AgACQAJAIAZFDQAgBSAFKAIEIgZBAWo2AgQgBi0AACEFDAELIAUQhwQhBQsgBUF/Rg0ZIAJB////B08NGiAFQf8AcSACQQd0ciECIAVBgAFxRQ0ACyAAKAIAIQYgAkGBgICAfGpB/////3tNDRpBACEFIAYgAkECdEEAENkCIQYgASACNgIcIAEgBjYCOAJAIAJBAEwNAANAIAEoAjggBUECdGpBADYCACAFQQFqIgUgAkcNAAsLAkAgAkEBSA0AQQAhBQNAIAAoAgAQjgIhByABKAI4IAVBAnQiBmogBzYCAAJAIAEtAAVBIHFFDQAgASgCOCAGaigCACIHLQAFQRhxRQ0AIAAoAgAgASAHEJECCyAAIAEoAjggBmooAgAgASgCTBDpAyAFQQFqIgUgAkcNAAsLQQAhBQNAIAQoAgAiAiACKAIAIgZBf2o2AgACQAJAIAZFDQAgAiACKAIEIgZBAWo2AgQgBi0AACECDAELIAIQhwQhAgsgAkF/Rg0cIAVB////B08NHSACQf8AcSAFQQd0ciEFIAJBgAFxRQ0AC0EAIQcgACgCACAFQQAQ2QIhAiABIAU2AhggASACNgJAIAAoAgQgAiAFEIkEDR0DQCAEKAIAIgIgAigCACIFQX9qNgIAAkACQCAFRQ0AIAIgAigCBCIFQQFqNgIEIAUtAAAhAgwBCyACEIcEIQILIAJBf0YNHyAHQf///wdPDSAgAkH/AHEgB0EHdHIhByACQYABcUUNAAsgACgCACECIAdBgYCAgH5qQf////99TQ0gQQAhCCACIAdBA3RBABDZAiECIAEgBzYCJCABIAI2AkQCQCAHQQFIDQADQEEAIQUDQCAEKAIAIgIgAigCACIGQX9qNgIAAkACQCAGRQ0AIAIgAigCBCIGQQFqNgIEIAYtAAAhAgwBCyACEIcEIQILIAJBf0YNJCAFQf///wdPDSUgAkH/AHEgBUEHdHIhBSACQYABcUUNAAsgASgCRCAIQQN0IglqIAU2AgBBACEFA0AgBCgCACICIAIoAgAiBkF/ajYCAAJAAkAgBkUNACACIAIoAgQiBkEBajYCBCAGLQAAIQIMAQsgAhCHBCECCyACQX9GDSYgBUH///8HTw0nIAJB/wBxIAVBB3RyIQUgAkGAAXFFDQALIAEoAkQgCWogBTYCBCAIQQFqIgggB0cNAAsLQQAhBwNAIAQoAgAiAiACKAIAIgVBf2o2AgACQAJAIAVFDQAgAiACKAIEIgVBAWo2AgQgBS0AACECDAELIAIQhwQhAgsgAkF/Rg0mIAdB////B08NJyACQf8AcSAHQQd0ciEHIAJBgAFxRQ0ACyAAKAIAIQUgB0Gr1arVfmpBqdWq1X5NDSdBACECIAUgB0EMbEEAENkCIQUgASAHNgIgIAEgBTYCSAJAIAdBAEwNAANAIAUgAkEMbGpBADYCACACQQFqIgIgB0cNAAtBACEIIAdBAEwNAANAIAAgARDrAyECIAEoAkggCEEMbCIJaiACNgIAQQAhBQNAIAQoAgAiAiACKAIAIgZBf2o2AgACQAJAIAZFDQAgAiACKAIEIgZBAWo2AgQgBi0AACECDAELIAIQhwQhAgsgAkF/Rg0rIAVB////B08NLCACQf8AcSAFQQd0ciEFIAJBgAFxRQ0ACyABKAJIIAlqIAU2AgRBACEFA0AgBCgCACICIAIoAgAiBkF/ajYCAAJAAkAgBkUNACACIAIoAgQiBkEBajYCBCAGLQAAIQIMAQsgAhCHBCECCyACQX9GDS0gBUH///8HTw0uIAJB/wBxIAVBB3RyIQUgAkGAAXFFDQALIAEoAkggCWogBTYCCCAIQQFqIgggB0cNAAsLQQAhBQNAIAQoAgAiAiACKAIAIgZBf2o2AgACQAJAIAZFDQAgAiACKAIEIgZBAWo2AgQgBi0AACECDAELIAIQhwQhAgsgAkF/Rg0tIAVB////B08NLiACQf8AcSAFQQd0ciEFIAJBgAFxRQ0AC0EAIQJBACEGAkAgBUUNACABKAIMIQYLAkAgBkEBSA0AA0AgACABEOsDIQQgASgCPCACQQN0aiAENgIAIAJBAWoiAiAGRw0ACwsgA0EQaiQADwsgAEGOGhDqAwALIABBswkQ6gMACyAAQY4aEOoDAAsgAEGzCRDqAwALIABBjhoQ6gMACyAAQY4aEOoDAAsgAEGOGhDqAwALIABBjhoQ6gMACyAAQbMJEOoDAAsgBhDWAgALIABBjhoQ6gMACyAAQY4aEOoDAAsgAEGzCRDqAwALIAYQ1gIACyAAQY4aEOoDAAsgAEGOGhDqAwALIABBjhoQ6gMACyAAQaEdEOoDAAsgAEGOGhDqAwALIABBswkQ6gMACyAGENYCAAsgAEGOGhDqAwALIABBjhoQ6gMACyAAQY4aEOoDAAsgAEGOGhDqAwALIABBswkQ6gMACyAGENYCAAsgAEGOGhDqAwALIABBswkQ6gMACyAAQY4aEOoDAAsgAEGOGhDqAwALIABBswkQ6gMACyACENYCAAsgAEGOGhDqAwALIABBswkQ6gMACyAAQY4aEOoDAAsgAEGzCRDqAwALIABBjhoQ6gMACyAAQbMJEOoDAAsgBRDWAgALIABBjhoQ6gMACyAAQbMJEOoDAAsgAEGOGhDqAwALIABBswkQ6gMACyAAQY4aEOoDAAsgAEGzCRDqAwALQAEDfyMAQRBrIgIkACAAKAIAIQMgACgCCCEEIAIgATYCBCACIAQ2AgAgA0Ha0wAgAhDlAhogACgCAEEDEO8BAAvdAgEFfyMAQTBrIgIkACAAKAIAIQNBACEEAkACQAJAAkADQCAAKAIEIgUgBSgCACIGQX9qNgIAAkACQCAGRQ0AIAUgBSgCBCIGQQFqNgIEIAYtAAAhBQwBCyAFEIcEIQULIAVBf0YNASAEQf///w9PDQIgBUH/AHEgBEEHdHIhBCAFQYABcUUNAAsCQAJAIAQNAEEAIQUMAQsCQAJAIARBf2oiBEEoSw0AIAAoAgQgAiAEEIkEDQUgAyACIAQQkwMhBQwBCyADIAQQlAMhBSADKAIMIgYgBTYCACAGIAUtAARBwAByOgAIIAMQ9QEgACgCBCAFQRBqIAQQiQQNBSADIAMoAgxBcGo2AgwLIAEtAAVBIHFFDQAgBS0ABUEYcUUNACADIAEgBRCRAgsgAkEwaiQAIAUPCyAAQY4aEOoDAAsgAEGzCRDqAwALIABBjhoQ6gMACyAAQY4aEOoDAAs7ACAARAAAAAAAgH9AQYgBEIoBIABBAEEGEEQgAEHwyQ5BABB2IABBqMoOQQ4QNxogAEF+QckVEEhBAQumBAIEfwV+IwBBEGsiASQAIABBASABQQxqEG0hAiAAQQIQcyEFIABBA0IBIAEoAgxBAWqtIAVCf1UbEHUhBiABKAIMIQMCQAJAIAZCf1cNACAGIQcMAQtCACEHIANBACAGp2tJDQAgBiADrXxCAXwhBwsgB0IAVSEEIAdCf3whBgJAAkAgB0IBUw0AIAYgA61XDQELIABBA0HQDxBkGgsgBiAHIAQbIQcCQAJAAkAgBUIAUg0AIAdCAVMNAQNAIAIgB6dqLQAAQcABcUGAAUcNAiAHQgFVIQMgB0J/fCEHIAMNAAtCACEHDAELAkAgAiAHp2otAABBwAFxQYABRw0AIABB3yFBABBlIQIMAgsCQAJAIAVCAFMNACAFQn98IQYCQCAFQgJZDQAgBiEFDAMLAkAgByABNQIMIghTDQAgBiEFDAMLIAYhBQwBCwJAIAdCAVkNAEIBIQUMAgsgBSEIA0AgB0IBIAdCAVMbIgVCf3whCQJAA0ACQCAHIgZCAlkNACAFIQYgCSEHDAILIAIgBkJ/fCIHp2otAABBwAFxQYABRg0ACwsgCEIBfCEFIAhCflUNAiAFIQggBkIBVQ0ADAILAAsDQCAFIQYDQCACIAdCAXwiB6dqLQAAQcABcUGAAUYNAAsgBkJ/fCEFIAZCAlMNASAHIAhTDQALCwJAAkAgBUIAUg0AIAAgB0IBfBA2DAELIAAQNAtBASECCyABQRBqJAAgAgv1BAIMfwN+IwBBEGsiASQAIABBASABQQxqEG0hAgJAAkAgAEECQgEQdSINQn9XDQAgDSEODAELQgAhDiABKAIMIgNBACANp2tJDQAgDSADrXxCAXwhDgsCQAJAIABBAyAOEHUiD0J/Vw0AIA8hDQwBC0IAIQ0gASgCDCIDQQAgD6drSQ0AIA8gA618QgF8IQ0LIABBBBAvIQQCQCAOQgBVDQAgAEECQdkPEGQaCwJAIA0gATUCDFcNACAAQQNB2Q8QZBoLQQAhBQJAIA0gDlMNAAJAIA0gDn0iD0L/////B1MNACAAQY4cQQAQZSEFDAELIAAgD6dBAWpBjhwQbiACIA2naiEGIA6nIAJqQX9qIQdBACEIA0ACQCAHIAZJDQAgCCEFDAILIAcsAAAiAkH/AXEhAwJAAkACQCACQX9MDQAgByEJIAMhAgwBC0EAIQpBACEJQQAhAgJAAkAgA0HAAHFFDQADQCAHIAlBAWoiCWotAAAiC0E/cSACQQZ0ciACIAtBwAFxIgtBgAFGGyECAkAgC0GAAUYNACAHIQkMAwsgA0EgcSELIANBAXQhAyALDQALCyADQf8AcSAJQQVsdCACciECAkAgCUEFTQ0AIAchCQwBCwJAIAJBAE4NACAHIQkMAQsgAiAJQQJ0QcDKDmooAgAiA08hCiAHQQAgCSACIANJG2ohCQtBACEHIApFDQELAkAgBA0AQQAhByACQf//wwBLDQEgAkGAcHFBgLADRg0BCyAJQQFqIQcgAiEMCwJAAkAgBw0AIABBziVBABBlIQUMAQsgACAMrRA2IAhBAWohCAsgBw0ACwsgAUEQaiQAIAULygECBH8BfiMAQbAEayIBJABBASECAkACQCAAEB4iA0EBRw0AAkAgAEEBEHMiBUKAgICACFQNACAAQQFBjSUQZBoLIAEgBT4CACAAQa3RACABEDoaDAELIAAgAUEgahBfAkAgA0EBSA0AA0ACQCAAIAIQcyIFQoCAgIAIVA0AIAAgAkGNJRBkGgsgASAFPgIQIABBrdEAIAFBEGoQOhogAiADRyEEIAFBIGoQYiACQQFqIQIgBA0ACwsgAUEgahBjCyABQbAEaiQAQQELvgQCCX8DfiMAQRBrIgEkACAAQQEgAUEMahBtIQICQAJAIABBAkIBEHUiCkJ/Vw0AIAohCwwBC0IAIQsgASgCDCIDQQAgCqdrSQ0AIAogA618QgF8IQsLAkACQCAAQQNCfxB1IgpCf1cNACAKIQwMAQtCACEMIAEoAgwiA0EAIAqna0kNACAKIAOtfEIBfCEMCyALQn98IQogAEEEEC8hBAJAAkAgC0IBUw0AIAogATUCDFcNAQsgAEECQcgPEGQaCyALQgBVIQMCQCAMIAE1AgxXDQAgAEEDQasPEGQaCyAKIAsgAxshC0IAIQoCQAJAA0AgCyAMWQ0BIAIgC6dqIgUsAAAiA0H/AXEhBgJAAkACQCADQX9MDQAgBiEDDAELQQAhB0EAIQhBACEDAkACQCAGQcAAcUUNAANAIAUgCEEBaiIIai0AACIJQT9xIANBBnRyIAMgCUHAAXEiCUGAAUYbIQMgCUGAAUcNAiAGQSBxIQkgBkEBdCEGIAkNAAsLIAZB/wBxIAhBBWx0IANyIQMgCEEFSw0AIANBAEgNACADIAhBAnRBwMoOaigCACIGTyEHIAVBACAIIAMgBkkbaiEFC0EAIQYgB0UNAQsCQCAEDQBBACEGIANB///DAEsNASADQYBwcUGAsANGDQELIAVBAWohBgsCQAJAIAYNACAAEDQgACALQgF8EDYMAQsgCkIBfCEKIAYgAmusIQsLIAYNAAtBAiEDDAELIAAgChA2QQEhAwsgAUEQaiQAIAMLSwEBfyAAQQIQLyEBAkAgAEEBQQAQbS0AAEHAAXFBgAFHDQAgAEEBQc4lEGQaCyAAQekAQeoAIAEbQQAQOyAAQQEQIyAAQgAQNkEDCwkAIABBABD0AwsJACAAQQEQ9AMLzQMCCH8DfiMAQRBrIgIkAEEAIQMgAEEBIAJBDGoQbSEEAkACQCAAQQJBABAuIgogAjUCDCILVA0AIAohDAwBCwNAIAoiDEIBfCEKIAQgDKdqLQAAQcABcUGAAUYNAAsLAkAgDCALWg0AIAQgDKdqIgUsAAAiBEH/AXEhAwJAAkACQCAEQX9MDQAgAyEEDAELQQAhBgJAAkACQCADQcAAcQ0AIAMhB0EAIQRBACEIDAELQQAhCEEAIQQDQCAFIAhBAWoiCGotAAAiCUE/cSAEQQZ0ciAEIAlBwAFxIglBgAFGGyEEAkAgCUGAAUYNAEEAIQYMAwsgA0EgcSEJIANBAXQiByEDIAkNAAsLIAdB/wBxIAhBBWx0IARyIQQgCEEFSw0AIARBAEgNACAEIAhBAnRBwMoOaigCACIDTyEGIAVBACAIIAQgA0kbaiEFCyAGDQBBACEDDAELAkAgAUUNAEEAIQMCQCAEQf//wwBNDQAMAgsgBEGAcHFBgLADRg0BCyAFQQFqIQMLAkACQCADRQ0AIAMtAABBwAFxQYABRw0BCyAAQc4lQQAQZSEDDAELIAAgDEIBfBA2IAAgBK0QNkECIQMLIAJBEGokACADC5oBAwR/AXwBfiMAQRBrIgIkAAJAAkACQCAALQAIIgNBA0cNACAAKQMAuSEGDAELQQAhBCADQQ9xQQRHDQEgACgCACIAQRBqIAIQ3wIhBQJAIAAtAAciA0H/AUcNACAAKAIMIQMLIAUgA0EBakcNASACKQMAIge5IAe/IAItAAhBA0YbIQYLIAEgBjkDAEEBIQQLIAJBEGokACAEC4IBAgF8AX4CQAJAIACcIgMgAGENAAJAIAIOAwIBAAELIANEAAAAAAAA8D+gIQMLIANEAAAAAAAA4MNmIANEAAAAAAAA4ENjcSICQQFHDQACQAJAIAOZRAAAAAAAAOBDY0UNACADsCEEDAELQoCAgICAgICAgH8hBAsgASAENwMACyACC78BAgF/AnxBACEDAkACQAJAIAAtAAhBfWoOEQECAgICAgICAgICAgICAgIAAgsCQCAAKwMAIgScIgUgBGENACACIQMCQCACDgMDAQABCyAFRAAAAAAAAPA/oCEFCyAFRAAAAAAAAODDZiAFRAAAAAAAAOBDY3EiA0EBRw0BAkAgBZlEAAAAAAAA4ENjRQ0AIAEgBbA3AwAgAw8LIAFCgICAgICAgICAfzcDACADDwsgASAAKQMANwMAQQEhAwsgAwuaAgIEfwJ8IwBBEGsiAyQAQQEhBAJAIAAtAAhBD3FBBEcNACAAKAIAIgVBEGogAxDfAiEGAkAgBS0AByIEQf8BRw0AIAUoAgwhBAsgBiAEQQFqRyEEC0EAIQUCQAJAAkAgACADIAQbIgAtAAhBfWoOEQECAgICAgICAgICAgICAgIAAgsCQCAAKwMAIgecIgggB2ENACACIQUCQCACDgMDAQABCyAIRAAAAAAAAPA/oCEICyAIRAAAAAAAAODDZiAIRAAAAAAAAOBDY3EiBUEBRw0BAkAgCJlEAAAAAAAA4ENjRQ0AIAEgCLA3AwAMAgsgAUKAgICAgICAgIB/NwMADAELIAEgACkDADcDAEEBIQULIANBEGokACAFC/YBAQN/QQAhBQJAA0ACQAJAIAQNACAAIAFBABDbAyIGLQAIQQ9xDQEgACABQYYJEN4BAAtBACEGAkAgASgCACgCGCIERQ0AIAQtAAZBAXENACAEQQAgACgCECgCrAEQ2gMhBgsgBg0AIANBADoACA8LAkAgBi0ACCIHQQ9xQQZHDQAgACAGIAEgAiADEN4DDwtBACEEQQAhAQJAIAdBxQBHDQAgBigCACACEMEDIgQtAAhBD3FBAEchAQsCQCABDQAgBiEBIAVBAWoiBUHQD0YNAgwBCwsgAyAEKQMANwMAIAMgBC0ACDoACA8LIABBvhRBABDhAQALkwMBBH9BACEFAkACQANAAkACQAJAIARFDQBBACEGAkAgASgCACIHKAIYIghFDQAgCC0ABkECcQ0AIAhBASAAKAIQQbABaigCABDaAyEGCyAGDQEgACAHIAIgBCADEMsDIAcgBy0ABkHAAXE6AAZBACEIIAMtAAhBwABxRQ0CIActAAVBIHFFDQIgAygCAC0ABUEYcUUNAiAAIAcQkwIMAgsgACABQQEQ2wMiBi0ACEEPcUUNAwsCQCAGLQAIIghBD3FBBkcNACAAIAYgASACIAMQ3QNBACEIDAELQQAhBEEAIQECQCAIQcUARw0AIAYoAgAgAhDBAyIELQAIQQ9xQQBHIQELAkACQCABDQBBASEIDAELIAQgAykDADcDACAEIAMtAAg6AAhBACEIIAMtAAhBwABxRQ0AIAYoAgAiAS0ABUEgcUUNACADKAIALQAFQRhxRQ0AIAAgARCTAgsgBiEBCwJAIAhFDQAgBUEBaiIFQdAPRg0DDAELCw8LIAAgAUGGCRDeAQALIABBkxRBABDhAQALmAMDAn8CfgJ8AkAgAS0ACCIDQQ9xQQNHDQAgAi0ACCIEQQ9xQQNHDQACQCADQQNHDQAgASkDACEFAkAgBEEDRw0AIAUgAikDAFMPCyACKwMAIQcCQCAFQoCAgICAgIAQfEKAgICAgICAIFYNACAHIAW5ZA8LIAecIghEAAAAAAAA8D+gIAggCCAHYhsiCEQAAAAAAADgQ2MhAQJAAkAgCJlEAAAAAAAA4ENjRQ0AIAiwIQYMAQtCgICAgICAgICAfyEGCyAFIAZTIAdEAAAAAAAAAABkIgIgARsgAiAIRAAAAAAAAODDZhsPCyABKwMAIQcCQCAEQRNHDQAgByACKwMAYw8LAkAgAikDACIFQoCAgICAgIAQfEKAgICAgICAIFYNACAHIAW5Yw8LIAdEAAAAAAAAAABjIQEgB5wiB0QAAAAAAADgQ2MhAgJAAkAgB5lEAAAAAAAA4ENjRQ0AIAewIQYMAQtCgICAgICAgICAfyEGCyAFIAZVIAEgAhsgASAHRAAAAAAAAODDZhsPCyAAIAEgAhD8Awv3AQEFfwJAIAEtAAhBD3FBBEcNACACLQAIQQ9xQQRHDQAgAigCACECAkAgASgCACIBLQAHIgNB/wFHDQAgASgCDCEDCwJAIAItAAciBEH/AUcNACACKAIMIQQLIAFBEGohACACQRBqIQUDQEEAIQECQAJAIAAgBRD4BCICRQ0AIAIhBgwBCyAAEP4EIQJBACEBAkAgBRD+BCIHIARHDQBBACEGDAELAkAgAiADRw0AQX8hBgwBC0EBIQEgBCAHQQFqIgdrIQQgBSAHaiEFIAMgAkEBaiICayEDIAAgAmohAAsgAQ0ACyAGQR92DwsgACABIAJBFBDkAwueAwMCfwJ+AnwCQCABLQAIIgNBD3FBA0cNACACLQAIIgRBD3FBA0cNAAJAIANBA0cNACABKQMAIQUCQCAEQQNHDQAgBSACKQMAVw8LIAIrAwAhBwJAIAVCgICAgICAgBB8QoCAgICAgIAgVg0AIAcgBblmDwsgB5wiCEQAAAAAAADgw2YgCEQAAAAAAADgQ2NxIgFBAXMhAgJAAkAgCJlEAAAAAAAA4ENjRQ0AIAiwIQYMAQtCgICAgICAgICAfyEGCyACIAUgBldyIAdEAAAAAAAAAABkIAEbDwsgASsDACEHAkAgBEETRw0AIAcgAisDAGUPCwJAIAIpAwAiBUKAgICAgICAEHxCgICAgICAgCBWDQAgByAFuWUPCyAHnCIIRAAAAAAAAPA/oCAIIAggB2IbIghEAAAAAAAA4MNmIAhEAAAAAAAA4ENjcSIBQQFzIQICQAJAIAiZRAAAAAAAAOBDY0UNACAIsCEGDAELQoCAgICAgICAgH8hBgsgAiAFIAZZciAHRAAAAAAAAAAAYyABGw8LIAAgASACEP4DC/YBAQV/AkAgAS0ACEEPcUEERw0AIAItAAhBD3FBBEcNACACKAIAIQICQCABKAIAIgEtAAciA0H/AUcNACABKAIMIQMLAkAgAi0AByIEQf8BRw0AIAIoAgwhBAsgAUEQaiEAIAJBEGohBQNAQQAhAQJAAkAgACAFEPgEIgJFDQAgAiEGDAELIAAQ/gQhAgJAIAUQ/gQiByAERw0AIAIgA0chBgwBCwJAIAIgA0cNAEF/IQYMAQtBASEBIAQgB0EBaiIHayEEIAUgB2ohBSADIAJBAWoiAmshAyAAIAJqIQALIAENAAsgBkEBSA8LIAAgASACQRUQ5AMLlAYDBH8CfAJ+AkACQAJAIAEtAAgiA0E/cSIEIAItAAgiBUE/cUYNAEEAIQYgA0EPcUEDRw0BIAVBD3FBA0cNAUEBIQQCQAJAAkAgA0F9ag4RAQICAgICAgICAgICAgICAgACCyABKwMAIgecIgggB2INASAIRAAAAAAAAODDZkEBcyAIRAAAAAAAAOBDY0EBc3IhBAJAIAiZRAAAAAAAAOBDY0UNACAIsCEJDAILQoCAgICAgICAgH8hCQwBCyABKQMAIQlBACEECyAEDQFBASEBAkACQAJAIAVBfWoOEQECAgICAgICAgICAgICAgIAAgsgAisDACIHnCIIIAdiDQEgCEQAAAAAAADgw2ZBAXMgCEQAAAAAAADgQ2NBAXNyIQECQCAImUQAAAAAAADgQ2NFDQAgCLAhCgwCC0KAgICAgICAgIB/IQoMAQsgAikDACEKQQAhAQsgAQ0BIAkgClEPC0EBIQYCQAJAAkACQAJAAkACQAJAAkACQCAEDhcKCgIABAcLBgsLCwsLCwsLCwoLAQULAwsLIAEpAwAgAikDAFEPCyABKwMAIAIrAwBhDwsgASgCACACKAIARg8LIAEoAgAgAigCAEYPCyABKAIAIAIoAgBGDwsgASgCACACKAIAEIwDDwsgASgCACIEIAIoAgBGDQMCQCAADQBBAA8LQQAhAwJAIAQoAgwiBkUNACAGLQAGQSBxDQAgBkEFIAAoAhBBwAFqKAIAENoDIQMLIAMNAkEAIQMgAigCACgCDCIGRQ0CIAYtAAZBIHFFDQEMAgsgASgCACIEIAIoAgBGDQICQCAADQBBAA8LQQAhAwJAIAQoAhgiBkUNACAGLQAGQSBxDQAgBkEFIAAoAhBBwAFqKAIAENoDIQMLIAMNAUEAIQMgAigCACgCGCIGRQ0BIAYtAAZBIHENAQsgBkEFIAAoAhBBwAFqKAIAENoDIQMLAkAgAw0AQQAPCyAAIAMgASACIAAoAgwQ3gMgACgCDC0ACCIBQQFHIAFBD3FBAEdxIQYLIAYPCyABKAIAIAIoAgBGC50FAQl/IwBBMGsiAiQAAkACQCABQQFGDQADQAJAAkACQAJAIAAoAgwiA0FgaiIEQQhqIgUtAABBD3FBfWpBAUsNACADQXBqIgZBCGoiBy0AAEEPcUF9ag4CAQIACyAAEOEDQQIhBwwCCyAAIAYQ4QILAkAgBy0AACIHQcQARw0AIAYoAgAtAAcNAEECIQcgBS0AAEEPcUEDRw0BIAAgBBDhAgwBCwJAIAUtAABBxABHDQAgBCgCAC0ABw0AIAQgBikDADcDACAFIAc6AABBAiEHDAELAkAgBigCACIFLQAHIghB/wFHDQAgBSgCDCEIC0EBIQcCQCABQQJIDQBBASEHA0ACQAJAIAYgB0EEdGsiBS0ACEEPcUF9ag4CAAEDCyAAIAUQ4QILAkAgBSgCACIELQAHIgVB/wFHDQAgBCgCDCEFCyAFQWsgCGtPDQUgBSAIaiEIIAdBAWoiByABRw0ACyABIQcLAkACQCAIQShLDQBBACEEIAchBQNAAkAgAyAFQQR0aygCACIJLQAHIgZB/wFHDQAgCSgCDCEGCyACIARqIAlBEGogBhCaBBogBiAEaiEEIAVBAUohBiAFQX9qIQUgBg0ACyAAIAIgCBCTAyEKDAELIAAgCBCUAyIKQRBqIQhBACEEIAchBQNAAkAgAyAFQQR0aygCACIJLQAHIgZB/wFHDQAgCSgCDCEGCyAIIARqIAlBEGogBhCaBBogBiAEaiEEIAVBAUohBiAFQX9qIQUgBg0ACwsgAyAHQQR0ayIFIAo2AgAgBSAKLQAEQcAAcjoACAsgACAAKAIMQQEgB2tBBHRqNgIMIAEgB2tBAWoiAUEBSg0ACwsgAkEwaiQADwsgACADIAFBBHRrNgIMIABB1QlBABDhAQAL5QECA38BfgJAAkACQAJAAkACQCACLQAIQT9xQXxqDhEBAAMDAwMDAwMDAwMDAwMDAgMLQQAhAwJAIAIoAgAiBCgCGCIFRQ0AIAUtAAZBEHENACAFQQQgACgCEEG8AWooAgAQ2gMhAwsgAw0DIAQQzQMhBiABQQM6AAggASAGNwMADwsgAigCADEAByEGIAFBAzoACCABIAY3AwAPCyACKAIANQIMIQYgAUEDOgAIIAEgBjcDAA8LIAAgAkEEENsDIgMtAAhBD3FFDQELIAAgAyACIAIgARDeAw8LIAAgAkHGHxDeAQALVAEBfgJAAkAgAkIBfEIBVg0AIAJCAFENAUIAIAF9DwsgASACfyEDAkAgAiABhUJ/VQ0AIAMgASADIAJ+fUIAUq19IQMLIAMPCyAAQYkVQQAQ4QEAC0wAAkACQCACQgF8QgFWDQBCACEBIAJCAFINASAAQcPcAEEAEOEBAAsCQCABIAKBIgFQRQ0AQgAPCyABIAKFQj+HIAKDIAF8IQELIAELWAACQAJAAkAgASACEKsEIgFEAAAAAAAAAABkRQ0AIAJEAAAAAAAAAABjDQEMAgsgAkQAAAAAAAAAAGRFDQEgAUQAAAAAAAAAAGNFDQELIAEgAqAhAQsgAQs2AQF+AkACQCABQn9VDQBCACECIAFCQVMNASAAQgAgAX2IDwtCACAAIAGGIAFCP1UbIQILIAILuKUBAw5/E34gfCMAQcAAayICJAADQCAAKAJwIQMDQCABKAIQIQQgASgCACgCACIFKAIMKAIwIQZBACEHQQAhCAJAIANFDQAgABDrASEICwJAIAhFDQAgACAEEOwBIQcLIAVBEGohCSAEQQRqIQggByEHIAEoAgBBEGohCiAEIQQDQCAIIQMCQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCAEKAIAIgRB/wBxQQJ0QeDKDmooAgBBfmoOUgECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSEtMTU5PUFFSU1QACyAKIARBA3ZB8B9xaiIIIAogBEEMdkHwH3FqIgQpAwA3AwAgCCAELQAIOgAIQQAhBAJAIAdFDQAgACADEOwBIQQgASgCAEEQaiEKCyADQQRqIQggBCEHIAMhBAx1CyAKIARBA3ZB8B9xaiIIQQM6AAggCCAEQQ92QYGAfGqsNwMAQQAhBAJAIAdFDQAgACADEOwBIQQgASgCAEEQaiEKCyADQQRqIQggBCEHIAMhBAx0CyAKIARBA3ZB8B9xaiIIQRM6AAggCCAEQQ92QYGAfGq3OQMAQQAhBAJAIAdFDQAgACADEOwBIQQgASgCAEEQaiEKCyADQQRqIQggBCEHIAMhBAxzCyAKIARBA3ZB8B9xaiIIIAYgBEELdkHw//8AcWoiBCkDADcDACAIIAQtAAg6AAhBACEEAkAgB0UNACAAIAMQ7AEhBCABKAIAQRBqIQoLIANBBGohCCAEIQcgAyEEDHILIAogBEEDdkHwH3FqIgQgBiADKAIAQQN2QfD///8BcWoiCCkDADcDACAEIAgtAAg6AAggA0EEaiEEQQAhCwJAIAdFDQAgACAEEOwBIQsgASgCAEEQaiEKCyADQQhqIQggCyEHDHELIAogBEEDdkHwH3FqQQE6AAhBACEEAkAgB0UNACAAIAMQ7AEhBCABKAIAQRBqIQoLIANBBGohCCAEIQcgAyEEDHALIAogBEEDdkHwH3FqQQE6AAggA0EEaiEEQQAhCwJAIAdFDQAgACAEEOwBIQsgASgCAEEQaiEKCyADQQhqIQggCyEHDG8LIAogBEEDdkHwH3FqQRE6AAhBACEEAkAgB0UNACAAIAMQ7AEhBCABKAIAQRBqIQoLIANBBGohCCAEIQcgAyEEDG4LIARBEHZB/wFxIQggCiAEQQN2QfAfcWohBANAQQAhDCAEQQA6AAggCCILQX9qIQggBEEQaiEEIAsNAAsCQCAHRQ0AIAAgAxDsASEMIAEoAgBBEGohCgsgA0EEaiEIIAwhByADIQQMbQsgCiAEQQN2QfAfcWoiCCAFIARBDnZB/AdxakEQaigCACgCCCIEKQMANwMAIAggBC0ACDoACEEAIQQCQCAHRQ0AIAAgAxDsASEEIAEoAgBBEGohCgsgA0EEaiEIIAQhByADIQQMbAsgBSAEQQ52QfwHcWpBEGooAgAiCygCCCIIIAogBEEDdkHwH3FqIgQpAwA3AwAgCCAELQAIOgAIAkAgBC0ACEHAAHFFDQAgCy0ABUEgcUUNACAEKAIAIgQtAAVBGHFFDQAgACALIAQQkQILQQAhBAJAIAdFDQAgACADEOwBIQQgASgCAEEQaiEKCyADQQRqIQggBCEHIAMhBAxrCyAGIARBFHZB8B9xaiENIARBA3ZB8B9xIQxBACEIQQAhCwJAIAUgBEEOdkH8B3FqQRBqKAIAKAIIIg4tAAhBxQBHDQAgDigCACANKAIAEMgDIggtAAhBD3FBAEchCwsgCiAMaiEEAkACQCALRQ0AIAQgCCkDADcDACAEIAgtAAg6AAggByEEDAELIAEgAzYCECAAIAEoAgQ2AgwgACAOIA0gBCAIEPkDIAEoAhQhBAtBACEHAkAgBEUNACAAIAMQ7AEhByABKAIAQRBqIQoLIANBBGohCCADIQQMagsgCiAEQQx2QfAfcWohCCAEQQN2QfAfcSEMAkACQAJAIAogBEEUdkHwH3FqIg0tAAhBA0cNAEEAIQRBACELIAgtAAhBxQBHDQICQCANKQMAIhBCf3wiESAIKAIAIgQ1AghaDQAgBCgCDCARp0EEdGohBAwCCyAEIBAQxwMhBAwBC0EAIQRBACELIAgtAAhBxQBHDQEgCCgCACANEMEDIQQLIAQtAAhBD3FBAEchCwsgCiAMaiEMAkACQCALRQ0AIAwgBCkDADcDACAMIAQtAAg6AAggByEEDAELIAEgAzYCECAAIAEoAgQ2AgwgACAIIA0gDCAEEPkDIAEoAhQhBAtBACEHAkAgBEUNACAAIAMQ7AEhByABKAIAQRBqIQoLIANBBGohCCADIQQMaQsgBEEYdiEMIARBA3ZB8B9xIQ1BACEIQQAhCwJAIAogBEEMdkHwH3FqIg4tAAhBxQBHDQACQAJAIAytIhBCf3wgDigCACIENQIIWg0AIAxBBHQgBCgCDGpBcGohCAwBCyAEIBAQxwMhCAsgCC0ACEEPcUEARyELCyAKIA1qIQQCQAJAIAtFDQAgBCAIKQMANwMAIAQgCC0ACDoACCAHIQQMAQsgAkEDOgAgIAIgDK03AxggASADNgIQIAAgASgCBDYCDCAAIA4gAkEYaiAEIAgQ+QMgASgCFCEEC0EAIQcCQCAERQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAxoCyAGIARBFHZB8B9xaiENIARBA3ZB8B9xIQxBACEIQQAhCwJAIAogBEEMdkHwH3FqIg4tAAhBxQBHDQAgDigCACANKAIAEMgDIggtAAhBD3FBAEchCwsgCiAMaiEEAkACQCALRQ0AIAQgCCkDADcDACAEIAgtAAg6AAggByEEDAELIAEgAzYCECAAIAEoAgQ2AgwgACAOIA0gBCAIEPkDIAEoAhQhBAtBACEHAkAgBEUNACAAIAMQ7AEhByABKAIAQRBqIQoLIANBBGohCCADIQQMZwsgBiAKIARBgIACcRshDSAEQRR2QfAfcSEOIAYgBEEMdkHwH3FqIQ9BACEIQQAhCwJAIAUgBEEFdkH8B3FqQRBqKAIAKAIIIgwtAAhBxQBHDQAgDCgCACAPKAIAEMgDIggtAAhBD3FBAEchCwsgDSAOaiEEAkACQCALRQ0AIAggBCkDADcDACAIIAQtAAg6AAgCQCAELQAIQcAAcQ0AIAchBAwCCwJAIAwoAgAiCC0ABUEgcQ0AIAchBAwCCwJAIAQoAgAtAAVBGHENACAHIQQMAgsgACAIEJMCIAchBAwBCyABIAM2AhAgACABKAIENgIMIAAgDCAPIAQgCBD6AyABKAIUIQQLQQAhBwJAIARFDQAgACADEOwBIQcgASgCAEEQaiEKCyADQQRqIQggAyEEDGYLIAYgCiAEQYCAAnEbIQsgBEEUdkHwH3EhDSAKIARBA3ZB8B9xaiEIAkACQAJAIAogBEEMdkHwH3FqIg4tAAhBA0cNAEEAIQRBACEMIAgtAAhBxQBHDQICQCAOKQMAIhBCf3wiESAIKAIAIgQ1AghaDQAgBCgCDCARp0EEdGohBAwCCyAEIBAQxwMhBAwBC0EAIQRBACEMIAgtAAhBxQBHDQEgCCgCACAOEMEDIQQLIAQtAAhBD3FBAEchDAsgCyANaiELAkACQCAMRQ0AIAQgCykDADcDACAEIAstAAg6AAgCQCALLQAIQcAAcQ0AIAchBAwCCwJAIAgoAgAiBC0ABUEgcQ0AIAchBAwCCwJAIAsoAgAtAAVBGHENACAHIQQMAgsgACAEEJMCIAchBAwBCyABIAM2AhAgACABKAIENgIMIAAgCCAOIAsgBBD6AyABKAIUIQQLQQAhBwJAIARFDQAgACADEOwBIQcgASgCAEEQaiEKCyADQQRqIQggAyEEDGULIAYgCiAEQYCAAnEbIQ4gBEEUdkHwH3EhDyAEQRB2Qf8BcSENQQAhCEEAIQsCQCAKIARBA3ZB8B9xaiIMLQAIQcUARw0AAkACQCANrSIQQn98IAwoAgAiBDUCCFoNACANQQR0IAQoAgxqQXBqIQgMAQsgBCAQEMcDIQgLIAgtAAhBD3FBAEchCwsgDiAPaiEEAkACQCALRQ0AIAggBCkDADcDACAIIAQtAAg6AAgCQCAELQAIQcAAcQ0AIAchBAwCCwJAIAwoAgAiCC0ABUEgcQ0AIAchBAwCCwJAIAQoAgAtAAVBGHENACAHIQQMAgsgACAIEJMCIAchBAwBCyACQQM6ABAgAiANrTcDCCABIAM2AhAgACABKAIENgIMIAAgDCACQQhqIAQgCBD6AyABKAIUIQQLQQAhBwJAIARFDQAgACADEOwBIQcgASgCAEEQaiEKCyADQQRqIQggAyEEDGQLIAYgCiAEQYCAAnEbIQ0gBEEUdkHwH3EhDiAGIARBDHZB8B9xaiEPQQAhCEEAIQsCQCAKIARBA3ZB8B9xaiIMLQAIQcUARw0AIAwoAgAgDygCABDIAyIILQAIQQ9xQQBHIQsLIA0gDmohBAJAAkAgC0UNACAIIAQpAwA3AwAgCCAELQAIOgAIAkAgBC0ACEHAAHENACAHIQQMAgsCQCAMKAIAIggtAAVBIHENACAHIQQMAgsCQCAEKAIALQAFQRhxDQAgByEEDAILIAAgCBCTAiAHIQQMAQsgASADNgIQIAAgASgCBDYCDCAAIAwgDyAEIAgQ+gMgASgCFCEEC0EAIQcCQCAERQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAxjCyAEQRB2Qf8BcSEMIARBGHYhCyAKIARBA3ZB8B9xaiEIAkAgBEGAgAJxRQ0AIAMoAgBBAXRBgH5xIAtyIQsLIAAgCEEQaiINNgIMIAAQxQMhBCAIQcUAOgAIIAggBDYCAAJAIAwgC3JFDQAgACAEIAtBASAMQX9qdEEAIAwbEL8DCyADQQRqIQQCQCAAKAIQKAIMQQFIDQAgASAENgIQIAAgDTYCDCAAEKECIAEoAhQhBwtBACELAkAgB0UNACAAIAQQ7AEhCyABKAIAQRBqIQoLIANBCGohCCALIQcMYgsgBiAKIARBgIACcRsgBEEUdkHwH3FqIg4oAgAhDSAKIARBA3ZB8B9xaiIIIAogBEEMdkHwH3FqIgQpAwA3AxAgCEEYaiAELQAIOgAAQQAhC0EAIQwCQCAELQAIQcUARw0AIAQoAgAgDRDJAyILLQAIQQ9xQQBHIQwLAkACQCAMRQ0AIAggCykDADcDACAIIAstAAg6AAggByEEDAELIAEgAzYCECAAIAEoAgQ2AgwgACAEIA4gCCALEPkDIAEoAhQhBAtBACEHAkAgBEUNACAAIAMQ7AEhByABKAIAQRBqIQoLIANBBGohCCADIQQMYQsgBEEYdkGBf2ohCyAKIARBA3ZB8B9xaiEIAkACQAJAAkAgCiAEQQx2QfAfcWoiDC0ACCIEQX1qDhEAAwMDAwMDAwMDAwMDAwMDAQMLIAggDCkDACALrHw3AwAMAQsgCCAMKwMAIAu3oDkDAAsgCCAEOgAIIANBBGohAwtBACEEAkAgB0UNACAAIAMQ7AEhBCABKAIAQRBqIQoLIANBBGohCCAEIQcgAyEEDGALIAogBEEDdkHwH3FqIQwgBiAEQRh2Ig1BBHRqIQtBASEIAkACQAJAAkACQAJAAkAgCiAEQQx2QfAfcWoiBC0ACCIOQX1qDhEABAQEBAQEBAQEBAQEBAQEAQQLAkAgCy0ACEEDRw0AIAwgCykDACAEKQMAfDcDAEEDIQQMBQsgDkF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyAEKwMAISMMAQsgBCkDALkhIwtBACEICwJAIAhFDQAgAyEEDAILQQEhBAJAAkACQAJAIAYgDUEEdGotAAhBfWoOEQEDAwMDAwMDAwMDAwMDAwMAAwsgCysDACEkDAELIAspAwC5ISQLQQAhBAsCQCAERQ0AIAMhBAwCCyAMICMgJKA5AwBBEyEECyAMIAQ6AAggA0EEaiEEC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwxfCyAKIARBA3ZB8B9xaiEMIAYgBEEYdiINQQR0aiELQQEhCAJAAkACQAJAAkACQAJAIAogBEEMdkHwH3FqIgQtAAgiDkF9ag4RAAQEBAQEBAQEBAQEBAQEBAEECwJAIAstAAhBA0cNACAMIAQpAwAgCykDAH03AwBBAyEEDAULIA5BfWoOEQEDAwMDAwMDAwMDAwMDAwMAAwsgBCsDACElDAELIAQpAwC5ISULQQAhCAsCQCAIRQ0AIAMhBAwCC0EBIQQCQAJAAkACQCAGIA1BBHRqLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhJgwBCyALKQMAuSEmC0EAIQQLAkAgBEUNACADIQQMAgsgDCAlICahOQMAQRMhBAsgDCAEOgAIIANBBGohBAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMXgsgCiAEQQN2QfAfcWohDCAGIARBGHYiDUEEdGohC0EBIQgCQAJAAkACQAJAAkACQCAKIARBDHZB8B9xaiIELQAIIg5BfWoOEQAEBAQEBAQEBAQEBAQEBAQBBAsCQCALLQAIQQNHDQAgDCALKQMAIAQpAwB+NwMAQQMhBAwFCyAOQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAQrAwAhJwwBCyAEKQMAuSEnC0EAIQgLAkAgCEUNACADIQQMAgtBASEEAkACQAJAAkAgBiANQQR0ai0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyALKwMAISgMAQsgCykDALkhKAtBACEECwJAIARFDQAgAyEEDAILIAwgJyAoojkDAEETIQQLIAwgBDoACCADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDF0LIAEgAzYCECAAIAEoAgQ2AgwgCiAEQQN2QfAfcWohDCAGIARBGHYiDUEEdGohC0EBIQgCQAJAAkACQAJAAkACQCAKIARBDHZB8B9xaiIELQAIIg5BfWoOEQAEBAQEBAQEBAQEBAQEBAQBBAsCQCALLQAIQQNHDQACQAJAIAspAwAiEEIBfEIBVg0AQgAhESAQQgBSDQEgAEHD3ABBABDhAQALAkAgBCkDACAQgSIRUEUNAEIAIREMAQsgESAQhUI/hyAQgyARfCERCyAMIBE3AwBBAyEEDAULIA5BfWoOEQEDAwMDAwMDAwMDAwMDAwMAAwsgBCsDACEpDAELIAQpAwC5ISkLQQAhCAsCQCAIRQ0AIAMhBAwCC0EBIQQCQAJAAkACQCAGIA1BBHRqLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhKgwBCyALKQMAuSEqC0EAIQQLAkAgBEUNACADIQQMAgsCQAJAAkAgKSAqEKsEIitEAAAAAAAAAABkRQ0AICpEAAAAAAAAAABjDQEMAgsgKkQAAAAAAAAAAGRFDQEgK0QAAAAAAAAAAGNFDQELICogK6AhKwsgDCArOQMAQRMhBAsgDCAEOgAIIANBBGohBAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMXAtBASEIAkACQAJAAkAgCiAEQQx2QfAfcWoiCy0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyALKwMAISwMAQsgCykDALkhLAtBACEICwJAAkAgCEUNACADIQQMAQsgBiAEQRh2IgtBBHRqIQxBASEIAkACQAJAAkAgBiALQQR0ai0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyAMKwMAIS0MAQsgDCkDALkhLQtBACEICwJAIAhFDQAgAyEEDAELIAogBEEDdkHwH3FqIQgCQAJAIC1EAAAAAAAAAEBiDQAgLCAsoiErDAELICwgLRDkBCErCyADQQRqIQQgCEETOgAIIAggKzkDAAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMWwtBASEIAkACQAJAAkAgCiAEQQx2QfAfcWoiCy0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyALKwMAIS4MAQsgCykDALkhLgtBACEICwJAAkAgCEUNACADIQQMAQsgBiAEQRh2IgtBBHRqIQxBASEIAkACQAJAAkAgBiALQQR0ai0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyAMKwMAIS8MAQsgDCkDALkhLwtBACEICwJAIAhFDQAgAyEEDAELIAogBEEDdkHwH3FqIgRBEzoACCAEIC4gL6M5AwAgA0EEaiEEC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwxaCyABIAM2AhAgACABKAIENgIMIAogBEEDdkHwH3FqIQwgBiAEQRh2Ig1BBHRqIQtBASEIAkACQAJAAkACQAJAAkAgCiAEQQx2QfAfcWoiBC0ACCIOQX1qDhEABAQEBAQEBAQEBAQEBAQEAQQLAkAgCy0ACEEDRw0AIAQpAwAhEAJAAkAgCykDACIRQgF8QgFWDQAgEUIAUQ1BQgAgEH0hEgwBCyAQIBF/IRIgESAQhUJ/VQ0AIBIgECASIBF+fUIAUq19IRILIAwgEjcDAEEDIQQMBQsgDkF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyAEKwMAITAMAQsgBCkDALkhMAtBACEICwJAIAhFDQAgAyEEDAILQQEhBAJAAkACQAJAIAYgDUEEdGotAAhBfWoOEQEDAwMDAwMDAwMDAwMDAwMAAwsgCysDACExDAELIAspAwC5ITELQQAhBAsCQCAERQ0AIAMhBAwCCyAMIDAgMaOcOQMAQRMhBAsgDCAEOgAIIANBBGohBAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMWQsgBiAEQRR2QfAfcWopAwAhECAKIARBDHZB8B9xaiILLQAIIgxBA0YNOEEAIQggDEETRw1XIAsrAwAiMpwiKyAyYg1XICtEAAAAAAAA4MNmICtEAAAAAAAA4ENjcSEIAkACQCArmUQAAAAAAADgQ2NFDQAgK7AhEQwBC0KAgICAgICAgIB/IRELIBEgEyAIGyETDFcLIAYgBEEUdkHwH3FqKQMAIRAgCiAEQQx2QfAfcWoiCy0ACCIMQQNGDThBACEIIAxBE0cNVSALKwMAIjKcIisgMmINVSArRAAAAAAAAODDZiArRAAAAAAAAOBDY3EhCAJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIREMAQtCgICAgICAgICAfyERCyARIBQgCBshFAxVCyAGIARBFHZB8B9xaikDACEQIAogBEEMdkHwH3FqIgstAAgiDEEDRg04QQAhCCAMQRNHDVMgCysDACIynCIrIDJiDVMgK0QAAAAAAADgw2YgK0QAAAAAAADgQ2NxIQgCQAJAICuZRAAAAAAAAOBDY0UNACArsCERDAELQoCAgICAgICAgH8hEQsgESAVIAgbIRUMUwsgCiAEQQx2QfAfcWoiCy0ACCIMQQNGDThBACEIIAxBE0cNUSALKwMAIjKcIisgMmINUSArRAAAAAAAAODDZiArRAAAAAAAAOBDY3EhCAJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIRAMAQtCgICAgICAgICAfyEQCyAQIBYgCBshFgxRCyAKIARBDHZB8B9xaiILLQAIIgxBA0YNOEEAIQggDEETRw1PIAsrAwAiMpwiKyAyYg1PICtEAAAAAAAA4MNmICtEAAAAAAAA4ENjcSEIAkACQCArmUQAAAAAAADgQ2NFDQAgK7AhEAwBC0KAgICAgICAgIB/IRALIBAgFyAIGyEXDE8LIAogBEEDdkHwH3FqIQwgCiAEQRR2QfAfcWohC0EBIQgCQAJAAkACQAJAAkACQCAKIARBDHZB8B9xaiIELQAIIg1BfWoOEQAEBAQEBAQEBAQEBAQEBAQBBAsCQCALLQAIQQNHDQAgDCALKQMAIAQpAwB8NwMAQQMhBAwFCyANQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAQrAwAhMwwBCyAEKQMAuSEzC0EAIQgLAkAgCEUNACADIQQMAgtBASEEAkACQAJAAkAgCy0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyALKwMAITQMAQsgCykDALkhNAtBACEECwJAIARFDQAgAyEEDAILIAwgMyA0oDkDAEETIQQLIAwgBDoACCADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDFMLIAogBEEDdkHwH3FqIQwgCiAEQRR2QfAfcWohC0EBIQgCQAJAAkACQAJAAkACQCAKIARBDHZB8B9xaiIELQAIIg1BfWoOEQAEBAQEBAQEBAQEBAQEBAQBBAsCQCALLQAIQQNHDQAgDCAEKQMAIAspAwB9NwMAQQMhBAwFCyANQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAQrAwAhNQwBCyAEKQMAuSE1C0EAIQgLAkAgCEUNACADIQQMAgtBASEEAkACQAJAAkAgCy0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyALKwMAITYMAQsgCykDALkhNgtBACEECwJAIARFDQAgAyEEDAILIAwgNSA2oTkDAEETIQQLIAwgBDoACCADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDFILIAogBEEDdkHwH3FqIQwgCiAEQRR2QfAfcWohC0EBIQgCQAJAAkACQAJAAkACQCAKIARBDHZB8B9xaiIELQAIIg1BfWoOEQAEBAQEBAQEBAQEBAQEBAQBBAsCQCALLQAIQQNHDQAgDCALKQMAIAQpAwB+NwMAQQMhBAwFCyANQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAQrAwAhNwwBCyAEKQMAuSE3C0EAIQgLAkAgCEUNACADIQQMAgtBASEEAkACQAJAAkAgCy0ACEF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyALKwMAITgMAQsgCykDALkhOAtBACEECwJAIARFDQAgAyEEDAILIAwgNyA4ojkDAEETIQQLIAwgBDoACCADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDFELIAEgAzYCECAAIAEoAgQ2AgwgCiAEQQN2QfAfcWohDCAKIARBFHZB8B9xaiELQQEhCAJAAkACQAJAAkACQAJAIAogBEEMdkHwH3FqIgQtAAgiDUF9ag4RAAQEBAQEBAQEBAQEBAQEBAEECwJAIAstAAhBA0cNAAJAAkAgCykDACIQQgF8QgFWDQBCACERIBBCAFINASAAQcPcAEEAEOEBAAsCQCAEKQMAIBCBIhFQRQ0AQgAhEQwBCyARIBCFQj+HIBCDIBF8IRELIAwgETcDAEEDIQQMBQsgDUF9ag4RAQMDAwMDAwMDAwMDAwMDAwADCyAEKwMAITkMAQsgBCkDALkhOQtBACEICwJAIAhFDQAgAyEEDAILQQEhBAJAAkACQAJAIAstAAhBfWoOEQEDAwMDAwMDAwMDAwMDAwMAAwsgCysDACE6DAELIAspAwC5IToLQQAhBAsCQCAERQ0AIAMhBAwCCwJAAkACQCA5IDoQqwQiK0QAAAAAAAAAAGRFDQAgOkQAAAAAAAAAAGMNAQwCCyA6RAAAAAAAAAAAZEUNASArRAAAAAAAAAAAY0UNAQsgOiAroCErCyAMICs5AwBBEyEECyAMIAQ6AAggA0EEaiEEC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwxQC0EBIQgCQAJAAkACQCAKIARBDHZB8B9xaiILLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhOwwBCyALKQMAuSE7C0EAIQgLAkACQCAIRQ0AIAMhBAwBC0EBIQgCQAJAAkACQCAKIARBFHZB8B9xaiILLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhPAwBCyALKQMAuSE8C0EAIQgLAkAgCEUNACADIQQMAQsgCiAEQQN2QfAfcWohCAJAAkAgPEQAAAAAAAAAQGINACA7IDuiISsMAQsgOyA8EOQEISsLIANBBGohBCAIQRM6AAggCCArOQMAC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwxPC0EBIQgCQAJAAkACQCAKIARBDHZB8B9xaiILLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhPQwBCyALKQMAuSE9C0EAIQgLAkACQCAIRQ0AIAMhBAwBC0EBIQgCQAJAAkACQCAKIARBFHZB8B9xaiILLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhPgwBCyALKQMAuSE+C0EAIQgLAkAgCEUNACADIQQMAQsgCiAEQQN2QfAfcWoiBEETOgAIIAQgPSA+ozkDACADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDE4LIAEgAzYCECAAIAEoAgQ2AgwgCiAEQQN2QfAfcWohDCAKIARBFHZB8B9xaiELQQEhCAJAAkACQAJAAkACQAJAIAogBEEMdkHwH3FqIgQtAAgiDUF9ag4RAAQEBAQEBAQEBAQEBAQEBAEECwJAIAstAAhBA0cNACAEKQMAIRACQAJAIAspAwAiEUIBfEIBVg0AIBFCAFENO0IAIBB9IRIMAQsgECARfyESIBEgEIVCf1UNACASIBAgEiARfn1CAFKtfSESCyAMIBI3AwBBAyEEDAULIA1BfWoOEQEDAwMDAwMDAwMDAwMDAwMAAwsgBCsDACE/DAELIAQpAwC5IT8LQQAhCAsCQCAIRQ0AIAMhBAwCC0EBIQQCQAJAAkACQCALLQAIQX1qDhEBAwMDAwMDAwMDAwMDAwMDAAMLIAsrAwAhQAwBCyALKQMAuSFAC0EAIQQLAkAgBEUNACADIQQMAgsgDCA/IECjnDkDAEETIQQLIAwgBDoACCADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDE0LIAogBEEMdkHwH3FqIgstAAgiDEEDRg0yQQAhCCAMQRNHDUYgCysDACIynCIrIDJiDUYgK0QAAAAAAADgw2YgK0QAAAAAAADgQ2NxIQgCQAJAICuZRAAAAAAAAOBDY0UNACArsCEQDAELQoCAgICAgICAgH8hEAsgECAYIAgbIRgMRgsgCiAEQQx2QfAfcWoiCy0ACCIMQQNGDTJBACEIIAxBE0cNRCALKwMAIjKcIisgMmINRCArRAAAAAAAAODDZiArRAAAAAAAAOBDY3EhCAJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIRAMAQtCgICAgICAgICAfyEQCyAQIBkgCBshGQxECyAKIARBDHZB8B9xaiILLQAIIgxBA0YNMkEAIQggDEETRw1CIAsrAwAiMpwiKyAyYg1CICtEAAAAAAAA4MNmICtEAAAAAAAA4ENjcSEIAkACQCArmUQAAAAAAADgQ2NFDQAgK7AhEAwBC0KAgICAgICAgIB/IRALIBAgGiAIGyEaDEILIAogBEEMdkHwH3FqIgstAAgiDEEDRg0yQQAhCCAMQRNHDUAgCysDACIynCIrIDJiDUAgK0QAAAAAAADgw2YgK0QAAAAAAADgQ2NxIQgCQAJAICuZRAAAAAAAAOBDY0UNACArsCEQDAELQoCAgICAgICAgH8hEAsgECAbIAgbIRsMQAsgCiAEQQx2QfAfcWoiCy0ACCIMQQNGDTJBACEIIAxBE0cNPiALKwMAIjKcIisgMmINPiArRAAAAAAAAODDZiArRAAAAAAAAOBDY3EhCAJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIRAMAQtCgICAgICAgICAfyEQCyAQIBwgCBshHAw+CyADQXhqKAIAIQggASADNgIQIAAgASgCBDYCDCAAIAogBEEDdkHwH3FqIAogBEEMdkHwH3FqIAogCEEDdkHwH3FqIARBGHYQ3wNBACEHAkAgASgCFEUNACAAIAMQ7AEhByABKAIAQRBqIQoLIANBBGohCCADIQQMRwsgA0F4aigCACEIIAEgAzYCECAAIAEoAgQ2AgwgACAKIARBA3ZB8B9xaiAEQRB2Qf8BcUGBf2qsIARBD3ZBAXEgCiAIQQN2QfAfcWogBEEYdhDjA0EAIQcCQCABKAIURQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAxGCyADQXhqKAIAIQggASADNgIQIAAgASgCBDYCDCAAIAogBEEDdkHwH3FqIAYgBEEMdkHwH3FqIARBD3ZBAXEgCiAIQQN2QfAfcWogBEEYdhDiA0EAIQcCQCABKAIURQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAxFCyAKIARBA3ZB8B9xaiEIAkACQCAKIARBDHZB8B9xaiIELQAIIgtBA0cNACAEKQMAIRAgCEEDOgAIIAhCACAQfTcDACAHIQQMAQsCQCALQRNHIgsNACAEKwMAIUELAkAgCw0AIAhBEzoACCAIIEGaOQMAIAchBAwBCyABIAM2AhAgACABKAIENgIMIAAgBCAEIAhBEhDfAyABKAIUIQQLQQAhBwJAIARFDQAgACADEOwBIQcgASgCAEEQaiEKCyADQQRqIQggAyEEDEQLIARBA3ZB8B9xIQggCiAEQQx2QfAfcWoiBC0ACCIMQQNGDS5BACELIAxBE0cNOCAEKwMAIjKcIisgMmINOCArRAAAAAAAAODDZiArRAAAAAAAAOBDY3EhCwJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIRAMAQtCgICAgICAgICAfyEQCyAQIB0gCxshHQw4CyAKIARBA3ZB8B9xakERQQFBESAKIARBDHZB8B9xai0ACCIEQQ9xGyAEQQFGGzoACEEAIQQCQCAHRQ0AIAAgAxDsASEEIAEoAgBBEGohCgsgA0EEaiEIIAQhByADIQQMQgsgASADNgIQIAAgASgCBDYCDCAAIAogBEEDdkHwH3FqIAogBEEMdkHwH3FqEIEEQQAhBwJAIAEoAhRFDQAgACADEOwBIQcgASgCAEEQaiEKCyADQQRqIQggAyEEDEELIAAgCiAEQQN2QfAfcWogBEEQdkH/AXEiBEEEdGo2AgwgASADNgIQIAAgBBCABCABKAIUIQQCQCAAKAIQKAIMQQFIDQAgASADNgIQIAAQoQIgASgCFCEEC0EAIQcCQCAERQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAxACyABIAM2AhAgACABKAIENgIMQQAhByAAIAogBEEDdkHwH3FqQQBBARCNAhoCQCABKAIURQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAw/CyABIAM2AhAgACABKAIENgIMIAAgCiAEQQN2QfAfcWoQigJBACEEAkAgB0UNACAAIAMQ7AEhBCABKAIAQRBqIQoLIANBBGohCCAEIQcgAyEEDD4LIARBBXZB/P//P3EgA2pBhICAYGohBEEAIQcCQCABKAIURQ0AIAAgBBDsASEHIAEoAgBBEGohCgsgBEEEaiEIDD0LIAEgAzYCECAAIAEoAgQ2AgwgACAKIARBA3ZB8B9xaiAKIARBDHZB8B9xahD/AyEHIAEoAhQhCAJAAkAgByAEQQ92QQFxRg0AIANBBGohBAwBCyADKAIAQQV2Qfz//z9xIANqQYiAgGBqIQQgASgCFCEIC0EAIQcCQCAIRQ0AIAAgBBDsASEHIAEoAgBBEGohCgsgBEEEaiEIDDwLIAogBEEMdkHwH3FqIQgCQAJAIAogBEEDdkHwH3FqIgstAAgiDEEDRw0AIAgtAAhBA0cNACALKQMAIAgpAwBTIQgMAQsCQCAMQQ9xQQNHDQAgCC0ACCINQQ9xQQNHDQACQCAMQQNHDQAgCykDACEQAkAgDUEDRw0AIBAgCCkDAFMhCAwDCyAIKwMAISsCQCAQQoCAgICAgIAQfEKAgICAgICAIFYNACArIBC5ZCEIDAMLICucIjJEAAAAAAAA8D+gIDIgMiArYhsiMkQAAAAAAADgQ2MhCAJAAkAgMplEAAAAAAAA4ENjRQ0AIDKwIREMAQtCgICAgICAgICAfyERCyAQIBFTICtEAAAAAAAAAABkIgsgCBsgCyAyRAAAAAAAAODDZhshCAwCCyALKwMAISsCQCANQRNHDQAgKyAIKwMAYyEIDAILAkAgCCkDACIQQoCAgICAgIAQfEKAgICAgICAIFYNACArIBC5YyEIDAILICtEAAAAAAAAAABjIQggK5wiK0QAAAAAAADgQ2MhCwJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIREMAQtCgICAgICAgICAfyERCyAQIBFVIAggCxsgCCArRAAAAAAAAODDZhshCAwBCyABIAM2AhAgACABKAIENgIMIAAgCyAIEPwDIQggASgCFCEHCwJAAkAgCCAEQQ92QQFxRg0AIANBBGohBCAHIQMMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhAwtBACEHAkAgA0UNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAw7CyAKIARBDHZB8B9xaiEIAkACQCAKIARBA3ZB8B9xaiILLQAIIgxBA0cNACAILQAIQQNHDQAgCykDACAIKQMAVyEIDAELAkAgDEEPcUEDRw0AIAgtAAgiDUEPcUEDRw0AAkAgDEEDRw0AIAspAwAhEAJAIA1BA0cNACAQIAgpAwBXIQgMAwsgCCsDACErAkAgEEKAgICAgICAEHxCgICAgICAgCBWDQAgKyAQuWYhCAwDCyArnCIyRAAAAAAAAODDZiAyRAAAAAAAAOBDY3EiCEEBcyELAkACQCAymUQAAAAAAADgQ2NFDQAgMrAhEQwBC0KAgICAgICAgIB/IRELIAsgECARV3IgK0QAAAAAAAAAAGQgCBshCAwCCyALKwMAISsCQCANQRNHDQAgKyAIKwMAZSEIDAILAkAgCCkDACIQQoCAgICAgIAQfEKAgICAgICAIFYNACArIBC5ZSEIDAILICucIjJEAAAAAAAA8D+gIDIgMiArYhsiMkQAAAAAAADgw2YgMkQAAAAAAADgQ2NxIghBAXMhCwJAAkAgMplEAAAAAAAA4ENjRQ0AIDKwIREMAQtCgICAgICAgICAfyERCyALIBAgEVlyICtEAAAAAAAAAABjIAgbIQgMAQsgASADNgIQIAAgASgCBDYCDCAAIAsgCBD+AyEIIAEoAhQhBwsCQAJAIAggBEEPdkEBcUYNACADQQRqIQQgByEDDAELIAMoAgBBBXZB/P//P3EgA2pBiICAYGohBCABKAIUIQMLQQAhBwJAIANFDQAgACAEEOwBIQcgASgCAEEQaiEKCyAEQQRqIQgMOgsCQAJAQQAgCiAEQQN2QfAfcWogBiAEQQx2QfAfcWoQ/wMgBEEPdkEBcUYNACADQQRqIQQgByEDDAELIAMoAgBBBXZB/P//P3EgA2pBiICAYGohBCABKAIUIQMLQQAhBwJAIANFDQAgACAEEOwBIQcgASgCAEEQaiEKCyAEQQRqIQgMOQsgBEEQdkH/AXFBgX9qIQtBACEIAkACQAJAIAogBEEDdkHwH3FqIgwtAAhBfWoOEQACAgICAgICAgICAgICAgIBAgsgDCkDACALrFEhCAwBCyAMKwMAIAu3YSEICwJAAkAgBEGAgAJxRSAIcw0AIANBBGohBCAHIQMMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhAwtBACEHAkAgA0UNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAw4CyAEQRB2Qf8BcUGBf2ohCAJAAkACQAJAIAogBEEDdkHwH3FqIgstAAhBfWoOEQACAgICAgICAgICAgICAgIBAgsgCykDACAIrFMhCyAHIQgMAgsgCysDACAIt2MhCyAHIQgMAQsgASADNgIQIAAgASgCBDYCDCAAIAsgCEEAIARBGHZBFBDlAyELIAEoAhQhCAsCQAJAIAsgBEEPdkEBcUYNACADQQRqIQQMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhCAtBACEHAkAgCEUNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAw3CyAEQRB2Qf8BcUGBf2ohCAJAAkACQAJAIAogBEEDdkHwH3FqIgstAAhBfWoOEQACAgICAgICAgICAgICAgIBAgsgCykDACAIrFchCyAHIQgMAgsgCysDACAIt2UhCyAHIQgMAQsgASADNgIQIAAgASgCBDYCDCAAIAsgCEEAIARBGHZBFRDlAyELIAEoAhQhCAsCQAJAIAsgBEEPdkEBcUYNACADQQRqIQQMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhCAtBACEHAkAgCEUNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAw2CyAEQRB2Qf8BcUGBf2ohCAJAAkACQAJAIAogBEEDdkHwH3FqIgstAAhBfWoOEQACAgICAgICAgICAgICAgIBAgsgCykDACAIrFUhCyAHIQgMAgsgCysDACAIt2QhCyAHIQgMAQsgASADNgIQIAAgASgCBDYCDCAAIAsgCEEBIARBGHZBFBDlAyELIAEoAhQhCAsCQAJAIAsgBEEPdkEBcUYNACADQQRqIQQMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhCAtBACEHAkAgCEUNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAw1CyAEQRB2Qf8BcUGBf2ohCAJAAkACQAJAIAogBEEDdkHwH3FqIgstAAhBfWoOEQACAgICAgICAgICAgICAgIBAgsgCykDACAIrFkhCyAHIQgMAgsgCysDACAIt2YhCyAHIQgMAQsgASADNgIQIAAgASgCBDYCDCAAIAsgCEEBIARBGHZBFRDlAyELIAEoAhQhCAsCQAJAIAsgBEEPdkEBcUYNACADQQRqIQQMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhCAtBACEHAkAgCEUNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAw0CwJAAkAgBEGAgAJxQQ92IAogBEEDdkHwH3FqLQAIIgRBAUYgBEEPcUVyRw0AIANBBGohBCAHIQMMAQsgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhAwtBACEHAkAgA0UNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAwzCwJAAkAgBEGAgAJxRSAKIARBDHZB8B9xaiILLQAIIghBAUYgCEEPcUVyRg0AIANBBGohBCAHIQMMAQsgCykDACEQIAogBEEDdkHwH3FqIgQgCDoACCAEIBA3AwAgAygCAEEFdkH8//8/cSADakGIgIBgaiEEIAEoAhQhAwtBACEHAkAgA0UNACAAIAQQ7AEhByABKAIAQRBqIQoLIARBBGohCAwyCyAEQRh2QX9qIQcgCiAEQQN2QfAfcWohCAJAIARBEHZB/wFxIgRFDQAgACAIIARBBHRqNgIMCyABIAM2AhACQCAAIAggBxD9ASIERQ0AIAQhAQw0C0EAIQcCQCABKAIURQ0AIAAgAxDsASEHIAEoAgBBEGohCgsgA0EEaiEIIAMhBAwxCyAEQRB2Qf8BcSEIIARBA3ZB8B9xIQtBACEHAkAgBEGAgIAISQ0AIAFBGGooAgAgBEEYdmohBwsgCiALaiELAkACQCAIRQ0AIAAgCyAIQQR0ajYCDAwBCyAAKAIMIAtrQQR1IQgLIAEgAzYCEAJAIARBgIACcUUNACAAIAoQjAILIAAgASALIAggBxD6ASIEQQBIDTIgASABKAIAIAdBBHRrNgIAIAAgASAEEPgBIAFBFGooAgAhAwwECyAKIARBB3ZB/wFxIgtBBHRqIQcCQAJAIARBEHZB/wFxIghFDQAgCEF/aiEIDAELIAAoAgwgB2tBBHUhCAsgASADNgIQAkAgBEGAgAJxRQ0AIAEgCDYCHAJAIAAoAgwgASgCBCIDTw0AIAAgAzYCDAsgACAKQX9BARCNAhogAUEUaigCAEUNACABKAIAIAtBBHRqQRBqIQcLAkAgBEGAgIAISQ0AIAEgASgCACAEQRh2IAFBGGooAgBqQQR0azYCAAsgACAHIAhBBHRqNgIMIAAgASAIEPgBIAFBFGooAgAhAwwDCwJAIAAoAnBFDQAgACAKIARBA3ZB8B9xajYCDCABIAM2AhAgACABQQAQ+AFBASEDDAMLIAEoAgghBCAAIApBcGo2AgwgACAENgIUIAEuASAiBEEBSA0BA0AgACAAKAIMIgNBEGo2AgwgA0EAOgAIIARBAUohAyAEQX9qIQQgAw0ADAILAAsCQCAAKAJwRQ0AIAAgCiAEQQN2QfAfcWpBEGo2AgwgASADNgIQQQEhAyAAIAFBARD4AQwCCyABLgEgIQMgACABKAIINgIUAkAgAw0AIAAgCkFwajYCDAwBCyAKQXBqIgggCiAEQQN2QfAfcWoiBCkDADcDACAIQQhqIAQtAAg6AAAgACAKNgIMIANBAkgNAANAIAAgACgCDCIEQRBqNgIMIARBADoACCADQQJKIQQgA0F/aiEDIAQNAAsLIAchAwsgAS0AIkEEcQ0dIAEoAgghAQwsCwJAAkAgCiAEQQN2QfAfcWoiCEEoai0AAEEDRw0AAkAgCCkDECIQUEUNACADIQQMAgsgCCAQQn98NwMQIAhBOGpBAzoAACAIIAgpAwAgCCkDIHwiEDcDMCAIIBA3AwAgAyAEQQ12Qfz/H3FrIQQMAQsgCCsDICIyIAgrAwCgISsgCCsDECFCAkACQCAyRAAAAAAAAAAAZEUNACArIEJlDQEgAyEEDAILIEIgK2UNACADIQQMAQsgCCArOQMwIAggKzkDACAIQThqQRM6AAAgAyAEQQ12Qfz/H3FrIQQLQQAhBwJAIAEoAhRFDQAgACAEEOwBIQcgASgCAEEQaiEKCyAEQQRqIQgMKgsgASADNgIQIAAgASgCBDYCDCAKIARBA3ZB8B9xaiIIQRBqIQsCQAJAIAgtAAhBA0cNACAIQShqLQAAQQNHDQAgCCkDICIQQgBRDRcgCCAIKQMAIhE3AzAgCEE4akEDOgAAAkAgCyACQShqQQJBASAQQgBTGxD4Aw0AAkACQCAIQRhqLQAAIgxBE0cNACALKwMAISsMAQsCQAJAAkAgDEEDRw0AIAspAwC5ISsMAQsCQCAMQQ9xQQRGDQBBASEMDAILIAsoAgAiDEEQaiACQTBqEN8CIQ4CQCAMLQAHIg1B/wFHDQAgDCgCDCENC0EBIQwgDiANQQFqRw0BIAIpAzAiErkgEr8gAi0AOEEDRhshKwtBACEMCyAMDRoLAkACQCArRAAAAAAAAAAAZEUNAEL///////////8AIRIgEEIAWQ0BDCELIBBCAFUNIEKAgICAgICAgIB/IRILIAIgEjcDKAsgAikDKCISIBFZIBIgEVcgEEIAVRtBAUcNHgJAAkAgEEIBUw0AIBIgEX0hESAQQgFRDQEgESAQgCERDAELIBEgEn1CACAQfYAhEQsgCCARNwMQIAhBGGpBAzoAAAwBCwJAAkAgCEEYai0AAEETRw0AIAsrAwAhQgwBCwJAAkACQCAILQAYIgxBA0cNACALKQMAuSFCDAELAkAgDEEPcUEERg0AQQEhDAwCCyALKAIAIgxBEGogAkEwahDfAiEOAkAgDC0AByINQf8BRw0AIAwoAgwhDQtBASEMIA4gDUEBakcNASACKQMwIhC5IBC/IAItADhBA0YbIUILQQAhDAsgDA0ZCyAIQSBqIQsCQAJAIAhBKGotAABBE0cNACALKwMAISsMAQsCQAJAAkAgCC0AKCIMQQNHDQAgCykDALkhKwwBCwJAIAxBD3FBBEYNAEEBIQwMAgsgCygCACIMQRBqIAJBMGoQ3wIhDgJAIAwtAAciDUH/AUcNACAMKAIMIQ0LQQEhDCAOIA1BAWpHDQEgAikDMCIQuSAQvyACLQA4QQNGGyErC0EAIQwLIAwNGgsCQAJAIAgtAAgiC0ETRw0AIAgrAwAhMgwBCwJAAkACQCALQQNHDQAgCCkDALkhMgwBCwJAIAtBD3FBBEYNAEEBIQsMAgsgCCgCACILQRBqIAJBMGoQ3wIhDQJAIAstAAciDEH/AUcNACALKAIMIQwLQQEhCyANIAxBAWpHDQEgAikDMCIQuSAQvyACLQA4QQNGGyEyC0EAIQsLIAsNGwsgK0QAAAAAAAAAAGENGwJAAkAgK0QAAAAAAAAAAGRFDQBBACELIEIgMmNFDQEMIAtBACELIDIgQmMNHwsgCEETOgAoIAggKzkDICAIQRM6ABggCCBCOQMQIAggMjkDMCAIQRM6AAggCCAyOQMAIAhBOGpBEzoAAAtBASELDB0LIAEgAzYCECAAIAEoAgQ2AgwgACAKIARBA3ZB8B9xakEwahCKAiADIARBDXZB/P8fcWoiBEEEaiEDIAQoAgAhBAsgCiAEQQN2QfAfcWoiCCAIKQMANwNAIAhB6ABqIAhBKGopAwA3AwAgCEHgAGogCEEgaikDADcDACAIQdgAaiAIQRhqKQMANwMAIAhB0ABqIAhBEGopAwA3AwAgCEHIAGogCEEIaikDADcDACAAIAhB8ABqNgIMIAEgAzYCECAAIAhBwABqIARBGHYQ/gECQCABKAIUIgdFDQAgASgCAEEQaiEKCyADKAIAIQQgA0EEaiEDCwJAAkAgCiAEQQN2QfAfcWoiCEHIAGotAAAiC0EPcQ0AIAMhBAwBCyAIQShqIAs6AAAgCCAIKQNANwMgIAMgBEENdkH8/x9xayEEC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwwmCyAEQRh2IQggCiAEQQN2QfAfcWoiDygCACEOAkACQCAEQRB2Qf8BcSIMDQAgACgCDCAPa0EEdUF/aiEMDAELIAAgASgCBDYCDAsgDCAIaiELAkACQCAEQYCAAnENACADIQQMAQsgA0EEaiEEIAMoAgBBAXRBgH5xIAtqIQsLAkAgCyAOELwDTQ0AIAAgDiALEMQDCwJAIAxBAUgNAANAIA4oAgwgC0F/aiILQQR0aiINIA8gDCIIQQR0aiIDKQMANwMAIA0gAy0ACDoACAJAIAMtAAhBwABxRQ0AIA4tAAVBIHFFDQAgAygCAC0ABUEYcUUNACAAIA4QkwILIAhBf2ohDCAIQQFKDQALC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwwlCyAFKAIMKAI4IARBDXZB/P8fcWooAgAhCyABIAM2AhAgACABKAIENgIMIAsoAjwhDiAAIAsoAgwiDRCHAiIIIAs2AgwgCiAEQQN2QfAfcWoiD0HGADoACCAPIAg2AgACQCANQQFIDQBBACEEA0AgDiAEQQN0aiILLQAFIQwCQAJAIAstAARFDQAgACAKIAxBBHRqEIkCIQsMAQsgCSAMQQJ0aigCACELCyAIIARBAnRqQRBqIgwgCzYCAAJAIAgtAAVBIHFFDQAgDCgCACILLQAFQRhxRQ0AIAAgCCALEJECCyAEQQFqIgQgDUcNAAsLAkAgACgCECgCDEEBSA0AIAEgAzYCECAAIA9BEGo2AgwgABChAiABKAIUIQcLQQAhBAJAIAdFDQAgACADEOwBIQQgASgCAEEQaiEKCyADQQRqIQggBCEHIAMhBAwkCyABIAM2AhAgACABKAIENgIMIAAgASAKIARBA3ZB8B9xaiAEQRh2QX9qEOcDQQAhBwJAIAEoAhRFDQAgACADEOwBIQcgASgCAEEQaiEKCyADQQRqIQggAyEEDCMLIAEgAzYCECAAIARBB3ZB/wFxIAEgBSgCDBDmA0EAIQcCQCABKAIURQ0AIAAgARD3ASAAQQE2AmQgACADEOwBIQcLIANBBGohCCABKAIAQRBqIQogAyEEDCILQQAhBAJAIAdFDQAgACADEOwBIQQgASgCAEEQaiEKCyADQQRqIQggBCEHIAMhBAwhCyAAQYkVQQAQ4QEACyALKQMAIRNBASEIDB4LIAspAwAhFEEBIQgMHAsgCykDACEVQQEhCAwaCyALKQMAIRZBASEIDBgLIAspAwAhF0EBIQgMFgsgAEGJFUEAEOEBAAsgCykDACEYQQEhCAwTCyALKQMAIRlBASEIDBELIAspAwAhGkEBIQgMDwsgCykDACEbQQEhCAwNCyALKQMAIRxBASEIDAsLIAQpAwAhHUEBIQsMCQsgAEGjFUEAEOEBAAsgACALQcULEOQBAAsgACALQcULEOQBAAsgACALQesUEOQBAAsgACAIQaohEOQBAAsgAEGjFUEAEOEBAAsgAkHAAGokAA8LQQAhCwtBACEMIANBACAEQQ92QQFqIAsbQQJ0aiEEAkAgB0UNACAAIAQQ7AEhDCABKAIAQRBqIQoLIARBBGohCCAMIQcMCwsgCiAIaiEIAkACQCALRQ0AIAhBAzoACCAIIB1Cf4U3AwAgByEEDAELIAEgAzYCECAAIAEoAgQ2AgwgACAEIAQgCEETEN8DIAEoAhQhBAtBACEHAkAgBEUNACAAIAMQ7AEhByABKAIAQRBqIQoLIANBBGohCCADIQQMCgsCQAJAIAgNACADIQQMAQsCQAJAIAogBEEUdkHwH3FqIgstAAgiDEEDRg0AQQAhCCAMQRNHDQEgCysDACIynCIrIDJiDQEgK0QAAAAAAADgw2YgK0QAAAAAAADgQ2NxIQgCQAJAICuZRAAAAAAAAOBDY0UNACArsCEQDAELQoCAgICAgICAgH8hEAsgECAeIAgbIR4MAQsgCykDACEeQQEhCAsCQCAIDQAgAyEEDAELIAogBEEDdkHwH3FqIQgCQAJAIB5Cf1UNAEIAIRAgHkJBUw0BIBxCACAefYghEAwBC0IAIBwgHoYgHkI/VRshEAsgA0EEaiEEIAhBAzoACCAIIBA3AwALQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDAkLAkACQCAIDQAgAyEEDAELAkACQCAKIARBFHZB8B9xaiILLQAIIgxBA0YNAEEAIQggDEETRw0BIAsrAwAiMpwiKyAyYg0BICtEAAAAAAAA4MNmICtEAAAAAAAA4ENjcSEIAkACQCArmUQAAAAAAADgQ2NFDQAgK7AhEAwBC0KAgICAgICAgIB/IRALIBAgHyAIGyEfDAELIAspAwAhH0EBIQgLAkAgCA0AIAMhBAwBCyAKIARBA3ZB8B9xaiEIAkACQEIAIB99IhBCf1UNAEIAIBsgH4ggEEJBUxshEAwBC0IAIBsgEIYgEEI/VRshEAsgA0EEaiEEIAhBAzoACCAIIBA3AwALQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDAgLAkACQCAIDQAgAyEEDAELAkACQCAKIARBFHZB8B9xaiILLQAIIgxBA0YNAEEAIQggDEETRw0BIAsrAwAiMpwiKyAyYg0BICtEAAAAAAAA4MNmICtEAAAAAAAA4ENjcSEIAkACQCArmUQAAAAAAADgQ2NFDQAgK7AhEAwBC0KAgICAgICAgIB/IRALIBAgICAIGyEgDAELIAspAwAhIEEBIQgLAkAgCA0AIAMhBAwBCyAKIARBA3ZB8B9xaiIEQQM6AAggBCAgIBqFNwMAIANBBGohBAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMBwsCQAJAIAgNACADIQQMAQsCQAJAIAogBEEUdkHwH3FqIgstAAgiDEEDRg0AQQAhCCAMQRNHDQEgCysDACIynCIrIDJiDQEgK0QAAAAAAADgw2YgK0QAAAAAAADgQ2NxIQgCQAJAICuZRAAAAAAAAOBDY0UNACArsCEQDAELQoCAgICAgICAgH8hEAsgECAhIAgbISEMAQsgCykDACEhQQEhCAsCQCAIDQAgAyEEDAELIAogBEEDdkHwH3FqIgRBAzoACCAEICEgGYQ3AwAgA0EEaiEEC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwwGCwJAAkAgCA0AIAMhBAwBCwJAAkAgCiAEQRR2QfAfcWoiCy0ACCIMQQNGDQBBACEIIAxBE0cNASALKwMAIjKcIisgMmINASArRAAAAAAAAODDZiArRAAAAAAAAOBDY3EhCAJAAkAgK5lEAAAAAAAA4ENjRQ0AICuwIRAMAQtCgICAgICAgICAfyEQCyAQICIgCBshIgwBCyALKQMAISJBASEICwJAIAgNACADIQQMAQsgCiAEQQN2QfAfcWoiBEEDOgAIIAQgIiAYgzcDACADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDAULAkACQCAIDQAgAyEEDAELIAogBEEDdkHwH3FqIQggBEEYdkGBf2qsIRECQAJAIBdCf1UNAEIAIRAgF0JBUw0BIBFCACAXfYghEAwBC0IAIBEgF4YgF0I/VRshEAsgA0EEaiEEIAhBAzoACCAIIBA3AwALQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDAQLAkACQCAIDQAgAyEEDAELIAogBEEDdkHwH3FqIQhB/wAgBEEYdmusIRECQAJAIARBf0oNAEIAIRAgBEH////3e0sNASAWQgAgEX2IIRAMAQtCACAWIBGGIARBgICAgARJGyEQCyADQQRqIQQgCEEDOgAIIAggEDcDAAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMAwsCQAJAIAgNACADIQQMAQsgCiAEQQN2QfAfcWoiBEEDOgAIIAQgFSAQhTcDACADQQRqIQQLQQAhAwJAIAdFDQAgACAEEOwBIQMgASgCAEEQaiEKCyAEQQRqIQggAyEHDAILAkACQCAIDQAgAyEEDAELIAogBEEDdkHwH3FqIgRBAzoACCAEIBQgEIQ3AwAgA0EEaiEEC0EAIQMCQCAHRQ0AIAAgBBDsASEDIAEoAgBBEGohCgsgBEEEaiEIIAMhBwwBCwJAAkAgCA0AIAMhBAwBCyAKIARBA3ZB8B9xaiIEQQM6AAggBCATIBCDNwMAIANBBGohBAtBACEDAkAgB0UNACAAIAQQ7AEhAyABKAIAQRBqIQoLIARBBGohCCADIQcMAAsACwALAAteAQR/IwBBEGsiASQAQX8hAgJAIAAoAhAgACgCDCABQQxqIAAoAggRAQAiA0UNACABKAIMIgRFDQAgACADQQFqNgIEIAAgBEF/ajYCACADLQAAIQILIAFBEGokACACCx4AIAEgAzYCDCABIAI2AgggASAANgIQIAFCADcCAAv5AQEFfyMAQRBrIgMkAAJAA0ACQCACDQBBACEEDAILAkACQCAAKAIADQBBfyEFAkAgACgCECAAKAIMIANBDGogACgCCBEBACIGRQ0AIAMoAgwiB0UNACAAIAZBAWo2AgQgACAHQX9qNgIAIAYtAAAhBQsCQCAFQX9HDQBBACEFIAIhBAwCCyAAIAAoAgBBAWo2AgAgACAAKAIEQX9qNgIECyABIAAoAgQgAiAAKAIAIgUgAiAFSRsiBRCaBCEBIAAgACgCACAFazYCACAAIAAoAgQgBWo2AgQgAiAFayECIAEgBWohAUEBIQULIAUNAAsLIANBEGokACAECwYAQcDoHwu+AgMBfgF/AnwCQCAAvSIBQiCIp0H/////B3EiAkGAgMD/A0kNAAJAIAJBgIDAgHxqIAGncg0ARAAAAAAAAAAARBgtRFT7IQlAIAFCf1UbDwtEAAAAAAAAAAAgACAAoaMPCwJAAkAgAkH////+A0sNAEQYLURU+yH5PyEDIAJBgYCA4wNJDQFEB1wUMyamkTwgACAAIACiEIwEoqEgAKFEGC1EVPsh+T+gDwsCQCABQn9VDQBEGC1EVPsh+T8gAEQAAAAAAADwP6BEAAAAAAAA4D+iIgAQ8QQiAyADIAAQjASiRAdcFDMmppG8oKChIgAgAKAPC0QAAAAAAADwPyAAoUQAAAAAAADgP6IiAxDxBCIEIAMQjASiIAMgBL1CgICAgHCDvyIAIACioSAEIACgo6AgAKAiACAAoCEDCyADC40BACAAIAAgACAAIABECff9DeE9Aj+iRIiyAXXg70k/oKJEO49otSiCpL+gokRVRIgOVcHJP6CiRH1v6wMS1tS/oKJEVVVVVVVVxT+gIACiIAAgACAAIABEgpIuscW4sz+iRFkBjRtsBua/oKJEyIpZnOUqAECgokRLLYocJzoDwKCiRAAAAAAAAPA/oKMLyAIDAX4BfwN8AkAgAL0iAUIgiKdB/////wdxIgJBgIDA/wNJDQACQCACQYCAwIB8aiABp3INACAARBgtRFT7Ifk/okQAAAAAAABwOKAPC0QAAAAAAAAAACAAIAChow8LAkACQCACQf////4DSw0AIAJBgIBAakGAgIDyA0kNASAAIAAgAKIQjgSiIACgDwtEAAAAAAAA8D8gABCiBKFEAAAAAAAA4D+iIgMQ8QQhACADEI4EIQQCQAJAIAJBs+a8/wNJDQBEGC1EVPsh+T8gACAEoiAAoCIAIACgRAdcFDMmppG8oKEhAAwBC0QYLURU+yHpPyAAvUKAgICAcIO/IgUgBaChIAAgAKAgBKJEB1wUMyamkTwgAyAFIAWioSAAIAWgoyIAIACgoaGhRBgtRFT7Iek/oCEACyAAmiAAIAFCAFMbIQALIAALjQEAIAAgACAAIAAgAEQJ9/0N4T0CP6JEiLIBdeDvST+gokQ7j2i1KIKkv6CiRFVEiA5Vwck/oKJEfW/rAxLW1L+gokRVVVVVVVXFP6AgAKIgACAAIAAgAESCki6xxbizP6JEWQGNG2wG5r+gokTIilmc5SoAQKCiREstihwnOgPAoKJEAAAAAAAA8D+gowuVBAMBfgJ/A3wCQCAAvSIBQiCIp0H/////B3EiAkGAgMCgBEkNACAARBgtRFT7Ifk/IACmIAAQkARC////////////AINCgICAgICAgPj/AFYbDwsCQAJAAkAgAkH//+/+A0sNAEF/IQMgAkGAgIDyA08NAQwCCyAAEKIEIQACQCACQf//y/8DSw0AAkAgAkH//5f/A0sNACAAIACgRAAAAAAAAPC/oCAARAAAAAAAAABAoKMhAEEAIQMMAgsgAEQAAAAAAADwv6AgAEQAAAAAAADwP6CjIQBBASEDDAELAkAgAkH//42ABEsNACAARAAAAAAAAPi/oCAARAAAAAAAAPg/okQAAAAAAADwP6CjIQBBAiEDDAELRAAAAAAAAPC/IACjIQBBAyEDCyAAIACiIgQgBKIiBSAFIAUgBSAFRC9saixEtKK/okSa/d5SLd6tv6CiRG2adK/ysLO/oKJEcRYj/sZxvL+gokTE65iZmZnJv6CiIQYgBCAFIAUgBSAFIAVEEdoi4zqtkD+iROsNdiRLe6k/oKJEUT3QoGYNsT+gokRuIEzFzUW3P6CiRP+DAJIkScI/oKJEDVVVVVVV1T+goiEFAkAgAkH//+/+A0sNACAAIAAgBiAFoKKhDwsgA0EDdCICQbDNDmorAwAgACAGIAWgoiACQdDNDmorAwChIAChoSIAmiAAIAFCAFMbIQALIAALBQAgAL0LxgMDAX4FfwF8AkACQCABEJIEQv///////////wCDQoCAgICAgID4/wBWDQAgABCSBEL///////////8Ag0KBgICAgICA+P8AVA0BCyAAIAGgDwsCQCABvSICQiCIpyIDQYCAwIB8aiACpyIEcg0AIAAQjwQPCyADQR52QQJxIgUgAL0iAkI/iKdyIQYCQAJAIAJCIIinQf////8HcSIHIAKncg0AIAAhCAJAAkAgBg4EAwMAAQMLRBgtRFT7IQlADwtEGC1EVPshCcAPCwJAIANB/////wdxIgMgBHINAEQYLURU+yH5PyAApg8LAkACQCADQYCAwP8HRw0AIAdBgIDA/wdHDQEgBkEDdEHwzQ5qKwMADwsCQAJAIAdBgIDA/wdGDQAgA0GAgIAgaiAHTw0BC0QYLURU+yH5PyAApg8LAkACQCAF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IQMCQAJAIAEgAHNBA3ENAAJAAkAgAEEDcQ0AIAAhAgwBCwJAIAINACAAIQIMAQsgACECA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgJBA3FFDQEgAiADSQ0ACwsCQCADQXxxIgRBwABJDQAgAiAEQUBqIgVLDQADQCACIAEoAgA2AgAgAiABKAIENgIEIAIgASgCCDYCCCACIAEoAgw2AgwgAiABKAIQNgIQIAIgASgCFDYCFCACIAEoAhg2AhggAiABKAIcNgIcIAIgASgCIDYCICACIAEoAiQ2AiQgAiABKAIoNgIoIAIgASgCLDYCLCACIAEoAjA2AjAgAiABKAI0NgI0IAIgASgCODYCOCACIAEoAjw2AjwgAUHAAGohASACQcAAaiICIAVNDQALCyACIARPDQEDQCACIAEoAgA2AgAgAUEEaiEBIAJBBGoiAiAESQ0ADAILAAsCQCADQQRPDQAgACECDAELAkAgA0F8aiIEIABPDQAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCwJAIAIgA08NAANAIAIgAS0AADoAACABQQFqIQEgAkEBaiICIANHDQALCyAAC/ICAgN/AX4CQCACRQ0AIAAgAToAACACIABqIgNBf2ogAToAACACQQNJDQAgACABOgACIAAgAToAASADQX1qIAE6AAAgA0F+aiABOgAAIAJBB0kNACAAIAE6AAMgA0F8aiABOgAAIAJBCUkNACAAQQAgAGtBA3EiBGoiAyABQf8BcUGBgoQIbCIBNgIAIAMgAiAEa0F8cSIEaiICQXxqIAE2AgAgBEEJSQ0AIAMgATYCCCADIAE2AgQgAkF4aiABNgIAIAJBdGogATYCACAEQRlJDQAgAyABNgIYIAMgATYCFCADIAE2AhAgAyABNgIMIAJBcGogATYCACACQWxqIAE2AgAgAkFoaiABNgIAIAJBZGogATYCACAEIANBBHFBGHIiBWsiAkEgSQ0AIAGtQoGAgIAQfiEGIAMgBWohAQNAIAEgBjcDGCABIAY3AxAgASAGNwMIIAEgBjcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACxAAIAGaIAEgABsQnQQgAaILFQEBfyMAQRBrIgEgADkD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BCACELUEDQEgAigCECEDCwJAIAMgAigCFCIFayABTw0AIAIgACABIAIoAiQRAQAPCwJAAkAgAigCUEEATg0AQQAhAwwBCyABIQQDQAJAIAQiAw0AQQAhAwwCCyAAIANBf2oiBGotAABBCkcNAAsgAiAAIAMgAigCJBEBACIEIANJDQEgACADaiEAIAEgA2shASACKAIUIQULIAUgACABEJoEGiACIAIoAhQgAWo2AhQgAyABaiEECyAEC1sBAn8gAiABbCEEAkACQCADKAJMQX9KDQAgACAEIAMQwgQhAAwBCyADEJMEIQUgACAEIAMQwgQhACAFRQ0AIAMQlAQLAkAgACAERw0AIAJBACABGw8LIAAgAW4LBwAgABDFBAtaAQF/AkACQCAAKAJMIgFBAEgNACABRQ0BIAFB/////3txEOkEKAIQRw0BCwJAIAAoAgQiASAAKAIIRg0AIAAgAUEBajYCBCABLQAADwsgABCpBA8LIAAQxgQLYwECfwJAIABBzABqIgEQxwRFDQAgABCTBBoLAkACQCAAKAIEIgIgACgCCEYNACAAIAJBAWo2AgQgAi0AACEADAELIAAQqQQhAAsCQCABEMgEQYCAgIAEcUUNACABEMkECyAACxsBAX8gACAAKAIAIgFB/////wMgARs2AgAgAQsUAQF/IAAoAgAhASAAQQA2AgAgAQsKACAAQQEQ1QQaCx4BAX9BASEBAkAgABDLBA0AIAAQzQRBAEchAQsgAQsOACAAQSByQZ9/akEaSQsOACAAQSBJIABB/wBGcgsKACAAQVBqQQpJCwsAIABBX2pB3gBJCwsAIABBn39qQRpJCxUAAkAgABDOBA0AQQAPCyAAEMoERQsQACAAQSBGIABBd2pBBUlyCwsAIABBv39qQRpJCxcAIABBIHJBn39qQQZJIAAQzQRBAEdyCwkAIAAgARDrBAsEAEEACwIACwIACwYAQcD1DgsyAQF/IwBBEGsiAUQAAAAAAADwv0QAAAAAAADwPyAAGzkDCCABKwMIRAAAAAAAAAAAowsMACAAIAChIgAgAKML0gQDAn4GfAF/AkAgAL0iAUKAgICAgICAiUB8Qv//////n8IBVg0AAkAgAUKAgICAgICA+D9SDQBEAAAAAAAAAAAPCyAARAAAAAAAAPC/oCIAIAAgAEQAAAAAAACgQaIiA6Ag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ACgCLCICa6x8IQQCQAJAAkAgACkDcCIFUA0AIAQgBVkNAQsgABCpBCICQX9KDQEgACgCBCEBIAAoAiwhAgsgAEJ/NwNwIAAgATYCaCAAIAQgAiABa6x8NwN4QX8PCyAEQgF8IQQgACgCBCEBIAAoAgghAwJAIAApA3AiBUIAUQ0AIAUgBH0iBSADIAFrrFkNACABIAWnaiEDCyAAIAM2AmggACAEIAAoAiwiAyABa6x8NwN4AkAgASADSw0AIAFBf2ogAjoAAAsgAgs1ACAAIAE3AwAgACAEQjCIp0GAgAJxIAJCMIinQf//AXFyrUIwhiACQv///////z+DhDcDCAvnAgEBfyMAQdAAayIEJAACQAJAIANBgIABSA0AIARBIGogASACQgBCgICAgICAgP//ABC+BSAEQSBqQQhqKQMAIQIgBCkDICEBAkAgA0H//wFPDQAgA0GBgH9qIQMMAgsgBEEQaiABIAJCAEKAgICAgICA//8AEL4FIANB/f8CIANB/f8CSBtBgoB+aiEDIARBEGpBCGopAwAhAiAEKQMQIQEMAQsgA0GBgH9KDQAgBEHAAGogASACQgBCgICAgICAgDkQvgUgBEHAAGpBCGopAwAhAiAEKQNAIQECQCADQfSAfk0NACADQY3/AGohAwwBCyAEQTBqIAEgAkIAQoCAgICAgIA5EL4FIANB6IF9IANB6IF9ShtBmv4BaiEDIARBMGpBCGopAwAhAiAEKQMwIQELIAQgASACQgAgA0H//wBqrUIwhhC+BSAAIARBCGopAwA3AwggACAEKQMANwMAIARB0ABqJAALSwIBfgJ/IAFC////////P4MhAgJAAkAgAUIwiKdB//8BcSIDQf//AUYNAEEEIQQgAw0BQQJBAyACIACEUBsPCyACIACEUCEECyAEC9sGAgR/A34jAEGAAWsiBSQAAkACQAJAIAMgBEIAQgAQtAVFDQAgAyAEEIkFIQYgAkIwiKciB0H//wFxIghB//8BRg0AIAYNAQsgBUEQaiABIAIgAyAEEL4FIAUgBSkDECIEIAVBEGpBCGopAwAiAyAEIAMQtgUgBUEIaikDACECIAUpAwAhBAwBCwJAIAEgCK1CMIYgAkL///////8/g4QiCSADIARCMIinQf//AXEiBq1CMIYgBEL///////8/g4QiChC0BUEASg0AAkAgASAJIAMgChC0BUUNACABIQQMAgsgBUHwAGogASACQgBCABC+BSAFQfgAaikDACECIAUpA3AhBAwBCwJAAkAgCEUNACABIQQMAQsgBUHgAGogASAJQgBCgICAgICAwLvAABC+BSAFQegAaikDACIJQjCIp0GIf2ohCCAFKQNgIQQLAkAgBg0AIAVB0ABqIAMgCkIAQoCAgICAgMC7wAAQvgUgBUHYAGopAwAiCkIwiKdBiH9qIQYgBSkDUCEDCyAKQv///////z+DQoCAgICAgMAAhCELIAlC////////P4NCgICAgICAwACEIQkCQCAIIAZMDQADQAJAAkAgCSALfSAEIANUrX0iCkIAUw0AAkAgCiAEIAN9IgSEQgBSDQAgBUEgaiABIAJCAEIAEL4FIAVBKGopAwAhAiAFKQMgIQQMBQsgCkIBhiAEQj+IhCEJDAELIAlCAYYgBEI/iIQhCQsgBEIBhiEEIAhBf2oiCCAGSg0ACyAGIQgLAkACQCAJIAt9IAQgA1StfSIKQgBZDQAgCSEKDAELIAogBCADfSIEhEIAUg0AIAVBMGogASACQgBCABC+BSAFQThqKQMAIQIgBSkDMCEEDAELAkAgCkL///////8/Vg0AA0AgBEI/iCEDIAhBf2ohCCAEQgGGIQQgAyAKQgGGhCIKQoCAgICAgMAAVA0ACwsgB0GAgAJxIQYCQCAIQQBKDQAgBUHAAGogBCAKQv///////z+DIAhB+ABqIAZyrUIwhoRCAEKAgICAgIDAwz8QvgUgBUHIAGopAwAhAiAFKQNAIQQMAQsgCkL///////8/gyAIIAZyrUIwhoQhAgsgACAENwMAIAAgAjcDCCAFQYABaiQACxwAIAAgAkL///////////8AgzcDCCAAIAE3AwALjgkCBn8DfiMAQTBrIgQkAEIAIQoCQAJAIAJBAksNACABQQRqIQUgAkECdCICQfzZD2ooAgAhBiACQfDZD2ooAgAhBwNAAkACQCABKAIEIgIgASgCaEYNACAFIAJBAWo2AgAgAi0AACECDAELIAEQhgUhAgsgAhDRBA0AC0EBIQgCQAJAIAJBVWoOAwABAAELQX9BASACQS1GGyEIAkAgASgCBCICIAEoAmhGDQAgBSACQQFqNgIAIAItAAAhAgwBCyABEIYFIQILQQAhCQJAAkACQANAIAJB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AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKwMAOQMADwsgACACIAMRAwALCz4BAX8CQCAAUA0AA0AgAUF/aiIBIACnQQ9xQeDdD2otAAAgAnI6AAAgAEIPViEDIABCBIghACADDQALCyABCzYBAX8CQCAAUA0AA0AgAUF/aiIBIACnQQdxQTByOgAAIABCB1YhAiAAQgOIIQAgAg0ACwsgAQuIAQIBfgN/AkACQCAAQoCAgIAQWg0AIAAhAgwBCwNAIAFBf2oiASAAIABCCoAiAkIKfn2nQTByOgAAIABC/////58BViEDIAIhACADDQALCwJAIAKnIgNFDQADQCABQX9qIgEgAyADQQpuIgRBCmxrQTByOgAAIANBCUshBSAEIQMgBQ0ACwsgAQtzAQF/IwBBgAJrIgUkAAJAIAIgA0wNACAEQYDABHENACAFIAFB/wFxIAIgA2siA0GAAiADQYACSSICGxCbBBoCQCACDQADQCAAIAVBgAIQmgUgA0GAfmoiA0H/AUsNAAsLIAAgBSADEJoFCyAFQYACaiQACxEAIAAgASACQfYAQfcAEJgFC7IZAxJ/An4BfCMAQbAEayIGJABBACEHIAZBADYCLAJAAkAgARCkBSIYQn9VDQBBASEIQZoJIQkgAZoiARCkBSEYDAELAkAgBEGAEHFFDQBBASEIQZ0JIQkMAQtBoAlBmwkgBEEBcSIIGyEJIAhFIQcLAkACQCAYQoCAgICAgID4/wCDQoCAgICAgID4/wBSDQAgAEEgIAIgCEEDaiIKIARB//97cRCgBSAAIAkgCBCaBSAAQZcYQdLRACAFQSBxIgsbQdQfQdzRACALGyABIAFiG0EDEJoFIABBICACIAogBEGAwABzEKAFIAogAiAKIAJKGyEMDAELIAZBEGohDQJAAkACQAJAIAEgBkEsahDBBCIBIAGgIgFEAAAAAAAAAABhDQAgBiAGKAIsIgpBf2o2AiwgBUEgciIOQeEARw0BDAMLIAVBIHIiDkHhAEYNAkEGIAMgA0EASBshDyAGKAIsIRAMAQsgBiAKQWNqIhA2AixBBiADIANBAEgbIQ8gAUQAAAAAAACwQaIhAQsgBkEwakEAQaACIBBBAEgbaiIRIQsDQAJAAkAgAUQAAAAAAADwQWMgAUQAAAAAAAAAAGZxRQ0AIAGrIQoMAQtBACEKCyALIAo2AgAgC0EEaiELIAEgCrihRAAAAABlzc1BoiIBRAAAAAAAAAAAYg0ACwJAAkAgEEEBTg0AIBAhAyALIQogESESDAELIBEhEiAQIQMDQCADQR0gA0EdSBshAwJAIAtBfGoiCiASSQ0AIAOtIRlCACEYA0AgCiAKNQIAIBmGIBhC/////w+DfCIYIBhCgJTr3AOAIhhCgJTr3AN+fT4CACAKQXxqIgogEk8NAAsgGKciCkUNACASQXxqIhIgCjYCAAsCQANAIAsiCiASTQ0BIApBfGoiCygCAEUNAAsLIAYgBigCLCADayIDNgIsIAohCyADQQBKDQALCwJAIANBf0oNACAPQRlqQQluQQFqIRMgDkHmAEYhFANAQQAgA2siC0EJIAtBCUgbIRUCQAJAIBIgCkkNACASKAIAIQsMAQtBgJTr3AMgFXYhFkF/IBV0QX9zIRdBACEDIBIhCwNAIAsgCygCACIMIBV2IANqNgIAIAwgF3EgFmwhAyALQQRqIgsgCkkNAAsgEigCACELIANFDQAgCiADNgIAIApBBGohCgsgBiAGKAIsIBVqIgM2AiwgESASIAtFQQJ0aiISIBQbIgsgE0ECdGogCiAKIAtrQQJ1IBNKGyEKIANBAEgNAAsLQQAhAwJAIBIgCk8NACARIBJrQQJ1QQlsIQNBCiELIBIoAgAiDEEKSQ0AA0AgA0EBaiEDIAwgC0EKbCILTw0ACwsCQCAPQQAgAyAOQeYARhtrIA9BAEcgDkHnAEZxayILIAogEWtBAnVBCWxBd2pODQAgC0GAyABqIgxBCW0iFkECdCAGQTBqQQRBpAIgEEEASBtqakGAYGohFUEKIQsCQCAMIBZBCWxrIgxBB0oNAANAIAtBCmwhCyAMQQFqIgxBCEcNAAsLIBVBBGohFwJAAkAgFSgCACIMIAwgC24iEyALbGsiFg0AIBcgCkYNAQsCQAJAIBNBAXENAEQAAAAAAABAQyEBIAtBgJTr3ANHDQEgFSASTQ0BIBVBfGotAABBAXFFDQELRAEAAAAAAEBDIQELRAAAAAAAAOA/RAAAAAAAAPA/RAAAAAAAAPg/IBcgCkYbRAAAAAAAAPg/IBYgC0EBdiIXRhsgFiAXSRshGgJAIAcNACAJLQAAQS1HDQAgGpohGiABmiEBCyAVIAwgFmsiDDYCACABIBqgIAFhDQAgFSAMIAtqIgs2AgACQCALQYCU69wDSQ0AA0AgFUEANgIAAkAgFUF8aiIVIBJPDQAgEkF8aiISQQA2AgALIBUgFSgCAEEBaiILNgIAIAtB/5Pr3ANLDQALCyARIBJrQQJ1QQlsIQNBCiELIBIoAgAiDEEKSQ0AA0AgA0EBaiEDIAwgC0EKbCILTw0ACwsgFUEEaiILIAogCiALSxshCgsCQANAIAoiCyASTSIMDQEgC0F8aiIKKAIARQ0ACwsCQAJAIA5B5wBGDQAgBEEIcSEVDAELIANBf3NBfyAPQQEgDxsiCiADSiADQXtKcSIVGyAKaiEPQX9BfiAVGyAFaiEFIARBCHEiFQ0AQXchCgJAIAwNACALQXxqKAIAIhVFDQBBCiEMQQAhCiAVQQpwDQADQCAKIhZBAWohCiAVIAxBCmwiDHBFDQALIBZBf3MhCgsgCyARa0ECdUEJbCEMAkAgBUFfcUHGAEcNAEEAIRUgDyAMIApqQXdqIgpBACAKQQBKGyIKIA8gCkgbIQ8MAQtBACEVIA8gAyAMaiAKakF3aiIKQQAgCkEAShsiCiAPIApIGyEPC0F/IQwgD0H9////B0H+////ByAPIBVyIhYbSg0BIA8gFkEAR2pBAWohFwJAAkAgBUFfcSIUQcYARw0AIAMgF0H/////B3NKDQMgA0EAIANBAEobIQoMAQsCQCANIAMgA0EfdSIKcyAKa60gDRCfBSIKa0EBSg0AA0AgCkF/aiIKQTA6AAAgDSAKa0ECSA0ACwsgCkF+aiITIAU6AABBfyEMIApBf2pBLUErIANBAEgbOgAAIA0gE2siCiAXQf////8Hc0oNAgtBfyEMIAogF2oiCiAIQf////8Hc0oNASAAQSAgAiAKIAhqIhcgBBCgBSAAIAkgCBCaBSAAQTAgAiAXIARBgIAEcxCgBQJAAkACQAJAIBRBxgBHDQAgBkEQakEIciEVIAZBEGpBCXIhAyARIBIgEiARSxsiDCESA0AgEjUCACADEJ8FIQoCQAJAIBIgDEYNACAKIAZBEGpNDQEDQCAKQX9qIgpBMDoAACAKIAZBEGpLDQAMAgsACyAKIANHDQAgBkEwOgAYIBUhCgsgACAKIAMgCmsQmgUgEkEEaiISIBFNDQALAkAgFkUNACAAQZXTAEEBEJoFCyASIAtPDQEgD0EBSA0BA0ACQCASNQIAIAMQnwUiCiAGQRBqTQ0AA0AgCkF/aiIKQTA6AAAgCiAGQRBqSw0ACwsgACAKIA9BCSAPQQlIGxCaBSAPQXdqIQogEkEEaiISIAtPDQMgD0EJSiEMIAohDyAMDQAMAwsACwJAIA9BAEgNACALIBJBBGogCyASSxshFiAGQRBqQQhyIREgBkEQakEJciEDIBIhCwNAAkAgCzUCACADEJ8FIgogA0cNACAGQTA6ABggESEKCwJAAkAgCyASRg0AIAogBkEQak0NAQNAIApBf2oiCkEwOgAAIAogBkEQaksNAAwCCwALIAAgCkEBEJoFIApBAWohCiAPIBVyRQ0AIABBldMAQQEQmgULIAAgCiAPIAMgCmsiDCAPIAxIGxCaBSAPIAxrIQ8gC0EEaiILIBZPDQEgD0F/Sg0ACwsgAEEwIA9BEmpBEkEAEKAFIAAgEyANIBNrEJoFDAILIA8hCgsgAEEwIApBCWpBCUEAEKAFCyAAQSAgAiAXIARBgMAAcxCgBSAXIAIgFyACShshDAwBCyAJIAVBGnRBH3VBCXFqIRcCQCADQQtLDQBBDCADayEKRAAAAAAAADBAIRoDQCAaRAAAAAAAADBAoiEaIApBf2oiCg0ACwJAIBctAABBLUcNACAaIAGaIBqhoJohAQwBCyABIBqgIBqhIQELAkAgBigCLCIKIApBH3UiCnMgCmutIA0QnwUiCiANRw0AIAZBMDoADyAGQQ9qIQoLIAhBAnIhFSAFQSBxIRIgBigCLCELIApBfmoiFiAFQQ9qOgAAIApBf2pBLUErIAtBAEgbOgAAIARBCHEhDCAGQRBqIQsDQCALIQoCQAJAIAGZRAAAAAAAAOBBY0UNACABqiELDAELQYCAgIB4IQsLIAogC0Hg3Q9qLQAAIBJyOgAAIAEgC7ehRAAAAAAAADBAoiEBAkAgCkEBaiILIAZBEGprQQFHDQACQCAMDQAgA0EASg0AIAFEAAAAAAAAAABhDQELIApBLjoAASAKQQJqIQsLIAFEAAAAAAAAAABiDQALQX8hDEH9////ByAVIA0gFmsiE2oiCmsgA0gNAAJAAkAgA0UNACALIAZBEGprIhJBfmogA04NACADQQJqIQsMAQsgCyAGQRBqayISIQsLIABBICACIAogC2oiCiAEEKAFIAAgFyAVEJoFIABBMCACIAogBEGAgARzEKAFIAAgBkEQaiASEJoFIABBMCALIBJrQQBBABCgBSAAIBYgExCaBSAAQSAgAiAKIARBgMAAcxCgBSAKIAIgCiACShshDAsgBkGwBGokACAMCy4BAX8gASABKAIAQQdqQXhxIgJBEGo2AgAgACACKQMAIAJBCGopAwAQwQU5AwALBQAgAL0LDwAgACABIAJBAEEAEJgFC54BAQJ/IwBBoAFrIgQkAEF/IQUgBCABQX9qQQAgARs2ApQBIAQgACAEQZ4BaiABGyIANgKQASAEQQBBkAEQmwQiBEF/NgJMIARB+AA2AiQgBEF/NgJQIAQgBEGfAWo2AiwgBCAEQZABajYCVAJAAkAgAUF/Sg0AEIoEQT02AgAMAQsgAEEAOgAAIAQgAiADEKEFIQULIARBoAFqJAAgBQuxAQEEfwJAIAAoAlQiAygCBCIEIAAoAhQgACgCHCIFayIGIAQgBkkbIgZFDQAgAygCACAFIAYQmgQaIAMgAygCACAGajYCACADIAMoAgQgBmsiBDYCBAsgAygCACEGAkAgBCACIAQgAkkbIgRFDQAgBiABIAQQmgQaIAMgAygCACAEaiIGNgIAIAMgAygCBCAEazYCBAsgBkEAOgAAIAAgACgCLCIDNgIcIAAgAzYCFCACCxYAAkAgAA0AQQAPCxCKBCAANgIAQX8LowIBAX9BASEDAkACQCAARQ0AIAFB/wBNDQECQAJAEOkEKAJYKAIADQAgAUGAf3FBgL8DRg0DEIoEQRk2AgAMAQsCQCABQf8PSw0AIAAgAUE/cUGAAXI6AAEgACABQQZ2QcABcjoAAEECDwsCQAJAIAFBgLADSQ0AIAFBgEBxQYDAA0cNAQsgACABQT9xQYABcjoAAiAAIAFBDHZB4AFyOgAAIAAgAUEGdkE/cUGAAXI6AAFBAw8LAkAgAUGAgHxqQf//P0sNACAAIAFBP3FBgAFyOgADIAAgAUESdkHwAXI6AAAgACABQQZ2QT9xQYABcjoAAiAAIAFBDHZBP3FBgAFyOgABQQQPCxCKBEEZNgIAC0F/IQMLIAMPCyAAIAE6AABBAQsVAAJAIAANAEEADwsgACABQQAQqQUL8y8BC38jAEEQayIBJAACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAEH0AUsNAAJAQQAoApj6HyICQRAgAEELakF4cSAAQQtJGyIDQQN2IgR2IgBBA3FFDQACQAJAIABBf3NBAXEgBGoiBUEDdCIEQcD6H2oiACAEQcj6H2ooAgAiBCgCCCIDRw0AQQAgAkF+IAV3cTYCmPofDAELIAMgADYCDCAAIAM2AggLIARBCGohACAEIAVBA3QiBUEDcjYCBCAEIAVqIgQgBCgCBEEBcjYCBAwMCyADQQAoAqD6HyIGTQ0BAkAgAEUNAAJAAkAgACAEdEECIAR0IgBBACAAa3JxIgBBACAAa3FBf2oiACAAQQx2QRBxIgB2IgRBBXZBCHEiBSAAciAEIAV2IgBBAnZBBHEiBHIgACAEdiIAQQF2QQJxIgRyIAAgBHYiAEEBdkEBcSIEciAAIAR2aiIEQQN0IgBBwPofaiIFIABByPofaigCACIAKAIIIgdHDQBBACACQX4gBHdxIgI2Apj6HwwBCyAHIAU2AgwgBSAHNgIICyAAIANBA3I2AgQgACADaiIHIARBA3QiBCADayIFQQFyNgIEIAAgBGogBTYCAAJAIAZFDQAgBkF4cUHA+h9qIQNBACgCrPofIQQCQAJAIAJBASAGQQN2dCIIcQ0AQQAgAiAIcjYCmPofIAMhCAwBCyADKAIIIQgLIAMgBDYCCCAIIAQ2AgwgBCADNgIMIAQgCDYCCAsgAEEIaiEAQQAgBzYCrPofQQAgBTYCoPofDAwLQQAoApz6HyIJRQ0BIAlBACAJa3FBf2oiACAAQQx2QRBxIgB2IgRBBXZBCHEiBSAAciAEIAV2IgBBAnZBBHEiBHIgACAEdiIAQQF2QQJxIgRyIAAgBHYiAEEBdkEBcSIEciAAIAR2akECdEHI/B9qKAIAIgcoAgRBeHEgA2shBCAHIQUCQANAAkAgBSgCECIADQAgBUEUaigCACIARQ0CCyAAKAIEQXhxIANrIgUgBCAFIARJIgUbIQQgACAHIAUbIQcgACEFDAALAAsgBygCGCEKAkAgBygCDCIIIAdGDQAgBygCCCIAQQAoAqj6H0kaIAAgCDYCDCAIIAA2AggMCwsCQCAHQRRqIgUoAgAiAA0AIAcoAhAiAEUNAyAHQRBqIQULA0AgBSELIAAiCEEUaiIFKAIAIgANACAIQRBqIQUgCCgCECIADQALIAtBADYCAAwKC0F/IQMgAEG/f0sNACAAQQtqIgBBeHEhA0EAKAKc+h8iBkUNAEEAIQsCQCADQYACSQ0AQR8hCyADQf///wdLDQAgAEEIdiIAIABBgP4/akEQdkEIcSIAdCIEIARBgOAfakEQdkEEcSIEdCIFIAVBgIAPakEQdkECcSIFdEEPdiAAIARyIAVyayIAQQF0IAMgAEEVanZBAXFyQRxqIQsLQQAgA2shBAJAAkACQAJAIAtBAnRByPwfaigCACIFDQBBACEAQQAhCAwBC0EAIQAgA0EAQRkgC0EBdmsgC0EfRht0IQdBACEIA0ACQCAFKAIEQXhxIANrIgIgBE8NACACIQQgBSEIIAINAEEAIQQgBSEIIAUhAAwDCyAAIAVBFGooAgAiAiACIAUgB0EddkEEcWpBEGooAgAiBUYbIAAgAhshACAHQQF0IQcgBQ0ACwsCQCAAIAhyDQBBACEIQQIgC3QiAEEAIABrciAGcSIARQ0DIABBACAAa3FBf2oiACAAQQx2QRBxIgB2IgVBBXZBCHEiByAAciAFIAd2IgBBAnZBBHEiBXIgACAFdiIAQQF2QQJxIgVyIAAgBXYiAEEBdkEBcSIFciAAIAV2akECdEHI/B9qKAIAIQALIABFDQELA0AgACgCBEF4cSADayICIARJIQcCQCAAKAIQIgUNACAAQRRqKAIAIQULIAIgBCAHGyEEIAAgCCAHGyEIIAUhACAFDQALCyAIRQ0AIARBACgCoPofIANrTw0AIAgoAhghCwJAIAgoAgwiByAIRg0AIAgoAggiAEEAKAKo+h9JGiAAIAc2AgwgByAANgIIDAkLAkAgCEEUaiIFKAIAIgANACAIKAIQIgBFDQMgCEEQaiEFCwNAIAUhAiAAIgdBFGoiBSgCACIADQAgB0EQaiEFIAcoAhAiAA0ACyACQQA2AgAMCAsCQEEAKAKg+h8iACADSQ0AQQAoAqz6HyEEAkACQCAAIANrIgVBEEkNAEEAIAU2AqD6H0EAIAQgA2oiBzYCrPofIAcgBUEBcjYCBCAEIABqIAU2AgAgBCADQQNyNgIEDAELQQBBADYCrPofQQBBADYCoPofIAQgAEEDcjYCBCAEIABqIgAgACgCBEEBcjYCBAsgBEEIaiEADAoLAkBBACgCpPofIgcgA00NAEEAIAcgA2siBDYCpPofQQBBACgCsPofIgAgA2oiBTYCsPofIAUgBEEBcjYCBCAAIANBA3I2AgQgAEEIaiEADAoLAkACQEEAKALw/R9FDQBBACgC+P0fIQQMAQtBAEJ/NwL8/R9BAEKAoICAgIAENwL0/R9BACABQQxqQXBxQdiq1aoFczYC8P0fQQBBADYChP4fQQBBADYC1P0fQYAgIQQLQQAhACAEIANBL2oiBmoiAkEAIARrIgtxIgggA00NCUEAIQACQEEAKALQ/R8iBEUNAEEAKALI/R8iBSAIaiIJIAVNDQogCSAESw0KC0EALQDU/R9BBHENBAJAAkACQEEAKAKw+h8iBEUNAEHY/R8hAANAAkAgACgCACIFIARLDQAgBSAAKAIEaiAESw0DCyAAKAIIIgANAAsLQQAQsQUiB0F/Rg0FIAghAgJAQQAoAvT9HyIAQX9qIgQgB3FFDQAgCCAHayAEIAdqQQAgAGtxaiECCyACIANNDQUgAkH+////B0sNBQJAQQAoAtD9HyIARQ0AQQAoAsj9HyIEIAJqIgUgBE0NBiAFIABLDQYLIAIQsQUiACAHRw0BDAcLIAIgB2sgC3EiAkH+////B0sNBCACELEFIgcgACgCACAAKAIEakYNAyAHIQALAkAgAEF/Rg0AIANBMGogAk0NAAJAIAYgAmtBACgC+P0fIgRqQQAgBGtxIgRB/v///wdNDQAgACEHDAcLAkAgBBCxBUF/Rg0AIAQgAmohAiAAIQcMBwtBACACaxCxBRoMBAsgACEHIABBf0cNBQwDC0EAIQgMBwtBACEHDAULIAdBf0cNAgtBAEEAKALU/R9BBHI2AtT9HwsgCEH+////B0sNASAIELEFIQdBABCxBSEAIAdBf0YNASAAQX9GDQEgByAATw0BIAAgB2siAiADQShqTQ0BC0EAQQAoAsj9HyACaiIANgLI/R8CQCAAQQAoAsz9H00NAEEAIAA2Asz9HwsCQAJAAkACQEEAKAKw+h8iBEUNAEHY/R8hAANAIAcgACgCACIFIAAoAgQiCGpGDQIgACgCCCIADQAMAwsACwJAAkBBACgCqPofIgBFDQAgByAATw0BC0EAIAc2Aqj6HwtBACEAQQAgAjYC3P0fQQAgBzYC2P0fQQBBfzYCuPofQQBBACgC8P0fNgK8+h9BAEEANgLk/R8DQCAAQQN0IgRByPofaiAEQcD6H2oiBTYCACAEQcz6H2ogBTYCACAAQQFqIgBBIEcNAAtBACACQVhqIgBBeCAHa0EHcUEAIAdBCGpBB3EbIgRrIgU2AqT6H0EAIAcgBGoiBDYCsPofIAQgBUEBcjYCBCAHIABqQSg2AgRBAEEAKAKA/h82ArT6HwwCCyAALQAMQQhxDQAgBCAFSQ0AIAQgB08NACAAIAggAmo2AgRBACAEQXggBGtBB3FBACAEQQhqQQdxGyIAaiIFNgKw+h9BAEEAKAKk+h8gAmoiByAAayIANgKk+h8gBSAAQQFyNgIEIAQgB2pBKDYCBEEAQQAoAoD+HzYCtPofDAELAkAgB0EAKAKo+h8iCE8NAEEAIAc2Aqj6HyAHIQgLIAcgAmohBUHY/R8hAAJAAkACQAJAAkACQAJAA0AgACgCACAFRg0BIAAoAggiAA0ADAILAAsgAC0ADEEIcUUNAQtB2P0fIQADQAJAIAAoAgAiBSAESw0AIAUgACgCBGoiBSAESw0DCyAAKAIIIQAMAAsACyAAIAc2AgAgACAAKAIEIAJqNgIEIAdBeCAHa0EHcUEAIAdBCGpBB3EbaiILIANBA3I2AgQgBUF4IAVrQQdxQQAgBUEIakEHcRtqIgIgCyADaiIDayEAAkAgAiAERw0AQQAgAzYCsPofQQBBACgCpPofIABqIgA2AqT6HyADIABBAXI2AgQMAwsCQCACQQAoAqz6H0cNAEEAIAM2Aqz6H0EAQQAoAqD6HyAAaiIANgKg+h8gAyAAQQFyNgIEIAMgAGogADYCAAwDCwJAIAIoAgQiBEEDcUEBRw0AIARBeHEhBgJAAkAgBEH/AUsNACACKAIIIgUgBEEDdiIIQQN0QcD6H2oiB0YaAkAgAigCDCIEIAVHDQBBAEEAKAKY+h9BfiAId3E2Apj6HwwCCyAEIAdGGiAFIAQ2AgwgBCAFNgIIDAELIAIoAhghCQJAAkAgAigCDCIHIAJGDQAgAigCCCIEIAhJGiAEIAc2AgwgByAENgIIDAELAkAgAkEUaiIEKAIAIgUNACACQRBqIgQoAgAiBQ0AQQAhBwwBCwNAIAQhCCAFIgdBFGoiBCgCACIFDQAgB0EQaiEEIAcoAhAiBQ0ACyAIQQA2AgALIAlFDQACQAJAIAIgAigCHCIFQQJ0Qcj8H2oiBCgCAEcNACAEIAc2AgAgBw0BQQBBACgCnPofQX4gBXdxNgKc+h8MAgsgCUEQQRQgCSgCECACRhtqIAc2AgAgB0UNAQsgByAJNgIYAkAgAigCECIERQ0AIAcgBDYCECAEIAc2AhgLIAIoAhQiBEUNACAHQRRqIAQ2AgAgBCAHNgIYCyAGIABqIQAgAiAGaiICKAIEIQQLIAIgBEF+cTYCBCADIABBAXI2AgQgAyAAaiAANgIAAkAgAEH/AUsNACAAQXhxQcD6H2ohBAJAAkBBACgCmPofIgVBASAAQQN2dCIAcQ0AQQAgBSAAcjYCmPofIAQhAAwBCyAEKAIIIQALIAQgAzYCCCAAIAM2AgwgAyAENgIMIAMgADYCCAwDC0EfIQQCQCAAQf///wdLDQAgAEEIdiIEIARBgP4/akEQdkEIcSIEdCIFIAVBgOAfakEQdkEEcSIFdCIHIAdBgIAPakEQdkECcSIHdEEPdiAEIAVyIAdyayIEQQF0IAAgBEEVanZBAXFyQRxqIQQLIAMgBDYCHCADQgA3AhAgBEECdEHI/B9qIQUCQAJAQQAoApz6HyIHQQEgBHQiCHENAEEAIAcgCHI2Apz6HyAFIAM2AgAgAyAFNgIYDAELIABBAEEZIARBAXZrIARBH0YbdCEEIAUoAgAhBwNAIAciBSgCBEF4cSAARg0DIARBHXYhByAEQQF0IQQgBSAHQQRxakEQaiIIKAIAIgcNAAsgCCADNgIAIAMgBTYCGAsgAyADNgIMIAMgAzYCCAwCC0EAIAJBWGoiAEF4IAdrQQdxQQAgB0EIakEHcRsiCGsiCzYCpPofQQAgByAIaiIINgKw+h8gCCALQQFyNgIEIAcgAGpBKDYCBEEAQQAoAoD+HzYCtPofIAQgBUEnIAVrQQdxQQAgBUFZakEHcRtqQVFqIgAgACAEQRBqSRsiCEEbNgIEIAhBEGpBACkC4P0fNwIAIAhBACkC2P0fNwIIQQAgCEEIajYC4P0fQQAgAjYC3P0fQQAgBzYC2P0fQQBBADYC5P0fIAhBGGohAANAIABBBzYCBCAAQQhqIQcgAEEEaiEAIAcgBUkNAAsgCCAERg0DIAggCCgCBEF+cTYCBCAEIAggBGsiB0EBcjYCBCAIIAc2AgACQCAHQf8BSw0AIAdBeHFBwPofaiEAAkACQEEAKAKY+h8iBUEBIAdBA3Z0IgdxDQBBACAFIAdyNgKY+h8gACEFDAELIAAoAgghBQsgACAENgIIIAUgBDYCDCAEIAA2AgwgBCAFNgIIDAQLQR8hAAJAIAdB////B0sNACAHQQh2IgAgAEGA/j9qQRB2QQhxIgB0IgUgBUGA4B9qQRB2QQRxIgV0IgggCEGAgA9qQRB2QQJxIgh0QQ92IAAgBXIgCHJrIgBBAXQgByAAQRVqdkEBcXJBHGohAAsgBCAANgIcIARCADcCECAAQQJ0Qcj8H2ohBQJAAkBBACgCnPofIghBASAAdCICcQ0AQQAgCCACcjYCnPofIAUgBDYCACAEIAU2AhgMAQsgB0EAQRkgAEEBdmsgAEEfRht0IQAgBSgCACEIA0AgCCIFKAIEQXhxIAdGDQQgAEEddiEIIABBAXQhACAFIAhBBHFqQRBqIgIoAgAiCA0ACyACIAQ2AgAgBCAFNgIYCyAEIAQ2AgwgBCAENgIIDAMLIAUoAggiACADNgIMIAUgAzYCCCADQQA2AhggAyAFNgIMIAMgADYCCAsgC0EIaiEADAULIAUoAggiACAENgIMIAUgBDYCCCAEQQA2AhggBCAFNgIMIAQgADYCCAtBACgCpPofIgAgA00NAEEAIAAgA2siBDYCpPofQQBBACgCsPofIgAgA2oiBTYCsPofIAUgBEEBcjYCBCAAIANBA3I2AgQgAEEIaiEADAMLEIoEQTA2AgBBACEADAILAkAgC0UNAAJAAkAgCCAIKAIcIgVBAnRByPwfaiIAKAIARw0AIAAgBzYCACAHDQFBACAGQX4gBXdxIgY2Apz6HwwCCyALQRBBFCALKAIQIAhGG2ogBzYCACAHRQ0BCyAHIAs2AhgCQCAIKAIQIgBFDQAgByAANgIQIAAgBzYCGAsgCEEUaigCACIARQ0AIAdBFGogADYCACAAIAc2AhgLAkACQCAEQQ9LDQAgCCAEIANqIgBBA3I2AgQgCCAAaiIAIAAoAgRBAXI2AgQMAQsgCCADQQNyNgIEIAggA2oiByAEQQFyNgIEIAcgBGogBDYCAAJAIARB/wFLDQAgBEF4cUHA+h9qIQACQAJAQQAoApj6HyIFQQEgBEEDdnQiBHENAEEAIAUgBHI2Apj6HyAAIQQMAQsgACgCCCEECyAAIAc2AgggBCAHNgIMIAcgADYCDCAHIAQ2AggMAQtBHyEAAkAgBEH///8HSw0AIARBCHYiACAAQYD+P2pBEHZBCHEiAHQiBSAFQYDgH2pBEHZBBHEiBXQiAyADQYCAD2pBEHZBAnEiA3RBD3YgACAFciADcmsiAEEBdCAEIABBFWp2QQFxckEcaiEACyAHIAA2AhwgB0IANwIQIABBAnRByPwfaiEFAkACQAJAIAZBASAAdCIDcQ0AQQAgBiADcjYCnPofIAUgBzYCACAHIAU2AhgMAQsgBEEAQRkgAEEBdmsgAEEfRht0IQAgBSgCACEDA0AgAyIFKAIEQXhxIARGDQIgAEEddiEDIABBAXQhACAFIANBBHFqQRBqIgIoAgAiAw0ACyACIAc2AgAgByAFNgIYCyAHIAc2AgwgByAHNgIIDAELIAUoAggiACAHNgIMIAUgBzYCCCAHQQA2AhggByAFNgIMIAcgADYCCAsgCEEIaiEADAELAkAgCkUNAAJAAkAgByAHKAIcIgVBAnRByPwfaiIAKAIARw0AIAAgCDYCACAIDQFBACAJQX4gBXdxNgKc+h8MAgsgCkEQQRQgCigCECAHRhtqIAg2AgAgCEUNAQsgCCAKNgIYAkAgBygCECIARQ0AIAggADYCECAAIAg2AhgLIAdBFGooAgAiAEUNACAIQRRqIAA2AgAgACAINgIYCwJAAkAgBEEPSw0AIAcgBCADaiIAQQNyNgIEIAcgAGoiACAAKAIEQQFyNgIEDAELIAcgA0EDcjYCBCAHIANqIgUgBEEBcjYCBCAFIARqIAQ2AgACQCAGRQ0AIAZBeHFBwPofaiEDQQAoAqz6HyEAAkACQEEBIAZBA3Z0IgggAnENAEEAIAggAnI2Apj6HyADIQgMAQsgAygCCCEICyADIAA2AgggCCAANgIMIAAgAzYCDCAAIAg2AggLQQAgBTYCrPofQQAgBDYCoPofCyAHQQhqIQALIAFBEGokACAAC40NAQd/AkAgAEUNACAAQXhqIgEgAEF8aigCACICQXhxIgBqIQMCQCACQQFxDQAgAkEDcUUNASABIAEoAgAiAmsiAUEAKAKo+h8iBEkNASACIABqIQACQCABQQAoAqz6H0YNAAJAIAJB/wFLDQAgASgCCCIEIAJBA3YiBUEDdEHA+h9qIgZGGgJAIAEoAgwiAiAERw0AQQBBACgCmPofQX4gBXdxNgKY+h8MAwsgAiAGRhogBCACNgIMIAIgBDYCCAwCCyABKAIYIQcCQAJAIAEoAgwiBiABRg0AIAEoAggiAiAESRogAiAGNgIMIAYgAjYCCAwBCwJAIAFBFGoiAigCACIEDQAgAUEQaiICKAIAIgQNAEEAIQYMAQsDQCACIQUgBCIGQRRqIgIoAgAiBA0AIAZBEGohAiAGKAIQIgQNAAsgBUEANgIACyAHRQ0BAkACQCABIAEoAhwiBEECdEHI/B9qIgIoAgBHDQAgAiAGNgIAIAYNAUEAQQAoApz6H0F+IAR3cTYCnPofDAMLIAdBEEEUIAcoAhAgAUYbaiAGNgIAIAZFDQILIAYgBzYCGAJAIAEoAhAiAkUNACAGIAI2AhAgAiAGNgIYCyABKAIUIgJFDQEgBkEUaiACNgIAIAIgBjYCGAwBCyADKAIEIgJBA3FBA0cNAEEAIAA2AqD6HyADIAJBfnE2AgQgASAAQQFyNgIEIAEgAGogADYCAA8LIAEgA08NACADKAIEIgJBAXFFDQACQAJAIAJBAnENAAJAIANBACgCsPofRw0AQQAgATYCsPofQQBBACgCpPofIABqIgA2AqT6HyABIABBAXI2AgQgAUEAKAKs+h9HDQNBAEEANgKg+h9BAEEANgKs+h8PCwJAIANBACgCrPofRw0AQQAgATYCrPofQQBBACgCoPofIABqIgA2AqD6HyABIABBAXI2AgQgASAAaiAANgIADwsgAkF4cSAAaiEAAkACQCACQf8BSw0AIAMoAggiBCACQQN2IgVBA3RBwPofaiIGRhoCQCADKAIMIgIgBEcNAEEAQQAoApj6H0F+IAV3cTYCmPofDAILIAIgBkYaIAQgAjYCDCACIAQ2AggMAQsgAygCGCEHAkACQCADKAIMIgYgA0YNACADKAIIIgJBACgCqPofSRogAiAGNgIMIAYgAjYCCAwBCwJAIANBFGoiAigCACIEDQAgA0EQaiICKAIAIgQNAEEAIQYMAQsDQCACIQUgBCIGQRRqIgIoAgAiBA0AIAZBEGohAiAGKAIQIgQNAAsgBUEANgIACyAHRQ0AAkACQCADIAMoAhwiBEECdEHI/B9qIgIoAgBHDQAgAiAGNgIAIAYNAUEAQQAoApz6H0F+IAR3cTYCnPofDAILIAdBEEEUIAcoAhAgA0YbaiAGNgIAIAZFDQELIAYgBzYCGAJAIAMoAhAiAkUNACAGIAI2AhAgAiAGNgIYCyADKAIUIgJFDQAgBkEUaiACNgIAIAIgBjYCGAsgASAAQQFyNgIEIAEgAGogADYCACABQQAoAqz6H0cNAUEAIAA2AqD6Hw8LIAMgAkF+cTYCBCABIABBAXI2AgQgASAAaiAANgIACwJAIABB/wFLDQAgAEF4cUHA+h9qIQICQAJAQQAoApj6HyIEQQEgAEEDdnQiAHENAEEAIAQgAHI2Apj6HyACIQAMAQsgAigCCCEACyACIAE2AgggACABNgIMIAEgAjYCDCABIAA2AggPC0EfIQICQCAAQf///wdLDQAgAEEIdiICIAJBgP4/akEQdkEIcSICdCIEIARBgOAfakEQdkEEcSIEdCIGIAZBgIAPakEQdkECcSIGdEEPdiACIARyIAZyayICQQF0IAAgAkEVanZBAXFyQRxqIQILIAEgAjYCHCABQgA3AhAgAkECdEHI/B9qIQQCQAJAAkACQEEAKAKc+h8iBkEBIAJ0IgNxDQBBACAGIANyNgKc+h8gBCABNgIAIAEgBDYCGAwBCyAAQQBBGSACQQF2ayACQR9GG3QhAiAEKAIAIQYDQCAGIgQoAgRBeHEgAEYNAiACQR12IQYgAkEBdCECIAQgBkEEcWpBEGoiAygCACIGDQALIAMgATYCACABIAQ2AhgLIAEgATYCDCABIAE2AggMAQsgBCgCCCIAIAE2AgwgBCABNgIIIAFBADYCGCABIAQ2AgwgASAANgIIC0EAQQAoArj6H0F/aiIBQX8gARs2Arj6HwsLjAEBAn8CQCAADQAgARCrBQ8LAkAgAUFASQ0AEIoEQTA2AgBBAA8LAkAgAEF4akEQIAFBC2pBeHEgAUELSRsQrgUiAkUNACACQQhqDwsCQCABEKsFIgINAEEADwsgAiAAQXxBeCAAQXxqKAIAIgNBA3EbIANBeHFqIgMgASADIAFJGxCaBBogABCsBSACC80HAQl/IAAoAgQiAkF4cSEDAkACQCACQQNxDQACQCABQYACTw0AQQAPCwJAIAMgAUEEakkNACAAIQQgAyABa0EAKAL4/R9BAXRNDQILQQAPCyAAIANqIQUCQAJAIAMgAUkNACADIAFrIgNBEEkNASAAIAJBAXEgAXJBAnI2AgQgACABaiIBIANBA3I2AgQgBSAFKAIEQQFyNgIEIAEgAxCvBQwBC0EAIQQCQCAFQQAoArD6H0cNAEEAKAKk+h8gA2oiAyABTQ0CIAAgAkEBcSABckECcjYCBCAAIAFqIgIgAyABayIBQQFyNgIEQQAgATYCpPofQQAgAjYCsPofDAELAkAgBUEAKAKs+h9HDQBBACEEQQAoAqD6HyADaiIDIAFJDQICQAJAIAMgAWsiBEEQSQ0AIAAgAkEBcSABckECcjYCBCAAIAFqIgEgBEEBcjYCBCAAIANqIgMgBDYCACADIAMoAgRBfnE2AgQMAQsgACACQQFxIANyQQJyNgIEIAAgA2oiASABKAIEQQFyNgIEQQAhBEEAIQELQQAgATYCrPofQQAgBDYCoPofDAELQQAhBCAFKAIEIgZBAnENASAGQXhxIANqIgcgAUkNASAHIAFrIQgCQAJAIAZB/wFLDQAgBSgCCCIDIAZBA3YiCUEDdEHA+h9qIgZGGgJAIAUoAgwiBCADRw0AQQBBACgCmPofQX4gCXdxNgKY+h8MAgsgBCAGRhogAyAENgIMIAQgAzYCCAwBCyAFKAIYIQoCQAJAIAUoAgwiBiAFRg0AIAUoAggiA0EAKAKo+h9JGiADIAY2AgwgBiADNgIIDAELAkAgBUEUaiIDKAIAIgQNACAFQRBqIgMoAgAiBA0AQQAhBgwBCwNAIAMhCSAEIgZBFGoiAygCACIEDQAgBkEQaiEDIAYoAhAiBA0ACyAJQQA2AgALIApFDQACQAJAIAUgBSgCHCIEQQJ0Qcj8H2oiAygCAEcNACADIAY2AgAgBg0BQQBBACgCnPofQX4gBHdxNgKc+h8MAgsgCkEQQRQgCigCECAFRhtqIAY2AgAgBkUNAQsgBiAKNgIYAkAgBSgCECIDRQ0AIAYgAzYCECADIAY2AhgLIAUoAhQiA0UNACAGQRRqIAM2AgAgAyAGNgIYCwJAIAhBD0sNACAAIAJBAXEgB3JBAnI2AgQgACAHaiIBIAEoAgRBAXI2AgQMAQsgACACQQFxIAFyQQJyNgIEIAAgAWoiASAIQQNyNgIEIAAgB2oiAyADKAIEQQFyNgIEIAEgCBCvBQsgACEECyAEC8IMAQZ/IAAgAWohAgJAAkAgACgCBCIDQQFxDQAgA0EDcUUNASAAKAIAIgMgAWohAQJAAkAgACADayIAQQAoAqz6H0YNAAJAIANB/wFLDQAgACgCCCIEIANBA3YiBUEDdEHA+h9qIgZGGiAAKAIMIgMgBEcNAkEAQQAoApj6H0F+IAV3cTYCmPofDAMLIAAoAhghBwJAAkAgACgCDCIGIABGDQAgACgCCCIDQQAoAqj6H0kaIAMgBjYCDCAGIAM2AggMAQsCQCAAQRRqIgMoAgAiBA0AIABBEGoiAygCACIEDQBBACEGDAELA0AgAyEFIAQiBkEUaiIDKAIAIgQNACAGQRBqIQMgBigCECIEDQALIAVBADYCAAsgB0UNAgJAAkAgACAAKAIcIgRBAnRByPwfaiIDKAIARw0AIAMgBjYCACAGDQFBAEEAKAKc+h9BfiAEd3E2Apz6HwwECyAHQRBBFCAHKAIQIABGG2ogBjYCACAGRQ0DCyAGIAc2AhgCQCAAKAIQIgNFDQAgBiADNgIQIAMgBjYCGAsgACgCFCIDRQ0CIAZBFGogAzYCACADIAY2AhgMAgsgAigCBCIDQQNxQQNHDQFBACABNgKg+h8gAiADQX5xNgIEIAAgAUEBcjYCBCACIAE2AgAPCyADIAZGGiAEIAM2AgwgAyAENgIICwJAAkAgAigCBCIDQQJxDQACQCACQQAoArD6H0cNAEEAIAA2ArD6H0EAQQAoAqT6HyABaiIBNgKk+h8gACABQQFyNgIEIABBACgCrPofRw0DQQBBADYCoPofQQBBADYCrPofDwsCQCACQQAoAqz6H0cNAEEAIAA2Aqz6H0EAQQAoAqD6HyABaiIBNgKg+h8gACABQQFyNgIEIAAgAWogATYCAA8LIANBeHEgAWohAQJAAkAgA0H/AUsNACACKAIIIgQgA0EDdiIFQQN0QcD6H2oiBkYaAkAgAigCDCIDIARHDQBBAEEAKAKY+h9BfiAFd3E2Apj6HwwCCyADIAZGGiAEIAM2AgwgAyAENgIIDAELIAIoAhghBwJAAkAgAigCDCIGIAJGDQAgAigCCCIDQQAoAqj6H0kaIAMgBjYCDCAGIAM2AggMAQsCQCACQRRqIgQoAgAiAw0AIAJBEGoiBCgCACIDDQBBACEGDAELA0AgBCEFIAMiBkEUaiIEKAIAIgMNACAGQRBqIQQgBigCECIDDQALIAVBADYCAAsgB0UNAAJAAkAgAiACKAIcIgRBAnRByPwfaiIDKAIARw0AIAMgBjYCACAGDQFBAEEAKAKc+h9BfiAEd3E2Apz6HwwCCyAHQRBBFCAHKAIQIAJGG2ogBjYCACAGRQ0BCyAGIAc2AhgCQCACKAIQIgNFDQAgBiADNgIQIAMgBjYCGAsgAigCFCIDRQ0AIAZBFGogAzYCACADIAY2AhgLIAAgAUEBcjYCBCAAIAFqIAE2AgAgAEEAKAKs+h9HDQFBACABNgKg+h8PCyACIANBfnE2AgQgACABQQFyNgIEIAAgAWogATYCAAsCQCABQf8BSw0AIAFBeHFBwPofaiEDAkACQEEAKAKY+h8iBEEBIAFBA3Z0IgFxDQBBACAEIAFyNgKY+h8gAyEBDAELIAMoAgghAQsgAyAANgIIIAEgADYCDCAAIAM2AgwgACABNgIIDwtBHyEDAkAgAUH///8HSw0AIAFBCHYiAyADQYD+P2pBEHZBCHEiA3QiBCAEQYDgH2pBEHZBBHEiBHQiBiAGQYCAD2pBEHZBAnEiBnRBD3YgAyAEciAGcmsiA0EBdCABIANBFWp2QQFxckEcaiEDCyAAIAM2AhwgAEIANwIQIANBAnRByPwfaiEEAkACQAJAQQAoApz6HyIGQQEgA3QiAnENAEEAIAYgAnI2Apz6HyAEIAA2AgAgACAENgIYDAELIAFBAEEZIANBAXZrIANBH0YbdCEDIAQoAgAhBgNAIAYiBCgCBEF4cSABRg0CIANBHXYhBiADQQF0IQMgBCAGQQRxakEQaiICKAIAIgYNAAsgAiAANgIAIAAgBDYCGAsgACAANgIMIAAgADYCCA8LIAQoAggiASAANgIMIAQgADYCCCAAQQA2AhggACAENgIMIAAgATYCCAsLBwA/AEEQdAtUAQJ/QQAoAoTmDyIBIABBA2pBfHEiAmohAAJAAkAgAkUNACAAIAFNDQELAkAgABCwBU0NACAAEA9FDQELQQAgADYChOYPIAEPCxCKBEEwNgIAQX8L6AoCBH8EfiMAQfAAayIFJAAgBEL///////////8AgyEJAkACQAJAIAFQIgYgAkL///////////8AgyIKQoCAgICAgMCAgH98QoCAgICAgMCAgH9UIApQGw0AIANCAFIgCUKAgICAgIDAgIB/fCILQoCAgICAgMCAgH9WIAtCgICAgICAwICAf1EbDQELAkAgBiAKQoCAgICAgMD//wBUIApCgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEEIAEhAwwCCwJAIANQIAlCgICAgICAwP//AFQgCUKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQQMAgsCQCABIApCgICAgICAwP//AIWEQgBSDQBCgICAgICA4P//ACACIAMgAYUgBCAChUKAgICAgICAgIB/hYRQIgYbIQRCACABIAYbIQMMAgsgAyAJQoCAgICAgMD//wCFhFANAQJAIAEgCoRCAFINACADIAmEQgBSDQIgAyABgyEDIAQgAoMhBAwCCyADIAmEUEUNACABIQMgAiEEDAELIAMgASADIAFWIAkgClYgCSAKURsiBxshCiAEIAIgBxsiCUL///////8/gyELIAIgBCAHGyIMQjCIp0H//wFxIQgCQCAJQjCIp0H//wFxIgYNACAFQeAAaiAKIAsgCiALIAtQIgYbeSAGQQZ0rXynIgZBcWoQswVBECAGayEGIAVB6ABqKQMAIQsgBSkDYCEKCyABIAMgBxshAyAMQv///////z+DIQQCQCAIDQAgBUHQAGogAyAEIAMgBCAEUCIHG3kgB0EGdK18pyIHQXFqELMFQRAgB2shCCAFQdgAaikDACEEIAUpA1AhAwsgBEIDhiADQj2IhEKAgICAgICABIQhAiALQgOGIApCPYiEIQQgA0IDhiEBIAkgDIUhAwJAIAYgCEYNAAJAIAYgCGsiB0H/AE0NAEIAIQJCASEBDAELIAVBwABqIAEgAkGAASAHaxCzBSAFQTBqIAEgAiAHEL0FIAUpAzAgBSkDQCAFQcAAakEIaikDAIRCAFKthCEBIAVBMGpBCGopAwAhAgsgBEKAgICAgICABIQhDCAKQgOGIQsCQAJAIANCf1UNAEIAIQNCACEEIAsgAYUgDCAChYRQDQIgCyABfSEKIAwgAn0gCyABVK19IgRC/////////wNWDQEgBUEgaiAKIAQgCiAEIARQIgcbeSAHQQZ0rXynQXRqIgcQswUgBiAHayEGIAVBKGopAwAhBCAFKQMgIQoMAQsgAiAMfCABIAt8IgogAVStfCIEQoCAgICAgIAIg1ANACAKQgGIIARCP4aEIApCAYOEIQogBkEBaiEGIARCAYghBAsgCUKAgICAgICAgIB/gyEBAkAgBkH//wFIDQAgAUKAgICAgIDA//8AhCEEQgAhAwwBC0EAIQcCQAJAIAZBAEwNACAGIQcMAQsgBUEQaiAKIAQgBkH/AGoQswUgBSAKIARBASAGaxC9BSAFKQMAIAUpAxAgBUEQakEIaikDAIRCAFKthCEKIAVBCGopAwAhBAsgCkIDiCAEQj2GhCEDIAetQjCGIARCA4hC////////P4OEIAGEIQQgCqdBB3EhBgJAAkACQAJAAkAQuwUOAwABAgMLIAQgAyAGQQRLrXwiCiADVK18IQQCQCAGQQRGDQAgCiEDDAMLIAQgCkIBgyIBIAp8IgMgAVStfCEEDAMLIAQgAyABQgBSIAZBAEdxrXwiCiADVK18IQQgCiEDDAELIAQgAyABUCAGQQBHca18IgogA1StfCEEIAohAwsgBkUNAQsQvAUaCyAAIAM3AwAgACAENwMIIAVB8ABqJAALUwEBfgJAAkAgA0HAAHFFDQAgASADQUBqrYYhAkIAIQEMAQsgA0UNACABQcAAIANrrYggAiADrSIEhoQhAiABIASGIQELIAAgATcDACAAIAI3AwgL4AECAX8CfkEBIQQCQCAAQgBSIAFC////////////AIMiBUKAgICAgIDA//8AViAFQoCAgICAgMD//wBRGw0AIAJCAFIgA0L///////////8AgyIGQoCAgICAgMD//wBWIAZCgICAgICAwP//AFEbDQACQCACIACEIAYgBYSEUEUNAEEADwsCQCADIAGDQgBTDQBBfyEEIAAgAlQgASADUyABIANRGw0BIAAgAoUgASADhYRCAFIPC0F/IQQgACACViABIANVIAEgA1EbDQAgACAChSABIAOFhEIAUiEECyAEC9gBAgF/An5BfyEEAkAgAEIAUiABQv///////////wCDIgVCgICAgICAwP//AFYgBUKAgICAgIDA//8AURsNACACQgBSIANC////////////AIMiBkKAgICAgIDA//8AViAGQoCAgICAgMD//wBRGw0AAkAgAiAAhCAGIAWEhFBFDQBBAA8LAkAgAyABg0IAUw0AIAAgAlQgASADUyABIANRGw0BIAAgAoUgASADhYRCAFIPCyAAIAJWIAEgA1UgASADURsNACAAIAKFIAEgA4WEQgBSIQQLIAQL3xACBX8OfiMAQdACayIFJAAgBEL///////8/gyEKIAJC////////P4MhCyAEIAKFQoCAgICAgICAgH+DIQwgBEIwiKdB//8BcSEGAkACQAJAIAJCMIinQf//AXEiB0GBgH5qQYKAfkkNAEEAIQggBkGBgH5qQYGAfksNAQsCQCABUCACQv///////////wCDIg1CgICAgICAwP//AFQgDUKAgICAgIDA//8AURsNACACQoCAgICAgCCEIQwMAgsCQCADUCAEQv///////////wCDIgJCgICAgICAwP//AFQgAkKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQwgAyEBDAILAkAgASANQoCAgICAgMD//wCFhEIAUg0AAkAgAyACQoCAgICAgMD//wCFhFBFDQBCACEBQoCAgICAgOD//wAhDAwDCyAMQoCAgICAgMD//wCEIQxCACEBDAILAkAgAyACQoCAgICAgMD//wCFhEIAUg0AQgAhAQwCCwJAIAEgDYRCAFINAEKAgICAgIDg//8AIAwgAyAChFAbIQxCACEBDAILAkAgAyAChEIAUg0AIAxCgICAgICAwP//AIQhDEIAIQEMAgtBACEIAkAgDUL///////8/Vg0AIAVBwAJqIAEgCyABIAsgC1AiCBt5IAhBBnStfKciCEFxahCzBUEQIAhrIQggBUHIAmopAwAhCyAFKQPAAiEBCyACQv///////z9WDQAgBUGwAmogAyAKIAMgCiAKUCIJG3kgCUEGdK18pyIJQXFqELMFIAkgCGpBcGohCCAFQbgCaikDACEKIAUpA7ACIQMLIAVBoAJqIANCMYggCkKAgICAgIDAAIQiDkIPhoQiAkIAQoCAgICw5ryC9QAgAn0iBEIAEL8FIAVBkAJqQgAgBUGgAmpBCGopAwB9QgAgBEIAEL8FIAVBgAJqIAUpA5ACQj+IIAVBkAJqQQhqKQMAQgGGhCIEQgAgAkIAEL8FIAVB8AFqIARCAEIAIAVBgAJqQQhqKQMAfUIAEL8FIAVB4AFqIAUpA/ABQj+IIAVB8AFqQQhqKQMAQgGGhCIEQgAgAkIAEL8FIAVB0AFqIARCAEIAIAVB4AFqQQhqKQMAfUIAEL8FIAVBwAFqIAUpA9ABQj+IIAVB0AFqQQhqKQMAQgGGhCIEQgAgAkIAEL8FIAVBsAFqIARCAEIAIAVBwAFqQQhqKQMAfUIAEL8FIAVBoAFqIAJCACAFKQOwAUI/iCAFQbABakEIaikDAEIBhoRCf3wiBEIAEL8FIAVBkAFqIANCD4ZCACAEQgAQvwUgBUHwAGogBEIAQgAgBUGgAWpBCGopAwAgBSkDoAEiCiAFQZABakEIaikDAHwiAiAKVK18IAJCAVatfH1CABC/BSAFQYABakIBIAJ9QgAgBEIAEL8FIAggByAGa2ohBgJAAkAgBSkDcCIPQgGGIhAgBSkDgAFCP4ggBUGAAWpBCGopAwAiEUIBhoR8Ig1CmZN/fCISQiCIIgIgC0KAgICAgIDAAIQiE0IBhiABQj+IhCIUQiCIIgR+IgsgAUIBhiIVQiCIIgogBUHwAGpBCGopAwBCAYYgD0I/iIQgEUI/iHwgDSAQVK18IBIgDVStfEJ/fCIPQiCIIg1+fCIQIAtUrSAQIA9C/////w+DIgsgFEL/////D4MiD358IhEgEFStfCANIAR+fCALIAR+IhYgDyANfnwiECAWVK1CIIYgEEIgiIR8IBEgEEIghnwiECARVK18IBAgEkL/////D4MiEiAPfiIWIAIgCn58IhEgFlStIBEgCyAVQv7///8PgyIWfnwiFyARVK18fCIRIBBUrXwgESASIAR+IhAgFiANfnwiBCACIA9+fCINIAsgCn58IgtCIIggBCAQVK0gDSAEVK18IAsgDVStfEIghoR8IgQgEVStfCAEIBcgAiAWfiICIBIgCn58IgpCIIggCiACVK1CIIaEfCICIBdUrSACIAtCIIZ8IAJUrXx8IgIgBFStfCIEQv////////8AVg0AIAVB0ABqIAIgBCADIA4QvwUgAUIxhiAFQdAAakEIaikDAH0gBSkDUCIBQgBSrX0hDSAGQf7/AGohBkIAIAF9IQoMAQsgBUHgAGogAkIBiCAEQj+GhCICIARCAYgiBCADIA4QvwUgAUIwhiAFQeAAakEIaikDAH0gBSkDYCIKQgBSrX0hDSAGQf//AGohBkIAIAp9IQogASEVIBMhFAsCQCAGQf//AUgNACAMQoCAgICAgMD//wCEIQxCACEBDAELAkACQCAGQQFIDQAgDUIBhiAKQj+IhCENIAatQjCGIARC////////P4OEIQsgCkIBhiEEDAELAkAgBkGPf0oNAEIAIQEMAgsgBUHAAGogAiAEQQEgBmsQvQUgBUEwaiAVIBQgBkHwAGoQswUgBUEgaiADIA4gBSkDQCICIAVBwABqQQhqKQMAIgsQvwUgBUEwakEIaikDACAFQSBqQQhqKQMAQgGGIAUpAyAiAUI/iIR9IAUpAzAiBCABQgGGIgFUrX0hDSAEIAF9IQQLIAVBEGogAyAOQgNCABC/BSAFIAMgDkIFQgAQvwUgCyACIAJCAYMiASAEfCIEIANWIA0gBCABVK18IgEgDlYgASAOURutfCIDIAJUrXwiAiADIAJCgICAgICAwP//AFQgBCAFKQMQViABIAVBEGpBCGopAwAiAlYgASACURtxrXwiAiADVK18IgMgAiADQoCAgICAgMD//wBUIAQgBSkDAFYgASAFQQhqKQMAIgRWIAEgBFEbca18IgEgAlStfCAMhCEMCyAAIAE3AwAgACAMNwMIIAVB0AJqJAALjgICAn8DfiMAQRBrIgIkAAJAAkAgAb0iBEL///////////8AgyIFQoCAgICAgIB4fEL/////////7/8AVg0AIAVCPIYhBiAFQgSIQoCAgICAgICAPHwhBQwBCwJAIAVCgICAgICAgPj/AFQNACAEQjyGIQYgBEIEiEKAgICAgIDA//8AhCEFDAELAkAgBVBFDQBCACEGQgAhBQwBCyACIAVCACAEp2dBIGogBUIgiKdnIAVCgICAgBBUGyIDQTFqELMFIAJBCGopAwBCgICAgICAwACFQYz4ACADa61CMIaEIQUgAikDACEGCyAAIAY3AwAgACAFIARCgICAgICAgICAf4OENwMIIAJBEGokAAvhAQIDfwJ+IwBBEGsiAiQAAkACQCABvCIDQf////8HcSIEQYCAgHxqQf////cHSw0AIAStQhmGQoCAgICAgIDAP3whBUIAIQYMAQsCQCAEQYCAgPwHSQ0AIAOtQhmGQoCAgICAgMD//wCEIQVCACEGDAELAkAgBA0AQgAhBkIAIQUMAQsgAiAErUIAIARnIgRB0QBqELMFIAJBCGopAwBCgICAgICAwACFQYn/ACAEa61CMIaEIQUgAikDACEGCyAAIAY3AwAgACAFIANBgICAgHhxrUIghoQ3AwggAkEQaiQAC40BAgJ/An4jAEEQayICJAACQAJAIAENAEIAIQRCACEFDAELIAIgASABQR91IgNzIANrIgOtQgAgA2ciA0HRAGoQswUgAkEIaikDAEKAgICAgIDAAIVBnoABIANrrUIwhnwgAUGAgICAeHGtQiCGhCEFIAIpAwAhBAsgACAENwMAIAAgBTcDCCACQRBqJAALcgIBfwJ+IwBBEGsiAiQAAkACQCABDQBCACEDQgAhBAwBCyACIAGtQgAgAWciAUHRAGoQswUgAkEIaikDAEKAgICAgIDAAIVBnoABIAFrrUIwhnwhBCACKQMAIQMLIAAgAzcDACAAIAQ3AwggAkEQaiQACwQAQQALBABBAAtTAQF+AkACQCADQcAAcUUNACACIANBQGqtiCEBQgAhAgwBCyADRQ0AIAJBwAAgA2uthiABIAOtIgSIhCEBIAIgBIghAgsgACABNwMAIAAgAjcDCAucCwIFfw9+IwBB4ABrIgUkACAEQv///////z+DIQogBCAChUKAgICAgICAgIB/gyELIAJC////////P4MiDEIgiCENIARCMIinQf//AXEhBgJAAkACQCACQjCIp0H//wFxIgdBgYB+akGCgH5JDQBBACEIIAZBgYB+akGBgH5LDQELAkAgAVAgAkL///////////8AgyIOQoCAgICAgMD//wBUIA5CgICAgICAwP//AFEbDQAgAkKAgICAgIAghCELDAILAkAgA1AgBEL///////////8AgyICQoCAgICAgMD//wBUIAJCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCELIAMhAQwCCwJAIAEgDkKAgICAgIDA//8AhYRCAFINAAJAIAMgAoRQRQ0AQoCAgICAgOD//wAhC0IAIQEMAwsgC0KAgICAgIDA//8AhCELQgAhAQwCCwJAIAMgAkKAgICAgIDA//8AhYRCAFINACABIA6EIQJCACEBAkAgAlBFDQBCgICAgICA4P//ACELDAMLIAtCgICAgICAwP//AIQhCwwCCwJAIAEgDoRCAFINAEIAIQEMAgsCQCADIAKEQgBSDQBCACEBDAILQQAhCAJAIA5C////////P1YNACAFQdAAaiABIAwgASAMIAxQIggbeSAIQQZ0rXynIghBcWoQswVBECAIayEIIAVB2ABqKQMAIgxCIIghDSAFKQNQIQELIAJC////////P1YNACAFQcAAaiADIAogAyAKIApQIgkbeSAJQQZ0rXynIglBcWoQswUgCCAJa0EQaiEIIAVByABqKQMAIQogBSkDQCEDCyADQg+GIg5CgID+/w+DIgIgAUIgiCIEfiIPIA5CIIgiDiABQv////8PgyIBfnwiEEIghiIRIAIgAX58IhIgEVStIAIgDEL/////D4MiDH4iEyAOIAR+fCIRIApCD4YgA0IxiIQiFEL/////D4MiAyABfnwiCiAQQiCIIBAgD1StQiCGhHwiDyACIA1CgIAEhCIQfiIVIA4gDH58Ig0gFEIgiEKAgICACIQiAiABfnwiFCADIAR+fCIWQiCGfCIXfCEBIAcgBmogCGpBgYB/aiEGAkACQCACIAR+IhggDiAQfnwiBCAYVK0gBCADIAx+fCIOIARUrXwgAiAQfnwgDiARIBNUrSAKIBFUrXx8IgQgDlStfCADIBB+IgMgAiAMfnwiAiADVK1CIIYgAkIgiIR8IAQgAkIghnwiAiAEVK18IAIgFkIgiCANIBVUrSAUIA1UrXwgFiAUVK18QiCGhHwiBCACVK18IAQgDyAKVK0gFyAPVK18fCICIARUrXwiBEKAgICAgIDAAINQDQAgBkEBaiEGDAELIBJCP4ghAyAEQgGGIAJCP4iEIQQgAkIBhiABQj+IhCECIBJCAYYhEiADIAFCAYaEIQELAkAgBkH//wFIDQAgC0KAgICAgIDA//8AhCELQgAhAQwBCwJAAkAgBkEASg0AAkBBASAGayIHQYABSQ0AQgAhAQwDCyAFQTBqIBIgASAGQf8AaiIGELMFIAVBIGogAiAEIAYQswUgBUEQaiASIAEgBxC9BSAFIAIgBCAHEL0FIAUpAyAgBSkDEIQgBSkDMCAFQTBqQQhqKQMAhEIAUq2EIRIgBUEgakEIaikDACAFQRBqQQhqKQMAhCEBIAVBCGopAwAhBCAFKQMAIQIMAQsgBq1CMIYgBEL///////8/g4QhBAsgBCALhCELAkAgElAgAUJ/VSABQoCAgICAgICAgH9RGw0AIAsgAkIBfCIBIAJUrXwhCwwBCwJAIBIgAUKAgICAgICAgIB/hYRCAFENACACIQEMAQsgCyACIAJCAYN8IgEgAlStfCELCyAAIAE3AwAgACALNwMIIAVB4ABqJAALdQEBfiAAIAQgAX4gAiADfnwgA0IgiCICIAFCIIgiBH58IANC/////w+DIgMgAUL/////D4MiAX4iBUIgiCADIAR+fCIDQiCIfCADQv////8PgyACIAF+fCIBQiCIfDcDCCAAIAFCIIYgBUL/////D4OENwMAC0gBAX8jAEEQayIFJAAgBSABIAIgAyAEQoCAgICAgICAgH+FELIFIAUpAwAhBCAAIAVBCGopAwA3AwggACAENwMAIAVBEGokAAvkAwICfwJ+IwBBIGsiAiQAAkACQCABQv///////////wCDIgRCgICAgICAwP9DfCAEQoCAgICAgMCAvH98Wg0AIABCPIggAUIEhoQhBAJAIABC//////////8PgyIAQoGAgICAgICACFQNACAEQoGAgICAgICAwAB8IQUMAgsgBEKAgICAgICAgMAAfCEFIABCgICAgICAgIAIUg0BIAUgBEIBg3whBQwBCwJAIABQIARCgICAgICAwP//AFQgBEKAgICAgIDA//8AURsNACAAQjyIIAFCBIaEQv////////8Dg0KAgICAgICA/P8AhCEFDAELQoCAgICAgID4/wAhBSAEQv///////7//wwBWDQBCACEFIARCMIinIgNBkfcASQ0AIAJBEGogACABQv///////z+DQoCAgICAgMAAhCIEIANB/4h/ahCzBSACIAAgBEGB+AAgA2sQvQUgAikDACIEQjyIIAJBCGopAwBCBIaEIQUCQCAEQv//////////D4MgAikDECACQRBqQQhqKQMAhEIAUq2EIgRCgYCAgICAgIAIVA0AIAVCAXwhBQwBCyAEQoCAgICAgICACFINACAFQgGDIAV8IQULIAJBIGokACAFIAFCgICAgICAgICAf4OEvwszAQF/IABBASAAGyEBAkADQCABEKsFIgANAQJAEMcFIgBFDQAgABEOAAwBCwsQAgALIAALBwAgABCsBQsJAEHcHBDFBQALBQAQAgALBwAgACgCAAsJAEGI/h8QxgULBwAgABDhBQsCAAsCAAsKACAAEMgFEMMFCwoAIAAQyAUQwwULCgAgABDIBRDDBQsK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bG93AEMgc3RhY2sgb3ZlcmZsb3cAc3RyaW5nIGxlbmd0aCBvdmVyZmxvdwB0YWJsZSBvdmVyZmxvdwB1bnNpZ25lZCBvdmVyZmxvdwBfX2lkaXYAX19kaXYAdGV4dABuZXh0AGNvbnN0AG11bHRpcGxlIHRvLWJlLWNsb3NlZCB2YXJpYWJsZXMgaW4gbG9jYWwgbGlzdABzcXJ0AHNvcnQAZGF0YSBzdHJpbmcgdG9vIHNob3J0AGFzc2VydABpbnNlcnQAcmVzdGFydABfX2Jub3QAY291bnQAcHJpbnQAY29kZXBvaW50AGNvbW1lbnQAY29uc3RhbnQAdWx0AF9fbHQAbGltaXQAcmF3c2V0AG9mZnNldAByYXdnZXQAY29sbGVjdABzZWxlY3QAYnQAZmxvYXQAdmFyaWFibGUtbGVuZ3RoIGZvcm1hdAByZXBlYXQAX19jb25jYXQAd3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50cwBjb25zdGFudHMAdG9vIG1hbnkgcmVzdWx0cwBpcGFpcnMAX19wYWlycwBmdW5jdGlvbiBvciBleHByZXNzaW9uIG5lZWRzIHRvbyBtYW55IHJlZ2lzdGVycwBfY2FsbGVycwBzcGVjaWZpZXIgJyUlcScgY2Fubm90IGhhdmUgbW9kaWZpZXJzAGxhYmVscy9nb3RvcwBzdHJpbmcgY29udGFpbnMgemVyb3MAYWNvcwB0b28gbWFueSBuZXN0ZWQgZnVuY3Rpb25zAHRvbyBtYW55IHVwdmFsdWVzAGF0dGVtcHQgdG8gY29tcGFyZSB0d28gJXMgdmFsdWVzAHRvbyBtYW55IGNhcHR1cmVzAGNvcmUgYW5kIGxpYnJhcnkgaGF2ZSBpbmNvbXBhdGlibGUgbnVtZXJpYyB0eXBlcwBjaHVuayBoYXMgdG9vIG1hbnkgbGluZXMAbG9jYWwgdmFyaWFibGVzAG9wY29kZXMAZmluYWwgcG9zaXRpb24gb3V0IG9mIGJvdW5kcwBpbml0aWFsIHBvc2l0aW9uIG91dCBvZiBib3VuZHMAX2xpYnMAYWJzAGF0dGVtcHQgdG8gJXMgYSAlcyB2YWx1ZSVzAEAlcwAlcyBleHBlY3RlZCwgZ290ICVzAGNhbm5vdCAlcyAlcwAlcyBuZWFyICVzAHRvbyBtYW55ICVzIChsaW1pdCBpcyAlZCkgaW4gJXMAYXR0ZW1wdCB0byBjb21wYXJlICVzIHdpdGggJXMAY2Fubm90ICVzICVzOiAlcwBDQUxMRVJfUlVOX0ZBSUwgJXM6ICVzAExJQl9SVU5fRkFJTCAlczogJXMAQ0FMTEVSX0xPQURfRkFJTCAlczogJXMAJXM6JWQ6ICVzAEVSUjogJXMAcXIAX19ieG9yAGZvciBpdGVyYXRvcgBzeW50YXggZXJyb3IAZmxvb3IAZm9yAF9fYm9yAF9fc2hyAGxvd2VyAGludmFsaWQgbG9uZyBzdHJpbmcgZGVsaW1pdGVyAHJzaV9zY29yZXIAdXBwZXIAY2FsbGVyAG1heGludGVnZXIAdG9pbnRlZ2VyAG1pbmludGVnZXIAb2JqZWN0IGxlbmd0aCBpcyBub3QgYW4gaW50ZWdlcgBsdWFfSW50ZWdlcgAlZC1ieXRlIGludGVnZXIgZG9lcyBub3QgZml0IGludG8gTHVhIEludGVnZXIAdG9udW1iZXIAbWFsZm9ybWVkIG51bWJlcgBsdWFfTnVtYmVyAGNpZHIAY2hhcgBfX2VxAF9fZGJxAGV4cABzdG9wACdfX25ld2luZGV4JyBjaGFpbiB0b28gbG9uZzsgcG9zc2libGUgbG9vcAAnX19pbmRleCcgY2hhaW4gdG9vIGxvbmc7IHBvc3NpYmxlIGxvb3AAZHVtcABzdGVwAHJlcABQcAAlczogJXAAcHJvdG8AZ290bwBhdHRlbXB0IHRvIGRpdmlkZSBieSB6ZXJvACdmb3InIHN0ZXAgaXMgemVybwBkbwBtYXJrZG93bgByZXR1cm4AY2hhcnBhdHRlcm4AbWlzc2luZyAnWycgYWZ0ZXIgJyUlZicgaW4gcGF0dGVybgB3YXJuAGpzb24ASW5zdHJ1Y3Rpb24AbWFpbiBmdW5jdGlvbgB1bmFibGUgdG8gZHVtcCBnaXZlbiBmdW5jdGlvbgBjYW5ub3QgdXNlICcuLi4nIG91dHNpZGUgYSB2YXJhcmcgZnVuY3Rpb24AbnVtYmVyJXMgaGFzIG5vIGludGVnZXIgcmVwcmVzZW50YXRpb24AbnVtYmVyIGhhcyBubyBpbnRlZ2VyIHJlcHJlc2VudGF0aW9uAHBlcmZvcm0gYml0d2lzZSBvcGVyYXRpb24gb24AcGVyZm9ybSBhcml0aG1ldGljIG9uAGFzaW4AbWluAD1zdGRpbgBtYWluAHJlb3BlbgByYXdsZW4AX19sZW4AdGhlbgBhdGFuAG5hbgBib29sZWFuAGJpZ251bQB2YWx1ZSBoYXMgbm8gbGl0ZXJhbCBmb3JtAHJhbmRvbQBfX3VubQB0cmdtAHNldHN0ZXBtdWwAX19tdWwAdW5leHBlY3RlZCBzeW1ib2wAeG1sAHlhbWwAeHBjYWxsAF9fY2FsbAB1bnRpbAB0YWJsZSBpbmRleCBpcyBuaWwAY2VpbABfX3NobAByYXdlcXVhbABpbmNyZW1lbnRhbABnZW5lcmF0aW9uYWwAbG9jYWwAZ2xvYmFsAFNsAGhvb2sAbm90IGEgYmluYXJ5IGNodW5rAGNvcnJ1cHRlZCBjaHVuawB0cnVuY2F0ZWQgY2h1bmsAY25jaGVjawBub3QgZW5vdWdoIHN0YWNrAHRvbyBtYW55IHJlc3VsdHMgdG8gdW5wYWNrAGJyZWFrAHBzaQBwaQB0b21saW5pAGpzb25wYXRoAG1hdGgAanNvbnBhdGNoAGZsb2F0IGZvcm1hdCBtaXNtYXRjaABpbnRlZ2VyIGZvcm1hdCBtaXNtYXRjaAB2ZXJzaW9uIG1pc21hdGNoACVzIHNpemUgbWlzbWF0Y2gAZ21hdGNoAGxvZwBsZXhpY2FsIGVsZW1lbnQgdG9vIGxvbmcAY29udHJvbCBzdHJ1Y3R1cmUgdG9vIGxvbmcAc3RyaW5nIHNsaWNlIHRvbyBsb25nAHBncm91dGluZwBpbnZhbGlkIG9yZGVyIGZ1bmN0aW9uIGZvciBzb3J0aW5nAF9fdG9zdHJpbmcAYmFzaWNfc3RyaW5nAGJpbmFyeSBzdHJpbmcAaW52YWxpZCB1c2Ugb2YgJyVjJyBpbiByZXBsYWNlbWVudCBzdHJpbmcAYmFkIGZvcm1hdCBmb3IgY29uc3RhbnQgc3RyaW5nAHRhYmxlIG9yIHN0cmluZwBpbml0aWFsIHBvc2l0aW9uIG91dCBvZiBzdHJpbmcAdW5maW5pc2hlZCBzdHJpbmcAZXJyb3Igb2JqZWN0IGlzIG5vdCBhIHN0cmluZwByZWFkZXIgZnVuY3Rpb24gbXVzdCByZXR1cm4gYSBzdHJpbmcAJ19fdG9zdHJpbmcnIG11c3QgcmV0dXJuIGEgc3RyaW5nAGlzcnVubmluZwBlcnJvciBpbiBlcnJvciBoYW5kbGluZwBhcnJheSB0b28gYmlnAG1lbW9yeSBhbGxvY2F0aW9uIGVycm9yOiBibG9jayB0b28gYmlnAGRlZwAlLjE0ZwBnZXQgbGVuZ3RoIG9mAGluZgBzZWxmAGVsc2VpZgBvZmYAbW9kZgB2ZXJzaW9uIG1pc21hdGNoOiBhcHAuIG5lZWRzICVmLCBMdWEgY29yZSBwcm92aWRlcyAlZgBwYWNrc2l6ZQBzdHJpbmcgbGVuZ3RoIGRvZXMgbm90IGZpdCBpbiBnaXZlbiBzaXplAHN0cmluZyBsb25nZXIgdGhhbiBnaXZlbiBzaXplAHJlbW92ZQB0b28gbWFueSBlbGVtZW50cyB0byBtb3ZlAHRydWUAdXB2YWx1ZQBubyB2YWx1ZQBpbml0aWFsIHZhbHVlAHZhcmlhYmxlICclcycgZ290IGEgbm9uLWNsb3NhYmxlIHZhbHVlAGluaXRpYWwgcG9zaXRpb24gaXMgYSBjb250aW51YXRpb24gYnl0ZQBjb25jYXRlbmF0ZQBzZXRwYXVzZQByZXZlcnNlAF9fY2xvc2UAZWxzZQBmYWxzZQBpbnZhbGlkIHBhdHRlcm4gY2FwdHVyZQB1bmZpbmlzaGVkIGNhcHR1cmUAdHlwZQBodG1sX2VzY2FwZQBfX25hbWUAd2hpbGUAZG9maWxlAGxvYWRmaWxlAHNldG1ldGF0YWJsZQBnZXRtZXRhdGFibGUAX19tZXRhdGFibGUAY2Fubm90IGNoYW5nZSBhIHByb3RlY3RlZCBtZXRhdGFibGUAc3RyaW5nL2Z1bmN0aW9uL3RhYmxlAG5pbCBvciB0YWJsZQBfX2xlAGh1Z2UAZm9ybWF0IHJlc3VsdCB0b28gbGFyZ2UAYnVmZmVyIHRvbyBsYXJnZQByZXN1bHRpbmcgc3RyaW5nIHRvbyBsYXJnZQBVVEYtOCB2YWx1ZSB0b28gbGFyZ2UAZGVjaW1hbCBlc2NhcGUgdG9vIGxhcmdlAGluZGV4IG91dCBvZiByYW5nZQB2YWx1ZSBvdXQgb2YgcmFuZ2UAYmFzZSBvdXQgb2YgcmFuZ2UAY29sbGVjdGdhcmJhZ2UAbHRyZWUAX19tb2RlAGludmFsaWQgVVRGLTggY29kZQBpbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZQBFZQBmbW9kAF9fbW9kAG1ldGFtZXRob2QAZGVzdGluYXRpb24gd3JhcCBhcm91bmQAZmluZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgaj1fbGlicy5qc29uOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9ai5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXthPTEsYj0neCcsYz17dHJ1ZSxmYWxzZSwyLjV9fSBlbmQ7IGlmIHAub3A9PSdkZWNvZGUnIHRoZW4gcmV0dXJuICdkZWNvZGUtPicuLmouZW5jb2RlKGouZGVjb2RlKHAudikpIGVuZDsgcmV0dXJuICdlbmNvZGUtPicuLmouZW5jb2RlKHAudiBvciBwKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuY2lkcjsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0nMTkyLjE2OC4xLjAvMjQnfSBlbmQ7IHJldHVybiAnY2lkci0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmpzb25wYXRoOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXt2PSd7ImEiOnsiYiI6W3siYyI6MX0seyJjIjoyfV19fScsZT0nJC5hLmJbKl0uYyd9IGVuZDsgcmV0dXJuICdqcC0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnhtbDsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0nPHJvb3QgYXR0cj0iMSI+PGE+MTwvYT48Yj4yLjU8L2I+PC9yb290Pid9IGVuZDsgcmV0dXJuICd4bWwtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5odG1sX2VzY2FwZTsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0nPGEgaHJlZj0ieCI+ICYgInEiJyxvcD0nZXNjYXBlJ30gZW5kOyByZXR1cm4gJ2h0bWwtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy50b21saW5pOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXt2PSdbc2VjXVxubmFtZSA9ICJ4IlxubiA9IDNcbmIgPSB0cnVlJyxvcD0ndG9tbCd9IGVuZDsgcmV0dXJuICd0b21sLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMueWFtbDsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0nYTogMVxuYjogWzEsIDIsIDNdXG5jOlxuICBkOiB0cnVlJ30gZW5kOyByZXR1cm4gJ3lhbWwtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5wc2k7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdwc2knLHJhd19lPXsxLDIsMyw0LDUsNiw3LDgsOSwxMH0scmF3X2E9ezIsMiwzLDQsNCw1LDYsNyw4LDEyfSxiaW5zPTV9IGVuZDsgcmV0dXJuICdwc2ktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5qc29ucGF0Y2g7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdhcHBseScsZG9jPSd7ImEiOjEsImIiOlsxLDJdfScscGF0Y2g9J1t7Im9wIjoicmVwbGFjZSIsInBhdGgiOiIvYSIsInZhbHVlIjo5fV0nfSBlbmQ7IHJldHVybiAncGF0Y2gtPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5lbnRpdHk7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdtYXRjaCcsYT0nam9obiBzbWl0aCcsYj0nam9uIHNtaXRoJ30gZW5kOyByZXR1cm4gJ2VudGl0eS5tYXRjaC0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnJzaV9zY29yZXI7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdzY29yZScsZj17Y3JlZGl0X3Njb3JlPTcyMCxiYWxhbmNlX3JhdGlvPTAuMyxtb250aHNfYWN0aXZlPTI0LGlucXVpcmllcz0yfX0gZW5kOyByZXR1cm4gJ3JzaS5zY29yZS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmx0cmVlOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtwYXRoPSdhLmIuYy5kJyxvcD0nbmxldmVsJ30gZW5kOyByZXR1cm4gJ2x0cmVlLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMucGdyb3V0aW5nOyBsb2NhbCBwOyBpZiBpbnB1dF9qc29uIGFuZCBpbnB1dF9qc29ufj0nJyB0aGVuIHA9X2xpYnMuanNvbi5kZWNvZGUoaW5wdXRfanNvbikgZWxzZSBwPXtvcD0nc2hvcnRlc3RfcGF0aCcsZWRnZXM9e3tzcmM9MSx0Z3Q9Mix3PTF9LHtzcmM9Mix0Z3Q9Myx3PTJ9LHtzcmM9MSx0Z3Q9Myx3PTEwfSx7c3JjPTMsdGd0PTQsdz0xfX0sc3JjPTEsdGd0PTR9IGVuZDsgcmV0dXJuICdzaG9ydGVzdCgxLT40KS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnNvdW5kZXg7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9J1JvYmVydCcsb3A9J3NvdW5kZXgnfSBlbmQ7IHJldHVybiAnc291bmRleCgnLi50b3N0cmluZyhwLnYpLi4nKS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmNuY2hlY2s7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9JzExMDEwNTE5NDkxMjMxMDAyWCcsb3A9J2lkX2NhcmQnfSBlbmQ7IHJldHVybiAnY25jaGVjaygnLi50b3N0cmluZyhwLnYpLi4nKS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLnRyZ207IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdzaW0nLGE9J0R1Y2tEQicsYj0nZHVja2RiJ30gZW5kOyByZXR1cm4gJ3RyZ20uJy4ucC5vcC4uJygnLi50b3N0cmluZyhwLmEpLi4nLCcuLnRvc3RyaW5nKHAuYikuLicpLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuZnV6enk7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e29wPSdqYXJvJyxhPSdtYXJ0aGEnLGI9J21hcmh0YSd9IGVuZDsgcmV0dXJuICdmdXp6eSgnLi4ocC5vcCBvciAnbGV2JykuLicsICcuLnRvc3RyaW5nKHAuYSkuLicsJy4udG9zdHJpbmcocC5iKS4uJyktPicuLnRvc3RyaW5nKGYocCkpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5tYXJrZG93bjsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17dj0nIyBUaXRsZVxuXG5wYXJhICoqYm9sZCoqIGBjb2RlYFxuXG4tIGl0ZW0xXG4tIGl0ZW0yJyxvcD0nc3RhdHMnfSBlbmQ7IHJldHVybiAnbWQoJy4uKHAub3Agb3IgJ3N0YXRzJykuLicpLT4nLi50b3N0cmluZyhmKHApKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMucXI7IGxvY2FsIHA7IGlmIGlucHV0X2pzb24gYW5kIGlucHV0X2pzb25+PScnIHRoZW4gcD1fbGlicy5qc29uLmRlY29kZShpbnB1dF9qc29uKSBlbHNlIHA9e3Y9J0R1Y2tEQitXQVNNJyxvcD0naW5mbyd9IGVuZDsgcmV0dXJuICdxcignLi4ocC5vcCBvciAnaW5mbycpLi4nKS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmJhc2V4eDsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17b3A9J2Jhc2U4NV9lbmMnLGhleD0nMDBlMWYwJ30gZW5kOyByZXR1cm4gJ2Jhc2V4eCgnLi4ocC5vcCBvciAnPycpLi4nKS0+Jy4udG9zdHJpbmcoZihwKSkgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmJpZ251bTsgbG9jYWwgcDsgaWYgaW5wdXRfanNvbiBhbmQgaW5wdXRfanNvbn49JycgdGhlbiBwPV9saWJzLmpzb24uZGVjb2RlKGlucHV0X2pzb24pIGVsc2UgcD17b3A9J2ZhY3QnLG49MjV9IGVuZDsgcmV0dXJuICdiaWdudW0oJy4uKHAub3Agb3IgJz8nKS4uJyktPicuLnRvc3RyaW5nKGYocCkpIGVuZABfX2JhbmQAJWxsZABmaWVsZABoZXhhZGVjaW1hbCBkaWdpdCBleHBlY3RlZABmdW5jdGlvbiBhcmd1bWVudHMgZXhwZWN0ZWQAJXMgZXhwZWN0ZWQAdmFsdWUgZXhwZWN0ZWQAJz0nIG9yICdpbicgZXhwZWN0ZWQAPG5hbWU+IG9yICcuLi4nIGV4cGVjdGVkAHJhbmRvbXNlZWQAX19hZGQAcmFkAGxvYWQAdGhyZWFkAFwlMDNkAFwlZABpbnZhbGlkIGNhcHR1cmUgaW5kZXggJSUlZABicmVhayBvdXRzaWRlIGxvb3AgYXQgbGluZSAlZABmdW5jdGlvbiBhdCBsaW5lICVkAG5vIHZpc2libGUgbGFiZWwgJyVzJyBmb3IgPGdvdG8+IGF0IGxpbmUgJWQAbGFiZWwgJyVzJyBhbHJlYWR5IGRlZmluZWQgb24gbGluZSAlZABfX2djAF9fZGJjAGdzdWIAX19zdWIAcmIAcndhABtMdWEAbGlnaHQgdXNlcmRhdGEAJWEAaW50ZWdyYWwgc2l6ZSAoJWQpIG91dCBvZiBsaW1pdHMgWzEsJWRdAD1bQ10AIl0AeFgAX0VOVgAlVQAueFhuTgB0YWJsZSBpbmRleCBpcyBOYU4AX1ZFUlNJT04ATkFOACVJAF9HAElORgBfTE9BREVEAEMAPT8APGludGVnZXI+ADxudW1iZXI+ADxzdHJpbmc+ADxlb2Y+ADxuYW1lPgA+PgB+PQA+PQA9PQA8PQA8PAA6OgAtMWU5OTk5AC0wMTIzNDU2Nzg5AHV0ZjgATHVhIDUuNABmb3JtYXQgYXNrcyBmb3IgYWxpZ25tZW50IG5vdCBwb3dlciBvZiAyAC0wAC0jMAAvLwBfRy4ALSsjMCAxMjM0NTY3ODkuAC4uLgBeJCorPy4oWyUtAC0rAF9VQk9YKgAodGVtcG9yYXJ5KQAoQyB0ZW1wb3JhcnkpAHN0YWNrIG92ZXJmbG93ICglcykAJXM6IGJhZCBiaW5hcnkgZm9ybWF0ICglcykAY2FsbGluZyAnJXMnIG9uIGJhZCBzZWxmICglcykAYmFkIGFyZ3VtZW50ICMlZCAoJXMpAGJhZCBhcmd1bWVudCAjJWQgdG8gJyVzJyAoJXMpAGJhZCAnZm9yJyAlcyAobnVtYmVyIGV4cGVjdGVkLCBnb3QgJXMpAGludmFsaWQgcmVwbGFjZW1lbnQgdmFsdWUgKGEgJXMpAChudWxsKQAobmlsKQAodmFyYXJnKQBpbnZhbGlkIGZvcm1hdCAodG9vIGxvbmcpAChmb3Igc3RhdGUpAChubyBuYW1lKQA9KGxvYWQpAHRvbyBtYW55ICVzIChsaW1pdCBpcyAlZCkAJXMgZXhwZWN0ZWQgKHRvIGNsb3NlICVzIGF0IGxpbmUgJWQpAHVuZmluaXNoZWQgbG9uZyAlcyAoc3RhcnRpbmcgYXQgbGluZSAlZCkAKDAvMCkAYXR0ZW1wdCB0byBsb2FkIGEgJXMgY2h1bmsgKG1vZGUgaXMgJyVzJykAICglcyAnJXMnKQBtYWxmb3JtZWQgcGF0dGVybiAobWlzc2luZyBhcmd1bWVudHMgdG8gJyUlYicpAG1hbGZvcm1lZCBwYXR0ZXJuIChtaXNzaW5nICddJykAbWFsZm9ybWVkIHBhdHRlcm4gKGVuZHMgd2l0aCAnJSUnKQAgKABtaXNzaW5nICd9JwBtaXNzaW5nICd7JwB1bmZpbmlzaGVkIHN0cmluZyBmb3IgZm9ybWF0ICd6JwBpbnZhbGlkIGtleSB0byAnbmV4dCcAd3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byAnaW5zZXJ0JwBpbnZhbGlkIGNvbnZlcnNpb24gJyVzJyB0byAnZm9ybWF0JwBpbnZhbGlkIHZhbHVlICglcykgYXQgaW5kZXggJUkgaW4gdGFibGUgZm9yICdjb25jYXQnAGludmFsaWQgb3B0aW9uICclcycAPGdvdG8gJXM+IGF0IGxpbmUgJWQganVtcHMgaW50byB0aGUgc2NvcGUgb2YgbG9jYWwgJyVzJwB1bmtub3duIGF0dHJpYnV0ZSAnJXMnAGF0dGVtcHQgdG8gYXNzaWduIHRvIGNvbnN0IHZhcmlhYmxlICclcycAZXJyb3I6IHVua25vd24gbGliICclcycAYXR0ZW1wdCB0byAlcyBhICclcycgd2l0aCBhICclcycAaW52YWxpZCBjb252ZXJzaW9uIHNwZWNpZmljYXRpb246ICclcycAaW52YWxpZCBvcHRpb24gJyUlJWMnIHRvICdsdWFfcHVzaGZzdHJpbmcnAG1pc3Npbmcgc2l6ZSBmb3IgZm9ybWF0IG9wdGlvbiAnYycAaW52YWxpZCBmb3JtYXQgb3B0aW9uICclYycAaW52YWxpZCBuZXh0IG9wdGlvbiBmb3Igb3B0aW9uICdYJwAnPFwlZD4nAGF0dGVtcHQgdG8gcGVyZm9ybSAnbiUlMCcAW3N0cmluZyAiAGFzc2VydGlvbiBmYWlsZWQhAGVycm9yIGluIABMdWEgd2FybmluZzogACVzOiVkOiAALSswIAAtKyMwIAAgDAoNCQsALS0gQGxpYjogYmlnbnVtCi0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDku7vmhI/nsr7luqbmlbTmlbDov5DnrpfvvIjnuq8gTHVh77yM6Zu25L6d6LWW77yJ4oCU4oCU6KGlIER1Y2tEQiBCSUdOVU0g5LmY5rOV5Lii57K+5bqm55qE5Z2R77yaCi0tICAgICAgICBCSUdOVU0qQklHTlVNIOe7k+aenOexu+Wei+mAgOWMluS4uiBET1VCTEXvvIjlsL7mlbDkuKLlpLHvvInvvIznqI3lpKfnm7TmjqUgT3ZlcmZsb3cgaW4KLS0gICAgICAgIG11bHRpcGxpY2F0aW9uIG9mIElOVDEyOO+8iDEuNS54IOS4jiAyLjAuMCBMVFMg5a6e5rWL6KGM5Li65LiA6Ie077yJ44CC5pysIGxpYiDnlKgKLS0gICAgICAgIGJhc2UgMTBeNyBsaW1icyDlgZrnsr7noa7ljYHov5vliLblpKfmlbTmlbDvvJphZGQvc3ViL211bC9kaXZtb2QvcG93L21vZC9mYWN0L2NtcO+8jAotLSAgICAgICAg6L6T5YWl6L6T5Ye65Z2H5Li65Y2B6L+b5Yi25a2X56ym5Liy77yI5Y+v5bim6LSf5Y+377yJ77yMU1FMIOS+p+mbtueyvuW6puaNn+WkseOAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yJCi0tIEByZXF1aXJlczog5peg77yI57qvIEx1Ye+8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0KLS0g55So5rOV77yIbHVhaml0X3Mg5Y+M5b2i5oCB77yac3RydWN0IOWtl+mdoumHj+aIliBKU09OIOWtl+espuS4suWdh+WPr++8jGVudHJ5KCkg6Ieq6YCC6YWN77yJ77yaCi0tICAgU0VMRUNUIGx1YWppdF9zKCdiaWdudW0nLCB7J29wJzonbXVsJywKLS0gICAgICdhJzonMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwJywKLS0gICAgICdiJzonOTg3NjU0MzIxMDk4NzY1NDMyMTA5ODc2NTQzMjEwJ30pOwotLSAgIC0tIOKGkiB7InIiOiIxMjE5MzI2MzExMzcwMjE3OTUyMjYxODUwMzI3ODk5MzU2MDc1ODM4ODQwNzgwMzIyODM0NzI1NDA3MzAxNjk2MDcyOTAwIn0KLS0KLS0gICBvcCDliJfooajvvIhhL2Ig5Li65Y2B6L+b5Yi25pW05pWw5a2X56ym5Liy77ybZGl2IOS4uuaIquaWremZpOazle+8jG1vZCDnrKblj7fpmo/ooqvpmaTmlbDvvInvvJoKLS0gICAgIG11bCAgYSpiICAgICAgICDihpIge3I6Ii4uLiJ9Ci0tICAgICBhZGQgIGErYiAgICAgICAg4oaSIHtyOiIuLi4ifQotLSAgICAgc3ViICBhLWIgICAgICAgIOKGkiB7cjoiLi4uIn0KLS0gICAgIGRpdiAgYS9iICAgICAgICDihpIge3E6IuWVhiIsIG06IuS9meaVsCJ9Ci0tICAgICBtb2QgIGEgbW9kIGIgICAg4oaSIHtyOiIuLi4ifQotLSAgICAgcG93ICBhKipuICAgICAgIOKGkiB7cjoiLi4uIn3vvIhuIOS4uumdnui0n+aVtOaVsO+8jOasoeaVsOi1sOW5s+aWueS5mO+8iQotLSAgICAgZmFjdCBuISAgICAgICAgIOKGkiB7cjoiLi4uIn3vvIhuIOS4uumdnui0n+aVtOaVsO+8iQotLSAgICAgY21wICBhPD0+YiAgICAgIOKGkiB7cjotMXwwfDF9Ci0tCi0tIOmUmeivr+i/lOWbnu+8mnsic3RhdHVzIjoiRXJyb3IiLCJtZXNzYWdlIjouLi5977yI5LiN6Z2Z6buYIE5VTEzvvIkKLS0KLS0g6aqM6K+B6K6w5b2V77yIMjAyNi0xMC0yMiwgbHVhaml0IENMSSArIGR1Y2tkYiB2Mi4wLjAgRTJF77yM5LiOIFB5dGhvbiBpbnQg6YCQ5L2N5a+55ouN77yJ77yaCi0tICAgMzDkvY3DlzMw5L2NIOS4jiBQeXRob24g5a6M5YWo5LiA6Ie0IOKck++8iER1Y2tEQiBCSUdOVU0g5ZCM6L6T5YWlIE92ZXJmbG9377yJCi0tICAgMTIzNDU2Nzg5Kjk4NzY1NDMyMSA9IDEyMTkzMjYzMTExMjYzNTI2OSDinJPvvIhEdWNrREIgQklHTlVNIOS4ouaIkCAxLjIxOS4uLmUrMTfvvIkKLS0gICDpmo/mnLogNTAwIOe7hO+8iOKJpDgwIOS9jSDDlyDiiaQ4MCDkvY3vvIzlkKvotJ/mlbDvvIltdWwvYWRkL3N1YiDlr7nmi40gMCDlpLHphY0g4pyTCi0tICAgMTAwISAvIDIqKjI1NiAvIDfDtzMg5ZWG5L2ZIOS4jiBQeXRob24g5LiA6Ie0IOKckwotLQotLSDosIPnlKjmlrnms6jmhI/vvJpsdWFqaXRfcyDnmoTlj4LmlbDlgLzlv4XpobvkvKAqKuWtl+espuS4sioq77yIJ2EnOicxMjMuLi4n77yJ77yM5Lyg5pWw5a2X5a2X6Z2i6YePCi0tIOS8muWFiOiiq+Wuv+S4u+i9rCBET1VCTEXvvIzotoXov4cgMl41MyDlsLHlt7Lnu4/lnKjlhaXlj6PkuKLkuobnsr7luqbigJTigJTmnKwgbGliIOWPquS/neivgeWtl+espuS4sgotLSDlhaXlj6PlkI7nmoTnsr7noa7mgKfjgIIKCmxvY2FsIEJBU0UgPSAxMDAwMDAwMCAgICAgICAgICAtLSAxMF4377ya5LmY56evIDEwXjE0IDwgMl41M++8jOWPjOeyvuW6puWuieWFqApsb2NhbCBCQVNFX0RJR0lUUyA9IDcKCi0tID09PT09PT09PT09PSDmnoHnroAgSlNPTiBlbmNvZGXvvIjoh6rljIXlkKvvvIzkuI4gbGluYWxnLmx1YSDlkIzmrL7vvIkgPT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGpzb25fZW5jb2RlKHYpCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgICBpZiB2ID09IG1hdGguaHVnZSB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgICBpZiB2ID09IC1tYXRoLmh1Z2UgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyUuMTdnJywgdikKICBlbHNlaWYgdCA9PSAnc3RyaW5nJyB0aGVuCiAgICByZXR1cm4gJyInIC4uIHY6Z3N1YignWyVjIlxcXScsIGZ1bmN0aW9uKGMpCiAgICAgIGxvY2FsIG0gPSB7IFsnXG4nXSA9ICdcXG4nLCBbJ1xyJ10gPSAnXFxyJywgWydcdCddID0gJ1xcdCcsIFsnIiddID0gJ1xcIicsIFsnXFwnXSA9ICdcXFxcJyB9CiAgICAgIHJldHVybiBtW2NdIG9yIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBjOmJ5dGUoKSkKICAgIGVuZCkgLi4gJyInCiAgZWxzZWlmIHQgPT0gJ2Jvb2xlYW4nIHRoZW4KICAgIHJldHVybiB2IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJwogIGVsc2VpZiB0ID09ICduaWwnIHRoZW4KICAgIHJldHVybiAnbnVsbCcKICBlbHNlaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGxvY2FsIG4gPSAjdgogICAgaWYgbiA+IDAgdGhlbgogICAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICAgIGZvciBpID0gMSwgbiBkbyBwYXJ0c1tpXSA9IGpzb25fZW5jb2RlKHZbaV0pIGVuZAogICAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICAgIGVuZAogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIGssIHZhbCBpbiBwYWlycyh2KSBkbwogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IGpzb25fZW5jb2RlKGspIC4uICc6JyAuLiBqc29uX2VuY29kZSh2YWwpCiAgICBlbmQKICAgIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX2RlY29kZShzKQogIGlmIHR5cGUocykgfj0gJ3N0cmluZycgdGhlbiByZXR1cm4gcyBlbmQKICBsb2NhbCBwb3MgPSAxCiAgbG9jYWwgZnVuY3Rpb24gc2tpcHdzKCkKICAgIHdoaWxlIHBvcyA8PSAjcyBhbmQgczpzdWIocG9zLCBwb3MpOm1hdGNoKCclcycpIGRvIHBvcyA9IHBvcyArIDEgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gcGFyc2UoKQogICAgc2tpcHdzKCkKICAgIGxvY2FsIGMgPSBzOnN1Yihwb3MsIHBvcykKICAgIGlmIGMgPT0gJ3snIHRoZW4KICAgICAgcG9zID0gcG9zICsgMQogICAgICBsb2NhbCB0ID0ge30KICAgICAgc2tpcHdzKCkKICAgICAgaWYgczpzdWIocG9zLCBwb3MpID09ICd9JyB0aGVuIHBvcyA9IHBvcyArIDEgcmV0dXJuIHQgZW5kCiAgICAgIHdoaWxlIHRydWUgZG8KICAgICAgICBsb2NhbCBrID0gcGFyc2UoKQogICAgICAgIHNraXB3cygpCiAgICAgICAgaWYgczpzdWIocG9zLCBwb3MpIH49ICc6JyB0aGVuIHJldHVybiBuaWwgZW5kCiAgICAgICAgcG9zID0gcG9zICsgMQogICAgICAgIHRba10gPSBwYXJzZSgpCiAgICAgICAgc2tpcHdzKCkKICAgICAgICBsb2NhbCBjYyA9IHM6c3ViKHBvcywgcG9zKQogICAgICAgIGlmIGNjID09ICcsJyB0aGVuIHBvcyA9IHBvcyArIDEKICAgICAgICBlbHNlaWYgY2MgPT0gJ30nIHRoZW4gcG9zID0gcG9zICsgMSBicmVhawogICAgICAgIGVsc2UgcmV0dXJuIG5pbCBlbmQKICAgICAgZW5kCiAgICAgIHJldHVybiB0CiAgICBlbHNlaWYgYyA9PSAnWycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGxvY2FsIHQgPSB7fQogICAgICBza2lwd3MoKQogICAgICBpZiBzOnN1Yihwb3MsIHBvcykgPT0gJ10nIHRoZW4gcG9zID0gcG9zICsgMSByZXR1cm4gdCBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHRbI3QgKyAxXSA9IHBhcnNlKCkKICAgICAgICBza2lwd3MoKQogICAgICAgIGxvY2FsIGNjID0gczpzdWIocG9zLCBwb3MpCiAgICAgICAgaWYgY2MgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICAgIGVsc2VpZiBjYyA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxIGJyZWFrCiAgICAgICAgZWxzZSByZXR1cm4gbmlsIGVuZAogICAgICBlbmQKICAgICAgcmV0dXJuIHQKICAgIGVsc2VpZiBjID09ICciJyB0aGVuCiAgICAgIHBvcyA9IHBvcyArIDEKICAgICAgbG9jYWwgb3V0ID0ge30KICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIGxvY2FsIGNoID0gczpzdWIocG9zLCBwb3MpCiAgICAgICAgaWYgY2ggPT0gJyInIHRoZW4gcG9zID0gcG9zICsgMSBicmVhayBlbmQKICAgICAgICBpZiBjaCA9PSAnXFwnIHRoZW4KICAgICAgICAgIGxvY2FsIG54dCA9IHM6c3ViKHBvcyArIDEsIHBvcyArIDEpCiAgICAgICAgICBpZiBueHQgPT0gJ24nIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcbicKICAgICAgICAgIGVsc2VpZiBueHQgPT0gJ3QnIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcdCcKICAgICAgICAgIGVsc2VpZiBueHQgPT0gJ3InIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdccicKICAgICAgICAgIGVsc2VpZiBueHQgPT0gJ1xcJyB0aGVuIG91dFsjb3V0ICsgMV0gPSAnXFwnCiAgICAgICAgICBlbHNlaWYgbnh0ID09ICciJyB0aGVuIG91dFsjb3V0ICsgMV0gPSAnIicKICAgICAgICAgIGVsc2Ugb3V0WyNvdXQgKyAxXSA9IG54dCBlbmQKICAgICAgICAgIHBvcyA9IHBvcyArIDEKICAgICAgICBlbHNlCiAgICAgICAgICBvdXRbI291dCArIDFdID0gY2gKICAgICAgICBlbmQKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGVuZAogICAgICByZXR1cm4gdGFibGUuY29uY2F0KG91dCkKICAgIGVsc2VpZiBjID09ICd0JyB0aGVuIHBvcyA9IHBvcyArIDQgcmV0dXJuIHRydWUKICAgIGVsc2VpZiBjID09ICdmJyB0aGVuIHBvcyA9IHBvcyArIDUgcmV0dXJuIGZhbHNlCiAgICBlbHNlaWYgYyA9PSAnbicgdGhlbiBwb3MgPSBwb3MgKyA0IHJldHVybiBuaWwKICAgIGVsc2UKICAgICAgbG9jYWwgYiwgZSA9IHM6ZmluZCgnWy0lZCUuZUUrXSsnLCBwb3MpCiAgICAgIGlmIG5vdCBiIHRoZW4gcmV0dXJuIG5pbCBlbmQKICAgICAgbG9jYWwgbnVtID0gdG9udW1iZXIoczpzdWIoYiwgZSkpCiAgICAgIHBvcyA9IGUgKyAxCiAgICAgIHJldHVybiBudW0KICAgIGVuZAogIGVuZAogIHJldHVybiBwYXJzZSgpCmVuZAoKLS0gPT09PT09PT09PT09IOWkp+aVtOaVsOaguOW/g++8mntzaWduPS0xfDEsIGQ9e2xpbWJzLi4u5bCP56uvLCBiYXNlIDFlN319ID09PT09PT09PT09PQoKbG9jYWwgZnVuY3Rpb24gbm9ybSh4KSAgLS0g5Y676auY5L2N6Zu277yb5YWo6Zu2IOKGkiBzaWduPTEg5Y2VIGxpbWIgMAogIHdoaWxlICN4LmQgPiAxIGFuZCB4LmRbI3guZF0gPT0gMCBkbyB4LmRbI3guZF0gPSBuaWwgZW5kCiAgaWYgI3guZCA9PSAxIGFuZCB4LmRbMV0gPT0gMCB0aGVuIHguc2lnbiA9IDEgZW5kCiAgcmV0dXJuIHgKZW5kCgpsb2NhbCBmdW5jdGlvbiBiaWdfZnJvbV9zdHJpbmcocykKICBpZiB0eXBlKHMpID09ICdudW1iZXInIHRoZW4gcyA9IHN0cmluZy5mb3JtYXQoJyVkJywgcykgZW5kICAtLSDiiaQyXjUzIOaJjeWuieWFqAogIGlmIHR5cGUocykgfj0gJ3N0cmluZycgb3Igbm90IHM6bWF0Y2goJ15bLStdPyVkKyQnKSB0aGVuCiAgICByZXR1cm4gbmlsLCAnaW52YWxpZCBpbnRlZ2VyIHN0cmluZzogJyAuLiB0b3N0cmluZyhzKQogIGVuZAogIGxvY2FsIHNpZ24gPSAxCiAgcyA9IHM6Z3N1YignXlstK10nLCBmdW5jdGlvbihjKSBpZiBjID09ICctJyB0aGVuIHNpZ24gPSAtMSBlbmQgcmV0dXJuICcnIGVuZCkKICBzID0gczpnc3ViKCdeMCsnLCAnJykgb3IgJycKICBpZiBzID09ICcnIHRoZW4gcyA9ICcwJyBlbmQKICBsb2NhbCBkID0ge30KICAtLSDku47kvY7kvY3otbfmr48gNyDkvY3kuIDkuKogbGltYgogIGxvY2FsIGkgPSAjcwogIHdoaWxlIGkgPiAwIGRvCiAgICBsb2NhbCBsbyA9IGkgLSBCQVNFX0RJR0lUUyArIDEKICAgIGlmIGxvIDwgMSB0aGVuIGxvID0gMSBlbmQKICAgIGRbI2QgKyAxXSA9IHRvbnVtYmVyKHM6c3ViKGxvLCBpKSkKICAgIGkgPSBsbyAtIDEKICBlbmQKICByZXR1cm4gbm9ybSh7IHNpZ24gPSBzaWduLCBkID0gZCB9KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGJpZ190b19zdHJpbmcoeCkKICBsb2NhbCBoaSA9IHN0cmluZy5mb3JtYXQoJyVkJywgeC5kWyN4LmRdKQogIGxvY2FsIHBhcnRzID0geyB4LnNpZ24gPCAwIGFuZCAnLScgb3IgJycsIGhpIH0KICBmb3IgaSA9ICN4LmQgLSAxLCAxLCAtMSBkbwogICAgcGFydHNbI3BhcnRzICsgMV0gPSBzdHJpbmcuZm9ybWF0KCclMDdkJywgeC5kW2ldKQogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQocGFydHMpCmVuZAoKbG9jYWwgZnVuY3Rpb24gaXNfemVybyh4KSByZXR1cm4gI3guZCA9PSAxIGFuZCB4LmRbMV0gPT0gMCBlbmQKCmxvY2FsIGZ1bmN0aW9uIHVjbXAoYSwgYikgIC0tIOe7neWvueWAvOavlOi+gwogIGlmICNhLmQgfj0gI2IuZCB0aGVuIHJldHVybiAjYS5kIDwgI2IuZCBhbmQgLTEgb3IgMSBlbmQKICBmb3IgaSA9ICNhLmQsIDEsIC0xIGRvCiAgICBpZiBhLmRbaV0gfj0gYi5kW2ldIHRoZW4gcmV0dXJuIGEuZFtpXSA8IGIuZFtpXSBhbmQgLTEgb3IgMSBlbmQKICBlbmQKICByZXR1cm4gMAplbmQKCmxvY2FsIGZ1bmN0aW9uIHVhZGQoYSwgYikgIC0tIHxhfCt8YnwKICBsb2NhbCBkLCBjYXJyeSA9IHt9LCAwCiAgbG9jYWwgbiA9IG1hdGgubWF4KCNhLmQsICNiLmQpCiAgZm9yIGkgPSAxLCBuIGRvCiAgICBsb2NhbCB0ID0gKGEuZFtpXSBvciAwKSArIChiLmRbaV0gb3IgMCkgKyBjYXJyeQogICAgaWYgdCA+PSBCQVNFIHRoZW4gZFtpXSA9IHQgLSBCQVNFIGNhcnJ5ID0gMSBlbHNlIGRbaV0gPSB0IGNhcnJ5ID0gMCBlbmQKICBlbmQKICBpZiBjYXJyeSA+IDAgdGhlbiBkWyNkICsgMV0gPSBjYXJyeSBlbmQKICByZXR1cm4geyBzaWduID0gMSwgZCA9IGQgfQplbmQKCmxvY2FsIGZ1bmN0aW9uIHVzdWIoYSwgYikgIC0tIHxhfC18YnzvvIzopoHmsYIgfGF8Pj18YnwKICBsb2NhbCBkLCBib3Jyb3cgPSB7fSwgMAogIGZvciBpID0gMSwgI2EuZCBkbwogICAgbG9jYWwgdCA9IGEuZFtpXSAtIChiLmRbaV0gb3IgMCkgLSBib3Jyb3cKICAgIGlmIHQgPCAwIHRoZW4gZFtpXSA9IHQgKyBCQVNFIGJvcnJvdyA9IDEgZWxzZSBkW2ldID0gdCBib3Jyb3cgPSAwIGVuZAogIGVuZAogIHJldHVybiBub3JtKHsgc2lnbiA9IDEsIGQgPSBkIH0pCmVuZAoKbG9jYWwgZnVuY3Rpb24gYmlnX2FkZChhLCBiKQogIGlmIGEuc2lnbiA9PSBiLnNpZ24gdGhlbgogICAgbG9jYWwgciA9IHVhZGQoYSwgYikgci5zaWduID0gYS5zaWduIHJldHVybiBub3JtKHIpCiAgZW5kCiAgbG9jYWwgYyA9IHVjbXAoYSwgYikKICBpZiBjID09IDAgdGhlbiByZXR1cm4geyBzaWduID0gMSwgZCA9IHsgMCB9IH0gZW5kCiAgaWYgYyA+IDAgdGhlbgogICAgbG9jYWwgciA9IHVzdWIoYSwgYikgci5zaWduID0gYS5zaWduIHJldHVybiByCiAgZWxzZQogICAgbG9jYWwgciA9IHVzdWIoYiwgYSkgci5zaWduID0gYi5zaWduIHJldHVybiByCiAgZW5kCmVuZAoKbG9jYWwgZnVuY3Rpb24gYmlnX25lZyhhKSByZXR1cm4gaXNfemVybyhhKSBhbmQgYSBvciB7IHNpZ24gPSAtYS5zaWduLCBkID0gYS5kIH0gZW5kCmxvY2FsIGZ1bmN0aW9uIGJpZ19zdWIoYSwgYikgcmV0dXJuIGJpZ19hZGQoYSwgYmlnX25lZyhiKSkgZW5kCgpsb2NhbCBmdW5jdGlvbiBiaWdfbXVsKGEsIGIpCiAgaWYgaXNfemVybyhhKSBvciBpc196ZXJvKGIpIHRoZW4gcmV0dXJuIHsgc2lnbiA9IDEsIGQgPSB7IDAgfSB9IGVuZAogIGxvY2FsIGQgPSB7fQogIGZvciBpID0gMSwgI2EuZCArICNiLmQgZG8gZFtpXSA9IDAgZW5kCiAgZm9yIGkgPSAxLCAjYS5kIGRvCiAgICBsb2NhbCBjYXJyeSA9IDAKICAgIGxvY2FsIGFpID0gYS5kW2ldCiAgICBmb3IgaiA9IDEsICNiLmQgZG8KICAgICAgLS0gdCDiiaQgKDFlNy0xKSArICgxZTctMSnCtygxZTctMSkgKyAoMWU3LTEpIDwgMWUxNO+8jOWPjOeyvuW6pueyvuehrgogICAgICBsb2NhbCB0ID0gZFtpICsgaiAtIDFdICsgYWkgKiBiLmRbal0gKyBjYXJyeQogICAgICBkW2kgKyBqIC0gMV0gPSB0ICUgQkFTRQogICAgICBjYXJyeSA9IG1hdGguZmxvb3IodCAvIEJBU0UpCiAgICBlbmQKICAgIC0tIOWwviBjYXJyeSDov5vkvY3lj6/og73orqkgZFtpKyNiLmRdIOKJpSBCQVNF77yM6aG76L+e6ZSB5b2S5LiA5YyWCiAgICBsb2NhbCBrID0gaSArICNiLmQKICAgIGRba10gPSAoZFtrXSBvciAwKSArIGNhcnJ5CiAgICB3aGlsZSBkW2tdID49IEJBU0UgZG8KICAgICAgZFtrXSA9IGRba10gLSBCQVNFCiAgICAgIGsgPSBrICsgMQogICAgICBkW2tdID0gKGRba10gb3IgMCkgKyAxCiAgICBlbmQKICBlbmQKICByZXR1cm4gbm9ybSh7IHNpZ24gPSBhLnNpZ24gKiBiLnNpZ24sIGQgPSBkIH0pCmVuZAoKLS0g5oiq5pat6Zmk5rOV77ya6L+U5ZueICjllYYsIOS9meaVsCnvvIznrKblj7for63kuYnlkIwgQy9MdWHvvIjkvZnmlbDnrKblj7fpmo/ooqvpmaTmlbDvvIkKbG9jYWwgZnVuY3Rpb24gYmlnX2Rpdm1vZChhLCBiKQogIGlmIGlzX3plcm8oYikgdGhlbiByZXR1cm4gbmlsLCAnZGl2aXNpb24gYnkgemVybycgZW5kCiAgaWYgdWNtcChhLCBiKSA8IDAgdGhlbiByZXR1cm4geyBzaWduID0gMSwgZCA9IHsgMCB9IH0sIGEgZW5kCiAgLS0g6YCQIGxpbWIg5ZWG5L2N5Lyw6K6hICsg57K+5YyW77yIbGltYiDnuqfplb/pmaTvvIxiYXNlIDFlN++8iQogIGxvY2FsIHEgPSB7IHNpZ24gPSAxLCBkID0ge30gfQogIGxvY2FsIHIgPSB7IHNpZ24gPSAxLCBkID0geyAwIH0gfQogIGZvciBpID0gI2EuZCwgMSwgLTEgZG8KICAgIC0tIHIgPSByKkJBU0UgKyBhLmRbaV0KICAgIGlmIGlzX3plcm8ocikgdGhlbiByLmQgPSB7IGEuZFtpXSB9IGVsc2UgdGFibGUuaW5zZXJ0KHIuZCwgMSwgYS5kW2ldKSByID0gbm9ybShyKSBlbmQKICAgIC0tIOS8sOiuoeWVhuS9je+8mnIgLyBi77yIYiDmnIDpq5ggbGltYiDiiaUgMSDml7bkvLDorqHnlKjmta7ngrnliJ3lgLzlho3nsr7ljJbvvIkKICAgIGxvY2FsIGxvLCBoaSA9IDAsIEJBU0UgLSAxCiAgICB3aGlsZSBsbyA8IGhpIGRvCiAgICAgIGxvY2FsIG1pZCA9IG1hdGguZmxvb3IoKGxvICsgaGkgKyAxKSAvIDIpCiAgICAgIGxvY2FsIHByb2JlID0geyBzaWduID0gMSwgZCA9IHsgbWlkIH0gfQogICAgICBpZiB1Y21wKGJpZ19tdWwoYiwgcHJvYmUpLCByKSA8PSAwIHRoZW4gbG8gPSBtaWQgZWxzZSBoaSA9IG1pZCAtIDEgZW5kCiAgICBlbmQKICAgIHEuZFtpXSA9IGxvCiAgICBpZiBsbyA+IDAgdGhlbiByID0gdXN1YihyLCBiaWdfbXVsKGIsIHsgc2lnbiA9IDEsIGQgPSB7IGxvIH0gfSkpIGVuZAogIGVuZAogIHEgPSBub3JtKHEpCiAgciA9IG5vcm0ocikKICBxLnNpZ24gPSBhLnNpZ24gKiBiLnNpZ24KICBpZiBpc196ZXJvKHEpIHRoZW4gcS5zaWduID0gMSBlbmQKICByLnNpZ24gPSBhLnNpZ24gIC0tIOS9meaVsOespuWPt+maj+iiq+mZpOaVsAogIGlmIGlzX3plcm8ocikgdGhlbiByLnNpZ24gPSAxIGVuZAogIHJldHVybiBxLCByCmVuZAoKbG9jYWwgZnVuY3Rpb24gYmlnX3BvdyhhLCBuKSAgLS0gbiDiiaUgMCDmlbTmlbDvvIjmma7pgJrmlbTmlbDvvIkKICBsb2NhbCByZXN1bHQgPSB7IHNpZ24gPSAxLCBkID0geyAxIH0gfQogIGxvY2FsIGJhc2UgPSBhCiAgd2hpbGUgbiA+IDAgZG8KICAgIGlmIG4gJSAyID09IDEgdGhlbiByZXN1bHQgPSBiaWdfbXVsKHJlc3VsdCwgYmFzZSkgZW5kCiAgICBiYXNlID0gYmlnX211bChiYXNlLCBiYXNlKQogICAgbiA9IG1hdGguZmxvb3IobiAvIDIpCiAgZW5kCiAgcmV0dXJuIHJlc3VsdAplbmQKCmxvY2FsIGZ1bmN0aW9uIGJpZ19jbXAoYSwgYikKICBpZiBhLnNpZ24gfj0gYi5zaWduIHRoZW4gcmV0dXJuIGEuc2lnbiA8IGIuc2lnbiBhbmQgLTEgb3IgMSBlbmQKICBsb2NhbCBjID0gdWNtcChhLCBiKQogIHJldHVybiBhLnNpZ24gPiAwIGFuZCBjIG9yIC1jCmVuZAoKLS0gPT09PT09PT09PT09IG9wIOWIhuWPkSA9PT09PT09PT09PT0KCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2ludCh2LCBuYW1lKQogIGlmIHR5cGUodikgPT0gJ251bWJlcicgdGhlbgogICAgaWYgdiB+PSBtYXRoLmZsb29yKHYpIHRoZW4gcmV0dXJuIG5pbCwgbmFtZSAuLiAnIG11c3QgYmUgYW4gaW50ZWdlcicgZW5kCiAgICByZXR1cm4gdgogIGVuZAogIGlmIHR5cGUodikgPT0gJ3N0cmluZycgYW5kIHY6bWF0Y2goJ15bLStdPyVkKyQnKSB0aGVuCiAgICByZXR1cm4gdG9udW1iZXIodikKICBlbmQKICByZXR1cm4gbmlsLCBuYW1lIC4uICcgbXVzdCBiZSBhbiBpbnRlZ2VyIChnb3QgJyAuLiB0b3N0cmluZyh2KSAuLiAnKScKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICAtLSDmqKHlnZfooajliIblj5Hlj6rorqQgLnJ1bu+8mkpTT04g5a2X56ym5Liy5Y+C5pWw5Zyo5q2k6Ieq6Kej56CB77yIZW50cnkg55qE5YWc5bqV5ZCM5qC35L+d55WZ77yJCiAgaWYgdHlwZShwKSA9PSAnc3RyaW5nJyB0aGVuCiAgICBsb2NhbCBvaywgZGVjb2RlZCA9IHBjYWxsKGpzb25fZGVjb2RlLCBwKQogICAgaWYgbm90IG9rIG9yIHR5cGUoZGVjb2RlZCkgfj0gJ3RhYmxlJyB0aGVuCiAgICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnYmFkIGpzb24gcGFyYW1zOiAnIC4uIHRvc3RyaW5nKHApIH0pCiAgICBlbmQKICAgIHAgPSBkZWNvZGVkCiAgZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAncGFyYW1zIG11c3QgYmUgYSB0YWJsZS9zdHJ1Y3QnIH0pCiAgZW5kCiAgbG9jYWwgb3AgPSBwLm9wCiAgaWYgb3AgPT0gbmlsIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnbWlzc2luZyBvcCcgfSkKICBlbmQKCiAgaWYgb3AgPT0gJ2ZhY3QnIHRoZW4KICAgIGxvY2FsIG4sIGVyciA9IHBhcnNlX2ludChwLm4sICduJykKICAgIGlmIG5vdCBuIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKHsgc3RhdHVzID0gJ0Vycm9yJywgbWVzc2FnZSA9IGVyciB9KSBlbmQKICAgIGlmIG4gPCAwIG9yIG4gPiAyMDAwMCB0aGVuCiAgICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnbiBvdXQgb2YgcmFuZ2UgWzAsMjAwMDBdOiAnIC4uIG4gfSkKICAgIGVuZAogICAgbG9jYWwgciA9IHsgc2lnbiA9IDEsIGQgPSB7IDEgfSB9CiAgICBmb3IgaSA9IDIsIG4gZG8gciA9IGJpZ19tdWwociwgeyBzaWduID0gMSwgZCA9IHsgaSB9IH0pIGVuZAogICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgciA9IGJpZ190b19zdHJpbmcocikgfSkKICBlbmQKCiAgaWYgb3AgPT0gJ3BvdycgdGhlbgogICAgbG9jYWwgbiwgZXJyID0gcGFyc2VfaW50KHAubiwgJ24nKQogICAgaWYgbm90IG4gdGhlbiByZXR1cm4ganNvbl9lbmNvZGUoeyBzdGF0dXMgPSAnRXJyb3InLCBtZXNzYWdlID0gZXJyIH0pIGVuZAogICAgaWYgbiA8IDAgb3IgbiA+IDEwMDAwIHRoZW4KICAgICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgc3RhdHVzID0gJ0Vycm9yJywgbWVzc2FnZSA9ICduIG91dCBvZiByYW5nZSBbMCwxMDAwMF06ICcgLi4gbiB9KQogICAgZW5kCiAgICBsb2NhbCBhLCBhZXJyID0gYmlnX2Zyb21fc3RyaW5nKHAuYSkKICAgIGlmIG5vdCBhIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKHsgc3RhdHVzID0gJ0Vycm9yJywgbWVzc2FnZSA9IGFlcnIgfSkgZW5kCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfcG93KGEsIG4pKSB9KQogIGVuZAoKICAtLSDlhbbkvZkgb3Ag6YO96KaBIGHjgIFiCiAgbG9jYWwgYSwgYWVyciA9IGJpZ19mcm9tX3N0cmluZyhwLmEpCiAgaWYgbm90IGEgdGhlbiByZXR1cm4ganNvbl9lbmNvZGUoeyBzdGF0dXMgPSAnRXJyb3InLCBtZXNzYWdlID0gYWVyciB9KSBlbmQKICBsb2NhbCBiLCBiZXJyID0gYmlnX2Zyb21fc3RyaW5nKHAuYikKICBpZiBub3QgYiB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSBiZXJyIH0pIGVuZAoKICBpZiBvcCA9PSAnbXVsJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfbXVsKGEsIGIpKSB9KQogIGVsc2VpZiBvcCA9PSAnYWRkJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfYWRkKGEsIGIpKSB9KQogIGVsc2VpZiBvcCA9PSAnc3ViJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeyByID0gYmlnX3RvX3N0cmluZyhiaWdfc3ViKGEsIGIpKSB9KQogIGVsc2VpZiBvcCA9PSAnbW9kJyB0aGVuCiAgICBsb2NhbCBxLCBtID0gYmlnX2Rpdm1vZChhLCBiKQogICAgaWYgbm90IHEgdGhlbiByZXR1cm4ganNvbl9lbmNvZGUoeyBzdGF0dXMgPSAnRXJyb3InLCBtZXNzYWdlID0gbSB9KSBlbmQKICAgIHJldHVybiBqc29uX2VuY29kZSh7IHIgPSBiaWdfdG9fc3RyaW5nKG0pIH0pCiAgZWxzZWlmIG9wID09ICdjbXAnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh7IHIgPSBiaWdfY21wKGEsIGIpIH0pCiAgZWxzZWlmIG9wID09ICdkaXYnIHRoZW4KICAgIGxvY2FsIHEsIG0gPSBiaWdfZGl2bW9kKGEsIGIpCiAgICBpZiBub3QgcSB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSBtIH0pIGVuZAogICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgcSA9IGJpZ190b19zdHJpbmcocSksIG0gPSBiaWdfdG9fc3RyaW5nKG0pIH0pCiAgZW5kCgogIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAndW5rbm93biBvcDogJyAuLiB0b3N0cmluZyhvcCkgfSkKZW5kCgotLSBlbnRyeShyYXcp77yac3RydWN077yIdGFibGXvvInnm7TnlKjvvJtKU09OIOWtl+espuS4suWGheiBlCBkZWNvZGXvvIh0b19sYW5jZSDnuqblrprvvInjgIIKLS0g6aG25bGCIHJldHVybiBlbnRyee+8iOS4gOS4qiBmdW5jdGlvbu+8ie+8jOa7oei2syBxdWlja19jb21waWxlL2luc3RhbGwg55qECi0tICJtdXN0IHJldHVybiBhIGZ1bmN0aW9uIiDlpZHnuqbvvJtsdWFqaXRfcygnYmlnbnVtJywgPHN0cnVjdHxqc29uPikg5Y2V5Y+C6L+b5YWlIGVudHJ544CCCmxvY2FsIGZ1bmN0aW9uIGVudHJ5KHJhdykKICBpZiB0eXBlKHJhdykgPT0gJ3N0cmluZycgdGhlbgogICAgbG9jYWwgb2ssIGRlY29kZWQgPSBwY2FsbChqc29uX2RlY29kZSwgcmF3KQogICAgaWYgbm90IG9rIG9yIHR5cGUoZGVjb2RlZCkgfj0gJ3RhYmxlJyB0aGVuCiAgICAgIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnRU5UUllfRVJSOiBiYWQganNvbiBwYXJhbXMnIH0pCiAgICBlbmQKICAgIHJhdyA9IGRlY29kZWQKICBlbmQKICBsb2NhbCBvaywgciA9IHBjYWxsKHJ1biwgcmF3KQogIGlmIG5vdCBvayB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IHN0YXR1cyA9ICdFcnJvcicsIG1lc3NhZ2UgPSAnRU5UUllfRVJSOiAnIC4uIHRvc3RyaW5nKHIpIH0pIGVuZAogIHJldHVybiByCmVuZAoKcmV0dXJuIGVudHJ5CgB3cmFwIGVycjogJXMKAC0tIEBsaWI6IGpzb24KLS0gQGNhdGVnb3J5OiBwYXJzZXIKLS0gQGRlc2M6IEpTT04g6Kej5p6QL+e8luegge+8iOe6ryBMdWHvvIkKLS0gQHNvdXJjZTogdmVuZG9yZWQgaHR0cHM6Ly9naXRodWIuY29tL3J4aS9qc29uLmx1YSAoTUlULCByeGkgMjAyMCkKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKHZlbmRvcmVkIHJ4aS9qc29uLmx1YSwgcnhpIDIwMjApCi0tIEBtYXR1cml0eTogYXVkaXRlZAotLQotLSBqc29uLmx1YQotLQotLSBDb3B5cmlnaHQgKGMpIDIwMjAgcnhpCi0tCi0tIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YKLS0gdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgIlNvZnR3YXJlIiksIHRvIGRlYWwgaW4KLS0gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0bwotLSB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcwotLSBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8KLS0gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOgotLQotLSBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwKLS0gY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS4KLS0KLS0gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IKLS0gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksCi0tIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRQotLSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSCi0tIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sCi0tIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFCi0tIFNPRlRXQVJFLgotLQoKbG9jYWwganNvbiA9IHsgX3ZlcnNpb24gPSAiMC4xLjIiIH0KCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLS0gRW5jb2RlCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KCmxvY2FsIGVuY29kZQoKbG9jYWwgZXNjYXBlX2NoYXJfbWFwID0gewogIFsgIlxcIiBdID0gIlxcIiwKICBbICJcIiIgXSA9ICJcIiIsCiAgWyAiXGIiIF0gPSAiYiIsCiAgWyAiXGYiIF0gPSAiZiIsCiAgWyAiXG4iIF0gPSAibiIsCiAgWyAiXHIiIF0gPSAiciIsCiAgWyAiXHQiIF0gPSAidCIsCn0KCmxvY2FsIGVzY2FwZV9jaGFyX21hcF9pbnYgPSB7IFsgIi8iIF0gPSAiLyIgfQpmb3IgaywgdiBpbiBwYWlycyhlc2NhcGVfY2hhcl9tYXApIGRvCiAgZXNjYXBlX2NoYXJfbWFwX2ludlt2XSA9IGsKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZXNjYXBlX2NoYXIoYykKICByZXR1cm4gIlxcIiAuLiAoZXNjYXBlX2NoYXJfbWFwW2NdIG9yIHN0cmluZy5mb3JtYXQoInUlMDR4IiwgYzpieXRlKCkpKQplbmQKCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfbmlsKHZhbCkKICByZXR1cm4gIm51bGwiCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVuY29kZV90YWJsZSh2YWwsIHN0YWNrKQogIGxvY2FsIHJlcyA9IHt9CiAgc3RhY2sgPSBzdGFjayBvciB7fQoKICAtLSBDaXJjdWxhciByZWZlcmVuY2U/CiAgaWYgc3RhY2tbdmFsXSB0aGVuIGVycm9yKCJjaXJjdWxhciByZWZlcmVuY2UiKSBlbmQKCiAgc3RhY2tbdmFsXSA9IHRydWUKCiAgaWYgcmF3Z2V0KHZhbCwgMSkgfj0gbmlsIG9yIG5leHQodmFsKSA9PSBuaWwgdGhlbgogICAgLS0gVHJlYXQgYXMgYXJyYXkgLS0gY2hlY2sga2V5cyBhcmUgdmFsaWQgYW5kIGl0IGlzIG5vdCBzcGFyc2UKICAgIGxvY2FsIG4gPSAwCiAgICBmb3IgayBpbiBwYWlycyh2YWwpIGRvCiAgICAgIGlmIHR5cGUoaykgfj0gIm51bWJlciIgdGhlbgogICAgICAgIGVycm9yKCJpbnZhbGlkIHRhYmxlOiBtaXhlZCBvciBpbnZhbGlkIGtleSB0eXBlcyIpCiAgICAgIGVuZAogICAgICBuID0gbiArIDEKICAgIGVuZAogICAgaWYgbiB+PSAjdmFsIHRoZW4KICAgICAgZXJyb3IoImludmFsaWQgdGFibGU6IHNwYXJzZSBhcnJheSIpCiAgICBlbmQKICAgIC0tIEVuY29kZQogICAgZm9yIGksIHYgaW4gaXBhaXJzKHZhbCkgZG8KICAgICAgdGFibGUuaW5zZXJ0KHJlcywgZW5jb2RlKHYsIHN0YWNrKSkKICAgIGVuZAogICAgc3RhY2tbdmFsXSA9IG5pbAogICAgcmV0dXJuICJbIiAuLiB0YWJsZS5jb25jYXQocmVzLCAiLCIpIC4uICJdIgoKICBlbHNlCiAgICAtLSBUcmVhdCBhcyBhbiBvYmplY3QKICAgIGZvciBrLCB2IGluIHBhaXJzKHZhbCkgZG8KICAgICAgaWYgdHlwZShrKSB+PSAic3RyaW5nIiB0aGVuCiAgICAgICAgZXJyb3IoImludmFsaWQgdGFibGU6IG1peGVkIG9yIGludmFsaWQga2V5IHR5cGVzIikKICAgICAgZW5kCiAgICAgIHRhYmxlLmluc2VydChyZXMsIGVuY29kZShrLCBzdGFjaykgLi4gIjoiIC4uIGVuY29kZSh2LCBzdGFjaykpCiAgICBlbmQKICAgIHN0YWNrW3ZhbF0gPSBuaWwKICAgIHJldHVybiAieyIgLi4gdGFibGUuY29uY2F0KHJlcywgIiwiKSAuLiAifSIKICBlbmQKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX3N0cmluZyh2YWwpCiAgcmV0dXJuICciJyAuLiB2YWw6Z3N1YignWyV6XDEtXDMxXFwiXScsIGVzY2FwZV9jaGFyKSAuLiAnIicKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX251bWJlcih2YWwpCiAgLS0gQ2hlY2sgZm9yIE5hTiwgLWluZiBhbmQgaW5mCiAgaWYgdmFsIH49IHZhbCBvciB2YWwgPD0gLW1hdGguaHVnZSBvciB2YWwgPj0gbWF0aC5odWdlIHRoZW4KICAgIGVycm9yKCJ1bmV4cGVjdGVkIG51bWJlciB2YWx1ZSAnIiAuLiB0b3N0cmluZyh2YWwpIC4uICInIikKICBlbmQKICByZXR1cm4gc3RyaW5nLmZvcm1hdCgiJS4xNGciLCB2YWwpCmVuZAoKCmxvY2FsIHR5cGVfZnVuY19tYXAgPSB7CiAgWyAibmlsIiAgICAgXSA9IGVuY29kZV9uaWwsCiAgWyAidGFibGUiICAgXSA9IGVuY29kZV90YWJsZSwKICBbICJzdHJpbmciICBdID0gZW5jb2RlX3N0cmluZywKICBbICJudW1iZXIiICBdID0gZW5jb2RlX251bWJlciwKICBbICJib29sZWFuIiBdID0gdG9zdHJpbmcsCn0KCgplbmNvZGUgPSBmdW5jdGlvbih2YWwsIHN0YWNrKQogIGxvY2FsIHQgPSB0eXBlKHZhbCkKICBsb2NhbCBmID0gdHlwZV9mdW5jX21hcFt0XQogIGlmIGYgdGhlbgogICAgcmV0dXJuIGYodmFsLCBzdGFjaykKICBlbmQKICBlcnJvcigidW5leHBlY3RlZCB0eXBlICciIC4uIHQgLi4gIiciKQplbmQKCgpmdW5jdGlvbiBqc29uLmVuY29kZSh2YWwpCiAgcmV0dXJuICggZW5jb2RlKHZhbCkgKQplbmQKCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIERlY29kZQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpsb2NhbCBwYXJzZQoKbG9jYWwgZnVuY3Rpb24gY3JlYXRlX3NldCguLi4pCiAgbG9jYWwgcmVzID0ge30KICBmb3IgaSA9IDEsIHNlbGVjdCgiIyIsIC4uLikgZG8KICAgIHJlc1sgc2VsZWN0KGksIC4uLikgXSA9IHRydWUKICBlbmQKICByZXR1cm4gcmVzCmVuZAoKbG9jYWwgc3BhY2VfY2hhcnMgICA9IGNyZWF0ZV9zZXQoIiAiLCAiXHQiLCAiXHIiLCAiXG4iKQpsb2NhbCBkZWxpbV9jaGFycyAgID0gY3JlYXRlX3NldCgiICIsICJcdCIsICJcciIsICJcbiIsICJdIiwgIn0iLCAiLCIpCmxvY2FsIGVzY2FwZV9jaGFycyAgPSBjcmVhdGVfc2V0KCJcXCIsICIvIiwgJyInLCAiYiIsICJmIiwgIm4iLCAiciIsICJ0IiwgInUiKQpsb2NhbCBsaXRlcmFscyAgICAgID0gY3JlYXRlX3NldCgidHJ1ZSIsICJmYWxzZSIsICJudWxsIikKCmxvY2FsIGxpdGVyYWxfbWFwID0gewogIFsgInRydWUiICBdID0gdHJ1ZSwKICBbICJmYWxzZSIgXSA9IGZhbHNlLAogIFsgIm51bGwiICBdID0gbmlsLAp9CgoKbG9jYWwgZnVuY3Rpb24gbmV4dF9jaGFyKHN0ciwgaWR4LCBzZXQsIG5lZ2F0ZSkKICBmb3IgaSA9IGlkeCwgI3N0ciBkbwogICAgaWYgc2V0W3N0cjpzdWIoaSwgaSldIH49IG5lZ2F0ZSB0aGVuCiAgICAgIHJldHVybiBpCiAgICBlbmQKICBlbmQKICByZXR1cm4gI3N0ciArIDEKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZGVjb2RlX2Vycm9yKHN0ciwgaWR4LCBtc2cpCiAgbG9jYWwgbGluZV9jb3VudCA9IDEKICBsb2NhbCBjb2xfY291bnQgPSAxCiAgZm9yIGkgPSAxLCBpZHggLSAxIGRvCiAgICBjb2xfY291bnQgPSBjb2xfY291bnQgKyAxCiAgICBpZiBzdHI6c3ViKGksIGkpID09ICJcbiIgdGhlbgogICAgICBsaW5lX2NvdW50ID0gbGluZV9jb3VudCArIDEKICAgICAgY29sX2NvdW50ID0gMQogICAgZW5kCiAgZW5kCiAgZXJyb3IoIHN0cmluZy5mb3JtYXQoIiVzIGF0IGxpbmUgJWQgY29sICVkIiwgbXNnLCBsaW5lX2NvdW50LCBjb2xfY291bnQpICkKZW5kCgoKbG9jYWwgZnVuY3Rpb24gY29kZXBvaW50X3RvX3V0ZjgobikKICAtLSBodHRwOi8vc2NyaXB0cy5zaWwub3JnL2Ntcy9zY3JpcHRzL3BhZ2UucGhwP3NpdGVfaWQ9bnJzaSZpZD1pd3MtYXBwZW5kaXhhCiAgbG9jYWwgZiA9IG1hdGguZmxvb3IKICBpZiBuIDw9IDB4N2YgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKG4pCiAgZWxzZWlmIG4gPD0gMHg3ZmYgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKGYobiAvIDY0KSArIDE5MiwgbiAlIDY0ICsgMTI4KQogIGVsc2VpZiBuIDw9IDB4ZmZmZiB0aGVuCiAgICByZXR1cm4gc3RyaW5nLmNoYXIoZihuIC8gNDA5NikgKyAyMjQsIGYobiAlIDQwOTYgLyA2NCkgKyAxMjgsIG4gJSA2NCArIDEyOCkKICBlbHNlaWYgbiA8PSAweDEwZmZmZiB0aGVuCiAgICByZXR1cm4gc3RyaW5nLmNoYXIoZihuIC8gMjYyMTQ0KSArIDI0MCwgZihuICUgMjYyMTQ0IC8gNDA5NikgKyAxMjgsCiAgICAgICAgICAgICAgICAgICAgICAgZihuICUgNDA5NiAvIDY0KSArIDEyOCwgbiAlIDY0ICsgMTI4KQogIGVuZAogIGVycm9yKCBzdHJpbmcuZm9ybWF0KCJpbnZhbGlkIHVuaWNvZGUgY29kZXBvaW50ICcleCciLCBuKSApCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3VuaWNvZGVfZXNjYXBlKHMpCiAgbG9jYWwgbjEgPSB0b251bWJlciggczpzdWIoMSwgNCksICAxNiApCiAgbG9jYWwgbjIgPSB0b251bWJlciggczpzdWIoNywgMTApLCAxNiApCiAgIC0tIFN1cnJvZ2F0ZSBwYWlyPwogIGlmIG4yIHRoZW4KICAgIHJldHVybiBjb2RlcG9pbnRfdG9fdXRmOCgobjEgLSAweGQ4MDApICogMHg0MDAgKyAobjIgLSAweGRjMDApICsgMHgxMDAwMCkKICBlbHNlCiAgICByZXR1cm4gY29kZXBvaW50X3RvX3V0ZjgobjEpCiAgZW5kCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3N0cmluZyhzdHIsIGkpCiAgbG9jYWwgcmVzID0gIiIKICBsb2NhbCBqID0gaSArIDEKICBsb2NhbCBrID0gagoKICB3aGlsZSBqIDw9ICNzdHIgZG8KICAgIGxvY2FsIHggPSBzdHI6Ynl0ZShqKQoKICAgIGlmIHggPCAzMiB0aGVuCiAgICAgIGRlY29kZV9lcnJvcihzdHIsIGosICJjb250cm9sIGNoYXJhY3RlciBpbiBzdHJpbmciKQoKICAgIGVsc2VpZiB4ID09IDkyIHRoZW4gLS0gYFxgOiBFc2NhcGUKICAgICAgcmVzID0gcmVzIC4uIHN0cjpzdWIoaywgaiAtIDEpCiAgICAgIGogPSBqICsgMQogICAgICBsb2NhbCBjID0gc3RyOnN1YihqLCBqKQogICAgICBpZiBjID09ICJ1IiB0aGVuCiAgICAgICAgbG9jYWwgaGV4ID0gc3RyOm1hdGNoKCJeW2REXVs4OWFBYkJdJXgleFxcdSV4JXgleCV4IiwgaiArIDEpCiAgICAgICAgICAgICAgICAgb3Igc3RyOm1hdGNoKCJeJXgleCV4JXgiLCBqICsgMSkKICAgICAgICAgICAgICAgICBvciBkZWNvZGVfZXJyb3Ioc3RyLCBqIC0gMSwgImludmFsaWQgdW5pY29kZSBlc2NhcGUgaW4gc3RyaW5nIikKICAgICAgICByZXMgPSByZXMgLi4gcGFyc2VfdW5pY29kZV9lc2NhcGUoaGV4KQogICAgICAgIGogPSBqICsgI2hleAogICAgICBlbHNlCiAgICAgICAgaWYgbm90IGVzY2FwZV9jaGFyc1tjXSB0aGVuCiAgICAgICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBqIC0gMSwgImludmFsaWQgZXNjYXBlIGNoYXIgJyIgLi4gYyAuLiAiJyBpbiBzdHJpbmciKQogICAgICAgIGVuZAogICAgICAgIHJlcyA9IHJlcyAuLiBlc2NhcGVfY2hhcl9tYXBfaW52W2NdCiAgICAgIGVuZAogICAgICBrID0gaiArIDEKCiAgICBlbHNlaWYgeCA9PSAzNCB0aGVuIC0tIGAiYDogRW5kIG9mIHN0cmluZwogICAgICByZXMgPSByZXMgLi4gc3RyOnN1YihrLCBqIC0gMSkKICAgICAgcmV0dXJuIHJlcywgaiArIDEKICAgIGVuZAoKICAgIGogPSBqICsgMQogIGVuZAoKICBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgY2xvc2luZyBxdW90ZSBmb3Igc3RyaW5nIikKZW5kCgoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfbnVtYmVyKHN0ciwgaSkKICBsb2NhbCB4ID0gbmV4dF9jaGFyKHN0ciwgaSwgZGVsaW1fY2hhcnMpCiAgbG9jYWwgcyA9IHN0cjpzdWIoaSwgeCAtIDEpCiAgbG9jYWwgbiA9IHRvbnVtYmVyKHMpCiAgaWYgbm90IG4gdGhlbgogICAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImludmFsaWQgbnVtYmVyICciIC4uIHMgLi4gIiciKQogIGVuZAogIHJldHVybiBuLCB4CmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2xpdGVyYWwoc3RyLCBpKQogIGxvY2FsIHggPSBuZXh0X2NoYXIoc3RyLCBpLCBkZWxpbV9jaGFycykKICBsb2NhbCB3b3JkID0gc3RyOnN1YihpLCB4IC0gMSkKICBpZiBub3QgbGl0ZXJhbHNbd29yZF0gdGhlbgogICAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImludmFsaWQgbGl0ZXJhbCAnIiAuLiB3b3JkIC4uICInIikKICBlbmQKICByZXR1cm4gbGl0ZXJhbF9tYXBbd29yZF0sIHgKZW5kCgoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfYXJyYXkoc3RyLCBpKQogIGxvY2FsIHJlcyA9IHt9CiAgbG9jYWwgbiA9IDEKICBpID0gaSArIDEKICB3aGlsZSAxIGRvCiAgICBsb2NhbCB4CiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICAtLSBFbXB0eSAvIGVuZCBvZiBhcnJheT8KICAgIGlmIHN0cjpzdWIoaSwgaSkgPT0gIl0iIHRoZW4KICAgICAgaSA9IGkgKyAxCiAgICAgIGJyZWFrCiAgICBlbmQKICAgIC0tIFJlYWQgdG9rZW4KICAgIHgsIGkgPSBwYXJzZShzdHIsIGkpCiAgICByZXNbbl0gPSB4CiAgICBuID0gbiArIDEKICAgIC0tIE5leHQgdG9rZW4KICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpLCBzcGFjZV9jaGFycywgdHJ1ZSkKICAgIGxvY2FsIGNociA9IHN0cjpzdWIoaSwgaSkKICAgIGkgPSBpICsgMQogICAgaWYgY2hyID09ICJdIiB0aGVuIGJyZWFrIGVuZAogICAgaWYgY2hyIH49ICIsIiB0aGVuIGRlY29kZV9lcnJvcihzdHIsIGksICJleHBlY3RlZCAnXScgb3IgJywnIikgZW5kCiAgZW5kCiAgcmV0dXJuIHJlcywgaQplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9vYmplY3Qoc3RyLCBpKQogIGxvY2FsIHJlcyA9IHt9CiAgaSA9IGkgKyAxCiAgd2hpbGUgMSBkbwogICAgbG9jYWwga2V5LCB2YWwKICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpLCBzcGFjZV9jaGFycywgdHJ1ZSkKICAgIC0tIEVtcHR5IC8gZW5kIG9mIG9iamVjdD8KICAgIGlmIHN0cjpzdWIoaSwgaSkgPT0gIn0iIHRoZW4KICAgICAgaSA9IGkgKyAxCiAgICAgIGJyZWFrCiAgICBlbmQKICAgIC0tIFJlYWQga2V5CiAgICBpZiBzdHI6c3ViKGksIGkpIH49ICciJyB0aGVuCiAgICAgIGRlY29kZV9lcnJvcihzdHIsIGksICJleHBlY3RlZCBzdHJpbmcgZm9yIGtleSIpCiAgICBlbmQKICAgIGtleSwgaSA9IHBhcnNlKHN0ciwgaSkKICAgIC0tIFJlYWQgJzonIGRlbGltaXRlcgogICAgaSA9IG5leHRfY2hhcihzdHIsIGksIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgaWYgc3RyOnN1YihpLCBpKSB+PSAiOiIgdGhlbgogICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgJzonIGFmdGVyIGtleSIpCiAgICBlbmQKICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpICsgMSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICAtLSBSZWFkIHZhbHVlCiAgICB2YWwsIGkgPSBwYXJzZShzdHIsIGkpCiAgICAtLSBTZXQKICAgIHJlc1trZXldID0gdmFsCiAgICAtLSBOZXh0IHRva2VuCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICBsb2NhbCBjaHIgPSBzdHI6c3ViKGksIGkpCiAgICBpID0gaSArIDEKICAgIGlmIGNociA9PSAifSIgdGhlbiBicmVhayBlbmQKICAgIGlmIGNociB+PSAiLCIgdGhlbiBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgJ30nIG9yICcsJyIpIGVuZAogIGVuZAogIHJldHVybiByZXMsIGkKZW5kCgoKbG9jYWwgY2hhcl9mdW5jX21hcCA9IHsKICBbICciJyBdID0gcGFyc2Vfc3RyaW5nLAogIFsgIjAiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiMSIgXSA9IHBhcnNlX251bWJlciwKICBbICIyIiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjMiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiNCIgXSA9IHBhcnNlX251bWJlciwKICBbICI1IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjYiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiNyIgXSA9IHBhcnNlX251bWJlciwKICBbICI4IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjkiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiLSIgXSA9IHBhcnNlX251bWJlciwKICBbICJ0IiBdID0gcGFyc2VfbGl0ZXJhbCwKICBbICJmIiBdID0gcGFyc2VfbGl0ZXJhbCwKICBbICJuIiBdID0gcGFyc2VfbGl0ZXJhbCwKICBbICJbIiBdID0gcGFyc2VfYXJyYXksCiAgWyAieyIgXSA9IHBhcnNlX29iamVjdCwKfQoKCnBhcnNlID0gZnVuY3Rpb24oc3RyLCBpZHgpCiAgbG9jYWwgY2hyID0gc3RyOnN1YihpZHgsIGlkeCkKICBsb2NhbCBmID0gY2hhcl9mdW5jX21hcFtjaHJdCiAgaWYgZiB0aGVuCiAgICByZXR1cm4gZihzdHIsIGlkeCkKICBlbmQKICBkZWNvZGVfZXJyb3Ioc3RyLCBpZHgsICJ1bmV4cGVjdGVkIGNoYXJhY3RlciAnIiAuLiBjaHIgLi4gIiciKQplbmQKCgpmdW5jdGlvbiBqc29uLmRlY29kZShzdHIpCiAgaWYgdHlwZShzdHIpIH49ICJzdHJpbmciIHRoZW4KICAgIGVycm9yKCJleHBlY3RlZCBhcmd1bWVudCBvZiB0eXBlIHN0cmluZywgZ290ICIgLi4gdHlwZShzdHIpKQogIGVuZAogIGxvY2FsIHJlcywgaWR4ID0gcGFyc2Uoc3RyLCBuZXh0X2NoYXIoc3RyLCAxLCBzcGFjZV9jaGFycywgdHJ1ZSkpCiAgaWR4ID0gbmV4dF9jaGFyKHN0ciwgaWR4LCBzcGFjZV9jaGFycywgdHJ1ZSkKICBpZiBpZHggPD0gI3N0ciB0aGVuCiAgICBkZWNvZGVfZXJyb3Ioc3RyLCBpZHgsICJ0cmFpbGluZyBnYXJiYWdlIikKICBlbmQKICByZXR1cm4gcmVzCmVuZAoKCnJldHVybiBqc29uCgBfZHVja2RiX2NhbGwgPSBmdW5jdGlvbihzcWwpIHJldHVybiBfX2RiYyhzcWwpIGVuZApfZHVja2RiX3F1ZXJ5ID0gZnVuY3Rpb24oc3FsKQogIGxvY2FsIHMgPSBfX2RicShzcWwpCiAgbG9jYWwgb2ssIGogPSBwY2FsbChfbGlicy5qc29uLmRlY29kZSwgcykKICBpZiBub3Qgb2sgb3IgdHlwZShqKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIG5pbCwgJ2RlY29kZV9lcnI6ICcgLi4gdG9zdHJpbmcoaikgZW5kCiAgcmV0dXJuIGoucm93cywgai5lcnIKZW5kCgAtLSBAbGliOiBqc29ucGF0aAotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogUkZDIDk1MzUgSlNPTlBhdGgg5a6e55So5a2Q6ZuG77yI6Ieq5ZCr57qvIEx1Ye+8jOaXoCBGRknvvInigJTigJQgRHVja0RCIOWGheW7uiBqc29uX2V4dHJhY3QKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tICAgICAgIOWPquaUr+aMgeeugOWNleaIkOWRmC/ntKLlvJXot6/lvoTvvIzkuI3mlK/mjIHpgJrphY0gKuOAgemAkuW9kuS4i+mZjSAkLi5444CB6L+H5ruk6LCT6K+NIFs/KEAuYT4xKV3jgIIKLS0gICAgICAg5pys5bqT6KGl6b2Q77yMcXVlcnkoZG9jLCBleHByKSDihpIg5ZG95Lit5YC8IEpTT04g5pWw57uE77yI5paH5qGj6aG65bqP77yM5L+d55WZ6YeN5aSN77yJ44CCCi0tICAgICAgIOaUr+aMgeWtkOmbhu+8miQg5qC577ybLm5hbWUgLyBbJ25hbWUnXSDmiJDlkZjvvJsqIOmAmumFje+8m1tuXS9bLW5dIOaVsOe7hOe0ouW8le+8mwotLSAgICAgICAkLi5uYW1lIC8gLi5uYW1lIOmAkuW9kuS4i+mZje+8m1s/KEAucGF0aCBvcCBsaXRlcmFsKV0g6L+H5ruk77yIb3A6ID0gIT0gPCA8PSA+ID4977yMCi0tICAgICAgIOWPryBhbmQg57uE5ZCI77yMQC5rZXkg5pegIG9wIOaXtuihqOWtmOWcqOaAp++8ieOAggotLSAgICAgICBvcCDpgInpobnvvIh2ID0gSlNPTiDmlofmoaPlrZfnrKbkuLLvvIxlID0gSlNPTlBhdGgg6KGo6L6+5byP77yJ77yaCi0tICAgICAgICAgJ3F1ZXJ5JyAg4oaSIOWRveS4reWAvCBKU09OIOaVsOe7hO+8iOm7mOiupO+8iQotLSAgICAgICAgICdleGlzdHMnIOKGkiB0cnVlL2ZhbHNl77yI5piv5ZCm6Iez5bCR5LiA5Liq5ZG95Lit77yJCi0tICAgICAgICAgJ2NvdW50JyAg4oaSIOWRveS4reS4quaVsO+8iOaVsOWtl++8iQotLSAgICAgICAgICdmaXJzdCcgIOKGkiDpppbkuKrlkb3kuK3lgLzvvIjml6DliJkgbnVsbO+8iQotLSAgICAgICDms6jmhI/vvJpMdWEg6KGo5a2Y5LiN5LqGIG51bGzvvIzlgLzph4znmoQgbnVsbCDmjInnvLrlpLHlpITnkIbvvJvmlbDnu4Tku6UgMS1iYXNlZCDooajlrZjlgqjvvIwKLS0gICAgICAgSlNPTlBhdGgg55qEIDAtYmFzZWQg5LiL5qCH5YaF6YOo6L2s5o2i77yI6LSf5LiL5qCHIFstMV095pyr5L2N77yJ44CCCi0tICAgICAgIOmqjOivge+8mmxpYnMvcGFyc2VyL2pzb25wYXRoX3ZlcmlmeS5wee+8iFB5dGhvbiDlj4LogIPlrp7njrAgKyBSRkMgOTUzNSDplJrngrnkuqTlj4nmoKHpqozvvInjgIIKCmxvY2FsIGpwID0ge30KCi0tID09PT09PT09PT09PT09PT09PT09PSDoh6rlkKsgSlNPTiDop6PnoIEgPT09PT09PT09PT09PT09PT09PT09Ci0tIOiusOW9leWvueixoemUrueahCoq5paH5qGj77yI5paH5pys77yJ6aG65bqPKirvvIhSRkMgOTUzNSDnu5PmnpzpobvmjInmlofmoaPpobrluo/vvIzogIwgTHVhIOihqOaXoOW6j++8ieOAggotLSDnlKjlvLHms6jlhozooajpgb/lhY3lvJXnlKjms4TmvI/vvJvop6PnoIHlkI4gc29ydGVkX2tleXMoKSDmjInmraTpobrluo/ovpPlh7rjgIIKbG9jYWwga2V5X29yZGVyID0gc2V0bWV0YXRhYmxlKHt9LCB7X19tb2RlID0gJ2snfSkKbG9jYWwgZnVuY3Rpb24ganNvbl9kZWNvZGUocykKICBsb2NhbCBwb3MgPSAxCiAgbG9jYWwgZnVuY3Rpb24gZXJyKG0sIHApIGVycm9yKCdqc29uOiAnLi5tLi4ocCBhbmQgKCcgQCAnLi5wKSBvciAnJyksIDApIGVuZAogIGxvY2FsIGZ1bmN0aW9uIHdzKCkKICAgIHdoaWxlIHRydWUgZG8KICAgICAgbG9jYWwgYyA9IHM6c3ViKHBvcyxwb3MpCiAgICAgIGlmIGM9PScgJyBvciBjPT0nXHQnIG9yIGM9PSdcbicgb3IgYz09J1xyJyB0aGVuIHBvcyA9IHBvcysxIGVsc2UgYnJlYWsgZW5kCiAgICBlbmQKICBlbmQKICBsb2NhbCBwYXJzZV92YWx1ZQogIGxvY2FsIGZ1bmN0aW9uIHBhcnNlX3N0cmluZygpCiAgICBpZiBzOnN1Yihwb3MscG9zKSB+PSAnIicgdGhlbiBlcnIoJ2V4cGVjdGVkIHN0cmluZycsIHBvcykgZW5kCiAgICBwb3MgPSBwb3MgKyAxCiAgICBsb2NhbCBidWYgPSB7fQogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBsb2NhbCBjID0gczpzdWIocG9zLHBvcykKICAgICAgaWYgYyA9PSAnJyB0aGVuIGVycigndW50ZXJtaW5hdGVkIHN0cmluZycsIHBvcykgZW5kCiAgICAgIGlmIGMgPT0gJyInIHRoZW4gcG9zID0gcG9zICsgMTsgYnJlYWsgZW5kCiAgICAgIGlmIGMgPT0gJ1xcJyB0aGVuCiAgICAgICAgbG9jYWwgZSA9IHM6c3ViKHBvcysxLHBvcysxKTsgcG9zID0gcG9zICsgMgogICAgICAgIGlmIGU9PSciJyB0aGVuIHRhYmxlLmluc2VydChidWYsJyInKQogICAgICAgIGVsc2VpZiBlPT0nXFwnIHRoZW4gdGFibGUuaW5zZXJ0KGJ1ZiwnXFwnKQogICAgICAgIGVsc2VpZiBlPT0nLycgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCcvJykKICAgICAgICBlbHNlaWYgZT09J2InIHRoZW4gdGFibGUuaW5zZXJ0KGJ1ZiwnXGInKQogICAgICAgIGVsc2VpZiBlPT0nZicgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCdcZicpCiAgICAgICAgZWxzZWlmIGU9PSduJyB0aGVuIHRhYmxlLmluc2VydChidWYsJ1xuJykKICAgICAgICBlbHNlaWYgZT09J3InIHRoZW4gdGFibGUuaW5zZXJ0KGJ1ZiwnXHInKQogICAgICAgIGVsc2VpZiBlPT0ndCcgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCdcdCcpCiAgICAgICAgZWxzZWlmIGU9PSd1JyB0aGVuCiAgICAgICAgICBsb2NhbCBoID0gczpzdWIocG9zLHBvcyszKTsgcG9zID0gcG9zICsgNAogICAgICAgICAgbG9jYWwgY3AgPSB0b251bWJlcihoLDE2KSBvciAwCiAgICAgICAgICBpZiBjcCA8IDB4ODAgdGhlbiB0YWJsZS5pbnNlcnQoYnVmLCBzdHJpbmcuY2hhcihjcCkpCiAgICAgICAgICBlbHNlaWYgY3AgPCAweDgwMCB0aGVuIHRhYmxlLmluc2VydChidWYsIHN0cmluZy5jaGFyKDB4QzArbWF0aC5mbG9vcihjcC82NCksIDB4ODArY3AlNjQpKQogICAgICAgICAgZWxzZSB0YWJsZS5pbnNlcnQoYnVmLCBzdHJpbmcuY2hhcigweEUwK21hdGguZmxvb3IoY3AvNDA5NiksIDB4ODArbWF0aC5mbG9vcihjcC82NCklNjQsIDB4ODArY3AlNjQpKSBlbmQKICAgICAgICBlbHNlIGVycignYmFkIGVzY2FwZScsIHBvcy0yKSBlbmQKICAgICAgZWxzZSB0YWJsZS5pbnNlcnQoYnVmLCBjKTsgcG9zID0gcG9zICsgMSBlbmQKICAgIGVuZAogICAgcmV0dXJuIHRhYmxlLmNvbmNhdChidWYpCiAgZW5kCiAgcGFyc2VfdmFsdWUgPSBmdW5jdGlvbigpCiAgICB3cygpCiAgICBsb2NhbCBjID0gczpzdWIocG9zLHBvcykKICAgIGlmIGMgPT0gJycgdGhlbiBlcnIoJ3VuZXhwZWN0ZWQgZW5kJywgcG9zKSBlbmQKICAgIGlmIGMgPT0gJyInIHRoZW4gcmV0dXJuIHBhcnNlX3N0cmluZygpIGVuZAogICAgaWYgYyA9PSAneycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxOyBsb2NhbCB0ID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MscG9zKSA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gdCBlbmQKICAgICAga2V5X29yZGVyW3RdID0ge30KICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBrID0gcGFyc2Vfc3RyaW5nKCkKICAgICAgICBrZXlfb3JkZXJbdF1bI2tleV9vcmRlclt0XSsxXSA9IGsKICAgICAgICB3cygpCiAgICAgICAgaWYgczpzdWIocG9zLHBvcykgfj0gJzonIHRoZW4gZXJyKCdleHBlY3RlZCA6JywgcG9zKSBlbmQKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgICAgbG9jYWwgdiA9IHBhcnNlX3ZhbHVlKCkKICAgICAgICB0W2tdID0gdgogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBjMiA9IHM6c3ViKHBvcyxwb3MpCiAgICAgICAgaWYgYzIgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICAgIGVsc2VpZiBjMiA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxOyBicmVhawogICAgICAgIGVsc2UgZXJyKCdleHBlY3RlZCAsIG9yIH0nLCBwb3MpIGVuZAogICAgICBlbmQKICAgICAgcmV0dXJuIHQKICAgIGVuZAogICAgaWYgYyA9PSAnWycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxOyBsb2NhbCB0ID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MscG9zKSA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gdCBlbmQKICAgICAgbG9jYWwgbiA9IDAKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIGxvY2FsIHYgPSBwYXJzZV92YWx1ZSgpOyBuID0gbiArIDE7IHRbbl0gPSB2CiAgICAgICAgd3MoKQogICAgICAgIGxvY2FsIGMyID0gczpzdWIocG9zLHBvcykKICAgICAgICBpZiBjMiA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIGMyID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDE7IGJyZWFrCiAgICAgICAgZWxzZSBlcnIoJ2V4cGVjdGVkICwgb3IgXScsIHBvcykgZW5kCiAgICAgIGVuZAogICAgICByZXR1cm4gdAogICAgZW5kCiAgICBpZiBjID09ICd0JyB0aGVuIGlmIHM6c3ViKHBvcyxwb3MrMyk9PSd0cnVlJyB0aGVuIHBvcz1wb3MrNDsgcmV0dXJuIHRydWUgZW5kIGVycignYmFkIGxpdGVyYWwnLCBwb3MpIGVuZAogICAgaWYgYyA9PSAnZicgdGhlbiBpZiBzOnN1Yihwb3MscG9zKzQpPT0nZmFsc2UnIHRoZW4gcG9zPXBvcys1OyByZXR1cm4gZmFsc2UgZW5kIGVycignYmFkIGxpdGVyYWwnLCBwb3MpIGVuZAogICAgaWYgYyA9PSAnbicgdGhlbiBpZiBzOnN1Yihwb3MscG9zKzMpPT0nbnVsbCcgdGhlbiBwb3M9cG9zKzQ7IHJldHVybiBuaWwgZW5kIGVycignYmFkIGxpdGVyYWwnLCBwb3MpIGVuZAogICAgbG9jYWwgbnVtID0gczptYXRjaCgnXi0/JWQrJS4/JWQqW2VFXT9bKy1dPyVkKicsIHBvcykKICAgIGlmIG51bSBhbmQgbnVtIH49ICcnIHRoZW4gcG9zID0gcG9zICsgI251bTsgcmV0dXJuIHRvbnVtYmVyKG51bSkgZW5kCiAgICBlcnIoJ3VuZXhwZWN0ZWQgY2hhciAnLi5jLCBwb3MpCiAgZW5kCiAgbG9jYWwgdiA9IHBhcnNlX3ZhbHVlKCkKICB3cygpCiAgaWYgcG9zIDw9ICNzIHRoZW4gZXJyKCd0cmFpbGluZyBkYXRhJywgcG9zKSBlbmQKICByZXR1cm4gdgplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PSDoh6rlkKsgSlNPTiDnvJbnoIEgPT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGpzb25fZXNjYXBlKHN0cikKICByZXR1cm4gKHN0cjpnc3ViKCdbJXpcMS1cMzFcXCJdJywgZnVuY3Rpb24oYykKICAgIGxvY2FsIG0gPSB7IFsnXFwnXT0nXFxcXCcsIFsnIiddPSdcXCInLCBbJ1xuJ109J1xcbicsIFsnXHInXT0nXFxyJywKICAgICAgICAgICAgICAgIFsnXHQnXT0nXFx0JywgWydcYiddPSdcXGInLCBbJ1xmJ109J1xcZicgfQogICAgaWYgbVtjXSB0aGVuIHJldHVybiBtW2NdIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBzdHI6Ynl0ZSgpKQogIGVuZCkpCmVuZApsb2NhbCBqc29uX2VuY29kZQpsb2NhbCBmdW5jdGlvbiBlbmNvZGUodikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICdib29sZWFuJyB0aGVuIHJldHVybiB2IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJyBlbmQKICBpZiB0ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgPT0gbWF0aC5mbG9vcih2KSBhbmQgbWF0aC5hYnModikgPCAxZTE1IHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkJywgdikgZW5kCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS4xNWcnLCB2KQogIGVuZAogIGlmIHQgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gJyInLi5qc29uX2VzY2FwZSh2KS4uJ1wiJyBlbmQKICBpZiB0ID09ICd0YWJsZScgdGhlbgogICAgbG9jYWwgaXNhcnIsIG4gPSB0cnVlLCAwCiAgICBmb3IgayBpbiBwYWlycyh2KSBkbwogICAgICBuID0gbiArIDEKICAgICAgaWYgdHlwZShrKSB+PSAnbnVtYmVyJyB0aGVuIGlzYXJyID0gZmFsc2UgYnJlYWsgZW5kCiAgICBlbmQKICAgIGlmIGlzYXJyIHRoZW4KICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaSA9IDEsIG4gZG8gcGFydHNbaV0gPSBlbmNvZGUodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycuLnRhYmxlLmNvbmNhdChwYXJ0cywgJywnKS4uJ10nCiAgICBlbmQKICAgIGxvY2FsIGtleXMgPSB7fQogICAgZm9yIGsgaW4gcGFpcnModikgZG8ga2V5c1sja2V5cysxXSA9IGsgZW5kCiAgICB0YWJsZS5zb3J0KGtleXMsIGZ1bmN0aW9uKGEsYikgcmV0dXJuIHRvc3RyaW5nKGEpIDwgdG9zdHJpbmcoYikgZW5kKQogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIF8sIGsgaW4gaXBhaXJzKGtleXMpIGRvIHBhcnRzWyNwYXJ0cysxXSA9ICciJy4uanNvbl9lc2NhcGUoaykuLiciOiAnLi5lbmNvZGUodltrXSkgZW5kCiAgICByZXR1cm4gJ3snLi50YWJsZS5jb25jYXQocGFydHMsICcsICcpLi4nfScKICBlbmQKICByZXR1cm4gJ251bGwnCmVuZApqc29uX2VuY29kZSA9IGVuY29kZQoKLS0gPT09PT09PT09PT09PT09PT09PT09IOW3peWFtyA9PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gaXNfYXJyYXkodCkKICBpZiB0eXBlKHQpIH49ICd0YWJsZScgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgZm9yIGsgaW4gcGFpcnModCkgZG8gaWYgdHlwZShrKSB+PSAnbnVtYmVyJyB0aGVuIHJldHVybiBmYWxzZSBlbmQgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgpsb2NhbCBmdW5jdGlvbiBzb3J0ZWRfa2V5cyh0KQogIGxvY2FsIHJlYyA9IGtleV9vcmRlclt0XQogIGlmIHJlYyB0aGVuCiAgICAtLSDmlofmoaPvvIjmlofmnKzvvInpobrluo/vvJrov4fmu6Tmjonlt7LkuI3lnKjooajkuK3nmoTplK4KICAgIGxvY2FsIG91dCA9IHt9CiAgICBmb3IgXywgayBpbiBpcGFpcnMocmVjKSBkbyBpZiB0W2tdIH49IG5pbCB0aGVuIG91dFsjb3V0KzFdID0gayBlbmQgZW5kCiAgICBpZiAjb3V0ID4gMCB0aGVuIHJldHVybiBvdXQgZW5kCiAgZW5kCiAgbG9jYWwga2V5cyA9IHt9CiAgZm9yIGsgaW4gcGFpcnModCkgZG8ga2V5c1sja2V5cysxXSA9IGsgZW5kCiAgdGFibGUuc29ydChrZXlzLCBmdW5jdGlvbihhLGIpIHJldHVybiB0b3N0cmluZyhhKSA8IHRvc3RyaW5nKGIpIGVuZCkKICByZXR1cm4ga2V5cwplbmQKCi0tIOaMieaIkOWRmOi3r+W+hOWPliAwLWJhc2VkIOS4i+agh++8iOaVsOe7hO+8ieaIlumUru+8iOWvueixoe+8iQpsb2NhbCBmdW5jdGlvbiBnZXRfcGF0aChub2RlLCBrZXlzKQogIGxvY2FsIGN1ciA9IG5vZGUKICBmb3IgaSA9IDEsICNrZXlzIGRvCiAgICBsb2NhbCBrID0ga2V5c1tpXQogICAgaWYgY3VyID09IG5pbCBvciB0eXBlKGN1cikgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiBuaWwgZW5kCiAgICBpZiBpc19hcnJheShjdXIpIGFuZCBrOm1hdGNoKCdeJS0/JWQrJCcpIHRoZW4KICAgICAgbG9jYWwgaWR4ID0gdG9udW1iZXIoaykKICAgICAgaWYgaWR4IDwgMCB0aGVuIGlkeCA9ICNjdXIgKyBpZHggKyAxIGVsc2UgaWR4ID0gaWR4ICsgMSBlbmQKICAgICAgaWYgaWR4IDwgMSBvciBpZHggPiAjY3VyIHRoZW4gcmV0dXJuIG5pbCBlbmQKICAgICAgY3VyID0gY3VyW2lkeF0KICAgIGVsc2UKICAgICAgY3VyID0gY3VyW2tdCiAgICAgIGlmIGN1ciA9PSBuaWwgdGhlbiByZXR1cm4gbmlsIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIGN1cgplbmQKCi0tIOaKiuebuOWvueaIkOWRmOi3r+W+hCAiYS5iWzBdLmMiIOino+aekOaIkCBrZXlzIOaVsOe7hApsb2NhbCBmdW5jdGlvbiBwYXJzZV9tZW1iZXJfcGF0aChwKQogIGxvY2FsIGtleXMgPSB7fQogIGxvY2FsIGksIG4gPSAxLCAjcAogIGxvY2FsIGZ1bmN0aW9uIHJlYWRfbmFtZSgpCiAgICBsb2NhbCBqID0gaQogICAgd2hpbGUgaiA8PSBuIGFuZCBwOnN1YihqLGopIH49ICcuJyBhbmQgcDpzdWIoaixqKSB+PSAnWycgZG8gaiA9IGogKyAxIGVuZAogICAgbG9jYWwgbmFtZSA9IHA6c3ViKGksIGotMSkKICAgIGlmIG5hbWUgfj0gJycgdGhlbiBrZXlzWyNrZXlzKzFdID0gbmFtZSBlbmQKICAgIHJldHVybiBqCiAgZW5kCiAgd2hpbGUgaSA8PSBuIGRvCiAgICBsb2NhbCBjID0gcDpzdWIoaSxpKQogICAgaWYgYyA9PSAnLicgdGhlbgogICAgICBpID0gaSArIDEKICAgICAgaSA9IHJlYWRfbmFtZSgpCiAgICBlbHNlaWYgYyA9PSAnWycgdGhlbgogICAgICBsb2NhbCBjbG9zZSA9IHA6ZmluZCgnXScsIGkpCiAgICAgIGlmIG5vdCBjbG9zZSB0aGVuIGJyZWFrIGVuZAogICAgICBsb2NhbCBpbm5lciA9IHA6c3ViKGkrMSwgY2xvc2UtMSkKICAgICAgbG9jYWwgcSA9IGlubmVyOm1hdGNoKCdeIiguKikiJCcpIG9yIGlubmVyOm1hdGNoKCJeJyguKiknJCIpCiAgICAgIGtleXNbI2tleXMrMV0gPSBxIG9yIGlubmVyCiAgICAgIGkgPSBjbG9zZSArIDEKICAgIGVsc2UKICAgICAgLS0g5byV5a+85q6177yI6aaW5Liq5a2X56ym5piv5ZCN5a2X55qE5LiA6YOo5YiG77yM5aaCICJwcmljZSIgLyAiYS5iIiDnmoQgImEi77yJCiAgICAgIGkgPSByZWFkX25hbWUoKQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIGtleXMKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT0g6L+H5ruk5rGC5YC8ID09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBldmFsX2NsYXVzZQpsb2NhbCBmdW5jdGlvbiBldmFsX2ZpbHRlcihub2RlLCBleHByKQogIC0tIGV4cHIg5b2i5aaCICc/KEAuYSA+IDMgYW5kIEAuYiA9ICJ4IiknIOKGkiDmir3lh7ogQC5hLi4uIOmDqOWIhgogIGxvY2FsIGJvZHkgPSBleHByOm1hdGNoKCdeJT8lKCguKiklKSVzKiQnKSBvciBleHByCiAgYm9keSA9IGJvZHk6Z3N1YignXiVzKycsJycpOmdzdWIoJyVzKyQnLCcnKQogIC0tIOaMiSAiIGFuZCAiIOaLhuWtkOWPpQogIGxvY2FsIGNsYXVzZXMsIGN1ciwgaSA9IHt9LCAnJywgMQogIGxvY2FsIGZ1bmN0aW9uIGZsdXNoKCkgaWYgY3VyIH49ICcnIHRoZW4gY2xhdXNlc1sjY2xhdXNlcysxXSA9IGN1ciBlbmQgY3VyID0gJycgZW5kCiAgd2hpbGUgaSA8PSAjYm9keSBkbwogICAgaWYgYm9keTpzdWIoaSxpKzIpID09ICdhbmQnIGFuZCBib2R5OnN1YihpLTEsaS0xKT09JyAnIGFuZCBib2R5OnN1YihpKzMsaSszKT09JyAnIHRoZW4KICAgICAgZmx1c2goKTsgaSA9IGkgKyAzCiAgICAgIHdoaWxlIGJvZHk6c3ViKGksaSkgPT0gJyAnIGRvIGkgPSBpICsgMSBlbmQKICAgIGVsc2UKICAgICAgY3VyID0gY3VyIC4uIGJvZHk6c3ViKGksaSk7IGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgZmx1c2goKQogIGZvciBfLCBjbCBpbiBpcGFpcnMoY2xhdXNlcykgZG8KICAgIGlmIG5vdCBldmFsX2NsYXVzZShub2RlLCBjbCkgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgotLSDlnKjlrZDlj6XkuK3mib7liLDnrKzkuIDkuKrmr5TovoPov5DnrpfnrKbnmoTkvY3nva7vvIjlvJXlj7flhoXnmoTov5DnrpfnrKbkuI3nrpfvvInjgILov5Tlm54gb3AsIGxlZnQsIHJpZ2h044CCCmxvY2FsIGZ1bmN0aW9uIGZpbmRfb3AoY2xhdXNlKQogIGxvY2FsIGkgPSAxCiAgbG9jYWwgbiA9ICNjbGF1c2UKICBsb2NhbCBpbnEgPSBuaWwKICB3aGlsZSBpIDw9IG4gZG8KICAgIGxvY2FsIGMgPSBjbGF1c2U6c3ViKGksaSkKICAgIGlmIGlucSB0aGVuCiAgICAgIGlmIGMgPT0gaW5xIHRoZW4gaW5xID0gbmlsIGVuZAogICAgICBpID0gaSArIDEKICAgIGVsc2UKICAgICAgaWYgYyA9PSAnIicgb3IgYyA9PSAiJyIgdGhlbgogICAgICAgIGlucSA9IGM7IGkgPSBpICsgMQogICAgICBlbHNlCiAgICAgICAgLS0g5YWI6K+V5Lik5L2N6L+Q566X56ym77yM5YaN6K+V5LiA5L2NCiAgICAgICAgbG9jYWwgdHdvID0gY2xhdXNlOnN1YihpLCBpKzEpCiAgICAgICAgaWYgdHdvID09ICc8PScgb3IgdHdvID09ICc+PScgb3IgdHdvID09ICchPScgdGhlbgogICAgICAgICAgbG9jYWwgbGVmdCA9IGNsYXVzZTpzdWIoMSwgaS0xKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIGxvY2FsIHJpZ2h0ID0gY2xhdXNlOnN1YihpKzIpOmdzdWIoJ14lcysnLCcnKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIHJldHVybiB0d28sIGxlZnQsIHJpZ2h0CiAgICAgICAgZW5kCiAgICAgICAgaWYgYyA9PSAnPCcgb3IgYyA9PSAnPicgb3IgYyA9PSAnPScgdGhlbgogICAgICAgICAgbG9jYWwgbGVmdCA9IGNsYXVzZTpzdWIoMSwgaS0xKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIGxvY2FsIHJpZ2h0ID0gY2xhdXNlOnN1YihpKzEpOmdzdWIoJ14lcysnLCcnKTpnc3ViKCclcyskJywnJykKICAgICAgICAgIHJldHVybiBjLCBsZWZ0LCByaWdodAogICAgICAgIGVuZAogICAgICAgIGkgPSBpICsgMQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiBuaWwsIG5pbCwgbmlsCmVuZAoKZXZhbF9jbGF1c2UgPSBmdW5jdGlvbihub2RlLCBjbGF1c2UpCiAgY2xhdXNlID0gY2xhdXNlOmdzdWIoJ14lcysnLCcnKTpnc3ViKCclcyskJywnJykKICBsb2NhbCBvcCwgbGVmdCwgcmlnaHQgPSBmaW5kX29wKGNsYXVzZSkKICAtLSDml6Dov5DnrpfnrKYg4oaSIOWtmOWcqOaApwogIGlmIG5vdCBvcCB0aGVuCiAgICBsb2NhbCByZWwgPSBjbGF1c2U6Z3N1YignXkAlLicsJycpOmdzdWIoJ15AJywnJykKICAgIGxvY2FsIGxrZXlzID0gcGFyc2VfbWVtYmVyX3BhdGgocmVsKQogICAgbG9jYWwgbHZhbCA9ICgjbGtleXMgPT0gMCkgYW5kIG5vZGUgb3IgZ2V0X3BhdGgobm9kZSwgbGtleXMpCiAgICByZXR1cm4gbHZhbCB+PSBuaWwKICBlbmQKICAtLSDmr5TovoPlvI8KICBsb2NhbCByZWwgPSBsZWZ0OmdzdWIoJ15AJS4nLCcnKTpnc3ViKCdeQCcsJycpCiAgbG9jYWwgbGtleXMgPSBwYXJzZV9tZW1iZXJfcGF0aChyZWwpCiAgbG9jYWwgbHZhbCA9ICgjbGtleXMgPT0gMCkgYW5kIG5vZGUgb3IgZ2V0X3BhdGgobm9kZSwgbGtleXMpCiAgLS0g5Y+z5a2X6Z2i6YePCiAgbG9jYWwgcnZhbAogIGlmIHJpZ2h0ID09ICd0cnVlJyB0aGVuIHJ2YWwgPSB0cnVlCiAgZWxzZWlmIHJpZ2h0ID09ICdmYWxzZScgdGhlbiBydmFsID0gZmFsc2UKICBlbHNlaWYgcmlnaHQgPT0gJ251bGwnIG9yIHJpZ2h0ID09ICduaWwnIHRoZW4gcnZhbCA9IG5pbAogIGVsc2VpZiByaWdodDptYXRjaCgnXiUtPyVkKyUuPyVkKiQnKSB0aGVuIHJ2YWwgPSB0b251bWJlcihyaWdodCkKICBlbHNlCiAgICBsb2NhbCBxID0gcmlnaHQ6bWF0Y2goJ14iKC4qKSIkJykgb3IgcmlnaHQ6bWF0Y2goIl4nKC4qKSckIikKICAgIHJ2YWwgPSBxIG9yIHJpZ2h0CiAgZW5kCiAgaWYgb3AgPT0gJz0nIHRoZW4gcmV0dXJuIGx2YWwgPT0gcnZhbCBlbmQKICBpZiBvcCA9PSAnIT0nIHRoZW4gcmV0dXJuIGx2YWwgfj0gcnZhbCBlbmQKICBsb2NhbCBhLCBiID0gdG9udW1iZXIobHZhbCksIHRvbnVtYmVyKHJ2YWwpCiAgaWYgYSA9PSBuaWwgb3IgYiA9PSBuaWwgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgb3AgPT0gJzwnIHRoZW4gcmV0dXJuIGEgPCBiIGVuZAogIGlmIG9wID09ICc8PScgdGhlbiByZXR1cm4gYSA8PSBiIGVuZAogIGlmIG9wID09ICc+JyB0aGVuIHJldHVybiBhID4gYiBlbmQKICByZXR1cm4gYSA+PSBiCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09IEpTT05QYXRoIOaxguWAvCA9PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcXVlcnkocm9vdCwgZXhwcikKICBleHByID0gZXhwcjpnc3ViKCdeJXMrJywnJyk6Z3N1YignJXMrJCcsJycpCiAgaWYgZXhwciA9PSAnJyBvciBleHByOnN1YigxLDEpIH49ICckJyB0aGVuIGVycm9yKCdqc29ucGF0aDogbXVzdCBzdGFydCB3aXRoICQnLCAwKSBlbmQKICAtLSDop6PmnpDmiJAgc3RlcHMKICBsb2NhbCBzdGVwcyA9IHt9CiAgbG9jYWwgaSwgbiA9IDIsICNleHByCiAgd2hpbGUgaSA8PSBuIGRvCiAgICBsb2NhbCBjID0gZXhwcjpzdWIoaSxpKQogICAgaWYgYyA9PSAnLicgdGhlbgogICAgICBpZiBleHByOnN1YihpLCBpKzEpID09ICcuLicgdGhlbgogICAgICAgIGkgPSBpICsgMgogICAgICAgIGxvY2FsIGogPSBpCiAgICAgICAgd2hpbGUgaiA8PSBuIGFuZCBleHByOnN1YihqLGopIH49ICcuJyBhbmQgZXhwcjpzdWIoaixqKSB+PSAnWycgZG8gaiA9IGogKyAxIGVuZAogICAgICAgIGxvY2FsIG5hbWUgPSBleHByOnN1YihpLCBqLTEpCiAgICAgICAgaWYgbmFtZSB+PSAnJyB0aGVuIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdyZWN1cnNpdmUnLCBuYW1lPW5hbWV9IGVuZAogICAgICAgIGkgPSBqCiAgICAgIGVsc2UKICAgICAgICBpID0gaSArIDEKICAgICAgICBpZiBleHByOnN1YihpLGkpID09ICcqJyB0aGVuCiAgICAgICAgICBzdGVwc1sjc3RlcHMrMV0gPSB7a2luZD0nd2lsZGNhcmQnfQogICAgICAgICAgaSA9IGkgKyAxCiAgICAgICAgZWxzZQogICAgICAgICAgbG9jYWwgaiA9IGkKICAgICAgICAgIHdoaWxlIGogPD0gbiBhbmQgZXhwcjpzdWIoaixqKSB+PSAnLicgYW5kIGV4cHI6c3ViKGosaikgfj0gJ1snIGRvIGogPSBqICsgMSBlbmQKICAgICAgICAgIGxvY2FsIG5hbWUgPSBleHByOnN1YihpLCBqLTEpCiAgICAgICAgICBpZiBuYW1lID09ICcnIHRoZW4gZXJyb3IoJ2pzb25wYXRoOiBlbXB0eSBtZW1iZXInLCAwKSBlbmQKICAgICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdtZW1iZXInLCBuYW1lPW5hbWV9CiAgICAgICAgICBpID0gagogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVsc2VpZiBjID09ICcqJyB0aGVuCiAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSd3aWxkY2FyZCd9CiAgICAgIGkgPSBpICsgMQogICAgZWxzZWlmIGMgPT0gJ1snIHRoZW4KICAgICAgbG9jYWwgaiwgaW5xID0gaSArIDEsIG5pbAogICAgICB3aGlsZSBqIDw9IG4gZG8KICAgICAgICBsb2NhbCBjaCA9IGV4cHI6c3ViKGosaikKICAgICAgICBpZiBpbnEgdGhlbgogICAgICAgICAgaWYgY2ggPT0gaW5xIGFuZCBleHByOnN1YihqLTEsai0xKSB+PSAnXFwnIHRoZW4gaW5xID0gbmlsIGVuZAogICAgICAgIGVsc2UKICAgICAgICAgIGlmIGNoID09ICciJyBvciBjaCA9PSAiJyIgdGhlbiBpbnEgPSBjaAogICAgICAgICAgZWxzZWlmIGNoID09ICddJyB0aGVuIGJyZWFrIGVuZAogICAgICAgIGVuZAogICAgICAgIGogPSBqICsgMQogICAgICBlbmQKICAgICAgaWYgbm90IChqIDw9IG4pIHRoZW4gZXJyb3IoJ2pzb25wYXRoOiB1bnRlcm1pbmF0ZWQgWycsIDApIGVuZAogICAgICBsb2NhbCBpbm5lciA9IGV4cHI6c3ViKGkrMSwgai0xKQogICAgICBpID0gaiArIDEKICAgICAgaWYgaW5uZXI6bWF0Y2goJ14lLT8lZCskJykgdGhlbgogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdpbmRleCcsIGlkeD10b251bWJlcihpbm5lcil9CiAgICAgIGVsc2VpZiBpbm5lcjpzdWIoMSwxKSA9PSAnPycgdGhlbgogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdmaWx0ZXInLCBleHByPWlubmVyfQogICAgICBlbHNlaWYgaW5uZXI6bWF0Y2goJ14iJykgb3IgaW5uZXI6bWF0Y2goIl4nIikgdGhlbgogICAgICAgIGxvY2FsIHEgPSBpbm5lcjptYXRjaCgnXiIoLiopIiQnKSBvciBpbm5lcjptYXRjaCgiXicoLiopJyQiKQogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSdtZW1iZXInLCBuYW1lPXF9CiAgICAgIGVsc2VpZiBpbm5lciA9PSAnKicgdGhlbgogICAgICAgIHN0ZXBzWyNzdGVwcysxXSA9IHtraW5kPSd3aWxkY2FyZCd9CiAgICAgIGVsc2UKICAgICAgICBzdGVwc1sjc3RlcHMrMV0gPSB7a2luZD0nbWVtYmVyJywgbmFtZT1pbm5lcn0KICAgICAgZW5kCiAgICBlbHNlCiAgICAgIGVycm9yKCdqc29ucGF0aDogdW5leHBlY3RlZCBjaGFyICcuLmMuLicgQCAnLi5pLCAwKQogICAgZW5kCiAgZW5kCgogIGxvY2FsIGN1cnJlbnQgPSB7IHtwYXRoPScnLCB2YWx1ZT1yb290fSB9CiAgZm9yIF8sIHN0ZXAgaW4gaXBhaXJzKHN0ZXBzKSBkbwogICAgbG9jYWwgbmV4dCA9IHt9CiAgICBpZiBzdGVwLmtpbmQgPT0gJ21lbWJlcicgdGhlbgogICAgICBmb3IgXywgbSBpbiBpcGFpcnMoY3VycmVudCkgZG8KICAgICAgICBsb2NhbCBub2RlID0gbS52YWx1ZQogICAgICAgIGlmIHR5cGUobm9kZSkgPT0gJ3RhYmxlJyBhbmQgbm9kZVtzdGVwLm5hbWVdIH49IG5pbCB0aGVuCiAgICAgICAgICBuZXh0WyNuZXh0KzFdID0ge3BhdGg9bS5wYXRoLi4nLicuLnN0ZXAubmFtZSwgdmFsdWU9bm9kZVtzdGVwLm5hbWVdfQogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVsc2VpZiBzdGVwLmtpbmQgPT0gJ2luZGV4JyB0aGVuCiAgICAgIGZvciBfLCBtIGluIGlwYWlycyhjdXJyZW50KSBkbwogICAgICAgIGxvY2FsIG5vZGUgPSBtLnZhbHVlCiAgICAgICAgaWYgdHlwZShub2RlKSA9PSAndGFibGUnIGFuZCBpc19hcnJheShub2RlKSB0aGVuCiAgICAgICAgICBsb2NhbCBpZHggPSBzdGVwLmlkeAogICAgICAgICAgaWYgaWR4IDwgMCB0aGVuIGlkeCA9ICNub2RlICsgaWR4ICsgMSBlbHNlIGlkeCA9IGlkeCArIDEgZW5kCiAgICAgICAgICBpZiBpZHggPj0gMSBhbmQgaWR4IDw9ICNub2RlIHRoZW4KICAgICAgICAgICAgbmV4dFsjbmV4dCsxXSA9IHtwYXRoPW0ucGF0aC4uJ1snLi50b3N0cmluZyhzdGVwLmlkeCkuLiddJywgdmFsdWU9bm9kZVtpZHhdfQogICAgICAgICAgZW5kCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZWxzZWlmIHN0ZXAua2luZCA9PSAnd2lsZGNhcmQnIHRoZW4KICAgICAgZm9yIF8sIG0gaW4gaXBhaXJzKGN1cnJlbnQpIGRvCiAgICAgICAgbG9jYWwgbm9kZSA9IG0udmFsdWUKICAgICAgICBpZiB0eXBlKG5vZGUpID09ICd0YWJsZScgdGhlbgogICAgICAgICAgaWYgaXNfYXJyYXkobm9kZSkgdGhlbgogICAgICAgICAgICBmb3IgaWR4ID0gMSwgI25vZGUgZG8gbmV4dFsjbmV4dCsxXSA9IHtwYXRoPW0ucGF0aC4uJ1snLi4oaWR4LTEpLi4nXScsIHZhbHVlPW5vZGVbaWR4XX0gZW5kCiAgICAgICAgICBlbHNlCiAgICAgICAgICAgIGZvciBfLCBrIGluIGlwYWlycyhzb3J0ZWRfa2V5cyhub2RlKSkgZG8KICAgICAgICAgICAgICBuZXh0WyNuZXh0KzFdID0ge3BhdGg9bS5wYXRoLi4nLicuLmssIHZhbHVlPW5vZGVba119CiAgICAgICAgICAgIGVuZAogICAgICAgICAgZW5kCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZWxzZWlmIHN0ZXAua2luZCA9PSAncmVjdXJzaXZlJyB0aGVuCiAgICAgIGxvY2FsIGZ1bmN0aW9uIGZpbmRfYWxsKG5vZGUsIHBhdGgpCiAgICAgICAgaWYgbm9kZSA9PSBuaWwgb3IgdHlwZShub2RlKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGVuZAogICAgICAgIGlmIGlzX2FycmF5KG5vZGUpIHRoZW4KICAgICAgICAgIGZvciBpZHggPSAxLCAjbm9kZSBkbyBmaW5kX2FsbChub2RlW2lkeF0sIHBhdGguLidbJy4uKGlkeC0xKS4uJ10nKSBlbmQKICAgICAgICBlbHNlCiAgICAgICAgICBmb3IgXywgayBpbiBpcGFpcnMoc29ydGVkX2tleXMobm9kZSkpIGRvCiAgICAgICAgICAgIGxvY2FsIGNwID0gcGF0aC4uJy4nLi5rCiAgICAgICAgICAgIGlmIGsgPT0gc3RlcC5uYW1lIHRoZW4gbmV4dFsjbmV4dCsxXSA9IHtwYXRoPWNwLCB2YWx1ZT1ub2RlW2tdfSBlbmQKICAgICAgICAgICAgZmluZF9hbGwobm9kZVtrXSwgY3ApCiAgICAgICAgICBlbmQKICAgICAgICBlbmQKICAgICAgZW5kCiAgICAgIGZvciBfLCBtIGluIGlwYWlycyhjdXJyZW50KSBkbyBmaW5kX2FsbChtLnZhbHVlLCBtLnBhdGgpIGVuZAogICAgZWxzZWlmIHN0ZXAua2luZCA9PSAnZmlsdGVyJyB0aGVuCiAgICAgIC0tIOi/h+a7pO+8muiLpeiKgueCueaYr+aVsOe7hO+8jOWvueavj+S4qioq5YWD57SgKirmsYIgQO+8iEpTT05QYXRoIOe7j+WFuOivreS5ie+8jOWQjCBqcS9nanNvbi9Hb2Vzc25lcu+8ie+8mwogICAgICAtLSDlkKbliJnlr7nmlbTkuKroioLngrnmsYIgQOOAguWRveS4reWNs+i+k+WHuuivpe+8iOWFg+e0oO+8ieWAvOOAggogICAgICBsb2NhbCBmdW5jdGlvbiBmaWx0ZXJfbm9kZShub2RlLCBwYXRoKQogICAgICAgIGlmIGlzX2FycmF5KG5vZGUpIHRoZW4KICAgICAgICAgIGZvciBpZHggPSAxLCAjbm9kZSBkbwogICAgICAgICAgICBpZiBldmFsX2ZpbHRlcihub2RlW2lkeF0sIHN0ZXAuZXhwcikgdGhlbgogICAgICAgICAgICAgIG5leHRbI25leHQrMV0gPSB7cGF0aD1wYXRoLi4nWycuLihpZHgtMSkuLiddJywgdmFsdWU9bm9kZVtpZHhdfQogICAgICAgICAgICBlbmQKICAgICAgICAgIGVuZAogICAgICAgIGVsc2VpZiBldmFsX2ZpbHRlcihub2RlLCBzdGVwLmV4cHIpIHRoZW4KICAgICAgICAgIG5leHRbI25leHQrMV0gPSB7cGF0aD1wYXRoLCB2YWx1ZT1ub2RlfQogICAgICAgIGVuZAogICAgICBlbmQKICAgICAgZm9yIF8sIG0gaW4gaXBhaXJzKGN1cnJlbnQpIGRvIGZpbHRlcl9ub2RlKG0udmFsdWUsIG0ucGF0aCkgZW5kCiAgICBlbmQKICAgIGN1cnJlbnQgPSBuZXh0CiAgZW5kCiAgcmV0dXJuIGN1cnJlbnQKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT0g5YWl5Y+jID09PT09PT09PT09PT09PT09PT09PQpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHt2ID0gcCwgZSA9ICckJ30gZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGlucHV0In0nIGVuZAogIGxvY2FsIGRvYyA9IHAudgogIGlmIG5vdCBkb2Mgb3IgZG9jID09ICcnIHRoZW4gcmV0dXJuICd7ImVycm9yIjoibWlzc2luZyB2IChqc29uIGRvYykifScgZW5kCiAgbG9jYWwgZXhwciA9IHAuZSBvciBwLmV4cHIgb3IgJyQnCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdxdWVyeScKCiAgbG9jYWwgb2ssIHBhcnNlZCA9IHBjYWxsKGpzb25fZGVjb2RlLCBkb2MpCiAgaWYgbm90IG9rIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiaW52YWxpZCBqc29uIGRvYzogJyAuLiBqc29uX2VzY2FwZSh0b3N0cmluZyhwYXJzZWQpKSAuLiAnIn0nIGVuZAoKICBsb2NhbCBvazIsIG1hdGNoZWQgPSBwY2FsbChxdWVyeSwgcGFyc2VkLCBleHByKQogIGlmIG5vdCBvazIgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJqc29ucGF0aDogJyAuLiBqc29uX2VzY2FwZSh0b3N0cmluZyhtYXRjaGVkKSkgLi4gJyJ9JyBlbmQKCiAgaWYgb3AgPT0gJ2NvdW50JyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoI21hdGNoZWQpCiAgZWxzZWlmIG9wID09ICdleGlzdHMnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSgjbWF0Y2hlZCA+IDApCiAgZWxzZWlmIG9wID09ICdmaXJzdCcgdGhlbgogICAgcmV0dXJuIGpzb25fZW5jb2RlKG1hdGNoZWRbMV0gYW5kIG1hdGNoZWRbMV0udmFsdWUgb3IgbmlsKQogIGVsc2UKICAgIGxvY2FsIHZhbHMgPSB7fQogICAgZm9yIF8sIG0gaW4gaXBhaXJzKG1hdGNoZWQpIGRvIHZhbHNbI3ZhbHMrMV0gPSBtLnZhbHVlIGVuZAogICAgcmV0dXJuIGpzb25fZW5jb2RlKHZhbHMpCiAgZW5kCmVuZAoALS0gQGxpYjogY25jaGVjawotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzog5Lit5Zu95pWw5o2u5qCh6aqM5L2N566X5rOV5YWo5a625qG277yI57qvIEx1Ye+8jOiHquWMheWQq++8ieOAggotLSAgICAgICBvcD0naWRfY2FyZCfvvJoxOCDkvY3ouqvku73or4HvvIhHQiAxMTY0My0xOTk5IOWKoOadg+agoemqjOS9jSArIFjvvInvvIzlhbzlrrkgMTUg5L2N6ICB5Y+377ybCi0tICAgICAgIG9wPSd1c2NjJ++8mue7n+S4gOekvuS8muS/oeeUqOS7o+eggSAxOCDkvY3vvIhHQiAzMjEwMC0yMDE177yMMzEg5a2X56ym6ZuG5Yqg5p2DIG1vZCAzMe+8ie+8mwotLSAgICAgICBvcD0nYmFua19jYXJkJ++8mumTtuihjOWNoSBMdWhu77yITU9ELTEw77yMMTPigJMxOSDkvY3vvInvvJsKLS0gICAgICAgb3A9J3Bob25lJ++8muWkp+mZhuaJi+acuuWPt++8iDExIOS9je+8jDFbMy05XSDmrrXov5HkvLzvvIzlrp7nlKjmoKHpqozvvInvvJsKLS0gICAgICAgb3A9J2lkX2V4dHJhY3Qn77ya6Lqr5Lu96K+BIOKGkiDljLrliJIv5Ye655SfL+aAp+WIqyBKU09O77ybCi0tICAgICAgIG9wPSdpZF8xNXRvMTgn77yaMTUg5L2N6ICB5Y+3IOKGkiAxOCDkvY3vvIjnrKwgNyDkvY3liY3mj5IgJzE5JyArIOmHjeeul+agoemqjOS9je+8ieOAggotLSAgICAgICDlkITmoKHpqowgb3Ag6L+U5ZueIEpTT07vvJp7InZhbGlkIjp0cnVlfGZhbHNlLCJyZWFzb24iOiIuLi4ife+8iOmFjSBqc29uX2V4dHJhY3Qg55So77yJ44CCCi0tIEBzb3VyY2U6IG9yaWdpbmFs77yIZHVja2RiLWx1YWppdCDns7vliJfvvIzoh6rljIXlkKvml6DlpJbpg6jkvp3otZbvvIkKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSDplJrngrnvvIjlt7Lpqozor4HvvInvvJrouqvku73or4EgMTEwMTA1MTk0OTEyMzEwMDJYIOacieaViCAvIDExMDEwNTE5NDkxMjMxMDAyMCDml6DmlYjvvJsKLS0gICBVU0NDIDkxMzUwMTAwTTAwMDEwMFk0MyDmnInmlYggLyDigKY0NCDml6DmlYjvvJvpk7booYzljaEgNDExMTExMTExMTExMTExMSDmnInmlYjvvJvmiYvmnLogMTM4MDAxMzgwMDAg5pyJ5pWI44CCCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0nY25jaGVjaycpOwotLSAgIOi6q+S7veivgTogIFNFTEVDVCBqc29uX2V4dHJhY3QobHVhaml0X3MoJ2NuY2hlY2snLCB7djogJzExMDEwNTE5NDkxMjMxMDAyWCcsIG9wOiAnaWRfY2FyZCd9KSwgJyQudmFsaWQnKTsKLS0gICBVU0NDOiAgICBTRUxFQ1QgbHVhaml0X3MoJ2NuY2hlY2snLCB7djogJzkxMzUwMTAwTTAwMDEwMFk0MycsIG9wOiAndXNjYyd9KTsKLS0gICDpk7booYw6ICAgIFNFTEVDVCBsdWFqaXRfcygnY25jaGVjaycsIHt2OiAnNDExMTExMTExMTExMTExMScsIG9wOiAnYmFua19jYXJkJ30pOwotLSAgIOaJi+acujogICAgU0VMRUNUIGx1YWppdF9zKCdjbmNoZWNrJywge3Y6ICcxMzgwMDEzODAwMCcsIG9wOiAncGhvbmUnfSk7Ci0tICAg6Lqr5Lu96K+B5a2X5q61OiBTRUxFQ1QgbHVhaml0X3MoJ2NuY2hlY2snLCB7djogJzExMDEwNTE5NDkxMjMxMDAyWCcsIG9wOiAnaWRfZXh0cmFjdCd9KTsKLS0gICAgICAgICAgICAg4oaSIHsicmVnaW9uIjoiMTEwMTA1IiwiYmlydGgiOiIxOTQ5LTEyLTMxIiwic2V4IjoiTSJ9CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEpTT04g57yW56CB77yI57K+566A6Ieq5YyF5ZCr77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHM6Z3N1YignWyVjIlxcXScsIGZ1bmN0aW9uKGMpCiAgICBpZiBjID09ICciJyB0aGVuIHJldHVybiAnXFwiJwogICAgZWxzZWlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcKICAgIGVsc2VpZiBjID09ICdcbicgdGhlbiByZXR1cm4gJ1xcbicKICAgIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2UgcmV0dXJuIGMgZW5kCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBqYm9vbChiKSByZXR1cm4gYiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCgpsb2NhbCBmdW5jdGlvbiByZXN1bHQodmFsaWQsIHJlYXNvbikKICByZXR1cm4gJ3sidmFsaWQiOicgLi4gamJvb2wodmFsaWQpIC4uICcsInJlYXNvbiI6IicgLi4ganNvbl9lc2NhcGUodG9zdHJpbmcocmVhc29uKSkgLi4gJyJ9JwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6Lqr5Lu96K+B77yIR0IgMTE2NDMtMTk5Oe+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIElEX1dFSUdIVFMgPSB7IDcsIDksIDEwLCA1LCA4LCA0LCAyLCAxLCA2LCAzLCA3LCA5LCAxMCwgNSwgOCwgNCwgMiB9CmxvY2FsIElEX0NIRUNLID0geyBbJzAnXT0nMScsIFsnMSddPScwJywgWycyJ109J1gnLCBbJzMnXT0nOScsIFsnNCddPSc4JywKICAgICAgICAgICAgICAgICAgIFsnNSddPSc3JywgWyc2J109JzYnLCBbJzcnXT0nNScsIFsnOCddPSc0JywgWyc5J109JzMnLCBbJzEwJ109JzInIH0KCmxvY2FsIGZ1bmN0aW9uIGlkX2NhcmRfY2hlY2sodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKTp1cHBlcigpKQogIGlmICNzIH49IDE4IHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mVv+W6pumhu+S4uiAxOCDkvY3vvIgxNSDkvY3ogIHlj7fkuI3mlK/mjIHmoKHpqozkvY3vvIknKSBlbmQKICBpZiBub3QgczptYXRjaCgnXiVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWRbJWRYXSQnKSB0aGVuCiAgICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5ZCr6Z2e5rOV5a2X56ym77yIMTcg5L2N5pWw5a2XICsg5pyr5L2N5pWw5a2X5oiWIFjvvIknKQogIGVuZAogIGxvY2FsIHN1bSA9IDAKICBmb3IgaSA9IDEsIDE3IGRvCiAgICBzdW0gPSBzdW0gKyAodG9udW1iZXIoczpzdWIoaSwgaSkpIG9yIDApICogSURfV0VJR0hUU1tpXQogIGVuZAogIGxvY2FsIGV4cGVjdCA9IElEX0NIRUNLW3Rvc3RyaW5nKHN1bSAlIDExKV0KICBsb2NhbCBnb3QgPSBzOnN1YigxOCwgMTgpCiAgaWYgZXhwZWN0ID09IGdvdCB0aGVuIHJldHVybiByZXN1bHQodHJ1ZSwgJ09LJykgZW5kCiAgcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+agoemqjOS9jeS4jeespu+8muacn+acmyAnIC4uIGV4cGVjdCAuLiAn77yM5a6e5Li6ICcgLi4gZ290KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGlkX2V4dHJhY3QodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKTp1cHBlcigpKQogIGxvY2FsIHJlZ2lvbiwgYmlydGgsIHNleAogIGlmICNzID09IDE4IHRoZW4KICAgIGlmIG5vdCBzOm1hdGNoKCdeJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZCVkJWQlZFslZFhdJCcpIHRoZW4KICAgICAgcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mdnuazlei6q+S7veivgScpCiAgICBlbmQKICAgIHJlZ2lvbiA9IHM6c3ViKDEsIDYpCiAgICBiaXJ0aCA9IHM6c3ViKDcsIDE0KQogICAgc2V4ID0gKHRvbnVtYmVyKHM6c3ViKDE3LCAxNykpIG9yIDApICUgMiA9PSAxIGFuZCAnTScgb3IgJ0YnCiAgZWxzZWlmICNzID09IDE1IHRoZW4KICAgIGlmIG5vdCBzOm1hdGNoKCdeJWQrJCcpIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mdnuazlei6q+S7veivgScpIGVuZAogICAgcmVnaW9uID0gczpzdWIoMSwgNikKICAgIGJpcnRoID0gJzE5JyAuLiBzOnN1Yig3LCAxMikKICAgIHNleCA9ICh0b251bWJlcihzOnN1YigxNSwgMTUpKSBvciAwKSAlIDIgPT0gMSBhbmQgJ00nIG9yICdGJwogIGVsc2UKICAgIHJldHVybiByZXN1bHQoZmFsc2UsICfplb/luqbpobvkuLogMTUg5oiWIDE4IOS9jScpCiAgZW5kCiAgbG9jYWwgYnkgPSBiaXJ0aDpzdWIoMSwgNCkKICBsb2NhbCBibSA9IGJpcnRoOnN1Yig1LCA2KQogIGxvY2FsIGJkID0gYmlydGg6c3ViKDcsIDgpCiAgcmV0dXJuICd7InJlZ2lvbiI6IicgLi4ganNvbl9lc2NhcGUocmVnaW9uKSAuLiAnIiwiYmlydGgiOiInLi4KICAgICAgICAganNvbl9lc2NhcGUoYnkgLi4gJy0nIC4uIGJtIC4uICctJyAuLiBiZCkgLi4gJyIsInNleCI6IicgLi4gc2V4IC4uICcifScKZW5kCgotLSAxNSDkvY3ogIHlj7cg4oaSIDE4IOS9je+8iEdCIDExNjQzLTE5OTnvvInvvJrnrKwgNyDkvY3liY3mj5IgJzE5J++8iOS4lue6quWBh+iuviAxOTAwc++8ie+8jAotLSDmnKvkvY3mjIkgMTcg5L2N5Yqg5p2D6YeN566X5qCh6aqM5L2N77yI5ZCMIGlkX2NhcmQg55qEIElEX1dFSUdIVFMvSURfQ0hFQ0vvvInjgIIKbG9jYWwgZnVuY3Rpb24gaWRfMTV0bzE4KHYpCiAgbG9jYWwgcyA9ICh0b3N0cmluZyh2KTpnc3ViKCclcysnLCAnJyk6dXBwZXIoKSkKICBpZiAjcyB+PSAxNSB0aGVuCiAgICByZXR1cm4gJ3siaWQxOCI6bnVsbCwiZXJyb3IiOiLplb/luqbpobvkuLogMTUg5L2N77yIMTgg5L2N5peg6ZyA6L2s5o2i77yJIn0nCiAgZW5kCiAgaWYgbm90IHM6bWF0Y2goJ14lZCskJykgdGhlbgogICAgcmV0dXJuICd7ImlkMTgiOm51bGwsImVycm9yIjoiMTUg5L2N6ICB5Y+36aG75YWo5pWw5a2XIn0nCiAgZW5kCiAgbG9jYWwgczE3ID0gczpzdWIoMSwgNikgLi4gJzE5JyAuLiBzOnN1Yig3LCAxNSkKICBsb2NhbCBzdW0gPSAwCiAgZm9yIGkgPSAxLCAxNyBkbwogICAgc3VtID0gc3VtICsgKHRvbnVtYmVyKHMxNzpzdWIoaSwgaSkpIG9yIDApICogSURfV0VJR0hUU1tpXQogIGVuZAogIGxvY2FsIGNoZWNrID0gSURfQ0hFQ0tbdG9zdHJpbmcoc3VtICUgMTEpXQogIHJldHVybiAneyJpZDE1IjoiJyAuLiBzIC4uICciLCJpZDE4IjoiJyAuLiBzMTcgLi4gY2hlY2sgLi4gJyJ9JwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g57uf5LiA56S+5Lya5L+h55So5Luj56CB77yIR0IgMzIxMDAtMjAxNe+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIFVTQ0NfQ0hBUlMgPSAnMDEyMzQ1Njc4OUFCQ0RFRkdISktMTU5QUVJUVVdYWScgIC0tIDMxIOWtl+espu+8jOWOuyBJIE8gUyBWIFoKbG9jYWwgdXNjY19tYXAgPSB7fQpmb3IgaSA9IDEsIDMxIGRvIHVzY2NfbWFwW1VTQ0NfQ0hBUlM6c3ViKGksIGkpXSA9IGkgLSAxIGVuZApsb2NhbCBVU0NDX1dFSUdIVFMgPSB7IDEsIDMsIDksIDI3LCAxOSwgMjYsIDE2LCAxNywgMjAsIDI5LCAyNSwgMTMsIDgsIDI0LCAxMCwgMzAsIDI4IH0KCmxvY2FsIGZ1bmN0aW9uIHVzY2NfY2hlY2sodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKTp1cHBlcigpKQogIGlmICNzIH49IDE4IHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mVv+W6pumhu+S4uiAxOCDkvY0nKSBlbmQKICBsb2NhbCBzdW0gPSAwCiAgZm9yIGkgPSAxLCAxNyBkbwogICAgbG9jYWwgY2ggPSBzOnN1YihpLCBpKQogICAgbG9jYWwgdmFsID0gdXNjY19tYXBbY2hdCiAgICBpZiB2YWwgPT0gbmlsIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+S9jee9riAnIC4uIGkgLi4gJyDlrZfnrKYgJyAuLiBjaCAuLiAnIOS4jeWcqCAzMSDlrZfnrKbpm4YnKSBlbmQKICAgIHN1bSA9IHN1bSArIHZhbCAqIFVTQ0NfV0VJR0hUU1tpXQogIGVuZAogIGxvY2FsIGMxOCA9IDMxIC0gKHN1bSAlIDMxKQogIGxvY2FsIGV4cGVjdCA9IChjMTggPj0gMzEpIGFuZCAnMCcgb3IgVVNDQ19DSEFSUzpzdWIoYzE4ICsgMSwgYzE4ICsgMSkKICBsb2NhbCBnb3QgPSBzOnN1YigxOCwgMTgpCiAgaWYgZXhwZWN0ID09IGdvdCB0aGVuIHJldHVybiByZXN1bHQodHJ1ZSwgJ09LJykgZW5kCiAgcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+agoemqjOS9jeS4jeespu+8muacn+acmyAnIC4uIGV4cGVjdCAuLiAn77yM5a6e5Li6ICcgLi4gZ290KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6ZO26KGM5Y2h77yITHVobiAvIE1PRC0xMO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGx1aG5fdmFsaWQocykKICBsb2NhbCBzdW0sIGFsdCA9IDAsIGZhbHNlCiAgZm9yIGkgPSAjcywgMSwgLTEgZG8KICAgIGxvY2FsIGQgPSB0b251bWJlcihzOnN1YihpLCBpKSkKICAgIGlmIGQgPT0gbmlsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogICAgaWYgYWx0IHRoZW4KICAgICAgZCA9IGQgKiAyCiAgICAgIGlmIGQgPiA5IHRoZW4gZCA9IGQgLSA5IGVuZAogICAgZW5kCiAgICBzdW0gPSBzdW0gKyBkCiAgICBhbHQgPSBub3QgYWx0CiAgZW5kCiAgcmV0dXJuIHN1bSAlIDEwID09IDAKZW5kCgpsb2NhbCBmdW5jdGlvbiBiYW5rX2NhcmRfY2hlY2sodikKICBsb2NhbCBzID0gKHRvc3RyaW5nKHYpOmdzdWIoJyVzKycsICcnKSkKICBpZiBub3QgczptYXRjaCgnXiVkKyQnKSB0aGVuIHJldHVybiByZXN1bHQoZmFsc2UsICflkKvpnZ7mlbDlrZflrZfnrKYnKSBlbmQKICBpZiAjcyA8IDEzIG9yICNzID4gMTkgdGhlbiByZXR1cm4gcmVzdWx0KGZhbHNlLCAn6ZW/5bqm6aG75Li6IDEz4oCTMTkg5L2NJykgZW5kCiAgaWYgbHVobl92YWxpZChzKSB0aGVuIHJldHVybiByZXN1bHQodHJ1ZSwgJ0x1aG4gT0snKSBlbmQKICByZXR1cm4gcmVzdWx0KGZhbHNlLCAnTHVobiDmoKHpqozlpLHotKUnKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5omL5py65Y+377yI5aSn6ZmG77yM5a6e55So6L+R5Ly877yaMVszLTldICsgOSDkvY3vvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwaG9uZV9jaGVjayh2KQogIGxvY2FsIHMgPSAodG9zdHJpbmcodik6Z3N1YignJXMrJywgJycpKQogIGlmIG5vdCBzOm1hdGNoKCdeJWQrJCcpIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+WQq+mdnuaVsOWtl+Wtl+espicpIGVuZAogIGlmICNzIH49IDExIHRoZW4gcmV0dXJuIHJlc3VsdChmYWxzZSwgJ+mVv+W6pumhu+S4uiAxMSDkvY0nKSBlbmQKICBpZiBzOm1hdGNoKCdeMVszLTldJykgdGhlbgogICAgcmV0dXJuIHJlc3VsdCh0cnVlLCAnT0vvvIgxWzMtOV0g5q6177yJJykKICBlbmQKICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5Y+35q615LiN56ym77yI6Z2eIDFbMy05XSDlvIDlpLTvvIknKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gVURGIOWIhuWPkeWMheijhQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIE9QUyA9IHsKICBpZF9jYXJkID0gaWRfY2FyZF9jaGVjaywKICB1c2NjID0gdXNjY19jaGVjaywKICBiYW5rX2NhcmQgPSBiYW5rX2NhcmRfY2hlY2ssCiAgcGhvbmUgPSBwaG9uZV9jaGVjaywKICBpZF8xNXRvMTggPSBpZF8xNXRvMTgsCn0KCnJldHVybiBmdW5jdGlvbihwKQogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuCiAgICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5Y+C5pWw6aG75Li66KGoIHt2PS4uLiwgb3A9Li4ufScpCiAgZW5kCiAgbG9jYWwgdiA9IHAudgogIGlmIHYgPT0gbmlsIG9yIHYgPT0gJycgdGhlbiByZXR1cm4gcmVzdWx0KGZhbHNlLCAn56m65YC8JykgZW5kCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdpZF9jYXJkJwogIGlmIG9wID09ICdpZF9leHRyYWN0JyB0aGVuCiAgICByZXR1cm4gaWRfZXh0cmFjdCh2KQogIGVuZAogIGxvY2FsIGZuID0gT1BTW29wXQogIGlmIG5vdCBmbiB0aGVuCiAgICByZXR1cm4gcmVzdWx0KGZhbHNlLCAn5pyq55+lIG9w77yaJyAuLiBvcCAuLiAn77yI5Y+v6YCJIGlkX2NhcmQvdXNjYy9iYW5rX2NhcmQvcGhvbmUvaWRfZXh0cmFjdC9pZF8xNXRvMTjvvIknKQogIGVuZAogIHJldHVybiBmbih2KQplbmQKAC0tIEBsaWI6IGJhc2V4eAotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzogYmFzZTg1IChSRkMgMTkyNCDlrZfnrKbpm4YpICsgYmFzZTU4IChCaXRjb2luKSDlpKfmlbTlnovnvJbop6PnoIHjgIIKLS0gICAgICAg6KGl6b2QIER1Y2tEQiDnlKjmiLflsYIgZ2Fw77yadG9fYmFzZSDlj6rmlK/mjIEgMi0zNu+8jGZyb21fYmFzZSDlj6rmlK/mjIEgYmFzZTY077yMYmFzZTg1LzU4IOe8uuWkseOAggotLSAgICAgICBvcD0nYmFzZTg1X2VuYycgICDvvJpwLmhleCDihpIgYmFzZTg1IOS4su+8iOWtl+espumbhiA9IFJGQzE5MjQg55qEIDg1IOWtl+espu+8mjAtOSBhLXogQS1aICsgMTIg56ym5Y+377yJCi0tICAgICAgIG9wPSdiYXNlODVfZGVjJyAgIO+8mnAudu+8iGJhc2U4NSDkuLLvvInihpIgaGV4Ci0tICAgICAgIG9wPSdiYXNlNThfZW5jJyAgIO+8mnAuaGV4IOKGkiBCaXRjb2luIGJhc2U1OCDkuLLvvIjlrZfnrKbpm4bml6AgMCBPIEkgbO+8jOWJjeWvvOmbtuWtl+iKgiDihpIgJzEn77yM5Y+v6YCG77yJCi0tICAgICAgIG9wPSdiYXNlNThfZGVjJyAgIO+8mnAudu+8iGJhc2U1OCDkuLLvvInihpIgaGV4Ci0tICAgICAgIOKaoO+4jyBJL08g5pivIGhleCDkuLLvvIhsdWFqaXRfcyDlj6rov5Tlm54gVkFSQ0hBUu+8jOS6jOi/m+WItui1sCBoZXjigJTigJTmnKzns7vliJfnuqblrprvvInjgIIKLS0gICAgICAg566X5rOV77ya5qCH5YeG5aSn5pW05Z6LIGJhc2UtTu+8iOS4jiBCaXRjb2luIGJhc2U1OCDlupPlkIznrpfms5XvvInjgIIKLS0gICAgICAgICAqIOWJjeWvvOmbtuWtl+iKgiDihpIgTiDkuKrmoIforrDlrZfnrKbvvIhiYXNlNTg9JzEnIC8gYmFzZTg1PScwJ++8ie+8jGRlY29kZSDmjInmoIforrDmlbDov5jljp/liY3lr7zpm7blrZfoioLvvIwKLS0gICAgICAgICAgIOWFqOmbtuS4siByb3VuZHRyaXAg57K+56Gu44CCCi0tICAgICAgICAgKiDms6jmhI/vvJpiYXNlODUg55So55qE5pivIFJGQzE5MjQg55qEKirlrZfnrKbpm4YqKu+8jOS9hue8luino+eggei1sOWkp+aVtOWei++8iOmdniBSRkMxOTI0IOeahCA1MiDlrZfoioLliIbnu4QKLS0gICAgICAgICAgIOa1geagvOW8j++8ieKAlOKAlOaJgOS7peS4juecnyBSRkMxOTI0IOa1geS4jemAkOWtl+iKguWFvOWuue+8jOS9huS9nOS4uue8luino+eggeW3peWFtyByb3VuZHRyaXAg57K+56Gu44CB6K+t5LmJ5riF5pmw44CCCi0tICAgICAgICAgICDpnIDopoHnnJ8gUkZDMTkyNCDmtYHmoLzlvI/ml7blj6bor7TjgIIKLS0gICAgICAgNjQg5L2N5a6J5YWo77yI56Gs57qm5p2f77yJ77ya5pys5py6IEx1YUpJVCDljp/nlJ/mlbTmlbAgMzIg5L2NIC8gZG91YmxlIDUzIOS9jSDihpIg5aSn5pW05Z6L6LWwKirlrZfoioLmlbDnu4QqKgotLSAgICAgICAgICAg6YCQ5a2X6IqC6L+b5L2N77yI5q+P5q2lIGN1ciA9IGJ5dGUqYmFzZStjYXJyeSA8IDI1NSo4NSs4NSA8IDJeMTfvvIxkb3VibGUg57K+56Gu77yJ77yMCi0tICAgICAgICAgICDml6DpnIAgRkZJ44CB5pegIDY0IOS9jeWtl+mdoumHj+OAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQtbGlicyDns7vliJfvvInvvJtiYXNlNTgg5a+56b2QIEJpdGNvaW4g5qCH5YeGCi0tIEByZXF1aXJlczog5peg77yI57qvIEx1Ye+8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWTvvIjlr7nmi40gcHl0aG9uMyBvcmFjbGXvvIxyb3VuZHRyaXAg5YWo6L+H77yM6KeBIHRlc3RfYmFzZXh4LnNxbO+8iQotLQotLSBVc2FnZToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSdiYXNleHgnKTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2Jhc2V4eCcsIHtoZXg6JzY4NjU2YzZjNmYnLCBvcDonYmFzZTg1X2VuYyd9KTsgICDihpIgJzFnNEkxPm0nCi0tICAgU0VMRUNUIGx1YWppdF9zKCdiYXNleHgnLCB7djonMWc0STE+bScsIG9wOidiYXNlODVfZGVjJ30pOyAgICAgICAgIOKGkiAnNjg2NTZjNmM2ZicKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2Jhc2V4eCcsIHtoZXg6J2RlYWRiZWVmJywgb3A6J2Jhc2U1OF9lbmMnfSk7ICAgICAg4oaSICc2aDhjUU4nCi0tICAgU0VMRUNUIGx1YWppdF9zKCdiYXNleHgnLCB7djonNmg4Y1FOJywgb3A6J2Jhc2U1OF9kZWMnfSk7ICAgICAgICAgIOKGkiAnZGVhZGJlZWYnCgotLSBSRkMgMTkyNCBiYXNlODUgYWxwaGFiZXQgKDg1IGNoYXJzOiAwLTkgYS16IEEtWiArICEjJCUmKCkqKy07PD0+P0BeX2B7fH1+KQpsb2NhbCBBODUgPSAiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVohIyQlJigpKistOzw9Pj9AXl9ge3x9fiIKbG9jYWwgQTg1X01BUCA9IHt9CmZvciBpID0gMSwgI0E4NSBkbyBBODVfTUFQW0E4NTpzdWIoaSwgaSldID0gaSAtIDEgZW5kCgotLSBCaXRjb2luIGJhc2U1OCBhbHBoYWJldCAoNTggY2hhcnMsIG5vIDAgTyBJIGwpCmxvY2FsIEE1OCA9ICIxMjM0NTY3ODlBQkNERUZHSEpLTE1OUFFSU1RVVldYWVphYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6Igpsb2NhbCBBNThfTUFQID0ge30KZm9yIGkgPSAxLCAjQTU4IGRvIEE1OF9NQVBbQTU4OnN1YihpLCBpKV0gPSBpIC0gMSBlbmQKCmxvY2FsIGZ1bmN0aW9uIGhleF90b19ieXRlcyhoKQogIGxvY2FsIG4gPSAjaAogIGlmIG4gJSAyIH49IDAgdGhlbiBlcnJvcignaGV4IG11c3QgaGF2ZSBldmVuIGxlbmd0aCcpIGVuZAogIHJldHVybiAoaDpzdWIoMSwgbik6Z3N1YignLi4nLCBmdW5jdGlvbihjYykgcmV0dXJuIHN0cmluZy5jaGFyKHRvbnVtYmVyKGNjLCAxNikpIGVuZCkpCmVuZAoKbG9jYWwgZnVuY3Rpb24gYnl0ZXNfdG9faGV4KGIpCiAgcmV0dXJuIChiOmdzdWIoJy4nLCBmdW5jdGlvbihjKSByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJTAyeCcsIGM6Ynl0ZSgpKSBlbmQpKQplbmQKCi0tIOaVsOWJjeWvvOmbtuWtl+iKguaVsApsb2NhbCBmdW5jdGlvbiBjb3VudF9sZWFkaW5nX3plcm8oZGF0YSkKICBsb2NhbCBjID0gMAogIGZvciBpID0gMSwgI2RhdGEgZG8KICAgIGlmIGRhdGE6c3ViKGksIGkpOmJ5dGUoKSA9PSAwIHRoZW4gYyA9IGMgKyAxIGVsc2UgYnJlYWsgZW5kCiAgZW5kCiAgcmV0dXJuIGMKZW5kCgotLSDlpKfnq6/lrZfoioLmlbDnu4TpmaTku6XlsI8gYmFzZe+8mui/lOWbniAo5Ymp5L2Z5a2X6IqC5pWw57uELCDkvZnmlbAp44CC5q+P5q2lIGN1cjwyXjE3IOeyvuehruOAggpsb2NhbCBmdW5jdGlvbiBkaXZfYnl0ZXNfYmUoZGF0YSwgYmFzZSkKICBsb2NhbCByZW0gPSAwCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaSA9IDEsICNkYXRhIGRvCiAgICBsb2NhbCBjdXIgPSByZW0gKiAyNTYgKyBkYXRhOnN1YihpLCBpKTpieXRlKCkKICAgIGxvY2FsIHEgPSBtYXRoLmZsb29yKGN1ciAvIGJhc2UpCiAgICByZW0gPSBjdXIgLSBxICogYmFzZQogICAgb3V0W2ldID0gcQogIGVuZAogIC0tIOWOu+WJjeWvvOmbtuWtl+iKggogIGxvY2FsIGogPSAxCiAgd2hpbGUgaiA8PSAjb3V0IGFuZCBvdXRbal0gPT0gMCBkbyBqID0gaiArIDEgZW5kCiAgaWYgaiA+ICNvdXQgdGhlbiByZXR1cm4gJycsIHJlbSBlbmQKICBsb2NhbCByZXN0ID0ge30KICBmb3IgaSA9IGosICNvdXQgZG8gcmVzdFsjcmVzdCArIDFdID0gc3RyaW5nLmNoYXIob3V0W2ldKSBlbmQKICByZXR1cm4gdGFibGUuY29uY2F0KHJlc3QpLCByZW0KZW5kCgotLSDlpKfnq6/lrZfoioLmlbDnu4TkuZjlsI8gYmFzZSDlho3liqAgdu+8iGRlY29kZSDnlKjvvInvvJrov5Tlm57mlrDlrZfoioLmlbDnu4TjgILmr4/mraUgY3VyPDJeMTcg57K+56Gu44CCCmxvY2FsIGZ1bmN0aW9uIG11bGFkZF9ieXRlc19iZShkYXRhLCBiYXNlLCB2KQogIC0tIOS7juS9juS9jSjlj7Mp5b6A6auY5L2NKOW3pinkuZjvvIzov5vkvY3lvoDlt6bkvKAKICBsb2NhbCBvdXQgPSB7fQogIGxvY2FsIGNhcnJ5ID0gdgogIGZvciBpID0gI2RhdGEsIDEsIC0xIGRvCiAgICBsb2NhbCBjdXIgPSBkYXRhOnN1YihpLCBpKTpieXRlKCkgKiBiYXNlICsgY2FycnkKICAgIG91dFtpXSA9IGN1ciAlIDI1NgogICAgY2FycnkgPSBtYXRoLmZsb29yKGN1ciAvIDI1NikKICBlbmQKICAtLSDlpITnkIbpq5jkvY3muqLlh7oKICBsb2NhbCBoZWFkID0ge30KICB3aGlsZSBjYXJyeSA+IDAgZG8KICAgIGhlYWRbI2hlYWQgKyAxXSA9IGNhcnJ5ICUgMjU2CiAgICBjYXJyeSA9IG1hdGguZmxvb3IoY2FycnkgLyAyNTYpCiAgZW5kCiAgLS0g57uE6KOF77yaaGVhZO+8iOmrmOS9jea6ouWHuu+8iSsgb3V077yI5Y6f6ZW/77yM5Y+z5a+56b2Q77yJCiAgbG9jYWwgYWxsID0ge30KICBmb3IgaSA9IDEsICNoZWFkIGRvIGFsbFsjYWxsICsgMV0gPSBoZWFkW2ldIGVuZAogIGZvciBpID0gMSwgI2RhdGEgZG8KICAgIGFsbFsjYWxsICsgMV0gPSBvdXRbaV0KICBlbmQKICBsb2NhbCBieXRlcyA9IHt9CiAgZm9yIGkgPSAxLCAjYWxsIGRvIGJ5dGVzWyNieXRlcyArIDFdID0gc3RyaW5nLmNoYXIoYWxsW2ldKSBlbmQKICBsb2NhbCByZXMgPSB0YWJsZS5jb25jYXQoYnl0ZXMpCiAgLS0g5Y675YmN5a+86Zu25a2X6IqC77yI5pyA5bCP6KGo56S677yJCiAgbG9jYWwgayA9IDEKICB3aGlsZSBrIDw9ICNyZXMgYW5kIHJlczpzdWIoaywgayk6Ynl0ZSgpID09IDAgZG8gayA9IGsgKyAxIGVuZAogIGlmIGsgPiAjcmVzIHRoZW4gcmV0dXJuICcnIGVuZAogIHJldHVybiByZXM6c3ViKGspCmVuZAoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX2dlbmVyaWMoaCwgYWxwaGEsIG1hcF91bnVzZWQsIGJhc2UsIG1hcmtlcikKICBsb2NhbCBkYXRhID0gaGV4X3RvX2J5dGVzKGgpCiAgaWYgI2RhdGEgPT0gMCB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBsZWFkID0gY291bnRfbGVhZGluZ196ZXJvKGRhdGEpCiAgbG9jYWwgcmVzdCA9IGRhdGE6c3ViKGxlYWQgKyAxKQogIGlmIHJlc3QgPT0gJycgdGhlbgogICAgLS0g5YWo6Zu25LiyIOKGkiBsZWFkIOS4quagh+iusAogICAgcmV0dXJuIHN0cmluZy5yZXAobWFya2VyLCBsZWFkKQogIGVuZAogIGxvY2FsIGNoYXJzID0ge30KICBsb2NhbCB3b3JrID0gcmVzdAogIHdoaWxlIHdvcmsgfj0gJycgZG8KICAgIHdvcmssIHIgPSBkaXZfYnl0ZXNfYmUod29yaywgYmFzZSkKICAgIGNoYXJzWyNjaGFycyArIDFdID0gYWxwaGE6c3ViKHIgKyAxLCByICsgMSkKICBlbmQKICBsb2NhbCByZXYgPSB7fQogIGZvciBpID0gI2NoYXJzLCAxLCAtMSBkbyByZXZbI3JldiArIDFdID0gY2hhcnNbaV0gZW5kCiAgcmV0dXJuIHN0cmluZy5yZXAobWFya2VyLCBsZWFkKSAuLiB0YWJsZS5jb25jYXQocmV2KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGRlY29kZV9nZW5lcmljKHMsIGFscGhhX3VudXNlZCwgbWFwLCBiYXNlLCBtYXJrZXIpCiAgaWYgcyA9PSAnJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBsZWFkID0gMAogIGZvciBpID0gMSwgI3MgZG8KICAgIGlmIHM6c3ViKGksIGkpID09IG1hcmtlciB0aGVuIGxlYWQgPSBsZWFkICsgMSBlbHNlIGJyZWFrIGVuZAogIGVuZAogIGxvY2FsIHJlc3QgPSBzOnN1YihsZWFkICsgMSkKICBpZiByZXN0ID09ICcnIHRoZW4KICAgIC0tIOWFqOaYr+agh+iusCDihpIgbGVhZCDkuKrpm7blrZfoioIKICAgIHJldHVybiBzdHJpbmcucmVwKCcwMCcsIGxlYWQpCiAgZW5kCiAgbG9jYWwgYnl0ZXMgPSAnJyAgLS0g5aSn56uv77yM5pyA5bCP6KGo56S6CiAgZm9yIGkgPSAxLCAjcmVzdCBkbwogICAgbG9jYWwgdiA9IG1hcFtyZXN0OnN1YihpLCBpKV0KICAgIGlmIHYgPT0gbmlsIHRoZW4gcmV0dXJuICdFUlI6IGludmFsaWQgY2hhcjogJyAuLiByZXN0OnN1YihpLCBpKSBlbmQKICAgIGJ5dGVzID0gbXVsYWRkX2J5dGVzX2JlKGJ5dGVzLCBiYXNlLCB2KQogIGVuZAogIHJldHVybiBzdHJpbmcucmVwKCcwMCcsIGxlYWQpIC4uIGJ5dGVzX3RvX2hleChieXRlcykKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgb3AgPSBwLm9wCiAgaWYgb3AgPT0gJ2Jhc2U4NV9lbmMnIHRoZW4KICAgIHJldHVybiBlbmNvZGVfZ2VuZXJpYyhwLmhleCBvciBwLnYgb3IgJycsIEE4NSwgQTg1X01BUCwgODUsICcwJykKICBlbHNlaWYgb3AgPT0gJ2Jhc2U4NV9kZWMnIHRoZW4KICAgIHJldHVybiBkZWNvZGVfZ2VuZXJpYyhwLnYgb3IgcC5oZXggb3IgJycsIEE4NSwgQTg1X01BUCwgODUsICcwJykKICBlbHNlaWYgb3AgPT0gJ2Jhc2U1OF9lbmMnIHRoZW4KICAgIHJldHVybiBlbmNvZGVfZ2VuZXJpYyhwLmhleCBvciBwLnYgb3IgJycsIEE1OCwgQTU4X01BUCwgNTgsICcxJykKICBlbHNlaWYgb3AgPT0gJ2Jhc2U1OF9kZWMnIHRoZW4KICAgIHJldHVybiBkZWNvZGVfZ2VuZXJpYyhwLnYgb3IgcC5oZXggb3IgJycsIEE1OCwgQTU4X01BUCwgNTgsICcxJykKICBlbmQKICByZXR1cm4gJ0VSUjogdW5rbm93biBvcCAnIC4uIHRvc3RyaW5nKG9wKQplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIGxvY2FsIG9rLCByID0gcGNhbGwocnVuLCBwKQogIGlmIG9rIHRoZW4gcmV0dXJuIHIgZW5kCiAgcmV0dXJuICdFUlI6ICcgLi4gdG9zdHJpbmcocikKZW5kCgAtLSBAbGliOiBzb3VuZGV4Ci0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDnvo7lm70gU291bmRleCDpn7PnvJbnoIEgKyBkaWZmZXJlbmNlIOebuOS8vOW6pu+8iFNRTGl0ZSBleHRlbnNpb24tZnVuY3Rpb25zLmMg55qEIHNvdW5kZXgoKS9kaWZmZXJlbmNlKCnvvInjgIIKLS0gICAgICAgRHVja0RCIOWOn+eUn+WPquaciSBsZXZlbnNodGVpbu+8iOe8lui+kei3neemu++8ie+8jOayoeaciemfs+i/keWMuemFjSDihpIg6L+Z5piv5a2X56ym5LiyIGdhcCDph4zllK/kuIDnnJ/nvLrlj6PjgIIKLS0gICAgICAgb3A9J3NvdW5kZXgnICAg77yacC52IOKGkiA0IOS9jSBTb3VuZGV4IOe8luegge+8iCdSMTYzJyDlvaLlvI/vvIzmoIflh4bnvo7lm70gU291bmRleO+8iQotLSAgICAgICBvcD0nZGlmZmVyZW5jZSc6IHAuYSArIHAuYiDihpIgMC00IOaVtOaVsO+8iOS4pOS4qiBTb3VuZGV4IOe8lueggemAkOS9jeebuOWQjOeahOS9jeaVsO+8jAotLSAgICAgICAgICAgICAgICAgICAgICAgIOS4jiBTUUxpdGUgZGlmZmVyZW5jZSgpIOivreS5ieS4gOiHtO+8muWvueWQhOiHqiBzb3VuZGV4IOWQjumAkOS9jeavlOi+g++8iQotLSAgICAgICDnrpfms5UgPSDmoIflh4bnvo7lm70gU291bmRleO+8iENlbnN1cyDop4TliJnvvInvvJoKLS0gICAgICAgICAqIOWPquS/neeVmeWtl+avje+8jOmmluWtl+avjeS/neeVme+8iOmmluWtl+avjeWQjOeggeS5n+iuoe+8iQotLSAgICAgICAgICogQkZQVj0xIENHSktRU1haPTIgRFQ9MyBMPTQgTU49NSBSPTbvvIzlhbbkvZnlhYPpn7MoQUVJT1Up5LiN57yW56CB5LiUKirph43nva4qKuWJjeeggQotLSAgICAgICAgICogSC9XL1kg5LiN57yW56CB5L2GKirkuI3ph43nva4qKuWJjeegge+8iOWQjOeggeiiqyBIL1cvWSDpmpTlvIDku43nrpfnm7jpgrvlkIznoIHvvIzlj6rlj5bkuIDmrKHvvIkKLS0gICAgICAgICAqIOi/nue7reWQjOeggeWPquWPluesrOS4gOS4qu+8m+S4jei2s+ihpSAwIOWIsCA0IOS9jQotLSBAc291cmNlOiDmoIflh4bnvo7lm70gU291bmRleO+8iFUuUy4gQ2Vuc3Vz77yJ77yb6K+t5LmJ5a+56b2QIFNRTGl0ZSBleHRlbnNpb24tZnVuY3Rpb25zLmMKLS0gQHJlcXVpcmVzOiDml6DvvIjnuq8gTHVh77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZO+8iOWvueaLjSBweXRob24zIOagh+WHhiBTb3VuZGV4IG9yYWNsZe+8jOingSB0ZXN0X3NvdW5kZXguc3Fs77yJCi0tCi0tIFVzYWdlOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3NvdW5kZXgnKTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3NvdW5kZXgnLCB7djonUm9iZXJ0Jywgb3A6J3NvdW5kZXgnfSk7ICAgICAgICAgIOKGkiAnUjE2MycKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3NvdW5kZXgnLCB7djonUmFiYXJ0Jywgb3A6J3NvdW5kZXgnfSk7ICAgICAgICAgIOKGkiAnUjE2MycKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3NvdW5kZXgnLCB7YTonUm9iZXJ0JywgYjonUmFiYXJ0Jywgb3A6J2RpZmZlcmVuY2UnfSk7IOKGkiA0Cgpsb2NhbCBjb2RlID0gewogIEI9JzEnLCBGPScxJywgUD0nMScsIFY9JzEnLAogIEM9JzInLCBHPScyJywgSj0nMicsIEs9JzInLCBRPScyJywgUz0nMicsIFg9JzInLCBaPScyJywKICBEPSczJywgVD0nMycsCiAgTD0nNCcsCiAgTT0nNScsIE49JzUnLAogIFI9JzYnLAp9CmxvY2FsIEhXWSA9IHsgSD10cnVlLCBXPXRydWUsIFk9dHJ1ZSB9Cgpsb2NhbCBmdW5jdGlvbiBzb3VuZGV4KHdvcmQpCiAgbG9jYWwgdyA9ICcnCiAgZm9yIGNoIGluIHRvc3RyaW5nKHdvcmQpOnVwcGVyKCk6Z21hdGNoKCclYScpIGRvCiAgICB3ID0gdyAuLiBjaAogIGVuZAogIGlmIHcgPT0gJycgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgcmVzID0gdzpzdWIoMSwgMSkKICBsb2NhbCBwcmV2ID0gY29kZVt3OnN1YigxLCAxKV0KICBmb3IgaSA9IDIsICN3IGRvCiAgICBsb2NhbCBjID0gdzpzdWIoaSwgaSkKICAgIGxvY2FsIGQgPSBjb2RlW2NdCiAgICBpZiBkID09IG5pbCB0aGVuCiAgICAgIGlmIEhXWVtjXSB0aGVuCiAgICAgICAgLS0gSC9XL1nvvJrkuI3ph43nva4gcHJldu+8iOS4jemHjeWkjeebuOmCu+WQjOegge+8iQogICAgICBlbHNlCiAgICAgICAgcHJldiA9IG5pbCAgLS0g5YWD6Z+z562J77ya6YeN572uIHByZXbvvIjliIbpmpTnrKbvvIkKICAgICAgZW5kCiAgICBlbHNlCiAgICAgIGlmIGQgfj0gcHJldiB0aGVuCiAgICAgICAgcmVzID0gcmVzIC4uIGQKICAgICAgICBwcmV2ID0gZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiAocmVzIC4uICcwMDAnKTpzdWIoMSwgNCkKZW5kCgpsb2NhbCBmdW5jdGlvbiBkaWZmZXJlbmNlKGEsIGIpCiAgbG9jYWwgc2EsIHNiID0gc291bmRleChhKSwgc291bmRleChiKQogIGxvY2FsIG4gPSAjc2EgPCAjc2IgYW5kICNzYSBvciAjc2IKICBsb2NhbCBzYW1lID0gMAogIGZvciBpID0gMSwgbiBkbwogICAgaWYgc2E6c3ViKGksIGkpID09IHNiOnN1YihpLCBpKSB0aGVuIHNhbWUgPSBzYW1lICsgMSBlbmQKICBlbmQKICByZXR1cm4gdG9zdHJpbmcoc2FtZSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdzb3VuZGV4JwogIGlmIG9wID09ICdzb3VuZGV4JyB0aGVuCiAgICByZXR1cm4gc291bmRleChwLnYgb3IgJycpCiAgZWxzZWlmIG9wID09ICdkaWZmZXJlbmNlJyB0aGVuCiAgICByZXR1cm4gZGlmZmVyZW5jZShwLmEgb3IgJycsIHAuYiBvciAnJykKICBlbmQKICByZXR1cm4gJ0VSUjogdW5rbm93biBvcCAnIC4uIHRvc3RyaW5nKG9wKQplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIGxvY2FsIG9rLCByID0gcGNhbGwocnVuLCBwKQogIGlmIG9rIHRoZW4gcmV0dXJuIHIgZW5kCiAgcmV0dXJuICdFUlI6ICcgLi4gdG9zdHJpbmcocikKZW5kCgAtLSBAbGliOiByc2lfc2NvcmVyCi0tIEBjYXRlZ29yeTogbWwKLS0gQGRlc2M6IOaJp+ihjOeJueW+geaJk+WIhumAieaLqeWZqO+8iOS4lueVjOaooeWei+S9juS/neecn+eJiO+8ieKAlOKAlOWAmemAieWKqOS9nOWFiOS9juaIkOacrOivlei3keaNleiOt+aJp+ihjOeJueW+ge+8jAotLSAgICAgICAg54m55b6B5Yqg5p2D5ZKM77yI5oSf55+l5py6L+mAu+i+keWbnuW9kuW8j+aJk+WIhu+8iemAieWHuiBhcmdtYXgg5YCZ6YCJ77yb5Y6G5Y+yIHBhc3MvZmFpbCDlj6/lnKjnur8KLS0gICAgICAgIOaEn+efpeacuumHjeS8sOadg+mHje+8iExlYXJu4oaSUmV0YWluIOeahOS9juS/neecn+etieS7t+eJqe+8ieOAggotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0gICDorr7orqHvvJpSU0ktQW55dGhpbmfvvIhhclhpdiAyNjEwLjEzOTEy77yJ55So5LiW55WM5qih5Z6L77yISkVQQSDmvZznqbrpl7TpooTmtYvvvInlr7nlgJnpgInliqjkvZwKLS0gICDmiZPliIbpgInmi6nvvJvmnKzlupPmmK/lhbbkvY7kv53nnJ/nrYnku7fnianigJTigJTnlKjjgIzmiafooYznibnlvoHliqDmnYPlkozjgI3mm7/ku6PmvZznqbrpl7TpooTmtYvvvJoKLS0gICAgIDEpIOWAmemAieWFiOS9juaIkOacrOivlei3kSDihpIg5o2V6I635omn6KGM54m55b6B77yIZXhlY19vay9yb3dfY291bnQvbGF0ZW5jeV9tcy9udWxsX3JhdGUvLi4u77yJCi0tICAgICAyKSBzY29yZSA9IOaEn+efpeacuuWKoOadg+WSjO+8iGV4ZWNfb2sg5p2D6YeN5pyA6auY77yM5oql6ZSZ5YCZ6YCJ5aSn6LSf5YiG77yJCi0tICAgICAzKSBzZWxlY3QgPSDkuIDnu4TlgJnpgInph4zlj5YgYXJnbWF477yI5bm25YiX5oyJIGNhbmRpZGF0ZV9pZCDlrZflhbjluo/vvIznoa7lrprmgKfvvIkKLS0gICAgIDQpIHVwZGF0ZV93ZWlnaHRzID0g55So5Y6G5Y+y77yI54m55b6BK+acgOe7iCBwYXNzL2ZhaWzvvInlnKjnur/mhJ/nn6XmnLrmm7TmlrDmnYPph40rYmlhcwotLSAgICAgIOKAlOKAlOOAjOS4lueVjOaooeWei+mAguW6lOOAjeeahOS9juS/neecn+eJiO+8iOaJk+WIhuWktOWtpuS8muWBj+WQkeiiq+mqjOivgeaIkOWKn+eahOeJueW+gee7hOWQiO+8ieOAggotLQotLSAgIOWPguaVsOW9ouaAge+8muaJgOacieWFpeWPgu+8iGZlYXR1cmVzL3dlaWdodHMvY2FuZGlkYXRlcy9oaXN0b3J577yJ5pei5Y+v5Lul5pivIFNRTCDkvqcKLS0gICDnu5PmnoTljJbooajvvIhzdHJ1Y3QgLyBsaXN0KHN0cnVjdCnvvInvvIzkuZ/lj6/ku6XmmK8gSlNPTiDlrZfnrKbkuLLigJTigJTmnKzlupPlhoXnva7pm7bkvp3otZYKLS0gICBKU09OIOino+egge+8jOWboOatpCB1cGRhdGVfd2VpZ2h0cyDov5Tlm57nmoQgSlNPTiDlj6/nm7TmjqXlm57lloLnu5nkuIvkuIDova7nmoQgd2VpZ2h0czog5Y+C5pWw44CCCi0tICAg54m55b6B5a2X5q6177yI5Z2H5Y+v57y655yB77yM57y655yBPeaXoOivgeaNruKGkuS4reaAp+WIhu+8jOWUryBleGVjX29rIOe8uuecgeaMiSAwL+Wksei0pSDlpITnkIbvvInvvJoKLS0gICAgIGV4ZWNfb2sgICAgICAgIERPVUJMRSAg6K+V6LeR5piv5ZCm5oiQ5YqfIDEvMO+8iOaguOW/g+S/oeWPt++8iQotLSAgICAgcm93X2NvdW50ICAgICAgRE9VQkxFICDkuqflh7rooYzmlbDvvIjkuI4gZXhwZWN0X3Jvd3Mg5a+554Wn5YGa5ZCI55CG5oCn5YiG77yJCi0tICAgICBleHBlY3Rfcm93cyAgICBET1VCTEUgIOacn+acm+ihjOaVsO+8iOiwg+eUqOaWuee7meWHuu+8m+e8uuecgeWImeihjOaVsOWIhuS4reaAp++8iQotLSAgICAgcm93X3RvbGVyYW5jZSAgRE9VQkxFICDooYzmlbDlrrnlt67mr5TkvovvvIjnvLrnnIEgMC4177yJCi0tICAgICBsYXRlbmN5X21zICAgICBET1VCTEUgIOaJp+ihjOW7tui/n++8iOi2hSBsYXRlbmN5X2J1ZGdldF9tcyDnur/mgKfmg6nnvZrvvIznvLrnnIHpooTnrpcgMjAwMG1z77yJCi0tICAgICBudWxsX3JhdGUgICAgICBET1VCTEUgIOe7k+aenOmbhuepuuWAvOeOhyAwLi4x77yI57q/5oCn5oOp572a77yJCi0tICAgICBlcnJvcl9jbGFzcyAgICBWQVJDSEFSICAnb2snLyd0aW1lb3V0Jy8nc3ludGF4Jy8nc2VtYW50aWNzJy8ncnVudGltZScvJ2RhdGEnLydvdGhlcicKLS0KLS0gICBvcCDliIblj5HvvIhsdWFqaXRfcygncnNpX3Njb3JlcicsIHtvcDouLi4sIC4uLn0p77yJ77yaCi0tICAgICBmZWF0dXJlcyAgICAgICB7Zjp7Li4ufX0gICAgICAgICAgICAgICAgICAgICAgICAgIOKGkiDlvZLkuIDljJbnibnlvoEgKyDpgJDnibnlvoHln7rnoYDliIYgSlNPTgotLSAgICAgc2NvcmUgICAgICAgICAge2Y6ey4uLn0sIHdlaWdodHM6ey4uLn0sIGJpYXM/fSAgICDihpIge3Njb3JlLCBjb250cmlidXRpb25zfSBKU09OCi0tICAgICBzZWxlY3QgICAgICAgICB7Y2FuZGlkYXRlczpbe2NhbmRpZGF0ZV9pZCwgZmVhdHVyZXM6ey4uLn19LC4uLl0sCi0tICAgICAgICAgICAgICAgICAgICAgd2VpZ2h0czp7Li4ufSwgYmlhcz8sIH0gICAgICAgICAgIOKGkiB7c2VsZWN0ZWRfaWQsIHNjb3JlLCByYW5raW5nfQotLSAgICAgdXBkYXRlX3dlaWdodHMge2hpc3Rvcnk6W3tmZWF0dXJlczp7Li4ufSwgcGFzczoxfDB8Ym9vbH0sLi4uXSwKLS0gICAgICAgICAgICAgICAgICAgICB3ZWlnaHRzOnsuLi59LCBscj8sIGVwb2Nocz8sIGJpYXM/fSDihpIge3dlaWdodHMsIGJpYXMsIHNhbXBsZXMsIHVwZGF0ZXN9Ci0tICAgICBkZWZhdWx0X3dlaWdodHMge30gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKGkiDlh7rljoLmnYPph40gSlNPTgotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6IFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0ncnNpX3Njb3JlcicpOwotLSAgIHNjb3JlOiAgIFNFTEVDVCBsdWFqaXRfcygncnNpX3Njb3JlcicsCi0tICAgICAgICAgICAgICB7b3A6J3Njb3JlJywgZjp7ZXhlY19vazoxLCByb3dfY291bnQ6MTAwMCwgZXhwZWN0X3Jvd3M6MTAwMCwKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRlbmN5X21zOjEyMCwgbnVsbF9yYXRlOjAuMDEsIGVycm9yX2NsYXNzOidvayd9fSk7Ci0tICAgc2VsZWN0OiAgU0VMRUNUIGx1YWppdF9zKCdyc2lfc2NvcmVyJywKLS0gICAgICAgICAgICAgIHtvcDonc2VsZWN0JywgY2FuZGlkYXRlczpbCi0tICAgICAgICAgICAgICAgICB7Y2FuZGlkYXRlX2lkOidjMScsIGZlYXR1cmVzOntleGVjX29rOjEsIHJvd19jb3VudDoxMDAwLAotLSAgICAgICAgICAgICAgICAgICBleHBlY3Rfcm93czoxMDAwLCBsYXRlbmN5X21zOjEyMCwgbnVsbF9yYXRlOjAuMDEsIGVycm9yX2NsYXNzOidvayd9fSwKLS0gICAgICAgICAgICAgICAgIHtjYW5kaWRhdGVfaWQ6J2MyJywgZmVhdHVyZXM6e2V4ZWNfb2s6MCwgcm93X2NvdW50OjAsCi0tICAgICAgICAgICAgICAgICAgIGxhdGVuY3lfbXM6OTAsIGVycm9yX2NsYXNzOidzeW50YXgnfX1dfSk7Ci0tICAg4oaSICd7InNlbGVjdGVkX2lkIjoiYzEiLCJzY29yZSI6Mi45OCwicmFua2luZyI6Wy4uLl19JwotLSAgIGxlYXJuOiAgIFNFTEVDVCBsdWFqaXRfcygncnNpX3Njb3JlcicsCi0tICAgICAgICAgICAgICB7b3A6J3VwZGF0ZV93ZWlnaHRzJywKLS0gICAgICAgICAgICAgICBoaXN0b3J5Olt7ZmVhdHVyZXM6e2V4ZWNfb2s6MSxyb3dfY291bnQ6NTAwLGV4cGVjdF9yb3dzOjUwMH0scGFzczp0cnVlfSwKLS0gICAgICAgICAgICAgICAgICAgICAgICB7ZmVhdHVyZXM6e2V4ZWNfb2s6MCxyb3dfY291bnQ6MCxlcnJvcl9jbGFzczonc3ludGF4J30scGFzczpmYWxzZX1dfSk7Ci0tCi0tIOivmuWunui+ueeVjO+8mgotLSAgICog5p2D6YeN5piv5omL5bel5YWI6aqML+aEn+efpeacuuWcqOe6v+abtOaWsO+8jOS4jeaYr+a9nOepuumXtOaooeWei++8m+eJueW+gS3nu5PmnpzlvLrnm7jlhbPml7bmnInmlYjvvIwKLS0gICAgIOW8seebuOWFs+aXtumAgOWMluS4uiBzdGF0aWMg5qGj77yI5a6e6aqM5a+554Wn57uE5Y2z6aqM5q2k54K577yJ44CCCi0tICAgKiDmiZPliIbkuI3lgZogc2lnbW9pZO+8iOaOkuW6j+eUqOmAlO+8jGFyZ21heCDkuI3lj5jvvInvvJvovpPlh7rkv53nlZkgNiDkvY3mnInmlYjlsI/mlbDjgIIKLS0gICAqIEx1YUpJVCDmlbDlrZfmmK8gZG91Ymxl77yaMl41MyDlhoXmlbTmlbDml6DmjZ/jgIIKLS0gICAqIOmAieaLqeetlueVpe+8iHJhbmRvbS9zdGF0aWMvZnVsbO+8ieWcqCBTUUwg5L6n57uE5ZCI77yacmFuZG9tIOeUqCBEdWNrREIgcmFuZG9tKCnvvIwKLS0gICAgIHN0YXRpYyA9IOS7hSB7ZXhlY19vazoxfSDmnYPph43vvIxmdWxsID0g5YWo54m55b6B5p2D6YeN77yI5oiWIHVwZGF0ZV93ZWlnaHRzIOS6p+eJqe+8ieOAggoKbG9jYWwgcnNpID0ge30KCmxvY2FsIGZ1bmN0aW9uIGpzb25fc3RyKHMpCiAgcmV0dXJuICciJyAuLiB0b3N0cmluZyhzKTpnc3ViKCdbJWMiXFxdJywgZnVuY3Rpb24oYykKICAgIGxvY2FsIG0gPSB7IFsnXG4nXSA9ICdcXG4nLCBbJ1xyJ10gPSAnXFxyJywgWydcdCddID0gJ1xcdCcsIFsnIiddID0gJ1xcIicsIFsnXFwnXSA9ICdcXFxcJyB9CiAgICByZXR1cm4gbVtjXSBvciBzdHJpbmcuZm9ybWF0KCdcXHUlMDR4JywgYzpieXRlKCkpCiAgZW5kKSAuLiAnIicKZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX251bSh2KQogIGlmIHR5cGUodikgfj0gJ251bWJlcicgb3IgdiB+PSB2IG9yIHYgPT0gbWF0aC5odWdlIG9yIHYgPT0gLW1hdGguaHVnZSB0aGVuCiAgICByZXR1cm4gJ251bGwnCiAgZW5kCiAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyUuNmcnLCB2KQplbmQKCmxvY2FsIGZ1bmN0aW9uIGpzb25fZW5jb2RlKHYpCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICdudW1iZXInIHRoZW4gcmV0dXJuIGpzb25fbnVtKHYpIGVuZAogIGlmIHQgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4ganNvbl9zdHIodikgZW5kCiAgaWYgdCA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCiAgaWYgdCA9PSAnbmlsJyB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgaWYgdCB+PSAndGFibGUnIHRoZW4gcmV0dXJuICdudWxsJyBlbmQKICBsb2NhbCBuID0gI3YKICBpZiBuID4gMCB0aGVuCiAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICBmb3IgaSA9IDEsIG4gZG8gcGFydHNbaV0gPSBqc29uX2VuY29kZSh2W2ldKSBlbmQKICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogIGVuZAogIGxvY2FsIHBhcnRzID0ge30KICBsb2NhbCBrZXlzID0ge30KICBmb3IgayBpbiBwYWlycyh2KSBkbyBrZXlzWyNrZXlzICsgMV0gPSBrIGVuZAogIHRhYmxlLnNvcnQoa2V5cywgZnVuY3Rpb24oYSwgYikgcmV0dXJuIHRvc3RyaW5nKGEpIDwgdG9zdHJpbmcoYikgZW5kKQogIGZvciBfLCBrIGluIGlwYWlycyhrZXlzKSBkbwogICAgcGFydHNbI3BhcnRzICsgMV0gPSBqc29uX3N0cihrKSAuLiAnOicgLi4ganNvbl9lbmNvZGUodltrXSkKICBlbmQKICByZXR1cm4gJ3snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnfScKZW5kCgpsb2NhbCBmdW5jdGlvbiByNih4KSByZXR1cm4gbWF0aC5mbG9vcih4ICogMWU2ICsgMC41KSAvIDFlNiBlbmQKCi0tIOaegeeugCBKU09OIOino+egge+8iOiHquWMheWQq++8jOmbtuS+nei1lu+8ie+8mm9iamVjdC9hcnJheS9zdHJpbmcvbnVtYmVyL3RydWUvZmFsc2UvbnVsbAotLSDmlK/mjIEgXCIgXFwgXC8gXG4gXHIgXHQgXGIgXGYg5LiOIFx1WFhYWO+8iOWQqyBVVEYtOCDnvJbnoIHvvIkKbG9jYWwgZnVuY3Rpb24ganNvbl9kZWNvZGUocykKICBpZiB0eXBlKHMpIH49ICdzdHJpbmcnIHRoZW4gZXJyb3IoJ2pzb25fZGVjb2RlOiBub3QgYSBzdHJpbmcnKSBlbmQKICBsb2NhbCBwb3MgPSAxCiAgbG9jYWwgZnVuY3Rpb24gZXJyKG0pIGVycm9yKCdqc29uOiAnIC4uIG0gLi4gJyBhdCBwb3MgJyAuLiBwb3MsIDApIGVuZAogIGxvY2FsIGZ1bmN0aW9uIHdzKCkKICAgIHdoaWxlIHBvcyA8PSAjcyBkbwogICAgICBsb2NhbCBjID0gczpzdWIocG9zLCBwb3MpCiAgICAgIGlmIGMgPT0gJyAnIG9yIGMgPT0gJ1x0JyBvciBjID09ICdcbicgb3IgYyA9PSAnXHInIHRoZW4gcG9zID0gcG9zICsgMSBlbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gdXRmOChjcCkKICAgIGlmIGNwIDwgMTI4IHRoZW4gcmV0dXJuIHN0cmluZy5jaGFyKGNwKSBlbmQKICAgIGlmIGNwIDwgMjA0OCB0aGVuCiAgICAgIHJldHVybiBzdHJpbmcuY2hhcigxOTIgKyBtYXRoLmZsb29yKGNwIC8gNjQpLCAxMjggKyBjcCAlIDY0KQogICAgZW5kCiAgICByZXR1cm4gc3RyaW5nLmNoYXIoMjI0ICsgbWF0aC5mbG9vcihjcCAvIDQwOTYpLAogICAgICAgICAgICAgICAgICAgICAgIDEyOCArIG1hdGguZmxvb3IoY3AgLyA2NCkgJSA2NCwgMTI4ICsgY3AgJSA2NCkKICBlbmQKICBsb2NhbCBwYXJzZV92YWx1ZQogIGxvY2FsIGZ1bmN0aW9uIHBhcnNlX3N0cmluZygpCiAgICBwb3MgPSBwb3MgKyAxCiAgICBsb2NhbCBvdXQgPSB7fQogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBsb2NhbCBjID0gczpzdWIocG9zLCBwb3MpCiAgICAgIGlmIGMgPT0gJycgdGhlbiBlcnIoJ3VudGVybWluYXRlZCBzdHJpbmcnKSBlbmQKICAgICAgaWYgYyA9PSAnIicgdGhlbiBwb3MgPSBwb3MgKyAxIGJyZWFrIGVuZAogICAgICBpZiBjID09ICdcXCcgdGhlbgogICAgICAgIGxvY2FsIGUgPSBzOnN1Yihwb3MgKyAxLCBwb3MgKyAxKQogICAgICAgIGlmIGUgPT0gJ3UnIHRoZW4KICAgICAgICAgIGxvY2FsIGhleCA9IHM6c3ViKHBvcyArIDIsIHBvcyArIDUpCiAgICAgICAgICBsb2NhbCBjcCA9IHRvbnVtYmVyKGhleCwgMTYpCiAgICAgICAgICBpZiBjcCA9PSBuaWwgdGhlbiBlcnIoJ2JhZCB1bmljb2RlIGVzY2FwZScpIGVuZAogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHV0ZjgoY3ApCiAgICAgICAgICBwb3MgPSBwb3MgKyA2CiAgICAgICAgZWxzZWlmIGUgPT0gJ24nIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcbic7IHBvcyA9IHBvcyArIDIKICAgICAgICBlbHNlaWYgZSA9PSAncicgdGhlbiBvdXRbI291dCArIDFdID0gJ1xyJzsgcG9zID0gcG9zICsgMgogICAgICAgIGVsc2VpZiBlID09ICd0JyB0aGVuIG91dFsjb3V0ICsgMV0gPSAnXHQnOyBwb3MgPSBwb3MgKyAyCiAgICAgICAgZWxzZWlmIGUgPT0gJ2InIHRoZW4gb3V0WyNvdXQgKyAxXSA9ICdcYic7IHBvcyA9IHBvcyArIDIKICAgICAgICBlbHNlaWYgZSA9PSAnZicgdGhlbiBvdXRbI291dCArIDFdID0gJ1xmJzsgcG9zID0gcG9zICsgMgogICAgICAgIGVsc2VpZiBlID09ICciJyBvciBlID09ICdcXCcgb3IgZSA9PSAnLycgdGhlbgogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IGU7IHBvcyA9IHBvcyArIDIKICAgICAgICBlbHNlIGVycignYmFkIGVzY2FwZScpIGVuZAogICAgICBlbHNlCiAgICAgICAgb3V0WyNvdXQgKyAxXSA9IGM7IHBvcyA9IHBvcyArIDEKICAgICAgZW5kCiAgICBlbmQKICAgIHJldHVybiB0YWJsZS5jb25jYXQob3V0KQogIGVuZAogIHBhcnNlX3ZhbHVlID0gZnVuY3Rpb24oKQogICAgd3MoKQogICAgbG9jYWwgYyA9IHM6c3ViKHBvcywgcG9zKQogICAgaWYgYyA9PSAneycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGxvY2FsIG9iaiA9IHt9CiAgICAgIHdzKCkKICAgICAgaWYgczpzdWIocG9zLCBwb3MpID09ICd9JyB0aGVuIHBvcyA9IHBvcyArIDEgcmV0dXJuIG9iaiBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHdzKCkKICAgICAgICBpZiBzOnN1Yihwb3MsIHBvcykgfj0gJyInIHRoZW4gZXJyKCdleHBlY3RlZCBvYmplY3Qga2V5JykgZW5kCiAgICAgICAgbG9jYWwgayA9IHBhcnNlX3N0cmluZygpCiAgICAgICAgd3MoKQogICAgICAgIGlmIHM6c3ViKHBvcywgcG9zKSB+PSAnOicgdGhlbiBlcnIoJ2V4cGVjdGVkIDonKSBlbmQKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgICAgb2JqW2tdID0gcGFyc2VfdmFsdWUoKQogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBkID0gczpzdWIocG9zLCBwb3MpCiAgICAgICAgaWYgZCA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIGQgPT0gJ30nIHRoZW4gcG9zID0gcG9zICsgMSBicmVhawogICAgICAgIGVsc2UgZXJyKCdleHBlY3RlZCAsIG9yIH0nKSBlbmQKICAgICAgZW5kCiAgICAgIHJldHVybiBvYmoKICAgIGVsc2VpZiBjID09ICdbJyB0aGVuCiAgICAgIHBvcyA9IHBvcyArIDEKICAgICAgbG9jYWwgYXJyID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MsIHBvcykgPT0gJ10nIHRoZW4gcG9zID0gcG9zICsgMSByZXR1cm4gYXJyIGVuZAogICAgICB3aGlsZSB0cnVlIGRvCiAgICAgICAgYXJyWyNhcnIgKyAxXSA9IHBhcnNlX3ZhbHVlKCkKICAgICAgICB3cygpCiAgICAgICAgbG9jYWwgZCA9IHM6c3ViKHBvcywgcG9zKQogICAgICAgIGlmIGQgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICAgIGVsc2VpZiBkID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDEgYnJlYWsKICAgICAgICBlbHNlIGVycignZXhwZWN0ZWQgLCBvciBdJykgZW5kCiAgICAgIGVuZAogICAgICByZXR1cm4gYXJyCiAgICBlbHNlaWYgYyA9PSAnIicgdGhlbgogICAgICByZXR1cm4gcGFyc2Vfc3RyaW5nKCkKICAgIGVsc2VpZiBjID09ICd0JyB0aGVuCiAgICAgIGlmIHM6c3ViKHBvcywgcG9zICsgMykgPT0gJ3RydWUnIHRoZW4gcG9zID0gcG9zICsgNCByZXR1cm4gdHJ1ZQogICAgICBlbHNlIGVycignYmFkIGxpdGVyYWwnKSBlbmQKICAgIGVsc2VpZiBjID09ICdmJyB0aGVuCiAgICAgIGlmIHM6c3ViKHBvcywgcG9zICsgNCkgPT0gJ2ZhbHNlJyB0aGVuIHBvcyA9IHBvcyArIDUgcmV0dXJuIGZhbHNlCiAgICAgIGVsc2UgZXJyKCdiYWQgbGl0ZXJhbCcpIGVuZAogICAgZWxzZWlmIGMgPT0gJ24nIHRoZW4KICAgICAgaWYgczpzdWIocG9zLCBwb3MgKyAzKSA9PSAnbnVsbCcgdGhlbiBwb3MgPSBwb3MgKyA0IHJldHVybiBuaWwKICAgICAgZWxzZSBlcnIoJ2JhZCBsaXRlcmFsJykgZW5kCiAgICBlbHNlCiAgICAgIGxvY2FsIG51bSA9IHM6bWF0Y2goJ1stK10/JWQqJS4/JWQrW2VFXT9bLStdPyVkKicsIHBvcykKICAgICAgICAgICAgICAgIG9yIHM6bWF0Y2goJyVkKyUuPyVkKltlRV1bLStdPyVkKycsIHBvcykKICAgICAgICAgICAgICAgIG9yIHM6bWF0Y2goJyVkKycsIHBvcykKICAgICAgaWYgbm90IG51bSBvciBudW0gPT0gJycgdGhlbiBlcnIoJ2JhZCB2YWx1ZScpIGVuZAogICAgICBsb2NhbCB2ID0gdG9udW1iZXIobnVtKQogICAgICBwb3MgPSBwb3MgKyAjbnVtCiAgICAgIHJldHVybiB2CiAgICBlbmQKICBlbmQKICBsb2NhbCB2ID0gcGFyc2VfdmFsdWUoKQogIHdzKCkKICBpZiBwb3MgPD0gI3MgdGhlbiBlcnIoJ3RyYWlsaW5nIGRhdGEnKSBlbmQKICByZXR1cm4gdgplbmQKCi0tIOWPguaVsOW9kuS4gO+8mnRhYmxlIOebtOeUqO+8m0pTT04g5a2X56ym5LiyIOKGkiDop6PnoIHmiJAgdGFibGXvvIjmlK/mjIHmioogdXBkYXRlX3dlaWdodHMg55qECi0tIOi/lOWbniBKU09OIOebtOaOpeWbnuWWgue7mSB3ZWlnaHRzOi9mZWF0dXJlczovY2FuZGlkYXRlczog5Y+C5pWw77yJCmxvY2FsIGZ1bmN0aW9uIGFzX3RhYmxlKHgpCiAgaWYgdHlwZSh4KSA9PSAndGFibGUnIHRoZW4gcmV0dXJuIHggZW5kCiAgaWYgdHlwZSh4KSA9PSAnc3RyaW5nJyBhbmQgeCB+PSAnJyB0aGVuCiAgICBsb2NhbCBvaywgdCA9IHBjYWxsKGpzb25fZGVjb2RlLCB4KQogICAgaWYgb2sgYW5kIHR5cGUodCkgPT0gJ3RhYmxlJyB0aGVuIHJldHVybiB0IGVuZAogIGVuZAogIHJldHVybiBuaWwKZW5kCgoKbG9jYWwgREVGQVVMVF9XRUlHSFRTID0gewogIGV4ZWNfb2sgPSAyLjAsICAgICAgLS0g5pyA6auY5p2D6YeN77ya5oql6ZSZ5YCZ6YCJ55u05o6l5aSn6LSf5YiGCiAgcm93X2NvdW50ID0gMS4wLCAgICAtLSDooYzmlbDlkIjnkIbmgKcKICBsYXRlbmN5X21zID0gMC41LCAgIC0tIOW7tui/n+aDqee9mgogIG51bGxfcmF0ZSA9IDEuMCwgICAgLS0g56m65YC8546H5oOp572aCiAgZXJyb3JfY2xhc3MgPSAwLjIsICAtLSDplJnor6/nsbvliKvljLrliIbluqYKfQoKLS0g5p2D6YeN5b2S5LiA77ya5pi+5byP57uZ55qE5p2D6YeN6KGo5Y+q55So57uZ5a6a55qE6ZSu77yI5aaCIHN0YXRpYyDmoaMge2V4ZWNfb2s6MX0g4oaSIOecn+eahOWPqueciyBleGVjX29r77yJ77ybCi0tIOacquaPkOS+my/nqbrooagg4oaSIOWHuuWOguWFqOeJueW+geadg+mHje+8iOS/neaMgSB1cGRhdGVfd2VpZ2h0cyDliY3lkI7mnYPph43lkIzmnoTvvIkKbG9jYWwgZnVuY3Rpb24gbm9ybV93ZWlnaHRzKHcpCiAgdyA9IGFzX3RhYmxlKHcpCiAgaWYgdyBhbmQgbmV4dCh3KSB+PSBuaWwgdGhlbgogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBrLCB2IGluIHBhaXJzKHcpIGRvIG91dFtrXSA9IHRvbnVtYmVyKHYpIG9yIDAgZW5kCiAgICByZXR1cm4gb3V0CiAgZW5kCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaywgdiBpbiBwYWlycyhERUZBVUxUX1dFSUdIVFMpIGRvIG91dFtrXSA9IHYgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIG5vcm1fZmVhdHVyZXMoZikKICBmID0gYXNfdGFibGUoZikgb3Ige30KICBsb2NhbCBvdXQgPSB7fQogIG91dC5leGVjX29rID0gdG9udW1iZXIoZi5leGVjX29rKSB+PSBuaWwgYW5kIHRvbnVtYmVyKGYuZXhlY19vaykgb3IgMAogIGlmIG91dC5leGVjX29rID49IDEgdGhlbiBvdXQuZXhlY19vayA9IDEgZWxzZWlmIG91dC5leGVjX29rIDw9IDAgdGhlbiBvdXQuZXhlY19vayA9IDAgZW5kCiAgb3V0LnJvd19jb3VudCA9IHRvbnVtYmVyKGYucm93X2NvdW50KQogIG91dC5leHBlY3Rfcm93cyA9IHRvbnVtYmVyKGYuZXhwZWN0X3Jvd3MpCiAgb3V0LnJvd190b2xlcmFuY2UgPSB0b251bWJlcihmLnJvd190b2xlcmFuY2UpIG9yIDAuNQogIG91dC5sYXRlbmN5X21zID0gdG9udW1iZXIoZi5sYXRlbmN5X21zKQogIG91dC5sYXRlbmN5X2J1ZGdldF9tcyA9IHRvbnVtYmVyKGYubGF0ZW5jeV9idWRnZXRfbXMpIG9yIDIwMDAKICBvdXQubnVsbF9yYXRlID0gdG9udW1iZXIoZi5udWxsX3JhdGUpCiAgb3V0LmVycm9yX2NsYXNzID0gdG9zdHJpbmcoZi5lcnJvcl9jbGFzcyBvciAnb2snKQogIGlmIG91dC5lcnJvcl9jbGFzcyB+PSAnb2snIGFuZCBvdXQuZXhlY19vayA9PSAxIHRoZW4KICAgIG91dC5lcnJvcl9jbGFzcyA9ICdvaycgLS0g5oiQ5Yqf5Y205qCH6ZSZ6K+v57G75Yir77ya5LulIGV4ZWNfb2sg5Li65YeGCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGVycm9yX2NsYXNzX3Njb3JlKGNscykKICBsb2NhbCB0ID0geyBvayA9IDAuMCwgdGltZW91dCA9IC0wLjYsIHN5bnRheCA9IC0wLjksIHNlbWFudGljcyA9IC0wLjcsCiAgICAgICAgICAgICAgcnVudGltZSA9IC0wLjgsIGRhdGEgPSAtMC41LCBvdGhlciA9IC0wLjQgfQogIHJldHVybiB0W2Nsc10gb3IgLTAuNAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6YCQ54m55b6B5Z+656GA5YiG77yIWy0xLDFd77yM56ym5Y+3PeaWueWQke+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJhc2Vfc2NvcmVzKGYpCiAgbG9jYWwgcyA9IHt9CiAgLS0gMSkgZXhlY19va++8muaIkOWKnyArMSAvIOWksei0pSDiiJIx77yI5p2D6YeN5pyA5aSnIOKGkiDmiqXplJnlgJnpgInlpKfotJ/liIbvvIkKICBzLmV4ZWNfb2sgPSAoZi5leGVjX29rID09IDEpIGFuZCAxIG9yIC0xCiAgLS0gMikg6KGM5pWw5ZCI55CG5oCn77yaMSDiiJIgbWluKDEsIHxyb3fiiJJleHBlY3R8IC8gbWF4KGV4cGVjdMK3dG9sLCAxKSnvvJswIOihjCB2cyDmnInmnJ/mnJsg4oaSIOKIkjEKICBpZiBmLnJvd19jb3VudCB+PSBuaWwgYW5kIGYuZXhwZWN0X3Jvd3Mgfj0gbmlsIGFuZCBmLmV4cGVjdF9yb3dzID4gMCB0aGVuCiAgICBpZiBmLnJvd19jb3VudCA9PSAwIHRoZW4KICAgICAgcy5yb3dfY291bnQgPSAtMQogICAgZWxzZQogICAgICBsb2NhbCB0b2wgPSBtYXRoLm1heChmLmV4cGVjdF9yb3dzICogZi5yb3dfdG9sZXJhbmNlLCAxKQogICAgICBsb2NhbCBkZXYgPSBtYXRoLmFicyhmLnJvd19jb3VudCAtIGYuZXhwZWN0X3Jvd3MpIC8gdG9sCiAgICAgIHMucm93X2NvdW50ID0gMSAtIG1hdGgubWluKDEsIGRldikKICAgIGVuZAogIGVsc2UKICAgIHMucm93X2NvdW50ID0gMCAtLSDml6DmnJ/mnJvlgLzlj6/lr7nnhacg4oaSIOS4reaApwogIGVuZAogIC0tIDMpIOW7tui/n+aDqee9mu+8mumihOeul+WGhSAw77yb6LaF6aKE566X57q/5oCn5YiwIOKIkjHvvIgyw5cg6aKE566X5bCB6aG277yJCiAgaWYgZi5sYXRlbmN5X21zIH49IG5pbCB0aGVuCiAgICBsb2NhbCBiID0gbWF0aC5tYXgoZi5sYXRlbmN5X2J1ZGdldF9tcywgMSkKICAgIGlmIGYubGF0ZW5jeV9tcyA8PSBiIHRoZW4gcy5sYXRlbmN5X21zID0gMAogICAgZWxzZSBzLmxhdGVuY3lfbXMgPSAtbWF0aC5taW4oMSwgKGYubGF0ZW5jeV9tcyAtIGIpIC8gYikgZW5kCiAgZWxzZQogICAgcy5sYXRlbmN5X21zID0gMAogIGVuZAogIC0tIDQpIG51bGwg546H5oOp572a77yaMCDihpIgMO+8m+KJpTAuNSDihpIg4oiSMQogIGlmIGYubnVsbF9yYXRlIH49IG5pbCB0aGVuCiAgICBsb2NhbCBuciA9IG1hdGgubWF4KDAsIG1hdGgubWluKDEsIGYubnVsbF9yYXRlKSkKICAgIHMubnVsbF9yYXRlID0gLW5yICogMgogIGVsc2UKICAgIHMubnVsbF9yYXRlID0gMAogIGVuZAogIC0tIDUpIOmUmeivr+exu+WIq+WfuuehgOWIhu+8iOS4jiBleGVjX29rPTAg5Y+g5Yqg77yM5o+Q5L6b5bm25YiX5pe255qE5Yy65YiG5bqm77yJCiAgcy5lcnJvcl9jbGFzcyA9IGVycm9yX2NsYXNzX3Njb3JlKGYuZXJyb3JfY2xhc3MpCiAgcmV0dXJuIHMKZW5kCgotLSDmhJ/nn6XmnLrliqDmnYPmgLvliIbvvIh6ID0gYmlhcyArIM6jIHfCt2Jhc2XvvJvmjpLluo/nlKjvvIzkuI3lgZogc2lnbW9pZO+8iQpsb2NhbCBmdW5jdGlvbiB3ZWlnaHRlZF9zY29yZShmLCB3LCBiaWFzKQogIGxvY2FsIHMgPSBiYXNlX3Njb3Jlcyhub3JtX2ZlYXR1cmVzKGYpKQogIGxvY2FsIHRvdGFsID0gYmlhcyBvciAwCiAgbG9jYWwgZGV0YWlsID0ge30KICBmb3IgayBpbiBwYWlycyh3KSBkbwogICAgbG9jYWwgYiA9IHNba10gb3IgMAogICAgdG90YWwgPSB0b3RhbCArIHdba10gKiBiCiAgICBkZXRhaWxba10gPSB7IGJhc2UgPSBiLCB3ZWlnaHQgPSB3W2tdLCBjb250cmliID0gd1trXSAqIGIgfQogIGVuZAogIHJldHVybiB0b3RhbCwgZGV0YWlsLCBzCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBvcCDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBvcF9mZWF0dXJlcyhwKQogIGxvY2FsIGYgPSBub3JtX2ZlYXR1cmVzKHAuZiBvciBwLmZlYXR1cmVzIG9yIHt9KQogIGxvY2FsIHMgPSBiYXNlX3Njb3JlcyhmKQogIGxvY2FsIGJzID0ge30KICBmb3IgaywgdiBpbiBwYWlycyhzKSBkbyBic1trXSA9IHI2KHYpIGVuZAogIHJldHVybiBqc29uX2VuY29kZSh7IG5vcm1hbGl6ZWQgPSBmLCBiYXNlX3Njb3JlcyA9IGJzIH0pCmVuZAoKbG9jYWwgZnVuY3Rpb24gb3Bfc2NvcmUocCkKICBsb2NhbCB3ID0gbm9ybV93ZWlnaHRzKHAud2VpZ2h0cykKICBsb2NhbCBiaWFzID0gdG9udW1iZXIocC5iaWFzKSBvciAwCiAgbG9jYWwgdG90YWwsIGRldGFpbCA9IHdlaWdodGVkX3Njb3JlKHAuZiBvciBwLmZlYXR1cmVzLCB3LCBiaWFzKQogIGxvY2FsIGQgPSB7fQogIGZvciBrLCB2IGluIHBhaXJzKGRldGFpbCkgZG8KICAgIGRba10gPSB7IGJhc2UgPSB2LmJhc2UsIHdlaWdodCA9IHYud2VpZ2h0LCBjb250cmliID0gcjYodi5jb250cmliKSB9CiAgZW5kCiAgcmV0dXJuIGpzb25fZW5jb2RlKHsgc2NvcmUgPSByNih0b3RhbCksIGJpYXMgPSByNihiaWFzKSwgY29udHJpYnV0aW9ucyA9IGQgfSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9zZWxlY3QocCkKICBsb2NhbCB3ID0gbm9ybV93ZWlnaHRzKHAud2VpZ2h0cykKICBsb2NhbCBiaWFzID0gdG9udW1iZXIocC5iaWFzKSBvciAwCiAgbG9jYWwgY2FuZHMgPSBhc190YWJsZShwLmNhbmRpZGF0ZXMpIG9yIHt9CiAgbG9jYWwgbiA9ICNjYW5kcwogIGlmIG4gPT0gMCB0aGVuIHJldHVybiBqc29uX2VuY29kZSh7IGVycm9yID0gJ25vIGNhbmRpZGF0ZXMnIH0pIGVuZAogIGxvY2FsIHNjb3JlZCA9IHt9CiAgZm9yIGkgPSAxLCBuIGRvCiAgICBsb2NhbCBjID0gY2FuZHNbaV0KICAgIGxvY2FsIHRvdGFsID0gd2VpZ2h0ZWRfc2NvcmUoYy5mZWF0dXJlcyBvciBjLmYgb3Ige30sIHcsIGJpYXMpCiAgICBzY29yZWRbaV0gPSB7IGNhbmRpZGF0ZV9pZCA9IHRvc3RyaW5nKGMuY2FuZGlkYXRlX2lkIG9yICgnYycgLi4gaSkpLAogICAgICAgICAgICAgICAgICBzY29yZSA9IHI2KHRvdGFsKSwgcmFuayA9IDAgfQogIGVuZAogIGxvY2FsIG9yZGVyID0ge30KICBmb3IgaSA9IDEsIG4gZG8gb3JkZXJbaV0gPSBpIGVuZAogIHRhYmxlLnNvcnQob3JkZXIsIGZ1bmN0aW9uKGEsIGIpCiAgICBpZiBzY29yZWRbYV0uc2NvcmUgfj0gc2NvcmVkW2JdLnNjb3JlIHRoZW4KICAgICAgcmV0dXJuIHNjb3JlZFthXS5zY29yZSA+IHNjb3JlZFtiXS5zY29yZQogICAgZW5kCiAgICByZXR1cm4gc2NvcmVkW2FdLmNhbmRpZGF0ZV9pZCA8IHNjb3JlZFtiXS5jYW5kaWRhdGVfaWQgLS0g5bm25YiX77ya5a2X5YW45bqP77yI56Gu5a6a5oCn77yJCiAgZW5kKQogIGZvciByLCBpIGluIGlwYWlycyhvcmRlcikgZG8gc2NvcmVkW2ldLnJhbmsgPSByIGVuZAogIGxvY2FsIHJhbmtpbmcgPSB7fQogIGZvciBpID0gMSwgbiBkbyByYW5raW5nW2ldID0gc2NvcmVkW2ldIGVuZAogIHRhYmxlLnNvcnQocmFua2luZywgZnVuY3Rpb24oYSwgYikgcmV0dXJuIGEucmFuayA8IGIucmFuayBlbmQpCiAgcmV0dXJuIGpzb25fZW5jb2RlKHsKICAgIHNlbGVjdGVkX2lkID0gc2NvcmVkW29yZGVyWzFdXS5jYW5kaWRhdGVfaWQsCiAgICBzY29yZSA9IHNjb3JlZFtvcmRlclsxXV0uc2NvcmUsCiAgICBiaWFzID0gcjYoYmlhcyksCiAgICByYW5raW5nID0gcmFua2luZywKICB9KQplbmQKCi0tIOWcqOe6v+aEn+efpeacuu+8iExlYXJu4oaSUmV0YWluIOS9juS/neecn+eJiO+8ie+8mgotLSDpgJDmnaHljoblj7IgKHg954m55b6B5Z+656GA5YiGLCB5PcKxMSnvvJroi6UgecK3KGJpYXMgKyB3wrd4KSDiiaQgMCDihpIgdyArPSBscsK3ecK3eCwgYmlhcyArPSBscsK3eQpsb2NhbCBmdW5jdGlvbiBvcF91cGRhdGVfd2VpZ2h0cyhwKQogIGxvY2FsIHcgPSBub3JtX3dlaWdodHMocC53ZWlnaHRzKQogIGxvY2FsIGxyID0gdG9udW1iZXIocC5scikgb3IgMC4xCiAgbG9jYWwgZXBvY2hzID0gbWF0aC5tYXgoMSwgbWF0aC5mbG9vcih0b251bWJlcihwLmVwb2Nocykgb3IgMykpCiAgbG9jYWwgYmlhcyA9IHRvbnVtYmVyKHAuYmlhcykgb3IgMAogIGxvY2FsIGhpc3RvcnkgPSBhc190YWJsZShwLmhpc3RvcnkpIG9yIHt9CiAgbG9jYWwgbiA9ICNoaXN0b3J5CiAgbG9jYWwgdXBkYXRlcyA9IDAKICBmb3IgXyA9IDEsIGVwb2NocyBkbwogICAgZm9yIGkgPSAxLCBuIGRvCiAgICAgIGxvY2FsIGggPSBoaXN0b3J5W2ldCiAgICAgIGxvY2FsIHkgPSAoaC5wYXNzID09IHRydWUgb3IgaC5wYXNzID09IDEgb3IgaC5wYXNzID09ICcxJykgYW5kIDEgb3IgLTEKICAgICAgbG9jYWwgcyA9IGJhc2Vfc2NvcmVzKG5vcm1fZmVhdHVyZXMoaC5mZWF0dXJlcyBvciBoLmYgb3Ige30pKQogICAgICBsb2NhbCB6ID0gYmlhcwogICAgICBmb3IgayBpbiBwYWlycyh3KSBkbyB6ID0geiArIHdba10gKiAoc1trXSBvciAwKSBlbmQKICAgICAgaWYgeSAqIHogPD0gMCB0aGVuCiAgICAgICAgZm9yIGsgaW4gcGFpcnModykgZG8gd1trXSA9IHdba10gKyBsciAqIHkgKiAoc1trXSBvciAwKSBlbmQKICAgICAgICBiaWFzID0gYmlhcyArIGxyICogeQogICAgICAgIHVwZGF0ZXMgPSB1cGRhdGVzICsgMQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGxvY2FsIG91dF93ID0ge30KICBmb3IgaywgdiBpbiBwYWlycyh3KSBkbyBvdXRfd1trXSA9IHI2KHYpIGVuZAogIHJldHVybiBqc29uX2VuY29kZSh7IHdlaWdodHMgPSBvdXRfdywgYmlhcyA9IHI2KGJpYXMpLAogICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXMgPSBuLCB1cGRhdGVzID0gdXBkYXRlcywgbHIgPSBsciwgZXBvY2hzID0gZXBvY2hzIH0pCmVuZAoKbG9jYWwgZnVuY3Rpb24gcnVuKHApCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKHsgZXJyb3IgPSAnZXhwZWN0ZWQgdGFibGUgcGFyYW0nIH0pIGVuZAogIGxvY2FsIG9wID0gcC5vcCBvciAnc2NvcmUnCiAgaWYgb3AgPT0gJ2ZlYXR1cmVzJyB0aGVuIHJldHVybiBvcF9mZWF0dXJlcyhwKSBlbmQKICBpZiBvcCA9PSAnc2NvcmUnIHRoZW4gcmV0dXJuIG9wX3Njb3JlKHApIGVuZAogIGlmIG9wID09ICdzZWxlY3QnIHRoZW4gcmV0dXJuIG9wX3NlbGVjdChwKSBlbmQKICBpZiBvcCA9PSAndXBkYXRlX3dlaWdodHMnIHRoZW4gcmV0dXJuIG9wX3VwZGF0ZV93ZWlnaHRzKHApIGVuZAogIGlmIG9wID09ICdkZWZhdWx0X3dlaWdodHMnIHRoZW4gcmV0dXJuIGpzb25fZW5jb2RlKERFRkFVTFRfV0VJR0hUUykgZW5kCiAgcmV0dXJuIGpzb25fZW5jb2RlKHsgZXJyb3IgPSAndW5rbm93biBvcDogJyAuLiB0b3N0cmluZyhvcCkgfSkKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogdG9tbGluaQotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogVE9NTCArIElOSSDphY3nva7op6PmnpDvvIjnuq8gTHVh77yM6Ieq5YyF5ZCr77yJ4oaSIEpTT04g5a2X56ym5Liy77yI6YWNIGpzb25fZXh0cmFjdCDlsZXlvIDvvInjgIIKLS0gICAgICAgb3A9J3RvbWwn77yaVE9NTCDlrZDpm4Yg4oaSIEpTT07jgILmlK/mjIHvvJpbc2VjdGlvbl0gLyBbYS5iXSDltYzlpZfjgIFrZXkgPSDmoIfph48KLS0gICAgICAgICAgICAgICAgICDvvIhzdHJpbmcvaW50L2Zsb2F0L2Jvb2zvvInjgIHlpJrooYzlrZfnrKbkuLLvvIgiIiIuLiIiIu+8ieOAgeazqOmHiiAj44CBCi0tICAgICAgICAgICAgICAgICAg6KGM5YaF6KGoIHsgayA9IHYgfeOAgeihjOWGheaVsOe7hCBbIC4uIF3jgIHngrnot6/lvoQga2V544CCCi0tICAgICAgICAgICAgICAgICAg6K+a5a6e6L6555WM77ya5pegIGRhdGUtdGltZSDkuJPpl6jnsbvlnovvvIjlvZPlrZfnrKbkuLLvvInjgIHml6DmlbDnu4TooaggW1suLl1d44CBCi0tICAgICAgICAgICAgICAgICAg5peg6KO4IGtleSDkuYvlpJbnmoTlvJXlj7cga2V5IOS5i+WkluWkjeadgue7k+aehOOAgeaXoOWkmuaWh+aho+OAggotLSAgICAgICBvcD0naW5pJ++8mklOSSDihpIgSlNPTuOAguaUr+aMge+8mltzZWN0aW9uXSDliIbnu4TvvIjml6DliIbnu4TlvZLlhaXmoLnvvInjgIFrZXkgPSB2YWx1ZeOAgQotLSAgICAgICAgICAgICAgICAgIOazqOmHiiA7IOS4jiAj77yI6KGM6aaW77yJ44CB5YC857G75Z6L5ZeF5o6i77yIaW50L2Zsb2F0L2Jvb2wv5YW25L2Z5Li65a2X56ym5Liy77yJ44CCCi0tICAgICAgIOS4pOiAhemDvei/lOWbniBKU09OIOWvueixoeWtl+espuS4su+8m+epuuaWh+S7tui/lOWbniAne30n44CCCi0tIEBzb3VyY2U6IG9yaWdpbmFs77yIZHVja2RiLWx1YWppdCDns7vliJfvvIzoh6rljIXlkKvml6DlpJbpg6jkvp3otZbvvIkKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3RvbWxpbmknKTsKLS0gICB0b21sOiAgICAgU0VMRUNUIGx1YWppdF9zKCd0b21saW5pJywge3Y6ICdbZGJdXG5ob3N0ID0gIngiXG5wb3J0ID0gNTQzMlxuJywgb3A6J3RvbWwnfSk7Ci0tICAgICAgICAgICAgIOKGkiAneyJkYiI6eyJob3N0IjoieCIsInBvcnQiOjU0MzJ9fScKLS0gICBpbmk6ICAgICAgU0VMRUNUIGx1YWppdF9zKCd0b21saW5pJywge3Y6ICdbc2VjXVxuayA9IDNcbicsIG9wOidpbmknfSk7Ci0tICAgICAgICAgICAgIOKGkiAneyJzZWMiOnsiayI6M319JwotLSAgIGRyaWxsOiAgICBTRUxFQ1QganNvbl9leHRyYWN0KGx1YWppdF9zKCd0b21saW5pJywge3Y6PXQsIG9wOj0ndG9tbCd9KSwgJyQuZGIucG9ydCcpOwoKbG9jYWwgdG9tbGluaSA9IHt9CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOmAmueUqOW3peWFtwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHRyaW0ocykgcmV0dXJuIChzOmdzdWIoJ14lcyonLCAnJyk6Z3N1YignJXMqJCcsICcnKSkgZW5kCgpsb2NhbCBmdW5jdGlvbiBzdHJpcF9jb21tZW50KHMpCiAgLS0gVE9NTO+8miMg6LW35aeL5rOo6YeK77yI5LiN5Zyo5byV5Y+35YaF77yJCiAgbG9jYWwgb3V0LCBpbnEgPSB7fSwgZmFsc2UKICBmb3IgaSA9IDEsICNzIGRvCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJyInIHRoZW4gaW5xID0gbm90IGlucSBlbmQKICAgIGlmIGMgPT0gJyMnIGFuZCBub3QgaW5xIHRoZW4gYnJlYWsgZW5kCiAgICBvdXRbI291dCArIDFdID0gYwogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQob3V0KQplbmQKCi0tIOino+aekCBUT01ML0lOSSDlj7PkvqfmoIfph4/lgLzvvIjluKblvJXlj7flrZfnrKbkuLIgLyBib29sIC8gbnVtYmVyIC8g6KGM5YaF6KGoIC8g6KGM5YaF5pWw57uE77yJCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3RvbWxfdmFsdWUocmF3KQogIHJhdyA9IHRyaW0ocmF3KQogIGlmIHJhdyA9PSAnJyB0aGVuIHJldHVybiBuaWwgZW5kCiAgLS0g5aSa6KGM5a2X56ym5Liy77yI566A5YyW77ya5Y2V6KGM5YaFICIiIi4uIiIi77yJCiAgaWYgcmF3Om1hdGNoKCdeIiIiJykgYW5kIHJhdzptYXRjaCgnIiIiJCcpIHRoZW4KICAgIHJldHVybiByYXc6c3ViKDQsIC00KQogIGVuZAogIC0tIOWPjOW8leWPt+Wtl+espuS4sgogIGlmIHJhdzptYXRjaCgnXiInKSB0aGVuCiAgICBsb2NhbCBib2R5ID0gcmF3Om1hdGNoKCdeIiguKikiJXMqJCcpCiAgICBpZiBib2R5IHRoZW4KICAgICAgcmV0dXJuIChib2R5OmdzdWIoJ1xcKFtucnQiXFxdKScsIGZ1bmN0aW9uKGMpCiAgICAgICAgaWYgYyA9PSAnbicgdGhlbiByZXR1cm4gJ1xuJyBlbHNlaWYgYyA9PSAncicgdGhlbiByZXR1cm4gJ1xyJwogICAgICAgIGVsc2VpZiBjID09ICd0JyB0aGVuIHJldHVybiAnXHQnIGVsc2UgcmV0dXJuIGMgZW5kCiAgICAgIGVuZCkpCiAgICBlbmQKICAgIHJldHVybiBuaWwKICBlbmQKICAtLSDljZXlvJXlj7flrZfnrKbkuLLvvIhUT01MIGxpdGVyYWzvvIzml6DovazkuYnvvIkKICBpZiByYXc6bWF0Y2goIl4nIikgdGhlbgogICAgcmV0dXJuIHJhdzptYXRjaCgiXicoLiopJyVzKiQiKQogIGVuZAogIC0tIOihjOWGheihqCB7IGsgPSB2LCAuLi4gfQogIGlmIHJhdzptYXRjaCgnXiV7JykgYW5kIHJhdzptYXRjaCgnJX0kJykgdGhlbgogICAgbG9jYWwgaW5uZXIgPSByYXc6bWF0Y2goJ14leyguLSklfSQnKQogICAgbG9jYWwgb2JqID0ge30KICAgIGZvciBwYXJ0IGluIGlubmVyOmdtYXRjaCgnKFteLHt9XSspJykgZG8KICAgICAgbG9jYWwgaywgdiA9IHBhcnQ6bWF0Y2goJ14lcyooWyV3JS5fLV0rKSVzKj0lcyooLiopJXMqJCcpCiAgICAgIGlmIGsgdGhlbiBvYmpba10gPSBwYXJzZV90b21sX3ZhbHVlKHYpIGVuZAogICAgZW5kCiAgICByZXR1cm4gb2JqCiAgZW5kCiAgLS0g6KGM5YaF5pWw57uEIFsgYSwgYiwgLi4uIF0KICBpZiByYXc6bWF0Y2goJ14lWycpIGFuZCByYXc6bWF0Y2goJyVdJCcpIHRoZW4KICAgIGxvY2FsIGlubmVyID0gcmF3Om1hdGNoKCdeJVsoLi0pJV0kJykKICAgIGxvY2FsIGFyciA9IHt9CiAgICBmb3IgaXRlbSBpbiBpbm5lcjpnbWF0Y2goJyhbXixcXFslXV0rKScpIGRvCiAgICAgIGxvY2FsIHYgPSBwYXJzZV90b21sX3ZhbHVlKGl0ZW0pCiAgICAgIGlmIHYgfj0gbmlsIHRoZW4gYXJyWyNhcnIgKyAxXSA9IHYgZW5kCiAgICBlbmQKICAgIHJldHVybiBhcnIKICBlbmQKICAtLSBib29sCiAgbG9jYWwgbG93ID0gcmF3Omxvd2VyKCkKICBpZiBsb3cgPT0gJ3RydWUnIHRoZW4gcmV0dXJuIHRydWUgZW5kCiAgaWYgbG93ID09ICdmYWxzZScgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgLS0gZmxvYXQgLyBpbnQKICBsb2NhbCBuID0gdG9udW1iZXIocmF3KQogIGlmIG4gdGhlbiByZXR1cm4gbiBlbmQKICByZXR1cm4gcmF3ICAtLSDlhZzlupXvvJrlvZPlrZfnrKbkuLIKZW5kCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9pbmlfdmFsdWUocmF3KQogIHJhdyA9IHRyaW0ocmF3KQogIGxvY2FsIGxvdyA9IHJhdzpsb3dlcigpCiAgaWYgbG93ID09ICd0cnVlJyBvciBsb3cgPT0gJ3llcycgb3IgbG93ID09ICdvbicgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBsb3cgPT0gJ2ZhbHNlJyBvciBsb3cgPT0gJ25vJyBvciBsb3cgPT0gJ29mZicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKHJhdykKICBpZiBuIHRoZW4gcmV0dXJuIG4gZW5kCiAgLS0g5Y675byV5Y+3CiAgaWYgcmF3Om1hdGNoKCdeIicpIGFuZCByYXc6bWF0Y2goJyIkJykgdGhlbiByZXR1cm4gcmF3OnN1YigyLCAtMikgZW5kCiAgaWYgcmF3Om1hdGNoKCJeJyIpIGFuZCByYXc6bWF0Y2goIickIikgdGhlbiByZXR1cm4gcmF3OnN1YigyLCAtMikgZW5kCiAgcmV0dXJuIHJhdwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gSlNPTiDnvJbnoIEKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBqc29uX2VzY2FwZShzKQogIHJldHVybiAodG9zdHJpbmcocyk6Z3N1YignKFtcXFwiXG5cdFxyXSknLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnXFwnIHRoZW4gcmV0dXJuICdcXFxcJyBlbHNlaWYgYyA9PSAnIicgdGhlbiByZXR1cm4gJ1xcIicKICAgIGVsc2VpZiBjID09ICdcbicgdGhlbiByZXR1cm4gJ1xcbicgZWxzZWlmIGMgPT0gJ1x0JyB0aGVuIHJldHVybiAnXFx0JwogICAgZWxzZWlmIGMgPT0gJ1xyJyB0aGVuIHJldHVybiAnXFxyJyBlbHNlIHJldHVybiBjIGVuZAogIGVuZCkpCmVuZAoKbG9jYWwgVCA9IHt9CmxvY2FsIGZ1bmN0aW9uIGp0eXBlKHYpIHJldHVybiB0eXBlKHYpIGVuZApsb2NhbCBmdW5jdGlvbiBpc190YWJsZSh2KSByZXR1cm4gdHlwZSh2KSA9PSAndGFibGUnIGVuZApsb2NhbCBmdW5jdGlvbiBpc19hcnJheSh0KQogIC0tIOS4peagvO+8muaJgOaciemUruS4uiAxLi4jdCDnmoTov57nu63mlbTmlbAKICBpZiAjdCA9PSAwIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGxvY2FsIG4gPSAjdAogIGlmIG4gPT0gMCB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBmb3IgaSA9IDEsIG4gZG8KICAgIGlmIHRbaV0gPT0gbmlsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGVuZAogIGxvY2FsIGNvdW50ID0gMAogIGZvciBrIGluIHBhaXJzKHQpIGRvCiAgICBjb3VudCA9IGNvdW50ICsgMQogICAgaWYgdHlwZShrKSB+PSAnbnVtYmVyJyBvciBrIH49IG1hdGguZmxvb3Ioaykgb3IgayA8IDEgb3IgayA+IG4gdGhlbgogICAgICByZXR1cm4gZmFsc2UKICAgIGVuZAogIGVuZAogIHJldHVybiBjb3VudCA9PSBuCmVuZAoKZnVuY3Rpb24gVC5lbmNvZGUodikKICBsb2NhbCB0ID0ganR5cGUodikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgaWYgdCA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdG9zdHJpbmcodikgZW5kCiAgaWYgdCA9PSAnbnVtYmVyJyB0aGVuCiAgICBpZiB2ICUgMSA9PSAwIHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkJywgdikgZW5kCiAgICByZXR1cm4gdG9zdHJpbmcodikKICBlbmQKICBpZiB0ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICciJyAuLiBqc29uX2VzY2FwZSh2KSAuLiAnIicgZW5kCiAgaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGlmIGlzX2FycmF5KHYpIHRoZW4KICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaSA9IDEsICN2IGRvIHBhcnRzWyNwYXJ0cyArIDFdID0gVC5lbmNvZGUodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogICAgZW5kCiAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICBmb3IgaywgdmFsIGluIHBhaXJzKHYpIGRvCiAgICAgIHBhcnRzWyNwYXJ0cyArIDFdID0gJyInIC4uIGpzb25fZXNjYXBlKHRvc3RyaW5nKGspKSAuLiAnIjonIC4uIFQuZW5jb2RlKHZhbCkKICAgIGVuZAogICAgcmV0dXJuICd7JyAuLiB0YWJsZS5jb25jYXQocGFydHMsICcsJykgLi4gJ30nCiAgZW5kCiAgcmV0dXJuICdudWxsJwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gVE9NTCDop6PmnpAKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwYXJzZV90b21sKHRleHQpCiAgbG9jYWwgcm9vdCA9IHt9CiAgbG9jYWwgY3VycmVudCA9IHJvb3QKICBmb3IgbGluZSBpbiAodGV4dCAuLiAnXG4nKTpnbWF0Y2goJyguLSlccj9cbicpIGRvCiAgICBsb2NhbCByYXcgPSBzdHJpcF9jb21tZW50KGxpbmUpCiAgICByYXcgPSB0cmltKHJhdykKICAgIGlmIHJhdyA9PSAnJyB0aGVuIGdvdG8gY29udCBlbmQKICAgIC0tIOihqOWktCBbc2VjdGlvbl0gLyBbYS5iXQogICAgbG9jYWwgc2VjID0gcmF3Om1hdGNoKCdeJVsoLi0pJV0lcyokJykKICAgIGlmIHNlYyB0aGVuCiAgICAgIHNlYyA9IHNlYzpnc3ViKCclWyVdJywgJycpICAtLSDljrvmjokgW1suLl1dIOaui+eVme+8iOivmuWunui+ueeVjO+8muaVsOe7hOihqOaMieWNleihqOWkhOeQhu+8iQogICAgICBzZWMgPSB0cmltKHNlYykKICAgICAgY3VycmVudCA9IHJvb3QKICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgcCBpbiBzZWM6Z21hdGNoKCdbJXclXyUtXSsnKSBkbyBwYXJ0c1sjcGFydHMgKyAxXSA9IHAgZW5kCiAgICAgIGZvciBpID0gMSwgI3BhcnRzIC0gMSBkbwogICAgICAgIGxvY2FsIGsgPSBwYXJ0c1tpXQogICAgICAgIGlmIG5vdCBjdXJyZW50W2tdIHRoZW4gY3VycmVudFtrXSA9IHt9IGVuZAogICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tdCiAgICAgIGVuZAogICAgICBpZiAjcGFydHMgPiAwIHRoZW4KICAgICAgICBsb2NhbCBrID0gcGFydHNbI3BhcnRzXQogICAgICAgIGlmIG5vdCBjdXJyZW50W2tdIHRoZW4gY3VycmVudFtrXSA9IHt9IGVuZAogICAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tdCiAgICAgIGVuZAogICAgICBnb3RvIGNvbnQKICAgIGVuZAogICAgLS0ga2V5ID0gdmFsdWXvvIjngrnot6/lvoQga2V5IOWmgiBhLmIuYyDltYzlpZfvvIkKICAgIGxvY2FsIGtleSwgdmFscmF3ID0gcmF3Om1hdGNoKCdeKFsldyVfJS0uJXclXyUtXSspJXMqPSVzKiguKikkJykKICAgIGlmIGtleSB0aGVuCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIHAgaW4ga2V5OmdtYXRjaCgnWyV3JV8lLV0rJykgZG8gcGFydHNbI3BhcnRzICsgMV0gPSBwIGVuZAogICAgICBsb2NhbCB0YXJnZXQgPSBjdXJyZW50CiAgICAgIGZvciBpID0gMSwgI3BhcnRzIC0gMSBkbwogICAgICAgIGxvY2FsIGsgPSBwYXJ0c1tpXQogICAgICAgIGlmIG5vdCB0YXJnZXRba10gdGhlbiB0YXJnZXRba10gPSB7fSBlbmQKICAgICAgICB0YXJnZXQgPSB0YXJnZXRba10KICAgICAgZW5kCiAgICAgIHRhcmdldFtwYXJ0c1sjcGFydHNdXSA9IHBhcnNlX3RvbWxfdmFsdWUodmFscmF3KQogICAgZW5kCiAgICA6OmNvbnQ6OgogIGVuZAogIHJldHVybiBULmVuY29kZShyb290KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gSU5JIOino+aekAotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2luaSh0ZXh0KQogIGxvY2FsIHJvb3QgPSB7fQogIGxvY2FsIGN1cnJlbnQgPSByb290CiAgZm9yIGxpbmUgaW4gKHRleHQgLi4gJ1xuJyk6Z21hdGNoKCcoLi0pXHI/XG4nKSBkbwogICAgbG9jYWwgcmF3ID0gbGluZQogICAgcmF3ID0gdHJpbShyYXcpCiAgICBpZiByYXcgPT0gJycgdGhlbiBnb3RvIGNvbnQgZW5kCiAgICBpZiByYXc6bWF0Y2goJ147Jykgb3IgcmF3Om1hdGNoKCdeIycpIHRoZW4gZ290byBjb250IGVuZAogICAgbG9jYWwgc2VjID0gcmF3Om1hdGNoKCdeJVsoLi0pJV0lcyokJykKICAgIGlmIHNlYyB0aGVuCiAgICAgIGN1cnJlbnQgPSByb290CiAgICAgIGxvY2FsIGsgPSB0cmltKHNlYykKICAgICAgaWYgbm90IGN1cnJlbnRba10gdGhlbiBjdXJyZW50W2tdID0ge30gZW5kCiAgICAgIGN1cnJlbnQgPSBjdXJyZW50W2tdCiAgICAgIGdvdG8gY29udAogICAgZW5kCiAgICBsb2NhbCBrZXksIHZhbHJhdyA9IHJhdzptYXRjaCgnXihbXj07I10rKSVzKls9Ol0lcyooLiopJCcpCiAgICBpZiBrZXkgdGhlbgogICAgICBjdXJyZW50W3RyaW0oa2V5KV0gPSBwYXJzZV9pbmlfdmFsdWUodmFscmF3KQogICAgZW5kCiAgICA6OmNvbnQ6OgogIGVuZAogIHJldHVybiBULmVuY29kZShyb290KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5YiG5Y+RCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcnVuKHApCiAgaWYgdHlwZShwKSA9PSAnc3RyaW5nJyB0aGVuIHAgPSB7IHYgPSBwIH0gZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICd7fScgZW5kCiAgbG9jYWwgdGV4dCA9IHAudiBvciAnJwogIGxvY2FsIG9wID0gcC5vcCBvciAndG9tbCcKICBpZiBvcCA9PSAnaW5pJyB0aGVuIHJldHVybiBwYXJzZV9pbmkodGV4dCkgZW5kCiAgcmV0dXJuIHBhcnNlX3RvbWwodGV4dCkKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogcXIKLS0gQGNhdGVnb3J5OiB1ZGYKLS0gQGRlc2M6IFFSIOeggeeUn+aIkO+8iOe6ryBMdWHvvIzoh6rljIXlkKvvvIzml6AgRkZJ77yJ4oCU4oCU5oqK5paH5pys57yW56CB5oiQIFFSIOaooeWdl+efqemYteOAggotLSAgICAgICBCeXRlIOaooeW8j++8iOS7u+aEjyBVVEYtOCDmlofmnKzvvInjgIFFQyDnuqfliKsgTC9NL1EvSOOAgeiHquWKqOmAiSBtYXNr77yIcGVuYWx0eSDmnIDlsI/vvInjgIIKLS0gICAgICAg5biD5bGAL+e6oOmUmeeul+azleenu+akjeiHquW8gOa6kOWPguiAg+WunueOsO+8iHB5dGhvbi1xcmNvZGUgLyBOYXl1a2nvvIxNSVQvQXBhY2hl77yJ77yMCi0tICAgICAgIOW4uOmHj+S4jua1geeoi+mAkOS4gOWvuem9kO+8jOWPr+eUqCBaWGluZy/miYvmnLrmiavnoIHni6znq4vpqozor4HjgIIKLS0gICAgICAgb3Ag6YCJ6aG577yaCi0tICAgICAgICAgJ21hdHJpeCcg4oaSIEpTT04g5LqM57u05pWw57uE77yIMT3mt7HoibIgMD3mtYXoibLvvIkKLS0gICAgICAgICAnc3ZnJyAgICDihpIg5a6M5pW0IFNWR++8iOeZveW6lSArIDQg5qih5Z2X6Z2Z5Yy677yMMSDmqKHlnZc9c2NhbGUgcHjvvIzpu5jorqQgNO+8iQotLSAgICAgICAgICdpbmZvJyAgIOKGkiB7dmVyc2lvbixzaXplLGVjLG1hc2ssY29kZXdvcmRzLGRhdGFfY2FwYWNpdHl9Ci0tICAgICAgIOivmuWunui+ueeVjO+8mueJiOacrCAx4oCTNu+8iOe6piDiiaQxMzIg5a2X6IqCIEJ5dGUg6LSf6L2977yJ77yM5LuFIEJ5dGUg5qih5byP77yI5peg5pWw5YC8L+Wtl+avjS8KLS0gICAgICAg5rGJ5a2X5Y6L57yp5qih5byP77yJ44CC5pu05aSn6LSf6L29L+WkmuaooeW8j+ivt+i1sOWOn+eUn+i3r+W+hOOAggotLSBAc291cmNlOiDluIPlsYDnp7vmpI3oh6ogcHl0aG9uLXFyY29kZShNSVQpIOS4jiBOYXl1a2kgUVIgQ29kZSBnZW5lcmF0b3IoQXBhY2hlLTIuMCkg55qE5YWs5byA566X5rOVCi0tIEByZXF1aXJlczog5peg77yI55SoIEx1YUpJVCDljp/nlJ/kvY3ov5DnrpcgJiB+IHwgPDwgPj7vvJvnuq8gTHVhIDUuMSDpnIAgYml0IOW6k++8iQotLSBAbGljZW5zZTogTUlUIChhbGdvcml0aG0gbGF5b3V0KSAvIEFwYWNoZS0yLjAgKE5heXVraSBRUiBnZW5lcmF0b3IpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0ncXInKTsKLS0gICBzdmc6ICAgICAgU0VMRUNUIGx1YWppdF9zKCdxcicsIHt2OiAnaHR0cHM6Ly9leC5jb20nLCBvcDogJ3N2ZycsIGVjOiAnTSd9KTsKLS0gICBtYXRyaXg6ICAgU0VMRUNUIGx1YWppdF9zKCdxcicsIHt2OiAnaGVsbG8nLCBvcDogJ21hdHJpeCd9KTsKLS0gICBzaXplOiAgICAgU0VMRUNUIGpzb25fZXh0cmFjdChsdWFqaXRfcygncXInLHt2Oj0neCcsb3A6PSdpbmZvJ30pLCAnJC5zaXplJyk7Ci0tICAg5qCh6aqM77ya55Sf5oiQIFNWRyDihpIgWlhpbmcv5omL5py65omr56CB6Kej56CB5Zue5Y6f5paH77yM5Y2z6K+B5piO57yW56CB5q2j56Gu44CCCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEdGKDI1NinvvIhRUiDlpJrpobnlvI8gMHgxMWTvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBFWFAsIExPRyA9IHt9LCB7fQpkbwogIGxvY2FsIHggPSAxCiAgZm9yIGkgPSAwLCAyNTQgZG8KICAgIEVYUFtpXSA9IHgKICAgIExPR1t4XSA9IGkKICAgIHggPSB4ICogMgogICAgaWYgeCA+PSAyNTYgdGhlbiB4ID0geCB+IDB4MTFkIGVuZAogIGVuZAplbmQKbG9jYWwgZnVuY3Rpb24gZ2ZfbXVsKGEsIGIpCiAgaWYgYSA9PSAwIG9yIGIgPT0gMCB0aGVuIHJldHVybiAwIGVuZAogIHJldHVybiBFWFBbKExPR1thXSArIExPR1tiXSkgJSAyNTVdCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBSZWVkLVNvbG9tb27vvIhOYXl1a2kg566X5rOV77yaZGl2aXNvciArIHJlbWFpbmRlcu+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHJzX2Rpdmlzb3IoZGVncmVlKQogIGxvY2FsIHJlc3VsdCA9IHt9CiAgZm9yIGogPSAxLCBkZWdyZWUgZG8gcmVzdWx0W2pdID0gMCBlbmQKICByZXN1bHRbZGVncmVlXSA9IDEKICBsb2NhbCByb290ID0gMQogIGZvciBpID0gMSwgZGVncmVlIGRvCiAgICBmb3IgaiA9IDEsIGRlZ3JlZSBkbwogICAgICByZXN1bHRbal0gPSBnZl9tdWwocmVzdWx0W2pdLCByb290KQogICAgICBpZiBqIDwgZGVncmVlIHRoZW4gcmVzdWx0W2pdID0gcmVzdWx0W2pdIH4gcmVzdWx0W2ogKyAxXSBlbmQKICAgIGVuZAogICAgcm9vdCA9IGdmX211bChyb290LCAyKQogIGVuZAogIHJldHVybiByZXN1bHQKZW5kCgpsb2NhbCBmdW5jdGlvbiByc19lbmNvZGUoZGF0YSwgZWNfbGVuKQogIGxvY2FsIGRpdmlzb3IgPSByc19kaXZpc29yKGVjX2xlbikKICBsb2NhbCByZXN1bHQgPSB7fQogIGZvciBqID0gMSwgZWNfbGVuIGRvIHJlc3VsdFtqXSA9IDAgZW5kCiAgZm9yIGkgPSAxLCAjZGF0YSBkbwogICAgbG9jYWwgZmFjdG9yID0gZGF0YVtpXSB+IHJlc3VsdFsxXQogICAgZm9yIGogPSAxLCBlY19sZW4gLSAxIGRvIHJlc3VsdFtqXSA9IHJlc3VsdFtqICsgMV0gZW5kCiAgICByZXN1bHRbZWNfbGVuXSA9IDAKICAgIGZvciBqID0gMSwgZWNfbGVuIGRvCiAgICAgIHJlc3VsdFtqXSA9IHJlc3VsdFtqXSB+IGdmX211bChmYWN0b3IsIGRpdmlzb3Jbal0pCiAgICBlbmQKICBlbmQKICByZXR1cm4gcmVzdWx0CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDniYjmnKwv57qg6ZSZ5Z2X6KGo77yIcHl0aG9uLXFyY29kZSBiYXNlLnB577yM54mI5pysIDHigJM277yJCi0tICAgZW50cnkgPSB7Y291bnQsIHRvdGFsX2NvZGV3b3JkcywgZGF0YV9jb2Rld29yZHN977ybZWMgPSB0b3RhbCAtIGRhdGEKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBSUyA9IHsKICBbMV0gPSB7IEwgPSB7ezEsMjYsMTl9fSwgTSA9IHt7MSwyNiwxNn19LCBRID0ge3sxLDI2LDEzfX0sIEggPSB7ezEsMjYsOX19IH0sCiAgWzJdID0geyBMID0ge3sxLDQ0LDM0fX0sIE0gPSB7ezEsNDQsMjh9fSwgUSA9IHt7MSw0NCwyMn19LCBIID0ge3sxLDQ0LDE2fX0gfSwKICBbM10gPSB7IEwgPSB7ezEsNzAsNTV9fSwgTSA9IHt7MSw3MCw0NH19LCBRID0ge3syLDM1LDE3fX0sIEggPSB7ezIsMzUsMTN9fSB9LAogIFs0XSA9IHsgTCA9IHt7MSwxMDAsODB9fSwgTSA9IHt7Miw1MCwzMn19LCBRID0ge3syLDUwLDI0fX0sIEggPSB7ezQsMjUsOX19IH0sCiAgWzVdID0geyBMID0ge3sxLDEzNCwxMDh9fSwgTSA9IHt7Miw2Nyw0M319LAogICAgICAgICAgUSA9IHt7MiwzMywxNX0sezIsMzQsMTZ9fSwgSCA9IHt7MiwzMywxMX0sezIsMzQsMTJ9fSB9LAogIFs2XSA9IHsgTCA9IHt7Miw4Niw2OH19LCBNID0ge3s0LDQzLDI3fX0sIFEgPSB7ezQsNDMsMTl9fSwgSCA9IHt7NCw0MywxNX19IH0sCn0KbG9jYWwgRUNfQklUUyA9IHsgTSA9IDAsIEwgPSAxLCBRID0gMiwgSCA9IDMgfSAgIC0tIOagvOW8j+S/oeaBr+mHjCBFQyDnmoQgMiDkvY3nvJbnoIEKbG9jYWwgQUxJR04gPSB7IFsyXSA9IHs2LDE4fSwgWzNdID0gezYsMjJ9LCBbNF0gPSB7NiwyNn0sIFs1XSA9IHs2LDMwfSwgWzZdID0gezYsMzR9IH0KCmxvY2FsIGZ1bmN0aW9uIGRhdGFfdG90YWxfb2YodiwgZWMpCiAgbG9jYWwgdCA9IDAKICBmb3IgXywgZSBpbiBpcGFpcnMoUlNbdl1bZWNdKSBkbyB0ID0gdCArIGVbMV0gKiBlWzNdIGVuZAogIHJldHVybiB0CmVuZAoKbG9jYWwgZnVuY3Rpb24gY2hvb3NlX3ZlcnNpb24oZGF0YWxlbiwgZWMpCiAgZm9yIHYgPSAxLCA2IGRvCiAgICBsb2NhbCBuZWVkID0gNCArIDggKyA4ICogZGF0YWxlbiAgIC0tIG1vZGUoNCkgKyBjb3VudCg4LCB2MS05KSArIGRhdGEKICAgIGlmIG5lZWQgPD0gZGF0YV90b3RhbF9vZih2LCBlYykgKiA4IHRoZW4gcmV0dXJuIHYgZW5kCiAgZW5kCiAgcmV0dXJuIG5pbAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5pWw5o2u5L2N5rWB77yIQnl0ZSDmqKHlvI8gMDEwMO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJ1aWxkX2JpdHN0cmVhbSh0ZXh0LCBkYXRhX3RvdGFsKQogIGxvY2FsIGJpdHMgPSB7fQogIGxvY2FsIGZ1bmN0aW9uIHB1c2godmFsLCBuKQogICAgZm9yIGkgPSBuIC0gMSwgMCwgLTEgZG8gYml0c1sjYml0cyArIDFdID0gKHZhbCA+PiBpKSAmIDEgZW5kCiAgZW5kCiAgcHVzaCg0LCA0KQogIHB1c2goI3RleHQsIDgpCiAgZm9yIGkgPSAxLCAjdGV4dCBkbyBwdXNoKHRleHQ6Ynl0ZShpKSwgOCkgZW5kCiAgbG9jYWwgY2FwID0gZGF0YV90b3RhbCAqIDgKICBmb3IgXyA9IDEsIDQgZG8gaWYgI2JpdHMgPCBjYXAgdGhlbiBiaXRzWyNiaXRzICsgMV0gPSAwIGVsc2UgYnJlYWsgZW5kIGVuZAogIGlmICNiaXRzICUgOCB+PSAwIHRoZW4KICAgIGZvciBfID0gMSwgOCAtICgjYml0cyAlIDgpIGRvIGJpdHNbI2JpdHMgKyAxXSA9IDAgZW5kCiAgZW5kCiAgbG9jYWwgcGFkID0gMHhFQwogIHdoaWxlICNiaXRzIDwgY2FwIGRvCiAgICBwdXNoKHBhZCwgOCkKICAgIHBhZCA9IChwYWQgPT0gMHhFQykgYW5kIDB4MTEgb3IgMHhFQwogIGVuZAogIGxvY2FsIGJ5dGVzID0ge30KICBmb3IgaSA9IDEsICNiaXRzLCA4IGRvCiAgICBsb2NhbCBiID0gMAogICAgZm9yIGogPSAwLCA3IGRvIGIgPSBiICogMiArIChiaXRzW2kgKyBqXSBvciAwKSBlbmQKICAgIGJ5dGVzWyNieXRlcyArIDFdID0gYgogIGVuZAogIHJldHVybiBieXRlcwplbmQKCi0tIOWIhuWdlyArIFJTICsg5Lqk57uHCmxvY2FsIGZ1bmN0aW9uIG1ha2VfY29kZXdvcmRzKGRhdGFfYnl0ZXMsIHZlcnNpb24sIGVjKQogIGxvY2FsIGVudHJpZXMgPSBSU1t2ZXJzaW9uXVtlY10KICBsb2NhbCBibG9ja3MsIHBvcyA9IHt9LCAxCiAgZm9yIF8sIGUgaW4gaXBhaXJzKGVudHJpZXMpIGRvCiAgICBmb3IgXyA9IDEsIGVbMV0gZG8KICAgICAgbG9jYWwgYmxrID0ge30KICAgICAgZm9yIGkgPSAxLCBlWzNdIGRvCiAgICAgICAgYmxrW2ldID0gZGF0YV9ieXRlc1twb3NdIG9yIDAKICAgICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGVuZAogICAgICBsb2NhbCBlY3cgPSByc19lbmNvZGUoYmxrLCBlWzJdIC0gZVszXSkKICAgICAgYmxvY2tzWyNibG9ja3MgKyAxXSA9IHsgZGF0YSA9IGJsaywgZWMgPSBlY3csIGRsID0gZVszXSwgZWwgPSBlWzJdIC0gZVszXSB9CiAgICBlbmQKICBlbmQKICBsb2NhbCBtYXhkLCBtYXhlID0gMCwgMAogIGZvciBfLCBiIGluIGlwYWlycyhibG9ja3MpIGRvCiAgICBpZiBiLmRsID4gbWF4ZCB0aGVuIG1heGQgPSBiLmRsIGVuZAogICAgaWYgYi5lbCA+IG1heGUgdGhlbiBtYXhlID0gYi5lbCBlbmQKICBlbmQKICBsb2NhbCBvdXQgPSB7fQogIGZvciBpID0gMSwgbWF4ZCBkbwogICAgZm9yIF8sIGIgaW4gaXBhaXJzKGJsb2NrcykgZG8KICAgICAgaWYgaSA8PSBiLmRsIHRoZW4gb3V0WyNvdXQgKyAxXSA9IGIuZGF0YVtpXSBlbmQKICAgIGVuZAogIGVuZAogIGZvciBpID0gMSwgbWF4ZSBkbwogICAgZm9yIF8sIGIgaW4gaXBhaXJzKGJsb2NrcykgZG8KICAgICAgaWYgaSA8PSBiLmVsIHRoZW4gb3V0WyNvdXQgKyAxXSA9IGIuZWNbaV0gZW5kCiAgICBlbmQKICBlbmQKICByZXR1cm4gb3V0CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDmoLzlvI/kv6Hmga8gQkNIKDE1LDUpICBHMTU9MHg1MzcsIEcxNV9NQVNLPTB4NTQxMgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJjaF9kaWdpdCh4KQogIGxvY2FsIGQgPSAwCiAgd2hpbGUgeCB+PSAwIGRvIGQgPSBkICsgMSB4ID0geCA+PiAxIGVuZAogIHJldHVybiBkCmVuZApsb2NhbCBmdW5jdGlvbiBiY2hfZm9ybWF0KGRhdGEpCiAgbG9jYWwgRzE1LCBHMTVfTUFTSyA9IDB4NTM3LCAweDU0MTIKICBsb2NhbCBkID0gZGF0YSA8PCAxMAogIHdoaWxlIGJjaF9kaWdpdChkKSAtIGJjaF9kaWdpdChHMTUpID49IDAgZG8KICAgIGQgPSBkIH4gKEcxNSA8PCAoYmNoX2RpZ2l0KGQpIC0gYmNoX2RpZ2l0KEcxNSkpKQogIGVuZAogIHJldHVybiAoZGF0YSA8PCAxMCkgfiBkIH4gRzE1X01BU0sKZW5kCgotLSBtYXNrIOWHveaVsO+8iHB5dGhvbi1xcmNvZGUgdXRpbC5tYXNrX2Z1bmPvvIwocm93LCBjb2wp77yJCmxvY2FsIGZ1bmN0aW9uIG1hc2tfdmFsKG0sIHIsIGMpCiAgaWYgbSA9PSAwIHRoZW4gcmV0dXJuIChyICsgYykgJSAyID09IDAKICBlbHNlaWYgbSA9PSAxIHRoZW4gcmV0dXJuIHIgJSAyID09IDAKICBlbHNlaWYgbSA9PSAyIHRoZW4gcmV0dXJuIGMgJSAzID09IDAKICBlbHNlaWYgbSA9PSAzIHRoZW4gcmV0dXJuIChyICsgYykgJSAzID09IDAKICBlbHNlaWYgbSA9PSA0IHRoZW4gcmV0dXJuIChtYXRoLmZsb29yKHIgLyAyKSArIG1hdGguZmxvb3IoYyAvIDMpKSAlIDIgPT0gMAogIGVsc2VpZiBtID09IDUgdGhlbiByZXR1cm4gKHIgKiBjKSAlIDIgKyAociAqIGMpICUgMyA9PSAwCiAgZWxzZWlmIG0gPT0gNiB0aGVuIHJldHVybiAoKHIgKiBjKSAlIDIgKyAociAqIGMpICUgMykgJSAyID09IDAKICBlbHNlIHJldHVybiAoKHIgKiBjKSAlIDMgKyAociArIGMpICUgMikgJSAyID09IDAgZW5kCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDnn6npmLXmnoTlu7rvvIhweXRob24tcXJjb2RlIG1haW4ucHkg5biD5bGA77yMMC1iYXNlZCBbcl1bY13vvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBzaXplX29mKHYpIHJldHVybiAxNyArIDQgKiB2IGVuZAoKbG9jYWwgZnVuY3Rpb24gYnVpbGRfbWF0cml4KGNvZGV3b3JkcywgdmVyc2lvbiwgZWMsIG1hc2spCiAgbG9jYWwgc2l6ZSA9IHNpemVfb2YodmVyc2lvbikKICBsb2NhbCBncmlkLCByZXNlcnZlZCA9IHt9LCB7fQogIGZvciByID0gMCwgc2l6ZSAtIDEgZG8KICAgIGdyaWRbcl0sIHJlc2VydmVkW3JdID0ge30sIHt9CiAgICBmb3IgYyA9IDAsIHNpemUgLSAxIGRvIGdyaWRbcl1bY10gPSAwIHJlc2VydmVkW3JdW2NdID0gZmFsc2UgZW5kCiAgZW5kCgogIC0tIDEpIOWumuS9jeWbvuahiCArIOWIhumalOWMugogIGxvY2FsIGZ1bmN0aW9uIGZpbmRlcihyMCwgYzApCiAgICBmb3IgciA9IC0xLCA3IGRvCiAgICAgIGZvciBjID0gLTEsIDcgZG8KICAgICAgICBsb2NhbCByciwgY2MgPSByMCArIHIsIGMwICsgYwogICAgICAgIGlmIHJyID49IDAgYW5kIGNjID49IDAgYW5kIHJyIDwgc2l6ZSBhbmQgY2MgPCBzaXplIHRoZW4KICAgICAgICAgIGxvY2FsIHYgPSAwCiAgICAgICAgICBpZiByID49IDAgYW5kIHIgPD0gNiBhbmQgYyA+PSAwIGFuZCBjIDw9IDYgdGhlbgogICAgICAgICAgICBsb2NhbCBib3JkZXIgPSAociA9PSAwIG9yIHIgPT0gNiBvciBjID09IDAgb3IgYyA9PSA2KQogICAgICAgICAgICBsb2NhbCBjb3JlID0gKHIgPj0gMiBhbmQgciA8PSA0IGFuZCBjID49IDIgYW5kIGMgPD0gNCkKICAgICAgICAgICAgdiA9IChib3JkZXIgb3IgY29yZSkgYW5kIDEgb3IgMAogICAgICAgICAgZW5kCiAgICAgICAgICBncmlkW3JyXVtjY10gPSB2CiAgICAgICAgICByZXNlcnZlZFtycl1bY2NdID0gdHJ1ZQogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGZpbmRlcigwLCAwKQogIGZpbmRlcigwLCBzaXplIC0gNykKICBmaW5kZXIoc2l6ZSAtIDcsIDApCgogIC0tIDIpIOaXtuW6j+WbvuahiO+8iOihjCA2IC8g5YiXIDbvvIzlgbbmlbDlnZDmoIfmt7HoibLvvIkKICBmb3IgaSA9IDAsIHNpemUgLSAxIGRvCiAgICBpZiBub3QgcmVzZXJ2ZWRbaV1bNl0gdGhlbgogICAgICBncmlkW2ldWzZdID0gKGkgJSAyID09IDApIGFuZCAxIG9yIDAKICAgICAgcmVzZXJ2ZWRbaV1bNl0gPSB0cnVlCiAgICBlbmQKICAgIGlmIG5vdCByZXNlcnZlZFs2XVtpXSB0aGVuCiAgICAgIGdyaWRbNl1baV0gPSAoaSAlIDIgPT0gMCkgYW5kIDEgb3IgMAogICAgICByZXNlcnZlZFs2XVtpXSA9IHRydWUKICAgIGVuZAogIGVuZAoKICAtLSAzKSDlr7npvZDlm77moYjvvIh2MivvvJvkuI4gZmluZGVyL3RpbWluZyDph43lj6DlpITot7Pov4fvvIkKICBsb2NhbCBwb3MgPSBBTElHTlt2ZXJzaW9uXQogIGlmIHBvcyB0aGVuCiAgICBmb3IgXywgcm93IGluIGlwYWlycyhwb3MpIGRvCiAgICAgIGZvciBfLCBjb2wgaW4gaXBhaXJzKHBvcykgZG8KICAgICAgICBpZiBub3QgcmVzZXJ2ZWRbcm93XVtjb2xdIHRoZW4KICAgICAgICAgIGZvciByID0gLTIsIDIgZG8KICAgICAgICAgICAgZm9yIGMgPSAtMiwgMiBkbwogICAgICAgICAgICAgIGxvY2FsIHJyLCBjYyA9IHJvdyArIHIsIGNvbCArIGMKICAgICAgICAgICAgICBpZiByciA+PSAwIGFuZCBjYyA+PSAwIGFuZCByciA8IHNpemUgYW5kIGNjIDwgc2l6ZSB0aGVuCiAgICAgICAgICAgICAgICBsb2NhbCBkYXJrID0gKG1hdGguYWJzKHIpID09IDIgb3IgbWF0aC5hYnMoYykgPT0gMiBvciAociA9PSAwIGFuZCBjID09IDApKSBhbmQgMSBvciAwCiAgICAgICAgICAgICAgICBncmlkW3JyXVtjY10gPSBkYXJrCiAgICAgICAgICAgICAgICByZXNlcnZlZFtycl1bY2NdID0gdHJ1ZQogICAgICAgICAgICAgIGVuZAogICAgICAgICAgICBlbmQKICAgICAgICAgIGVuZAogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAoKICAtLSA0KSDmoLzlvI/kv6Hmga8gKyDlm7rlrprmmpfmqKHlnZfvvIjlhYjmlL7nva7vvIzmlbDmja7mlL7nva7ml7bot7Pov4cgcmVzZXJ2ZWTvvIkKICBsb2NhbCBiaXRzID0gYmNoX2Zvcm1hdCgoRUNfQklUU1tlY10gPDwgMykgfCBtYXNrKQogIGZvciBpID0gMCwgMTQgZG8gICAtLSDnq5blkJHvvIjliJcgOO+8iQogICAgbG9jYWwgbW9kID0gKGJpdHMgPj4gaSkgJiAxCiAgICBsb2NhbCByCiAgICBpZiBpIDwgNiB0aGVuIHIgPSBpCiAgICBlbHNlaWYgaSA8IDggdGhlbiByID0gaSArIDEKICAgIGVsc2UgciA9IHNpemUgLSAxNSArIGkgZW5kCiAgICBncmlkW3JdWzhdID0gbW9kCiAgICByZXNlcnZlZFtyXVs4XSA9IHRydWUKICBlbmQKICBmb3IgaSA9IDAsIDE0IGRvICAgLS0g5qiq5ZCR77yI6KGMIDjvvIkKICAgIGxvY2FsIG1vZCA9IChiaXRzID4+IGkpICYgMQogICAgbG9jYWwgYwogICAgaWYgaSA8IDggdGhlbiBjID0gc2l6ZSAtIGkgLSAxCiAgICBlbHNlaWYgaSA9PSA4IHRoZW4gYyA9IDE1IC0gaQogICAgZWxzZSBjID0gMTUgLSBpIC0gMSBlbmQKICAgIGdyaWRbOF1bY10gPSBtb2QKICAgIHJlc2VydmVkWzhdW2NdID0gdHJ1ZQogIGVuZAogIGdyaWRbc2l6ZSAtIDhdWzhdID0gMQogIHJlc2VydmVkW3NpemUgLSA4XVs4XSA9IHRydWUKCiAgLS0gNSkg5pWw5o2uIHppZ3phZyArIG1hc2vvvIjku47lj7PkuIvvvIzlj4zliJfmraXov5vvvIzot7PliJcgNu+8iQogIGxvY2FsIHRvdGFsX2JpdHMgPSAjY29kZXdvcmRzICogOAogIGxvY2FsIGJ5dGVJbmRleCwgYml0SW5kZXggPSAwLCA3CiAgbG9jYWwgcm93ID0gc2l6ZSAtIDEKICBsb2NhbCBpbmMgPSAtMQogIGZvciBjb2wgPSBzaXplIC0gMSwgMSwgLTIgZG8KICAgIGlmIGNvbCA8PSA2IHRoZW4gY29sID0gY29sIC0gMSBlbmQgICAtLSDot7Pov4fph4/ml7bliJcgNgogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBmb3IgXywgYyBpbiBpcGFpcnMoeyBjb2wsIGNvbCAtIDEgfSkgZG8KICAgICAgICBpZiBub3QgcmVzZXJ2ZWRbcm93XVtjXSB0aGVuCiAgICAgICAgICBsb2NhbCBkYXJrID0gMAogICAgICAgICAgaWYgYnl0ZUluZGV4IDwgI2NvZGV3b3JkcyB0aGVuCiAgICAgICAgICAgIGRhcmsgPSAoY29kZXdvcmRzW2J5dGVJbmRleCArIDFdID4+IGJpdEluZGV4KSAmIDEKICAgICAgICAgIGVuZAogICAgICAgICAgaWYgbWFza192YWwobWFzaywgcm93LCBjKSB0aGVuIGRhcmsgPSBkYXJrIH4gMSBlbmQKICAgICAgICAgIGdyaWRbcm93XVtjXSA9IGRhcmsKICAgICAgICAgIHJlc2VydmVkW3Jvd11bY10gPSB0cnVlCiAgICAgICAgICBiaXRJbmRleCA9IGJpdEluZGV4IC0gMQogICAgICAgICAgaWYgYml0SW5kZXggPT0gLTEgdGhlbgogICAgICAgICAgICBieXRlSW5kZXggPSBieXRlSW5kZXggKyAxCiAgICAgICAgICAgIGJpdEluZGV4ID0gNwogICAgICAgICAgZW5kCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgICByb3cgPSByb3cgKyBpbmMKICAgICAgaWYgcm93IDwgMCBvciBzaXplIDw9IHJvdyB0aGVuCiAgICAgICAgcm93ID0gcm93IC0gaW5jCiAgICAgICAgaW5jID0gLWluYwogICAgICAgIGJyZWFrCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCgogIHJldHVybiBncmlkCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBQZW5hbHR577yINCDmnaHop4TliJnvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwZW5hbHR5KGdyaWQsIHNpemUpCiAgbG9jYWwgdG90YWwgPSAwCiAgbG9jYWwgZnVuY3Rpb24gc2NhbihsaW5lKQogICAgbG9jYWwgcywgcnVuLCBwcmV2ID0gMCwgMSwgbGluZVsxXQogICAgZm9yIGkgPSAyLCAjbGluZSBkbwogICAgICBpZiBsaW5lW2ldID09IHByZXYgdGhlbgogICAgICAgIHJ1biA9IHJ1biArIDEKICAgICAgICBpZiBydW4gPT0gNSB0aGVuIHMgPSBzICsgMyBlbmQKICAgICAgICBpZiBydW4gPiA1IHRoZW4gcyA9IHMgKyAxIGVuZAogICAgICBlbHNlCiAgICAgICAgcnVuLCBwcmV2ID0gMSwgbGluZVtpXQogICAgICBlbmQKICAgIGVuZAogICAgcmV0dXJuIHMKICBlbmQKICBmb3IgciA9IDAsIHNpemUgLSAxIGRvCiAgICBsb2NhbCByb3csIGNvbCA9IHt9LCB7fQogICAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbyByb3dbYyArIDFdID0gZ3JpZFtyXVtjXSBlbmQKICAgIHRvdGFsID0gdG90YWwgKyBzY2FuKHJvdykKICAgIGZvciByciA9IDAsIHNpemUgLSAxIGRvIGNvbFtyciArIDFdID0gZ3JpZFtycl1bY10gZW5kCiAgICB0b3RhbCA9IHRvdGFsICsgc2Nhbihjb2wpCiAgZW5kCiAgZm9yIHIgPSAwLCBzaXplIC0gMiBkbwogICAgZm9yIGMgPSAwLCBzaXplIC0gMiBkbwogICAgICBsb2NhbCB2ID0gZ3JpZFtyXVtjXQogICAgICBpZiBncmlkW3JdW2MgKyAxXSA9PSB2IGFuZCBncmlkW3IgKyAxXVtjXSA9PSB2IGFuZCBncmlkW3IgKyAxXVtjICsgMV0gPT0gdiB0aGVuCiAgICAgICAgdG90YWwgPSB0b3RhbCArIDMKICAgICAgZW5kCiAgICBlbmQKICBlbmQKICBsb2NhbCBmdW5jdGlvbiBtYXRjaDExKGxpbmUsIGlkeCkKICAgIGxvY2FsIHAxID0geyAxLDAsMSwxLDEsMCwxLDAsMCwwLDAgfQogICAgbG9jYWwgcDIgPSB7IDAsMCwwLDAsMSwwLDEsMSwxLDAsMSB9CiAgICBmb3IgXywgcCBpbiBpcGFpcnMoeyBwMSwgcDIgfSkgZG8KICAgICAgbG9jYWwgb2sgPSB0cnVlCiAgICAgIGZvciBrID0gMSwgMTEgZG8KICAgICAgICBpZiBsaW5lW2lkeCArIGsgLSAxXSB+PSBwW2tdIHRoZW4gb2sgPSBmYWxzZSBicmVhayBlbmQKICAgICAgZW5kCiAgICAgIGlmIG9rIHRoZW4gcmV0dXJuIHRydWUgZW5kCiAgICBlbmQKICAgIHJldHVybiBmYWxzZQogIGVuZAogIGZvciByID0gMCwgc2l6ZSAtIDEgZG8KICAgIGxvY2FsIGxpbmUgPSB7fQogICAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbyBsaW5lW2MgKyAxXSA9IGdyaWRbcl1bY10gZW5kCiAgICBmb3IgaSA9IDEsICNsaW5lIC0gMTAgZG8gaWYgbWF0Y2gxMShsaW5lLCBpKSB0aGVuIHRvdGFsID0gdG90YWwgKyA0MCBlbmQgZW5kCiAgZW5kCiAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbwogICAgbG9jYWwgbGluZSA9IHt9CiAgICBmb3IgciA9IDAsIHNpemUgLSAxIGRvIGxpbmVbciArIDFdID0gZ3JpZFtyXVtjXSBlbmQKICAgIGZvciBpID0gMSwgI2xpbmUgLSAxMCBkbyBpZiBtYXRjaDExKGxpbmUsIGkpIHRoZW4gdG90YWwgPSB0b3RhbCArIDQwIGVuZCBlbmQKICBlbmQKICBsb2NhbCBkYXJrID0gMAogIGZvciByID0gMCwgc2l6ZSAtIDEgZG8gZm9yIGMgPSAwLCBzaXplIC0gMSBkbyBkYXJrID0gZGFyayArIGdyaWRbcl1bY10gZW5kIGVuZAogIGxvY2FsIHRvdCA9IHNpemUgKiBzaXplCiAgdG90YWwgPSB0b3RhbCArIG1hdGguZmxvb3IobWF0aC5hYnMoZGFyayAqIDIwIC0gdG90ICogMTApIC8gdG90KSAqIDEwCiAgcmV0dXJuIHRvdGFsCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDkuLvmtYHnqIsKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBlbmNvZGUodGV4dCwgZWMpCiAgaWYgZWMgPT0gbmlsIG9yIG5vdCBFQ19CSVRTW2VjXSB0aGVuIGVjID0gJ00nIGVuZAogIGxvY2FsIHZlcnNpb24gPSBjaG9vc2VfdmVyc2lvbigjdGV4dCwgZWMpCiAgaWYgbm90IHZlcnNpb24gdGhlbgogICAgcmV0dXJuIG5pbCwgJ2RhdGEgdG9vIGxvbmcgZm9yIFFSIHYxLTYgKCcgLi4gI3RleHQgLi4gJyBieXRlcyknCiAgZW5kCiAgbG9jYWwgZGF0YV90b3RhbCA9IGRhdGFfdG90YWxfb2YodmVyc2lvbiwgZWMpCiAgbG9jYWwgZGF0YV9ieXRlcyA9IGJ1aWxkX2JpdHN0cmVhbSh0ZXh0LCBkYXRhX3RvdGFsKQogIGxvY2FsIGNvZGV3b3JkcyA9IG1ha2VfY29kZXdvcmRzKGRhdGFfYnl0ZXMsIHZlcnNpb24sIGVjKQoKICBsb2NhbCBiZXN0X21hc2ssIGJlc3RfcGVuLCBiZXN0X2dyaWQgPSAwLCBuaWwsIG5pbAogIGZvciBtID0gMCwgNyBkbwogICAgbG9jYWwgZyA9IGJ1aWxkX21hdHJpeChjb2Rld29yZHMsIHZlcnNpb24sIGVjLCBtKQogICAgbG9jYWwgcCA9IHBlbmFsdHkoZywgc2l6ZV9vZih2ZXJzaW9uKSkKICAgIGlmIG5vdCBiZXN0X3BlbiBvciBwIDwgYmVzdF9wZW4gdGhlbgogICAgICBiZXN0X3BlbiwgYmVzdF9tYXNrLCBiZXN0X2dyaWQgPSBwLCBtLCBnCiAgICBlbmQKICBlbmQKICByZXR1cm4gewogICAgdmVyc2lvbiA9IHZlcnNpb24sIHNpemUgPSBzaXplX29mKHZlcnNpb24pLCBlYyA9IGVjLCBtYXNrID0gYmVzdF9tYXNrLAogICAgY29kZXdvcmRzID0gI2NvZGV3b3JkcywgZGF0YV9jYXBhY2l0eSA9IGRhdGFfdG90YWwsIGdyaWQgPSBiZXN0X2dyaWQsCiAgfQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6L6T5Ye6Ci0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gZ3JpZF90b19qc29uKGdyaWQsIHNpemUpCiAgbG9jYWwgcm93cyA9IHt9CiAgZm9yIHIgPSAwLCBzaXplIC0gMSBkbwogICAgbG9jYWwgY2VsbHMgPSB7fQogICAgZm9yIGMgPSAwLCBzaXplIC0gMSBkbyBjZWxsc1tjICsgMV0gPSB0b3N0cmluZyhncmlkW3JdW2NdKSBlbmQKICAgIHJvd3NbciArIDFdID0gJ1snIC4uIHRhYmxlLmNvbmNhdChjZWxscywgJywnKSAuLiAnXScKICBlbmQKICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChyb3dzLCAnLCcpIC4uICddJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGdyaWRfdG9fc3ZnKGdyaWQsIHNpemUsIHNjYWxlKQogIHNjYWxlID0gc2NhbGUgb3IgNAogIGxvY2FsIHF1aWV0ID0gNAogIGxvY2FsIHB4ID0gKHNpemUgKyAyICogcXVpZXQpICogc2NhbGUKICBsb2NhbCBvdXQgPSB7fQogIG91dFsjb3V0ICsgMV0gPSBzdHJpbmcuZm9ybWF0KAogICAgJzxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iJWQiIGhlaWdodD0iJWQiIHZpZXdCb3g9IjAgMCAlZCAlZCI+JywKICAgIHB4LCBweCwgcHgsIHB4KQogIG91dFsjb3V0ICsgMV0gPSAnPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2ZmZmZmZiIvPicKICBmb3IgciA9IDAsIHNpemUgLSAxIGRvCiAgICBmb3IgYyA9IDAsIHNpemUgLSAxIGRvCiAgICAgIGlmIGdyaWRbcl1bY10gPT0gMSB0aGVuCiAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHN0cmluZy5mb3JtYXQoCiAgICAgICAgICAnPHJlY3QgeD0iJWQiIHk9IiVkIiB3aWR0aD0iJWQiIGhlaWdodD0iJWQiIGZpbGw9IiMwMDAwMDAiLz4nLAogICAgICAgICAgKGMgKyBxdWlldCkgKiBzY2FsZSwgKHIgKyBxdWlldCkgKiBzY2FsZSwgc2NhbGUsIHNjYWxlKQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIG91dFsjb3V0ICsgMV0gPSAnPC9zdmc+JwogIHJldHVybiB0YWJsZS5jb25jYXQob3V0LCAnJykKZW5kCgpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJiYWQgaW5wdXQifScgZW5kCiAgbG9jYWwgdGV4dCA9IHAudiBvciAnJwogIGxvY2FsIGVjID0gcC5lYyBvciAnTScKICBsb2NhbCBvcCA9IHAub3Agb3IgJ3N2ZycKICBsb2NhbCByZXMsIGVyciA9IGVuY29kZSh0ZXh0LCBlYykKICBpZiBub3QgcmVzIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiJyAuLiB0b3N0cmluZyhlcnIpIC4uICcifScgZW5kCiAgaWYgb3AgPT0gJ21hdHJpeCcgdGhlbgogICAgcmV0dXJuIGdyaWRfdG9fanNvbihyZXMuZ3JpZCwgcmVzLnNpemUpCiAgZWxzZWlmIG9wID09ICdzdmcnIHRoZW4KICAgIHJldHVybiBncmlkX3RvX3N2ZyhyZXMuZ3JpZCwgcmVzLnNpemUsIHRvbnVtYmVyKHAuc2NhbGUpIG9yIDQpCiAgZWxzZWlmIG9wID09ICdpbmZvJyB0aGVuCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgKICAgICAgJ3sidmVyc2lvbiI6JWQsInNpemUiOiVkLCJlYyI6IiVzIiwibWFzayI6JWQsImNvZGV3b3JkcyI6JWQsImRhdGFfY2FwYWNpdHkiOiVkfScsCiAgICAgIHJlcy52ZXJzaW9uLCByZXMuc2l6ZSwgZWMsIHJlcy5tYXNrLCByZXMuY29kZXdvcmRzLCByZXMuZGF0YV9jYXBhY2l0eSkKICBlbHNlaWYgb3AgPT0gJ2NvZGV3b3JkcycgdGhlbgogICAgLS0g6LCD6K+VL+agoemqjO+8mui/lOWbniDmlbDmja4rRUMg5YWo6YOo56CB5a2X77yIaGV4IOaVsOe7hO+8ie+8jOS4juWPguiAg+WunueOsOmAkOWtl+iKguavlOWvuQogICAgbG9jYWwgZGF0YV90b3RhbCA9IGRhdGFfdG90YWxfb2YocmVzLnZlcnNpb24sIHJlcy5lYykKICAgIGxvY2FsIGRiID0gYnVpbGRfYml0c3RyZWFtKHRleHQsIGRhdGFfdG90YWwpCiAgICBsb2NhbCBjdyA9IG1ha2VfY29kZXdvcmRzKGRiLCByZXMudmVyc2lvbiwgcmVzLmVjKQogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIGkgPSAxLCAjY3cgZG8gcGFydHNbaV0gPSBzdHJpbmcuZm9ybWF0KCciJTAyWCInLCBjd1tpXSkgZW5kCiAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICBlbmQKICByZXR1cm4gJ3t9JwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBjaWRyCi0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDnvZHnu5wgQ0lEUiAvIElQIOW3peWFt++8iOe6ryBMdWHvvIzoh6rljIXlkKvvvInigJTigJREdWNrREIg5peg5YaF5bu6IENJRFIvSVB2NC9JUHY2IOWHveaVsO+8jAotLSAgICAgICDmnKzlupPooaXkuIrvvJpJUCDop6PmnpDjgIFDSURSIOaIkOWRmOWIpOWumuOAgee9kee7nC/lub/mkq0v6KeE5qih44CB5YWs56eB572R5YiG57G744CCCi0tICAgICAgIOWQjOaXtuaUr+aMgSBJUHY077yIMzIg5L2N77yJ5LiOIElQdjbvvIgxMjgg5L2N77yM5oyJIDgg5LiqIDE2IOS9jSBoZXh0ZXQg5aSE55CG77yM5LiN5L6d6LWW5aSn5pW05pWw77yJ44CCCi0tICAgICAgIG9wIOmAiemhue+8mgotLSAgICAgICAgICd2ZXJzaW9uJyAg4oaSIDQg5oiWIDbvvIhvcD12ZXJzaW9uLCB2PTxpcD7vvIkKLS0gICAgICAgICAnaXAyaW50JyAgIOKGkiBJUHY0IOWNgei/m+WItuaVtOaVsO+8m0lQdjYg6L+U5ZueIDMyIOS9jSBoZXgg5Liy77yITHVhIDUuMSDlj4znsr7luqbmlL7kuI3kuIsgMTI4IOS9je+8iQotLSAgICAgICAgICdpbnQyaXAnICAg4oaSIElQdjQg5pW05pWwIOKGkiDngrnliIbkuLIKLS0gICAgICAgICAnaW5fY2lkcicgIOKGkiBib29s77yIdj08aXA+LCBjaWRyPTxuZXQvcHJlZml4Pu+8iQotLSAgICAgICAgICdjaWRyX2luZm8n4oaSIHtuZXR3b3JrLCBicm9hZGNhc3QsIHByZWZpeCwgc2l6ZSwgbWFzaywgaXNfdjZ977yIdj08Y2lkcj7vvJtzaXplIOi2hSAyXjUzIOaXtui/lOWbniAiMl5OIu+8iQotLSAgICAgICAgICdjbGFzc2lmeScg4oaSIHB1YmxpYy9wcml2YXRlL2xvb3BiYWNrL2xpbmstbG9jYWwvbXVsdGljYXN0L3Vuc3BlY2lmaWVkL3Jlc2VydmVkCi0tICAgICAgICAgJ25ldCcgICAgICDihpIg572R57uc5Zyw5Z2A5Liy77yIdj08Y2lkcj7vvIkKLS0gICAgICAgICAnYnJvYWRjYXN0J+KGkiDlub/mkq3lnLDlnYDkuLLvvIjku4UgSVB2NO+8m0lQdjYg6L+U5Zue5pyr5Zyw5Z2A77yJCi0tICAgICAgIOivmuWunui+ueeVjO+8mklQdjYgem9uZSDntKLlvJUgLyDljYHlha3ov5vliLYgSVB2NO+8iDB477yJLyBJUHY0LW1hcHBlZCDku4XmjInnuq/lnLDlnYDlpITnkIbvvJsKLS0gICAgICAgOjpmZmZmOmEuYi5jLmQg6L+Z57G75pig5bCE5Zyw5Z2A5oyJIElQdjYg6Kej5p6Q77yI5LiN6Ieq5Yqo6ZmN57qn5Li6IHY077yJ44CCCi0tICAgICAgIGNsYXNzaWZ5IOWvuem9kCBQeXRob24gaXBhZGRyZXNzIOivreS5ie+8iDIyNC0yMzkgbXVsdGljYXN044CBMjQwKy80IHByaXZhdGXjgIFDR05BVCAxMDAuNjQvMTAgcHVibGlj77yJ77ybCi0tICAgICAgIOW3suefpSAxIOWkhOW3ruW8gu+8mjE6MjozOjQ6NTo2Ojc6OCDmnKzlupPliKQgcHVibGlj77yI5q2j56Gu77yJ77yMUHl0aG9uIGlzX3Jlc2VydmVkIOivr+WIpCByZXNlcnZlZOOAggotLSBAc291cmNlOiDoh6rljIXlkKsKLS0gQHJlcXVpcmVzOiBub25lCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCk6Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdjaWRyJywge29wOiAnaW5fY2lkcicsIHY6ICcxOTIuMTY4LjEuNScsIGNpZHI6ICcxOTIuMTY4LjAuMC8xNid9KTsgIC0tIHRydWUKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2NpZHInLCB7b3A6ICdjaWRyX2luZm8nLCB2OiAnMTAuMC4wLjAvOCd9KTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ2NpZHInLCB7b3A6ICdjbGFzc2lmeScsIHY6ICcxNzIuMTYuNS45J30pOyAgLS0gcHJpdmF0ZQoKbG9jYWwgZnVuY3Rpb24gdG9oZXgobiwgd2lkdGgpCiAgbG9jYWwgcyA9IHN0cmluZy5mb3JtYXQoJyV4JywgbikKICB3aGlsZSAjcyA8IHdpZHRoIGRvIHMgPSAnMCcgLi4gcyBlbmQKICByZXR1cm4gcwplbmQKCi0tIOino+aekCBJUHY0IOKGkiA0IOS4qiBvY3RldO+8iDAtMjU177yJ77yM5aSx6LSlIG5pbApsb2NhbCBmdW5jdGlvbiBwYXJzZV92NChzKQogIGxvY2FsIGEsIGIsIGMsIGQgPSBzOm1hdGNoKCdeKCVkKyklLiglZCspJS4oJWQrKSUuKCVkKykkJykKICBpZiBub3QgYSB0aGVuIHJldHVybiBuaWwgZW5kCiAgbG9jYWwgbyA9IHsgdG9udW1iZXIoYSksIHRvbnVtYmVyKGIpLCB0b251bWJlcihjKSwgdG9udW1iZXIoZCkgfQogIGZvciBfLCB4IGluIGlwYWlycyhvKSBkbwogICAgaWYgeCA8IDAgb3IgeCA+IDI1NSB0aGVuIHJldHVybiBuaWwgZW5kCiAgZW5kCiAgcmV0dXJuIG8KZW5kCgotLSDop6PmnpAgSVB2NiDihpIgOCDkuKogMTYtYml0IGhleHRldO+8iDAtNjU1MzXvvInvvIzmlK/mjIEgOjog5Y6L57yp77yM5aSx6LSlIG5pbApsb2NhbCBmdW5jdGlvbiBwYXJzZV92NihzKQogIGxvY2FsIGxvdyA9IHM6bG93ZXIoKQogIGxvY2FsIHBhcnRzCiAgbG9jYWwgbnAgPSAobG93OmdzdWIoJzo6JywgJycpIGFuZCAoc2VsZWN0KDIsIGxvdzpnc3ViKCc6OicsICcnKSkgKyAxKSkKICBsb2NhbCBkY29sb24gPSBsb3c6ZmluZCgnOjonLCAxLCB0cnVlKQogIGlmIGRjb2xvbiB0aGVuCiAgICBpZiAobG93OmdzdWIoJzo6JywgJycpOmdzdWIoJ3gnLCAnJykgPT0gJycpIGFuZCBsb3cgfj0gJzo6JyBhbmQgbG93IH49ICc6OjonIHRoZW4gZW5kCiAgICBpZiBsb3c6bWF0Y2goJzo6Lio6OicpIHRoZW4gcmV0dXJuIG5pbCBlbmQgICAgICAgICAgLS0g5aSa5LiqIDo6CiAgICBsb2NhbCBiZWZvcmUgPSBsb3c6bWF0Y2goJ14oLiopOjonKSBvciAnJwogICAgbG9jYWwgYWZ0ZXIgPSBsb3c6bWF0Y2goJzo6KC4qKSQnKSBvciAnJwogICAgbG9jYWwgbGVmdCwgcmlnaHQgPSB7fSwge30KICAgIGZvciBwIGluIGJlZm9yZTpnbWF0Y2goJ1teOl0rJykgZG8gbGVmdFsjbGVmdCArIDFdID0gcCBlbmQKICAgIGZvciBwIGluIGFmdGVyOmdtYXRjaCgnW146XSsnKSBkbyByaWdodFsjcmlnaHQgKyAxXSA9IHAgZW5kCiAgICBsb2NhbCBwYWQgPSA4IC0gKCNsZWZ0ICsgI3JpZ2h0KQogICAgaWYgcGFkIDwgMCB0aGVuIHJldHVybiBuaWwgZW5kCiAgICBwYXJ0cyA9IHt9CiAgICBmb3IgaSA9IDEsICNsZWZ0IGRvCiAgICAgIGxvY2FsIGggPSB0b251bWJlcihsZWZ0W2ldLCAxNikKICAgICAgaWYgbm90IGggb3IgaCA+IDB4RkZGRiBvciAjbGVmdFtpXSA+IDQgdGhlbiByZXR1cm4gbmlsIGVuZAogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IGgKICAgIGVuZAogICAgZm9yIF8gPSAxLCBwYWQgZG8gcGFydHNbI3BhcnRzICsgMV0gPSAwIGVuZAogICAgZm9yIGkgPSAxLCAjcmlnaHQgZG8KICAgICAgbG9jYWwgaCA9IHRvbnVtYmVyKHJpZ2h0W2ldLCAxNikKICAgICAgaWYgbm90IGggb3IgaCA+IDB4RkZGRiBvciAjcmlnaHRbaV0gPiA0IHRoZW4gcmV0dXJuIG5pbCBlbmQKICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSBoCiAgICBlbmQKICBlbHNlCiAgICBwYXJ0cyA9IHt9CiAgICBmb3IgcCBpbiBsb3c6Z21hdGNoKCdbXjpdKycpIGRvCiAgICAgIGxvY2FsIGggPSB0b251bWJlcihwLCAxNikKICAgICAgaWYgbm90IGggb3IgaCA+IDB4RkZGRiBvciAjcCA+IDQgdGhlbiByZXR1cm4gbmlsIGVuZAogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IGgKICAgIGVuZAogICAgaWYgI3BhcnRzIH49IDggdGhlbiByZXR1cm4gbmlsIGVuZAogIGVuZAogIGlmICNwYXJ0cyB+PSA4IHRoZW4gcmV0dXJuIG5pbCBlbmQKICByZXR1cm4gcGFydHMKZW5kCgotLSDnu5/kuIDop6PmnpDvvJrov5Tlm54ge3Y9NHw2LCB3b3Jkcz1bLi4uXSwgd2JpdHM9MzJ8MTZ9IOaIliBuaWwKbG9jYWwgZnVuY3Rpb24gcGFyc2VfYW55KHMpCiAgaWYgbm90IHMgb3IgcyA9PSAnJyB0aGVuIHJldHVybiBuaWwgZW5kCiAgcyA9IHM6bWF0Y2goJ14lcyooLi0pJXMqJCcpCiAgbG9jYWwgdjQgPSBwYXJzZV92NChzKQogIGlmIHY0IHRoZW4KICAgIGxvY2FsIGkgPSB2NFsxXSAqIDE2Nzc3MjE2ICsgdjRbMl0gKiA2NTUzNiArIHY0WzNdICogMjU2ICsgdjRbNF0KICAgIHJldHVybiB7IHYgPSA0LCB3b3JkcyA9IHsgaSB9LCB3Yml0cyA9IDMyIH0KICBlbmQKICBsb2NhbCB2NiA9IHBhcnNlX3Y2KHMpCiAgaWYgdjYgdGhlbiByZXR1cm4geyB2ID0gNiwgd29yZHMgPSB2Niwgd2JpdHMgPSAxNiB9IGVuZAogIHJldHVybiBuaWwKZW5kCgotLSDmjIkgcHJlZml4IOS9jeaOqeeggeavlOi+g+S4pOS4quWQjOeJiOacrCBJUO+8iHdvcmRzIOaVsOe7hCArIHdiaXRz77yJCmxvY2FsIGZ1bmN0aW9uIGlwX21hdGNoZXNfbWFzayhpcHcsIG5ldHcsIHdiaXRzLCBwcmVmaXgpCiAgZm9yIGkgPSAxLCAjaXB3IGRvCiAgICBsb2NhbCBiaXRzX2JlZm9yZSA9IChpIC0gMSkgKiB3Yml0cwogICAgaWYgcHJlZml4ID4gYml0c19iZWZvcmUgdGhlbgogICAgICBsb2NhbCB0YWtlID0gbWF0aC5taW4od2JpdHMsIHByZWZpeCAtIGJpdHNfYmVmb3JlKQogICAgICBsb2NhbCBtYXNrID0gKCgyIF4gd2JpdHMpIC0gMSkgPDwgKHdiaXRzIC0gdGFrZSkKICAgICAgaWYgKGlwd1tpXSAmIG1hc2spIH49IChuZXR3W2ldICYgbWFzaykgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgICBlbmQKICBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCi0tIOWJjee8gOaOqeegge+8iOmZkOWItuWcqCB3Yml0cyDlhoXvvInigJTigJQg5YWz6ZSu77ya55SoICgyXnRha2UtMSk8PCh3Yml0cy10YWtlKe+8jAotLSDkuI3og73nlKggKDJed2JpdHMtMSk8PCh3Yml0cy10YWtlKe+8iOWQjuiAheWvuSB3Yml0cz0zMiDkvJrmuqLlh7rliLAgNjQg5L2N77yMTHVhSklUICYg5pivIDY0IOS9jSDihpIg5rGh5p+T77yJ44CCCmxvY2FsIGZ1bmN0aW9uIG5ldG1hc2sod2JpdHMsIHRha2UpCiAgaWYgdGFrZSA+PSB3Yml0cyB0aGVuIHJldHVybiAoMiBeIHdiaXRzKSAtIDEgZW5kCiAgaWYgdGFrZSA8PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgcmV0dXJuICgyIF4gdGFrZSAtIDEpIDw8ICh3Yml0cyAtIHRha2UpCmVuZAoKLS0g5bqU55So572R57uc5o6p56CBIOKGkiDmlrAgd29yZHPvvIjnlKjkuo4gbmV0d29yayAvIG1hc2sg6L6T5Ye677yJCmxvY2FsIGZ1bmN0aW9uIGFwcGx5X21hc2soaXB3LCB3Yml0cywgcHJlZml4KQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIGkgPSAxLCAjaXB3IGRvCiAgICBsb2NhbCBiaXRzX2JlZm9yZSA9IChpIC0gMSkgKiB3Yml0cwogICAgbG9jYWwgdGFrZSA9IHByZWZpeCAtIGJpdHNfYmVmb3JlCiAgICBpZiB0YWtlID4gMCB0aGVuCiAgICAgIG91dFtpXSA9IGlwd1tpXSAmIG5ldG1hc2sod2JpdHMsIHRha2UpCiAgICBlbHNlCiAgICAgIG91dFtpXSA9IDAKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCi0tIOS4u+acuuS9jeaOqeegge+8iOe9kee7nOaOqeeggeeahOihpe+8jOmZkOWItuWcqCB3Yml0cyDlhoXvvIk9IGZ1bGwgWE9SIG5ldG1hc2sKbG9jYWwgZnVuY3Rpb24gaW52ZXJ0X21hc2soaXB3LCB3Yml0cywgcHJlZml4KQogIGxvY2FsIG91dCA9IHt9CiAgbG9jYWwgZnVsbCA9ICgyIF4gd2JpdHMpIC0gMQogIGZvciBpID0gMSwgI2lwdyBkbwogICAgbG9jYWwgYml0c19iZWZvcmUgPSAoaSAtIDEpICogd2JpdHMKICAgIGxvY2FsIHRha2UgPSBwcmVmaXggLSBiaXRzX2JlZm9yZQogICAgaWYgdGFrZSA+IDAgdGhlbgogICAgICBvdXRbaV0gPSBmdWxsIH4gbmV0bWFzayh3Yml0cywgdGFrZSkKICAgIGVsc2UKICAgICAgb3V0W2ldID0gZnVsbAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIHdvcmRzX3RvX3N0cih3LCB3Yml0cykKICBpZiB3Yml0cyA9PSAzMiB0aGVuCiAgICBsb2NhbCBpID0gd1sxXQogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkLiVkLiVkLiVkJywgKGkgPj4gMjQpICYgMjU1LCAoaSA+PiAxNikgJiAyNTUsIChpID4+IDgpICYgMjU1LCBpICYgMjU1KQogIGVuZAogIGxvY2FsIGggPSB7fQogIGZvciBpID0gMSwgOCBkbyBoW2ldID0gc3RyaW5nLmZvcm1hdCgnJXgnLCB3W2ldKSBlbmQgICAtLSDml6DliY3lr7zpm7bvvIhJUHY2IOaDr+S+i++8iQogIC0tIOaKmOWPoOacgOmVvyAwIOauteS4uiA6OgogIGxvY2FsIGJlc3QsIGJzdGFydCwgYmxlbiA9IG5pbCwgMSwgMQogIGxvY2FsIGkgPSAxCiAgd2hpbGUgaSA8PSA4IGRvCiAgICBpZiB3W2ldID09IDAgdGhlbgogICAgICBsb2NhbCBqID0gaQogICAgICB3aGlsZSBqIDw9IDggYW5kIHdbal0gPT0gMCBkbyBqID0gaiArIDEgZW5kCiAgICAgIGxvY2FsIGxlbiA9IGogLSBpCiAgICAgIGlmIGxlbiA+IGJsZW4gdGhlbiBibGVuLCBic3RhcnQsIGJlc3QgPSBsZW4sIGksIGkgZW5kCiAgICAgIGkgPSBqCiAgICBlbHNlIGkgPSBpICsgMSBlbmQKICBlbmQKICBsb2NhbCBvdXQKICBpZiBibGVuID49IDIgYW5kIGJlc3QgdGhlbgogICAgbG9jYWwgbGVmdCwgcmlnaHQgPSB7fSwge30KICAgIGZvciBrID0gMSwgYnN0YXJ0IC0gMSBkbyBsZWZ0WyNsZWZ0ICsgMV0gPSBoW2tdIGVuZAogICAgZm9yIGsgPSBic3RhcnQgKyBibGVuLCA4IGRvIHJpZ2h0WyNyaWdodCArIDFdID0gaFtrXSBlbmQKICAgIG91dCA9IHRhYmxlLmNvbmNhdChsZWZ0LCAnOicpIC4uICc6OicgLi4gdGFibGUuY29uY2F0KHJpZ2h0LCAnOicpCiAgICBpZiBvdXQgPT0gJzo6JyB0aGVuIG91dCA9ICc6OicgZW5kCiAgZWxzZQogICAgb3V0ID0gdGFibGUuY29uY2F0KGgsICc6JykKICBlbmQKICByZXR1cm4gb3V0CmVuZAoKLS0g5YiG57G777yIUkZDIDE5MTggLyAxMjcvOCAvIDE2OS4yNTQvMTYgLyAxMDAuNjQvMTAgLyDlpJrmkq0gLyB1bnNwZWNpZmllZO+8iQpsb2NhbCBmdW5jdGlvbiBjbGFzc2lmeShpcCkKICBpZiBpcC52ID09IDQgdGhlbgogICAgbG9jYWwgbyA9IHsgKGlwLndvcmRzWzFdID4+IDI0KSAmIDI1NSwgKGlwLndvcmRzWzFdID4+IDE2KSAmIDI1NSwgKGlwLndvcmRzWzFdID4+IDgpICYgMjU1LCBpcC53b3Jkc1sxXSAmIDI1NSB9CiAgICBpZiBvWzFdID09IDAgdGhlbiByZXR1cm4gJ3Vuc3BlY2lmaWVkJyBlbmQKICAgIGlmIG9bMV0gPT0gMTAgdGhlbiByZXR1cm4gJ3ByaXZhdGUnIGVuZAogICAgaWYgb1sxXSA9PSAxMjcgdGhlbiByZXR1cm4gJ2xvb3BiYWNrJyBlbmQKICAgIGlmIG9bMV0gPT0gMTY5IGFuZCBvWzJdID09IDI1NCB0aGVuIHJldHVybiAnbGluay1sb2NhbCcgZW5kCiAgICBpZiBvWzFdID09IDE3MiBhbmQgb1syXSA+PSAxNiBhbmQgb1syXSA8PSAzMSB0aGVuIHJldHVybiAncHJpdmF0ZScgZW5kCiAgICBpZiBvWzFdID09IDE5MiBhbmQgb1syXSA9PSAxNjggdGhlbiByZXR1cm4gJ3ByaXZhdGUnIGVuZAogICAgaWYgb1sxXSA+PSAyMjQgYW5kIG9bMV0gPD0gMjM5IHRoZW4gcmV0dXJuICdtdWx0aWNhc3QnIGVuZCAgIC0tIDIyNC4wLjAuMC80CiAgICBpZiBvWzFdID49IDI0MCB0aGVuIHJldHVybiAncHJpdmF0ZScgZW5kICAgICAgICAgICAgICAgICAgICAgLS0gMjQwLjAuMC4wLzTvvIjlr7npvZAgUHl0aG9uIGlzX3ByaXZhdGXvvJtDR05BVCAxMDAuNjQvMTAg5b2SIHB1YmxpY++8iQogICAgcmV0dXJuICdwdWJsaWMnCiAgZWxzZQogICAgbG9jYWwgdyA9IGlwLndvcmRzCiAgICBpZiB3WzFdID09IDAgYW5kIHdbMl0gPT0gMCBhbmQgd1szXSA9PSAwIGFuZCB3WzRdID09IDAgYW5kIHdbNV0gPT0gMCBhbmQgd1s2XSA9PSAwCiAgICAgICBhbmQgd1s3XSA9PSAwIGFuZCB3WzhdID09IDAgdGhlbiByZXR1cm4gJ3Vuc3BlY2lmaWVkJyBlbmQKICAgIGlmIHdbMV0gPT0gMCBhbmQgd1syXSA9PSAwIGFuZCB3WzNdID09IDAgYW5kIHdbNF0gPT0gMCBhbmQgd1s1XSA9PSAwIGFuZCB3WzZdID09IDAKICAgICAgIGFuZCB3WzddID09IDAgYW5kIHdbOF0gPT0gMSB0aGVuIHJldHVybiAnbG9vcGJhY2snIGVuZAogICAgLS0g5YmN57yA5YiG57G75oyJIHdbMV0g55qEIGxlYWRpbmcgYml0c++8iOS4jeaYryB3Wzdd77yB77yJCiAgICBpZiAod1sxXSAmIDB4RkYwMCkgPT0gMHhGRjAwIHRoZW4gcmV0dXJuICdtdWx0aWNhc3QnIGVuZCAgICAgICAgICAgLS0gZmYwMDo6LzgKICAgIGlmICh3WzFdICYgMHhGRkMwKSA9PSAweEZFODAgdGhlbiByZXR1cm4gJ2xpbmstbG9jYWwnIGVuZCAgICAgICAgICAtLSBmZTgwOjovMTAKICAgIGlmICh3WzFdICYgMHhGRTAwKSA9PSAweEZDMDAgdGhlbiByZXR1cm4gJ3ByaXZhdGUnIGVuZCAgICAgICAgICAgICAtLSBmYzAwOjovNyAoVUxBKQogICAgaWYgd1sxXSA9PSAweDIwMDEgYW5kIHdbMl0gPT0gMHgwZGI4IHRoZW4gcmV0dXJuICdwcml2YXRlJyBlbmQgICAgIC0tIDIwMDE6ZGI4OjovMzIgZG9jdW1lbnRhdGlvbgogICAgcmV0dXJuICdwdWJsaWMnCiAgZW5kCmVuZAoKbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHRvc3RyaW5nKHMpOmdzdWIoJyhbXFxcIlxuXHRccl0pJywgZnVuY3Rpb24oYykKICAgIGlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcgZWxzZWlmIGMgPT0gJyInIHRoZW4gcmV0dXJuICdcXCInCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicgZWxzZSByZXR1cm4gYyBlbmQKICBlbmQpKQplbmQKCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbiBwID0geyB2ID0gcCB9IGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpbnB1dCJ9JyBlbmQKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2NsYXNzaWZ5JwogIGxvY2FsIHYgPSBwLnYKICBpZiBub3QgdiB0aGVuIHJldHVybiAneyJlcnJvciI6Im1pc3NpbmcgdiJ9JyBlbmQKCiAgaWYgb3AgPT0gJ3ZlcnNpb24nIHRoZW4KICAgIGxvY2FsIGlwID0gcGFyc2VfYW55KHYpCiAgICBpZiBub3QgaXAgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJiYWQgaXAifScgZW5kCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgneyJ2ZXJzaW9uIjolZH0nLCBpcC52KQogIGVsc2VpZiBvcCA9PSAnaXAyaW50JyB0aGVuCiAgICBsb2NhbCBpcCA9IHBhcnNlX2FueSh2KQogICAgaWYgbm90IGlwIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGlwIn0nIGVuZAogICAgaWYgaXAudiA9PSA0IHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJ3sidmFsdWUiOiVkLCJ2NiI6ZmFsc2V9JywgaXAud29yZHNbMV0pIGVuZAogICAgbG9jYWwgaGV4ID0gJycKICAgIGZvciBpID0gMSwgOCBkbyBoZXggPSBoZXggLi4gdG9oZXgoaXAud29yZHNbaV0sIDQpIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ3sidmFsdWUiOiIlcyIsInY2Ijp0cnVlfScsIGhleCkKICBlbHNlaWYgb3AgPT0gJ2ludDJpcCcgdGhlbgogICAgbG9jYWwgbiA9IHRvbnVtYmVyKHAubikgb3IgdG9udW1iZXIodikKICAgIGlmIG5vdCBuIG9yIG4gPCAwIG9yIG4gPiAweEZGRkZGRkZGIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGludCJ9JyBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCciJWQuJWQuJWQuJWQiJywgKG4gPj4gMjQpICYgMjU1LCAobiA+PiAxNikgJiAyNTUsIChuID4+IDgpICYgMjU1LCBuICYgMjU1KQogIGVsc2VpZiBvcCA9PSAnaW5fY2lkcicgdGhlbgogICAgbG9jYWwgY2lkciA9IHAuY2lkciBvciB2Om1hdGNoKCdeKC4rKS8oJWQrKSQnKQogICAgbG9jYWwgaXAgPSBwYXJzZV9hbnkodikKICAgIGlmIG5vdCBpcCB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpcCJ9JyBlbmQKICAgIGxvY2FsIG5ldHN0ciwgcGZ4c3RyCiAgICBpZiBwLmNpZHIgdGhlbgogICAgICBuZXRzdHIsIHBmeHN0ciA9IHAuY2lkcjptYXRjaCgnXiguKykvKCVkKykkJykKICAgIGVsc2UKICAgICAgbmV0c3RyLCBwZnhzdHIgPSB2Om1hdGNoKCdeKC4rKS8oJWQrKSQnKQogICAgZW5kCiAgICBpZiBub3QgbmV0c3RyIHRoZW4gcmV0dXJuICd7ImVycm9yIjoiYmFkIGNpZHIsIG5lZWQgYS9iIn0nIGVuZAogICAgbG9jYWwgcHJlZml4ID0gdG9udW1iZXIocGZ4c3RyKQogICAgbG9jYWwgbmV0ID0gcGFyc2VfYW55KG5ldHN0cikKICAgIGlmIG5vdCBuZXQgb3IgbmV0LnYgfj0gaXAudiBvciBwcmVmaXggPCAwIG9yIHByZWZpeCA+IChpcC52ID09IDQgYW5kIDMyIG9yIDEyOCkgdGhlbgogICAgICByZXR1cm4gJ3siZXJyb3IiOiJiYWQgY2lkciBvciB2ZXJzaW9uIG1pc21hdGNoIn0nCiAgICBlbmQKICAgIGxvY2FsIGlubmV0ID0gaXBfbWF0Y2hlc19tYXNrKGlwLndvcmRzLCBuZXQud29yZHMsIGlwLndiaXRzLCBwcmVmaXgpCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgneyJpbiI6JXMsInYiOiVkfScsIHRvc3RyaW5nKGlubmV0KSwgaXAudikKICBlbHNlaWYgb3AgPT0gJ25ldCcgb3Igb3AgPT0gJ2Jyb2FkY2FzdCcgb3Igb3AgPT0gJ2NpZHJfaW5mbycgdGhlbgogICAgbG9jYWwgbmV0c3RyLCBwZnhzdHIgPSAocC52KTptYXRjaCgnXiguKykvKCVkKykkJykKICAgIGlmIG5vdCBuZXRzdHIgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJuZWVkIGEvYiJ9JyBlbmQKICAgIGxvY2FsIHByZWZpeCA9IHRvbnVtYmVyKHBmeHN0cikKICAgIGxvY2FsIG5ldCA9IHBhcnNlX2FueShuZXRzdHIpCiAgICBpZiBub3QgbmV0IG9yIHByZWZpeCA8IDAgb3IgcHJlZml4ID4gKG5ldC52ID09IDQgYW5kIDMyIG9yIDEyOCkgdGhlbgogICAgICByZXR1cm4gJ3siZXJyb3IiOiJiYWQgY2lkciJ9JwogICAgZW5kCiAgICBsb2NhbCBuZXR3ID0gYXBwbHlfbWFzayhuZXQud29yZHMsIG5ldC53Yml0cywgcHJlZml4KQogICAgbG9jYWwgbmV0c3RyX291dCA9IHdvcmRzX3RvX3N0cihuZXR3LCBuZXQud2JpdHMpCiAgICBpZiBvcCA9PSAnbmV0JyB0aGVuIHJldHVybiBzdHJpbmcuZm9ybWF0KCciJXMiJywgbmV0c3RyX291dCkgZW5kCiAgICBsb2NhbCBpbnYgPSBpbnZlcnRfbWFzayhuZXQud29yZHMsIG5ldC53Yml0cywgcHJlZml4KQogICAgbG9jYWwgYmNhc3R3ID0ge30KICAgIGZvciBpID0gMSwgI25ldC53b3JkcyBkbyBiY2FzdHdbaV0gPSBuZXR3W2ldIHwgaW52W2ldIGVuZAogICAgbG9jYWwgYmNhc3Rfb3V0ID0gd29yZHNfdG9fc3RyKGJjYXN0dywgbmV0LndiaXRzKQogICAgaWYgb3AgPT0gJ2Jyb2FkY2FzdCcgdGhlbiByZXR1cm4gc3RyaW5nLmZvcm1hdCgnIiVzIicsIGJjYXN0X291dCkgZW5kCiAgICAtLSBjaWRyX2luZm8KICAgIGxvY2FsIHdpZHRoID0gbmV0LndiaXRzICogI25ldC53b3JkcwogICAgbG9jYWwgZnJlZSA9IHdpZHRoIC0gcHJlZml4CiAgICBsb2NhbCBzaXplCiAgICBpZiBmcmVlIDw9IDUyIHRoZW4gc2l6ZSA9IDIgXiBmcmVlCiAgICBlbHNlIHNpemUgPSBzdHJpbmcuZm9ybWF0KCciMl4lZCInLCBmcmVlKSBlbmQKICAgIC0tIOaOqeeggSA9IOWvueWFqCAxIOWtl+mbhuW6lOeUqCAvcHJlZml4CiAgICBsb2NhbCBvbmVzID0ge30KICAgIGZvciBpID0gMSwgI25ldC53b3JkcyBkbyBvbmVzW2ldID0gKDIgXiBuZXQud2JpdHMpIC0gMSBlbmQKICAgIGxvY2FsIG1hc2t3ID0gYXBwbHlfbWFzayhvbmVzLCBuZXQud2JpdHMsIHByZWZpeCkKICAgIGxvY2FsIG1hc2tzdHIKICAgIGlmIG5ldC52ID09IDQgdGhlbgogICAgICBsb2NhbCBtID0gbWFza3dbMV0KICAgICAgbWFza3N0ciA9IHN0cmluZy5mb3JtYXQoJyVkLiVkLiVkLiVkJywgKG0gPj4gMjQpICYgMjU1LCAobSA+PiAxNikgJiAyNTUsIChtID4+IDgpICYgMjU1LCBtICYgMjU1KQogICAgZWxzZQogICAgICBtYXNrc3RyID0gd29yZHNfdG9fc3RyKG1hc2t3LCBuZXQud2JpdHMpCiAgICBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCd7Im5ldHdvcmsiOiIlcyIsImJyb2FkY2FzdCI6IiVzIiwicHJlZml4IjolZCwic2l6ZSI6JXMsIm1hc2siOiIlcyIsImlzX3Y2Ijolc30nLAogICAgICBqc29uX2VzY2FwZShuZXRzdHJfb3V0KSwganNvbl9lc2NhcGUoYmNhc3Rfb3V0KSwgcHJlZml4LCBzaXplLCBqc29uX2VzY2FwZShtYXNrc3RyKSwgdG9zdHJpbmcobmV0LnYgPT0gNikpCiAgZWxzZWlmIG9wID09ICdjbGFzc2lmeScgdGhlbgogICAgbG9jYWwgaXAgPSBwYXJzZV9hbnkodikKICAgIGlmIG5vdCBpcCB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpcCJ9JyBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCd7ImNsYXNzIjoiJXMiLCJ2IjolZH0nLCBjbGFzc2lmeShpcCksIGlwLnYpCiAgZW5kCiAgcmV0dXJuICd7ImVycm9yIjoidW5rbm93biBvcCJ9JwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBqc29ucGF0Y2gKLS0gQGNhdGVnb3J5OiBwYXJzZXIKLS0gQGRlc2M6IFJGQyA2OTAyIEpTT04gUGF0Y2jvvIhhZGQvcmVtb3ZlL3JlcGxhY2UvbW92ZS9jb3B5L3Rlc3TvvIkrIFJGQyA2OTAxIEpTT04gUG9pbnRlcgotLSAgICAgICArIOWfuuehgCBkaWZmIOKAlOKAlCBEdWNrREIg5YaF5bu6IGpzb25fbWVyZ2VfcGF0Y2jvvIhSRkMgNzM4Nu+8ieS9huayoeaciSBSRkMgNjkwMiDmk43kvZzmlbDnu4QgLwotLSAgICAgICBKU09OIFBvaW50ZXLvvIzmnKzlupPooaXpvZDjgILoh6rljIXlkKvvvJrlhoXltYzkuIDkuKrnuq8gTHVhIEpTT04g57yW6Kej56CB5Zmo77yIVVRGLTgg5Y6f5qC36YCP5Lyg77yJ77yMCi0tICAgICAgIOS4jeS+nei1luWklumDqCBqc29uLmx1Ye+8jOS+v+S6juenu+akjeOAggotLSAgICAgICBvcCDpgInpobnvvIhkb2MgLyBwYXRjaCAvIHZhbHVlIOWdh+S4uiBKU09OIOe8lueggeWtl+espuS4su+8ie+8mgotLSAgICAgICAgICdhcHBseScge2RvYywgcGF0Y2h9ICAgICAgICAg4oaSIOW6lOeUqCBwYXRjaO+8iFJGQyA2OTAyIOaVsOe7hO+8ieWQjueahOaWh+aho++8iEpTT04g5a2X56ym5Liy77yJCi0tICAgICAgICAgJ2dldCcgICB7ZG9jLCBwYXRofSAgICAgICAgICDihpIgSlNPTiBQb2ludGVyIOWkhOeahOWAvO+8iEpTT04g57yW56CB77yb57y65aSxL+epuiDihpIgbnVsbO+8iQotLSAgICAgICAgICdzZXQnICAge2RvYywgcGF0aCwgdmFsdWV9ICAg4oaSIOWcqOivpeWkhCB1cHNlcnQgdmFsdWXvvIjniLbnuqfpobvlrZjlnKjvvInlkI7nmoTmlofmoaMKLS0gICAgICAgICAndGVzdCcgIHtkb2MsIHBhdGgsIHZhbHVlfSAgIOKGkiDor6XlpITlgLzmmK/lkKbnrYnkuo4gdmFsdWUg4oaSICJ0cnVlIi8iZmFsc2UiCi0tICAgICAgICAgJ2RpZmYnICB7YSwgYn0gICAgICAgICAgICAgICDihpIg55SxIGEg5Y+Y5o2i5YiwIGIg55qEIFJGQyA2OTAyIHBhdGNo77yISlNPTiDmlbDnu4TlrZfnrKbkuLLvvIwKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg5pWw57uE562J6ZW/6YCQ5YWD57Sg6YCS5b2S44CB5LiN562J6ZW/5pW05L2TIHJlcGxhY2XvvIzpnZ7mnIDlsI/kvYbmraPnoa7vvIkKLS0gICAgICAg6K+a5a6e6L6555WM77yacGF0Y2gg5YaFIHZhbHVlIOS4gOW+i+aYr+W3suino+eggeeahCBKU09OIOWAvO+8m0pTT04gbnVsbCDkuI4ga2V5IOe8uuWkseWcqCBMdWEg6YeM5ZCM5Li6IG5pbO+8jAotLSAgICAgICDmlYUgcGF0Y2gg5LitICJ2YWx1ZSI6bnVsbCDop4bkuLrnvLrlpLHvvIhhZGQg5oiQIG5vLW9w77yJ77yb5b6q546v5byV55So57yW56CB5Li6IG51bGzjgIIKLS0gQHNvdXJjZTog6Ieq5YyF5ZCr77yISlNPTiDnvJbop6PnoIHlj4LogIMgcnhpL2pzb24ubHVhIE1JVCDmgJ3ot6/oh6rlhpnvvJtSRkMgNjkwMS82OTAy77yJCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0KLS0gVXNhZ2U6Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdqc29ucGF0Y2gnLCB7b3A6J2FwcGx5JywgZG9jOid7ImEiOjF9JywKLS0gICAgIHBhdGNoOidbeyJvcCI6ImFkZCIsInBhdGgiOiIvYiIsInZhbHVlIjoyfSx7Im9wIjoidGVzdCIsInBhdGgiOiIvYSIsInZhbHVlIjoxfV0nfSk7Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdqc29ucGF0Y2gnLCB7b3A6J2dldCcsIGRvYzonW3sieCI6N30sInkiXScsIHBhdGg6Jy8wL3gnfSk7ICAtLSA3Ci0tICAgU0VMRUNUIGx1YWppdF9zKCdqc29ucGF0Y2gnLCB7b3A6J2RpZmYnLCBhOid7ImEiOjEsImIiOlsxLDJdfScsIGI6J3siYSI6OSwiYyI6dHJ1ZX0nfSk7CgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIOWGheW1jCBKU09OIOe8luino+egge+8iOe6ryBMdWHvvIxVVEYtOCDljp/moLfpgI/kvKDvvIkKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQpsb2NhbCBqcCA9IHt9Cgpsb2NhbCBFU0MgPSB7IFsnXFwnXT0nXFxcXCcsIFsnIiddPSdcXCInLCBbJ1xuJ109J1xcbicsIFsnXHQnXT0nXFx0JywKICAgICAgICAgICAgICBbJ1xyJ109J1xccicsIFsnXGInXT0nXFxiJywgWydcZiddPSdcXGYnIH0KbG9jYWwgZnVuY3Rpb24gZW5jX3N0cihzKQogIHJldHVybiAnIicgLi4gdG9zdHJpbmcocyk6Z3N1YignWyV6XDEtXDMxXFwiXScsIGZ1bmN0aW9uKGMpCiAgICBpZiBFU0NbY10gdGhlbiByZXR1cm4gRVNDW2NdIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBjOmJ5dGUoKSkKICBlbmQpIC4uICciJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGlzX2FycmF5KHQpCiAgaWYgdHlwZSh0KSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGxvY2FsIG4sIGkgPSAwLCAxCiAgZm9yIGsgaW4gcGFpcnModCkgZG8KICAgIGlmIHR5cGUoaykgfj0gJ251bWJlcicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgICBuID0gbiArIDEKICBlbmQKICBpZiBuID09IDAgdGhlbiByZXR1cm4gZmFsc2UgZW5kICAgICAgICAgIC0tIOepuuihqOaMieWvueixoQogIHdoaWxlIHRbaV0gfj0gbmlsIGRvIGkgPSBpICsgMSBlbmQKICByZXR1cm4gaSAtIDEgPT0gbgplbmQKCmxvY2FsIGZ1bmN0aW9uIHV0ZjhmdWxsKG4pCiAgaWYgbiA8IDB4ODAgdGhlbiByZXR1cm4gc3RyaW5nLmNoYXIobikgZW5kCiAgaWYgbiA8IDB4ODAwIHRoZW4gcmV0dXJuIHN0cmluZy5jaGFyKDB4QzArbWF0aC5mbG9vcihuLzY0KSwgMHg4MCsobiU2NCkpIGVuZAogIGlmIG4gPCAweDEwMDAwIHRoZW4KICAgIHJldHVybiBzdHJpbmcuY2hhcigweEUwK21hdGguZmxvb3Iobi80MDk2KSwgMHg4MCsobWF0aC5mbG9vcihuLzY0KSU2NCksIDB4ODArKG4lNjQpKQogIGVuZAogIHJldHVybiBzdHJpbmcuY2hhcigweEYwK21hdGguZmxvb3Iobi8yNjIxNDQpLCAweDgwKyhtYXRoLmZsb29yKG4vNDA5NiklNjQpLAogICAgICAgICAgICAgICAgICAgICAweDgwKyhtYXRoLmZsb29yKG4vNjQpJTY0KSwgMHg4MCsobiU2NCkpCmVuZAoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlKHYsIHNlZW4pCiAgc2VlbiA9IHNlZW4gb3Ige30KICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgbG9jYWwgdHYgPSB0eXBlKHYpCiAgaWYgdHYgPT0gJ2Jvb2xlYW4nIHRoZW4gcmV0dXJuIHYgYW5kICd0cnVlJyBvciAnZmFsc2UnIGVuZAogIGlmIHR2ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiBvciB2ID09IG1hdGguaHVnZSBvciB2ID09IC1tYXRoLmh1Z2UgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgaWYgdiA9PSBtYXRoLmZsb29yKHYpIGFuZCBtYXRoLmFicyh2KSA8IDFlMTUgdGhlbiByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJWQnLCB2KSBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCclLjE3ZycsIHYpCiAgZW5kCiAgaWYgdHYgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gZW5jX3N0cih2KSBlbmQKICBpZiB0diA9PSAndGFibGUnIHRoZW4KICAgIGlmIHNlZW5bdl0gdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgc2Vlblt2XSA9IHRydWUKICAgIGlmIGlzX2FycmF5KHYpIHRoZW4KICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaSA9IDEsICN2IGRvIHBhcnRzW2ldID0gZW5jb2RlKHZbaV0sIHNlZW4pIGVuZAogICAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICAgIGVsc2UKICAgICAgbG9jYWwgcGFydHMgPSB7fQogICAgICBmb3IgaywgdmFsIGluIHBhaXJzKHYpIGRvCiAgICAgICAgcGFydHNbI3BhcnRzKzFdID0gZW5jX3N0cih0b3N0cmluZyhrKSkgLi4gJzonIC4uIGVuY29kZSh2YWwsIHNlZW4pCiAgICAgIGVuZAogICAgICByZXR1cm4gJ3snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnfScKICAgIGVuZAogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgpsb2NhbCBmdW5jdGlvbiBkZWNvZGUoc3RyKQogIGxvY2FsIHBvcyA9IDEKICBsb2NhbCBmdW5jdGlvbiB3cygpCiAgICB3aGlsZSBwb3MgPD0gI3N0ciBkbwogICAgICBsb2NhbCBjID0gc3RyOnN1Yihwb3MscG9zKQogICAgICBpZiBjPT0nICcgb3IgYz09J1x0JyBvciBjPT0nXG4nIG9yIGM9PSdccicgdGhlbiBwb3MgPSBwb3MrMSBlbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZXJyID0gZnVuY3Rpb24obXNnKSBlcnJvcignanNvbjogJyAuLiBtc2cgLi4gJyBAJyAuLiBwb3MsIDApIGVuZAogIGxvY2FsIGZ1bmN0aW9uIGhleDQocywgaSkKICAgIGxvY2FsIGggPSBzOnN1YihpLCBpKzMpCiAgICBsb2NhbCBuID0gdG9udW1iZXIoaCwgMTYpCiAgICBpZiBub3QgbiB0aGVuIGVycignYmFkIFxcdScpIGVuZAogICAgcmV0dXJuIG4sIGkgKyA0CiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gcGFyc2Vfc3RyaW5nKCkKICAgIHBvcyA9IHBvcyArIDEKICAgIGxvY2FsIG91dCA9IHt9CiAgICB3aGlsZSBwb3MgPD0gI3N0ciBkbwogICAgICBsb2NhbCBjID0gc3RyOnN1Yihwb3MscG9zKQogICAgICBpZiBjID09ICciJyB0aGVuIHBvcyA9IHBvcyArIDE7IHJldHVybiB0YWJsZS5jb25jYXQob3V0KSBlbmQKICAgICAgaWYgYyA9PSAnXFwnIHRoZW4KICAgICAgICBsb2NhbCBlID0gc3RyOnN1Yihwb3MrMSwgcG9zKzEpCiAgICAgICAgaWYgZT09JyInIHRoZW4gb3V0WyNvdXQrMV09JyInOyBwb3M9cG9zKzIKICAgICAgICBlbHNlaWYgZT09J1xcJyB0aGVuIG91dFsjb3V0KzFdPSdcXCc7IHBvcz1wb3MrMgogICAgICAgIGVsc2VpZiBlPT0nLycgdGhlbiBvdXRbI291dCsxXT0nLyc7IHBvcz1wb3MrMgogICAgICAgIGVsc2VpZiBlPT0nYicgdGhlbiBvdXRbI291dCsxXT0nXGInOyBwb3M9cG9zKzIKICAgICAgICBlbHNlaWYgZT09J2YnIHRoZW4gb3V0WyNvdXQrMV09J1xmJzsgcG9zPXBvcysyCiAgICAgICAgZWxzZWlmIGU9PSduJyB0aGVuIG91dFsjb3V0KzFdPSdcbic7IHBvcz1wb3MrMgogICAgICAgIGVsc2VpZiBlPT0ncicgdGhlbiBvdXRbI291dCsxXT0nXHInOyBwb3M9cG9zKzIKICAgICAgICBlbHNlaWYgZT09J3QnIHRoZW4gb3V0WyNvdXQrMV09J1x0JzsgcG9zPXBvcysyCiAgICAgICAgZWxzZWlmIGU9PSd1JyB0aGVuCiAgICAgICAgICBsb2NhbCBjcCwgbnAgPSBoZXg0KHN0ciwgcG9zKzIpOyBwb3MgPSBucAogICAgICAgICAgaWYgY3AgPj0gMHhEODAwIGFuZCBjcCA8PSAweERCRkYKICAgICAgICAgICAgIGFuZCBzdHI6c3ViKHBvcyxwb3MrMSk9PSdcXCcgYW5kIHN0cjpzdWIocG9zKzIscG9zKzIpPT0ndScgdGhlbgogICAgICAgICAgICBsb2NhbCBsbywgbnAyID0gaGV4NChzdHIsIHBvcysyKQogICAgICAgICAgICBpZiBsbyA+PSAweERDMDAgYW5kIGxvIDw9IDB4REZGRiB0aGVuCiAgICAgICAgICAgICAgY3AgPSAweDEwMDAwICsgKChjcCAtIDB4RDgwMCkgKiAxMDI0KSArIChsbyAtIDB4REMwMCkKICAgICAgICAgICAgICBwb3MgPSBucDIKICAgICAgICAgICAgZW5kCiAgICAgICAgICBlbmQKICAgICAgICAgIG91dFsjb3V0KzFdID0gdXRmOGZ1bGwoY3ApCiAgICAgICAgZWxzZSBlcnIoJ2JhZCBlc2NhcGUnKSBlbmQKICAgICAgZWxzZQogICAgICAgIG91dFsjb3V0KzFdID0gYzsgcG9zID0gcG9zICsgMQogICAgICBlbmQKICAgIGVuZAogICAgZXJyKCd1bnRlcm1pbmF0ZWQgc3RyaW5nJykKICBlbmQKICBsb2NhbCBwYXJzZV92YWx1ZQogIGxvY2FsIGZ1bmN0aW9uIHBhcnNlX251bWJlcigpCiAgICBsb2NhbCBzID0gc3RyOm1hdGNoKCdeJS0/JWQrJS4/JWQqW2VFXT9bKy1dPyVkKicsIHBvcykKICAgIGlmIG5vdCBzIG9yIHMgPT0gJycgdGhlbiBlcnIoJ2JhZCBudW1iZXInKSBlbmQKICAgIHBvcyA9IHBvcyArICNzCiAgICByZXR1cm4gdG9udW1iZXIocykKICBlbmQKICBsb2NhbCBmdW5jdGlvbiBwYXJzZV9hcnJheSgpCiAgICBwb3MgPSBwb3MgKyAxOyB3cygpCiAgICBsb2NhbCBhcnIgPSB7fQogICAgaWYgc3RyOnN1Yihwb3MscG9zKSA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gYXJyIGVuZAogICAgd2hpbGUgdHJ1ZSBkbwogICAgICB3cygpOyBhcnJbI2FycisxXSA9IHBhcnNlX3ZhbHVlKCk7IHdzKCkKICAgICAgbG9jYWwgYyA9IHN0cjpzdWIocG9zLHBvcykKICAgICAgaWYgYyA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgIGVsc2VpZiBjID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDE7IHJldHVybiBhcnIKICAgICAgZWxzZSBlcnIoJ2JhZCBhcnJheScpIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gcGFyc2Vfb2JqZWN0KCkKICAgIHBvcyA9IHBvcyArIDE7IHdzKCkKICAgIGxvY2FsIG9iaiA9IHt9CiAgICBpZiBzdHI6c3ViKHBvcyxwb3MpID09ICd9JyB0aGVuIHBvcyA9IHBvcyArIDE7IHJldHVybiBvYmogZW5kCiAgICB3aGlsZSB0cnVlIGRvCiAgICAgIHdzKCkKICAgICAgaWYgc3RyOnN1Yihwb3MscG9zKSB+PSAnIicgdGhlbiBlcnIoJ2V4cGVjdGVkIGtleScpIGVuZAogICAgICBsb2NhbCBrID0gcGFyc2Vfc3RyaW5nKCk7IHdzKCkKICAgICAgaWYgc3RyOnN1Yihwb3MscG9zKSB+PSAnOicgdGhlbiBlcnIoJ2V4cGVjdGVkIDonKSBlbmQKICAgICAgcG9zID0gcG9zICsgMTsgd3MoKQogICAgICBvYmpba10gPSBwYXJzZV92YWx1ZSgpOyB3cygpCiAgICAgIGxvY2FsIGMgPSBzdHI6c3ViKHBvcyxwb3MpCiAgICAgIGlmIGMgPT0gJywnIHRoZW4gcG9zID0gcG9zICsgMQogICAgICBlbHNlaWYgYyA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxOyByZXR1cm4gb2JqCiAgICAgIGVsc2UgZXJyKCdiYWQgb2JqZWN0JykgZW5kCiAgICBlbmQKICBlbmQKICBwYXJzZV92YWx1ZSA9IGZ1bmN0aW9uKCkKICAgIHdzKCkKICAgIGxvY2FsIGMgPSBzdHI6c3ViKHBvcyxwb3MpCiAgICBpZiBjID09ICciJyB0aGVuIHJldHVybiBwYXJzZV9zdHJpbmcoKSBlbmQKICAgIGlmIGMgPT0gJ3snIHRoZW4gcmV0dXJuIHBhcnNlX29iamVjdCgpIGVuZAogICAgaWYgYyA9PSAnWycgdGhlbiByZXR1cm4gcGFyc2VfYXJyYXkoKSBlbmQKICAgIGlmIGMgPT0gJ3QnIHRoZW4gaWYgc3RyOnN1Yihwb3MscG9zKzMpPT0ndHJ1ZScgdGhlbiBwb3M9cG9zKzQ7IHJldHVybiB0cnVlIGVuZCBlcnIoJ2xpdGVyYWwnKSBlbmQKICAgIGlmIGMgPT0gJ2YnIHRoZW4gaWYgc3RyOnN1Yihwb3MscG9zKzQpPT0nZmFsc2UnIHRoZW4gcG9zPXBvcys1OyByZXR1cm4gZmFsc2UgZW5kIGVycignbGl0ZXJhbCcpIGVuZAogICAgaWYgYyA9PSAnbicgdGhlbiBpZiBzdHI6c3ViKHBvcyxwb3MrMyk9PSdudWxsJyB0aGVuIHBvcz1wb3MrNDsgcmV0dXJuIG5pbCBlbmQgZXJyKCdsaXRlcmFsJykgZW5kCiAgICBpZiBjID09ICctJyBvciAoYyA+PSAnMCcgYW5kIGMgPD0gJzknKSB0aGVuIHJldHVybiBwYXJzZV9udW1iZXIoKSBlbmQKICAgIGVycigndW5leHBlY3RlZCAnIC4uIHRvc3RyaW5nKGMpKQogIGVuZAogIHJldHVybiBwYXJzZV92YWx1ZSgpCmVuZAoKanAuZW5jb2RlID0gZW5jb2RlCmpwLmRlY29kZSA9IGRlY29kZQoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQotLSBkZWVwIGNvcHkgLyBlcXVhbAotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCmxvY2FsIGZ1bmN0aW9uIGRlZXBfY29weSh2KQogIGlmIHR5cGUodikgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiB2IGVuZAogIGxvY2FsIGMgPSB7fQogIGZvciBrLCB2YWwgaW4gcGFpcnModikgZG8gY1trXSA9IGRlZXBfY29weSh2YWwpIGVuZAogIHJldHVybiBjCmVuZAoKbG9jYWwgZnVuY3Rpb24gZGVlcF9lcShhLCBiKQogIGlmIGEgPT0gbmlsIG9yIGIgPT0gbmlsIHRoZW4gcmV0dXJuIChhID09IG5pbCBhbmQgYiA9PSBuaWwpIG9yCiAgICAodHlwZShhKT09J3RhYmxlJyBhbmQgbmV4dChhKT09bmlsIGFuZCBiPT1uaWwpIG9yCiAgICAodHlwZShiKT09J3RhYmxlJyBhbmQgbmV4dChiKT09bmlsIGFuZCBhPT1uaWwpIGVuZAogIGlmIHR5cGUoYSkgfj0gdHlwZShiKSB0aGVuCiAgICAtLSB7fSDkuI4gbnVsbCDop4bkuLrkuI3nrYnvvIzkvYYgTHVhIOaXoOazleWMuuWIhu+8m+i/memHjOaMieexu+Wei+S4peagvAogICAgcmV0dXJuIGZhbHNlCiAgZW5kCiAgaWYgdHlwZShhKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuIGEgPT0gYiBlbmQKICBmb3IgaywgdmFsIGluIHBhaXJzKGEpIGRvCiAgICBpZiBub3QgZGVlcF9lcSh2YWwsIGJba10pIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGVuZAogIGZvciBrIGluIHBhaXJzKGIpIGRvCiAgICBpZiBhW2tdID09IG5pbCBhbmQgbm90ICh0eXBlKGFba10pPT0ndGFibGUnKSB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLS0gUkZDIDY5MDEgSlNPTiBQb2ludGVyCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KbG9jYWwgZnVuY3Rpb24gc3BsaXRfcGF0aChwdHIpCiAgbG9jYWwgdG9rZW5zID0ge30KICBpZiBwdHIgPT0gJycgdGhlbiByZXR1cm4gdG9rZW5zIGVuZAogIGlmIHB0cjpzdWIoMSwxKSB+PSAnLycgdGhlbiBlcnJvcigncG9pbnRlciBtdXN0IGJlICIiIG9yIHN0YXJ0IHdpdGggLycpIGVuZAogIGxvY2FsIGkgPSAyCiAgd2hpbGUgaSA8PSAjcHRyIGRvCiAgICBsb2NhbCBqID0gcHRyOmZpbmQoJy8nLCBpLCB0cnVlKQogICAgaWYgbm90IGogdGhlbiBqID0gI3B0ciArIDEgZW5kCiAgICBsb2NhbCB0b2sgPSBwdHI6c3ViKGksIGotMSk6Z3N1YignfjEnLCcvJyk6Z3N1YignfjAnLCd+JykKICAgIHRva2Vuc1sjdG9rZW5zKzFdID0gdG9rCiAgICBpID0gaiArIDEKICBlbmQKICByZXR1cm4gdG9rZW5zCmVuZAoKbG9jYWwgZnVuY3Rpb24gZ2V0X2F0KGRvYywgdG9rZW5zKQogIGxvY2FsIGN1ciA9IGRvYwogIGZvciBpID0gMSwgI3Rva2VucyBkbwogICAgbG9jYWwgdG9rID0gdG9rZW5zW2ldCiAgICBpZiBpc19hcnJheShjdXIpIHRoZW4KICAgICAgbG9jYWwgaXggPSB0b251bWJlcih0b2spCiAgICAgIGlmIG5vdCBpeCBvciBpeCA8IDAgb3IgaXggPj0gI2N1ciB0aGVuIGVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UgYXQgIicuLnRvay4uJyInKSBlbmQKICAgICAgY3VyID0gY3VyW2l4ICsgMV0gICAgICAgICAgICAgICAtLSBSRkMgNjkwMSDmlbDnu4TkuIvmoIcgMC1iYXNlZCDihpIgTHVhIDEtYmFzZWQKICAgIGVsc2UKICAgICAgY3VyID0gY3VyW3Rva10KICAgIGVuZAogICAgaWYgY3VyID09IG5pbCBhbmQgaSA8ICN0b2tlbnMgdGhlbiBlcnJvcigncG9pbnRlciBwYXRoIG1pc3NpbmcgYXQgIicuLnRvay4uJyInKSBlbmQKICBlbmQKICByZXR1cm4gY3VyCmVuZAoKbG9jYWwgZnVuY3Rpb24gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgbG9jYWwgY3VyID0gZG9jCiAgZm9yIGkgPSAxLCAjdG9rZW5zIC0gMSBkbwogICAgbG9jYWwgdG9rID0gdG9rZW5zW2ldCiAgICBpZiBpc19hcnJheShjdXIpIHRoZW4KICAgICAgbG9jYWwgaXggPSB0b251bWJlcih0b2spCiAgICAgIGlmIG5vdCBpeCBvciBpeCA8IDAgb3IgaXggPj0gI2N1ciB0aGVuIGVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UgYXQgIicuLnRvay4uJyInKSBlbmQKICAgICAgY3VyID0gY3VyW2l4ICsgMV0KICAgIGVsc2UKICAgICAgY3VyID0gY3VyW3Rva10KICAgIGVuZAogICAgaWYgY3VyID09IG5pbCB0aGVuIGVycm9yKCdwb2ludGVyIHBhdGggbWlzc2luZyBhdCAiJy4udG9rLi4nIicpIGVuZAogIGVuZAogIHJldHVybiBjdXIsIHRva2Vuc1sjdG9rZW5zXQplbmQKCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KLS0gUkZDIDY5MDIg5pON5L2cCi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0KbG9jYWwgZnVuY3Rpb24gb3BfYWRkKGRvYywgcHRyLCB2YWwpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgaWYgI3Rva2VucyA9PSAwIHRoZW4gcmV0dXJuIGRlZXBfY29weSh2YWwpIGVuZAogIGxvY2FsIHBhcmVudCwga2V5ID0gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgaWYgaXNfYXJyYXkocGFyZW50KSB0aGVuCiAgICBpZiBrZXkgPT0gJy0nIHRoZW4gcGFyZW50WyNwYXJlbnQrMV0gPSBkZWVwX2NvcHkodmFsKQogICAgZWxzZQogICAgICBsb2NhbCBpZHggPSB0b251bWJlcihrZXkpCiAgICAgIGlmIG5vdCBpZHggdGhlbiBlcnJvcignYmFkIGFycmF5IGluZGV4ICInLi5rZXkuLiciJykgZW5kCiAgICAgIGlmIGlkeCA8IDAgb3IgaWR4ID4gI3BhcmVudCB0aGVuIGVycm9yKCdpbmRleCBvdXQgb2YgYm91bmRzJykgZW5kCiAgICAgIGZvciBpID0gI3BhcmVudCwgaWR4LCAtMSBkbyBwYXJlbnRbaSsxXSA9IHBhcmVudFtpXSBlbmQgICAtLSBpZHggMC1iYXNlZO+8jOaPkuWFpeS9jSA9IGlkeCsxCiAgICAgIHBhcmVudFtpZHgrMV0gPSBkZWVwX2NvcHkodmFsKQogICAgZW5kCiAgZWxzZQogICAgcGFyZW50W2tleV0gPSBkZWVwX2NvcHkodmFsKQogIGVuZAogIHJldHVybiBkb2MKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9yZW1vdmUoZG9jLCBwdHIpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgaWYgI3Rva2VucyA9PSAwIHRoZW4gZXJyb3IoJ2Nhbm5vdCByZW1vdmUgd2hvbGUgZG9jdW1lbnQnKSBlbmQKICBsb2NhbCBwYXJlbnQsIGtleSA9IHJlc29sdmVfcGFyZW50KGRvYywgdG9rZW5zKQogIGlmIGlzX2FycmF5KHBhcmVudCkgdGhlbgogICAgbG9jYWwgaWR4ID0gdG9udW1iZXIoa2V5KQogICAgaWYgbm90IGlkeCBvciBpZHggPCAwIG9yIGlkeCA+PSAjcGFyZW50IHRoZW4gZXJyb3IoJ2JhZCBpbmRleCAiJy4ua2V5Li4nIicpIGVuZAogICAgZm9yIGkgPSBpZHggKyAxLCAjcGFyZW50IC0gMSBkbyBwYXJlbnRbaV0gPSBwYXJlbnRbaSsxXSBlbmQKICAgIHBhcmVudFsjcGFyZW50XSA9IG5pbAogIGVsc2UKICAgIGlmIHBhcmVudFtrZXldID09IG5pbCB0aGVuIGVycm9yKCdrZXkgbm90IGZvdW5kICInLi5rZXkuLiciJykgZW5kCiAgICBwYXJlbnRba2V5XSA9IG5pbAogIGVuZAogIHJldHVybiBkb2MKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9yZXBsYWNlKGRvYywgcHRyLCB2YWwpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgaWYgI3Rva2VucyA9PSAwIHRoZW4gcmV0dXJuIGRlZXBfY29weSh2YWwpIGVuZAogIGxvY2FsIHBhcmVudCwga2V5ID0gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgaWYgaXNfYXJyYXkocGFyZW50KSB0aGVuCiAgICBsb2NhbCBpZHggPSB0b251bWJlcihrZXkpCiAgICBpZiBub3QgaWR4IG9yIGlkeCA8IDAgb3IgaWR4ID49ICNwYXJlbnQgdGhlbiBlcnJvcignaW5kZXggbm90IGZvdW5kICInLi5rZXkuLiciJykgZW5kCiAgICBwYXJlbnRbaWR4KzFdID0gZGVlcF9jb3B5KHZhbCkKICBlbHNlCiAgICBpZiBwYXJlbnRba2V5XSA9PSBuaWwgdGhlbiBlcnJvcigna2V5IG5vdCBmb3VuZCAiJy4ua2V5Li4nIicpIGVuZAogICAgcGFyZW50W2tleV0gPSBkZWVwX2NvcHkodmFsKQogIGVuZAogIHJldHVybiBkb2MKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF90ZXN0KGRvYywgcHRyLCB2YWwpCiAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aChwdHIpCiAgbG9jYWwgdiA9ICgjdG9rZW5zID09IDApIGFuZCBkb2Mgb3IgZ2V0X2F0KGRvYywgdG9rZW5zKQogIHJldHVybiBkZWVwX2VxKHYsIHZhbCkKZW5kCgpsb2NhbCBmdW5jdGlvbiBvcF9tb3ZlKGRvYywgZnJvbSwgcHRyKQogIGxvY2FsIGZ0b2tlbnMgPSBzcGxpdF9wYXRoKGZyb20pCiAgbG9jYWwgdmFsID0gKCNmdG9rZW5zID09IDApIGFuZCBkZWVwX2NvcHkoZG9jKSBvciBkZWVwX2NvcHkoZ2V0X2F0KGRvYywgZnRva2VucykpCiAgbG9jYWwgbmV3ZG9jID0gb3BfcmVtb3ZlKGRvYywgZnJvbSkKICByZXR1cm4gb3BfYWRkKG5ld2RvYywgcHRyLCB2YWwpCmVuZAoKbG9jYWwgZnVuY3Rpb24gb3BfY29weShkb2MsIGZyb20sIHB0cikKICBsb2NhbCBmdG9rZW5zID0gc3BsaXRfcGF0aChmcm9tKQogIGxvY2FsIHZhbCA9ICgjZnRva2VucyA9PSAwKSBhbmQgZGVlcF9jb3B5KGRvYykgb3IgZGVlcF9jb3B5KGdldF9hdChkb2MsIGZ0b2tlbnMpKQogIHJldHVybiBvcF9hZGQoZG9jLCBwdHIsIHZhbCkKZW5kCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIGRpZmbvvIhhIOKGkiBiIOeahCBSRkMgNjkwMiBwYXRjaO+8m+mdnuacgOWwj+S9huato+ehru+8iQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCmxvY2FsIGZ1bmN0aW9uIGVzY19wdHIocykKICByZXR1cm4gczpnc3ViKCd+JywnfjAnKTpnc3ViKCcvJywnfjEnKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGRpZmYoYSwgYiwgcGF0aCkKICBsb2NhbCBwYXRjaCA9IHt9CiAgaWYgZGVlcF9lcShhLCBiKSB0aGVuIHJldHVybiBwYXRjaCBlbmQKICBpZiB0eXBlKGEpIH49ICd0YWJsZScgb3IgdHlwZShiKSB+PSAndGFibGUnIG9yCiAgICAgKHR5cGUoYSl+PSd0YWJsZScpIG9yICh0eXBlKGIpfj0ndGFibGUnKSB0aGVuCiAgICB0YWJsZS5pbnNlcnQocGF0Y2gsIHtvcD0ncmVwbGFjZScsIHBhdGg9cGF0aCwgdmFsdWU9ZGVlcF9jb3B5KGIpfSkKICAgIHJldHVybiBwYXRjaAogIGVuZAogIGlmIGlzX2FycmF5KGEpIGFuZCBpc19hcnJheShiKSB0aGVuCiAgICBpZiAjYSB+PSAjYiB0aGVuCiAgICAgIHRhYmxlLmluc2VydChwYXRjaCwge29wPSdyZXBsYWNlJywgcGF0aD1wYXRoLCB2YWx1ZT1kZWVwX2NvcHkoYil9KQogICAgZWxzZQogICAgICBmb3IgaSA9IDEsICNhIGRvCiAgICAgICAgbG9jYWwgc3ViID0gZGlmZihhW2ldLCBiW2ldLCBwYXRoIC4uICcvJyAuLiAoaS0xKSkKICAgICAgICBmb3IgXywgbyBpbiBpcGFpcnMoc3ViKSBkbyBwYXRjaFsjcGF0Y2grMV0gPSBvIGVuZAogICAgICBlbmQKICAgIGVuZAogICAgcmV0dXJuIHBhdGNoCiAgZW5kCiAgbG9jYWwgc2VlbiA9IHt9CiAgZm9yIGssIHYgaW4gcGFpcnMoYSkgZG8KICAgIGxvY2FsIHAgPSBwYXRoIC4uICcvJyAuLiBlc2NfcHRyKHRvc3RyaW5nKGspKQogICAgaWYgYltrXSA9PSBuaWwgdGhlbgogICAgICB0YWJsZS5pbnNlcnQocGF0Y2gsIHtvcD0ncmVtb3ZlJywgcGF0aD1wfSkKICAgIGVsc2UKICAgICAgbG9jYWwgc3ViID0gZGlmZih2LCBiW2tdLCBwKQogICAgICBmb3IgXywgbyBpbiBpcGFpcnMoc3ViKSBkbyBwYXRjaFsjcGF0Y2grMV0gPSBvIGVuZAogICAgICBzZWVuW2tdID0gdHJ1ZQogICAgZW5kCiAgZW5kCiAgZm9yIGssIHYgaW4gcGFpcnMoYikgZG8KICAgIGlmIG5vdCBzZWVuW2tdIHRoZW4KICAgICAgdGFibGUuaW5zZXJ0KHBhdGNoLCB7b3A9J2FkZCcsIHBhdGg9cGF0aCAuLiAnLycgLi4gZXNjX3B0cih0b3N0cmluZyhrKSksIHZhbHVlPWRlZXBfY29weSh2KX0pCiAgICBlbmQKICBlbmQKICByZXR1cm4gcGF0Y2gKZW5kCgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIOWFpeWPowotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAneyJlcnJvciI6ImJhZCBpbnB1dCJ9JyBlbmQKICBsb2NhbCBvcCA9IHAub3AKCiAgbG9jYWwgZnVuY3Rpb24gamRlYyhzKQogICAgbG9jYWwgb2ssIHYgPSBwY2FsbChqcC5kZWNvZGUsIHRvc3RyaW5nKHMpKQogICAgaWYgbm90IG9rIHRoZW4gcmV0dXJuIG5pbCwgdG9zdHJpbmcodikgZW5kCiAgICByZXR1cm4gdgogIGVuZAogIGxvY2FsIGZ1bmN0aW9uIGVycmoobXNnKSByZXR1cm4gJ3siZXJyb3IiOicgLi4gZW5jX3N0cih0b3N0cmluZyhtc2cpKSAuLiAnfScgZW5kCgogIGxvY2FsIGRvYywgZGVyciA9IGpkZWMocC5kb2MpCiAgaWYgcC5kb2Mgfj0gbmlsIGFuZCBkZXJyIHRoZW4gcmV0dXJuIGVycmooJ2RvYyBub3QgdmFsaWQganNvbjogJyAuLiBkZXJyKSBlbmQKICBpZiBkb2MgPT0gbmlsIHRoZW4gZG9jID0ge30gZW5kCgogIGlmIG9wID09ICdhcHBseScgdGhlbgogICAgbG9jYWwgcGF0Y2gsIHBlcnIgPSBqZGVjKHAucGF0Y2gpCiAgICBpZiBwZXJyIHRoZW4gcmV0dXJuIGVycmooJ3BhdGNoIG5vdCB2YWxpZCBqc29uOiAnIC4uIHBlcnIpIGVuZAogICAgaWYgbm90IGlzX2FycmF5KHBhdGNoKSB0aGVuIHJldHVybiBlcnJqKCdwYXRjaCBtdXN0IGJlIGFuIGFycmF5JykgZW5kCiAgICBmb3IgaSwgbyBpbiBpcGFpcnMocGF0Y2gpIGRvCiAgICAgIGlmIHR5cGUobykgfj0gJ3RhYmxlJyBvciBvLm9wID09IG5pbCB0aGVuIHJldHVybiBlcnJqKCdiYWQgb3AgYXQgJy4uaSkgZW5kCiAgICAgIGxvY2FsIG9rLCByZXMgPSBwY2FsbChmdW5jdGlvbigpCiAgICAgICAgaWYgby5vcCA9PSAnYWRkJyB0aGVuIGRvYyA9IG9wX2FkZChkb2MsIG8ucGF0aCwgby52YWx1ZSkKICAgICAgICBlbHNlaWYgby5vcCA9PSAncmVtb3ZlJyB0aGVuIGRvYyA9IG9wX3JlbW92ZShkb2MsIG8ucGF0aCkKICAgICAgICBlbHNlaWYgby5vcCA9PSAncmVwbGFjZScgdGhlbiBkb2MgPSBvcF9yZXBsYWNlKGRvYywgby5wYXRoLCBvLnZhbHVlKQogICAgICAgIGVsc2VpZiBvLm9wID09ICd0ZXN0JyB0aGVuCiAgICAgICAgICBpZiBub3Qgb3BfdGVzdChkb2MsIG8ucGF0aCwgby52YWx1ZSkgdGhlbiBlcnJvcigndGVzdCBmYWlsZWQgYXQgIicuLnRvc3RyaW5nKG8ucGF0aCkuLiciKScpIGVuZAogICAgICAgIGVsc2VpZiBvLm9wID09ICdtb3ZlJyB0aGVuCiAgICAgICAgICBsb2NhbCBmdCA9IHNwbGl0X3BhdGgoby5mcm9tKQogICAgICAgICAgbG9jYWwgdmFsID0gKCNmdD09MCkgYW5kIGRlZXBfY29weShkb2MpIG9yIGRlZXBfY29weShnZXRfYXQoZG9jLCBmdCkpCiAgICAgICAgICBkb2MgPSBvcF9yZW1vdmUoZG9jLCBvLmZyb20pCiAgICAgICAgICBkb2MgPSBvcF9hZGQoZG9jLCBvLnRvLCB2YWwpCiAgICAgICAgZWxzZWlmIG8ub3AgPT0gJ2NvcHknIHRoZW4gZG9jID0gb3BfY29weShkb2MsIG8uZnJvbSwgby50bykKICAgICAgICBlbHNlIGVycm9yKCd1bmtub3duIG9wICInLi50b3N0cmluZyhvLm9wKS4uJyInKSBlbmQKICAgICAgZW5kKQogICAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gZXJyaignb3AgJy4uaS4uJyAoJy4udG9zdHJpbmcoby5vcCkuLicpIGZhaWxlZDogJy4udG9zdHJpbmcocmVzKSkgZW5kCiAgICBlbmQKICAgIHJldHVybiBqcC5lbmNvZGUoZG9jKQogIGVsc2VpZiBvcCA9PSAnZ2V0JyB0aGVuCiAgICBsb2NhbCBvaywgdiA9IHBjYWxsKGZ1bmN0aW9uKCkKICAgICAgbG9jYWwgdG9rZW5zID0gc3BsaXRfcGF0aCh0b3N0cmluZyhwLnBhdGgpKQogICAgICByZXR1cm4gKCN0b2tlbnMgPT0gMCkgYW5kIGRvYyBvciBnZXRfYXQoZG9jLCB0b2tlbnMpCiAgICBlbmQpCiAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gZXJyaih0b3N0cmluZyh2KSkgZW5kCiAgICByZXR1cm4ganAuZW5jb2RlKHYpCiAgZWxzZWlmIG9wID09ICdzZXQnIHRoZW4KICAgIGxvY2FsIHZhbCwgdmVyciA9IGpkZWMocC52YWx1ZSkKICAgIGlmIHZlcnIgdGhlbiByZXR1cm4gZXJyaigndmFsdWUgbm90IHZhbGlkIGpzb246ICcgLi4gdmVycikgZW5kCiAgICBsb2NhbCBvaywgcmVzID0gcGNhbGwoZnVuY3Rpb24oKQogICAgICBsb2NhbCB0b2tlbnMgPSBzcGxpdF9wYXRoKHRvc3RyaW5nKHAucGF0aCkpCiAgICAgIGlmICN0b2tlbnMgPT0gMCB0aGVuIGRvYyA9IGRlZXBfY29weSh2YWwpOyByZXR1cm4gZW5kCiAgICAgIGxvY2FsIHBhcmVudCwga2V5ID0gcmVzb2x2ZV9wYXJlbnQoZG9jLCB0b2tlbnMpCiAgICAgIGlmIGlzX2FycmF5KHBhcmVudCkgdGhlbgogICAgICAgIGxvY2FsIGlkeCA9IHRvbnVtYmVyKGtleSkKICAgICAgICBpZiBub3QgaWR4IG9yIGlkeCA8IDAgb3IgaWR4ID49ICNwYXJlbnQgdGhlbiBlcnJvcignYmFkIGFycmF5IGluZGV4JykgZW5kCiAgICAgICAgcGFyZW50W2lkeCsxXSA9IGRlZXBfY29weSh2YWwpCiAgICAgIGVsc2UKICAgICAgICBwYXJlbnRba2V5XSA9IGRlZXBfY29weSh2YWwpCiAgICAgIGVuZAogICAgZW5kKQogICAgaWYgbm90IG9rIHRoZW4gcmV0dXJuIGVycmoodG9zdHJpbmcocmVzKSkgZW5kCiAgICByZXR1cm4ganAuZW5jb2RlKGRvYykKICBlbHNlaWYgb3AgPT0gJ3Rlc3QnIHRoZW4KICAgIGxvY2FsIHZhbCwgdmVyciA9IGpkZWMocC52YWx1ZSkKICAgIGlmIHZlcnIgdGhlbiByZXR1cm4gZXJyaigndmFsdWUgbm90IHZhbGlkIGpzb246ICcgLi4gdmVycikgZW5kCiAgICBsb2NhbCBvaywgZXEgPSBwY2FsbChmdW5jdGlvbigpCiAgICAgIGxvY2FsIHRva2VucyA9IHNwbGl0X3BhdGgodG9zdHJpbmcocC5wYXRoKSkKICAgICAgbG9jYWwgdiA9ICgjdG9rZW5zID09IDApIGFuZCBkb2Mgb3IgZ2V0X2F0KGRvYywgdG9rZW5zKQogICAgICByZXR1cm4gZGVlcF9lcSh2LCB2YWwpCiAgICBlbmQpCiAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gZXJyaih0b3N0cmluZyhlcSkpIGVuZAogICAgcmV0dXJuIChlcSBhbmQgJ3RydWUnIG9yICdmYWxzZScpCiAgZWxzZWlmIG9wID09ICdkaWZmJyB0aGVuCiAgICBsb2NhbCBhLCBhZXJyID0gamRlYyhwLmEpCiAgICBsb2NhbCBiLCBiZXJyID0gamRlYyhwLmIpCiAgICBpZiBhZXJyIHRoZW4gcmV0dXJuIGVycmooJ2Egbm90IHZhbGlkIGpzb246ICcgLi4gYWVycikgZW5kCiAgICBpZiBiZXJyIHRoZW4gcmV0dXJuIGVycmooJ2Igbm90IHZhbGlkIGpzb246ICcgLi4gYmVycikgZW5kCiAgICBpZiBhID09IG5pbCB0aGVuIGEgPSB7fSBlbmQKICAgIGlmIGIgPT0gbmlsIHRoZW4gYiA9IHt9IGVuZAogICAgbG9jYWwgcGF0Y2ggPSBkaWZmKGEsIGIsICcnKQogICAgcmV0dXJuIGpwLmVuY29kZShwYXRjaCkKICBlbmQKICByZXR1cm4gJ3siZXJyb3IiOiJ1bmtub3duIG9wIn0nCmVuZAoKcmV0dXJuIGZ1bmN0aW9uKHApCiAgcmV0dXJuIHJ1bihwKQplbmQKAC0tIEBsaWI6IG1hcmtkb3duCi0tIEBjYXRlZ29yeTogcGFyc2VyCi0tIEBkZXNjOiBNYXJrZG93biDnu5PmnoTmj5Dlj5bvvIjnuq8gTHVh77yM6Ieq5YyF5ZCr77yJ4oCU4oCU5LuOIC5tZCDmlofmnKzmir3nu5PmnoTljJblhYPntKDvvIwKLS0gICAgICAg6L+U5ZueIEpTT04g5pWw57uEL+Wvueixoe+8iOmFjSBqc29uX2V4dHJhY3QgLyBqc29uIOWxleW8gO+8ieOAguS4jea4suafkyBIVE1M77yM5Y+q5YGa57uT5p6E6Kej5p6Q44CCCi0tICAgICAgIG9wIOmAiemhue+8mgotLSAgICAgICAgICd0b2MnICAgICAg4oaSIFt7bGV2ZWwsIHRleHQsIGxpbmV9XSAg5qCH6aKY55uu5b2VCi0tICAgICAgICAgJ2xpbmtzJyAgICDihpIgW3t0ZXh0LCBocmVmfV0gICAgICAgICDooYzlhoXpk77mjqUgW3RleHRdKHVybCkgKyDlm77niYcgIVsuLl0odXJsKQotLSAgICAgICAgICdjb2RlJyAgICAg4oaSIFt7bGFuZywgdGV4dCwgbGluZX1dICAg5Zu05qCP5Luj56CB5Z2XIGBgYGxhbmcgLi4uIGBgYAotLSAgICAgICAgICdsaXN0cycgICAg4oaSIFt7b3JkZXJlZCwgaW5kZW50LCB0ZXh0fV0gIOWIl+ihqOmhuQotLSAgICAgICAgICdxdW90ZXMnICAg4oaSIFt7dGV4dH1dICAgICAgICAgICAgICAg5byV55So5Z2XID4gLi4uCi0tICAgICAgICAgJ3N0YXRzJyAgICDihpIge2hlYWRpbmdzLCBsaW5rcywgY29kZSwgbGlzdHMsIHF1b3RlcywgbGluZXN9ICDorqHmlbAKLS0gICAgICAgICAncGxhaW4nICAgIOKGkiDnuq/mlofmnKzvvIjljrvlhajpg6ggbWFya2Rvd24g5qCH6K6w77yJCi0tICAgICAgIOS7o+eggeWdl+WGheWuueWFiOiiqyLmiqDlh7oi77yM5YW25Lit55qEICMvW10vLSDkuI3kvJrooqvor6/liKTkuLrmoIfpopgv6ZO+5o6lL+WIl+ihqOOAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yM6Ieq5YyF5ZCr5peg5aSW6YOo5L6d6LWW77yJCi0tIEByZXF1aXJlczog5pegCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J21hcmtkb3duJyk7Ci0tICAgdG9jOiAgICAgIFNFTEVDVCBsdWFqaXRfcygnbWFya2Rvd24nLCB7djogbWQsIG9wOiAndG9jJ30pOwotLSAgIOaKvSB1cmw6ICAgU0VMRUNUIGpzb25fZXh0cmFjdChsdWFqaXRfcygnbWFya2Rvd24nLCB7djo9bSwgb3A6PSdsaW5rcyd9KSwgJyRbMF0uaHJlZicpOwotLSAgIOe7n+iuoTogICAgIFNFTEVDVCBqc29uX2V4dHJhY3QobHVhaml0X3MoJ21hcmtkb3duJywge3Y6PW0sIG9wOj0nc3RhdHMnfSksICckLmhlYWRpbmdzJyk7CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEpTT04g57yW56CB77yI6Ieq5YyF5ZCr77yM5LiOIHRvbWxpbmkg5ZCM6aOO5qC877yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHRvc3RyaW5nKHMpOmdzdWIoJyhbXFxcIlxuXHRccl0pJywgZnVuY3Rpb24oYykKICAgIGlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcgZWxzZWlmIGMgPT0gJyInIHRoZW4gcmV0dXJuICdcXCInCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicgZWxzZSByZXR1cm4gYyBlbmQKICBlbmQpKQplbmQKCmxvY2FsIFQgPSB7fQpmdW5jdGlvbiBULmVuY29kZSh2KQogIGxvY2FsIHQgPSB0eXBlKHYpCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogIGlmIHQgPT0gJ2Jvb2xlYW4nIHRoZW4gcmV0dXJuIHRvc3RyaW5nKHYpIGVuZAogIGlmIHQgPT0gJ251bWJlcicgdGhlbgogICAgaWYgdiAlIDEgPT0gMCBhbmQgbWF0aC5hYnModikgPCAxZTE1IHRoZW4gcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVkJywgdikgZW5kCiAgICByZXR1cm4gdG9zdHJpbmcodikKICBlbmQKICBpZiB0ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICciJyAuLiBqc29uX2VzY2FwZSh2KSAuLiAnIicgZW5kCiAgaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGxvY2FsIGlzYXJyLCBuID0gdHJ1ZSwgMAogICAgZm9yIGsgaW4gcGFpcnModikgZG8KICAgICAgbiA9IG4gKyAxCiAgICAgIGlmIHR5cGUoaykgfj0gJ251bWJlcicgdGhlbiBpc2FyciA9IGZhbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgICBpZiBpc2FyciBhbmQgbiA9PSAjdiB0aGVuCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIGkgPSAxLCAjdiBkbyBwYXJ0c1sjcGFydHMgKyAxXSA9IFQuZW5jb2RlKHZbaV0pIGVuZAogICAgICByZXR1cm4gJ1snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnXScKICAgIGVuZAogICAgbG9jYWwgcGFydHMgPSB7fQogICAgZm9yIGssIHZhbCBpbiBwYWlycyh2KSBkbwogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9ICciJyAuLiBqc29uX2VzY2FwZSh0b3N0cmluZyhrKSkgLi4gJyI6JyAuLiBULmVuY29kZSh2YWwpCiAgICBlbmQKICAgIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOihjOW3peWFtwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHRyaW0ocykgcmV0dXJuICh0b3N0cmluZyhzKTpnc3ViKCdeJXMqJywgJycpOmdzdWIoJyVzKiQnLCAnJykpIGVuZAoKLS0g56iz5YGl5oyJ5Y2V5a2X56ymIHNwbGl0CmxvY2FsIGZ1bmN0aW9uIHRleHRfc3BsaXQocywgYykKICBsb2NhbCBvdXQsIHN0YXJ0ID0ge30sIDEKICB3aGlsZSB0cnVlIGRvCiAgICBsb2NhbCBpID0gczpmaW5kKGMsIHN0YXJ0LCB0cnVlKQogICAgaWYgbm90IGkgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gczpzdWIoc3RhcnQpCiAgICAgIGJyZWFrCiAgICBlbmQKICAgIG91dFsjb3V0ICsgMV0gPSBzOnN1YihzdGFydCwgaSAtIDEpCiAgICBzdGFydCA9IGkgKyAxCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCi0tIOWOu+aOieihjOWGhSBtYXJrZG93biDmoLzlvI/vvIzkv53nlZnlj6/or7vmlofmnKwKbG9jYWwgZnVuY3Rpb24gc3RyaXBfaW5saW5lKHMpCiAgcyA9IHM6Z3N1YignISVbJywgJ1snKSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tIOWbvueJh+agh+iusCDihpIg6ZO+5o6lCiAgcyA9IChzOmdzdWIoJyUqJSooW14lKl0rKSUqJSonLCAnJTEnKSkgICAgICAgICAgICAgIC0tICoqYm9sZCoqCiAgcyA9IChzOmdzdWIoJ19fKFteX10rKV9fJywgJyUxJykpICAgICAgICAgICAgICAgICAgIC0tIF9fYm9sZF9fCiAgcyA9IChzOmdzdWIoJ2ArKFteYF0rKWArJywgJyUxJykpICAgICAgICAgICAgICAgICAgIC0tIGBjb2RlYAogIHMgPSAoczpnc3ViKCd+fihbXn5dKyl+ficsICclMScpKSAgICAgICAgICAgICAgICAgICAtLSB+fmRlbH5+CiAgcyA9IChzOmdzdWIoJyVbKFteJV1dKiklXSUoKFteKV0qKSUpJywgJyUxJykpICAgICAgIC0tIFt0ZXh0XSh1cmwpIOKGkiB0ZXh0CiAgcyA9IHM6Z3N1YignXiVzKiMrJXMqJywgJycpICAgICAgICAgICAgICAgICAgICAgICAgIC0tIOaui+eVmSAjCiAgcyA9IHM6Z3N1YignXiVzKj4lcyonLCAnJykgICAgICAgICAgICAgICAgICAgICAgICAgIC0tIOaui+eVmSA+CiAgcmV0dXJuIHRyaW0ocykKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOino+aekO+8muaLhuaIkCAo5pmu6YCa6KGM5bim6KGM5Y+3ICsgaW5fY29kZSDmoIforrAsIOWbtOagj+S7o+eggeWdlykKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBwYXJzZSh0ZXh0KQogIGxvY2FsIGNvZGVfYmxvY2tzLCBsaW5lcyA9IHt9LCB7fQogIGxvY2FsIGluX2NvZGUsIGJ1ZiwgbGFuZywgc3RhcnRfbGluZSA9IGZhbHNlLCBuaWwsICcnLCAwCiAgZm9yIGksIHJhdyBpbiBpcGFpcnModGV4dF9zcGxpdCh0ZXh0LCAnXG4nKSkgZG8KICAgIGxvY2FsIGxpbmUgPSByYXc6Z3N1YignXHIkJywgJycpICAgLS0gQ1JMRiDihpIgTEYKICAgIGlmIGluX2NvZGUgdGhlbgogICAgICBpZiBsaW5lOm1hdGNoKCdeJXMqYGBgJykgb3IgbGluZTptYXRjaCgnXiVzKn5+ficpIHRoZW4KICAgICAgICBjb2RlX2Jsb2Nrc1sjY29kZV9ibG9ja3MgKyAxXSA9IHsKICAgICAgICAgIGxhbmcgPSBsYW5nLCB0ZXh0ID0gdGFibGUuY29uY2F0KGJ1ZiwgJ1xuJyksIGxpbmUgPSBzdGFydF9saW5lLAogICAgICAgIH0KICAgICAgICBpbl9jb2RlID0gZmFsc2UKICAgICAgZWxzZQogICAgICAgIGJ1ZlsjYnVmICsgMV0gPSBsaW5lCiAgICAgIGVuZAogICAgICBsaW5lc1sjbGluZXMgKyAxXSA9IHsgbm8gPSBpLCB0ZXh0ID0gbGluZSwgaW5fY29kZSA9IHRydWUgfQogICAgZWxzZQogICAgICBsb2NhbCBmZW5jZSA9IGxpbmU6bWF0Y2goJ14lcypgYGAoLiopJCcpIG9yIGxpbmU6bWF0Y2goJ14lcyp+fn4oLiopJCcpCiAgICAgIGlmIGZlbmNlIHRoZW4KICAgICAgICBpbl9jb2RlLCBsYW5nLCBidWYsIHN0YXJ0X2xpbmUgPSB0cnVlLCB0cmltKGZlbmNlKSwge30sIGkKICAgICAgICBsaW5lc1sjbGluZXMgKyAxXSA9IHsgbm8gPSBpLCB0ZXh0ID0gbGluZSwgaW5fY29kZSA9IHRydWUgfQogICAgICBlbHNlCiAgICAgICAgbGluZXNbI2xpbmVzICsgMV0gPSB7IG5vID0gaSwgdGV4dCA9IGxpbmUgfQogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGlmIGluX2NvZGUgYW5kIGJ1ZiB0aGVuCiAgICBjb2RlX2Jsb2Nrc1sjY29kZV9ibG9ja3MgKyAxXSA9IHsKICAgICAgbGFuZyA9IGxhbmcsIHRleHQgPSB0YWJsZS5jb25jYXQoYnVmLCAnXG4nKSwgbGluZSA9IHN0YXJ0X2xpbmUsCiAgICB9CiAgZW5kCiAgcmV0dXJuIGxpbmVzLCBjb2RlX2Jsb2NrcwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5ZCEIG9wIOaPkOWPluWZqO+8iOWdh+i3s+i/hyBpbl9jb2RlIOihjO+8jOmBv+WFjeaKiuS7o+eggeWGheWuueivr+WIpOS4uue7k+aehO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3RfdG9jKGxpbmVzKQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIF8sIGwgaW4gaXBhaXJzKGxpbmVzKSBkbwogICAgaWYgbm90IGwuaW5fY29kZSB0aGVuCiAgICAgIGxvY2FsIGhhc2hlcywgdGV4dCA9IGwudGV4dDptYXRjaCgnXigjKyklcysoLiopJCcpCiAgICAgIGlmIGhhc2hlcyB0aGVuCiAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHsgbGV2ZWwgPSAjaGFzaGVzLCB0ZXh0ID0gc3RyaXBfaW5saW5lKHRleHQpLCBsaW5lID0gbC5ubyB9CiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3RfbGlua3MobGluZXMpCiAgbG9jYWwgb3V0LCBzZWVuID0ge30sIHt9CiAgZm9yIF8sIGwgaW4gaXBhaXJzKGxpbmVzKSBkbwogICAgaWYgbm90IGwuaW5fY29kZSB0aGVuCiAgICAgIGZvciB0ZXh0LCBocmVmIGluIGwudGV4dDpnbWF0Y2goJyVbKFteJV1dKiklXSUoKFteKV0rKSUpJykgZG8KICAgICAgICBocmVmID0gdHJpbShocmVmKQogICAgICAgIGlmIGhyZWYgfj0gJycgYW5kIG5vdCBzZWVuW2hyZWZdIHRoZW4KICAgICAgICAgIHNlZW5baHJlZl0gPSB0cnVlCiAgICAgICAgICBvdXRbI291dCArIDFdID0geyB0ZXh0ID0gc3RyaXBfaW5saW5lKHRleHQpLCBocmVmID0gaHJlZiB9CiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3RfbGlzdHMobGluZXMpCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgXywgbCBpbiBpcGFpcnMobGluZXMpIGRvCiAgICBpZiBub3QgbC5pbl9jb2RlIHRoZW4KICAgICAgbG9jYWwgc3AgPSBsLnRleHQ6bWF0Y2goJ14oJXMqKScpCiAgICAgIGxvY2FsIG9yZGVyZWQsIGl0ZW0gPSBsLnRleHQ6bWF0Y2goJ14lcyooJWQrKVsuKV1bIFx0XSsoLiopJCcpCiAgICAgIGlmIGl0ZW0gdGhlbgogICAgICAgIG91dFsjb3V0ICsgMV0gPSB7IG9yZGVyZWQgPSB0cnVlLCBpbmRlbnQgPSAjc3AsIHRleHQgPSBzdHJpcF9pbmxpbmUoaXRlbSkgfQogICAgICBlbHNlCiAgICAgICAgbG9jYWwgaXRlbTIgPSBsLnRleHQ6bWF0Y2goJ14lcypbLSorXVsgXHRdKyguKikkJykKICAgICAgICBpZiBpdGVtMiB0aGVuCiAgICAgICAgICBvdXRbI291dCArIDFdID0geyBvcmRlcmVkID0gZmFsc2UsIGluZGVudCA9ICNzcCwgdGV4dCA9IHN0cmlwX2lubGluZShpdGVtMikgfQogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiBleHRyYWN0X3F1b3RlcyhsaW5lcykKICBsb2NhbCBvdXQgPSB7fQogIGZvciBfLCBsIGluIGlwYWlycyhsaW5lcykgZG8KICAgIGlmIG5vdCBsLmluX2NvZGUgdGhlbgogICAgICBsb2NhbCBxID0gbC50ZXh0Om1hdGNoKCdeJXMqPitbJXNdKiguKikkJykKICAgICAgaWYgcSB0aGVuCiAgICAgICAgbG9jYWwgdCA9IHN0cmlwX2lubGluZShxKQogICAgICAgIGlmIHQgfj0gJycgdGhlbiBvdXRbI291dCArIDFdID0geyB0ZXh0ID0gdCB9IGVuZAogICAgICBlbmQKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiBleHRyYWN0X3BsYWluKGxpbmVzKQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIF8sIGwgaW4gaXBhaXJzKGxpbmVzKSBkbwogICAgaWYgbm90IGwuaW5fY29kZSB0aGVuCiAgICAgIGxvY2FsIHMgPSBsLnRleHQKICAgICAgcyA9IHM6Z3N1YignXiVzKmBgYC4qJCcsICcnKSAgICAgICAgICAgICAgICAgICAgIC0tIOWbtOagj+ihjAogICAgICBzID0gczpnc3ViKCdeJXMqIyslcyonLCAnJykgICAgICAgICAgICAgICAgICAgICAgLS0g5qCH6aKYICMKICAgICAgcyA9IHM6Z3N1YignXiVzKj4rWyVzXSonLCAnJykgICAgICAgICAgICAgICAgICAgIC0tIOW8leeUqAogICAgICBzID0gczpnc3ViKCdeJXMqJWQrWy4pXVsgXHRdKycsICcnKSAgICAgICAgICAgICAgLS0g5pyJ5bqP5bqP5Y+3CiAgICAgIHMgPSBzOmdzdWIoJ14lcypbLSorXVsgXHRdKycsICcnKSAgICAgICAgICAgICAgICAtLSDml6Dluo/nrKYKICAgICAgcyA9IChzOmdzdWIoJyVbKFteJV1dKiklXSUoKFteKV0qKSUpJywgJyUxJykpICAgIC0tIOmTvuaOpSDihpIg5paH5pysCiAgICAgIHMgPSBzdHJpcF9pbmxpbmUocykKICAgICAgb3V0WyNvdXQgKyAxXSA9IHMKICAgIGVuZAogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQob3V0LCAnXG4nKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGV4dHJhY3Rfc3RhdHMobGluZXMsIGNvZGVfYmxvY2tzKQogIHJldHVybiB7CiAgICBoZWFkaW5ncyA9ICNleHRyYWN0X3RvYyhsaW5lcyksCiAgICBsaW5rcyA9ICNleHRyYWN0X2xpbmtzKGxpbmVzKSwKICAgIGNvZGUgPSAjY29kZV9ibG9ja3MsCiAgICBsaXN0cyA9ICNleHRyYWN0X2xpc3RzKGxpbmVzKSwKICAgIHF1b3RlcyA9ICNleHRyYWN0X3F1b3RlcyhsaW5lcyksCiAgICBsaW5lcyA9ICNsaW5lcywKICB9CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJ1tdJyBlbmQKICBsb2NhbCB0ZXh0ID0gcC52IG9yICcnCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdzdGF0cycKICBsb2NhbCBsaW5lcywgY29kZV9ibG9ja3MgPSBwYXJzZSh0ZXh0KQoKICBpZiBvcCA9PSAndG9jJyB0aGVuIHJldHVybiBULmVuY29kZShleHRyYWN0X3RvYyhsaW5lcykpCiAgZWxzZWlmIG9wID09ICdsaW5rcycgdGhlbiByZXR1cm4gVC5lbmNvZGUoZXh0cmFjdF9saW5rcyhsaW5lcykpCiAgZWxzZWlmIG9wID09ICdjb2RlJyB0aGVuIHJldHVybiBULmVuY29kZShjb2RlX2Jsb2NrcykKICBlbHNlaWYgb3AgPT0gJ2xpc3RzJyB0aGVuIHJldHVybiBULmVuY29kZShleHRyYWN0X2xpc3RzKGxpbmVzKSkKICBlbHNlaWYgb3AgPT0gJ3F1b3RlcycgdGhlbiByZXR1cm4gVC5lbmNvZGUoZXh0cmFjdF9xdW90ZXMobGluZXMpKQogIGVsc2VpZiBvcCA9PSAncGxhaW4nIHRoZW4gcmV0dXJuIGV4dHJhY3RfcGxhaW4obGluZXMpCiAgZWxzZWlmIG9wID09ICdzdGF0cycgdGhlbiByZXR1cm4gVC5lbmNvZGUoZXh0cmFjdF9zdGF0cyhsaW5lcywgY29kZV9ibG9ja3MpKQogIGVuZAogIHJldHVybiAnW10nCmVuZAoKcmV0dXJuIGZ1bmN0aW9uKHApCiAgcmV0dXJuIHJ1bihwKQplbmQKAC0tIEBsaWI6IGVudGl0eQotLSBAY2F0ZWdvcnk6IGVudGl0eQotLSBAZGVzYzog5a6e5L2T6Kej5p6QL+iusOW9lemTvuaOpeeuoemBk++8iOe6ryBMdWHvvIzoh6rljIXlkKvvvIxVVEYtOCDmhJ/nn6XvvInigJTigJRibG9ja2luZyDihpIg55u45Ly85bqm5omT5YiGIOKGkiDov57pgJrliIbph4/ogZrnsbvjgIIKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tICAgICAgIG9wPSdibG9jayfvvJrnlJ/miJAgYmxvY2tpbmcg6ZSu44CCcC52IOWtl+espuS4su+8m3AubW9kZToKLS0gICAgICAgICAnc291bmRleCfvvIjoi7Hmloflp5PmsI/nu4/lhbggU291bmRleO+8jDQg5a2X56ym77yJ77ybCi0tICAgICAgICAgJ2ZpcnN0MyfvvIjmoIflh4bljJblkI7pppYgMyDlrZfnrKbvvIzkuK3oi7HmlofpgJrnlKjvvInvvJsKLS0gICAgICAgICAnbmdyYW0n77yIYmlncmFtIOmbhuWQiOaMieWIhumalOespuaLvOmUru+8jHAubiDpu5jorqQgMu+8ie+8mwotLSAgICAgICAgICdub3JtJ++8iOWPquWBmuagh+WHhuWMlu+8muWwj+WGmS/ljrvnqbrnmb0v5Y675qCH54K577yM6L+U5Zue5YWo5Liy77yJ44CCCi0tICAgICAgIOagh+WHhuWMlue7n+S4gO+8muWwj+WGmSDihpIg5oqY5Y+g56m655m9IOKGkiDljrvmoIfngrnvvIjkv53nlZkgQ0pLIOWtl+avjeaVsOWtl++8ieOAggotLSAgICAgICBvcD0nbWF0Y2gn77ya5Lik5Liy55u45Ly85bqmIOKIiFswLDFd44CC6buY6K6kIEphcm8tV2lua2xlcu+8iOWJjee8gOWKoOadgyBwPTAuMjXvvIxwLnAg5Y+v6LCD77yJ77ybCi0tICAgICAgICAgcC5tZXRyaWM9J2phcm8nfCdqdyd8J2xldifvvIhsZXYg5pe25Li6IDHiiJLlvZLkuIDljJbnvJbovpHot53nprvvvInjgIIKLS0gICAgICAgb3A9J3Jlc29sdmUn77ya5a6M5pW0566h6YGT77yI5bCP6KeE5qih5Y6f5Z6L77yM5Yeg55m+5p2h5YaF77yJ44CCcC5yZWNvcmRzID0geyB7aWQ9Li4uLCBuYW1lPS4uLiwgY2l0eT0uLi4sIC4uLn0sIC4uLiB977ybCi0tICAgICAgICAgcC5rZXlfZmllbGRzID0geyAnbmFtZScsICdjaXR5JyB977yI5Y+C5LiOIGJsb2NraW5nK+aJk+WIhueahOWtl+aute+8jOm7mOiupCB7J25hbWUnfe+8ie+8mwotLSAgICAgICAgIHAudGhyZXNob2xkID0g5omT5YiG6ZiI5YC877yI6buY6K6kIDAuODjvvIxKVyDlj6PlvoTvvInvvJsKLS0gICAgICAgICBwLmJsb2NrX21vZGUgPSAnZmlyc3QzJ3wnc291bmRleCfvvIjpu5jorqQgZmlyc3Qz77yM5Lit6Iux5paH6YCa55So77yJ44CCCi0tICAgICAgIOa1geeoi++8mumAkOiusOW9leeUn+aIkCBibG9ja2luZyDplK4g4oaSIOWQjOmUrue7hOWGheS4pOS4pOaJk+WIhu+8iOWkmuWtl+auteWPluWKoOadg+W5s+Wdh++8jHAud2VpZ2h0cyDlj6/osIPvvIkKLS0gICAgICAg4oaSIOi2hemYiOWAvOi/nui+uSDihpIgdW5pb24tZmluZCDov57pgJrliIbph48g4oaSIGNhbm9uaWNhbCDlj5bnu4TlhoUgbmFtZSDmnIDplb/orrDlvZXjgIIKLS0gICAgICAg6L+U5ZueIEpTT07vvJp7IGNsdXN0ZXJzOiBbIHtjbHVzdGVyLCBpZHM6Wy4uLl0sIGNhbm9uaWNhbCwgc2l6ZSwgbWVtYmVyczpbe2lkLG5hbWUsc2NvcmV9XX0sIC4uLiBdLAotLSAgICAgICAgICAgICAgICAgICAgcGFpcnM6IOi/nui+ueaVsCwgdW5pcTog5Y6f5aeL6K6w5b2V5pWwIH0KLS0g6K+a5a6e6L6555WM77yac291bmRleCDlj6rlr7noi7HmlofmnInmlYjvvIjkuK3mloflkI3or7fnlKggZmlyc3QzL25ncmFt77yJ77ybYmxvY2tpbmcg5piv5Y+s5Zue5o6n5Yi277yM5ryP5LqGCi0tIOmUruWwsea8j+S6humFjeWvueKAlOKAlOeUn+S6p+W7uuiuruWkmumUruW5tuiBlO+8iOmmljMgKyBzb3VuZGV4ICsgbmdyYW0g5ZCE6LeR5LiA6YGN5YaN5bm277yJ77yb5omT5YiG6ZiI5YC86ZyA5oyJCi0tIOaVsOaNruWIhuW4g+iwg++8iOWOn+WeiyAwLjg4IOaYr+iLseaWh+WQjee7j+mqjOWAvO+8jOS4reaWh+WQjeW7uuiuriAwLjg1fjAuOTAg5a6e5rWL77yJ44CCcmVzb2x2ZSDmmK/lhajlhoXlrZgKLS0g5a6e546w77yM5LiH57qn5Lul5LiK6K+35pS5IFNRTCDnq68gam9pbiArIG1hdGNoIOaJk+WIhu+8iGZ1enp5LnNpbXJhbmsg55qE5oCd6Lev77yJ44CCCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0nZW50aXR5Jyk7Ci0tICAgYmxvY2s6ICAgIFNFTEVDVCBsdWFqaXRfcygnZW50aXR5Jywge3Y6J0pvaG4gU21pdGgnLCBtb2RlOidzb3VuZGV4Jywgb3A6J2Jsb2NrJ30pOyAg4oaSICdKNTMyJwotLSAgIG1hdGNoOiAgICBTRUxFQ1QgbHVhaml0X3MoJ2VudGl0eScsIHthOidtYXJ0aGEnLCBiOidtYXJodGEnLCBvcDonbWF0Y2gnfSk7ICAgICAgICAgIOKGkiAnMC45ODYxJwotLSAgIHJlc29sdmU6ICBTRUxFQ1QgbHVhaml0X3MoJ2VudGl0eScsIHtyZWNvcmRzOlt7aWQ6MSxuYW1lOidBbGljZSBDaGVuJyxjaXR5OidIWid9LAotLSAgICAgICAgICAgICB7aWQ6MixuYW1lOidBbGljZSBDaGVuJyxjaXR5OidIYW5nemhvdSd9LHtpZDozLG5hbWU6J0JvYicsY2l0eTonU0gnfV0sCi0tICAgICAgICAgICAgIGtleV9maWVsZHM6WyduYW1lJywnY2l0eSddLCBvcDoncmVzb2x2ZSd9KTsKLS0gICAgICAgICAgICAg4oaSICd7ImNsdXN0ZXJzIjpbeyJjbHVzdGVyIjoxLCJpZHMiOlsxLDJdLCJjYW5vbmljYWwiOiJBbGljZSBDaGVuIiwuLi59XX0nCgpsb2NhbCBlbnRpdHkgPSB7fQpsb2NhbCBqc29uX2VuY29kZSAgLS0g5YmN5ZCR5aOw5piO77yI5a6a5LmJ5Zyo5paH5Lu25ZCO6YOo77yM6LCD55So5Y+R55Sf5ZyoIGNodW5rIOWKoOi9veWujOaIkOWQju+8iQoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVVEYtOCDku6PnoIHngrnvvIjkuI4gZnV6enkgbGliIOWQjOe6puWumu+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHV0ZjhjcChzKQogIGxvY2FsIGNwcyA9IHt9CiAgbG9jYWwgaSwgbiA9IDEsICNzCiAgd2hpbGUgaSA8PSBuIGRvCiAgICBsb2NhbCBiMSA9IHM6Ynl0ZShpKQogICAgbG9jYWwgY3AsIGxlbgogICAgaWYgYjEgPCAweDgwIHRoZW4gY3AsIGxlbiA9IGIxLCAxCiAgICBlbHNlaWYgYjEgPj0gMHhDMCBhbmQgYjEgPCAweEUwIHRoZW4KICAgICAgY3AgPSAoYjEgLSAweEMwKSAqIDY0ICsgKChzOmJ5dGUoaSArIDEpIG9yIDApIC0gMHg4MCk7IGxlbiA9IDIKICAgIGVsc2VpZiBiMSA+PSAweEUwIGFuZCBiMSA8IDB4RjAgdGhlbgogICAgICBsb2NhbCBiMiwgYjMgPSBzOmJ5dGUoaSArIDEpIG9yIDAsIHM6Ynl0ZShpICsgMikgb3IgMAogICAgICBjcCA9IChiMSAtIDB4RTApICogNDA5NiArIChiMiAtIDB4ODApICogNjQgKyAoYjMgLSAweDgwKTsgbGVuID0gMwogICAgZWxzZWlmIGIxID49IDB4RjAgYW5kIGIxIDwgMHhGOCB0aGVuCiAgICAgIGxvY2FsIGIyLCBiMywgYjQgPSBzOmJ5dGUoaSArIDEpIG9yIDAsIHM6Ynl0ZShpICsgMikgb3IgMCwgczpieXRlKGkgKyAzKSBvciAwCiAgICAgIGNwID0gKGIxIC0gMHhGMCkgKiAyNjIxNDQgKyAoYjIgLSAweDgwKSAqIDQwOTYgKyAoYjMgLSAweDgwKSAqIDY0ICsgKGI0IC0gMHg4MCk7IGxlbiA9IDQKICAgIGVsc2UgY3AsIGxlbiA9IGIxLCAxIGVuZAogICAgY3BzWyNjcHMgKyAxXSA9IGNwCiAgICBpID0gaSArIGxlbgogIGVuZAogIHJldHVybiBjcHMKZW5kCgpsb2NhbCBmdW5jdGlvbiBpc19hbG51bShjcCkKICByZXR1cm4gKGNwID49IDQ4IGFuZCBjcCA8PSA1Nykgb3IgKGNwID49IDY1IGFuZCBjcCA8PSA5MCkgb3IgKGNwID49IDk3IGFuZCBjcCA8PSAxMjIpCiAgICBvciBjcCA+PSAweDRFMDAgYW5kIGNwIDw9IDB4OUZGRiAgLS0gQ0pLIOWfuuacrOWMugplbmQKCi0tIOagh+WHhuWMlu+8muWwj+WGmSArIOaKmOWPoOepuueZvSArIOWOu+agh+eCue+8iOS/neeVmeWtl+avjeaVsOWtl+S4jiBDSkvvvIkKbG9jYWwgZnVuY3Rpb24gbm9ybShzKQogIGxvY2FsIG91dCA9IHt9CiAgbG9jYWwgcHJldl9zcGFjZSA9IGZhbHNlCiAgZm9yIF8sIGNwIGluIGlwYWlycyh1dGY4Y3AocykpIGRvCiAgICBpZiBjcCA+PSA2NSBhbmQgY3AgPD0gOTAgdGhlbiBjcCA9IGNwICsgMzIgZW5kCiAgICBpZiBpc19hbG51bShjcCkgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gY3AKICAgICAgcHJldl9zcGFjZSA9IGZhbHNlCiAgICBlbHNlaWYgY3AgPT0gMzIgb3IgY3AgPT0gOSB0aGVuCiAgICAgIGlmIG5vdCBwcmV2X3NwYWNlIGFuZCAjb3V0ID4gMCB0aGVuIG91dFsjb3V0ICsgMV0gPSAzMiBlbmQKICAgICAgcHJldl9zcGFjZSA9IHRydWUKICAgIGVuZAogIGVuZAogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiB0b3N0cihjcHMpCiAgbG9jYWwgcGFydHMgPSB7fQogIGZvciBfLCBjcCBpbiBpcGFpcnMoY3BzKSBkbwogICAgaWYgY3AgPD0gMHg3RiB0aGVuCiAgICAgIHBhcnRzWyNwYXJ0cyArIDFdID0gc3RyaW5nLmNoYXIoY3ApCiAgICBlbHNlaWYgY3AgPD0gMHg3RkYgdGhlbgogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IHN0cmluZy5jaGFyKDB4QzAgKyBtYXRoLmZsb29yKGNwIC8gNjQpLCAweDgwICsgY3AgJSA2NCkKICAgIGVsc2VpZiBjcCA8PSAweEZGRkYgdGhlbgogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IHN0cmluZy5jaGFyKDB4RTAgKyBtYXRoLmZsb29yKGNwIC8gNDA5NiksCiAgICAgICAgMHg4MCArIG1hdGguZmxvb3IoY3AgLyA2NCkgJSA2NCwgMHg4MCArIGNwICUgNjQpCiAgICBlbHNlCiAgICAgIHBhcnRzWyNwYXJ0cyArIDFdID0gc3RyaW5nLmNoYXIoMHhGMCArIG1hdGguZmxvb3IoY3AgLyAyNjIxNDQpLAogICAgICAgIDB4ODAgKyBtYXRoLmZsb29yKGNwIC8gNDA5NikgJSA2NCwgMHg4MCArIG1hdGguZmxvb3IoY3AgLyA2NCkgJSA2NCwgMHg4MCArIGNwICUgNjQpCiAgICBlbmQKICBlbmQKICByZXR1cm4gdGFibGUuY29uY2F0KHBhcnRzKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gSmFybyAvIEphcm8tV2lua2xlciAvIExldmVuc2h0ZWlu77yI5Luj56CB54K557qn77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gamFybyhBLCBCKQogIGxvY2FsIGxhLCBsYiA9ICNBLCAjQgogIGlmIGxhID09IDAgYW5kIGxiID09IDAgdGhlbiByZXR1cm4gMSBlbmQKICBpZiBsYSA9PSAwIG9yIGxiID09IDAgdGhlbiByZXR1cm4gMCBlbmQKICBsb2NhbCBtYXRjaF9kaXN0ID0gbWF0aC5mbG9vcihtYXRoLm1heChsYSwgbGIpIC8gMikgLSAxCiAgaWYgbWF0Y2hfZGlzdCA8IDAgdGhlbiBtYXRjaF9kaXN0ID0gMCBlbmQKICBsb2NhbCBhX21hdGNoLCBiX21hdGNoID0ge30sIHt9CiAgbG9jYWwgbWF0Y2hlcyA9IDAKICBmb3IgaSA9IDEsIGxhIGRvCiAgICBsb2NhbCBsbyA9IG1hdGgubWF4KDEsIGkgLSBtYXRjaF9kaXN0KQogICAgbG9jYWwgaGkgPSBtYXRoLm1pbihsYiwgaSArIG1hdGNoX2Rpc3QpCiAgICBmb3IgaiA9IGxvLCBoaSBkbwogICAgICBpZiBub3QgYl9tYXRjaFtqXSBhbmQgQVtpXSA9PSBCW2pdIHRoZW4KICAgICAgICBhX21hdGNoW2ldLCBiX21hdGNoW2pdID0gdHJ1ZSwgdHJ1ZQogICAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICsgMQogICAgICAgIGJyZWFrCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgaWYgbWF0Y2hlcyA9PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgbG9jYWwgdCwgayA9IDAsIDEKICBmb3IgaSA9IDEsIGxhIGRvCiAgICBpZiBhX21hdGNoW2ldIHRoZW4KICAgICAgd2hpbGUgbm90IGJfbWF0Y2hba10gZG8gayA9IGsgKyAxIGVuZAogICAgICBpZiBBW2ldIH49IEJba10gdGhlbiB0ID0gdCArIDEgZW5kCiAgICAgIGsgPSBrICsgMQogICAgZW5kCiAgZW5kCiAgbG9jYWwgbSA9IG1hdGNoZXMKICByZXR1cm4gKG0gLyBsYSArIG0gLyBsYiArIChtIC0gdCAvIDIpIC8gbSkgLyAzCmVuZAoKbG9jYWwgZnVuY3Rpb24gancoQSwgQiwgcCkKICBsb2NhbCBqID0gamFybyhBLCBCKQogIC0tIOWFseWQjOWJjee8gO+8iOS4iumZkCA077yJCiAgbG9jYWwgbCA9IDAKICBmb3IgaSA9IDEsIG1hdGgubWluKCNBLCAjQiwgNCkgZG8KICAgIGlmIEFbaV0gPT0gQltpXSB0aGVuIGwgPSBsICsgMSBlbHNlIGJyZWFrIGVuZAogIGVuZAogIHJldHVybiBqICsgbCAqIChwIG9yIDAuMjUpICogKDEgLSBqKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGxldihBLCBCKQogIGxvY2FsIG0sIG4gPSAjQSwgI0IKICBpZiBtID09IDAgdGhlbiByZXR1cm4gbiBlbmQKICBpZiBuID09IDAgdGhlbiByZXR1cm4gbSBlbmQKICBsb2NhbCBwcmV2ID0ge30KICBmb3IgaiA9IDAsIG4gZG8gcHJldltqXSA9IGogZW5kCiAgZm9yIGkgPSAxLCBtIGRvCiAgICBsb2NhbCBjdXIgPSB7IFswXSA9IGkgfQogICAgbG9jYWwgYWkgPSBBW2ldCiAgICBmb3IgaiA9IDEsIG4gZG8KICAgICAgY3VyW2pdID0gbWF0aC5taW4ocHJldltqXSArIDEsIGN1cltqIC0gMV0gKyAxLCBwcmV2W2ogLSAxXSArIChhaSA9PSBCW2pdIGFuZCAwIG9yIDEpKQogICAgZW5kCiAgICBwcmV2ID0gY3VyCiAgZW5kCiAgcmV0dXJuIHByZXZbbl0KZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIFNvdW5kZXjvvIjoi7HmlofvvJvpnZ7lrZfmr43lvIDlpLTov5Tlm54gJyfvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBTT1VOREVYX01BUCA9IHsgWydiJ109JzEnLFsnZiddPScxJyxbJ3AnXT0nMScsWyd2J109JzEnLAogIFsnYyddPScyJyxbJ2cnXT0nMicsWydqJ109JzInLFsnayddPScyJyxbJ3EnXT0nMicsWydzJ109JzInLFsneCddPScyJyxbJ3onXT0nMicsCiAgWydkJ109JzMnLFsndCddPSczJyxbJ2wnXT0nNCcsWydtJ109JzUnLFsnbiddPSc1JyxbJ3InXT0nNicgfQpsb2NhbCBWT1dFTFMgPSB7IGEgPSB0cnVlLCBlID0gdHJ1ZSwgaSA9IHRydWUsIG8gPSB0cnVlLCB1ID0gdHJ1ZSwgeSA9IHRydWUgfQoKbG9jYWwgZnVuY3Rpb24gc291bmRleChzKQogIGxvY2FsIG91dCA9IHt9CiAgbG9jYWwgcHJldl9jb2RlCiAgZm9yIGkgPSAxLCAjcyBkbwogICAgbG9jYWwgYyA9IHM6c3ViKGksIGkpOmxvd2VyKCkKICAgIGlmIGkgPT0gMSB0aGVuCiAgICAgIG91dFsxXSA9IHN0cmluZy51cHBlcihjKQogICAgZWxzZWlmIFNPVU5ERVhfTUFQW2NdIHRoZW4KICAgICAgbG9jYWwgY29kZSA9IFNPVU5ERVhfTUFQW2NdCiAgICAgIGlmIGNvZGUgfj0gcHJldl9jb2RlIHRoZW4KICAgICAgICBvdXRbI291dCArIDFdID0gY29kZQogICAgICAgIHByZXZfY29kZSA9IGNvZGUKICAgICAgZW5kCiAgICBlbHNlaWYgVk9XRUxTW2NdIHRoZW4KICAgICAgcHJldl9jb2RlID0gbmlsICAtLSDlhYPpn7PliIbpmpTvvJrlhYHorrjlkIznoIHlho3njrAKICAgIGVuZAogICAgaWYgI291dCA+PSA0IHRoZW4gYnJlYWsgZW5kCiAgZW5kCiAgd2hpbGUgI291dCA8IDQgZG8gb3V0WyNvdXQgKyAxXSA9ICcwJyBlbmQKICByZXR1cm4gdGFibGUuY29uY2F0KG91dCkKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEJsb2NraW5nIOmUrgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGJsb2NrX2tleSh2LCBtb2RlLCBuKQogIGxvY2FsIGNwcyA9IG5vcm0odikKICBpZiAjY3BzID09IDAgdGhlbiByZXR1cm4gJycgZW5kCiAgbW9kZSA9IG1vZGUgb3IgJ2ZpcnN0MycKICBpZiBtb2RlID09ICdub3JtJyB0aGVuCiAgICByZXR1cm4gdG9zdHIoY3BzKQogIGVsc2VpZiBtb2RlID09ICdzb3VuZGV4JyB0aGVuCiAgICByZXR1cm4gc291bmRleCh0b3N0cihjcHMpKQogIGVsc2VpZiBtb2RlID09ICduZ3JhbScgdGhlbgogICAgbG9jYWwgayA9IG4gb3IgMgogICAgbG9jYWwgZ3JhbXMgPSB7fQogICAgaWYgI2NwcyA8IGsgdGhlbiByZXR1cm4gdG9zdHIoY3BzKSBlbmQKICAgIGZvciBpID0gMSwgI2NwcyAtIGsgKyAxIGRvCiAgICAgIGdyYW1zWyNncmFtcyArIDFdID0gdG9zdHJpbmcoY3BzW2ldKQogICAgZW5kCiAgICB0YWJsZS5zb3J0KGdyYW1zKQogICAgcmV0dXJuIHRhYmxlLmNvbmNhdChncmFtcywgJywnKQogIGVsc2UgIC0tIGZpcnN0MwogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBpID0gMSwgbWF0aC5taW4oMywgI2NwcykgZG8gb3V0WyNvdXQgKyAxXSA9IGNwc1tpXSBlbmQKICAgIHJldHVybiB0b3N0cihvdXQpCiAgZW5kCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDnm7jkvLzluqbvvIjlpJrlrZfmrrXliqDmnYPvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBmaWVsZF9zY29yZShyMSwgcjIsIGZpZWxkcywgd2VpZ2h0cywgbWV0cmljLCBwKQogIGxvY2FsIHRvdGFsX3csIGFjYyA9IDAsIDAKICBmb3IgaSwgZiBpbiBpcGFpcnMoZmllbGRzKSBkbwogICAgbG9jYWwgdjEsIHYyID0gcjFbZl0sIHIyW2ZdCiAgICBpZiB2MSB+PSBuaWwgYW5kIHYyIH49IG5pbCBhbmQgdG9zdHJpbmcodjEpIH49ICcnIGFuZCB0b3N0cmluZyh2Mikgfj0gJycgdGhlbgogICAgICBsb2NhbCBBLCBCID0gbm9ybSh0b3N0cmluZyh2MSkpLCBub3JtKHRvc3RyaW5nKHYyKSkKICAgICAgbG9jYWwgc2MKICAgICAgaWYgbWV0cmljID09ICdsZXYnIHRoZW4KICAgICAgICBzYyA9IDEgLSBsZXYoQSwgQikgLyBtYXRoLm1heCgjQSwgI0IsIDEpCiAgICAgIGVsc2UKICAgICAgICBzYyA9IGp3KEEsIEIsIHAucCBvciAwLjI1KQogICAgICBlbmQKICAgICAgbG9jYWwgdyA9IHdlaWdodHMgYW5kIHdlaWdodHNbaV0gb3IgMQogICAgICB0b3RhbF93LCBhY2MgPSB0b3RhbF93ICsgdywgYWNjICsgdyAqIHNjCiAgICBlbmQKICBlbmQKICBpZiB0b3RhbF93ID09IDAgdGhlbiByZXR1cm4gMCBlbmQKICByZXR1cm4gYWNjIC8gdG90YWxfdwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gVW5pb24tRmluZAotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIG1ha2VfdWYobikKICByZXR1cm4gc2V0bWV0YXRhYmxlKHsgcGFyZW50ID0ge30sIHNpemUgPSB7fSB9LCB7CiAgICBfX2luZGV4ID0gewogICAgICBmaW5kID0gZnVuY3Rpb24oc2VsZiwgeCkKICAgICAgICBsb2NhbCBwID0gc2VsZi5wYXJlbnQKICAgICAgICB3aGlsZSBwW3hdIH49IHggZG8gcFt4XSA9IHBbcFt4XV07IHggPSBwW3hdIGVuZAogICAgICAgIHJldHVybiB4CiAgICAgIGVuZCwKICAgICAgdW5pb24gPSBmdW5jdGlvbihzZWxmLCB4LCB5KQogICAgICAgIGxvY2FsIHAsIHMgPSBzZWxmLnBhcmVudCwgc2VsZi5zaXplCiAgICAgICAgbG9jYWwgcngsIHJ5ID0gc2VsZjpmaW5kKHgpLCBzZWxmOmZpbmQoeSkKICAgICAgICBpZiByeCA9PSByeSB0aGVuIHJldHVybiBlbmQKICAgICAgICBpZiBzW3J4XSA8IHNbcnldIHRoZW4gcngsIHJ5ID0gcnksIHJ4IGVuZAogICAgICAgIHBbcnldID0gcng7IHNbcnhdID0gc1tyeF0gKyBzW3J5XQogICAgICBlbmQKICAgIH0KICB9KQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gcmVzb2x2Ze+8muWujOaVtOeuoemBkwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHJlc29sdmUocCkKICBsb2NhbCByZWNvcmRzID0gcC5yZWNvcmRzCiAgaWYgdHlwZShyZWNvcmRzKSB+PSAndGFibGUnIG9yICNyZWNvcmRzID09IDAgdGhlbgogICAgLS0g5bm26KGM5pWw57uE5qih5byP77yIU1FMIOS+p+WFvOWuue+8mkxJU1Qtb2YtU1RSVUNUIOahpeaOpeaaguS4jeaUr+aMge+8jOeUqOWkmuWIlyBMSVNUIOS7o+abv++8iQogICAgLS0g5L6L77yaeydvcCc6J3Jlc29sdmUnLCAnbmFtZSc6WydBbGljZSBDaGVuJywnQm9iIExpJ10sICdjaXR5JzpbJ0hhbmd6aG91JywnU0gnXSwgJ2lkJzpbMSwyXX0KICAgIGxvY2FsIGFycnMsIG4gPSB7fSwgMAogICAgbG9jYWwgQ09OVFJPTCA9IHsgb3AgPSB0cnVlLCByZWNvcmRzID0gdHJ1ZSwga2V5X2ZpZWxkcyA9IHRydWUsIHdlaWdodHMgPSB0cnVlLAogICAgICAgICAgICAgICAgICAgICAgdGhyZXNob2xkID0gdHJ1ZSwgYmxvY2tfbW9kZSA9IHRydWUsIG1ldHJpYyA9IHRydWUsIHAgPSB0cnVlIH0KICAgIGZvciBrLCB2IGluIHBhaXJzKHApIGRvCiAgICAgIGlmIHR5cGUodikgPT0gJ3RhYmxlJyBhbmQgdHlwZSh2WzFdKSB+PSAnbmlsJyBhbmQgbm90IENPTlRST0xba10gdGhlbgogICAgICAgIGFycnNba10gPSB2CiAgICAgICAgbiA9IG1hdGgubWF4KG4sICN2KQogICAgICBlbmQKICAgIGVuZAogICAgaWYgbiA9PSAwIHRoZW4gcmV0dXJuICd7ImVycm9yIjoicmVjb3JkcyByZXF1aXJlZCIsImNsdXN0ZXJzIjpbXX0nIGVuZAogICAgcmVjb3JkcyA9IHt9CiAgICBmb3IgaSA9IDEsIG4gZG8KICAgICAgcmVjb3Jkc1tpXSA9IHt9CiAgICAgIGZvciBrLCB2IGluIHBhaXJzKGFycnMpIGRvCiAgICAgICAgaWYgdltpXSB+PSBuaWwgdGhlbiByZWNvcmRzW2ldW2tdID0gdltpXSBlbmQKICAgICAgZW5kCiAgICBlbmQKICAgIGlmIG5vdCBwLmtleV9maWVsZHMgdGhlbgogICAgICBsb2NhbCBrcyA9IHt9CiAgICAgIGZvciBrIGluIHBhaXJzKGFycnMpIGRvIGlmIGsgfj0gJ2lkJyB0aGVuIGtzWyNrcyArIDFdID0gayBlbmQgZW5kCiAgICAgIHAua2V5X2ZpZWxkcyA9IGtzCiAgICBlbmQKICBlbmQKICBsb2NhbCBmaWVsZHMgPSBwLmtleV9maWVsZHMgb3IgeyAnbmFtZScgfQogIGxvY2FsIHdlaWdodHMgPSBwLndlaWdodHMKICBsb2NhbCB0aHJlc2hvbGQgPSBwLnRocmVzaG9sZCBvciAwLjg4CiAgbG9jYWwgYmxvY2tfbW9kZSA9IHAuYmxvY2tfbW9kZSBvciAnZmlyc3QzJwogIGxvY2FsIG1ldHJpYyA9IHAubWV0cmljIG9yICdqdycKCiAgLS0gMS4gYmxvY2tpbmfvvJrplK4g4oaSIOiusOW9leS4i+agh+e7hAogIGxvY2FsIGJ1Y2tldHMgPSB7fQogIGxvY2FsIHVuaXEgPSAwCiAgZm9yIGksIHIgaW4gaXBhaXJzKHJlY29yZHMpIGRvCiAgICBsb2NhbCBrZXkgPSBibG9ja19rZXkodG9zdHJpbmcocltmaWVsZHNbMV1dIG9yICcnKSwgYmxvY2tfbW9kZSkKICAgIGlmIGtleSB+PSAnJyB0aGVuCiAgICAgIHVuaXEgPSB1bmlxICsgMQogICAgICBidWNrZXRzW2tleV0gPSBidWNrZXRzW2tleV0gb3Ige30KICAgICAgYnVja2V0c1trZXldWyNidWNrZXRzW2tleV0gKyAxXSA9IGkKICAgIGVuZAogIGVuZAoKICAtLSAyLiDnu4TlhoXkuKTkuKTmiZPliIYg4oaSIOi2hemYiOWAvOi/nui+uQogIGxvY2FsIG4gPSAjcmVjb3JkcwogIGxvY2FsIHVmID0gbWFrZV91ZihuKQogIGZvciBpID0gMSwgbiBkbyB1Zi5wYXJlbnRbaV0sIHVmLnNpemVbaV0gPSBpLCAxIGVuZAogIGxvY2FsIHBhaXJfY291bnQgPSAwCiAgbG9jYWwgc2VlbiA9IHt9CiAgZm9yIGtleSwgaWR4cyBpbiBwYWlycyhidWNrZXRzKSBkbwogICAgaWYgI2lkeHMgPiAxIHRoZW4KICAgICAgZm9yIGEgPSAxLCAjaWR4cyAtIDEgZG8KICAgICAgICBmb3IgYiA9IGEgKyAxLCAjaWR4cyBkbwogICAgICAgICAgbG9jYWwgaSwgaiA9IGlkeHNbYV0sIGlkeHNbYl0KICAgICAgICAgIGxvY2FsIGVkZ2Vfa2V5ID0gaSA8IGogYW5kIChpICogMTAwMDAwICsgaikgb3IgKGogKiAxMDAwMDAgKyBpKQogICAgICAgICAgaWYgbm90IHNlZW5bZWRnZV9rZXldIHRoZW4KICAgICAgICAgICAgc2VlbltlZGdlX2tleV0gPSB0cnVlCiAgICAgICAgICAgIGxvY2FsIHNjID0gZmllbGRfc2NvcmUocmVjb3Jkc1tpXSwgcmVjb3Jkc1tqXSwgZmllbGRzLCB3ZWlnaHRzLCBtZXRyaWMsIHApCiAgICAgICAgICAgIGlmIHNjID49IHRocmVzaG9sZCB0aGVuCiAgICAgICAgICAgICAgdWY6dW5pb24oaSwgaikKICAgICAgICAgICAgICBwYWlyX2NvdW50ID0gcGFpcl9jb3VudCArIDEKICAgICAgICAgICAgZW5kCiAgICAgICAgICBlbmQKICAgICAgICBlbmQKICAgICAgZW5kCiAgICBlbmQKICBlbmQKCiAgLS0gMy4g6L+e6YCa5YiG6YePIOKGkiDovpPlh7oKICBsb2NhbCBncm91cHMgPSB7fQogIGZvciBpID0gMSwgbiBkbwogICAgbG9jYWwgcm9vdCA9IHVmOmZpbmQoaSkKICAgIGdyb3Vwc1tyb290XSA9IGdyb3Vwc1tyb290XSBvciB7fQogICAgZ3JvdXBzW3Jvb3RdWyNncm91cHNbcm9vdF0gKyAxXSA9IGkKICBlbmQKICBsb2NhbCBjbHVzdGVycywgY2lkID0ge30sIDAKICBmb3Igcm9vdCwgaWRzIGluIHBhaXJzKGdyb3VwcykgZG8KICAgIGNpZCA9IGNpZCArIDEKICAgIGxvY2FsIGNhbm9uLCBjYW5vbl9sZW4gPSAnJywgMAogICAgbG9jYWwgbWVtYmVycyA9IHt9CiAgICBmb3IgXywgaSBpbiBpcGFpcnMoaWRzKSBkbwogICAgICBsb2NhbCBuYW1lID0gdG9zdHJpbmcocmVjb3Jkc1tpXVtmaWVsZHNbMV1dIG9yICcnKQogICAgICBtZW1iZXJzWyNtZW1iZXJzICsgMV0gPSB7IGlkID0gcmVjb3Jkc1tpXS5pZCBvciBpLCBuYW1lID0gbmFtZSB9CiAgICAgIGlmICNuYW1lID4gY2Fub25fbGVuIHRoZW4gY2Fub24sIGNhbm9uX2xlbiA9IG5hbWUsICNuYW1lIGVuZAogICAgZW5kCiAgICB0YWJsZS5zb3J0KG1lbWJlcnMsIGZ1bmN0aW9uKHgsIHkpIHJldHVybiB0b3N0cmluZyh4LmlkKSA8IHRvc3RyaW5nKHkuaWQpIGVuZCkKICAgIGNsdXN0ZXJzW2NpZF0gPSB7IGNsdXN0ZXIgPSBjaWQsIGlkcyA9IHt9LCBjYW5vbmljYWwgPSBjYW5vbiwgc2l6ZSA9ICNpZHMsIG1lbWJlcnMgPSBtZW1iZXJzIH0KICAgIGZvciBfLCBtIGluIGlwYWlycyhtZW1iZXJzKSBkbyBjbHVzdGVyc1tjaWRdLmlkc1sjY2x1c3RlcnNbY2lkXS5pZHMgKyAxXSA9IG0uaWQgZW5kCiAgZW5kCgogIGxvY2FsIG91dCA9IHsgY2x1c3RlcnMgPSBjbHVzdGVycywgcGFpcnMgPSBwYWlyX2NvdW50LCB1bmlxID0gdW5pcSwgcmVjb3JkcyA9IG4gfQogIHJldHVybiBqc29uX2VuY29kZShvdXQpCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDlhoXogZQgSlNPTiDnvJbnoIHlmajvvIjlj6rnvJbnoIHmnKwgbGliIOiHquS6p+e7k+aehO+8jOmbtuWklumDqOS+nei1lu+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGVzY19zdHIocykKICByZXR1cm4gJyInIC4uIHRvc3RyaW5nKHMpOmdzdWIoJ1slelwxLVwzMSJcXF0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnIicgdGhlbiByZXR1cm4gJ1xcIicKICAgIGVsc2VpZiBjID09ICdcXCcgdGhlbiByZXR1cm4gJ1xcXFwnCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nCiAgICBlbHNlaWYgYyA9PSAnXHInIHRoZW4gcmV0dXJuICdcXHInCiAgICBlbHNlaWYgYyA9PSAnXHQnIHRoZW4gcmV0dXJuICdcXHQnCiAgICBlbHNlIHJldHVybiBzdHJpbmcuZm9ybWF0KCdcXHUlMDR4JywgYzpieXRlKCkpIGVuZAogIGVuZCkgLi4gJyInCmVuZApqc29uX2VuY29kZSA9IGZ1bmN0aW9uKHYpCiAgbG9jYWwgdCA9IHR5cGUodikKICBpZiB0ID09ICduaWwnIHRoZW4gcmV0dXJuICdudWxsJwogIGVsc2VpZiB0ID09ICdib29sZWFuJyB0aGVuIHJldHVybiB2IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJwogIGVsc2VpZiB0ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJWcnLCB2KQogIGVsc2VpZiB0ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuIGVzY19zdHIodikKICBlbHNlaWYgdCA9PSAndGFibGUnIHRoZW4KICAgIGxvY2FsIGlzX2FyciwgbiA9IHRydWUsICN2CiAgICBmb3IgayBpbiBwYWlycyh2KSBkbyBpZiB0eXBlKGspIH49ICdudW1iZXInIG9yIGsgPCAxIG9yIGsgPiBuIHRoZW4gaXNfYXJyID0gZmFsc2UgYnJlYWsgZW5kIGVuZAogICAgbG9jYWwgcGFydHMgPSB7fQogICAgaWYgaXNfYXJyIHRoZW4KICAgICAgZm9yIGkgPSAxLCBuIGRvIHBhcnRzW2ldID0ganNvbl9lbmNvZGUodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogICAgZWxzZQogICAgICBmb3IgaywgdmFsIGluIHBhaXJzKHYpIGRvCiAgICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSBqc29uX2VuY29kZShrKSAuLiAnOicgLi4ganNvbl9lbmNvZGUodmFsKQogICAgICBlbmQKICAgICAgcmV0dXJuICd7JyAuLiB0YWJsZS5jb25jYXQocGFydHMsICcsJykgLi4gJ30nCiAgICBlbmQKICBlbmQKICByZXR1cm4gJ251bGwnCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgb3AgPSBwLm9wIG9yICdtYXRjaCcKICBpZiBvcCA9PSAnYmxvY2snIHRoZW4KICAgIHJldHVybiBibG9ja19rZXkocC52IG9yICcnLCBwLm1vZGUsIHAubikKICBlbHNlaWYgb3AgPT0gJ21hdGNoJyB0aGVuCiAgICBsb2NhbCBBLCBCID0gbm9ybSh0b3N0cmluZyhwLmEgb3IgJycpKSwgbm9ybSh0b3N0cmluZyhwLmIgb3IgJycpKQogICAgbG9jYWwgbWV0cmljID0gcC5tZXRyaWMgb3IgJ2p3JwogICAgaWYgbWV0cmljID09ICdqYXJvJyB0aGVuIHJldHVybiBzdHJpbmcuZm9ybWF0KCclLjRmJywgamFybyhBLCBCKSkKICAgIGVsc2VpZiBtZXRyaWMgPT0gJ2xldicgdGhlbgogICAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS40ZicsIDEgLSBsZXYoQSwgQikgLyBtYXRoLm1heCgjQSwgI0IsIDEpKQogICAgZWxzZQogICAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS40ZicsIGp3KEEsIEIsIHAucCBvciAwLjI1KSkKICAgIGVuZAogIGVsc2VpZiBvcCA9PSAncmVzb2x2ZScgdGhlbgogICAgcmV0dXJuIHJlc29sdmUocCkKICBlbmQKICByZXR1cm4gJycKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogcHNpCi0tIEBjYXRlZ29yeTogcXVhbGl0eQotLSBAZGVzYzog5pWw5o2u5ryC56e75qOA5rWL77yI57qvIEx1Ye+8jOiHquWMheWQq++8ieKAlOKAlFBTSe+8iFBvcHVsYXRpb24gU3RhYmlsaXR5IEluZGV477yJLyBLTCDmlaPluqYgLyDljaHmlrnjgIIKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tICAgICAgIG9wPSdwc2kn77ya5Lik5Liq5YiG5biD5LmL6Ze055qEIFBTSe+8iOWNoOavlOWIhueuseeJiO+8ieOAgui+k+WFpSBwLmUgPSDmnJ/mnJso5Y+C6ICDKeWNoOavlOaVsOe7hOOAgXAuYSA9IOWunumZheWNoOavlOaVsOe7hO+8mwotLSAgICAgICAgICAgICAgICAg5oiWIHAucmF3X2UvcC5yYXdfYSA9IOWOn+Wni+aVsOWAvOaVsOe7hO+8iOiHquWKqOetieWuveWIhueuse+8jHAuYmlucyDpu5jorqQgMTDvvInvvJsKLS0gICAgICAgICAgICAgICAgIOaIliBwLnJhd19lL3AucmF3X2EgKyBwLmJyZWFrcyA9IOaYvuW8j+i+ueeVjOaVsOe7hO+8iOiHquWKqOWBmuWNoOavlOaNoueul++8ieOAggotLSAgICAgICDlhazlvI/vvJpQU0kgPSDOo19pIChBX2kg4oiSIEVfaSkgw5cgbG4oQV9pIC8gRV9pKe+8jOWNoOavlOS4uiAwIOaXtuaMiSAwLjAwMDEg5LiL6ZmQ5aSE55CG77yI5Lia55WM5oOv5L6L77yJ44CCCi0tICAgICAgIOWIpOivu++8iOmjjuaOpy/mqKHlnovnm5Hmjqfmg6/kvovvvInvvJpQU0kgPCAwLjEwIOaXoOa8guenu++8mzAuMTB+MC4yNSDkuK3nrYnmvILnp7vvvJs+IDAuMjUg5pi+6JGX5ryC56e777yI6ZyA6LCD5p+l77yJ44CCCi0tICAgICAgIG9wPSdrbCfvvJpLTCDmlaPluqYgRF9LTChB4oCWRSnvvIhuYXRz77yJ77yM5ZCM5YiG566x57qm5a6a44CCCi0tICAgICAgIG9wPSdjaGkyJ++8muWNoeaWuee7n+iuoemHjyDOoyAoQV9p4oiSRV9pKcKyL0Vfae+8iOmikeaVsOeJiOmcgCBwLmNvdW50c19h77yb5Y2g5q+U54mI6Ieq5Yqo5oyJIE4g5o2i566X77yMTj1wLm7vvInjgIIKLS0gICAgICAgb3A9J3JlcG9ydCfvvJrkuIDmrKHov5Tlm54ge3BzaSwga2wsIGNoaTIsIGJpbnMsIHZlcmRpY3QsIG59IEpTT04g5a2X56ym5Liy77yIU1FMIOS+pyBqc29uX2V4dHJhY3TvvInjgIIKLS0g6K+a5a6e6L6555WM77ya562J5a695YiG566x5a+56ZW/5bC+5YiG5biD5pWP5oSf4oCU4oCU6YeN5bC+5pWw5o2u6K+35pi+5byP5LygIHAuYnJlYWtz77yb5Y2g5q+U5pWw57uE5b+F6aG7562J6ZW/77ybUFNJIOaYrwotLSDml6DmlrnlkJHmjIfmoIfvvIjkuI3ljLrliIbosIHpq5josIHkvY7vvInvvIzphY3lkIjpgJDnrrHlt67lvILnnIvmlrnlkJHjgILnu5/orqHmmL7okZfmgKfor7fphY3lkIjljaHmlrnkuLTnlYzlgLzlnKggU1FMIOS+p+WIpOaWreOAggotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3BzaScpOwotLSAgIHBzaTogICAgICBTRUxFQ1QgbHVhaml0X3MoJ3BzaScsIHtyYXdfZTpbMSwyLDMsNCw1XSwgcmF3X2E6WzEsMiw0LDgsMTZdLCBvcDoncHNpJ30pOwotLSAgICAgICAgICAgICDihpIgJzAuMTE1NifvvIjmnJ/mnJvlnYfljIAgdnMg5a6e6ZmF5oyH5pWw77ya5Lit562J5ryC56e777yJCi0tICAgcmVwb3J0OiAgIFNFTEVDVCBsdWFqaXRfcygncHNpJywge3Jhd19lOlsuLi5dLCByYXdfYTpbLi4uXSwgb3A6J3JlcG9ydCd9KTsgIOKGkiAneyJwc2kiOjAuMTIsLi4ufScKCmxvY2FsIHBzaSA9IHt9CgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOW3peWFtwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGFzX2FycmF5KHgpCiAgaWYgdHlwZSh4KSA9PSAnc3RyaW5nJyB0aGVuCiAgICBsb2NhbCBvdXQgPSB7fQogICAgZm9yIHBhcnQgaW4gKHggLi4gJywnKTpnbWF0Y2goJyguLSksJykgZG8KICAgICAgb3V0WyNvdXQgKyAxXSA9IHRvbnVtYmVyKHBhcnQpIG9yIDAKICAgIGVuZAogICAgcmV0dXJuIG91dAogIGVuZAogIHJldHVybiB4CmVuZAoKLS0g562J5a695YiG566x77ya5oqK5pWw5YC85pWw57uE5Y6L5oiQIGJpbnMg5Liq5qG255qE6K6h5pWwCmxvY2FsIGZ1bmN0aW9uIGhpc3RfZXF1YWwodmFsdWVzLCBiaW5zLCBsbywgaGkpCiAgbG9jYWwgbiA9ICN2YWx1ZXMKICBpZiBuID09IDAgdGhlbiByZXR1cm4ge30gZW5kCiAgbG8gPSBsbyBvciBtYXRoLmh1Z2UKICBoaSA9IGhpIG9yIC1tYXRoLmh1Z2UKICBmb3IgaSA9IDEsIG4gZG8KICAgIGxvY2FsIHYgPSB2YWx1ZXNbaV0KICAgIGlmIHYgPCBsbyB0aGVuIGxvID0gdiBlbmQKICAgIGlmIHYgPiBoaSB0aGVuIGhpID0gdiBlbmQKICBlbmQKICBpZiBoaSA8PSBsbyB0aGVuIGhpID0gbG8gKyAxIGVuZCAgLS0g5bi46YeP5YiX77ya5Y2V5qG25YWc5bqVCiAgbG9jYWwgdyA9IChoaSAtIGxvKSAvIGJpbnMKICBsb2NhbCBjb3VudHMgPSB7fQogIGZvciBpID0gMSwgYmlucyBkbyBjb3VudHNbaV0gPSAwIGVuZAogIGZvciBpID0gMSwgbiBkbwogICAgbG9jYWwgYiA9IG1hdGguZmxvb3IoKHZhbHVlc1tpXSAtIGxvKSAvIHcpICsgMQogICAgaWYgYiA8IDEgdGhlbiBiID0gMSBlbHNlaWYgYiA+IGJpbnMgdGhlbiBiID0gYmlucyBlbmQKICAgIGNvdW50c1tiXSA9IGNvdW50c1tiXSArIDEKICBlbmQKICByZXR1cm4gY291bnRzLCBsbywgaGkKZW5kCgotLSDmmL7lvI/ovrnnlYzliIbnrrHvvIhwLmJyZWFrcyA9IOWNh+W6j+i+ueeVjOaVsOe7hO+8jOWmgiB7LTEsMCwxLDEwfSDihpIgNCDkuKrmobbvvIkKbG9jYWwgZnVuY3Rpb24gaGlzdF9icmVha3ModmFsdWVzLCBicmVha3MpCiAgbG9jYWwgY291bnRzID0ge30KICBmb3IgaSA9IDEsICNicmVha3MgKyAxIGRvIGNvdW50c1tpXSA9IDAgZW5kCiAgZm9yIGkgPSAxLCAjdmFsdWVzIGRvCiAgICBsb2NhbCB2ID0gdmFsdWVzW2ldCiAgICBsb2NhbCBiID0gI2JyZWFrcyArIDEKICAgIGZvciBqID0gMSwgI2JyZWFrcyBkbwogICAgICBpZiB2IDw9IGJyZWFrc1tqXSB0aGVuIGIgPSBqIGJyZWFrIGVuZAogICAgZW5kCiAgICBjb3VudHNbYl0gPSBjb3VudHNbYl0gKyAxCiAgZW5kCiAgcmV0dXJuIGNvdW50cwplbmQKCi0tIOiuoeaVsCDihpIg5Y2g5q+U77yI5LiL6ZmQIDAuMDAwMSDpmLLpmaTpm7bvvIzkuJrnlYwgUFNJIOaDr+S+i++8iQpsb2NhbCBmdW5jdGlvbiB0b19zaGFyZShjb3VudHMsIG4pCiAgbG9jYWwgc2hhcmUgPSB7fQogIGZvciBpID0gMSwgI2NvdW50cyBkbwogICAgc2hhcmVbaV0gPSAoY291bnRzW2ldIG9yIDApIC8gbWF0aC5tYXgobiwgMSkKICAgIGlmIHNoYXJlW2ldIDwgMC4wMDAxIHRoZW4gc2hhcmVbaV0gPSAwLjAwMDEgZW5kCiAgZW5kCiAgcmV0dXJuIHNoYXJlCmVuZAoKbG9jYWwgZnVuY3Rpb24gZm10NCh4KSByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS40ZicsIHggKyAwKSBlbmQKbG9jYWwgZnVuY3Rpb24gcm91bmQ0KHgpIHJldHVybiBtYXRoLmZsb29yKHggKiAxMDAwMCArIDAuNSkgLyAxMDAwMCBlbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5qC45b+D77yaUFNJIC8gS0wgLyBDaGky77yI5Y2g5q+U5pWw57uE57qn77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcHNpX2NvcmUoc2hhcmVfZSwgc2hhcmVfYSkKICBsb2NhbCB0b3RhbCA9IDAKICBmb3IgaSA9IDEsICNzaGFyZV9lIGRvCiAgICBsb2NhbCBlLCBhID0gc2hhcmVfZVtpXSwgc2hhcmVfYVtpXQogICAgdG90YWwgPSB0b3RhbCArIChhIC0gZSkgKiBtYXRoLmxvZyhhIC8gZSkKICBlbmQKICByZXR1cm4gdG90YWwKZW5kCgpsb2NhbCBmdW5jdGlvbiBrbF9jb3JlKHNoYXJlX2UsIHNoYXJlX2EpCiAgbG9jYWwgdG90YWwgPSAwCiAgZm9yIGkgPSAxLCAjc2hhcmVfZSBkbwogICAgbG9jYWwgZSwgYSA9IHNoYXJlX2VbaV0sIHNoYXJlX2FbaV0KICAgIHRvdGFsID0gdG90YWwgKyBhICogbWF0aC5sb2coYSAvIGUpCiAgZW5kCiAgcmV0dXJuIHRvdGFsCmVuZAoKbG9jYWwgZnVuY3Rpb24gY2hpMl9jb3JlKGNvdW50c19lLCBjb3VudHNfYSwgbl9hKQogIGxvY2FsIHRvdGFsID0gMAogIGZvciBpID0gMSwgI2NvdW50c19lIGRvCiAgICBsb2NhbCBlID0gY291bnRzX2VbaV0gb3IgMAogICAgbG9jYWwgYSA9IGNvdW50c19hW2ldIG9yIDAKICAgIGlmIGUgPiAwIHRoZW4KICAgICAgdG90YWwgPSB0b3RhbCArIChhIC0gZSAqIG5fYSAvIChjb3VudHNfZS50b3RhbF9uIG9yICNjb3VudHNfZSkpIF4gMiAvIGUKICAgIGVuZAogIGVuZAogIHJldHVybiB0b3RhbAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5YiG5Y+RCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gcnVuKHApCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIG9wID0gcC5vcCBvciAncHNpJwoKICAtLSDlvZLkuIDljJbovpPlhaXvvJrkvJjlhYjljp/lp4vmlbDlgLzmlbDnu4TvvIjoh6rliqjliIbnrrHvvInvvIzlhbbmrKHmmL7lvI/ljaDmr5TmlbDnu4QKICBsb2NhbCBzaGFyZV9lLCBzaGFyZV9hLCBjb3VudHNfZSwgY291bnRzX2EKICBpZiBwLnJhd19lIGFuZCBwLnJhd19hIHRoZW4KICAgIGxvY2FsIHZlLCB2YSA9IGFzX2FycmF5KHAucmF3X2UpLCBhc19hcnJheShwLnJhd19hKQogICAgaWYgcC5icmVha3MgYW5kIHR5cGUocC5icmVha3MpID09ICd0YWJsZScgdGhlbgogICAgICBjb3VudHNfZSwgY291bnRzX2EgPSBoaXN0X2JyZWFrcyh2ZSwgcC5icmVha3MpLCBoaXN0X2JyZWFrcyh2YSwgcC5icmVha3MpCiAgICBlbHNlCiAgICAgIGxvY2FsIGJpbnMgPSBwLmJpbnMgb3IgMTAKICAgICAgbG9jYWwgY2UsIGxvLCBoaSA9IGhpc3RfZXF1YWwodmUsIGJpbnMpCiAgICAgIGxvY2FsIGNhID0gaGlzdF9lcXVhbCh2YSwgYmlucywgbG8sIGhpKSAgLS0g5a+56b2Q5Yiw5ZCM5LiA6L6555WMCiAgICAgIGNvdW50c19lLCBjb3VudHNfYSA9IGNlLCBjYQogICAgZW5kCiAgICBsb2NhbCBuZSwgbmEgPSAjdmUsICN2YQogICAgY291bnRzX2UudG90YWxfbiwgY291bnRzX2EudG90YWxfbiA9IG5lLCBuYQogICAgc2hhcmVfZSwgc2hhcmVfYSA9IHRvX3NoYXJlKGNvdW50c19lLCBuZSksIHRvX3NoYXJlKGNvdW50c19hLCBuYSkKICBlbHNlCiAgICBzaGFyZV9lLCBzaGFyZV9hID0gYXNfYXJyYXkocC5lKSwgYXNfYXJyYXkocC5hKQogICAgaWYgI3NoYXJlX2Ugfj0gI3NoYXJlX2EgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJzaGFyZSBhcnJheXMgbGVuZ3RoIG1pc21hdGNoIn0nIGVuZAogICAgZm9yIGkgPSAxLCAjc2hhcmVfZSBkbwogICAgICBpZiBzaGFyZV9lW2ldIDwgMC4wMDAxIHRoZW4gc2hhcmVfZVtpXSA9IDAuMDAwMSBlbmQKICAgICAgaWYgc2hhcmVfYVtpXSA8IDAuMDAwMSB0aGVuIHNoYXJlX2FbaV0gPSAwLjAwMDEgZW5kCiAgICBlbmQKICBlbmQKCiAgaWYgb3AgPT0gJ3BzaScgdGhlbiByZXR1cm4gZm10NChwc2lfY29yZShzaGFyZV9lLCBzaGFyZV9hKSkgZW5kCiAgaWYgb3AgPT0gJ2tsJyB0aGVuIHJldHVybiBmbXQ0KGtsX2NvcmUoc2hhcmVfZSwgc2hhcmVfYSkpIGVuZAogIGlmIG9wID09ICdjaGkyJyB0aGVuCiAgICBpZiBub3QgY291bnRzX2UgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJjaGkyIG5lZWRzIHJhdyBhcnJheXMifScgZW5kCiAgICByZXR1cm4gZm10NChjaGkyX2NvcmUoY291bnRzX2UsIGNvdW50c19hLCBjb3VudHNfYS50b3RhbF9uIG9yIDEpKQogIGVuZAogIGlmIG9wID09ICdyZXBvcnQnIHRoZW4KICAgIGxvY2FsIHBzaXYgPSBwc2lfY29yZShzaGFyZV9lLCBzaGFyZV9hKQogICAgbG9jYWwga2x2ID0ga2xfY29yZShzaGFyZV9lLCBzaGFyZV9hKQogICAgbG9jYWwgY2hpMnYgPSBjb3VudHNfZSBhbmQgY2hpMl9jb3JlKGNvdW50c19lLCBjb3VudHNfYSwgY291bnRzX2EudG90YWxfbiBvciAxKSBvciBuaWwKICAgIGxvY2FsIHZlcmRpY3QKICAgIGlmIHBzaXYgPCAwLjEwIHRoZW4gdmVyZGljdCA9ICduby1kcmlmdCcKICAgIGVsc2VpZiBwc2l2IDw9IDAuMjUgdGhlbiB2ZXJkaWN0ID0gJ21vZGVyYXRlLWRyaWZ0JwogICAgZWxzZSB2ZXJkaWN0ID0gJ3NpZ25pZmljYW50LWRyaWZ0JyBlbmQKICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KAogICAgICAneyJwc2kiOiVzLCJrbCI6JXMsImNoaTIiOiVzLCJ2ZXJkaWN0IjoiJXMiLCJiaW5zIjolZH0nLAogICAgICBzdHJpbmcuZm9ybWF0KCclLjRmJywgcm91bmQ0KHBzaXYpKSwKICAgICAgc3RyaW5nLmZvcm1hdCgnJS40ZicsIHJvdW5kNChrbHYpKSwKICAgICAgY2hpMnYgYW5kIHN0cmluZy5mb3JtYXQoJyUuNGYnLCByb3VuZDQoY2hpMnYpKSBvciAnbnVsbCcsCiAgICAgIHZlcmRpY3QsICNzaGFyZV9lKQogIGVuZAogIHJldHVybiAnJwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiB0cmdtCi0tIEBjYXRlZ29yeTogdWRmCi0tIEBkZXNjOiDlrZfnrKbkuInlhYPnu4Tnm7jkvLzluqbvvIjnp7vmpI0gUG9zdGdyZVNRTCBwZ190cmdt77yM6YCQ5L2N5a+55ouNIFBHIOWbnuW9kua1i+ivle+8ieOAggotLSAgICAgICBwZ190cmdtIOeahOebuOS8vOW6puS4jiBmdXp6eSDlupPnmoTnvJbovpHot53nprvml4/vvIhsZXYvamFyby9qd++8ieaYr+S4pOWll+S4jeWQjOeul+azle+8mgotLSAgICAgICBwZ190cmdtID0g5oqK5q+P5Liq5Y2V6K+N5bCP5YaZ5ZCO5oyJICIgIOWNleivjSAiIO+8iDIg5YmN57yA56m65qC8KzEg5ZCO57yA56m65qC877yJ5ruR56qX5Y+W5omA5pyJCi0tICAgICAgIDMg5a2X6IqC5LiJ5YWD57uE77yM5Lik5Liy5Y+W5LiJ5YWD57uE6ZuG5ZCI77yMc2ltaWxhcml0eSA9IHxB4oipQnwgLyB8QeKIqkJ877yISmFjY2FyZO+8ieOAggotLSAgICAgICBvcD0nc2ltJyAgIO+8mnNpbWlsYXJpdHkoYSxiKSDiiIhbMCwxXe+8jOi2iuWkp+i2iuWDj++8iFBHIGBzaW1pbGFyaXR5YCDlh73mlbAgLyBgJWAg5pON5L2c56ym55qE5qCH6YeP5qC45b+D77yJCi0tICAgICAgIG9wPSdkaXN0JyAg77yaMSAtIHNpbWlsYXJpdHnvvIzot53nprvvvIhQRyBgPC0+YCDmk43kvZznrKbvvIkKLS0gICAgICAgb3A9J3BjdCcgICDvvJpib29s77yMc2ltaWxhcml0eSA+PSAocC50aHJlc2hvbGQg6buY6K6kIDAuMynvvIznrYnku7cgUEcg55qEIGBhICUgYmAKLS0gICAgICAgb3A9J3dwY3QnICDvvJpib29s77yMc2ltaWxhcml0eSA+PSAocC50aHJlc2hvbGQg6buY6K6kIDAuNinvvIxgJWAg55qE5a2X6Z2i6ZiI5YC854mI77yIUEcgd29yZF9zaW1pbGFyaXR5IOaYr+WPpuS4gOWll+S9jee9rueul+azle+8jOingeS4i+i+ueeVjO+8iQotLSAgICAgICBvcD0ndHJnbScgIO+8mnNob3dfdHJnbShzKSDihpIg5o6S5bqP5Y676YeN5ZCO55qE5LiJ5YWD57uE6ZuG5ZCI77yM56uW57q/5YiG6ZqU77yIUEcgYHNob3dfdHJnbWDvvIkKLS0gICAgICAg5LiJ5YWD57uE5ZyoICoqVVRGLTgg5a2X6IqCKiog5LiK5YGa77yI5LiOIFBHIOS4gOiHtO+8muWkmuWtl+iKguWtl+espue7jyBjb21wYWN0X3RyaWdyYW0g5Y6L5oiQIDMg5a2X6IqC77yMCi0tICAgICAgIOS9hue6ryBBU0NJSSDlnLrmma/ljbPlrZfoioLkuInlhYPnu4TvvJtQRyDlm57lvZLmtYvor5XlhaggQVNDSUnvvIzpgJDkvY3kuIDoh7TvvInjgIIKLS0gICAgICAg5Y2V6K+NID0g5pyA5aSnIGFsbnVtIOi/nue7reaute+8iElTV09SRENIUu+8ie+8jOWwj+WGmeWMluWQjuWPguS4ju+8iEFTQ0lJIOWwj+WGme+8ieOAggotLSBAc291cmNlOiDnp7vmpI3oh6ogUG9zdGdyZVNRTCBjb250cmliL3BnX3RyZ20vdHJnbV9vcC5j77yITFBBRERJTkc9Mi9SUEFERElORz0xLCBDQUxDU01MPWNvdW50LyhsZW4xK2xlbjItY291bnQp77yJCi0tIEByZXF1aXJlczogbm9uZe+8iOe6ryBMdWHvvIzml6AgRkZJ77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0Ke+8m+eul+azlea6kOiHqiBQb3N0Z3JlU1FM77yIUG9zdGdyZVNRTCBMaWNlbnNl77yM5YW85a6577yJCi0tIEBtYXR1cml0eTogdGVzdGVk77yI5a+55ouNIFBHIOWbnuW9kua1i+ivlSA2MjArIOe7hCBzaW1pbGFyaXR5IOacn+acm+WAvO+8jOingSB0ZXN0X3RyZ20ubHVh77yJCi0tIOivmuWunui+ueeVjO+8muKRoCDmnKzlrp7njrDkuLrmoIfph4/nm7jkvLzluqbvvIwqKuS4jeWQqyBHSU4vR2lTVCDntKLlvJUqKu+8iER1Y2tEQiDml6Dlr7nlupTntKLlvJXmir3osaHvvIzliIbmnpDlnLrmma/pgJDooYznrpfljbPlj6/vvIwKLS0gICDnmb7kuIfooYzlhoXlj6/mjqXlj5fvvJvopoHntKLlvJXliqDpgJ/pnIAgQyDmianlsZXvvInjgILikaEgUEcg55qEIHdvcmRfc2ltaWxhcml0eSAvIHN0cmljdF93b3JkX3NpbWlsYXJpdHkKLS0gICDmmK/ln7rkuo7kuInlhYPnu4QqKuS9jee9rioq55qE5Y+m5LiA5aWX566X5rOV77yIY2FsY193b3JkX3NpbWlsYXJpdHnvvInvvIzmnKzlupPmnKrlrp7njrDigJTigJTpnIDopoHml7blj6bliqDjgIIKLS0gICDikaIg5aSa5a2X6IqC77yIQ0pL77yJ6LWwIFBHIOeahCBjb21wYWN0X3RyaWdyYW0g5Y6L57yp6Lev5b6E77yM5pys5bqT5oyJIFVURi04IOWtl+iKguS4ieWFg+e7hOi/keS8vO+8iEFTQ0lJIOmAkOS9jeS4gOiHtO+8jAotLSAgIENKSyDkuI4gUEcg5Y+v6IO95pyJIDEgdWxwIOe6p+W3ruW8gu+8jOaWh+aho+agh+azqO+8ieOAggotLQotLSBVc2FnZSAoZHVja2RiLWx1YWppdCwgc2NhbGFyIG1vZGUpOgotLSAgIGluc3RhbGw6ICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZTo9J2luc3RhbGwnLCBzcWxfbmFtZTo9J3RyZ20nKTsKLS0gICBzaW06ICAgICAgU0VMRUNUIGx1YWppdF9zKCd0cmdtJywge2E6J3F3ZXJ0eXUwOTg4JywgYjoncXdlcnR5dTA5ODAnLCBvcDonc2ltJ30pOyAg4oaSICcwLjcxNDI4NicKLS0gICBwY3Q6ICAgICAgU0VMRUNUIGx1YWppdF9zKCd0cmdtJywge2E6J1dPV2EgJywgYjond293Jywgb3A6J3BjdCd9KTsgICAgICAgICAgICAgICDihpIgJ3RydWUnCi0tICAgdHJnbTogICAgIFNFTEVDVCBsdWFqaXRfcygndHJnbScsIHt2OidhIGIgYycsIG9wOid0cmdtJ30pOyAgICAgICAgICAgICAgICAgICAgICAgIOKGkiAnICBhfCAgYnwgIGN8IGEgfCBiIHwgYyAnCmxvY2FsIHRyZ20gPSB7fQoKbG9jYWwgZnVuY3Rpb24gaXNfd29yZGNoYXIoYikKICAtLSBBU0NJSSBhbG51be+8iFBHIElTV09SRENIUiDlr7kgQVNDSUkg562J5Lu377ybbXVsdGlieXRlIOS4iyBQRyDnlKggdF9pc2FsbnVtX3dpdGhfbGVu77yM6L+Z6YeM5oyJ5a2X6IqC77yJCiAgcmV0dXJuIChiID49IDB4MzAgYW5kIGIgPD0gMHgzOSkKICAgICAgb3IgKGIgPj0gMHg0MSBhbmQgYiA8PSAweDVBKQogICAgICBvciAoYiA+PSAweDYxIGFuZCBiIDw9IDB4N0EpCmVuZAoKbG9jYWwgZnVuY3Rpb24gbG93ZXJfYXNjaWkoYikKICBpZiBiID49IDB4NDEgYW5kIGIgPD0gMHg1QSB0aGVuIHJldHVybiBiICsgMzIgZW5kCiAgcmV0dXJuIGIKZW5kCgotLSDlj5bkuIDkuKrlrZfnrKbkuLLnmoTmiYDmnInljZXor43vvIjmnIDlpKcgYWxudW0g5q6177yJ77yM5q+P5Liq5bCP5YaZ5YyW77yM6L+U5ZueIHt3b3JkLCAuLi59CmxvY2FsIGZ1bmN0aW9uIHdvcmRzKHMpCiAgbG9jYWwgb3V0ID0ge30KICBsb2NhbCBpLCBuID0gMSwgI3MKICB3aGlsZSBpIDw9IG4gZG8KICAgIGxvY2FsIGIgPSBzOmJ5dGUoaSkKICAgIGlmIGlzX3dvcmRjaGFyKGIpIHRoZW4KICAgICAgbG9jYWwgaiA9IGkKICAgICAgbG9jYWwgYnVmID0ge30KICAgICAgd2hpbGUgaiA8PSBuIGRvCiAgICAgICAgbG9jYWwgYyA9IHM6Ynl0ZShqKQogICAgICAgIGlmIG5vdCBpc193b3JkY2hhcihjKSB0aGVuIGJyZWFrIGVuZAogICAgICAgIGJ1ZlsjYnVmICsgMV0gPSBzOmJ5dGUoaikKICAgICAgICBqID0gaiArIDEKICAgICAgZW5kCiAgICAgIC0tIGxvd2VyY2FzZQogICAgICBmb3IgaywgY2IgaW4gaXBhaXJzKGJ1ZikgZG8gYnVmW2tdID0gbG93ZXJfYXNjaWkoY2IpIGVuZAogICAgICBvdXRbI291dCArIDFdID0gc3RyaW5nLmNoYXIodW5wYWNrKGJ1ZikpCiAgICAgIGkgPSBqCiAgICBlbHNlCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCi0tIOWNleS4quWNleivjSDihpIg5LiJ5YWD57uE6ZuG5ZCI77yIIiAgdyAiIOeahCAzIOWtl+iKgua7keeql++8jFNldDogdHJnbS0+dHJ1Ze+8iQpsb2NhbCBmdW5jdGlvbiB3b3JkX3RyaWdyYW1zKHcsIHNldCkKICBsb2NhbCBwID0gJyAgJyAuLiB3IC4uICcgJyAgIC0tIDIg5YmN57yA56m65qC8ICsgdyArIDEg5ZCO57yA56m65qC8CiAgbG9jYWwgbGVuID0gI3AKICBpZiBsZW4gPCAzIHRoZW4gcmV0dXJuIGVuZAogIGZvciBpID0gMSwgbGVuIC0gMiBkbwogICAgbG9jYWwgdCA9IHA6c3ViKGksIGkgKyAyKQogICAgaWYgbm90IHNldFt0XSB0aGVuIHNldFt0XSA9IHRydWUgZW5kCiAgZW5kCmVuZAoKLS0g5a2X56ym5LiyIOKGkiDkuInlhYPnu4Tpm4blkIjvvIhTZXTvvIkKbG9jYWwgZnVuY3Rpb24gZ2VuZXJhdGVfc2V0KHMpCiAgbG9jYWwgc2V0ID0ge30KICBmb3IgXywgdyBpbiBpcGFpcnMod29yZHMocykpIGRvCiAgICB3b3JkX3RyaWdyYW1zKHcsIHNldCkKICBlbmQKICByZXR1cm4gc2V0CmVuZAoKLS0g5Lik5LiqIFNldCDmsYIgfEHiiKlCfCDkuI4gfEHiiKpCfApsb2NhbCBmdW5jdGlvbiBpbnRlcl91bmlvbihBLCBCKQogIGxvY2FsIGNvdW50LCBsZW5BLCBsZW5CID0gMCwgMCwgMAogIGZvciBfIGluIHBhaXJzKEEpIGRvIGxlbkEgPSBsZW5BICsgMSBlbmQKICBmb3IgXyBpbiBwYWlycyhCKSBkbyBsZW5CID0gbGVuQiArIDEgZW5kCiAgaWYgbGVuQSA9PSAwIG9yIGxlbkIgPT0gMCB0aGVuIHJldHVybiAwLCAwIGVuZAogIGZvciB0IGluIHBhaXJzKEEpIGRvCiAgICBpZiBCW3RdIHRoZW4gY291bnQgPSBjb3VudCArIDEgZW5kCiAgZW5kCiAgbG9jYWwgdW5pb24gPSBsZW5BICsgbGVuQiAtIGNvdW50CiAgcmV0dXJuIGNvdW50LCB1bmlvbgplbmQKCmxvY2FsIGZ1bmN0aW9uIHNpbWlsYXJpdHkoYSwgYikKICBsb2NhbCBBLCBCID0gZ2VuZXJhdGVfc2V0KHRvc3RyaW5nKGEpKSwgZ2VuZXJhdGVfc2V0KHRvc3RyaW5nKGIpKQogIGxvY2FsIGNvdW50LCB1bmlvbiA9IGludGVyX3VuaW9uKEEsIEIpCiAgaWYgdW5pb24gPT0gMCB0aGVuIHJldHVybiAwLjAgZW5kCiAgcmV0dXJuIGNvdW50IC8gdW5pb24KZW5kCgotLSDmjpLluo/ljrvph43lkI7mjInlrZflhbjluo/ov5Tlm57kuInlhYPnu4TliJfooajvvIhQRyBzaG93X3RyZ20g5o6S5bqP5Li65a2X6IqC5bqP77yJCmxvY2FsIGZ1bmN0aW9uIHNob3dfdHJnbShzKQogIGxvY2FsIHNldCA9IGdlbmVyYXRlX3NldCh0b3N0cmluZyhzKSkKICBsb2NhbCBhcnIgPSB7fQogIGZvciB0IGluIHBhaXJzKHNldCkgZG8gYXJyWyNhcnIgKyAxXSA9IHQgZW5kCiAgdGFibGUuc29ydChhcnIpICAgLS0g5a2X6IqC5bqP77yITHVhIHN0cmluZyDmr5TovoMgPSDlrZfoioLluo/vvIkKICByZXR1cm4gdGFibGUuY29uY2F0KGFyciwgJ3wnKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGZtdDYoeCkKICAtLSBQRyBmbG9hdDQgKyBleHRyYV9mbG9hdF9kaWdpdHM9MCDmmL7npLrnuqYgNiDkvY3lsI/mlbAKICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJS42ZicsIHggKyAwKQplbmQKCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbiBwID0geyB2ID0gcCB9IGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBhID0gcC5hIG9yIHAudiBvciAnJwogIGxvY2FsIGIgPSBwLmIgb3IgJycKICBsb2NhbCBvcCA9IHAub3Agb3IgJ3NpbScKICBpZiBvcCA9PSAnc2ltJyB0aGVuCiAgICByZXR1cm4gZm10NihzaW1pbGFyaXR5KGEsIGIpKQogIGVsc2VpZiBvcCA9PSAnZGlzdCcgdGhlbgogICAgcmV0dXJuIGZtdDYoMSAtIHNpbWlsYXJpdHkoYSwgYikpCiAgZWxzZWlmIG9wID09ICdwY3QnIHRoZW4KICAgIGxvY2FsIHRoID0gKHAudGhyZXNob2xkIG9yIHAudGgpIG9yIDAuMwogICAgcmV0dXJuIHRvc3RyaW5nKHNpbWlsYXJpdHkoYSwgYikgPj0gdGgpCiAgZWxzZWlmIG9wID09ICd3cGN0JyB0aGVuCiAgICBsb2NhbCB0aCA9IChwLnRocmVzaG9sZCBvciBwLnRoKSBvciAwLjYKICAgIHJldHVybiB0b3N0cmluZyhzaW1pbGFyaXR5KGEsIGIpID49IHRoKQogIGVsc2VpZiBvcCA9PSAndHJnbScgdGhlbgogICAgcmV0dXJuIHNob3dfdHJnbShhKQogIGVuZAogIHJldHVybiAnJwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBsdHJlZQotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzog5bGC57qn6Lev5b6E77yI56e75qSNIFBvc3RncmVTUUwgbHRyZWUg5omp5bGV77yM6YCQ5L2N5a+55ouNIFBHIOWbnuW9kua1i+ivle+8ieOAgmx0cmVlIOaYr+OAjOeCueWIhuWxgue6p+i3r+W+hOOAjQotLSAgICAgICDnsbvlnovvvIjlpoIgJ1RvcC5DaGlsZDEuQ2hpbGQyJ++8ie+8jOeUqOS6juWIhuexu+agkS/nm67lvZXmoJEv5YiG57G757yW56CB55qE5YyF5ZCr44CB5YWs5YWx56WW5YWI44CB5a2Q6Lev5b6E6L+Q566X44CCCi0tICAgICAgIER1Y2tEQiDml6Dljp/nlJ8gbHRyZWUg57G75Z6L77yM5pys5bqT5oqK6Lev5b6E5b2T5a2X56ym5Liy44CB5oyJICcuJyDliIfliIblsYLnuqfvvIzpgJDlh73mlbDnp7vmpI0gUEcg6K+t5LmJ77yaCi0tICAgICAgIG9wPSdubGV2ZWwnICAg77yacC5wYXRoIOKGkiDlsYLnuqfmlbDvvIhQRyBgbmxldmVsYO+8ie+8jCcxLjIuMy40J+KGkjQKLS0gICAgICAgb3A9J3RleHQnICAgICDvvJpwLnBhdGgg4oaSIOWOn+agt+Wtl+espuS4su+8iFBHIGBsdHJlZTJ0ZXh0YO+8jOagoemqjOmdnuepuuWxgue6p++8iQotLSAgICAgICBvcD0nc3VibHRyZWUnIO+8mnAucGF0aCArIHAuc3RhcnQgKyBwLnN0b3Ag4oaSIOWPliBbc3RhcnQsc3RvcCkg5bGC57qn77yIMCDotbfvvIxzdG9wIOS4jeWQq++8ie+8iFBHIGBzdWJsdHJlZWDvvIkKLS0gICAgICAgICAgICAgICAgICAgICAgICdUb3AuQ2hpbGQxLkNoaWxkMicgc3RhcnQ9MSBzdG9wPTIg4oaSICdDaGlsZDEnCi0tICAgICAgIG9wPSdzdWJwYXRoJyAg77yacC5wYXRoICsgcC5zdGFydCArIChwLmxlbiDlj6/pgIkpIOKGkiBQRyBgc3VicGF0aGDvvIhzdGFydC9sZW4g5Y+v5Li66LSf77yMbGVuPTAg6KGo5Yiw5pyr5bC+77yJCi0tICAgICAgICAgICAgICAgICAgICAgICBzdWJwYXRoKHgsMCnihpLlhajkuLLvvJtzdWJwYXRoKHgsMSnihpLku47nrKwgMSDnuqfvvJtzdWJwYXRoKHgsLTEsMSnihpLmnKvnuqcKLS0gICAgICAgb3A9J2xjYScgICAgICDvvJpwLnBhdGhz77yI5pWw57uE77yJ4oaSIOacgOmVv+WFrOWFseelluWFiO+8iFBHIGBsY2Fg77yJ77yM5peg5YWs5YWx56WW5YWIL+WQq+epuui3r+W+hCDihpIgTlVMTO+8iOi/lOWbnuepuuS4su+8iQotLSAgICAgICAgICAgICAgICAgICAgICAgbGNhKCcxLjIuMycsJzEuMi4zLjQuNS42JynihpInMS4yJ++8m2xjYSgnMScp4oaSTlVMTAotLSAgICAgICBvcD0naXNwYXJlbnQnIO+8mnAucGFyZW50ICsgcC5jaGlsZCDihpIgcGFyZW50IOaYr+WQpiBjaGlsZCDnmoTliY3nvIDlsYLnuqfvvIhQRyBgaXNwYXJlbnRgL2A8QGDvvIkKLS0gICAgICAgICAgICAgICAgICAgICAgICdUb3AnIGlzcGFyZW50ICdUb3AuQ2hpbGQxJ+KGknRydWUKLS0gICAgICAgb3A9J2Rlc2MnICAgICDvvJpjaGlsZCDmmK/lkKbkuLogcGFyZW50IOeahOWtkO+8iOWQq+iHqui6q++8ieKAlOKAlOetieS7tyBpc3BhcmVudChwYXJlbnQsY2hpbGQp77yMUEcgYCFAYAotLSAgICAgICBvcD0nY29udGFpbnMnIO+8mnAuYSArIHAuYiDihpIgYiDmmK/lkKbkvZzkuLrov57nu63lrZDot6/lvoTlh7rnjrDlnKggYSDlhoXvvIhQRyBgQGAvYGx0cmVlX2luZGV4YD49MO+8iQotLSAgICAgICAgICAgICAgICAgICAgICAgJ2EuYi5jLmQnIGNvbnRhaW5zICdiLmMn4oaSdHJ1ZQotLSAgICAgICBvcD0nY29uY2F0JyAgIO+8mnAuYSB8fCBwLmIg5bGC57qn5ou85o6l77yIUEcgYHx8YO+8iQotLSAgICAgICBvcD0nY21wJyAgICAgIO+8mnAuYSArIHAuYiDihpIg5bGC57qn5a2X5YW45bqP5q+U6L6DIC0xLzAvMe+8iFBHIGA8PT5g77yM5L6bIFNRTCDnianljJbplK7mjpLluo/vvIkKLS0gICAgICAg5bGC57qn5LiK6ZmQIDY1NTM177yI5a+56b2QIFBHIExUUkVFX01BWF9MRVZFTFPvvInjgIIKLS0gQHNvdXJjZTog56e75qSN6IeqIFBvc3RncmVTUUwgY29udHJpYi9sdHJlZS9sdHJlZV9vcC5j77yIbGNhX2lubmVyL2lubmVyX3N1Ymx0cmVlL2lubmVyX2lzcGFyZW5077yJCi0tIEByZXF1aXJlczogbm9uZe+8iOe6ryBMdWHvvIzml6AgRkZJ77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0Ke+8m+eul+azlea6kOiHqiBQb3N0Z3JlU1FM77yIUG9zdGdyZVNRTCBMaWNlbnNl77yM5YW85a6577yJCi0tIEBtYXR1cml0eTogdGVzdGVk77yI5a+55ouNIFBHIGx0cmVlLm91dCDlm57lvZLmnJ/mnJvlgLzvvIzop4EgdGVzdF9sdHJlZS5sdWHvvIkKLS0g6K+a5a6e6L6555WM77ya4pGgIGx0cmVlIOeahCBHaVNUIOe0ouW8le+8iGA8QGAvYEBgIOi1sOe0ouW8le+8ieaXoOWvueW6lOKAlOKAlER1Y2tEQiDml6Dor6XntKLlvJXmir3osaHvvIzpgJDooYznrpfjgIIKLS0gICDikaEgbGNhIOeahOOAjOWFrOWFseelluWFiOmVv+W6piDiiaQg6aaW6Lev5b6E5bGC5pWwLTHjgI3or63kuYnkuKXmoLznhafmkKzvvIjpppbot6/lvoToh6rouqvkuI3nrpfnpZblhYjvvInjgIIKLS0KLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQsIHNjYWxhciBtb2RlKToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSdsdHJlZScpOwotLSAgIG5sZXZlbDogICBTRUxFQ1QgbHVhaml0X2koJ2x0cmVlJywge3BhdGg6JzEuMi4zLjQnLCBvcDonbmxldmVsJ30pOyAgICAgICAgICDihpIgNAotLSAgIHN1YnBhdGg6ICBTRUxFQ1QgbHVhaml0X3MoJ2x0cmVlJywge3BhdGg6J1RvcC5DaGlsZDEuQ2hpbGQyJywgc3RhcnQ6MSwgb3A6J3N1YnBhdGgnfSk7IOKGkiAnQ2hpbGQxLkNoaWxkMicKLS0gICBsY2E6ICAgICAgU0VMRUNUIGx1YWppdF9zKCdsdHJlZScsIHtwYXRoczpbJzEuMi4zJywnMS4yLjMuNC41LjYnXSwgb3A6J2xjYSd9KTsgICAgICAgICDihpIgJzEuMicKLS0gICBpc3BhcmVudDogU0VMRUNUIGx1YWppdF9iKCdsdHJlZScsIHtwYXJlbnQ6J1RvcCcsIGNoaWxkOidUb3AuQ2hpbGQxJywgb3A6J2lzcGFyZW50J30pOyDihpIgdHJ1ZQoKbG9jYWwgTUFYX0xFVkVMUyA9IDY1NTM1CgotLSDliIfliIblsYLnuqfvvJrmjIkgJy4nIOWIhu+8jOS/neeVmeepuuWxgue6p++8iFBHIOWFgeiuuOepuiBsYWJlbO+8iQpsb2NhbCBmdW5jdGlvbiBzcGxpdF9sZXZlbHMocGF0aCkKICBsb2NhbCBvdXQgPSB7fQogIGlmIHBhdGggPT0gbmlsIHRoZW4gcmV0dXJuIG91dCBlbmQKICBpZiBwYXRoID09ICcnIHRoZW4gcmV0dXJuIG91dCBlbmQKICBmb3IgcGFydCBpbiAocGF0aCAuLiAnLicpOmdtYXRjaCgnKC4tKSUuJykgZG8KICAgIG91dFsjb3V0ICsgMV0gPSBwYXJ0CiAgZW5kCiAgcmV0dXJuIG91dAplbmQKCmxvY2FsIGZ1bmN0aW9uIGpvaW5fbGV2ZWxzKGxldmVscykKICByZXR1cm4gdGFibGUuY29uY2F0KGxldmVscywgJy4nKQplbmQKCmxvY2FsIGZ1bmN0aW9uIGNoZWNrX2xldmVscyhuKQogIGlmIG4gPiBNQVhfTEVWRUxTIHRoZW4KICAgIGVycm9yKCgnbnVtYmVyIG9mIGx0cmVlIGxldmVscyAoJWQpIGV4Y2VlZHMgdGhlIG1heGltdW0gYWxsb3dlZCAoJWQpJyk6Zm9ybWF0KG4sIE1BWF9MRVZFTFMpKQogIGVuZAplbmQKCmxvY2FsIGZ1bmN0aW9uIG5sZXZlbChwYXRoKQogIHJldHVybiAjc3BsaXRfbGV2ZWxzKHBhdGgpCmVuZAoKLS0gaW5uZXJfc3VibHRyZWUocGF0aCwgc3RhcnQsIGVuZCnvvJowIOi1t++8jFtzdGFydCxlbmQp77yMZW5kIOWQq+WIsCBudW1sZXZlbCDkuLrmraIKbG9jYWwgZnVuY3Rpb24gaW5uZXJfc3VibHRyZWUocGF0aCwgc3RhcnRwb3MsIGVuZHBvcykKICBsb2NhbCBsZXZlbHMgPSBzcGxpdF9sZXZlbHMocGF0aCkKICBsb2NhbCBubCA9ICNsZXZlbHMKICBpZiBzdGFydHBvcyA8IDAgb3IgZW5kcG9zIDwgMCBvciBzdGFydHBvcyA+PSBubCBvciBzdGFydHBvcyA+IGVuZHBvcyB0aGVuCiAgICBlcnJvcignaW52YWxpZCBwb3NpdGlvbnMnKQogIGVuZAogIGlmIGVuZHBvcyA+IG5sIHRoZW4gZW5kcG9zID0gbmwgZW5kCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaSA9IHN0YXJ0cG9zLCBlbmRwb3MgLSAxIGRvIG91dFsjb3V0ICsgMV0gPSBsZXZlbHNbaSArIDFdIGVuZAogIGNoZWNrX2xldmVscygjb3V0KQogIHJldHVybiBvdXQKZW5kCgpsb2NhbCBmdW5jdGlvbiBsY2FfaW5uZXIoYXJyKQogIGxvY2FsIGxlbiA9ICNhcnIKICBpZiBsZW4gPD0gMCB0aGVuIHJldHVybiBuaWwgZW5kCiAgbG9jYWwgZmlyc3QgPSBzcGxpdF9sZXZlbHMoYXJyWzFdKQogIGlmICNmaXJzdCA9PSAwIHRoZW4gcmV0dXJuIG5pbCBlbmQKICBsb2NhbCBudW0gPSAjZmlyc3QgLSAxICAgLS0g5YWs5YWx56WW5YWI6ZW/5bqmIOKJpCDpppbot6/lvoTlsYLmlbAgLSAxCiAgZm9yIGlkeCA9IDIsIGxlbiBkbwogICAgbG9jYWwgcCA9IHNwbGl0X2xldmVscyhhcnJbaWR4XSkKICAgIGlmICNwID09IDAgdGhlbgogICAgICByZXR1cm4gbmlsCiAgICBlbHNlaWYgI3AgPT0gMSB0aGVuCiAgICAgIG51bSA9IDAKICAgIGVsc2UKICAgICAgbG9jYWwgdG1wID0gbWF0aC5taW4obnVtLCAjcCAtIDEpCiAgICAgIGxvY2FsIG4gPSAwCiAgICAgIGZvciBpID0gMCwgdG1wIC0gMSBkbwogICAgICAgIGlmIGZpcnN0W2kgKyAxXSA9PSBwW2kgKyAxXSB0aGVuCiAgICAgICAgICBuID0gaSArIDEKICAgICAgICBlbHNlCiAgICAgICAgICBicmVhawogICAgICAgIGVuZAogICAgICBlbmQKICAgICAgbnVtID0gbgogICAgZW5kCiAgZW5kCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgaSA9IDEsIG51bSBkbyBvdXRbaV0gPSBmaXJzdFtpXSBlbmQKICByZXR1cm4gb3V0CmVuZAoKbG9jYWwgZnVuY3Rpb24gaXNwYXJlbnQocGFyZW50LCBjaGlsZCkKICBsb2NhbCBwbCA9IHNwbGl0X2xldmVscyhwYXJlbnQpCiAgbG9jYWwgY2wgPSBzcGxpdF9sZXZlbHMoY2hpbGQpCiAgaWYgI3BsID4gI2NsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGZvciBpID0gMSwgI3BsIGRvCiAgICBpZiBwbFtpXSB+PSBjbFtpXSB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCi0tIGx0cmVlX2luZGV4KGEsIGIsIHN0YXJ0Ke+8mmIg5piv5ZCm5L2c5Li66L+e57ut5a2Q6Lev5b6E5Ye6546w5ZyoIGEg5YaF77yI5LuOIHN0YXJ0IOe6p++8jDAg6LW377yJCmxvY2FsIGZ1bmN0aW9uIGx0cmVlX2luZGV4KGEsIGIsIHN0YXJ0KQogIGxvY2FsIGFsID0gc3BsaXRfbGV2ZWxzKGEpCiAgbG9jYWwgYmwgPSBzcGxpdF9sZXZlbHMoYikKICBpZiBzdGFydCA8IDAgdGhlbgogICAgaWYgLXN0YXJ0ID49ICNhbCB0aGVuIHN0YXJ0ID0gMCBlbHNlIHN0YXJ0ID0gI2FsICsgc3RhcnQgZW5kCiAgZW5kCiAgaWYgI2FsIC0gc3RhcnQgPCAjYmwgb3IgI2FsID09IDAgb3IgI2JsID09IDAgdGhlbiByZXR1cm4gLTEgZW5kCiAgZm9yIGkgPSBzdGFydCwgI2FsIC0gI2JsIGRvCiAgICBsb2NhbCBvayA9IHRydWUKICAgIGZvciBqID0gMSwgI2JsIGRvCiAgICAgIGlmIGFsW2kgKyBqXSB+PSBibFtqXSB0aGVuIG9rID0gZmFsc2UgYnJlYWsgZW5kCiAgICBlbmQKICAgIGlmIG9rIHRoZW4gcmV0dXJuIGkgZW5kCiAgZW5kCiAgcmV0dXJuIC0xCmVuZAoKLS0g5bGC57qn5a2X5YW45bqP5q+U6L6D77yIUEcgbHRyZWVfY29tcGFyZe+8mumAkOe6pyBtZW1jbXDvvIzplb/luqbkuI3lkIzlj5bnn63plb/lt67vvIzmnIDlkI7mr5TlsYLmlbDvvIkKbG9jYWwgZnVuY3Rpb24gY21wKGEsIGIpCiAgbG9jYWwgYWwsIGJsID0gc3BsaXRfbGV2ZWxzKGEpLCBzcGxpdF9sZXZlbHMoYikKICBsb2NhbCBhbiwgYm4gPSAjYWwsICNibAogIGxvY2FsIG4gPSBtYXRoLm1pbihhbiwgYm4pCiAgZm9yIGkgPSAxLCBuIGRvCiAgICBpZiBhbFtpXSB+PSBibFtpXSB0aGVuCiAgICAgIGlmIGFsW2ldIDwgYmxbaV0gdGhlbiByZXR1cm4gLTEgZW5kCiAgICAgIHJldHVybiAxCiAgICBlbmQKICAgIC0tIOWQjOWJjee8gOS9humVv+W6puS4jeWQjO+8iOS4gOS4qiBsYWJlbCDmmK/lj6bkuIDkuKrnmoTnnJ/liY3nvIDvvIkKICAgIGlmICNhbFtpXSB+PSAjYmxbaV0gdGhlbgogICAgICBpZiAjYWxbaV0gPCAjYmxbaV0gdGhlbiByZXR1cm4gLTEgZW5kCiAgICAgIHJldHVybiAxCiAgICBlbmQKICBlbmQKICBpZiBhbiB+PSBibiB0aGVuCiAgICBpZiBhbiA8IGJuIHRoZW4gcmV0dXJuIC0xIGVuZAogICAgcmV0dXJuIDEKICBlbmQKICByZXR1cm4gMAplbmQKCmxvY2FsIGZ1bmN0aW9uIHJ1bihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbiBwID0geyBwYXRoID0gcCB9IGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBvcCA9IHAub3Agb3IgJ3RleHQnCiAgaWYgb3AgPT0gJ25sZXZlbCcgdGhlbgogICAgcmV0dXJuIG5sZXZlbChwLnBhdGgpCiAgZWxzZWlmIG9wID09ICd0ZXh0JyB0aGVuCiAgICByZXR1cm4gdG9zdHJpbmcocC5wYXRoIG9yICcnKQogIGVsc2VpZiBvcCA9PSAnc3VibHRyZWUnIHRoZW4KICAgIGxvY2FsIGxzID0gaW5uZXJfc3VibHRyZWUodG9zdHJpbmcocC5wYXRoKSwgcC5zdGFydCwgcC5zdG9wKQogICAgcmV0dXJuIGpvaW5fbGV2ZWxzKGxzKQogIGVsc2VpZiBvcCA9PSAnc3VicGF0aCcgdGhlbgogICAgbG9jYWwgcGF0aCA9IHRvc3RyaW5nKHAucGF0aCkKICAgIGxvY2FsIGxldmVscyA9IHNwbGl0X2xldmVscyhwYXRoKQogICAgbG9jYWwgbmwgPSAjbGV2ZWxzCiAgICBsb2NhbCBzdGFydCA9IHAuc3RhcnQKICAgIGxvY2FsIGhhc19sZW4gPSAocC5sZW4gfj0gbmlsKQogICAgbG9jYWwgbGVuID0gaGFzX2xlbiBhbmQgcC5sZW4gb3IgMAogICAgaWYgc3RhcnQgPCAwIHRoZW4gc3RhcnQgPSBubCArIHN0YXJ0IGVuZCAgIC0tIFBHIOWFiOW9kuS4gOWMliBzdGFydAogICAgbG9jYWwgZW5kcAogICAgaWYgbGVuIDwgMCB0aGVuCiAgICAgIGVuZHAgPSBubCArIGxlbgogICAgZWxzZWlmIGxlbiA9PSAwIHRoZW4KICAgICAgLS0gUEc6IGxlbj09MCDml7bvvIwzLWFyZyDihpIgZW5kPXN0YXJ077yI56m677yJ77ybMi1hcmfvvIjmnKrnu5kgbGVu77yJ4oaSIGVuZD1NQVjvvIjliLDmnKvlsL7vvIkKICAgICAgZW5kcCA9IGhhc19sZW4gYW5kIHN0YXJ0IG9yIE1BWF9MRVZFTFMKICAgIGVsc2UKICAgICAgZW5kcCA9IHN0YXJ0ICsgbGVuCiAgICBlbmQKICAgIGlmIGVuZHAgPiBubCB0aGVuIGVuZHAgPSBubCBlbmQKICAgIGlmIHN0YXJ0IDwgMCBvciBlbmRwIDwgMCBvciBzdGFydCA+PSBubCBvciBzdGFydCA+IGVuZHAgdGhlbgogICAgICByZXR1cm4gJ0VSUjogaW52YWxpZCBwb3NpdGlvbnMnCiAgICBlbmQKICAgIGxvY2FsIGxzID0gaW5uZXJfc3VibHRyZWUocGF0aCwgc3RhcnQsIGVuZHApCiAgICByZXR1cm4gam9pbl9sZXZlbHMobHMpCiAgZWxzZWlmIG9wID09ICdsY2EnIHRoZW4KICAgIGxvY2FsIHBhdGhzID0gcC5wYXRocwogICAgaWYgdHlwZShwYXRocykgPT0gJ3N0cmluZycgdGhlbiBwYXRocyA9IHsgcGF0aHMgfSBlbmQKICAgIGlmIHR5cGUocGF0aHMpIH49ICd0YWJsZScgb3IgI3BhdGhzID09IDAgdGhlbiByZXR1cm4gJycgZW5kCiAgICBsb2NhbCByID0gbGNhX2lubmVyKHBhdGhzKQogICAgaWYgciA9PSBuaWwgdGhlbiByZXR1cm4gJycgZW5kICAgLS0gUEcg6L+U5ZueIE5VTEwKICAgIHJldHVybiBqb2luX2xldmVscyhyKQogIGVsc2VpZiBvcCA9PSAnaXNwYXJlbnQnIHRoZW4KICAgIHJldHVybiB0b3N0cmluZyhpc3BhcmVudCh0b3N0cmluZyhwLnBhcmVudCksIHRvc3RyaW5nKHAuY2hpbGQpKSkKICBlbHNlaWYgb3AgPT0gJ2Rlc2MnIHRoZW4KICAgIHJldHVybiB0b3N0cmluZyhpc3BhcmVudCh0b3N0cmluZyhwLnBhcmVudCksIHRvc3RyaW5nKHAuY2hpbGQpKSkKICBlbHNlaWYgb3AgPT0gJ2NvbnRhaW5zJyB0aGVuCiAgICByZXR1cm4gdG9zdHJpbmcobHRyZWVfaW5kZXgodG9zdHJpbmcocC5hKSwgdG9zdHJpbmcocC5iKSwgcC5zdGFydCBvciAwKSA+PSAwKQogIGVsc2VpZiBvcCA9PSAnY29uY2F0JyB0aGVuCiAgICBsb2NhbCBhbCwgYmwgPSBzcGxpdF9sZXZlbHModG9zdHJpbmcocC5hKSksIHNwbGl0X2xldmVscyh0b3N0cmluZyhwLmIpKQogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBpID0gMSwgI2FsIGRvIG91dFtpXSA9IGFsW2ldIGVuZAogICAgZm9yIGkgPSAxLCAjYmwgZG8gb3V0WyNvdXQgKyAxXSA9IGJsW2ldIGVuZAogICAgY2hlY2tfbGV2ZWxzKCNvdXQpCiAgICByZXR1cm4gam9pbl9sZXZlbHMob3V0KQogIGVsc2VpZiBvcCA9PSAnY21wJyB0aGVuCiAgICByZXR1cm4gdG9zdHJpbmcoY21wKHRvc3RyaW5nKHAuYSksIHRvc3RyaW5nKHAuYikpKQogIGVuZAogIHJldHVybiAnJwplbmQKCnJldHVybiBmdW5jdGlvbihwKQogIHJldHVybiBydW4ocCkKZW5kCgAtLSBAbGliOiBmdXp6eQotLSBAY2F0ZWdvcnk6IHVkZgotLSBAZGVzYzog5a2X56ym5Liy55u45Ly85bqmL+i3neemu+eul+azle+8iOe6ryBMdWHvvIzoh6rljIXlkKvvvIxVVEYtOCDmhJ/nn6XvvInjgIIKLS0gICAgICAgb3A9J2xldifvvJrnvJbovpHot53nprvvvIhMZXZlbnNodGVpbu+8jOS7o+eggeeCuee6p++8ie+8mwotLSAgICAgICBvcD0nbm9ybWxldifvvJrlvZLkuIDljJbnvJbovpHot53nprsgPSBsZXYgLyBtYXgobGVuKe+8jOKIiFswLDFd77yM6LaK5bCP6LaK5YOP77ybCi0tICAgICAgIG9wPSdqYXJvJ++8mkphcm8g55u45Ly85bqmIOKIiFswLDFd77yI5a+555+t5LiyL+Wnk+WQjeWPi+Wlve+8ie+8mwotLSAgICAgICBvcD0nancn77yaSmFyby1XaW5rbGVyIOebuOS8vOW6piDiiIhbMCwxXe+8iOWJjee8gOWKoOadg++8jOm7mOiupCBwPTAuMjXvvIxgcC5wYCDlj6/osIPvvInvvJsKLS0gICAgICAgb3A9J3NpbSfvvJrpu5jorqTlj5YganfvvIhgcC5tZXRyaWNgPSdqdyd8J2phcm8nfCdsZXYnIOmAieaMh+agh++8jGxldiDml7bkuLogMS1ub3JtbGV277yJ77ybCi0tICAgICAgIG9wPSdzaW1yYW5rJ++8mue7meWumuWAmemAieWIl+ihqCBgcC5jYW5kc2AgKyDnm67moIcgYHAudmDvvIzmjInnm7jkvLzluqbpmY3luo/ov5Tlm54KLS0gICAgICAgICAgICAgICAgICAgICAiaWR4OnNjb3JlIiDliJfooajvvIjorrDlvZXpk77mjqUgLyDlp5PlkI3ljLnphY0gLyDljrvph43nmoTmiZPliIbmoLjlv4PvvInjgIIKLS0gICAgICAg5omA5pyJ566X5rOV5ZyoICoqVVRGLTgg6Kej56CB5ZCO55qEIFVuaWNvZGUg5Luj56CB54K5Kiog5LiK6L+b6KGM77yI5Lit5paH5a2X56ymPTEg5Liq5Y2V5YWD77yMCi0tICAgICAgIOmBv+WFjeWtl+iKgue6p+mAgOWMlu+8mueOi+Wwj+aYjiB2cyDnjovlsI/msJEg5a2X6IqC57qnIGp3IOS8mumUmeivr+W+lyAxLjDvvIzku6PnoIHngrnnuqflvpcgMC44NzXvvInjgIIKLS0gQHNvdXJjZTogb3JpZ2luYWzvvIhkdWNrZGItbHVhaml0IOezu+WIl++8jOiHquWMheWQq+aXoOWklumDqOS+nei1lu+8iQotLSBAcmVxdWlyZXM6IG5vbmUKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tIOivmuWunui+ueeVjO+8mkphcm8tV2lua2xlciDliY3nvIDplb/luqbkuIrpmZAgNO+8iOe7j+WFuOWumuS5ie+8ie+8m2BzaW1yYW5rYCDlgJnpgInmlbDku6Xnmb7orqHkuLrmnIDkvbPvvIwKLS0g5LiH57qn5Lul5LiK6K+35pS56LWwIFNRTCDnq68gam9pbiArIOacrOWHveaVsOaJk+WIhuOAgmxldiDnlKggTyhsZW5fYSDDlyBsZW5fYikgRFDvvIjnn63kuLLmnIDkvJjvvInjgIIKLS0KLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQsIHNjYWxhciBtb2RlKToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSdmdXp6eScpOwotLSAgIGxldjogICAgICBTRUxFQ1QgbHVhaml0X3MoJ2Z1enp5Jywge2E6J2tpdHRlbicsIGI6J3NpdHRpbmcnLCBvcDonbGV2J30pOyAgIOKGkiAnMycKLS0gICBub3JtbGV2OiAgU0VMRUNUIGx1YWppdF9zKCdmdXp6eScsIHthOidraXR0ZW4nLCBiOidzaXR0aW5nJywgb3A6J25vcm1sZXYnfSk7LS0g4oaSICcwLjQyODYnCi0tICAganc6ICAgICAgIFNFTEVDVCBsdWFqaXRfcygnZnV6enknLCB7YTonbWFydGhhJywgYjonbWFyaHRhJywgb3A6J2p3J30pOyAgICDihpIgJzAuOTg2MScKLS0gICBzaW1yYW5rOiAgU0VMRUNUIGx1YWppdF9zKCdmdXp6eScsIHt2OifljJfkuqwnLAotLSAgICAgICAgICAgICAgICBjYW5kczogWyfljJfkuqwnLCfljJfkuqzkuIrmtbcnLCfkuqwnLCfljJfkuqzkuIrmtbflub/lt54nXSwgb3A6J3NpbXJhbmsnfSk7Ci0tICAgICAgICAgICAgIOKGkiAnMToxLjAwMDAgNDowLjg3NTAgMjowLjc1MDAgMzowLjYyNTAnICAoaWR4IDEtYmFzZWQsIHNjb3JlPWp3KQoKbG9jYWwgZnV6enkgPSB7fQoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVVEYtOCDop6PnoIHvvJrlrZfnrKbkuLIg4oaSIOS7o+eggeeCueaVsOe7hO+8iEJNUCArIOWinuihpeW5s+mdou+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHV0ZjhjcChzKQogIGxvY2FsIGNwcyA9IHt9CiAgbG9jYWwgaSA9IDEKICBsb2NhbCBuID0gI3MKICB3aGlsZSBpIDw9IG4gZG8KICAgIGxvY2FsIGIxID0gczpieXRlKGkpCiAgICBsb2NhbCBjcCwgbGVuCiAgICBpZiBiMSA8IDB4ODAgdGhlbgogICAgICBjcCwgbGVuID0gYjEsIDEKICAgIGVsc2VpZiBiMSA+PSAweEMwIGFuZCBiMSA8IDB4RTAgdGhlbgogICAgICBsb2NhbCBiMiA9IHM6Ynl0ZShpICsgMSkgb3IgMAogICAgICBjcCA9IChiMSAtIDB4QzApICogNjQgKyAoYjIgLSAweDgwKQogICAgICBsZW4gPSAyCiAgICBlbHNlaWYgYjEgPj0gMHhFMCBhbmQgYjEgPCAweEYwIHRoZW4KICAgICAgbG9jYWwgYjIsIGIzID0gczpieXRlKGkgKyAxKSBvciAwLCBzOmJ5dGUoaSArIDIpIG9yIDAKICAgICAgY3AgPSAoYjEgLSAweEUwKSAqIDQwOTYgKyAoYjIgLSAweDgwKSAqIDY0ICsgKGIzIC0gMHg4MCkKICAgICAgbGVuID0gMwogICAgZWxzZWlmIGIxID49IDB4RjAgYW5kIGIxIDwgMHhGOCB0aGVuCiAgICAgIGxvY2FsIGIyLCBiMywgYjQgPSBzOmJ5dGUoaSArIDEpIG9yIDAsIHM6Ynl0ZShpICsgMikgb3IgMCwgczpieXRlKGkgKyAzKSBvciAwCiAgICAgIGNwID0gKGIxIC0gMHhGMCkgKiAyNjIxNDQgKyAoYjIgLSAweDgwKSAqIDQwOTYgKyAoYjMgLSAweDgwKSAqIDY0ICsgKGI0IC0gMHg4MCkKICAgICAgbGVuID0gNAogICAgZWxzZQogICAgICBjcCwgbGVuID0gYjEsIDEgIC0tIOmdnuazlei1t+Wni+Wtl+iKgu+8muaMieWNleWtl+iKguWFnOW6lQogICAgZW5kCiAgICBjcHNbI2NwcyArIDFdID0gY3AKICAgIGkgPSBpICsgbGVuCiAgZW5kCiAgcmV0dXJuIGNwcwplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gTGV2ZW5zaHRlaW4g57yW6L6R6Led56a777yI5Luj56CB54K55pWw57uE57qn77yMTyhtwrduKSBEUO+8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGxldl9jcChBLCBCKQogIGxvY2FsIG0sIG4gPSAjQSwgI0IKICBpZiBtID09IDAgdGhlbiByZXR1cm4gbiBlbmQKICBpZiBuID09IDAgdGhlbiByZXR1cm4gbSBlbmQKICBpZiBBID09IEIgdGhlbiByZXR1cm4gMCBlbmQKICBsb2NhbCBwcmV2ID0ge30KICBmb3IgaiA9IDAsIG4gZG8gcHJldltqXSA9IGogZW5kCiAgZm9yIGkgPSAxLCBtIGRvCiAgICBsb2NhbCBjdXIgPSB7IFswXSA9IGkgfQogICAgbG9jYWwgYWkgPSBBW2ldCiAgICBmb3IgaiA9IDEsIG4gZG8KICAgICAgbG9jYWwgYyA9IChhaSA9PSBCW2pdKSBhbmQgMCBvciAxCiAgICAgIGN1cltqXSA9IG1hdGgubWluKHByZXZbal0gKyAxLCBjdXJbaiAtIDFdICsgMSwgcHJldltqIC0gMV0gKyBjKQogICAgZW5kCiAgICBwcmV2ID0gY3VyCiAgZW5kCiAgcmV0dXJuIHByZXZbbl0KZW5kCgpsb2NhbCBmdW5jdGlvbiBsZXYoYSwgYikKICBpZiBhID09IGIgdGhlbiByZXR1cm4gMCBlbmQKICBsb2NhbCBBLCBCID0gdXRmOGNwKGEpLCB1dGY4Y3AoYikKICByZXR1cm4gbGV2X2NwKEEsIEIpCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBKYXJvIOebuOS8vOW6pu+8iOS7o+eggeeCueaVsOe7hOe6p++8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGphcm9fY3AoQSwgQikKICBsb2NhbCBtMSwgbTIgPSAjQSwgI0IKICBpZiBtMSA9PSAwIGFuZCBtMiA9PSAwIHRoZW4gcmV0dXJuIDEgZW5kCiAgaWYgbTEgPT0gMCBvciBtMiA9PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgaWYgbTEgPT0gMSBhbmQgbTIgPT0gMSB0aGVuIHJldHVybiAoQVsxXSA9PSBCWzFdKSBhbmQgMSBvciAwIGVuZAogIGxvY2FsIG1kID0gbWF0aC5mbG9vcihtYXRoLm1heChtMSwgbTIpIC8gMikgLSAxCiAgaWYgbWQgPCAwIHRoZW4gbWQgPSAwIGVuZAogIGxvY2FsIGJ1c2VkLCBhbWF0Y2hlZCwgbSA9IHt9LCB7fSwgMAogIGZvciBpID0gMSwgbTEgZG8KICAgIGxvY2FsIGxvID0gaSA+IG1kIGFuZCAoaSAtIG1kKSBvciAxCiAgICBsb2NhbCBoaSA9IGkgKyBtZCA8PSBtMiBhbmQgKGkgKyBtZCkgb3IgbTIKICAgIGZvciBqID0gbG8sIGhpIGRvCiAgICAgIGlmIG5vdCBidXNlZFtqXSBhbmQgQVtpXSA9PSBCW2pdIHRoZW4KICAgICAgICBidXNlZFtqXSA9IHRydWUKICAgICAgICBhbWF0Y2hlZFtpXSA9IHRydWUKICAgICAgICBtID0gbSArIDEKICAgICAgICBicmVhawogICAgICBlbmQKICAgIGVuZAogIGVuZAogIGlmIG0gPT0gMCB0aGVuIHJldHVybiAwIGVuZAogIGxvY2FsIHRyYW5zLCBrID0gMCwgMQogIGZvciBpID0gMSwgbTEgZG8KICAgIGlmIGFtYXRjaGVkW2ldIHRoZW4KICAgICAgd2hpbGUgbm90IGJ1c2VkW2tdIGRvIGsgPSBrICsgMSBlbmQKICAgICAgaWYgQVtpXSB+PSBCW2tdIHRoZW4gdHJhbnMgPSB0cmFucyArIDEgZW5kCiAgICAgIGsgPSBrICsgMQogICAgZW5kCiAgZW5kCiAgbG9jYWwgZCA9IHRyYW5zIC8gMgogIHJldHVybiAobSAvIG0xICsgbSAvIG0yICsgKG0gLSBkKSAvIG0pIC8gMwplbmQKCmxvY2FsIGZ1bmN0aW9uIGphcm8oYSwgYikKICByZXR1cm4gamFyb19jcCh1dGY4Y3AoYSksIHV0ZjhjcChiKSkKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEphcm8tV2lua2xlcu+8iOWJjee8gOWKoOadg++8jOe7j+WFuOWJjee8gOS4iumZkCA077yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gandfY3AoQSwgQiwgcCkKICBwID0gcCBvciAwLjI1CiAgbG9jYWwgbTEsIG0yID0gI0EsICNCCiAgaWYgbTEgPT0gMCBhbmQgbTIgPT0gMCB0aGVuIHJldHVybiAxIGVuZAogIGlmIG0xID09IDAgb3IgbTIgPT0gMCB0aGVuIHJldHVybiAwIGVuZAogIGxvY2FsIGogPSBqYXJvX2NwKEEsIEIpCiAgaWYgaiA+IDAuNyB0aGVuCiAgICBsb2NhbCBsID0gMAogICAgd2hpbGUgbCA8IDQgYW5kIGwgPCBtMSBhbmQgbCA8IG0yIGFuZCBBW2wgKyAxXSA9PSBCW2wgKyAxXSBkbwogICAgICBsID0gbCArIDEKICAgIGVuZAogICAgaWYgbCA+IDAgdGhlbiBqID0gaiArIGwgKiBwICogKDEgLSBqKSBlbmQKICBlbmQKICByZXR1cm4gagplbmQKCmxvY2FsIGZ1bmN0aW9uIGp3KGEsIGIsIHApCiAgcmV0dXJuIGp3X2NwKHV0ZjhjcChhKSwgdXRmOGNwKGIpLCBwKQplbmQKCmxvY2FsIGZ1bmN0aW9uIG5vcm1sZXYoYSwgYikKICBsb2NhbCBBLCBCID0gdXRmOGNwKGEpLCB1dGY4Y3AoYikKICBsb2NhbCBteCA9IG1hdGgubWF4KCNBLCAjQikKICBpZiBteCA9PSAwIHRoZW4gcmV0dXJuIDAgZW5kCiAgcmV0dXJuIGxldl9jcChBLCBCKSAvIG14CmVuZAoKbG9jYWwgZnVuY3Rpb24gZm10NCh4KQogIHJldHVybiBzdHJpbmcuZm9ybWF0KCclLjRmJywgeCArIDApCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDliIblj5EKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBydW4ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHsgdiA9IHAgfSBlbmQKICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJycgZW5kCiAgbG9jYWwgYSA9IHAuYSBvciAnJwogIGxvY2FsIGIgPSBwLmIgb3IgJycKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2p3JwogIGlmIG9wID09ICdsZXYnIHRoZW4KICAgIHJldHVybiBzdHJpbmcuZm9ybWF0KCclZCcsIGxldihhLCBiKSkKICBlbHNlaWYgb3AgPT0gJ25vcm1sZXYnIHRoZW4KICAgIHJldHVybiBmbXQ0KG5vcm1sZXYoYSwgYikpCiAgZWxzZWlmIG9wID09ICdqYXJvJyB0aGVuCiAgICByZXR1cm4gZm10NChqYXJvKGEsIGIpKQogIGVsc2VpZiBvcCA9PSAnancnIHRoZW4KICAgIHJldHVybiBmbXQ0KGp3KGEsIGIsIHAucCBvciAwLjI1KSkKICBlbHNlaWYgb3AgPT0gJ3NpbScgdGhlbgogICAgbG9jYWwgbWV0cmljID0gcC5tZXRyaWMgb3IgJ2p3JwogICAgaWYgbWV0cmljID09ICdqdycgdGhlbiByZXR1cm4gZm10NChqdyhhLCBiLCBwLnAgb3IgMC4yNSkpCiAgICBlbHNlaWYgbWV0cmljID09ICdqYXJvJyB0aGVuIHJldHVybiBmbXQ0KGphcm8oYSwgYikpCiAgICBlbHNlIHJldHVybiBmbXQ0KDEgLSBub3JtbGV2KGEsIGIpKSBlbmQKICBlbHNlaWYgb3AgPT0gJ3NpbXJhbmsnIHRoZW4KICAgIGxvY2FsIHRhcmdldCA9IHAudiBvciBhCiAgICBsb2NhbCBjYW5kcyA9IHAuY2FuZHMKICAgIGlmIHR5cGUoY2FuZHMpID09ICdzdHJpbmcnIHRoZW4KICAgICAgLS0g5YW85a6577ya5Lul5o2i6KGM5oiW56uW57q/5YiG6ZqUCiAgICAgIGNhbmRzID0ge30KICAgICAgZm9yIHBhcnQgaW4gKGNhbmRzIC4uICdcbicpOmdtYXRjaCgnKC4tKVxuJykgZG8KICAgICAgICBpZiBwYXJ0IH49ICcnIHRoZW4gY2FuZHNbI2NhbmRzICsgMV0gPSBwYXJ0IGVuZAogICAgICBlbmQKICAgIGVuZAogICAgaWYgdHlwZShjYW5kcykgfj0gJ3RhYmxlJyB0aGVuIGNhbmRzID0ge30gZW5kCiAgICBsb2NhbCBwMCA9IHAucCBvciAwLjI1CiAgICBsb2NhbCBzY29yZWQgPSB7fQogICAgZm9yIGksIGMgaW4gaXBhaXJzKGNhbmRzKSBkbwogICAgICBzY29yZWRbI3Njb3JlZCArIDFdID0geyBpZHggPSBpLCBzY29yZSA9IGp3KHRhcmdldCwgdG9zdHJpbmcoYyksIHAwKSB9CiAgICBlbmQKICAgIHRhYmxlLnNvcnQoc2NvcmVkLCBmdW5jdGlvbih4LCB5KQogICAgICBpZiB4LnNjb3JlIH49IHkuc2NvcmUgdGhlbiByZXR1cm4geC5zY29yZSA+IHkuc2NvcmUgZW5kCiAgICAgIHJldHVybiB4LmlkeCA8IHkuaWR4CiAgICBlbmQpCiAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICBmb3IgaSwgcyBpbiBpcGFpcnMoc2NvcmVkKSBkbwogICAgICBwYXJ0c1sjcGFydHMgKyAxXSA9IHN0cmluZy5mb3JtYXQoJyVkOiVzJywgcy5pZHgsIGZtdDQocy5zY29yZSkpCiAgICBlbmQKICAgIHJldHVybiB0YWJsZS5jb25jYXQocGFydHMsICcgJykKICBlbmQKICByZXR1cm4gJycKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICByZXR1cm4gcnVuKHApCmVuZAoALS0gQGxpYjogaHRtbF9lc2NhcGUKLS0gQGNhdGVnb3J5OiB1ZGYKLS0gQGRlc2M6IEhUTUwg5a6e5L2T6L2s5LmJL+WPjei9rOS5ie+8iCYgPCA+ICIgJ++8m+aVsOWAvOWunuS9k+S4jeino+egge+8iQotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yJCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQpOgotLSAgIGluc3RhbGw6IFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0naHRtbF9lc2NhcGUnKTsKLS0gICBlc2NhcGU6ICBTRUxFQ1QgbHVhaml0X3MoJ2h0bWxfZXNjYXBlJywge3Y6ICc8YSBocmVmPSJ4Ij4nLCBvcDogJ2VzY2FwZSd9KTsKLS0gICB1bmVzY2FwZTpTRUxFQ1QgbHVhaml0X3MoJ2h0bWxfZXNjYXBlJywge3Y6ICcmbHQ7YSZndDsnLCBvcDogJ3VuZXNjYXBlJ30pOwpsb2NhbCBNQVBfRVNDID0geyBbJyYnXSA9ICcmYW1wOycsIFsnPCddID0gJyZsdDsnLCBbJz4nXSA9ICcmZ3Q7JywgWyciJ10gPSAnJnF1b3Q7JywgWyInIl0gPSAnJiMzOTsnIH0KCnJldHVybiBmdW5jdGlvbihwKQogIGlmIHR5cGUocCkgPT0gJ3N0cmluZycgdGhlbgogICAgcmV0dXJuIChwOmdzdWIoJ1smPD4iXCddJywgTUFQX0VTQykpCiAgZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIHYgPSBwLnYgb3IgJycKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2VzY2FwZScKICBpZiBvcCA9PSAndW5lc2NhcGUnIHRoZW4KICAgIC0tIEx1YSA1LjEgcGF0dGVybiBoYXMgbm8gfCBhbHRlcm5hdGlvbjogY2hhaW4gZ3N1YnMsICZhbXA7IGxhc3QgdG8gYXZvaWQgZG91YmxlLWRlY29kZQogICAgdiA9IHY6Z3N1YignJmx0OycsICc8Jyk6Z3N1YignJmd0OycsICc+Jyk6Z3N1YignJnF1b3Q7JywgJyInKTpnc3ViKCcmIzM5OycsICInIikKICAgIHJldHVybiAodjpnc3ViKCcmYW1wOycsICcmJykpCiAgZW5kCiAgcmV0dXJuICh2OmdzdWIoJ1smPD4iXCddJywgTUFQX0VTQykpCmVuZAoALS0gQGxpYjogeWFtbAotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogWUFNTCDop6PmnpAv57yW56CB77yI57qvIEx1Ye+8jOiHquWMheWQq++8ieOAguaUr+aMge+8muW1jOWll+aYoOWwhC/luo/liJfjgIHooYzlhoXmtYHlvI8gWy4uXSB7Li5944CBCi0tICAgICAgIOW8leWPty/oo7jmoIfph4/vvIhpbnQvZmxvYXQvaGV4L2Jvb2wvbnVsbO+8ieOAgeazqOmHiuOAgeWdl+agh+mHjyB8IOS4jiA+44CCCi0tICAgICAgIG9wPSdsb2FkJ++8mllBTUwg5paH5pysIOKGkiBKU09OIOWtl+espuS4su+8iOmFjSBqc29uX2V4dHJhY3Qg5bGV5byA77yJ77ybCi0tICAgICAgIG9wPSdlbmNvZGUn77yaSlNPTiDlrZfnrKbkuLIg4oaSIFlBTUwg5paH5pys44CCCi0tIEBzb3VyY2U6IG9yaWdpbmFs77yIZHVja2RiLWx1YWppdCDns7vliJfvvIzoh6rljIXlkKvml6DlpJbpg6jkvp3otZbvvJtKU09OIOe8luino+eggeS4uueyvueugOWGheW1jOWunueOsO+8iQotLSBAcmVxdWlyZXM6IG5vbmUKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tIOaUr+aMgeWtkOmbhu+8iOivmuWunui+ueeVjO+8ie+8muWdl+aYoOWwhC/luo/liJcv5rWB6ZuG5ZCIL+W8leWPt+S4juijuOagh+mHjy/ms6jph4ov5Z2X5qCH6YePKHwsPinjgIIKLS0g5pyq5pSv5oyB77ya6ZSa54K5ICYg5Yir5ZCNICrjgIHlpJrmlofmoaMgLS0t44CB6KGM5YaF5qCH562+ICEh44CB5aSN5p2C5aSa6KGM6KO45qCH6YeP5oqY6KGM44CCCi0tCi0tIFVzYWdlIChkdWNrZGItbHVhaml0LCBzY2FsYXIgbW9kZSk6Ci0tICAgaW5zdGFsbDogIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlOj0naW5zdGFsbCcsIHNxbF9uYW1lOj0neWFtbCcpOwotLSAgIGxvYWQ6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3lhbWwnLCB7djogJ2E6IDFcbmI6XG4gIGM6IDInLCBvcDogJ2xvYWQnfSk7Ci0tICAgICAgICAgICAgIOKGkiAneyJhIjoxLCJiIjp7ImMiOjJ9fScKLS0gICBkcmlsbDogICAgU0VMRUNUIGpzb25fZXh0cmFjdChsdWFqaXRfcygneWFtbCcsIHt2Oj15YW1sX3RleHQsIG9wOj0nbG9hZCd9KSwgJyQuYi5jJyk7Ci0tICAgZW5jb2RlOiAgIFNFTEVDVCBsdWFqaXRfcygneWFtbCcsIHt2OiAneyJhIjoxLCJiIjpbMSwyXX0nLCBvcDogJ2VuY29kZSd9KTsKLS0gICAgICAgICAgICAg4oaSICdhOiAxXG5iOlxuICAtIDFcbiAgLSAyXG4nCgpsb2NhbCB5YW1sID0ge30KCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5qCH6YeP6Kej5p6QCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgWU5VTEwgPSB7IF9feW51bGwgPSB0cnVlIH0gICAtLSBZQU1MIG51bGwg5ZOo5YW177yISlNPTiDnvJbnoIHkuLogbnVsbO+8iQoKbG9jYWwgZnVuY3Rpb24gZHFfdW5lc2NhcGUocykKICByZXR1cm4gKHM6Z3N1YignJVsoXFwpLiJcblx0XHIvMGFiZnV2JV0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnbicgdGhlbiByZXR1cm4gJ1xuJwogICAgZWxzZWlmIGMgPT0gJ3QnIHRoZW4gcmV0dXJuICdcdCcKICAgIGVsc2VpZiBjID09ICdyJyB0aGVuIHJldHVybiAnXHInCiAgICBlbHNlaWYgYyA9PSAnMCcgdGhlbiByZXR1cm4gJ1wwJwogICAgZWxzZWlmIGMgPT0gJ2EnIHRoZW4gcmV0dXJuICdcYScKICAgIGVsc2VpZiBjID09ICdiJyB0aGVuIHJldHVybiAnXGInCiAgICBlbHNlaWYgYyA9PSAnZicgdGhlbiByZXR1cm4gJ1xmJwogICAgZWxzZWlmIGMgPT0gJ3YnIHRoZW4gcmV0dXJuICdcdicKICAgIGVsc2VpZiBjID09ICd1JyB0aGVuCiAgICAgIC0tIFx1WFhYWCDlnKjnuq8gQVNDSUkg5a2Q6ZuG5YaF6Kej56CB77yb6Z2eIEFTQ0lJIOi/lOWbnuWNoOS9je+8iOe9leingeS6jumFjee9ru+8iQogICAgICBsb2NhbCBoZXggPSBjICAtLSBwbGFjZWhvbGRlcjsgcmVhbCBoYW5kbGluZyBiZWxvdwogICAgICByZXR1cm4gJz8nCiAgICBlbmQKICAgIHJldHVybiBjCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9udW1iZXIocykKICBpZiBzOm1hdGNoKCdeMFt4WF1bMC05YS1mQS1GXSskJykgdGhlbiByZXR1cm4gdG9udW1iZXIocywgMTYpIGVuZAogIGlmIHM6bWF0Y2goJ15bLStdPyVkKyQnKSB0aGVuIHJldHVybiB0b251bWJlcihzKSBlbmQKICBpZiBzOm1hdGNoKCdeWy0rXT8lZCslLiVkKiQnKSBvciBzOm1hdGNoKCdeWy0rXT8lZColLiVkKyQnKSB0aGVuCiAgICByZXR1cm4gdG9udW1iZXIocykKICBlbmQKICBpZiBzOm1hdGNoKCdeWy0rXT8lZCslLj8lZCpbZUVdWy0rXT8lZCskJykgdGhlbiByZXR1cm4gdG9udW1iZXIocykgZW5kCiAgcmV0dXJuIG5pbAplbmQKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3NjYWxhcihyYXcpCiAgbG9jYWwgcyA9IHJhdzptYXRjaCgnXiVzKiguLSklcyokJykgIC0tIHRyaW0KICBpZiBzID09ICcnIG9yIHMgPT0gJ34nIG9yIHM6bG93ZXIoKSA9PSAnbnVsbCcgdGhlbiByZXR1cm4gWU5VTEwgZW5kCiAgbG9jYWwgbG93ID0gczpsb3dlcigpCiAgaWYgbG93ID09ICd0cnVlJyBvciBsb3cgPT0gJ3llcycgb3IgbG93ID09ICdvbicgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBsb3cgPT0gJ2ZhbHNlJyBvciBsb3cgPT0gJ25vJyBvciBsb3cgPT0gJ29mZicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgczptYXRjaCgnXiIuKiInKSB0aGVuCiAgICBsb2NhbCBib2R5ID0gczpzdWIoMiwgLTIpCiAgICAtLSDlpITnkIbovazkuYnvvIjlkKsgXHVYWFhYIOWfuuehgCBBU0NJSe+8iQogICAgYm9keSA9IGJvZHk6Z3N1YignXFx1KCV4JXgleCV4KScsIGZ1bmN0aW9uKGgpCiAgICAgIGxvY2FsIGNvZGUgPSB0b251bWJlcihoLCAxNikKICAgICAgaWYgY29kZSBhbmQgY29kZSA8IDEyOCB0aGVuIHJldHVybiBzdHJpbmcuY2hhcihjb2RlKSBlbmQKICAgICAgcmV0dXJuICc/JwogICAgZW5kKQogICAgYm9keSA9IGRxX3VuZXNjYXBlKGJvZHkpCiAgICByZXR1cm4gYm9keQogIGVuZAogIGlmIHM6bWF0Y2goIl4nLionIikgdGhlbgogICAgcmV0dXJuIChzOnN1YigyLCAtMik6Z3N1YigiJyciLCAiJyIpKQogIGVuZAogIGxvY2FsIG4gPSBwYXJzZV9udW1iZXIocykKICBpZiBuIH49IG5pbCB0aGVuIHJldHVybiBuIGVuZAogIHJldHVybiBzCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDooYzlhoXmtYHpm4blkIggIFsgLi4gXSAvIHsgLi4gfQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHNraXBfd3MocywgaSkKICB3aGlsZSBpIDw9ICNzIGRvCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJyAnIG9yIGMgPT0gJ1x0JyB0aGVuIGkgPSBpICsgMSBlbHNlIGJyZWFrIGVuZAogIGVuZAogIHJldHVybiBpCmVuZAoKbG9jYWwgcGFyc2VfZmxvdyAgLS0g5YmN5ZCR5aOw5piO77yIZmxvd192YWx1ZSDpgJLlvZLosIPnlKjlroPvvIkKCmxvY2FsIGZ1bmN0aW9uIGZsb3dfdmFsdWUocywgaSkKICBpID0gc2tpcF93cyhzLCBpKQogIGxvY2FsIGMgPSBzOnN1YihpLCBpKQogIGlmIGMgPT0gJ1snIG9yIGMgPT0gJ3snIHRoZW4KICAgIGxvY2FsIHYsIGogPSBwYXJzZV9mbG93KHMsIGkpCiAgICByZXR1cm4gdiwgagogIGVuZAogIGlmIGMgPT0gJyInIHRoZW4KICAgIGxvY2FsIGogPSBpICsgMQogICAgd2hpbGUgaiA8PSAjcyBkbwogICAgICBpZiBzOnN1YihqLCBqKSA9PSAnXFwnIHRoZW4gaiA9IGogKyAyCiAgICAgIGVsc2VpZiBzOnN1YihqLCBqKSA9PSAnIicgdGhlbiBicmVhawogICAgICBlbHNlIGogPSBqICsgMSBlbmQKICAgIGVuZAogICAgcmV0dXJuIHBhcnNlX3NjYWxhcihzOnN1YihpLCBqKSksIGogKyAxCiAgZW5kCiAgaWYgYyA9PSAiJyIgdGhlbgogICAgbG9jYWwgaiA9IGkgKyAxCiAgICB3aGlsZSBqIDw9ICNzIGRvCiAgICAgIGlmIHM6c3ViKGosIGogKyAxKSA9PSAiJyciIHRoZW4gaiA9IGogKyAyCiAgICAgIGVsc2VpZiBzOnN1YihqLCBqKSA9PSAiJyIgdGhlbiBicmVhawogICAgICBlbHNlIGogPSBqICsgMSBlbmQKICAgIGVuZAogICAgcmV0dXJuIHBhcnNlX3NjYWxhcihzOnN1YihpLCBqKSksIGogKyAxCiAgZW5kCiAgLS0g6KO45qCH6YeP77ya6K+75YiwICwgXSB9IDrvvIjmmKDlsITplK7nmoTlhpLlj7fvvInkuLrmraIKICBsb2NhbCBzdGFydCA9IGkKICB3aGlsZSBpIDw9ICNzIGRvCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJywnIG9yIGMgPT0gJ10nIG9yIGMgPT0gJ30nIG9yIGMgPT0gJzonIHRoZW4gYnJlYWsgZW5kCiAgICBpID0gaSArIDEKICBlbmQKICByZXR1cm4gcGFyc2Vfc2NhbGFyKHM6c3ViKHN0YXJ0LCBpIC0gMSkpLCBpCmVuZAoKcGFyc2VfZmxvdyA9IGZ1bmN0aW9uKHMsIGkpCiAgbG9jYWwgYyA9IHM6c3ViKGksIGkpCiAgaWYgYyA9PSAnWycgdGhlbgogICAgbG9jYWwgYXJyLCBvdXQgPSB7fSwge30KICAgIGkgPSBpICsgMQogICAgd2hpbGUgdHJ1ZSBkbwogICAgICBpID0gc2tpcF93cyhzLCBpKQogICAgICBpZiBzOnN1YihpLCBpKSA9PSAnXScgdGhlbiByZXR1cm4gb3V0LCBpICsgMSBlbmQKICAgICAgbG9jYWwgdiwgaiA9IGZsb3dfdmFsdWUocywgaSkKICAgICAgb3V0WyNvdXQgKyAxXSA9IHYKICAgICAgaSA9IHNraXBfd3MocywgaikKICAgICAgaWYgczpzdWIoaSwgaSkgPT0gJywnIHRoZW4gaSA9IGkgKyAxCiAgICAgIGVsc2VpZiBzOnN1YihpLCBpKSA9PSAnXScgdGhlbiByZXR1cm4gb3V0LCBpICsgMQogICAgICBlbHNlIGVycm9yKCd5YW1sOiBmbG93IGxpc3Qg5pyf5pybICwg5oiWIF3vvIzkvY3nva4gJyAuLiBpKSBlbmQKICAgIGVuZAogIGVsc2VpZiBjID09ICd7JyB0aGVuCiAgICBsb2NhbCBvdXQgPSB7fQogICAgaSA9IGkgKyAxCiAgICB3aGlsZSB0cnVlIGRvCiAgICAgIGkgPSBza2lwX3dzKHMsIGkpCiAgICAgIGlmIHM6c3ViKGksIGkpID09ICd9JyB0aGVuIHJldHVybiBvdXQsIGkgKyAxIGVuZAogICAgICAtLSBrZXkKICAgICAgbG9jYWwga2V5LCBqCiAgICAgIGlmIHM6c3ViKGksIGkpID09ICciJyBvciBzOnN1YihpLCBpKSA9PSAiJyIgdGhlbgogICAgICAgIGtleSwgaiA9IGZsb3dfdmFsdWUocywgaSkKICAgICAgICBrZXkgPSB0b3N0cmluZyhrZXkpCiAgICAgICAgaSA9IHNraXBfd3MocywgaikKICAgICAgZWxzZQogICAgICAgIGxvY2FsIHN0YXJ0ID0gaQogICAgICAgIHdoaWxlIGkgPD0gI3MgYW5kIHM6c3ViKGksIGkpIH49ICc6JyBkbyBpID0gaSArIDEgZW5kCiAgICAgICAga2V5ID0gKHM6c3ViKHN0YXJ0LCBpIC0gMSk6bWF0Y2goJ14lcyooLi0pJXMqJCcpKQogICAgICAgIGkgPSBpICsgMSAgLS0g6Lez6L+HICc6JwogICAgICBlbmQKICAgICAgbG9jYWwgdiwgajIgPSBmbG93X3ZhbHVlKHMsIGkpCiAgICAgIG91dFtrZXldID0gdgogICAgICBpID0gc2tpcF93cyhzLCBqMikKICAgICAgaWYgczpzdWIoaSwgaSkgPT0gJywnIHRoZW4gaSA9IGkgKyAxCiAgICAgIGVsc2VpZiBzOnN1YihpLCBpKSA9PSAnfScgdGhlbiByZXR1cm4gb3V0LCBpICsgMQogICAgICBlbHNlIGVycm9yKCd5YW1sOiBmbG93IG1hcCDmnJ/mnJsgLCDmiJYgfe+8jOS9jee9riAnIC4uIGkpIGVuZAogICAgZW5kCiAgZW5kCiAgZXJyb3IoJ3lhbWw6IOmdnuazlea1gembhuWQiOi1t+WniycpCmVuZAoKLS0g5Yik5pat5YC85piv5ZCm5Li65rWB6ZuG5ZCICmxvY2FsIGZ1bmN0aW9uIGlzX2Zsb3cocykKICBsb2NhbCB0ID0gczptYXRjaCgnXiVzKiguKikkJykKICByZXR1cm4gdDpzdWIoMSwgMSkgPT0gJ1snIG9yIHQ6c3ViKDEsIDEpID09ICd7JwplbmQKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX3ZhbHVlX2lubGluZShzKQogIGlmIGlzX2Zsb3cocykgdGhlbgogICAgbG9jYWwgc3RhcnQgPSAjczptYXRjaCgnXiVzKicpICsgMQogICAgbG9jYWwgdiA9IHBhcnNlX2Zsb3cocywgc3RhcnQpCiAgICByZXR1cm4gdgogIGVuZAogIHJldHVybiBwYXJzZV9zY2FsYXIocykKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOazqOmHiuWJpeemuwotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIHN0cmlwX2NvbW1lbnQobGluZSkKICBsb2NhbCBpbl9zLCBpbl9kID0gZmFsc2UsIGZhbHNlCiAgZm9yIGkgPSAxLCAjbGluZSBkbwogICAgbG9jYWwgYyA9IGxpbmU6c3ViKGksIGkpCiAgICBpZiBpbl9kIHRoZW4KICAgICAgaWYgYyA9PSAnXFwnIHRoZW4gaSA9IGkgKyAxCiAgICAgIGVsc2VpZiBjID09ICciJyB0aGVuIGluX2QgPSBmYWxzZSBlbmQKICAgIGVsc2VpZiBpbl9zIHRoZW4KICAgICAgaWYgYyA9PSAiJyIgdGhlbiBpbl9zID0gZmFsc2UgZW5kCiAgICBlbHNlCiAgICAgIGlmIGMgPT0gJyInIHRoZW4gaW5fZCA9IHRydWUKICAgICAgZWxzZWlmIGMgPT0gIiciIHRoZW4gaW5fcyA9IHRydWUKICAgICAgZWxzZWlmIGMgPT0gJyMnIHRoZW4KICAgICAgICBpZiBpID09IDEgb3IgbGluZTpzdWIoaSAtIDEsIGkgLSAxKTptYXRjaCgnJXMnKSB0aGVuCiAgICAgICAgICByZXR1cm4gbGluZTpzdWIoMSwgaSAtIDEpCiAgICAgICAgZW5kCiAgICAgIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIGxpbmUKZW5kCgpsb2NhbCBmdW5jdGlvbiBpc19tYXBfbGluZSh0ZXh0KQogIC0tIGtleSDlkI7ntKfot58gJzogJyDmiJbooYzlsL4gJzonCiAgcmV0dXJuIHRleHQ6bWF0Y2goJ14oW146JXNdW146XSolcyopOiVzKiguKikkJykgb3IKICAgICAgICAgdGV4dDptYXRjaCgnXigiLio/Iik6KC4qKSQnKSBvcgogICAgICAgICB0ZXh0Om1hdGNoKCJeKC4qPycpOiguKikkIikKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIOS4u+Wdl+ino+aekOWZqAotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIHBhcnNlX3NlcXVlbmNlICAtLSDliY3lkJHlo7DmmI7vvIhwYXJzZV9ibG9jayDpgJLlvZLosIPnlKjvvIkKbG9jYWwgcGFyc2VfbWFwcGluZyAgIC0tIOWJjeWQkeWjsOaYju+8iHBhcnNlX2Jsb2NrIOmAkuW9kuiwg+eUqO+8iQoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfYmxvY2sobGluZXMsIGksIGluZGVudCkKICBsb2NhbCBsaW5lID0gbGluZXNbaV0KICBpZiBub3QgbGluZSB0aGVuIHJldHVybiBZTlVMTCwgaSBlbmQKICBsb2NhbCB0ID0gbGluZS50ZXh0CiAgLS0g5bqP5YiX6aG5CiAgaWYgdCA9PSAnLScgb3IgdDpzdWIoMSwgMikgPT0gJy0gJyB0aGVuCiAgICByZXR1cm4gcGFyc2Vfc2VxdWVuY2UobGluZXMsIGksIGluZGVudCkKICBlbmQKICAtLSDmmKDlsIQKICBpZiB0Om1hdGNoKCdeKFteOiVzXVteOl0qJXMqKTolcyooLiopJCcpIG9yIHQ6bWF0Y2goJ14iJykgYW5kIHQ6bWF0Y2goJ14iJXMqIjonKSB0aGVuCiAgICByZXR1cm4gcGFyc2VfbWFwcGluZyhsaW5lcywgaSwgaW5kZW50KQogIGVuZAogIC0tIOijuOagh+mHjwogIHJldHVybiBwYXJzZV9zY2FsYXIodCksIGkgKyAxCmVuZAoKbG9jYWwgZnVuY3Rpb24gc3BsaXRfa2V5KHRleHQpCiAgLS0g5LyY5YWI77ya5pyq5Yqg5byV5Y+3IGtlee+8iOmmluS4qiAnOiAnIOaIluihjOWwviAnOifvvIkKICBsb2NhbCBrZXksIHZhbCA9IHRleHQ6bWF0Y2goJ14oW146JXNdW146XSolcyopOiVzKiguKikkJykKICBpZiBrZXkgdGhlbiByZXR1cm4ga2V5LCB2YWwgZW5kCiAgLS0g5Y+M5byV5Y+3IGtleQogIGtleSwgdmFsID0gdGV4dDptYXRjaCgnXigiKC4tKSIpOiguKikkJykKICBpZiBrZXkgdGhlbiByZXR1cm4ga2V5LCB2YWwgZW5kCiAgLS0g5Y2V5byV5Y+3IGtleQogIGtleSwgdmFsID0gdGV4dDptYXRjaCgiXihcJyguLSlcJyk6KC4qKSQiKQogIGlmIGtleSB0aGVuIHJldHVybiBrZXksIHZhbCBlbmQKICByZXR1cm4gbmlsLCBuaWwKZW5kCgpwYXJzZV9tYXBwaW5nID0gZnVuY3Rpb24obGluZXMsIGksIGluZGVudCkKICBsb2NhbCBvdXQgPSB7fQogIHdoaWxlIGkgPD0gI2xpbmVzIGRvCiAgICBsb2NhbCBsaW5lID0gbGluZXNbaV0KICAgIGlmIGxpbmUuaW5kZW50IDwgaW5kZW50IHRoZW4gYnJlYWsgZW5kCiAgICBpZiBsaW5lLmluZGVudCA+IGluZGVudCB0aGVuCiAgICAgIGVycm9yKCd5YW1sOiDmhI/lpJbnvKnov5vvvIjooYzlhoXlrrkgJyAuLiBsaW5lLnRleHQgLi4gJ++8iScpCiAgICBlbmQKICAgIGlmIGxpbmUudGV4dCA9PSAnLScgb3IgbGluZS50ZXh0OnN1YigxLCAyKSA9PSAnLSAnIHRoZW4gYnJlYWsgZW5kCiAgICBsb2NhbCBrZXksIHZhbCA9IHNwbGl0X2tleShsaW5lLnRleHQpCiAgICBpZiBub3Qga2V5IHRoZW4KICAgICAgZXJyb3IoJ3lhbWw6IOaXoOazleino+aekOaYoOWwhOihjCAiJyAuLiBsaW5lLnRleHQgLi4gJyInKQogICAgZW5kCiAgICAtLSDop6PlvJXlj7cga2V5CiAgICBrZXkgPSBrZXk6bWF0Y2goJ14lcyooLi0pJXMqJCcpCiAgICBpZiBrZXk6c3ViKDEsIDEpID09ICciJyB0aGVuIGtleSA9IGtleTpzdWIoMiwgLTIpCiAgICBlbHNlaWYga2V5OnN1YigxLCAxKSA9PSAiJyIgdGhlbiBrZXkgPSAoa2V5OnN1YigyLCAtMik6Z3N1YigiJyciLCAiJyIpKSBlbmQKCiAgICBsb2NhbCB2dHJpbSA9IHZhbDptYXRjaCgnXiVzKiguLSklcyokJykgb3IgJycKICAgIGlmIHZ0cmltID09ICcnIHRoZW4KICAgICAgLS0g56m65YC877ya6KaB5LmI5bWM5aWX5Z2X77yM6KaB5LmIIG51bGwKICAgICAgbG9jYWwgbnggPSBsaW5lc1tpICsgMV0KICAgICAgaWYgbnggYW5kIG54LmluZGVudCA+IGluZGVudCBhbmQgbm90IChueC50ZXh0ID09ICctJyBvciBueC50ZXh0OnN1YigxLDIpPT0nLSAnKSB0aGVuCiAgICAgICAgbG9jYWwgY2hpbGQsIGkyID0gcGFyc2VfYmxvY2sobGluZXMsIGkgKyAxLCBueC5pbmRlbnQpCiAgICAgICAgb3V0W2tleV0gPSBjaGlsZAogICAgICAgIGkgPSBpMgogICAgICBlbHNlaWYgbnggYW5kIG54LmluZGVudCA+IGluZGVudCBhbmQgKG54LnRleHQgPT0gJy0nIG9yIG54LnRleHQ6c3ViKDEsMik9PSctICcpIHRoZW4KICAgICAgICBsb2NhbCBjaGlsZCwgaTIgPSBwYXJzZV9zZXF1ZW5jZShsaW5lcywgaSArIDEsIG54LmluZGVudCkKICAgICAgICBvdXRba2V5XSA9IGNoaWxkCiAgICAgICAgaSA9IGkyCiAgICAgIGVsc2UKICAgICAgICBvdXRba2V5XSA9IFlOVUxMCiAgICAgICAgaSA9IGkgKyAxCiAgICAgIGVuZAogICAgZWxzZWlmIHZ0cmltOm1hdGNoKCdeWyV8Pl1bJSstXT8lcyolZCokJykgdGhlbgogICAgICAtLSDlnZfmoIfph48gfCDmiJYgPgogICAgICBsb2NhbCBmb2xkZWQgPSB2dHJpbTpzdWIoMSwgMSkgPT0gJz4nCiAgICAgIGxvY2FsIGNvbnRlbnRfaW5kZW50LCBnYXRoZXJlZCA9IG5pbCwge30KICAgICAgbG9jYWwgaiA9IGkgKyAxCiAgICAgIHdoaWxlIGogPD0gI2xpbmVzIGRvCiAgICAgICAgbG9jYWwgbmwgPSBsaW5lc1tqXQogICAgICAgIGlmIG5sLmluZGVudCA8PSBpbmRlbnQgYW5kIG5sLmluZGVudCA+PSAwIGFuZCBubC5pbmRlbnQgfj0gaW5kZW50IHRoZW4KICAgICAgICAgIC0tIOe8qei/m+WbnuiQveWIsOWQjOe6pyDihpIg57uT5p2fCiAgICAgICAgICBicmVhawogICAgICAgIGVuZAogICAgICAgIGlmIG5sLmluZGVudCA8IGluZGVudCB0aGVuIGJyZWFrIGVuZAogICAgICAgIGlmIG5sLmluZGVudCA9PSBpbmRlbnQgdGhlbiBicmVhayBlbmQgIC0tIOWQjOe6p+aWsCBrZXkKICAgICAgICBpZiBjb250ZW50X2luZGVudCA9PSBuaWwgdGhlbiBjb250ZW50X2luZGVudCA9IG5sLmluZGVudCBlbmQKICAgICAgICBnYXRoZXJlZFsjZ2F0aGVyZWQgKyAxXSA9IG5sLnRleHQKICAgICAgICBqID0gaiArIDEKICAgICAgZW5kCiAgICAgIGxvY2FsIGpvaW5lZAogICAgICBpZiBmb2xkZWQgdGhlbgogICAgICAgIC0tIOaKmOWPoO+8muWNleaNouihjOKGkuepuuagvO+8jOepuuihjOKGkuaNouihjO+8iOeugOWMlu+8muWFqOmDqOS7peepuuagvOi/nuaOpe+8jOS/neeVmeauteiQveepuuihjO+8iQogICAgICAgIGpvaW5lZCA9IHRhYmxlLmNvbmNhdChnYXRoZXJlZCwgJyAnKQogICAgICBlbHNlCiAgICAgICAgam9pbmVkID0gdGFibGUuY29uY2F0KGdhdGhlcmVkLCAnXG4nKQogICAgICBlbmQKICAgICAgb3V0W2tleV0gPSBqb2luZWQKICAgICAgaSA9IGoKICAgIGVsc2UKICAgICAgb3V0W2tleV0gPSBwYXJzZV92YWx1ZV9pbmxpbmUodnRyaW0pCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIG91dCwgaQplbmQKCnBhcnNlX3NlcXVlbmNlID0gZnVuY3Rpb24obGluZXMsIGksIGluZGVudCkKICBsb2NhbCBvdXQgPSB7fQogIHdoaWxlIGkgPD0gI2xpbmVzIGRvCiAgICBsb2NhbCBsaW5lID0gbGluZXNbaV0KICAgIGlmIGxpbmUuaW5kZW50IH49IGluZGVudCB0aGVuIGJyZWFrIGVuZAogICAgaWYgbm90IChsaW5lLnRleHQgPT0gJy0nIG9yIGxpbmUudGV4dDpzdWIoMSwgMikgPT0gJy0gJykgdGhlbiBicmVhayBlbmQKICAgIGxvY2FsIGNvbnRlbnQgPSBsaW5lLnRleHQ6c3ViKDIpCiAgICBsb2NhbCBsZWFkID0gI2NvbnRlbnQ6bWF0Y2goJ14lcyonKSAgLS0g56C05oqY5Y+35ZCO55qE56m65qC85pWw77yIJy0gJyDpgJrluLjkuLogMe+8iQogICAgbG9jYWwgY29udGVudF9pbmRlbnQgPSBpbmRlbnQgKyAxICsgbGVhZAogICAgLS0g5ZCI5bm25pys6aG577ya6aaW6KGM77yI6IulIGNvbnRlbnQg6Z2e56m677yJKyDlkI7nu63nvKnov5sgPj0gY29udGVudF9pbmRlbnQg55qE6KGMCiAgICBsb2NhbCBtZXJnZWQgPSB7fQogICAgaWYgKGNvbnRlbnQ6bWF0Y2goJ14lcyooLi0pJXMqJCcpKSB+PSAnJyB0aGVuCiAgICAgIG1lcmdlZFsjbWVyZ2VkICsgMV0gPSB7IGluZGVudCA9IGNvbnRlbnRfaW5kZW50LCB0ZXh0ID0gY29udGVudDptYXRjaCgnXiVzKiguLSklcyokJykgfQogICAgZW5kCiAgICBpID0gaSArIDEKICAgIHdoaWxlIGkgPD0gI2xpbmVzIGFuZCBsaW5lc1tpXS5pbmRlbnQgPj0gY29udGVudF9pbmRlbnQgZG8KICAgICAgbWVyZ2VkWyNtZXJnZWQgKyAxXSA9IGxpbmVzW2ldCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgICBpZiAjbWVyZ2VkID09IDAgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gWU5VTEwKICAgIGVsc2UKICAgICAgb3V0WyNvdXQgKyAxXSA9IHBhcnNlX2Jsb2NrKG1lcmdlZCwgMSwgY29udGVudF9pbmRlbnQpCiAgICBlbmQKICBlbmQKICByZXR1cm4gb3V0LCBpCmVuZAoKbG9jYWwgZnVuY3Rpb24gcHJlcGFyZV9saW5lcyhzcmMpCiAgbG9jYWwgbGluZXMgPSB7fQogIGZvciByYXcgaW4gKHNyYyAuLiAnXG4nKTpnbWF0Y2goJyhbXlxuXSopXG4nKSBkbwogICAgbG9jYWwgbm9fY29tbWVudCA9IHN0cmlwX2NvbW1lbnQocmF3KQogICAgLS0g5b+955Wl56m66KGMIC8g5LuF57yp6L+bCiAgICBpZiBub19jb21tZW50Om1hdGNoKCdeJXMqJCcpIHRoZW4gZ290byBjb250aW51ZSBlbmQKICAgIC0tIOaWh+aho+WIhumalOespiAtLS0g5pqC5oyJ57uT5p2f5b2T5YmN5Z2X5aSE55CG77yI5Y2V5paH5qGj77yM55u05o6l6Lez6L+H77yJCiAgICBpZiBub19jb21tZW50Om1hdGNoKCdeJXMqJS0lLS0lcyokJykgdGhlbiBnb3RvIGNvbnRpbnVlIGVuZAogICAgbG9jYWwgaW5kZW50ID0gIyhub19jb21tZW50Om1hdGNoKCdeJXMqJykgb3IgJycpCiAgICBsb2NhbCB0ZXh0ID0gbm9fY29tbWVudDptYXRjaCgnXiVzKiguKikkJykKICAgIGlmIHRleHQ6bWF0Y2goJ1x0JykgdGhlbgogICAgICAtLSDnvKnov5vlhoXlh7rnjrAgdGFi77yaWUFNTCDnpoHnlKjvvIzlrr3mnb7lpITnkIbkuLrmiqXplJkKICAgICAgZXJyb3IoJ3lhbWw6IOe8qei/m+S4reS4jeWFgeiuuOS9v+eUqOWItuihqOespicpCiAgICBlbmQKICAgIGxpbmVzWyNsaW5lcyArIDFdID0geyBpbmRlbnQgPSBpbmRlbnQsIHRleHQgPSB0ZXh0IH0KICAgIDo6Y29udGludWU6OgogIGVuZAogIHJldHVybiBsaW5lcwplbmQKCmZ1bmN0aW9uIHlhbWwubG9hZChzcmMpCiAgaWYgdHlwZShzcmMpIH49ICdzdHJpbmcnIHRoZW4gcmV0dXJuIG5pbCBlbmQKICBpZiBzcmM6bWF0Y2goJ14lcyokJykgdGhlbiByZXR1cm4gWU5VTEwgZW5kCiAgLS0g5Y675o6JIEJPTQogIHNyYyA9IChzcmM6Z3N1YignXiVib20nLCAnJykpCiAgbG9jYWwgbGluZXMgPSBwcmVwYXJlX2xpbmVzKHNyYykKICBpZiAjbGluZXMgPT0gMCB0aGVuIHJldHVybiBZTlVMTCBlbmQKICBsb2NhbCB2YWwgPSBwYXJzZV9ibG9jayhsaW5lcywgMSwgbGluZXNbMV0uaW5kZW50KQogIHJldHVybiB2YWwKZW5kCgotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ci0tIEpTT04g5YaF5bWM57yW6Kej56CB77yI57K+566A77yM6Ieq5YyF5ZCr77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24ganNvbl9lc2NhcGUocykKICByZXR1cm4gKHM6Z3N1YignWyVjIlxcXScsIGZ1bmN0aW9uKGMpCiAgICBpZiBjID09ICciJyB0aGVuIHJldHVybiAnXFwiJwogICAgZWxzZWlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcKICAgIGVsc2VpZiBjID09ICdcbicgdGhlbiByZXR1cm4gJ1xcbicKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicKICAgIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2UgcmV0dXJuIHN0cmluZy5mb3JtYXQoJ1xcdSUwNHgnLCBjOmJ5dGUoKSkgZW5kCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBpc19hcnJheSh0KQogIGxvY2FsIG4gPSAwCiAgZm9yIGsgaW4gcGFpcnModCkgZG8KICAgIGlmIHR5cGUoaykgfj0gJ251bWJlcicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgICBuID0gbiArIDEKICBlbmQKICBmb3IgaSA9IDEsIG4gZG8gaWYgdFtpXSA9PSBuaWwgdGhlbiByZXR1cm4gZmFsc2UgZW5kIGVuZAogIHJldHVybiB0cnVlCmVuZAoKbG9jYWwganNvbl9lbmNvZGVfdmFsCgpqc29uX2VuY29kZV92YWwgPSBmdW5jdGlvbih2KQogIGlmIHYgPT0gbmlsIHRoZW4gcmV0dXJuICdudWxsJyBlbmQKICBpZiB2ID09IFlOVUxMIHRoZW4gcmV0dXJuICdudWxsJyBlbmQKICBsb2NhbCB0diA9IHR5cGUodikKICBpZiB0diA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCiAgaWYgdHYgPT0gJ251bWJlcicgdGhlbgogICAgaWYgdiB+PSB2IG9yIHYgPT0gbWF0aC5odWdlIG9yIHYgPT0gLW1hdGguaHVnZSB0aGVuIHJldHVybiAnbnVsbCcgZW5kICAtLSBOYU4vSW5mCiAgICByZXR1cm4gc3RyaW5nLmZvcm1hdCgnJWcnLCB2KQogIGVuZAogIGlmIHR2ID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICciJyAuLiBqc29uX2VzY2FwZSh2KSAuLiAnIicgZW5kCiAgaWYgdHYgPT0gJ3RhYmxlJyB0aGVuCiAgICBpZiBpc19hcnJheSh2KSB0aGVuCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIGkgPSAxLCAjdiBkbyBwYXJ0c1tpXSA9IGpzb25fZW5jb2RlX3ZhbCh2W2ldKSBlbmQKICAgICAgcmV0dXJuICdbJyAuLiB0YWJsZS5jb25jYXQocGFydHMsICcsJykgLi4gJ10nCiAgICBlbHNlCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIGssIHZhbCBpbiBwYWlycyh2KSBkbwogICAgICAgIGlmIHZhbCB+PSBuaWwgdGhlbgogICAgICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSAnIicgLi4ganNvbl9lc2NhcGUodG9zdHJpbmcoaykpIC4uICciOicgLi4ganNvbl9lbmNvZGVfdmFsKHZhbCkKICAgICAgICBlbmQKICAgICAgZW5kCiAgICAgIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwogICAgZW5kCiAgZW5kCiAgcmV0dXJuICdudWxsJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGpzb25fZW5jb2RlKHYpIHJldHVybiBqc29uX2VuY29kZV92YWwodikgZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX2RlY29kZShzKQogIGxvY2FsIHBvcyA9IDEKICBsb2NhbCBmdW5jdGlvbiB3cygpCiAgICB3aGlsZSBwb3MgPD0gI3MgZG8KICAgICAgbG9jYWwgYyA9IHM6c3ViKHBvcywgcG9zKQogICAgICBpZiBjID09ICcgJyBvciBjID09ICdcdCcgb3IgYyA9PSAnXG4nIG9yIGMgPT0gJ1xyJyB0aGVuIHBvcyA9IHBvcyArIDEgZWxzZSBicmVhayBlbmQKICAgIGVuZAogIGVuZAogIGxvY2FsIGZ1bmN0aW9uIHZhbHVlKCkKICAgIHdzKCkKICAgIGxvY2FsIGMgPSBzOnN1Yihwb3MsIHBvcykKICAgIGlmIGMgPT0gJ3snIHRoZW4KICAgICAgcG9zID0gcG9zICsgMQogICAgICBsb2NhbCB0ID0ge30KICAgICAgd3MoKQogICAgICBpZiBzOnN1Yihwb3MsIHBvcykgPT0gJ30nIHRoZW4gcG9zID0gcG9zICsgMSByZXR1cm4gdCBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIHdzKCkKICAgICAgICBsb2NhbCBrCiAgICAgICAgaWYgczpzdWIocG9zLCBwb3MpIH49ICciJyB0aGVuIGVycm9yKCdqc29uOiDmnJ/mnJvlrZfnrKbkuLLplK4nKSBlbmQKICAgICAgICBsb2NhbCBfLCBlID0gczpmaW5kKCciJywgcG9zLCB0cnVlKQogICAgICAgIC0tIOaJvuWIsOacqui9rOS5ieW8leWPtwogICAgICAgIGxvY2FsIGogPSBwb3MgKyAxCiAgICAgICAgd2hpbGUgaiA8PSAjcyBkbwogICAgICAgICAgaWYgczpzdWIoaiwgaikgPT0gJ1xcJyB0aGVuIGogPSBqICsgMgogICAgICAgICAgZWxzZWlmIHM6c3ViKGosIGopID09ICciJyB0aGVuIGJyZWFrCiAgICAgICAgICBlbHNlIGogPSBqICsgMSBlbmQKICAgICAgICBlbmQKICAgICAgICBrID0gKHM6c3ViKHBvcyArIDEsIGogLSAxKTpnc3ViKCdcXCguKScsIGZ1bmN0aW9uKHgpCiAgICAgICAgICBpZiB4ID09ICduJyB0aGVuIHJldHVybiAnXG4nIGVsc2VpZiB4ID09ICd0JyB0aGVuIHJldHVybiAnXHQnIGVsc2UgcmV0dXJuIHggZW5kCiAgICAgICAgZW5kKSkKICAgICAgICBwb3MgPSBqICsgMQogICAgICAgIHdzKCkKICAgICAgICBpZiBzOnN1Yihwb3MsIHBvcykgfj0gJzonIHRoZW4gZXJyb3IoJ2pzb246IOacn+acmyA6JykgZW5kCiAgICAgICAgcG9zID0gcG9zICsgMQogICAgICAgIHRba10gPSB2YWx1ZSgpCiAgICAgICAgd3MoKQogICAgICAgIGlmIHM6c3ViKHBvcywgcG9zKSA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIHM6c3ViKHBvcywgcG9zKSA9PSAnfScgdGhlbiBwb3MgPSBwb3MgKyAxIHJldHVybiB0CiAgICAgICAgZWxzZSBlcnJvcignanNvbjog5pyf5pybICwg5oiWIH0nKSBlbmQKICAgICAgZW5kCiAgICBlbHNlaWYgYyA9PSAnWycgdGhlbgogICAgICBwb3MgPSBwb3MgKyAxCiAgICAgIGxvY2FsIGFyciA9IHt9CiAgICAgIHdzKCkKICAgICAgaWYgczpzdWIocG9zLCBwb3MpID09ICddJyB0aGVuIHBvcyA9IHBvcyArIDEgcmV0dXJuIGFyciBlbmQKICAgICAgd2hpbGUgdHJ1ZSBkbwogICAgICAgIGFyclsjYXJyICsgMV0gPSB2YWx1ZSgpCiAgICAgICAgd3MoKQogICAgICAgIGlmIHM6c3ViKHBvcywgcG9zKSA9PSAnLCcgdGhlbiBwb3MgPSBwb3MgKyAxCiAgICAgICAgZWxzZWlmIHM6c3ViKHBvcywgcG9zKSA9PSAnXScgdGhlbiBwb3MgPSBwb3MgKyAxIHJldHVybiBhcnIKICAgICAgICBlbHNlIGVycm9yKCdqc29uOiDmnJ/mnJsgLCDmiJYgXScpIGVuZAogICAgICBlbmQKICAgIGVsc2VpZiBjID09ICciJyB0aGVuCiAgICAgIGxvY2FsIGogPSBwb3MgKyAxCiAgICAgIHdoaWxlIGogPD0gI3MgZG8KICAgICAgICBpZiBzOnN1YihqLCBqKSA9PSAnXFwnIHRoZW4gaiA9IGogKyAyCiAgICAgICAgZWxzZWlmIHM6c3ViKGosIGopID09ICciJyB0aGVuIGJyZWFrCiAgICAgICAgZWxzZSBqID0gaiArIDEgZW5kCiAgICAgIGVuZAogICAgICBsb2NhbCBib2R5ID0gczpzdWIocG9zICsgMSwgaiAtIDEpCiAgICAgIGJvZHkgPSAoYm9keTpnc3ViKCdcXHUoJXgleCV4JXgpJywgZnVuY3Rpb24oaCkKICAgICAgICBsb2NhbCBjb2RlID0gdG9udW1iZXIoaCwgMTYpCiAgICAgICAgaWYgY29kZSBhbmQgY29kZSA8IDEyOCB0aGVuIHJldHVybiBzdHJpbmcuY2hhcihjb2RlKSBlbmQKICAgICAgICByZXR1cm4gJz8nCiAgICAgIGVuZCkpCiAgICAgIGJvZHkgPSAoYm9keTpnc3ViKCdcXCguKScsIGZ1bmN0aW9uKHgpCiAgICAgICAgaWYgeCA9PSAnbicgdGhlbiByZXR1cm4gJ1xuJyBlbHNlaWYgeCA9PSAndCcgdGhlbiByZXR1cm4gJ1x0JwogICAgICAgIGVsc2VpZiB4ID09ICdyJyB0aGVuIHJldHVybiAnXHInIGVsc2VpZiB4ID09ICcvJyB0aGVuIHJldHVybiAnLycKICAgICAgICBlbHNlaWYgeCA9PSAnYicgdGhlbiByZXR1cm4gJ1xiJyBlbHNlaWYgeCA9PSAnZicgdGhlbiByZXR1cm4gJ1xmJyBlbHNlIHJldHVybiB4IGVuZAogICAgICBlbmQpKQogICAgICBwb3MgPSBqICsgMQogICAgICByZXR1cm4gYm9keQogICAgZWxzZWlmIGMgPT0gJ3QnIHRoZW4gcG9zID0gcG9zICsgNCByZXR1cm4gdHJ1ZQogICAgZWxzZWlmIGMgPT0gJ2YnIHRoZW4gcG9zID0gcG9zICsgNSByZXR1cm4gZmFsc2UKICAgIGVsc2VpZiBjID09ICduJyB0aGVuIHBvcyA9IHBvcyArIDQgcmV0dXJuIFlOVUxMCiAgICBlbHNlCiAgICAgIGxvY2FsIG51bSA9IHM6bWF0Y2goJ14lLT8lZCslLj8lZCpbZUVdP1slKyUtXT8lZConLCBwb3MpCiAgICAgIGlmIG51bSB0aGVuIHBvcyA9IHBvcyArICNudW0gcmV0dXJuIHRvbnVtYmVyKG51bSkgZW5kCiAgICAgIGVycm9yKCdqc29uOiDml6Dms5Xop6PmnpDlgLzvvIzkvY3nva4gJyAuLiBwb3MpCiAgICBlbmQKICBlbmQKICByZXR1cm4gdmFsdWUoKQplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0gWUFNTCDnvJbnoIHvvIh0YWJsZSDihpIg5paH5pys77yJCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gbmVlZHNfcXVvdGUocykKICBpZiBzID09ICcnIHRoZW4gcmV0dXJuIHRydWUgZW5kCiAgaWYgczptYXRjaCgnXiVzJykgb3IgczptYXRjaCgnJXMkJykgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBzOm1hdGNoKCdeWy0/OiwjJiohfD4lQGAiXCddJykgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBzOm1hdGNoKCdbOiVzXScpIHRoZW4gcmV0dXJuIHRydWUgZW5kICAgICAgICAgIC0tIOWGkuWPt+aIluepuueZvQogIGlmIHM6bG93ZXIoKSA9PSAndHJ1ZScgb3Igczpsb3dlcigpID09ICdmYWxzZScgb3Igczpsb3dlcigpID09ICdudWxsJwogICAgIG9yIHM6bG93ZXIoKSA9PSAneWVzJyBvciBzOmxvd2VyKCkgPT0gJ25vJyBvciBzOmxvd2VyKCkgPT0gJ29uJyBvciBzOmxvd2VyKCkgPT0gJ29mZicgdGhlbgogICAgcmV0dXJuIHRydWUKICBlbmQKICBpZiB0b251bWJlcihzKSB+PSBuaWwgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICBpZiBzOm1hdGNoKCdbJWNdJykgdGhlbiByZXR1cm4gdHJ1ZSBlbmQKICByZXR1cm4gZmFsc2UKZW5kCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfc2NhbGFyKHYpCiAgaWYgdiA9PSBuaWwgb3IgdiA9PSBZTlVMTCB0aGVuIHJldHVybiAnficgZW5kCiAgaWYgdHlwZSh2KSA9PSAnYm9vbGVhbicgdGhlbiByZXR1cm4gdiBhbmQgJ3RydWUnIG9yICdmYWxzZScgZW5kCiAgaWYgdHlwZSh2KSA9PSAnbnVtYmVyJyB0aGVuIHJldHVybiBzdHJpbmcuZm9ybWF0KCclZycsIHYpIGVuZAogIGxvY2FsIHMgPSB0b3N0cmluZyh2KQogIGlmIG5lZWRzX3F1b3RlKHMpIHRoZW4KICAgIHJldHVybiAnIicgLi4ganNvbl9lc2NhcGUocykgLi4gJyInCiAgZW5kCiAgcmV0dXJuIHMKZW5kCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfdGFibGUodCwgaW5kZW50KQogIGxvY2FsIHBhZCA9IHN0cmluZy5yZXAoJyAgJywgaW5kZW50KQogIGxvY2FsIG91dCA9IHt9CiAgaWYgaXNfYXJyYXkodCkgdGhlbgogICAgaWYgI3QgPT0gMCB0aGVuIHJldHVybiAnW10nIGVuZAogICAgZm9yIGkgPSAxLCAjdCBkbwogICAgICBsb2NhbCB2ID0gdFtpXQogICAgICBpZiB0eXBlKHYpID09ICd0YWJsZScgYW5kIG5vdCAodiA9PSBZTlVMTCkgdGhlbgogICAgICAgIC0tIOWGheiBlOihqO+8mue8qei/m+S4gOWxggogICAgICAgIGxvY2FsIHN1YiA9IGVuY29kZV90YWJsZSh2LCBpbmRlbnQgKyAxKQogICAgICAgIGlmIGlzX2FycmF5KHYpIHRoZW4KICAgICAgICAgIG91dFsjb3V0ICsgMV0gPSBwYWQgLi4gJy1cbicgLi4gc3ViCiAgICAgICAgZWxzZQogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHBhZCAuLiAnLVxuJyAuLiBzdWIKICAgICAgICBlbmQKICAgICAgZWxzZQogICAgICAgIG91dFsjb3V0ICsgMV0gPSBwYWQgLi4gJy0gJyAuLiBlbmNvZGVfc2NhbGFyKHYpCiAgICAgIGVuZAogICAgZW5kCiAgICByZXR1cm4gdGFibGUuY29uY2F0KG91dCwgJ1xuJykKICBlbHNlCiAgICBsb2NhbCBua2V5cyA9IDAKICAgIGZvciBfIGluIHBhaXJzKHQpIGRvIG5rZXlzID0gbmtleXMgKyAxIGVuZAogICAgaWYgbmtleXMgPT0gMCB0aGVuIHJldHVybiAne30nIGVuZAogICAgLS0g56iz5a6a6aG65bqP77ya5pWw5a2X6ZSu5Y2H5bqP77yM5YW25L2Z5oyJ5Ye6546w6aG65bqP6L+R5Ly877yIcGFpcnMg6aG65bqP5LiN5a6a77yM5YGa566A5Y2V5o6S5bqP77yJCiAgICBsb2NhbCBrZXlzID0ge30KICAgIGZvciBrIGluIHBhaXJzKHQpIGRvIGtleXNbI2tleXMgKyAxXSA9IGsgZW5kCiAgICB0YWJsZS5zb3J0KGtleXMsIGZ1bmN0aW9uKGEsIGIpCiAgICAgIGlmIHR5cGUoYSkgfj0gdHlwZShiKSB0aGVuIHJldHVybiB0eXBlKGEpIDwgdHlwZShiKSBlbmQKICAgICAgcmV0dXJuIHRvc3RyaW5nKGEpIDwgdG9zdHJpbmcoYikKICAgIGVuZCkKICAgIGZvciBfLCBrIGluIGlwYWlycyhrZXlzKSBkbwogICAgICBsb2NhbCB2ID0gdFtrXQogICAgICBsb2NhbCBrZXlzdHIgPSB0eXBlKGspID09ICdzdHJpbmcnIGFuZCAobmVlZHNfcXVvdGUoaykgYW5kICgnIicgLi4ganNvbl9lc2NhcGUoaykgLi4gJyInKSBvciBrKSBvciB0b3N0cmluZyhrKQogICAgICBpZiB0eXBlKHYpID09ICd0YWJsZScgYW5kIHYgfj0gWU5VTEwgdGhlbgogICAgICAgIGlmIChpc19hcnJheSh2KSBhbmQgI3YgPT0gMCkgb3IgKChub3QgaXNfYXJyYXkodikpIGFuZCAoZnVuY3Rpb24oKSBsb2NhbCBjPTAgZm9yIF8gaW4gcGFpcnModikgZG8gYz1jKzEgZW5kIHJldHVybiBjPT0wIGVuZCkoKSkgdGhlbgogICAgICAgICAgb3V0WyNvdXQgKyAxXSA9IHBhZCAuLiBrZXlzdHIgLi4gJzogJyAuLiAoaXNfYXJyYXkodikgYW5kICdbXScgb3IgJ3t9JykKICAgICAgICBlbHNlCiAgICAgICAgICBvdXRbI291dCArIDFdID0gcGFkIC4uIGtleXN0ciAuLiAnOicKICAgICAgICAgIG91dFsjb3V0ICsgMV0gPSBlbmNvZGVfdGFibGUodiwgaW5kZW50ICsgMSkKICAgICAgICBlbmQKICAgICAgZWxzZQogICAgICAgIG91dFsjb3V0ICsgMV0gPSBwYWQgLi4ga2V5c3RyIC4uICc6ICcgLi4gZW5jb2RlX3NjYWxhcih2KQogICAgICBlbmQKICAgIGVuZAogICAgcmV0dXJuIHRhYmxlLmNvbmNhdChvdXQsICdcbicpCiAgZW5kCmVuZAoKZnVuY3Rpb24geWFtbC5lbmNvZGUodCkKICBpZiB0ID09IG5pbCBvciB0ID09IFlOVUxMIHRoZW4gcmV0dXJuICd+XG4nIGVuZAogIGlmIHR5cGUodCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiBlbmNvZGVfc2NhbGFyKHQpIC4uICdcbicgZW5kCiAgcmV0dXJuIGVuY29kZV90YWJsZSh0LCAwKSAuLiAnXG4nCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVREYg5YiG5Y+R5YyF6KOFCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KcmV0dXJuIGZ1bmN0aW9uKHApCiAgaWYgdHlwZShwKSA9PSAnc3RyaW5nJyB0aGVuCiAgICByZXR1cm4ganNvbl9lbmNvZGUoeWFtbC5sb2FkKHApKQogIGVuZAogIGlmIHR5cGUocCkgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiAnJyBlbmQKICBsb2NhbCBvcCA9IHAub3Agb3IgJ2xvYWQnCiAgaWYgb3AgPT0gJ2xvYWQnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZSh5YW1sLmxvYWQocC52IG9yICcnKSkKICBlbHNlaWYgb3AgPT0gJ2VuY29kZScgdGhlbgogICAgbG9jYWwgdCA9IHAudgogICAgaWYgdHlwZSh0KSA9PSAnc3RyaW5nJyB0aGVuIHQgPSBqc29uX2RlY29kZSh0KSBlbmQKICAgIHJldHVybiB5YW1sLmVuY29kZSh0KQogIGVsc2VpZiBvcCA9PSAnZW5jb2RlX2Zyb21fbHVhJyB0aGVuCiAgICAtLSBwLnYg55u05o6l5pivIEx1YSDooajvvIhEdWNrREIgTElTVC9TVFJVQ1Qg5Lyg5YWl77yJCiAgICByZXR1cm4geWFtbC5lbmNvZGUocC52KQogIGVuZAogIHJldHVybiAnJwplbmQKAC0tIEBsaWI6IHhtbAotLSBAY2F0ZWdvcnk6IHBhcnNlcgotLSBAZGVzYzogWE1MIOino+aekO+8iOe6ryBMdWHvvIzoh6rljIXlkKvvvInjgIJ4bWwyanMg6aOO5qC85a+56LGh5YyW77ya5bGe5oCnIOKGkiBA5ZCN77yM6YeN5aSN5a2Q5qCH562+IOKGkiDmlbDnu4TvvIwKLS0gICAgICAg5Y+25a2Q5paH5pysIOKGkiDlrZfnrKbkuLLjgIJvcD0nbG9hZCfvvJpYTUwg5paH5pysIOKGkiBKU09OIOWtl+espuS4su+8iOmFjSBqc29uX2V4dHJhY3Qg5bGV5byA77yJ77ybCi0tICAgICAgIG9wPSdmaW5kJ++8mueugOWNlei3r+W+hCAvL3RhZy9zdWIg4oaSIOWMuemFjeiKgueCuSBKU09OIOaVsOe7hO+8iHRhZyDmiJYgJyon77yJ77ybCi0tICAgICAgIG9wPSdhdHRyJ++8mui3r+W+hCvlsZ7mgKflkI0g4oaSIOWxnuaAp+WAvO+8m29wPSd0ZXh0J++8muWOu+mZpOaJgOacieagh+etvueahOe6r+aWh+acrOOAggotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yM6Ieq5YyF5ZCr5peg5aSW6YOo5L6d6LWW77yJCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0g5pSv5oyB5a2Q6ZuG77yI6K+a5a6e6L6555WM77yJ77ya5YWD57SgL+WxnuaApy/mlofmnKwvQ0RBVEEv5rOo6YeKL1BJL+WjsOaYji/lrp7kvZMoJmFtcDvnrYkrJiNOTjsrJiN4Tk47KeOAggotLSDmnKrmlK/mjIHvvJrlkb3lkI3nqbrpl7TliY3nvIDvvIjkv53nlZnljp/moLfkvZwgdGFnIOWQje+8ieOAgURURCDlrp7kvZPlrprkuYnjgIFYU0TjgIIKLS0KLS0gVXNhZ2UgKGR1Y2tkYi1sdWFqaXQsIHNjYWxhciBtb2RlKToKLS0gICBpbnN0YWxsOiAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGU6PSdpbnN0YWxsJywgc3FsX25hbWU6PSd4bWwnKTsKLS0gICBsb2FkOiAgICAgU0VMRUNUIGx1YWppdF9zKCd4bWwnLCB7djogJzxhPjxiPjE8L2I+PGI+MjwvYj48L2E+Jywgb3A6ICdsb2FkJ30pOwotLSAgICAgICAgICAgICDihpIgeyJhIjp7ImIiOlsiMSIsIjIiXX19Ci0tICAgZHJpbGw6ICAgIFNFTEVDVCBqc29uX2V4dHJhY3QobHVhaml0X3MoJ3htbCcsIHt2OiB4LCBvcDogJ2xvYWQnfSksICckLmEuYlswXScpOwotLSAgIGZpbmQ6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3htbCcsIHt2OiB4LCBvcDogJ2ZpbmQnLCBwYXRoOiAnLy9ib29rL3RpdGxlJ30pOwotLSAgIGF0dHI6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3htbCcsIHt2OiB4LCBvcDogJ2F0dHInLCBwYXRoOiAnLy9ib29rJywgbmFtZTogJ2lkJ30pOwotLSAgIHRleHQ6ICAgICBTRUxFQ1QgbHVhaml0X3MoJ3htbCcsIHt2OiAnPHA+aGkgPGI+Ym9sZDwvYj48L3A+Jywgb3A6ICd0ZXh0J30pOyAg4oaSICJoaSBib2xkIgoKbG9jYWwgeG1sID0ge30KCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5a6e5L2T6Kej56CBCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgRU5UID0geyBhbXAgPSAnJicsIGx0ID0gJzwnLCBndCA9ICc+JywgcXVvdCA9ICciJywgYXBvcyA9ICInIiB9Cgpsb2NhbCBmdW5jdGlvbiBkZWNvZGVfZW50aXRpZXMocykKICBzID0gKHM6Z3N1YignJiN4KFswLTlhLWZBLUZdKyk7JywgZnVuY3Rpb24oaCkKICAgIGxvY2FsIGMgPSB0b251bWJlcihoLCAxNikKICAgIHJldHVybiBjIGFuZCBjIDwgMTI4IGFuZCBzdHJpbmcuY2hhcihjKSBvciAnPycKICBlbmQpKQogIHMgPSAoczpnc3ViKCcmIyhbMC05XSspOycsIGZ1bmN0aW9uKGgpCiAgICBsb2NhbCBjID0gdG9udW1iZXIoaCkKICAgIHJldHVybiBjIGFuZCBjIDwgMTI4IGFuZCBzdHJpbmcuY2hhcihjKSBvciAnPycKICBlbmQpKQogIHMgPSAoczpnc3ViKCcmKFslYV1bJXddKik7JywgZnVuY3Rpb24obikgcmV0dXJuIEVOVFtuXSBvciAoJyYnIC4uIG4gLi4gJzsnKSBlbmQpKQogIHJldHVybiBzCmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSDor43ms5Ug4oaSIOivreazleagkQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIG1ha2Vfbm9kZShuYW1lKQogIHJldHVybiB7IG5hbWUgPSBuYW1lLCBhdHRycyA9IHt9LCBjb250ZW50ID0ge30sIGNoaWxkcmVuID0ge30gfQplbmQKCi0tIOWcqCBwb3Mg5aSE6Kej5p6Q5LiA5Liq5a6M5pW05YWD57Sg77yM6L+U5ZueIChub2RlLCBuZXdwb3MpCmxvY2FsIHBhcnNlX2VsZW1lbnQKCmxvY2FsIGZ1bmN0aW9uIHNraXBfd3MocywgaSkKICB3aGlsZSBpIDw9ICNzIGFuZCBzOnN1YihpLCBpKTptYXRjaCgnJXMnKSBkbyBpID0gaSArIDEgZW5kCiAgcmV0dXJuIGkKZW5kCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9hdHRyaWJ1dGVzKHMsIGkpCiAgbG9jYWwgYXR0cnMgPSB7fQogIHdoaWxlIHRydWUgZG8KICAgIGkgPSBza2lwX3dzKHMsIGkpCiAgICBsb2NhbCBjID0gczpzdWIoaSwgaSkKICAgIGlmIGMgPT0gJy8nIG9yIGMgPT0gJz4nIG9yIGMgPT0gJycgdGhlbiByZXR1cm4gYXR0cnMsIGkgZW5kCiAgICBsb2NhbCBuYW1lID0gczptYXRjaCgnKFslYV8lOiUtXVsldyU6JS4lLV0qKScsIGkpCiAgICBpZiBub3QgbmFtZSB0aGVuIGVycm9yKCd4bWw6IOmdnuazleWxnuaAp+WQje+8jOS9jee9riAnIC4uIGkpIGVuZAogICAgaSA9IGkgKyAjbmFtZQogICAgaSA9IHNraXBfd3MocywgaSkKICAgIGlmIHM6c3ViKGksIGkpIH49ICc9JyB0aGVuIGVycm9yKCd4bWw6IOWxnuaApyAnIC4uIG5hbWUgLi4gJyDnvLogPe+8jOS9jee9riAnIC4uIGkpIGVuZAogICAgaSA9IHNraXBfd3MocywgaSArIDEpCiAgICBsb2NhbCBxID0gczpzdWIoaSwgaSkKICAgIGlmIHEgfj0gJyInIGFuZCBxIH49ICInIiB0aGVuCiAgICAgIGVycm9yKCd4bWw6IOWxnuaApyAnIC4uIG5hbWUgLi4gJyDlgLznvLrlvJXlj7fvvIzkvY3nva4gJyAuLiBpKQogICAgZW5kCiAgICBsb2NhbCBlID0gczpmaW5kKHEsIGkgKyAxLCB0cnVlKQogICAgaWYgbm90IGUgdGhlbiBlcnJvcigneG1sOiDlsZ7mgKcgJyAuLiBuYW1lIC4uICcg5byV5Y+35pyq6Zet5ZCIJykgZW5kCiAgICBhdHRyc1tuYW1lXSA9IGRlY29kZV9lbnRpdGllcyhzOnN1YihpICsgMSwgZSAtIDEpKQogICAgaSA9IGUgKyAxCiAgZW5kCmVuZAoKcGFyc2VfZWxlbWVudCA9IGZ1bmN0aW9uKHMsIGkpCiAgLS0gc1tpXSA9PSAnPCfvvIxzW2krMV0g5piv5ZCN56ew6aaW5a2X56ymCiAgbG9jYWwgbmFtZSA9IHM6bWF0Y2goJ1slYV8lOiUtXVsldyU6JS4lLV0qJywgaSArIDEpCiAgaWYgbm90IG5hbWUgdGhlbiBlcnJvcigneG1sOiDpnZ7ms5XlhYPntKDlkI3vvIzkvY3nva4gJyAuLiBpKSBlbmQKICBpID0gaSArIDEgKyAjbmFtZQogIGxvY2FsIG5vZGUgPSBtYWtlX25vZGUobmFtZSkKICBsb2NhbCBhdHRycywgaiA9IHBhcnNlX2F0dHJpYnV0ZXMocywgaSkKICBub2RlLmF0dHJzID0gYXR0cnMKICBpID0gagogIGxvY2FsIGMgPSBzOnN1YihpLCBpKQogIGlmIGMgPT0gJy8nIHRoZW4KICAgIC0tIOiHqumXreWQiAogICAgaWYgczpzdWIoaSArIDEsIGkgKyAxKSB+PSAnPicgdGhlbiBlcnJvcigneG1sOiDoh6rpl63lkIjmoIfnrb4gJyAuLiBuYW1lIC4uICcg6Z2e5rOVJykgZW5kCiAgICByZXR1cm4gbm9kZSwgaSArIDIKICBlbHNlaWYgYyA9PSAnPicgdGhlbgogICAgaSA9IGkgKyAxCiAgZWxzZQogICAgZXJyb3IoJ3htbDog5YWD57SgICcgLi4gbmFtZSAuLiAnIOagh+etvue7k+adn+mdnuazle+8jOS9jee9riAnIC4uIGkpCiAgZW5kCiAgLS0g5YaF5a6577ya5pyJ5bqPICh0ZXh0fGVsZW1lbnQpIOWIl+ihqO+8jOebtOWIsCA8L25hbWU+CiAgbG9jYWwgY29udGVudCA9IG5vZGUuY29udGVudAogIHdoaWxlIGkgPD0gI3MgZG8KICAgIGlmIHM6c3ViKGksIGkpID09ICc8JyB0aGVuCiAgICAgIGxvY2FsIGMyID0gczpzdWIoaSArIDEsIGkgKyAxKQogICAgICBpZiBjMiA9PSAnLycgdGhlbgogICAgICAgIC0tIOe7k+adn+agh+etvgogICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz4nLCBpKQogICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDog57uT5p2f5qCH562+5pyq6Zet5ZCI77yM5L2N572uICcgLi4gaSkgZW5kCiAgICAgICAgbG9jYWwgaW5uZXIgPSBzOnN1YihpICsgMiwgZSAtIDEpCiAgICAgICAgbG9jYWwgZW5hbWUgPSBpbm5lcjptYXRjaCgnXihbJWFfJTolLV1bJXclOiUuJS1dKiklcyokJykKICAgICAgICBpZiBub3QgZW5hbWUgdGhlbiBlcnJvcigneG1sOiDnu5PmnZ/moIfnrb7pnZ7ms5XvvIzkvY3nva4gJyAuLiBpKSBlbmQKICAgICAgICBpZiBlbmFtZSB+PSBuYW1lIHRoZW4KICAgICAgICAgIGVycm9yKCd4bWw6IOagh+etvuS4jeWMuemFje+8jOacn+acmyA8LycgLi4gbmFtZSAuLiAnPu+8jOS9jee9riAnIC4uIGkpCiAgICAgICAgZW5kCiAgICAgICAgcmV0dXJuIG5vZGUsIGUgKyAxCiAgICAgIGVsc2VpZiBjMiA9PSAnIScgdGhlbgogICAgICAgIC0tIENEQVRBIOaIliDms6jph4og5oiWIERPQ1RZUEUKICAgICAgICBpZiBzOnN1YihpICsgMSwgaSArIDgpID09ICchW0NEQVRBWycgdGhlbgogICAgICAgICAgbG9jYWwgZSA9IHM6ZmluZCgnXV0+JywgaSwgdHJ1ZSkKICAgICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDogQ0RBVEEg5pyq6Zet5ZCIJykgZW5kCiAgICAgICAgICB0YWJsZS5pbnNlcnQoY29udGVudCwgeyB0ID0gJ3RleHQnLCB2ID0gczpzdWIoaSArIDksIGUgLSAxKSB9KQogICAgICAgICAgaSA9IGUgKyAzCiAgICAgICAgZWxzZWlmIHM6c3ViKGkgKyAxLCBpICsgMykgPT0gJyEtLScgdGhlbgogICAgICAgICAgbG9jYWwgZSA9IHM6ZmluZCgnLS0+JywgaSwgdHJ1ZSkKICAgICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDog5rOo6YeK5pyq6Zet5ZCIJykgZW5kCiAgICAgICAgICBpID0gZSArIDMKICAgICAgICBlbHNlCiAgICAgICAgICAtLSBET0NUWVBFIC8g5YW25LuW5aOw5piO77yM6Lez6L+H5YiwID4KICAgICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz4nLCBpLCB0cnVlKQogICAgICAgICAgaWYgbm90IGUgdGhlbiBlcnJvcigneG1sOiDlo7DmmI7mnKrpl63lkIgnKSBlbmQKICAgICAgICAgIGkgPSBlICsgMQogICAgICAgIGVuZAogICAgICBlbHNlaWYgYzIgPT0gJz8nIHRoZW4KICAgICAgICAtLSBQSSA8PyAuLi4gPz4KICAgICAgICBsb2NhbCBlID0gczpmaW5kKCc/PicsIGksIHRydWUpCiAgICAgICAgaWYgbm90IGUgdGhlbiBlcnJvcigneG1sOiBQSSDmnKrpl63lkIgnKSBlbmQKICAgICAgICBpID0gZSArIDIKICAgICAgZWxzZQogICAgICAgIC0tIOWtkOWFg+e0oAogICAgICAgIGxvY2FsIGNoaWxkLCBuaSA9IHBhcnNlX2VsZW1lbnQocywgaSkKICAgICAgICBub2RlLmNoaWxkcmVuWyNub2RlLmNoaWxkcmVuICsgMV0gPSBjaGlsZAogICAgICAgIHRhYmxlLmluc2VydChjb250ZW50LCB7IHQgPSAnZWwnLCB2ID0gY2hpbGQgfSkKICAgICAgICBpID0gbmkKICAgICAgZW5kCiAgICBlbHNlCiAgICAgIC0tIOaWh+acrO+8mue0r+enr+WIsOS4i+S4gOS4qiAnPCcKICAgICAgbG9jYWwgZSA9IHM6ZmluZCgnPCcsIGkpCiAgICAgIGxvY2FsIGNodW5rCiAgICAgIGlmIGUgdGhlbgogICAgICAgIGNodW5rID0gczpzdWIoaSwgZSAtIDEpCiAgICAgICAgaSA9IGUKICAgICAgZWxzZQogICAgICAgIGNodW5rID0gczpzdWIoaSkKICAgICAgICBpID0gI3MgKyAxCiAgICAgIGVuZAogICAgICB0YWJsZS5pbnNlcnQoY29udGVudCwgeyB0ID0gJ3RleHQnLCB2ID0gZGVjb2RlX2VudGl0aWVzKGNodW5rKSB9KQogICAgZW5kCiAgZW5kCiAgZXJyb3IoJ3htbDog5YWD57SgICcgLi4gbmFtZSAuLiAnIOacqumXreWQiCcpCmVuZAoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfZG9jdW1lbnQocykKICAtLSDljrvmjokgQk9NCiAgcyA9IChzOmdzdWIoJ14lYm9tJywgJycpKQogIGxvY2FsIGkgPSBza2lwX3dzKHMsIDEpCiAgbG9jYWwgcm9vdCA9IG5pbAogIHdoaWxlIGkgPD0gI3MgZG8KICAgIGlmIHM6c3ViKGksIGkpID09ICc8JyB0aGVuCiAgICAgIGxvY2FsIGMyID0gczpzdWIoaSArIDEsIGkgKyAxKQogICAgICBpZiBjMiA9PSAnIScgdGhlbgogICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz4nLCBpLCB0cnVlKQogICAgICAgIGlmIG5vdCBlIHRoZW4gZXJyb3IoJ3htbDog5aOw5piO5pyq6Zet5ZCIJykgZW5kCiAgICAgICAgaSA9IGUgKyAxCiAgICAgIGVsc2VpZiBjMiA9PSAnPycgdGhlbgogICAgICAgIGxvY2FsIGUgPSBzOmZpbmQoJz8+JywgaSwgdHJ1ZSkKICAgICAgICBpZiBub3QgZSB0aGVuIGVycm9yKCd4bWw6IFBJIOacqumXreWQiCcpIGVuZAogICAgICAgIGkgPSBlICsgMgogICAgICBlbHNlCiAgICAgICAgbG9jYWwgbm9kZSwgbmkgPSBwYXJzZV9lbGVtZW50KHMsIGkpCiAgICAgICAgaWYgcm9vdCA9PSBuaWwgdGhlbgogICAgICAgICAgcm9vdCA9IG5vZGUKICAgICAgICBlbHNlCiAgICAgICAgICAtLSDlpJrmoLnvvJrljIXkuIDlsYIKICAgICAgICAgIGxvY2FsIHdyYXBwZXIgPSBtYWtlX25vZGUoJyNyb290JykKICAgICAgICAgIHdyYXBwZXIuY2hpbGRyZW5bI3dyYXBwZXIuY2hpbGRyZW4gKyAxXSA9IHJvb3QKICAgICAgICAgIHdyYXBwZXIuY2hpbGRyZW5bI3dyYXBwZXIuY2hpbGRyZW4gKyAxXSA9IG5vZGUKICAgICAgICAgIHJvb3QgPSB3cmFwcGVyCiAgICAgICAgZW5kCiAgICAgICAgaSA9IG5pCiAgICAgICAgaSA9IHNraXBfd3MocywgaSkKICAgICAgZW5kCiAgICBlbHNlCiAgICAgIGkgPSBpICsgMQogICAgZW5kCiAgZW5kCiAgaWYgbm90IHJvb3QgdGhlbiBlcnJvcigneG1sOiDnqbrmlofmoaMnKSBlbmQKICByZXR1cm4gcm9vdAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g5qCRIOKGkiB4bWwyanMg6aOO5qC8IEpTT04g5YW85a656KGoCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gY29sbGVjdF90ZXh0KG5vZGUpCiAgbG9jYWwgb3V0ID0ge30KICBmb3IgXywgaXQgaW4gaXBhaXJzKG5vZGUuY29udGVudCkgZG8KICAgIGlmIGl0LnQgPT0gJ3RleHQnIHRoZW4KICAgICAgb3V0WyNvdXQgKyAxXSA9IGl0LnYKICAgIGVsc2UKICAgICAgbG9jYWwgc3ViID0gY29sbGVjdF90ZXh0KGl0LnYpCiAgICAgIGlmIHN1YiB+PSAnJyB0aGVuIG91dFsjb3V0ICsgMV0gPSBzdWIgZW5kCiAgICBlbmQKICBlbmQKICByZXR1cm4gKHRhYmxlLmNvbmNhdChvdXQpOmdzdWIoJyVzKycsICcgJyk6bWF0Y2goJ14lcyooLi0pJXMqJCcpKQplbmQKCmxvY2FsIGZ1bmN0aW9uIG9iamVjdGlmeShub2RlKQogIGxvY2FsIGhhc19lbCA9ICNub2RlLmNoaWxkcmVuID4gMAogIC0tIOS7juacieW6jyBjb250ZW50IOaPkOWPluaWh+acrAogIGxvY2FsIHRleHRfaXRlbXMgPSB7fQogIGZvciBfLCBpdCBpbiBpcGFpcnMobm9kZS5jb250ZW50KSBkbwogICAgaWYgaXQudCA9PSAndGV4dCcgdGhlbiB0ZXh0X2l0ZW1zWyN0ZXh0X2l0ZW1zICsgMV0gPSBpdC52IGVuZAogIGVuZAogIGxvY2FsIHJhd3R4dCA9IHRhYmxlLmNvbmNhdCh0ZXh0X2l0ZW1zKQogIGxvY2FsIHR4dCA9IHJhd3R4dDptYXRjaCgnXiVzKiguLSklcyokJykKICBpZiBub3QgaGFzX2VsIHRoZW4KICAgIC0tIOWPtuWtkAogICAgaWYgbmV4dChub2RlLmF0dHJzKSB0aGVuCiAgICAgIGxvY2FsIHJlc3VsdCA9IHt9CiAgICAgIGZvciBrLCB2IGluIHBhaXJzKG5vZGUuYXR0cnMpIGRvIHJlc3VsdFsnQCcgLi4ga10gPSB2IGVuZAogICAgICBpZiB0eHQgfj0gJycgdGhlbiByZXN1bHRbJyN0ZXh0J10gPSB0eHQgZW5kCiAgICAgIHJldHVybiByZXN1bHQKICAgIGVuZAogICAgcmV0dXJuIHR4dAogIGVuZAogIC0tIOacieWtkOWFg+e0oAogIGxvY2FsIHJlc3VsdCA9IHt9CiAgZm9yIGssIHYgaW4gcGFpcnMobm9kZS5hdHRycykgZG8gcmVzdWx0WydAJyAuLiBrXSA9IHYgZW5kCiAgbG9jYWwgZ3JvdXBzLCBvcmRlciA9IHt9LCB7fQogIGZvciBfLCBjaCBpbiBpcGFpcnMobm9kZS5jaGlsZHJlbikgZG8KICAgIGlmIGdyb3Vwc1tjaC5uYW1lXSA9PSBuaWwgdGhlbgogICAgICBncm91cHNbY2gubmFtZV0gPSB7fQogICAgICBvcmRlclsjb3JkZXIgKyAxXSA9IGNoLm5hbWUKICAgIGVuZAogICAgdGFibGUuaW5zZXJ0KGdyb3Vwc1tjaC5uYW1lXSwgY2gpCiAgZW5kCiAgaWYgdHh0IH49ICcnIHRoZW4gcmVzdWx0WycjdGV4dCddID0gdHh0IGVuZAogIGZvciBfLCBubSBpbiBpcGFpcnMob3JkZXIpIGRvCiAgICBsb2NhbCBsaXN0ID0gZ3JvdXBzW25tXQogICAgaWYgI2xpc3QgPT0gMSB0aGVuCiAgICAgIHJlc3VsdFtubV0gPSBvYmplY3RpZnkobGlzdFsxXSkKICAgIGVsc2UKICAgICAgbG9jYWwgYXJyID0ge30KICAgICAgZm9yIF8sIGNoIGluIGlwYWlycyhsaXN0KSBkbyBhcnJbI2FyciArIDFdID0gb2JqZWN0aWZ5KGNoKSBlbmQKICAgICAgcmVzdWx0W25tXSA9IGFycgogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHJlc3VsdAplbmQKCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KLS0g6Lev5b6E5Yy56YWN77yILy9kZXNjZW5kYW50IOS4jiAvY2hpbGTvvIkKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQpsb2NhbCBmdW5jdGlvbiBzcGxpdChzLCBzZXApCiAgbG9jYWwgb3V0ID0ge30KICBsb2NhbCBzdGFydCA9IDEKICB3aGlsZSB0cnVlIGRvCiAgICBsb2NhbCBhLCBiID0gczpmaW5kKHNlcCwgc3RhcnQpCiAgICBpZiBhIHRoZW4KICAgICAgb3V0WyNvdXQgKyAxXSA9IHM6c3ViKHN0YXJ0LCBhIC0gMSkKICAgICAgc3RhcnQgPSBiICsgMQogICAgZWxzZQogICAgICBvdXRbI291dCArIDFdID0gczpzdWIoc3RhcnQpCiAgICAgIGJyZWFrCiAgICBlbmQKICBlbmQKICByZXR1cm4gb3V0CmVuZAoKbG9jYWwgZnVuY3Rpb24gcGFyc2VfcGF0aChwYXRoKQogIGxvY2FsIHN0ZXBzID0ge30KICBsb2NhbCBtYXJrZWQgPSBwYXRoOmdzdWIoJy8vJywgJy9eLycpICAtLSDov57nu63mlpzmnaDmoIforrDkuLrlkI7ku6MKICBsb2NhbCBkZXNjID0gZmFsc2UKICBmb3IgXywgcGFydCBpbiBpcGFpcnMoc3BsaXQobWFya2VkLCAnLycpKSBkbwogICAgaWYgcGFydCA9PSAnJyB0aGVuCiAgICAgIC0tIOaXoAogICAgZWxzZWlmIHBhcnQgPT0gJ14nIHRoZW4KICAgICAgZGVzYyA9IHRydWUKICAgIGVsc2UKICAgICAgc3RlcHNbI3N0ZXBzICsgMV0gPSB7IHRhZyA9IHBhcnQsIG1vZGUgPSBkZXNjIGFuZCAnZGVzYycgb3IgJ2NoaWxkJyB9CiAgICAgIGRlc2MgPSBmYWxzZQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHN0ZXBzCmVuZAoKbG9jYWwgZnVuY3Rpb24gYWxsX2Rlc2NlbmRhbnRzKG5vZGUsIG91dCkKICBmb3IgXywgY2ggaW4gaXBhaXJzKG5vZGUuY2hpbGRyZW4pIGRvCiAgICBvdXRbI291dCArIDFdID0gY2gKICAgIGFsbF9kZXNjZW5kYW50cyhjaCwgb3V0KQogIGVuZAplbmQKCmxvY2FsIGZ1bmN0aW9uIG1hdGNoX3BhdGgocm9vdCwgcGF0aCkKICBsb2NhbCBzdGVwcyA9IHBhcnNlX3BhdGgocGF0aCkKICBpZiAjc3RlcHMgPT0gMCB0aGVuIHJldHVybiB7fSBlbmQKICBsb2NhbCBzZXQgPSB7IHJvb3QgfQogIGxvY2FsIHNlZW4gPSB7fQogIGZvciBfLCBzdGVwIGluIGlwYWlycyhzdGVwcykgZG8KICAgIGxvY2FsIG5leHRfc2V0ID0ge30KICAgIGZvciBfLCBub2RlIGluIGlwYWlycyhzZXQpIGRvCiAgICAgIGxvY2FsIGNhbmRzCiAgICAgIGlmIHN0ZXAubW9kZSA9PSAnZGVzYycgdGhlbgogICAgICAgIGNhbmRzID0ge30KICAgICAgICBhbGxfZGVzY2VuZGFudHMobm9kZSwgY2FuZHMpCiAgICAgIGVsc2UKICAgICAgICBjYW5kcyA9IG5vZGUuY2hpbGRyZW4KICAgICAgZW5kCiAgICAgIGZvciBfLCBjaCBpbiBpcGFpcnMoY2FuZHMpIGRvCiAgICAgICAgaWYgKGNoLm5hbWUgPT0gc3RlcC50YWcgb3Igc3RlcC50YWcgPT0gJyonKSBhbmQgbm90IHNlZW5bY2hdIHRoZW4KICAgICAgICAgIHNlZW5bY2hdID0gdHJ1ZQogICAgICAgICAgbmV4dF9zZXRbI25leHRfc2V0ICsgMV0gPSBjaAogICAgICAgIGVuZAogICAgICBlbmQKICAgIGVuZAogICAgc2V0ID0gbmV4dF9zZXQKICBlbmQKICByZXR1cm4gc2V0CmVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBKU09OIOe8luino+egge+8iOS4jiB5YW1sIOW6k+S4gOiHtOeahOeyvueugOWunueOsO+8jOiHquWMheWQq++8iQotLSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09CmxvY2FsIGZ1bmN0aW9uIGpzb25fZXNjYXBlKHMpCiAgcmV0dXJuIChzOmdzdWIoJ1slYyJcXF0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnIicgdGhlbiByZXR1cm4gJ1xcIicKICAgIGVsc2VpZiBjID09ICdcXCcgdGhlbiByZXR1cm4gJ1xcXFwnCiAgICBlbHNlaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nCiAgICBlbHNlaWYgYyA9PSAnXHInIHRoZW4gcmV0dXJuICdcXHInCiAgICBlbHNlaWYgYyA9PSAnXHQnIHRoZW4gcmV0dXJuICdcXHQnCiAgICBlbHNlIHJldHVybiBzdHJpbmcuZm9ybWF0KCdcXHUlMDR4JywgYzpieXRlKCkpIGVuZAogIGVuZCkpCmVuZAoKbG9jYWwgZnVuY3Rpb24gaXNfYXJyYXkodCkKICBsb2NhbCBuID0gMAogIGZvciBrIGluIHBhaXJzKHQpIGRvCiAgICBpZiB0eXBlKGspIH49ICdudW1iZXInIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogICAgbiA9IG4gKyAxCiAgZW5kCiAgZm9yIGkgPSAxLCBuIGRvIGlmIHRbaV0gPT0gbmlsIHRoZW4gcmV0dXJuIGZhbHNlIGVuZCBlbmQKICByZXR1cm4gdHJ1ZQplbmQKCmxvY2FsIGpzb25fZW5jb2RlX3ZhbAoKanNvbl9lbmNvZGVfdmFsID0gZnVuY3Rpb24odikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgbG9jYWwgdHYgPSB0eXBlKHYpCiAgaWYgdHYgPT0gJ2Jvb2xlYW4nIHRoZW4gcmV0dXJuIHYgYW5kICd0cnVlJyBvciAnZmFsc2UnIGVuZAogIGlmIHR2ID09ICdudW1iZXInIHRoZW4KICAgIGlmIHYgfj0gdiBvciB2ID09IG1hdGguaHVnZSBvciB2ID09IC1tYXRoLmh1Z2UgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogICAgcmV0dXJuIHN0cmluZy5mb3JtYXQoJyVnJywgdikKICBlbmQKICBpZiB0diA9PSAnc3RyaW5nJyB0aGVuIHJldHVybiAnIicgLi4ganNvbl9lc2NhcGUodikgLi4gJyInIGVuZAogIGlmIHR2ID09ICd0YWJsZScgdGhlbgogICAgaWYgaXNfYXJyYXkodikgdGhlbgogICAgICBsb2NhbCBwYXJ0cyA9IHt9CiAgICAgIGZvciBpID0gMSwgI3YgZG8gcGFydHNbaV0gPSBqc29uX2VuY29kZV92YWwodltpXSkgZW5kCiAgICAgIHJldHVybiAnWycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICddJwogICAgZWxzZQogICAgICBsb2NhbCBrZXlzID0ge30KICAgICAgZm9yIGsgaW4gcGFpcnModikgZG8ga2V5c1sja2V5cyArIDFdID0gayBlbmQKICAgICAgdGFibGUuc29ydChrZXlzLCBmdW5jdGlvbihhLCBiKSByZXR1cm4gdG9zdHJpbmcoYSkgPCB0b3N0cmluZyhiKSBlbmQpCiAgICAgIGxvY2FsIHBhcnRzID0ge30KICAgICAgZm9yIF8sIGsgaW4gaXBhaXJzKGtleXMpIGRvCiAgICAgICAgcGFydHNbI3BhcnRzICsgMV0gPSAnIicgLi4ganNvbl9lc2NhcGUodG9zdHJpbmcoaykpIC4uICciOicgLi4ganNvbl9lbmNvZGVfdmFsKHZba10pCiAgICAgIGVuZAogICAgICByZXR1cm4gJ3snIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywnKSAuLiAnfScKICAgIGVuZAogIGVuZAogIHJldHVybiAnbnVsbCcKZW5kCgpsb2NhbCBmdW5jdGlvbiBqc29uX2VuY29kZSh2KSByZXR1cm4ganNvbl9lbmNvZGVfdmFsKHYpIGVuZAoKLS0gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PQotLSBVREYg5YiG5Y+R5YyF6KOFCi0tID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0KbG9jYWwgZnVuY3Rpb24gbG9hZF93cmFwcGVkKHNyYykKICBsb2NhbCByb290ID0gcGFyc2VfZG9jdW1lbnQoc3JjKQogIHJldHVybiB7IFtyb290Lm5hbWVdID0gb2JqZWN0aWZ5KHJvb3QpIH0KZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4KICAgIHJldHVybiBqc29uX2VuY29kZShsb2FkX3dyYXBwZWQocCkpCiAgZW5kCiAgaWYgdHlwZShwKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIHYgPSBwLnYgb3IgJycKICBpZiB2ID09ICcnIHRoZW4gcmV0dXJuICcnIGVuZAogIGxvY2FsIG9wID0gcC5vcCBvciAnbG9hZCcKICBsb2NhbCByb290ID0gcGFyc2VfZG9jdW1lbnQodikKICBpZiBvcCA9PSAnbG9hZCcgdGhlbgogICAgcmV0dXJuIGpzb25fZW5jb2RlKHsgW3Jvb3QubmFtZV0gPSBvYmplY3RpZnkocm9vdCkgfSkKICBlbHNlaWYgb3AgPT0gJ2ZpbmQnIHRoZW4KICAgIGxvY2FsIG5vZGVzID0gbWF0Y2hfcGF0aChyb290LCBwLnBhdGggb3IgJycpCiAgICBsb2NhbCBhcnIgPSB7fQogICAgZm9yIF8sIG4gaW4gaXBhaXJzKG5vZGVzKSBkbwogICAgICBhcnJbI2FyciArIDFdID0gb2JqZWN0aWZ5KG4pCiAgICBlbmQKICAgIHJldHVybiBqc29uX2VuY29kZShhcnIpCiAgZWxzZWlmIG9wID09ICdhdHRyJyB0aGVuCiAgICBsb2NhbCBub2RlcyA9IG1hdGNoX3BhdGgocm9vdCwgcC5wYXRoIG9yICcnKQogICAgaWYgI25vZGVzID4gMCBhbmQgbm9kZXNbMV0uYXR0cnNbcC5uYW1lXSB+PSBuaWwgdGhlbgogICAgICByZXR1cm4gbm9kZXNbMV0uYXR0cnNbcC5uYW1lXQogICAgZW5kCiAgICByZXR1cm4gbmlsCiAgZWxzZWlmIG9wID09ICd0ZXh0JyB0aGVuCiAgICByZXR1cm4gY29sbGVjdF90ZXh0KHJvb3QpCiAgZW5kCiAgcmV0dXJuICcnCmVuZAoAUEFOSUM6IHVucHJvdGVjdGVkIGVycm9yIGluIGNhbGwgdG8gTHVhIEFQSSAoJXMpCgAtLSBAbGliOiBwZ3JvdXRpbmcKLS0gQGNhdGVnb3J5OiB1ZGYKLS0gQGRlc2M6IOe9kee7nOacgOefrei3r++8iHBncm91dGluZyDmoLjlv4PnrpflrZAgc2hvcnRlc3RfcGF0aCDnmoQgRGlqa3N0cmEg5a6e546w77yJ77yM57qvIEx1YeOAgembtiBGRknjgIEKLS0gICAgICAg5Y2V5paH5Lu244CC6L6T5YWl5LiA57uE6L65IChzcmNfbm9kZSwgdGd0X25vZGUsIGNvc3Qp77yM6L6T5Ye65rqQ4oaS55uu55qE5pyA55+t6Lev5b6E6IqC54K55bqP5YiXICsg5oC75Luj5Lu344CCCi0tICAgICAgIOS4jiBQRyBwZ3JvdXRpbmcg55qEIF9wZ3JfZGlqa3N0cmEg6K+t5LmJ5a+56b2Q77ya5oyJIGNvc3Qg5Yqg5p2D44CB5peg6LSf5p2D6KaB5rGC77yIRGlqa3N0cmHvvInjgIIKLS0gICAgICAg6buY6K6k5pyJ5ZCR5Zu+77yIZGlyZWN0ZWQ9dHJ1Ze+8ie+8m2RpcmVjdGVkPWZhbHNlIOaXtui+ueinhuS4uuWPjOWQke+8iOaXoOWQke+8ieOAggotLSAgICAgICDlpJrnm67moIcv5aSa5rqQ77yacGdyb3V0aW5nIOeahCBfcGdyX2tkaWprc3RyYSDlj5jkvZPvvIhrIOadoeacgOefrei3r+W+hO+8ieWPr+WQjue7reWKoOOAggotLSAgICAgICDlj4LmlbDvvIhzdHJ1Y3TvvInvvJoKLS0gICAgICAgICBlZGdlcyAgIDogYXJyYXkgb2YgW3UsIHYsIHdd77yIdS92IOaVtOaVsOiKgueCue+8jHcg5pWw5YC85Luj5Lu377yM5b+F6aG7ID4wIOaIliA+PTDvvIkKLS0gICAgICAgICBzcmMgICAgIDog5rqQ6IqC54K577yI5pW05pWw77yJCi0tICAgICAgICAgdGd0ICAgICA6IOebrueahOiKgueCue+8iOaVtOaVsO+8iQotLSAgICAgICAgIGRpcmVjdGVkOiBib29s77yM6buY6K6kIHRydWUKLS0gQHNvdXJjZTogRGlqa3N0cmEg566X5rOV77yb5o6l5Y+j5a+56b2QIHBncm91dGluZ++8iGh0dHBzOi8vcGdyb3V0aW5nLmdpdGh1Yi5pb++8iQotLSBAcmVxdWlyZXM6IG5vbmXvvIjljZXmlofku7boh6rljIXlkKvvvIkKLS0gQGxpY2Vuc2U6IE1JVAotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSBVc2FnZToKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnaW5zdGFsbCcsIHNxbF9uYW1lIDo9ICdwZ3JvdXRpbmcnKTsKLS0gICBTRUxFQ1QgbHVhaml0X3MoJ3Bncm91dGluZycsIHtlZGdlczpbWzEsMiwxXSxbMiwzLDJdLFsxLDMsNV1dLCBzcmM6MSwgdGd0OjMsIG9wOidzaG9ydGVzdF9wYXRoJ30pOwotLSAgIC0+IHsicGF0aCI6WzEsMiwzXSwiY29zdCI6MywiZXhpc3RzIjp0cnVlfQoKLS0g5LqM5Y+J5aCG5LyY5YWI6Zif5YiX77yI5pWw57uEIFtrZXksIG5vZGVd77yJCmxvY2FsIGZ1bmN0aW9uIG5ld19oZWFwKCkKICBsb2NhbCBoID0ge2EgPSB7fSwgbiA9IDB9CiAgbG9jYWwgZnVuY3Rpb24gdXAoaSkKICAgIHdoaWxlIGkgPiAxIGRvCiAgICAgIGxvY2FsIHAgPSBtYXRoLmZsb29yKGkgLyAyKQogICAgICBpZiBoLmFbaV1bMV0gPCBoLmFbcF1bMV0gdGhlbiBoLmFbaV0sIGguYVtwXSA9IGguYVtwXSwgaC5hW2ldOyBpID0gcCBlbHNlIGJyZWFrIGVuZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgZnVuY3Rpb24gZG93bihpKQogICAgbG9jYWwgbiA9IGgubgogICAgd2hpbGUgMiAqIGkgPD0gbiBkbwogICAgICBsb2NhbCBjID0gMiAqIGkKICAgICAgaWYgYyArIDEgPD0gbiBhbmQgaC5hW2MrMV1bMV0gPCBoLmFbY11bMV0gdGhlbiBjID0gYyArIDEgZW5kCiAgICAgIGlmIGguYVtpXVsxXSA+IGguYVtjXVsxXSB0aGVuIGguYVtpXSwgaC5hW2NdID0gaC5hW2NdLCBoLmFbaV07IGkgPSBjIGVsc2UgYnJlYWsgZW5kCiAgICBlbmQKICBlbmQKICBoLnB1c2ggPSBmdW5jdGlvbihrZXksIG5vZGUpCiAgICBoLm4gPSBoLm4gKyAxCiAgICBoLmFbaC5uXSA9IHtrZXksIG5vZGV9CiAgICB1cChoLm4pCiAgZW5kCiAgaC5wb3AgPSBmdW5jdGlvbigpCiAgICBsb2NhbCB0b3AgPSBoLmFbMV0KICAgIGguYVsxXSA9IGguYVtoLm5dCiAgICBoLm4gPSBoLm4gLSAxCiAgICBpZiBoLm4gPiAwIHRoZW4gZG93bigxKSBlbmQKICAgIHJldHVybiB0b3BbMV0sIHRvcFsyXQogIGVuZAogIGguZW1wdHkgPSBmdW5jdGlvbigpIHJldHVybiBoLm4gPT0gMCBlbmQKICByZXR1cm4gaAplbmQKCmxvY2FsIGZ1bmN0aW9uIGpzb25fZXNjYXBlKHMpCiAgcmV0dXJuIChzOmdzdWIoJ1slYyJcXF0nLCBmdW5jdGlvbihjKQogICAgaWYgYyA9PSAnXG4nIHRoZW4gcmV0dXJuICdcXG4nIGVsc2VpZiBjID09ICdcdCcgdGhlbiByZXR1cm4gJ1xcdCcKICAgIGVsc2VpZiBjID09ICdccicgdGhlbiByZXR1cm4gJ1xccicgZWxzZWlmIGMgPT0gJ1xcJyB0aGVuIHJldHVybiAnXFxcXCcKICAgIGVsc2VpZiBjID09ICciJyB0aGVuIHJldHVybiAnXFwiJyBlbmQKICAgIHJldHVybiAoJ1xcdSUwNHgnKTpmb3JtYXQoYzpieXRlKCkpCiAgZW5kKSkKZW5kCgpsb2NhbCBmdW5jdGlvbiBidWlsZChkKQogIGFzc2VydCh0eXBlKGQpID09ICd0YWJsZScsICdwZ3JvdXRpbmc6IGV4cGVjdGVkIGRhdGEgdGFibGUgKHVudXNlZDsgc3RhdGVsZXNzKScpCiAgcmV0dXJuIGZ1bmN0aW9uKHApCiAgICBpZiB0eXBlKHApID09ICdzdHJpbmcnIHRoZW4gcCA9IHt2ID0gcH0gZW5kCiAgICBpZiB0eXBlKHApIH49ICd0YWJsZScgdGhlbiByZXR1cm4gJ3siZXJyb3IiOiJiYWQgaW5wdXQifScgZW5kCiAgICBsb2NhbCBvcCA9IHAub3Agb3IgJ3Nob3J0ZXN0X3BhdGgnCiAgICBsb2NhbCBlZGdlcyA9IHAuZWRnZXMKICAgIGxvY2FsIHNyYywgdGd0ID0gcC5zcmMsIHAudGd0CiAgICBpZiBvcCA9PSAnc2hvcnRlc3RfcGF0aCcgdGhlbgogICAgICBpZiB0eXBlKGVkZ2VzKSB+PSAndGFibGUnIHRoZW4gcmV0dXJuICd7ImVycm9yIjoibWlzc2luZyBlZGdlcyJ9JyBlbmQKICAgICAgaWYgc3JjID09IG5pbCBvciB0Z3QgPT0gbmlsIHRoZW4gcmV0dXJuICd7ImVycm9yIjoibWlzc2luZyBzcmMvdGd0In0nIGVuZAogICAgICBsb2NhbCBkaXJlY3RlZCA9IChwLmRpcmVjdGVkIH49IGZhbHNlKSAgLS0gZGVmYXVsdCB0cnVlCiAgICAgIC0tIGJ1aWxkIGFkamFjZW5jeQogICAgICBsb2NhbCBhZGogPSB7fQogICAgICBmb3IgXywgZSBpbiBpcGFpcnMoZWRnZXMpIGRvCiAgICAgICAgbG9jYWwgdSwgdiwgdyA9IGVbMV0sIGVbMl0sIGVbM10KICAgICAgICBpZiB0eXBlKHUpIH49ICdudW1iZXInIG9yIHR5cGUodikgfj0gJ251bWJlcicgb3IgdHlwZSh3KSB+PSAnbnVtYmVyJyB0aGVuCiAgICAgICAgICByZXR1cm4gJ3siZXJyb3IiOiJlZGdlIG11c3QgYmUgW3Usdix3XSBudW1lcmljIn0nCiAgICAgICAgZW5kCiAgICAgICAgYWRqW3VdID0gYWRqW3VdIG9yIHt9CiAgICAgICAgYWRqW3VdWyNhZGpbdV0rMV0gPSB7dG8gPSB2LCB3ID0gd30KICAgICAgICBpZiBub3QgZGlyZWN0ZWQgdGhlbgogICAgICAgICAgYWRqW3ZdID0gYWRqW3ZdIG9yIHt9CiAgICAgICAgICBhZGpbdl1bI2Fkalt2XSsxXSA9IHt0byA9IHUsIHcgPSB3fQogICAgICAgIGVuZAogICAgICBlbmQKICAgICAgaWYgc3JjID09IHRndCB0aGVuCiAgICAgICAgcmV0dXJuICd7InBhdGgiOlsnIC4uIHRvc3RyaW5nKHNyYykgLi4gJ10sImNvc3QiOjAsImV4aXN0cyI6dHJ1ZX0nCiAgICAgIGVuZAogICAgICAtLSBEaWprc3RyYQogICAgICBsb2NhbCBkaXN0ID0ge1tzcmNdID0gMH0KICAgICAgbG9jYWwgcHJldiA9IHt9CiAgICAgIGxvY2FsIHZpc2l0ZWQgPSB7fQogICAgICBsb2NhbCBoID0gbmV3X2hlYXAoKQogICAgICBoLnB1c2goMCwgc3JjKQogICAgICB3aGlsZSBub3QgaC5lbXB0eSgpIGRvCiAgICAgICAgbG9jYWwga2V5LCB1ID0gaC5wb3AoKQogICAgICAgIGlmIHZpc2l0ZWRbdV0gdGhlbiBnb3RvIGNvbnRpbnVlIGVuZAogICAgICAgIHZpc2l0ZWRbdV0gPSB0cnVlCiAgICAgICAgaWYgdSA9PSB0Z3QgdGhlbiBicmVhayBlbmQKICAgICAgICBmb3IgXywgYSBpbiBpcGFpcnMoYWRqW3VdIG9yIHt9KSBkbwogICAgICAgICAgbG9jYWwgdiwgdyA9IGEudG8sIGEudwogICAgICAgICAgaWYgbm90IHZpc2l0ZWRbdl0gdGhlbgogICAgICAgICAgICBsb2NhbCBuZCA9IGtleSArIHcKICAgICAgICAgICAgaWYgZGlzdFt2XSA9PSBuaWwgb3IgbmQgPCBkaXN0W3ZdIHRoZW4KICAgICAgICAgICAgICBkaXN0W3ZdID0gbmQKICAgICAgICAgICAgICBwcmV2W3ZdID0gdQogICAgICAgICAgICAgIGgucHVzaChuZCwgdikKICAgICAgICAgICAgZW5kCiAgICAgICAgICBlbmQKICAgICAgICBlbmQKICAgICAgICA6OmNvbnRpbnVlOjoKICAgICAgZW5kCiAgICAgIGlmIGRpc3RbdGd0XSA9PSBuaWwgdGhlbgogICAgICAgIHJldHVybiAneyJwYXRoIjpbXSwiY29zdCI6bnVsbCwiZXhpc3RzIjpmYWxzZX0nCiAgICAgIGVuZAogICAgICAtLSByZWNvbnN0cnVjdCBwYXRoCiAgICAgIGxvY2FsIHBhdGggPSB7fQogICAgICBsb2NhbCBjdXIgPSB0Z3QKICAgICAgd2hpbGUgY3VyIH49IG5pbCBkbwogICAgICAgIHBhdGhbI3BhdGgrMV0gPSBjdXIKICAgICAgICBjdXIgPSBwcmV2W2N1cl0KICAgICAgZW5kCiAgICAgIGxvY2FsIHJldiA9IHt9CiAgICAgIGZvciBpID0gI3Bh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AAAAAAAAAAAA0MhT93vVP+9AXe7trR89AAAAAADA5j8AAAAAAAAAAABgWd+91dU/3GWkCCoLCr1I8QMA4PEDAHDyAwBObyBlcnJvciBpbmZvcm1hdGlvbgBJbGxlZ2FsIGJ5dGUgc2VxdWVuY2UARG9tYWluIGVycm9yAFJlc3VsdCBub3QgcmVwcmVzZW50YWJsZQBOb3QgYSB0dHkAUGVybWlzc2lvbiBkZW5pZWQAT3BlcmF0aW9uIG5vdCBwZXJtaXR0ZWQATm8gc3VjaCBmaWxlIG9yIGRpcmVjdG9yeQBObyBzdWNoIHByb2Nlc3MARmlsZSBleGlzdHMAVmFsdWUgdG9vIGxhcmdlIGZvciBkYXRhIHR5cGUATm8gc3BhY2UgbGVmdCBvbiBkZXZpY2UAT3V0IG9mIG1lbW9yeQBSZXNvdXJjZSBidXN5AEludGVycnVwdGVkIHN5c3RlbSBjYWxsAFJlc291cmNlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlAEludmFsaWQgc2VlawBDcm9zcy1kZXZpY2UgbGluawBSZWFkLW9ubHkgZmlsZSBzeXN0ZW0ARGlyZWN0b3J5IG5vdCBlbXB0eQBDb25uZWN0aW9uIHJlc2V0IGJ5IHBlZXIAT3BlcmF0aW9uIHRpbWVkIG91dABDb25uZWN0aW9uIHJlZnVzZWQASG9zdCBpcyBkb3duAEhvc3QgaXMgdW5yZWFjaGFibGUAQWRkcmVzcyBpbiB1c2UAQnJva2VuIHBpcGUASS9PIGVycm9yAE5vIHN1Y2ggZGV2aWNlIG9yIGFkZHJlc3MAQmxvY2sgZGV2aWNlIHJlcXVpcmVkAE5vIHN1Y2ggZGV2aWNlAE5vdCBhIGRpcmVjdG9yeQBJcyBhIGRpcmVjdG9yeQBUZXh0IGZpbGUgYnVzeQBFeGVjIGZvcm1hdCBlcnJvcgBJbnZhbGlkIGFyZ3VtZW50AEFyZ3VtZW50IGxpc3QgdG9vIGxvbmcAU3ltYm9saWMgbGluayBsb29wAEZpbGVuYW1lIHRvbyBsb25nAFRvbyBtYW55IG9wZW4gZmlsZXMgaW4gc3lzdGVtAE5vIGZpbGUgZGVzY3JpcHRvcnMgYXZhaWxhYmxlAEJhZCBmaWxlIGRlc2NyaXB0b3IATm8gY2hpbGQgcHJvY2VzcwBCYWQgYWRkcmVzcwBGaWxlIHRvbyBsYXJnZQBUb28gbWFueSBsaW5rcwBObyBsb2NrcyBhdmFpbGFibGUAUmVzb3VyY2UgZGVhZGxvY2sgd291bGQgb2NjdXIAU3RhdGUgbm90IHJlY292ZXJhYmxlAFByZXZpb3VzIG93bmVyIGRpZWQAT3BlcmF0aW9uIGNhbmNlbGVkAEZ1bmN0aW9uIG5vdCBpbXBsZW1lbnRlZABObyBtZXNzYWdlIG9mIGRlc2lyZWQgdHlwZQBJZGVudGlmaWVyIHJlbW92ZWQARGV2aWNlIG5vdCBhIHN0cmVhbQBObyBkYXRhIGF2YWlsYWJsZQBEZXZpY2UgdGltZW91dABPdXQgb2Ygc3RyZWFtcyByZXNvdXJjZXMATGluayBoYXMgYmVlbiBzZXZlcmVkAFByb3RvY29sIGVycm9yAEJhZCBtZXNzYWdlAEZpbGUgZGVzY3JpcHRvciBpbiBiYWQgc3RhdGUATm90IGEgc29ja2V0AERlc3RpbmF0aW9uIGFkZHJlc3MgcmVxdWlyZWQATWVzc2FnZSB0b28gbGFyZ2UAUHJvdG9jb2wgd3JvbmcgdHlwZSBmb3Igc29ja2V0AFByb3RvY29sIG5vdCBhdmFpbGFibGUAUHJvdG9jb2wgbm90IHN1cHBvcnRlZABTb2NrZXQgdHlwZSBub3Qgc3VwcG9ydGVkAE5vdCBzdXBwb3J0ZWQAUHJvdG9jb2wgZmFtaWx5IG5vdCBzdXBwb3J0ZWQAQWRkcmVzcyBmYW1pbHkgbm90IHN1cHBvcnRlZCBieSBwcm90b2NvbABBZGRyZXNzIG5vdCBhdmFpbGFibGUATmV0d29yayBpcyBkb3duAE5ldHdvcmsgdW5yZWFjaGFibGUAQ29ubmVjdGlvbiByZXNldCBieSBuZXR3b3JrAENvbm5lY3Rpb24gYWJvcnRlZABObyBidWZmZXIgc3BhY2UgYXZhaWxhYmxlAFNvY2tldCBpcyBjb25uZWN0ZWQAU29ja2V0IG5vdCBjb25uZWN0ZWQAQ2Fubm90IHNlbmQgYWZ0ZXIgc29ja2V0IHNodXRkb3duAE9wZXJhdGlvbiBhbHJlYWR5IGluIHByb2dyZXNzAE9wZXJhdGlvbiBpbiBwcm9ncmVzcwBTdGFsZSBmaWxlIGhh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';
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
function em_host_call(sql){ var fn = Module._host_duckdb_call; return (typeof fn === 'function') ? fn(sql) : 'error: no host hook (call)'; }
function em_host_query(sql){ var fn = Module._host_duckdb_query; return (typeof fn === 'function') ? fn(sql) : '{"rows":[],"err":"no host hook (query)"}'; }





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
  
  var exceptionLast = 0;
  
  var uncaughtExceptionCount = 0;
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
  "__cxa_throw": ___cxa_throw,
  "__syscall_dup3": ___syscall_dup3,
  "__syscall_fcntl64": ___syscall_fcntl64,
  "__syscall_ioctl": ___syscall_ioctl,
  "__syscall_open": ___syscall_open,
  "abort": _abort,
  "clock": _clock,
  "em_host_call": em_host_call,
  "em_host_query": em_host_query,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "fd_close": _fd_close,
  "fd_read": _fd_read,
  "fd_seek": _fd_seek,
  "fd_write": _fd_write,
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
var dynCall_jiji = Module["dynCall_jiji"] = function() {
  return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["dynCall_jiji"]).apply(null, arguments);
};





// === Auto-generated postamble setup entry stuff ===

Module["ccall"] = ccall;
Module["cwrap"] = cwrap;
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
