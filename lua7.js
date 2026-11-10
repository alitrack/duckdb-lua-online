
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
  wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABloOAgAA8YAF/AX9gA39/fwF/YAJ/fwF/YAJ/fwBgBH9/f38Bf2ADf39/AGABfwBgBH9/f38AYAV/f39/fwBgAAF/YAF8AXxgBX9/f39/AX9gAABgBn9/f39/fwBgBX9+fn5+AGAGf39/f39/AX9gA39+fwF+YAF/AXxgAn9/AX5gAnx8AXxgB39/f39/f38Bf2ACf38BfGABfAF+YAJ8fwF8YAR/fn5/AGACf3wAYAJ/fgBgA39/fgF/YAN/f34AYAN/fn4BfmADfHx/AXxgA3x+fgF8YAZ/fH9/f38Bf2ACfn8Bf2AEfn5+fgF/YAN/f38BfGADf39/AX5gA39/fAF8YAN/f34BfmADf3x/AGAJf39/f39/f39/AGAEf39+fgF+YAR/f35/AGACf34Bf2ABfwF+YAZ/f35/f38AYAN8f38Bf2ADf3x8AXxgAn5+AX5gAnx/AX9gAn98AXxgAX4Bf2ACfn4Bf2ADf35+AGAHf39/f39/fwBgA35/fwF/YAJ/fQBgAn5+AXxgBH9/fn8BfmAEf35/fwF/Ap6IgIAALgNlbnYIaW52b2tlX3YABgNlbnYbX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF80AAIDZW52C2dldFRlbXBSZXQwAAkDZW52Emxsdm1fZWhfdHlwZWlkX2ZvcgAAA2VudhFfX2N4YV9iZWdpbl9jYXRjaAAAA2Vudg5pbnZva2VfaWlpaWlpaQAUA2VudgtpbnZva2VfaWlpaQAEA2VudgppbnZva2VfdmlpAAUDZW52G19fY3hhX2ZpbmRfbWF0Y2hpbmdfY2F0Y2hfMgAJA2Vudg9fX2N4YV9lbmRfY2F0Y2gADANlbnYbX19jeGFfZmluZF9tYXRjaGluZ19jYXRjaF8zAAADZW52EV9fcmVzdW1lRXhjZXB0aW9uAAYDZW52EWVtX2hvc3RfY2FsbF9maWxsAAUDZW52EmVtX2hvc3RfcXVlcnlfZmlsbAAFA2VudgVhYm9ydAAMA2VudhhfX2N4YV9hbGxvY2F0ZV9leGNlcHRpb24AAANlbnYLX19jeGFfdGhyb3cABQNlbnYMaW52b2tlX2lpaWlpAAsDZW52BHRpbWUAAANlbnYFY2xvY2sACQNlbnYIc3RyZnRpbWUABANlbnYIZGlmZnRpbWUAFQNlbnYG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BUEIakEQaiIHIAJBEGoiCSkDADcDACAFQQhqQQhqIgYgAkEIaiIKKQMANwMAIAUgAikDADcDCCAJIANBEGoiCykDADcDACAKIANBCGoiCSkDADcDACACIAMpAwA3AwAgCyAHKQMANwMAIAkgBikDADcDACADIAUpAwg3AwBBASEHCwJAIAMoAgBBBkcNACAAIAMQ7QFFDQAgACACIAMgAUEWaiADKAIIIAcgBEEwIAFBBmoQ7wEMDAsCQCAIQQZHDQAgBUEIakEQaiIHIAJBEGoiCCkDADcDACAFQQhqQQhqIgkgAkEIaiIGKQMANwMAIAUgAikDADcDCCAIIANBEGoiCikDADcDACAGIANBCGoiCCkDADcDACACIAMpAwA3AwAgCiAHKQMANwMAIAggCSkDADcDACADIAUpAwg3AwALIAAgASACIAMgBBDwAQwLCwJAIAIoAgBBBkcNACACKAIQIAIoAhRHDQAgAikDCEL/fnxCgH5UDQAgBUEIakEQaiIHIAJBEGoiASkDADcDACAFQQhqQQhqIgggAkEIaiIJKQMANwMAIAUgAikDADcDCCABIANBEGoiBikDADcDACAJIANBCGoiASkDADcDACACIAMpAwA3AwAgBiAHKQMANwMAIAEgCCkDADcDACADIAUpAwg3AwAgACACIANBISABKAIAQf8AakEBIARBL0EQEO8BDAsLIAAgAiADQSAgBEEQEPEBDQogAEEKIAIgAyAEEPABDAoLAkAgAygCAEEGRw0AIAMoAhAgAygCFEcNACADKQMIQv9+fEKAflQNACAAIAIgA0EgIAMoAghB/wBqQQAgBEEvQREQ7wEMCgsgAEELIAIgAyAEEPABDAkLAkAgAigCAEEIRg0AIAVBCGpBEGoiBCACQRBqIgcpAwA3AwAgBUEIakEIaiIIIAJBCGoiCSkDADcDACAFIAIpAwA3AwggByADQRBqIgYpAwA3AwAgCSADQQhqIgcpAwA3AwAgAiADKQMANwMAIAYgBCkDADcDACAHIAgpAwA3AwAgAyAFKQMINwMACyAAIAIQ3AECQAJAIAIoAgBBCEcNACACQQhqIQQgAigCECACKAIURg0BIAQoAgAgABCTA0gNACAAIAIgAigCCBDeAQwBCyAAIAIQ3QEgAkEIaiEECyAEKAIAIQZBASEJQQAhBwJAAkACQAJAIAMoAgBBe2oOAgABAwtBACEHAkAgAysDCCAFQQhqQQAQowRFDQBBASEHDAILQQEhCQwCCyAFIAMpAwg3AwhBACEHCwJAIAMoAhAgAygCFEYNAAwBCwJAIAUpAwgiDEL/fnxCgH5aDQAMAQsgDKdB/wBqIQRBACEJC0E9IQgCQCAJRQ0AAkACQCAAIAMQ5AFFDQAgA0EIaiEEQTwhCAwBCyAAIAMQ3AECQCADKAIAQQhHDQAgA0EIaiEEQTkhCCADKAIQIAMoAhRGDQEgBCgCACAAEJMDSA0AIAAgAyADKAIIEN4BDAELIAAgAxDdASADQQhqIQRBOSEICyAEKAIAIQQLIAAgAiADEPIBIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GEEBDwAiIJNgI0IAAgACgCECIKQQFqNgIQIAkgCkECdGogB0EYdCABQQ1GQQ90ciAEQRB0ciAIIAZBB3RycjYCACAAIAMgACgCCCgCCBDKASAAKAIAIQMgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBhBAQ8AIiATYCNCAAIAAoAhAiBEEBajYCECABIARBAnRqQbj+//8HNgIAIAAgAyAAKAIIKAIIEMoBIAAoAhAhACACQRA2AgAgAiAAQX9qNgIIDAgLIAVBCGpBEGoiBCACQRBqIgcpAwA3AwAgBUEIakEIaiIIIAJBCGoiCSkDADcDACAFIAIpAwA3AwggByADQRBqIgYpAwA3AwAgCSADQQhqIgcpAwA3AwAgAiADKQMANwMAIAYgBCkDADcDACAHIAgpAwA3AwAgAyAFKQMINwMAIAFBfWohAQtBASEIQQAhBAJAAkACQAJAIAMoAgBBe2oOAgABAwtBACEEAkAgAysDCCAFQQhqQQAQowRFDQBBASEEDAILQQEhCAwCCyAFIAMpAwg3AwhBACEECwJAIAMoAhAgAygCFEYNAAwBCwJAIAUpAwgiDEL/fnxCgH5aDQAMAQsgDKdB/wBqIQdBACEICwJAAkAgCA0AIAAgAhDcAQJAAkAgAigCAEEIRw0AIAJBCGohCCACKAIQIAIoAhRGDQEgCCgCACAAEJMDSA0AIAAgAiACKAIIEN4BDAELIAAgAhDdASACQQhqIQgLIAgoAgAhCEEwIQkMAQtBASEIAkACQAJAAkAgAigCAEF7ag4CAAEDCwJAIAIrAwggBUEIakEAEKMERQ0AQQEhBAwCC0EBIQgMAgsgBSACKQMINwMICyACKAIQIAIoAhRHDQAgBSkDCCIMQv9+fEKAflQNACAMp0H/AGohB0EAIQgLAkAgCA0AIAAgAxDcAQJAAkAgAygCAEEIRw0AIANBCGohCCADKAIQIAMoAhRGDQEgCCgCACAAEJMDSA0AIAAgAyADKAIIEN4BDAELIAAgAxDdASADQQhqIQgLIAgoAgAhCEEyIQkMAQsgACACENwBAkACQCACKAIAQQhHDQAgAkEIaiEHIAIoAhAgAigCFEYNASAHKAIAIAAQkwNIDQAgACACIAIoAggQ3gEMAQsgACACEN0BIAJBCGohBwsgBygCACEIIAAgAxDcAQJAAkAgAygCAEEIRw0AIANBCGohByADKAIQIAMoAhRGDQEgBygCACAAEJMDSA0AIAAgAyADKAIIEN4BDAELIAAgAxDdASADQQhqIQcLIAcoAgAhB0EsIQkLIAAgAiADEPIBIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GEEBDwAiIGNgI0IAAgACgCECIKQQFqNgIQIAYgCkECdGogBEEYdCAIQQd0ciABIAlqciAHQRB0ckGAgAJyNgIAIAAgAyAAKAIIKAIIEMoBIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GEEBDwAiIBNgI0IAAgACgCECIEQQFqNgIQIAEgBEECdGpBuP7//wc2AgAgACADIAAoAggoAggQygEgACgCECEAIAJBEDYCACACIABBf2o2AggMBgsgAyAGNgIUDAQLIAAoAghBj8ABEMkCAAsgAyAGNgIQDAELIAAoAghBj8ABEMkCAAsgAiADKQMANwMAIAJBEGogA0EQaikDADcDACACQQhqIANBCGopAwA3AwAMAQsgAiADKQMANwMAIAJBEGogA0EQaikDADcDACACQQhqIANBCGopAwA3AwALIAVBIGokAAuTBAEEfyAAIAEQ3AECQAJAIAEoAgBBCEcNACABKAIQIAEoAhRGDQEgASgCCCAAEJMDSA0AIAAgASABKAIIEN4BDAELIAAgARDdAQsgACgCACEJIAEoAgghCiAJIAAoAggoAjQgCSgCNCAAKAIQIAlBFGpBBEH/////A0GEEBDwAiILNgI0IAAgACgCECIMQQFqNgIQIAsgDEECdGogBEEYdCADciAKQRB0cjYCACAAIAkgACgCCCgCCBDKASAAKAIQIQkgACABIAIQ8gEgAUERNgIAIAEgCUF/ajYCCAJAAkAgACgCECAAKAIAIgEoAkBqQX9qLAAAIglBgH9GDQAgACAAKAIYIAlrNgIYIAAgAC0ANUF/ajoANQwBCyAAQYEBOgA1IAAgACgCJEF/ajYCJAsgACABIAYQygEgACgCACEBIAEgACgCCCgCNCABKAI0IAAoAhAgAUEUakEEQf////8DQYQQEPACIgk2AjQgACAAKAIQIgNBAWo2AhAgCSADQQJ0aiAFQQ90IARBEHRyIAdyIAhBGHRyIApBB3RyNgIAIAAgASAAKAIIKAIIEMoBAkAgACgCECAAKAIAIgEoAkBqQX9qLAAAIglBgH9GDQAgACAAKAIYIAlrNgIYIAAgAC0ANUF/ajoANSAAIAEgBhDKAQ8LIABBgQE6ADUgACAAKAIkQX9qNgIkIAAgASAGEMoBC2YAIAAgAxDcAQJAAkAgAygCAEEIRw0AIAMoAhAgAygCFEYNASADKAIIIAAQkwNIDQAgACADIAMoAggQ3gEMAQsgACADEN0BCyAAIAIgAyABQSJqIAMoAghBACAEQS4gAUEGahDvAQt8AgF/AX5BACEGAkAgAigCAEEGRw0AIAIoAhAgAigCFEcNACACKQMIIgdCgH98QoF+VA0AIAAgASACIANB/wAgB6ciBmtBACAEQS8gBRDvASAAKAIQQQJ0IAAoAgAoAjRqQX5qIAZBEHRBgID8A2pBEHY6AABBASEGCyAGC5wBAQJ/QX8hA0F/IQQCQCABKAIAQQhHDQAgASgCCCEECwJAIAIoAgBBCEcNACACKAIIIQMLIAAQkwMhAQJAAkACQCAEIANMDQACQCABIARKDQAgACAALQA0QX9qOgA0CyAAEJMDIANMDQEMAgsCQCABIANKDQAgACAALQA0QX9qOgA0CyAAEJMDIARKDQELIAAgAC0ANEF/ajoANAsLZwECfwJAIAAoAhAgACgCACICKAJAakF/aiwAACIDQYB/Rg0AIAAgACgCGCADazYCGCAAIAAtADVBf2o6ADUgACACIAEQygEPCyAAQYEBOgA1IAAgACgCJEF/ajYCJCAAIAIgARDKAQtlACAAKAIAKAI0IQACQAJAIAQNAEEAIQQMAQsgBBD4AkEQdEGAgARqIQQLIAAgAUECdGoiACADQYACbUEHdEHSAHI2AgQgACACQQd0IANBGHRyIANB/wFKQQ90ciAEckETcjYCAAvnAgEDf0EAIAMgA0F/RhshBAJAAkAgAkH/AUoNACAAKAIAIQMgAyAAKAIIKAI0IAMoAjQgACgCECADQRRqQQRB/////wNBhBAQ8AIiBTYCNCAAIAAoAhAiBkEBajYCECAFIAZBAnRqIAFBB3QgAkEYdHIgBEEQdHJBzgByNgIADAELIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GEEBDwAiIFNgI0IAAgACgCECIGQQFqNgIQIAUgBkECdGogAUEHdCACQRh0ciAEQRB0ckHOgAJyNgIAIAAgAyAAKAIIKAIIEMoBIAAoAgAhAyADIAAoAggoAjQgAygCNCAAKAIQIANBFGpBBEH/////A0GEEBDwAiIENgI0IAAgACgCECIFQQFqNgIQIAQgBUECdGogAkGAAm1BB3RB0gByNgIACyAAIAMgACgCCCgCCBDKASAAIAFBAWo6ADQL2wIBCH8CQAJAIAAoAhBBAUgNACAAKAIAIgEoAjQhAkEAIQMDQCADIQRBACEFAkACQAJAAkACQCACIANBAnRqIgYoAgAiB0H/AHEiCEFIag4RAgQEBAQEBAQEBAQEBAEBAAAECwJAIAAtADYNACABLQAHRQ0ECyAGIAdBgH9xQcYAcjYCAAsCQCAALQA2RQ0AIAYgBigCAEGAgAJyNgIACyABLQAHRQ0CIAEtAAZBGHQgBigCAEH///8HcXJBgICACGohBAwBCwJAA0AgAiAEQQJ0aigCACIHQQd2QYKAgHhqQQAgB0H/AHEiB0E4RhsgBGohBCAHQThHDQEgBUEBaiIFQeQARw0ACwsgBCADQX9zaiIEQf///wdqQYCAgBBPDQQgBEEHdCAIckGA////B2ohBAsgBiAENgIACyADQQFqIgMgACgCEEgNAAsLDwsgACgCCEGPwAEQyQIAC4EBAQR/QQAhAwJAIAFBAEgNACAAKAIUIgQgAEE0aiIARyEFAkACQCABDQAgASEGDAELAkAgBCAARw0AIAEhBgwBCwNAIAFBf2ohBiAEKAIIIgQgAEchBSABQQJIDQEgBiEBIAQgAEcNAAsLIAYNACAFRQ0AIAIgBDYCaEEBIQMLIAMLmwIBBH8gASgCACEEQQAhBQJAAkACQCABLQAiQQJxDQAgBCgCACgCDCEFAkAgAkF/Sg0AAkAgBS0ABw0AQQAPC0EAIQBBACABQRhqKAIAayIBIAJKDQMgBCABQQR0aiACQX9zQQR0aiEBQZ6cAiEADAILIAUgAiABKAIQIAUoAjRrQQJ1QX9qEK4CIQULAkAgBQ0AIARBEGohBgJAAkAgACgCFCABRw0AIABBDGohBwwBCyABKAIMIQcLQQAhAEEAIQUCQCACQQBKIAcoAgAgBmtBBHUgAk5xIgZBAUcNAEGDmgJB95kCIAEtACJBAnEbIQULIAZFDQILAkAgAw0AIAUPCyAEIAJBBHRqIQEgBSEACyADIAE2AgALIAAL1QwBEH8jAEEQayIDJAACQAJAIAEtAABBPkcNACAAIAAoAgxBcGoiBDYCDCABQQFqIQFBACEFDAELIAIoAmgiBSgCACEECwJAAkAgBC0ACEEgckHmAEYNAEEAIQYMAQsgBCgCACEGCwJAAkAgAS0AACIHDQBBASEIDAELIAJBLGohCSACQQRqIQogBUEjaiELQQEhCCABIQwDQCAMIQ0CQAJAAkACQAJAAkACQAJAIAdBGHRBGHVBtH9qDioHBgYGBgYGAAYGBgYGBgYGBgYGBgYGBgYGBgcGBgYGBgEGBAYGBgUGAwIGCwJAAkACQCAGRQ0AIAYtAARBBkYNAQsgAkJ/NwIcIAJBBDYCFCACQcWXAjYCEEGmmAIhBwwBCwJAAkAgBigCDCIHKAJMIgxFDQAgAiAMQRBqNgIQIAwtAAciDkH/AUcNASAMKAIMIQ4MAQsgAkGomAI2AhBBAiEOCyACIA42AhQgAiAHKAIoIgw2AhwgAiAHKAIsNgIgQYeXAkG8GiAMGyEHCyACIAc2AgwgCSACKAIQIAIoAhQQhAMMBgtBfyEMAkAgBUUNACAFLQAiQQJxDQBBfyEMIAUoAgAoAgAoAgwiBygCQCIPRQ0AIAUoAhAgBygCNGtBAnUiEEF/aiEOAkACQAJAIAcoAiQiDEUNACAHKAJEIhEoAgAgEEgNAQsgB0EoaiEMQX8hBwwBCyAMIA5BB3YiByAMIAdKG0F/aiESIAdBf2ohDAJAA0ACQCAMIgcgEkcNACASIQcMAgsgESAHQQFqIgxBA3RqKAIAIBBIDQALCyARIAdBA3RqIgdBBGohDCAHKAIAIQcLIAwoAgAhDCAHIA5ODQADQCAMIA8gB0EBaiIHaiwAAGohDCAHIA5HDQALCyACIAw2AhgMBQsCQAJAIAZFDQAgAiAGLQAGOgAkIAYtAARBBkcNASACIAYoAgwtAAc6ACYgAiAGKAIMLQAGOgAlDAYLIAJBADoAJAsgAkGAAjsAJQwECwJAIAUNACACQQA6ACcMBAsgAiAFLwEiQSBxOgAnDAMLQQAhBwJAIAVFDQAgBS0AIkEgcQ0AIAAgBSgCCCAKEPoBIQcLIAIgBzYCCCAHDQIgAkEANgIEIAJBrtIENgIIDAILAkACQCAFRQ0AIAstAABBAXENAQsgAkEANgIoDAILIAIgBS8BHDsBKCACIAUvAR47ASoMAQtBACEICyANQQFqIQwgDS0AASIHDQALCwJAIAFB5gAQrQVFDQAgACgCDCINIAQpAwA3AwAgDSAELQAIOgAIIAAgACgCDEEQajYCDAsCQCABQcwAEK0FRQ0AAkACQCAGRQ0AIAYtAARBBkYNAQsgACgCDEEAOgAIIAAgACgCDEEQajYCDAwBCyAGKAIMIgUoAighByAAEPIDIQ8gACgCDCINQcUAOgAIIA0gDzYCACAAIAAoAgxBEGo2AgwgBSgCQCICRQ0AIAVBKGohASADQRE6AAgCQAJAIAUtAAcNAEEAIQwMAQsCQCACLAAAIg1BgH9GDQAgByANaiEHQQEhDAwBC0F/IQ0gASEHAkAgBSgCJCIGRQ0AQX8hDSABIQcgBSgCRCIMKAIAQQBKDQBBfyEHIAZBACAGQQBKG0F/aiEGAkADQAJAIAciDSAGRw0AIAYhDQwCCyAMIA1BAWoiB0EDdGooAgBBAUgNAAsLIAwgDUEDdGoiDUEEaiEHIA0oAgAhDQsgBygCACEHQQEhDCANQX9KDQADQEEBIQwgByACIA1BAWoiDWosAABqIQcgDQ0ACwsgDCAFKAIYTg0AA0ACQAJAIAUoAkAiAiAMaiwAACINQYB/Rg0AIAcgDWohBwwBCwJAIAINAEF/IQcMAQtBfyENAkACQCAFKAIkIg4NACABIQcMAQsgASEHIAUoAkQiBigCACAMSg0AIA4gDEEHdiINIA4gDUobQX9qIQ4gDUF/aiEHAkADQAJAIAciDSAORw0AIA4hDQwCCyAGIA1BAWoiB0EDdGooAgAgDEwNAAsLIAYgDUEDdGoiDUEEaiEHIA0oAgAhDQsgBygCACEHIA0gDE4NAANAIAcgAiANQQFqIg1qLAAAaiEHIA0gDEcNAAsLIAAgDyAHrCADEPADIAxBAWoiDCAFKAIYSA0ACwsgA0EQaiQAIAgL6gIBA38CQCABLwEiIgNBCHFFDQAgAkGpmAI2AgBBnb4BDwsCQAJAAkAgA0GAAXFFDQAgAkHdlgI2AgAMAQtBACEEIANBAnENAUEAIQQCQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCABKAIAKAIAKAIMIgUoAjQiAyABKAIQIANrQQJ1QX9qIgNBAnRqKAIAIgFB/wBxQXVqDkIMDAwMAgICAg4MDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODgMDAwQFDgYHCw4OCAkKDg4JCgkKDg4AAAsODg4ODgEOCyAFIAMgAUEHdkH/AXEgAhD/AQ8LIAJBiRM2AgBBiRMPC0EBIQQMCQsgAUEYdiEEDAgLQRIhBAwHC0ETIQQMBgtBBCEEDAULQRYhBAwEC0EFIQQMAwtBFCEEDAILQRUhBAwBC0EYIQQLIAIgACgCECAEQQJ0akGsAWooAgBBEmo2AgALQYrLASEECyAECxMAIAAgASACIAAgARD8ARD9AQAL4QIBCH8jAEEQayICJAAgACgCFCEDQQAhBCACQQA2AgwCQCADLQAiQQJxDQBBACEEAkACQCADKAIAIgUoAgAiBi0ABiIHDQBBASEIDAELA0ACQCAGIARBAnRqQRBqKAIAKAIIIAFHDQAgAiAGKAIMKAI8IARBA3RqKAIAIgRBEGpBqZgCIAQbNgIMQZ7FASEEQQAhCAwCC0EBIQggBEEBaiIEIAdHDQALQQAhBAsgCEUNAEF/IQkCQCAFQRBqIgcgAygCBCIFTw0AQQAhBCAHIQgDQAJAIAggAUcNACAEIQkMAgsgByAEQQFqIgRBBHRqIgggBUkNAAsLQQAhBCAJQQBIDQAgBigCDCIEIAMoAhAgBCgCNGtBAnVBf2ogCSACQQxqEP8BIQQLAkACQCAEDQBBrtIEIQQMAQsgAiAENgIAIAIgAigCDDYCBCAAQYSeAiACEIMDIQQLIAJBEGokACAECzYBAX8jAEEQayIEJAAgACABEIkEIQEgBCADNgIIIAQgATYCBCAEIAI2AgAgAEHlECAEEP4BAAvVAwEIfyMAQdAAayIDJAAgACgCFCEEAkAgACgCECgCDEEBSA0AIAAQvwILIAMgAjYCDCAAIAEgAhCAAyEFAkAgBC0AIkECcQ0AQX8hASAEKAIAKAIAKAIMIgIoAkwhBgJAIAIoAkAiB0UNACAEKAIQIAIoAjRrQQJ1IghBf2ohBAJAAkACQCACKAIkIgFFDQAgAigCRCIJKAIAIAhIDQELIAJBKGohAUF/IQIMAQsgASAEQQd2IgIgASACShtBf2ohCiACQX9qIQECQANAAkAgASICIApHDQAgCiECDAILIAkgAkEBaiIBQQN0aigCACAISA0ACwsgCSACQQN0aiICQQRqIQEgAigCACECCyABKAIAIQEgAiAETg0AA0AgASAHIAJBAWoiAmosAABqIQEgAiAERw0ACwsCQAJAIAZFDQAgBkEQaiEEAkAgBi0AByICQf8BRw0AIAYoAgwhAgsgA0EQaiAEIAIQhAMMAQsgA0E/OwEQCyADIAU2AgggAyABNgIEIAMgA0EQajYCACAAQdoSIAMQgwMaIAAoAgwiAkFgaiIBIAJBcGoiAikDADcDACABQQhqIAJBCGotAAA6AAAgACAAKAIMQXBqNgIMCyAAEIICAAuEBQEDfyMAQRBrIgQkACAEIAE2AgQCQCAAIARBBGogAiADEIoCIgENAAJAIAQoAgQiAkF/Rg0AQQEhBQJAAkACQAJAAkACQAJAIAAoAjQgAkECdGooAgAiBkH/AHFBdWoOCgABAgMGBgYGBgQGC0GpmAIhAQJAIAAoAjAgBkEYdkEEdGoiAi0ACEEPcUEERw0AIAIoAgBBEGohAQsgAyABNgIAQcWTAkGTvgEgACgCPCAGQQ12QfgPcWooAgAiAUEQakGpmAIgARtB1pcCEK8FGyEBDAQLIAQgAjYCDAJAAkAgACAEQQxqIAZBGHYgAxCKAiIBRQ0AIAEtAABB4wBGDQELIANBqZgCNgIACyAEIAI2AgwgACAEQQxqIAZBEHZB/wFxIARBCGoQigIaAkAgBCgCCCIBDQBBxZMCIQEMBAtBxZMCQZO+ASABQdaXAhCvBRshAQwDCyADQcMJNgIAQcWTAiEBDAILQamYAiEBAkAgACgCMCAGQRh2QQR0aiIFLQAIQQ9xQQRHDQAgBSgCAEEQaiEBCyADIAE2AgAgBCACNgIMIAAgBEEMaiAGQRB2Qf8BcSAEQQhqEIoCGgJAIAQoAggiAQ0AQcWTAiEBDAILQcWTAkGTvgEgAUHWlwIQrwUbIQEMAQsgBkEYdiEBAkACQCAGQYCAAnFFDQBBqZgCIQICQCAAKAIwIAFBBHRqIgEtAAhBD3FBBEcNACABKAIAQRBqIQILIAMgAjYCAAwBCyAEIAI2AgwCQCAAIARBDGogASADEIoCIgFFDQAgAS0AAEHjAEYNAQsgA0GpmAI2AgALQY7LASEBC0EAIQULIAVFDQELQQAhAQsgBEEQaiQAIAELaQECfyMAQRBrIgIkACAAKAIUIQMgAkEANgIMAkACQCAAIAMgAkEMahD6ASIDRQ0AIAIgAzYCACACIAIoAgw2AgQgAEGEngIgAhCDAyECDAELIAAgARD8ASECCyAAIAFBwr0BIAIQ/QEACywBAX8jAEEQayIDJAAgAyAAIAEQiQQ2AgQgAyACNgIAIABBuZsCIAMQ/gEAC4ABAQR/AkAgACgCXCIBRQ0AIAAoAhwhAiAAKAIMIgMgA0FwaiIEKQMANwMAIAMgBEEIai0AADoACCAAKAIMQXBqIgMgAiABaiIBKQMANwMAIANBCGogAS0ACDoAACAAIAAoAgwiAUEQajYCDCAAIAFBcGpBARCcAgsgAEECEIwCAAsfACAAIAIgASABLQAIQQ9xQX1qQQJJG0GUxgEQ+wEACxoAIAAgAiABIAEtAAhBD3FBA0YbIAMQ+wEACzMBAX8jAEEQayIDJAAgAyAAIAIgASABIANBCGpBABCkBBsQ/AE2AgAgAEG/GCADEP4BAAtVAQF/IwBBIGsiAyQAAkAgACABEIkEIgEgACACEIkEIgIQrwUNACADIAE2AgAgAEH3DiADEP4BAAsgAyACNgIUIAMgATYCECAAQdARIANBEGoQ/gEAC3oBA38jAEHQAGsiBCQAAkACQCACRQ0AIAJBEGohBQJAIAItAAciBkH/AUcNACACKAIMIQYLIARBEGogBSAGEIQDDAELIARBPzsBEAsgBCABNgIIIAQgAzYCBCAEIARBEGo2AgAgAEHaEiAEEIMDIQIgBEHQAGokACACC1YBA38gACgCFCIBKAIAKAIAKAIMIQIgAUEUakEBNgIAAkACQCABKAIQIAIoAjRHDQBBACEDIAItAAcNASABLQAiQcAAcQ0AIAAgARCUAgtBASEDCyADC7wIAQx/IAAoAnAhAiAAKAIUIQMCQCACQQxxDQAgA0EUakEANgIAQQAPCyADKAIAKAIAKAIMIQQgAyABQQRqIgU2AhBBACEGAkAgAkEIcUUNACAAIAAoAmxBf2oiATYCbCABRSEGCwJAAkACQCAGRQ0AIAAgACgCaDYCbAwBC0EBIQEgAkEEcUUNAQsCQCADLwEiIgFBwABxRQ0AIAMgAUG//wNxOwEiQQEhAQwBCwJAAkBB4N0EIAMoAhBBfGooAgAiAUH/AHFqLQAAQSBxRQ0AIAFBgID8B3FFDQELIAAgAygCBDYCDAsCQCAGRQ0AIABBA0F/QQBBABCTAgsCQCACQQRxRQ0AQQAhB0F/IQECQAJAIAUgBCgCNGtBAnUiCEF/aiIFIAAoAmQiAkEAIAIgBCgCFEgbIglMDQACQCAEKAJAIgpFDQACQCAFIAlrQT9KDQBBACELIAkhDANAQQIhAgJAIAogDEEBaiIMaiwAACINQYB/Rg0AIAsgDWohC0EAIQIgDCAFRw0AIAtBAEchB0EBIQILIAJFDQALAkAgAkECRw0AQQAhAgsgAg0BCwJAAkACQCAEKAIkIgdFDQAgBCgCRCINKAIAIAlMDQELIARBKGohDEF/IQIMAQsgByAJQQd2IgIgByACShtBf2ohCyACQX9qIQwCQANAAkAgDCICIAtHDQAgCyECDAILIA0gAkEBaiIMQQN0aigCACAJTA0ACwsgDSACQQN0aiICQQRqIQwgAigCACECCyAMKAIAIQwCQCACIAlODQADQCAMIAogAkEBaiICaiwAAGohDCACIAlHDQALCwJAAkACQCAHRQ0AIAQoAkQiDSgCACAISA0BCyAEQShqIQlBfyECDAELIAcgBUEHdiICIAcgAkobQX9qIQsgAkF/aiEJAkADQAJAIAkiAiALRw0AIAshAgwCCyANIAJBAWoiCUEDdGooAgAgCEgNAAsLIA0gAkEDdGoiAkEEaiEJIAIoAgAhAgsgCSgCACEJAkAgAiAFTg0AA0AgCSAKIAJBAWoiAmosAABqIQkgAiAFRw0ACwsgDCAJRyEHCyAHRQ0BCwJAIAQoAkAiCkUNAAJAAkACQCAEKAIkIgJFDQAgBCgCRCIMKAIAIAhIDQELIARBKGohAUF/IQIMAQsgAiAFQQd2IgEgAiABShtBf2ohBCABQX9qIQECQANAAkAgASICIARHDQAgBCECDAILIAwgAkEBaiIBQQN0aigCACAISA0ACwsgDCACQQN0aiICQQRqIQEgAigCACECCyABKAIAIQEgAiAFTg0AA0AgASAKIAJBAWoiAmosAABqIQEgAiAFRw0ACwsgAEECIAFBAEEAEJMCCyAAIAU2AmQLQQEhASAALQAGQQFHDQACQCAGRQ0AIABBATYCbAsgAyADLwEiQcAAcjsBIiAAQQEQjAIACyABC4QFAQl/IAMgACACQQFqIAEoAgAiBBCuAiIFNgIAQY2+ASEGAkAgBQ0AQX8hBQJAIARB4N0EIAAoAjQiByAEQQJ0aigCAEH/AHFqLAAAQQd1aiIIQQFIDQBBACEGQX8hBUEAIQkDQCAHIAZBAnRqKAIAIgRBB3YiCkH/AXEhCwJAAkACQAJAAkACQCAEQf8AcSIMQUhqDhUDBAQEBAQEBAQEBAQCAgQEBAQEBAEACyAMQQhHDQMgCyACTCALIARBEHZB/wFxaiACTnEhBAwECyALQQJqIAJMIQQMAwsgCyACTCEEDAILIAYgCmpBgoCAeGoiBCAJIAQgCUobIAkgBCAITBshCUEAIQQMAQtB4N0EIAxqLQAAQQN2IAsgAkZxIQQLQX8gBiAGIAlIGyAFIAQbIQUgBkEBaiIGIAhHDQALCyABIAU2AgACQCAFQX9GDQACQAJAAkACQAJAAkAgByAFQQJ0aiILKAIAIgRB/wBxDgoAAQEDBAEBAQECAQsCQCAEQRB2Qf8BcSILIARBB3ZB/wFxIgRPDQAgACABIAsgAxCKAiEGC0EAIQUgCyAESQ0EC0EBIQUMAwsgAyAAKAI8IARBDXZB+A9xaigCACIGQRBqQamYAiAGGzYCAEGexQEhBkEAIQUMAgtBACEFQamYAiELQQAhBgJAIAAoAjAgBEEPdkEEdGoiBC0ACEEPcUEERw0AIAQoAgBBEGohC0GMDCEGCyADIAs2AgAMAQtBACEFQamYAiEEQQAhBgJAIAAoAjAgC0EEaigCAEEHdkEEdGoiCy0ACEEPcUEERw0AIAsoAgBBEGohBEGMDCEGCyADIAQ2AgALIAVFDQELQQAhBgsgBguIAQEBf0EAIQMCQAJAAkACQCABDgYDAgICAAECCyACIAAoAhAoAqgBIgM2AgAgAy0ABEHAAHIhAwwCCyACIABB9MIBQRcQwAMiAzYCACADLQAEQcAAciEDDAELIAIgACgCDEFwaiIDKQMANwMAIANBCGotAAAhAwsgAiADOgAIIAAgAkEQajYCDAujAQEDfwJAAkAgACgCMCICDQAgACgCECECIAAgARCyAyEDIAIoAqQBIgEoAjANAQJAIAIoAqABIgFFDQAgACABEQAAGgsQDgALIAIgATYCCEEEEA8iASAAKAIwNgIAIAFBqNgEQQAQEAALIAEgASgCDCIEQRBqNgIMIAQgACgCDEFwaiIAKQMANwMAIAQgAEEIai0AADoACCACKAKkASADEIwCAAufAQECfyMAQRBrIgMkACAAKAJgIQQgA0EANgIIIAMgACgCMDYCACAAIAM2AjBBAEEANgLknh4gASAAIAIQB0EAKALknh4hAkEAQQA2AuSeHgJAIAJBAUcNAEEAEAohAhACGiACEAQaAkAgAygCCA0AIANBfzYCCAsQCQsgAygCACECIAAgBDYCYCAAIAI2AjAgAygCCCEAIANBEGokACAAC8sDAQZ/IAAoAhAtAE8hAyAAIAAoAgwgACgCHCIEazYCDCAAIAAoAiQgBGs2AiQgACgCGCAEayEFAkAgACgCICIERQ0AA0AgBCAEKAIIIAAoAhxrNgIIIAQoAhAiBA0ACwsgBUEEdSEGAkAgACgCFCIERQ0AA0AgBCAEKAIEIAAoAhxrNgIEIAQgBCgCACAAKAIcazYCACAEKAIIIgQNAAsLIAAoAhBBAToATyAAIAAoAhwgBkEFaiIFQQR0IAFBBWoiB0EEdBD2AiEIIAAoAhAgAzoATwJAAkAgCA0AIAAQjwJBACEEIAJFDQEgAEEEEIwCAAsgACAINgIcIAAgCCAAKAIMajYCDCAAIAggACgCJGo2AiQCQCAAKAIgIgRFDQADQCAEIAAoAhwgBCgCCGo2AgggBCgCECIEDQALCwJAIAAoAhQiBEUNAANAIAQgACgCHCAEKAIEajYCBCAEIAAoAhwgBCgCAGo2AgACQCAELQAiQQJxDQAgBEEUakEBNgIACyAEKAIIIgQNAAsLIAAgACgCHCABQQR0ajYCGEEBIQQgBiABTg0AA0AgCCAFQQR0akEAOgAIQQEhBCAFQQFqIgUgB0gNAAsLIAQLnAEBAX8gACAAKAIcIgEgACgCDGo2AgwgACABIAAoAiRqNgIkAkAgACgCICIBRQ0AA0AgASAAKAIcIAEoAghqNgIIIAEoAhAiAQ0ACwsCQCAAKAIUIgFFDQADQCABIAAoAhwgASgCBGo2AgQgASAAKAIcIAEoAgBqNgIAAkAgAS0AIkECcQ0AIAFBFGpBATYCAAsgASgCCCIBDQALCwuwAQECfwJAAkAgACgCGCAAKAIcIgNrIgRBgcjQB0gNAEEAIQEgAkUNASAAQQUQjAIACwJAIAFBv4Q9Sg0AAkACQCAEQQN1IgRBwIQ9IARBwIQ9SBsiBCAAKAIMIANrQQR1IAFqIgEgBCABShsiA0HAhD1MDQAMAQsgACADIAIQjgIhAQsgA0HBhD1IDQELIABBiIY9IAIQjgIaQQAhASACRQ0AIABBiwpBABD+AQALIAELmgEBA38gACgCDCEBAkAgACgCFCICRQ0AA0AgAigCBCIDIAEgASADSRshASACKAIIIgINAAsLAkAgASAAKAIcIgJrQQR1IgFBEyABQRNKGyIBQb+EPUsNACAAKAIYIAJrQQR1QcCEPSABQQFqIgJBA2wgAUGUrBRLG0wNACAAQcCEPSACQQF0IAFBn8IeSxtBABCOAhoLIAAQrgMLLAACQCAAKAIYIAAoAgxrQR9KDQAgAEEBQQEQkAIaCyAAIAAoAgxBEGo2AgwLtwIBBn8jAEHwAGsiBSQAAkAgACgCWCIGRQ0AIAAtAAdFDQAgACgCFCIHKAIEIQggACgCHCEJIAAoAgwhCiAFIAc2AmggBSACNgIYIAUgATYCAAJAAkAgBA0AQQghBAwBCyAHIAQ7AR4gByADOwEcQYgCIQQLAkAgBy0AIkECcQ0AIAAoAgwgBygCBCICTw0AIAAgAjYCDAsCQCAAKAIYIAAoAgxrQc8CSg0AIABBFEEBEJACGgsgCiAJayECIAggCWshAQJAIAcoAgQgACgCDEHAAmoiA08NACAHIAM2AgQLIABBADoAByAHIAcvASIgBHI7ASIgACAFIAYRAwAgAEEBOgAHIAcgACgCHCABajYCBCAAIAAoAhwgAmo2AgwgByAHLwEiIARBf3NxOwEiCyAFQfAAaiQAC1kBAX8gAEEANgJkAkAgACgCcEEBcUUNACABKAIAKAIAKAIMIQIgASABKAIQQQRqNgIQIAAgAS8BIkEDdkEEcUF/QQEgAi0ABhCTAiABIAEoAhBBfGo2AhALC6kDAQZ/IAEuASAhAwJAIAAoAnBFDQAgA0F/SA0AIAAgASACEJYCCyABKAIAIQQgAiEFAkACQAJAAkACQCADQQFqDgMDAAECCyAAIAQ2AgwMAwsCQAJAIAINAEEAIQMMAQsgBCAAKAIMIAJBBHRrIgMpAwA3AwAgAy0ACCEDCyAEIAM6AAggACAEQRBqNgIMDAILAkAgA0F+TA0AIAMhBQwBCyAAKAIUIgYgAjYCHCAGIAYvASJBgARyOwEiIAAgBEF/QQEQqwIhBCAAKAIUIgYgBi8BIkH/+wNxOwEiAkAgACgCcEUNACAAKAIcIQUgACAGIAIQlgIgACgCHCAEIAVraiEECyACQX0gA2sgA0F+RhshBQtBACEDAkAgBSACIAUgAkgbIgdBAEwNACAAKAIMIAJBBHRrIQgDQCAEIANBBHQiAmoiBiAIIAJqIgIpAwA3AwAgBiACLQAIOgAIIANBAWoiAyAHRw0ACwsCQCADIAVODQADQCAEIANBBHRqQQA6AAggA0EBaiIDIAVHDQALCyAAIAQgBUEEdGo2AgwLIAAgASgCCDYCFAvAAQEDfwJAIAAoAnBBAnFFDQAgACgCDCACQQR0ayEDQQAhBAJAIAEtACJBAnENACABKAIAKAIAKAIMIgUtAAdFDQAgAUEYaigCACAFLQAGakEBaiEECyABIAEoAgAgBEEEdCIEaiIFNgIAIABBAUF/IAMgBWtBBHZB//8DcSACEJMCIAEgASgCACAEazYCAAsCQCABKAIIIgEtACJBAnENACAAIAEoAhAgASgCACgCACgCDCgCNGtBAnVBf2o2AmQLC5sDAQV/AkACQANAAkACQAJAIAItAAhBP3EiBUFqag4RAAICAgICAgICAgICAgICAgQBCyAAIAJBfyACKAIAEJgCDwsgBUEGRg0DCyADQQFqIQMgACACEJkCIQIMAAsACyAAIAJBfyACKAIAKAIMEJgCDwsgAigCACgCDCIGLQAGIQcCQCAAKAIYIAAoAgxrQQR1IAYtAAgiCCAEayIFSg0AIAIgACgCHGshAgJAIAAoAhAoAgxBAUgNACAAEL8CCyAAIAVBARCQAhogACgCHCACaiECCyABIAEoAgAgBEEEdGs2AgACQCADQQFIDQBBACEFA0AgASgCACAFQQR0IgRqIgkgAiAEaiIEKQMANwMAIAkgBC0ACDoACCAFQQFqIgUgA0cNAAsLIAEoAgAhBQJAAkAgAyAHTA0AIAMhBAwBCwNAIAUgA0EEdGpBADoACCADIAdHIQIgA0EBaiIEIQMgAg0ACwsgASAFIAhBBHRqQRBqNgIEIAEgBigCNDYCECABIAEvASJBIHI7ASIgACAFIARBBHRqNgIMQX8LzwEBAn8CQCAAKAIYIAAoAgxrQc8CSg0AIAEgACgCHGshBAJAIAAoAhAoAgxBAUgNACAAEL8CCyAAQRRBARCQAhogACgCHCAEaiEBCyAAKAIMQcACaiEFAkAgACgCFCgCDCIEDQAgABCtAyEECyAAIAQ2AhQgBEECOwEiIAQgAjsBICAEIAE2AgAgBCAFNgIEIAAgBDYCFAJAIAAoAnBBAXFFDQAgAEEAQX9BASAAKAIMIAFrQQR1QX9qEJMCCyAAIAQgACADEQAAIgEQlQIgAQvGAQEDfwJAIAAoAhggACgCDGtBH0oNACABIAAoAhxrIQICQCAAKAIQKAIMQQFIDQAgABC/AgsgAEEBQQEQkAIaIAAoAhwgAmohAQsCQCAAIAFBFxCIBCIDLQAIQQ9xRQ0AAkAgACgCDCICIAFNDQADQCACIAJBcGoiBCkDADcDACACIARBCGotAAA6AAggBCECIAQgAUsNAAsLIAAgACgCDEEQajYCDCABIAMpAwA3AwAgASADLQAIOgAIIAEPCyAAIAEQgAIAC+kCAQV/AkACQAJAAkADQCABIQMCQAJAIAEtAAhBP3EiBEFqag4RBAEBAQEBAQEBAQEBAQEBAQMACyAEQQZGDQQLIAAgARCZAiEBDAALAAsgASgCAEEMaiEDCyAAIAEgAiADKAIAEJgCGkEAIQMMAQsgACgCDCIDIAFrIQUgASgCACgCDCIELQAGIQYCQCAAKAIYIANrQQR1IAQtAAgiA0oNACABIAAoAhxrIQECQCAAKAIQKAIMQQFIDQAgABC/AgsgACADQQEQkAIaIAAoAhwgAWohAQsgBUEEdSEFIAEgA0EEdGpBEGohBwJAIAAoAhQoAgwiAw0AIAAQrQMhAwsgACADNgIUIANBADsBIiADIAI7ASAgAyABNgIAIAMgBzYCBCAAIAM2AhQgAyAEKAI0NgIQIAUgBkoNACAFQX9qIQEDQCAAIAAoAgwiBEEQajYCDCAEQQA6AAggAUEBaiIBIAZHDQALCyADC+oBAQN/IAAgACgCYEEBaiIDNgJgAkACQAJAIANB+P8DcUHIAUkNAAJAIAAoAhgiAyAAKAIMIgRrQQ9KDQAgAyAAKAIcIgVrIgNBgcjQB04NAiADQQN1IgNBwIQ9IANBwIQ9SBsiAyAEIAVrQQR1IgQgAyAEShsiA0HAhD1KDQMgACADQQEQjgIaIAAoAhwgASAFa2ohAQsgABCvAwsCQCAAIAEgAhCaAiIBRQ0AIAFBBDsBIiAAIAEQswQLIAAgACgCYEF/ajYCYA8LIABBBRCMAgALIABBiIY9QQEQjgIaIABBiwpBABD+AQAL7gEBA38gACAAKAJgQYGABGoiAzYCYAJAAkACQCADQfj/A3FByAFJDQACQCAAKAIYIgMgACgCDCIEa0EPSg0AIAMgACgCHCIFayIDQYHI0AdODQIgA0EDdSIDQcCEPSADQcCEPUgbIgMgBCAFa0EEdSIEIAMgBEobIgNBwIQ9Sg0DIAAgA0EBEI4CGiAAKAIcIAEgBWtqIQELIAAQrwMLAkAgACABIAIQmgIiAUUNACABQQQ7ASIgACABELMECyAAIAAoAmBB//97ajYCYA8LIABBBRCMAgALIABBiIY9QQEQjgIaIABBiwpBABD+AQAL4wEBBn8jAEEQayIDJAAgAC0AByEEIAAoAhQhBQNAIAAoAmAhBiAAKAIcIQcgA0EANgIIIAMgACgCMDYCACAAIAM2AjBBAEEANgLknh5BMyAAIAcgAWogAkEAEBEaQQAoAuSeHiEHQQBBADYC5J4eAkAgB0EBRw0AQQAQCiEHEAIaIAcQBBoCQCADKAIIDQAgA0F/NgIICxAJCyADKAIAIQcgACAGNgJgIAAgBzYCMAJAIAMoAggiBkUNACAAIAQ6AAcgACAFNgIUIAghAgsgAiEIIAYhAiAGDQALIANBEGokACAIC/cBAQV/IwBBEGsiBSQAIAAoAlwhBiAAIAQ2AlwgAC0AByEHIAAoAhQhCCAAKAJgIQlBACEEIAVBADYCCCAFIAAoAjA2AgAgACAFNgIwQQBBADYC5J4eIAEgACACEAdBACgC5J4eIQJBAEEANgLknh4CQCACQQFHDQBBABAKIQIQAhogAhAEGgJAIAUoAggNACAFQX82AggLEAkLIAUoAgAhAiAAIAk2AmAgACACNgIwAkAgBSgCCCICRQ0AIAAgBzoAByAAIAg2AhQgACAAIAMgAhCdAiIEIAAoAhwgA2oQiwIgABCRAgsgACAGNgJcIAVBEGokACAEC/oBAQV/IwBBwABrIgQkACAAIAAoAmBBgIAEajYCYCAEQTBqIgVBADYCACAEQSRqIgZCADcCACAEQRhqIgdCADcDACAEQQxqIghCADcCACAEIAI2AjggBCABNgIAIAQgAzYCNCAEQQA2AgQgAEE0IAQgACgCDCAAKAIcayAAKAJcEJ4CIQIgACAEKAIEIAgoAgBBABDyAiEBIAhBADYCACAEIAE2AgQgACAEKAIQIAcoAgBBGGwQ9QIgACAEQRxqKAIAIAYoAgBBBHQQ9QIgACAEQShqKAIAIAUoAgBBBHQQ9QIgACAAKAJgQYCAfGo2AmAgBEHAAGokACACC5MCAQN/IwBBIGsiAiQAIAEoAgAiAyADKAIAIgRBf2o2AgACQAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEEDAELIAMQtAQhBAsgASgCNCEDAkACQAJAAkAgBEEbRw0AAkAgA0UNACADQeIAEK0FRQ0DCyAAIAEoAgAgASgCOBCVBCEBDAELAkAgA0UNACADQfQAEK0FRQ0DCyAAIAEoAgAgAUEEaiABQRBqIAEoAjggBBCUAyEBCyAAIAEQpgIgAkEgaiQADwsgAiADNgIEIAJBtgg2AgAgAEHanQIgAhCDAxogAEEDEIwCAAsgAiADNgIUIAJB5go2AhAgAEHanQIgAkEQahCDAxogAEEDEIwCAAuKBAEBfyMAQSBrIgUkACAFQQA2AhAgBSAENgIMIAUgAzYCCCAFIAI2AgQgBSAANgIAIAUgAEGGlwJBBCADIAIRBAAiAzYCECAFQdQAOgAYAkAgAw0AIAUgBSgCACAFQRhqQQEgBSgCCCAFKAIEEQQANgIQCyAFQQA6ABgCQCAFKAIQDQAgBSAFKAIAIAVBGGpBASAFKAIIIAUoAgQRBAA2AhALAkAgBSgCEA0AIAUgBSgCAEGo0gRBBiAFKAIIIAUoAgQRBAA2AhALIAVBBDoAGAJAIAUoAhANACAFIAUoAgAgBUEYakEBIAUoAgggBSgCBBEEADYCEAsgBUEIOgAYAkAgBSgCEA0AIAUgBSgCACAFQRhqQQEgBSgCCCAFKAIEEQQANgIQCyAFQQg6ABgCQCAFKAIQDQAgBSAFKAIAIAVBGGpBASAFKAIIIAUoAgQRBAA2AhALIAVC+KwBNwMYAkAgBSgCEA0AIAUgBSgCACAFQRhqQQggBSgCCCAFKAIEEQQANgIQCyAFQoCAgICAgMq7wAA3AxgCQCAFKAIQDQAgBSAFKAIAIAVBGGpBCCAFKAIIIAUoAgQRBAA2AhALIAUgASgCDDoAGAJAIAUoAhANACAFIAUoAgAgBUEYakEBIAUoAgggBSgCBBEEADYCEAsgBSABQQAQogIgBSgCECEDIAVBIGokACADC4sWAQl/IwBBEGsiAyQAAkACQAJAIAAoAgwNACABKAJMIgQgAkcNAQsgA0GAAToADCAAKAIQDQEgACAAKAIAIANBDGpBASAAKAIIIAAoAgQRBAA2AhAMAQsgACAEEKMCCyABKAIoIQJBACEEA0AgA0EIaiAEIgVrQQRqIAJB/wBxOgAAIAVBAWohBCACQf8ASyEGIAJBB3YhAiAGDQALIAMgAy0ADEGAAXI6AAwCQCAAKAIQDQAgACAAKAIAIANBCGogBUF/c2pBBWogBCAAKAIIIAAoAgQRBAA2AhALIABBEGohByABKAIsIQJBACEEA0AgA0EIaiAEIgVrQQRqIAJB/wBxOgAAIAVBAWohBCACQf8ASyEGIAJBB3YhAiAGDQALIAMgAy0ADEGAAXI6AAwCQCAHKAIADQAgACAAKAIAIANBCGogBUF/c2pBBWogBCAAKAIIIAAoAgQRBAA2AhALIAMgAS0ABjoACAJAIAcoAgANACAAIAAoAgAgA0EIakEBIAAoAgggACgCBBEEADYCEAsgAyABLQAHOgAIAkAgBygCAA0AIAAgACgCACADQQhqQQEgACgCCCAAKAIEEQQANgIQCyADIAEtAAg6AAgCQCAHKAIADQAgACAAKAIAIANBCGpBASAAKAIIIAAoAgQRBAA2AhALIAEoAhQhAkEAIQQDQCADQQhqIAQiBWtBBGogAkH/AHE6AAAgBUEBaiEEIAJB/wBLIQYgAkEHdiECIAYNAAsgAyADLQAMQYABcjoADAJAIAcoAgANACAAIAAoAgAgA0EIaiAFQX9zakEFaiAEIAAoAgggACgCBBEEADYCEAsCQCABKAIUQQJ0IgJFDQAgBygCAA0AIAAgACgCACABKAI0IAIgACgCCCAAKAIEEQQANgIQC0EAIQQgASgCECIIIQIDQCADQQhqIAQiBWtBBGogAkH/AHE6AAAgBUEBaiEEIAJB/wBLIQYgAkEHdiECIAYNAAsgAyADLQAMQYABcjoADAJAIAcoAgANACAAIAAoAgAgA0EIaiAFQX9zakEFaiAEIAAoAgggACgCBBEEADYCEAsCQCAIQQFIDQBBACECA0AgAyABKAIwIAJBBHRqIgUtAAhBP3EiBDoACAJAIAcoAgANACAAIAAoAgAgA0EIakEBIAAoAgggACgCBBEEADYCEAsCQAJAAkACQCAEQX1qDhIBAgMDAwMDAwMDAwMDAwMDAAIDCyADIAUrAwA5AwggBygCAA0CIAAgACgCACADQQhqQQggACgCCCAAKAIEEQQANgIQDAILIAMgBSkDADcDCCAHKAIADQEgACAAKAIAIANBCGpBCCAAKAIIIAAoAgQRBAA2AhAMAQsgACAFKAIAEKMCCyACQQFqIgIgCEcNAAsLQQAhBCABKAIMIgghAgNAIANBCGogBCIFa0EEaiACQf8AcToAACAFQQFqIQQgAkH/AEshBiACQQd2IQIgBg0ACyADIAMtAAxBgAFyOgAMAkAgBygCAA0AIAAgACgCACADQQhqIAVBf3NqQQVqIAQgACgCCCAAKAIEEQQANgIQCwJAIAhBAUgNAEEAIQIDQCADIAEoAjwgAkEDdCIEai0ABDoACAJAIAcoAgANACAAIAAoAgAgA0EIakEBIAAoAgggACgCBBEEADYCEAsgAyABKAI8IARqLQAFOgAIAkAgBygCAA0AIAAgACgCACADQQhqQQEgACgCCCAAKAIEEQQANgIQCyADIAEoAjwgBGotAAY6AAgCQCAHKAIADQAgACAAKAIAIANBCGpBASAAKAIIIAAoAgQRBAA2AhALIAJBAWoiAiAIRw0ACwtBACEEIAEoAhwiCCECA0AgA0EIaiAEIgVrQQRqIAJB/wBxOgAAIAVBAWohBCACQf8ASyEGIAJBB3YhAiAGDQALIAMgAy0ADEGAAXI6AAwCQCAHKAIADQAgACAAKAIAIANBCGogBUF/c2pBBWogBCAAKAIIIAAoAgQRBAA2AhALAkAgCEEBSA0AQQAhAgNAIAAgASgCOCACQQJ0aigCACABKAJMEKICIAJBAWoiAiAIRw0ACwtBACEEQQAhCAJAIAAoAgwNACABKAIYIQgLIAghAgNAIANBCGogBCIFa0EEaiACQf8AcToAACAFQQFqIQQgAkH/AEshBiACQQd2IQIgBg0ACyADIAMtAAxBgAFyOgAMAkAgBygCAA0AIAAgACgCACADQQhqIAVBf3NqQQVqIAQgACgCCCAAKAIEEQQANgIQCwJAIAhFDQAgBygCAA0AIAAgACgCACABKAJAIAggACgCCCAAKAIEEQQANgIQC0EAIQRBACEJAkAgACgCDA0AIAEoAiQhCQsgCSECA0AgA0EIaiAEIgVrQQRqIAJB/wBxOgAAIAVBAWohBCACQf8ASyEGIAJBB3YhAiAGDQALIAMgAy0ADEGAAXI6AAwCQCAHKAIADQAgACAAKAIAIANBCGogBUF/c2pBBWogBCAAKAIIIAAoAgQRBAA2AhALAkAgCUEBSA0AIANBDWohCkEAIQgDQCABKAJEIAhBA3QiC2ooAgAhAkEAIQQDQCADQQhqIAQiBWtBBGogAkH/AHE6AAAgBUEBaiEEIAJB/wBLIQYgAkEHdiECIAYNAAsgAyADLQAMQYABcjoADAJAIAcoAgANACAAIAAoAgAgCiAFQX9zaiAEIAAoAgggACgCBBEEADYCEAsgASgCRCALaigCBCECQQAhBANAIANBCGogBCIFa0EEaiACQf8AcToAACAFQQFqIQQgAkH/AEshBiACQQd2IQIgBg0ACyADIAMtAAxBgAFyOgAMAkAgBygCAA0AIAAgACgCACAKIAVBf3NqIAQgACgCCCAAKAIEEQQANgIQCyAIQQFqIgggCUcNAAsLQQAhBEEAIQkCQCAAKAIMDQAgASgCICEJCyAJIQIDQCADQQhqIAQiBWtBBGogAkH/AHE6AAAgBUEBaiEEIAJB/wBLIQYgAkEHdiECIAYNAAsgAyADLQAMQYABcjoADAJAIAcoAgANACAAIAAoAgAgA0EIaiAFQX9zakEFaiAEIAAoAgggACgCBBEEADYCEAsCQCAJQQFIDQAgA0ENaiEKQQAhCANAIAAgASgCSCAIQQxsIgtqKAIAEKMCIAEoAkggC2ooAgQhAkEAIQQDQCADQQhqIAQiBWtBBGogAkH/AHE6AAAgBUEBaiEEIAJB/wBLIQYgAkEHdiECIAYNAAsgAyADLQAMQYABcjoADAJAIAcoAgANACAAIAAoAgAgCiAFQX9zaiAEIAAoAgggACgCBBEEADYCEAsgASgCSCALaigCCCECQQAhBANAIANBCGogBCIFa0EEaiACQf8AcToAACAFQQFqIQQgAkH/AEshBiACQQd2IQIgBg0ACyADIAMtAAxBgAFyOgAMAkAgBygCAA0AIAAgACgCACAKIAVBf3NqIAQgACgCCCAAKAIEEQQANgIQCyAIQQFqIgggCUcNAAsLQQAhBEEAIQgCQCAAKAIMDQAgASgCDCEICyAIIQIDQCADQQhqIAQiBWtBBGogAkH/AHE6AAAgBUEBaiEEIAJB/wBLIQYgAkEHdiECIAYNAAsgAyADLQAMQYABcjoADAJAIAcoAgANACAAIAAoAgAgA0EIaiAFQX9zakEFaiAEIAAoAgggACgCBBEEADYCEAsCQCAIQQFIDQBBACECA0AgACABKAI8IAJBA3RqKAIAEKMCIAJBAWoiAiAIRw0ACwsgA0EQaiQAC4sCAQZ/IwBBEGsiAiQAAkACQCABDQAgAkGAAToACiAAKAIQDQEgACAAKAIAIAJBCmpBASAAKAIIIAAoAgQRBAA2AhAMAQsCQCABLQAHIgNB/wFHDQAgASgCDCEDCyADQQFqIQRBACEFA0AgAkELaiAFIgZrQQRqIARB/wBxOgAAIAZBAWohBSAEQf8ASyEHIARBB3YhBCAHDQALIAIgAi0AD0GAAXI6AA8CQCAAKAIQDQAgACAAKAIAIAJBC2ogBkF/c2pBBWogBSAAKAIIIAAoAgQRBAA2AhALIANFDQAgACgCEA0AIAAgACgCACABQRBqIAMgACgCCCAAKAIEEQQANgIQCyACQRBqJAALGgAgAEEmIAFBBHRBEGoQswIiACABOgAGIAALOgEBfyAAQQYgAUECdCICQRBqELMCIgAgAToABiAAQQA2AgwCQCABRQ0AIABBEGpBACACEMgEGgsgAAt0AQJ/AkAgAS0ABkUNAEEAIQIDQCAAQQlBIBCzAiIDQRhqQQA6AAAgAyADQRBqNgIIIAEgAkECdGpBEGogAzYCAAJAIAEtAAVBIHFFDQAgAy0ABUEYcUUNACAAIAEgAxCvAgsgAkEBaiICIAEtAAZJDQALCwu5AQEEfyAAQSBqIQICQAJAIAAoAiAiA0UNACADKAIIIgQgAUkNAANAIAMhBSAEIAFGDQICQCAFKAIQIgNFDQAgAygCCCIEIAFPDQELCyAFQRBqIQILIABBCUEgELMCIQUgAigCACEDIAUgAjYCFCAFIAM2AhAgBSABNgIIAkAgA0UNACADIAVBEGo2AhQLIAIgBTYCACAAKAIsIABHDQAgACAAKAIQIgMoApwBNgIsIAMgADYCnAELIAULxgEBA38jAEEQayICJAACQAJAIAEtAAgiA0EBRg0AIANBD3FFDQAgACABQRgQiAQtAAhBD3FFDQECQCABIAAoAiQiA2siBEHw/z9NDQADQCAAIANB8P8/ajYCJCADQQA7Afr/PyABIAAoAiQiA2siBEHw/z9LDQALCyABIARBBHY7AQogACABNgIkCyACQRBqJAAPCyACIAAgACgCFCIDIAEgAygCAGtBBHVBABD4ASIDQamYAiADGzYCACAAQb3FASACEP4BAAsoAQF/IAAoAhQgACgCEDYCAAJAIAAoAhAiAUUNACABIAAoAhQ2AhQLC7IBAQR/AkAgACgCICICRQ0AA0AgAigCCCABSQ0BIAIoAhQgAigCEDYCACACQRBqIQMCQCACKAIQIgRFDQAgBCACKAIUNgIUCyACIAIoAggiBCkDADcDECACQRhqIAQtAAgiBDoAACACIAM2AggCQCACLQAFIgVBGHENACACIAVBIHI6AAUgBEHAAHFFDQAgAygCACIDLQAFQRhxRQ0AIAAgAiADEK8CCyAAKAIgIgINAAsLC8UDAQV/IAAoAhwhBAJAIAAoAiAiBUUNAANAIAUoAgggAUkNASAFKAIUIAUoAhA2AgAgBUEQaiEGAkAgBSgCECIHRQ0AIAcgBSgCFDYCFAsgBSAFKAIIIgcpAwA3AxAgBUEYaiAHLQAIIgc6AAAgBSAGNgIIAkAgBS0ABSIIQRhxDQAgBSAIQSByOgAFIAdBwABxRQ0AIAYoAgAiBi0ABUEYcUUNACAAIAUgBhCvAgsgACgCICIFDQALCwJAIAAoAiQiBiABSQ0AIAEgBGshCCACQX9HIQQDQAJAIAYgBi8BCkEEdGsiBSAAKAIcIgFNDQADQCAFLwEKDQEgBUGQgEBqIgUgAUsNAAsLIAAgBTYCJAJAAkAgBA0AIAAoAhBBOGohAQwBCyAAIAIgBkEQaiIBEIsCCyAAKAIMIgUgACAGQRgQiAQiBykDADcDACAFIActAAg6AAggBSAGKQMANwMQIAVBGGogBi0ACDoAACAFIAEpAwA3AyAgBUEoaiABLQAIOgAAIAAgBUEwajYCDAJAAkAgA0UNACAAIAVBABCbAgwBCyAAIAVBABCcAgsgACgCJCIGIAAoAhwgCGoiAU8NAAsLIAELKgAgAEEKQdQAELMCIgBBADoACCAAQQA7AQYgAEEMakEAQcQAEMgEGiAAC4cBACAAIAEoAjQgASgCFEECdBD1AiAAIAEoAjggASgCHEECdBD1AiAAIAEoAjAgASgCEEEEdBD1AiAAIAEoAkAgASgCGBD1AiAAIAEoAkQgASgCJEEDdBD1AiAAIAEoAkggASgCIEEMbBD1AiAAIAEoAjwgASgCDEEDdBD1AiAAIAFB1AAQ9QILbAEDfwJAIAAoAiAiA0EBTg0AQQAPCyAAKAJIIQRBACEAAkADQCAEIABBDGxqIgUoAgQgAkoNAQJAIAUoAgggAkwNACABQX9qIgENACAEIABBDGxqKAIAQRBqDwsgAEEBaiIAIANHDQALC0EAC1kAAkACQCAAKAIQIgAtAE1BAksNACAAIAIQsAIgAS0ABUEGcUUNASACIAItAAVB+AFxQQJyOgAFDwsgAC0ATg0AIAEgAC0ATEEYcSABLQAFQccBcXI6AAULC/cCAQJ/AkACQAJAA0ACQCABLQAEIgJBCUYNAAJAIAJBfGoOIwAEBAMEBQQFBQUFBQUFBQUABQUFBQUFBQUFBQUFBQUFBQUEBQsgASABLQAFQccBcUEgcjoABQ8LIAEgAS0ABUFHcSIDQSByIAMgASgCCCICIAFBEGpGGzoABSACLQAIQcAAcUUNAyACKAIAIgEtAAVBGHENAAwDCwALIAEvAQYiAg0AAkAgASgCDCIDRQ0AIAMtAAVBGHFFDQAgACADELACCyABIAEtAAVBxwFxQSByOgAFIAJFDQELAkACQAJAAkACQAJAAkACQCABLQAEQXtqDiIGAAQCBQMFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUBBgsgAUEIaiECDAYLIAFBCGohAgwFCyABQShqIQIMBAsgAUHQAGohAgwDCyABQRBqIQIMAgsACyABQRxqIQILIAIgACgCZDYCACAAIAE2AmQgASABLQAFQccBcToABQsLwwEBAn8CQCABLQAFIgJBB3FBBkYNACAAKAIQIQACQAJAAkACQAJAAkACQAJAIAEtAARBe2oOIgYABAIFAwUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQEGCyABQQhqIQMMBgsgAUEIaiEDDAULIAFBKGohAwwECyABQdAAaiEDDAMLIAFBEGohAwwCCwALIAFBHGohAwsgAyAAKAJoNgIAIAAgATYCaAsgASACQcABcUEFciACQccBcSACQQZxGzoABQs1ACAAKAIQIQAgASABLQAFQcABcUEEcjoABSAAIAEoAgA2AlggASAAKAJ8NgIAIAAgATYCfAtEAQF/IAAoAhAhAyAAIAIgAUEPcRD3AiEAIAMtAEwhAiAAIAE6AAQgACACQRhxOgAFIAAgAygCWDYCACADIAA2AlggAAuuAgEBfwJAIAJFDQAgAS0ABUHAAHENACACLQAGQQRxDQAgAkECIAAoAhAiA0G0AWooAgAQhwRFDQAgAy0AUkEEcQ0AAkACQCADLQBNQX1qQf8BcUEDSw0AIAEgAy0ATEEYcSABLQAFQccBcXI6AAUgAygCXCICIAFHDQEgAyAAIAIQtQI2AlwMAQsCQCADKAKAASABRw0AIAMgASgCADYCgAELAkAgAygChAEgAUcNACADIAEoAgA2AoQBCwJAIAMoAogBIAFHDQAgAyABKAIANgKIAQsgAygCjAEgAUcNACADIAEoAgA2AowBCyADQdgAaiECA0AgAiIAKAIAIgIgAUcNAAsgACABKAIANgIAIAEgAygCYDYCACADIAE2AmAgASABLQAFQcAAcjoABQsLdQEEfyABIQIDQAJAIAIoAgAiA0UNAAJAAkAgAy0ABSIEIAAoAhAtAEwiBUEYc3FFDQAgAiADKAIANgIAIAAgAxC2AgwBCyADIARBwAFxIAVBGHFyOgAFIAMhAgsgAigCACEDCyACQQAgAxsiAiABRg0ACyACC/MBAQF/AkACQAJAAkACQAJAAkACQAJAAkAgAS0ABEF8ag4jBwQCBgUBAAkJCQkJCQkJCQgJCQkJCQkJCQkJCQkJCQkJCQMJCyAAIAEQrQIPCwJAIAEoAgggAUEQakYNACABEKkCCyAAIAFBIBD1Ag8LIAAgASABLQAGQQJ0QRBqEPUCDwsgACABIAEtAAZBBHRBEGoQ9QIPCyAAIAEQ8wMPCyAAIAEQsQMPCyAAIAEgAS8BBiICQQR0QRhqQRAgAhsgASgCCGoQ9QIPCyAAIAEQwgMgACABIAEtAAdBEWoQ9QIPCyAAIAEgASgCDEERahD1AgsL5wEBAX8CQCAAKAIQIgItAE4gAUYNAAJAIAFBAUcNACAAIAIQuAIaDAELIAItAExBGHEhAAJAIAIoAlgiAUUNAANAIAEgAS0ABUHAAXEgAHI6AAUgASgCACIBDQALCyACQQA2AogBIAJCADcDgAECQCACKAJgIgFFDQADQCABIAEtAAVBwAFxIAByOgAFIAEoAgAiAQ0ACwsCQCACKAJ4IgFFDQADQCABIAEtAAVBwAFxIAByOgAFIAEoAgAiAQ0ACwsgAkEANgKYASACQgA3A5ABIAJBCDsATSACQQA2AhQLIAJBADYCFAt2AQF/AkAgACgCECICLQBNQQhGDQADQCAAELkCGiACLQBNQQhHDQALCwJAIAAoAhAiAi0ATUUNAANAIAAQuQIaIAItAE0NAAsLIAAQugIhAiAAIAEQuwIgAUEAIAEoAgwgASgCCGpB5ABuIAEtAFBsaxCsAyACC4IKAQl/IAAoAhAiAUEBOgBPQQAhAgJAAkACQAJAAkACQAJAAkACQAJAAkAgAS0ATQ4JAQIKAwQFBgcACgsgAUIANwJkIAFB9ABqQQA2AgAgAUHsAGpCADcCAAJAIAEoAqQBIgMtAAVBGHFFDQAgASADELACCwJAIAFBMGotAABBwABxRQ0AIAEoAigiAy0ABUEYcUUNACABIAMQsAILQQAhAwNAAkAgASADQQJ0akGQAmooAgAiBEUNACAELQAFQRhxRQ0AIAEgBBCwAgsgA0EBaiIDQQlHDQALAkAgASgCeCIDRQ0AA0ACQCADLQAFQRhxRQ0AIAEgAxCwAgsgAygCACIDDQALCyABQQA6AE1BASECDAgLAkAgASgCZA0AIAFBAToATQwHCyABEL4CIQIMBwsgABC6AiECIAAoAhAiBUEDOgBNIAVB2ABqIgYhBANAAkAgBCgCACIDRQ0AAkACQCADLQAFIgcgACgCEC0ATCIIQRhzcUUNACAEIAMoAgA2AgAgACADELYCDAELIAMgB0HAAXEgCEEYcXI6AAUgAyEECyAEKAIAIQMLIARBACADGyIEIAZGDQALIAUgBDYCXCABIAEoAgwgASgCCGo2AhAMBgsCQCABKAJcIgZFDQAgASgCDCEJAkACQCAGKAIAIgMNAEEAIQIMAQsgAS0ATCIEQRhxIQUgBEEYcyEIQQAhBANAAkACQCADLQAFIgIgCHFFDQAgBiADKAIANgIAIAAgAxC2AgwBCyADIAJBwAFxIAVyOgAFIAMhBgsgBEEBaiECIAYoAgAiA0UNASAEQeMASSEHIAIhBCAHDQALCyABIAZBACADGzYCXCABIAEoAgwgCWsgASgCEGo2AhAMBgsgAUEEOgBNIAEgAUHgAGo2AlwMBAsCQCABKAJcIgZFDQAgASgCDCEJAkACQCAGKAIAIgMNAEEAIQIMAQsgAS0ATCIEQRhxIQUgBEEYcyEIQQAhBANAAkACQCADLQAFIgIgCHFFDQAgBiADKAIANgIAIAAgAxC2AgwBCyADIAJBwAFxIAVyOgAFIAMhBgsgBEEBaiECIAYoAgAiA0UNASAEQeMASSEHIAIhBCAHDQALCyABIAZBACADGzYCXCABIAEoAgwgCWsgASgCEGo2AhAMBQsgAUEFOgBNIAEgAUH4AGo2AlwMAwsCQCABKAJcIgZFDQAgASgCDCEJAkACQCAGKAIAIgMNAEEAIQIMAQsgAS0ATCIEQRhxIQUgBEEYcyEIQQAhBANAAkACQCADLQAFIgIgCHFFDQAgBiADKAIANgIAIAAgAxC2AgwBCyADIAJBwAFxIAVyOgAFIAMhBgsgBEEBaiECIAYoAgAiA0UNASAEQeMASSEHIAIhBCAHDQALCyABIAZBACADGzYCXCABIAEoAgwgCWsgASgCEGo2AhAMBAtBACECIAFBADYCXCABQQY6AE0MAwsCQCABLQBTDQAgAUEcaigCACABQSBqKAIAIgNBBG1ODQAgASgCDCEEIAAgA0ECbRC8AyABIAEoAgwgBGsgASgCEGo2AhALIAFBBzoATQwBCwJAIAEoAnhFDQAgAS0AUw0AQQAhAyABQQA6AE8CQANAAkAgASgCeA0AIAMhBAwCCyAAEL0CQQohBCADQQFqIgNBCkcNAAsLIARBMmwhAgwCCyABQQg6AE0LQQAhAgsgAUEAOgBPCyACC48LAQ5/IAAoAhAiAUECOgBNIAEoAmghAiABQQA2AmgCQCAALQAFQRhxRQ0AIAEgABCwAgsCQCABQTBqLQAAQcAAcUUNACABKAIoIgAtAAVBGHFFDQAgASAAELACC0EAIQADQAJAIAEgAEECdGpBkAJqKAIAIgNFDQAgAy0ABUEYcUUNACABIAMQsAILIABBAWoiAEEJRw0AC0EAIQRBACEFAkAgASgCZEUNAEEAIQUDQCABEL4CIAVqIQUgASgCZA0ACwsCQCABKAKcASIARQ0AIAFBnAFqIQYDQCAEQQFqIQQCQAJAIAAtAAVBGHENACAAKAIgRQ0AIABBLGohBgwBCyAGIAAoAiw2AgAgACAANgIsIAAoAiAiAEUNAANAAkAgAC0ABUEYcQ0AIAAoAggiAy0ACEHAAHFFDQAgAygCACIDLQAFQRhxRQ0AIAEgAxCwAgsgBEEBaiEEIAAoAhAiAA0ACwsgBigCACIADQALC0EAIQdBACEIAkAgASgCZEUNAEEAIQgDQCABEL4CIAhqIQggASgCZA0ACwsgASACNgJkAkAgAkUNAANAIAEQvgIgB2ohByABKAJkDQALC0EAIQYDQCABKAJwIQMgAUEANgJwQQAhAgJAIANFDQADQCADIgAgAC0ABUEgcjoABSAAKAIcIQMCQCABIAAgBhDCAkUNAEEBIQIgASgCZEUNAANAIAEQvgIaIAEoAmQNAAsLIAMNAAsLIAZBAXMhBiACDQALIAEgASgCbEEAEMMCIAEgASgCdEEAEMMCIAEoAnQhCSABKAJsIQogAUH4AGoiAiEAA0AgACIDKAIAIgANAAsCQCABKAJgIgAgASgClAFGDQAgAUHgAGohBgNAAkACQCAALQAFQRhxDQAgACEGDAELAkAgACABKAKQAUcNACABIAAoAgA2ApABCyAGIAAoAgA2AgAgACADKAIANgIAIAMgADYCACAAIQMLIAYoAgAiACABKAKUAUcNAAsLQQAhC0EAIQwCQCACKAIAIgBFDQBBACEMA0ACQCAALQAFQRhxRQ0AIAEgABCwAgsgDEEBaiEMIAAoAgAiAA0ACwsCQCABKAJkRQ0AA0AgARC+AiALaiELIAEoAmQNAAsLQQAhBgNAIAEoAnAhAyABQQA2AnBBACECAkAgA0UNAANAIAMiACAALQAFQSByOgAFIAAoAhwhAwJAIAEgACAGEMICRQ0AQQEhAiABKAJkRQ0AA0AgARC+AhogASgCZA0ACwsgAw0ACwsgBkEBcyEGIAINAAsCQCABKAJwIg1FDQADQAJAIA0tAAciA0EfRg0AIA0oAhAiAEEBIAN0QRhsaiEOA0BBACEGQQAhAwJAIAAtAAlBwABxRQ0AIAAoAhAhAwsCQCADRQ0AIAMtAAVBGHEhAgJAIAMtAARBD3FBBEcNACACRQ0BIAEgAxCwAgwBCyACIQYLAkAgBkUNACAAQRA6AAgLAkAgAC0ACEEPcQ0AIAAtAAlBwABxRQ0AIABBCzoACQsgAEEYaiIAIA5JDQALCyANKAIcIg0NAAsLAkAgASgCdCINRQ0AA0ACQCANLQAHIgNBH0YNACANKAIQIgBBASADdEEYbGohDgNAQQAhBkEAIQMCQCAALQAJQcAAcUUNACAAKAIQIQMLAkAgA0UNACADLQAFQRhxIQICQCADLQAEQQ9xQQRHDQAgAkUNASABIAMQsAIMAQsgAiEGCwJAIAZFDQAgAEEQOgAICwJAIAAtAAhBD3ENACAALQAJQcAAcUUNACAAQQs6AAkLIABBGGoiACAOSQ0ACwsgDSgCHCINDQALCyABIAEoAmwgChDDAiABIAEoAnQgCRDDAiABEL4DIAEgAS0ATEEYczoATCAEIAVqIAhqIAdqIAxqIAtqC8wFAQR/IAFCADcCZCABQQM6AE0gAUH0AGpBADYCACABQewAakIANwIAAkAgASgCWCICRQ0AIAFB2ABqIQMgACgCECEEA0ACQAJAIAItAAUiBUEYcUUNACADIAIoAgA2AgAgACACELYCDAELIAIgBUH4AXEiBUEEciIDOgAFAkACQAJAAkAgAi0ABEF4ag4CAAECCyACIAQoAmg2AiggBCACNgJoIAIgA0HEAXE6AAUMAgsgAigCCCACQRBqRg0AIAIgA0HEAXE6AAUMAQsgAiAFQSRyOgAFCyACIQMLIAMoAgAiAg0ACwsgAUEANgKMASABIAEoAlgiAjYCiAEgASACNgKEASABIAI2AoABAkAgASgCYCICRQ0AIAFB4ABqIQMgACgCECEEA0ACQAJAIAItAAUiBUEYcUUNACADIAIoAgA2AgAgACACELYCDAELIAIgBUH4AXEiBUEEciIDOgAFAkACQAJAAkAgAi0ABEF4ag4CAAECCyACIAQoAmg2AiggBCACNgJoIAIgA0HEAXE6AAUMAgsgAigCCCACQRBqRg0AIAIgA0HEAXE6AAUMAQsgAiAFQSRyOgAFCyACIQMLIAMoAgAiAg0ACwsgASABKAJgIgI2ApgBIAEgAjYClAEgASACNgKQAQJAIAEoAngiAkUNACABQfgAaiEDIAAoAhAhBANAAkACQCACLQAFIgVBGHFFDQAgAyACKAIANgIAIAAgAhC2AgwBCyACIAVB+AFxIgVBBHIiAzoABQJAAkACQAJAIAItAARBeGoOAgABAgsgAiAEKAJoNgIoIAQgAjYCaCACIANBxAFxOgAFDAILIAIoAgggAkEQakYNACACIANBxAFxOgAFDAELIAIgBUEkcjoABQsgAiEDCyADKAIAIgINAAsLIAFBADYCFCABQQE6AE4gASABKAIMIAEoAghqNgIQIAAgARDAAgvEAwEEfyAAKAIQIgFBBDoAUgJAIAEtAE5FDQAgAS0ATEEYcSECAkAgASgCWCIDRQ0AA0AgAyADLQAFQcABcSACcjoABSADKAIAIgMNAAsLIAFBADYCiAEgAUIANwOAAQJAIAEoAmAiA0UNAANAIAMgAy0ABUHAAXEgAnI6AAUgAygCACIDDQALCwJAIAEoAngiA0UNAANAIAMgAy0ABUHAAXEgAnI6AAUgAygCACIDDQALCyABQQA2ApgBIAFCADcDkAEgAUEIOwBNIAFBADYCFAsgAUEANgIUIAFB+ABqIQMDQCADIgIoAgAiAw0ACwJAIAEoAmAiAyABKAKUAUYNAANAAkAgAyIDIAEoApABRw0AIAEgAygCADYCkAELIAEgAygCADYCYCADIAIoAgA2AgAgAiADNgIAIAMhAiABKAJgIgMgASgClAFHDQALCwJAIAAoAhAiAygCeEUNAANAIAAQvQIgAygCeA0ACwsCQCABKAJYIgMgASgCpAEiBEYNAANAIAMoAgAhAiAAIAMQtgIgAiEDIAIgBEcNAAsLAkAgASgCfCIDRQ0AA0AgAygCACEBIAAgAxC2AiABIQMgAQ0ACwsLggMBBn8jAEEQayIBJAAgACgCECICIAIoAngiAygCADYCeCADIAIoAlg2AgAgAiADNgJYIAMgAy0ABSIEQb8BcToABQJAAkAgAi0ATUF9akH/AXFBA0sNACADIAItAExBGHEgBEGHAXFyOgAFDAELIARBB3FBA0cNACACIAM2AowBCyABIAM2AgAgASADLQAEQcAAcjoACAJAIAAgAUECEIgEIgMtAAhBD3FFDQAgAC0AByEFIAIgAi0AUiIGQQJyOgBSIABBADoAByAAIAAoAgwiBEEQajYCDCAEIAMpAwA3AwAgBCADLQAIOgAIIAAgACgCDCIDQRBqNgIMIAMgASkDADcDACADIAEtAAg6AAggACgCFCIDIAMvASJBgAFyOwEiIABBNUEAIAAoAgwgACgCHGtBYGpBABCeAiEDIAAoAhQiBCAELwEiQf/+A3E7ASIgACAFOgAHIAIgBjoAUiADRQ0AIABB3ZYCELgDIAAgACgCDEFwajYCDAsgAUEQaiQAC4wQAQZ/IAAoAmQiASABLQAFIgJBIHI6AAUCQAJAAkACQAJAAkACQAJAIAEtAAQiA0F7ag4iBgAEAgUDBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFAQYLIAFBCGohBAwGCyABQQhqIQQMBQsgAUEoaiEEDAQLIAFB0ABqIQQMAwsgAUEQaiEEDAILAAsgAUEcaiEECyAAIAQoAgA2AmRBACEEAkACQAJAAkACQAJAAkAgA0F7ag4iAAIBBQYEBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGAwYLQQAhAwJAIAEoAhgiBEUNACAELQAGQQhxDQAgBEEDIABBuAFqKAIAEIcEIQMLAkAgASgCGCIERQ0AIAQtAAVBGHFFDQAgACAEELACCwJAAkAgA0UNACADLQAIQcQARw0AIAMoAgBBEGoiA0HrABCtBSIEIANB9gAQrQUiA3JFDQACQCAEDQAgASgCCEEARyEEAkAgAS0AByICQR9GDQAgASgCECIDQQEgAnRBGGxqIQUDQCAEIQIgAy0ACUHAAHEhBAJAAkAgAy0ACEEPcQ0AAkAgBA0AIAIhBAwCCyADQQs6AAkgAiEEDAELAkAgBEUNACADKAIQIgQtAAVBGHFFDQAgACAEELACC0EBIQQgAg0AQQAhAkEAIQQCQCADLQAIQcAAcUUNACADKAIAIQQLAkAgBEUNACAELQAFQRhxIQYCQCAELQAEQQ9xQQRHDQAgBkUNASAAIAQQsAIMAQsgBiECCyACQQBHIQQLIANBGGoiAyAFSQ0ACwsCQCAALQBNQQJHDQAgBEUNACABIAAoAmw2AhwgACABNgJsIAEgAS0ABUHHAXE6AAUMAwsgASAAKAJoNgIcIAAgATYCaCABIAEtAAVBxwFxOgAFDAILAkAgAw0AIAAgAUEAEMICGgwCCyABIAAoAnQ2AhwgACABNgJ0IAEgAS0ABUHHAXE6AAUMAQsgASgCEEEBIAEtAAd0QRhsaiEFAkAgARDpAyICRQ0AQQAhAwNAAkAgASgCDCADQQR0aiIELQAIQcAAcUUNACAEKAIAIgQtAAVBGHFFDQAgACAEELACCyADQQFqIgMgAkcNAAsLAkAgASgCECIDIAVPDQADQCADLQAJQcAAcSEEAkACQCADLQAIQQ9xDQAgBEUNASADQQs6AAkMAQsCQCAERQ0AIAMoAhAiBC0ABUEYcUUNACAAIAQQsAILIAMtAAhBwABxRQ0AIAMoAgAiBC0ABUEYcUUNACAAIAQQsAILIANBGGoiAyAFSQ0ACwsgACABEMQCCyABKAIIIQACQAJAIAEoAhQNAEEAIQEMAQtBAiABLQAHdCEBCyAAIAFqQQFqDwsCQCABKAIMIgNFDQAgAy0ABUEYcUUNACAAIAMQsAILAkAgAS8BBkUNAEEAIQMDQAJAIAEgA0EEdGoiBEEgai0AAEHAAHFFDQAgBEEYaigCACIELQAFQRhxRQ0AIAAgBBCwAgsgA0EBaiIDIAEvAQZJDQALCyAAIAEQxAIgAS8BBkEBag8LAkAgASgCDCIDRQ0AIAMtAAVBGHFFDQAgACADELACCwJAIAEtAAYiBEUNAEEAIQMDQAJAIAEgA0ECdGpBEGooAgAiBEUNACAELQAFQRhxRQ0AIAAgBBCwAgsgA0EBaiIDIAEtAAYiBEkNAAsLIARBAWoPCwJAIAEtAAYiBEUNAEEAIQMDQAJAIAEgA0EEdGoiBEEYai0AAEHAAHFFDQAgBEEQaigCACIELQAFQRhxRQ0AIAAgBBCwAgsgA0EBaiIDIAEtAAYiBEkNAAsLIARBAWoPCwJAIAEoAkwiA0UNACADLQAFQRhxRQ0AIAAgAxCwAgsCQCABKAIQQQFIDQBBACEDA0ACQCABKAIwIANBBHRqIgQtAAhBwABxRQ0AIAQoAgAiBC0ABUEYcUUNACAAIAQQsAILIANBAWoiAyABKAIQSA0ACwsCQCABKAIMQQFIDQBBACEDA0ACQCABKAI8IANBA3RqKAIAIgRFDQAgBC0ABUEYcUUNACAAIAQQsAILIANBAWoiAyABKAIMSA0ACwsCQCABKAIcQQFIDQBBACEDA0ACQCABKAI4IANBAnRqKAIAIgRFDQAgBC0ABUEYcUUNACAAIAQQsAILIANBAWoiAyABKAIcSA0ACwsCQCABKAIgIgRBAUgNAEEAIQMDQAJAIAEoAkggA0EMbGooAgAiBEUNACAELQAFQRhxRQ0AIAAgBBCwAgsgA0EBaiIDIAEoAiAiBEgNAAsLIAQgASgCEGogASgCDGogASgCHGpBAWoPCyABKAIcIQMCQAJAIAEtAAVBBnENACAALQBNDQELIAEgACgCaDYCKCAAIAE2AmggASACQccBcToABQsCQCADDQBBAQ8LAkAgAyABKAIMTw0AA0ACQCADLQAIQcAAcUUNACADKAIAIgQtAAVBGHFFDQAgACAEELACCyADQRBqIgMgASgCDEkNAAsLAkAgASgCICIDRQ0AA0ACQCADLQAFQRhxRQ0AIAAgAxCwAgsgAygCECIDDQALCwJAIAAtAE1BAkcNAAJAIAAtAFMNACABEJECCwJAIAEoAgwiAyABKAIYQdAAak8NAANAIANBADoACCADQRBqIgMgASgCGEHQAGpJDQALCyABKAIsIAFHDQAgASgCIEUNACABIAAoApwBNgIsIAAgATYCnAELIAEoAhggASgCHGtBBHVBAWohBAsgBAv4EQEIfwJAIAAoAhAiAS0AUkUNACABQbBwEKwDDwsCQAJAAkAgAS0ATiICQQFGDQAgASgCFEUNAQsCQCABKAIUIgNFDQACQCACQQFHDQAgAS0ATEEYcSEEAkAgASgCWCICRQ0AA0AgAiACLQAFQcABcSAEcjoABSACKAIAIgINAAsLIAFBADYCiAEgAUIANwOAAQJAIAEoAmAiAkUNAANAIAIgAi0ABUHAAXEgBHI6AAUgAigCACICDQALCwJAIAEoAngiAkUNAANAIAIgAi0ABUHAAXEgBHI6AAUgAigCACICDQALCyABQQA2ApgBIAFCADcDkAEgAUEIOwBNIAFBADYCFAsCQCABLQBNRQ0AA0AgABC5AhogAS0ATQ0ACwsCQCAAELoCIgUgA0EDdiADak8NACAAIAEQuwIgAUEAIAEoAgwgASgCCGpB5ABuIAEtAFBsaxCsAw8LIAEgASgCDCABKAIIajYCECAAKAIQIgZBAzoATSAGQdgAaiIDIQQDQAJAIAQoAgAiAkUNAAJAAkAgAi0ABSIHIAAoAhAtAEwiCEEYc3FFDQAgBCACKAIANgIAIAAgAhC2AgwBCyACIAdBwAFxIAhBGHFyOgAFIAIhBAsgBCgCACECCyAEQQAgAhsiBCADRg0ACyAGIAQ2AlwCQCAAKAIQIgItAE1BCEYNAANAIAAQuQIaIAItAE1BCEcNAAsLIAEgASgCDCABKAIIaiABKAIQQeQAbiIAIAEtAFRBAnQiAmxB/////wcgAkH/////ByAAbkkbayIAQR91IABxEKwDIAEgBTYCFA8LIAEoAhAiBUHkAG4hAgJAIAEoAgwiBEEBSA0AIAEoAgggBGogAS0AUSACbEECdCIDIAVqTQ0AIAEtAExBGHEhBAJAIAEoAlgiAkUNAANAIAIgAi0ABUHAAXEgBHI6AAUgAigCACICDQALCyABQQA2AogBIAFCADcDgAECQCABKAJgIgJFDQADQCACIAItAAVBwAFxIARyOgAFIAIoAgAiAg0ACwsCQCABKAJ4IgJFDQADQCACIAItAAVBwAFxIARyOgAFIAIoAgAiAg0ACwsgAUEANgKYASABQgA3A5ABIAFBCDsATSABQQA2AhQgACABELgCIQAgASgCDCABKAIIaiICIANBAXYgBWpJDQIgASAANgIUIAEgAiABKAIQQeQAbiIAIAEtAFRBAnQiBGxB/////wcgBEH/////ByAAbkkbayIAQR91IABxEKwDDwsCQCABKAKMASICRQ0AAkAgAiABKAKIASIDRg0AA0ACQCACLQAFIgRBB3FBA0cNACACIARBB3M6AAUgBEEgcUUNACABIAIQsAILIAIoAgAiAiADRw0ACwsgAUEANgKMAQsCQCABKAJgIgIgASgCmAEiA0YNAANAAkAgAi0ABSIEQQdxQQNHDQAgAiAEQQdzOgAFIARBIHFFDQAgASACELACCyACKAIAIgIgA0cNAAsLAkAgASgCeCICRQ0AA0ACQCACLQAFIgRBB3FBA0cNACACIARBB3M6AAUgBEEgcUUNACABIAIQsAILIAIoAgAiAg0ACwsgABC6AhogAUEDOgBNIAFB2ABqIQQCQCABKAJYIgIgASgCgAEiB0YNACABLQBMQRhxIQgDQAJAAkAgAi0ABSIDQRhxRQ0AIAQgAigCADYCACAAIAIQtgIMAQsCQAJAIANBB3EiBA0AIAIgCCADQcABcXJBAXI6AAUMAQsgAiAEQbjYBGotAAAgA0H4AXFyOgAFIARBf2pBAUsNACABKAKMAQ0AIAEgAjYCjAELIAIhBAsgBCgCACICIAdHDQALCwJAIAQoAgAiAiABKAKEASIIRg0AIAEtAExBGHEhBiAEIQMDQAJAAkAgAi0ABSIHQRhxRQ0AIAMgAigCADYCACAAIAIQtgIMAQsCQAJAIAdBB3EiAw0AIAIgBiAHQcABcXJBAXI6AAUMAQsgAiADQbjYBGotAAAgB0H4AXFyOgAFIANBf2pBAUsNACABKAKMAQ0AIAEgAjYCjAELIAIhAwsgAygCACICIAhHDQALCyABQeAAaiEDIAEgASgChAE2AogBIAQoAgAhAiABIAEoAlg2AoABIAEgAjYChAECQCABKAJgIgIgASgCkAEiB0YNACABLQBMQRhxIQgDQAJAAkAgAi0ABSIEQRhxRQ0AIAMgAigCADYCACAAIAIQtgIMAQsCQAJAIARBB3EiAw0AIAIgCCAEQcABcXJBAXI6AAUMAQsgAiADQbjYBGotAAAgBEH4AXFyOgAFCyACIQMLIAMoAgAiAiAHRw0ACwsCQCADKAIAIgIgASgClAEiCEYNACABLQBMQRhxIQYgAyEEA0ACQAJAIAItAAUiB0EYcUUNACAEIAIoAgA2AgAgACACELYCDAELAkACQCAHQQdxIgQNACACIAYgB0HAAXFyQQFyOgAFDAELIAIgBEG42ARqLQAAIAdB+AFxcjoABQsgAiEECyAEKAIAIgIgCEcNAAsLIAEgASgClAE2ApgBIAMoAgAhAiABIAEoAmA2ApABIAEgAjYClAECQCABKAJ4IgJFDQAgAUH4AGohBCABLQBMQRhxIQcDQAJAAkAgAi0ABSIDQRhxRQ0AIAQgAigCADYCACAAIAIQtgIMAQsCQAJAIANBB3EiBA0AIAIgByADQcABcXJBAXI6AAUMAQsgAiAEQbjYBGotAAAgA0H4AXFyOgAFCyACIQQLIAQoAgAiAg0ACwsgACABEMACIAFBACABKAIMIAEoAghqQeQAbiABLQBQbGsQrAMgASAFNgIQDwsgAS0AVUECdEEBciIDIAEoAgxBBHZsIQJBAEEBIAEtAFYiBHRBBHYgA2xB/////wcgBEEfSRtrIQQCQANAIAIgABC5AmsiAiAETA0BIAEtAE1BCEcNAAsLAkAgAS0ATUEIRw0AIAEgASgCDCABKAIIaiABKAIQQeQAbiIAIAEtAFRBAnQiAmxB/////wcgAkH/////ByAAbkkbayIAQR91IABxEKwDDwsgASACIANtQQR0EKwDCwvDAQECfyABQegAahDFAiICIAEoAmw2AgAgAUEANgJsIAIQxQIiAiABKAJ0NgIAIAFBADYCdCACEMUCIgIgASgCcDYCACABQQA2AnAgAhDFAhoCQCABLQBTDQAgAUEcaigCACABQSBqKAIAIgJBBG1ODQAgASgCDCEDIAAgAkECbRC8AyABIAEoAgwgA2sgASgCEGo2AhALIAFBADoATQJAIAEtAFMNACAAKAIQIgEoAnhFDQADQCAAEL0CIAEoAngNAAsLC8wEAQV/IAAoAhAiAiABOgBTAkACQCACLQBODQACQCACLQBNQQJLDQAgAkEDOgBNIAJB2ABqIgMhBANAAkAgBCgCACIBRQ0AAkACQCABLQAFIgUgACgCEC0ATCIGQRhzcUUNACAEIAEoAgA2AgAgACABELYCDAELIAEgBUHAAXEgBkEYcXI6AAUgASEECyAEKAIAIQELIARBACABGyIEIANGDQALIAIgBDYCXAsCQCAAKAIQIgEtAE1BCEYNAANAIAAQuQIaIAEtAE1BCEcNAAsLAkAgACgCECIBLQBNRQ0AA0AgABC5AhogAS0ATQ0ACwsgAkEBOgBNAkAgACgCECIBLQBNQQdGDQADQCAAELkCGiABLQBNQQdHDQALCwJAIAAoAhAiAS0ATUEIRg0AA0AgABC5AhogAS0ATUEIRw0ACwsgAiACKAIMIAIoAghqIAIoAhBB5ABuIgEgAi0AVEECdCIEbEH/////ByAEQf////8HIAFuSRtrIgFBH3UgAXEQrAMMAQsgAi0ATEEYcSEEAkAgAigCWCIBRQ0AA0AgASABLQAFQcABcSAEcjoABSABKAIAIgENAAsLIAJBADYCiAEgAkIANwOAAQJAIAIoAmAiAUUNAANAIAEgAS0ABUHAAXEgBHI6AAUgASgCACIBDQALCwJAIAIoAngiAUUNAANAIAEgAS0ABUHAAXEgBHI6AAUgASgCACIBDQALCyACQQA2ApgBIAJCADcDkAEgAkEIOwBNIAJBADYCFCAAIAIQuAIaCyACQQA6AFMLkgQBCn8gARDpAyEDQQEgAS0AB3QhBEEAIQVBACEGAkAgA0UNAEEAIQZBACEHA0ACQCABKAIMIAdBBHRqIggtAAhBwABxRQ0AIAgoAgAiCC0ABUEYcUUNACAAIAgQsAJBASEGCyAHQQFqIgcgA0cNAAsLIARBASAEQQFLGyEJQQAhCkEAIQgDQAJAAkAgAkUNACABKAIQIAQgCEF/c2pBGGxqIQcMAQsgASgCECAIQRhsaiEHCyAHLQAJQcAAcSELAkACQCAHLQAIQQ9xDQAgC0UNASAHQQs6AAkMAQtBACEMQQAhAwJAIAtFDQAgBygCECEDCwJAIANFDQAgAy0ABUEYcSELAkAgAy0ABEEPcUEERw0AIAtFDQEgACADELACDAELIAshDAsgBy0ACEHAAHEhAwJAIAxFDQBBASEFIANFDQFBASEFQQEgCiAHKAIALQAFQRhxGyEKDAELIANFDQAgBygCACIHLQAFQRhxRQ0AIAAgBxCwAkEBIQYLIAhBAWoiCCAJRw0ACwJAIAAtAE0NACABIAAoAmg2AhwgACABNgJoIAEgAS0ABUHHAXE6AAUgBg8LAkAgCkUNACABIAAoAnA2AhwgACABNgJwIAEgAS0ABUHHAXE6AAUgBg8LAkAgBUUNACABIAAoAnQ2AhwgACABNgJ0IAEgAS0ABUHHAXE6AAUgBg8LIAAgARDEAiAGC94CAQd/AkAgASACRg0AA0AgASgCEEEBIAEtAAd0QRhsaiEDAkAgARDpAyIERQ0AQQAhBQNAQQAhBgJAIAEoAgwgBUEEdGoiBy0ACEHAAHFFDQAgBygCACEGC0EAIQgCQCAGRQ0AIAYtAAVBGHEhCQJAIAYtAARBD3FBBEcNACAJRQ0BIAAgBhCwAgwBCyAJIQgLAkAgCEUNACAHQQhqQRA6AAALIAVBAWoiBSAERw0ACwsCQCABKAIQIgYgA08NAANAQQAhCEEAIQUCQCAGLQAIQcAAcUUNACAGKAIAIQULAkAgBUUNACAFLQAFQRhxIQcCQCAFLQAEQQ9xQQRHDQAgB0UNASAAIAUQsAIMAQsgByEICwJAIAhFDQAgBkEQOgAICwJAIAYtAAhBD3ENACAGLQAJQcAAcUUNACAGQQs6AAkLIAZBGGoiBiADSQ0ACwsgASgCHCIBIAJHDQALCwvGAQECfwJAAkACQAJAIAEtAAUiAkEHcUF7ag4CAAEDCwJAAkACQAJAAkACQAJAAkAgAS0ABEF7ag4iBgAEAgUDBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFAQYLIAFBCGohAwwGCyABQQhqIQMMBQsgAUEoaiEDDAQLIAFB0ABqIQMMAwsgAUEQaiEDDAILAAsgAUEcaiEDCyADIAAoAmg2AgAgACABNgJoIAJBxwFxIQAMAQsgAkECcyEACyABIAA6AAULC4ACAQV/AkAgACgCACIBRQ0AA0BBACECAkACQAJAAkACQAJAIAEtAAQiA0F7ag4iAAEEAgUDBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFAQULIAFBHGohAgwECyABQQhqIQIMAwsgAUEoaiECDAILIAFB0ABqIQIMAQsgAUEQaiECCwJAAkAgAS0ABSIEQRhxDQACQCAEQQdxIgVBBUcNACABIARB3wFxQSNzOgAFIAIhAAwCCwJAIANBCEcNACACIQAMAgsCQCAFQQZHDQAgASAEQQJzOgAFCyABIAEtAAVBIHI6AAULIAAgAigCADYCAAsgACgCACIBDQALCyAACxEAIAAgACgCDEFgakEAEJwCC0cBAn8gACAAQdaXAkEEEMADELICQQAhAQNAIAAgACABQQJ0QcDYBGooAgAQwwMiAhCyAiACIAFBAWoiAToABiABQRZHDQALC6UBAQJ/IwBBMGsiAiQAAkACQCABQf8BSg0AIAAoAjQhAwJAIAFBgNYEakEBai0AAEEEcUUNACACIAE2AhAgA0HGowIgAkEQahCDAyEDDAILIAIgATYCACADQe6jAiACEIMDIQMMAQsgAUECdEHA0ARqKAIAIQMgAUGfAkoNACAAKAI0IQEgAiADNgIgIAFBuaICIAJBIGoQgwMhAwsgAkEwaiQAIAMLDwAgACABIAAoAhAQygIAC4MDAQR/IwBB0ABrIgMkACAAKAI0IAEgACgCSCAAKAIEEIcCIQECQAJAIAJFDQAgACgCNCEEAkACQCACQd99akEDSw0AAkAgACgCPCICKAIEQQFqIAIoAggiBU0NACAFQf////8HTw0EIAQgAigCACAFIAVBAXQiBhDyAiEFIAIgBjYCCCACIAU2AgALIAIgAigCBCIFQQFqNgIEIAUgAigCAGpBADoAACAAKAI0IQIgAyAAKAI8KAIANgIQIAJBuaICIANBEGoQgwMhBQwBCwJAIAJB/wFKDQACQCACQYDWBGpBAWotAABBBHFFDQAgAyACNgIwIARBxqMCIANBMGoQgwMhBQwCCyADIAI2AiAgBEHuowIgA0EgahCDAyEFDAELIAJBAnRBwNAEaigCACEFIAJBnwJKDQAgAyAFNgJAIARBuaICIANBwABqEIMDIQULIAMgBTYCBCADIAE2AgAgBEGlESADEIMDGgsgACgCNEEDEIwCAAsgAEH2vwFBABDKAgALigEBAn8gACgCNCIDIAEgAhDAAyECAkAgACgCQCACEPYDIgEtAAhBD3FFDQAgASgCEA8LIAMgAygCDCIEQRBqNgIMIAQgAjYCACAEIAItAARBwAByOgAIIAMgACgCQCAEIAEgBBD4AwJAIAMoAhAoAgxBAUgNACADEL8CCyADIAMoAgxBcGo2AgwgAgt9ACABIAA2AjQgAUEANgIQIAEgAjYCOCABQaACNgIgIAEgBDYCACABQQA2AjAgASADNgJIIAFCgYCAgBA3AgQgASAAQdaXAkEEEMADNgJMIAEoAjQgASgCPCIAKAIAIAAoAghBIBDyAiEAIAEoAjwiAUEgNgIIIAEgADYCAAtYAQF/IAAgACgCBDYCCAJAIAAoAiBBoAJGDQAgAEEQaiIBIABBIGoiACkDADcDACABQQhqIABBCGopAwA3AwAgAEGgAjYCAA8LIAAgACAAQRhqEM4CNgIQC+0uAQh/IwBBEGsiAiQAIAAoAjxBADYCBAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQANAQaACIQMCQAJAAkAgACgCACIEQQFqDoABDw4ODg4ODg4ODgEAAQEADg4ODg4ODg4ODg4ODg4ODg4OAQ4LDg4ODgsODg4ODgIMCA0NDQ0NDQ0NDQ0KDgYFBw4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4EDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODgkOCyAAEM8CDAILIAAoAjgiAyADKAIAIgRBf2o2AgACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAAgBC0AADYCAAwCCyAAIAMQtAQ2AgAMAQsgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQQMAQsgAxC0BCEECyAAIAQ2AgBBLSEDIARBLUcNDCAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhAwwBCyADELQEIQMLIAAgAzYCAAJAIANB2wBHDQAgABDQAiEDIAAoAjxBADYCBCADQQJJDQAgAEEAIAMQ0QIgACgCPEEANgIEDAELA0ACQCAAKAIAQQFqIgNBDksNAEEBIAN0QYGQAXENAgsgACgCOCIDIAMoAgAiBEF/ajYCAAJAIAQNACAAIAMQtAQ2AgAMAQsgAyADKAIEIgRBAWo2AgQgACAELQAANgIADAALAAsACwJAIAAQ0AIiBEECSQ0AIAAgASAEENECQaQCIQMMCwtB2wAhAyAEDQogAEG/E0GkAhDKAgALIAAoAjgiAyADKAIAIgRBf2o2AgACQAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEEDAELIAMQtAQhBAsgACAENgIAQT0hAyAEQT1HDQkgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgBBmQIhAwwJCyAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhBAwBCyADELQEIQQLIAAgBDYCAAJAIARBPUcNACAAKAI4IgMgAygCACIFQX9qNgIAAkACQCAFRQ0AIAMgAygCBCIFQQFqNgIEIAUtAAAhAwwBCyADELQEIQMLIAAgAzYCAEGbAiEDIARBPUYNCQtBnQJBPCAAQTwQ0gIbIQMMCAsgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQQMAQsgAxC0BCEECyAAIAQ2AgACQCAEQT1HDQAgACgCOCIDIAMoAgAiBUF/ajYCAAJAAkAgBUUNACADIAMoAgQiBUEBajYCBCAFLQAAIQMMAQsgAxC0BCEDCyAAIAM2AgBBmgIhAyAEQT1GDQgLQZ4CQT4gAEE+ENICGyEDDAcLIAAoAjgiAyADKAIAIgRBf2o2AgACQAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEEDAELIAMQtAQhBAsgACAENgIAQS8hAyAEQS9HDQYgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgBBlgIhAwwGCyAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhBAwBCyADELQEIQQLIAAgBDYCAEH+ACEDIARBPUcNBSAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhAwwBCyADELQEIQMLIAAgAzYCAEGcAiEDDAULIAAoAjgiAyADKAIAIgRBf2o2AgACQAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEEDAELIAMQtAQhBAsgACAENgIAQTohAyAEQTpHDQQgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgBBnwIhAwwECwJAIAAoAjwiAygCBEEBaiADKAIIIgVNDQAgBUH/////B08NBSAAKAI0IAMoAgAgBSAFQQF0IgYQ8gIhBSADIAY2AgggAyAFNgIACyADIAMoAgQiBUEBajYCBCAFIAMoAgBqIAQ6AAAgACgCOCIDIAMoAgAiBUF/ajYCAAJAAkAgBUUNACADIAMoAgQiBUEBajYCBCAFLQAAIQMMAQsgAxC0BCEDCyAAIAM2AgACQCADIARGDQADQAJAAkACQCADQdwARg0AAkACQCADQQFqDg8AAwMDAwMDAwMDAwEDAwEDCyAAQfTBAUGgAhDKAgALIABB9MEBQaQCEMoCAAsCQCAAKAI8IgUoAgRBAWogBSgCCCIGTQ0AIAZB/////wdPDQogACgCNCAFKAIAIAYgBkEBdCIHEPICIQYgBSAHNgIIIAUgBjYCAAsgBSAFKAIEIgZBAWo2AgQgBiAFKAIAaiADOgAAIAAoAjgiAyADKAIAIgVBf2o2AgACQAJAIAVFDQAgAyADKAIEIgVBAWo2AgQgBS0AACEDDAELIAMQtAQhAwsgACADNgIAQQchBQJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgA0EBag58DwoKCgoKCgoKCgoHCgoHCgoKCgoKCgoKCgoKCgoKCgoKCgoICgoKCggKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCAoKCgoMCwoKCgAKCgoKCgoKAQoKCgIKAwYECgUKCQoLQQwhBQwLC0EKIQUMCgtBDSEFDAkLQQkhBQwIC0ELIQUMBwsgABDTAiEDIAAQ0wIhBSAAKAI8IgYgBigCBEF+ajYCBCAFIANBBHRqIQUMBgsCQCAAKAI8IgUoAgRBAWogBSgCCCIGTQ0AIAZB/////wdPDRIgACgCNCAFKAIAIAYgBkEBdCIHEPICIQYgBSAHNgIIIAUgBjYCAAsgBSAFKAIEIgZBAWo2AgQgBiAFKAIAaiADOgAAIAAoAjgiAyADKAIAIgVBf2o2AgACQAJAIAVFDQAgAyADKAIEIgVBAWo2AgQgBS0AACEDDAELIAMQtAQhAwsgACADNgIAAkAgA0H7AEYNAAJAIANBf0YNAAJAIAAoAjwiBCgCBEEBaiAEKAIIIgVNDQAgBUH/////B08NFSAAKAI0IAQoAgAgBSAFQQF0IgYQ8gIhBSAEIAY2AgggBCAFNgIACyAEIAQoAgQiBUEBajYCBCAFIAQoAgBqIAM6AAAgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgALIABBkJ8CQaQCEMoCAAtBBCEIIAAQ0wIhBQNAIAAoAgAhBwJAIAAoAjwiAygCBEEBaiADKAIIIgZNDQAgBkH/////B08NFSAAKAI0IAMoAgAgBiAGQQF0IgkQ8gIhBiADIAk2AgggAyAGNgIACyADIAMoAgQiBkEBajYCBCAGIAMoAgBqIAc6AAAgACgCOCIDIAMoAgAiBkF/ajYCAAJAAkAgBkUNACADIAMoAgQiBkEBajYCBCAGLQAAIQMMAQsgAxC0BCEDCyAAIAM2AgACQCADQYDWBGpBAWotAABBEHFFDQACQCAFQYCAgMAASQ0AAkAgA0F/Rg0AAkAgACgCPCIEKAIEQQFqIAQoAggiBU0NACAFQf////8HTw0ZIAAoAjQgBCgCACAFIAVBAXQiBhDyAiEFIAQgBjYCCCAEIAU2AgALIAQgBCgCBCIFQQFqNgIEIAUgBCgCAGogAzoAACAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhAwwBCyADELQEIQMLIAAgAzYCAAsgAEHCyQFBpAIQygIACyAIQQFqIQggAxD8AiAFQQR0aiEFDAELCwJAIANB/QBGDQACQCADQX9GDQACQCAAKAI8IgQoAgRBAWogBCgCCCIFTQ0AIAVB/////wdPDRggACgCNCAEKAIAIAUgBUEBdCIGEPICIQUgBCAGNgIIIAQgBTYCAAsgBCAEKAIEIgVBAWo2AgQgBSAEKAIAaiADOgAAIAAoAjgiAyADKAIAIgRBf2o2AgACQAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEDDAELIAMQtAQhAwsgACADNgIACyAAQYSfAkGkAhDKAgALIAAoAjgiAyADKAIAIgZBf2o2AgACQAJAIAZFDQAgAyADKAIEIgZBAWo2AgQgBi0AACEDDAELIAMQtAQhAwsgACADNgIAIAAoAjwiAyADKAIEIAhrNgIEIAJBCGogBRD+AiIFQQFIDQgDQCACQQhqIAVrQQhqLQAAIQcCQCAAKAI8IgMoAgRBAWogAygCCCIGTQ0AIAZB/////wdPDRggACgCNCADKAIAIAYgBkEBdCIIEPICIQYgAyAINgIIIAMgBjYCAAsgAyADKAIEIgZBAWo2AgQgBiADKAIAaiAHOgAAIAVBAUohAyAFQX9qIQUgAw0ADAkLAAsgABDPAkEKIQUMBQsgAyEFDAMLIAAoAjwiAyADKAIEQX9qNgIEIAAoAjgiAyADKAIAIgVBf2o2AgACQAJAIAVFDQAgAyADKAIEIgVBAWo2AgQgBS0AACEDDAELIAMQtAQhAwsgACADNgIAIANBgNYEakEBai0AAEEIcUUNBQNAAkACQAJAIANBdmoOBAABAQABCyAAEM8CDAELIAAoAjgiAyADKAIAIgVBf2o2AgACQAJAIAVFDQAgAyADKAIEIgVBAWo2AgQgBS0AACEDDAELIAMQtAQhAwsgACADNgIACyAAKAIAIgNBgNYEakEBai0AAEEIcQ0ADAYLAAtBACEFQQAhCAJAIANBgNYEakEBai0AAEECcQ0AAkAgA0F/Rg0AIAAgAxDUAiAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhAwwBCyADELQEIQMLIAAgAzYCAAsgAEHSygFBpAIQygIACwJAA0ACQCAAKAIAIgZBgNYEakEBai0AAEECcQ0AIAghAwwCCwJAIAAoAjwiAygCBEEBaiADKAIIIgdNDQAgB0H/////B08NFiAAKAI0IAMoAgAgByAHQQF0IgkQ8gIhByADIAk2AgggAyAHNgIACyAFQQpsIAZqIQUgAyADKAIEIgdBAWo2AgQgByADKAIAaiAGOgAAIAAoAjgiAyADKAIAIgZBf2o2AgACQAJAIAZFDQAgAyADKAIEIgZBAWo2AgQgBi0AACEDDAELIAMQtAQhAwsgBUFQaiEFIAAgAzYCAEEDIQMgCEEBaiIIQQNHDQALCwJAIAVBgAJIDQACQCAAKAIAIgRBf0YNAAJAIAAoAjwiAygCBEEBaiADKAIIIgVNDQAgBUH/////B08NFyAAKAI0IAMoAgAgBSAFQQF0IgYQ8gIhBSADIAY2AgggAyAFNgIACyADIAMoAgQiBUEBajYCBCAFIAMoAgBqIAQ6AAAgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgALIABB2MkBQaQCEMoCAAsgACgCPCIGIAYoAgQgA2s2AgQMAgtBCCEFCyAAKAI4IgMgAygCACIGQX9qNgIAAkACQCAGRQ0AIAMgAygCBCIGQQFqNgIEIAYtAAAhAwwBCyADELQEIQMLIAAgAzYCAAsgACgCPCIDIAMoAgQiB0F/ajYCBAJAIAcgAygCCCIGTQ0AIAZB/////wdPDRMgACgCNCADKAIAIAYgBkEBdCIHEPICIQYgAyAHNgIIIAMgBjYCAAsgAyADKAIEIgZBAWo2AgQgBiADKAIAaiAFOgAADAELAkAgACgCPCIFKAIEQQFqIAUoAggiBk0NACAGQf////8HTw0TIAAoAjQgBSgCACAGIAZBAXQiBxDyAiEGIAUgBzYCCCAFIAY2AgALIAUgBSgCBCIGQQFqNgIEIAYgBSgCAGogAzoAACAAKAI4IgMgAygCACIFQX9qNgIAAkACQCAFRQ0AIAMgAygCBCIFQQFqNgIEIAUtAAAhAwwBCyADELQEIQMLIAAgAzYCAAsgACgCACIDIARHDQALCwJAIAAoAjwiBCgCBEEBaiAEKAIIIgVNDQAgBUH/////B08NESAAKAI0IAQoAgAgBSAFQQF0IgYQ8gIhBSAEIAY2AgggBCAFNgIACyAEIAQoAgQiBUEBajYCBCAFIAQoAgBqIAM6AAAgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgAgASAAIAAoAjwiAygCAEEBaiADKAIEQX5qEMsCNgIAQaQCIQMMAwsCQCAAKAI8IgMoAgRBAWogAygCCCIETQ0AIARB/////wdPDREgACgCNCADKAIAIAQgBEEBdCIFEPICIQQgAyAFNgIIIAMgBDYCAAsgAyADKAIEIgRBAWo2AgQgBCADKAIAakEuOgAAIAAoAjgiAyADKAIAIgRBf2o2AgACQAJAIARFDQAgAyADKAIEIgRBAWo2AgQgBC0AACEEDAELIAMQtAQhBAsgACAENgIAQS4hAwJAIARBLkcNACAAKAI4IgUgBSgCACIGQX9qNgIAAkACQCAGRQ0AIAUgBSgCBCIGQQFqNgIEIAYtAAAhBQwBCyAFELQEIQULIAAgBTYCACAEQS5HDQBBlwIhAyAAKAIAQS5HDQMgACgCOCIDIAMoAgAiBEF/ajYCAAJAAkAgBEUNACADIAMoAgQiBEEBajYCBCAELQAAIQMMAQsgAxC0BCEDCyAAIAM2AgBBmAIhAwwDCyAAKAIAQYDWBGpBAWotAABBAnFFDQILIAAgARDVAiEDDAELAkAgBEGA1gRqQQFqLQAAQQFxRQ0AA0AgACgCACEFAkAgACgCPCIDKAIEQQFqIAMoAggiBE0NACAEQf////8HTw0SIAAoAjQgAygCACAEIARBAXQiBhDyAiEEIAMgBjYCCCADIAQ2AgALIAMgAygCBCIEQQFqNgIEIAQgAygCAGogBToAACAAKAI4IgMgAygCACIEQX9qNgIAAkACQCAERQ0AIAMgAygCBCIEQQFqNgIEIAQtAAAhAwwBCyADELQEIQMLIAAgAzYCACADQYDWBGpBAWotAABBA3ENAAsgASAAIAAoAjwiAygCACADKAIEEMsCIgA2AgBBowIhAyAALQAEQQRHDQEgAC0ABiIARQ0BIABB/wFqIQMMAQsgACgCOCIDIAMoAgAiBUF/ajYCAAJAAkAgBUUNACADIAMoAgQiBUEBajYCBCAFLQAAIQMMAQsgAxC0BCEDCyAAIAM2AgAgBCEDCyACQRBqJAAgAw8LIABB9r8BQQAQygIACyAAQfa/AUEAEMoCAAsgAEH2vwFBABDKAgALIABB9r8BQQAQygIACyAAQfa/AUEAEMoCAAsgAEH2vwFBABDKAgALIABB9r8BQQAQygIACyAAQfa/AUEAEMoCAAsgAEH2vwFBABDKAgALIABB9r8BQQAQygIACyAAQfa/AUEAEMoCAAsgAEH2vwFBABDKAgALIABB9r8BQQAQygIACyAAQfa/AUEAEMoCAAsgAEH2vwFBABDKAgAL1gEBA38gACgCACEBIAAoAjgiAiACKAIAIgNBf2o2AgACQAJAIANFDQAgAiACKAIEIgNBAWo2AgQgAy0AACECDAELIAIQtAQhAgsgACACNgIAAkACQCACQXZqDgQAAQEAAQsgAiABRg0AIAAoAjgiAiACKAIAIgNBf2o2AgACQAJAIANFDQAgAiACKAIEIgNBAWo2AgQgAy0AACECDAELIAIQtAQhAgsgACACNgIACyAAIAAoAgRBAWoiAjYCBAJAIAJB/////wdHDQAgAEHbD0EAEMoCAAsLswMBBX8gACgCACEBAkACQAJAIAAoAjwiAigCBEEBaiACKAIIIgNNDQAgA0H/////B08NASAAKAI0IAIoAgAgAyADQQF0IgQQ8gIhAyACIAQ2AgggAiADNgIACyACIAIoAgQiA0EBajYCBCADIAIoAgBqIAE6AAAgACgCOCICIAIoAgAiA0F/ajYCAAJAAkAgA0UNACACIAIoAgQiA0EBajYCBCADLQAAIQIMAQsgAhC0BCECCyAAIAI2AgBBACEEAkAgAkE9Rw0AQQAhBANAAkAgACgCPCICKAIEQQFqIAIoAggiA00NACADQf////8HTw0EIAAoAjQgAigCACADIANBAXQiBRDyAiEDIAIgBTYCCCACIAM2AgALIAIgAigCBCIDQQFqNgIEIAMgAigCAGpBPToAACAAKAI4IgIgAigCACIDQX9qNgIAAkACQCADRQ0AIAIgAigCBCIDQQFqNgIEIAMtAAAhAgwBCyACELQEIQILIAAgAjYCACAEQQFqIQQgAkE9Rg0ACwsgBEECaiAERSACIAFGGw8LIABB9r8BQQAQygIACyAAQfa/AUEAEMoCAAvhBwEGfyMAQRBrIgMkACAAKAIAIQQgACgCBCEFAkACQCAAKAI8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AiQAAkAgACgCCCIDQZwBSA0AIAAoAgAiBCgCDCIFIAQgAEEMaiADEMADIgM2AgAgBSADLQAEQcAAcjoACCAEIAQoAgxBEGo2AgwCQAJAIAAoAgQNACAAQQE2AgQMAQsgBEECEK0ECyAAQQA2AggLIAAgACgCCGpBDGohBAJAAkAgAS0ACEEDRw0AIAIgASkDADcDACAEQSxBwJMCIAIQqQUhAQwBCyACIAErAwA5AxAgBEEsQcXDASACQRBqEKkFIQEgBCAEQfGYAhC9BWotAAANABCMBSgCAC0AACEDIAQgAWoiBEEBakEwOgAAIAQgAzoAACABQQJqIQELIAAgACgCCCABajYCCCACQSBqJAALKAEBfyMAQRBrIgMkACADIAI2AgwgACABIAIQgAMhAiADQRBqJAAgAguYBAEBfwJAAkACQCABLQAAQUNqDgQAAgIBAgsgAUEBaiEBAkAgAkE8Sw0AIAAgASACEMcEGg8LIAAgASkAADcAACAAQTdqIAFBN2ooAAA2AAAgAEEwaiABQTBqKQAANwAAIABBKGogAUEoaikAADcAACAAQSBqIAFBIGopAAA3AAAgAEEYaiABQRhqKQAANwAAIABBEGogAUEQaikAADcAACAAQQhqIAFBCGopAAA3AAAgAEEAOgA7DwsCQCACQTxLDQAgACABQQFqIAIQxwQaDwsgAEECakEALQDgmQI6AAAgAEEALwDemQI7AAAgACABIAJqIgJBSGoiASkAADcAAyAAQTtqIAItAAA6AAAgAEELaiABQQhqKQAANwAAIABBE2ogAUEQaikAADcAACAAQRtqIAFBGGopAAA3AAAgAEEjaiABQSBqKQAANwAAIABBK2ogAUEoaikAADcAACAAQTNqIAFBMGopAAA3AAAPCyABQQoQrQUhAyAAQQhqQQAtAJikAjoAACAAQQApAJCkAjcAACAAQQlqIQACQAJAIAJBLEsNACADDQAgACABIAIQxwQgAmohAAwBCyAAIAEgAyABayACIAMbIgJBLSACQS1JGyICEMcEIAJqIgBBAmpBAC0A4JkCOgAAIABBAC8A3pkCOwAAIABBA2ohAAsgAEECakEALQDMlwI6AAAgAEEALwDKlwI7AAALKAAgAEQAAAAAAIB/QEGIARCnASAAQQBBCxBfIABBwN4EQQAQkwFBAQsVACAAEBO3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IAIgACgCHGtBBHVBABCOAhogAQvDBAEDfyMAQRBrIgIkAEEAIQMCQCABQQBBCEHgBiAAEQQAIgRFDQBBACEDIARB3ABqQQA2AgAgBEHgAGpCADcCACAEQQA2AgQgBCAANgJ4IARBxAFqQQg6AAAgBEEIakGIEDsBACAEQRRqIARB+ABqNgIAIARBGGpBADYCACAEQTBqIARBBGoiADYCACAEQQpqQYACNgEAIARBNGpBADYCACAEQfAAakEANgIAIARBIGpCADcCACAEQdABaiAANgIAIARB6ABqQgA3AgAgBEHUBmpCADcCACAEQfwAaiABNgIAIARB9ABqQQA2AgAgBEHkAGpBgIAENgIAIARBnAJqIAA2AgBBABASIQEgAkHYADYCDCACIAA2AgQgAiABNgIAIAIgAjYCCCAEQcABaiACQQRqQQwgARC6AzYCACAEQZgBakEANgIAIARBmAJqQQA2AgAgBEGoAWpBADoAACAEQZABakIANwMAIARBygFqQQI7AQAgBEHHAWpBADoAACAEQcUBakEIOwAAIARB1AFqQQBBxAAQyAQaIARBzgFqQQ06AAAgBEHMAWpBsjI7AQAgBEG4AWpBAzoAACAEQbABakIANwMAIARBjAFqQQA2AgAgBEGAAWpC4AY3AwAgBEGIA2pCADcCACAEQcgBakGUMjsBACAEQZADakIANwIAIARBmANqQgA3AgAgBEGgA2pCADcCACAEQagDakEANgIAAkAgAEHZAEEAEI0CDQAgACEDDAELIAAQtQMLIAJBEGokACADC60CAQN/IAAoAhAhAiAAIABB0AVBABD3AiIDNgIkIAAgAzYCHEEAIQMDQCAAKAIcIANBBHRqQQA6AAggA0EBaiIDQS1HDQALIABBPGpCADcCACAAIAAoAhwiAzYCDCAAQdQAakGAgAg2AgAgAEHEAGpBADYCACAAIAM2AjQgACADQYAFajYCGCADQQA6AAggACAAQTRqNgIUIABBOGogACgCDCIDQdACajYCACAAIANBEGo2AgwgABDyAyEDIAJBMGpBxQA6AAAgAiADNgIoIAAgA0ECQQAQ7AMgAygCDCIEQcgAOgAIIAQgADYCACADKAIMIQMgABDyAyEEIANBGGpBxQA6AAAgAyAENgIQIAAQvwMgABCGBCAAEMcCIAJBwABqQQA6AAAgAkEA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ajEAABBRIAIgBUchBCACQQFqIQIgBA0ACwsgAUEQaiQAIAYLfQIFfwF+IwBBkARrIgEkAEEBIQIgACABIAAQOSIDEJYBIQQCQCADQQFIDQADQAJAIAAgAhCQASIGQoACVA0AIAAgAkGEygEQfxoLIAIgBGpBf2ogBjwAACACIANHIQUgAkEBaiECIAUNAAsLIAEgAxCVASABQZAEaiQAQQELZgEDfyMAQaAEayIBJABBASECIABBAhBKIQMgAEEBQQYQjAEgAEEBEDogAUEANgIIAkACQCAAQdoAIAFBCGogAxBsRQ0AIABB9hdBABCAASECDAELIAFBEGoQfgsgAUGgBGokACACCyoAAkAgAygCAA0AIANBATYCACAAIANBCGoQegsgA0EIaiABIAIQlAFBAAsJACAAQQEQywMLzAUCCX8BfiMAQaACayICJABBASEDIABBASACQZwCahCKASEEIABBAiACQZgCahCKASEFIABBA0IBEJIBIQsgAigCnAIhBgJAAkAgC0IBUw0AIAunIQMMAQsgC1ANACALQgAgBq19Uw0AIAYgC6dqQQFqIQMLAkACQCADQX9qIgcgBksNAAJAIAFFDQACQCAAQQQQSg0AQQAhAyACKAKYAiEIA0AgBSADaiIGQeKZAhC8BSIJDQIgAyAGELcFakEBaiIDIAhNDQALIAkNAQsgBCAHaiEDAkACQCACKAKYAiIGDQAgAyEGDAELAkAgBiACKAKcAiAHayIISw0AIAggBkF/aiIKayIIRQ0AIAVBAWohASAFLAAAIQUDQCADIAUgCBCUBSIGRQ0BIAZBAWoiCSABIAoQlQVFDQIgCCADaiEGIAkhAyAGIAlrIggNAAsLQQAhBgsgBkUNASAAIAYgBGsiA0EBaqwQUSAAIAIoApgCIANqrRBRQQIhCAwCCwJAIAUtAABB3gBHIgoNACACIAIoApgCQX9qNgKYAiAFQQFqIQULIAQgB2ohBiACQcgBNgIQIAIgADYCDCACIAUgAigCmAJqNgIIIAIgBDYCACACIAQgAigCnAJqNgIEQQEgBGshBwNAIAJBADoAFAJAIAIgBiAFENADIglFDQACQCABRQ0AIAAgByAGaqwQUSAAIAkgBGusEFEgAigCDCACLQAUIghBmA8QiwFBACEDAkAgCEUNAANAIAIgA0EAQQAQ0QMgA0EB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lgEhAwJAIAEoApwEIgRFDQBBACEAA0AgAyAAaiACIABqLQAAENAFOgAAIABBAWoiACABKAKcBCIESQ0ACwsgAUEIaiAEEJUBIAFBoARqJABBAQsJACAAQQAQywMLrQICBn8BfiMAQaAEayIBJABBASECIABBASABQZwEahCKASEDIABBAhCQASEHIABBA0Gu0gQgAUGYBGoQiQEhBAJAAkAgB0IAVQ0AIABBrtIEEFMaDAELAkACQCABKAKYBCICIAEoApwEIgVqIgYgAkkNAEL/////ByAHfyAGrVkNAQsgAEGnyQFBABCAASECDAELIAAgAUEIaiACIAenIgZBf2psIAUgBmxqIgUQlgEhAAJAIAdCAlMNAANAIAAgAyABKAKcBBDHBCABKAKcBGohAAJAIAEoApgEIgJFDQAgACAEIAIQxwQgASgCmARqIQALIAdCAlUhAiAHQn98IQcgAg0ACwsgACADIAEoApwEEMcEGiABQQhqIAUQlQFBASECCyABQaAEaiQAIAILgAEBBH8jAEGgBGsiASQAIABBASABQZwEahCKASECIAAgAUEIaiABKAKcBBCWASEDAkAgASgCnAQiBEUNAEEAIQADQCADIABqIAIgBCAAQX9zamotAAA6AAAgASgCnAQiBCAAQQFqIgBLDQALCyABQQhqIAQQlQEgAUGgBGokAEEBC98BAgV/An4jAEEQayIBJABBASECIABBASABQQxqEIoBIQMgAEECEJABIQYgASgCDCEEAkACQCAGQgFTDQAgBqchAgwBCyAGUA0AIAZCACAErX1TDQAgBCAGp2pBAWohAgsCQAJAIABBA0J/EJIBIgYgBK0iB1cNACAEIQUMAQsCQCAGQgBTDQAgBqchBQwBC0EAIQUgBkIAIAd9Uw0AIAQgBqdqQQFqIQULAkACQCAFIAJJDQAgACADIAJqQX9qIAUgAmtBAWoQUhoMAQsgAEGu0gQQUxoLIAFBEGokAEEBC30BBH8jAEGgBGsiASQAIABBASABQZwEahCKASECIAAgAUEIaiABKAKcBBCWASEDAkAgASgCnAQiBEUNAEEAIQADQCADIABqIAIgAGotAAAQ0QU6AAAgAEEBaiIAIAEoApwEIgRJDQALCyABQQhqIAQQlQEgAUGgBGokAEEBC7UMAgl/An4jAEHABGsiASQAIABBAUEA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BHFFDQAgAEHPGhBTGiAAIANBf3MQXUUNASADQQFqIQMLIAAgA0F/cxA6DwsgACABQQUQjAELC5QBAQN+IABBAUEHEP0DIABBARCfAUIBfCEBAkACQAJAIAAQOUF+ag4CAQACCwJAIABBAhCQASICQn98IAFUDQAgAEECQcQQEH8aCwJAIAEgAlcNAANAIABBASABQn98IgMQXBogAEEBIAEQZCADIQEgAyACVQ0ACwsgAiEBCyAAQQEgARBkQQAPCyAAQdOfAkEAEIABC1gCAn8BfiAAIAAQOSIBQQEQXyAAQQFBARA8AkAgAUEBSA0AIAGtIQMDQCAAQQEgAxBkIANCAVUhAiADQn98IQMgAg0ACwsgACABrBBRIABBAUHpGhBjQQELrwECA34BfyAAQQJCARCSASEBAkACQCAAQQMQP0EASg0AIABBARCfASECDAELIABBAxCQASECC0EAIQQCQAJAIAIgAVMNAEEBIQQCQCACIAF9IgNC/v///wdWDQAgACADQgF8IgOnEDVFIQQLIAQNAQJAIAIgAVcNAANAIABBASABEFwaIAFCAXwiASACUg0ACwsgAEEBIAIQXBogA6chBAsgBA8LIABB7L4BQQAQgAELhgEBA34gAEEBQQcQ/QMgAEEBEJ8BIQECQCABIABBAiABEJIBIgJRDQAgAkJ/fCABWA0AIABBAkHEEBB/GgsgAEEBIAIQXBoCQCACIAFZDQADQCAAQQEgAkIBfCIDEFwaIABBASACEGQgAyECIAMgAVINAAsgASECCyAAEE8gAEEBIAIQZEEBC70CAgV+An8gAEECEJABIQEgAEEDEJABIQIgAEEEEJABIQMgAEEFED8hBiAAQQFBARD9AyAAQQVBASAGQQBKGyIHQQIQ/QMCQCACIAFTDQACQCABQgBVDQAgAiABQv///////////wB8Uw0AIABBA0H/xAEQfxoLAkAgAyACIAF9IgRC////////////AIVXDQAgAEEEQZXLARB/GgsCQAJAIAMgAlUNACADIAFXDQAgBkEBSA0BIABBASAHQQAQRg0BC0IAIQUgBEIAUw0BIAIgAX1CAXwhBANAIABBASAFIAF8EFwaIAAgByAFIAN8EGQgBUIBfCIFIARSDQAMAgsACyAEQgBTDQADQCAAQQEgBCABfBBcGiAAIAcgBCADfBBkIARC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IAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQAMAgsACwJAIANBBE8NACAAIQIMAQsCQCADQXxqIgQgAE8NACAAIQIMAQsgACECA0AgAiABLQAAOgAAIAIgAS0AAToAASACIAEtAAI6AAIgAiABLQADOgADIAFBBGohASACQQRqIgIgBE0NAAsLAkAgAiADTw0AA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA0cNAAsLIAAL8gICA38BfgJAIAJFDQAgACABOgAAIAIgAGoiA0F/aiABOgAAIAJBA0kNACAAIAE6AAIgACABOgABIANBfWogAToAACADQX5qIAE6AAAgAkEHSQ0AIAAgAToAAyADQXxqIAE6AAAgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIFayICQSBJDQAgAa1CgYCAgBB+IQYgAyAFaiEBA0AgASAGNwMYIAEgBjcDECABIAY3AwggASAGNwMAIAFBIGohASACQWBqIgJBH0sNAAsLIAALEABB9IYeQfiGHkH8hh4QGQsJABDJBCAAEBoLJgAQyQQgACABEBsgAUH8hh5BBGpB/IYeIAEoAiAbKAIANgIoIAELHQAQyQQgACABEBwgAUHelwI2AiggAUIANwIgIAELEAAgAZogASAAGxDOBCABogsVAQF/IwBBEGsiASAAOQMIIAErAwgLEAAgAEQAAAAAAAAAEBDNBAsQACAARAAAAAAAAABwEM0EC80CAwJ+An8CfAJAAkACQCAAvSIBQjSIp0H/D3EiA0G3eGpBP08NACADIQQMAQsCQCADQcgHSw0AIABEAAAAAAAA8D+gDwtBACEEIANBiQhJDQBEAAAAAAAAAAAhBSABQoCAgICAgIB4UQ0BAkAgA0H/D0cNACAARAAAAAAAAPA/oA8LAkAgAUJ/VQ0AQQAQzwQPC0EAENAEDwtBACsDgP8EIACiQQArA4j/BCIFoCIGIAWhIgVBACsDmP8EoiAFQQArA5D/BKIgAKCgIgAgAKIiBSAFoiAAQQArA7j/BKJBACsDsP8EoKIgBSAAQQArA6j/BKJBACsDoP8EoKIgBr0iAadBBHRB8A9xIgNB8P8EaisDACAAoKCgIQAgA0H4/wRqKQMAIAFCLYZ8IQICQCAEDQAgACACIAEQ0gQPCyACvyIFIACiIAWgIQULIAUL4gECAX8DfCMAQRBrIQMCQCACQoCAgIAIg0IAUg0AIAFCgICAgICAgPhAfL8iBCAAoiAEoEQAAAAAAAAAf6IPCwJAIAFCgICAgICAgPA/fL8iBCAAoiIFIASgIgBEAAAAAAAA8D9jRQ0AIANCgICAgICAgAg3AwggAyADKwMIRAAAAAAAABAAojkDCEQAAAAAAAAAACAARAAAAAAAAPA/oCIGIAUgBCAAoaAgAEQAAAAAAADwPyAGoaCgoEQAAAAAAADwv6AiACAARAAAAAAAAAAAYRshAAsgAEQAAAAAAAAQAKILBQAgAJkLAgALrAEBBX8CQAJAIAAoAkxBAE4NAEEBIQEMAQsgABDABEUhAQsgABDYBCECIAAgACgCDBEAACEDAkAgAQ0AIAAQwQQLAkAgAC0AAEEBcQ0AIAAQ1AQQlgUhAQJAIAAoAjQiBEUNACAEIAAoAjg2AjgLAkAgACgCOCIFRQ0AIAUgBDYCNAsCQCABKAIAIABHDQAgASAFNgIACxCXBSAAKAJgEOcFIAAQ5wULIAMgAnILPQECfwJAAkAgACgCTEF/Sg0AIAAoAgAhAQwBCyAAEMAEIQIgACgCACEBIAJFDQAgABDBBAsgAUEEdkEBcQs9AQJ/AkACQCAAKAJMQX9KDQAgACgCACEBDAELIAAQwAQhAiAAKAIAIQEgAkUNACAAEMEECyABQQV2QQFxC70CAQN/AkAgAA0AQQAhAQJAQQAoApiCBkUNAEEAKAKYggYQ2AQhAQsCQEEAKALw/wVFDQBBACgC8P8FENgEIAFyIQELAkAQlgUoAgAiAEUNAANAQQAhAgJAIAAoAkxBAEgNACAAEMAEIQILAkAgACgCFCAAKAIcRg0AIAAQ2AQgAXIhAQsCQCACRQ0AIAAQwQQLIAAoAjgiAA0ACwsQlwUgAQ8LQQAhAgJAIAAoAkxBAEgNACAAEMAEIQILAkACQAJAIAAoAhQgACgCHEYNACAAQQBBACAAKAIkEQEAGiAAKAIUDQBBfyEBIAINAQwCCwJAIAAoAgQiASAAKAIIIgNGDQAgACABIANrrEEBIAAoAigREAAaC0EAIQEgAEEANgIcIABCADcDECAAQgA3AgQgAkUNAQsgABDBBAsgAQuBAQECfyAAIAAoAkgiAUF/aiABcjYCSAJAIAAoAhQgACgCHEYNACAAQQBBACAAKAIkEQEAGgsgAEEANgIcIABCADcDEAJAIAAoAgAiAUEEcUUNACAAIAFBIHI2AgBBfw8LIAAgACgCLCAAKAIwaiICNgIIIAAgAjYCBCABQRt0QR91C0EBAn8jAEEQayIBJABBfyECAkAgABDZBA0AIAAgAUEPakEBIAAoAiARAQBBAUcNACABLQAPIQILIAFBEGokACACCwUAIACcC6sEAgR+An8CQAJAIAG9IgJCAYYiA1ANACACQv///////////wCDQoCAgICAgID4/wBWDQAgAL0iBEI0iKdB/w9xIgZB/w9HDQELIAAgAaIiASABow8LAkAgBEIBhiIFIANWDQAgAEQAAAAAAAAAAKIgACAFIANRGw8LIAJCNIinQf8PcSEHAkACQCAGDQBBACEGAkAgBEIMhiIDQgBTDQADQCAGQX9qIQYgA0IBhiIDQn9VDQALCyAEQQEgBmuthiEDDAELIARC/////////weDQoCAgICAgIAIhCEDCwJAAkAgBw0AQQAhBwJAIAJCDIYiBUIAUw0AA0AgB0F/aiEHIAVCAYYiBUJ/VQ0ACwsgAkEBIAdrrYYhAgwBCyACQv////////8Hg0KAgICAgICACIQhAgsCQCAGIAdMDQADQAJAIAMgAn0iBUIAUw0AIAUhAyAFQgBSDQAgAEQAAAAAAAAAAKIPCyADQgGGIQMgBkF/aiIGIAdKDQALIAchBgsCQCADIAJ9IgVCAFMNACAFIQMgBUIAUg0AIABEAAAAAAAAAACiDwsCQAJAIANC/////////wdYDQAgAyEFDAELA0AgBkF/aiEGIANCgICAgICAgARUIQcgA0IBhiIFIQMgBw0ACwsgBEKAgICAgICAgIB/gyEDAkACQCAGQQFIDQAgBUKAgICAgICAeHwgBq1CNIaEIQUMAQsgBUEBIAZrrYghBQsgBSADhL8LdAEBf0ECIQECQCAAQSsQrQUN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gICAgICJQHxC//////+fwgFWDQACQCABQoCAgICAgID4P1INAEQAAAAAAAAAAA8LIABEAAAAAAAA8L+gIgAgACAARAAAAAAAAKBBoiIDoCADoSIDIAOiQQArA/ChBSIEoiIFoCIGIAAgACAAoiIHoiIIIAggCCAIQQArA8CiBaIgB0EAKwO4ogWiIABBACsDsKIFokEAKwOoogWgoKCiIAdBACsDoKIFoiAAQQArA5iiBaJBACsDkKIFoKCgoiAHQQArA4iiBaIgAEEAKwOAogWiQQArA/ihBaCgoKIgACADoSAEoiAAIAOgoiAFIAAgBqGgoKCgDwsCQAJAIAFCMIinIglBkIB+akGfgH5LDQACQCABQv///////////wCDQgBSDQBBARCOBQ8LIAFCgICAgICAgPj/AFENAQJAAkAgCUH//wFLDQAgCUHw/wFxQfD/AUcNAQsgABCPBQ8LIABEAAAAAAAAMEOivUKAgICAgICA4Hx8IQELIAFCgICAgICAgI1AfCICQjSHp7ciB0EAKwO4oQWiIAJCLYinQf8AcUEEdCIJQdCiBWorAwCgIgggCUHIogVqKwMAIAEgAkKAgICAgICAeIN9vyAJQciyBWorAwChIAlB0LIFaisDAKGiIgCgIgQgACAAIACiIgOiIAMgAEEAKwPooQWiQQArA+ChBaCiIABBACsD2KEFokEAKwPQoQWgoKIgA0EAKwPIoQWiIAdBACsDwKEFoiAAIAggBKGgoKCgoCEACyAAC+4DAwF+A38GfAJAAkACQAJAAkAgAL0iAUIAUw0AIAFCIIinIgJB//8/Sw0BCwJAIAFC////////////AINCAFINAEQAAAAAAADwvyAAIACiow8LIAFCf1UNASAAIAChRAAAAAAAAAAAow8LIAJB//+//wdLDQJBgIDA/wMhA0GBeCEEAkAgAkGAgMD/A0YNACACIQMMAgsgAacNAUQAAAAAAAAAAA8LIABEAAAAAAAAUEOivSIBQiCIpyEDQct3IQQLIAQgA0HiviVqIgJBFHZqtyIFRABgn1ATRNM/oiIGIAJB//8/cUGewZr/A2qtQiCGIAFC/////w+DhL9EAAAAAAAA8L+gIgAgACAARAAAAAAAAOA/oqIiB6G9QoCAgIBwg78iCEQAACAVe8vbP6IiCaAiCiAJIAYgCqGgIAAgAEQA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AAsLA0AgASICQQRqIQEgAigCACIDQX9zIANB//37d2pxQYCBgoR4cUUNAAsDQCACIgFBAWohAiABLQAADQALCyABIABrC3ABA38CQCACDQBBAA8LQQAhAwJAIAAtAAAiBEUNAAJAA0AgAS0AACIFRQ0BIAJBf2oiAkUNASAEQf8BcSAFRw0BIAFBAWohASAALQABIQQgAEEBaiEAIAQNAAwCCwALIAQhAwsgA0H/AXEgAS0AAGsL/QEBAX8CQAJAAkACQCABIABzQQNxDQAgAkEARyEDAkAgAUEDcUUNACACRQ0AA0AgACABLQAAIgM6AAAgA0UNBSAAQQFqIQAgAkF/aiICQQBHIQMgAUEBaiIBQQNxRQ0BIAINAAsLIANFDQIgAS0AAEUNAyACQQRJDQADQCABKAIAIgNBf3MgA0H//ft3anFBgIGChHhxDQIgACADNgIAIABBBGohACABQQRqIQEgAkF8aiICQQNLDQALCyACRQ0BCwNAIAAgAS0AACIDOgAAIANFDQIgAEEBaiEAIAFBAWohASACQX9qIgINAAsLQQAhAgsgAEEAIAIQyAQaIAALDgAgACABIAIQuQUaIAALzgEBA38jAEEgayICJAACQAJAAkAgASwAACIDRQ0AIAEtAAENAQsgACADEK4FIQQMAQsgAkEAQSAQyAQaAkAgAS0AACIDRQ0AA0AgAiADQQN2QRxxaiIEIAQoAgBBASADdHI2AgAgAS0AASEDIAFBAWohASADDQALCyAAIQQgAC0AACIDRQ0AIAAhAQNAAkAgAiADQQN2QRxxaigCACADdkEBcUUNACABIQQMAgsgAS0AASEDIAFBAWoiBCEBIAMNAAsLIAJBIGokACAEIABrCxYAIAAgACABELsFaiIAQQAgAC0AABsL5AEBA38jAEEgayICQRhqQgA3AwAgAkEQakIANwMAIAJCADcDCCACQgA3AwACQCABLQAAIgMNAEEADwsCQCABLQABDQAgACEBA0AgASIEQQFqIQEgBC0AACADRg0ACyAEIABrDwsDQCACIANBA3ZBHHFqIgQgBCgCAEEBIAN0cjYCACABLQABIQMgAUEBaiEBIAMNAAsgACEEAkAgAC0AACIDRQ0AIAAhAQNAAkAgAiADQQN2QRxxaigCACADdkEBcQ0AIAEhBAwCCyABLQABIQMgAUEBaiIEIQEgAw0ACwsgBCAAawtHAQJ/IAAgATcDcCAAIAAoAiwgACgCBCICa6w3A3ggACgCCCEDAkAgAVANACADIAJrrCABVw0AIAIgAadqIQMLIAAgAzYCaAvdAQIDfwJ+IAApA3ggACgCBCIBIAAoAiwiAmusfCEEAkACQAJAIAApA3AiBVANACAEIAVZDQELIAAQ2gQiAkF/Sg0BIAAoAgQhASAAKAIsIQILIABCfzcDcCAAIAE2AmggACAEIAIgAWusfDcDeEF/DwsgBEIBfCEEIAAoAgQhASAAKAIIIQMCQCAAKQNwIgVCAFENACAFIAR9IgUgAyABa6xZDQAgASAFp2ohAwsgACADNgJoIAAgBCAAKAIsIgMgAWusfDcDeAJAIAEgA0sNACABQX9qIAI6AAALIAILNQAgACABNwMAIAAgBEIwiKdBgIACcSACQjCIp0H//wFxcq1CMIYgAkL///////8/g4Q3AwgL5wIBAX8jAEHQAGsiBCQAAkACQCADQYCAAUgNACAEQSBqIAEgAkIAQoCAgICAgID//wAQ+gUgBEEgakEIaikDACECIAQpAyAhAQJAIANB//8BTw0AIANBgYB/aiEDDAILIARBEGogASACQgBCgICAgICAgP//ABD6BSADQf3/AiADQf3/AkgbQYKAfmohAyAEQRBqQQhqKQMAIQIgBCkDECEBDAELIANBgYB/Sg0AIARBwABqIAEgAkIAQoCAgICAgIA5EPoFIARBwABqQQhqKQMAIQIgBCkDQCEBAkAgA0H0gH5NDQAgA0GN/wBqIQMMAQsgBEEwaiABIAJCAEKAgICAgICAORD6BSADQeiBfSADQeiBfUobQZr+AWohAyAEQTBqQQhqKQMAIQIgBCkDMCEBCyAEIAEgAkIAIANB//8Aaq1CMIYQ+gUgACAEQQhqKQMANwMIIAAgBCkDADcDACAEQdAAaiQAC0sCAX4CfyABQv///////z+DIQICQAJAIAFCMIinQf//AXEiA0H//wFGDQBBBCEEIAMNAUECQQMgAiAAhFAbDwsgAiAAhFAhBAsgBAvbBgIEfwN+IwBBgAFrIgUkAAJAAkACQCADIARCAEIAEO8FRQ0AIAMgBBDCBSEGIAJCMIinIgdB//8BcSIIQf//AUYNACAGDQELIAVBEGogASACIAMgBBD6BSAFIAUpAxAiBCAFQRBqQQhqKQMAIgMgBCADEPEFIAVBCGopAwAhAiAFKQMAIQQMAQsCQCABIAitQjCGIAJC////////P4OEIgkgAyAEQjCIp0H//wFxIgatQjCGIARC////////P4OEIgoQ7wVBAEoNAAJAIAEgCSADIAoQ7wVFDQAgASEEDAILIAVB8ABqIAEgAkIAQgAQ+gUgBUH4AGopAwAhAiAFKQNwIQQMAQsCQAJAIAhFDQAgASEEDAELIAVB4ABqIAEgCUIAQoCAgICAgMC7wAAQ+gUgBUHoAGopAwAiCUIwiKdBiH9qIQggBSkDYCEECwJAIAYNACAFQdAAaiADIApCAEKAgICAgIDAu8AAEPoFIAVB2ABqKQMAIgpCMIinQYh/aiEGIAUpA1AhAwsgCkL///////8/g0KAgICAgIDAAIQhCyAJQv///////z+DQoCAgICAgMAAhCEJAkAgCCAGTA0AA0ACQAJAIAkgC30gBCADVK19IgpCAFMNAAJAIAogBCADfSIEhEIAUg0AIAVBIGogASACQgBCABD6BSAFQShqKQMAIQIgBSkDICEEDAULIApCAYYgBEI/iIQhCQwBCyAJQgGGIARCP4iEIQkLIARCAYYhBCAIQX9qIgggBkoNAAsgBiEICwJAAkAgCSALfSAEIANUrX0iCkIAWQ0AIAkhCgwBCyAKIAQgA30iBIRCAFINACAFQTBqIAEgAkIAQgAQ+gUgBUE4aikDACECIAUpAzAhBAwBCwJAIApC////////P1YNAANAIARCP4ghAyAIQX9qIQggBEIBhiEEIAMgCkIBhoQiCkKAgICAgIDAAFQNAAsLIAdBgIACcSEGAkAgCEEASg0AIAVBwABqIAQgCkL///////8/gyAIQfgAaiAGcq1CMIaEQgBCgICAgICAwMM/EPoFIAVByABqKQMAIQIgBSkDQCEEDAELIApC////////P4MgCCAGcq1CMIaEIQILIAAgBDcDACAAIAI3AwggBUGAAWokAAscACAAIAJC////////////AIM3AwggACABNwMAC44JAgZ/A34jAEEwayIEJABCACEKAkACQCACQQJLDQAgAUEEaiEFIAJBAnQiAkHc9QVqKAIAIQYgAkHQ9QVqKAIAIQcDQAJAAkAgASgCBCICIAEoAmhGDQAgBSACQQFqNgIAIAItAAAhAgwBCyAB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IAEgAiAAEPMEGgsLdAEDf0EAIQECQCAAKAIALAAAEIEFDQBBAA8LA0AgACgCACECQX8hAwJAIAFBzJmz5gBLDQBBfyACLAAAQVBqIgMgAUEKbCIBaiADIAFB/////wdzShshAwsgACACQQFqNgIAIAMhASACLAABEIEFDQALIAMLtgQAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQAJAAkAgAUF3ag4SAAECBQMEBgcICQoLDA0ODxAREgsgAiACKAIAIgFBBGo2AgAgACABKAIANgIADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABMgEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMwEANwMADwsgAiACKAIAIgFBBGo2AgAgACABMAAANwMADwsgAiACKAIAIgFBBGo2AgAgACABMQAANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKQMANwMADwsgAiACKAIAIgFBBGo2AgAgACABNAIANwMADwsgAiACKAIAIgFBBGo2AgAgACABNQIANwMADwsgAiACKAIAQQdqQXhxIgFBCGo2AgAgACABKwMAOQMADwsgACACIAMRAwALCz4BAX8CQCAAUA0AA0AgAUF/aiIBIACnQQ9xQeD5BWotAAAgAnI6AAAgAEIPViEDIABCBIghACADDQALCyABCzYBAX8CQCAAUA0AA0AgAUF/aiIBIACnQQdxQTByOgAAIABCB1YhAiAAQgOIIQAgAg0ACwsgAQuIAQIBfgN/AkACQCAAQoCAgIAQWg0AIAAhAgwBCwNAIAFBf2oiASAAIABCCoAiAkIKfn2nQTByOgAAIABC/////58BViEDIAIhACADDQALCwJAIAKn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A0GA/j9qQRB2QQhxIgN0IgQgBEGA4B9qQRB2QQRxIgR0IgYgBkGAgA9qQRB2QQJxIgZ0QQ92IAMgBHIgBnJrIgNBAXQgASADQRVqdkEBcXJBHGohAwsgACADNgIcIABCADcCECADQQJ0QaSdHmohBAJAAkACQEEAKAL4mh4iBkEBIAN0IgJxDQBBACAGIAJyNgL4mh4gBCAANgIAIAAgBDYCGAwBCyABQQBBGSADQQF2ayADQR9GG3QhAyAEKAIAIQYDQCAGIgQoAgRBeHEgAUYNAiADQR12IQYgA0EBdCEDIAQgBkEEcWpBEGoiAigCACIGDQALIAIgADYCACAAIAQ2AhgLIAAgADYCDCAAIAA2AggPCyAEKAIIIgEgADYCDCAEIAA2AgggAEEANgIYIAAgBDYCDCAAIAE2AggLCwcAPwBBEHQLVAECf0EAKAKcggYiASAAQQNqQXxxIgJqIQACQAJAIAJFDQAgACABTQ0BCwJAIAAQ6wVNDQAgABArRQ0BC0EAIAA2ApyCBiABDwsQtwRBMDYCAEF/C+gKAgR/BH4jAEHwAGsiBSQAIARC////////////AIMhCQJAAkACQCABUCIGIAJC////////////AIMiCkKAgICAgIDAgIB/fEKAgICAgIDAgIB/VCAKUBsNACADQgBSIAlCgICAgICAwICAf3wiC0KAgICAgIDAgIB/ViALQoCAgICAgMCAgH9RGw0BCwJAIAYgCkKAgICAgIDA//8AVCAKQoCAgICAgMD//wBRGw0AIAJCgICAgICAIIQhBCABIQMMAgsCQCADUCAJQoCAgICAgMD//wBUIAlCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCEEDAILAkAgASAKQoCAgICAgMD//wCFhEIAUg0AQoCAgICAgOD//wAgAiADIAGFIAQgAoVCgICAgICAgICAf4WEUCIGGyEEQgAgASAGGyEDDAILIAMgCUKAgICAgIDA//8AhYRQDQECQCABIAqEQgBSDQAgAyAJhEIAUg0CIAMgAYMhAyAEIAKDIQQMAgsgAyAJhFBFDQAgASEDIAIhBAwBCyADIAEgAyABViAJIApWIAkgClEbIgcbIQogBCACIAcbIglC////////P4MhCyACIAQgBxsiDEIwiKdB//8BcSEIAkAgCUIwiKdB//8BcSIGDQAgBUHgAGogCiALIAogCyALUCIGG3kgBkEGdK18pyIGQXFqEO4FQRAgBmshBiAFQegAaikDACELIAUpA2AhCgsgASADIAcbIQMgDEL///////8/gyEEAkAgCA0AIAVB0ABqIAMgBCADIAQgBFAiBxt5IAdBBnStfKciB0FxahDuBUEQIAdrIQggBUHYAGopAwAhBCAFKQNQIQMLIARCA4YgA0I9iIRCgICAgICAgASEIQIgC0IDhiAKQj2IhCEEIANCA4YhASAJIAyFIQMCQCAGIAhGDQACQCAGIAhrIgdB/wBNDQBCACECQgEhAQwBCyAFQcAAaiABIAJBgAEgB2sQ7gUgBUEwaiABIAIgBxD5BSAFKQMwIAUpA0AgBUHAAGpBCGopAwCEQgBSrYQhASAFQTBqQQhqKQMAIQILIARCgICAgICAgASEIQwgCkIDhiELAkACQCADQn9VDQBCACEDQgAhBCALIAGFIAwgAoWEUA0CIAsgAX0hCiAMIAJ9IAsgAVStfSIEQv////////8DVg0BIAVBIGogCiAEIAogBCAEUCIHG3kgB0EGdK18p0F0aiIHEO4FIAYgB2shBiAFQShqKQMAIQQgBSkDICEKDAELIAIgDHwgASALfCIKIAFUrXwiBEKAgICAgICACINQDQAgCkIBiCAEQj+GhCAKQgGDhCEKIAZBAWohBiAEQgGIIQQLIAlCgICAgICAgICAf4MhAQJAIAZB//8BSA0AIAFCgICAgICAwP//AIQhBEIAIQMMAQtBACEHAkACQCAGQQBMDQAgBiEHDAELIAVBEGogCiAEIAZB/wBqEO4FIAUgCiAEQQEgBmsQ+QUgBSkDACAFKQMQIAVBEGpBCGopAwCEQgBSrYQhCiAFQQhqKQMAIQQLIApCA4ggBEI9hoQhAyAHrUIwhiAEQgOIQv///////z+DhCABhCEEIAqnQQdxIQYCQAJAAkACQAJAEPcFDgMAAQIDCyAEIAMgBkEES618IgogA1StfCEEAkAgBkEERg0AIAohAwwDCyAEIApCAYMiASAKfCIDIAFUrXwhBAwDCyAEIAMgAUIAUiAGQQBHca18IgogA1StfCEEIAohAwwBCyAEIAMgAVAgBkEAR3GtfCIKIANUrXwhBCAKIQMLIAZFDQELEPgFGgsgACADNwMAIAAgBDcDCCAFQfAAaiQAC1MBAX4CQAJAIANBwABxRQ0AIAEgA0FAaq2GIQJCACEBDAELIANFDQAgAUHAACADa62IIAIgA60iBIaEIQIgASAEhiEBCyAAIAE3AwAgACACNwMIC+ABAgF/An5BASEEAkAgAEIAUiABQv///////////wCDIgVCgICAgICAwP//AFYgBUKAgICAgIDA//8AURsNACACQgBSIANC////////////AIMiBkKAgICAgIDA//8AViAGQoCAgICAgMD//wBRGw0AAkAgAiAAhCAGIAWEhFBFDQBBAA8LAkAgAyABg0IAUw0AQX8hBCAAIAJUIAEgA1MgASADURsNASAAIAKFIAEgA4WEQgBSDwtBfyEEIAAgAlYgASADVSABIANRGw0AIAAgAoUgASADhYRCAFIhBAsgBAvYAQIBfwJ+QX8hBAJAIABCAFIgAUL///////////8AgyIFQoCAgICAgMD//wBWIAVCgICAgICAwP//AFEbDQAgAkIAUiADQv///////////wCDIgZCgICAgICAwP//AFYgBkKAgICAgIDA//8AURsNAAJAIAIgAIQgBiAFhIRQRQ0AQQAPCwJAIAMgAYNCAFMNACAAIAJUIAEgA1MgASADURsNASAAIAKFIAEgA4WEQgBSDwsgACACViABIANVIAEgA1EbDQAgACAChSABIAOFhEIAUiEECyAEC98QAgV/Dn4jAEHQAmsiBSQAIARC////////P4MhCiACQv///////z+DIQsgBCAChUKAgICAgICAgIB/gyEMIARCMIinQf//AXEhBgJAAkACQCACQjCIp0H//wFxIgdBgYB+akGCgH5JDQBBACEIIAZBgYB+akGBgH5LDQELAkAgAVAgAkL///////////8AgyINQoCAgICAgMD//wBUIA1CgICAgICAwP//AFEbDQAgAkKAgICAgIAghCEMDAILAkAgA1AgBEL///////////8AgyICQoCAgICAgMD//wBUIAJCgICAgICAwP//AFEbDQAgBEKAgICAgIAghCEMIAMhAQwCCwJAIAEgDUKAgICAgIDA//8AhYRCAFINAAJAIAMgAkKAgICAgIDA//8AhYRQRQ0AQgAhAUKAgICAgIDg//8AIQwMAwsgDEKAgICAgIDA//8AhCEMQgAhAQwCCwJAIAMgAkKAgICAgIDA//8AhYRCAFINAEIAIQEMAgsCQCABIA2EQgBSDQBCgICAgICA4P//ACAMIAMgAoRQGyEMQgAhAQwCCwJAIAMgAoRCAFINACAMQoCAgICAgMD//wCEIQxCACEBDAILQQAhCAJAIA1C////////P1YNACAFQcACaiABIAsgASALIAtQIggbeSAIQQZ0rXynIghBcWoQ7gVBECAIayEIIAVByAJqKQMAIQsgBSkDwAIhAQsgAkL///////8/Vg0AIAVBsAJqIAMgCiADIAogClAiCRt5IAlBBnStfKciCUFxahDuBSAJIAhqQXBqIQggBUG4AmopAwAhCiAFKQOwAiEDCyAFQaACaiADQjGIIApCgICAgICAwACEIg5CD4aEIgJCAEKAgICAsOa8gvUAIAJ9IgRCABD7BSAFQZACakIAIAVBoAJqQQhqKQMAfUIAIARCABD7BSAFQYACaiAFKQOQAkI/iCAFQZACakEIaikDAEIBhoQiBEIAIAJCABD7BSAFQfABaiAEQgBCACAFQYACakEIaikDAH1CABD7BSAFQeABaiAFKQPwAUI/iCAFQfABakEIaikDAEIBhoQiBEIAIAJCABD7BSAFQdABaiAEQgBCACAFQeABakEIaikDAH1CABD7BSAFQcABaiAFKQPQAUI/iCAFQdABakEIaikDAEIBhoQiBEIAIAJCABD7BSAFQbABaiAEQgBCACAFQcABakEIaikDAH1CABD7BSAFQaABaiACQgAgBSkDsAFCP4ggBUGwAWpBCGopAwBCAYaEQn98IgRCABD7BSAFQZABaiADQg+GQgAgBEIAEPsFIAVB8ABqIARCAEIAIAVBoAFqQQhqKQMAIAUpA6ABIgogBUGQAWpBCGopAwB8IgIgClStfCACQgFWrXx9QgAQ+wUgBUGAAWpCASACfUIAIARCABD7BSAIIAcgBmtqIQYCQAJAIAUpA3AiD0IBhiIQIAUpA4ABQj+IIAVBgAFqQQhqKQMAIhFCAYaEfCINQpmTf3wiEkIgiCICIAtCgICAgICAwACEIhNCAYYgAUI/iIQiFEIgiCIEfiILIAFCAYYiFUIgiCIKIAVB8ABqQQhqKQMAQgGGIA9CP4iEIBFCP4h8IA0gEFStfCASIA1UrXxCf3wiD0IgiCINfnwiECALVK0gECAPQv////8PgyILIBRC/////w+DIg9+fCIRIBBUrXwgDSAEfnwgCyAEfiIWIA8gDX58IhAgFlStQiCGIBBCIIiEfCARIBBCIIZ8IhAgEVStfCAQIBJC/////w+DIhIgD34iFiACIAp+fCIRIBZUrSARIAsgFUL+////D4MiFn58IhcgEVStfHwiESAQVK18IBEgEiAEfiIQIBYgDX58IgQgAiAPfnwiDSALIAp+fCILQiCIIAQgEFStIA0gBFStfCALIA1UrXxCIIaEfCIEIBFUrXwgBCAXIAIgFn4iAiASIAp+fCIKQiCIIAogAlStQiCGhHwiAiAXVK0gAiALQiCGfCACVK18fCICIARUrXwiBEL/////////AFYNACAFQdAAaiACIAQgAyAOEPsFIAFCMYYgBUHQAGpBCGopAwB9IAUpA1AiAUIAUq19IQ0gBkH+/wBqIQZCACABfSEKDAELIAVB4ABqIAJCAYggBEI/hoQiAiAEQgGIIgQgAyAOEPsFIAFCMIYgBUHgAGpBCGopAwB9IAUpA2AiCkIAUq19IQ0gBkH//wBqIQZCACAKfSEKIAEhFSATIRQLAkAgBkH//wFIDQAgDEKAgICAgIDA//8AhCEMQgAhAQwBCwJAAkAgBkEBSA0AIA1CAYYgCkI/iIQhDSAGrUIwhiAEQv///////z+DhCELIApCAYYhBAwBCwJAIAZBj39KDQBCACEBDAILIAVBwABqIAIgBEEBIAZrEPkFIAVBMGogFSAUIAZB8ABqEO4FIAVBIGogAyAOIAUpA0AiAiAFQcAAakEIaikDACILEPsFIAVBMGpBCGopAwAgBUEgakEIaikDAEIBhiAFKQMgIgFCP4iEfSAFKQMwIgQgAUIBhiIBVK19IQ0gBCABfSEECyAFQRBqIAMgDkIDQgAQ+wUgBSADIA5CBUIAEPsFIAsgAiACQgGDIgEgBHwiBCADViANIAQgAVStfCIBIA5WIAEgDlEbrXwiAyACVK18IgIgAyACQoCAgICAgMD//wBUIAQgBSkDEFYgASAFQRBqQQhqKQMAIgJWIAEgAlEbca18IgIgA1StfCIDIAIgA0KAgICAgIDA//8AVCAEIAUpAwBWIAEgBUEIaikDACIEViABIARRG3GtfCIBIAJUrXwgDIQhDAsgACABNwMAIAAgDDcDCCAFQdACaiQACyAAAkBBACgC5J4eDQBBACABNgLonh5BACAANgLknh4LC44CAgJ/A34jAEEQayICJAACQAJAIAG9IgRC////////////AIMiBUKAgICAgICAeHxC/////////+//AFYNACAFQjyGIQYgBUIEiEKAgICAgICAgDx8IQUMAQsCQCAFQoCAgICAgID4/wBUDQAgBEI8hiEGIARCBIhCgICAgICAwP//AIQhBQwBCwJAIAVQRQ0AQgAhBkIAIQUMAQsgAiAFQgAgBKdnQSBqIAVCIIinZyAFQoCAgIAQVBsiA0ExahDuBSACQQhqKQMAQoCAgICAgMAAhUGM+AAgA2utQjCGhCEFIAIpAwAhBgsgACAGNwMAIAAgBSAEQoCAgICAgICAgH+DhDcDCCACQRBqJAAL4QECA38CfiMAQRBrIgIkAAJAAkAgAbwiA0H/////B3EiBEGAgIB8akH////3B0sNACAErUIZhkKAgICAgICAwD98IQVCACEGDAELAkAgBEGAgID8B0kNACADrUIZhkKAgICAgIDA//8AhCEFQgAhBgwBCwJAIAQNAEIAIQZCACEFDAELIAIgBK1CACAEZyIEQdEAahDuBSACQQhqKQMAQoCAgICAgMAAhUGJ/wAgBGutQjCGhCEFIAIpAwAhBgsgACAGNwMAIAAgBSADQYCAgIB4ca1CIIaENwMIIAJBEGokAAuNAQICfwJ+IwBBEGsiAiQAAkACQCABDQBCACEEQgAhBQwBCyACIAEgAUEfdSIDcyADayIDrUIAIANnIgNB0QBqEO4FIAJBCGopAwBCgICAgICAwACFQZ6AASADa61CMIZ8IAFBgICAgHhxrUIghoQhBSACKQMAIQQLIAAgBDcDACAAIAU3AwggAkEQaiQAC3ICAX8CfiMAQRBrIgIkAAJAAkAgAQ0AQgAhA0IAIQQMAQsgAiABrUIAIAFnIgFB0QBqEO4FIAJBCGopAwBCgICAgICAwACFQZ6AASABa61CMIZ8IQQgAikDACEDCyAAIAM3AwAgACAENwMIIAJBEGokAAsEAEEACwQAQQALUwEBfgJAAkAgA0HAAHFFDQAgAiADQUBqrYghAUIAIQIMAQsgA0UNACACQcAAIANrrYYgASADrSIEiIQhASACIASIIQILIAAgATcDACAAIAI3AwgLnAsCBX8PfiMAQeAAayIFJAAgBEL///////8/gyEKIAQgAoVCgICAgICAgICAf4MhCyACQv///////z+DIgxCIIghDSAEQjCIp0H//wFxIQYCQAJAAkAgAkIwiKdB//8BcSIHQYGAfmpBgoB+SQ0AQQAhCCAGQYGAfmpBgYB+Sw0BCwJAIAFQIAJC////////////AIMiDkKAgICAgIDA//8AVCAOQoCAgICAgMD//wBRGw0AIAJCgICAgICAIIQhCwwCCwJAIANQIARC////////////AIMiAkKAgICAgIDA//8AVCACQoCAgICAgMD//wBRGw0AIARCgICAgICAIIQhCyADIQEMAgsCQCABIA5CgICAgICAwP//AIWEQgBSDQACQCADIAKEUEUNAEKAgICAgIDg//8AIQtCACEBDAMLIAtCgICAgICAwP//AIQhC0IAIQEMAgsCQCADIAJCgICAgICAwP//AIWEQgBSDQAgASAOhCECQgAhAQJAIAJQRQ0AQoCAgICAgOD//wAhCwwDCyALQoCAgICAgMD//wCEIQsMAgsCQCABIA6EQgBSDQBCACEBDAILAkAgAyAChEIAUg0AQgAhAQwCC0EAIQgCQCAOQv///////z9WDQAgBUHQAGogASAMIAEgDCAMUCIIG3kgCEEGdK18pyIIQXFqEO4FQRAgCGshCCAFQdgAaikDACIMQiCIIQ0gBSkDUCEBCyACQv///////z9WDQAgBUHAAGogAyAKIAMgCiAKUCIJG3kgCUEGdK18pyIJQXFqEO4FIAggCWtBEGohCCAFQcgAaikDACEKIAUpA0AhAwsgA0IPhiIOQoCA/v8PgyICIAFCIIgiBH4iDyAOQiCIIg4gAUL/////D4MiAX58IhBCIIYiESACIAF+fCISIBFUrSACIAxC/////w+DIgx+IhMgDiAEfnwiESAKQg+GIANCMYiEIhRC/////w+DIgMgAX58IgogEEIgiCAQIA9UrUIghoR8Ig8gAiANQoCABIQiEH4iFSAOIAx+fCINIBRCIIhCgICAgAiEIgIgAX58IhQgAyAEfnwiFkIghnwiF3whASAHIAZqIAhqQYGAf2ohBgJAAkAgAiAEfiIYIA4gEH58IgQgGFStIAQgAyAMfnwiDiAEVK18IAIgEH58IA4gESATVK0gCiARVK18fCIEIA5UrXwgAyAQfiIDIAIgDH58IgIgA1StQiCGIAJCIIiEfCAEIAJCIIZ8IgIgBFStfCACIBZCIIggDSAVVK0gFCANVK18IBYgFFStfEIghoR8IgQgAlStfCAEIA8gClStIBcgD1StfHwiAiAEVK18IgRCgICAgICAwACDUA0AIAZBAWohBgwBCyASQj+IIQMgBEIBhiACQj+IhCEEIAJCAYYgAUI/iIQhAiASQgGGIRIgAyABQgGGhCEBCwJAIAZB//8BSA0AIAtCgICAgICAwP//AIQhC0IAIQEMAQsCQAJAIAZBAEoNAAJAQQEgBmsiB0GAAUkNAEIAIQEMAwsgBUEwaiASIAEgBkH/AGoiBhDuBSAFQSBqIAIgBCAGEO4FIAVBEGogEiABIAcQ+QUgBSACIAQgBxD5BSAFKQMgIAUpAxCEIAUpAzAgBUEwakEIaikDAIRCAFKthCESIAVBIGpBCGopAwAgBUEQakEIaikDAIQhASAFQQhqKQMAIQQgBSkDACECDAELIAatQjCGIARC////////P4OEIQQLIAQgC4QhCwJAIBJQIAFCf1UgAUKAgICAgICAgIB/URsNACALIAJCAXwiASACVK18IQsMAQsCQCASIAFCgICAgICAgICAf4WEQgBRDQAgAiEBDAELIAsgAiACQgGDfCIBIAJUrXwhCwsgACABNwMAIAAgCzcDCCAFQeAAaiQAC3UBAX4gACAEIAF+IAIgA358IANCIIgiAiABQiCIIgR+fCADQv////8PgyIDIAFC/////w+DIgF+IgVCIIggAyAEfnwiA0IgiHwgA0L/////D4MgAiABfnwiAUIgiHw3AwggACABQiCGIAVC/////w+DhDcDAAtIAQF/IwBBEGsiBSQAIAUgASACIAMgBEKAgICAgICAgIB/hRDtBSAFKQMAIQQgACAFQQhqKQMANwMIIAAgBDcDACAFQRBqJAAL5AMCAn8CfiMAQSBrIgIkAAJAAkAgAUL///////////8AgyIEQoCAgICAgMD/Q3wgBEKAgICAgIDAgLx/fFoNACAAQjyIIAFCBIaEIQQCQCAAQv//////////D4MiAEKBgICAgICAgAhUDQAgBEKBgICAgICAgMAAfCEFDAILIARCgICAgICAgIDAAHwhBSAAQoCAgICAgICACFINASAFIARCAYN8IQUMAQsCQCAAUCAEQoCAgICAgMD//wBUIARCgICAgICAwP//AFEbDQAgAEI8iCABQgSG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c2VydABpbnNlcnQAcmVzdGFydABfX2Jub3QAY291bnQAcHJpbnQAY29kZXBvaW50AGNvbW1lbnQAY29uc3RhbnQAdWx0AF9fbHQAZXhpdABsaW1pdAByYXdzZXQAb2Zmc2V0AHJhd2dldABjb2xsZWN0AHNlbGVjdABidABmbG9hdAB2YXJpYWJsZS1sZW5ndGggZm9ybWF0AHJlcGVhdABfX2NvbmNhdAAqdAB3cm9uZyBudW1iZXIgb2YgYXJndW1lbnRzAGNvbnN0YW50cwB0b28gbWFueSByZXN1bHRzAGlwYWlycwBfX3BhaXJzAGZ1bmN0aW9uIG9yIGV4cHJlc3Npb24gbmVlZHMgdG9vIG1hbnkgcmVnaXN0ZXJzAF9jYWxsZXJzAHNwZWNpZmllciAnJSVxJyBjYW5ub3QgaGF2ZSBtb2RpZmllcnMAbGFiZWxzL2dvdG9zAHN0cmluZyBjb250YWlucyB6ZXJvcwBhY29zAHRvbyBtYW55IG5lc3RlZCBmdW5jdGlvbnMAdG9vIG1hbnkgdXB2YWx1ZXMAYXR0ZW1wdCB0byBjb21wYXJlIHR3byAlcyB2YWx1ZXMAdG9vIG1hbnkgY2FwdHVyZXMAY29yZSBhbmQgbGlicmFyeSBoYXZlIGluY29tcGF0aWJsZSBudW1lcmljIHR5cGVzAGNodW5rIGhhcyB0b28gbWFueSBsaW5lcwBsb2NhbCB2YXJpYWJsZXMAb3Bjb2RlcwB0aW1lIG91dC1vZi1ib3VuZHMAZmluYWwgcG9zaXRpb24gb3V0IG9mIGJvdW5kcwBpbml0aWFsIHBvc2l0aW9uIG91dCBvZiBib3VuZHMAX2xpYnMAYWJzAGF0dGVtcHQgdG8gJXMgYSAlcyB2YWx1ZSVzAEAlcwAlcyBleHBlY3RlZCwgZ290ICVzAGNhbm5vdCAlcyAlcwAlcyBuZWFyICVzAHRvbyBtYW55ICVzIChsaW1pdCBpcyAlZCkgaW4gJXMAYXR0ZW1wdCB0byBjb21wYXJlICVzIHdpdGggJXMAY2Fubm90ICVzICVzOiAlcwBDQUxMRVJfUlVOX0ZBSUwgJXM6ICVzAExJQl9SVU5fRkFJTCAlczogJXMAQ0FMTEVSX0xPQURfRkFJTCAlczogJXMASU5JVF9DWFhFWCBzdGFnZT0lZDogJXMAJXM6JWQ6ICVzAENBTExFUl9DWFhFWDogJXMARVJSOiAlcwBob3VyAF9fYnhvcgBmb3IgaXRlcmF0b3IAc3ludGF4IGVycm9yAGZsb29yAGZvcgBfX2JvcgBfX3NocgBsb3dlcgBpbnZhbGlkIGxvbmcgc3RyaW5nIGRlbGltaXRlcgB1cHBlcgBjYWxsZXIAbWF4aW50ZWdlcgB0b2ludGVnZXIAbWluaW50ZWdlcgBvYmplY3QgbGVuZ3RoIGlzIG5vdCBhbiBpbnRlZ2VyAGZpZWxkICclcycgaXMgbm90IGFuIGludGVnZXIAbHVhX0ludGVnZXIAJWQtYnl0ZSBpbnRlZ2VyIGRvZXMgbm90IGZpdCBpbnRvIEx1YSBJbnRlZ2VyAHRvbnVtYmVyAG1hbGZvcm1lZCBudW1iZXIAbHVhX051bWJlcgBjaGFyAHllYXIAX19lcQBfX2RicQBleHAAc3RvcAAnX19uZXdpbmRleCcgY2hhaW4gdG9vIGxvbmc7IHBvc3NpYmxlIGxvb3AAJ19faW5kZXgnIGNoYWluIHRvbyBsb25nOyBwb3NzaWJsZSBsb29wAGR1bXAAc3RlcAByZXAAUHAAJXM6ICVwAHByb3RvAGdvdG8AYXR0ZW1wdCB0byBkaXZpZGUgYnkgemVybwAnZm9yJyBzdGVwIGlzIHplcm8AZG8AcmV0dXJuAGNoYXJwYXR0ZXJuAG1pc3NpbmcgJ1snIGFmdGVyICclJWYnIGluIHBhdHRlcm4Ad2FybgBqc29uAHRlcm1pbmF0ZV9oYW5kbGVyIHVuZXhwZWN0ZWRseSB0aHJldyBhbiBleGNlcHRpb24ASW5zdHJ1Y3Rpb24AbWFpbiBmdW5jdGlvbgB1bmFibGUgdG8gZHVtcCBnaXZlbiBmdW5jdGlvbgBjYW5ub3QgdXNlICcuLi4nIG91dHNpZGUgYSB2YXJhcmcgZnVuY3Rpb24AbnVtYmVyJXMgaGFzIG5vIGludGVnZXIgcmVwcmVzZW50YXRpb24AbnVtYmVyIGhhcyBubyBpbnRlZ2VyIHJlcHJlc2VudGF0aW9uAGRhdGUgcmVzdWx0IGNhbm5vdCBiZSByZXByZXNlbnRlZCBpbiB0aGlzIGluc3RhbGxhdGlvbgB0aW1lIHJlc3VsdCBjYW5ub3QgYmUgcmVwcmVzZW50ZWQgaW4gdGhpcyBpbnN0YWxsYXRpb24AcGVyZm9ybSBiaXR3aXNlIG9wZXJhdGlvbiBvbgBwZXJmb3JtIGFyaXRobWV0aWMgb24AYXNpbgBtaW4APXN0ZGluAG1haW4AcmVvcGVuAHJhd2xlbgBfX2xlbgB0aGVuAGF0YW4AbmFuAGJvb2xlYW4AdmFsdWUgaGFzIG5vIGxpdGVyYWwgZm9ybQByYW5kb20AX191bm0Ac2V0c3RlcG11bABfX211bAAtLSBldGwubHVhOiBFVEwg5rWB56iL5bGC4oCU4oCU5a6h6K6hIC8g5bmC562JIC8g6Ieq5oSIIC8g57uE5Lu25YyWIC8gUGlwZWxpbmUg5byV5pOO77yIMjAyNi0wOC0xOe+8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0g6ZyA6KaB5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJrlrZjlgqjov4fnqIvlm57mn6Xkvp3otZYgX2R1Y2tkYl9jYWxsIC8gX2R1Y2tkYl9xdWVyeQotLQotLSDkvb/nlKjvvIhpbnN0YWxsIOWQju+8ie+8mgotLSAgIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdpbnN0YWxsJywgc3FsX25hbWUgOj0gJ2V0bCcpOwotLSAgIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdjb21waWxlJywgc3FsX25hbWUgOj0gJ2V0bF9ydW5fZGVtbycsCi0tICAgICBzb3VyY2UgOj0gJ3JldHVybiBmdW5jdGlvbih4KSByZXR1cm4gZXRsLnJ1bigiZGVtbyIsIHgpIGVuZCcpOwotLQotLSDkupTlpKfog73lipvvvJoKLS0gICBQMCBldGwubG9nIC8gZXRsLnJ1biAgICAgICAg4oCU4oCUIOWuoeiuoe+8muiHquWKqOW7uiBldGxfcnVuX2xvZyDooajvvIzmr4/mrKHov5DooYzorrAgKHRzLCBmbiwgYXJncywgZHVyYXRpb25fbXMsIHJvd3MsIHN1Y2Nlc3MsIGVycikKLS0gICBQMSBldGwudmFsaWRhdGUgICAgICAgICAgICAg4oCU4oCUIOW5guetieWPjOajgO+8mnRocm93X2lmX2VtcHR577yI5rqQ56m65YiZ5aSx6LSl77yJLyB0aHJvd19pZl9ub3RfZW1wdHnvvIjnm67moIflt7LmnInliJnlpLHotKXpmLLph43vvIkKLS0gICBQMSBldGwuc2FmZSAvIGluc2VydF9hdXRvICAg4oCU4oCUIOmUmeivr+ato+WImeiHquaEiO+8mnBjYWxsICsgZXJyOm1hdGNoKHBhdHRlcm4pIOKGkiDlm57pgIDlh73mlbAg4oaSIOmHjeivlQotLSAgIFAyIGV0bC5xIC8gcXVlcnkgLyBleGVjICAgICDigJTigJQgcXVlcnktZG9jIOe7hOS7tuWMlu+8mkNURS9zZWxlY3QvZnJvbS9qb2luL3doZXJlL2dyb3VwL29yZGVyL2hhdmluZyDliqjmgIHmi7wgU1FMCi0tICAgUDMgZXRsLnBpcGVsaW5lIC8gY29tcGlsZSAgIOKAlOKAlCBQaXBlbGluZSDlvJXmk47vvJpQaXBlbGluZSBKU09OIOKGkiDmi5PmiZHmjpLluo8g4oaSIOe8luivkSDihpIg5omn6KGMICsg6YCQ6IqC54K55a6h6K6hCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg6IqC54K557G75Z6LOiBzb3VyY2Uo5bu65Li05pe26KGoKSAvIHRyYW5zZm9ybShTUUwpIC8gdHJhbnNmb3JtX2x1YShMdWHpl63ljIXooYzlpITnkIYpCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1YWxpdHko5pWw5o2u6LSo6YeP5qOA5p+lKSAvIHNpbmso6JC96KGoKQotLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZl9ub2RlKOadoeS7tui3r+eUsSkgLyBzd2l0Y2hfbm9kZSjlpJrot6/ot6/nlLEpCi0tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg6Lev55SxOiDkuIvmuLjoioLngrkgcm91dGU9InRydWUiLyJmYWxzZSIg5Yy56YWNIGlmX25vZGUg5p2h5Lu2IOKGkiDkuI3ljLnphY3nmoTmlK/ot6/ot7Pov4cKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoX25vZGUg55qEIHNlbGVjdG9yIOi/lOWbniBzdHJpbmcg4oaSIOS4i+a4uCByb3V0ZSDljLnphY3miY3miafooYwKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDph43or5U6IOiKgueCuemFjee9riByZXRyeT17bWF4PTMsIGJhY2tvZmY9MS4wfSDihpIg5oyH5pWw6YCA6YG/IGJhY2tvZmbDlzJeKG4tMSkKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDotoXml7Y6IOiKgueCuemFjee9riB0aW1lb3V0PTYwIOKGkiDotoXml7blkI7kuK3mraLvvIjlkKvph43or5XmgLvml7bpl7TvvIkKLS0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDplJnor6/mgaLlpI06IOiKgueCuemFjee9riBvbl9lcnJvcj0iaGFuZGxlcl9pZCIg4oaSIOWksei0peaXtuS4jeS4reatou+8jOi/kOihjCBoYW5kbGVyIOWQjue7p+e7rQotLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOaVsOaNrui0qOmHj+ajgOafpTogbm90X251bGwgLyB1bmlxdWUgLyByb3djb3VudF9taW4gLyByb3djb3VudF9tYXggLyBzY2hlbWEKCmxvY2FsIGV0bCA9IHt9CgotLSA9PT09PT09PT09PT0g5YaF6YOo5bel5YW3ID09PT09PT09PT09PQoKbG9jYWwgZnVuY3Rpb24gZXNjKHYpCiAgLS0gU1FMIOWtl+espuS4sui9rOS5ie+8iEx1YSDljZXlvJXlj7cg4oaSIFNRTCDlj4zljZXlvJXlj7fvvIkKICBpZiB0eXBlKHYpID09ICJzdHJpbmciIHRoZW4KICAgIHJldHVybiAiJyIgLi4gdjpnc3ViKCInIiwgIicnIikgLi4gIiciCiAgZW5kCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gIk5VTEwiIGVuZAogIHJldHVybiB0b3N0cmluZyh2KQplbmQKCi0tIOe5geW/meetieW+he+8iOenku+8jEx1YUpJVCDlhoXml6Dlj6/np7vmpI0gc2xlZXDvvIznlKggYnVzeS1sb29wIOabv+S7o++8iQpsb2NhbCBmdW5jdGlvbiBidXN5X3NsZWVwKHNlYykKICBsb2NhbCB0MCA9IG9zLmNsb2NrKCkKICB3aGlsZSBvcy5jbG9jaygpIC0gdDAgPCBzZWMgZG8gZW5kCmVuZAoKLS0gPT09PT09PT09PT09IFAwOiDlrqHorqEgPT09PT09PT09PT09CgpldGwubG9nX3RhYmxlID0gImV0bF9ydW5fbG9nIgoKLS0g5Yid5aeL5YyW5a6h6K6h6KGo77yI5bmC562J77yJCmZ1bmN0aW9uIGV0bC5pbml0KCkKICBfZHVja2RiX2NhbGwoIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICIgLi4gZXRsLmxvZ190YWJsZSAuLiAiICgiCiAgICAuLiAicnVuX2lkIEJJR0lOVCwgdHMgVElNRVNUQU1QLCBmbiBWQVJDSEFSLCBhcmdzIFZBUkNIQVIsICIKICAgIC4uICJkdXJhdGlvbl9tcyBCSUdJTlQsIHJvd3MgQklHSU5ULCBzdWNjZXNzIEJPT0xFQU4sIGVyciBWQVJDSEFSKSIpCmVuZAoKLS0g5YaZ5LiA5p2h5a6h6K6h6K6w5b2VCmZ1bmN0aW9uIGV0bC5sb2cocnVuX2lkLCBmbiwgYXJncywgZHVyYXRpb25fbXMsIHJvd3MsIHN1Y2Nlc3MsIGVycikKICBldGwuaW5pdCgpCiAgbG9jYWwgc3FsID0gIklOU0VSVCBJTlRPICIgLi4gZXRsLmxvZ190YWJsZSAuLiAiIFZBTFVFUyAoIgogICAgLi4gZXNjKHJ1bl9pZCkgLi4gIiwgbm93KCksICIgLi4gZXNjKGZuKSAuLiAiLCAiIC4uIGVzYyhhcmdzKSAuLiAiLCAiCiAgICAuLiBlc2MoZHVyYXRpb25fbXMpIC4uICIsICIgLi4gZXNjKHJvd3MpIC4uICIsICIgLi4gKHN1Y2Nlc3MgYW5kICJ0cnVlIiBvciAiZmFsc2UiKSAuLiAiLCAiIC4uIGVzYyhlcnIpIC4uICIpIgogIHJldHVybiBfZHVja2RiX2NhbGwoc3FsKQplbmQKCi0tIOWMheijheaJp+ihjO+8muiuoeaXtiArIOWuoeiuoSArIOmUmeivr+aNleiOtwotLSDnlKjms5XvvJpldGwucnVuKGZuX25hbWUsIGFyZ3NfanNvbiwgZm4sIC4uLikgIGZuIOaYr+WPryBwY2FsbCDnmoQgTHVhIOWHveaVsApmdW5jdGlvbiBldGwucnVuKGZuX25hbWUsIGFyZ3NfanNvbiwgZm4sIC4uLikKICBsb2NhbCB0MCA9IG9zLmNsb2NrKCkKICBsb2NhbCBvaywgcmVzID0gcGNhbGwoZm4sIC4uLikKICBsb2NhbCBkdCA9IG1hdGguZmxvb3IoKG9zLmNsb2NrKCkgLSB0MCkgKiAxMDAwKQogIGlmIG9rIHRoZW4KICAgIGxvY2FsIHJvd3MgPSAwCiAgICBpZiB0eXBlKHJlcykgPT0gInRhYmxlIiB0aGVuIHJvd3MgPSAjcmVzIGVuZAogICAgZXRsLmxvZygwLCBmbl9uYW1lLCBhcmdzX2pzb24sIGR0LCByb3dzLCB0cnVlLCBuaWwpCiAgICByZXR1cm4gcmVzCiAgZWxzZQogICAgZXRsLmxvZygwLCBmbl9uYW1lLCBhcmdzX2pzb24sIGR0LCAwLCBmYWxzZSwgdG9zdHJpbmcocmVzKSkKICAgIGVycm9yKHJlcywgMCkKICBlbmQKZW5kCgotLSDor7vmnIDov5HlrqHorqHorrDlvZUKZnVuY3Rpb24gZXRsLmxvZ3MobikKICBuID0gbiBvciAxMAogIHJldHVybiBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgQ0FTVChydW5faWQgQVMgQklHSU5UKSBBUyBydW5faWQsIHRzLCBmbiwgYXJncywgIgogICAgLi4gIkNBU1QoZHVyYXRpb25fbXMgQVMgQklHSU5UKSBBUyBkdXJhdGlvbl9tcywgQ0FTVChyb3dzIEFTIEJJR0lOVCkgQVMgcm93cywgc3VjY2VzcywgZXJyICIKICAgIC4uICJGUk9NICIgLi4gZXRsLmxvZ190YWJsZSAuLiAiIE9SREVSIEJZIHRzIERFU0MgTElNSVQgIiAuLiB0b3N0cmluZyhuKSkKZW5kCgotLSA9PT09PT09PT09PT0gUDE6IOW5guetieWPjOajgCA9PT09PT09PT09PT0KCi0tIOagoemqjOihqOihjOaVsOe6puadn++8iEVUTFggbG9hZF92YWxpZGF0aW9u77yJCi0tIOaooeW8j++8mnRocm93X2lmX2VtcHR577yI6KGo56m65YiZ5aSx6LSl77yJLyB0aHJvd19pZl9ub3RfZW1wdHnvvIjooajpnZ7nqbrliJnlpLHotKXvvIzpmLLph43vvIkKZnVuY3Rpb24gZXRsLnZhbGlkYXRlKHRibCwgbW9kZSwgbWluX3Jvd3MpCiAgbG9jYWwgcm93cywgZXJyID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gIiAuLiB0YmwpCiAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcigidmFsaWRhdGU6ICIgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKHJvd3NbMV0ubikgb3IgMAogIGlmIG1vZGUgPT0gInRocm93X2lmX2VtcHR5IiB0aGVuCiAgICBpZiBuID09IDAgdGhlbiBlcnJvcigidmFsaWRhdGU6IHRhYmxlICIgLi4gdGJsIC4uICIgaXMgZW1wdHkgKGV4cGVjdGVkIHJvd3MgPiAwKSIsIDApIGVuZAogIGVsc2VpZiBtb2RlID09ICJ0aHJvd19pZl9ub3RfZW1wdHkiIHRoZW4KICAgIGlmIG4gPiAwIHRoZW4gZXJyb3IoInZhbGlkYXRlOiB0YWJsZSAiIC4uIHRibCAuLiAiIGFscmVhZHkgaGFzICIgLi4gbiAuLiAiIHJvd3MgKGxvYWQgdHdpY2U/KSIsIDApIGVuZAogIGVsc2VpZiBtb2RlID09ICJ0aHJvd19pZl9sdCIgdGhlbgogICAgaWYgbiA8IChtaW5fcm93cyBvciAxKSB0aGVuCiAgICAgIGVycm9yKCJ2YWxpZGF0ZTogdGFibGUgIiAuLiB0YmwgLi4gIiBoYXMgIiAuLiBuIC4uICIgcm93cyAoZXhwZWN0ZWQgPj0gIiAuLiB0b3N0cmluZyhtaW5fcm93cykgLi4gIikiLCAwKQogICAgZW5kCiAgZWxzZQogICAgZXJyb3IoInZhbGlkYXRlOiB1bmtub3duIG1vZGUgIiAuLiB0b3N0cmluZyhtb2RlKSwgMCkKICBlbmQKICByZXR1cm4gbgplbmQKCi0tID09PT09PT09PT09PSBQMTog6ZSZ6K+v5q2j5YiZ6Ieq5oSIID09PT09PT09PT09PQoKLS0g5omn6KGMIGZu77yM6Iul5aSx6LSl77yI5oqb6ZSZIOaIliBfZHVja2RiX2NhbGwg6L+U5ZueICJlcnJvcjogLi4uIu+8ieS4lOmUmeivr+WMuemFjSBwYXR0ZXJu77yMCi0tIOWImeaJp+ihjCBmYWxsYmFjayDlkI7ph43or5XkuIDmrKHvvIhFVExYIGxvYWRfb25fZXJyX21hdGNo77yJCi0tIOeUqOazle+8mmV0bC5zYWZlKGZuLCAiZG9lcyBub3QgZXhpc3QiLCBmdW5jdGlvbigpIGNyZWF0ZV90YWJsZSgpIGVuZCkKZnVuY3Rpb24gZXRsLnNhZmUoZm4sIHBhdHRlcm4sIGZhbGxiYWNrKQogIGxvY2FsIG9rLCByZXMgPSBwY2FsbChmbikKICAtLSBfZHVja2RiX2NhbGwg5LiN5oqbIEx1YSBlcnJvcu+8jOWksei0peaXtui/lOWbniAiZXJyb3I6IDxtc2c+IiDlrZfnrKbkuLLigJTigJTkuKTnp43mg4XlhrXpg73nrpflpLHotKUKICBpZiBvayBhbmQgdHlwZShyZXMpID09ICJzdHJpbmciIGFuZCByZXM6bWF0Y2goIl5lcnJvcjoiKSB0aGVuCiAgICBvayA9IGZhbHNlCiAgICByZXMgPSByZXM6c3ViKDcpICAtLSDljrvmjokgImVycm9yOiAiIOWJjee8gAogIGVuZAogIGlmIG9rIHRoZW4gcmV0dXJuIHJlcyBlbmQKICBsb2NhbCBlcnJtc2cgPSB0b3N0cmluZyhyZXMpCiAgaWYgcGF0dGVybiBhbmQgZXJybXNnOm1hdGNoKHBhdHRlcm4pIHRoZW4KICAgIGlmIGZhbGxiYWNrIHRoZW4KICAgICAgbG9jYWwgZm9rLCBmZXJyID0gcGNhbGwoZmFsbGJhY2spCiAgICAgIGlmIG5vdCBmb2sgdGhlbiBlcnJvcigic2FmZTogZmFsbGJhY2sgZmFpbGVkOiAiIC4uIHRvc3RyaW5nKGZlcnIpLCAwKSBlbmQKICAgIGVuZAogICAgLS0g6YeN6K+V5LiA5qyhCiAgICBsb2NhbCBvazIsIHJlczIgPSBwY2FsbChmbikKICAgIGlmIG9rMiBhbmQgdHlwZShyZXMyKSA9PSAic3RyaW5nIiBhbmQgcmVzMjptYXRjaCgiXmVycm9yOiIpIHRoZW4KICAgICAgb2syID0gZmFsc2UKICAgICAgcmVzMiA9IHJlczI6c3ViKDcpCiAgICBlbmQKICAgIGlmIG5vdCBvazIgdGhlbiBlcnJvcigic2FmZTogcmV0cnkgZmFpbGVkOiAiIC4uIHRvc3RyaW5nKHJlczIpLCAwKSBlbmQKICAgIHJldHVybiByZXMyCiAgZW5kCiAgZXJyb3IoZXJybXNnLCAwKQplbmQKCi0tIOW7uuihqOiHquaEiOWMheijhe+8muebruagh+ihqOS4jeWtmOWcqCDihpIg6Ieq5Yqo5bu66KGoIOKGkiDph43or5UgSU5TRVJUCi0tIOeUqOazle+8mmV0bC5pbnNlcnRfYXV0byh0YmwsIGRkbCwgc3FsKQpmdW5jdGlvbiBldGwuaW5zZXJ0X2F1dG8odGJsLCBkZGwsIHNxbCkKICByZXR1cm4gZXRsLnNhZmUoCiAgICBmdW5jdGlvbigpIHJldHVybiBfZHVja2RiX2NhbGwoc3FsKSBlbmQsCiAgICAiZG9lcyBub3QgZXhpc3QiLAogICAgZnVuY3Rpb24oKSByZXR1cm4gX2R1Y2tkYl9jYWxsKGRkbCkgZW5kKQplbmQKCi0tID09PT09PT09PT09PSBQMjogcXVlcnktZG9jIOe7hOS7tuWMliA9PT09PT09PT09PT0KCi0tIFNRTCDnu4Tku7bliqjmgIHmi7zmjqXvvIhFVExYIHF1ZXJ5LWRvYyAvIGRidCDlvI/nu4Tku7bvvIkKLS0g55So5rOV77yaCi0tICAgZXRsLnEoewotLSAgICAgc2VsZWN0ID0gImEuaWQsIGEubmFtZSwgYi50b3RhbCIsCi0tICAgICBmcm9tID0gInNyYy5vcmRlcnMgYSIsCi0tICAgICBqb2luID0gIkpPSU4gc3JjLmN1c3RvbWVycyBiIE9OIGEuY3VzdF9pZCA9IGIuaWQiLAotLSAgICAgd2hlcmUgPSAiYS5hbW91bnQgPiAxMDAiLAotLSAgICAgZ3JvdXBfYnkgPSAiYS5pZCwgYS5uYW1lIiwKLS0gICAgIG9yZGVyX2J5ID0gImIudG90YWwgREVTQyIsCi0tICAgICBsaW1pdCA9IDEwLAotLSAgIH0pCmZ1bmN0aW9uIGV0bC5xKHBhcnRzKQogIGxvY2FsIGNsYXVzZXMgPSB7CiAgICB7ICJXSVRIIiwgcGFydHMuY3RlIH0sCiAgICB7ICJTRUxFQ1QiLCBwYXJ0cy5zZWxlY3Qgb3IgIioiIH0sCiAgICB7ICJGUk9NIiwgcGFydHMuZnJvbSB9LAogICAgeyAiIiwgcGFydHMuam9pbiB9LAogICAgeyAiV0hFUkUiLCBwYXJ0cy53aGVyZSB9LAogICAgeyAiR1JPVVAgQlkiLCBwYXJ0cy5ncm91cF9ieSB9LAogICAgeyAiSEFWSU5HIiwgcGFydHMuaGF2aW5nIH0sCiAgICB7ICJPUkRFUiBCWSIsIHBhcnRzLm9yZGVyX2J5IH0sCiAgICB7ICJMSU1JVCIsIHBhcnRzLmxpbWl0IH0sCiAgfQogIGxvY2FsIG91dCA9IHt9CiAgZm9yIF8sIGNsIGluIGlwYWlycyhjbGF1c2VzKSBkbwogICAgaWYgY2xbMl0gfj0gbmlsIGFuZCBjbFsyXSB+PSAiIiB0aGVuCiAgICAgIG91dFsjb3V0ICsgMV0gPSAoY2xbMV0gfj0gIiIgYW5kIChjbFsxXSAuLiAiICIgLi4gY2xbMl0pIG9yIGNsWzJdKQogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHRhYmxlLmNvbmNhdChvdXQsICJcbiIpCmVuZAoKLS0g5omn6KGM57uE5Lu25YyW5p+l6K+i77yM6L+U5Zue6KGM6KGoCmZ1bmN0aW9uIGV0bC5xdWVyeShwYXJ0cykKICBsb2NhbCBzcWwgPSBldGwucShwYXJ0cykKICByZXR1cm4gX2R1Y2tkYl9xdWVyeShzcWwpCmVuZAoKLS0g57uE5Lu25YyWIERNTO+8iElOU0VSVCBJTlRPIC4uLiBTRUxFQ1QgLi4uIOeUsee7hOS7tueUn+aIkO+8iQotLSDlpLHotKXml7bmipsgTHVhIGVycm9y77yIX2R1Y2tkYl9jYWxsIOi/lOWbniAiZXJyb3I6IC4uLiIg5LiN5oqb6ZSZ77yM6L+Z6YeM57uf5LiA77yJCmZ1bmN0aW9uIGV0bC5leGVjKHBhcnRzKQogIGxvY2FsIHNxbCA9IGV0bC5xKHBhcnRzKQogIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoc3FsKQogIGlmIHR5cGUocikgPT0gInN0cmluZyIgYW5kIHI6bWF0Y2goIl5lcnJvcjoiKSB0aGVuCiAgICBlcnJvcihyOnN1Yig3KSwgMCkKICBlbmQKICByZXR1cm4gcgplbmQKCi0tID09PT09PT09PT09PSBQMzogUGlwZWxpbmUg5byV5pOOID09PT09PT09PT09PQoKLS0gUGlwZWxpbmUg57uT5p6E77yI5YmN56uv55S75biD5a+85Ye6IC8g5omL5YaZ77yJ77yaCi0tIHsKLS0gICBuYW1lID0gIm9yZGVyc19ldGwiLAotLSAgIG5vZGVzID0gewotLSAgICAgeyBpZCA9ICJzcmMiLCAgIHR5cGUgPSAic291cmNlIiwgICAgICAgcXVlcnkgPSAiU0VMRUNUICogRlJPTSByZWFkX2Nzdignb3JkZXJzLmNzdicpIiB9LAotLSAgICAgeyBpZCA9ICJjbGVhbiIsIHR5cGUgPSAidHJhbnNmb3JtIiwgICAgcXVlcnkgPSAiU0VMRUNUIGlkLCB1cHBlcihuYW1lKSBBUyBuYW1lLCBhbW91bnQgRlJPTSBzcmMgV0hFUkUgYW1vdW50ID4gMCIsCi0tICAgICAgIGRlcHMgPSB7ICJzcmMiIH0gfSwKLS0gICAgIHsgaWQgPSAiYXVkaXQiLCB0eXBlID0gInF1YWxpdHkiLCAgICAgIGNoZWNrcyA9IHsKLS0gICAgICAgICB7IHR5cGUgPSAibm90X251bGwiLCBjb2wgPSAiaWQiIH0sCi0tICAgICAgICAgeyB0eXBlID0gInVuaXF1ZSIsICAgY29sID0gImlkIiB9LAotLSAgICAgICAgIHsgdHlwZSA9ICJyb3djb3VudF9taW4iLCBtaW4gPSAxIH0sCi0tICAgICAgIH0sIGRlcHMgPSB7ICJjbGVhbiIgfSB9LAotLSAgICAgeyBpZCA9ICJoYXNfZGF0YSIsIHR5cGUgPSAiaWZfbm9kZSIsICAgZGVwcyA9IHsiYXVkaXQifSwKLS0gICAgICAgY29uZGl0aW9uID0gZnVuY3Rpb24oY3R4KSByZXR1cm4gY3R4LmF1ZGl0ID4gMCBlbmQgfSwKLS0gICAgIHsgaWQgPSAicHJvY2VzcyIsIHR5cGUgPSAidHJhbnNmb3JtIiwgIGRlcHMgPSB7Imhhc19kYXRhIn0sIHJvdXRlID0gInRydWUiLAotLSAgICAgICBxdWVyeSA9ICJTRUxFQ1QgKiBGUk9NIGNsZWFuIFdIRVJFIGFtb3VudCA+IDEwMCIgfSwKLS0gICAgIHsgaWQgPSAibG9nX2VtcHR5IiwgdHlwZSA9ICJzaW5rIiwgICAgIGRlcHMgPSB7Imhhc19kYXRhIn0sIHJvdXRlID0gImZhbHNlIiwKLS0gICAgICAgdGFibGUgPSAiZW1wdHlfbG9nIiB9LAotLSAgICAgeyBpZCA9ICJvdXQiLCAgIHR5cGUgPSAic2luayIsICAgICAgICAgdGFibGUgPSAib3JkZXJzX2NsZWFuIiwgZGVwcyA9IHsgInByb2Nlc3MiIH0sCi0tICAgICAgIHJldHJ5ID0geyBtYXggPSAyLCBiYWNrb2ZmID0gMS4wIH0sIHRpbWVvdXQgPSAxMjAgfSwKLS0gICAgIHsgaWQgPSAicmlza3kiLCB0eXBlID0gInRyYW5zZm9ybSIsICAgIGRlcHMgPSB7InNyYyJ9LAotLSAgICAgICBxdWVyeSA9ICJTRUxFQ1QgMS8wIiwgb25fZXJyb3IgPSAiZmFsbGJhY2siIH0sCi0tICAgICB7IGlkID0gImZhbGxiYWNrIiwgdHlwZSA9ICJ0cmFuc2Zvcm0iLCBkZXBzID0geyJzcmMifSwKLS0gICAgICAgcXVlcnkgPSAiU0VMRUNUIDAgQVMgcmVzdWx0IiB9LAotLSAgIH0sCi0tIH0KLS0g5omn6KGM6K+t5LmJ77yac291cmNlIOKGkiBDUkVBVEUgT1IgUkVQTEFDRSBURU1QIFRBQkxFIDxpZD4gQVMgPHF1ZXJ5PgotLSAgICAgICAgICAgdHJhbnNmb3JtIOKGkiBDUkVBVEUgT1IgUkVQTEFDRSBURU1QIFRBQkxFIDxpZD4gQVMgPHF1ZXJ5Pu+8iOW8leeUqOS4iua4uOS4tOaXtuihqO+8iQotLSAgICAgICAgICAgdHJhbnNmb3JtX2x1YSDihpIg6K+75LiK5ri46KGo6KGMIOKGkiBMdWEg6Zet5YyF6YCQ6KGM5aSE55CGIOKGkiDlhpnlm57kuLTml7booagKLS0gICAgICAgICAgIHF1YWxpdHkg4oaSIOWvueS4iua4uOihqOi3kSBjaGVja3PvvIzku7vkuIDlpLHotKXmipvplJkKLS0gICAgICAgICAgIHNpbmsg4oaSIENSRUFURSBPUiBSRVBMQUNFIFRBQkxFIDx0YWJsZT4gQVMgU0VMRUNUICogRlJPTSA85LiK5ri4PgotLSAgICAgICAgICAgaWZfbm9kZSDihpIg6K+E5LywIGNvbmRpdGlvbihjdHgp77yM6Lev55Sx5YiwICJ0cnVlIiDmiJYgImZhbHNlIiDliIbmlK8KLS0gICAgICAgICAgIHN3aXRjaF9ub2RlIOKGkiDor4TkvLAgc2VsZWN0b3IoY3R4Ke+8jOi3r+eUseWIsOWvueW6lCBjYXNlIOWIhuaUrwotLSAgICAgICAgICAg6Lev55Sx77ya5LiL5ri46IqC54K5IHJvdXRlPSJYIiDljLnphY0gaWZfbm9kZS9zd2l0Y2hfbm9kZSDnu5PmnpzmiY3miafooYzvvIzkuI3ljLnphY3ot7Pov4fvvIjkuI3miqXplJnvvIkKLS0gICAgICAgICAgIOmHjeivle+8mnJldHJ5Lm1heCDmrKHph43or5XvvIzpgIDpgb8gcmV0cnkuYmFja29mZiDDlyAyXihuLTEpIOenkgotLSAgICAgICAgICAg6LaF5pe277yadGltZW91dCDnp5LlhoXlv4XpobvlrozmiJDvvIjlkKvph43or5XmgLvml7bpl7TvvInvvIzotoXml7botbDlpLHotKXpgLvovpEKLS0gICAgICAgICAgIOmUmeivr+aBouWkje+8mm9uX2Vycm9yIOiuviBoYW5kbGVyX2lk77yM5aSx6LSl5pe25LiN5Lit5q2i77yMaGFuZGxlciDlnKjmi5PmiZHkuK3mraPluLjmiafooYwKLS0g5q+P6IqC54K55omn6KGM6K6w5LiA5p2h5a6h6K6h77yIZXRsX3J1bl9sb2fvvInvvIzlpLHotKXljbPkuK3mraLvvIjpmaTpnZ7orr4gb25fZXJyb3LvvInjgIIKCi0tIOWGhemDqO+8muaJp+ihjOS4gOS4qiBxdWFsaXR5IOajgOafpe+8jOWksei0peaKm+mUmQpsb2NhbCBmdW5jdGlvbiBydW5fY2hlY2sodGJsLCBjaGVjaykKICBsb2NhbCB0ID0gY2hlY2sudHlwZQogIGlmIHQgPT0gIm5vdF9udWxsIiB0aGVuCiAgICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgQ0FTVChjb3VudCgqKSBBUyBCSUdJTlQpIEFTIG4gRlJPTSAiIC4uIHRibCAuLiAiIFdIRVJFICIgLi4gY2hlY2suY29sIC4uICIgSVMgTlVMTCIpCiAgICBpZiBub3Qgcm93cyB0aGVuIGVycm9yKCJxdWFsaXR5OiAiIC4uIHRvc3RyaW5nKGVyciksIDApIGVuZAogICAgbG9jYWwgbiA9IHRvbnVtYmVyKHJvd3NbMV0ubikgb3IgMAogICAgaWYgbiA+IDAgdGhlbiBlcnJvcigicXVhbGl0eVsiIC4uIHRibCAuLiAiXTogbm90X251bGwoIiAuLiBjaGVjay5jb2wgLi4gIikgZmFpbGVkOiAiIC4uIG4gLi4gIiBOVUxMIHZhbHVlcyIsIDApIGVuZAogIGVsc2VpZiB0ID09ICJ1bmlxdWUiIHRoZW4KICAgIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgdG90YWwsIENBU1QoY291bnQoRElTVElOQ1QgIiAuLiBjaGVjay5jb2wgLi4gIikgQVMgQklHSU5UKSBBUyBkaXN0aW5jdF9uIEZST00gIiAuLiB0YmwpCiAgICBpZiBub3Qgcm93cyB0aGVuIGVycm9yKCJxdWFsaXR5OiAiIC4uIHRvc3RyaW5nKGVyciksIDApIGVuZAogICAgaWYgdG9udW1iZXIocm93c1sxXS50b3RhbCkgfj0gdG9udW1iZXIocm93c1sxXS5kaXN0aW5jdF9uKSB0aGVuCiAgICAgIGVycm9yKCJxdWFsaXR5WyIgLi4gdGJsIC4uICJdOiB1bmlxdWUoIiAuLiBjaGVjay5jb2wgLi4gIikgZmFpbGVkOiB0b3RhbD0iIC4uIHRvc3RyaW5nKHJvd3NbMV0udG90YWwpIC4uICIgZGlzdGluY3Q9IiAuLiB0b3N0cmluZyhyb3dzWzFdLmRpc3RpbmN0X24pLCAwKQogICAgZW5kCiAgZWxzZWlmIHQgPT0gInJvd2NvdW50X21pbiIgdGhlbgogICAgbG9jYWwgcm93cywgZXJyID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gIiAuLiB0YmwpCiAgICBpZiBub3Qgcm93cyB0aGVuIGVycm9yKCJxdWFsaXR5OiAiIC4uIHRvc3RyaW5nKGVyciksIDApIGVuZAogICAgbG9jYWwgbiA9IHRvbnVtYmVyKHJvd3NbMV0ubikgb3IgMAogICAgaWYgbiA8IChjaGVjay5taW4gb3IgMSkgdGhlbiBlcnJvcigicXVhbGl0eVsiIC4uIHRibCAuLiAiXTogcm93Y291bnRfbWluIGZhaWxlZDogIiAuLiBuIC4uICIgPCAiIC4uIHRvc3RyaW5nKGNoZWNrLm1pbiksIDApIGVuZAogIGVsc2VpZiB0ID09ICJyb3djb3VudF9tYXgiIHRoZW4KICAgIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgbiBGUk9NICIgLi4gdGJsKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcigicXVhbGl0eTogIiAuLiB0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIGxvY2FsIG4gPSB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICAgIGlmIG4gPiAoY2hlY2subWF4IG9yIDApIHRoZW4gZXJyb3IoInF1YWxpdHlbIiAuLiB0YmwgLi4gIl06IHJvd2NvdW50X21heCBmYWlsZWQ6ICIgLi4gbiAuLiAiID4gIiAuLiB0b3N0cmluZyhjaGVjay5tYXgpLCAwKSBlbmQKICBlbHNlaWYgdCA9PSAic2NoZW1hIiB0aGVuCiAgICAtLSBjaGVjay5jb2xzID0geyAiaWQiLCAibmFtZSIgfSDigJTigJQg6KGo5b+F6aG75YyF5ZCr6L+Z5Lqb5YiXCiAgICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgY29sdW1uX25hbWUgRlJPTSBpbmZvcm1hdGlvbl9zY2hlbWEuY29sdW1ucyBXSEVSRSB0YWJsZV9uYW1lID0gJyIgLi4gdGJsIC4uICInIikKICAgIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IoInF1YWxpdHk6ICIgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgICBsb2NhbCBoYXZlID0ge30KICAgIGZvciBfLCByIGluIGlwYWlycyhyb3dzKSBkbyBoYXZlW3IuY29sdW1uX25hbWVdID0gdHJ1ZSBlbmQKICAgIGZvciBfLCBjb2wgaW4gaXBhaXJzKGNoZWNrLmNvbHMgb3Ige30pIGRvCiAgICAgIGlmIG5vdCBoYXZlW2NvbF0gdGhlbiBlcnJvcigicXVhbGl0eVsiIC4uIHRibCAuLiAiXTogc2NoZW1hIGZhaWxlZDogbWlzc2luZyBjb2x1bW4gIiAuLiB0b3N0cmluZyhjb2wpLCAwKSBlbmQKICAgIGVuZAogIGVsc2UKICAgIGVycm9yKCJxdWFsaXR5OiB1bmtub3duIGNoZWNrIHR5cGUgIiAuLiB0b3N0cmluZyh0KSwgMCkKICBlbmQKZW5kCgotLSDmi5PmiZHmjpLluo/vvIhLYWhu77yJ77ya6L+U5Zue6IqC54K55omn6KGM6aG65bqP77yM5pyJ546v5oqb6ZSZCmxvY2FsIGZ1bmN0aW9uIHRvcG9fc29ydChub2RlcykKICBsb2NhbCBieV9pZCA9IHt9CiAgZm9yIF8sIG4gaW4gaXBhaXJzKG5vZGVzKSBkbyBieV9pZFtuLmlkXSA9IG4gZW5kCiAgbG9jYWwgaW5kZWcgPSB7fQogIGxvY2FsIGFkaiA9IHt9CiAgZm9yIF8sIG4gaW4gaXBhaXJzKG5vZGVzKSBkbwogICAgaW5kZWdbbi5pZF0gPSAwCiAgICBhZGpbbi5pZF0gPSB7fQogIGVuZAogIGZvciBfLCBuIGluIGlwYWlycyhub2RlcykgZG8KICAgIGZvciBfLCBkIGluIGlwYWlycyhuLmRlcHMgb3Ige30pIGRvCiAgICAgIGlmIG5vdCBieV9pZFtkXSB0aGVuIGVycm9yKCJwaXBlbGluZTogZGVwICciIC4uIGQgLi4gIicgbm90IGZvdW5kIChub2RlICIgLi4gbi5pZCAuLiAiKSIsIDApIGVuZAogICAgICBpbmRlZ1tuLmlkXSA9IGluZGVnW24uaWRdICsgMQogICAgICBhZGpbZF1bI2FkaltkXSArIDFdID0gbi5pZAogICAgZW5kCiAgZW5kCiAgbG9jYWwgcXVldWUsIG9yZGVyID0ge30sIHt9CiAgZm9yIF8sIG4gaW4gaXBhaXJzKG5vZGVzKSBkbwogICAgaWYgaW5kZWdbbi5pZF0gPT0gMCB0aGVuIHF1ZXVlWyNxdWV1ZSArIDFdID0gbi5pZCBlbmQKICBlbmQKICB3aGlsZSAjcXVldWUgPiAwIGRvCiAgICBsb2NhbCBpZCA9IHRhYmxlLnJlbW92ZShxdWV1ZSwgMSkKICAgIG9yZGVyWyNvcmRlciArIDFdID0gaWQKICAgIGZvciBfLCBtIGluIGlwYWlycyhhZGpbaWRdKSBkbwogICAgICBpbmRlZ1ttXSA9IGluZGVnW21dIC0gMQogICAgICBpZiBpbmRlZ1ttXSA9PSAwIHRoZW4gcXVldWVbI3F1ZXVlICsgMV0gPSBtIGVuZAogICAgZW5kCiAgZW5kCiAgaWYgI29yZGVyIH49ICNub2RlcyB0aGVuIGVycm9yKCJwaXBlbGluZTogY3ljbGljIGRlcGVuZGVuY3kgZGV0ZWN0ZWQiLCAwKSBlbmQKICByZXR1cm4gb3JkZXIKZW5kCgotLSDnvJbor5EgUGlwZWxpbmXvvJrmoKHpqoznu5PmnoQgKyDmi5PmiZHmjpLluo/vvIzov5Tlm57lj6/miafooYzpl63ljIUKZnVuY3Rpb24gZXRsLmNvbXBpbGUocCkKICBpZiB0eXBlKHApIH49ICJ0YWJsZSIgb3Igbm90IHAubm9kZXMgb3IgI3Aubm9kZXMgPT0gMCB0aGVuCiAgICBlcnJvcigicGlwZWxpbmU6IGV4cGVjdGVkIHsgbmFtZT0uLi4sIG5vZGVzPXsuLi59IH0iLCAwKQogIGVuZAogIGxvY2FsIG9yZGVyID0gdG9wb19zb3J0KHAubm9kZXMpCiAgbG9jYWwgYnlfaWQgPSB7fQogIGZvciBfLCBuIGluIGlwYWlycyhwLm5vZGVzKSBkbyBieV9pZFtuLmlkXSA9IG4gZW5kCiAgLS0g5qCh6aqM77yacm91dGUg6IqC54K55b+F6aG75pyJIGRlcHMKICBmb3IgXywgbiBpbiBpcGFpcnMocC5ub2RlcykgZG8KICAgIGlmIG4ucm91dGUgYW5kIChub3Qgbi5kZXBzIG9yICNuLmRlcHMgPT0gMCkgdGhlbgogICAgICBlcnJvcigicGlwZWxpbmU6IG5vZGUgJyIgLi4gbi5pZCAuLiAiJyBoYXMgcm91dGUgYnV0IG5vIGRlcHMiLCAwKQogICAgZW5kCiAgICBpZiBuLm9uX2Vycm9yIGFuZCBub3QgYnlfaWRbbi5vbl9lcnJvcl0gdGhlbgogICAgICBlcnJvcigicGlwZWxpbmU6IG5vZGUgJyIgLi4gbi5pZCAuLiAiJyBvbl9lcnJvciB0YXJnZXQgJyIgLi4gbi5vbl9lcnJvciAuLiAiJyBub3QgZm91bmQiLCAwKQogICAgZW5kCiAgZW5kCiAgbG9jYWwgY29tcGlsZWQgPSB7IG5hbWUgPSBwLm5hbWUgb3IgInVubmFtZWQiLCBvcmRlciA9IG9yZGVyLCBub2RlcyA9IGJ5X2lkIH0KICByZXR1cm4gY29tcGlsZWQKZW5kCgotLSDmiafooYzljZXkuKroioLngrnvvIhwaXBlbGluZSDlhoXpg6jkvb/nlKjvvIkKLS0g6L+U5Zue5b2x5ZON6KGM5pWw77yI5oiWIG5pbO+8iQpmdW5jdGlvbiBldGwucnVuX25vZGUobiwgcmVzdWx0cykKICBsb2NhbCB0eXAgPSBuLnR5cGUKICBpZiB0eXAgPT0gInNvdXJjZSIgb3IgdHlwID09ICJ0cmFuc2Zvcm0iIHRoZW4KICAgIC0tIENSRUFURSBPUiBSRVBMQUNFIFRFTVAgVEFCTEUgPGlkPiBBUyA8cXVlcnk+CiAgICBsb2NhbCBzcWwgPSAiQ1JFQVRFIE9SIFJFUExBQ0UgVEVNUCBUQUJMRSAiIC4uIG4uaWQgLi4gIiBBUyAiIC4uIG4ucXVlcnkKICAgIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoc3FsKQogICAgaWYgdHlwZShyKSA9PSAic3RyaW5nIiBhbmQgcjptYXRjaCgiXmVycm9yOiIpIHRoZW4gZXJyb3IocjpzdWIoNyksIDApIGVuZAogICAgbG9jYWwgcm93cywgZXJyID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gIiAuLiBuLmlkKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcih0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIHJldHVybiB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICBlbHNlaWYgdHlwID09ICJ0cmFuc2Zvcm1fbHVhIiB0aGVuCiAgICAtLSDor7vkuIrmuLjooajvvIhuLnNvdXJjZSDmiJbnrKzkuIDkuKogZGVw77yJ4oaSIEx1YSDpl63ljIXpgJDooYzlpITnkIYg4oaSIOWGmeWbngogICAgbG9jYWwgc3JjID0gbi5zb3VyY2Ugb3IgKG4uZGVwcyBhbmQgbi5kZXBzWzFdKSBvciBlcnJvcigidHJhbnNmb3JtX2x1YTogbm8gc291cmNlIiwgMCkKICAgIGxvY2FsIGRhdGEsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCAqIEZST00gIiAuLiBzcmMpCiAgICBpZiBub3QgZGF0YSB0aGVuIGVycm9yKHRvc3RyaW5nKGVyciksIDApIGVuZAogICAgbG9jYWwgb3V0ID0ge30KICAgIGZvciBfLCByb3cgaW4gaXBhaXJzKGRhdGEpIGRvCiAgICAgIGxvY2FsIHIgPSBuLmZuKHJvdykKICAgICAgaWYgciB+PSBuaWwgdGhlbiBvdXRbI291dCArIDFdID0gciBlbmQKICAgIGVuZAogICAgLS0g5bu65Li05pe26KGo5bm25YaZ5YWlCiAgICBsb2NhbCBjb2xzID0ge30KICAgIGZvciBrLCB2IGluIHBhaXJzKG91dFsxXSBvciB7fSkgZG8KICAgICAgbG9jYWwgdnQgPSAodHlwZSh2KSA9PSAibnVtYmVyIikgYW5kICJCSUdJTlQiIG9yICJWQVJDSEFSIgogICAgICBjb2xzWyNjb2xzICsgMV0gPSBrIC4uICIgIiAuLiB2dAogICAgZW5kCiAgICBpZiAjY29scyA9PSAwIHRoZW4gZXJyb3IoInRyYW5zZm9ybV9sdWE6IGVtcHR5IG91dHB1dCIsIDApIGVuZAogICAgX2R1Y2tkYl9jYWxsKCJDUkVBVEUgT1IgUkVQTEFDRSBURU1QIFRBQkxFICIgLi4gbi5pZCAuLiAiICgiIC4uIHRhYmxlLmNvbmNhdChjb2xzLCAiLCAiKSAuLiAiKSIpCiAgICBmb3IgXywgcm93IGluIGlwYWlycyhvdXQpIGRvCiAgICAgIGxvY2FsIHZhbHMgPSB7fQogICAgICBmb3IgayBpbiBwYWlycyhvdXRbMV0pIGRvCiAgICAgICAgbG9jYWwgdiA9IHJvd1trXQogICAgICAgIGlmIHR5cGUodikgPT0gInN0cmluZyIgdGhlbiB2YWxzWyN2YWxzICsgMV0gPSBlc2ModikKICAgICAgICBlbHNlaWYgdiA9PSBuaWwgdGhlbiB2YWxzWyN2YWxzICsgMV0gPSAiTlVMTCIKICAgICAgICBlbHNlIHZhbHNbI3ZhbHMgKyAxXSA9IHRvc3RyaW5nKHYpIGVuZAogICAgICBlbmQKICAgICAgX2R1Y2tkYl9jYWxsKCJJTlNFUlQgSU5UTyAiIC4uIG4uaWQgLi4gIiBWQUxVRVMgKCIgLi4gdGFibGUuY29uY2F0KHZhbHMsICIsICIpIC4uICIpIikKICAgIGVuZAogICAgcmV0dXJuICNvdXQKICBlbHNlaWYgdHlwID09ICJxdWFsaXR5IiB0aGVuCiAgICBsb2NhbCBzcmMgPSBuLnNvdXJjZSBvciAobi5kZXBzIGFuZCBuLmRlcHNbMV0pIG9yIGVycm9yKCJxdWFsaXR5OiBubyBzb3VyY2UiLCAwKQogICAgZm9yIF8sIGNoayBpbiBpcGFpcnMobi5jaGVja3Mgb3Ige30pIGRvCiAgICAgIHJ1bl9jaGVjayhzcmMsIGNoaykKICAgIGVuZAogICAgbG9jYWwgcm93cywgZXJyID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gIiAuLiBzcmMpCiAgICBpZiBub3Qgcm93cyB0aGVuIGVycm9yKHRvc3RyaW5nKGVyciksIDApIGVuZAogICAgcmV0dXJuIHRvbnVtYmVyKHJvd3NbMV0ubikgb3IgMAogIGVsc2VpZiB0eXAgPT0gInNpbmsiIHRoZW4KICAgIGxvY2FsIHNyYyA9IG4uc291cmNlIG9yIChuLmRlcHMgYW5kIG4uZGVwc1sxXSkgb3IgZXJyb3IoInNpbms6IG5vIHNvdXJjZSIsIDApCiAgICBsb2NhbCB0YmwgPSBuLnRhYmxlIG9yIG4uaWQKICAgIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoIkNSRUFURSBPUiBSRVBMQUNFIFRBQkxFICIgLi4gdGJsIC4uICIgQVMgU0VMRUNUICogRlJPTSAiIC4uIHNyYykKICAgIGlmIHR5cGUocikgPT0gInN0cmluZyIgYW5kIHI6bWF0Y2goIl5lcnJvcjoiKSB0aGVuIGVycm9yKHI6c3ViKDcpLCAwKSBlbmQKICAgIGxvY2FsIHJvd3MsIGVyciA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCBDQVNUKGNvdW50KCopIEFTIEJJR0lOVCkgQVMgbiBGUk9NICIgLi4gdGJsKQogICAgaWYgbm90IHJvd3MgdGhlbiBlcnJvcih0b3N0cmluZyhlcnIpLCAwKSBlbmQKICAgIHJldHVybiB0b251bWJlcihyb3dzWzFdLm4pIG9yIDAKICBlbHNlaWYgdHlwID09ICJpZl9ub2RlIiB0aGVuCiAgICAtLSDor4TkvLDmnaHku7bvvJpjb25kaXRpb24ocmVzdWx0cykg4oaSIGJvb2xlYW4KICAgIGxvY2FsIGNvbmQgPSBuLmNvbmRpdGlvbgogICAgaWYgdHlwZShjb25kKSB+PSAiZnVuY3Rpb24iIHRoZW4gZXJyb3IoImlmX25vZGU6IGV4cGVjdGVkIGNvbmRpdGlvbiBmdW5jdGlvbiIsIDApIGVuZAogICAgbG9jYWwgb2ssIHZhbCA9IHBjYWxsKGNvbmQsIHJlc3VsdHMpCiAgICBpZiBub3Qgb2sgdGhlbiBlcnJvcigiaWZfbm9kZTogY29uZGl0aW9uIGZhaWxlZDogIiAuLiB0b3N0cmluZyh2YWwpLCAwKSBlbmQKICAgIGxvY2FsIHJvdXRlID0gdmFsIGFuZCAidHJ1ZSIgb3IgImZhbHNlIgogICAgcmVzdWx0c1siX3JvdXRlXyIgLi4gbi5pZF0gPSByb3V0ZQogICAgcmV0dXJuIG5pbCAgLS0gaWZfbm9kZSDkuI3kuqfnlJ/mlbDmja7ooYwKICBlbHNlaWYgdHlwID09ICJzd2l0Y2hfbm9kZSIgdGhlbgogICAgLS0g6K+E5Lyw6YCJ5oup5Zmo77yac2VsZWN0b3IocmVzdWx0cykg4oaSIHN0cmluZwogICAgbG9jYWwgc2VsID0gbi5zZWxlY3RvcgogICAgaWYgdHlwZShzZWwpIH49ICJmdW5jdGlvbiIgdGhlbiBlcnJvcigic3dpdGNoX25vZGU6IGV4cGVjdGVkIHNlbGVjdG9yIGZ1bmN0aW9uIiwgMCkgZW5kCiAgICBsb2NhbCBvaywgdmFsID0gcGNhbGwoc2VsLCByZXN1bHRzKQogICAgaWYgbm90IG9rIHRoZW4gZXJyb3IoInN3aXRjaF9ub2RlOiBzZWxlY3RvciBmYWlsZWQ6ICIgLi4gdG9zdHJpbmcodmFsKSwgMCkgZW5kCiAgICBsb2NhbCByb3V0ZSA9IHRvc3RyaW5nKHZhbCkKICAgIHJlc3VsdHNbIl9yb3V0ZV8iIC4uIG4uaWRdID0gcm91dGUKICAgIHJldHVybiBuaWwgIC0tIHN3aXRjaF9ub2RlIOS4jeS6p+eUn+aVsOaNruihjAogIGVsc2UKICAgIGVycm9yKCJwaXBlbGluZTogdW5rbm93biBub2RlIHR5cGUgIiAuLiB0b3N0cmluZyh0eXApLCAwKQogIGVuZAplbmQKCi0tIOaJp+ihjCBQaXBlbGluZe+8iOWFiCBjb21waWxlIOWGjemAkOiKgueCueaJp+ihjO+8iQotLSDov5Tlm54geyBub2RlX3Jlc3VsdHMgPSB7IGlkID0gcm93cywgLi4uIH0gfe+8jOWksei0peiKgueCueagh+iusCAiZmFpbGVkOjxlcnI+IgpmdW5jdGlvbiBldGwucGlwZWxpbmUocCkKICBsb2NhbCBjID0gZXRsLmNvbXBpbGUocCkKICBsb2NhbCByZXN1bHRzID0ge30KICBmb3IgXywgaWQgaW4gaXBhaXJzKGMub3JkZXIpIGRvCiAgICBsb2NhbCBuID0gYy5ub2Rlc1tpZF0KCiAgICAtLSDot6/nlLHmo4Dmn6XvvJrkuIvmuLjoioLngrnmnIkgcm91dGUg5a2X5q6177yM5qOA5p+l5L6d6LWW55qEIGlmX25vZGUvc3dpdGNoX25vZGUg57uT5p6c5piv5ZCm5Yy56YWNCiAgICBpZiBuLnJvdXRlIHRoZW4KICAgICAgbG9jYWwgZGVwID0gbi5kZXBzIGFuZCBuLmRlcHNbMV0KICAgICAgbG9jYWwgcm91dGVfa2V5ID0gIl9yb3V0ZV8iIC4uIChkZXAgb3IgIiIpCiAgICAgIGlmIHJlc3VsdHNbcm91dGVfa2V5XSB+PSBuLnJvdXRlIHRoZW4KICAgICAgICAtLSDot6/nlLHkuI3ljLnphY3vvIzot7Pov4fmraToioLngrkKICAgICAgICByZXN1bHRzW24uaWRdID0gInNraXBwZWQiCiAgICAgICAgZ290byBjb250aW51ZQogICAgICBlbmQKICAgIGVuZAoKICAgIC0tIOmHjeivleW+queOrwogICAgbG9jYWwgbWF4X3JldHJpZXMgPSAobi5yZXRyeSBhbmQgdHlwZShuLnJldHJ5KSA9PSAidGFibGUiIGFuZCBuLnJldHJ5Lm1heCkgb3IgMAogICAgbG9jYWwgYmFja29mZiA9IChuLnJldHJ5IGFuZCB0eXBlKG4ucmV0cnkpID09ICJ0YWJsZSIgYW5kIG4ucmV0cnkuYmFja29mZikgb3IgMS4wCiAgICBsb2NhbCB0aW1lb3V0ID0gbi50aW1lb3V0IG9yIDAKICAgIGxvY2FsIHRfc3RhcnQgPSBvcy5jbG9jaygpCiAgICBsb2NhbCBvaywgcmVzID0gZmFsc2UsIG5pbAogICAgbG9jYWwgbGFzdF9kdCA9IDAKCiAgICBmb3IgYXR0ZW1wdCA9IDAsIG1heF9yZXRyaWVzIGRvCiAgICAgIC0tIOi2heaXtuajgOafpe+8iOWMheaLrOmHjeivleaAu+aXtumXtO+8iQogICAgICBpZiB0aW1lb3V0ID4gMCB0aGVuCiAgICAgICAgbG9jYWwgZWxhcHNlZCA9IG9zLmNsb2NrKCkgLSB0X3N0YXJ0CiAgICAgICAgaWYgZWxhcHNlZCA+PSB0aW1lb3V0IHRoZW4KICAgICAgICAgIHJlcyA9ICJ0aW1lb3V0IGFmdGVyICIgLi4gdG9zdHJpbmcobWF0aC5mbG9vcihlbGFwc2VkKSkgLi4gInMgKG1heCAiIC4uIHRvc3RyaW5nKHRpbWVvdXQpIC4uICJzKSIKICAgICAgICAgIGJyZWFrCiAgICAgICAgZW5kCiAgICAgIGVuZAoKICAgICAgbG9jYWwgdDAgPSBvcy5jbG9jaygpCiAgICAgIG9rLCByZXMgPSBwY2FsbChmdW5jdGlvbigpIHJldHVybiBldGwucnVuX25vZGUobiwgcmVzdWx0cykgZW5kKQogICAgICBsYXN0X2R0ID0gbWF0aC5mbG9vcigob3MuY2xvY2soKSAtIHQwKSAqIDEwMDApCgogICAgICBpZiBvayB0aGVuCiAgICAgICAgYnJlYWsKICAgICAgZW5kCgogICAgICAtLSDlpLHotKXkuJTmnInph43or5XmrKHmlbDvvJrpgIDpgb/nrYnlvoXlkI7ph43or5UKICAgICAgaWYgYXR0ZW1wdCA8IG1heF9yZXRyaWVzIHRoZW4KICAgICAgICBsb2NhbCBzbGVlcF9zID0gYmFja29mZiAqICgyIF4gYXR0ZW1wdCkKICAgICAgICBidXN5X3NsZWVwKHNsZWVwX3MpCiAgICAgIGVuZAogICAgZW5kCgogICAgaWYgb2sgdGhlbgogICAgICBldGwubG9nKDAsICJub2RlOiIgLi4gbi5pZCwgJ3sidHlwZSI6IicgLi4gdG9zdHJpbmcobi50eXBlKSAuLiAnIn0nLCBsYXN0X2R0LCByZXMgb3IgMCwgdHJ1ZSwgbmlsKQogICAgICByZXN1bHRzW24uaWRdID0gcmVzCiAgICBlbHNlCiAgICAgIGxvY2FsIHRvdGFsX2R0ID0gbWF0aC5mbG9vcigob3MuY2xvY2soKSAtIHRfc3RhcnQpICogMTAwMCkKICAgICAgZXRsLmxvZygwLCAibm9kZToiIC4uIG4uaWQsICd7InR5cGUiOiInIC4uIHRvc3RyaW5nKG4udHlwZSkgLi4gJyJ9JywgdG90YWxfZHQsIDAsIGZhbHNlLCB0b3N0cmluZyhyZXMpKQoKICAgICAgaWYgbi5vbl9lcnJvciB0aGVuCiAgICAgICAgLS0g5pyJ6ZSZ6K+v5oGi5aSN77ya5qCH6K6w5aSx6LSl77yM57un57ut566h6YGTCiAgICAgICAgcmVzdWx0c1tuLmlkXSA9ICJmYWlsZWQ6IiAuLiB0b3N0cmluZyhyZXMpCiAgICAgICAgcmVzdWx0c1siX2Vycl8iIC4uIG4uaWRdID0gdG9zdHJpbmcocmVzKQogICAgICBlbHNlCiAgICAgICAgZXJyb3IoInBpcGVsaW5lWyIgLi4gdG9zdHJpbmcoYy5uYW1lKSAuLiAiXSBub2RlICciIC4uIG4uaWQgLi4gIicgZmFpbGVkOiAiIC4uIHRvc3RyaW5nKHJlcyksIDApCiAgICAgIGVuZAogICAgZW5kCiAgICA6OmNvbnRpbnVlOjoKICBlbmQKICByZXR1cm4gcmVzdWx0cwplbmQKCnJldHVybiBldGwAdW5leHBlY3RlZCBzeW1ib2wAeHBjYWxsAF9fY2FsbAB1bnRpbAB0YWJsZSBpbmRleCBpcyBuaWwAY2VpbABfX3NobAByYXdlcXVhbABpbmNyZW1lbnRhbABnZW5lcmF0aW9uYWwAbG9jYWwAZ2xvYmFsAFNsAGhvb2sAbm90IGEgYmluYXJ5IGNodW5rAGNvcnJ1cHRlZCBjaHVuawB0cnVuY2F0ZWQgY2h1bmsAY2xvY2sAbm90IGVub3VnaCBzdGFjawB0b28gbWFueSByZXN1bHRzIHRvIHVucGFjawBicmVhawBwaQBtb250aABtYXRoAGZsb2F0IGZvcm1hdCBtaXNtYXRjaABpbnRlZ2VyIGZvcm1hdCBtaXNtYXRjaAB2ZXJzaW9uIG1pc21hdGNoACVzIHNpemUgbWlzbWF0Y2gAZ21hdGNoAGxvZwBsZXhpY2FsIGVsZW1lbnQgdG9vIGxvbmcAY29udHJvbCBzdHJ1Y3R1cmUgdG9vIGxvbmcAc3RyaW5nIHNsaWNlIHRvbyBsb25nAGludmFsaWQgb3JkZXIgZnVuY3Rpb24gZm9yIHNvcnRpbmcAX190b3N0cmluZwBiaW5hcnkgc3RyaW5nAGludmFsaWQgdXNlIG9mICclYycgaW4gcmVwbGFjZW1lbnQgc3RyaW5nAGJhZCBmb3JtYXQgZm9yIGNvbnN0YW50IHN0cmluZwB0YWJsZSBvciBzdHJpbmcAaW5pdGlhbCBwb3NpdGlvbiBvdXQgb2Ygc3RyaW5nAHVuZmluaXNoZWQgc3RyaW5nAGVycm9yIG9iamVjdCBpcyBub3QgYSBzdHJpbmcAcmVhZGVyIGZ1bmN0aW9uIG11c3QgcmV0dXJuIGEgc3RyaW5nACdfX3Rvc3RyaW5nJyBtdXN0IHJldHVybiBhIHN0cmluZwBpc3J1bm5pbmcAZXJyb3IgaW4gZXJyb3IgaGFuZGxpbmcAYXJyYXkgdG9vIGJpZwBtZW1vcnkgYWxsb2NhdGlvbiBlcnJvcjogYmxvY2sgdG9vIGJpZwBkZWcAJS4xNGcAZ2V0IGxlbmd0aCBvZgBpbmYAc2VsZgBlbHNlaWYAb2ZmAG1vZGYAdmVyc2lvbiBtaXNtYXRjaDogYXBwLiBuZWVkcyAlZiwgTHVhIGNvcmUgcHJvdmlkZXMgJWYAcGFja3NpemUAc3RyaW5nIGxlbmd0aCBkb2VzIG5vdCBmaXQgaW4gZ2l2ZW4gc2l6ZQBzdHJpbmcgbG9uZ2VyIHRoYW4gZ2l2ZW4gc2l6ZQByZW1vdmUAdG9vIG1hbnkgZWxlbWVudHMgdG8gbW92ZQB0cnVlAHVwdmFsdWUAbm8gdmFsdWUAaW5pdGlhbCB2YWx1ZQB2YXJpYWJsZSAnJXMnIGdvdCBhIG5vbi1jbG9zYWJsZSB2YWx1ZQBpbml0aWFsIHBvc2l0aW9uIGlzIGEgY29udGludWF0aW9uIGJ5dGUAZXhlY3V0ZQBjb25jYXRlbmF0ZQBjb2xsYXRlAGRhdGUAc2V0cGF1c2UAcmV2ZXJzZQBfX2Nsb3NlAGVsc2UAZmFsc2UAaW52YWxpZCBwYXR0ZXJuIGNhcHR1cmUAdW5maW5pc2hlZCBjYXB0dXJlAGN0eXBlAGRpZmZ0aW1lAHRtcG5hbWUAcmVuYW1lAHVuYWJsZSB0byBnZW5lcmF0ZSBhIHVuaXF1ZSBmaWxlbmFtZQBfX25hbWUAd2hpbGUAZG9maWxlAGxvYWRmaWxlAHNldG1ldGF0YWJsZQBnZXRtZXRhdGFibGUAX19tZXRhdGFibGUAY2Fubm90IGNoYW5nZSBhIHByb3RlY3RlZCBtZXRhdGFibGUAc3RyaW5nL2Z1bmN0aW9uL3RhYmxlAG5pbCBvciB0YWJsZQBmaWVsZCAnJXMnIG1pc3NpbmcgaW4gZGF0ZSB0YWJsZQBzZXRsb2NhbGUAX19sZQBodWdlAGZvcm1hdCByZXN1bHQgdG9vIGxhcmdlAGJ1ZmZlciB0b28gbGFyZ2UAcmVzdWx0aW5nIHN0cmluZyB0b28gbGFyZ2UAVVRGLTggdmFsdWUgdG9vIGxhcmdlAGRlY2ltYWwgZXNjYXBlIHRvbyBsYXJnZQBpbmRleCBvdXQgb2YgcmFuZ2UAdmFsdWUgb3V0IG9mIHJhbmdlAGJhc2Ugb3V0IG9mIHJhbmdlAGNvbGxlY3RnYXJiYWdlAF9fbW9kZQBpbnZhbGlkIFVURi04IGNvZGUAaW52YWxpZCBlc2NhcGUgc2VxdWVuY2UAdG9fbGFuY2UARWUAZGVtb19lMmUAZm1vZABfX21vZABtZXRhbWV0aG9kAGRlc3RpbmF0aW9uIHdyYXAgYXJvdW5kAGZpZWxkICclcycgaXMgb3V0LW9mLWJvdW5kAGZpbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIG09X2xpYnMudG9fbGFuY2U7IGxvY2FsIHA9e3NvdXJjZT0nZGVtb19zY2QyX3NyYycsZGVzdD0nbWVtOi8vZGVtb19sYW5jZScsbW9kZT0ndHMnLHRzX2NvbD0ndHMnLGlkX2NvbD0naWQnfTsgbG9jYWwgb2sscmVzPXBjYWxsKG0ucnVuLHApOyBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ0VSUiAnLi50b3N0cmluZyhyZXMpIGVuZDsgcmV0dXJuICdvazogJy4udG9zdHJpbmcocmVzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIG09X2xpYnMuaW5jcmVtZW50YWw7IGxvY2FsIHA9e3RhcmdldD0nZGVtb193bScsc291cmNlPSdkZW1vX3dtX3NyYycsbW9kZT0ndHMnLHRzX2NvbD0ndHMnLGlkX2NvbD0naWQnfTsgbG9jYWwgb2sscmVzPXBjYWxsKG0ucnVuLHApOyBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ0VSUiAnLi50b3N0cmluZyhyZXMpIGVuZDsgcmV0dXJuICdvazogJy4udG9zdHJpbmcocmVzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnNbJ3NjZDInXTsgaWYgdHlwZShmKX49J3RhYmxlJyBvciBub3QgZi5ydW4gdGhlbiByZXR1cm4gJ3NjZDIgc2hhcGU6ICcuLnRvc3RyaW5nKHR5cGUoZikpIGVuZDsgbG9jYWwgcD17dGFyZ2V0PSdkZW1vX3NjZDInLHNvdXJjZT0nZGVtb19zY2QyX3NyYycsa2V5X2NvbD0naWQnLHRzX2NvbD0ndHMnLGF0dHJfY29scz17J3N0YXR1cyd9fTsgbG9jYWwgb2sscmVzPXBjYWxsKGYucnVuLHApOyBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ0VSUiAnLi50b3N0cmluZyhyZXMpIGVuZDsgcmV0dXJuICdvazogJy4udG9zdHJpbmcocmVzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMuZXhwb3J0OyBsb2NhbCBwPXt0Ymw9J2RlbW9fZXhwb3J0X3NyYycsZmlsZT0nbWVtOi8vZGVtb19leHBvcnQuY3N2Jyxmb3JtYXQ9J2Nzdid9OyBsb2NhbCBvayxyZXM9cGNhbGwoZixwKTsgaWYgbm90IG9rIHRoZW4gcmV0dXJuICdFUlIgJy4udG9zdHJpbmcocmVzKSBlbmQ7IHJldHVybiAnb2s6ICcuLnRvc3RyaW5nKHJlcykgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBmPV9saWJzLmRlbW9fZTJlOyBsb2NhbCBvayxyZXM9cGNhbGwoZix7fSk7IGlmIG5vdCBvayB0aGVuIHJldHVybiAnRVJSICcuLnRvc3RyaW5nKHJlcykgZW5kOyByZXR1cm4gdG9zdHJpbmcocmVzKSBlbmQAcmV0dXJuIGZ1bmN0aW9uKGlucHV0X2pzb24pIGxvY2FsIGY9X2xpYnMucmJhYzsgaWYgdHlwZShmKX49J2Z1bmN0aW9uJyB0aGVuIHJldHVybiAncmJhYyBzaGFwZTogJy4udG9zdHJpbmcodHlwZShmKSkgZW5kOyBsb2NhbCBvazEsIHIxID0gcGNhbGwoZiwge29wPSdzZXR1cCd9KTsgbG9jYWwgb2syLCByMiA9IHBjYWxsKGYsIHtvcD0nc3RhdHVzJ30pOyBsb2NhbCBvazMsIHIzID0gcGNhbGwoZiwge29wPSdhdXRoeicsIHNpZD0nczEnLCBxPSdTRUxFQ1QgKiBGUk9NIHB1YmxpY19kYXRhJ30pOyByZXR1cm4gJ3NldHVwPScuLnRvc3RyaW5nKHIxKS4uJyB8IHN0YXR1cz0nLi50b3N0cmluZyhyMikuLicgfCBhdXRoeihyZWFkIHB1YmxpY19kYXRhLCBubyBzZXNzaW9uKT0nLi50b3N0cmluZyhyMykgZW5kAHJldHVybiBmdW5jdGlvbihpbnB1dF9qc29uKSBsb2NhbCBtPV9saWJzLmV0bDsgaWYgdHlwZShtKX49J3RhYmxlJyBvciBub3QgbS5ydW4gdGhlbiByZXR1cm4gJ2V0bCBtb2R1bGUgc2hhcGU6ICcuLnRvc3RyaW5nKHR5cGUobSkpIGVuZDsgICAtLSDmvJTnpLogZXRsLnJ1biDlrqHorqHljIXoo4XvvJrot5HkuIDkuKrkvJrmiJDlip/nmoQgZm4gKyDkuIDkuKrkvJrlpLHotKXooqvph43or5XmjZXojrfnmoQgZm4KICBsb2NhbCBvazEscmVzMT1wY2FsbChtLnJ1biwnZGVtb19vaycsJ3sieCI6MX0nLGZ1bmN0aW9uKCkgcmV0dXJuIHsxLDIsM30gZW5kKQogIGxvY2FsIG9rMixyZXMyPXBjYWxsKG0ucnVuLCdkZW1vX2ZhaWwnLCd7fScsZnVuY3Rpb24oKSBlcnJvcignaW50ZW50aW9uYWwgZmFpbCcpIGVuZCkKICByZXR1cm4gJ3J1bl9vaz0nLi50b3N0cmluZyhvazEpLi4nKHJvd3M9Jy4uKG9rMSBhbmQgI3JlczEgb3IgJy0nKS4uJykgcnVuX2ZhaWxfY2F1Z2h0PScuLnRvc3RyaW5nKG5vdCBvazIpIGVuZAByZXR1cm4gZnVuY3Rpb24oaW5wdXRfanNvbikgbG9jYWwgaj1fbGlicy5qc29uOyByZXR1cm4gJ2pzb24gbGliIGxvYWRlZDogJyAuLiB0b3N0cmluZyh0eXBlKGouZW5jb2RlKSkgZW5kAC0tIGV0bC5waXBlbGluZSBFMkUg5ryU56S677yIMjAyNi0wOC0yMO+8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiBwb2MKLS0g55So5rOV77ya57yW6K+R5ZCO6YCa6L+HIGx1YWppdF9zIOiwg+eUqAotLSDmvJTnpLogUGlwZWxpbmUg5byV5pOOIHYyIOWFqOmDqOiDveWKm++8mgotLSAgIHNvdXJjZSAvIHRyYW5zZm9ybSAvIHF1YWxpdHkgLyBpZl9ub2RlIC8gc3dpdGNoX25vZGUgLyBzaW5rCi0tICAg5p2h5Lu26Lev55SxIC8g6YeN6K+VIC8g6LaF5pe2IC8g6ZSZ6K+v5oGi5aSNIC8g5a6h6K6hCgpyZXR1cm4gZnVuY3Rpb24obm9vcCkKICAtLSA9PT09PT09PT09PT0gMS4g5YeG5aSH5pWw5o2uID09PT09PT09PT09PQogIF9kdWNrZGJfY2FsbCgiQ1JFQVRFIE9SIFJFUExBQ0UgVEFCTEUgZGVtb19vcmRlcnMgQVMgU0VMRUNUICogRlJPTSAoVkFMVUVTIiAuLgogICAgIigxLCAnQWxpY2UnLCAgIDI1MC4wLCAnY29tcGxldGVkJyksIiAuLgogICAgIigyLCAnQm9iJywgICAgIDE1MC4wLCAnY29tcGxldGVkJyksIiAuLgogICAgIigzLCAnQ2hhcmxpZScsICA4MC4wLCAncGVuZGluZycpLCIgLi4KICAgICIoNCwgJ0RpYW5hJywgICA1MDAuMCwgJ2NvbXBsZXRlZCcpLCIgLi4KICAgICIoNSwgJ0V2ZScsICAgICAgMzAuMCwgJ2NhbmNlbGxlZCcpKSBBUyB0KGlkLCBuYW1lLCBhbW91bnQsIHN0YXR1cykiKQoKICBfZHVja2RiX2NhbGwoIkNSRUFURSBPUiBSRVBMQUNFIFRBQkxFIGRlbW9fY3VzdG9tZXJzIEFTIFNFTEVDVCAqIEZST00gKFZBTFVFUyIgLi4KICAgICIoMSwgJ0FsaWNlJywgICAgJ1ZJUCcpLCIgLi4KICAgICIoMiwgJ0JvYicsICAgICAgJ1JlZ3VsYXInKSwiIC4uCiAgICAiKDQsICdEaWFuYScsICAgICdWSVAnKSwiIC4uCiAgICAiKDYsICdGcmFuaycsICAgICdOZXcnKSkgQVMgdChpZCwgbmFtZSwgdGllcikiKQoKICAtLSA9PT09PT09PT09PT0gMi4g5a6a5LmJIFBpcGVsaW5lID09PT09PT09PT09PQogIGxvY2FsIHBpcGVsaW5lID0gewogICAgbmFtZSA9ICJvcmRlcnNfZXRsX2RlbW8iLAogICAgbm9kZXMgPSB7CiAgICAgIC0tIOKRoCDmupDmlbDmja7liqDovb0KICAgICAgeyBpZCA9ICJzcmNfb3JkZXJzIiwgICAgdHlwZSA9ICJzb3VyY2UiLAogICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCAqIEZST00gZGVtb19vcmRlcnMgV0hFUkUgc3RhdHVzID0gJ2NvbXBsZXRlZCciIH0sCiAgICAgIHsgaWQgPSAic3JjX2N1c3RvbWVycyIsIHR5cGUgPSAic291cmNlIiwKICAgICAgICBxdWVyeSA9ICJTRUxFQ1QgKiBGUk9NIGRlbW9fY3VzdG9tZXJzIiB9LAoKICAgICAgLS0g4pGhIOaVsOaNrua4hea0lwogICAgICB7IGlkID0gImNsZWFuX29yZGVycyIsIHR5cGUgPSAidHJhbnNmb3JtIiwKICAgICAgICBxdWVyeSA9ICJTRUxFQ1QgaWQsIHVwcGVyKG5hbWUpIEFTIG5hbWUsIGFtb3VudCwgc3RhdHVzIEZST00gc3JjX29yZGVycyBXSEVSRSBhbW91bnQgPiAwIiwKICAgICAgICBkZXBzID0geyAic3JjX29yZGVycyIgfSB9LAoKICAgICAgLS0g4pGiIOaVsOaNrui0qOmHj+ajgOafpQogICAgICB7IGlkID0gInF1YWxpdHlfY2hlY2siLCB0eXBlID0gInF1YWxpdHkiLAogICAgICAgIGRlcHMgPSB7ICJjbGVhbl9vcmRlcnMiIH0sCiAgICAgICAgY2hlY2tzID0gewogICAgICAgICAgeyB0eXBlID0gIm5vdF9udWxsIiwgY29sID0gImlkIiB9LAogICAgICAgICAgeyB0eXBlID0gInVuaXF1ZSIsICAgY29sID0gImlkIiB9LAogICAgICAgICAgeyB0eXBlID0gInJvd2NvdW50X21pbiIsIG1pbiA9IDEgfSwKICAgICAgICB9IH0sCgogICAgICAtLSDikaMg5p2h5Lu26Lev55Sx77ya5pyJ5pWw5o2u5omN5aSE55CGCiAgICAgIHsgaWQgPSAiaGFzX2RhdGEiLCB0eXBlID0gImlmX25vZGUiLAogICAgICAgIGRlcHMgPSB7ICJxdWFsaXR5X2NoZWNrIiB9LAogICAgICAgIGNvbmRpdGlvbiA9IGZ1bmN0aW9uKHJlc3VsdHMpCiAgICAgICAgICAtLSBjbGVhbl9vcmRlcnMg5pyJ5pWw5o2u77yIMyDooYwgY29tcGxldGVkIOiuouWNle+8iQogICAgICAgICAgcmV0dXJuIChyZXN1bHRzLnF1YWxpdHlfY2hlY2sgb3IgMCkgPiAwCiAgICAgICAgZW5kIH0sCgogICAgICAtLSDikaQg6auY5Lu35YC86K6i5Y2V77yIcm91dGU9dHJ1ZSDliIbmlK/vvIkKICAgICAgeyBpZCA9ICJhZ2dfaGlnaF92YWx1ZSIsIHR5cGUgPSAidHJhbnNmb3JtIiwKICAgICAgICBkZXBzID0geyAiaGFzX2RhdGEiIH0sIHJvdXRlID0gInRydWUiLAogICAgICAgIHF1ZXJ5ID0gIlNFTEVDVCBuYW1lLCBzdW0oYW1vdW50KSBBUyB0b3RhbCBGUk9NIGNsZWFuX29yZGVycyBXSEVSRSBhbW91bnQgPj0gMTAwIEdST1VQIEJZIG5hbWUgT1JERVIgQlkgdG90YWwgREVTQyIgfSwKCiAgICAgIC0tIOKRpSDokL3ooajvvIhyb3V0ZT10cnVlIOWIhuaUr++8iQogICAgICB7IGlkID0gInNpbmtfaGlnaF92YWx1ZSIsIHR5cGUgPSAic2luayIsCiAgICAgICAgZGVwcyA9IHsgImFnZ19oaWdoX3ZhbHVlIiB9LCB0YWJsZSA9ICJkZW1vX2hpZ2hfdmFsdWUiIH0sCgogICAgICAtLSDikaYg56m65pWw5o2u5pel5b+X77yIcm91dGU9ZmFsc2Ug5YiG5pSv4oCU4oCU5Zug5pyJ5pWw5o2u77yM5LiN5Lya5omn6KGM77yJCiAgICAgIHsgaWQgPSAic2lua19lbXB0eV9sb2ciLCB0eXBlID0gInNpbmsiLAogICAgICAgIGRlcHMgPSB7ICJoYXNfZGF0YSIgfSwgcm91dGUgPSAiZmFsc2UiLCB0YWJsZSA9ICJkZW1vX2VtcHR5X2xvZyIgfSwKCiAgICAgIC0tIOKRpyDmmJPplJnoioLngrkgKyDplJnor6/mgaLlpI3vvIhvbl9lcnJvciArIHJldHJ577yJCiAgICAgIHsgaWQgPSAicmlza3lfam9pbiIsIHR5cGUgPSAidHJhbnNmb3JtIiwKICAgICAgICBkZXBzID0geyAic3JjX2N1c3RvbWVycyIgfSwKICAgICAgICBxdWVyeSA9ICJTRUxFQ1QgYy5pZCwgYy5uYW1lLCBjLnRpZXIgRlJPTSBzcmNfY3VzdG9tZXJzIGMgSk9JTiBub25leGlzdGVudF90YWJsZSBuIE9OIGMuaWQgPSBuLmlkIiwKICAgICAgICBvbl9lcnJvciA9ICJmYWxsYmFja19qb2luIiwKICAgICAgICByZXRyeSA9IHsgbWF4ID0gMSwgYmFja29mZiA9IDAuMSB9IH0sCgogICAgICB7IGlkID0gImZhbGxiYWNrX2pvaW4iLCB0eXBlID0gInRyYW5zZm9ybSIsCiAgICAgICAgZGVwcyA9IHsgInNyY19jdXN0b21lcnMiIH0sCiAgICAgICAgcXVlcnkgPSAiU0VMRUNUIGlkLCBuYW1lLCB0aWVyLCAnZmFsbGJhY2snIEFTIG5vdGUgRlJPTSBzcmNfY3VzdG9tZXJzIiB9LAoKICAgICAgLS0g4pGoIOiQvSBjdXN0b21lcnMg57uT5p6cCiAgICAgIHsgaWQgPSAic2lua19jdXN0b21lcnMiLCB0eXBlID0gInNpbmsiLAogICAgICAgIGRlcHMgPSB7ICJmYWxsYmFja19qb2luIiB9LCB0YWJsZSA9ICJkZW1vX3ZpcF9jdXN0b21lcnMiIH0sCgogICAgICAtLSDikakg5aSa6Lev6Lev55Sx5ryU56S677yac3dpdGNoX25vZGUg5oyJ6YeR6aKd5YiG5qG2CiAgICAgIHsgaWQgPSAic3dpdGNoX2J1Y2tldCIsIHR5cGUgPSAic3dpdGNoX25vZGUiLAogICAgICAgIGRlcHMgPSB7ICJjbGVhbl9vcmRlcnMiIH0sCiAgICAgICAgc2VsZWN0b3IgPSBmdW5jdGlvbihyZXN1bHRzKQogICAgICAgICAgLS0g5aaC5p6c5pyJ6auY5Lu35YC86K6i5Y2V6LWwICJoaWdoIiDliIbmlK/vvIzlkKbliJnotbAgImxvdyIKICAgICAgICAgIGxvY2FsIHJvd3MgPSBfZHVja2RiX3F1ZXJ5KCJTRUxFQ1QgY291bnQoKikgQVMgbiBGUk9NIGNsZWFuX29yZGVycyBXSEVSRSBhbW91bnQgPj0gMTAwIikKICAgICAgICAgIGlmIHJvd3MgYW5kIHJvd3NbMV0gYW5kIHRvbnVtYmVyKHJvd3NbMV0ubikgPiAwIHRoZW4KICAgICAgICAgICAgcmV0dXJuICJoaWdoIgogICAgICAgICAgZW5kCiAgICAgICAgICByZXR1cm4gImxvdyIKICAgICAgICBlbmQgfSwKCiAgICAgIHsgaWQgPSAiYnVja2V0X3JlcG9ydCIsIHR5cGUgPSAidHJhbnNmb3JtIiwKICAgICAgICBkZXBzID0geyAic3dpdGNoX2J1Y2tldCIgfSwgcm91dGUgPSAiaGlnaCIsCiAgICAgICAgcXVlcnkgPSAiU0VMRUNUICdCdWRnZXQ6ICcgfHwgQ0FTVChzdW0oYW1vdW50KSBBUyBWQVJDSEFSKSBBUyByZXBvcnQgRlJPTSBjbGVhbl9vcmRlcnMiIH0sCgogICAgICB7IGlkID0gImJ1Y2tldF9sb3dfbm90aWNlIiwgdHlwZSA9ICJzaW5rIiwKICAgICAgICBkZXBzID0geyAic3dpdGNoX2J1Y2tldCIgfSwgcm91dGUgPSAibG93IiwgdGFibGUgPSAiZGVtb19sb3dfbm90aWNlIiB9LAogICAgfSwKICB9CgogIC0tID09PT09PT09PT09PSAzLiDmiafooYwgUGlwZWxpbmUgPT09PT09PT09PT09CiAgbG9jYWwgb2ssIHJlc3VsdCA9IHBjYWxsKGV0bC5waXBlbGluZSwgcGlwZWxpbmUpCiAgaWYgbm90IG9rIHRoZW4KICAgIF9kdWNrZGJfY2FsbCgiSU5TRVJUIElOVE8gZGVtb19yZXN1bHRzIFZBTFVFUyAoJ0VSUk9SOiAiIC4uIHRvc3RyaW5nKHJlc3VsdCk6Z3N1YigiJyIsICInJyIpIC4uICInKSIpCiAgICByZXR1cm4gIkZBSUxFRDogIiAuLiB0b3N0cmluZyhyZXN1bHQpCiAgZW5kCgogIC0tID09PT09PT09PT09PSA0LiDpqozor4Hnu5PmnpwgPT09PT09PT09PT09CiAgbG9jYWwgcmVwb3J0ID0ge30KCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICI9IiAuLiBzdHJpbmcucmVwKCI9IiwgNTUpIC4uICI9IgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiICBldGwucGlwZWxpbmUgRTJFIOKAlCDpqozor4HmiqXlkYoiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICI9IiAuLiBzdHJpbmcucmVwKCI9IiwgNTUpIC4uICI9IgoKICAtLSA0YS4gaGlnaF92YWx1ZSDooagKICBsb2NhbCBodiA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCAqIEZST00gZGVtb19oaWdoX3ZhbHVlIE9SREVSIEJZIHRvdGFsIERFU0MiKQogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiIgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAi8J+TiiBkZW1vX2hpZ2hfdmFsdWXvvIjpq5jku7flgLzorqLljZUg4omlMTAw77yJIgogIGlmIGh2IGFuZCAjaHYgPiAwIHRoZW4KICAgIGZvciBfLCByIGluIGlwYWlycyhodikgZG8KICAgICAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIgICIgLi4gdG9zdHJpbmcoci5uYW1lKSAuLiAiIOKGkiAiIC4uIHRvc3RyaW5nKHIudG90YWwpCiAgICBlbmQKICBlbHNlCiAgICByZXBvcnRbI3JlcG9ydCArIDFdID0gIiAgKGVtcHR5KSIKICBlbmQKCiAgLS0gNGIuIGN1c3RvbWVycyDooajvvIjlkKvplJnor6/mgaLlpI3vvIkKICBsb2NhbCB2YyA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCAqIEZST00gZGVtb192aXBfY3VzdG9tZXJzIE9SREVSIEJZIGlkIikKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIiIKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIvCfk4ogZGVtb192aXBfY3VzdG9tZXJz77yI5ZCr6ZSZ6K+v5oGi5aSNIOKGkiBmYWxsYmFjayDliJfvvIkiCiAgaWYgdmMgYW5kICN2YyA+IDAgdGhlbgogICAgZm9yIF8sIHIgaW4gaXBhaXJzKHZjKSBkbwogICAgICByZXBvcnRbI3JlcG9ydCArIDFdID0gIiAgIiAuLiB0b3N0cmluZyhyLmlkKSAuLiAiICAiIC4uIHRvc3RyaW5nKHIubmFtZSkgLi4gIiAgIiAuLiB0b3N0cmluZyhyLnRpZXIpIC4uCiAgICAgICAgKHIubm90ZSBhbmQgKCIgIFsiIC4uIHRvc3RyaW5nKHIubm90ZSkgLi4gIl0iKSBvciAiIikKICAgIGVuZAogIGVuZAoKICAtLSA0Yy4gZW1wdHlfbG9nIOW6lOS4uuepuu+8iHJvdXRlPWZhbHNlIOacquaJp+ihjO+8iQogIGxvY2FsIGVsID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIGNvdW50KCopIEFTIG4gRlJPTSBkZW1vX2VtcHR5X2xvZyIpCiAgbG9jYWwgZW1wdHlfcm93cyA9IGVsIGFuZCBlbFsxXSBhbmQgdG9udW1iZXIoZWxbMV0ubikgb3IgMAogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiIgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAi8J+TiiBkZW1vX2VtcHR5X2xvZ++8iHJvdXRlPWZhbHNlIOWIhuaUr++8jOW6lCAwIOihjO+8iTogIiAuLiB0b3N0cmluZyhlbXB0eV9yb3dzKSAuLiAiIHJvd3MiCgogIC0tIDRkLiDlrqHorqHml6Xlv5cKICBsb2NhbCBsb2dzID0gX2R1Y2tkYl9xdWVyeSgiU0VMRUNUIGZuLCBDQVNUKGR1cmF0aW9uX21zIEFTIEJJR0lOVCkgQVMgbXMsIENBU1Qocm93cyBBUyBCSUdJTlQpIEFTIHJvd3MsIHN1Y2Nlc3MsIGVyciBGUk9NIGV0bF9ydW5fbG9nIE9SREVSIEJZIHRzIERFU0MgTElNSVQgMTUiKQogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiIgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAi8J+TiiDlrqHorqHml6Xlv5fvvIjmnIDov5EgMTUg5p2h77yJIgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiICAiIC4uIHN0cmluZy5mb3JtYXQoIiUtMzBzICU2cyAlNXMgICUtNXMgJXMiLCAiZm4iLCAiZHVyX21zIiwgInJvd3MiLCAib2s/IiwgImVyciIpCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICIgICIgLi4gc3RyaW5nLnJlcCgiLSIsIDcwKQogIGlmIGxvZ3MgdGhlbgogICAgZm9yIF8sIHIgaW4gaXBhaXJzKGxvZ3MpIGRvCiAgICAgIGxvY2FsIGVyciA9IHIuZXJyIG9yICIiCiAgICAgIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiICAiIC4uIHN0cmluZy5mb3JtYXQoIiUtMzBzICU2cyAlNXMgICUtNXMgJXMiLAogICAgICAgIHRvc3RyaW5nKHIuZm4pLCB0b3N0cmluZyhyLm1zKSwgdG9zdHJpbmcoci5yb3dzKSwKICAgICAgICB0b3N0cmluZyhyLnN1Y2Nlc3MpLCB0b3N0cmluZyhlcnIpKQogICAgZW5kCiAgZW5kCgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiIgogIHJlcG9ydFsjcmVwb3J0ICsgMV0gPSAiPSIgLi4gc3RyaW5nLnJlcCgiPSIsIDU1KSAuLiAiPSIKICByZXBvcnRbI3JlcG9ydCArIDFdID0gIiAg4pyFIEUyRSDmvJTnpLrlrozmiJAiCiAgcmVwb3J0WyNyZXBvcnQgKyAxXSA9ICI9IiAuLiBzdHJpbmcucmVwKCI9IiwgNTUpIC4uICI9IgoKICByZXR1cm4gdGFibGUuY29uY2F0KHJlcG9ydCwgIlxuIikKZW5kAF9fYmFuZAAlbGxkAGZpZWxkAGhleGFkZWNpbWFsIGRpZ2l0IGV4cGVjdGVkAGZ1bmN0aW9uIGFyZ3VtZW50cyBleHBlY3RlZAAlcyBleHBlY3RlZAB2YWx1ZSBleHBlY3RlZAAnPScgb3IgJ2luJyBleHBlY3RlZAA8bmFtZT4gb3IgJy4uLicgZXhwZWN0ZWQAdGVybWluYXRlX2hhbmRsZXIgdW5leHBlY3RlZGx5IHJldHVybmVkAHJhbmRvbXNlZWQAX19hZGQAcmFkAGxvYWQAdGhyZWFkAFwlMDNkAFwlZABJTklUX1VOS05PV05FWCBzdGFnZT0lZABpbnZhbGlkIGNhcHR1cmUgaW5kZXggJSUlZABicmVhayBvdXRzaWRlIGxvb3AgYXQgbGluZSAlZABmdW5jdGlvbiBhdCBsaW5lICVkAG5vIHZpc2libGUgbGFiZWwgJyVzJyBmb3IgPGdvdG8+IGF0IGxpbmUgJWQAbGFiZWwgJyVzJyBhbHJlYWR5IGRlZmluZWQgb24gbGluZSAlZABudW1lcmljAF9fZ2MAc2VjAF9fZGJjAHJiYWMAJWMAZ3N1YgBfX3N1YgByYgByd2EAG0x1YQBsaWdodCB1c2VyZGF0YQAlYQBpbnRlZ3JhbCBzaXplICglZCkgb3V0IG9mIGxpbWl0cyBbMSwlZF0APVtDXQAiXQB4WABQT1NJWABfRU5WACVVAEdNVAAueFhuTgB0YWJsZSBpbmRleCBpcyBOYU4AX1ZFUlNJT04ATkFOAExDX0FMTAAlSQBfRwBMQU5HAElORgBfTE9BREVEAEMAPT8APGludGVnZXI+ADxudW1iZXI+ADxzdHJpbmc+ADxlb2Y+ADxuYW1lPgA+PgB+PQA+PQA9PQA8PQA8PAA6OgAtMWU5OTk5AC0wMTIzNDU2Nzg5AHV0ZjgAQy5VVEYtOABMdWEgNS40AHNjZDIAZm9ybWF0IGFza3MgZm9yIGFsaWdubWVudCBub3QgcG93ZXIgb2YgMgAtMAAtIzAALy8AX0cuAC0rIzAgMTIzNDU2Nzg5LgAuLi4AXiQqKz8uKFslLQAtKwBfVUJPWCoAKHRlbXBvcmFyeSkAKEMgdGVtcG9yYXJ5KQBDQUxMRVJfVU5LTk9XTkVYICh3YXNtIHRyYXAgLyBub24tY3h4KQBzdGFjayBvdmVyZmxvdyAoJXMpACVzOiBiYWQgYmluYXJ5IGZvcm1hdCAoJXMpAGNhbGxpbmcgJyVzJyBvbiBiYWQgc2VsZiAoJXMpAGJhZCBhcmd1bWVudCAjJWQgKCVzKQBiYWQgYXJndW1lbnQgIyVkIHRvICclcycgKCVzKQBiYWQgJ2ZvcicgJXMgKG51bWJlciBleHBlY3RlZCwgZ290ICVzKQBpbnZhbGlkIHJlcGxhY2VtZW50IHZhbHVlIChhICVzKQAobm8gZXh0cmEgaW5mbykAKG51bGwpAChuaWwpACh2YXJhcmcpAGludmFsaWQgZm9ybWF0ICh0b28gbG9uZykAKG5vbi1zdHJpbmcpAChmb3Igc3RhdGUpAChubyBuYW1lKQA9KGxvYWQpAHRvbyBtYW55ICVzIChsaW1pdCBpcyAlZCkAJXMgZXhwZWN0ZWQgKHRvIGNsb3NlICVzIGF0IGxpbmUgJWQpAHVuZmluaXNoZWQgbG9uZyAlcyAoc3RhcnRpbmcgYXQgbGluZSAlZCkAKDAvMCkAYXR0ZW1wdCB0byBsb2FkIGEgJXMgY2h1bmsgKG1vZGUgaXMgJyVzJykAICglcyAnJXMnKQBtYWxmb3JtZWQgcGF0dGVybiAobWlzc2luZyBhcmd1bWVudHMgdG8gJyUlYicpAG1hbGZvcm1lZCBwYXR0ZXJuIChtaXNzaW5nICddJykAbWFsZm9ybWVkIHBhdHRlcm4gKGVuZHMgd2l0aCAnJSUnKQAgKABtaXNzaW5nICd9JwBtaXNzaW5nICd7JwB1bmZpbmlzaGVkIHN0cmluZyBmb3IgZm9ybWF0ICd6JwBpbnZhbGlkIGtleSB0byAnbmV4dCcAd3JvbmcgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byAnaW5zZXJ0JwBpbnZhbGlkIGNvbnZlcnNpb24gJyVzJyB0byAnZm9ybWF0JwBpbnZhbGlkIHZhbHVlICglcykgYXQgaW5kZXggJUkgaW4gdGFibGUgZm9yICdjb25jYXQnAGludmFsaWQgb3B0aW9uICclcycAPGdvdG8gJXM+IGF0IGxpbmUgJWQganVtcHMgaW50byB0aGUgc2NvcGUgb2YgbG9jYWwgJyVzJwB1bmtub3duIGF0dHJpYnV0ZSAnJXMnAGF0dGVtcHQgdG8gYXNzaWduIHRvIGNvbnN0IHZhcmlhYmxlICclcycAZXJyb3I6IHVua25vd24gbGliICclcycAYXR0ZW1wdCB0byAlcyBhICclcycgd2l0aCBhICclcycAaW52YWxpZCBjb252ZXJzaW9uIHNwZWNpZmljYXRpb246ICclcycAaW52YWxpZCBjb252ZXJzaW9uIHNwZWNpZmllciAnJSUlcycAaW52YWxpZCBvcHRpb24gJyUlJWMnIHRvICdsdWFfcHVzaGZzdHJpbmcnAG1pc3Npbmcgc2l6ZSBmb3IgZm9ybWF0IG9wdGlvbiAnYycAaW52YWxpZCBmb3JtYXQgb3B0aW9uICclYycAaW52YWxpZCBuZXh0IG9wdGlvbiBmb3Igb3B0aW9uICdYJwAnPFwlZD4nAGF0dGVtcHQgdG8gcGVyZm9ybSAnbiUlMCcAW3N0cmluZyAiAGFzc2VydGlvbiBmYWlsZWQhAGVycm9yIGluIABMdWEgd2FybmluZzogACVzOiVkOiAALSswIAAtKyMwIAAgDAoNCQsAd3JhcCBlcnI6ICVzCgAtLSBAbGliOiBqc29uCi0tIEBjYXRlZ29yeTogcGFyc2VyCi0tIEBkZXNjOiBKU09OIOino+aekC/nvJbnoIHvvIjnuq8gTHVh77yJCi0tIEBzb3VyY2U6IHZlbmRvcmVkIGh0dHBzOi8vZ2l0aHViLmNvbS9yeGkvanNvbi5sdWEgKE1JVCwgcnhpIDIwMjApCi0tIEByZXF1aXJlczogbm9uZQotLSBAbGljZW5zZTogTUlUICh2ZW5kb3JlZCByeGkvanNvbi5sdWEsIHJ4aSAyMDIwKQotLSBAbWF0dXJpdHk6IGF1ZGl0ZWQKLS0KLS0ganNvbi5sdWEKLS0KLS0gQ29weXJpZ2h0IChjKSAyMDIwIHJ4aQotLQotLSBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mCi0tIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlICJTb2Z0d2FyZSIpLCB0byBkZWFsIGluCi0tIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8KLS0gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMKLS0gb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvCi0tIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczoKLS0KLS0gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsCi0tIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuCi0tCi0tIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCAiQVMgSVMiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SCi0tIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLAotLSBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUKLS0gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUgotLSBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLAotLSBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRQotLSBTT0ZUV0FSRS4KLS0KCmxvY2FsIGpzb24gPSB7IF92ZXJzaW9uID0gIjAuMS4yIiB9CgotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCi0tIEVuY29kZQotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tCgpsb2NhbCBlbmNvZGUKCmxvY2FsIGVzY2FwZV9jaGFyX21hcCA9IHsKICBbICJcXCIgXSA9ICJcXCIsCiAgWyAiXCIiIF0gPSAiXCIiLAogIFsgIlxiIiBdID0gImIiLAogIFsgIlxmIiBdID0gImYiLAogIFsgIlxuIiBdID0gIm4iLAogIFsgIlxyIiBdID0gInIiLAogIFsgIlx0IiBdID0gInQiLAp9Cgpsb2NhbCBlc2NhcGVfY2hhcl9tYXBfaW52ID0geyBbICIvIiBdID0gIi8iIH0KZm9yIGssIHYgaW4gcGFpcnMoZXNjYXBlX2NoYXJfbWFwKSBkbwogIGVzY2FwZV9jaGFyX21hcF9pbnZbdl0gPSBrCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVzY2FwZV9jaGFyKGMpCiAgcmV0dXJuICJcXCIgLi4gKGVzY2FwZV9jaGFyX21hcFtjXSBvciBzdHJpbmcuZm9ybWF0KCJ1JTA0eCIsIGM6Ynl0ZSgpKSkKZW5kCgoKbG9jYWwgZnVuY3Rpb24gZW5jb2RlX25pbCh2YWwpCiAgcmV0dXJuICJudWxsIgplbmQKCgpsb2NhbCBmdW5jdGlvbiBlbmNvZGVfdGFibGUodmFsLCBzdGFjaykKICBsb2NhbCByZXMgPSB7fQogIHN0YWNrID0gc3RhY2sgb3Ige30KCiAgLS0gQ2lyY3VsYXIgcmVmZXJlbmNlPwogIGlmIHN0YWNrW3ZhbF0gdGhlbiBlcnJvcigiY2lyY3VsYXIgcmVmZXJlbmNlIikgZW5kCgogIHN0YWNrW3ZhbF0gPSB0cnVlCgogIGlmIHJhd2dldCh2YWwsIDEpIH49IG5pbCBvciBuZXh0KHZhbCkgPT0gbmlsIHRoZW4KICAgIC0tIFRyZWF0IGFzIGFycmF5IC0tIGNoZWNrIGtleXMgYXJlIHZhbGlkIGFuZCBpdCBpcyBub3Qgc3BhcnNlCiAgICBsb2NhbCBuID0gMAogICAgZm9yIGsgaW4gcGFpcnModmFsKSBkbwogICAgICBpZiB0eXBlKGspIH49ICJudW1iZXIiIHRoZW4KICAgICAgICBlcnJvcigiaW52YWxpZCB0YWJsZTogbWl4ZWQgb3IgaW52YWxpZCBrZXkgdHlwZXMiKQogICAgICBlbmQKICAgICAgbiA9IG4gKyAxCiAgICBlbmQKICAgIGlmIG4gfj0gI3ZhbCB0aGVuCiAgICAgIGVycm9yKCJpbnZhbGlkIHRhYmxlOiBzcGFyc2UgYXJyYXkiKQogICAgZW5kCiAgICAtLSBFbmNvZGUKICAgIGZvciBpLCB2IGluIGlwYWlycyh2YWwpIGRvCiAgICAgIHRhYmxlLmluc2VydChyZXMsIGVuY29kZSh2LCBzdGFjaykpCiAgICBlbmQKICAgIHN0YWNrW3ZhbF0gPSBuaWwKICAgIHJldHVybiAiWyIgLi4gdGFibGUuY29uY2F0KHJlcywgIiwiKSAuLiAiXSIKCiAgZWxzZQogICAgLS0gVHJlYXQgYXMgYW4gb2JqZWN0CiAgICBmb3IgaywgdiBpbiBwYWlycyh2YWwpIGRvCiAgICAgIGlmIHR5cGUoaykgfj0gInN0cmluZyIgdGhlbgogICAgICAgIGVycm9yKCJpbnZhbGlkIHRhYmxlOiBtaXhlZCBvciBpbnZhbGlkIGtleSB0eXBlcyIpCiAgICAgIGVuZAogICAgICB0YWJsZS5pbnNlcnQocmVzLCBlbmNvZGUoaywgc3RhY2spIC4uICI6IiAuLiBlbmNvZGUodiwgc3RhY2spKQogICAgZW5kCiAgICBzdGFja1t2YWxdID0gbmlsCiAgICByZXR1cm4gInsiIC4uIHRhYmxlLmNvbmNhdChyZXMsICIsIikgLi4gIn0iCiAgZW5kCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVuY29kZV9zdHJpbmcodmFsKQogIHJldHVybiAnIicgLi4gdmFsOmdzdWIoJ1slelwxLVwzMVxcIl0nLCBlc2NhcGVfY2hhcikgLi4gJyInCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGVuY29kZV9udW1iZXIodmFsKQogIC0tIENoZWNrIGZvciBOYU4sIC1pbmYgYW5kIGluZgogIGlmIHZhbCB+PSB2YWwgb3IgdmFsIDw9IC1tYXRoLmh1Z2Ugb3IgdmFsID49IG1hdGguaHVnZSB0aGVuCiAgICBlcnJvcigidW5leHBlY3RlZCBudW1iZXIgdmFsdWUgJyIgLi4gdG9zdHJpbmcodmFsKSAuLiAiJyIpCiAgZW5kCiAgcmV0dXJuIHN0cmluZy5mb3JtYXQoIiUuMTRnIiwgdmFsKQplbmQKCgpsb2NhbCB0eXBlX2Z1bmNfbWFwID0gewogIFsgIm5pbCIgICAgIF0gPSBlbmNvZGVfbmlsLAogIFsgInRhYmxlIiAgIF0gPSBlbmNvZGVfdGFibGUsCiAgWyAic3RyaW5nIiAgXSA9IGVuY29kZV9zdHJpbmcsCiAgWyAibnVtYmVyIiAgXSA9IGVuY29kZV9udW1iZXIsCiAgWyAiYm9vbGVhbiIgXSA9IHRvc3RyaW5nLAp9CgoKZW5jb2RlID0gZnVuY3Rpb24odmFsLCBzdGFjaykKICBsb2NhbCB0ID0gdHlwZSh2YWwpCiAgbG9jYWwgZiA9IHR5cGVfZnVuY19tYXBbdF0KICBpZiBmIHRoZW4KICAgIHJldHVybiBmKHZhbCwgc3RhY2spCiAgZW5kCiAgZXJyb3IoInVuZXhwZWN0ZWQgdHlwZSAnIiAuLiB0IC4uICInIikKZW5kCgoKZnVuY3Rpb24ganNvbi5lbmNvZGUodmFsKQogIHJldHVybiAoIGVuY29kZSh2YWwpICkKZW5kCgoKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQotLSBEZWNvZGUKLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLQoKbG9jYWwgcGFyc2UKCmxvY2FsIGZ1bmN0aW9uIGNyZWF0ZV9zZXQoLi4uKQogIGxvY2FsIHJlcyA9IHt9CiAgZm9yIGkgPSAxLCBzZWxlY3QoIiMiLCAuLi4pIGRvCiAgICByZXNbIHNlbGVjdChpLCAuLi4pIF0gPSB0cnVlCiAgZW5kCiAgcmV0dXJuIHJlcwplbmQKCmxvY2FsIHNwYWNlX2NoYXJzICAgPSBjcmVhdGVfc2V0KCIgIiwgIlx0IiwgIlxyIiwgIlxuIikKbG9jYWwgZGVsaW1fY2hhcnMgICA9IGNyZWF0ZV9zZXQoIiAiLCAiXHQiLCAiXHIiLCAiXG4iLCAiXSIsICJ9IiwgIiwiKQpsb2NhbCBlc2NhcGVfY2hhcnMgID0gY3JlYXRlX3NldCgiXFwiLCAiLyIsICciJywgImIiLCAiZiIsICJuIiwgInIiLCAidCIsICJ1IikKbG9jYWwgbGl0ZXJhbHMgICAgICA9IGNyZWF0ZV9zZXQoInRydWUiLCAiZmFsc2UiLCAibnVsbCIpCgpsb2NhbCBsaXRlcmFsX21hcCA9IHsKICBbICJ0cnVlIiAgXSA9IHRydWUsCiAgWyAiZmFsc2UiIF0gPSBmYWxzZSwKICBbICJudWxsIiAgXSA9IG5pbCwKfQoKCmxvY2FsIGZ1bmN0aW9uIG5leHRfY2hhcihzdHIsIGlkeCwgc2V0LCBuZWdhdGUpCiAgZm9yIGkgPSBpZHgsICNzdHIgZG8KICAgIGlmIHNldFtzdHI6c3ViKGksIGkpXSB+PSBuZWdhdGUgdGhlbgogICAgICByZXR1cm4gaQogICAgZW5kCiAgZW5kCiAgcmV0dXJuICNzdHIgKyAxCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGRlY29kZV9lcnJvcihzdHIsIGlkeCwgbXNnKQogIGxvY2FsIGxpbmVfY291bnQgPSAxCiAgbG9jYWwgY29sX2NvdW50ID0gMQogIGZvciBpID0gMSwgaWR4IC0gMSBkbwogICAgY29sX2NvdW50ID0gY29sX2NvdW50ICsgMQogICAgaWYgc3RyOnN1YihpLCBpKSA9PSAiXG4iIHRoZW4KICAgICAgbGluZV9jb3VudCA9IGxpbmVfY291bnQgKyAxCiAgICAgIGNvbF9jb3VudCA9IDEKICAgIGVuZAogIGVuZAogIGVycm9yKCBzdHJpbmcuZm9ybWF0KCIlcyBhdCBsaW5lICVkIGNvbCAlZCIsIG1zZywgbGluZV9jb3VudCwgY29sX2NvdW50KSApCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIGNvZGVwb2ludF90b191dGY4KG4pCiAgLS0gaHR0cDovL3NjcmlwdHMuc2lsLm9yZy9jbXMvc2NyaXB0cy9wYWdlLnBocD9zaXRlX2lkPW5yc2kmaWQ9aXdzLWFwcGVuZGl4YQogIGxvY2FsIGYgPSBtYXRoLmZsb29yCiAgaWYgbiA8PSAweDdmIHRoZW4KICAgIHJldHVybiBzdHJpbmcuY2hhcihuKQogIGVsc2VpZiBuIDw9IDB4N2ZmIHRoZW4KICAgIHJldHVybiBzdHJpbmcuY2hhcihmKG4gLyA2NCkgKyAxOTIsIG4gJSA2NCArIDEyOCkKICBlbHNlaWYgbiA8PSAweGZmZmYgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKGYobiAvIDQwOTYpICsgMjI0LCBmKG4gJSA0MDk2IC8gNjQpICsgMTI4LCBuICUgNjQgKyAxMjgpCiAgZWxzZWlmIG4gPD0gMHgxMGZmZmYgdGhlbgogICAgcmV0dXJuIHN0cmluZy5jaGFyKGYobiAvIDI2MjE0NCkgKyAyNDAsIGYobiAlIDI2MjE0NCAvIDQwOTYpICsgMTI4LAogICAgICAgICAgICAgICAgICAgICAgIGYobiAlIDQwOTYgLyA2NCkgKyAxMjgsIG4gJSA2NCArIDEyOCkKICBlbmQKICBlcnJvciggc3RyaW5nLmZvcm1hdCgiaW52YWxpZCB1bmljb2RlIGNvZGVwb2ludCAnJXgnIiwgbikgKQplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV91bmljb2RlX2VzY2FwZShzKQogIGxvY2FsIG4xID0gdG9udW1iZXIoIHM6c3ViKDEsIDQpLCAgMTYgKQogIGxvY2FsIG4yID0gdG9udW1iZXIoIHM6c3ViKDcsIDEwKSwgMTYgKQogICAtLSBTdXJyb2dhdGUgcGFpcj8KICBpZiBuMiB0aGVuCiAgICByZXR1cm4gY29kZXBvaW50X3RvX3V0ZjgoKG4xIC0gMHhkODAwKSAqIDB4NDAwICsgKG4yIC0gMHhkYzAwKSArIDB4MTAwMDApCiAgZWxzZQogICAgcmV0dXJuIGNvZGVwb2ludF90b191dGY4KG4xKQogIGVuZAplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9zdHJpbmcoc3RyLCBpKQogIGxvY2FsIHJlcyA9ICIiCiAgbG9jYWwgaiA9IGkgKyAxCiAgbG9jYWwgayA9IGoKCiAgd2hpbGUgaiA8PSAjc3RyIGRvCiAgICBsb2NhbCB4ID0gc3RyOmJ5dGUoaikKCiAgICBpZiB4IDwgMzIgdGhlbgogICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBqLCAiY29udHJvbCBjaGFyYWN0ZXIgaW4gc3RyaW5nIikKCiAgICBlbHNlaWYgeCA9PSA5MiB0aGVuIC0tIGBcYDogRXNjYXBlCiAgICAgIHJlcyA9IHJlcyAuLiBzdHI6c3ViKGssIGogLSAxKQogICAgICBqID0gaiArIDEKICAgICAgbG9jYWwgYyA9IHN0cjpzdWIoaiwgaikKICAgICAgaWYgYyA9PSAidSIgdGhlbgogICAgICAgIGxvY2FsIGhleCA9IHN0cjptYXRjaCgiXltkRF1bODlhQWJCXSV4JXhcXHUleCV4JXgleCIsIGogKyAxKQogICAgICAgICAgICAgICAgIG9yIHN0cjptYXRjaCgiXiV4JXgleCV4IiwgaiArIDEpCiAgICAgICAgICAgICAgICAgb3IgZGVjb2RlX2Vycm9yKHN0ciwgaiAtIDEsICJpbnZhbGlkIHVuaWNvZGUgZXNjYXBlIGluIHN0cmluZyIpCiAgICAgICAgcmVzID0gcmVzIC4uIHBhcnNlX3VuaWNvZGVfZXNjYXBlKGhleCkKICAgICAgICBqID0gaiArICNoZXgKICAgICAgZWxzZQogICAgICAgIGlmIG5vdCBlc2NhcGVfY2hhcnNbY10gdGhlbgogICAgICAgICAgZGVjb2RlX2Vycm9yKHN0ciwgaiAtIDEsICJpbnZhbGlkIGVzY2FwZSBjaGFyICciIC4uIGMgLi4gIicgaW4gc3RyaW5nIikKICAgICAgICBlbmQKICAgICAgICByZXMgPSByZXMgLi4gZXNjYXBlX2NoYXJfbWFwX2ludltjXQogICAgICBlbmQKICAgICAgayA9IGogKyAxCgogICAgZWxzZWlmIHggPT0gMzQgdGhlbiAtLSBgImA6IEVuZCBvZiBzdHJpbmcKICAgICAgcmVzID0gcmVzIC4uIHN0cjpzdWIoaywgaiAtIDEpCiAgICAgIHJldHVybiByZXMsIGogKyAxCiAgICBlbmQKCiAgICBqID0gaiArIDEKICBlbmQKCiAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImV4cGVjdGVkIGNsb3NpbmcgcXVvdGUgZm9yIHN0cmluZyIpCmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX251bWJlcihzdHIsIGkpCiAgbG9jYWwgeCA9IG5leHRfY2hhcihzdHIsIGksIGRlbGltX2NoYXJzKQogIGxvY2FsIHMgPSBzdHI6c3ViKGksIHggLSAxKQogIGxvY2FsIG4gPSB0b251bWJlcihzKQogIGlmIG5vdCBuIHRoZW4KICAgIGRlY29kZV9lcnJvcihzdHIsIGksICJpbnZhbGlkIG51bWJlciAnIiAuLiBzIC4uICInIikKICBlbmQKICByZXR1cm4gbiwgeAplbmQKCgpsb2NhbCBmdW5jdGlvbiBwYXJzZV9saXRlcmFsKHN0ciwgaSkKICBsb2NhbCB4ID0gbmV4dF9jaGFyKHN0ciwgaSwgZGVsaW1fY2hhcnMpCiAgbG9jYWwgd29yZCA9IHN0cjpzdWIoaSwgeCAtIDEpCiAgaWYgbm90IGxpdGVyYWxzW3dvcmRdIHRoZW4KICAgIGRlY29kZV9lcnJvcihzdHIsIGksICJpbnZhbGlkIGxpdGVyYWwgJyIgLi4gd29yZCAuLiAiJyIpCiAgZW5kCiAgcmV0dXJuIGxpdGVyYWxfbWFwW3dvcmRdLCB4CmVuZAoKCmxvY2FsIGZ1bmN0aW9uIHBhcnNlX2FycmF5KHN0ciwgaSkKICBsb2NhbCByZXMgPSB7fQogIGxvY2FsIG4gPSAxCiAgaSA9IGkgKyAxCiAgd2hpbGUgMSBkbwogICAgbG9jYWwgeAogICAgaSA9IG5leHRfY2hhcihzdHIsIGksIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgLS0gRW1wdHkgLyBlbmQgb2YgYXJyYXk/CiAgICBpZiBzdHI6c3ViKGksIGkpID09ICJdIiB0aGVuCiAgICAgIGkgPSBpICsgMQogICAgICBicmVhawogICAgZW5kCiAgICAtLSBSZWFkIHRva2VuCiAgICB4LCBpID0gcGFyc2Uoc3RyLCBpKQogICAgcmVzW25dID0geAogICAgbiA9IG4gKyAxCiAgICAtLSBOZXh0IHRva2VuCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICBsb2NhbCBjaHIgPSBzdHI6c3ViKGksIGkpCiAgICBpID0gaSArIDEKICAgIGlmIGNociA9PSAiXSIgdGhlbiBicmVhayBlbmQKICAgIGlmIGNociB+PSAiLCIgdGhlbiBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgJ10nIG9yICcsJyIpIGVuZAogIGVuZAogIHJldHVybiByZXMsIGkKZW5kCgoKbG9jYWwgZnVuY3Rpb24gcGFyc2Vfb2JqZWN0KHN0ciwgaSkKICBsb2NhbCByZXMgPSB7fQogIGkgPSBpICsgMQogIHdoaWxlIDEgZG8KICAgIGxvY2FsIGtleSwgdmFsCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSwgc3BhY2VfY2hhcnMsIHRydWUpCiAgICAtLSBFbXB0eSAvIGVuZCBvZiBvYmplY3Q/CiAgICBpZiBzdHI6c3ViKGksIGkpID09ICJ9IiB0aGVuCiAgICAgIGkgPSBpICsgMQogICAgICBicmVhawogICAgZW5kCiAgICAtLSBSZWFkIGtleQogICAgaWYgc3RyOnN1YihpLCBpKSB+PSAnIicgdGhlbgogICAgICBkZWNvZGVfZXJyb3Ioc3RyLCBpLCAiZXhwZWN0ZWQgc3RyaW5nIGZvciBrZXkiKQogICAgZW5kCiAgICBrZXksIGkgPSBwYXJzZShzdHIsIGkpCiAgICAtLSBSZWFkICc6JyBkZWxpbWl0ZXIKICAgIGkgPSBuZXh0X2NoYXIoc3RyLCBpLCBzcGFjZV9jaGFycywgdHJ1ZSkKICAgIGlmIHN0cjpzdWIoaSwgaSkgfj0gIjoiIHRoZW4KICAgICAgZGVjb2RlX2Vycm9yKHN0ciwgaSwgImV4cGVjdGVkICc6JyBhZnRlciBrZXkiKQogICAgZW5kCiAgICBpID0gbmV4dF9jaGFyKHN0ciwgaSArIDEsIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgLS0gUmVhZCB2YWx1ZQogICAgdmFsLCBpID0gcGFyc2Uoc3RyLCBpKQogICAgLS0gU2V0CiAgICByZXNba2V5XSA9IHZhbAogICAgLS0gTmV4dCB0b2tlbgogICAgaSA9IG5leHRfY2hhcihzdHIsIGksIHNwYWNlX2NoYXJzLCB0cnVlKQogICAgbG9jYWwgY2hyID0gc3RyOnN1YihpLCBpKQogICAgaSA9IGkgKyAxCiAgICBpZiBjaHIgPT0gIn0iIHRoZW4gYnJlYWsgZW5kCiAgICBpZiBjaHIgfj0gIiwiIHRoZW4gZGVjb2RlX2Vycm9yKHN0ciwgaSwgImV4cGVjdGVkICd9JyBvciAnLCciKSBlbmQKICBlbmQKICByZXR1cm4gcmVzLCBpCmVuZAoKCmxvY2FsIGNoYXJfZnVuY19tYXAgPSB7CiAgWyAnIicgXSA9IHBhcnNlX3N0cmluZywKICBbICIwIiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjEiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiMiIgXSA9IHBhcnNlX251bWJlciwKICBbICIzIiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjQiIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiNSIgXSA9IHBhcnNlX251bWJlciwKICBbICI2IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIjciIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAiOCIgXSA9IHBhcnNlX251bWJlciwKICBbICI5IiBdID0gcGFyc2VfbnVtYmVyLAogIFsgIi0iIF0gPSBwYXJzZV9udW1iZXIsCiAgWyAidCIgXSA9IHBhcnNlX2xpdGVyYWwsCiAgWyAiZiIgXSA9IHBhcnNlX2xpdGVyYWwsCiAgWyAibiIgXSA9IHBhcnNlX2xpdGVyYWwsCiAgWyAiWyIgXSA9IHBhcnNlX2FycmF5LAogIFsgInsiIF0gPSBwYXJzZV9vYmplY3QsCn0KCgpwYXJzZSA9IGZ1bmN0aW9uKHN0ciwgaWR4KQogIGxvY2FsIGNociA9IHN0cjpzdWIoaWR4LCBpZHgpCiAgbG9jYWwgZiA9IGNoYXJfZnVuY19tYXBbY2hyXQogIGlmIGYgdGhlbgogICAgcmV0dXJuIGYoc3RyLCBpZHgpCiAgZW5kCiAgZGVjb2RlX2Vycm9yKHN0ciwgaWR4LCAidW5leHBlY3RlZCBjaGFyYWN0ZXIgJyIgLi4gY2hyIC4uICInIikKZW5kCgoKZnVuY3Rpb24ganNvbi5kZWNvZGUoc3RyKQogIGlmIHR5cGUoc3RyKSB+PSAic3RyaW5nIiB0aGVuCiAgICBlcnJvcigiZXhwZWN0ZWQgYXJndW1lbnQgb2YgdHlwZSBzdHJpbmcsIGdvdCAiIC4uIHR5cGUoc3RyKSkKICBlbmQKICBsb2NhbCByZXMsIGlkeCA9IHBhcnNlKHN0ciwgbmV4dF9jaGFyKHN0ciwgMSwgc3BhY2VfY2hhcnMsIHRydWUpKQogIGlkeCA9IG5leHRfY2hhcihzdHIsIGlkeCwgc3BhY2VfY2hhcnMsIHRydWUpCiAgaWYgaWR4IDw9ICNzdHIgdGhlbgogICAgZGVjb2RlX2Vycm9yKHN0ciwgaWR4LCAidHJhaWxpbmcgZ2FyYmFnZSIpCiAgZW5kCiAgcmV0dXJuIHJlcwplbmQKCgpyZXR1cm4ganNvbgoALS0gaW5jcmVtZW50YWwubHVhOiDlop7ph4/liqDovb3vvIjmsLTkvY3muLjmoIfvvInigJTigJRhcHBlbmQtb25seSDooajlj6rliqDovb3mlrDooYzvvIgyMDI2LTA4LTEz77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IGF1ZGl0ZWQKLS0g6ZyA6KaB5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJpfZHVja2RiX2NhbGwgLyBfZHVja2RiX3F1ZXJ5Ci0tCi0tIOeUqOazle+8iGluc3RhbGwg5ZCO77yJ77yaCi0tICAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGUgOj0gJ2luc3RhbGwnLCBzcWxfbmFtZSA6PSAnaW5jcmVtZW50YWwnKTsKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnY29tcGlsZScsIHNxbF9uYW1lIDo9ICdpbmNyX3J1bicsCi0tICAgICBzb3VyY2UgOj0gJ3JldHVybiBmdW5jdGlvbihvcHRzKSByZXR1cm4gaW5jcmVtZW50YWwucnVuKG9wdHMpIGVuZCcpOwotLSAgIFNFTEVDVCBpbmNyX3J1bih7dGFyZ2V0Oj0ndGd0X29yZGVycycsIHNvdXJjZTo9J3NyY19vcmRlcnMnLCB0c19jb2w6PSd0cycsIG1vZGU6PSd0cyd9KTsKLS0KLS0g5ri45qCH5qih5byPIG1vZGXvvJoKLS0gICAndHMnICAgIOKAlOKAlCBXSEVSRSB0cyA+IGxhc3RfdHMgICAgICAgICAgICAgICAgICAgICAgICDmjInml7bpl7Tlop7ph48KLS0gICAnaWQnICAgIOKAlOKAlCBXSEVSRSBpZCA+IGxhc3RfaWQgICAgICAgICAgICAgICAgICAgICAgICDmjInoh6rlop7plK7lop7ph48KLS0gICAndHNfaWQnIOKAlOKAlCBXSEVSRSB0cyA+IGxhc3RfdHMgT1IgKHRzID0gbGFzdF90cyBBTkQgaWQgPiBsYXN0X2lkKSAg5aSN5ZCI5ri45qCH77yM5ZCM5pe26Ze05oiz5LiN5ryP5LiN6YeNCi0tCi0tIOawtOS9jeihqO+8mmV0bF93YXRlcm1hcmsobmFtZSBWQVJDSEFSIFBLLCBsYXN0X3RzIFRJTUVTVEFNUCwgbGFzdF9pZCBCSUdJTlQsIHVwZGF0ZWRfYXQgVElNRVNUQU1QKQotLSDnuqblrprvvJpzb3VyY2Ug5LiOIHRhcmdldCDliJfluo/kuIDoh7TvvIhJTlNFUlQgSU5UTyB0YXJnZXQgU0VMRUNUICogRlJPTSBzb3VyY2XvvIkKCmxvY2FsIGluY3JlbWVudGFsID0ge30KaW5jcmVtZW50YWwud2F0ZXJtYXJrX3RhYmxlID0gJ2V0bF93YXRlcm1hcmsnCgpsb2NhbCBmdW5jdGlvbiBlc2ModikKICBpZiB0eXBlKHYpID09ICdzdHJpbmcnIHRoZW4gcmV0dXJuICInIiAuLiB2OmdzdWIoIiciLCAiJyciKSAuLiAiJyIgZW5kCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gJ05VTEwnIGVuZAogIHJldHVybiB0b3N0cmluZyh2KQplbmQKCi0tIEpTT04g5a2X56ym5Liy6L2s5LmJ77yI6L+U5Zue5YC857uZIFNRTCDnq68ganNvbl9leHRyYWN0IOeUqO+8iQpsb2NhbCBmdW5jdGlvbiBqc3RyKHYpCiAgaWYgdiA9PSBuaWwgdGhlbiByZXR1cm4gJ251bGwnIGVuZAogIGlmIHR5cGUodikgPT0gJ251bWJlcicgdGhlbiByZXR1cm4gdG9zdHJpbmcodikgZW5kCiAgcmV0dXJuICciJyAuLiB0b3N0cmluZyh2KTpnc3ViKCciJywgJ1xcIicpIC4uICciJwplbmQKCmxvY2FsIGZ1bmN0aW9uIGpyZXMobG9hZGVkLCBsYXN0X3RzLCBsYXN0X2lkKQogIHJldHVybiAneyJsb2FkZWQiOicgLi4gdG9zdHJpbmcobG9hZGVkKSAuLiAnLCJsYXN0X3RzIjonIC4uIGpzdHIobGFzdF90cykKICAgIC4uICcsImxhc3RfaWQiOicgLi4ganN0cihsYXN0X2lkKSAuLiAnfScKZW5kCgotLSDliJ3lp4vljJbmsLTkvY3ooajvvIjluYLnrYnvvIkKZnVuY3Rpb24gaW5jcmVtZW50YWwuaW5pdCgpCiAgX2R1Y2tkYl9jYWxsKCdDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAnIC4uIGluY3JlbWVudGFsLndhdGVybWFya190YWJsZQogICAgLi4gJyAobmFtZSBWQVJDSEFSIFBSSU1BUlkgS0VZLCBsYXN0X3RzIFRJTUVTVEFNUCwgbGFzdF9pZCBCSUdJTlQsIHVwZGF0ZWRfYXQgVElNRVNUQU1QKScpCmVuZAoKLS0g6K+75rC05L2N77ya6L+U5ZueIHt0cz0uLi4sIGlkPS4uLn0g5oiWIG5pbO+8iOmmluasoe+8iQpmdW5jdGlvbiBpbmNyZW1lbnRhbC53YXRlcm1hcmsobmFtZSkKICBpbmNyZW1lbnRhbC5pbml0KCkKICBsb2NhbCByb3dzID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIGxhc3RfdHMsIGxhc3RfaWQgRlJPTSAnIC4uIGluY3JlbWVudGFsLndhdGVybWFya190YWJsZQogICAgLi4gJyBXSEVSRSBuYW1lID0gJyAuLiBlc2MobmFtZSkpCiAgaWYgbm90IHJvd3Mgb3IgI3Jvd3MgPT0gMCB0aGVuIHJldHVybiBuaWwgZW5kCiAgcmV0dXJuIHsgdHMgPSByb3dzWzFdLmxhc3RfdHMsIGlkID0gcm93c1sxXS5sYXN0X2lkIH0KZW5kCgotLSDmuIXmsLTkvY3vvIjph43mlrDlhajph4/vvIkKZnVuY3Rpb24gaW5jcmVtZW50YWwucmVzZXQobmFtZSkKICBpbmNyZW1lbnRhbC5pbml0KCkKICBfZHVja2RiX2NhbGwoJ0RFTEVURSBGUk9NICcgLi4gaW5jcmVtZW50YWwud2F0ZXJtYXJrX3RhYmxlIC4uICcgV0hFUkUgbmFtZSA9ICcgLi4gZXNjKG5hbWUpKQplbmQKCi0tIOaJp+ihjOWinumHj+WKoOi9vQotLSBvcHRzID0geyB0YXJnZXQ955uu5qCH6KGoLCBzb3VyY2U95rqQ6KGoLCB0c19jb2w9PywgaWRfY29sPT8sIG1vZGU9J3RzJ3wnaWQnfCd0c19pZCcgfQotLSDov5Tlm54ge2xvYWRlZD1OLCBsYXN0X3RzPT8sIGxhc3RfaWQ9P30KZnVuY3Rpb24gaW5jcmVtZW50YWwucnVuKG9wdHMpCiAgb3B0cyA9IG9wdHMgb3Ige30KICBsb2NhbCB0YXJnZXQsIHNvdXJjZSA9IG9wdHMudGFyZ2V0LCBvcHRzLnNvdXJjZQogIGlmIG5vdCB0YXJnZXQgb3Igbm90IHNvdXJjZSB0aGVuIGVycm9yKCdpbmNyZW1lbnRhbDogdGFyZ2V0IGFuZCBzb3VyY2UgcmVxdWlyZWQnLCAwKSBlbmQKICBsb2NhbCBtb2RlID0gb3B0cy5tb2RlIG9yICd0cycKICBsb2NhbCB0c19jb2wsIGlkX2NvbCA9IG9wdHMudHNfY29sLCBvcHRzLmlkX2NvbAogIGlmIG1vZGUgPT0gJ3RzJyBhbmQgbm90IHRzX2NvbCB0aGVuIGVycm9yKCdpbmNyZW1lbnRhbDogdHNfY29sIHJlcXVpcmVkIGZvciBtb2RlPXRzJywgMCkgZW5kCiAgaWYgbW9kZSA9PSAnaWQnIGFuZCBub3QgaWRfY29sIHRoZW4gZXJyb3IoJ2luY3JlbWVudGFsOiBpZF9jb2wgcmVxdWlyZWQgZm9yIG1vZGU9aWQnLCAwKSBlbmQKICBpZiBtb2RlID09ICd0c19pZCcgYW5kIChub3QgdHNfY29sIG9yIG5vdCBpZF9jb2wpIHRoZW4KICAgIGVycm9yKCdpbmNyZW1lbnRhbDogdHNfY29sIGFuZCBpZF9jb2wgcmVxdWlyZWQgZm9yIG1vZGU9dHNfaWQnLCAwKSBlbmQKCiAgbG9jYWwgd20gPSBpbmNyZW1lbnRhbC53YXRlcm1hcmsodGFyZ2V0KQogIGxvY2FsIHdoZXJlID0gJycKICBpZiB3bSB0aGVuCiAgICBpZiBtb2RlID09ICd0cycgdGhlbgogICAgICB3aGVyZSA9ICcgV0hFUkUgJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKQogICAgZWxzZWlmIG1vZGUgPT0gJ2lkJyB0aGVuCiAgICAgIHdoZXJlID0gJyBXSEVSRSAnIC4uIGlkX2NvbCAuLiAnID4gJyAuLiBlc2Mod20uaWQpCiAgICBlbHNlCiAgICAgIHdoZXJlID0gJyBXSEVSRSAoJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKSAuLiAnKSBPUiAoJwogICAgICAgIC4uIHRzX2NvbCAuLiAnID0gJyAuLiBlc2Mod20udHMpIC4uICcgQU5EICcgLi4gaWRfY29sIC4uICcgPiAnIC4uIGVzYyh3bS5pZCkgLi4gJyknCiAgICBlbmQKICBlbmQKICBsb2NhbCBzZWwgPSAnU0VMRUNUICogRlJPTSAnIC4uIHNvdXJjZSAuLiB3aGVyZQoKICAtLSDpooTkvLDmnKzmrKHliqDovb3ooYzmlbAKICBsb2NhbCBucSwgZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gKCcgLi4gc2VsIC4uICcpJykKICBpZiBub3QgbnEgdGhlbiBlcnJvcignaW5jcmVtZW50YWw6ICcgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKG5xWzFdLm4pIG9yIDAKCiAgaWYgbiA+IDAgdGhlbgogICAgbG9jYWwgciA9IF9kdWNrZGJfY2FsbCgnSU5TRVJUIElOVE8gJyAuLiB0YXJnZXQgLi4gJyAnIC4uIHNlbCkKICAgIGlmIHR5cGUocikgPT0gJ3N0cmluZycgYW5kIHI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHI6c3ViKDcpLCAwKSBlbmQKCiAgICAtLSDmlrDmsLTkvY3vvJp0cyDlj5bmnKzmrKHmnIDlpKfvvJtpZCDlj5bmnKzmrKHmnIDlpKcKICAgIGxvY2FsIG5ld190cywgbmV3X2lkID0gbmlsLCBuaWwKICAgIGlmIG1vZGUgfj0gJ2lkJyB0aGVuCiAgICAgIGxvY2FsIG0gPSBfZHVja2RiX3F1ZXJ5KCdTRUxFQ1QgbWF4KCcgLi4gdHNfY29sIC4uICcpIEFTIHQgRlJPTSAoJyAuLiBzZWwgLi4gJyknKQogICAgICBpZiBtIHRoZW4gbmV3X3RzID0gbVsxXS50IGVuZAogICAgZW5kCiAgICBpZiBtb2RlIH49ICd0cycgdGhlbgogICAgICBsb2NhbCBtID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIG1heCgnIC4uIGlkX2NvbCAuLiAnKSBBUyBpIEZST00gKCcgLi4gc2VsIC4uICcpJykKICAgICAgaWYgbSB0aGVuIG5ld19pZCA9IG1bMV0uaSBlbmQKICAgIGVuZAogICAgaWYgbmV3X3RzIG9yIG5ld19pZCB0aGVuCiAgICAgIF9kdWNrZGJfY2FsbCgnSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyAnIC4uIGluY3JlbWVudGFsLndhdGVybWFya190YWJsZQogICAgICAgIC4uICcgVkFMVUVTICgnIC4uIGVzYyh0YXJnZXQpIC4uICcsICcgLi4gZXNjKG5ld190cykgLi4gJywgJyAuLiBlc2MobmV3X2lkKSAuLiAnLCBub3coKSknKQogICAgZW5kCiAgICByZXR1cm4ganJlcyhuLCBuZXdfdHMsIG5ld19pZCkKICBlbmQKICByZXR1cm4ganJlcygwLCB3bSBhbmQgd20udHMgb3IgbmlsLCB3bSBhbmQgd20uaWQgb3IgbmlsKQplbmQKCnJldHVybiBpbmNyZW1lbnRhbAoALS0gdG9fbGFuY2UubHVhOiDlop7ph4/liqDovb0g4oaSIExhbmNlIOaVsOaNrumbhuiQveWcsOerr++8iDIwMjYtMTAtMTbvvIkKLS0gQGxpYjogdG9fbGFuY2UKLS0gQGNhdGVnb3J5OiBldGwKLS0gQGRlc2M6IOWinumHj+WKoOi9veeahCBMYW5jZSDokL3lnLDnq6/igJTigJTkuI4gaW5jcmVtZW50YWwg5ZCM5p6E77yI5rC05L2N6KGoIGV0bF93YXRlcm1hcmsgLyB0c3xpZHx0c19pZCDkuInmuLjmoIfvvInvvIx0YXJnZXQg5pivIExhbmNlIOaVsOaNrumbhu+8mummlui3kSBDT1BZIENyZWF0ZeOAgeWQjue7rSBDT1BZIEFQUEVORO+8jOavj+asoeWGmeWPkeW4g+aWsCBkYXRhc2V0IHZlcnNpb27vvIjpnIAgbGFuY2VfY29udmVyc2lvbiDmianlsZXvvIkKLS0gQHNvdXJjZTogb3JpZ2luYWwKLS0gQHJlcXVpcmVzOiBsYW5jZV9jb252ZXJzaW9uIOaJqeWxle+8iOWQjOS8muivnSBMT0FE77yJ77yb5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJpfZHVja2RiX2NhbGwgLyBfZHVja2RiX3F1ZXJ5Ci0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLQotLSDkuI4gaW5jcmVtZW50YWwucnVuIOeahOWIhuW3pe+8iOWQjOS4gOawtOS9jeWNj+iuru+8jOS4pOS4quWHuuWPo++8ie+8mgotLSAgIGluY3JlbWVudGFsIOKGkiBEdWNrREIg6KGoIC8gRHVja0xha2Ug6KGo77yI566h5b+r54WnL0NEQ++8iQotLSAgIHRvX2xhbmNlICAgIOKGkiBMYW5jZSDmlbDmja7pm4bvvIjnrqHlkJHph48v5aSa5qih5oCBL+ajgOe0ou+8m+WumOaWuSBsYW5jZSDmianlsZXlj6/or7vlm57vvIkKLS0KLS0g55So5rOV77yIaW5zdGFsbCDlkI7vvInvvJoKLS0gICBMT0FEIGxhbmNlX2NvbnZlcnNpb247ICAtLSDlhpnkvqfkvp3otZYKLS0gICBTRUxFQ1QgKiBGUk9NIGx1YWppdF9tb2R1bGUobW9kZSA6PSAnaW5zdGFsbCcsIHNxbF9uYW1lIDo9ICd0b19sYW5jZScpOwotLSAgIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdjb21waWxlJywgc3FsX25hbWUgOj0gJ2xhbmNlX3J1bicsCi0tICAgICBzb3VyY2UgOj0gJ3JldHVybiBmdW5jdGlvbihvcHRzKSByZXR1cm4gdG9fbGFuY2UucnVuKG9wdHMpIGVuZCcpOwotLSAgIFNFTEVDVCBsYW5jZV9ydW4oe3NvdXJjZTo9J3NyY19vcmRlcnMnLCBkZXN0Oj0nb3JkZXJzLmxhbmNlJywgdHNfY29sOj0ndHMnLCBtb2RlOj0ndHMnfSk7Ci0tCi0tIOa4uOagh+aooeW8jyBtb2Rl77yI5ZCMIGluY3JlbWVudGFs77yJ77yaCi0tICAgJ3RzJyAgICDigJTigJQgV0hFUkUgdHMgPiBsYXN0X3RzICAgICAgICAgICAgICAgICAgICAgICAg5oyJ5pe26Ze05aKe6YePCi0tICAgJ2lkJyAgICDigJTigJQgV0hFUkUgaWQgPiBsYXN0X2lkICAgICAgICAgICAgICAgICAgICAgICAg5oyJ6Ieq5aKe6ZSu5aKe6YePCi0tICAgJ3RzX2lkJyDigJTigJQgV0hFUkUgdHMgPiBsYXN0X3RzIE9SICh0cyA9IGxhc3RfdHMgQU5EIGlkID4gbGFzdF9pZCkgIOWkjeWQiOa4uOagh++8jOWQjOaXtumXtOaIs+S4jea8j+S4jemHjQotLQotLSDmsLTkvY3ooajvvJpldGxfd2F0ZXJtYXJrKG5hbWUgVkFSQ0hBUiBQSywgbGFzdF90cyBUSU1FU1RBTVAsIGxhc3RfaWQgQklHSU5ULCB1cGRhdGVkX2F0IFRJTUVTVEFNUCkKLS0gICAgICAgICDkuI4gaW5jcmVtZW50YWwg5YWx55So77yIbmFtZSDnlKggZGVzdCDot6/lvoTlrZfnrKbkuLLvvIkKLS0g6L+U5ZueIEpTT07vvJp7ImxvYWRlZCI6TiwibGFzdF90cyI6Li4uLCJsYXN0X2lkIjouLi4sIndyaXRlIjoiY3JlYXRlInwiYXBwZW5kInwibm9vcCJ9Ci0tIOWPpuaciSBvcD0ncmVzZXQn77ya5riF5rC05L2N6YeN5paw5YWo6YeP77yIU0VMRUNUIGxhbmNlX3J1bih7b3A6J3Jlc2V0JywgZGVzdDonb3JkZXJzLmxhbmNlJ30pO++8iQotLQotLSDlt7Lnn6XovrnnlYzvvJoKLS0gICBsYW5jZSDkuI4gbGFuY2VfY29udmVyc2lvbiDkuI3og73lkIzkvJror50gTE9BRO+8iExBTkNFIENvcHlGdW5jdGlvbiDph43lkI3lhrLnqoHvvInigJTigJQKLS0gICDlhpnor7vliIbnprvvvJrmnKzlupPlhpnvvIhsYW5jZV9jb252ZXJzaW9uIOS8muivne+8ie+8jOWPpui1t+S8muivnSBMT0FEIGxhbmNlIOivu+WbnuOAggotLSAgIExhbmNlIEFQUEVORCDopoHmsYIgc2NoZW1hIOWFvOWuue+8m2Rlc3Qg6aaW6LeR5b+F6aG75LiN5a2Y5Zyo77yIQ3JlYXRlIOivreS5ie+8ieOAggoKbG9jYWwgdG9fbGFuY2UgPSB7fQp0b19sYW5jZS53YXRlcm1hcmtfdGFibGUgPSAnZXRsX3dhdGVybWFyaycKCi0tIOWGheiBlCBKU09OIOe8luino+egge+8iOiHquWMheWQq++8jOWNleaWh+S7tue6puWumu+8m2VuY29kZXIg5Y+C6ICDIHJ4aS9qc29uLmx1YSDmgJ3ot6/nmoTmnIDlsI/lrZDpm4bvvIkKbG9jYWwgZnVuY3Rpb24ganNvbl9kZWNvZGUocykKICAtLSDmnIDlsI8gSlNPTiDlr7nosaHop6PmnpDvvJrplK7lgLzlnYfkuLrlrZfnrKbkuLIv5pWw5a2X77yI5pys5bqT5YWl5Y+C5b2i5oCB77yJCiAgbG9jYWwgdCA9IHt9CiAgbG9jYWwgYm9keSA9IHM6bWF0Y2goJ14lcyp7KC4qKX0lcyokJykKICBpZiBub3QgYm9keSB0aGVuIHJldHVybiBuaWwgZW5kCiAgbG9jYWwgcG9zID0gMQogIGxvY2FsIGZ1bmN0aW9uIHNraXAoKSBwb3MgPSBib2R5OmZpbmQoJ1teLCVzXScsIHBvcykgb3IgI2JvZHkgKyAxIGVuZAogIHdoaWxlIHBvcyA8PSAjYm9keSBkbwogICAgc2tpcCgpCiAgICBpZiBwb3MgPiAjYm9keSB0aGVuIGJyZWFrIGVuZAogICAgbG9jYWwga19zLCBrX2UgPSBib2R5OmZpbmQoJ14iKFteIl0qKSIlcyo6JywgcG9zKQogICAgaWYgbm90IGtfcyB0aGVuIGJyZWFrIGVuZAogICAgbG9jYWwga2V5ID0gYm9keTptYXRjaCgnXiIoW14iXSopIiVzKjonLCBwb3MpCiAgICBwb3MgPSBrX2UgKyAxCiAgICBsb2NhbCB2X3MgPSBib2R5OmZpbmQoJ1teLCVzXScsIHBvcykKICAgIGlmIG5vdCB2X3MgdGhlbiBicmVhayBlbmQKICAgIGxvY2FsIHZhbAogICAgbG9jYWwgcSA9IGJvZHk6c3ViKHZfcywgdl9zKQogICAgaWYgcSA9PSAnIicgdGhlbgogICAgICB2YWwgPSBib2R5Om1hdGNoKCdeIihbXiJdKikiJywgdl9zKQogICAgICBwb3MgPSB2X3MgKyAjdmFsICsgMgogICAgZWxzZWlmIHEgPT0gJ3snIG9yIHEgPT0gJ1snIHRoZW4KICAgICAgZXJyb3IoJ3RvX2xhbmNlOiBuZXN0ZWQgSlNPTiB2YWx1ZXMgbm90IHN1cHBvcnRlZCBpbiBvcHRzJywgMCkKICAgIGVsc2UKICAgICAgbG9jYWwgbnVtID0gYm9keTptYXRjaCgnXlslLSVkJS5lRV0rJywgdl9zKQogICAgICB2YWwgPSB0b251bWJlcihudW0pIG9yIG51bQogICAgICBwb3MgPSB2X3MgKyAjKG51bSBvciAnJykKICAgIGVuZAogICAgdFtrZXldID0gdmFsCiAgICBwb3MgPSBib2R5OmZpbmQoJywnLCBwb3MpIG9yICNib2R5ICsgMQogICAgcG9zID0gcG9zICsgMQogIGVuZAogIHJldHVybiB0CmVuZAoKbG9jYWwgZnVuY3Rpb24ganNvbl9lbmNvZGUodikKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnbnVsbCcgZW5kCiAgaWYgdHlwZSh2KSA9PSAnbnVtYmVyJyB0aGVuCiAgICByZXR1cm4gdiA9PSBtYXRoLmZsb29yKHYpIGFuZCBzdHJpbmcuZm9ybWF0KCclZCcsIHYpIG9yIHRvc3RyaW5nKHYpCiAgZW5kCiAgaWYgdHlwZSh2KSB+PSAnc3RyaW5nJyB0aGVuIHJldHVybiB0b3N0cmluZyh2KSBlbmQKICByZXR1cm4gJyInIC4uIHY6Z3N1YignXFwnLCAnXFxcXCcpOmdzdWIoJyInLCAnXFwiJykgLi4gJyInCmVuZAoKbG9jYWwgZnVuY3Rpb24ganJlcyhsb2FkZWQsIGxhc3RfdHMsIGxhc3RfaWQsIHdyaXRlKQogIGxvY2FsIHBhcnRzID0ge30KICBwYXJ0c1sjcGFydHMgKyAxXSA9ICcibG9hZGVkIjonIC4uIHRvc3RyaW5nKGxvYWRlZCkKICBwYXJ0c1sjcGFydHMgKyAxXSA9ICcibGFzdF90cyI6JyAuLiBqc29uX2VuY29kZShsYXN0X3RzKQogIHBhcnRzWyNwYXJ0cyArIDFdID0gJyJsYXN0X2lkIjonIC4uIGpzb25fZW5jb2RlKGxhc3RfaWQpCiAgcGFydHNbI3BhcnRzICsgMV0gPSAnIndyaXRlIjonIC4uIGpzb25fZW5jb2RlKHdyaXRlKQogIHJldHVybiAneycgLi4gdGFibGUuY29uY2F0KHBhcnRzLCAnLCcpIC4uICd9JwplbmQKCmxvY2FsIGZ1bmN0aW9uIGVzYyh2KQogIGlmIHR5cGUodikgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gIiciIC4uIHY6Z3N1YigiJyIsICInJyIpIC4uICInIiBlbmQKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnTlVMTCcgZW5kCiAgcmV0dXJuIHRvc3RyaW5nKHYpCmVuZAoKLS0g5Yid5aeL5YyW5rC05L2N6KGo77yI5bmC562J77yb5LiOIGluY3JlbWVudGFsIOWFseeUqO+8iQpmdW5jdGlvbiB0b19sYW5jZS5pbml0KCkKICBfZHVja2RiX2NhbGwoJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICcgLi4gdG9fbGFuY2Uud2F0ZXJtYXJrX3RhYmxlCiAgICAuLiAnIChuYW1lIFZBUkNIQVIgUFJJTUFSWSBLRVksIGxhc3RfdHMgVElNRVNUQU1QLCBsYXN0X2lkIEJJR0lOVCwgdXBkYXRlZF9hdCBUSU1FU1RBTVApJykKZW5kCgotLSDor7vmsLTkvY3vvJrov5Tlm54ge3RzPS4uLiwgaWQ9Li4ufSDmiJYgbmls77yI6aaW5qyh77yJCmZ1bmN0aW9uIHRvX2xhbmNlLndhdGVybWFyayhuYW1lKQogIHRvX2xhbmNlLmluaXQoKQogIGxvY2FsIHJvd3MgPSBfZHVja2RiX3F1ZXJ5KCdTRUxFQ1QgbGFzdF90cywgbGFzdF9pZCBGUk9NICcgLi4gdG9fbGFuY2Uud2F0ZXJtYXJrX3RhYmxlCiAgICAuLiAnIFdIRVJFIG5hbWUgPSAnIC4uIGVzYyhuYW1lKSkKICBpZiBub3Qgcm93cyBvciAjcm93cyA9PSAwIHRoZW4gcmV0dXJuIG5pbCBlbmQKICByZXR1cm4geyB0cyA9IHJvd3NbMV0ubGFzdF90cywgaWQgPSByb3dzWzFdLmxhc3RfaWQgfQplbmQKCi0tIOa4heawtOS9je+8iOmHjeaWsOWFqOmHj++8iQpmdW5jdGlvbiB0b19sYW5jZS5yZXNldChuYW1lKQogIHRvX2xhbmNlLmluaXQoKQogIF9kdWNrZGJfY2FsbCgnREVMRVRFIEZST00gJyAuLiB0b19sYW5jZS53YXRlcm1hcmtfdGFibGUgLi4gJyBXSEVSRSBuYW1lID0gJyAuLiBlc2MobmFtZSkpCmVuZAoKLS0g5omn6KGM5aKe6YePIOKGkiBMYW5jZQotLSBvcHRzID0geyBzb3VyY2U95rqQ6KGoLCBkZXN0PUxhbmNlIOaVsOaNrumbhui3r+W+hCwgdHNfY29sPT8sIGlkX2NvbD0/LCBtb2RlPSd0cyd8J2lkJ3wndHNfaWQnIH0KLS0g6L+U5ZueIEpTT04g5a2X56ym5LiyCmZ1bmN0aW9uIHRvX2xhbmNlLnJ1bihvcHRzKQogIG9wdHMgPSBvcHRzIG9yIHt9CiAgbG9jYWwgc291cmNlLCBkZXN0ID0gb3B0cy5zb3VyY2UsIG9wdHMuZGVzdAogIGlmIG5vdCBzb3VyY2Ugb3Igbm90IGRlc3QgdGhlbiBlcnJvcigndG9fbGFuY2U6IHNvdXJjZSBhbmQgZGVzdCByZXF1aXJlZCcsIDApIGVuZAogIGxvY2FsIG1vZGUgPSBvcHRzLm1vZGUgb3IgJ3RzJwogIGxvY2FsIHRzX2NvbCwgaWRfY29sID0gb3B0cy50c19jb2wsIG9wdHMuaWRfY29sCiAgaWYgbW9kZSA9PSAndHMnIGFuZCBub3QgdHNfY29sIHRoZW4gZXJyb3IoJ3RvX2xhbmNlOiB0c19jb2wgcmVxdWlyZWQgZm9yIG1vZGU9dHMnLCAwKSBlbmQKICBpZiBtb2RlID09ICdpZCcgYW5kIG5vdCBpZF9jb2wgdGhlbiBlcnJvcigndG9fbGFuY2U6IGlkX2NvbCByZXF1aXJlZCBmb3IgbW9kZT1pZCcsIDApIGVuZAogIGlmIG1vZGUgPT0gJ3RzX2lkJyBhbmQgKG5vdCB0c19jb2wgb3Igbm90IGlkX2NvbCkgdGhlbgogICAgZXJyb3IoJ3RvX2xhbmNlOiB0c19jb2wgYW5kIGlkX2NvbCByZXF1aXJlZCBmb3IgbW9kZT10c19pZCcsIDApIGVuZAoKICBsb2NhbCB3bSA9IHRvX2xhbmNlLndhdGVybWFyayhkZXN0KQogIGxvY2FsIHdoZXJlID0gJycKICBpZiB3bSB0aGVuCiAgICBpZiBtb2RlID09ICd0cycgdGhlbgogICAgICB3aGVyZSA9ICcgV0hFUkUgJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKQogICAgZWxzZWlmIG1vZGUgPT0gJ2lkJyB0aGVuCiAgICAgIHdoZXJlID0gJyBXSEVSRSAnIC4uIGlkX2NvbCAuLiAnID4gJyAuLiBlc2Mod20uaWQpCiAgICBlbHNlCiAgICAgIHdoZXJlID0gJyBXSEVSRSAoJyAuLiB0c19jb2wgLi4gJyA+ICcgLi4gZXNjKHdtLnRzKSAuLiAnKSBPUiAoJwogICAgICAgIC4uIHRzX2NvbCAuLiAnID0gJyAuLiBlc2Mod20udHMpIC4uICcgQU5EICcgLi4gaWRfY29sIC4uICcgPiAnIC4uIGVzYyh3bS5pZCkgLi4gJyknCiAgICBlbmQKICBlbmQKICBsb2NhbCBzZWwgPSAnU0VMRUNUICogRlJPTSAnIC4uIHNvdXJjZSAuLiB3aGVyZQoKICAtLSDpooTkvLDmnKzmrKHliqDovb3ooYzmlbAKICBsb2NhbCBucSwgZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gKCcgLi4gc2VsIC4uICcpJykKICBpZiBub3QgbnEgdGhlbiBlcnJvcigndG9fbGFuY2U6ICcgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgbiA9IHRvbnVtYmVyKG5xWzFdLm4pIG9yIDAKICBpZiBuID09IDAgdGhlbgogICAgcmV0dXJuIGpyZXMoMCwgd20gYW5kIHdtLnRzIG9yIG5pbCwgd20gYW5kIHdtLmlkIG9yIG5pbCwgJ25vb3AnKQogIGVuZAoKICAtLSDpppbot5EgQ3JlYXRl44CB5ZCO57utIEFQUEVORO+8iExhbmNlIGRhdGFzZXQgdmVyc2lvbiDor63kuYnlpKnnhLbpgILphY3lop7ph4/vvIkKICBsb2NhbCBjb3B5X21vZGUgPSB3bSBhbmQgJywgQVBQRU5EJyBvciAnJwogIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoIkNPUFkgKCIgLi4gc2VsIC4uICIpIFRPICciIC4uIGRlc3Q6Z3N1YigiJyIsICInJyIpCiAgICAuLiAiJyAoRk9STUFUIExBTkNFIiAuLiBjb3B5X21vZGUgLi4gIikiKQogIGlmIHR5cGUocikgPT0gJ3N0cmluZycgYW5kIHI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHI6c3ViKDcpLCAwKSBlbmQKCiAgLS0g5paw5rC05L2N77yadHMg5Y+W5pys5qyh5pyA5aSn77ybaWQg5Y+W5pys5qyh5pyA5aSnCiAgbG9jYWwgbmV3X3RzLCBuZXdfaWQgPSBuaWwsIG5pbAogIGlmIG1vZGUgfj0gJ2lkJyB0aGVuCiAgICBsb2NhbCBtID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIG1heCgnIC4uIHRzX2NvbCAuLiAnKSBBUyB0IEZST00gKCcgLi4gc2VsIC4uICcpJykKICAgIGlmIG0gdGhlbiBuZXdfdHMgPSBtWzFdLnQgZW5kCiAgZW5kCiAgaWYgbW9kZSB+PSAndHMnIHRoZW4KICAgIGxvY2FsIG0gPSBfZHVja2RiX3F1ZXJ5KCdTRUxFQ1QgbWF4KCcgLi4gaWRfY29sIC4uICcpIEFTIGkgRlJPTSAoJyAuLiBzZWwgLi4gJyknKQogICAgaWYgbSB0aGVuIG5ld19pZCA9IG1bMV0uaSBlbmQKICBlbmQKICBpZiBuZXdfdHMgb3IgbmV3X2lkIHRoZW4KICAgIF9kdWNrZGJfY2FsbCgnSU5TRVJUIE9SIFJFUExBQ0UgSU5UTyAnIC4uIHRvX2xhbmNlLndhdGVybWFya190YWJsZQogICAgICAuLiAnIFZBTFVFUyAoJyAuLiBlc2MoZGVzdCkgLi4gJywgJyAuLiBlc2MobmV3X3RzKSAuLiAnLCAnIC4uIGVzYyhuZXdfaWQpIC4uICcsIG5vdygpKScpCiAgZW5kCiAgcmV0dXJuIGpyZXMobiwgbmV3X3RzLCBuZXdfaWQsIHdtIGFuZCAnYXBwZW5kJyBvciAnY3JlYXRlJykKZW5kCgotLSDlhaXlj6PvvJrmjqUgbHVhaml0X3Mg55qEIEpTT04g5a2X56ym5Liy77yI6LCD55So57qm5a6a77ya5a2X56ym5Liy5Y+C5pWw77yb5pys5bqT6Ieq5bim5p6B566A6Kej56CB77yJ77yMCi0tIOaIliBzdHJ1Y3Qg55u05Lyg77yIY29tcGlsZSB3cmFwcGVyIOmXreWMheWcuuaZr++8ieOAgm9w77yacnVu77yI6buY6K6k77yJLyByZXNldOOAggpmdW5jdGlvbiB0b19sYW5jZS5lbnRyeShyYXcpCiAgbG9jYWwgb3B0cyA9IHJhdwogIGlmIHR5cGUocmF3KSA9PSAnc3RyaW5nJyB0aGVuCiAgICBvcHRzID0ganNvbl9kZWNvZGUocmF3KQogICAgaWYgdHlwZShvcHRzKSB+PSAndGFibGUnIHRoZW4gZXJyb3IoJ3RvX2xhbmNlOiBiYWQgSlNPTiBvcHRzOiAnIC4uIHRvc3RyaW5nKHJhdyksIDApIGVuZAogIGVuZAogIG9wdHMgPSBvcHRzIG9yIHt9CiAgbG9jYWwgb3AgPSBvcHRzLm9wIG9yICdydW4nCiAgaWYgb3AgPT0gJ3Jlc2V0JyB0aGVuCiAgICB0b19sYW5jZS5yZXNldChvcHRzLmRlc3QpCiAgICByZXR1cm4gJ3sib2siOnRydWUsInJlc2V0IjonIC4uIGpzb25fZW5jb2RlKG9wdHMuZGVzdCkgLi4gJ30nCiAgZW5kCiAgcmV0dXJuIHRvX2xhbmNlLnJ1bihvcHRzKQplbmQKCnJldHVybiB0b19sYW5jZQoAX2R1Y2tkYl9jYWxsID0gZnVuY3Rpb24oc3FsKSByZXR1cm4gX19kYmMoc3FsKSBlbmQKX2R1Y2tkYl9xdWVyeSA9IGZ1bmN0aW9uKHNxbCkKICBsb2NhbCBzID0gX19kYnEoc3FsKQogIGxvY2FsIG9rLCBqID0gcGNhbGwoX2xpYnMuanNvbi5kZWNvZGUsIHMpCiAgaWYgbm90IG9rIG9yIHR5cGUoaikgfj0gJ3RhYmxlJyB0aGVuIHJldHVybiBuaWwsICdkZWNvZGVfZXJyOiAnIC4uIHRvc3RyaW5nKGopIGVuZAogIHJldHVybiBqLnJvd3MsIGouZXJyCmVuZAoALS0gQGxpYjogcmJhYwotLSBAY2F0ZWdvcnk6IHNlY3VyaXR5Ci0tIEBkZXNjOiBRdWFjayBSQkFDIOetlueVpeW8leaTjuKAlOKAlHRva2VuIOiupOivgSArIOi/nuaOpeS8muivneiusOW9lSArIOinkuiJsuihqOe6p+aOiOadgyArIOWPquivu+eZveWQjeWNleWKoOWbuu+8jAotLSAgICAgICAg5oyCIHF1YWNrX2F1dGhlbnRpY2F0aW9uX2Z1bmN0aW9uIC8gcXVhY2tfYXV0aG9yaXphdGlvbl9mdW5jdGlvbiDpkqnlrZDvvIjmma7pgJrmqKHlvI/vvIzpnIAgX2R1Y2tkYl9xdWVyee+8iQotLSBAc291cmNlOiBvcmlnaW5hbO+8iGR1Y2tkYi1sdWFqaXQg57O75YiX77yJCi0tIEByZXF1aXJlczogX2R1Y2tkYl9xdWVyee+8iOaZrumAmuaooeW8j++8m3RydXN0ZWQg5rKZ566x5LiL5LiN5Y+v55So77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSBSb2xlLUJhc2VkIEFjY2VzcyBDb250cm9sIHBvbGljeSBlbmdpbmUgZm9yIER1Y2tEQiBRdWFjayAoTHVhSklUIDUuMSkuCi0tCi0tIOWumuS9je+8mlF1YWNrIOaYr+W8uuWItueCue+8iOavj+adoeafpeivoiBQUkVQQVJFIOWJjei3kSBhdXRob3JpemF0aW9uIOmSqeWtkO+8ie+8jOacrOW6k+aYr+etlueVpeW8leaTjuOAggotLSDlronlhajliY3mj5DvvIjliqHlv4Xor7vvvInvvJoKLS0gICAxKSDmjojmnYPpkqnlrZDpu5jorqTmi5Lnu53kuIDliIflhpnor63lj6XvvIhhbGxvd193cml0ZT1mYWxzZe+8ieKAlOKAlOWQpuWImeWuouaIt+err+WPrwotLSAgICAgIFNFVCBHTE9CQUwgcXVhY2tfYXV0aG9yaXphdGlvbl9mdW5jdGlvbiAvIENSRUFURSBPUiBSRVBMQUNFIE1BQ1JPIC8g56+h5pS55p2D6ZmQ6KGoIOe7lei/h++8mwotLSAgIDIpIOadg+mZkOWFg+aVsOaNruihqOS4juaVsOaNruWQjOW5s+mdou+8jOacrOW6k+mAmui/h+KAnOemgeWGmeKAneS/neaKpOWug+S7rO+8iOeuoeeQhuWRmOWcqOacjeWKoeWZqOacrOWcsOaJp+ihjCBncmFudC9zZXR1cO+8ie+8mwotLSAgIDMpIOivreWPpeexu+Wei+WIpOaWreWfuuS6jiBTUUwg5paH5pys5YmN57yA77yM6Z2e6Kej5p6Q5Zmo4oCU4oCU5a6Y5pa55paH5qGj5Lqm6K2m5ZGKCi0tICAgICAg4oCcV0lUSCB4IEFTIChTRUxFQ1QgMSkgSU5TRVJUIElOVE8gdCAuLi7igJ0g5Z6L57uV6L+H77ybc3RyaWN0X3dyaXRlPXRydWUg5pe2IFdJVEgg5YmN57yA5LiA5b6L5ouS57ud77yI5a6B5Y+v6ZSZ5p2A77yJ44CCCi0tCi0tIOihqOaooeWei++8iOeuoeeQhuWRmOWcqOacjeWKoeWZqOS8muivneaJp+ihjCBsdWFqaXRfcygncmJhYycsIHtvcDonc2V0dXAnfSkg5LiA5qyh77yJ77yaCi0tICAgcXVhY2tfdG9rZW5zIChhdXRoX3Rva2VuIFBLLCB1c2VyX25hbWUpICAgLS0gdG9rZW7ihpLnlKjmiLcKLS0gICBxdWFja19zZXNzaW9ucyAoc2lkIFBLLCB1c2VyX25hbWUpICAgICAgICAtLSDov57mjqXihpLnlKjmiLfvvIhhdXRobiDpkqnlrZDlhpnlhaXvvIkKLS0gICB1c2VyX3JvbGVzICh1c2VyX25hbWUsIHJvbGUpICAgICAgICAgICAgICAtLSDnlKjmiLfihpLop5LoibIKLS0gICByb2xlX3Blcm1zIChyb2xlLCB0YWJsZV9uYW1lLCBjYW5fc2VsZWN0LCBjYW5fd3JpdGUpICAtLSDop5LoibLihpLooajmnYPpmZAKLS0KLS0g5oyC6ZKp77yI5pyN5Yqh5Zmo5Lya6K+d77yMTE9BRCBsdWFqaXQgKyBjb21waWxlIOacrOW6k+S5i+WQju+8ie+8mgotLSAgIENSRUFURSBNQUNSTyByYmFjX2F1dGhuKHNpZCwgY3QsIHN0KSBBUyAobHVhaml0X3MoJ3JiYWMnLCB7b3A6J2F1dGhuJywgc2lkOnNpZCwgY2xpZW50X3Rva2VuOmN0LCBzZXJ2ZXJfdG9rZW46c3R9KTo6Qk9PTEVBTik7Ci0tICAgQ1JFQVRFIE1BQ1JPIHJiYWNfYXV0aHooc2lkLCBxKSAgICBBUyAobHVhaml0X3MoJ3JiYWMnLCB7b3A6J2F1dGh6Jywgc2lkOnNpZCwgcTpxfSk6OkJPT0xFQU4pOwotLSAgIFNFVCBHTE9CQUwgcXVhY2tfYXV0aGVudGljYXRpb25fZnVuY3Rpb24gPSAncmJhY19hdXRobic7Ci0tICAgU0VUIEdMT0JBTCBxdWFja19hdXRob3JpemF0aW9uX2Z1bmN0aW9uICA9ICdyYmFjX2F1dGh6JzsKLS0KLS0g6LCD55So77yIbHVhaml0X3MoJ3JiYWMnLCB7b3A6Li4ufSnvvInvvJoKLS0gICBhdXRobiAg4oaSIEJPT0xFQU7vvIjmn6UgdG9rZW4g6KGoICsg5YaZ5Lya6K+d6KGo77yJCi0tICAgYXV0aHogIOKGkiBCT09MRUFO77yI55m95ZCN5Y2VICsg6KeS6Imy6KGo57qn5p2D6ZmQ77yJCi0tICAgZ3JhbnQgIOKGkiDnrqHnkIblkZjkuJPnlKgge29wOidncmFudCcsIHJvbGUsIHRibCwgY2FuX3NlbGVjdCwgY2FuX3dyaXRlfSDmlLkgcm9sZV9wZXJtc++8iOS7heacjeWKoeWZqOacrOWcsOaJp+ihjO+8ge+8iQotLSAgIHNldHVwICDihpIg566h55CG5ZGY5LiT55So77ya5bu6IDQg5bygIFJCQUMg6KGo77yI5LuF5pyN5Yqh5Zmo5pys5Zyw5omn6KGM77yB77yJCi0tICAgc3RhdHVzIOKGkiDphY3nva7lv6vnhafvvIjosIPor5XnlKjvvIkKCmxvY2FsIENPTkZJRyA9IHsKICB0b2tlbnNfdGFibGUgICA9ICdxdWFja190b2tlbnMnLAogIHNlc3Npb25zX3RhYmxlID0gJ3F1YWNrX3Nlc3Npb25zJywKICByb2xlc190YWJsZSAgICA9ICd1c2VyX3JvbGVzJywKICBwZXJtc190YWJsZSAgICA9ICdyb2xlX3Blcm1zJywKICBwcm90ZWN0ZWQgICAgICA9IHsgJ3NlY3JldF9kYXRhJywgJ3B1YmxpY19kYXRhJyB9LCAgLS0g5Y+X5o6n6KGo5riF5Y2V77yIYXV0aHog6YCQ6KGo5p+l5p2D6ZmQ77yJCiAgYWxsb3dfd3JpdGUgICAgPSBmYWxzZSwgIC0tIHRydWUgPSDmlL7ooYzlhpnor63lj6XlubbmjIkgY2FuX3dyaXRlIOe7hueykuW6puaOiOadg++8m2ZhbHNlID0g5LiA5YiH5YaZ6K+t5Y+l5ouS57ud77yI5o6o6I2Q77yJCiAgc3RyaWN0X3dyaXRlICAgPSB0cnVlLCAgIC0tIHRydWUgPSBXSVRIIOW8gOWktOS4gOW+i+aLkue7ne+8iOmYsiDigJxXSVRIIHggQVMgKFNFTEVDVCAxKSBJTlNFUlQgSU5UTyB04oCdIOWei+e7lei/h++8iQogIGF1ZGl0X3RhYmxlICAgID0gbmlsLCAgICAtLSDorr4gJ3JiYWNfYXVkaXQnIOWImSBhdXRoeiDmr4/mrKHlhrPnrZborrDlrqHorqHvvIjmr4/mn6Xor6LlpJrkuIDmrKHlhpnvvIzmgKfog73mlY/mhJ/mhY7nlKjvvIkKfQoKbG9jYWwgUkVBRF9LV1MgID0geyAnU0VMRUNUJywgJ0ZST00nLCAnV0lUSCcsICdFWFBMQUlOJywgJ0RFU0NSSUJFJywgJ1NIT1cnLCAnVkFMVUVTJywgJ1RBQkxFJywgJ1BSQUdNQScsICdTVU1NQVJJWkUnIH0KbG9jYWwgV1JJVEVfS1dTID0geyAnSU5TRVJUJywgJ1VQREFURScsICdERUxFVEUnLCAnTUVSR0UnLCAnQ09QWScsICdDUkVBVEUnLCAnRFJPUCcsICdBTFRFUicsICdTRVQnLCAnQ0FMTCcsCiAgICAgICAgICAgICAgICAgICAgJ0FUVEFDSCcsICdERVRBQ0gnLCAnRVhQT1JUJywgJ0lNUE9SVCcsICdDSEVDS1BPSU5UJywgJ1ZBQ1VVTScsICdDT01NRU5UJywgJ0lOU1RBTEwnLAogICAgICAgICAgICAgICAgICAgICdMT0FEJywgJ1BSRVBBUkUnLCAnRVhFQ1VURScsICdVU0UnLCAnR1JBTlQnLCAnUkVWT0tFJywgJ1RSVU5DQVRFJyB9Cgpsb2NhbCBmdW5jdGlvbiBlc2MocykKICByZXR1cm4gKHM6Z3N1YigiJyIsICInJyIpKQplbmQKCmxvY2FsIGZ1bmN0aW9uIHEocm93cywgaSwgY29sKQogIHJldHVybiByb3dzIGFuZCByb3dzW2ldIGFuZCByb3dzW2ldW2NvbF0KZW5kCgpsb2NhbCBmdW5jdGlvbiBjbGFzc2lmeSh1cCkKICBmb3IgXywga3cgaW4gaXBhaXJzKFJFQURfS1dTKSBkbwogICAgaWYgdXA6ZmluZCgnXicgLi4ga3cpIHRoZW4gcmV0dXJuICdyZWFkJyBlbmQKICBlbmQKICBmb3IgXywga3cgaW4gaXBhaXJzKFdSSVRFX0tXUykgZG8KICAgIGlmIHVwOmZpbmQoJ14nIC4uIGt3KSB0aGVuIHJldHVybiAnd3JpdGUnIGVuZAogIGVuZAogIHJldHVybiAndW5rbm93bicgIC0tIOacquivhuWIq+WJjee8gO+8muaLkue7nQplbmQKCmxvY2FsIGZ1bmN0aW9uIHJlc29sdmVfdXNlcihzaWQpCiAgbG9jYWwgdSA9IF9kdWNrZGJfcXVlcnkoIlNFTEVDVCB1c2VyX25hbWUgRlJPTSAiIC4uIENPTkZJRy5zZXNzaW9uc190YWJsZSAuLiAiIFdIRVJFIHNpZCA9ICciIC4uIGVzYyhzaWQgb3IgJycpIC4uICInIikKICByZXR1cm4gcSh1LCAxLCAndXNlcl9uYW1lJykKZW5kCgpsb2NhbCBmdW5jdGlvbiB1c2VyX2hhc19wZXJtKHVzZXIsIHRibCwgbmVlZF93cml0ZSkKICBsb2NhbCBjb2wgPSBuZWVkX3dyaXRlIGFuZCAnY2FuX3dyaXRlJyBvciAnY2FuX3NlbGVjdCcKICBsb2NhbCByID0gX2R1Y2tkYl9xdWVyeSgKICAgICJTRUxFQ1QgQ09VTlQoKikgQVMgbiBGUk9NICIgLi4gQ09ORklHLnJvbGVzX3RhYmxlIC4uICIgdXIgSk9JTiAiIC4uIENPTkZJRy5wZXJtc190YWJsZSAuLiAiIHJwIE9OIHJwLnJvbGUgPSB1ci5yb2xlICIgLi4KICAgICJXSEVSRSB1ci51c2VyX25hbWUgPSAnIiAuLiBlc2ModXNlcikgLi4gIicgQU5EIHJwLnRhYmxlX25hbWUgPSAnIiAuLiBlc2ModGJsKSAuLiAiJyBBTkQgcnAuIiAuLiBjb2wgLi4gIiA9IHRydWUiKQogIHJldHVybiAocShyLCAxLCAnbicpIG9yIDApID4gMAplbmQKCmxvY2FsIGZ1bmN0aW9uIGNoZWNrX3RhYmxlcyhxdWVyeSwgdXNlciwgbmVlZF93cml0ZSkKICBmb3IgXywgdGJsIGluIGlwYWlycyhDT05GSUcucHJvdGVjdGVkKSBkbwogICAgaWYgc3RyaW5nLmZpbmQocXVlcnksIHRibCwgMSwgdHJ1ZSkgdGhlbgogICAgICBpZiBub3QgdXNlcl9oYXNfcGVybSh1c2VyLCB0YmwsIG5lZWRfd3JpdGUpIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogICAgZW5kCiAgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgpsb2NhbCBmdW5jdGlvbiBhdXRobihwKQogIGxvY2FsIHJvd3MgPSBfZHVja2RiX3F1ZXJ5KAogICAgIlNFTEVDVCB1c2VyX25hbWUgRlJPTSAiIC4uIENPTkZJRy50b2tlbnNfdGFibGUgLi4gIiBXSEVSRSBhdXRoX3Rva2VuID0gJyIgLi4gZXNjKHAuY2xpZW50X3Rva2VuIG9yICcnKSAuLiAiJyIpCiAgbG9jYWwgdXNlciA9IHEocm93cywgMSwgJ3VzZXJfbmFtZScpCiAgaWYgbm90IHVzZXIgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgX2R1Y2tkYl9xdWVyeSgiSU5TRVJUIElOVE8gIiAuLiBDT05GSUcuc2Vzc2lvbnNfdGFibGUgLi4gIiBWQUxVRVMgKCciIC4uIGVzYyhwLnNpZCBvciAnJykgLi4gIicsICciIC4uIGVzYyh1c2VyKSAuLiAiJykiKQogIHJldHVybiB0cnVlCmVuZAoKbG9jYWwgZnVuY3Rpb24gYXV0aHoocCkKICBsb2NhbCBxdWVyeSA9IHAucSBvciAnJwogIGxvY2FsIHVwID0gc3RyaW5nLnVwcGVyKHF1ZXJ5OmdzdWIoJ14lcysnLCAnJyk6Z3N1YignJXMrJCcsICcnKSkKICBpZiB1cCA9PSAnJyB0aGVuIHJldHVybiBmYWxzZSBlbmQKICBsb2NhbCBraW5kID0gY2xhc3NpZnkodXApCiAgaWYga2luZCA9PSAndW5rbm93bicgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYga2luZCA9PSAncmVhZCcgYW5kIHVwOmZpbmQoJ15XSVRIJykgYW5kIENPTkZJRy5zdHJpY3Rfd3JpdGUgdGhlbiByZXR1cm4gZmFsc2UgZW5kICAtLSDpmLIgV0lUSCDms6jlhaXlvI/lhpnnu5Xov4cKICBsb2NhbCB1c2VyID0gcmVzb2x2ZV91c2VyKHAuc2lkKQogIGlmIG5vdCB1c2VyIHRoZW4gcmV0dXJuIGZhbHNlIGVuZAogIGxvY2FsIG5lZWRfd3JpdGUgPSAoa2luZCA9PSAnd3JpdGUnKQogIGlmIG5lZWRfd3JpdGUgYW5kIG5vdCBDT05GSUcuYWxsb3dfd3JpdGUgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgbm90IGNoZWNrX3RhYmxlcyhxdWVyeSwgdXNlciwgbmVlZF93cml0ZSkgdGhlbiByZXR1cm4gZmFsc2UgZW5kCiAgaWYgQ09ORklHLmF1ZGl0X3RhYmxlIHRoZW4KICAgIF9kdWNrZGJfcXVlcnkoIklOU0VSVCBJTlRPICIgLi4gQ09ORklHLmF1ZGl0X3RhYmxlIC4uCiAgICAgICIgVkFMVUVTICgnIiAuLiBlc2MocC5zaWQgb3IgJycpIC4uICInLCAnIiAuLiBlc2ModXNlcikgLi4gIicsICciIC4uIGVzYyhxdWVyeSkgLi4gIicsIENVUlJFTlRfVElNRVNUQU1QKSIpCiAgZW5kCiAgcmV0dXJuIHRydWUKZW5kCgotLSDnrqHnkIblkZjmk43kvZzvvJrku4XmnI3liqHlmajmnKzlnLDkvJror53miafooYzjgILoi6Xnu48gcXVhY2sg5a6i5oi356uv5omn6KGM77yM5Lya6KKrIGF1dGh6IOeZveWQjeWNleaLkue7neKAlOKAlOi/meato+aYr+iuvuiuoeaEj+WbvuOAggpsb2NhbCBmdW5jdGlvbiBncmFudChwKQogIGxvY2FsIG9rLCBlcnIgPSBwY2FsbChmdW5jdGlvbigpCiAgICBfZHVja2RiX3F1ZXJ5KCJJTlNFUlQgT1IgUkVQTEFDRSBJTlRPICIgLi4gQ09ORklHLnBlcm1zX3RhYmxlIC4uCiAgICAgICIgVkFMVUVTICgnIiAuLiBlc2MocC5yb2xlIG9yICcnKSAuLiAiJywgJyIgLi4gZXNjKHAudGJsIG9yICcnKSAuLiAiJywgIiAuLgogICAgICAocC5jYW5fc2VsZWN0IGFuZCAndHJ1ZScgb3IgJ2ZhbHNlJykgLi4gIiwgIiAuLiAocC5jYW5fd3JpdGUgYW5kICd0cnVlJyBvciAnZmFsc2UnKSAuLiAiKSIpCiAgZW5kKQogIHJldHVybiBvayBhbmQgJ29rJyBvciAoJ2Vycm9yOiAnIC4uIHRvc3RyaW5nKGVycikpCmVuZAoKbG9jYWwgZnVuY3Rpb24gc2V0dXAoKQogIGxvY2FsIGRkbCA9IHsKICAgICJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAiIC4uIENPTkZJRy50b2tlbnNfdGFibGUgLi4gIiAoYXV0aF90b2tlbiBWQVJDSEFSIFBSSU1BUlkgS0VZLCB1c2VyX25hbWUgVkFSQ0hBUikiLAogICAgIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICIgLi4gQ09ORklHLnNlc3Npb25zX3RhYmxlIC4uICIgKHNpZCBWQVJDSEFSIFBSSU1BUlkgS0VZLCB1c2VyX25hbWUgVkFSQ0hBUikiLAogICAgIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICIgLi4gQ09ORklHLnJvbGVzX3RhYmxlIC4uICIgKHVzZXJfbmFtZSBWQVJDSEFSLCByb2xlIFZBUkNIQVIpIiwKICAgICJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyAiIC4uIENPTkZJRy5wZXJtc190YWJsZSAuLiAiIChyb2xlIFZBUkNIQVIsIHRhYmxlX25hbWUgVkFSQ0hBUiwgY2FuX3NlbGVjdCBCT09MRUFOLCBjYW5fd3JpdGUgQk9PTEVBTikiLAogIH0KICBmb3IgXywgcyBpbiBpcGFpcnMoZGRsKSBkbwogICAgbG9jYWwgb2ssIGVyciA9IHBjYWxsKGZ1bmN0aW9uKCkgX2R1Y2tkYl9xdWVyeShzKSBlbmQpCiAgICBpZiBub3Qgb2sgdGhlbiByZXR1cm4gJ2Vycm9yOiAnIC4uIHRvc3RyaW5nKGVycikgZW5kCiAgZW5kCiAgcmV0dXJuICdvaycKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiBub3QgcCBvciBub3QgcC5vcCB0aGVuIHJldHVybiAnZXJyb3I6IG5lZWQgb3AnIGVuZAogIGlmIHAub3AgPT0gJ2F1dGhuJyB0aGVuIHJldHVybiBhdXRobihwKSBlbmQKICBpZiBwLm9wID09ICdhdXRoeicgdGhlbiByZXR1cm4gYXV0aHoocCkgZW5kCiAgaWYgcC5vcCA9PSAnZ3JhbnQnIHRoZW4gcmV0dXJuIGdyYW50KHApIGVuZAogIGlmIHAub3AgPT0gJ3NldHVwJyB0aGVuIHJldHVybiBzZXR1cCgpIGVuZAogIGlmIHAub3AgPT0gJ3N0YXR1cycgdGhlbgogICAgcmV0dXJuICdwcm90ZWN0ZWQ9JyAuLiB0YWJsZS5jb25jYXQoQ09ORklHLnByb3RlY3RlZCwgJywnKSAuLiAnO2FsbG93X3dyaXRlPScgLi4gdG9zdHJpbmcoQ09ORklHLmFsbG93X3dyaXRlKSAuLgogICAgICAgICAgICc7c3RyaWN0X3dyaXRlPScgLi4gdG9zdHJpbmcoQ09ORklHLnN0cmljdF93cml0ZSkgLi4gJzthdWRpdD0nIC4uIHRvc3RyaW5nKENPTkZJRy5hdWRpdF90YWJsZSBvciAnb2ZmJykKICBlbmQKICByZXR1cm4gJ2Vycm9yOiB1bmtub3duIG9wICcgLi4gdG9zdHJpbmcocC5vcCkKZW5kCgAtLSBAbGliOiBleHBvcnQKLS0gQGNhdGVnb3J5OiBleHBvcnQKLS0gQGRlc2M6IOWtmOWCqOi/h+eoi+W8j+WvvOWHuuKAlOKAlEx1YSDph4zkuIDmnaEgQ09QWSAocXVlcnkpIFRPIGZpbGXvvIzlj4LmlbDljJbmoLzlvI8v6Lev5b6E77yb6YWN5ZCIIENSRUFURSBNQUNSTyDlvZPlr7zlh7rov4fnqIvnlKgKLS0gQHNvdXJjZTogb3JpZ2luYWzvvIhkdWNrZGItbHVhaml0IOezu+WIl++8iQotLSBAcmVxdWlyZXM6IG5vbmXvvIjpnIDmma7pgJrmqKHlvI/igJTigJRfZHVja2RiX2NhbGwg5Zue6LCD5ZyoIHRydXN0ZWQg5rKZ566x5LiL5LiN5Y+v55So77yJCi0tIEBsaWNlbnNlOiBNSVQgKGR1Y2tkYi1sdWFqaXQtbGlicyBwcm9qZWN0KQotLSBAbWF0dXJpdHk6IHRlc3RlZAotLSBTdG9yZWQtcHJvY2VkdXJlIHN0eWxlIGV4cG9ydCBmb3IgZHVja2RiLWx1YWppdCAoTHVhSklUIDUuMSkuCi0tIFJ1bnMgQ09QWSB2aWEgdGhlIF9kdWNrZGJfY2FsbCBjYWxsYmFjayBvbiB0aGUgZXh0ZW5zaW9uJ3Mgc2Vjb25kIGNvbm5lY3Rpb24uCi0tIFVzYWdlOgotLSAgIFNFVCBWQVJJQUJMRSBzcmMgPSAoU0VMRUNUIGNvbnRlbnQgRlJPTSByZWFkX3RleHQoJ2h0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hbGl0cmFjay9kdWNrZGItbHVhaml0LWxpYnMvbWFpbi9saWJzL2V4cG9ydC9leHBvcnQubHVhJykpOwotLSAgIFNFTEVDVCBtZXNzYWdlIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdxdWlja19jb21waWxlJywgc3FsX25hbWUgOj0gJ2V4cG9ydCcsIHNvdXJjZSA6PSBnZXR2YXJpYWJsZSgnc3JjJykpOwotLSAgIFNFTEVDVCBleHBvcnQoe3F1ZXJ5OiAnU0VMRUNUICogRlJPTSB0IFdIRVJFIHF0eSA+PSAyJywgZmlsZTogJy90bXAvb3V0LnBhcnF1ZXQnfSk7Ci0tICAgLS0gb3IgYnkgdGFibGUgbmFtZSAodGJsIOKAlCAndGFibGUnIGlzIGEgRHVja0RCIGtleXdvcmQpOgotLSAgIFNFTEVDVCBleHBvcnQoe3RibDogJ3QnLCBmaWxlOiAnL3RtcC9vdXQuY3N2JywgZm9ybWF0OiAnY3N2J30pOwpsb2NhbCBGT1JNQVRTID0geyBwYXJxdWV0ID0gdHJ1ZSwgY3N2ID0gdHJ1ZSwganNvbiA9IHRydWUgfQoKbG9jYWwgZnVuY3Rpb24gZXNjKHMpCiAgcmV0dXJuIChzOmdzdWIoIiciLCAiJyciKSkKZW5kCgpyZXR1cm4gZnVuY3Rpb24ocCkKICBpZiBub3QgcCBvciBub3QgcC5maWxlIHRoZW4gcmV0dXJuICdlcnJvcjogbmVlZCBmaWxlJyBlbmQKICBsb2NhbCBmbXQgPSBwLmZvcm1hdCBvciAncGFycXVldCcKICBpZiBub3QgRk9STUFUU1tmbXRdIHRoZW4gcmV0dXJuICdlcnJvcjogdW5zdXBwb3J0ZWQgZm9ybWF0OiAnIC4uIHRvc3RyaW5nKGZtdCkgZW5kCiAgbG9jYWwgc3JjCiAgaWYgcC5xdWVyeSB0aGVuCiAgICBzcmMgPSBwLnF1ZXJ5CiAgZWxzZWlmIHAudGJsIHRoZW4KICAgIHNyYyA9ICdTRUxFQ1QgKiBGUk9NICcgLi4gcC50YmwKICBlbHNlCiAgICByZXR1cm4gJ2Vycm9yOiBuZWVkIHF1ZXJ5IG9yIHRibCcKICBlbmQKICBsb2NhbCBzcWwgPSAiQ09QWSAoIiAuLiBzcmMgLi4gIikgVE8gJyIgLi4gZXNjKHAuZmlsZSkgLi4gIicgKEZPUk1BVCAiIC4uIGZtdCAuLiAiKSIKICBsb2NhbCBzdCA9IF9kdWNrZGJfY2FsbChzcWwpCiAgaWYgc3Qgfj0gJ29rJyB0aGVuIHJldHVybiBzdCBlbmQKICByZXR1cm4gJ29rOiAnIC4uIHAuZmlsZSAuLiAnICgnIC4uIGZtdCAuLiAnKScKZW5kCgAtLSBzY2QyLmx1YTog57yT5oWi5Y+Y5YyW57u05bqm77yIU0NEIOexu+WeiyAy77yJ4oCU4oCU5bGe5oCn5Y+Y5YyW5L+d55WZ5Y6G5Y+y54mI5pys77yIMjAyNi0wOC0xM++8iQotLSBAbGljZW5zZTogTUlUIChkdWNrZGItbHVhaml0LWxpYnMgcHJvamVjdCkKLS0gQG1hdHVyaXR5OiB0ZXN0ZWQKLS0g6ZyA6KaB5pmu6YCa5qih5byP77yI6Z2eIHRydXN0ZWTvvInvvJpfZHVja2RiX2NhbGwgLyBfZHVja2RiX3F1ZXJ5Ci0tCi0tIOeUqOazle+8iGluc3RhbGwg5ZCO77yJ77yaCi0tICAgU0VMRUNUICogRlJPTSBsdWFqaXRfbW9kdWxlKG1vZGUgOj0gJ2luc3RhbGwnLCBzcWxfbmFtZSA6PSAnc2NkMicpOwotLSAgIFNFTEVDVCAqIEZST00gbHVhaml0X21vZHVsZShtb2RlIDo9ICdjb21waWxlJywgc3FsX25hbWUgOj0gJ3NjZDJfcnVuJywKLS0gICAgIHNvdXJjZSA6PSAncmV0dXJuIGZ1bmN0aW9uKG9wdHMpIHJldHVybiBzY2QyLnJ1bihvcHRzKSBlbmQnKTsKLS0gICBTRUxFQ1Qgc2NkMl9ydW4oe3RhcmdldDo9J2RpbV9jdXN0b21lcicsIHNvdXJjZTo9J3NyY19jdXN0b21lcicsIGtleV9jb2w6PSdjdXN0X2lkJywKLS0gICAgICAgICAgICAgICAgICAgIGF0dHJfY29sczo9eydjaXR5JywndGllcid9LCB0c19jb2w6PSd0cyd9KTsKLS0KLS0g55uu5qCH6KGo57uT5p6E77yI6aaW5qyh6Ieq5Yqo5bu677yJ77yaCi0tICAgPOa6kOWFqOmDqOS4muWKoeWIlz4gKyBfdmFsaWRfZnJvbSBUSU1FU1RBTVAgKyBfdmFsaWRfdG8gVElNRVNUQU1QICsgX2lzX2N1cnJlbnQgQk9PTEVBTiArIF92ZXJzaW9uIEJJR0lOVAotLSDlsZ7mgKfmr5TovoPvvJptZDUoY29uY2F0X3dzKCd8JywgY2FzdChhIGFzIHZhcmNoYXIpLCAuLi4pKSDmjIfnurnvvIhEdWNrREIg5YaF5bu6IG1kNe+8iQotLSDor63kuYnvvJprZXkg55u45ZCMICsg5oyH57q55LiN5ZCMIOKGkiDlhbPpl63ml6fniYjmnKwoX3ZhbGlkX3RvPXRzLCBfaXNfY3VycmVudD1mYWxzZSnvvIzlvIDmlrDniYjmnKwodmVyc2lvbisxKQotLSAgICAgICBrZXkg5LiN5a2Y5ZyoIOKGkiDnm7TmjqXmj5LlhaUgdmVyc2lvbj0xCi0tICAgICAgIOaMh+e6ueebuOWQjCDihpIg6Lez6L+H77yI5bmC562J77yM6YeN5aSN6LeR5LiN5Lqn55Sf5paw54mI5pys77yJCi0tIOe6puWumu+8mnNvdXJjZSDkuLrooajlkI3vvJt0c19jb2wg5Lmf5Zyo5Lia5Yqh5YiX6YeM77yIU0VMRUNUICog5L+d55WZ77yJCgpsb2NhbCBzY2QyID0ge30KCmxvY2FsIGZ1bmN0aW9uIGVzYyh2KQogIGlmIHR5cGUodikgPT0gJ3N0cmluZycgdGhlbiByZXR1cm4gIiciIC4uIHY6Z3N1YigiJyIsICInJyIpIC4uICInIiBlbmQKICBpZiB2ID09IG5pbCB0aGVuIHJldHVybiAnTlVMTCcgZW5kCiAgcmV0dXJuIHRvc3RyaW5nKHYpCmVuZAoKLS0g5bGe5oCn5oyH57q56KGo6L6+5byPCmxvY2FsIGZ1bmN0aW9uIGZwX2V4cHIoYXR0cl9jb2xzKQogIGxvY2FsIHBhcnRzID0ge30KICBmb3IgXywgYyBpbiBpcGFpcnMoYXR0cl9jb2xzKSBkbwogICAgcGFydHNbI3BhcnRzICsgMV0gPSAnY29hbGVzY2UoY2FzdCgnIC4uIGMgLi4gJyBhcyB2YXJjaGFyKSwgY2hyKDApKScKICBlbmQKICByZXR1cm4gIm1kNShjb25jYXRfd3MoJ3wnLCAiIC4uIHRhYmxlLmNvbmNhdChwYXJ0cywgJywgJykgLi4gJykpJwplbmQKCi0tIOWPluihqOS4muWKoeWIl++8iOaMieWumuS5iemhuuW6j++8iQpsb2NhbCBmdW5jdGlvbiBjb2x1bW5zX29mKHRibCkKICBsb2NhbCByb3dzLCBlcnIgPSBfZHVja2RiX3F1ZXJ5KAogICAgIlNFTEVDVCBjb2x1bW5fbmFtZSBGUk9NIGluZm9ybWF0aW9uX3NjaGVtYS5jb2x1bW5zIFdIRVJFIHRhYmxlX25hbWUgPSAiIC4uIGVzYyh0YmwpCiAgICAuLiAnIEFORCB0YWJsZV9zY2hlbWEgPSBjdXJyZW50X3NjaGVtYSgpIE9SREVSIEJZIG9yZGluYWxfcG9zaXRpb24nKQogIGlmIG5vdCByb3dzIHRoZW4gZXJyb3IoJ3NjZDI6IGNhbm5vdCBpbnRyb3NwZWN0ICcgLi4gdGJsIC4uICc6ICcgLi4gdG9zdHJpbmcoZXJyKSwgMCkgZW5kCiAgbG9jYWwgY29scyA9IHt9CiAgZm9yIF8sIHIgaW4gaXBhaXJzKHJvd3MpIGRvIGNvbHNbI2NvbHMgKyAxXSA9IHIuY29sdW1uX25hbWUgZW5kCiAgaWYgI2NvbHMgPT0gMCB0aGVuIGVycm9yKCdzY2QyOiBubyBjb2x1bW5zIGZvdW5kIGZvciAnIC4uIHRibCwgMCkgZW5kCiAgcmV0dXJuIGNvbHMKZW5kCgotLSDmiafooYwgU0NEMiDlkIjlubYKLS0gb3B0cyA9IHsgdGFyZ2V0Peebruagh+e7tOW6puihqCwgc291cmNlPea6kOihqCwga2V5X2NvbD3kuJrliqHplK4sIGF0dHJfY29scz175bGe5oCnLi4ufSwgdHNfY29sPeeUn+aViOaXtumXtCB9Ci0tIOi/lOWbniB7aW5zZXJ0ZWQ9TiwgY2xvc2VkPU59CmZ1bmN0aW9uIHNjZDIucnVuKG9wdHMpCiAgb3B0cyA9IG9wdHMgb3Ige30KICBsb2NhbCB0YXJnZXQsIHNvdXJjZSA9IG9wdHMudGFyZ2V0LCBvcHRzLnNvdXJjZQogIGxvY2FsIGtleV9jb2wsIHRzX2NvbCA9IG9wdHMua2V5X2NvbCwgb3B0cy50c19jb2wKICBsb2NhbCBhdHRyX2NvbHMgPSBvcHRzLmF0dHJfY29scyBvciB7fQogIGlmIG5vdCB0YXJnZXQgb3Igbm90IHNvdXJjZSBvciBub3Qga2V5X2NvbCBvciBub3QgdHNfY29sIG9yICNhdHRyX2NvbHMgPT0gMCB0aGVuCiAgICBlcnJvcignc2NkMjogdGFyZ2V0LCBzb3VyY2UsIGtleV9jb2wsIHRzX2NvbCwgYXR0cl9jb2xzIHJlcXVpcmVkJywgMCkgZW5kCgogIC0tIDEuIOW7uuebruagh+ihqO+8iOWkjeWItua6kOe7k+aehCArIOeuoeeQhuWIl++8iQogIGxvY2FsIHIgPSBfZHVja2RiX2NhbGwoJ0NSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTICcgLi4gdGFyZ2V0CiAgICAuLiAnIEFTIFNFTEVDVCAqIEZST00gJyAuLiBzb3VyY2UgLi4gJyBXSEVSRSBGQUxTRScpCiAgaWYgdHlwZShyKSA9PSAnc3RyaW5nJyBhbmQgcjptYXRjaCgnXmVycm9yOicpIHRoZW4gZXJyb3IocjpzdWIoNyksIDApIGVuZAogIGZvciBfLCBkZGwgaW4gaXBhaXJzKHsKICAgICdBTFRFUiBUQUJMRSAnIC4uIHRhcmdldCAuLiAnIEFERCBDT0xVTU4gSUYgTk9UIEVYSVNUUyBfdmFsaWRfZnJvbSBUSU1FU1RBTVAnLAogICAgJ0FMVEVSIFRBQkxFICcgLi4gdGFyZ2V0IC4uICcgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIF92YWxpZF90byBUSU1FU1RBTVAnLAogICAgJ0FMVEVSIFRBQkxFICcgLi4gdGFyZ2V0IC4uICcgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIF9pc19jdXJyZW50IEJPT0xFQU4nLAogICAgJ0FMVEVSIFRBQkxFICcgLi4gdGFyZ2V0IC4uICcgQUREIENPTFVNTiBJRiBOT1QgRVhJU1RTIF92ZXJzaW9uIEJJR0lOVCcsCiAgfSkgZG8KICAgIGxvY2FsIHJyID0gX2R1Y2tkYl9jYWxsKGRkbCkKICAgIGlmIHR5cGUocnIpID09ICdzdHJpbmcnIGFuZCBycjptYXRjaCgnXmVycm9yOicpIHRoZW4gZXJyb3IocnI6c3ViKDcpLCAwKSBlbmQKICBlbmQKCiAgbG9jYWwgY29scyA9IGNvbHVtbnNfb2Yoc291cmNlKQogIGxvY2FsIGZwID0gZnBfZXhwcihhdHRyX2NvbHMpCiAgbG9jYWwgc3JjID0gJyhTRUxFQ1Qgcy4qLCAnIC4uIGZwIC4uICcgQVMgX2ZwIEZST00gJyAuLiBzb3VyY2UgLi4gJyBzKScKICBsb2NhbCBjdXIgPSAnKFNFTEVDVCAnIC4uIGtleV9jb2wgLi4gJyBBUyBrZXksICcgLi4gZnAgLi4gJyBBUyBfZnAsIF92ZXJzaW9uIEZST00gJwogICAgLi4gdGFyZ2V0IC4uICcgV0hFUkUgX2lzX2N1cnJlbnQpJwoKICAtLSAyLiDnianljJblvoXmj5LlhaXpm4bvvIjln7rkuo7ml6fnirbmgIHvvJrmlrAga2V5IOaIluWxnuaAp+WPmOWMlu+8m3ZlcnNpb24gPSDml6fniYjmnKwgKyAx77yJCiAgbG9jYWwgaW5zID0gJyhTRUxFQ1Qgcy4qLCBzLicgLi4gdHNfY29sIC4uICcgQVMgX3ZhbGlkX2Zyb20sIE5VTEwgQVMgX3ZhbGlkX3RvLCB0cnVlIEFTIF9pc19jdXJyZW50LCcKICAgIC4uICcgY29hbGVzY2UoYy5fdmVyc2lvbiwgMCkgKyAxIEFTIF92ZXJzaW9uIEZST00gJyAuLiBzcmMgLi4gJyBzJwogICAgLi4gJyBMRUZUIEpPSU4gKFNFTEVDVCAqIEZST00gJyAuLiBjdXIgLi4gJykgYyBPTiBzLicgLi4ga2V5X2NvbCAuLiAnID0gYy5rZXknCiAgICAuLiAnIFdIRVJFIGMua2V5IElTIE5VTEwgT1Igcy5fZnAgPD4gYy5fZnApJwogIGxvY2FsIGlxLCBpZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gJyAuLiBpbnMpCiAgaWYgbm90IGlxIHRoZW4gZXJyb3IoJ3NjZDI6ICcgLi4gdG9zdHJpbmcoaWVyciksIDApIGVuZAogIGxvY2FsIGluc2VydGVkID0gdG9udW1iZXIoaXFbMV0ubikgb3IgMAogIGlmIGluc2VydGVkID4gMCB0aGVuCiAgICBsb2NhbCByciA9IF9kdWNrZGJfY2FsbCgnQ1JFQVRFIE9SIFJFUExBQ0UgVEVNUCBUQUJMRSBfc2NkMl9pbnMgQVMgJyAuLiBpbnMpCiAgICBpZiB0eXBlKHJyKSA9PSAnc3RyaW5nJyBhbmQgcnI6bWF0Y2goJ15lcnJvcjonKSB0aGVuIGVycm9yKHJyOnN1Yig3KSwgMCkgZW5kCiAgZW5kCgogIC0tIDMuIOWFs+mXreaXp+eJiOacrO+8iOWfuuS6juaXp+eKtuaAge+8m0lOU0VSVCDlsJrmnKrlj5HnlJ/vvIxjdXIg5b+r54Wn5LiN5Y+Y77yJCiAgbG9jYWwgY2hnID0gJyhTRUxFQ1QgYy5rZXksIHMudHMgRlJPTSAnIC4uIHNyYyAuLiAnIHMgSk9JTiAoU0VMRUNUICogRlJPTSAnIC4uIGN1ciAuLiAnKSBjJwogICAgLi4gJyBPTiBzLicgLi4ga2V5X2NvbCAuLiAnID0gYy5rZXkgV0hFUkUgcy5fZnAgPD4gYy5fZnApJwogIGxvY2FsIGNxLCBjZXJyID0gX2R1Y2tkYl9xdWVyeSgnU0VMRUNUIENBU1QoY291bnQoKikgQVMgQklHSU5UKSBBUyBuIEZST00gJyAuLiBjaGcpCiAgaWYgbm90IGNxIHRoZW4gZXJyb3IoJ3NjZDI6ICcgLi4gdG9zdHJpbmcoY2VyciksIDApIGVuZAogIGxvY2FsIGNsb3NlZCA9IHRvbnVtYmVyKGNxWzFdLm4pIG9yIDAKICBpZiBjbG9zZWQgPiAwIHRoZW4KICAgIGxvY2FsIHJyID0gX2R1Y2tkYl9jYWxsKCdVUERBVEUgJyAuLiB0YXJnZXQgLi4gJyB0IFNFVCBfdmFsaWRfdG8gPSB1LnRzLCBfaXNfY3VycmVudCA9IGZhbHNlJwogICAgICAuLiAnIEZST00gJyAuLiBjaGcgLi4gJyB1IFdIRVJFIHQuJyAuLiBrZXlfY29sIC4uICcgPSB1LmtleSBBTkQgdC5faXNfY3VycmVudCcpCiAgICBpZiB0eXBl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ZW1wb3JhcmlseSB1bmF2YWlsYWJsZQBJbnZhbGlkIHNlZWsAQ3Jvc3MtZGV2aWNlIGxpbmsAUmVhZC1vbmx5IGZpbGUgc3lzdGVtAERpcmVjdG9yeSBub3QgZW1wdHkAQ29ubmVjdGlvbiByZXNldCBieSBwZWVyAE9wZXJhdGlvbiB0aW1lZCBvdXQAQ29ubmVjdGlvbiByZWZ1c2VkAEhvc3QgaXMgZG93bgBIb3N0IGlzIHVucmVhY2hhYmxlAEFkZHJlc3MgaW4gdXNlAEJyb2tlbiBwaXBlAEkvTyBlcnJvcgBObyBzdWNoIGRldmljZSBvciBhZGRyZXNzAEJsb2NrIGRldmljZSByZXF1aXJlZABObyBzdWNoIGRldmljZQBOb3QgYSBkaXJlY3RvcnkASXMgYSBkaXJlY3RvcnkAVGV4dCBmaWxlIGJ1c3kARXhlYyBmb3JtYXQgZXJyb3IASW52YWxpZCBhcmd1bWVudABBcmd1bWVudCBsaXN0IHRvbyBsb25nAFN5bWJvbGljIGxpbmsgbG9vcABGaWxlbmFtZSB0b28gbG9uZwBUb28gbWFueSBvcGVuIGZpbGVzIGluIHN5c3RlbQBObyBmaWxlIGRlc2NyaXB0b3JzIGF2YWlsYWJsZQBCYWQgZmlsZSBkZXNjcmlwdG9yAE5vIGNoaWxkIHByb2Nlc3MAQmFkIGFkZHJlc3MARmlsZSB0b28gbGFyZ2UAVG9vIG1hbnkgbGlua3MATm8gbG9ja3MgYXZhaWxhYmxlAFJlc291cmNlIGRlYWRsb2NrIHdvdWxkIG9jY3VyAFN0YXRlIG5vdCByZWNvdmVyYWJsZQBQcmV2aW91cyBvd25lciBkaWVkAE9wZXJhdGlvbiBjYW5jZWxlZABGdW5jdGlvbiBub3QgaW1wbGVtZW50ZWQATm8gbWVzc2FnZSBvZiBkZXNpcmVkIHR5cGUASWRlbnRpZmllciByZW1vdmVkAERldmljZSBub3QgYSBzdHJlYW0ATm8gZGF0YSBhdmFpbGFibGUARGV2aWNlIHRpbWVvdXQAT3V0IG9mIHN0cmVhbXMgcmVzb3VyY2VzAExpbmsgaGFzIGJlZW4gc2V2ZXJlZABQcm90b2NvbCBlcnJvcgBCYWQgbWVzc2FnZQBGaWxlIGRlc2NyaXB0b3IgaW4gYmFkIHN0YXRlAE5vdCBhIHNvY2tldABEZXN0aW5hdGlvbiBhZGRyZXNzIHJlcXVpcmVkAE1lc3NhZ2UgdG9vIGxhcmdlAFByb3RvY29sIHdyb25nIHR5cGUgZm9yIHNvY2tldABQcm90b2NvbCBub3QgYXZhaWxhYmxlAFByb3RvY29sIG5vdCBzdXBwb3J0ZWQAU29ja2V0IHR5cGUgbm90IHN1cHBvcnRlZABOb3Qgc3VwcG9ydGVkAFByb3RvY29sIGZhbWlseSBub3Qgc3VwcG9ydGVkAEFkZHJlc3MgZmFtaWx5IG5vdCBzdXBwb3J0ZWQgYnkgcHJvdG9jb2wAQWRkcmVzcyBub3QgYXZhaWxhYmxlAE5ldHdvcmsgaXMgZG93bgBOZXR3b3JrIHVucmVhY2hhYmxlAENvbm5lY3Rpb24gcmVzZXQgYnkgbmV0d29yawBDb25uZWN0aW9uIGFib3J0ZWQATm8gYnVmZmVyIHNwYWNlIGF2YWlsYWJsZQBTb2NrZXQgaXMgY29ubmVjdGVkAFNvY2tldCBub3QgY29ubmVjdGVkAENhbm5vdCBzZW5kIGFmdGVyIHNvY2tldCBzaHV0ZG93bgBPcGVyYXRpb24gYWxyZWFkeSBpbiBwcm9ncmVzcwBPcGVyYXRpb24gaW4gcHJvZ3Jlc3MAU3RhbGUgZmlsZSBoYW5kbGUAUmVtb3RlIEkvTyBlcnJvcgBRdW90YSBleGNlZWRlZABObyBtZWRpdW0gZm91bmQAV3JvbmcgbWVkaXVtIHR5cGUATXVsdGlob3AgYXR0ZW1wdGVkAAAAAAAAAAAAAAAAAAAAAAClAlsA8AG1BYwFJQGDBh0DlAT/AMcDMQMLBrwBjwF/A8oEKwDaBq8AQgNOA9wBDgQVAKEGDQGUAgsCOAZkArwC/wJdA+cECwfPAssF7wXbBeECHgZFAoUAggJsA28E8QDzAxgF2QDaA0wGVAJ7AZ0DvQQAAFEAFQK7ALMDbQD/AYUELwX5BDgAZQFGAZ8AtwaoAXMCUwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhBAAAAAAAAAAALwIAAAAAAAAAAAAAAAAAAAAAAAAAADUERwRWBAAAAAAAAAAAAAAAAAAAAACgBAAAAAAAAAAAAAAA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';
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

  var _emscripten_get_now;if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = () => {
      var t = process['hrtime']();
      return t[0] * 1e3 + t[1] / 1e6;
    };
  } else _emscripten_get_now = () => performance.now();
  ;
  
  var _emscripten_get_now_is_monotonic = true;;
  
  function setErrNo(value) {
      HEAP32[((___errno_location())>>2)] = value;
      return value;
    }
  function _clock_gettime(clk_id, tp) {
      // int clock_gettime(clockid_t clk_id, struct timespec *tp);
      var now;
      if (clk_id === 0) {
        now = Date.now();
      } else if ((clk_id === 1 || clk_id === 4) && _emscripten_get_now_is_monotonic) {
        now = _emscripten_get_now();
      } else {
        setErrNo(28);
        return -1;
      }
      HEAP32[((tp)>>2)] = (now/1000)|0; // seconds
      HEAP32[(((tp)+(4))>>2)] = ((now % 1000)*1000*1000)|0; // nanoseconds
      return 0;
    }
  function ___clock_gettime(a0,a1
  ) {
  return _clock_gettime(a0,a1);
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

  function ___syscall_lstat64(path, buf) {
  try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.lstat, path, buf);
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

  function ___syscall_rename(old_path, new_path) {
  try {
  
      old_path = SYSCALLS.getStr(old_path);
      new_path = SYSCALLS.getStr(new_path);
      FS.rename(old_path, new_path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function ___syscall_rmdir(path) {
  try {
  
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function ___syscall_unlink(path) {
  try {
  
      path = SYSCALLS.getStr(path);
      FS.unlink(path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e instanceof FS.ErrnoError)) throw e;
    return -e.errno;
  }
  }

  function __gmtime_js(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)] = date.getUTCSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getUTCMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getUTCHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getUTCDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getUTCMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getUTCFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
    }

  function __localtime_js(time, tmPtr) {
      var date = new Date(HEAP32[((time)>>2)]*1000);
      HEAP32[((tmPtr)>>2)] = date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();
  
      var start = new Date(date.getFullYear(), 0, 1);
      var yday = ((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      HEAP32[(((tmPtr)+(36))>>2)] = -(date.getTimezoneOffset() * 60);
  
      // Attention: DST is in December in South, and some regions don't have DST at all.
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset))|0;
      HEAP32[(((tmPtr)+(32))>>2)] = dst;
    }

  function __mktime_js(tmPtr) {
      var date = new Date(HEAP32[(((tmPtr)+(20))>>2)] + 1900,
                          HEAP32[(((tmPtr)+(16))>>2)],
                          HEAP32[(((tmPtr)+(12))>>2)],
                          HEAP32[(((tmPtr)+(8))>>2)],
                          HEAP32[(((tmPtr)+(4))>>2)],
                          HEAP32[((tmPtr)>>2)],
                          0);
  
      // There's an ambiguous hour when the time goes back; the tm_isdst field is
      // used to disambiguate it.  Date() basically guesses, so we fix it up if it
      // guessed wrong, or fill in tm_isdst with the guess if it's -1.
      var dst = HEAP32[(((tmPtr)+(32))>>2)];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset); // DST is in December in South
      if (dst < 0) {
        // Attention: some regions don't have DST at all.
        HEAP32[(((tmPtr)+(32))>>2)] = Number(summerOffset != winterOffset && dstOffset == guessedOffset);
      } else if ((dst > 0) != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        // Don't try setMinutes(date.getMinutes() + ...) -- it's messed up.
        date.setTime(date.getTime() + (trueOffset - guessedOffset)*60000);
      }
  
      HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();
      var yday = ((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      // To match expected behavior, update fields from date
      HEAP32[((tmPtr)>>2)] = date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
  
      return (date.getTime() / 1000)|0;
    }

  function _tzset_impl(timezone, daylight, tzname) {
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
  
      // Local standard timezone offset. Local standard time is not adjusted for daylight savings.
      // This code uses the fact that getTimezoneOffset returns a greater value during Standard Time versus Daylight Saving Time (DST).
      // Thus it determines the expected output during Standard Time, and it compares whether the output of the given date the same (Standard) or less (DST).
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  
      // timezone is specified as seconds west of UTC ("The external variable
      // `timezone` shall be set to the difference, in seconds, between
      // Coordinated Universal Time (UTC) and local standard time."), the same
      // as returned by stdTimezoneOffset.
      // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
      HEAP32[((timezone)>>2)] = stdTimezoneOffset * 60;
  
      HEAP32[((daylight)>>2)] = Number(winterOffset != summerOffset);
  
      function extractZone(date) {
        var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
        return match ? match[1] : "GMT";
      };
      var winterName = extractZone(winter);
      var summerName = extractZone(summer);
      var winterNamePtr = allocateUTF8(winterName);
      var summerNamePtr = allocateUTF8(summerName);
      if (summerOffset < winterOffset) {
        // Northern hemisphere
        HEAP32[((tzname)>>2)] = winterNamePtr;
        HEAP32[(((tzname)+(4))>>2)] = summerNamePtr;
      } else {
        HEAP32[((tzname)>>2)] = summerNamePtr;
        HEAP32[(((tzname)+(4))>>2)] = winterNamePtr;
      }
    }
  function __tzset_js(timezone, daylight, tzname) {
      // TODO: Use (malleable) environment variables instead of system settings.
      if (__tzset_js.called) return;
      __tzset_js.called = true;
      _tzset_impl(timezone, daylight, tzname);
    }

  function _abort() {
      abort('');
    }

  function _clock() {
      if (_clock.start === undefined) _clock.start = Date.now();
      return ((Date.now() - _clock.start) * (1000000 / 1000))|0;
    }

  function _difftime(time1, time0) {
      return time1 - time0;
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

  var ENV = {};
  
  function getExecutableName() {
      return thisProgram || './this.program';
    }
  function getEnvStrings() {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(x + '=' + env[x]);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    }
  function _environ_get(__environ, environ_buf) {
      var bufSize = 0;
      getEnvStrings().forEach(function(string, i) {
        var ptr = environ_buf + bufSize;
        HEAP32[(((__environ)+(i * 4))>>2)] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    }

  function _environ_sizes_get(penviron_count, penviron_buf_size) {
      var strings = getEnvStrings();
      HEAP32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      strings.forEach(function(string) {
        bufSize += string.length + 1;
      });
      HEAP32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    }

  function _exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      exit(status);
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

  function __isLeapYear(year) {
        return year%4 === 0 && (year%100 !== 0 || year%400 === 0);
    }
  
  function __arraySum(array, index) {
      var sum = 0;
      for (var i = 0; i <= index; sum += array[i++]) {
        // no-op
      }
      return sum;
    }
  
  var __MONTH_DAYS_LEAP = [31,29,31,30,31,30,31,31,30,31,30,31];
  
  var __MONTH_DAYS_REGULAR = [31,28,31,30,31,30,31,31,30,31,30,31];
  function __addDays(date, days) {
      var newDate = new Date(date.getTime());
      while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  
        if (days > daysInCurrentMonth-newDate.getDate()) {
          // we spill over to next month
          days -= (daysInCurrentMonth-newDate.getDate()+1);
          newDate.setDate(1);
          if (currentMonth < 11) {
            newDate.setMonth(currentMonth+1)
          } else {
            newDate.setMonth(0);
            newDate.setFullYear(newDate.getFullYear()+1);
          }
        } else {
          // we stay in current month
          newDate.setDate(newDate.getDate()+days);
          return newDate;
        }
      }
  
      return newDate;
    }
  function _strftime(s, maxsize, format, tm) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
  
      var tm_zone = HEAP32[(((tm)+(40))>>2)];
  
      var date = {
        tm_sec: HEAP32[((tm)>>2)],
        tm_min: HEAP32[(((tm)+(4))>>2)],
        tm_hour: HEAP32[(((tm)+(8))>>2)],
        tm_mday: HEAP32[(((tm)+(12))>>2)],
        tm_mon: HEAP32[(((tm)+(16))>>2)],
        tm_year: HEAP32[(((tm)+(20))>>2)],
        tm_wday: HEAP32[(((tm)+(24))>>2)],
        tm_yday: HEAP32[(((tm)+(28))>>2)],
        tm_isdst: HEAP32[(((tm)+(32))>>2)],
        tm_gmtoff: HEAP32[(((tm)+(36))>>2)],
        tm_zone: tm_zone ? UTF8ToString(tm_zone) : ''
      };
  
      var pattern = UTF8ToString(format);
  
      // expand format
      var EXPANSION_RULES_1 = {
        '%c': '%a %b %d %H:%M:%S %Y',     // Replaced by the locale's appropriate date and time representation - e.g., Mon Aug  3 14:02:01 2013
        '%D': '%m/%d/%y',                 // Equivalent to %m / %d / %y
        '%F': '%Y-%m-%d',                 // Equivalent to %Y - %m - %d
        '%h': '%b',                       // Equivalent to %b
        '%r': '%I:%M:%S %p',              // Replaced by the time in a.m. and p.m. notation
        '%R': '%H:%M',                    // Replaced by the time in 24-hour notation
        '%T': '%H:%M:%S',                 // Replaced by the time
        '%x': '%m/%d/%y',                 // Replaced by the locale's appropriate date representation
        '%X': '%H:%M:%S',                 // Replaced by the locale's appropriate time representation
        // Modified Conversion Specifiers
        '%Ec': '%c',                      // Replaced by the locale's alternative appropriate date and time representation.
        '%EC': '%C',                      // Replaced by the name of the base year (period) in the locale's alternative representation.
        '%Ex': '%m/%d/%y',                // Replaced by the locale's alternative date representation.
        '%EX': '%H:%M:%S',                // Replaced by the locale's alternative time representation.
        '%Ey': '%y',                      // Replaced by the offset from %EC (year only) in the locale's alternative representation.
        '%EY': '%Y',                      // Replaced by the full alternative year representation.
        '%Od': '%d',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading zeros if there is any alternative symbol for zero; otherwise, with leading <space> characters.
        '%Oe': '%e',                      // Replaced by the day of the month, using the locale's alternative numeric symbols, filled as needed with leading <space> characters.
        '%OH': '%H',                      // Replaced by the hour (24-hour clock) using the locale's alternative numeric symbols.
        '%OI': '%I',                      // Replaced by the hour (12-hour clock) using the locale's alternative numeric symbols.
        '%Om': '%m',                      // Replaced by the month using the locale's alternative numeric symbols.
        '%OM': '%M',                      // Replaced by the minutes using the locale's alternative numeric symbols.
        '%OS': '%S',                      // Replaced by the seconds using the locale's alternative numeric symbols.
        '%Ou': '%u',                      // Replaced by the weekday as a number in the locale's alternative representation (Monday=1).
        '%OU': '%U',                      // Replaced by the week number of the year (Sunday as the first day of the week, rules corresponding to %U ) using the locale's alternative numeric symbols.
        '%OV': '%V',                      // Replaced by the week number of the year (Monday as the first day of the week, rules corresponding to %V ) using the locale's alternative numeric symbols.
        '%Ow': '%w',                      // Replaced by the number of the weekday (Sunday=0) using the locale's alternative numeric symbols.
        '%OW': '%W',                      // Replaced by the week number of the year (Monday as the first day of the week) using the locale's alternative numeric symbols.
        '%Oy': '%y',                      // Replaced by the year (offset from %C ) using the locale's alternative numeric symbols.
      };
      for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_1[rule]);
      }
  
      var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
      function leadingSomething(value, digits, character) {
        var str = typeof value == 'number' ? value.toString() : (value || '');
        while (str.length < digits) {
          str = character[0]+str;
        }
        return str;
      }
  
      function leadingNulls(value, digits) {
        return leadingSomething(value, digits, '0');
      }
  
      function compareByDay(date1, date2) {
        function sgn(value) {
          return value < 0 ? -1 : (value > 0 ? 1 : 0);
        }
  
        var compare;
        if ((compare = sgn(date1.getFullYear()-date2.getFullYear())) === 0) {
          if ((compare = sgn(date1.getMonth()-date2.getMonth())) === 0) {
            compare = sgn(date1.getDate()-date2.getDate());
          }
        }
        return compare;
      }
  
      function getFirstWeekStartDate(janFourth) {
          switch (janFourth.getDay()) {
            case 0: // Sunday
              return new Date(janFourth.getFullYear()-1, 11, 29);
            case 1: // Monday
              return janFourth;
            case 2: // Tuesday
              return new Date(janFourth.getFullYear(), 0, 3);
            case 3: // Wednesday
              return new Date(janFourth.getFullYear(), 0, 2);
            case 4: // Thursday
              return new Date(janFourth.getFullYear(), 0, 1);
            case 5: // Friday
              return new Date(janFourth.getFullYear()-1, 11, 31);
            case 6: // Saturday
              return new Date(janFourth.getFullYear()-1, 11, 30);
          }
      }
  
      function getWeekBasedYear(date) {
          var thisDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
          var janFourthNextYear = new Date(thisDate.getFullYear()+1, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            // this date is after the start of the first week of this year
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
              return thisDate.getFullYear()+1;
            } else {
              return thisDate.getFullYear();
            }
          } else {
            return thisDate.getFullYear()-1;
          }
      }
  
      var EXPANSION_RULES_2 = {
        '%a': function(date) {
          return WEEKDAYS[date.tm_wday].substring(0,3);
        },
        '%A': function(date) {
          return WEEKDAYS[date.tm_wday];
        },
        '%b': function(date) {
          return MONTHS[date.tm_mon].substring(0,3);
        },
        '%B': function(date) {
          return MONTHS[date.tm_mon];
        },
        '%C': function(date) {
          var year = date.tm_year+1900;
          return leadingNulls((year/100)|0,2);
        },
        '%d': function(date) {
          return leadingNulls(date.tm_mday, 2);
        },
        '%e': function(date) {
          return leadingSomething(date.tm_mday, 2, ' ');
        },
        '%g': function(date) {
          // %g, %G, and %V give values according to the ISO 8601:2000 standard week-based year.
          // In this system, weeks begin on a Monday and week 1 of the year is the week that includes
          // January 4th, which is also the week that includes the first Thursday of the year, and
          // is also the first week that contains at least four days in the year.
          // If the first Monday of January is the 2nd, 3rd, or 4th, the preceding days are part of
          // the last week of the preceding year; thus, for Saturday 2nd January 1999,
          // %G is replaced by 1998 and %V is replaced by 53. If December 29th, 30th,
          // or 31st is a Monday, it and any following days are part of week 1 of the following year.
          // Thus, for Tuesday 30th December 1997, %G is replaced by 1998 and %V is replaced by 01.
  
          return getWeekBasedYear(date).toString().substring(2);
        },
        '%G': function(date) {
          return getWeekBasedYear(date);
        },
        '%H': function(date) {
          return leadingNulls(date.tm_hour, 2);
        },
        '%I': function(date) {
          var twelveHour = date.tm_hour;
          if (twelveHour == 0) twelveHour = 12;
          else if (twelveHour > 12) twelveHour -= 12;
          return leadingNulls(twelveHour, 2);
        },
        '%j': function(date) {
          // Day of the year (001-366)
          return leadingNulls(date.tm_mday+__arraySum(__isLeapYear(date.tm_year+1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon-1), 3);
        },
        '%m': function(date) {
          return leadingNulls(date.tm_mon+1, 2);
        },
        '%M': function(date) {
          return leadingNulls(date.tm_min, 2);
        },
        '%n': function() {
          return '\n';
        },
        '%p': function(date) {
          if (date.tm_hour >= 0 && date.tm_hour < 12) {
            return 'AM';
          } else {
            return 'PM';
          }
        },
        '%S': function(date) {
          return leadingNulls(date.tm_sec, 2);
        },
        '%t': function() {
          return '\t';
        },
        '%u': function(date) {
          return date.tm_wday || 7;
        },
        '%U': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Sunday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year+1900, 0, 1);
          var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7-janFirst.getDay());
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Sunday?
          if (compareByDay(firstSunday, endDate) < 0) {
            // calculate difference in days between first Sunday and endDate
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstSundayUntilEndJanuary = 31-firstSunday.getDate();
            var days = firstSundayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
  
          return compareByDay(firstSunday, janFirst) === 0 ? '01': '00';
        },
        '%V': function(date) {
          // Replaced by the week number of the year (Monday as the first day of the week)
          // as a decimal number [01,53]. If the week containing 1 January has four
          // or more days in the new year, then it is considered week 1.
          // Otherwise, it is the last week of the previous year, and the next week is week 1.
          // Both January 4th and the first Thursday of January are always in week 1. [ tm_year, tm_wday, tm_yday]
          var janFourthThisYear = new Date(date.tm_year+1900, 0, 4);
          var janFourthNextYear = new Date(date.tm_year+1901, 0, 4);
  
          var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
          var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  
          var endDate = __addDays(new Date(date.tm_year+1900, 0, 1), date.tm_yday);
  
          if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
            // if given date is before this years first week, then it belongs to the 53rd week of last year
            return '53';
          }
  
          if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
            // if given date is after next years first week, then it belongs to the 01th week of next year
            return '01';
          }
  
          // given date is in between CW 01..53 of this calendar year
          var daysDifference;
          if (firstWeekStartThisYear.getFullYear() < date.tm_year+1900) {
            // first CW of this year starts last year
            daysDifference = date.tm_yday+32-firstWeekStartThisYear.getDate()
          } else {
            // first CW of this year starts this year
            daysDifference = date.tm_yday+1-firstWeekStartThisYear.getDate();
          }
          return leadingNulls(Math.ceil(daysDifference/7), 2);
        },
        '%w': function(date) {
          return date.tm_wday;
        },
        '%W': function(date) {
          // Replaced by the week number of the year as a decimal number [00,53].
          // The first Monday of January is the first day of week 1;
          // days in the new year before this are in week 0. [ tm_year, tm_wday, tm_yday]
          var janFirst = new Date(date.tm_year, 0, 1);
          var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7-janFirst.getDay()+1);
          var endDate = new Date(date.tm_year+1900, date.tm_mon, date.tm_mday);
  
          // is target date after the first Monday?
          if (compareByDay(firstMonday, endDate) < 0) {
            var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth()-1)-31;
            var firstMondayUntilEndJanuary = 31-firstMonday.getDate();
            var days = firstMondayUntilEndJanuary+februaryFirstUntilEndMonth+endDate.getDate();
            return leadingNulls(Math.ceil(days/7), 2);
          }
          return compareByDay(firstMonday, janFirst) === 0 ? '01': '00';
        },
        '%y': function(date) {
          // Replaced by the last two digits of the year as a decimal number [00,99]. [ tm_year]
          return (date.tm_year+1900).toString().substring(2);
        },
        '%Y': function(date) {
          // Replaced by the year as a decimal number (for example, 1997). [ tm_year]
          return date.tm_year+1900;
        },
        '%z': function(date) {
          // Replaced by the offset from UTC in the ISO 8601:2000 standard format ( +hhmm or -hhmm ).
          // For example, "-0430" means 4 hours 30 minutes behind UTC (west of Greenwich).
          var off = date.tm_gmtoff;
          var ahead = off >= 0;
          off = Math.abs(off) / 60;
          // convert from minutes into hhmm format (which means 60 minutes = 100 units)
          off = (off / 60)*100 + (off % 60);
          return (ahead ? '+' : '-') + String("0000" + off).slice(-4);
        },
        '%Z': function(date) {
          return date.tm_zone;
        },
        '%%': function() {
          return '%';
        }
      };
  
      // Replace %% with a pair of NULLs (which cannot occur in a C string), then
      // re-inject them after processing.
      pattern = pattern.replace(/%%/g, '\0\0')
      for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
          pattern = pattern.replace(new RegExp(rule, 'g'), EXPANSION_RULES_2[rule](date));
        }
      }
      pattern = pattern.replace(/\0\0/g, '%')
  
      var bytes = intArrayFromString(pattern, false);
      if (bytes.length > maxsize) {
        return 0;
      }
  
      writeArrayToMemory(bytes, s);
      return bytes.length-1;
    }

  function _system(command) {
      if (ENVIRONMENT_IS_NODE) {
        if (!command) return 1; // shell is available
  
        var cmdstr = UTF8ToString(command);
        if (!cmdstr.length) return 0; // this is what glibc seems to do (shell works test?)
  
        var cp = require('child_process');
        var ret = cp.spawnSync(cmdstr, [], {shell:true, stdio:'inherit'});
  
        var _W_EXITCODE = (ret, sig) => ((ret) << 8 | (sig));
  
        // this really only can happen if process is killed by signal
        if (ret.status === null) {
          // sadly node doesn't expose such function
          var signalToNumber = (sig) => {
            // implement only the most common ones, and fallback to SIGINT
            switch (sig) {
              case 'SIGHUP': return 1;
              case 'SIGINT': return 2;
              case 'SIGQUIT': return 3;
              case 'SIGFPE': return 8;
              case 'SIGKILL': return 9;
              case 'SIGALRM': return 14;
              case 'SIGTERM': return 15;
            }
            return 2; // SIGINT
          }
          return _W_EXITCODE(0, signalToNumber(ret.signal));
        }
  
        return _W_EXITCODE(ret.status, 0);
      }
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      if (!command) return 0; // no shell available
      setErrNo(52);
      return -1;
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
  "__clock_gettime": ___clock_gettime,
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
  "__syscall_lstat64": ___syscall_lstat64,
  "__syscall_open": ___syscall_open,
  "__syscall_rename": ___syscall_rename,
  "__syscall_rmdir": ___syscall_rmdir,
  "__syscall_unlink": ___syscall_unlink,
  "_gmtime_js": __gmtime_js,
  "_localtime_js": __localtime_js,
  "_mktime_js": __mktime_js,
  "_tzset_js": __tzset_js,
  "abort": _abort,
  "clock": _clock,
  "difftime": _difftime,
  "em_host_call_fill": em_host_call_fill,
  "em_host_query_fill": em_host_query_fill,
  "emscripten_memcpy_big": _emscripten_memcpy_big,
  "emscripten_resize_heap": _emscripten_resize_heap,
  "environ_get": _environ_get,
  "environ_sizes_get": _environ_sizes_get,
  "exit": _exit,
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
  "strftime": _strftime,
  "system": _system,
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
