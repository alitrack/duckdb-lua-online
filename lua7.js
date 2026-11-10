
var L7Module = (() => {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
  return (
function(L7Module) {
  L7Module = L7Module || {};



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
var Module = typeof L7Module != 'undefined' ? L7Module : {};

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

var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 402653184;

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
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABloOAgAA8YAF/AX9gA39/fwF/YAJ/fwF/YAJ/fwBgBH9/f38Bf2ADf39/AGABfwBgBH9/f38AYAV/f39/fwBgAXwBfGAAAX9gBX9/f39/AX9gBn9/f39/fwBgBX9+fn5+AGAAAGAGf39/f39/AX9gA39+fwF+YAF/AXxgAn9/AX5gAnx8AXxgAXwBfmACfH8BfGAEf35+fwBgAn98AGACf34AYAN/f34Bf2ADf39+AGACf38BfGAHf39/f39/fwF/YAN/fn4BfmADfHx/AXxgA3x+fgF8YAZ/fH9/f38Bf2ACfn8Bf2AEfn5+fgF/YAN/f38BfGADf39/AX5gA39/fAF8YAN/f34BfmADf3x/AGAJf39/f39/f39/AGAEf39+fgF+YAR/f35/AGACf34Bf2ABfwF+YAZ/f35/f38AYAN8f38Bf2ADf3x8AXxgAn5+AX5gAnx/AX9gAn98AXxgAX4Bf2ACfn4Bf2ADf35+AGAHf39/f39/fwBgA35/fwF/YAJ/fQBgAn5+AXxgBH9/fn8BfmAEf35/fwF/Aq+DgIAAEgNlbnYRZW1faG9zdF9jYWxsX2ZpbGwABQNlbnYSZW1faG9zdF9xdWVyeV9maWxsAAUDZW52BWFib3J0AA4DZW52GF9fY3hhX2FsbG9jYXRlX2V4Y2VwdGlvbgAAA2VudgtfX2N4YV90aHJvdwAFA2VudgR0aW1lAAADZW52BWNsb2NrAAoDZW52FWVtc2NyaXB0ZW5fbWVtY3B5X2JpZwABA2Vudg5fX3N5c2NhbGxfb3BlbgABA2VudhFfX3N5c2NhbGxfZmNudGw2NAABA2Vudg9fX3N5c2NhbGxfaW9jdGwAARZ3YXNpX3NuYXBzaG90X3ByZXZpZXcxCGZkX3dyaXRlAAQWd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQdmZF9yZWFkAAQWd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQhmZF9jbG9zZQAAA2Vudg5fX3N5c2NhbGxfZHVwMwABA2VudhZlbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwAAADZW52C3NldFRlbXBSZXQwAAYWd2FzaV9zbmFwc2hvdF9wcmV2aWV3MQdmZF9zZWVrAAsD0oWAgADQBQ4KCg4AAAICAhECAAMDBQUDAgICAgIBAwQCIyQCARICAgYX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////A0GODxDRAiIDNgI0IAAgACgCECIEQQFqNgIQIAMgBEECdGogAkEHdEHSAHI2AgALIAAgASAAKAIIKAIIEKwBC5cBAQN/IAEoAgAhAyAAKAIAIgQoAjQgASgCCEECdGoiASACQRh0IAEoAgBB////B3FyQYCAgAhqIgU2AgACQAJAIANBEkYNACABIAAtADQiAkEHdCAFQf+AfnFyNgIAIAJBAWohAQJAIAIgBC0ACEkNACACQf4BTw0CIAQgAToACAsgACABOgA0Cw8LIAAoAghBzgwQqgIAC2AAAkACQAJAIAEoAgBBbmoOAgABAgsgAUEINgIAIAEgACgCACgCNCABKAIIQQJ0aigCAEEHdkH/AXE2AggPCyAAKAIAKAI0IAEoAghBAnRqQQNqQQI6AAAgAUERNgIACwumCQEFfwJAAkACQAJAAkACQAJAAkACQAJAIAEoAgBBd2oOCwECAAYDBAUJCQcICQsCQAJAAkACQAJAAkAgACgCCCgCRCgCACABKAIIQRhsaiIALQAIQT9xDhUEAg4ABQ4ODg4ODg4ODg4ODgMOAQUOCyABQQY2AgAgASAAKQMANwMIDwsgAUEFNgIAIAEgACsDADkDCA8LIAFBAzYCAA8LIAFBAjYCAA8LIAFBATYCAA8LIAFBBzYCACABIAAoAgA2AggPCyABQQg2AgAgASABLQAINgIIDwsgACgCACECIAEoAgghAyACIAAoAggoAjQgAigCNCAAKAIQIAJBFGpBBEH/////A0GODxDRAiIENgI0IAAgACgCECIFQQFqNgIQIAQgBUECdGogA0EQdEEJcjYCACAAIAIgACgCCCgCCBCsASAAKAIQIQAgAUERNgIAIAEgAEF/ajYCCA8LIAAoAgAhAiABLQAKIQMgAS8BCCEEIAIgACgCCCgCNCACKAI0IAAoAhAgAkEUakEEQf////8DQY4PENECIgU2AjQgACAAKAIQIgZBAWo2AhAgBSAGQQJ0aiADQRB0IARBGHRyQQtyNgIAIAAgAiAAKAIIKAIIEKwBIAAoAhAhACABQRE2AgAgASAAQX9qNgIIDwsgAS0ACiECAkAgABDmAiACSg0AIAAgAC0ANEF/ajoANAsgACgCACECIAEtAAohAyABLwEIIQQgAiAAKAIIKAI0IAIoAjQgACgCECACQRRqQQRB/////wNBjg8Q0QIiBTYCNCAAIAAoAhAiBkEBajYCECAFIAZBAnRqIANBEHQgBEEYdHJBDXI2AgAgACACIAAoAggoAggQrAEgACgCECEAIAFBETYCACABIABBf2o2AggPCyABLQAKIQICQCAAEOYCIAJKDQAgACAALQA0QX9qOgA0CyAAKAIAIQIgAS0ACiEDIAEvAQghBCACIAAoAggoAjQgAigCNCAAKAIQIAJBFGpBBEH/////A0GODxDRAiIFNgI0IAAgACgCECIGQQFqNgIQIAUgBkECdGogA0EQdCAEQRh0ckEOcjYCACAAIAIgACgCCCgCCBCsASAAKAIQIQAgAUERNgIAIAEgAEF/ajYCCA8LIAEuAQghAiABLQAKIQMgABDmAiEEAkACQAJAIAMgAkwNAAJAIAQgA0oNACAAIAAtADRBf2o6ADQLIAAQ5gIgAkwNAQwCCwJAIAQgAkoNACAAIAAtADRBf2o6ADQLIAAQ5gIgA0oNAQsgACAALQA0QX9qOgA0CyAAKAIAIQIgAS0ACiEDIAEvAQghBCACIAAoAggoAjQgAigCNCAAKAIQIAJBFGpBBEH/////A0GODxDRAiIFNgI0IAAgACgCECIGQQFqNgIQIAUgBkECdGogA0EQdCAEQRh0ckEMcjYCACAAIAIgACgCCCgCCBCsASAAKAIQIQAgAUERNgIAIAEgAEF/ajYCCA8LIAFBCDYCACABIAAoAgAoAjQgASgCCEECdGooAgBBB3ZB/wFxNgIIDwsgACgCACgCNCABKAIIQQJ0akEDakECOgAAIAFBETYCAAsLigEBA38gACABEL4BAkAgASgCAEEIRw0AIAEoAgghAiAAEOYCIAJKDQAgACAALQA0QX9qOgA0CyAALQA0IgNBAWohAgJAAkAgAyAAKAIAIgQtAAhJDQAgA0H+AU8NASAEIAI6AAgLIAAgAjoANCAAIAEgAkH/AXFBf2oQwAEPCyAAKAIIQc4MEKoCAAuoBwEHfyAAIAEgAhDBAQJAIAEoAgAiA0EQRw0AIAEoAggiBEF/Rg0AAkACQCABKAIQIgVBf0YNACAAKAIAKAI0IQYDQEF/IAUiByAGIAdBAnRqIggoAgAiCUEHdkGBgIB4aiIFakEBaiAFQX9GGyIFQX9HDQALIAQgB0F/c2oiBUH///8HakGAgIAQTw0BIAggBUEHdCAJQf8AcXJBgP///wdqNgIADAILIAEgBDYCEAwBCyAAKAIIQYq9ARCqAgALAkAgASgCECIFIAEoAhQiBkYNAEF/IQQCQAJAAkAgBUF/Rg0AIAAoAgAoAjQhCQNAIAkgBUECdGohBwJAAkAgBUEBSA0AQYDYBCAHQXxqIggoAgBB/wBxai0AAEEQcQ0BCyAHIQgLIAgoAgBB/wBxQcMARw0CQX8gBSAHKAIAQQd2QYGAgHhqIgdqQQFqIAdBf0YbIgVBf0cNAAsLQX8hByAGQX9GDQEgACgCACgCNCEIA0AgCCAGQQJ0aiEFAkACQCAGQQFIDQBBgNgEIAVBfGoiBygCAEH/AHFqLQAAQRBxDQELIAUhBwsgBygCAEH/AHFBwwBHDQFBfyEEQX8hB0F/IAYgBSgCAEEHdkGBgIB4aiIFakEBaiAFQX9GGyIGQX9HDQAMAgsAC0F/IQYCQCADQRBGDQAgACgCACEFIAUgACgCCCgCNCAFKAI0IAAoAhAgBUEUakEEQf////8DQY4PENECIgc2AjQgACAAKAIQIgZBAWo2AhAgByAGQQJ0akG4/v//BzYCACAAIAUgACgCCCgCCBCsASAAKAIQQX9qIQYLIAAgACgCECIHNgIUIAAoAgAhBSAFIAAoAggoAjQgBSgCNCAHIAVBFGpBBEH/////A0GODxDRAiIHNgI0IAAgACgCECIIQQFqNgIQIAcgCEECdGogAkEHdCIIQQZyNgIAIAAgBSAAKAIIKAIIEKwBIAAgACgCECIHNgIUIAAoAgAhBSAFIAAoAggoAjQgBSgCNCAHIAVBFGpBBEH/////A0GODxDRAiIJNgI0IAAgACgCECIEQQFqNgIQIAkgBEECdGogCEEHcjYCACAAIAUgACgCCCgCCBCsASAAIAAoAhAiBTYCFCAAIAYgBUH/ASAFELMBIAdBf2ohByAFQX9qIQQLIAAgACgCECIFNgIUIAAgASgCFCAFIAIgBxCzASAAIAEoAhAgBSACIAQQswELIAEgAjYCCCABQn83AxAgAUEINgIAC88GAwV/AnwBfiMAQTBrIgMkACAAIAEQvgECQAJAAkACQAJAAkACQAJAAkACQAJAIAEoAgBBf2oOEQACAQQFBgMICgoKCgoKCgoHCgsgACACQQEQqwEMCAsgACgCACEEIAQgACgCCCgCNCAEKAI0IAAoAhAgBEEUakEEQf////8DQY4PENECIgU2AjQgACAAKAIQIgZBAWo2AhAgBSAGQQJ0aiACQQd0QQVyNgIAIAAgBCAAKAIIKAIIEKwBDAcLIAAoAgAhBCAEIAAoAggoAjQgBCgCNCAAKAIQIARBFGpBBEH/////A0GODxDRAiIFNgI0IAAgACgCECIGQQFqNgIQIAUgBkECdGogAkEHdEEHcjYCACAAIAQgACgCCCgCCBCsAQwGCyADIAEoAggiBDYCICADIAQtAARBwAByOgAoIAAgA0EgaiADQSBqELoBIQQgAUEENgIAIAEgBDYCCAsgACACIAEoAggQuwEMBAsCQCABKwMIIgggA0EAEPUDRQ0AIAMpAwAiCkL//3t8QoCAeFQNACAAKAIAIQQgBCAAKAIIKAI0IAQoAjQgACgCECAEQRRqQQRB/////wNBjg8Q0QIiBTYCNCAAIAAoAhAiBkEBajYCECAFIAZBAnRqIAJBB3QgCqdBD3RBgID+/wdqckECcjYCACAAIAQgACgCCCgCCBCsAQwECyADQRM6ACggAyAIOQMgAkAgCCADQRhqQQAQ9QMNACAAIAIgACADQSBqIANBIGoQugEQuwEMBAsgAykDGCEKIANBEzoAECADRAAAAAAAAPA/QUwQ0wQiCSAIIAmiIAigIApQGzkDCCAAIAIgACADQQhqIANBIGoQugEQuwEMAwsgACACIAEpAwgQuQEMAgsgACgCACgCNCABKAIIQQJ0aiIAIAAoAgBB/4B+cSACQQd0QYD/AXFyNgIADAELIAEoAggiBSACRg0AIAAoAgAhBCAEIAAoAggoAjQgBCgCNCAAKAIQIARBFGpBBEH/////A0GODxDRAiIGNgI0IAAgACgCECIHQQFqNgIQIAYgB0ECdGogBUEQdCACQQd0cjYCACAAIAQgACgCCCgCCBCsAQsgAUEINgIAIAEgAjYCCAsgA0EwaiQAC2EBAX8gACABEL4BAkACQCABKAIAQQhHDQAgAUEIaiECIAEoAhAgASgCFEYNASACKAIAIAAQ5gJIDQAgACABIAEoAggQwAEgAigCAA8LIAAgARC/ASABQQhqIQILIAIoAgALYQACQAJAIAEoAgBBCkcNACABKAIQIAEoAhRGDQELIAAgARC+AQJAIAEoAgBBCEcNACABKAIQIAEoAhRGDQEgASgCCCAAEOYCSA0AIAAgASABKAIIEMABDwsgACABEL8BCwteAQJ/IAEoAhQhAiABKAIQIQMgACABEL4BAkAgAyACRg0AAkAgASgCAEEIRw0AIAEoAhAgASgCFEYNASABKAIIIAAQ5gJIDQAgACABIAEoAggQwAEPCyAAIAEQvwELC/kGAQZ/AkACQAJAAkACQAJAAkACQCABKAIAQXdqDgcAAQcFAgMEBwsCQCACKAIAQQhHDQAgAigCCCEDIAAQ5gIgA0oNACAAIAAtADRBf2o6ADQLIAAgAiABLQAIEMABDwsgACACEL4BAkACQCACKAIAQQhHDQAgAkEIaiEEIAIoAhAgAigCFEYNASAEKAIAIAAQ5gJIDQAgACACIAIoAggQwAEMAQsgACACEL8BIAJBCGohBAsgACgCACEDIAQoAgAhBCABKAIIIQEgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBjg8Q0QIiBTYCNCAAIAAoAhAiBkEBajYCECAFIAZBAnRqIARBB3QgAUEQdHJBCnI2AgAMBAsgAS0ACiEEIAEvAQghASAAIAIQxgEhBSAAKAIAIQMgAigCCCEGIAMgACgCCCgCNCADKAI0IAAoAhAgA0EUakEEQf////8DQY4PENECIgc2AjQgACAAKAIQIghBAWo2AhAgByAIQQJ0aiAGQRh0IARBB3QgAUEQdHIgBUEPdHJyQQ9yNgIADAMLIAEtAAohBCABLwEIIQEgACACEMYBIQUgACgCACEDIAIoAgghBiADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GODxDRAiIHNgI0IAAgACgCECIIQQFqNgIQIAcgCEECdGogBkEYdCAEQQd0IAFBEHRyIAVBD3RyckERcjYCAAwCCyABLQAKIQQgAS8BCCEBIAAgAhDGASEFIAAoAgAhAyACKAIIIQYgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBjg8Q0QIiBzYCNCAAIAAoAhAiCEEBajYCECAHIAhBAnRqIAZBGHQgBEEHdCABQRB0ciAFQQ90cnJBEnI2AgAMAQsgAS0ACiEEIAEvAQghASAAIAIQxgEhBSAAKAIAIQMgAigCCCEGIAMgACgCCCgCNCADKAI0IAAoAhAgA0EUakEEQf////8DQY4PENECIgc2AjQgACAAKAIQIghBAWo2AhAgByAIQQJ0aiAGQRh0IARBB3QgAUEQdHIgBUEPdHJyQRByNgIACyAAIAMgACgCCCgCCBCsAQsCQCACKAIAQQhHDQAgAigCCCECIAAQ5gIgAkoNACAAIAAtADRBf2o6ADQLC2IBAX9BASECAkAgACABEM8BDQAgACABEL4BAkAgASgCAEEIRw0AQQAhAiABKAIQIAEoAhRGDQEgASgCCCAAEOYCSA0AIAAgASABKAIIEMABQQAPCyAAIAEQvwFBACECCyACC4QDAQZ/IAAgARC+AQJAAkAgASgCAEEIRw0AIAEoAhAgASgCFEYNASABKAIIIAAQ5gJIDQAgACABIAEoAggQwAEMAQsgACABEL8BCyABKAIIIQMCQCABKAIAQQhHDQAgABDmAiADSg0AIAAgAC0ANEF/ajoANAsgAC0ANCEEIAFBCDYCACABIAQ2AggCQAJAIAAtADQiBUECaiIEIAAoAgAiBi0ACE0NACAFQf0BTw0BIAYgBDoACAsgACAEOgA0IAEoAgghBCAAIAIQxgEhBSAAKAIAIQEgAigCCCEGIAEgACgCCCgCNCABKAI0IAAoAhAgAUEUakEEQf////8DQY4PENECIgc2AjQgACAAKAIQIghBAWo2AhAgByAIQQJ0aiADQRB0IARBB3RyIAVBD3RyIAZBGHRyQRRyNgIAIAAgASAAKAIIKAIIEKwBAkAgAigCAEEIRw0AIAIoAgghASAAEOYCIAFKDQAgACAALQA0QX9qOgA0Cw8LIAAoAghBzgwQqgIAC+ACAQZ/IAAgARC+AUF/IQICQAJAAkAgASgCAEF+ag4PAgECAgICAQEBAQEBAQEAAQsgACgCACgCNCABKAIIIgNBAnRqIQQCQAJAIANBAUgNAEGA2AQgBEF8aiIDKAIAQf8AcWotAABBEHENAQsgBCEDCyADIAMoAgBBgIACczYCACABKAIIIQIMAQsgACABQQAQyQEhAgsCQCACQX9GDQACQAJAIAEoAhQiA0F/Rg0AIAAoAgAoAjQhBQNAQX8gAyIEIAUgBEECdGoiBigCACIHQQd2QYGAgHhqIgNqQQFqIANBf0YbIgNBf0cNAAsgAiAEQX9zaiIDQf///wdqQYCAgBBPDQEgBiADQQd0IAdB/wBxckGA////B2o2AgAMAgsgASACNgIUDAELIAAoAghBir0BEKoCAAsgASgCECEEIAAgACgCECIDNgIUIAAgBCADQf8BIAMQswEgAUF/NgIQC9kFAQZ/AkACQAJAIAEoAgBBEUcNAAJAIAAoAgAiAygCNCIEIAEoAghBAnRqKAIAIgVB/wBxIgZBM0cNAAJAAkAgAygCQCAAKAIQQX9qIgdqLAAAIghBgH9GDQAgACAAKAIYIAhrNgIYIAAgAC0ANUF/ajoANQwBCyAAQYEBOgA1IAAgACgCJEF/ajYCJAsgACAHNgIQIAMgACgCCCgCNCAEIAcgA0EUakEEQf////8DQY4PENECIgc2AjQgACAAKAIQIgRBAWo2AhAgByAEQQJ0akHCAEHCgAIgAhsgBUEJdkGA/wFxcjYCACAAIAMgACgCCCgCCBCsASAAKAIAIQcgByAAKAIIKAI0IAcoAjQgACgCECAHQRRqQQRB/////wNBjg8Q0QIiAzYCNCAAIAAoAhAiBEEBajYCECADIARBAnRqQbj+//8HNgIAIAAgByAAKAIIKAIIEKwBIAAoAhBBf2ohBwsgBkEzRg0BCwJAIAEoAgBBCEYNACAALQA0IgNBAWohBwJAIAMgACgCACIGLQAISQ0AIANB/gFPDQMgBiAHOgAICyAAIAc6ADQgACABIAdB/wFxQX9qEMEBCwJAIAEoAgBBCEcNACABKAIIIQcgABDmAiAHSg0AIAAgAC0ANEF/ajoANAsgACgCACEHIAEoAgghASAHIAAoAggoAjQgBygCNCAAKAIQIAdBFGpBBEH/////A0GODxDRAiIDNgI0IAAgACgCECIGQQFqNgIQIAMgBkECdGogAkEPdCABQRB0ckHD/wFyNgIAIAAgByAAKAIIKAIIEKwBIAAoAgAhASABIAAoAggoAjQgASgCNCAAKAIQIAFBFGpBBEH/////A0GODxDRAiIHNgI0IAAgACgCECICQQFqNgIQIAcgAkECdGpBuP7//wc2AgAgACABIAAoAggoAggQrAEgACgCEEF/aiEHCyAHDwsgACgCCEHODBCqAgALkQIBBn8gACABEL4BQX8hAgJAAkACQCABKAIAQX9qDhACAQIBAQEBAQEBAQEBAQEAAQsgASgCCCECDAELIAAgAUEBEMkBIQILAkAgAkF/Rg0AAkACQCABKAIQIgNBf0YNACAAKAIAKAI0IQQDQEF/IAMiBSAEIAVBAnRqIgYoAgAiB0EHdkGBgIB4aiIDakEBaiADQX9GGyIDQX9HDQALIAIgBUF/c2oiA0H///8HakGAgIAQTw0BIAYgA0EHdCAHQf8AcXJBgP///wdqNgIADAILIAEgAjYCEAwBCyAAKAIIQYq9ARCqAgALIAEoAhQhBSAAIAAoAhAiAzYCFCAAIAUgA0H/ASADELMBIAFBfzYCFAukBAEDfyMAQRBrIgMkAAJAIAIoAgBBB0cNACADIAIoAggiBDYCACADIAQtAARBwAByOgAIIAAgAyADELoBIQQgAkEENgIAIAIgBDYCCAsCQCABKAIAQQpHDQACQCACKAIAQQRHDQAgAigCECACKAIURw0AIAIoAggiBEH/AUoNACAAKAIAKAIwIARBBHRqLQAIQcQARg0BCyAAIAEQvgECQCABKAIAQQhHDQAgASgCECABKAIURg0BIAEoAgggABDmAkgNACAAIAEgASgCCBDAAQwBCyAAIAEQvwELAkACQAJAAkACQCABKAIAQXdqDgIBAAILIAEgASgCCDoACiABIAIoAgg7AQhBDSECDAMLIAEtAAghBAwBCyABKAIIIQQLIAEgBDoACgJAAkACQCACKAIAIgRBfGoOAwACAQILAkAgAigCECACKAIURw0AIAIoAggiBUH/AUoNACAAKAIAKAIwIAVBBHRqLQAIQcQARw0AIAEgAigCCDsBCEEPIQIMAwsgBEEGRw0BCyACKAIQIAIoAhRHDQAgAikDCEL/AVYNACABIAIpAwg9AQhBDiECDAELIAAgAhC+AQJAAkAgAigCAEEIRw0AIAJBCGohBCACKAIQIAIoAhRGDQEgBCgCACAAEOYCSA0AIAAgAiACKAIIEMABDAELIAAgAhC/ASACQQhqIQQLIAEgBCgCADsBCEEMIQILIAEgAjYCACADQRBqJAALgwkBBH8gACACEL4BAkACQAJAAkACQCABDgQAAAIBAwsgACABQQxqIAJB+M8EEM0BDQILIAAgAhC+AQJAAkAgAigCAEEIRw0AIAIoAhAgAigCFEYNASACKAIIIAAQ5gJIDQAgACACIAIoAggQwAEMAQsgACACEL8BCyABQTFqIQQgAigCCCEFAkAgAigCAEEIRw0AIAIoAgghASAAEOYCIAFKDQAgACAALQA0QX9qOgA0CyAAKAIAIQEgASAAKAIIKAI0IAEoAjQgACgCECABQRRqQQRB/////wNBjg8Q0QIiBjYCNCAAIAAoAhAiB0EBajYCECAGIAdBAnRqIAVBEHQgBHI2AgAgACABIAAoAggoAggQrAEgACgCECEBIAJBETYCACACIAFBf2o2AggCQCAAKAIQIAAoAgAiASgCQGpBf2osAAAiBEGAf0YNACAAIAAoAhggBGs2AhggACAALQA1QX9qOgA1IAAgASADEKwBDwsgAEGBAToANSAAIAAoAiRBf2o2AiQgACABIAMQrAEPCwJAAkACQAJAAkACQCACKAIAQX9qDhEAAQABAQEBBAUFBQUFBQUCAwULIAJBAjYCAAwECyACQQM2AgAMAwsgACgCACgCNCACKAIIIgFBAnRqIQMCQAJAIAFBAUgNAEGA2AQgA0F8aiIBKAIAQf8AcWotAABBEHENAQsgAyEBCyABIAEoAgBBgIACczYCAAwCCyAALQA0IgNBAWohAQJAIAMgACgCACIELQAISQ0AIANB/gFPDQQgBCABOgAICyAAIAE6ADQgACACIAFB/wFxQX9qEMEBCwJAIAIoAgBBCEcNACACKAIIIQEgABDmAiABSg0AIAAgAC0ANEF/ajoANAsgACgCACEBIAIoAgghAyABIAAoAggoAjQgASgCNCAAKAIQIAFBFGpBBEH/////A0GODxDRAiIENgI0IAAgACgCECIFQQFqNgIQIAQgBUECdGogA0EQdEEzcjYCACAAIAEgACgCCCgCCBCsASAAKAIQIQEgAkERNgIAIAIgAUF/ajYCCAsgAigCFCEDIAIgAigCECIBNgIUIAIgAzYCEAJAIAFBf0YNACAAKAIAKAI0IQYDQCAGIAFBAnRqIQMCQAJAIAFBAUgNAEGA2AQgA0F8aiIEKAIAQf8AcWotAABBEHENAQsgAyEECwJAIAQoAgAiBUH/AHFBwwBHDQAgBCAFQYCAAnEgBUEJdkGA/wFxckHCAHI2AgALQX8gASADKAIAQQd2QYGAgHhqIgNqQQFqIANBf0YbIgFBf0cNAAsLIAIoAhAiAUF/Rg0AIAAoAgAoAjQhBQNAIAUgAUECdGohAwJAAkAgAUEBSA0AQYDYBCADQXxqIgQoAgBB/wBxai0AAEEQcQ0BCyADIQQLAkAgBCgCACIAQf8AcUHDAEcNACAEIABBgIACcSAAQQl2QYD/AXFyQcIAcjYCAAtBfyABIAMoAgBBB3ZBgYCAeGoiA2pBAWogA0F/RhsiAUF/Rw0ACwsPCyAAKAIIQc4MEKoCAAuVAwMDfwF+AXwjAEEwayIEJABBACEFAkAgAigCECACKAIURw0AAkACQAJAIAIoAgBBe2oOAgEAAwsgBCACKQMINwMgQQMhBgwBCyAEIAIrAwg5AyBBEyEGCyAEIAY6ACggAygCECADKAIURw0AAkACQAJAIAMoAgBBe2oOAgEAAwsgBCADKQMINwMQQQMhAwwBCyAEIAMrAwg5AxBBEyEDCyAEIAM6ABgCQCABQQ1LDQACQAJAQQEgAXQiA0GA3wBxDQAgA0HoAHFFDQIgBCkDECIHuSAHvyAELQAYQQNGG0QAAAAAAAAAAGIhAwwBC0EAIQMgBEEgaiAEQQAQ9gNFDQAgBEEQaiAEQQAQ9gNBAEchAwsgA0UNAQsgACgCCCgCNCABIARBIGogBEEQaiAEENoCGgJAAkAgBC0ACEEDRw0AIAJBBjYCACACIAQpAwA3AwgMAQsgBCsDACIIRAAAAAAAAAAAZCAIRAAAAAAAAAAAY3JBAUcNASACIAg5AwggAkEFNgIAC0EBIQULIARBMGokACAFC+wCAQF/IwBBEGsiAyQAIAAgAhC+AQJAAkACQAJAAkACQAJAIAEOFQICAgICAgICAgICAgUDBAQDBAQAAQYLIAAgAhDIAQwFCyAAIAIQygEMBAsCQCACKAIQIAIoAhRHDQAgAigCAEF5akF9Sw0ECyAAIAIQvgEgAigCAEEIRw0CIAIoAhAgAigCFEYNAyACKAIIIAAQ5gJIDQIgACACIAIoAggQwAEMAwsCQCACKAIQIAIoAhRHDQAgAigCAEF5akF9Sw0DCyAAIAIQxgEaDAILAkACQAJAAkAgAigCAEF7ag4CAQADCyADIAIpAwg3AwgMAQsgAisDCCADQQhqQQAQ9QNFDQELIAIoAhAgAigCFEcNACADKQMIQv9+fEKAfloNAgsgACACEL4BIAIoAgBBCEcNACACKAIQIAIoAhRGDQEgAigCCCAAEOYCSA0AIAAgAiACKAIIEMABDAELIAAgAhC/AQsgA0EQaiQAC8wDAwN/AX4CfCMAQTBrIgIkAAJAAkAgASgCECABKAIURw0AQQAhA0EAIQQCQAJAAkACQAJAAkACQAJAAkAgASgCAEF/ag4HAgABBgQDBQgLIAJBEToAKCAAIAJBIGogAkEgahC6ASEEDAYLIAJBAToAKCAAIAJBIGogAkEgahC6ASEEDAULIAJBADoAECAAKAIIKAJAIQQgAkHFADoAKCACIAQ2AiAgACACQSBqIAJBCGoQugEhBAwECyABKQMIIQUgAkEDOgAoIAIgBTcDICAAIAJBIGogAkEgahC6ASEEDAMLIAErAwghBiACQRM6ACggAiAGOQMgAkAgBiACQRhqQQAQ9QMNACAAIAJBIGogAkEgahC6ASEEDAMLIAIpAxghBSACQRM6ABAgAkQAAAAAAADwP0FMENMEIgcgBiAHoiAGoCAFUBs5AwggACACQQhqIAJBIGoQugEhBAwCCyACIAEoAggiBDYCICACIAQtAARBwAByOgAoIAAgAkEgaiACQSBqELoBIQQMAQsgASgCCCEECwJAIARB/wFMDQBBASEDDAELIAEgBDYCCCABQQQ2AgBBASEECyADRQ0BC0EAIQQLIAJBMGokACAEC/AfAgd/AX4jAEEgayIFJAAgACADEL4BAkACQCABQQtKDQAgACABIAIgAxDNAQ0BCwJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCABDhUDBAMFBQUFBgYGBwgCCQsLCQoKAAESCyACKAIUIgZBf0YNECADKAIUIgFBf0YNCyAAKAIAKAI0IQcDQEF/IAEiBCAHIARBAnRqIggoAgAiCUEHdkGBgIB4aiIBakEBaiABQX9GGyIBQX9HDQALIAYgBEF/c2oiAUH///8HakGAgIAQTw0MIAggAUEHdCAJQf8AcXJBgP///wdqNgIADBALIAIoAhAiBkF/Rg0OIAMoAhAiAUF/Rg0MIAAoAgAoAjQhBwNAQX8gASIEIAcgBEECdGoiCCgCACIJQQd2QYGAgHhqIgFqQQFqIAFBf0YbIgFBf0cNAAsgBiAEQX9zaiIBQf///wdqQYCAgBBPDQ0gCCABQQd0IAlB/wBxckGA////B2o2AgAMDgsgACADEL8BQZDQBCEBAkAgACgCECIHIAAoAhRMDQAgB0ECdCAAKAIAKAI0akF8aiEBCwJAIAEoAgAiCEH/AHFBNUcNACAIQYCA/AdxIQQCQCADKAIAQQhHDQAgAygCCCEDIAAQ5gIgA0oNACAAIAAtADRBf2o6ADQLIAEgASgCAEH/gIJ4cSAEQYCABGpBgID8B3FyIAIoAghBB3RBgP8BcXI2AgAMEAsgACgCACEBIAIoAgghAiABIAAoAggoAjQgASgCNCAHIAFBFGpBBEH/////A0GODxDRAiIHNgI0IAAgACgCECIIQQFqNgIQIAcgCEECdGogAkEHdEG1gAhyNgIAIAAgASAAKAIIKAIIEKwBAkAgAygCAEEIRw0AIAMoAgghAyAAEOYCIANKDQAgACAALQA0QX9qOgA0CwJAIAAoAhAgACgCACIDKAJAakF/aiwAACICQYB/Rg0AIAAgACgCGCACazYCGCAAIAAtADVBf2o6ADUgACADIAQQrAEMEAsgAEGBAToANSAAIAAoAiRBf2o2AiQgACADIAQQrAEMDwtBASEHAkAgAigCECACKAIURw0AIAIoAgBBeWpBfkkhBwtBACEIAkAgBw0AIAVBCGpBEGoiCCACQRBqIgkpAwA3AwAgBUEIakEIaiIGIAJBCGoiCikDADcDACAFIAIpAwA3AwggCSADQRBqIgspAwA3AwAgCiADQQhqIgkpAwA3AwAgAiADKQMANwMAIAsgCCkDADcDACAJIAYpAwA3AwAgAyAFKQMINwMAQQEhCAsCQCABDQAgAygCAEEGRw0AIAMoAhAgAygCFEcNACADKQMIIgxC/358QoB+VA0AIAAgAiADQRUgDKdB/wBqIAggBEEvQQYQ0QEMDwsCQCADKAIQIAMoAhRHDQAgAygCAEF5akF+SQ0AIAAgAxDPAUUNACAAIAIgAyABQRZqIAMoAgggCCAEQTAgAUEGahDRAQwPCwJAIAcNACAFQQhqQRBqIgcgAkEQaiIIKQMANwMAIAVBCGpBCGoiCSACQQhqIgYpAwA3AwAgBSACKQMANwMIIAggA0EQaiIKKQMANwMAIAYgA0EIaiIIKQMANwMAIAIgAykDADcDACAKIAcpAwA3AwAgCCAJKQMANwMAIAMgBSkDCDcDAAsgACABIAIgAyAEENIBDA4LIAMoAgBBBkcNACADKAIQIAMoAhRHDQAgAykDCCIMQoB/fEKBflQNACAAIAIgA0EVQf8AIAynIgFrQQAgBEEvQQcQ0QEgACgCEEECdCAAKAIAKAI0akF+aiABQRB0QYCA/ANqQRB2OgAADA0LAkAgAygCECADKAIURw0AIAMoAgBBeWpBfkkNACAAIAMQzwFFDQAgACACIAMgAUEWaiADKAIIQQAgBEEwIAFBBmoQ0QEMDQsgACABIAIgAyAEENIBDAwLQQAhBwJAIAIoAgAiCEEGRw0AIAVBCGpBEGoiByACQRBqIgkpAwA3AwAgBUEIakEIaiIGIAJBCGoiCikDADcDACAFIAIpAwA3AwggCSADQRBqIgspAwA3AwAgCiADQQhqIgkpAwA3AwAgAiADKQMANwMAIAsgBykDADcDACAJIAYpAwA3AwAgAyAFKQMINwMAQQEhBwsCQCADKAIAQQZHDQAgACADEM8BRQ0AIAAgAiADIAFBFmogAygCCCAHIARBMCABQQZqENEBDAwLAkAgCEEGRw0AIAVBCGpBEGoiByACQRBqIggpAwA3AwAgBUEIakEIaiIJIAJBCGoiBikDADcDACAFIAIpAwA3AwggCCADQRBqIgopAwA3AwAgBiADQQhqIggpAwA3AwAgAiADKQMANwMAIAogBykDADcDACAIIAkpAwA3AwAgAyAFKQMINwMACyAAIAEgAiADIAQQ0gEMCwsCQCACKAIAQQZHDQAgAigCECACKAIURw0AIAIpAwhC/358QoB+VA0AIAVBCGpBEGoiByACQRBqIgEpAwA3AwAgBUEIakEIaiIIIAJBCGoiCSkDADcDACAFIAIpAwA3AwggASADQRBqIgYpAwA3AwAgCSADQQhqIgEpAwA3AwAgAiADKQMANwMAIAYgBykDADcDACABIAgpAwA3AwAgAyAFKQMINwMAIAAgAiADQSEgASgCAEH/AGpBASAEQS9BEBDRAQwLCyAAIAIgA0EgIARBEBDTAQ0KIABBCiACIAMgBBDSAQwKCwJAIAMoAgBBBkcNACADKAIQIAMoAhRHDQAgAykDCEL/fnxCgH5UDQAgACACIANBICADKAIIQf8AakEAIARBL0ERENEBDAoLIABBCyACIAMgBBDSAQwJCwJAIAIoAgBBCEYNACAFQQhqQRBqIgQgAkEQaiIHKQMANwMAIAVBCGpBCGoiCCACQQhqIgkpAwA3AwAgBSACKQMANwMIIAcgA0EQaiIGKQMANwMAIAkgA0EIaiIHKQMANwMAIAIgAykDADcDACAGIAQpAwA3AwAgByAIKQMANwMAIAMgBSkDCDcDAAsgACACEL4BAkACQCACKAIAQQhHDQAgAkEIaiEEIAIoAhAgAigCFEYNASAEKAIAIAAQ5gJIDQAgACACIAIoAggQwAEMAQsgACACEL8BIAJBCGohBAsgBCgCACEGQQEhCUEAIQcCQAJAAkACQCADKAIAQXtqDgIAAQMLQQAhBwJAIAMrAwggBUEIakEAEPUDRQ0AQQEhBwwCC0EBIQkMAgsgBSADKQMINwMIQQAhBwsCQCADKAIQIAMoAhRGDQAMAQsCQCAFKQMIIgxC/358QoB+Wg0ADAELIAynQf8AaiEEQQAhCQtBPSEIAkAgCUUNAAJAAkAgACADEMYBRQ0AIANBCGohBEE8IQgMAQsgACADEL4BAkAgAygCAEEIRw0AIANBCGohBEE5IQggAygCECADKAIURg0BIAQoAgAgABDmAkgNACAAIAMgAygCCBDAAQwBCyAAIAMQvwEgA0EIaiEEQTkhCAsgBCgCACEECyAAIAIgAxDUASAAKAIAIQMgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBjg8Q0QIiCTYCNCAAIAAoAhAiCkEBajYCECAJIApBAnRqIAdBGHQgAUENRkEPdHIgBEEQdHIgCCAGQQd0cnI2AgAgACADIAAoAggoAggQrAEgACgCACEDIAMgACgCCCgCNCADKAI0IAAoAhAgA0EUakEEQf////8DQY4PENECIgE2AjQgACAAKAIQIgRBAWo2AhAgASAEQQJ0akG4/v//BzYCACAAIAMgACgCCCgCCBCsASAAKAIQIQAgAkEQNgIAIAIgAEF/ajYCCAwICyAFQQhqQRBqIgQgAkEQaiIHKQMANwMAIAVBCGpBCGoiCCACQQhqIgkpAwA3AwAgBSACKQMANwMIIAcgA0EQaiIGKQMANwMAIAkgA0EIaiIHKQMANwMAIAIgAykDADcDACAGIAQpAwA3AwAgByAIKQMANwMAIAMgBSkDCDcDACABQX1qIQELQQEhCEEAIQQCQAJAAkACQCADKAIAQXtqDgIAAQMLQQAhBAJAIAMrAwggBUEIakEAEPUDRQ0AQQEhBAwCC0EBIQgMAgsgBSADKQMINwMIQQAhBAsCQCADKAIQIAMoAhRGDQAMAQsCQCAFKQMIIgxC/358QoB+Wg0ADAELIAynQf8AaiEHQQAhCAsCQAJAIAgNACAAIAIQvgECQAJAIAIoAgBBCEcNACACQQhqIQggAigCECACKAIURg0BIAgoAgAgABDmAkgNACAAIAIgAigCCBDAAQwBCyAAIAIQvwEgAkEIaiEICyAIKAIAIQhBMCEJDAELQQEhCAJAAkACQAJAIAIoAgBBe2oOAgABAwsCQCACKwMIIAVBCGpBABD1A0UNAEEBIQQMAgtBASEIDAILIAUgAikDCDcDCAsgAigCECACKAIURw0AIAUpAwgiDEL/fnxCgH5UDQAgDKdB/wBqIQdBACEICwJAIAgNACAAIAMQvgECQAJAIAMoAgBBCEcNACADQQhqIQggAygCECADKAIURg0BIAgoAgAgABDmAkgNACAAIAMgAygCCBDAAQwBCyAAIAMQvwEgA0EIaiEICyAIKAIAIQhBMiEJDAELIAAgAhC+AQJAAkAgAigCAEEIRw0AIAJBCGohByACKAIQIAIoAhRGDQEgBygCACAAEOYCSA0AIAAgAiACKAIIEMABDAELIAAgAhC/ASACQQhqIQcLIAcoAgAhCCAAIAMQvgECQAJAIAMoAgBBCEcNACADQQhqIQcgAygCECADKAIURg0BIAcoAgAgABDmAkgNACAAIAMgAygCCBDAAQwBCyAAIAMQvwEgA0EIaiEHCyAHKAIAIQdBLCEJCyAAIAIgAxDUASAAKAIAIQMgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBjg8Q0QIiBjYCNCAAIAAoAhAiCkEBajYCECAGIApBAnRqIARBGHQgCEEHdHIgASAJanIgB0EQdHJBgIACcjYCACAAIAMgACgCCCgCCBCsASAAKAIAIQMgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBjg8Q0QIiATYCNCAAIAAoAhAiBEEBajYCECABIARBAnRqQbj+//8HNgIAIAAgAyAAKAIIKAIIEKwBIAAoAhAhACACQRA2AgAgAiAAQX9qNgIIDAYLIAMgBjYCFAwECyAAKAIIQYq9ARCqAgALIAMgBjYCEAwBCyAAKAIIQYq9ARCqAgALIAIgAykDADcDACACQRBqIANBEGopAwA3AwAgAkEIaiADQQhqKQMANwMADAELIAIgAykDADcDACACQRBqIANBEGopAwA3AwAgAkEIaiADQQhqKQMANwMACyAFQSBqJAALkwQBBH8gACAB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AC8BYCIBQcgBRg0AIAFB3AFPDQEPCyAAQagJQQAQ4AEACyAAQQUQ7gEACygBAX8gACAAKAJgQQFqIgE2AmACQCABQfj/A3FByAFJDQAgABCCAwsLjAEBAn8gASABKAIcEIsCAkAgASgCHEUNACABIAFBNGo2AhQgAUHAAGoiAigCACEDIAJBADYCAAJAIANFDQADQCADKAIMIQIgASADQSQQ1gIgASABLwEIQX9qOwEIIAIhAyACDQALCyABIAEoAhwiAyABKAIYIANrQdAAahDWAgsgACABQXxqQfgAENYCC5YBAQF/IAAgAEE0ajYCFCAAKAIcQQA6AAggAEHWAGpBAjsBACAAQQA6AAYgACAAKAIcNgI0IABBAUEAIAEgAUEBRhsQ/wEhASAAKAIcQRBqIQICQAJAIAFFDQAgACABIAIQ7QEMAQsgACACNgIMCyAAQThqIAAoAgxBwAJqIgI2AgAgACACIAAoAhxrQQR1QQAQ8AEaIAELwwQBA38jAEEQayICJABBACEDAkAgAUEAQQhB4AYgABEEACIERQ0AQQAhAyAEQdwAakEANgIAIARB4ABqQgA3AgAgBEEANgIEIAQgADYCeCAEQcQBakEIOgAAIARBCGpBiBA7AQAgBEEUaiAEQfgAajYCACAEQRhqQQA2AgAgBEEwaiAEQQRqIgA2AgAgBEEKakGAAjYBACAEQTRqQQA2AgAgBEHwAGpBADYCACAEQSBqQgA3AgAgBEHQAWogADYCACAEQegAakIANwIAIARB1AZqQgA3AgAgBEH8AGogATYCACAEQfQAakEANgIAIARB5ABqQYCABDYCACAEQZwCaiAANgIAQQAQBSEBIAJBxQA2AgwgAiAANgIEIAIgATYCACACIAI2AgggBEHAAWogAkEEakEMIAEQjAM2AgAgBEGYAWpBADYCACAEQZgCakEANgIAIARBqAFqQQA6AAAgBEGQAWpCADcDACAEQcoBakECOwEAIARBxwFqQQA6AAAgBEHFAWpBCDsAACAEQdQBakEAQcQAEJoEGiAEQc4BakENOgAAIARBzAFqQbIyOwEAIARBuAFqQQM6AAAgBEGwAWpCADcDACAEQYwBakEANgIAIARBgAFqQuAGNwMAIARBiANqQgA3AgAgBEHIAWpBlDI7AQAgBEGQA2pCADcCACAEQZgDakIANwIA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AkACQAJAA0AgByIIQv//////////P1YNAQJAAkACQCAIQgGGIgdCf3wiCSAANQIIIgpUDQAgAw0BIAlCACAKfYMgCloNASAAIAc+AggLIAAoAgwgCadBBHRqIQEMAQsgACgCECEBAkACQCAHQv////8HVg0AIAenQX8gAC0AB3RBf3NBAXJvIQQMAQsgB0F/IAAtAAd0QX9zQQFyrIKnIQQLIAEgBEEYbGohAQNAAkAgAS0ACUEDRw0AIAEpAxAgB1ENAgsgASABKAIMIgRBGGxqIQEgBA0AC0GY2wQhAQsgAS0ACEEPcQ0ADAILAAsCQAJAIAVBf0oNAEIAIAA1AggiB31C/v//////////AIMgB1oNACAAQX82AgggACgCDEFgaiEBDAELIAAoAhBC////////////AEF/IAAtAAd0QX9zQQFyrIKnQRhsaiEBA0ACQCABLQAJQQNHDQAgASkDEEL///////////8AUQ0CCyABIAEoAgwiBEEYbGohASAEDQALQZjbBCEBC0L///////////8AIQcgAS0ACEEPcQ0BCwJAIAciCSAIfUICWg0AIAgPCyAFQX9KIQMgCCEHA0ACQAJAAkAgCSAHfCILQgGIIghCf3wiCiAANQIIIgxUDQAgAw0BIApCACAMfYMgDFoNASAAIAg+AggLIAAoAgwgCqdBBHRqIQEMAQsgACgCECEBAkACQCALQv////8PVg0AIAinQX8gAC0AB3RBf3NBAXJvIQQMAQsgCEF/IAAtAAd0QX9zQQFyrIKnIQQLIAEgBEEYbGohAQNAAkAgAS0ACUEDRw0AIAEpAxAgCFENAgsgASABKAIMIgRBGGxqIQEgBA0AC0GY2wQhAQsgCSAIIAEtAAhBD3EiARsiCSAIIAcgARsiB31CAVYNAAsLIAcLJwAgAEQAAAAAAIB/QEGIARCJASAAQQBBBxBDIABBsNsEQQAQdUEBC5kCAgN/An4jAEHABGsiASQAIABBAUEFEM8DIABBARCBASEEIABBAkHAzAQgAUEsahBrIQIgAEEDQgEQdCEFIABBBCAEEHQhBCAAIAFBMGoQXgJAIAUgBFkNAANAIABBASAFEEAaAkAgAEF/ECcNACAAIABBfxAjECQhAyABIAU3AxggASADNgIQIABB05oCIAFBEGoQZBoLIAFBMGoQYSABQTBqIAIg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QGoiBUsNAANAIAIgASgCADYCACACIAEoAgQ2AgQgAiABKAIINgIIIAIgASgCDDYCDCACIAEoAhA2AhAgAiABKAIUNgIUIAIgASgCGDYCGCACIAEoAhw2AhwgAiABKAIgNgIgIAIgASgCJDYCJCACIAEoAig2AiggAiABKAIsNgIsIAIgASgCMDYCMCACIAEoAjQ2AjQgAiABKAI4NgI4IAIgASgCPDYCPCABQcAAaiEBIAJBwABqIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQAMAgsACwJAIANBBE8NACAAIQIMAQsCQCADQXxqIgQgAE8NACAAIQIMAQsgACECA0AgAiABLQAAOgAAIAIgAS0AAToAASACIAEtAAI6AAIgAiABLQADOgADIAFBBGohASACQQRqIgIgBE0NAAsLAkAgAiADTw0AA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA0cNAAsLIAAL8gICA38BfgJAIAJFDQAgACABOgAAIAIgAGoiA0F/aiABOgAAIAJBA0kNACAAIAE6AAIgACABOgABIANBfWogAToAACADQX5qIAE6AAAgAkEHSQ0AIAAgAToAAyADQXxqIAE6AAAgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIFayICQSBJDQAgAa1CgYCAgBB+IQYgAyAFaiEBA0AgASAGNwMYIAEgBjcDECABIAY3AwggASAGNwMAIAFBIGohASACQWBqIgJBH0sNAAsLIAALEAAgAZogASAAGxCcBCABogsVAQF/IwBBEGsiASAAOQMIIAErAwgLEAAgAEQAAAAAAAAAEBCbBAsQACAARAAAAAAAAABwEJsEC80CAwJ+An8CfAJAAkACQCAAvSIBQjSIp0H/D3EiA0G3eGpBP08NACADIQQMAQsCQCADQcgHSw0AIABEAAAAAAAA8D+gDwtB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AkACQCACQQRJDQAgASAAckEDcQ0BA0AgACgCACABKAIARw0CIAFBBGohASAAQQRqIQAgAkF8aiICQQNLDQALCyACRQ0BCwJAA0AgAC0AACIDIAEtAAAiBEcNASABQQFqIQEgAEEBaiEAIAJBf2oiAkUNAgwACwALIAMgBGsPC0EACw0AQbz+HRDVBEHA/h0LCQBBvP4dENYECzEBAn8gABDgBCIBKAIANgI4AkAgASgCACICRQ0AIAIgADYCNAsgASAANgIAEOEEIAALrwkDBn8Dfgl8IwBBEGsiAiQAIAG9IghCNIinIgNB/w9xIgRBwndqIQUCQAJAAkAgAL0iCUI0iKciBkGBcGpBgnBJDQBBACEHIAVB/35LDQELAkAgCEIBhiIKQn98Qv////////9vVA0ARAAAAAAAAPA/IQsgCUKAgICAgICA+D9RDQIgClANAgJAAkAgCUIBhiIJQoCAgICAgIBwVg0AIApCgYCAgICAgHBUDQELIAAgAaAhCwwDCyAJQoCAgICAgIDw/wBRDQJEAAAAAAAAAAAgASABoiAJQv/////////v/wBWIAhCf1VzGyELDAILAkAgCUIBhkJ/fEL/////////b1QNACAAIACiIQsCQCAJQn9VDQAgC5ogCyAIEOQEQQFGGyELCyAIQn9VDQIgAkQAAAAAAADwPyALozkDCCACKwMIIQsMAgtBACEHAkAgCUJ/VQ0AAkAgCBDkBCIHDQAgABDZBCELDAMLIAZB/w9xIQYgCUL///////////8AgyEJIAdBAUZBEnQhBwsCQCAFQf9+Sw0ARAAAAAAAAPA/IQsgCUKAgICAgICA+D9RDQICQCAEQb0HSw0AIAEgAZogCUKAgICAgICA+D9WG0QAAAAAAADwP6AhCwwDCwJAIANBgBBJIAlCgYCAgICAgPg/VEYNAEEAEJ4EIQsMAwtBABCdBCELDAILIAYNACAARAAAAAAAADBDor1C////////////AINCgICAgICAgOB8fCEJCwJAIAhCgICAQIO/IgwgCSAJQoCAgICw1dqMQHwiCEKAgICAgICAeIN9IglCgICAgAh8QoCAgIBwg78iCyAIQi2Ip0H/AHFBBXQiBUGQvAVqKwMAIg2iRAAAAAAAAPC/oCIAIABBACsD2LsFIg6iIg+iIhAgCEI0h6e3IhFBACsDyLsF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CCEDAkAgACkDcCIFQgBRDQAgBSAEfSIFIAMgAWusWQ0AIAEgBadqIQMLIAAgAzYCaCAAIAQgACgCLCIDIAFrrHw3A3gCQCABIANLDQAgAUF/aiACOgAACyACCzUAIAAgATcDACAAIARCMIinQYCAAnEgAkIwiKdB//8BcXKtQjCGIAJC////////P4OENwMIC+cCAQF/IwBB0ABrIgQkAAJAAkAgA0GAgAFIDQAgBEEgaiABIAJCAEKAgICAgICA//8AEL0FIARBIGpBCGopAwAhAiAEKQMgIQECQCADQf//AU8NACADQYGAf2ohAwwCCyAEQRBqIAEgAkIAQoCAgICAgID//wAQvQUgA0H9/wIgA0H9/wJIG0GCgH5qIQMgBEEQakEIaikDACECIAQpAxAhAQwBCyADQYGAf0oNACAEQcAAaiABIAJCAEKAgICAgICAORC9BSAEQcAAakEIaikDACECIAQpA0AhAQJAIANB9IB+TQ0AIANBjf8AaiEDDAELIARBMGogASACQgBCgICAgICAgDkQvQUgA0HogX0gA0HogX1KG0Ga/gFqIQMgBEEwakEIaikDACECIAQpAzAhAQsgBCABIAJCACADQf//AGqtQjCGEL0FIAAgBEEIaikDADcDCCAAIAQpAwA3AwAgBEHQAGokAAtLAgF+An8gAUL///////8/gyECAkACQCABQjCIp0H//wFxIgNB//8BRg0AQQQhBCADDQFBAkEDIAIgAIRQGw8LIAIgAIRQIQQLIAQL2wYCBH8DfiMAQYABayIFJAACQAJAAkAgAyAEQgBCABCzBUUNACADIAQQiAUhBiACQjCIpyIHQf//AXEiCEH//wFGDQAgBg0BCyAFQRBqIAEgAiADIAQQvQUgBSAFKQMQIgQgBUEQakEIaikDACIDIAQgAxC1BSAFQQhqKQMAIQIgBSkDACEEDAELAkAgASAIrUIwhiACQv///////z+DhCIJIAMgBEIwiKdB//8BcSIGrUIwhiAEQv///////z+DhCIKELMFQQBKDQACQCABIAkgAyAKELMFRQ0AIAEhBAwCCyAFQfAAaiABIAJCAEIAEL0FIAVB+ABqKQMAIQIgBSkDcCEEDAELAkACQCAIRQ0AIAEhBAwBCyAFQeAAaiABIAlCAEKAgICAgIDAu8AAEL0FIAVB6ABqKQMAIglCMIinQYh/aiEIIAUpA2AhBAsCQCAGDQAgBUHQAGogAyAKQgBCgICAgICAwLvAABC9BSAFQdgAaikDACIKQjCIp0GIf2ohBiAFKQNQIQMLIApC////////P4NCgICAgICAwACEIQsgCUL///////8/g0KAgICAgIDAAIQhCQJAIAggBkwNAANAAkACQCAJIAt9IAQgA1StfSIKQgBTDQACQCAKIAQgA30iBIRCAFINACAFQSBqIAEgAkIAQgAQvQUgBUEoaikDACECIAUpAyAhBAwFCyAKQgGGIARCP4iEIQkMAQsgCUIBhiAEQj+IhCEJCyAEQgGGIQQgCEF/aiIIIAZKDQALIAYhCAsCQAJAIAkgC30gBCADVK19IgpCAFkNACAJIQoMAQsgCiAEIAN9IgSEQgBSDQAgBUEwaiABIAJCAEIAEL0FIAVBOGopAwAhAiAFKQMwIQQMAQsCQCAKQv///////z9WDQADQCAEQj+IIQMgCEF/aiEIIARCAYYhBCADIApCAYaEIgpCgICAgICAwABUDQALCyAHQYCAAnEhBgJAIAhBAEoNACAFQcAAaiAEIApC////////P4MgCEH4AGogBnKtQjCGhEIAQoCAgICAgMDDPxC9BSAFQcgAaikDACECIAUpA0AhBAwBCyAKQv///////z+DIAggBnKtQjCGhCECCyAAIAQ3AwAgACACNwMIIAVBgAFqJAALHAAgACACQv///////////wCDNwMIIAAgATcDAAuOCQIGfwN+IwBBMGsiBCQAQgAhCgJAAkAgAkECSw0AIAFBBGohBSACQQJ0IgJBrO0FaigCACEGIAJBoO0FaigCACEHA0ACQAJAIAEoAgQiAiABKAJoRg0AIAUgAkEBajYCACACLQAAIQIMAQsgARCFBSECCyACENAEDQALQQEhCAJAAkAgAkFVag4DAAEAAQtBf0EBIAJBLUYbIQgCQCABKAIEIgIgASgCaEYNACAFIAJBAWo2AgAgAi0AACECDAELIAEQhQUhAgtBACEJAkACQAJAA0AgAkEgciAJQZIIaiwAAEcNAQJAIAlBBksNAAJAIAEoAgQiAiABKAJoRg0AIAUgAkEBajYCACACLQAAIQIMAQsgARCFBSECCyAJQQFqIglBCEcNAAwCCwALAkAgCUEDRg0AIAlBCEYNASADRQ0CIAlBBEkN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gMCAgH9UIApQGw0AIANCAFIgCUKAgICAgIDAgIB/fCILQoCAgICAgMCAgH9WIAtCgICAgICAwICAf1EbDQELAkAgBiAKQoCAgICAgMD//wBUIApCgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEEIAEhAwwCCwJAIANQIAlCgICAgICAwP//AFQgCUKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQQMAgsCQCABIApCgICAgICAwP//AIWEQgBSDQBCgICAgICA4P//ACACIAMgAYUgBCAChUKAgICAgICAgIB/hYRQIgYbIQRCACABIAYbIQMMAgsgAyAJQoCAgICAgMD//wCFhFANAQJAIAEgCoRCAFINACADIAmEQgBSDQIgAyABgyEDIAQgAoMhBAwCCyADIAmEUEUNACABIQMgAiEEDAELIAMgASADIAFWIAkgClYgCSAKURsiBxshCiAEIAIgBxsiCUL///////8/gyELIAIgBCAHGyIMQjCIp0H//wFxIQgCQCAJQjCIp0H//wFxIgYNACAFQeAAaiAKIAsgCiALIAtQIgYbeSAGQQZ0rXynIgZBcWoQsgVBECAGayEGIAVB6ABqKQMAIQsgBSkDYCEKCyABIAMgBxshAyAMQv///////z+DIQQCQCAIDQAgBUHQAGogAyAEIAMgBCAEUCIHG3kgB0EGdK18pyIHQXFqELIFQRAgB2shCCAFQdgAaikDACEEIAUpA1AhAwsgBEIDhiADQj2IhEKAgICAgICABIQhAiALQgOGIApCPYiEIQQgA0IDhiEBIAkgDIUhAwJAIAYgCEYNAAJAIAYgCGsiB0H/AE0NAEIAIQJCASEBDAELIAVBwABqIAEgAkGAASAHaxCyBSAFQTBqIAEgAiAHELwFIAUpAzAgBSkDQCAFQcAAakEIaikDAIRCAFKthCEBIAVBMGpBCGopAwAhAgsgBEKAgICAgICABIQhDCAKQgOGIQsCQAJAIANCf1UNAEIAIQNCACEEIAsgAYUgDCAChYRQDQIgCyABfSEKIAwgAn0gCyABVK19IgRC/////////wNWDQEgBUEgaiAKIAQgCiAEIARQIgcbeSAHQQZ0rXynQXRqIgcQsgUgBiAHayEGIAVBKGopAwAhBCAFKQMgIQoMAQsgAiAMfCABIAt8IgogAVStfCIEQoCAgICAgIAIg1ANACAKQgGIIARCP4aEIApCAYOEIQogBkEBaiEGIARCAYghBAsgCUKAgICAgICAgIB/gyEBAkAgBkH//wFIDQAgAUKAgICAgIDA//8AhCEEQgAhAwwBC0EAIQcCQAJAIAZBAEwNACAGIQcMAQsgBUEQaiAKIAQgBkH/AGoQsgUgBSAKIARBASAGaxC8BSAFKQMAIAUpAxAgBUEQakEIaikDAIRCAFKthCEKIAVBCGopAwAhBAsgCkIDiCAEQj2GhCEDIAetQjCGIARCA4hC////////P4OEIAGEIQQgCqdBB3EhBgJAAkACQAJAAkAQugUOAwABAgMLIAQgAyAGQQRLrXwiCiADVK18IQQCQCAGQQRGDQAgCiEDDAMLIAQgCkIBgyIBIAp8IgMgAVStfCEEDAMLIAQgAyABQgBSIAZBAEdxrXwiCiADVK18IQQgCiEDDAELIAQgAyABUCAGQQBHca18IgogA1StfCEEIAohAwsgBkUNAQsQuwUaCyAAIAM3AwAgACAENwMIIAVB8ABqJAALUwEBfgJAAkAgA0HAAHFFDQAgASADQUBqrYYhAkIAIQEMAQsgA0UNACABQcAAIANrrYggAiADrSIEhoQhAiABIASGIQELIAAgATcDACAAIAI3AwgL4AECAX8CfkEBIQQCQCAAQgBSIAFC////////////AIMiBUKAgICAgIDA//8AViAFQoCAgICAgMD//wBRGw0AIAJCAFIgA0L///////////8AgyIGQoCAgICAgMD//wBWIAZCgICAgICAwP//AFEbDQACQCACIACEIAYgBYSEUEUNAEEADwsCQCADIAGDQgBTDQBBfyEEIAAgAlQgASADUyABIANRGw0BIAAgAoUgASADhYRCAFIPC0F/IQQgACACViABIANVIAEgA1EbDQAgACAChSABIAOFhEIAUiEECyAEC9gBAgF/An5BfyEEAkAgAEIAUiABQv///////////wCDIgVCgICAgICAwP//AFYgBUKAgICAgIDA//8AURsNACACQgBSIANC////////////AIMiBkKAgICAgIDA//8AViAGQoCAgICAgMD//wBRGw0AAkAgAiAAhCAGIAWEhFBFDQBBAA8LAkAgAyABg0IAUw0AIAAgAlQgASADUyABIANRGw0BIAAgAoUgASADhYRCAFIPCyAAIAJWIAEgA1UgASADURsNACAAIAKFIAEgA4WEQgBSIQQLIAQL3xACBX8OfiMAQdACayIFJAAgBEL///////8/gyEKIAJC////////P4MhCyAEIAKFQoCAgICAgICAgH+DIQwgBEIwiKdB//8BcSEGAkACQAJAIAJCMIinQf//AXEiB0GBgH5qQYKAfkkNAEEAIQggBkGBgH5qQYGAfksNAQsCQCABUCACQv///////////wCDIg1CgICAgICAwP//AFQgDUKAgICAgIDA//8AURsNACACQoCAgICAgCCEIQwMAgsCQCADUCAEQv///////////wCDIgJCgICAgICAwP//AFQgAkKAgICAgIDA//8AURsNACAEQoCAgICAgCCEIQwgAyEBDAILAkAgASANQoCAgICAgMD//wCFhEIAUg0AAkAgAyACQoCAgICAgMD//wCFhFBFDQBCACEBQoCAgICAgOD//wAhDAwDCyAMQoCAgICAgMD//wCEIQxCACEBDAILAkAgAyACQoCAgICAgMD//wCFhEIAUg0AQgAhAQwCCwJAIAEgDYRCAFINAEKAgICAgIDg//8AIAwgAyAChFAbIQxCACEBDAILAkAgAyAChEIAUg0AIAxCgICAgICAwP//AIQhDEIAIQEMAgtBACEIAkAgDUL///////8/Vg0AIAVBwAJqIAEgCyABIAsgC1AiCBt5IAhBBnStfKciCEFxahCyBUEQIAhrIQggBUHIAmopAwAhCyAFKQPAAiEBCyACQv///////z9WDQAgBUGwAmogAyAKIAMgCiAKUCIJG3kgCUEGdK18pyIJQXFqELIFIAkgCGpBcGohCCAFQbgCaikDACEKIAUpA7ACIQMLIAVBoAJqIANCMYggCkKAgICAgIDAAIQiDkIPhoQiAkIAQoCAgICw5ryC9QAgAn0iBEIAEL4FIAVBkAJqQgAgBUGgAmpBCGopAwB9QgAgBEIAEL4FIAVBgAJqIAUpA5ACQj+IIAVBkAJqQQhqKQMAQgGGhCIEQgAgAkIAEL4FIAVB8AFqIARCAEIAIAVBgAJqQQhqKQMAfUIAEL4FIAVB4AFqIAUpA/ABQj+IIAVB8AFqQQhqKQMAQgGGhCIEQgAgAkIAEL4FIAVB0AFqIARCAEIAIAVB4AFqQQhqKQMAfUIAEL4FIAVBwAFqIAUpA9ABQj+IIAVB0AFqQQhqKQMAQgGGhCIEQgAgAkIAEL4FIAVBsAFqIARCAEIAIAVBwAFqQQhqKQMAfUIAEL4FIAVBoAFqIAJCACAFKQOwAUI/iCAFQbABakEIaikDAEIBhoRCf3wiBEIAEL4FIAVBkAFqIANCD4ZCACAEQgAQvgUgBUHwAGogBEIAQgAgBUGgAWpBCGopAwAgBSkDoAEiCiAFQZABakEIaikDAHwiAiAKVK18IAJCAVatfH1CABC+BSAFQYABakIBIAJ9QgAgBEIAEL4FIAggByAGa2ohBgJAAkAgBSkDcCIPQgGGIhAgBSkDgAFCP4ggBUGAAWpBCGopAwAiEUIBhoR8Ig1CmZN/fCISQiCIIgIgC0KAgICAgIDAAIQiE0IBhiABQj+IhCIUQiCIIgR+IgsgAUIBhiIVQiCIIgogBUHwAGpBCGopAwBCAYYgD0I/iIQgEUI/iHwgDSAQVK18IBIgDVStfEJ/fCIPQiCIIg1+fCIQIAtUrSAQIA9C/////w+DIgsgFEL/////D4MiD358IhEgEFStfCANIAR+fCALIAR+IhYgDyANfnwiECAWVK1CIIYgEEIgiIR8IBEgEEIghnwiECARVK18IBAgEkL/////D4MiEiAPfiIWIAIgCn58IhEgFlStIBEgCyAVQv7///8PgyIWfnwiFyARVK18fCIRIBBUrXwgESASIAR+IhAgFiANfnwiBCACIA9+fCINIAsgCn58IgtCIIggBCAQVK0gDSAEVK18IAsgDVStfEIghoR8IgQgEVStfCAEIBcgAiAWfiICIBIgCn58IgpCIIggCiACVK1CIIaEfCICIBdUrSACIAtCIIZ8IAJUrXx8IgIgBFStfCIEQv////////8AVg0AIAVB0ABqIAIgBCADIA4QvgUgAUIxhiAFQdAAakEIaikDAH0gBSkDUCIBQgBSrX0hDSAGQf7/AGohBkIAIAF9IQoMAQsgBUHgAGogAkIBiCAEQj+GhCICIARCAYgiBCADIA4QvgUgAUIwhiAFQeAAakEIaikDAH0gBSkDYCIKQgBSrX0hDSAGQf//AGohBkIAIAp9IQogASEVIBMhFAsCQCAGQf//AUgNACAMQoCAgICAgMD//wCEIQxCACEBDAELAkACQCAGQQFIDQAgDUIBhiAKQj+IhCENIAatQjCGIARC////////P4OEIQsgCkIBhiEEDAELAkAgBkGPf0oNAEIAIQEMAgsgBUHAAGogAiAEQQEgBmsQvAUgBUEwaiAVIBQgBkHwAGoQsgUgBUEgaiADIA4gBSkDQCICIAVBwABqQQhqKQMAIgsQvgUgBUEwakEIaikDACAFQSBqQQhqKQMAQgGGIAUpAyAiAUI/iIR9IAUpAzAiBCABQgGGIgFUrX0hDSAEIAF9IQQLIAVBEGogAyAOQgNCABC+BSAFIAMgDkIFQgAQvgUgCyACIAJCAYMiASAEfCIEIANWIA0gBCABVK18IgEgDlYgASAOURutfCIDIAJUrXwiAiADIAJCgICAgICAwP//AFQgBCAFKQMQViABIAVBEGpBCGopAwAiAlYgASACURtxrXwiAiADVK18IgMgAiADQoCAgICAgMD//wBUIAQgBSkDAFYgASAFQQhqKQMAIgRWIAEgBFEbca18IgEgAlStfCAMhCEMCyAAIAE3AwAgACAMNwMIIAVB0AJqJAALjgICAn8DfiMAQRBrIgIkAAJAAkAgAb0iBEL///////////8AgyIFQoCAgICAgIB4fEL/////////7/8AVg0AIAVCPIYhBiAFQgSIQoCAgICAgICAPHwhBQwBCwJAIAVCgICAgICAgPj/AFQNACAEQjyGIQYgBEIEiEKAgICAgIDA//8AhCEFDAELAkAgBVBFDQBCACEGQgAhBQwBCyACIAVCACAEp2dBIGogBUIgiKdnIAVCgICAgBBUGyIDQTFqELIFIAJBCGopAwBCgICAgICAwACFQYz4ACADa61CMIaEIQUgAikDACEGCyAAIAY3AwAgACAFIARCgICAgICAgICAf4OENwMIIAJBEGokAAvhAQIDfwJ+IwBBEGsiAiQAAkACQCABvCIDQf////8HcSIEQYCAgHxqQf////cHSw0AIAStQhmGQoCAgICAgIDAP3whBUIAIQYMAQsCQCAEQYCAgPwHSQ0AIAOtQhmGQoCAgICAgMD//wCEIQVCACEGDAELAkAgBA0AQgAhBkIAIQUMAQsgAiAErUIAIARnIgRB0QBqELIFIAJBCGopAwBCgICAgICAwACFQYn/ACAEa61CMIaEIQUgAikDACEGCyAAIAY3AwAgACAFIANBgICAgHhxrUIghoQ3AwggAkEQaiQAC40BAgJ/An4jAEEQayICJAACQAJAIAENAEIAIQRCACEFDAELIAIgASABQR91IgNzIANrIgOtQgAgA2ciA0HRAGoQsgUgAkEIaikDAEKAgICAgIDAAIVBnoABIANrrUIwhnwgAUGAgICAeHGtQiCGhCEFIAIpAwAhBAsgACAENwMAIAAgBTcDCCACQRBqJAALcgIBfwJ+IwBBEGsiAiQAAkACQCABDQBCACEDQgAhBAwBCyACIAGtQgAgAWciAUHRAGoQsgUgAkEIaikDAEKAgICAgIDAAIVBnoABIAFrrUIwhnwhBCACKQMAIQMLIAAgAzcDACAAIAQ3AwggAkEQaiQACwQAQQALBABBAAtTAQF+AkACQCADQcAAcUUNACACIANBQGqtiCEBQgAhAgwBCyADRQ0AIAJBwAAgA2uthiABIAOtIgSIhCEBIAIgBIghAgsgACABNwMAIAAgAjcDCAucCwIFfw9+IwBB4ABrIgUkACAEQv///////z+DIQogBCAChUKAgICAgICAgIB/gyELIAJC////////P4MiDEIgiCENIARCMIinQf//AXEhBgJAAkACQCACQjCIp0H//wFxIgdBgYB+akGCgH5JDQBBACEIIAZBgYB+akGBgH5LDQELAkAgAVAgAkL///////////8AgyIOQoCAgICAgMD//wBUIA5CgICAgICAwP//AFEbDQAgAkKAgICAgIAghCELDAILAkAgA1AgBEL///////////8AgyICQoCAgICAgMD//wBUIAJCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCELIAMhAQwCCwJAIAEgDkKAgICAgIDA//8AhYRCAFINAAJAIAMgAoRQRQ0AQoCAgICAgOD//wAhC0IAIQEMAwsgC0KAgICAgIDA//8AhCELQgAhAQwCCwJAIAMgAkKAgICAgIDA//8AhYRCAFINACABIA6EIQJCACEBAkAgAlBFDQBCgICAgICA4P//ACELDAMLIAtCgICAgICAwP//AIQhCwwCCwJAIAEgDoRCAFINAEIAIQEMAgsCQCADIAKEQgBSDQBCACEBDAILQQAhCAJAIA5C////////P1YNACAFQdAAaiABIAwgASAMIAxQIggbeSAIQQZ0rXynIghBcWoQsgVBECAIayEIIAVB2ABqKQMAIgxCIIghDSAFKQNQIQELIAJC////////P1YNACAFQcAAaiADIAogAyAKIApQIgkbeSAJQQZ0rXynIglBcWoQsgUgCCAJa0EQaiEIIAVByABqKQMAIQogBSkDQCEDCyADQg+GIg5CgID+/w+DIgIgAUIgiCIEfiIPIA5CIIgiDiABQv////8PgyIBfnwiEEIghiIRIAIgAX58IhIgEVStIAIgDEL/////D4MiDH4iEyAOIAR+fCIRIApCD4YgA0IxiIQiFEL/////D4MiAyABfnwiCiAQQiCIIBAgD1StQiCGhHwiDyACIA1CgIAEhCIQfiIVIA4gDH58Ig0gFEIgiEKAgICACIQiAiABfnwiFCADIAR+fCIWQiCGfCIXfCEBIAcgBmogCGpBgYB/aiEGAkACQCACIAR+IhggDiAQfnwiBCAYVK0gBCADIAx+fCIOIARUrXwgAiAQfnwgDiARIBNUrSAKIBFUrXx8IgQgDlStfCADIBB+IgMgAiAMfnwiAiADVK1CIIYgAkIgiIR8IAQgAkIghnwiAiAEVK18IAIgFkIgiCANIBVUrSAUIA1UrXwgFiAUVK18QiCGhHwiBCACVK18IAQgDyAKVK0gFyAPVK18fCICIARUrXwiBEKAgICAgIDAAINQDQAgBkEBaiEGDAELIBJCP4ghAyAEQgGGIAJCP4iEIQQgAkIBhiABQj+IhCECIBJCAYYhEiADIAFCAYaEIQELAkAgBkH//wFIDQAgC0KAgICAgIDA//8AhCELQgAhAQwBCwJAAkAgBkEASg0AAkBBASAGayIHQYABSQ0AQgAhAQwDCyAFQTBqIBIgASAGQf8AaiIGELIFIAVBIGogAiAEIAYQsgUgBUEQaiASIAEgBxC8BSAFIAIgBCAHELwFIAUpAyAgBSkDEIQgBSkDMCAFQTBqQQhqKQMAhEIAUq2EIRIgBUEgakEIaikDACAFQRBqQQhqKQMAhCEBIAVBCGopAwAhBCAFKQMAIQIMAQsgBq1CMIYgBEL///////8/g4QhBAsgBCALhCELAkAgElAgAUJ/VSABQoCAgICAgICAgH9RGw0AIAsgAkIBfCIBIAJUrXwhCwwBCwJAIBIgAUKAgICAgICAgIB/hYRCAFENACACIQEMAQsgCyACIAJCAYN8IgEgAlStfCELCyAAIAE3AwAgACALNwMIIAVB4ABqJAALdQEBfiAAIAQgAX4gAiADfnwgA0IgiCICIAFCIIgiBH58IANC/////w+DIgMgAUL/////D4MiAX4iBUIgiCADIAR+fCIDQiCIfCADQv////8PgyACIAF+fCIBQiCIfDcDCCAAIAFCIIYgBUL/////D4OENwMAC0gBAX8jAEEQayIFJAAgBSABIAIgAyAEQoCAgICAgICAgH+FELEFIAUpAwAhBCAAIAVBCGopAwA3AwggACAENwMAIAVBEGokAAvkAwICfwJ+IwBBIGsiAiQAAkACQCABQv///////////wCDIgRCgICAgICAwP9DfCAEQoCAgICAgMCAvH98Wg0AIABCPIggAUIEhoQhBAJAIABC//////////8PgyIAQoGAgICAgICACFQNACAEQoGAgICAgICAwAB8IQUMAgsgBEKAgICAgICAgMAAfCEFIABCgICAgICAgIAIUg0BIAUgBEIBg3whBQwBCwJAIABQIARCgICAgICAwP//AFQgBEKAgICAgIDA//8AURsNACAAQjyIIAFCBIaEQv////////8Dg0KAgICAgICA/P8AhCEFDAELQoCAgICAgID4/wAhBSAEQv///////7//wwBWDQBCACEFIARCMIinIgNBkfcASQ0AIAJBEGogACABQv///////z+DQoCAgICAgMAAhCIEIANB/4h/ahCyBSACIAAgBEGB+AAgA2sQvAUgAikDACIEQjyIIAJBCGopAwBCBIaEIQUCQCAEQv//////////D4MgAikDECACQRBqQQhqKQMAhEIAUq2EIgRCgYCAgICAgIAIVA0AIAVCAXwhBQwBCyAEQoCAgICAgICACFINACAFQgGDIAV8IQULIAJBIGokACAFIAFCgICAgICAgICAf4OEvwsHACAAEKsFCwcAIAAQ2wULAgALAgALCgAgABDCBRDBBQsKACAAEMIFEMEFCwoAIAAQwgUQwQULCgAgABDCBRDBBQsLACAAIAFBABDKBQswAAJAIAINACAAKAIEIAEoAgRGDwsCQCAAIAFHDQBBAQ8LIAAQywUgARDLBRD1BEULBwAgACgCBAuwAQECfyMAQcAAayIDJABBASEEAkAgACABQQAQygUNAEEAIQQgAUUNAEEAIQQgAUHE8QVB9PEFQQAQzQUiAUUNACADQQhqQQRyQQBBNBCaBBogA0EBNgI4IANBfzYCFCADIAA2AhAgAyABNgIIIAEgA0EIaiAC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AHByaW50AGNvZGVwb2ludABjb21tZW50AGNvbnN0YW50AHVsdABfX2x0AGxpbWl0AHJhd3NldABvZmZzZXQAcmF3Z2V0AGNvbGxlY3QAc2VsZWN0AGJ0AGZsb2F0AHZhcmlhYmxlLWxlbmd0aCBmb3JtYXQAcmVwZWF0AF9fY29uY2F0AHdyb25nIG51bWJlciBvZiBhcmd1bWVudHMAY29uc3RhbnRzAHRvbyBtYW55IHJlc3VsdHMAaXBhaXJzAF9fcGFpcnMAZnVuY3Rpb24gb3IgZXhwcmVzc2lvbiBuZWVkcyB0b28gbWFueSByZWdpc3RlcnMAX2NhbGxlcnMAc3BlY2lmaWVyICclJXEnIGNhbm5vdCBoYXZlIG1vZGlmaWVycwBsYWJlbHMvZ290b3MAc3RyaW5nIGNvbnRhaW5zIHplcm9zAGFjb3MAdG9vIG1hbnkgbmVzdGVkIGZ1bmN0aW9ucwB0b28gbWFueSB1cHZhbHVlcwBhdHRlbXB0IHRvIGNvbXBhcmUgdHdvICVzIHZhbHVlcwB0b28gbWFueSBjYXB0dXJlcwBjb3JlIGFuZCBsaWJyYXJ5IGhhdmUgaW5jb21wYXRpYmxlIG51bWVyaWMgdHlwZXMAY2h1bmsgaGFzIHRvbyBtYW55IGxpbmVzAGxvY2FsIHZhcmlhYmxlcwBvcGNvZGVzAGZpbmFsIHBvc2l0aW9uIG91dCBvZiBib3VuZHMAaW5pdGlhbCBwb3NpdGlvbiBvdXQgb2YgYm91bmRzAF9saWJzAGFicwBhdHRlbXB0IHRvICVzIGEgJXMgdmFsdWUlcwBAJXMAJXMgZXhwZWN0ZWQsIGdvdCAlcwBjYW5ub3QgJXMgJXMAJXMgbmVhciAlcwB0b28gbWFueSAlcyAobGltaXQgaXMgJWQpIGluICVzAGF0dGVtcHQgdG8gY29tcGFyZSAlcyB3aXRoICVzAGNhbm5vdCAlcyAlczogJXMAQ0FMTEVSX1JVTl9GQUlMICVzOiAlcwBMSUJfUlVOX0ZBSUwgJXM6ICVzAENBTExFUl9MT0FEX0ZBSUwgJXM6ICVzACVzOiVkOiAlcwBFUlI6ICVzAF9fYnhvcgBmb3IgaXRlcmF0b3IAc3ludGF4IGVycm9yAGZsb29yAGZvcgBfX2JvcgBfX3NocgBsb3dlcgBpbnZhbGlkIGxvbmcgc3RyaW5nIGRlbGltaXRlcgB1cHBlcgBjYWxsZXIAbWF4aW50ZWdlcgB0b2ludGVnZXIAbWluaW50ZWdlcgBvYmplY3QgbGVuZ3RoIGlzIG5vdCBhbiBpbnRlZ2VyAGx1YV9JbnRlZ2VyACVkLWJ5dGUgaW50ZWdlciBkb2VzIG5vdCBmaXQgaW50byBMdWEgSW50ZWdlcgB0b251bWJlcgBtYWxmb3JtZWQgbnVtYmVyAGx1YV9OdW1iZXIAY2hhcgBfX2VxAF9fZGJxAGV4cABzdG9wACdfX25ld2luZGV4JyBjaGFpbiB0b28gbG9uZzsgcG9zc2libGUgbG9vcAAnX19pbmRleCcgY2hhaW4gdG9vIGxvbmc7IHBvc3NpYmxlIGxvb3AAZHVtcABzdGVwAHJlcABQcAAlczogJXAAcHJvdG8AZ290bwBhdHRlbXB0IHRvIGRpdmlkZSBieSB6ZXJvACdmb3InIHN0ZXAgaXMgemVybwBkbwByZXR1cm4AY2hhcnBhdHRlcm4AbWlzc2luZyAnWycgYWZ0ZXIgJyUlZicgaW4gcGF0dGVybgB3YXJuAGpzb24ASW5zdHJ1Y3Rpb24AbWFpbiBmdW5jdGlvbgB1bmFibGUgdG8gZHVtcCBnaXZlbiBmdW5jdGlvbgBjYW5ub3QgdXNlICcuLi4nIG91dHNpZGUgYSB2YXJhcmcgZnVuY3Rpb24AbnVtYmVyJXMgaGFzIG5vIGludGVnZXIgcmVwcmVzZW50YXRpb24AbnVtYmVyIGhhcyBubyBpbnRlZ2VyIHJlcHJlc2VudGF0aW9uAHBlcmZvcm0gYml0d2lzZSBvcGVyYXRpb24gb24AcGVyZm9ybSBhcml0aG1ldGljIG9uAGFzaW4AbWluAD1zdGRpbgBtYWluAHJlb3BlbgByYXdsZW4AX19sZW4AdGhlbgBhdGFuAG5hbgBib29sZWFuAHZhbHVlIGhhcyBubyBsaXRlcmFsIGZvcm0AcmFuZG9tAF9fdW5tAHNldHN0ZXBtdWwAX19tdWwALS0gZXRsLmx1YTogRVRMIOa1geeoi+WxguKAlOKAlOWuoeiuoSAvIOW5guetiSAvIOiHquaEiCAvIOe7hOS7tuWMliAvIFBpcGVsaW5lIOW8leaTju+8iDIwMjYtMDgtMTnvvIkKLS0gQGxpY2Vuc2U6IE1JVCAoZHVja2RiLWx1YWppdC1saWJzIHByb2plY3QpCi0tIEBtYXR1cml0eTogdGVzdGVkCi0tIOmcgOimgeaZrumAmuaooeW8j++8iOmdniB0cnVzdGVk77yJ77ya5a2Y5YKo6L+H56iL5Zue5p+l5L6d6LWWIF9kdWNrZGJfY2FsbCAvIF9kdWNrZGJfcXVlcnkKLS0KLS0g5L2/55So77yIaW5zdGFsbCDlkI7vvInvvJoKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnaW5zdGFsbCcsIHNxbF9uYW1lIDo9ICdldGwnKTsKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnY29tcGlsZScsIHNxbF9uYW1lIDo9ICdldGxfcnVuX2RlbW8nLAotLSAgICAgc291cmNlIDo9ICdyZXR1cm4gZnVuY3Rpb24oeCkgcmV0dXJuIGV0bC5ydW4oImRlbW8iLCB4KSBlbmQnKTsKLS0KLS0g5LqU5aSn6IO95Yqb77yaCi0tICAgUDAgZXRsLmxvZyAvIGV0bC5ydW4gICAgICAgIOKAlOKAlCDlrqHorqHvvJroh6rliqjlu7ogZXRsX3J1bl9sb2cg6KGo77yM5q+P5qyh6L+Q6KGM6K6wICh0cywgZm4sIGFyZ3MsIGR1cmF0aW9uX21zLCByb3dzLCBzdWNjZXNzLCBlcnIpCi0tICAgUDEgZXRsLnZhbGlkYXRlICAgICAgICAgICAgIOKAlOKAlCDluYLnrYnlj4zmo4DvvJp0aHJvd19pZl9lbXB0ee+8iOa6kOepuuWImeWksei0pe+8iS8gdGhyb3dfaWZfbm90X2VtcHR577yI55uu5qCH5bey5pyJ5YiZ5aSx6LSl6Ziy6YeN77yJCi0tICAgUDEgZXRsLnNhZmUgLyBpbnNlcnRfYXV0byAgIOKAlOKAlCDplJnor6/mraPliJnoh6rmhIjvvJpwY2FsbCArIGVycjptYXRjaChwYXR0ZXJuKSDihpIg5Zue6YCA5Ye95pWwIOKGkiDph43or5UKLS0gICBQMiBldGwucSAvIHF1ZXJ5IC8gZXhlYyAgICAg4oCU4oCUIHF1ZXJ5LWRvYyDnu4Tku7bljJbvvJpDVEUvc2VsZWN0L2Zyb20vam9pbi93aGVyZS9ncm91cC9vcmRlci9oYXZpbmcg5Yqo5oCB5ou8IFNRTAotLSAgIFAzIGV0bC5waXBlbGluZSAvIGNvbXBpbGUgICDigJTigJQgUGlwZWxpbmUg5byV5pOO77yaUGlwZWxpbmUgSlNPTiDihpIg5ouT5omR5o6S5bqPIOKGkiDnvJbor5Eg4oaSIOaJp+ihjCArIOmAkOiKgueCueWuoeiuoQotLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOiKgueCueexu+Weizogc291cmNlKOW7uuS4tOaXtuihqCkgLyB0cmFuc2Zvcm0oU1FMKSAvIHRyYW5zZm9ybV9sdWEoTHVh6Zet5YyF6KGM5aSE55CGKQotLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxdWFsaXR5KOaVsOaNrui0qOmHj+ajgOafpSkgLyBzaW5rKOiQveihqCkKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWZfbm9kZSjmnaHku7bot6/nlLEpIC8gc3dpdGNoX25vZGUo5aSa6Lev6Lev55SxKQotLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOi3r+eUsTog5LiL5ri46IqC54K5IHJvdXRlPSJ0cnVlIi8iZmFsc2UiIOWMuemFjSBpZl9ub2RlIOadoeS7tiDihpIg5LiN5Yy56YWN55qE5pSv6Lev6Lez6L+HCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaF9ub2RlIOeahCBzZWxlY3RvciDov5Tlm54gc3RyaW5nIOKGkiDkuIvmuLggcm91dGUg5Yy56YWN5omN5omn6KGMCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg6YeN6K+VOiDoioLngrnphY3nva4gcmV0cnk9e21heD0zLCBiYWNrb2ZmPTEuMH0g4oaSIOaMh+aVsOmAgOmBvyBiYWNrb2Zmw5cyXihuLTEpCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg6LaF5pe2OiDoioLngrnphY3nva4gdGltZW91dD02MCDihpIg6LaF5pe25ZCO5Lit5q2i77yI5ZCr6YeN6K+V5oC75pe26Ze077yJCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg6ZSZ6K+v5oGi5aSNOiDoioLngrnphY3nva4gb25fZXJyb3I9ImhhbmRsZXJfaWQiIOKGkiDlpLHotKXml7bkuI3kuK3mraLvvIzov5DooYwgaGFuZGxlciDlkI7nu6fnu60KLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDmlbDmja7otKjph4/mo4Dmn6U6IG5vdF9udWxsIC8gdW5pcXVlIC8gcm93Y291bnRfbWluIC8gcm93Y291bnRfbWF4IC8gc2NoZW1hCgpsb2NhbCBldGwgPSB7fQoKLS0gPT09PT09PT09PT09IOWGhemDqOW3peWFtyA9PT09PT09PT09PT0KCmxvY2FsIGZ1bmN0aW9uIGVzYyh2KQogIC0tIFNRTCDlrZfnrKbkuLLovazkuYnvvIhMdWEg5Y2V5byV5Y+3IOKGkiBTUUwg5Y+M5Y2V5byV5Y+377yJCiAgaWYgdHlwZSh2KSA9PSAic3RyaW5nIiB0aGVuCiAgICByZXR1cm4gIiciIC4uIHY6Z3N1YigiJyIsICInJyIpIC4uICInIgogIGVuZAogIGlmIHYgPT0gbmlsIHRoZW4gcmV0dXJuICJOVUxMIiBlbmQKICByZXR1cm4gdG9zdHJpbmcodikKZW5kCgotLSDnuYHlv5nnrYnlvoXvvIjnp5LvvIxMdWFKSVQg5YaF5peg5Y+v56e75qSNIHNsZWVw77yM55SoIGJ1c3ktbG9vcCDmm7/ku6PvvIkKbG9jYWwgZnVuY3Rpb24gYnVzeV9zbGVlcChzZWMpCiAgbG9jYWwgdDAgPSBvcy5jbG9jaygpCiAgd2hpbGUgb3MuY2xvY2soKSAtIHQwIDwgc2VjIGRvIGVuZAplbmQKCi0tID09PT09PT09PT09PSBQMDog5a6h6K6hID09PT09PT09PT09PQoKZXRsLmxvZ190YWJsZSA9ICJldGxfcnVuX2xvZyIKCi0tIOWIneWni+WMluWuoeiuoeihqO+8iOW5guetie+8iQpmdW5jdGlvbiBldGwuaW5pdCgpCiAgX2R1Y2tkYl9jYWxsKCJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAiIC4uIGV0bC5sb2dfdGFibGUgLi4gIiAoIgogICAgLi4gInJ1bl9pZCBCSUdJTlQsIHRzIFRJTUVTVEFNUCwgZm4gVkFSQ0hBUiwgYXJncyBWQVJDSEFSLCAiCiAgICAuLiAiZHVyYXRpb25fbXMgQklHSU5ULCByb3dzIEJJR0lOVCwgc3VjY2VzcyBCT09MRUFOLCBlcnIgVkFSQ0hBUikiKQplbmQKCi0tIOWGmeS4gOadoeWuoeiuoeiusOW9lQpmdW5jdGlvbiBldGwubG9nKHJ1bl9pZCwgZm4sIGFyZ3MsIGR1cmF0aW9uX21zLCByb3dzLCBzdWNjZXNzLCBlcnIpCiAgZXRsLmluaXQoKQogIGxvY2FsIHNxbCA9ICJJTlNFUlQgSU5UTyAiIC4uIGV0bC5sb2dfdGFibGUgLi4gIiBWQUxVRVMgKCIKICAgIC4uIGVzYyhydW5faWQpIC4uICIsIG5vdygpLCAiIC4uIGVzYyhmbikgLi4gIiwgIiAuLiBlc2MoYXJncykgLi4gIiwgIgogICAgLi4gZXNjKGR1cmF0aW9uX21zKSAuLiAiLCAiIC4uIGVzYyhyb3dzKSAuLiAiLCAiIC4uIChzdWNjZXNzIGFuZCAidHJ1ZSIgb3IgImZhbHNlIikgLi4gIiwgIiAuLiBlc2MoZXJyKSAuLiAiKSIKICByZXR1cm4gX2R1Y2tkYl9jYWxsKHNxbCkKZW5kCgotLSDljIXoo4XmiafooYzvvJrorqHml7YgKyDlrqHorqEgKyDplJnor6/mjZXojrcKLS0g55So5rOV77yaZXRsLnJ1bihmbl9uYW1lLCBhcmdzX2pzb24sIGZuLCAuLi4pICBmbiDmmK/lj68gcGNhbGwg55qEIEx1YSDlh73mlbAKZnVuY3Rpb24gZXRsLnJ1bihmbl9uYW1lLCBhcmdzX2pzb24sIGZuLCAuLi4pCiAgbG9jYWwgdDAgPSBvcy5jbG9jaygpCiAgbG9jYWwgb2ssIHJlcyA9IHBjYWxsKGZuLCAuLi4pCiAgbG9jYWwgZHQgPSBtYXRoLmZsb29yKChvcy5jbG9jaygpIC0gdDApICogMTAwMCkKICBpZiBvayB0aGVuCiAgICBsb2NhbCByb3dzID0gMAogICAgaWYgdHlwZShyZXMpID09ICJ0YWJsZSIgdGhlbiByb3dzID0gI3JlcyBlbmQKICAgIGV0bC5sb2coMCwgZm5fbmFtZSwgYXJnc19qc29uLCBkdCwgcm93cywgdHJ1ZSwgbmlsKQogICAgcmV0dXJuIHJlcwogIGVsc2UKICAgIGV0bC5sb2coMCwgZm5fbmFtZSwgYXJnc19qc29uLCBkdCwgMCwgZmFsc2UsIHRvc3RyaW5nKHJlcykpCiAgICBlcnJvcihyZXMsIDApCiAgZW5kCmVuZAoKLS0g6K+75pyA6L+R5a6h6K6h6K6w5b2VCmZ1bmN0aW9uIGV0bC5sb2dzKG4pCiAgbiA9IG4gb3IgMTAKICByZXR1cm4gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIENBU1QocnVuX2lkIEFTIEJJR0lOVCkgQVMgcnVuX2lkLCB0cywgZm4sIGFyZ3MsICIKICAgIC4uICJDQVNUKGR1cmF0aW9uX21zIEFTIEJJR0lOVCkgQVMgZHVyYXRpb25fbXMsIENBU1Qocm93cyBBUyBCSUdJTlQpIEFTIHJvd3MsIHN1Y2Nlc3MsIGVyciAiCiAgICAuLiAiRlJPTSAiIC4uIGV0bC5sb2dfdGFibGUgLi4gIiBPUkRFUiBCWSB0cyBERVNDIExJTUlUICIgLi4gdG9zdHJpbmcobikpCmVuZAoKLS0gPT09PT09PT09PT09IFAxOiDluYLnrYnlj4zmo4AgPT09PT09PT09PT09CgotLSDmoKHpqozooajooYzmlbDnuqbmnZ/vvIhFVExYIGxvYWRfdmFsaWRhdGlvbu+8iQotLSDmqKHlvI/vvJp0aHJvd19pZl9lbXB0ee+8iOihqOepuuWImeWksei0pe+8iS8gdGhyb3dfaWZfbm90X2VtcHR577yI6KGo6Z2e56m65YiZ5aSx6LSl77yM6Ziy6YeN77yJCmZ1bmN0aW9uIGV0bC52YWxpZGF0ZSh0YmwsIG1vZGUsIG1pbl9yb3dzKQogIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgbiBGUk9NICIgLi4gdGJsKQogIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IoInZhbGlkYXRlOiAiIC4uIHRvc3RyaW5nKGVyciksIDApIGVuZAogIGxvY2FsIG4gPSB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICBpZiBtb2RlID09ICJ0aHJvd19pZl9lbXB0eSIgdGhlbgogICAgaWYgbiA9PSAwIHRoZW4gZXJyb3IoInZhbGlkYXRlOiB0YWJsZSAiIC4uIHRibCAuLiAiIGlzIGVtcHR5IChleHBlY3RlZCByb3dzID4gMCkiLCAwKSBlbmQKICBlbHNlaWYgbW9kZSA9PSAidGhyb3dfaWZfbm90X2VtcHR5IiB0aGVuCiAgICBpZiBuID4gMCB0aGVuIGVycm9yKCJ2YWxpZGF0ZTogdGFibGUgIiAuLiB0YmwgLi4gIiBhbHJlYWR5IGhhcyAiIC4uIG4gLi4gIiByb3dzIChsb2FkIHR3aWNlPykiLCAwKSBlbmQKICBlbHNlaWYgbW9kZSA9PSAidGhyb3dfaWZfbHQiIHRoZW4KICAgIGlmIG4gPCAobWluX3Jvd3Mgb3IgMSkgdGhlbgogICAgICBlcnJvcigidmFsaWRhdGU6IHRhYmxlICIgLi4gdGJsIC4uICIgaGFzICIgLi4gbiAuLiAiIHJvd3MgKGV4cGVjdGVkID49ICIgLi4gdG9zdHJpbmcobWluX3Jvd3MpIC4uICIpIiwgMCkKICAgIGVuZAogIGVsc2UKICAgIGVycm9yKCJ2YWxpZGF0ZTogdW5rbm93biBtb2RlICIgLi4gdG9zdHJpbmcobW9kZSksIDApCiAgZW5kCiAgcmV0dXJuIG4KZW5kCgotLSA9PT09PT09PT09PT0gUDE6IOmUmeivr+ato+WImeiHquaEiCA9PT09PT09PT09PT0KCi0tIOaJp+ihjCBmbu+8jOiLpeWksei0pe+8iOaKm+mUmSDmiJYgX2R1Y2tkYl9jYWxsIOi/lOWbniAiZXJyb3I6IC4uLiLvvInkuJTplJnor6/ljLnphY0gcGF0dGVybu+8jAotLSDliJnmiafooYwgZmFsbGJhY2sg5ZCO6YeN6K+V5LiA5qyh77yIRVRMWCBsb2FkX29uX2Vycl9tYXRjaO+8iQotLSDnlKjms5XvvJpldGwuc2FmZShmbiwgImRvZXMgbm90IGV4aXN0IiwgZnVuY3Rpb24oKSBjcmVhdGVfdGFibGUoKSBlbmQpCmZ1bmN0aW9uIGV0bC5zYWZlKGZuLCBwYXR0ZXJuLCBmYWxsYmFjaykKICBsb2NhbCBvaywgcmVzID0gcGNhbGwoZm4pCiAgLS0gX2R1Y2tkYl9jYWxsIOS4jeaKmyBMdWEgZXJyb3LvvIzlpLHotKXml7bov5Tlm54gImVycm9yOiA8bXNnPiIg5a2X56ym5Liy4oCU4oCU5Lik56eN5oOF5Ya16YO9566X5aSx6LSlCiAgaWYgb2sgYW5kIHR5cGUocmVzKSA9PSAic3RyaW5nIiBhbmQgcmVzOm1hdGNoKCJeZXJyb3I6IikgdGhlbgogICAgb2sgPSBmYWxzZQogICAgcmVzID0gcmVzOnN1Yig3KSAgLS0g5Y675o6JICJlcnJvcjogIiDliY3nvIAKICBlbmQKICBpZiBvayB0aGVuIHJldHVybiByZXMgZW5kCiAgbG9jYWwgZXJybXNnID0gdG9zdHJpbmcocmVzKQogIGlmIHBhdHRlcm4gYW5kIGVycm1zZzptYXRjaChwYXR0ZXJuKSB0aGVuCiAgICBpZiBmYWxsYmFjayB0aGVuCiAgICAgIGxvY2FsIGZvaywgZmVyciA9IHBjYWxsKGZhbGxiYWNrKQogICAgICBpZiBub3QgZm9rIHRoZW4gZXJyb3IoInNhZmU6IGZhbGxiYWNrIGZhaWxlZDogIiAuLiB0b3N0cmluZyhmZXJyKSwgMCkgZW5kCiAgICBlbmQKICAgIC0tIOmHjeivleS4gOasoQogICAgbG9jYWwgb2syLCByZXMyID0gcGNhbGwoZm4pCiAgICBpZiBvazIgYW5kIHR5cGUocmVzMikgPT0gInN0cmluZyIgYW5kIHJlczI6bWF0Y2goIl5lcnJvcjoiKSB0aGVuCiAgICAgIG9rMiA9IGZhbHNlCiAgICAgIHJlczIgPSByZXMyOnN1Yig3KQogICAgZW5kCiAgICBpZiBub3Qgb2syIHRoZW4gZXJyb3IoInNhZmU6IHJldHJ5IGZhaWxlZDogIiAuLiB0b3N0cmluZyhyZXMyKSwgMCkgZW5kCiAgICByZXR1cm4gcmVzMgogIGVuZAogIGVycm9yKGVycm1zZywgMCkKZW5kCgotLSDlu7rooajoh6rmhIjljIXoo4XvvJrnm67moIfooajkuI3lrZjlnKgg4oaSIOiHquWKqOW7uuihqCDihpIg6YeN6K+VIElOU0VSVAotLSDnlKjms5XvvJpldGwuaW5zZXJ0X2F1dG8odGJsLCBkZGwsIHNxbCkKZnVuY3Rpb24gZXRsLmluc2VydF9hdXRvKHRibCwgZGRsLCBzcWwpCiAgcmV0dXJuIGV0bC5zYWZlKAogICAgZnVuY3Rpb24oKSByZXR1cm4gX2R1Y2tkYl9jYWxsKHNxbCkgZW5kLAogICAgImRvZXMgbm90IGV4aXN0IiwKICAgIGZ1bmN0aW9uKCkgcmV0dXJuIF9kdWNrZGJfY2FsbChkZGwpIGVuZCkKZW5kCgotLSA9PT09PT09PT09PT0gUDI6IHF1ZXJ5LWRvYyDnu4Tku7bljJYgPT09PT09PT09PT09CgotLSBTUUwg57uE5Lu25Yqo5oCB5ou85o6l77yIRVRMWCBxdWVyeS1kb2MgLyBkYnQg5byP57uE5Lu277yJCi0tIOeUqOazle+8mgotLSAgIGV0bC5xKHsKLS0gICAgIHNlbGVjdCA9ICJhLmlkLCBhLm5hbWUsIGIudG90YWwiLAotLSAgICAgZnJvbSA9ICJzcmMub3JkZXJzIGEiLAotLSAgICAgam9pbiA9ICJKT0lOIHNyYy5jdXN0b21lcnMgYiBPTiBhLmN1c3RfaWQgPSBiLmlkIiwKLS0gICAgIHdoZXJlID0gImEuYW1vdW50ID4gMTAwIiwKLS0gICAgIGdyb3VwX2J5ID0gImEuaWQsIGEubmFtZSIsCi0tICAgICBvcmRlcl9ieSA9ICJiLnRvdGFsIERFU0MiLAotLSAgICAgbGltaXQgPSAxMCwKLS0gICB9KQpmdW5jdGlvbiBldGwucShwYXJ0cykKICBsb2NhbCBjbGF1c2VzID0gewogICAgeyAiV0lUSCIsIHBhcnRzLmN0ZSB9LAogICAgeyAiU0VMRUNUIiwgcGFydHMuc2VsZWN0IG9yICIqIiB9LAogICAgeyAiRlJPTSIsIHBhcnRzLmZyb20gfSwKICAgIHsgIiIsIHBhcnRzLmpvaW4gfSwKICAgIHsgIldIRVJFIiwgcGFydHMud2hlcmUgfSwKICAgIHsgIkdST1VQIEJZIiwgcGFydHMuZ3JvdXBfYnkgfSwKICAgIHsgIkhBVklORyIsIHBhcnRzLmhhdmluZyB9LAogICAgeyAiT1JERVIgQlkiLCBwYXJ0cy5vcmRlcl9ieSB9LAogICAgeyAiTElNSVQiLCBwYXJ0cy5saW1pdCB9LAogIH0KICBsb2NhbCBvdXQgPSB7fQogIGZvciBfLCBjbCBpbiBpcGFpcnMoY2xhdXNlcykgZG8KICAgIGlmIGNsWzJdIH49IG5pbCBhbmQgY2xbMl0gfj0gIiIgdGhlbgogICAgICBvdXRbI291dCArIDFdID0gKGNsWzFdIH49ICIiIGFuZCAoY2xbMV0gLi4gIiAiIC4uIGNsWzJdKSBvciBjbFsyXSkKICAgIGVuZAogIGVuZAogIHJldHVybiB0YWJsZS5jb25jYXQob3V0LCAiXG4iKQplbmQKCi0tIOaJp+ihjOe7hOS7tuWMluafpeivou+8jOi/lOWbnuihjOihqApmdW5jdGlvbiBldGwucXVlcnkocGFydHMpCiAgbG9jYWwgc3FsID0gZXRsLnEocGFydHMpCiAgcmV0dXJuIF9kdWNrZGJfcXVlcnkoc3FsKQplbmQKCi0tIOe7hOS7tuWMliBETUzvvIhJTlNFUlQgSU5UTyAuLi4gU0VMRUNUIC4uLiDnlLHnu4Tku7bnlJ/miJDvvIkKLS0g5aSx6LSl5pe25oqbIEx1YSBlcnJvcu+8iF9kdWNrZGJfY2FsbCDov5Tlm54gImVycm9yOiAuLi4iIOS4jeaKm+mUme+8jOi/memHjOe7n+S4gO+8iQpmdW5jdGlvbiBldGwuZXhlYyhwYXJ0cykKICBsb2NhbCBzcWwgPSBldGwucShwYXJ0cykKICBsb2NhbCByID0gX2R1Y2tkYl9jYWxsKHNxbCkKICBpZiB0eXBlKHIpID09ICJzdHJpbmciIGFuZCByOm1hdGNoKCJeZXJyb3I6IikgdGhlbgogICAgZXJyb3IocjpzdWIoNyksIDApCiAgZW5kCiAgcmV0dXJuIHIKZW5kCgotLSA9PT09PT09PT09PT0gUDM6IFBpcGVsaW5lIOW8leaTjiA9PT09PT09PT09PT0KCi0tIFBpcGVsaW5lIOe7k+aehO+8iOWJjeerr+eUu+W4g+WvvOWHuiAvIOaJi+WGme+8ie+8mgotLSB7Ci0tICAgbmFtZSA9ICJvcmRlcnNfZXRsIiwKLS0gICBub2RlcyA9IHsKLS0gICAgIHsgaWQgPSAic3JjIiwgICB0eXBlID0gInNvdXJjZSIsICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCAqIEZST00gcmVhZF9jc3YoJ29yZGVycy5jc3YnKSIgfSwKLS0gICAgIHsgaWQgPSAiY2xlYW4iLCB0eXBlID0gInRyYW5zZm9ybSIsICAgIHF1ZXJ5ID0gIlNFTEVDVCBpZCwgdXBwZXIobmFtZSkgQVMgbmFtZSwgYW1vdW50IEZST00gc3JjIFdIRVJFIGFtb3VudCA+IDAiLAotLSAgICAgICBkZXBzID0geyAic3JjIiB9IH0sCi0tICAgICB7IGlkID0gImF1ZGl0IiwgdHlwZSA9ICJxdWFsaXR5IiwgICAgICBjaGVja3MgPSB7Ci0tICAgICAgICAgeyB0eXBlID0gIm5vdF9udWxsIiwgY29sID0gImlkIiB9LAotLSAgICAgICAgIHsgdHlwZSA9ICJ1bmlxdWUiLCAgIGNvbCA9ICJpZCIgfSwKLS0gICAgICAgICB7IHR5cGUgPSAicm93Y291bnRfbWluIiwgbWluID0gMSB9LAotLSAgICAgICB9LCBkZXBzID0geyAiY2xlYW4iIH0gfSwKLS0gICAgIHsgaWQgPSAiaGFzX2RhdGEiLCB0eXBlID0gImlmX25vZGUiLCAgIGRlcHMgPSB7ImF1ZGl0In0sCi0tICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKGN0eCkgcmV0dXJuIGN0eC5hdWRpdCA+IDAgZW5kIH0sCi0tICAgICB7IGlkID0gInByb2Nlc3MiLCB0eXBlID0gInRyYW5zZm9ybSIsICBkZXBzID0geyJoYXNfZGF0YSJ9LCByb3V0ZSA9ICJ0cnVlIiwKLS0gICAgICAgcXVlcnkgPSAiU0VMRUNUICogRlJPTSBjbGVhbiBXSEVSRSBhbW91bnQgPiAxMDAiIH0sCi0tICAgICB7IGlkID0gImxvZ19lbXB0eSIsIHR5cGUgPSAic2luayIsICAgICBkZXBzID0geyJoYXNfZGF0YSJ9LCByb3V0ZSA9ICJmYWxzZSIsCi0tICAgICAgIHRhYmxlID0gImVtcHR5X2xvZyIgfSwKLS0gICAgIHsgaWQgPSAib3V0IiwgICB0eXBlID0gInNpbmsiLCAgICAgICAgIHRhYmxlID0gIm9yZGVyc19jbGVhbiIsIGRlcHMgPSB7ICJwcm9jZXNzIiB9LAotLSAgICAgICByZXRyeSA9IHsgbWF4ID0gMiwgYmFja29mZiA9IDEuMCB9LCB0aW1lb3V0ID0gMTIwIH0sCi0tICAgICB7IGlkID0gInJpc2t5IiwgdHlwZSA9ICJ0cmFuc2Zvcm0iLCAgICBkZXBzID0geyJzcmMifSwKLS0gICAgICAgcXVlcnkgPSAiU0VMRUNUIDEvMCIsIG9uX2Vycm9yID0gImZhbGxiYWNrIiB9LAotLSAgICAgeyBpZCA9ICJmYWxsYmFjayIsIHR5cGUgPSAidHJhbnNmb3JtIiwgZGVwcyA9IHsic3JjIn0sCi0tICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCAwIEFTIHJlc3VsdCIgfSwKLS0gICB9LAotLSB9Ci0tIOaJp+ihjOivreS5ie+8mnNvdXJjZSDihpIgQ1JFQVRFIE9SIFJFUExBQ0UgVEVNUCBUQUJMRSA8aWQ+IEFTIDxxdWVyeT4KLS0gICAgICAgICAgIHRyYW5zZm9ybSDihpIgQ1JFQVRFIE9SIFJFUExBQ0UgVEVNUCBUQUJMRSA8aWQ+IEFTIDxxdWVyeT7vvIjlvJXnlKjkuIrmuLjkuLTml7booajvvIkKLS0gICAgICAgICAgIHRyYW5zZm9ybV9sdWEg4oaSIOivu+S4iua4uOihqOihjCDihpIgTHVhIOmXreWMhemAkOihjOWkhOeQhiDihpIg5YaZ5Zue5Li05pe26KGoCi0tICAgICAgICAgICBxdWFsaXR5IOKGkiDlr7nkuIrmuLjooajot5EgY2hlY2tz77yM5Lu75LiA5aSx6LSl5oqb6ZSZCi0tICAgICAgICAgICBzaW5rIOKGkiBDUkVBVEUgT1IgUkVQTEFDRSBUQUJMRSA8dGFibGU+IEFTIFNFTEVDVCAqIEZST00gPOS4iua4uD4KLS0gICAgICAgICAgIGlmX25vZGUg4oaSIOivhOS8sCBjb25kaXRpb24oY3R4Ke+8jOi3r+eUseWIsCAidHJ1ZSIg5oiWICJmYWxzZSIg5YiG5pSvCi0tICAgICAgICAgICBzd2l0Y2hfbm9kZSDihpIg6K+E5LywIHNlbGVjdG9yKGN0eCnvvIzot6/nlLHliLDlr7nlupQgY2FzZSDliIbmlK8KLS0gICAgICAgICAgIOi3r+eUse+8muS4i+a4uOiKgueCuSByb3V0ZT0iWCIg5Yy56YWNIGlmX25vZGUvc3dpdGNoX25vZGUg57uT5p6c5omN5omn6KGM77yM5LiN5Yy56YWN6Lez6L+H77yI5LiN5oql6ZSZ77yJCi0tICAgICAgICAgICDph43or5XvvJpyZXRyeS5tYXgg5qyh6YeN6K+V77yM6YCA6YG/IHJldHJ5LmJhY2tvZmYgw5cgMl4obi0xKSDnp5IKLS0gICAgICAgICAgIOi2heaXtu+8mnRpbWVvdXQg56eS5YaF5b+F6aG75a6M5oiQ77yI5ZCr6YeN6K+V5oC75pe26Ze077yJ77yM6LaF5pe26LWw5aSx6LSl6YC76L6RCi0tICAgICAgICAgICDplJnor6/mgaLlpI3vvJpvbl9lcnJvciDorr4gaGFuZGxlcl9pZO+8jOWksei0peaXtuS4jeS4reatou+8jGhhbmRsZXIg5Zyo5ouT5omR5Lit5q2j5bi45omn6KGMCi0tIOavj+iKgueCueaJp+ihjOiusOS4gOadoeWuoeiuoe+8iGV0bF9ydW5fbG9n77yJ77yM5aSx6LSl5Y2z5Lit5q2i77yI6Zmk6Z2e6K6+IG9uX2Vycm9y77yJ44CCCgotLSDlhoXpg6jvvJrmiafooYzkuIDkuKogcXVhbGl0eSDmo4Dmn6XvvIzlpLHotKXmipvplJkKbG9jYWwgZnVuY3Rpb24gcnVuX2NoZWNrKHRibCwgY2hlY2spCiAgbG9jYWwgdCA9IGNoZWNrLnR5cGUKICBpZiB0ID09ICJub3RfbnVsbCIgdGhlbgogICAgbG9jYWwgcm93cywgZXJyID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gIiAuLiB0YmwgLi4gIiBXSEVSRSAiIC4uIGNoZWNrLmNvbCAuLiAiIElTIE5VTEwiKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcigicXVhbGl0eTogIiAuLiB0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIGxvY2FsIG4gPSB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICAgIGlmIG4gPiAwIHRoZW4gZXJyb3IoInF1YWxpdHlbIiAuLiB0YmwgLi4gIl06IG5vdF9udWxsKCIgLi4gY2hlY2suY29sIC4uICIpIGZhaWxlZDogIiAuLiBuIC4uICIgTlVMTCB2YWx1ZXMiLCAwKSBlbmQKICBlbHNlaWYgdCA9PSAidW5pcXVlIiB0aGVuCiAgICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgQ0FTVChjb3VudCgqKSBBUyBCSUdJTlQpIEFTIHRvdGFsLCBDQVNUKGNvdW50KERJU1RJTkNUICIgLi4gY2hlY2suY29sIC4uICIpIEFTIEJJR0lOVCkgQVMgZGlzdGluY3RfbiBGUk9NICIgLi4gdGJsKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcigicXVhbGl0eTogIiAuLiB0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIGlmIHRvbnVtYmVyKHJvd3NbMV0udG90YWwpIH49IHRvbnVtYmVyKHJvd3NbMV0uZGlzdGluY3RfbikgdGhlbgogICAgICBlcnJvcigicXVhbGl0eVsiIC4uIHRibCAuLiAiXTogdW5pcXVlKCIgLi4gY2hlY2suY29sIC4uICIpIGZhaWxlZDogdG90YWw9IiAuLiB0b3N0cmluZyhyb3dzWzFdLnRvdGFsKSAuLiAiIGRpc3RpbmN0PSIgLi4gdG9zdHJpbmcocm93c1sxXS5kaXN0aW5jdF9uKSwgMCkKICAgIGVuZAogIGVsc2VpZiB0ID09ICJyb3djb3VudF9taW4iIHRoZW4KICAgIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgbiBGUk9NICIgLi4gdGJsKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcigicXVhbGl0eTogIiAuLiB0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIGxvY2FsIG4gPSB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICAgIGlmIG4gPCAoY2hlY2subWluIG9yIDEpIHRoZW4gZXJyb3IoInF1YWxpdHlbIiAuLiB0YmwgLi4gIl06IHJvd2NvdW50X21pbiBmYWlsZWQ6ICIgLi4gbiAuLiAiIDwgIiAuLiB0b3N0cmluZyhjaGVjay5taW4pLCAwKSBlbmQKICBlbHNlaWYgdCA9PSAicm93Y291bnRfbWF4IiB0aGVuCiAgICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgQ0FTVChjb3VudCgqKSBBUyBCSUdJTlQpIEFTIG4gRlJPTSAiIC4uIHRibCkKICAgIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IoInF1YWxpdHk6ICIgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgICBsb2NhbCBuID0gdG9udW1iZXIocm93c1sxXS5uKSBvciAwCiAgICBpZiBuID4gKGNoZWNrLm1heCBvciAwKSB0aGVuIGVycm9yKCJxdWFsaXR5WyIgLi4gdGJsIC4uICJdOiByb3djb3VudF9tYXggZmFpbGVkOiAiIC4uIG4gLi4gIiA+ICIgLi4gdG9zdHJpbmcoY2hlY2subWF4KSwgMCkgZW5kCiAgZWxzZWlmIHQgPT0gInNjaGVtYSIgdGhlbgogICAgLS0gY2hlY2suY29scyA9IHsgImlkIiwgIm5hbWUiIH0g4oCU4oCUIOihqOW/hemhu+WMheWQq+i/meS6m+WIlwogICAgbG9jYWwgcm93cywgZXJyID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIGNvbHVtbl9uYW1lIEZST00gaW5mb3JtYXRpb25fc2NoZW1hLmNvbHVtbnMgV0hFUkUgdGFibGVfbmFtZSA9ICciIC4uIHRibCAuLiAiJyIpCiAgICBpZiBub3Qgcm93cyB0aGVuIGVycm9yKCJxdWFsaXR5OiAiIC4uIHRvc3RyaW5nKGVyciksIDApIGVuZAogICAgbG9jYWwgaGF2ZSA9IHt9CiAgICBmb3IgXywgciBpbiBpcGFpcnMocm93cykgZG8gaGF2ZVtyLmNvbHVtbl9uYW1lXSA9IHRydWUgZW5kCiAgICBmb3IgXywgY29sIGluIGlwYWlycyhjaGVjay5jb2xzIG9yIHt9KSBkbwogICAgICBpZiBub3QgaGF2ZVtjb2xdIHRoZW4gZXJyb3IoInF1YWxpdHlbIiAuLiB0YmwgLi4gIl06IHNjaGVtYSBmYWlsZWQ6IG1pc3NpbmcgY29sdW1uICIgLi4gdG9zdHJpbmcoY29sKSwgMCkgZW5kCiAgICBlbmQKICBlbHNlCiAgICBlcnJvcigicXVhbGl0eTogdW5rbm93biBjaGVjayB0eXBlICIgLi4gdG9zdHJpbmcodCksIDApCiAgZW5kCmVuZAoKLS0g5ouT5omR5o6S5bqP77yIS2Fobu+8ie+8mui/lOWbnuiKgueCueaJp+ihjOmhuuW6j++8jOacieeOr+aKm+mUmQpsb2NhbCBmdW5jdGlvbiB0b3BvX3NvcnQobm9kZXMpCiAgbG9jYWwgYnlfaWQgPSB7fQogIGZvciBfLCBuIGluIGlwYWlycyhub2RlcykgZG8gYnlfaWRbbi5pZF0gPSBuIGVuZAogIGxvY2FsIGluZGVnID0ge30KICBsb2NhbCBhZGogPSB7fQogIGZvciBfLCBuIGluIGlwYWlycyhub2RlcykgZG8KICAgIGluZGVnW24uaWRdID0gMAogICAgYWRqW24uaWRdID0ge30KICBlbmQKICBmb3IgXywgbiBpbiBpcGFpcnMobm9kZXMpIGRvCiAgICBmb3IgXywgZCBpbiBpcGFpcnMobi5kZXBzIG9yIHt9KSBkbwogICAgICBpZiBub3QgYnlfaWRbZF0gdGhlbiBlcnJvcigicGlwZWxpbmU6IGRlcCAnIiAuLiBkIC4uICInIG5vdCBmb3VuZCAobm9kZSAiIC4uIG4uaWQgLi4gIikiLCAwKSBlbmQKICAgICAgaW5kZWdbbi5pZF0gPSBpbmRlZ1tuLmlkXSArIDEKICAgICAgYWRqW2RdWyNhZGpbZF0gKyAxXSA9IG4uaWQKICAgIGVuZAogIGVuZAogIGxvY2FsIHF1ZXVlLCBvcmRlciA9IHt9LCB7fQogIGZvciBfLCBuIGluIGlwYWlycyhub2RlcykgZG8KICAgIGlmIGluZGVnW24uaWRdID09IDAgdGhlbiBxdWV1ZVsjcXVldWUgKyAxXSA9IG4uaWQgZW5kCiAgZW5kCiAgd2hpbGUgI3F1ZXVlID4gMCBkbwogICAgbG9jYWwgaWQgPSB0YWJsZS5yZW1vdmUocXVldWUsIDEpCiAgICBvcmRlclsjb3JkZXIgKyAxXSA9IGlkCiAgICBmb3IgXywgbSBpbiBpcGFpcnMoYWRqW2lkXSkgZG8KICAgICAgaW5kZWdbbV0gPSBpbmRlZ1ttXSAtIDEKICAgICAgaWYgaW5kZWdbbV0gPT0gMCB0aGVuIHF1ZXVlWyNxdWV1ZSArIDFdID0gbSBlbmQKICAgIGVuZAogIGVuZAogIGlmICNvcmRlciB+PSAjbm9kZXMgdGhlbiBlcnJvcigicGlwZWxpbmU6IGN5Y2xpYyBkZXBlbmRlbmN5IGRldGVjdGVkIiwgMCkgZW5kCiAgcmV0dXJuIG9yZGVyCmVuZAoKLS0g57yW6K+RIFBpcGVsaW5l77ya5qCh6aqM57uT5p6EICsg5ouT5omR5o6S5bqP77yM6L+U5Zue5Y+v5omn6KGM6Zet5YyFCmZ1bmN0aW9uIGV0bC5jb21waWxlKHApCiAgaWYgdHlwZShwKSB+PSAidGFibGUiIG9yIG5vdCBwLm5vZGVzIG9yICNwLm5vZGVzID09IDAgdGhlbgogICAgZXJyb3IoInBpcGVsaW5lOiBleHBlY3RlZCB7IG5hbWU9Li4uLCBub2Rlcz17Li4ufSB9IiwgMCkKICBlbmQKICBsb2NhbCBvcmRlciA9IHRvcG9fc29ydChwLm5vZGVzKQogIGxvY2FsIGJ5X2lkID0ge30KICBmb3IgXywgbiBpbiBpcGFpcnMocC5ub2RlcykgZG8gYnlfaWRbbi5pZF0gPSBuIGVuZAogIC0tIOagoemqjO+8mnJvdXRlIOiKgueCueW/hemhu+aciSBkZXBzCiAgZm9yIF8sIG4gaW4gaXBhaXJzKHAubm9kZXMpIGRvCiAgICBpZiBuLnJvdXRlIGFuZCAobm90IG4uZGVwcyBvciAjbi5kZXBzID09IDApIHRoZW4KICAgICAgZXJyb3IoInBpcGVsaW5lOiBub2RlICciIC4uIG4uaWQgLi4gIicgaGFzIHJvdXRlIGJ1dCBubyBkZXBzIiwgMCkKICAgIGVuZAogICAgaWYgbi5vbl9lcnJvciBhbmQgbm90IGJ5X2lkW24ub25fZXJyb3JdIHRoZW4KICAgICAgZXJyb3IoInBpcGVsaW5lOiBub2RlICciIC4uIG4uaWQgLi4gIicgb25fZXJyb3IgdGFyZ2V0ICciIC4uIG4ub25fZXJyb3IgLi4gIicgbm90IGZvdW5kIiwgMCkKICAgIGVuZAogIGVuZAogIGxvY2FsIGNvbXBpbGVkID0geyBuYW1lID0gcC5uYW1lIG9yICJ1bm5hbWVkIiwgb3JkZXIgPSBvcmRlciwgbm9kZXMgPSBieV9pZCB9CiAgcmV0dXJuIGNvbXBpbGVkCmVuZAoKLS0g5omn6KGM5Y2V5Liq6IqC54K577yIcGlwZWxpbmUg5YaF6YOo5L2/55So77yJCi0tIOi/lOWbnuW9seWTjeihjOaVsO+8iOaIliBuaWzvvIkKZnVuY3Rpb24gZXRsLnJ1bl9ub2RlKG4sIHJlc3VsdHMpCiAgbG9jYWwgdHlwID0gbi50eXBlCiAgaWYgdHlwID09ICJzb3VyY2UiIG9yIHR5cCA9PSAidHJhbnNmb3JtIiB0aGVuCiAgICAtLSBDUkVBVEUgT1IgUkVQTEFDRSBURU1QIFRBQkxFIDxpZD4gQVMgPHF1ZXJ5PgogICAgbG9jYWwgc3FsID0gIkNSRUFURSBPUiBSRVBMQUNFIFRFTVAgVEFCTEUgIiAuLiBuLmlkIC4uICIgQVMgIiAuLiBuLnF1ZXJ5CiAgICBsb2NhbCByID0gX2R1Y2tkYl9jYWxsKHNxbCkKICAgIGlmIHR5cGUocikgPT0gInN0cmluZyIgYW5kIHI6bWF0Y2goIl5lcnJvcjoiKSB0aGVuIGVycm9yKHI6c3ViKDcpLCAwKSBlbmQKICAgIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgbiBGUk9NICIgLi4gbi5pZCkKICAgIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IodG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgICByZXR1cm4gdG9udW1iZXIocm93c1sxXS5uKSBvciAwCiAgZWxzZWlmIHR5cCA9PSAidHJhbnNmb3JtX2x1YSIgdGhlbgogICAgLS0g6K+75LiK5ri46KGo77yIbi5zb3VyY2Ug5oiW56ys5LiA5LiqIGRlcO+8ieKGkiBMdWEg6Zet5YyF6YCQ6KGM5aSE55CGIOKGkiDlhpnlm54KICAgIGxvY2FsIHNyYyA9IG4uc291cmNlIG9yIChuLmRlcHMgYW5kIG4uZGVwc1sxXSkgb3IgZXJyb3IoInRyYW5zZm9ybV9sdWE6IG5vIHNvdXJjZSIsIDApCiAgICBsb2NhbCBkYXRhLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgKiBGUk9NICIgLi4gc3JjKQogICAgaWYgbm90IGRhdGEgdGhlbiBlcnJvcih0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIGxvY2FsIG91dCA9IHt9CiAgICBmb3IgXywgcm93IGluIGlwYWlycyhkYXRhKSBkbwogICAgICBsb2NhbCByID0gbi5mbihyb3cpCiAgICAgIGlmIHIgfj0gbmlsIHRoZW4gb3V0WyNvdXQgKyAxXSA9IHIgZW5kCiAgICBlbmQKICAgIC0tIOW7uuS4tOaXtuihqOW5tuWGmeWFpQogICAgbG9jYWwgY29scyA9IHt9CiAgICBmb3IgaywgdiBpbiBwYWlycyhvdXRbMV0gb3Ige30pIGRvCiAgICAgIGxvY2FsIHZ0ID0gKHR5cGUodikgPT0gIm51bWJlciIpIGFuZCAiQklHSU5UIiBvciAiVkFSQ0hBUiIKICAgICAgY29sc1sjY29scyArIDFdID0gayAuLiAiICIgLi4gdnQKICAgIGVuZAogICAgaWYgI2NvbHMgPT0gMCB0aGVuIGVycm9yKCJ0cmFuc2Zvcm1fbHVhOiBlbXB0eSBvdXRwdXQiLCAwKSBlbmQKICAgIF9kdWNrZGJfY2FsbCgiQ1JFQVRFIE9SIFJFUExBQ0UgVEVNUCBUQUJMRSAiIC4uIG4uaWQgLi4gIiAoIiAuLiB0YWJsZS5jb25jYXQoY29scywgIiwgIikgLi4gIikiKQogICAgZm9yIF8sIHJvdyBpbiBpcGFpcnMob3V0KSBkbwogICAgICBsb2NhbCB2YWxzID0ge30KICAgICAgZm9yIGsgaW4gcGFpcnMob3V0WzFdKSBkbwogICAgICAgIGxvY2FsIHYgPSByb3dba10KICAgICAgICBpZiB0eXBlKHYpID09ICJzdHJpbmciIHRoZW4gdmFsc1sjdmFscyArIDFdID0gZXNjKHYpCiAgICAgICAgZWxzZWlmIHYgPT0gbmlsIHRoZW4gdmFsc1sjdmFscyArIDFdID0gIk5VTEwiCiAgICAgICAgZWxzZSB2YWxzWyN2YWxzICsgMV0gPSB0b3N0cmluZyh2KSBlbmQKICAgICAgZW5kCiAgICAgIF9kdWNrZGJfY2FsbCgiSU5TRVJUIElOVE8gIiAuLiBuLmlkIC4uICIgVkFMVUVTICgiIC4uIHRhYmxlLmNvbmNhdCh2YWxzLCAiLCAiKSAuLiAiKSIpCiAgICBlbmQKICAgIHJldHVybiAjb3V0CiAgZWxzZWlmIHR5cCA9PSAicXVhbGl0eSIgdGhlbgogICAgbG9jYWwgc3JjID0gbi5zb3VyY2Ugb3IgKG4uZGVwcyBhbmQgbi5kZXBzWzFdKSBvciBlcnJvcigicXVhbGl0eTogbm8gc291cmNlIiwgMCkKICAgIGZvciBfLCBjaGsgaW4gaXBhaXJzKG4uY2hlY2tzIG9yIHt9KSBkbwogICAgICBydW5fY2hlY2soc3JjLCBjaGspCiAgICBlbmQKICAgIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgbiBGUk9NICIgLi4gc3JjKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcih0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIHJldHVybiB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICBlbHNlaWYgdHlwID09ICJzaW5rIiB0aGVuCiAgICBsb2NhbCBzcmMgPSBuLnNvdXJjZSBvciAobi5kZXBzIGFuZCBuLmRlcHNbMV0pIG9yIGVycm9yKCJzaW5rOiBubyBzb3VyY2UiLCAwKQogICAgbG9jYWwgdGJsID0gbi50YWJsZSBvciBuLmlkCiAgICBsb2NhbCByID0gX2R1Y2tkYl9jYWxsKCJDUkVBVEUgT1IgUkVQTEFDRSBUQUJMRSAiIC4uIHRibCAuLiAiIEFTIFNFTEVDVCAqIEZST00gIiAuLiBzcmMpCiAgICBpZiB0eXBlKHIpID09ICJzdHJpbmciIGFuZCByOm1hdGNoKCJeZXJyb3I6IikgdGhlbiBlcnJvcihyOnN1Yig3KSwgMCkgZW5kCiAgICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgQ0FTVChjb3VudCgqKSBBUyBCSUdJTlQpIEFTIG4gRlJPTSAiIC4uIHRibCkKICAgIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IodG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgICByZXR1cm4gdG9udW1iZXIocm93c1sxXS5uKSBvciAwCiAgZWxzZWlmIHR5cCA9PSAiaWZfbm9kZSIgdGhlbgogICAgLS0g6K+E5Lyw5p2h5Lu277yaY29uZGl0aW9uKHJlc3VsdHMpIOKGkiBib29sZWFuCiAgICBsb2NhbCBjb25kID0gbi5jb25kaXRpb24KICAgIGlmIHR5cGUoY29uZCkgfj0gImZ1bmN0aW9uIiB0aGVuIGVycm9yKCJpZl9ub2RlOiBleHBlY3RlZCBjb25kaXRpb24gZnVuY3Rpb24iLCAwKSBlbmQKICAgIGxvY2FsIG9rLCB2YWwgPSBwY2FsbChjb25kLCByZXN1bHRzKQogICAgaWYgbm90IG9rIHRoZW4gZXJyb3IoImlmX25vZGU6IGNvbmRpdGlvbiBmYWlsZWQ6ICIgLi4gdG9zdHJpbmcodmFsKSwgMCkgZW5kCiAgICBsb2NhbCByb3V0ZSA9IHZhbCBhbmQgInRydWUiIG9yICJmYWxzZSIKICAgIHJlc3VsdHNbIl9yb3V0ZV8iIC4uIG4uaWRdID0gcm91dGUKICAgIHJldHVybiBuaWwgIC0tIGlmX25vZGUg5LiN5Lqn55Sf5pWw5o2u6KGMCiAgZWxzZWlmIHR5cCA9PSAic3dpdGNoX25vZGUiIHRoZW4KICAgIC0tIOivhOS8sOmAieaLqeWZqO+8mnNlbGVjdG9yKHJlc3VsdHMpIOKGkiBzdHJpbmcKICAgIGxvY2FsIHNlbCA9IG4uc2VsZWN0b3IKICAgIGlmIHR5cGUoc2VsKSB+PSAiZnVuY3Rpb24iIHRoZW4gZXJyb3IoInN3aXRjaF9ub2RlOiBleHBlY3RlZCBzZWxlY3RvciBmdW5jdGlvbiIsIDApIGVuZAogICAgbG9jYWwgb2ssIHZhbCA9IHBjYWxsKHNlbCwgcmVzdWx0cykKICAgIGlmIG5vdCBvayB0aGVuIGVycm9yKCJzd2l0Y2hfbm9kZTogc2VsZWN0b3IgZmFpbGVkOiAiIC4uIHRvc3RyaW5nKHZhbCksIDApIGVuZAogICAgbG9jYWwgcm91dGUgPSB0b3N0cmluZyh2YWwpCiAgICByZXN1bHRzWyJfcm91dGVfIiAuLiBuLmlkXSA9IHJvdXRlCiAgICByZXR1cm4gbmlsICAtLSBzd2l0Y2hfbm9kZSDkuI3kuqfnlJ/mlbDmja7ooYwKICBlbHNlCiAgICBlcnJvcigicGlwZWxpbmU6IHVua25vd24gbm9kZSB0eXBlICIgLi4gdG9zdHJpbmcodHlwKSwgMCkKICBlbmQKZW5kCgotLSDmiafooYwgUGlwZWxpbmXvvIjlhYggY29tcGlsZSDlho3pgJDoioLngrnmiafooYzvvIkKLS0g6L+U5ZueIHsgbm9kZV9yZXN1bHRzID0geyBpZCA9IHJvd3MsIC4uLiB9IH3vvIzlpLHotKXoioLngrnmoIforrAgImZhaWxlZDo8ZXJyPiIKZnVuY3Rpb24gZXRsLnBpcGVsaW5lKHApCiAgbG9jYWwgYyA9IGV0bC5jb21waWxlKHApCiAgbG9jYWwgcmVzdWx0cyA9IHt9CiAgZm9yIF8sIGlkIGluIGlwYWlycyhjLm9yZGVyKSBkbwogICAgbG9jYWwgbiA9IGMubm9kZXNbaWRdCgogICAgLS0g6Lev55Sx5qOA5p+l77ya5LiL5ri46IqC54K55pyJIHJvdXRlIOWtl+aute+8jOajgOafpeS+nei1lueahCBpZl9ub2RlL3N3aXRjaF9ub2RlIOe7k+aenOaYr+WQpuWMuemFjQogICAgaWYgbi5yb3V0ZSB0aGVuCiAgICAgIGxvY2FsIGRlcCA9IG4uZGVwcyBhbmQgbi5kZXBzWzFdCiAgICAgIGxvY2FsIHJvdXRlX2tleSA9ICJfcm91dGVfIiAuLiAoZGVwIG9yICIiKQogICAgICBpZiByZXN1bHRzW3JvdXRlX2tleV0gfj0gbi5yb3V0ZSB0aGVuCiAgICAgICAgLS0g6Lev55Sx5LiN5Yy56YWN77yM6Lez6L+H5q2k6IqC54K5CiAgICAgICAgcmVzdWx0c1tuLmlkXSA9ICJza2lwcGVkIgogICAgICAgIGdvdG8gY29udGludWUKICAgICAgZW5kCiAgICBlbmQKCiAgICAtLSDph43or5Xlvqrnjq8KICAgIGxvY2FsIG1heF9yZXRyaWVzID0gKG4ucmV0cnkgYW5kIHR5cGUobi5yZXRyeSkgPT0gInRhYmxlIiBhbmQgbi5yZXRyeS5tYXgpIG9yIDAKICAgIGxvY2FsIGJhY2tvZmYgPSAobi5yZXRyeSBhbmQgdHlwZShuLnJldHJ5KSA9PSAidGFibGUiIGFuZCBuLnJldHJ5LmJhY2tvZmYpIG9yIDEuMAogICAgbG9jYWwgdGltZW91dCA9IG4udGltZW91dCBvciAwCiAgICBsb2NhbCB0X3N0YXJ0ID0gb3MuY2xvY2soKQogICAgbG9jYWwgb2ssIHJlcyA9IGZhbHNlLCBuaWwKICAgIGxvY2FsIGxhc3RfZHQgPSAwCgogICAgZm9yIGF0dGVtcHQgPSAwLCBtYXhfcmV0cmllcyBkbwogICAgICAtLSDotoXml7bmo4Dmn6XvvIjljIXmi6zph43or5XmgLvml7bpl7TvvIkKICAgICAgaWYgdGltZW91dCA+IDAgdGhlbgogICAgICAgIGxvY2FsIGVsYXBzZWQgPSBvcy5jbG9jaygpIC0gdF9zdGFydAogICAgICAgIGlmIGVsYXBzZWQgPj0gdGltZW91dCB0aGVuCiAgICAgICAgICByZXMgPSAidGltZW91dCBhZnRlciAiIC4uIHRvc3RyaW5nKG1hdGguZmxvb3IoZWxhcHNlZCkpIC4uICJzIChtYXggIiAuLiB0b3N0cmluZyh0aW1lb3V0KSAuLiAicykiCiAgICAgICAgICBicmVhawogICAgICAgIGVuZAogICAgICBlbmQKCiAgICAgIGxvY2FsIHQwID0gb3MuY2xvY2soKQogICAgICBvaywgcmVzID0gcGNhbGwoZnVuY3Rpb24oKSByZXR1cm4gZXRsLnJ1bl9ub2RlKG4sIHJlc3VsdHMpIGVuZCkKICAgICAgbGFzdF9kdCA9IG1hdGguZmxvb3IoKG9zLmNsb2NrKCkgLSB0MCkgKiAxMDAwKQoKICAgICAgaWYgb2sgdGhlbgogICAgICAgIGJyZWFrCiAgICAgIGVuZAoKICAgICAgLS0g5aSx6LSl5LiU5pyJ6YeN6K+V5qyh5pWw77ya6YCA6YG/562J5b6F5ZCO6YeN6K+VCiAgICAgIGlmIGF0dGVtcHQgPCBtYXhfcmV0cmllcyB0aGVuCiAgICAgICAgbG9jYWwgc2xlZXBfcyA9IGJhY2tvZmYgKiAoMiBeIGF0dGVtcHQpCiAgICAgICAgYnVzeV9zbGVlcChzbGVlcF9zKQogICAgICBlbmQKICAgIGVuZAoKICAgIGlmIG9rIHRoZW4KICAgICAgZXRsLmxvZygwLCAibm9kZToiIC4uIG4uaWQsICd7InR5cGUiOiInIC4uIHRvc3RyaW5nKG4udHlwZSkgLi4gJyJ9JywgbGFzdF9kdCwgcmVzIG9yIDAsIHRydWUsIG5pbCkKICAgICAgcmVzdWx0c1tuLmlkXSA9IHJlcwogICAgZWxzZQogICAgICBsb2NhbCB0b3RhbF9kdCA9IG1hdGguZmxvb3IoKG9zLmNsb2NrKCkgLSB0X3N0YXJ0KSAqIDEwMDApCiAgICAgIGV0bC5sb2coMCwgIm5vZGU6IiAuLiBuLmlkLCAneyJ0eXBlIjoiJyAuLiB0b3N0cmluZyhuLnR5cGUpIC4uICcifScsIHRvdGFsX2R0LCAwLCBmYWxzZSwgdG9zdHJpbmcocmVzKSkKCiAgICAgIGlmIG4ub25fZXJyb3IgdGhlbgogICAgICAgIC0tIOaciemUmeivr+aBouWkje+8muagh+iusOWksei0pe+8jOe7p+e7reeuoemBkwogICAgICAgIHJlc3VsdHNbbi5pZF0gPSAiZmFpbGVkOiIgLi4gdG9zdHJpbmcocmVzKQogICAgICAgIHJlc3VsdHNbIl9lcnJfIiAuLiBuLmlkXSA9IHRvc3RyaW5nKHJlcykKICAgICAgZWxzZQogICAgICAgIGVycm9yKCJwaXBlbGluZVsiIC4uIHRvc3RyaW5nKGMubmFtZSkgLi4gIl0gbm9kZSAnIiAuLiBuLmlkIC4uICInIGZhaWxlZDogIiAuLiB0b3N0cmluZyhyZXMpLCAwKQogICAgICBlbmQKICAgIGVuZAogICAgOjpjb250aW51ZTo6CiAgZW5kCiAgcmV0dXJuIHJlc3VsdHMKZW5kCgpyZXR1cm4gZXRsAHVuZXhwZWN0ZWQgc3ltYm9sAHhwY2FsbABfX2NhbGwAdW50aWwAdGFibGUgaW5kZXggaXMgbmlsAGNlaWwAX19zaGwAcmF3ZXF1YWwAaW5jcmVtZW50YWwAZ2VuZXJhdGlvbmFsAGxvY2FsAGdsb2JhbABTbABob29rAG5vdCBhIGJpbmFyeSBjaHVuawBjb3JydXB0ZWQgY2h1bmsAdHJ1bmNhdGVkIGNodW5rAG5vdCBlbm91Z2ggc3RhY2sAdG9vIG1hbnkgcmVzdWx0cyB0byB1bnBhY2sAYnJlYWsAcGkAbWF0aABmbG9hdCBmb3JtYXQgbWlzbWF0Y2gAaW50ZWdlciBmb3JtYXQgbWlzbWF0Y2gAdmVyc2lvbiBtaXNtYXRjaAAlcyBzaXplIG1pc21hdGNoAGdtYXRjaABsb2cAbGV4aWNhbCBlbGVtZW50IHRvbyBsb25nAGNvbnRyb2wgc3RydWN0dXJlIHRvbyBsb25nAHN0cmluZyBzbGljZSB0b28gbG9uZwBpbnZhbGlkIG9yZGVyIGZ1bmN0aW9uIGZvciBzb3J0aW5nAF9fdG9zdHJpbmcAYmluYXJ5IHN0cmluZwBpbnZhbGlkIHVzZSBvZiAnJWMnIGluIHJlcGxhY2VtZW50IHN0cmluZwBiYWQgZm9ybWF0IGZvciBjb25zdGFudCBzdHJpbmcAdGFibGUgb3Igc3RyaW5nAGluaXRpYWwgcG9zaXRpb24gb3V0IG9mIHN0cmluZwB1bmZpbmlzaGVkIHN0cmluZwBlcnJvciBvYmplY3QgaXMgbm90IGEgc3RyaW5nAHJlYWRlciBmdW5jdGlvbiBtdXN0IHJldHVybiBhIHN0cmluZwAnX190b3N0cmluZycgbXVzdCByZXR1cm4gYSBzdHJpbmcAaXNydW5uaW5nAGVycm9yIGluIGVycm9yIGhhbmRsaW5nAGFycmF5IHRvbyBiaWcAbWVtb3J5IGFsbG9jYXRpb24gZXJyb3I6IGJsb2NrIHRvbyBiaWcAZGVnACUuMTRnAGdldCBsZW5ndGggb2YAaW5mAHNlbGYAZWxzZWlmAG9mZgBtb2RmAHZlcnNpb24gbWlzbWF0Y2g6IGFwcC4gbmVlZHMgJWYsIEx1YSBjb3JlIHByb3ZpZGVzICVmAHBhY2tzaXplAHN0cmluZyBsZW5ndGggZG9lcyBub3QgZml0IGluIGdpdmVuIHNpemUAc3RyaW5nIGxvbmdlciB0aGFuIGdpdmVuIHNpemUAcmVtb3ZlAHRvbyBtYW55IGVsZW1lbnRzIHRvIG1vdmUAdHJ1ZQB1cHZhbHVlAG5vIHZhbHVlAGluaXRpYWwgdmFsdWUAdmFyaWFibGUgJyVzJyBnb3QgYSBub24tY2xvc2FibGUgdmFsdWUAaW5pdGlhbCBwb3NpdGlvbiBpcyBhIGNvbnRpbnVhdGlvbiBieXRlAGNvbmNhdGVuYXRlAHNldHBhdXNlAHJldmVyc2UAX19jbG9zZQBlbHNlAGZhbHNlAGludmFsaWQgcGF0dGVybiBjYXB0dXJlAHVuZmluaXNoZWQgY2FwdHVyZQB0eXBlAF9fbmFtZQB3aGlsZQBkb2ZpbGUAbG9hZGZpbGUAc2V0bWV0YXRhYmxlAGdldG1ldGF0YWJsZQBfX21ldGF0YWJsZQBjYW5ub3QgY2hhbmdlIGEgcHJvdGVjdGVkIG1ldGF0YWJsZQBzdHJpbmcvZnVuY3Rpb24vdGFibGUAbmlsIG9yIHRhYmxlAF9fbGUAaHVnZQBmb3JtYXQgcmVzdWx0IHRvbyBsYXJnZQBidWZmZXIgdG9vIGxhcmdlAHJlc3VsdGluZyBzdHJpbmcgdG9vIGxhcmdlAFVURi04IHZhbHVlIHRvbyBsYXJnZQBkZWNpbWFsIGVzY2FwZSB0b28gbGFyZ2UAaW5kZXggb3V0IG9mIHJhbmdlAHZhbHVlIG91dCBvZiByYW5nZQBiYXNlIG91dCBvZiByYW5nZQBjb2xsZWN0Z2FyYmFnZQBfX21vZGUAaW52YWxpZCBVVEYtOCBjb2RlAGludmFsaWQgZXNjYXBlIHNlcXVlbmNlAHRvX2xhbmNlAEVlAGRlbW9fZTJlAGZtb2QAX19tb2QAbWV0YW1ldGhvZABkZXN0aW5hdGlvbiB3cmFwIGFyb3VuZABmaW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBtPV9saWJzLmluY3JlbWVudGFsOyBsb2NhbCBwPXt0YXJnZXQ9J2RlbW9fd20nLHNvdXJjZT0nZGVtb193bV9zcmMnLG1vZGU9J3RzJyx0c19jb2w9J3RzJyxpZF9jb2w9J2lkJ307IGxvY2FsIG9rLHJlcz1wY2FsbChtLnJ1bixwKTsgaWYgbm90IG9rIHRoZW4gcmV0dXJuICdFUlIgJy4udG9zdHJpbmcocmVzKSBlbmQ7IHJldHVybiAnb2s6ICcuLnRvc3RyaW5nKHJlcykgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBtPV9saWJzLnRvX2xhbmNlOyBsb2NhbCBwPXt0YXJnZXQ9J2RlbW9fbGFuY2UnLHNvdXJjZT0nZGVtb19sYW5jZV9zcmMnLHRzX2NvbD0ndHMnLGlkX2NvbD0naWQnfTsgbG9jYWwgb2sscmVzPXBjYWxsKG0ucnVuLHApOyBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ0VSUiAnLi50b3N0cmluZyhyZXMpIGVuZDsgcmV0dXJuICdvazogJy4udG9zdHJpbmcocmVzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnNbJ3NjZDInXTsgaWYgdHlwZShmKX49J3RhYmxlJyBvciBub3QgZi5ydW4gdGhlbiByZXR1cm4gJ3NjZDIgc2hhcGU6ICcuLnRvc3RyaW5nKHR5cGUoZikpIGVuZDsgbG9jYWwgcD17dGFyZ2V0PSdkZW1vX3NjZDInLHNvdXJjZT0nZGVtb19zY2QyX3NyYycsa2V5X2NvbD0naWQnLHRzX2NvbD0ndHMnLGF0dHJfY29scz17J25hbWUnLCd0aWVyJ319OyBsb2NhbCBvayxyZXM9cGNhbGwoZi5ydW4scCk7IGlmIG5vdCBvayB0aGVuIHJldHVybiAnRVJSICcuLnRvc3RyaW5nKHJlcykgZW5kOyByZXR1cm4gJ29rOiAnLi50b3N0cmluZyhyZXMpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5leHBvcnQ7IGxvY2FsIHA9e3RibD0nZGVtb19leHBvcnRfc3JjJyxmaWxlPSdtZW06Ly9kZW1vX2V4cG9ydC5jc3YnLGZvcm1hdD0nY3N2J307IGxvY2FsIG9rLHJlcz1wY2FsbChmLHApOyBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ0VSUiAnLi50b3N0cmluZyhyZXMpIGVuZDsgcmV0dXJuICdvazogJy4udG9zdHJpbmcocmVzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuZGVtb19lMmU7IGxvY2FsIG9rLHJlcz1wY2FsbChmLHt9KTsgaWYgbm90IG9rIHRoZW4gcmV0dXJuICdFUlIgJy4udG9zdHJpbmcocmVzKSBlbmQ7IHJldHVybiB0b3N0cmluZyhyZXMpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgZj1fbGlicy5yYmFjOyBpZiB0eXBlKGYpfj0nZnVuY3Rpb24nIHRoZW4gcmV0dXJuICdyYmFjIHNoYXBlOiAnLi50b3N0cmluZyh0eXBlKGYpKSBlbmQ7IGxvY2FsIG9rMSwgcjEgPSBwY2FsbChmLCB7b3A9J3NldHVwJ30pOyBsb2NhbCBvazIsIHIyID0gcGNhbGwoZiwge29wPSdzdGF0dXMnfSk7IGxvY2FsIG9rMywgcjMgPSBwY2FsbChmLCB7b3A9J2F1dGh6Jywgc2lkPSdzMScsIHE9J1NFTEVDVCAqIEZST00gcHVibGljX2RhdGEnfSk7IHJldHVybiAnc2V0dXA9Jy4udG9zdHJpbmcocjEpLi4nIHwgc3RhdHVzPScuLnRvc3RyaW5nKHIyKS4uJyB8IGF1dGh6KHJlYWQgcHVibGljX2RhdGEsIG5vIHNlc3Npb24pPScuLnRvc3RyaW5nKHIzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIG09X2xpYnMuZXRsOyBpZiB0eXBlKG0pfj0ndGFibGUnIG9yIG5vdCBtLnJ1biB0aGVuIHJldHVybiAnZXRsIG1vZHVsZSBzaGFwZTogJy4udG9zdHJpbmcodHlwZShtKSkgZW5kOyAgIC0tIOa8lOekuiBldGwucnVuIOWuoeiuoeWMheijhe+8mui3keS4gOS4quS8muaIkOWKn+eahCBmbiArIOS4gOS4quS8muWksei0peiiq+mHjeivleaNleiOt+eahCBmbgogIGxvY2FsIG9rMSxyZXMxPXBjYWxsKG0ucnVuLCdkZW1vX29rJywneyJ4IjoxfScsZnVuY3Rpb24oKSByZXR1cm4gezEsMiwzfSBlbmQpCiAgbG9jYWwgb2syLHJlczI9cGNhbGwobS5ydW4sJ2RlbW9fZmFpbCcsJ3t9JyxmdW5jdGlvbigpIGVycm9yKCdpbnRlbnRpb25hbCBmYWlsJykgZW5kKQogIHJldHVybiAncnVuX29rPScuLnRvc3RyaW5nKG9rMSkuLicocm93cz0nLi4ob2sxIGFuZCAjcmVzMSBvciAnLScpLi4nKSBydW5fZmFpbF9jYXVnaHQ9Jy4udG9zdHJpbmcobm90IG9rMikgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBqPV9saWJzLmpzb247IHJldHVybiAnanNvbiBsaWIgbG9hZGVkOiAnIC4uIHRvc3RyaW5nKHR5cGUoai5lbmNvZGUpKSBlbmQALS0gZXRsLnBpcGVsaW5lIEUyRSDmvJTnpLrvvIgyMDI2LTA4LTIw77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHBvYwotLSDnlKjms5XvvJrnvJbor5HlkI7pgJrov4cgbHVhaml0X3Mg6LCD55SoCi0tIOa8lOekuiBQaXBlbGluZSDlvJXmk44gdjIg5YWo6YOo6IO95Yqb77yaCi0tICAgc291cmNlIC8gdHJhbnNmb3JtIC8gcXVhbGl0eSAvIGlmX25vZGUgLyBzd2l0Y2hfbm9kZSAvIHNpbmsKLS0gICDmnaHku7bot6/nlLEgLyDph43or5UgLyDotoXml7YgLyDplJnor6/mgaLlpI0gLyDlrqHorqEKCnJldHVybiBmdW5jdGlvbihub29wKQogIC0tID09PT09PT09PT09PSAxLiDlh4blpIfmlbDmja4gPT09PT09PT09PT09CiAgX2R1Y2tkYl9jYWxsKCJDUkVBVEUgT1IgUkVQTEFDRSBUQUJMRSBkZW1vX29yZGVycyBBUyBTRUxFQ1QgKiBGUk9NIChWQUxVRVMiIC4uCiAgICAiKDEsICdBbGljZScsICAgMjUwLjAsICdjb21wbGV0ZWQnKSwiIC4uCiAgICAiKDIsICdCb2InLCAgICAgMTUwLjAsICdjb21wbGV0ZWQnKSwiIC4uCiAgICAiKDMsICdDaGFybGllJywgIDgwLjAsICdwZW5kaW5nJyksIiAuLgogICAgIig0LCAnRGlhbmEnLCAgIDUwMC4wLCAnY29tcGxldGVkJyksIiAuLgogICAgIig1LCAnRXZlJywgICAgICAzMC4wLCAnY2FuY2VsbGVkJykpIEFTIHQoaWQsIG5hbWUsIGFtb3VudCwgc3RhdHVzKSIpCgogIF9kdWNrZGJfY2FsbCgiQ1JFQVRFIE9SIFJFUExBQ0UgVEFCTEUgZGVtb19jdXN0b21lcnMgQVMgU0VMRUNUICogRlJPTSAoVkFMVUVTIiAuLgogICAgIigxLCAnQWxpY2UnLCAgICAnVklQJyksIiAuLgogICAgIigyLCAnQm9iJywgICAgICAnUmVndWxhcicpLCIgLi4KICAgICIoNCwgJ0RpYW5hJywgICAgJ1ZJUCcpLCIgLi4KICAgICIoNiwgJ0ZyYW5rJywgICAgJ05ldycpKSBBUyB0KGlkLCBuYW1lLCB0aWVyKSIpCgogIC0tID09PT09PT09PT09PSAyLiDlrprkuYkgUGlwZWxpbmUgPT09PT09PT09PT09CiAgbG9jYWwgcGlwZWxpbmUgPSB7CiAgICBuYW1lID0gIm9yZGVyc19ldGxfZGVtbyIsCiAgICBub2RlcyA9IHsKICAgICAgLS0g4pGgIOa6kOaVsOaNruWKoOi9vQogICAgICB7IGlkID0gInNyY19vcmRlcnMiLCAgICB0eXBlID0gInNvdXJjZSIsCiAgICAgICAgcXVlcnkgPSAiU0VMRUNUICogRlJPTSBkZW1vX29yZGVycyBXSEVSRSBzdGF0dXMgPSAnY29tcGxldGVkJyIgfSwKICAgICAgeyBpZCA9ICJzcmNfY3VzdG9tZXJzIiwgdHlwZSA9ICJzb3VyY2UiLAogICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCAqIEZST00gZGVtb19jdXN0b21lcnMiIH0sCgogICAgICAtLSDikaEg5pWw5o2u5riF5rSXCiAgICAgIHsgaWQgPSAiY2xlYW5fb3JkZXJzIiwgdHlwZSA9ICJ0cmFuc2Zvcm0iLAogICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCBpZCwgdXBwZXIobmFtZSkgQVMgbmFtZSwgYW1vdW50LCBzdGF0dXMgRlJPTSBzcmNfb3JkZXJzIFdIRVJFIGFtb3VudCA+IDAiLAogICAgICAgIGRlcHMgPSB7ICJzcmNfb3JkZXJzIiB9IH0sCgogICAgICAtLSDikaIg5pWw5o2u6LSo6YeP5qOA5p+lCiAgICAgIHsgaWQgPSAicXVhbGl0eV9jaGVjayIsIHR5cGUgPSAicXVhbGl0eSIsCiAgICAgICAgZGVwcyA9IHsgImNsZWFuX29yZGVycyIgfSwKICAgICAgICBjaGVja3MgPSB7CiAgICAgICAgICB7IHR5cGUgPSAibm90X251bGwiLCBjb2wgPSAiaWQiIH0sCiAgICAgICAgICB7IHR5cGUgPSAidW5pcXVlIiwgICBjb2wgPSAiaWQiIH0sCiAgICAgICAgICB7IHR5cGUgPSAicm93Y291bnRfbWluIiwgbWluID0gMSB9LAogICAgICAgIH0gfSwKCiAgICAgIC0tIOKRoyDmnaHku7bot6/nlLHvvJrmnInmlbDmja7miY3lpITnkIYKICAgICAgeyBpZCA9ICJoYXNfZGF0YSIsIHR5cGUgPSAiaWZfbm9kZSIsCiAgICAgICAgZGVwcyA9IHsgInF1YWxpdHlfY2hlY2siIH0sCiAgICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24ocmVzdWx0cykKICAgICAgICAgIC0tIGNsZWFuX29yZGVycyDmnInmlbDmja7vvIgzIOihjCBjb21wbGV0ZWQg6K6i5Y2V77yJCiAgICAgICAgICByZXR1cm4gKHJlc3VsdHMucXVhbGl0eV9jaGVjayBvciAwKSA+IDAKICAgICAgICBlbmQgfSwKCiAgICAgIC0tIOKRpCDpq5jku7flgLzorqLljZXvvIhyb3V0ZT10cnVlIOWIhuaUr++8iQogICAgICB7IGlkID0gImFnZ19oaWdoX3ZhbHVlIiwgdHlwZSA9ICJ0cmFuc2Zvcm0iLAogICAgICAgIGRlcHMgPSB7ICJoYXNfZGF0YSIgfSwgcm91dGUgPSAidHJ1ZSIsCiAgICAgICAgcXVlcnkgPSAiU0VMRUNUIG5hbWUsIHN1bShhbW91bnQpIEFTIHRvdGFsIEZST00gY2xlYW5fb3JkZXJzIFdIRVJFIGFtb3VudCA+PSAxMDAgR1JPVVAgQlkgbmFtZSBPUkRFUiBCWSB0b3RhbCBERVNDIiB9LAoKICAgICAgLS0g4pGlIOiQveihqO+8iHJvdXRlPXRydWUg5YiG5pSv77yJCiAgICAgIHsgaWQgPSAic2lua19oaWdoX3ZhbHVlIiwgdHlwZSA9ICJzaW5rIiwKICAgICAgICBkZXBzID0geyAiYWdnX2hpZ2hfdmFsdWUiIH0sIHRhYmxlID0gImRlbW9faGlnaF92YWx1ZSIgfSwKCiAgICAgIC0tIOKRpiDnqbrmlbDmja7ml6Xlv5fvvIhyb3V0ZT1mYWxzZSDliIbmlK/igJTigJTlm6DmnInmlbDmja7vvIzkuI3kvJrmiafooYzvvIkKICAgICAgeyBpZCA9ICJzaW5rX2VtcHR5X2xvZyIsIHR5cGUgPSAic2luayIsCiAgICAgICAgZGVwcyA9IHsgImhhc19kYXRhIiB9LCByb3V0ZSA9ICJmYWxzZSIsIHRhYmxlID0gImRlbW9fZW1wdHlfbG9nIiB9LAoKICAgICAgLS0g4pGnIOaYk+mUmeiKgueCuSArIOmUmeivr+aBouWkje+8iG9uX2Vycm9yICsgcmV0cnnvvIkKICAgICAgeyBpZCA9ICJyaXNreV9qb2luIiwgdHlwZSA9ICJ0cmFuc2Zvcm0iLAogICAgICAgIGRlcHMgPSB7ICJzcmNfY3VzdG9tZXJzIiB9LAogICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCBjLmlkLCBjLm5hbWUsIGMudGllciBGUk9NIHNyY19jdXN0b21lcnMgYyBKT0lOIG5vbmV4aXN0ZW50X3RhYmxlIG4gT04gYy5pZCA9IG4uaWQiLAogICAgICAgIG9uX2Vycm9yID0gImZhbGxiYWNrX2pvaW4iLAogICAgICAgIHJldHJ5ID0geyBtYXggPSAxLCBiYWNrb2ZmID0gMC4xIH0gfSwKCiAgICAgIHsgaWQgPSAiZmFsbGJhY2tfam9pbiIsIHR5cGUgPSAidHJhbnNmb3JtIiwKICAgICAgICBkZXBzID0geyAic3JjX2N1c3RvbWVycyIgfSwKICAgICAgICBxdWVyeSA9ICJTRUxFQ1QgaWQsIG5hbWUsIHRpZXIsICdmYWxsYmFjaycgQVMgbm90ZSBGUk9NIHNyY19jdXN0b21lcnMiIH0sCgogICAgICAtLSDikagg6JC9IGN1c3RvbWVycyDnu5PmnpwKICAgICAgeyBpZCA9ICJzaW5rX2N1c3RvbWVycyIsIHR5cGUgPSAic2luayIsCiAgICAgICAgZGVwcyA9IHsgImZhbGxiYWNrX2pvaW4iIH0sIHRhYmxlID0gImRlbW9fdmlwX2N1c3RvbWVycyIgfSwKCiAgICAgIC0tIOKRqSDlpJrot6/ot6/nlLHmvJTnpLrvvJpzd2l0Y2hfbm9kZSDmjInph5Hpop3liIbmobYKICAgICAgeyBpZCA9ICJzd2l0Y2hfYnVja2V0IiwgdHlwZSA9ICJzd2l0Y2hfbm9kZSIsCiAgICAgICAgZGVwcyA9IHsgImNsZWFuX29yZGVycyIgfSwKICAgICAgICBzZWxlY3RvciA9IGZ1bmN0aW9uKHJlc3VsdHMpCiAgICAgICAgICAtLSDlpoLmnpzmnInpq5jku7flgLzorqLljZXotbAgImhpZ2giIOWIhuaUr++8jOWQpuWImei1sCAibG93IgogICAgICAgICAgbG9jYWwgcm93cyA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBjb3VudCgqKSBBUyBuIEZST00gY2xlYW5fb3JkZXJzIFdIRVJFIGFtb3VudCA+PSAxMDAiKQogICAgICAgICAgaWYgcm93cyBhbmQgcm93c1sxXSBhbmQgdG9udW1iZXIocm93c1sxXS5uKSA+IDAgdGhlbgogICAgICAgICAgICByZXR1cm4gImhpZ2giCiAgICAgICAgICBlbmQKICAgICAgICAgIHJldHVybiAibG93IgogICAgICAgIGVuZCB9LAoKICAgICAgeyBpZCA9ICJidWNrZXRfcmVwb3J0IiwgdHlwZSA9ICJ0cmFuc2Zvcm0iLAogICAgICAgIGRlcHMgPSB7ICJzd2l0Y2hfYnVja2V0IiB9LCByb3V0ZSA9ICJoaWdoIiwKICAgICAgICBxdWVyeSA9ICJTRUxFQ1QgJ0J1ZGdldDogJyB8fCBDQVNUKHN1bShhbW91bnQpIEFTIFZBUkNIQVIpIEFTIHJlcG9ydCBGUk9NIGNsZWFuX29yZGVycyIgfSwKCiAgICAgIHsgaWQgPSAiYnVja2V0X2xvd19ub3RpY2UiLCB0eXBlID0gInNpbmsiLAogICAgICAgIGRlcHMgPSB7ICJzd2l0Y2hfYnVja2V0IiB9LCByb3V0ZSA9ICJsb3ciLCB0YWJsZSA9ICJkZW1vX2xvd19ub3RpY2UiIH0sCiAgICB9LAogIH0KCiAgLS0gPT09PT09PT09PT09IDMuIOaJp+ihjCBQaXBlbGluZSA9PT09PT09PT09PT0KICBsb2NhbCBvaywgcmVzdWx0ID0gcGNhbGwoZXRsLnBpcGVsaW5lLCBwaXBlbGluZSkKICBpZiBub3Qgb2sgdGhlbgogICAgX2R1Y2tkYl9jYWxsKCJJTlNFUlQgSU5UTyBkZW1vX3Jlc3VsdHMgVkFMVUVTICgnRVJST1I6ICIgLi4gdG9zdHJpbmcocmVzdWx0KTpnc3ViKCInIiwgIicnIikgLi4gIicpIikKICAgIHJldHVybiAiRkFJTEVEOiAiIC4uIHRvc3RyaW5nKHJlc3VsdCkKICBlbmQKCiAgLS0gPT09PT09PT09PT09IDQuIOmqjOivgee7k+aenCA9PT09PT09PT09PT0KICBsb2NhbCByZXBvcnQgPSB7fQoKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIj0iIC4uIHN0cmluZy5yZXAoIj0iLCA1NSkgLi4gIj0iCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIgIGV0bC5waXBlbGluZSBFMkUg4oCUIOmqjOivgeaKpeWRiiIKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIj0iIC4uIHN0cmluZy5yZXAoIj0iLCA1NSkgLi4gIj0iCgogIC0tIDRhLiBoaWdoX3ZhbHVlIOihqAogIGxvY2FsIGh2ID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUICogRlJPTSBkZW1vX2hpZ2hfdmFsdWUgT1JERVIgQlkgdG90YWwgREVTQyIpCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICLwn5OKIGRlbW9faGlnaF92YWx1Ze+8iOmrmOS7t+WAvOiuouWNlSDiiaUxMDDvvIkiCiAgaWYgaHYgYW5kICNodiA+IDAgdGhlbgogICAgZm9yIF8sIHIgaW4gaXBhaXJzKGh2KSBkbwogICAgICByZXBvcnRbI3JlcG9ydCArIDFdID0gIiAgIiAuLiB0b3N0cmluZyhyLm5hbWUpIC4uICIg4oaSICIgLi4gdG9zdHJpbmcoci50b3RhbCkKICAgIGVuZAogIGVsc2UKICAgIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiICAoZW1wdHkpIgogIGVuZAoKICAtLSA0Yi4gY3VzdG9tZXJzIOihqO+8iOWQq+mUmeivr+aBouWkje+8iQogIGxvY2FsIHZjID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUICogRlJPTSBkZW1vX3ZpcF9jdXN0b21lcnMgT1JERVIgQlkgaWQiKQogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiIgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAi8J+TiiBkZW1vX3ZpcF9jdXN0b21lcnPvvIjlkKvplJnor6/mgaLlpI0g4oaSIGZhbGxiYWNrIOWIl++8iSIKICBpZiB2YyBhbmQgI3ZjID4gMCB0aGVuCiAgICBmb3IgXywgciBpbiBpcGFpcnModmMpIGRvCiAgICAgIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiICAiIC4uIHRvc3RyaW5nKHIuaWQpIC4uICIgICIgLi4gdG9zdHJpbmcoci5uYW1lKSAuLiAiICAiIC4uIHRvc3RyaW5nKHIudGllcikgLi4KICAgICAgICAoci5ub3RlIGFuZCAoIiAgWyIgLi4gdG9zdHJpbmcoci5ub3RlKSAuLiAiXSIpIG9yICIiKQogICAgZW5kCiAgZW5kCgogIC0tIDRjLiBlbXB0eV9sb2cg5bqU5Li656m677yIcm91dGU9ZmFsc2Ug5pyq5omn6KGM77yJCiAgbG9jYWwgZWwgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgY291bnQoKikgQVMgbiBGUk9NIGRlbW9fZW1wdHlfbG9nIikKICBsb2NhbCBlbXB0eV9yb3dzID0gZWwgYW5kIGVsWzFdIGFuZCB0b251bWJlcihlbFsxXS5uKSBvciAwCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICLwn5OKIGRlbW9fZW1wdHlfbG9n77yIcm91dGU9ZmFsc2Ug5YiG5pSv77yM5bqUIDAg6KGM77yJOiAiIC4uIHRvc3RyaW5nKGVtcHR5X3Jvd3MpIC4uICIgcm93cyIKCiAgLS0gNGQuIOWuoeiuoeaXpeW/lwogIGxvY2FsIGxvZ3MgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgZm4sIENBU1QoZHVyYXRpb25fbXMgQVMgQklHSU5UKSBBUyBtcywgQ0FTVChyb3dzIEFTIEJJR0lOVCkgQVMgcm93cywgc3VjY2VzcywgZXJyIEZST00gZXRsX3J1bl9sb2cgT1JERVIgQlkgdHMgREVTQyBMSU1JVCAxNSIpCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICLwn5OKIOWuoeiuoeaXpeW/l++8iOacgOi/kSAxNSDmnaHvvIkiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIgICIgLi4gc3RyaW5nLmZvcm1hdCgiJS0zMHMgJTZzICU1cyAgJS01cyAlcyIsICJmbiIsICJkdXJfbXMiLCAicm93cyIsICJvaz8iLCAiZXJyIikKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIiAgIiAuLiBzdHJpbmcucmVwKCItIiwgNzApCiAgaWYgbG9ncyB0aGVuCiAgICBmb3IgXywgciBpbiBpcGFpcnMobG9ncykgZG8KICAgICAgbG9jYWwgZXJyID0gci5lcnIgb3IgIiIKICAgICAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIgICIgLi4gc3RyaW5nLmZvcm1hdCgiJS0zMHMgJTZzICU1cyAgJS01cyAlcyIsCiAgICAgICAgdG9zdHJpbmcoci5mbiksIHRvc3RyaW5nKHIubXMpLCB0b3N0cmluZyhyLnJvd3MpLAogICAgICAgIHRvc3RyaW5nKHIuc3VjY2VzcyksIHRvc3RyaW5nKGVycikpCiAgICBlbmQKICBlbmQKCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICI9IiAuLiBzdHJpbmcucmVwKCI9IiwgNTUpIC4uICI9IgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiICDinIUgRTJFIOa8lOekuuWujOaIkCIKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIj0iIC4uIHN0cmluZy5yZXAoIj0iLCA1NSkgLi4gIj0iCgogIHJldHVybiB0YWJsZS5jb25jYXQocmVwb3J0LCAiXG4iKQplbmQAX19iYW5kACVsbGQAZmllbGQAaGV4YWRlY2ltYWwgZGlnaXQgZXhwZWN0ZWQAZnVuY3Rpb24gYXJndW1lbnRzIGV4cGVjdGVkACVzIGV4cGVjdGVkAHZhbHVlIGV4cGVjdGVkACc9JyBvciAnaW4nIGV4cGVjdGVkADxuYW1lPiBvciAnLi4uJyBleHBlY3RlZAByYW5kb21zZWVkAF9fYWRkAHJhZABsb2FkAHRocmVhZABcJTAzZABcJWQAaW52YWxpZCBjYXB0dXJlIGluZGV4ICUlJWQAYnJlYWsgb3V0c2lkZSBsb29wIGF0IGxpbmUgJWQAZnVuY3Rpb24gYXQgbGluZSAlZABubyB2aXNpYmxlIGxhYmVsICclcycgZm9yIDxnb3RvPiBhdCBsaW5lICVkAGxhYmVsICclcycgYWxyZWFkeSBkZWZpbmVkIG9uIGxpbmUgJWQAX19nYwBfX2RiYwByYmFjAGdzdWIAX19zdWIAcmIAcndhABtMdWEAbGlnaHQgdXNlcmRhdGEAJWEAaW50ZWdyYWwgc2l6ZSAoJWQpIG91dCBvZiBsaW1pdHMgWzEsJWRdAD1bQ10AIl0AeFgAX0VOVgAlVQAueFhuTgB0YWJsZSBpbmRleCBpcyBOYU4AX1ZFUlNJT04ATkFOACVJAF9HAElORgBfTE9BREVEAEMAPT8APGludGVnZXI+ADxudW1iZXI+ADxzdHJpbmc+ADxlb2Y+ADxuYW1lPgA+PgB+PQA+PQA9PQA8PQA8PAA6OgAtMWU5OTk5AC0wMTIzNDU2Nzg5AHV0ZjgATHVhIDUuNABzY2QyAGZvcm1hdCBhc2tzIGZvciBhbGlnbm1lbnQgbm90IHBvd2VyIG9mIDIALTAALSMwAC8vAF9HLgAtKyMwIDEyMzQ1Njc4OS4ALi4uAF4kKis/LihbJS0ALSsAX1VCT1gqACh0ZW1wb3JhcnkpAChDIHRlbXBvcmFyeSkAc3RhY2sgb3ZlcmZsb3cgKCVzKQAlczogYmFkIGJpbmFyeSBmb3JtYXQgKCVzKQBjYWxsaW5nICclcycgb24gYmFkIHNlbGYgKCVzKQBiYWQgYXJndW1lbnQgIyVkICglcykAYmFkIGFyZ3VtZW50ICMlZCB0byAnJXMnICglcykAYmFkICdmb3InICVzIChudW1iZXIgZXhwZWN0ZWQsIGdvdCAlcykAaW52YWxpZCByZXBsYWNlbWVudCB2YWx1ZSAoYSAlcykAKG51bGwpAChuaWwpACh2YXJhcmcpAGludmFsaWQgZm9ybWF0ICh0b28gbG9uZykAKG5vbi1zdHJpbmcpAChmb3Igc3RhdGUpAChubyBuYW1lKQA9KGxvYWQpAHRvbyBtYW55ICVzIChsaW1pdCBpcyAlZCkAJXMgZXhwZWN0ZWQgKHRvIGNsb3NlICVzIGF0IGxpbmUgJWQpAHVuZmluaXNoZWQgbG9uZyAlcyAoc3RhcnRpbmcgYXQgbGluZSAlZCkAKDAvMCkAYXR0ZW1wdCB0byBsb2FkIGEgJXMgY2h1bmsgKG1vZGUgaXMgJyVzJykAICglcyAnJXMnKQBtYWxmb3JtZWQgcGF0dGVybiAobWlzc2luZyBhcmd1bWVudHMgdG8gJyUlYicpAG1hbGZvcm1lZCBwYXR0ZXJuIChtaXNzaW5nICddJykAbWFsZm9ybWVkIHBhdHRlcm4gKGVuZHMgd2l0aCAnJSUnKQAgKABtaXNzaW5nICd9JwBtaXNzaW5nICd7JwB1bmZpbmlzaGVkIHN0cmluZyBmb3IgZm9ybWF0ICd6JwBpbnZhbGlkIGtleSB0byAnbmV4dCcAd3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byAnaW5zZXJ0JwBpbnZhbGlkIGNvbnZlcnNpb24gJyVzJyB0byAnZm9ybWF0JwBpbnZhbGlkIHZhbHVlICglcykgYXQgaW5kZXggJUkgaW4gdGFibGUgZm9yICdjb25jYXQnAGludmFsaWQgb3B0aW9uICclcycAPGdvdG8gJXM+IGF0IGxpbmUgJWQganVtcHMgaW50byB0aGUgc2NvcGUgb2YgbG9jYWwgJyVzJwB1bmtub3duIGF0dHJpYnV0ZSAnJXMnAGF0dGVtcHQgdG8gYXNzaWduIHRvIGNvbnN0IHZhcmlhYmxlICclcycAZXJyb3I6IHVua25vd24gbGliICclcycAYXR0ZW1wdCB0byAlcyBhICclcycgd2l0aCBhICclcycAaW52YWxpZCBjb252ZXJzaW9uIHNwZWNpZmljYXRpb246ICclcycAaW52YWxpZCBvcHRpb24gJyUlJWMnIHRvICdsdWFfcHVzaGZzdHJpbmcnAG1pc3Npbmcgc2l6ZSBmb3IgZm9ybWF0IG9wdGlvbiAnYycAaW52YWxpZCBmb3JtYXQgb3B0aW9uICclYycAaW52YWxpZCBuZXh0IG9wdGlvbiBmb3Igb3B0aW9uICdYJwAnPFwlZD4nAGF0dGVtcHQgdG8gcGVyZm9ybSAnbiUlMCcAW3N0cmluZyAiAGFzc2VydGlvbiBmYWlsZWQhAGVycm9yIGluIABMdWEgd2FybmluZzogACVzOiVkOiAALSswIAAtKyMwIAAgDAoNCQsAd3JhcCBlcnI6ICVzCgAtLSBAbGliOiBqc29uCi0tIEBjYXRlZ29yeTogcGFyc2VyCi0tIEBkZXNjOiBKU09OIOino+aekC/nvJbnoIHvvIjnuq8gTHVh77yJCi0tIEBzb3VyY2U6IHZlbmRvcmVkIGh0dHBzOi8vZ2l0aHViLmNvbS9yeGkvanNvbi5sdWEgKE1JVCwgcnhpIDIwMjApCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUICh2ZW5kb3JlZCByeGkvanNvbi5sdWEsIHJ4aSAyMDIwKQotLSBAbWF0dXJpdHk6IGF1ZGl0ZWQKLS0KLS0ganNvbi5sdWEKLS0KLS0gQ29weXJpZ2h0IChjKSAyMDIwIHJ4aQotLQotLSBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mCi0tIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICJTb2Z0d2FyZSIpLCB0byBkZWFsIGluCi0tIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8KLS0gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMKLS0gb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvCi0tIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczoKLS0KLS0gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsCi0tIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuCi0tCi0tIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAiQVMgSVMiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SCi0tIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLAotLSBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUKLS0gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUgotLSBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLAotLSBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRQotLSBTT0ZUV0FSRS4KLS0KCmxvY2FsIGpzb24gPSB7IF92ZXJzaW9uID0gIjAuMS4yIiB9CgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIEVuY29kZQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpsb2NhbCBlbmNvZGUKCmxvY2FsIGVzY2FwZV9jaGFyX21hcCA9IHsKICBbICJcXCIgXSA9ICJcXCIsCiAgWyAiXCIiIF0gPSAiXCIiLAogIFsgIlxiIiBdID0gImIiLAogIFsgIlxmIiBdID0gImYiLAogIFsgIlxuIiBdID0gIm4iLAogIFsgIlxyIiBdID0gInIiLAogIFsgIlx0IiBdID0gInQiLAp9Cgpsb2NhbCBlc2NhcGVfY2hhcl9tYXBfaW52ID0geyBbICIvIiBdID0gIi8iIH0KZm9yIGssIHYgaW4gcGFpcnMoZXNjYXBlX2NoYXJfbWFwKSBkbwogIGVzY2FwZV9jaGFyX21hcF9pbnZbdl0gPSBrCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVzY2FwZV9jaGFyKGMpCiAgcmV0dXJuICJcXCIgLi4gKGVzY2FwZV9jaGFyX21hcFtjXSBvciBzdHJpbmcuZm9ybWF0KCJ1JTA0eCIsIGM6Ynl0ZSgpKSkKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX25pbCh2YWwpCiAgcmV0dXJuICJudWxsIgplbmQKCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfdGFibGUodmFsLCBzdGFjaykKICBsb2NhbCByZXMgPSB7fQogIHN0YWNrID0gc3RhY2sgb3Ige30KCiAgLS0gQ2lyY3VsYXIgcmVmZXJlbmNlPwogIGlmIHN0YWNrW3ZhbF0gdGhlbiBlcnJvcigiY2lyY3VsYXIgcmVmZXJlbmNlIikgZW5kCgogIHN0YWNrW3ZhbF0gPSB0cnVlCgogIGlmIHJhd2dldCh2YWwsIDEpIH49IG5pbCBvciBuZXh0KHZhbCkgPT0gbmlsIHRoZW4KICAgIC0tIFRyZWF0IGFzIGFycmF5IC0tIGNoZWNrIGtleXMgYXJlIHZhbGlkIGFuZCBpdCBpcyBub3Qgc3BhcnNlCiAgICBsb2NhbCBuID0gMAogICAgZm9yIGsgaW4gcGFpcnModmFsKSBkbwogICAgICBpZiB0eXBlKGspIH49ICJudW1iZXIiIHRoZW4KICAgICAgICBlcnJvcigiaW52YWxpZCB0YWJsZTogbWl4ZWQgb3IgaW52YWxpZCBrZXkgdHlwZXMiKQogICAgICBlbmQKICAgICAgbiA9IG4gKyAxCiAgICBlbmQKICAgIGlmIG4gfj0gI3ZhbCB0aGVuCiAgICAgIGVycm9yKCJpbnZhbGlkIHRhYmxlOiBzcGFyc2UgYXJyYXkiKQogICAgZW5kCiAgICAtLSBFbmNvZGUKICAgIGZvciBpLCB2IGluIGlwYWlycyh2YWwpIGRvCiAgICAgIHRhYmxlLmluc2VydChyZXMsIGVuY29kZSh2LCBzdGFjaykpCiAgICBlbmQKICAgIHN0YWNrW3ZhbF0gPSBuaWwKICAgIHJldHVybiAiWyIgLi4gdGFibGUuY29uY2F0KHJlcywgIiwiKSAuLiAiXSIKCiAgZWxzZQogICAgLS0gVHJlYXQgYXMgYW4gb2JqZWN0CiAgICBmb3IgaywgdiBpbiBwYWlycyh2YWwpIGRvCiAgICAgIGlmIHR5cGUoaykgfj0gInN0cmluZyIgdGhlbgogICAgICAgIGVycm9yKCJpbnZhbGlkIHRhYmxlOiBtaXhlZCBvciBpbnZhbGlkIGtleSB0eXBlcyIpCiAgICAgIGVuZAogICAgICB0YWJsZS5pbnNlcnQocmVzLCBlbmNvZGUoaywgc3RhY2spIC4uICI6IiAuLiBlbmNvZGUodiwgc3RhY2spKQogICAgZW5kCiAgICBzdGFja1t2YWxdID0gbmlsCiAgICByZXR1cm4gInsiIC4uIHRhYmxlLmNvbmNhdChyZXMsICIsIikgLi4gIn0iCiAgZW5kCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVuY29kZV9zdHJpbmcodmFsKQogIHJldHVybiAnIicgLi4gdmFsOmdzdWIoJ1slelwxLVwzMVxcIl0nLCBlc2NhcGVfY2hhcikgLi4gJyInCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVuY29kZV9udW1iZXIodmFsKQogIC0tIENoZWNrIGZvciBOYU4sIC1pbmYgYW5kIGluZgogIGlmIHZhbCB+PSB2YWwgb3IgdmFsIDw9IC1tYXRoLmh1Z2Ugb3IgdmFsID49IG1hdGguaHVnZSB0aGVuCiAgICBlcnJvcigidW5leHBlY3RlZCBudW1iZXIgdmFsdWUgJyIgLi4gdG9zdHJpbmcodmFsKSAuLiAiJyIpCiAgZW5kCiAgcmV0dXJuIHN0cmluZy5mb3JtYXQoIiUuMTRnIiwgdmFsKQplbmQKCgpsb2NhbCB0eXBlX2Z1bmNfbWFwID0gewogIFsgIm5pbCIgICAgIF0gPSBlbmNvZGVfbmlsLAogIFsgInRhYmxlIiAgIF0gPSBlbmNvZGVfdGFibGUsCiAgWyAic3RyaW5nIiAgXSA9IGVuY29kZV9zdHJpbmcsCiAgWyAibnVtYmVyIiAgXSA9IGVuY29kZV9udW1iZXIsCiAgWyAiYm9vbGVhbiIgXSA9IHRvc3RyaW5nLAp9CgoKZW5jb2RlID0gZnVuY3Rpb24odmFsLCBzdGFjaykKICBsb2NhbCB0ID0gdHlwZSh2YWwpCiAgbG9jYWwgZiA9IHR5cGVfZnVuY19tYXBbdF0KICBpZiBmIHRoZW4KICAgIHJldHVybiBmKHZhbCwgc3RhY2spCiAgZW5kCiAgZXJyb3IoInVuZXhwZWN0ZWQgdHlwZSAnIiAuLiB0IC4uICInIikKZW5kCgoKZnVuY3Rpb24ganNvbi5lbmNvZGUodmFsKQogIHJldHVybiAoIGVuY29kZSh2YWwpICkKZW5kCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQotLSBEZWNvZGUKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKbG9jYWwgcGFyc2UKCmxvY2FsIGZ1bmN0aW9uIGNyZWF0ZV9zZXQoLi4uKQogIGxvY2FsIHJlcyA9IHt9CiAgZm9yIGkgPSAxLCBzZWxlY3QoIiMiLCAuLi4pIGRvCiAgICByZXNbIHNlbGVjdChpLCAuLi4pIF0gPSB0cnVlCiAgZW5kCiAgcmV0dXJuIHJlcwplbmQKCmxvY2FsIHNwYWNlX2NoYXJzICAgPSBjcmVhdGVfc2V0KCIgIiwgIlx0IiwgIlxyIiwgIlxuIikKbG9jYWwgZGVsaW1fY2hhcnMgICA9IGNyZWF0ZV9zZXQoIiAiLCAiXHQiLCAiXHIiLCAiXG4iLCAiXSIsICJ9IiwgIiwiKQpsb2NhbCBlc2NhcGVfY2hhcnMgID0gY3JlYXRlX3NldCgiXFwiLCAiLyIsICciJywgImIiLCAiZiIsICJuIiwgInIiLCAidCIsICJ1IikKbG9jYWwgbGl0ZXJhbHMgICAgICA9IGNyZWF0ZV9zZXQoInRydWUiLCAiZmFsc2UiLCAibnVsbCIpCgpsb2NhbCBsaXRlcmFsX21hcCA9IHsKICBbICJ0cnVlIiAgXSA9IHRydWUsCiAgWyAiZmFsc2UiIF0gPSBmYWxzZSwKICBbICJudWxsIiAgXSA9IG5pbCwKfQoKCmxvY2FsIGZ1bmN0aW9uIG5leHRfY2hhcihzdHIsIGlkeCwgc2V0LCBuZWdhdGUpCiAgZm9yIGkgPSBpZHgsICNzdHIgZG8KICAgIGlmIHNldFtzdHI6c3ViKGksIGkpXSB+PSBuZWdhdGUgdGhlbgogICAgICByZXR1cm4gaQogICAgZW5kCiAgZW5kCiAgcmV0dXJuICNzdHIgKyAxCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGRlY29kZV9lcnJvcihzdHIsIGlkeCwgbXNnKQogIGxvY2FsIGxpbmVfY291bnQgPSAxCiAgbG9jYWwgY29sX2NvdW50ID0gMQogIGZvciBpID0gMSwgaWR4IC0gMSBkbwogICAgY29sX2NvdW50ID0gY29sX2NvdW50ICsgMQogICAgaWYgc3RyOnN1YihpLCBpKSA9PSAiXG4iIHRoZW4KICAgICAgbGluZV9jb3VudCA9IGxpbmVfY291bnQgKyAxCiAgICAgIGNvbF9jb3VudCA9IDEKICAgIGVuZAogIGVuZAogIGVycm9yKCBzdHJpbmcuZm9ybWF0KCIlcyBhdCBsaW5lICVkIGNvbCAlZCIsIG1zZywgbGluZV9jb3VudCwgY29sX2NvdW50KSApCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGNvZGVwb2ludF90b191dGY4KG4pCiAgLS0gaHR0cDovL3NjcmlwdHMuc2lsLm9yZy9jbXMvc2NyaXB0cy9wYWdlLnBocD9zaXRlX2lkPW5yc2kmaWQ9aXdzLWFwcGVuZGl4YQogIGxvY2FsIGYgPSBtYXRoLmZsb29yCiAgaWYgbiA8PSAweDdmIHRoZW4KICAgIHJldHVybiBzdHJpbmcuY2hhcihuKQogIGVsc2VpZiBuIDw9IDB4N2ZmIHRoZW4KICAgIHJldHVybiBzdHJpbmcuY2hhcihmKG4gLyA2NCkgKyAxOTIsIG4gJSA2NCArIDEyOCkKICBlbHNlaWYgbiA8PSAweGZmZmYgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKGYobiAvIDQwOTYpICsgMjI0LCBmKG4gJSA0MDk2IC8gNjQpICsgMTI4LCBuICUgNjQgKyAxMjgpCiAgZWxzZWlmIG4gPD0gMHgxMGZmZmYgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKGYobiAvIDI2MjE0NCkgKyAyNDAsIGYobiAlIDI2MjE0NCAvIDQwOTYpICsgMTI4LAogICAgICAgICAgICAgICAgICAgICAgIGYobiAlIDQwOTYgLyA2NCkgKyAxMjgsIG4gJSA2NCArIDEyOCkKICBlbmQKICBlcnJvciggc3RyaW5nLmZvcm1hdCgiaW52YWxpZCB1bmljb2RlIGNvZGVwb2ludCAnJXgnIiwgbikgKQplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV91bmljb2RlX2VzY2FwZShzKQogIGxvY2FsIG4xID0gdG9udW1iZXIoIHM6c3ViKDEsIDQpLCAgMTYgKQogIGxvY2FsIG4yID0gdG9udW1iZXIoIHM6c3ViKDcsIDEwKSwgMTYgKQogICAtLSBTdXJyb2dhdGUgcGFpcj8KICBpZiBuMiB0aGVuCiAgICByZXR1cm4gY29kZXBvaW50X3RvX3V0ZjgoKG4xIC0gMHhkODAwKSAqIDB4NDAwICsgKG4yIC0gMHhkYzAwKSArIDB4MTAwMDApCiAgZWxzZQogICAgcmV0dXJuIGNvZGVwb2ludF90b191dGY4KG4xKQogIGVuZAplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9zdHJpbmcoc3RyLCBpKQogIGxvY2FsIHJlcyA9ICIiCiAgbG9jYWwgaiA9IGkgKyAxCiAgbG9jYWwgayA9IGoKCiAgd2hpbGUgaiA8PSAjc3RyIGRvCiAgICBsb2NhbCB4ID0gc3RyOmJ5dGUoaikKCiAgICBpZiB4IDwgMzIgdGhlbgogICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBqLCAiY29udHJvbCBjaGFyYWN0ZXIgaW4gc3RyaW5nIikKCiAgICBlbHNlaWYgeCA9PSA5MiB0aGVuIC0tIGBcYDogRXNjYXBlCiAgICAgIHJlcyA9IHJlcyAuLiBzdHI6c3ViKGssIGogLSAxKQogICAgICBqID0gaiArIDEKICAgICAgbG9jYWwgYyA9IHN0cjpzdWIoaiwgaikKICAgICAgaWYgYyA9PSAidSIgdGhlbgogICAgICAgIGxvY2FsIGhleCA9IHN0cjptYXRjaCgiXltkRF1bODlhQWJCXSV4JXhcXHUleCV4JXgleCIsIGogKyAxKQogICAgICAgICAgICAgICAgIG9yIHN0cjptYXRjaCgiXiV4JXgleCV4IiwgaiArIDEpCiAgICAgICAgICAgICAgICAgb3IgZGVjb2RlX2Vycm9yKHN0ciwgaiAtIDEsICJpbnZhbGlkIHVuaWNvZGUgZXNjYXBlIGluIHN0cmluZyIpCiAgICAgICAgcmVzID0gcmVzIC4uIHBhcnNlX3VuaWNvZGVfZXNjYXBlKGhleCkKICAgICAgICBqID0gaiArICNoZXgKICAgICAgZWxzZQogICAgICAgIGlmIG5vdCBlc2NhcGVfY2hhcnNbY10gdGhlbgogICAgICAgICAgZGVjb2RlX2Vycm9yKHN0ciwgaiAtIDEsICJpbnZhbGlkIGVzY2FwZSBjaGFyICciIC4uIGMgLi4gIicgaW4gc3RyaW5nIikKICAgICAgICBlbmQKICAgICAgICByZXMgPSByZXMgLi4gZXNjYXBlX2NoYXJfbWFwX2ludltjXQogICAgICBlbmQKICAgICAgayA9IGogKyAxCgogICAgZWxzZWlmIHggPT0gMzQgdGhlbiAtLSBgImA6IEVuZCBvZiBzdHJpbmcKICAgICAgcmVzID0gcmVzIC4uIHN0cjpzdWIoaywgaiAtIDEpCiAgICAgIHJldHVybiByZXMsIGogKyAxCiAgICBlbmQKCiAgICBqID0gaiArIDEKICBlbmQKCiAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImV4cGVjdGVkIGNsb3NpbmcgcXVvdGUgZm9yIHN0cmluZyIpCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX251bWJlcihzdHIsIGkpCiAgbG9jYWwgeCA9IG5leHRfY2hhcihzdHIsIGksIGRlbGltX2NoYXJzKQogIGxvY2FsIHMgPSBzdHI6c3ViKGksIHggLSAxKQogIGxvY2FsIG4gPSB0b251bWJlcihzKQogIGlmIG5vdCBuIHRoZW4KICAgIGRlY29kZV9lcnJvcihzdHIsIGksICJpbnZhbGlkIG51bWJlciAnIiAuLiBzIC4uICInIikKICBlbmQKICByZXR1cm4gbiwgeAplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9saXRlcmFsKHN0ciwgaSkKICBsb2NhbCB4ID0gbmV4dF9jaGFyKHN0ciwgaSwgZGVsaW1fY2hhcnMpCiAgbG9jYWwgd29yZCA9IHN0cjpzdWIoaSwgeCAtIDEpCiAgaWYgbm90IGxpdGVyYWxzW3dvcmRdIHRoZW4KICAgIGRlY29kZV9lcnJvcihzdHIsIGksICJpbnZhbGlkIGxpdGVyYWwgJyIgLi4gd29yZCAuLiAiJyIpCiAgZW5kCiAgcmV0dXJuIGxpdGVyYWxfbWFwW3dvcmRdLCB4CmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2FycmF5KHN0ciwgaSkKICBsb2NhbCByZXMgPSB7fQogIGxvY2FsIG4gPSAxCiAgaSA9IGkgKyAxCiAgd2hpbGUgMSBkbwogICAgbG9jYWwgeAogICAgaSA9IG5leHRfY2hhcihzdHIsIGksIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgLS0gRW1wdHkgLyBlbmQgb2YgYXJyYXk/CiAgICBpZiBzdHI6c3ViKGksIGkpID09ICJdIiB0aGVuCiAgICAgIGkgPSBpICsgMQogICAgICBicmVhawogICAgZW5kCiAgICAtLSBSZWFkIHRva2VuCiAgICB4LCBpID0gcGFyc2Uoc3RyLCBpKQogICAgcmVzW25dID0geAogICAgbiA9IG4gKyAxCiAgICAtLSBOZXh0IHRva2VuCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICBsb2NhbCBjaHIgPSBzdHI6c3ViKGksIGkpCiAgICBpID0gaSArIDEKICAgIGlmIGNociA9PSAiXSIgdGhlbiBicmVhayBlbmQKICAgIGlmIGNociB+PSAiLCIgdGhlbiBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgJ10nIG9yICcsJyIpIGVuZAogIGVuZAogIHJldHVybiByZXMsIGkKZW5kCgoKbG9jYWwgZnVuY3Rpb24gcGFyc2Vfb2JqZWN0KHN0ciwgaSkKICBsb2NhbCByZXMgPSB7fQogIGkgPSBpICsgMQogIHdoaWxlIDEgZG8KICAgIGxvY2FsIGtleSwgdmFsCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICAtLSBFbXB0eSAvIGVuZCBvZiBvYmplY3Q/CiAgICBpZiBzdHI6c3ViKGksIGkpID09ICJ9IiB0aGVuCiAgICAgIGkgPSBpICsgMQogICAgICBicmVhawogICAgZW5kCiAgICAtLSBSZWFkIGtleQogICAgaWYgc3RyOnN1YihpLCBpKSB+PSAnIicgdGhlbgogICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgc3RyaW5nIGZvciBrZXkiKQogICAgZW5kCiAgICBrZXksIGkgPSBwYXJzZShzdHIsIGkpCiAgICAtLSBSZWFkICc6JyBkZWxpbWl0ZXIKICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpLCBzcGFjZV9jaGFycywgdHJ1ZSkKICAgIGlmIHN0cjpzdWIoaSwgaSkgfj0gIjoiIHRoZW4KICAgICAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImV4cGVjdGVkICc6JyBhZnRlciBrZXkiKQogICAgZW5kCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSArIDEsIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgLS0gUmVhZCB2YWx1ZQogICAgdmFsLCBpID0gcGFyc2Uoc3RyLCBpKQogICAgLS0gU2V0CiAgICByZXNba2V5XSA9IHZhbAogICAgLS0gTmV4dCB0b2tlbgogICAgaSA9IG5leHRfY2hhcihzdHIsIGksIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgbG9jYWwgY2hyID0gc3RyOnN1YihpLCBpKQogICAgaSA9IGkgKyAxCiAgICBpZiBjaHIgPT0gIn0iIHRoZW4gYnJlYWsgZW5kCiAgICBpZiBjaHIgfj0gIiwiIHRoZW4gZGVjb2RlX2Vycm9yKHN0ciwgaSwgImV4cGVjdGVkICd9JyBvciAnLCciKSBlbmQKICBlbmQKICByZXR1cm4gcmVzLCBpCmVuZAoKCmxvY2FsIGNoYXJfZnVuY19tYXAgPSB7CiAgWyAnIicgXSA9IHBhcnNlX3N0cmluZywKICBbICIwIiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjEiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiMiIgXSA9IHBhcnNlX251bWJlciwKICBbICIzIiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjQiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiNSIgXSA9IHBhcnNlX251bWJlciwKICBbICI2IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjciIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiOCIgXSA9IHBhcnNlX251bWJlciwKICBbICI5IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIi0iIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAidCIgXSA9IHBhcnNlX2xpdGVyYWwsCiAgWyAiZiIgXSA9IHBhcnNlX2xpdGVyYWwsCiAgWyAibiIgXSA9IHBhcnNlX2xpdGVyYWwsCiAgWyAiWyIgXSA9IHBhcnNlX2FycmF5LAogIFsgInsiIF0gPSBwYXJzZV9vYmplY3QsCn0KCgpwYXJzZSA9IGZ1bmN0aW9uKHN0ciwgaWR4KQogIGxvY2FsIGNociA9IHN0cjpzdWIoaWR4LCBpZHgpCiAgbG9jYWwgZiA9IGNoYXJfZnVuY19tYXBbY2hyXQogIGlmIGYgdGhlbgogICAgcmV0dXJuIGYoc3RyLCBpZHgpCiAgZW5kCiAgZGVjb2RlX2Vycm9yKHN0ciwgaWR4LCAidW5leHBlY3RlZCBjaGFyYWN0ZXIgJyIgLi4gY2hyIC4uICInIikKZW5kCgoKZnVuY3Rpb24ganNvbi5kZWNvZGUoc3RyKQogIGlmIHR5cGUoc3RyKSB+PSAic3RyaW5nIiB0aGVuCiAgICBlcnJvcigiZXhwZWN0ZWQgYXJndW1lbnQgb2YgdHlwZSBzdHJpbmcsIGdvdCAiIC4uIHR5cGUoc3RyKSkKICBlbmQKICBsb2NhbCByZXMsIGlkeCA9IHBhcnNlKHN0ciwgbmV4dF9jaGFyKHN0ciwgMSwgc3BhY2VfY2hhcnMsIHRydWUpKQogIGlkeCA9IG5leHRfY2hhcihzdHIsIGlkeCwgc3BhY2VfY2hhcnMsIHRydWUpCiAgaWYgaWR4IDw9ICNzdHIgdGhlbgogICAgZGVjb2RlX2Vycm9yKHN0ciwgaWR4LCAidHJhaWxpbmcgZ2FyYmFnZSIpCiAgZW5kCiAgcmV0dXJuIHJlcwplbmQKCgpyZXR1cm4ganNvbgoALS0gaW5jcmVtZW50YWwubHVhOiDlop7ph4/liqDovb3vvIjmsLTkvY3muLjmoIfvvInigJTigJRhcHBlbmQtb25seSDooajlj6rliqDovb3mlrDooYzvvIgyMDI2LTA4LTEz77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IGF1ZGl0ZWQKLS0g6ZyA6KaB5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJpfZHVja2RiX2NhbGwgLyBfZHVja2RiX3F1ZXJ5Ci0tCi0tIOeUqOazle+8iGluc3RhbGwg5ZCO77yJ77yaCi0tICAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGUgOj0gJ2luc3RhbGwnLCBzcWxfbmFtZSA6PSAnaW5jcmVtZW50YWwnKTsKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnY29tcGlsZScsIHNxbF9uYW1lIDo9ICdpbmNyX3J1bicsCi0tICAgICBzb3VyY2UgOj0gJ3JldHVybiBmdW5jdGlvbihvcHRzKSByZXR1cm4gaW5jcmVtZW50YWwucnVuKG9wdHMpIGVuZCcpOwotLSAgIFNFTEVDVCBpbmNyX3J1bih7dGFyZ2V0Oj0ndGd0X29yZGVycycsIHNvdXJjZTo9J3NyY19vcmRlcnMnLCB0c19jb2w6PSd0cycsIG1vZGU6PSd0cyd9KTsKLS0KLS0g5ri45qCH5qih5byPIG1vZGXvvJoKLS0gICAndHMnICAgIOKAlOKAlCBXSEVSRSB0cyA+IGxhc3RfdHMgICAgICAgICAgICAgICAgICAgICAgICDmjInml7bpl7Tlop7ph48KLS0gICAnaWQnICAgIOKAlOKAlCBXSEVSRSBpZCA+IGxhc3RfaWQgICAgICAgICAgICAgICAgICAgICAgICDmjInoh6rlop7plK7lop7ph48KLS0gICAndHNfaWQnIOKAlOKAlCBXSEVSRSB0cyA+IGxhc3RfdHMgT1IgKHRzID0gbGFzdF90cyBBTkQgaWQgPiBsYXN0X2lkKSAg5aSN5ZCI5ri45qCH77yM5ZCM5pe26Ze05oiz5LiN5ryP5LiN6YeNCi0tCi0tIOawtOS9jeihqO+8mmV0bF93YXRlcm1hcmsobmFtZSBWQVJDSEFSIFBLLCBsYXN0X3RzIFRJTUVTVEFNUCwgbGFzdF9pZCBCSUdJTlQsIHVwZGF0ZWRfYXQgVElNRVNUQU1QKQotLSDnuqblrprvvJpzb3VyY2Ug5LiOIHRhcmdldCDliJfluo/kuIDoh7TvvIhJTlNFUlQgSU5UTyB0YXJnZXQgU0VMRUNUICogRlJPTSBzb3VyY2XvvIkKCmxvY2FsIGluY3JlbWVudGFsID0ge30KaW5jcmVtZW50YWwud2F0ZXJtYXJrX3RhYmxlID0gJ2V0bF93YXRlcm1hcmsnCgpsb2NhbCBmdW5jdGlvbiBlc2ModikKICBpZiB0eXBlKHYpID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICInIiAuLiB2OmdzdWIoIiciLCAiJyciKSAuLiAiJyIgZW5kCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gJ05VTEwnIGVuZAogIHJldHVybiB0b3N0cmluZyh2KQplbmQKCi0tIEpTT04g5a2X56ym5Liy6L2s5LmJ77yI6L+U5Zue5YC857uZIFNRTCDnq68ganNvbl9leHRyYWN0IOeUqO+8iQpsb2NhbCBmdW5jdGlvbiBqc3RyKHYpCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogIGlmIHR5cGUodikgPT0gJ251bWJlcicgdGhlbiByZXR1cm4gdG9zdHJpbmcodikgZW5kCiAgcmV0dXJuICciJyAuLiB0b3N0cmluZyh2KTpnc3ViKCciJywgJ1xcIicpIC4uICciJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGpyZXMobG9hZGVkLCBsYXN0X3RzLCBsYXN0X2lkKQogIHJldHVybiAneyJsb2FkZWQiOicgLi4gdG9zdHJpbmcobG9hZGVkKSAuLiAnLCJsYXN0X3RzIjonIC4uIGpzdHIobGFzdF90cykKICAgIC4uICcsImxhc3RfaWQiOicgLi4ganN0cihsYXN0X2lkKSAuLiAnfScKZW5kCgotLSDliJ3lp4vljJbmsLTkvY3ooajvvIjluYLnrYnvvIkKZnVuY3Rpb24gaW5jcmVtZW50YWwuaW5pdCgpCiAgX2R1Y2tkYl9jYWxsKCdDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAnIC4uIGluY3JlbWVudGFsLndhdGVybWFya190YWJsZQogICAgLi4gJyAobmFtZSBWQVJDSEFSIFBSSU1BUlkgS0VZLCBsYXN0X3RzIFRJTUVTVEFNUCwgbGFzdF9pZCBCSUdJTlQsIHVwZGF0ZWRfYXQgVElNRVNUQU1QKScpCmVuZAoKLS0g6K+75rC05L2N77ya6L+U5ZueIHt0cz0uLi4sIGlkPS4uLn0g5oiWIG5pbO+8iOmmluasoe+8iQpmdW5jdGlvbiBpbmNyZW1lbnRhbC53YXRlcm1hcmsobmFtZSkKICBpbmNyZW1lbnRhbC5pbml0KCkKICBsb2NhbCByb3dzID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIGxhc3RfdHMsIGxhc3RfaWQgRlJPTSAnIC4uIGluY3JlbWVudGFsLndhdGVybWFya190YWJsZQogICAgLi4gJyBXSEVSRSBuYW1lID0gJyAuLiBlc2MobmFtZSkpCiAgaWYgbm90IHJvd3Mgb3IgI3Jvd3MgPT0gMCB0aGVuIHJldHVybiBuaWwgZW5kCiAgcmV0dXJuIHsgdHMgPSByb3dzWzFdLmxhc3RfdHMsIGlkID0gcm93c1sxXS5sYXN0X2lkIH0KZW5kCgotLSDmuIXmsLTkvY3vvIjph43mlrDlhajph4/vvIkKZnVuY3Rpb24gaW5jcmVtZW50YWwucmVzZXQobmFtZSkKICBpbmNyZW1lbnRhbC5pbml0KCkKICBfZHVja2RiX2NhbGwoJ0RFTEVURSBGUk9NICcgLi4gaW5jcmVtZW50YWwud2F0ZXJtYXJrX3RhYmxlIC4uICcgV0hFUkUgbmFtZSA9ICcgLi4gZXNjKG5hbWUpKQplbmQKCi0tIOaJp+ihjOWinumHj+WKoOi9vQotLSBvcHRzID0geyB0YXJnZXQ955uu5qCH6KGoLCBzb3VyY2U95rqQ6KGoLCB0c19jb2w9PywgaWRfY29sPT8sIG1vZGU9J3RzJ3wnaWQnfCd0c19pZCcgfQotLSDov5Tlm54ge2xvYWRlZD1OLCBsYXN0X3RzPT8sIGxhc3RfaWQ9P30KZnVuY3Rpb24gaW5jcmVtZW50YWwucnVuKG9wdHMpCiAgb3B0cyA9IG9wdHMgb3Ige30KICBsb2NhbCB0YXJnZXQsIHNvdXJjZSA9IG9wdHMudGFyZ2V0LCBvcHRzLnNvdXJjZQogIGlmIG5vdCB0YXJnZXQgb3Igbm90IHNvdXJjZSB0aGVuIGVycm9yKCdpbmNyZW1lbnRhbDogdGFyZ2V0IGFuZCBzb3VyY2UgcmVxdWlyZWQnLCAwKSBlbmQKICBsb2NhbCBtb2RlID0gb3B0cy5tb2RlIG9yICd0cycKICBsb2NhbCB0c19jb2wsIGlkX2NvbCA9IG9wdHMudHNfY29sLCBvcHRzLmlkX2NvbAogIGlmIG1vZGUgPT0gJ3RzJyBhbmQgbm90IHRzX2NvbCB0aGVuIGVycm9yKCdpbmNyZW1lbnRhbDogdHNfY29sIHJlcXVpcmVkIGZvciBtb2RlPXRzJywgMCkgZW5kCiAgaWYgbW9kZSA9PSAnaWQnIGFuZCBub3QgaWRfY29sIHRoZW4gZXJyb3IoJ2luY3JlbWVudGFsOiBpZF9jb2wgcmVxdWlyZWQgZm9yIG1vZGU9aWQnLCAwKSBlbmQKICBpZiBtb2RlID09ICd0c19pZCcgYW5kIChub3QgdHNfY29sIG9yIG5vdCBpZF9jb2wpIHRoZW4KICAgIGVycm9yKCdpbmNyZW1lbnRhbDogdHNfY29sIGFuZCBpZF9jb2wgcmVxdWlyZWQgZm9yIG1vZGU9dHNfaWQnLCAwKSBlbmQKCiAgbG9jYWwgd20gPSBpbmNyZW1lbnRhbC53YXRlcm1hcmsodGFyZ2V0KQogIGxvY2FsIHdoZXJlID0gJycKICBpZiB3bSB0aGVuCiAgICBpZiBtb2RlID09ICd0cycgdGhlbgogICAgICB3aGVyZSA9ICcgV0hFUkUgJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKQogICAgZWxzZWlmIG1vZGUgPT0gJ2lkJyB0aGVuCiAgICAgIHdoZXJlID0gJyBXSEVSRSAnIC4uIGlkX2NvbCAuLiAnID4gJyAuLiBlc2Mod20uaWQpCiAgICBlbHNlCiAgICAgIHdoZXJlID0gJyBXSEVSRSAoJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKSAuLiAnKSBPUiAoJwogICAgICAgIC4uIHRzX2NvbCAuLiAnID0gJyAuLiBlc2Mod20udHMpIC4uICcgQU5EICcgLi4gaWRfY29sIC4uICcgPiAnIC4uIGVzYyh3bS5pZCkgLi4gJyknCiAgICBlbmQKICBlbmQKICBsb2NhbCBzZWwgPSAnU0VMRUNUICogRlJPTSAnIC4uIHNvdXJjZSAuLiB3aGVyZQoKICAtLSDpooTkvLDmnKzmrKHliqDovb3ooYzmlbAKICBsb2NhbCBucSwgZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gKCcgLi4gc2VsIC4uICcpJykKICBpZiBub3QgbnEgdGhlbiBlcnJvcignaW5jcmVtZW50YWw6ICcgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKG5xWzFdLm4pIG9yIDAKCiAgaWYgbiA+IDAgdGhlbgogICAgbG9jYWwgciA9IF9kdWNrZGJfY2FsbCgnSU5TRVJUIElOVE8gJyAuLiB0YXJnZXQgLi4gJyAnIC4uIHNlbCkKICAgIGlmIHR5cGUocikgPT0gJ3N0cmluZycgYW5kIHI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHI6c3ViKDcpLCAwKSBlbmQKCiAgICAtLSDmlrDmsLTkvY3vvJp0cyDlj5bmnKzmrKHmnIDlpKfvvJtpZCDlj5bmnKzmrKHmnIDlpKcKICAgIGxvY2FsIG5ld190cywgbmV3X2lkID0gbmlsLCBuaWwKICAgIGlmIG1vZGUgfj0gJ2lkJyB0aGVuCiAgICAgIGxvY2FsIG0gPSBfZHVja2RiX3F1ZXJ5KCdTRUxFQ1QgbWF4KCcgLi4gdHNfY29sIC4uICcpIEFTIHQgRlJPTSAoJyAuLiBzZWwgLi4gJyknKQogICAgICBpZiBtIHRoZW4gbmV3X3RzID0gbVsxXS50IGVuZAogICAgZW5kCiAgICBpZiBtb2RlIH49ICd0cycgdGhlbgogICAgICBsb2NhbCBtID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIG1heCgnIC4uIGlkX2NvbCAuLiAnKSBBUyBpIEZST00gKCcgLi4gc2VsIC4uICcpJykKICAgICAgaWYgbSB0aGVuIG5ld19pZCA9IG1bMV0uaSBlbmQKICAgIGVuZAogICAgaWYgbmV3X3RzIG9yIG5ld19pZCB0aGVuCiAgICAgIF9kdWNrZGJfY2FsbCgnSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyAnIC4uIGluY3JlbWVudGFsLndhdGVybWFya190YWJsZQogICAgICAgIC4uICcgVkFMVUVTICgnIC4uIGVzYyh0YXJnZXQpIC4uICcsICcgLi4gZXNjKG5ld190cykgLi4gJywgJyAuLiBlc2MobmV3X2lkKSAuLiAnLCBub3coKSknKQogICAgZW5kCiAgICByZXR1cm4ganJlcyhuLCBuZXdfdHMsIG5ld19pZCkKICBlbmQKICByZXR1cm4ganJlcygwLCB3bSBhbmQgd20udHMgb3IgbmlsLCB3bSBhbmQgd20uaWQgb3IgbmlsKQplbmQKCnJldHVybiBpbmNyZW1lbnRhbAoALS0gdG9fbGFuY2UubHVhOiDlop7ph4/liqDovb0g4oaSIExhbmNlIOaVsOaNrumbhuiQveWcsOerr++8iDIwMjYtMTAtMTbvvIkKLS0gQGxpYjogdG9fbGFuY2UKLS0gQGNhdGVnb3J5OiBldGwKLS0gQGRlc2M6IOWinumHj+WKoOi9veeahCBMYW5jZSDokL3lnLDnq6/igJTigJTkuI4gaW5jcmVtZW50YWwg5ZCM5p6E77yI5rC05L2N6KGoIGV0bF93YXRlcm1hcmsgLyB0c3xpZHx0c19pZCDkuInmuLjmoIfvvInvvIx0YXJnZXQg5pivIExhbmNlIOaVsOaNrumbhu+8mummlui3kSBDT1BZIENyZWF0ZeOAgeWQjue7rSBDT1BZIEFQUEVORO+8jOavj+asoeWGmeWPkeW4g+aWsCBkYXRhc2V0IHZlcnNpb27vvIjpnIAgbGFuY2VfY29udmVyc2lvbiDmianlsZXvvIkKLS0gQHNvdXJjZTogb3JpZ2luYWwKLS0gQHJlcXVpcmVzOiBsYW5jZV9jb252ZXJzaW9uIOaJqeWxle+8iOWQjOS8muivnSBMT0FE77yJ77yb5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJpfZHVja2RiX2NhbGwgLyBfZHVja2RiX3F1ZXJ5Ci0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSDkuI4gaW5jcmVtZW50YWwucnVuIOeahOWIhuW3pe+8iOWQjOS4gOawtOS9jeWNj+iuru+8jOS4pOS4quWHuuWPo++8ie+8mgotLSAgIGluY3JlbWVudGFsIOKGkiBEdWNrREIg6KGoIC8gRHVja0xha2Ug6KGo77yI566h5b+r54WnL0NEQ++8iQotLSAgIHRvX2xhbmNlICAgIOKGkiBMYW5jZSDmlbDmja7pm4bvvIjnrqHlkJHph48v5aSa5qih5oCBL+ajgOe0ou+8m+WumOaWuSBsYW5jZSDmianlsZXlj6/or7vlm57vvIkKLS0KLS0g55So5rOV77yIaW5zdGFsbCDlkI7vvInvvJoKLS0gICBMT0FEIGxhbmNlX2NvbnZlcnNpb247ICAtLSDlhpnkvqfkvp3otZYKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnaW5zdGFsbCcsIHNxbF9uYW1lIDo9ICd0b19sYW5jZScpOwotLSAgIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdjb21waWxlJywgc3FsX25hbWUgOj0gJ2xhbmNlX3J1bicsCi0tICAgICBzb3VyY2UgOj0gJ3JldHVybiBmdW5jdGlvbihvcHRzKSByZXR1cm4gdG9fbGFuY2UucnVuKG9wdHMpIGVuZCcpOwotLSAgIFNFTEVDVCBsYW5jZV9ydW4oe3NvdXJjZTo9J3NyY19vcmRlcnMnLCBkZXN0Oj0nb3JkZXJzLmxhbmNlJywgdHNfY29sOj0ndHMnLCBtb2RlOj0ndHMnfSk7Ci0tCi0tIOa4uOagh+aooeW8jyBtb2Rl77yI5ZCMIGluY3JlbWVudGFs77yJ77yaCi0tICAgJ3RzJyAgICDigJTigJQgV0hFUkUgdHMgPiBsYXN0X3RzICAgICAgICAgICAgICAgICAgICAgICAg5oyJ5pe26Ze05aKe6YePCi0tICAgJ2lkJyAgICDigJTigJQgV0hFUkUgaWQgPiBsYXN0X2lkICAgICAgICAgICAgICAgICAgICAgICAg5oyJ6Ieq5aKe6ZSu5aKe6YePCi0tICAgJ3RzX2lkJyDigJTigJQgV0hFUkUgdHMgPiBsYXN0X3RzIE9SICh0cyA9IGxhc3RfdHMgQU5EIGlkID4gbGFzdF9pZCkgIOWkjeWQiOa4uOagh++8jOWQjOaXtumXtOaIs+S4jea8j+S4jemHjQotLQotLSDmsLTkvY3ooajvvJpldGxfd2F0ZXJtYXJrKG5hbWUgVkFSQ0hBUiBQSywgbGFzdF90cyBUSU1FU1RBTVAsIGxhc3RfaWQgQklHSU5ULCB1cGRhdGVkX2F0IFRJTUVTVEFNUCkKLS0gICAgICAgICDkuI4gaW5jcmVtZW50YWwg5YWx55So77yIbmFtZSDnlKggZGVzdCDot6/lvoTlrZfnrKbkuLLvvIkKLS0g6L+U5ZueIEpTT07vvJp7ImxvYWRlZCI6TiwibGFzdF90cyI6Li4uLCJsYXN0X2lkIjouLi4sIndyaXRlIjoiY3JlYXRlInwiYXBwZW5kInwibm9vcCJ9Ci0tIOWPpuaciSBvcD0ncmVzZXQn77ya5riF5rC05L2N6YeN5paw5YWo6YeP77yIU0VMRUNUIGxhbmNlX3J1bih7b3A6J3Jlc2V0JywgZGVzdDonb3JkZXJzLmxhbmNlJ30pO++8iQotLQotLSDlt7Lnn6XovrnnlYzvvJoKLS0gICBsYW5jZSDkuI4gbGFuY2VfY29udmVyc2lvbiDkuI3og73lkIzkvJror50gTE9BRO+8iExBTkNFIENvcHlGdW5jdGlvbiDph43lkI3lhrLnqoHvvInigJTigJQKLS0gICDlhpnor7vliIbnprvvvJrmnKzlupPlhpnvvIhsYW5jZV9jb252ZXJzaW9uIOS8muivne+8ie+8jOWPpui1t+S8muivnSBMT0FEIGxhbmNlIOivu+WbnuOAggotLSAgIExhbmNlIEFQUEVORCDopoHmsYIgc2NoZW1hIOWFvOWuue+8m2Rlc3Qg6aaW6LeR5b+F6aG75LiN5a2Y5Zyo77yIQ3JlYXRlIOivreS5ie+8ieOAggoKbG9jYWwgdG9fbGFuY2UgPSB7fQp0b19sYW5jZS53YXRlcm1hcmtfdGFibGUgPSAnZXRsX3dhdGVybWFyaycKCi0tIOWGheiBlCBKU09OIOe8luino+egge+8iOiHquWMheWQq++8jOWNleaWh+S7tue6puWumu+8m2VuY29kZXIg5Y+C6ICDIHJ4aS9qc29uLmx1YSDmgJ3ot6/nmoTmnIDlsI/lrZDpm4bvvIkKbG9jYWwgZnVuY3Rpb24ganNvbl9kZWNvZGUocykKICAtLSDmnIDlsI8gSlNPTiDlr7nosaHop6PmnpDvvJrplK7lgLzlnYfkuLrlrZfnrKbkuLIv5pWw5a2X77yI5pys5bqT5YWl5Y+C5b2i5oCB77yJCiAgbG9jYWwgdCA9IHt9CiAgbG9jYWwgYm9keSA9IHM6bWF0Y2goJ14lcyp7KC4qKX0lcyokJykKICBpZiBub3QgYm9keSB0aGVuIHJldHVybiBuaWwgZW5kCiAgbG9jYWwgcG9zID0gMQogIGxvY2FsIGZ1bmN0aW9uIHNraXAoKSBwb3MgPSBib2R5OmZpbmQoJ1teLCVzXScsIHBvcykgb3IgI2JvZHkgKyAxIGVuZAogIHdoaWxlIHBvcyA8PSAjYm9keSBkbwogICAgc2tpcCgpCiAgICBpZiBwb3MgPiAjYm9keSB0aGVuIGJyZWFrIGVuZAogICAgbG9jYWwga19zLCBrX2UgPSBib2R5OmZpbmQoJ14iKFteIl0qKSIlcyo6JywgcG9zKQogICAgaWYgbm90IGtfcyB0aGVuIGJyZWFrIGVuZAogICAgbG9jYWwga2V5ID0gYm9keTptYXRjaCgnXiIoW14iXSopIiVzKjonLCBwb3MpCiAgICBwb3MgPSBrX2UgKyAxCiAgICBsb2NhbCB2X3MgPSBib2R5OmZpbmQoJ1teLCVzXScsIHBvcykKICAgIGlmIG5vdCB2X3MgdGhlbiBicmVhayBlbmQKICAgIGxvY2FsIHZhbAogICAgbG9jYWwgcSA9IGJvZHk6c3ViKHZfcywgdl9zKQogICAgaWYgcSA9PSAnIicgdGhlbgogICAgICB2YWwgPSBib2R5Om1hdGNoKCdeIihbXiJdKikiJywgdl9zKQogICAgICBwb3MgPSB2X3MgKyAjdmFsICsgMgogICAgZWxzZWlmIHEgPT0gJ3snIG9yIHEgPT0gJ1snIHRoZW4KICAgICAgZXJyb3IoJ3RvX2xhbmNlOiBuZXN0ZWQgSlNPTiB2YWx1ZXMgbm90IHN1cHBvcnRlZCBpbiBvcHRzJywgMCkKICAgIGVsc2UKICAgICAgbG9jYWwgbnVtID0gYm9keTptYXRjaCgnXlslLSVkJS5lRV0rJywgdl9zKQogICAgICB2YWwgPSB0b251bWJlcihudW0pIG9yIG51bQogICAgICBwb3MgPSB2X3MgKyAjKG51bSBvciAnJykKICAgIGVuZAogICAgdFtrZXldID0gdmFsCiAgICBwb3MgPSBib2R5OmZpbmQoJywnLCBwb3MpIG9yICNib2R5ICsgMQogICAgcG9zID0gcG9zICsgMQogIGVuZAogIHJldHVybiB0CmVuZAoKbG9jYWwgZnVuY3Rpb24ganNvbl9lbmNvZGUodikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgaWYgdHlwZSh2KSA9PSAnbnVtYmVyJyB0aGVuCiAgICByZXR1cm4gdiA9PSBtYXRoLmZsb29yKHYpIGFuZCBzdHJpbmcuZm9ybWF0KCclZCcsIHYpIG9yIHRvc3RyaW5nKHYpCiAgZW5kCiAgaWYgdHlwZSh2KSB+PSAnc3RyaW5nJyB0aGVuIHJldHVybiB0b3N0cmluZyh2KSBlbmQKICByZXR1cm4gJyInIC4uIHY6Z3N1YignXFwnLCAnXFxcXCcpOmdzdWIoJyInLCAnXFwiJykgLi4gJyInCmVuZAoKbG9jYWwgZnVuY3Rpb24ganJlcyhsb2FkZWQsIGxhc3RfdHMsIGxhc3RfaWQsIHdyaXRlKQogIGxvY2FsIHBhcnRzID0ge30KICBwYXJ0c1sjcGFydHMgKyAxXSA9ICcibG9hZGVkIjonIC4uIHRvc3RyaW5nKGxvYWRlZCkKICBwYXJ0c1sjcGFydHMgKyAxXSA9ICcibGFzdF90cyI6JyAuLiBqc29uX2VuY29kZShsYXN0X3RzKQogIHBhcnRzWyNwYXJ0cyArIDFdID0gJyJsYXN0X2lkIjonIC4uIGpzb25fZW5jb2RlKGxhc3RfaWQpCiAgcGFydHNbI3BhcnRzICsgMV0gPSAnIndyaXRlIjonIC4uIGpzb25fZW5jb2RlKHdyaXRlKQogIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwplbmQKCmxvY2FsIGZ1bmN0aW9uIGVzYyh2KQogIGlmIHR5cGUodikgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gIiciIC4uIHY6Z3N1YigiJyIsICInJyIpIC4uICInIiBlbmQKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnTlVMTCcgZW5kCiAgcmV0dXJuIHRvc3RyaW5nKHYpCmVuZAoKLS0g5Yid5aeL5YyW5rC05L2N6KGo77yI5bmC562J77yb5LiOIGluY3JlbWVudGFsIOWFseeUqO+8iQpmdW5jdGlvbiB0b19sYW5jZS5pbml0KCkKICBfZHVja2RiX2NhbGwoJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICcgLi4gdG9fbGFuY2Uud2F0ZXJtYXJrX3RhYmxlCiAgICAuLiAnIChuYW1lIFZBUkNIQVIgUFJJTUFSWSBLRVksIGxhc3RfdHMgVElNRVNUQU1QLCBsYXN0X2lkIEJJR0lOVCwgdXBkYXRlZF9hdCBUSU1FU1RBTVApJykKZW5kCgotLSDor7vmsLTkvY3vvJrov5Tlm54ge3RzPS4uLiwgaWQ9Li4ufSDmiJYgbmls77yI6aaW5qyh77yJCmZ1bmN0aW9uIHRvX2xhbmNlLndhdGVybWFyayhuYW1lKQogIHRvX2xhbmNlLmluaXQoKQogIGxvY2FsIHJvd3MgPSBfZHVja2RiX3F1ZXJ5KCdTRUxFQ1QgbGFzdF90cywgbGFzdF9pZCBGUk9NICcgLi4gdG9fbGFuY2Uud2F0ZXJtYXJrX3RhYmxlCiAgICAuLiAnIFdIRVJFIG5hbWUgPSAnIC4uIGVzYyhuYW1lKSkKICBpZiBub3Qgcm93cyBvciAjcm93cyA9PSAwIHRoZW4gcmV0dXJuIG5pbCBlbmQKICByZXR1cm4geyB0cyA9IHJvd3NbMV0ubGFzdF90cywgaWQgPSByb3dzWzFdLmxhc3RfaWQgfQplbmQKCi0tIOa4heawtOS9je+8iOmHjeaWsOWFqOmHj++8iQpmdW5jdGlvbiB0b19sYW5jZS5yZXNldChuYW1lKQogIHRvX2xhbmNlLmluaXQoKQogIF9kdWNrZGJfY2FsbCgnREVMRVRFIEZST00gJyAuLiB0b19sYW5jZS53YXRlcm1hcmtfdGFibGUgLi4gJyBXSEVSRSBuYW1lID0gJyAuLiBlc2MobmFtZSkpCmVuZAoKLS0g5omn6KGM5aKe6YePIOKGkiBMYW5jZQotLSBvcHRzID0geyBzb3VyY2U95rqQ6KGoLCBkZXN0PUxhbmNlIOaVsOaNrumbhui3r+W+hCwgdHNfY29sPT8sIGlkX2NvbD0/LCBtb2RlPSd0cyd8J2lkJ3wndHNfaWQnIH0KLS0g6L+U5ZueIEpTT04g5a2X56ym5LiyCmZ1bmN0aW9uIHRvX2xhbmNlLnJ1bihvcHRzKQogIG9wdHMgPSBvcHRzIG9yIHt9CiAgbG9jYWwgc291cmNlLCBkZXN0ID0gb3B0cy5zb3VyY2UsIG9wdHMuZGVzdAogIGlmIG5vdCBzb3VyY2Ugb3Igbm90IGRlc3QgdGhlbiBlcnJvcigndG9fbGFuY2U6IHNvdXJjZSBhbmQgZGVzdCByZXF1aXJlZCcsIDApIGVuZAogIGxvY2FsIG1vZGUgPSBvcHRzLm1vZGUgb3IgJ3RzJwogIGxvY2FsIHRzX2NvbCwgaWRfY29sID0gb3B0cy50c19jb2wsIG9wdHMuaWRfY29sCiAgaWYgbW9kZSA9PSAndHMnIGFuZCBub3QgdHNfY29sIHRoZW4gZXJyb3IoJ3RvX2xhbmNlOiB0c19jb2wgcmVxdWlyZWQgZm9yIG1vZGU9dHMnLCAwKSBlbmQKICBpZiBtb2RlID09ICdpZCcgYW5kIG5vdCBpZF9jb2wgdGhlbiBlcnJvcigndG9fbGFuY2U6IGlkX2NvbCByZXF1aXJlZCBmb3IgbW9kZT1pZCcsIDApIGVuZAogIGlmIG1vZGUgPT0gJ3RzX2lkJyBhbmQgKG5vdCB0c19jb2wgb3Igbm90IGlkX2NvbCkgdGhlbgogICAgZXJyb3IoJ3RvX2xhbmNlOiB0c19jb2wgYW5kIGlkX2NvbCByZXF1aXJlZCBmb3IgbW9kZT10c19pZCcsIDApIGVuZAoKICBsb2NhbCB3bSA9IHRvX2xhbmNlLndhdGVybWFyayhkZXN0KQogIGxvY2FsIHdoZXJlID0gJycKICBpZiB3bSB0aGVuCiAgICBpZiBtb2RlID09ICd0cycgdGhlbgogICAgICB3aGVyZSA9ICcgV0hFUkUgJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKQogICAgZWxzZWlmIG1vZGUgPT0gJ2lkJyB0aGVuCiAgICAgIHdoZXJlID0gJyBXSEVSRSAnIC4uIGlkX2NvbCAuLiAnID4gJyAuLiBlc2Mod20uaWQpCiAgICBlbHNlCiAgICAgIHdoZXJlID0gJyBXSEVSRSAoJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKSAuLiAnKSBPUiAoJwogICAgICAgIC4uIHRzX2NvbCAuLiAnID0gJyAuLiBlc2Mod20udHMpIC4uICcgQU5EICcgLi4gaWRfY29sIC4uICcgPiAnIC4uIGVzYyh3bS5pZCkgLi4gJyknCiAgICBlbmQKICBlbmQKICBsb2NhbCBzZWwgPSAnU0VMRUNUICogRlJPTSAnIC4uIHNvdXJjZSAuLiB3aGVyZQoKICAtLSDpooTkvLDmnKzmrKHliqDovb3ooYzmlbAKICBsb2NhbCBucSwgZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gKCcgLi4gc2VsIC4uICcpJykKICBpZiBub3QgbnEgdGhlbiBlcnJvcigndG9fbGFuY2U6ICcgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKG5xWzFdLm4pIG9yIDAKICBpZiBuID09IDAgdGhlbgogICAgcmV0dXJuIGpyZXMoMCwgd20gYW5kIHdtLnRzIG9yIG5pbCwgd20gYW5kIHdtLmlkIG9yIG5pbCwgJ25vb3AnKQogIGVuZAoKICAtLSDpppbot5EgQ3JlYXRl44CB5ZCO57utIEFQUEVORO+8iExhbmNlIGRhdGFzZXQgdmVyc2lvbiDor63kuYnlpKnnhLbpgILphY3lop7ph4/vvIkKICBsb2NhbCBjb3B5X21vZGUgPSB3bSBhbmQgJywgQVBQRU5EJyBvciAnJwogIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoIkNPUFkgKCIgLi4gc2VsIC4uICIpIFRPICciIC4uIGRlc3Q6Z3N1YigiJyIsICInJyIpCiAgICAuLiAiJyAoRk9STUFUIExBTkNFIiAuLiBjb3B5X21vZGUgLi4gIikiKQogIGlmIHR5cGUocikgPT0gJ3N0cmluZycgYW5kIHI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHI6c3ViKDcpLCAwKSBlbmQKCiAgLS0g5paw5rC05L2N77yadHMg5Y+W5pys5qyh5pyA5aSn77ybaWQg5Y+W5pys5qyh5pyA5aSnCiAgbG9jYWwgbmV3X3RzLCBuZXdfaWQgPSBuaWwsIG5pbAogIGlmIG1vZGUgfj0gJ2lkJyB0aGVuCiAgICBsb2NhbCBtID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIG1heCgnIC4uIHRzX2NvbCAuLiAnKSBBUyB0IEZST00gKCcgLi4gc2VsIC4uICcpJykKICAgIGlmIG0gdGhlbiBuZXdfdHMgPSBtWzFdLnQgZW5kCiAgZW5kCiAgaWYgbW9kZSB+PSAndHMnIHRoZW4KICAgIGxvY2FsIG0gPSBfZHVja2RiX3F1ZXJ5KCdTRUxFQ1QgbWF4KCcgLi4gaWRfY29sIC4uICcpIEFTIGkgRlJPTSAoJyAuLiBzZWwgLi4gJyknKQogICAgaWYgbSB0aGVuIG5ld19pZCA9IG1bMV0uaSBlbmQKICBlbmQKICBpZiBuZXdfdHMgb3IgbmV3X2lkIHRoZW4KICAgIF9kdWNrZGJfY2FsbCgnSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyAnIC4uIHRvX2xhbmNlLndhdGVybWFya190YWJsZQogICAgICAuLiAnIFZBTFVFUyAoJyAuLiBlc2MoZGVzdCkgLi4gJywgJyAuLiBlc2MobmV3X3RzKSAuLiAnLCAnIC4uIGVzYyhuZXdfaWQpIC4uICcsIG5vdygpKScpCiAgZW5kCiAgcmV0dXJuIGpyZXMobiwgbmV3X3RzLCBuZXdfaWQsIHdtIGFuZCAnYXBwZW5kJyBvciAnY3JlYXRlJykKZW5kCgotLSDlhaXlj6PvvJrmjqUgbHVhaml0X3Mg55qEIEpTT04g5a2X56ym5Liy77yI6LCD55So57qm5a6a77ya5a2X56ym5Liy5Y+C5pWw77yb5pys5bqT6Ieq5bim5p6B566A6Kej56CB77yJ77yMCi0tIOaIliBzdHJ1Y3Qg55u05Lyg77yIY29tcGlsZSB3cmFwcGVyIOmXreWMheWcuuaZr++8ieOAgm9w77yacnVu77yI6buY6K6k77yJLyByZXNldOOAggpmdW5jdGlvbiB0b19sYW5jZS5lbnRyeShyYXcpCiAgbG9jYWwgb3B0cyA9IHJhdwogIGlmIHR5cGUocmF3KSA9PSAnc3RyaW5nJyB0aGVuCiAgICBvcHRzID0ganNvbl9kZWNvZGUocmF3KQogICAgaWYgdHlwZShvcHRzKSB+PSAndGFibGUnIHRoZW4gZXJyb3IoJ3RvX2xhbmNlOiBiYWQgSlNPTiBvcHRzOiAnIC4uIHRvc3RyaW5nKHJhdyksIDApIGVuZAogIGVuZAogIG9wdHMgPSBvcHRzIG9yIHt9CiAgbG9jYWwgb3AgPSBvcHRzLm9wIG9yICdydW4nCiAgaWYgb3AgPT0gJ3Jlc2V0JyB0aGVuCiAgICB0b19sYW5jZS5yZXNldChvcHRzLmRlc3QpCiAgICByZXR1cm4gJ3sib2siOnRydWUsInJlc2V0IjonIC4uIGpzb25fZW5jb2RlKG9wdHMuZGVzdCkgLi4gJ30nCiAgZW5kCiAgcmV0dXJuIHRvX2xhbmNlLnJ1bihvcHRzKQplbmQKCnJldHVybiB0b19sYW5jZQoAX2R1Y2tkYl9jYWxsID0gZnVuY3Rpb24oc3FsKSByZXR1cm4gX19kYmMoc3FsKSBlbmQKX2R1Y2tkYl9xdWVyeSA9IGZ1bmN0aW9uKHNxbCkKICBsb2NhbCBzID0gX19kYnEoc3FsKQogIGxvY2FsIG9rLCBqID0gcGNhbGwoX2xpYnMuanNvbi5kZWNvZGUsIHMpCiAgaWYgbm90IG9rIG9yIHR5cGUoaikgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiBuaWwsICdkZWNvZGVfZXJyOiAnIC4uIHRvc3RyaW5nKGopIGVuZAogIHJldHVybiBqLnJvd3MsIGouZXJyCmVuZAoALS0gQGxpYjogcmJhYwotLSBAY2F0ZWdvcnk6IHNlY3VyaXR5Ci0tIEBkZXNjOiBRdWFjayBSQkFDIOetlueVpeW8leaTjuKAlOKAlHRva2VuIOiupOivgSArIOi/nuaOpeS8muivneiusOW9lSArIOinkuiJsuihqOe6p+aOiOadgyArIOWPquivu+eZveWQjeWNleWKoOWbuu+8jAotLSAgICAgICAg5oyCIHF1YWNrX2F1dGhlbnRpY2F0aW9uX2Z1bmN0aW9uIC8gcXVhY2tfYXV0aG9yaXphdGlvbl9mdW5jdGlvbiDpkqnlrZDvvIjmma7pgJrmqKHlvI/vvIzpnIAgX2R1Y2tkYl9xdWVyee+8iQotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yJCi0tIEByZXF1aXJlczogX2R1Y2tkYl9xdWVyee+8iOaZrumAmuaooeW8j++8m3RydXN0ZWQg5rKZ566x5LiL5LiN5Y+v55So77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSBSb2xlLUJhc2VkIEFjY2VzcyBDb250cm9sIHBvbGljeSBlbmdpbmUgZm9yIER1Y2tEQiBRdWFjayAoTHVhSklUIDUuMSkuCi0tCi0tIOWumuS9je+8mlF1YWNrIOaYr+W8uuWItueCue+8iOavj+adoeafpeivoiBQUkVQQVJFIOWJjei3kSBhdXRob3JpemF0aW9uIOmSqeWtkO+8ie+8jOacrOW6k+aYr+etlueVpeW8leaTjuOAggotLSDlronlhajliY3mj5DvvIjliqHlv4Xor7vvvInvvJoKLS0gICAxKSDmjojmnYPpkqnlrZDpu5jorqTmi5Lnu53kuIDliIflhpnor63lj6XvvIhhbGxvd193cml0ZT1mYWxzZe+8ieKAlOKAlOWQpuWImeWuouaIt+err+WPrwotLSAgICAgIFNFVCBHTE9CQUwgcXVhY2tfYXV0aG9yaXphdGlvbl9mdW5jdGlvbiAvIENSRUFURSBPUiBSRVBMQUNFIE1BQ1JPIC8g56+h5pS55p2D6ZmQ6KGoIOe7lei/h++8mwotLSAgIDIpIOadg+mZkOWFg+aVsOaNruihqOS4juaVsOaNruWQjOW5s+mdou+8jOacrOW6k+mAmui/h+KAnOemgeWGmeKAneS/neaKpOWug+S7rO+8iOeuoeeQhuWRmOWcqOacjeWKoeWZqOacrOWcsOaJp+ihjCBncmFudC9zZXR1cO+8ie+8mwotLSAgIDMpIOivreWPpeexu+Wei+WIpOaWreWfuuS6jiBTUUwg5paH5pys5YmN57yA77yM6Z2e6Kej5p6Q5Zmo4oCU4oCU5a6Y5pa55paH5qGj5Lqm6K2m5ZGKCi0tICAgICAg4oCcV0lUSCB4IEFTIChTRUxFQ1QgMSkgSU5TRVJUIElOVE8gdCAuLi7igJ0g5Z6L57uV6L+H77ybc3RyaWN0X3dyaXRlPXRydWUg5pe2IFdJVEgg5YmN57yA5LiA5b6L5ouS57ud77yI5a6B5Y+v6ZSZ5p2A77yJ44CCCi0tCi0tIOihqOaooeWei++8iOeuoeeQhuWRmOWcqOacjeWKoeWZqOS8muivneaJp+ihjCBsdWFqaXRfcygncmJhYycsIHtvcDonc2V0dXAnfSkg5LiA5qyh77yJ77yaCi0tICAgcXVhY2tfdG9rZW5zIChhdXRoX3Rva2VuIFBLLCB1c2VyX25hbWUpICAgLS0gdG9rZW7ihpLnlKjmiLcKLS0gICBxdWFja19zZXNzaW9ucyAoc2lkIFBLLCB1c2VyX25hbWUpICAgICAgICAtLSDov57mjqXihpLnlKjmiLfvvIhhdXRobiDpkqnlrZDlhpnlhaXvvIkKLS0gICB1c2VyX3JvbGVzICh1c2VyX25hbWUsIHJvbGUpICAgICAgICAgICAgICAtLSDnlKjmiLfihpLop5LoibIKLS0gICByb2xlX3Blcm1zIChyb2xlLCB0YWJsZV9uYW1lLCBjYW5fc2VsZWN0LCBjYW5fd3JpdGUpICAtLSDop5LoibLihpLooajmnYPpmZAKLS0KLS0g5oyC6ZKp77yI5pyN5Yqh5Zmo5Lya6K+d77yMTE9BRCBsdWFqaXQgKyBjb21waWxlIOacrOW6k+S5i+WQju+8ie+8mgotLSAgIENSRUFURSBNQUNSTyByYmFjX2F1dGhuKHNpZCwgY3QsIHN0KSBBUyAobHVhaml0X3MoJ3JiYWMnLCB7b3A6J2F1dGhuJywgc2lkOnNpZCwgY2xpZW50X3Rva2VuOmN0LCBzZXJ2ZXJfdG9rZW46c3R9KTo6Qk9PTEVBTik7Ci0tICAgQ1JFQVRFIE1BQ1JPIHJiYWNfYXV0aHooc2lkLCBxKSAgICBBUyAobHVhaml0X3MoJ3JiYWMnLCB7b3A6J2F1dGh6Jywgc2lkOnNpZCwgcTpxfSk6OkJPT0xFQU4pOwotLSAgIFNFVCBHTE9CQUwgcXVhY2tfYXV0aGVudGljYXRpb25fZnVuY3Rpb24gPSAncmJhY19hdXRobic7Ci0tICAgU0VUIEdMT0JBTCBxdWFja19hdXRob3JpemF0aW9uX2Z1bmN0aW9uICA9ICdyYmFjX2F1dGh6JzsKLS0KLS0g6LCD55So77yIbHVhaml0X3MoJ3JiYWMnLCB7b3A6Li4ufSnvvInvvJoKLS0gICBhdXRobiAg4oaSIEJPT0xFQU7vvIjmn6UgdG9rZW4g6KGoICsg5YaZ5Lya6K+d6KGo77yJCi0tICAgYXV0aHogIOKGkiBCT09MRUFO77yI55m95ZCN5Y2VICsg6KeS6Imy6KGo57qn5p2D6ZmQ77yJCi0tICAgZ3JhbnQgIOKGkiDnrqHnkIblkZjkuJPnlKgge29wOidncmFudCcsIHJvbGUsIHRibCwgY2FuX3NlbGVjdCwgY2FuX3dyaXRlfSDmlLkgcm9sZV9wZXJtc++8iOS7heacjeWKoeWZqOacrOWcsOaJp+ihjO+8ge+8iQotLSAgIHNldHVwICDihpIg566h55CG5ZGY5LiT55So77ya5bu6IDQg5bygIFJCQUMg6KGo77yI5LuF5pyN5Yqh5Zmo5pys5Zyw5omn6KGM77yB77yJCi0tICAgc3RhdHVzIOKGkiDphY3nva7lv6vnhafvvIjosIPor5XnlKjvvIkKCmxvY2FsIENPTkZJRyA9IHsKICB0b2tlbnNfdGFibGUgICA9ICdxdWFja190b2tlbnMnLAogIHNlc3Npb25zX3RhYmxlID0gJ3F1YWNrX3Nlc3Npb25zJywKICByb2xlc190YWJsZSAgICA9ICd1c2VyX3JvbGVzJywKICBwZXJtc190YWJsZSAgICA9ICdyb2xlX3Blcm1zJywKICBwcm90ZWN0ZWQgICAgICA9IHsgJ3NlY3JldF9kYXRhJywgJ3B1YmxpY19kYXRhJyB9LCAgLS0g5Y+X5o6n6KGo5riF5Y2V77yIYXV0aHog6YCQ6KGo5p+l5p2D6ZmQ77yJCiAgYWxsb3dfd3JpdGUgICAgPSBmYWxzZSwgIC0tIHRydWUgPSDmlL7ooYzlhpnor63lj6XlubbmjIkgY2FuX3dyaXRlIOe7hueykuW6puaOiOadg++8m2ZhbHNlID0g5LiA5YiH5YaZ6K+t5Y+l5ouS57ud77yI5o6o6I2Q77yJCiAgc3RyaWN0X3dyaXRlICAgPSB0cnVlLCAgIC0tIHRydWUgPSBXSVRIIOW8gOWktOS4gOW+i+aLkue7ne+8iOmYsiDigJxXSVRIIHggQVMgKFNFTEVDVCAxKSBJTlNFUlQgSU5UTyB04oCdIOWei+e7lei/h++8iQogIGF1ZGl0X3RhYmxlICAgID0gbmlsLCAgICAtLSDorr4gJ3JiYWNfYXVkaXQnIOWImSBhdXRoeiDmr4/mrKHlhrPnrZborrDlrqHorqHvvIjmr4/mn6Xor6LlpJrkuIDmrKHlhpnvvIzmgKfog73mlY/mhJ/mhY7nlKjvvIkKfQoKbG9jYWwgUkVBRF9LV1MgID0geyAnU0VMRUNUJywgJ0ZST00nLCAnV0lUSCcsICdFWFBMQUlOJywgJ0RFU0NSSUJFJywgJ1NIT1cnLCAnVkFMVUVTJywgJ1RBQkxFJywgJ1BSQUdNQScsICdTVU1NQVJJWkUnIH0KbG9jYWwgV1JJVEVfS1dTID0geyAnSU5TRVJUJywgJ1VQREFURScsICdERUxFVEUnLCAnTUVSR0UnLCAnQ09QWScsICdDUkVBVEUnLCAnRFJPUCcsICdBTFRFUicsICdTRVQnLCAnQ0FMTCcsCiAgICAgICAgICAgICAgICAgICAgJ0FUVEFDSCcsICdERVRBQ0gnLCAnRVhQT1JUJywgJ0lNUE9SVCcsICdDSEVDS1BPSU5UJywgJ1ZBQ1VVTScsICdDT01NRU5UJywgJ0lOU1RBTEwnLAogICAgICAgICAgICAgICAgICAgICdMT0FEJywgJ1BSRVBBUkUnLCAnRVhFQ1VURScsICdVU0UnLCAnR1JBTlQnLCAnUkVWT0tFJywgJ1RSVU5DQVRFJyB9Cgpsb2NhbCBmdW5jdGlvbiBlc2MocykKICByZXR1cm4gKHM6Z3N1YigiJyIsICInJyIpKQplbmQKCmxvY2FsIGZ1bmN0aW9uIHEocm93cywgaSwgY29sKQogIHJldHVybiByb3dzIGFuZCByb3dzW2ldIGFuZCByb3dzW2ldW2NvbF0KZW5kCgpsb2NhbCBmdW5jdGlvbiBjbGFzc2lmeSh1cCkKICBmb3IgXywga3cgaW4gaXBhaXJzKFJFQURfS1dTKSBkbwogICAgaWYgdXA6ZmluZCgnXicgLi4ga3cpIHRoZW4gcmV0dXJuICdyZWFkJyBlbmQKICBlbmQKICBmb3IgXywga3cgaW4gaXBhaXJzKFdSSVRFX0tXUykgZG8KICAgIGlmIHVwOmZpbmQoJ14nIC4uIGt3KSB0aGVuIHJldHVybiAnd3JpdGUnIGVuZAogIGVuZAogIHJldHVybiAndW5rbm93bicgIC0tIOacquivhuWIq+WJjee8gO+8muaLkue7nQplbmQKCmxvY2FsIGZ1bmN0aW9uIHJlc29sdmVfdXNlcihzaWQpCiAgbG9jYWwgdSA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCB1c2VyX25hbWUgRlJPTSAiIC4uIENPTkZJRy5zZXNzaW9uc190YWJsZSAuLiAiIFdIRVJFIHNpZCA9ICciIC4uIGVzYyhzaWQgb3IgJycpIC4uICInIikKICByZXR1cm4gcSh1LCAxLCAndXNlcl9uYW1lJykKZW5kCgpsb2NhbCBmdW5jdGlvbiB1c2VyX2hhc19wZXJtKHVzZXIsIHRibCwgbmVlZF93cml0ZSkKICBsb2NhbCBjb2wgPSBuZWVkX3dyaXRlIGFuZCAnY2FuX3dyaXRlJyBvciAnY2FuX3NlbGVjdCcKICBsb2NhbCByID0gX2R1Y2tkYl9xdWVyeSgKICAgICJTRUxFQ1QgQ09VTlQoKikgQVMgbiBGUk9NICIgLi4gQ09ORklHLnJvbGVzX3RhYmxlIC4uICIgdXIgSk9JTiAiIC4uIENPTkZJRy5wZXJtc190YWJsZSAuLiAiIHJwIE9OIHJwLnJvbGUgPSB1ci5yb2xlICIgLi4KICAgICJXSEVSRSB1ci51c2VyX25hbWUgPSAnIiAuLiBlc2ModXNlcikgLi4gIicgQU5EIHJwLnRhYmxlX25hbWUgPSAnIiAuLiBlc2ModGJsKSAuLiAiJyBBTkQgcnAuIiAuLiBjb2wgLi4gIiA9IHRydWUiKQogIHJldHVybiAocShyLCAxLCAnbicpIG9yIDApID4gMAplbmQKCmxvY2FsIGZ1bmN0aW9uIGNoZWNrX3RhYmxlcyhxdWVyeSwgdXNlciwgbmVlZF93cml0ZSkKICBmb3IgXywgdGJsIGluIGlwYWlycyhDT05GSUcucHJvdGVjdGVkKSBkbwogICAgaWYgc3RyaW5nLmZpbmQocXVlcnksIHRibCwgMSwgdHJ1ZSkgdGhlbgogICAgICBpZiBub3QgdXNlcl9oYXNfcGVybSh1c2VyLCB0YmwsIG5lZWRfd3JpdGUpIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgpsb2NhbCBmdW5jdGlvbiBhdXRobihwKQogIGxvY2FsIHJvd3MgPSBfZHVja2RiX3F1ZXJ5KAogICAgIlNFTEVDVCB1c2VyX25hbWUgRlJPTSAiIC4uIENPTkZJRy50b2tlbnNfdGFibGUgLi4gIiBXSEVSRSBhdXRoX3Rva2VuID0gJyIgLi4gZXNjKHAuY2xpZW50X3Rva2VuIG9yICcnKSAuLiAiJyIpCiAgbG9jYWwgdXNlciA9IHEocm93cywgMSwgJ3VzZXJfbmFtZScpCiAgaWYgbm90IHVzZXIgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgX2R1Y2tkYl9xdWVyeSgiSU5TRVJUIElOVE8gIiAuLiBDT05GSUcuc2Vzc2lvbnNfdGFibGUgLi4gIiBWQUxVRVMgKCciIC4uIGVzYyhwLnNpZCBvciAnJykgLi4gIicsICciIC4uIGVzYyh1c2VyKSAuLiAiJykiKQogIHJldHVybiB0cnVlCmVuZAoKbG9jYWwgZnVuY3Rpb24gYXV0aHoocCkKICBsb2NhbCBxdWVyeSA9IHAucSBvciAnJwogIGxvY2FsIHVwID0gc3RyaW5nLnVwcGVyKHF1ZXJ5OmdzdWIoJ14lcysnLCAnJyk6Z3N1YignJXMrJCcsICcnKSkKICBpZiB1cCA9PSAnJyB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBsb2NhbCBraW5kID0gY2xhc3NpZnkodXApCiAgaWYga2luZCA9PSAndW5rbm93bicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYga2luZCA9PSAncmVhZCcgYW5kIHVwOmZpbmQoJ15XSVRIJykgYW5kIENPTkZJRy5zdHJpY3Rfd3JpdGUgdGhlbiByZXR1cm4gZmFsc2UgZW5kICAtLSDpmLIgV0lUSCDms6jlhaXlvI/lhpnnu5Xov4cKICBsb2NhbCB1c2VyID0gcmVzb2x2ZV91c2VyKHAuc2lkKQogIGlmIG5vdCB1c2VyIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGxvY2FsIG5lZWRfd3JpdGUgPSAoa2luZCA9PSAnd3JpdGUnKQogIGlmIG5lZWRfd3JpdGUgYW5kIG5vdCBDT05GSUcuYWxsb3dfd3JpdGUgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgbm90IGNoZWNrX3RhYmxlcyhxdWVyeSwgdXNlciwgbmVlZF93cml0ZSkgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgQ09ORklHLmF1ZGl0X3RhYmxlIHRoZW4KICAgIF9kdWNrZGJfcXVlcnkoIklOU0VSVCBJTlRPICIgLi4gQ09ORklHLmF1ZGl0X3RhYmxlIC4uCiAgICAgICIgVkFMVUVTICgnIiAuLiBlc2MocC5zaWQgb3IgJycpIC4uICInLCAnIiAuLiBlc2ModXNlcikgLi4gIicsICciIC4uIGVzYyhxdWVyeSkgLi4gIicsIENVUlJFTlRfVElNRVNUQU1QKSIpCiAgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgotLSDnrqHnkIblkZjmk43kvZzvvJrku4XmnI3liqHlmajmnKzlnLDkvJror53miafooYzjgILoi6Xnu48gcXVhY2sg5a6i5oi356uv5omn6KGM77yM5Lya6KKrIGF1dGh6IOeZveWQjeWNleaLkue7neKAlOKAlOi/meato+aYr+iuvuiuoeaEj+WbvuOAggpsb2NhbCBmdW5jdGlvbiBncmFudChwKQogIGxvY2FsIG9rLCBlcnIgPSBwY2FsbChmdW5jdGlvbigpCiAgICBfZHVja2RiX3F1ZXJ5KCJJTlNFUlQgT1IgUkVQTEFDRSBJTlRPICIgLi4gQ09ORklHLnBlcm1zX3RhYmxlIC4uCiAgICAgICIgVkFMVUVTICgnIiAuLiBlc2MocC5yb2xlIG9yICcnKSAuLiAiJywgJyIgLi4gZXNjKHAudGJsIG9yICcnKSAuLiAiJywgIiAuLgogICAgICAocC5jYW5fc2VsZWN0IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJykgLi4gIiwgIiAuLiAocC5jYW5fd3JpdGUgYW5kICd0cnVlJyBvciAnZmFsc2UnKSAuLiAiKSIpCiAgZW5kKQogIHJldHVybiBvayBhbmQgJ29rJyBvciAoJ2Vycm9yOiAnIC4uIHRvc3RyaW5nKGVycikpCmVuZAoKbG9jYWwgZnVuY3Rpb24gc2V0dXAoKQogIGxvY2FsIGRkbCA9IHsKICAgICJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAiIC4uIENPTkZJRy50b2tlbnNfdGFibGUgLi4gIiAoYXV0aF90b2tlbiBWQVJDSEFSIFBSSU1BUlkgS0VZLCB1c2VyX25hbWUgVkFSQ0hBUikiLAogICAgIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICIgLi4gQ09ORklHLnNlc3Npb25zX3RhYmxlIC4uICIgKHNpZCBWQVJDSEFSIFBSSU1BUlkgS0VZLCB1c2VyX25hbWUgVkFSQ0hBUikiLAogICAgIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICIgLi4gQ09ORklHLnJvbGVzX3RhYmxlIC4uICIgKHVzZXJfbmFtZSBWQVJDSEFSLCByb2xlIFZBUkNIQVIpIiwKICAgICJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAiIC4uIENPTkZJRy5wZXJtc190YWJsZSAuLiAiIChyb2xlIFZBUkNIQVIsIHRhYmxlX25hbWUgVkFSQ0hBUiwgY2FuX3NlbGVjdCBCT09MRUFOLCBjYW5fd3JpdGUgQk9PTEVBTikiLAogIH0KICBmb3IgXywgcyBpbiBpcGFpcnMoZGRsKSBkbwogICAgbG9jYWwgb2ssIGVyciA9IHBjYWxsKGZ1bmN0aW9uKCkgX2R1Y2tkYl9xdWVyeShzKSBlbmQpCiAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ2Vycm9yOiAnIC4uIHRvc3RyaW5nKGVycikgZW5kCiAgZW5kCiAgcmV0dXJuICdvaycKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiBub3QgcCBvciBub3QgcC5vcCB0aGVuIHJldHVybiAnZXJyb3I6IG5lZWQgb3AnIGVuZAogIGlmIHAub3AgPT0gJ2F1dGhuJyB0aGVuIHJldHVybiBhdXRobihwKSBlbmQKICBpZiBwLm9wID09ICdhdXRoeicgdGhlbiByZXR1cm4gYXV0aHoocCkgZW5kCiAgaWYgcC5vcCA9PSAnZ3JhbnQnIHRoZW4gcmV0dXJuIGdyYW50KHApIGVuZAogIGlmIHAub3AgPT0gJ3NldHVwJyB0aGVuIHJldHVybiBzZXR1cCgpIGVuZAogIGlmIHAub3AgPT0gJ3N0YXR1cycgdGhlbgogICAgcmV0dXJuICdwcm90ZWN0ZWQ9JyAuLiB0YWJsZS5jb25jYXQoQ09ORklHLnByb3RlY3RlZCwgJywnKSAuLiAnO2FsbG93X3dyaXRlPScgLi4gdG9zdHJpbmcoQ09ORklHLmFsbG93X3dyaXRlKSAuLgogICAgICAgICAgICc7c3RyaWN0X3dyaXRlPScgLi4gdG9zdHJpbmcoQ09ORklHLnN0cmljdF93cml0ZSkgLi4gJzthdWRpdD0nIC4uIHRvc3RyaW5nKENPTkZJRy5hdWRpdF90YWJsZSBvciAnb2ZmJykKICBlbmQKICByZXR1cm4gJ2Vycm9yOiB1bmtub3duIG9wICcgLi4gdG9zdHJpbmcocC5vcCkKZW5kCgAtLSBAbGliOiBleHBvcnQKLS0gQGNhdGVnb3J5OiBleHBvcnQKLS0gQGRlc2M6IOWtmOWCqOi/h+eoi+W8j+WvvOWHuuKAlOKAlEx1YSDph4zkuIDmnaEgQ09QWSAocXVlcnkpIFRPIGZpbGXvvIzlj4LmlbDljJbmoLzlvI8v6Lev5b6E77yb6YWN5ZCIIENSRUFURSBNQUNSTyDlvZPlr7zlh7rov4fnqIvnlKgKLS0gQHNvdXJjZTogb3JpZ2luYWzvvIhkdWNrZGItbHVhaml0IOezu+WIl++8iQotLSBAcmVxdWlyZXM6IG5vbmXvvIjpnIDmma7pgJrmqKHlvI/igJTigJRfZHVja2RiX2NhbGwg5Zue6LCD5ZyoIHRydXN0ZWQg5rKZ566x5LiL5LiN5Y+v55So77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSBTdG9yZWQtcHJvY2VkdXJlIHN0eWxlIGV4cG9ydCBmb3IgZHVja2RiLWx1YWppdCAoTHVhSklUIDUuMSkuCi0tIFJ1bnMgQ09QWSB2aWEgdGhlIF9kdWNrZGJfY2FsbCBjYWxsYmFjayBvbiB0aGUgZXh0ZW5zaW9uJ3Mgc2Vjb25kIGNvbm5lY3Rpb24uCi0tIFVzYWdlOgotLSAgIFNFVCBWQVJJQUJMRSBzcmMgPSAoU0VMRUNUIGNvbnRlbnQgRlJPTSByZWFkX3RleHQoJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hbGl0cmFjay9kdWNrZGItbHVhaml0LWxpYnMvbWFpbi9saWJzL2V4cG9ydC9leHBvcnQubHVhJykpOwotLSAgIFNFTEVDVCBtZXNzYWdlIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdxdWlja19jb21waWxlJywgc3FsX25hbWUgOj0gJ2V4cG9ydCcsIHNvdXJjZSA6PSBnZXR2YXJpYWJsZSgnc3JjJykpOwotLSAgIFNFTEVDVCBleHBvcnQoe3F1ZXJ5OiAnU0VMRUNUICogRlJPTSB0IFdIRVJFIHF0eSA+PSAyJywgZmlsZTogJy90bXAvb3V0LnBhcnF1ZXQnfSk7Ci0tICAgLS0gb3IgYnkgdGFibGUgbmFtZSAodGJsIOKAlCAndGFibGUnIGlzIGEgRHVja0RCIGtleXdvcmQpOgotLSAgIFNFTEVDVCBleHBvcnQoe3RibDogJ3QnLCBmaWxlOiAnL3RtcC9vdXQuY3N2JywgZm9ybWF0OiAnY3N2J30pOwpsb2NhbCBGT1JNQVRTID0geyBwYXJxdWV0ID0gdHJ1ZSwgY3N2ID0gdHJ1ZSwganNvbiA9IHRydWUgfQoKbG9jYWwgZnVuY3Rpb24gZXNjKHMpCiAgcmV0dXJuIChzOmdzdWIoIiciLCAiJyciKSkKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiBub3QgcCBvciBub3QgcC5maWxlIHRoZW4gcmV0dXJuICdlcnJvcjogbmVlZCBmaWxlJyBlbmQKICBsb2NhbCBmbXQgPSBwLmZvcm1hdCBvciAncGFycXVldCcKICBpZiBub3QgRk9STUFUU1tmbXRdIHRoZW4gcmV0dXJuICdlcnJvcjogdW5zdXBwb3J0ZWQgZm9ybWF0OiAnIC4uIHRvc3RyaW5nKGZtdCkgZW5kCiAgbG9jYWwgc3JjCiAgaWYgcC5xdWVyeSB0aGVuCiAgICBzcmMgPSBwLnF1ZXJ5CiAgZWxzZWlmIHAudGJsIHRoZW4KICAgIHNyYyA9ICdTRUxFQ1QgKiBGUk9NICcgLi4gcC50YmwKICBlbHNlCiAgICByZXR1cm4gJ2Vycm9yOiBuZWVkIHF1ZXJ5IG9yIHRibCcKICBlbmQKICBsb2NhbCBzcWwgPSAiQ09QWSAoIiAuLiBzcmMgLi4gIikgVE8gJyIgLi4gZXNjKHAuZmlsZSkgLi4gIicgKEZPUk1BVCAiIC4uIGZtdCAuLiAiKSIKICBsb2NhbCBzdCA9IF9kdWNrZGJfY2FsbChzcWwpCiAgaWYgc3Qgfj0gJ29rJyB0aGVuIHJldHVybiBzdCBlbmQKICByZXR1cm4gJ29rOiAnIC4uIHAuZmlsZSAuLiAnICgnIC4uIGZtdCAuLiAnKScKZW5kCgAtLSBzY2QyLmx1YTog57yT5oWi5Y+Y5YyW57u05bqm77yIU0NEIOexu+WeiyAy77yJ4oCU4oCU5bGe5oCn5Y+Y5YyW5L+d55WZ5Y6G5Y+y54mI5pys77yIMjAyNi0wOC0xM++8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0g6ZyA6KaB5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJpfZHVja2RiX2NhbGwgLyBfZHVja2RiX3F1ZXJ5Ci0tCi0tIOeUqOazle+8iGluc3RhbGwg5ZCO77yJ77yaCi0tICAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGUgOj0gJ2luc3RhbGwnLCBzcWxfbmFtZSA6PSAnc2NkMicpOwotLSAgIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdjb21waWxlJywgc3FsX25hbWUgOj0gJ3NjZDJfcnVuJywKLS0gICAgIHNvdXJjZSA6PSAncmV0dXJuIGZ1bmN0aW9uKG9wdHMpIHJldHVybiBzY2QyLnJ1bihvcHRzKSBlbmQnKTsKLS0gICBTRUxFQ1Qgc2NkMl9ydW4oe3RhcmdldDo9J2RpbV9jdXN0b21lcicsIHNvdXJjZTo9J3NyY19jdXN0b21lcicsIGtleV9jb2w6PSdjdXN0X2lkJywKLS0gICAgICAgICAgICAgICAgICAgIGF0dHJfY29sczo9eydjaXR5JywndGllcid9LCB0c19jb2w6PSd0cyd9KTsKLS0KLS0g55uu5qCH6KGo57uT5p6E77yI6aaW5qyh6Ieq5Yqo5bu677yJ77yaCi0tICAgPOa6kOWFqOmDqOS4muWKoeWIlz4gKyBfdmFsaWRfZnJvbSBUSU1FU1RBTVAgKyBfdmFsaWRfdG8gVElNRVNUQU1QICsgX2lzX2N1cnJlbnQgQk9PTEVBTiArIF92ZXJzaW9uIEJJR0lOVAotLSDlsZ7mgKfmr5TovoPvvJptZDUoY29uY2F0X3dzKCd8JywgY2FzdChhIGFzIHZhcmNoYXIpLCAuLi4pKSDmjIfnurnvvIhEdWNrREIg5YaF5bu6IG1kNe+8iQotLSDor63kuYnvvJprZXkg55u45ZCMICsg5oyH57q55LiN5ZCMIOKGkiDlhbPpl63ml6fniYjmnKwoX3ZhbGlkX3RvPXRzLCBfaXNfY3VycmVudD1mYWxzZSnvvIzlvIDmlrDniYjmnKwodmVyc2lvbisxKQotLSAgICAgICBrZXkg5LiN5a2Y5ZyoIOKGkiDnm7TmjqXmj5LlhaUgdmVyc2lvbj0xCi0tICAgICAgIOaMh+e6ueebuOWQjCDihpIg6Lez6L+H77yI5bmC562J77yM6YeN5aSN6LeR5LiN5Lqn55Sf5paw54mI5pys77yJCi0tIOe6puWumu+8mnNvdXJjZSDkuLrooajlkI3vvJt0c19jb2wg5Lmf5Zyo5Lia5Yqh5YiX6YeM77yIU0VMRUNUICog5L+d55WZ77yJCgpsb2NhbCBzY2QyID0ge30KCmxvY2FsIGZ1bmN0aW9uIGVzYyh2KQogIGlmIHR5cGUodikgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gIiciIC4uIHY6Z3N1YigiJyIsICInJyIpIC4uICInIiBlbmQKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnTlVMTCcgZW5kCiAgcmV0dXJuIHRvc3RyaW5nKHYpCmVuZAoKLS0g5bGe5oCn5oyH57q56KGo6L6+5byPCmxvY2FsIGZ1bmN0aW9uIGZwX2V4cHIoYXR0cl9jb2xzKQogIGxvY2FsIHBhcnRzID0ge30KICBmb3IgXywgYyBpbiBpcGFpcnMoYXR0cl9jb2xzKSBkbwogICAgcGFydHNbI3BhcnRzICsgMV0gPSAnY29hbGVzY2UoY2FzdCgnIC4uIGMgLi4gJyBhcyB2YXJjaGFyKSwgY2hyKDApKScKICBlbmQKICByZXR1cm4gIm1kNShjb25jYXRfd3MoJ3wnLCAiIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywgJykgLi4gJykpJwplbmQKCi0tIOWPluihqOS4muWKoeWIl++8iOaMieWumuS5iemhuuW6j++8iQpsb2NhbCBmdW5jdGlvbiBjb2x1bW5zX29mKHRibCkKICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KAogICAgIlNFTEVDVCBjb2x1bW5fbmFtZSBGUk9NIGluZm9ybWF0aW9uX3NjaGVtYS5jb2x1bW5zIFdIRVJFIHRhYmxlX25hbWUgPSAiIC4uIGVzYyh0YmwpCiAgICAuLiAnIEFORCB0YWJsZV9zY2hlbWEgPSBjdXJyZW50X3NjaGVtYSgpIE9SREVSIEJZIG9yZGluYWxfcG9zaXRpb24nKQogIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IoJ3NjZDI6IGNhbm5vdCBpbnRyb3NwZWN0ICcgLi4gdGJsIC4uICc6ICcgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgY29scyA9IHt9CiAgZm9yIF8sIHIgaW4gaXBhaXJzKHJvd3MpIGRvIGNvbHNbI2NvbHMgKyAxXSA9IHIuY29sdW1uX25hbWUgZW5kCiAgaWYgI2NvbHMgPT0gMCB0aGVuIGVycm9yKCdzY2QyOiBubyBjb2x1bW5zIGZvdW5kIGZvciAnIC4uIHRibCwgMCkgZW5kCiAgcmV0dXJuIGNvbHMKZW5kCgotLSDmiafooYwgU0NEMiDlkIjlubYKLS0gb3B0cyA9IHsgdGFyZ2V0Peebruagh+e7tOW6puihqCwgc291cmNlPea6kOihqCwga2V5X2NvbD3kuJrliqHplK4sIGF0dHJfY29scz175bGe5oCnLi4ufSwgdHNfY29sPeeUn+aViOaXtumXtCB9Ci0tIOi/lOWbniB7aW5zZXJ0ZWQ9TiwgY2xvc2VkPU59CmZ1bmN0aW9uIHNjZDIucnVuKG9wdHMpCiAgb3B0cyA9IG9wdHMgb3Ige30KICBsb2NhbCB0YXJnZXQsIHNvdXJjZSA9IG9wdHMudGFyZ2V0LCBvcHRzLnNvdXJjZQogIGxvY2FsIGtleV9jb2wsIHRzX2NvbCA9IG9wdHMua2V5X2NvbCwgb3B0cy50c19jb2wKICBsb2NhbCBhdHRyX2NvbHMgPSBvcHRzLmF0dHJfY29scyBvciB7fQogIGlmIG5vdCB0YXJnZXQgb3Igbm90IHNvdXJjZSBvciBub3Qga2V5X2NvbCBvciBub3QgdHNfY29sIG9yICNhdHRyX2NvbHMgPT0gMCB0aGVuCiAgICBlcnJvcignc2NkMjogdGFyZ2V0LCBzb3VyY2UsIGtleV9jb2wsIHRzX2NvbCwgYXR0cl9jb2xzIHJlcXVpcmVkJywgMCkgZW5kCgogIC0tIDEuIOW7uuebruagh+ihqO+8iOWkjeWItua6kOe7k+aehCArIOeuoeeQhuWIl++8iQogIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICcgLi4gdGFyZ2V0CiAgICAuLiAnIEFTIFNFTEVDVCAqIEZST00gJyAuLiBzb3VyY2UgLi4gJyBXSEVSRSBGQUxTRScpCiAgaWYgdHlwZShyKSA9PSAnc3RyaW5nJyBhbmQgcjptYXRjaCgnXmVycm9yOicpIHRoZW4gZXJyb3IocjpzdWIoNyksIDApIGVuZAogIGZvciBfLCBkZGwgaW4gaXBhaXJzKHsKICAgICdBTFRFUiBUQUJMRSAnIC4uIHRhcmdldCAuLiAnIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyBfdmFsaWRfZnJvbSBUSU1FU1RBTVAnLAogICAgJ0FMVEVSIFRBQkxFICcgLi4gdGFyZ2V0IC4uICcgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIF92YWxpZF90byBUSU1FU1RBTVAnLAogICAgJ0FMVEVSIFRBQkxFICcgLi4gdGFyZ2V0IC4uICcgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIF9pc19jdXJyZW50IEJPT0xFQU4nLAogICAgJ0FMVEVSIFRBQkxFICcgLi4gdGFyZ2V0IC4uICcgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIF92ZXJzaW9uIEJJR0lOVCcsCiAgfSkgZG8KICAgIGxvY2FsIHJyID0gX2R1Y2tkYl9jYWxsKGRkbCkKICAgIGlmIHR5cGUocnIpID09ICdzdHJpbmcnIGFuZCBycjptYXRjaCgnXmVycm9yOicpIHRoZW4gZXJyb3IocnI6c3ViKDcpLCAwKSBlbmQKICBlbmQKCiAgbG9jYWwgY29scyA9IGNvbHVtbnNfb2Yoc291cmNlKQogIGxvY2FsIGZwID0gZnBfZXhwcihhdHRyX2NvbHMpCiAgbG9jYWwgc3JjID0gJyhTRUxFQ1Qgcy4qLCAnIC4uIGZwIC4uICcgQVMgX2ZwIEZST00gJyAuLiBzb3VyY2UgLi4gJyBzKScKICBsb2NhbCBjdXIgPSAnKFNFTEVDVCAnIC4uIGtleV9jb2wgLi4gJyBBUyBrZXksICcgLi4gZnAgLi4gJyBBUyBfZnAsIF92ZXJzaW9uIEZST00gJwogICAgLi4gdGFyZ2V0IC4uICcgV0hFUkUgX2lzX2N1cnJlbnQpJwoKICAtLSAyLiDnianljJblvoXmj5LlhaXpm4bvvIjln7rkuo7ml6fnirbmgIHvvJrmlrAga2V5IOaIluWxnuaAp+WPmOWMlu+8m3ZlcnNpb24gPSDml6fniYjmnKwgKyAx77yJCiAgbG9jYWwgaW5zID0gJyhTRUxFQ1Qgcy4qLCBzLicgLi4gdHNfY29sIC4uICcgQVMgX3ZhbGlkX2Zyb20sIE5VTEwgQVMgX3ZhbGlkX3RvLCB0cnVlIEFTIF9pc19jdXJyZW50LCcKICAgIC4uICcgY29hbGVzY2UoYy5fdmVyc2lvbiwgMCkgKyAxIEFTIF92ZXJzaW9uIEZST00gJyAuLiBzcmMgLi4gJyBzJwogICAgLi4gJyBMRUZUIEpPSU4gKFNFTEVDVCAqIEZST00gJyAuLiBjdXIgLi4gJykgYyBPTiBzLicgLi4ga2V5X2NvbCAuLiAnID0gYy5rZXknCiAgICAuLiAnIFdIRVJFIGMua2V5IElTIE5VTEwgT1Igcy5fZnAgPD4gYy5fZnApJwogIGxvY2FsIGlxLCBpZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gJyAuLiBpbnMpCiAgaWYgbm90IGlxIHRoZW4gZXJyb3IoJ3NjZDI6ICcgLi4gdG9zdHJpbmcoaWVyciksIDApIGVuZAogIGxvY2FsIGluc2VydGVkID0gdG9udW1iZXIoaXFbMV0ubikgb3IgMAogIGlmIGluc2VydGVkID4gMCB0aGVuCiAgICBsb2NhbCByciA9IF9kdWNrZGJfY2FsbCgnQ1JFQVRFIE9SIFJFUExBQ0UgVEVNUCBUQUJMRSBfc2NkMl9pbnMgQVMgJyAuLiBpbnMpCiAgICBpZiB0eXBlKHJyKSA9PSAnc3RyaW5nJyBhbmQgcnI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHJyOnN1Yig3KSwgMCkgZW5kCiAgZW5kCgogIC0tIDMuIOWFs+mXreaXp+eJiOacrO+8iOWfuuS6juaXp+eKtuaAge+8m0lOU0VSVCDlsJrmnKrlj5HnlJ/vvIxjdXIg5b+r54Wn5LiN5Y+Y77yJCiAgbG9jYWwgY2hnID0gJyhTRUxFQ1QgYy5rZXksIHMudHMgRlJPTSAnIC4uIHNyYyAuLiAnIHMgSk9JTiAoU0VMRUNUICogRlJPTSAnIC4uIGN1ciAuLiAnKSBjJwogICAgLi4gJyBPTiBzLicgLi4ga2V5X2NvbCAuLiAnID0gYy5rZXkgV0hFUkUgcy5fZnAgPD4gYy5fZnApJwogIGxvY2FsIGNxLCBjZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gJyAuLiBjaGcpCiAgaWYgbm90IGNxIHRoZW4gZXJyb3IoJ3NjZDI6ICcgLi4gdG9zdHJpbmcoY2VyciksIDApIGVuZAogIGxvY2FsIGNsb3NlZCA9IHRvbnVtYmVyKGNxWzFdLm4pIG9yIDAKICBpZiBjbG9zZWQgPiAwIHRoZW4KICAgIGxvY2FsIHJyID0gX2R1Y2tkYl9jYWxsKCdVUERBVEUgJyAuLiB0YXJnZXQgLi4gJyB0IFNFVCBfdmFsaWRfdG8gPSB1LnRzLCBfaXNfY3VycmVudCA9IGZhbHNlJwogICAgICAuLiAnIEZST00gJyAuLiBjaGcgLi4gJyB1IFdIRVJFIHQuJyAuLiBrZXlfY29sIC4uICcgPSB1LmtleSBBTkQgdC5faXNfY3VycmVudCcpCiAgICBpZiB0eXBlKHJyKSA9PSAnc3RyaW5nJyBhbmQgcnI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHJyOnN1Yig3KSwgMCkgZW5kCiAgZW5kCgogIC0tIDQuIOaPkuWFpeeJqeWMluihjO+8iOS4jeWPl+eKtuaAgeWPmOWMluW9seWTje+8iQogIGlmIGluc2VydGVkID4gMCB0aGVuCiAgICBsb2NhbCBzZWxfY29scyA9IHt9CiAgICBmb3IgXywgYyBpbiBpcGFpcnMoY29scykgZG8gc2VsX2NvbHNbI3NlbF9jb2xzICsgMV0gPSAnaS4nIC4uIGMgZW5kCiAgICBsb2NhbCByciA9IF9kdWNrZGJfY2FsbCgnSU5TRVJUIElOVE8gJyAuLiB0YXJnZXQKICAgICAgLi4gJyAoJyAuLiB0YWJsZS5jb25jYXQoY29scywgJywgJykgLi4gJywgX3ZhbGlkX2Zyb20sIF92YWxpZF90bywgX2lzX2N1cnJlbnQsIF92ZXJzaW9uKScKICAgICAgLi4gJyBTRUxFQ1QgJyAuLiB0YWJsZS5jb25jYXQoc2VsX2NvbHMsICcsICcpCiAgICAgIC4uICcsIGkuX3ZhbGlkX2Zyb20sIGkuX3ZhbGlkX3RvLCBpLl9pc19jdXJyZW50LCBpLl92ZXJzaW9uIEZST00gX3NjZDJfaW5zIGknKQogICAgaWYgdHlwZShycikgPT0gJ3N0cmluZycgYW5kIHJyOm1hdGNoKCdeZXJyb3I6JykgdGhlbiBlcnJvcihycjpzdWIoNyksIDApIGVuZAogIGVuZAoKICByZXR1cm4gJ3siaW5zZXJ0ZWQiOicgLi4gdG9zdHJpbmcoaW5zZXJ0ZWQpIC4u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bm90IGVtcHR5AENvbm5lY3Rpb24gcmVzZXQgYnkgcGVlcgBPcGVyYXRpb24gdGltZWQgb3V0AENvbm5lY3Rpb24gcmVmdXNlZABIb3N0IGlzIGRvd24ASG9zdCBpcyB1bnJlYWNoYWJsZQBBZGRyZXNzIGluIHVzZQBCcm9rZW4gcGlwZQBJL08gZXJyb3IATm8gc3VjaCBkZXZpY2Ugb3IgYWRkcmVzcwBCbG9jayBkZXZpY2UgcmVxdWlyZWQATm8gc3VjaCBkZXZpY2UATm90IGEgZGlyZWN0b3J5AElzIGEgZGlyZWN0b3J5AFRleHQgZmlsZSBidXN5AEV4ZWMgZm9ybWF0IGVycm9yAEludmFsaWQgYXJndW1lbnQAQXJndW1lbnQgbGlzdCB0b28gbG9uZwBTeW1ib2xpYyBsaW5rIGxvb3AARmlsZW5hbWUgdG9vIGxvbmcAVG9vIG1hbnkgb3BlbiBmaWxlcyBpbiBzeXN0ZW0ATm8gZmlsZSBkZXNjcmlwdG9ycyBhdmFpbGFibGUAQmFkIGZpbGUgZGVzY3JpcHRvcgBObyBjaGlsZCBwcm9jZXNzAEJhZCBhZGRyZXNzAEZpbGUgdG9vIGxhcmdlAFRvbyBtYW55IGxpbmtzAE5vIGxvY2tzIGF2YWlsYWJsZQBSZXNvdXJjZSBkZWFkbG9jayB3b3VsZCBvY2N1cgBTdGF0ZSBub3QgcmVjb3ZlcmFibGUAUHJldmlvdXMgb3duZXIgZGllZABPcGVyYXRpb24gY2FuY2VsZWQARnVuY3Rpb24gbm90IGltcGxlbWVudGVkAE5vIG1lc3NhZ2Ugb2YgZGVzaXJlZCB0eXBlAElkZW50aWZpZXIgcmVtb3ZlZABEZXZpY2Ugbm90IGEgc3RyZWFtAE5vIGRhdGEgYXZhaWxhYmxlAERldmljZSB0aW1lb3V0AE91dCBvZiBzdHJlYW1zIHJlc291cmNlcwBMaW5rIGhhcyBiZWVuIHNldmVyZWQAUHJvdG9jb2wgZXJyb3IAQmFkIG1lc3NhZ2UARmlsZSBkZXNjcmlwdG9yIGluIGJhZCBzdGF0ZQBOb3QgYSBzb2NrZXQARGVzdGluYXRpb24gYWRkcmVzcyByZXF1aXJlZABNZXNzYWdlIHRvbyBsYXJnZQBQcm90b2NvbCB3cm9uZyB0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';
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
  "em_host_call_fill": em_host_call_fill,
  "em_host_query_fill": em_host_query_fill,
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







  return L7Module.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
  module.exports = L7Module;
else if (typeof define === 'function' && define['amd'])
  define([], function() { return L7Module; });
else if (typeof exports === 'object')
  exports["L7Module"] = L7Module;
