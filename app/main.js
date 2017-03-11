// See the LICENSE file

var path = require('path');
var jx_methods = {};
var internal_methods = {};
var ui_methods = {};

var util = require('util');

function JXmobile(x) {
  if (!(this instanceof JXmobile)) return new JXmobile(x);

  this.name = x;
}

function callJXcoreNative(name, args) {
  var params = Array.prototype.slice.call(args, 0);

  var cb = "";

  if (params.length && typeof params[params.length - 1] == "function") {
    cb = "$$jxcore_callback_" + JXmobile.eventId;
    JXmobile.eventId++;
    JXmobile.eventId %= 1e5;
    JXmobile.on(cb, new WrapFunction(cb, params[params.length - 1]));
    params.pop();
  }

  var fnc = [name];
  var arr = fnc.concat(params);
  arr.push(cb);

  process.natives.callJXcoreNative.apply(null, arr);
}

function WrapFunction(cb, fnc) {
  this.fnc = fnc;
  this.cb = cb;

  var _this = this;
  this.callback = function () {
    var ret_val = _this.fnc.apply(null, arguments);
    delete JXmobile.events[_this.cb];
    return ret_val;
  }
}

JXmobile.events = {};
JXmobile.eventId = 0;
JXmobile.on = function (name, target) {
  JXmobile.events[name] = target;
};

JXmobile.prototype.call = function () {
  callJXcoreNative(this.name, arguments);
  return this;
};

var isAndroid = process.platform == "android";

JXmobile.ping = function (name, param) {
  var x;
  if (Array.isArray(param)) {
    x = param;
  } else if (param.str) {
    x = [param.str];
  } else if (param.json) {
    try {
      x = [JSON.parse(param.json)];
    } catch (e) {
      return e;
    }
  } else {
    x = null;
  }

  if (JXmobile.events.hasOwnProperty(name)) {
    var target = JXmobile.events[name];

    if (target instanceof WrapFunction) {
      return target.callback.apply(target, x);
    } else {
      return target.apply(null, x);
    }
  } else {
    console.warn(name, "wasn't registered");
  }
};

process.natives.defineEventCB("eventPing", JXmobile.ping);

JXmobile.prototype.register = function (target) {
  if (!isAndroid)
    process.natives.defineEventCB(this.name, target);
  else
    JXmobile.events[this.name] = target;
  return this;
};

global.Mobile = JXmobile;


console.warn("Platform", process.platform);
console.warn("Process ARCH", process.arch);

// see jxcore.java - jxcore.m
process.setPaths();

if (isAndroid) {
  // bring APK support into 'fs'
  process.registerAssets = function (from) {
    var fs = from;
    if (!fs || !fs.existsSync)
      fs = require('fs');

    var path = require('path');
    var folders = process.natives.assetReadDirSync();
    console.log('folders are: '+JSON.stringify(folders));        
    var root = process.cwd();

    // patch execPath to APK folder
    process.execPath = root;




    function createRealPath(pd) {
      var arr = [ pd, pd + "", pd + "/jxcore" ];

      for ( var i = 0; i < 3; ++ i ) {
        try {
          console.log( ">>>>>>>>>>>> WILL TRY PATH: " + arr[i]);


          if (!fs.existsSync(arr[i])) {
            fs.mkdirSync(arr[i]);
          }

        } catch (e) {
                console.error(">>>>>>>>>>>> Permission issues ? ", arr[i], e)
        }
      }
    }

    createRealPath(process.userPath);

    var sroot = root;

    console.log( ">>>>>>>>>>>>>>>>> SROOT: " + sroot );

    var hasRootLink = false;
    if ( root.indexOf('/data/user/') === 0 ) {
      var pd = process.userPath.replace(/\/data\/user\/[0-9]+\//, "/data/data/");
      createRealPath(pd);
      sroot = root.replace(/\/data\/user\/[0-9]+\//,"/data/data/");
      hasRootLink = true;
    }

    console.log( ">>>>>>>>>>>>>>>>> SROOT AFTER CHANGE: " + sroot );

    var jxcore_root;

    var prepVirtualDirs = function() {
      var _ = {};
      for ( var o in folders ) {
        console.log( ">>>>>>>>> prepVirtualDirs, folder: " + o );
        var sub = o.split('/');

        var last = _;

        for ( var i in sub ) {
          var loc = sub[i];
          if (!last.hasOwnProperty(loc)) {
            last[loc] = {};
          }
          last = last[loc];
        }

        last['!s'] = folders[o];
      }

      console.log( ">>>>>>>>>>>>> INSPECT:" + util.inspect( _ ) );

      folders = {};

      var sp = sroot.split('/');
      if ( sp[0] === '' ) {
        sp.shift();
      }

      jxcore_root = folders;

      for ( var o in sp ) {
        if (sp[o] === 'jxcore') {
          continue;
        }

        jxcore_root[sp[o]] = {};
        jxcore_root = jxcore_root[sp[o]];
      }

      jxcore_root['jxcore'] = _;
      jxcore_root = _;

      console.log( ">>>>>>>>>>>>> INSPECT JXCORE_ROOT:" + util.inspect( jxcore_root ) );

    };

    prepVirtualDirs();

    var findIn = function( what, where ) {
      console.log( ">>>>>>>>>>>>>> findIn: " + what + " in: " );

      for ( var o in where ) {
        console.log( ">>>>>>>>>>>>>> findIn: " + o );
      }

      console.log( (new Error()).stack );

      var last = where;
      for ( var o in what ) {
        var subject = what[o];
        if ( !last[subject]) {
          return;
        }

        last = last[subject];
      }
      console.log( ">>>>>>>>>>>>>>>>>>>> findIn res: " + last );
      return last;
    }

    var getLast = function (pathname) {
      console.log(">>>>>>>>>>>>>>> getLast: " + pathname );

        //trim leading and trailing slashes
        while (pathname[0] == '/')
            pathname = pathname.substr(1);

        while (pathname[pathname.length - 1] == '/')
            pathname = pathname.substr(0, pathname.length - 1);

        var dirs = pathname.split('/');

        var res = findIn(dirs, jxcore_root);
        if (!res)
            res = findIn(dirs, folders);

      console.log(">>>>>>>>>>>>>>> getLast result: " + res );


        return res;
    };

    var stat_archive = {};
    var existssync = function (pathname) {

        console.log( ">>>>>>>>>>>>>>> EXISTSYNC: "  + pathname );


        var n = pathname.indexOf(root);




        if (hasRootLink && n == -1)
            n = pathname.indexOf(sroot);


        console.log( ">>>>>>>>>>>>>>> EXISTSYNC index of (s)root:"  + n + " root: " + root + " sroot: " + sroot );


        if (n === 0 || n === -1) {
            if (n === 0) {
                pathname = pathname.replace(root, '');
                if (hasRootLink)
                    pathname = pathname.replace(sroot, '');
            }

            console.log( ">>>>>>>>>>>>>>> EXISTSYNC fixed pathname: "  + pathname );

            var last;
            if (pathname !== '') {
                last = getLast(pathname);
                if (!last)
                    return false;
            } else {
                last = jxcore_root;
            }

            var result;
            // cache result and send the same again
            // to keep same ino number for each file
            // a node module may use caching for dev:ino
            // combinations
            if (stat_archive.hasOwnProperty(pathname))
                return stat_archive[pathname];

            if (typeof last['!s'] === 'undefined') {
                result = { // mark as a folder
                    size : 340,
                    mode : 16877,
                    ino : fs.virtualFiles.getNewIno()
                };
            } else {
                result = {
                    size : last['!s'],
                    mode : 33188,
                    ino : fs.virtualFiles.getNewIno()
                };
            }

            stat_archive[pathname] = result;
            return result;
        }
    };

    var readfilesync = function (pathname) {
        if (!existssync(pathname))
            throw new Error(pathname + " does not exist");

        var rt = root;
        var n = pathname.indexOf(rt);

        if (n != 0 && hasRootLink) {
            n = pathname.indexOf(sroot);
            rt = sroot;
        }

        if (n === 0) {
            pathname = pathname.replace(rt, "");
            //pathname = path.join('jxcore/', pathname);
            return process.natives.assetReadSync(pathname);
        }
    };

    var readdirsync = function (pathname) {
        var rt = pathname.indexOf('/data/') === 0 ? (hasRootLink ? sroot : root)
            : root;
        var n = pathname.indexOf(rt);
        if (n === 0 || n === -1) {
            var last = getLast(pathname);
            if (!last || typeof last['!s'] !== 'undefined')
                return null;

            var arr = [];
            for ( var o in last) {
                var item = last[o];
                if (item && o != '!s')
                    arr.push(o);
            }
            return arr;
        }

        return null;
    };




/*
    try {
      // force create www/jxcore sub folder so we can write into cwd
      if (!fs.existsSync(process.userPath)) {
        fs.mkdir(process.userPath);
        if (!fs.existsSync(root)) {
          fs.mkdir(root);
        }
      }
    } catch (e) {
      console.error("Problem creating assets root at ", root);
      console.error("You may have a problem with writing files");
      console.error("Original error was", e);
    }

    var jxcore_root;

    var prepVirtualDirs = function () {
      var _ = {};
      for (var o in folders) {
        var sub = o.split('/');
        var last = _;
        for (var i in sub) {
          var loc = sub[i];
          if (!last.hasOwnProperty(loc)) last[loc] = {};
          last = last[loc];
        }
        last['!s'] = folders[o];
      }

      folders = {};
      var sp = root.split('/');
      if (sp[0] === '') sp.shift();
      jxcore_root = folders;
      for (var o in sp) {
        if (sp[o] === 'jxcore')
          continue;

        jxcore_root[sp[o]] = {};
        jxcore_root = jxcore_root[sp[o]];
      }

      jxcore_root['jxcore'] = _; // assets/www/jxcore -> /
      jxcore_root = _;
    };

    prepVirtualDirs();

    var findIn = function (what, where) {
      var last = where;
      for (var o in what) {
        var subject = what[o];
        if (!last[subject]) return;

        last = last[subject];
      }

      return last;
    };

    var getLast = function (pathname) {
      while (pathname[0] == '/')
        pathname = pathname.substr(1);

      while (pathname[pathname.length - 1] == '/')
        pathname = pathname.substr(0, pathname.length - 1);

      var dirs = pathname.split('/');

      var res = findIn(dirs, jxcore_root);
      if (!res) res = findIn(dirs, folders);
      return res;
    };

    var stat_archive = {};
    var existssync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        if (n === 0) {
          pathname = pathname.replace(root, '');
        }

        var last;
        if (pathname !== '') {
          last = getLast(pathname);
          if (!last) return false;
        } else {
          last = jxcore_root;
        }

        var result;
        // cache result and send the same again
        // to keep same ino number for each file
        // a node module may use caching for dev:ino
        // combinations
        if (stat_archive.hasOwnProperty(pathname))
          return stat_archive[pathname];

        if (typeof last['!s'] === 'undefined') {
          result = { // mark as a folder
            size: 340,
            mode: 16877,
            ino: fs.virtualFiles.getNewIno()
          };
        } else {
          result = {
            size: last['!s'],
            mode: 33188,
            ino: fs.virtualFiles.getNewIno()
          };
        }

        stat_archive[pathname] = result;
        return result;
      }
    };

    var readfilesync = function (pathname) {
      if (!existssync(pathname)) throw new Error(pathname + " does not exist");

      var n = pathname.indexOf(root);
      if (n === 0) {
        pathname = pathname.replace(root, "");
        //pathname = path.join('www/jxcore/', pathname);
        return process.natives.assetReadSync(pathname);
      }
    };

    var readdirsync = function (pathname) {
      var n = pathname.indexOf(root);
      if (n === 0 || n === -1) {
        var last = getLast(pathname);
        if (!last || typeof last['!s'] !== 'undefined') return null;

        var arr = [];
        for (var o in last) {
          var item = last[o];
          if (item && o != '!s') arr.push(o);
        }
        return arr;
      }

      return null;
    };
*/
    var extension = {
      readFileSync: readfilesync,
      readDirSync: readdirsync,
      existsSync: existssync
    };

    fs.setExtension("jxcore-java", extension);
    var node_module = require('module');

    node_module.addGlobalPath(process.execPath);
    node_module.addGlobalPath(process.userPath);

  };

  process.registerAssets();

  // if a submodule monkey patches 'fs' module, make sure APK support comes with it
  var extendFS = function() {
    process.binding('natives').fs += "(" + process.registerAssets + ")(exports);";
  };

  extendFS();

  // register below definitions for possible future sub threads
  jxcore.tasks.register(process.setPaths);
  jxcore.tasks.register(process.registerAssets);
  jxcore.tasks.register(extendFS);
} else {
  jxcore.tasks.register(process.setPaths);
}

var loadMainFile = function (filePath) {
  try {
console.log('#################');
console.log(path.join(process.cwd(), filePath));
console.log('#################');
    require(path.join(process.cwd(), filePath));
  } catch (e) {
    Error.captureStackTrace(e);
    console.log('$$$$$$$$$$$$$ ERROR');
    console.log(e.message);
    console.log(JSON.stringify(e.stack));
    JXmobile('OnError').call(e.message, JSON.stringify(e.stack));
  }
};

process.on('uncaughtException', function (e) {
  Error.captureStackTrace(e);
  JXmobile('OnError').call(e.message, JSON.stringify(e.stack));
});

JXmobile('StartApplication').register(loadMainFile);
 
var fs = require('fs');
var jsp = path.join(process.cwd(), 'api/rho.js' )
var jsf = fs.readFileSync(jsp, 'utf8');
console.log('$$$$$$$$$$$$$$$$$');
console.log(jsp);
console.log('$$$$$$$$$$$$$$$$$');
//console.log(jsf);
//console.log('$$$$$$$$$$$$$$$$$');
eval(jsf);

























console.log('@@@@@@@@@@@@@@@@@@   start eval Rho');



global.RhomobileEngine = {}

function initializeRhoAPI() {

    //'use strict';

    // === API configuration ========================================================

    var thisFileName = 'rhoapi.js';

    var RHO_ID_PARAM = '__rhoID';
    var RHO_CLASS_PARAM = '__rhoClass';
    var RHO_CALLBACK_PARAM = '__rhoCallback';

    var API_CONTROLLER_URL = '/system/js_api_entrypoint';
    //var API_CALLBACK_BASE_URL = '/system/js_api_entrypoint';
    var API_CALLBACK_BASE_URL = '';

    var NOT_INSTANCE_ID = '0';


    console.log("***************************");

    // === simplified jQuery 1.9.1 parts =============================================

    var __$$ = {
        isFunction: function (obj) {
            return 'function' === typeof obj;
        },

        isPlainObject: function (obj) {
            return obj && 'object' === typeof obj;
        },

        isArray: function (obj) {
            return (obj && 'Array' == (obj).constructor.name);
        },

        extend: function () {
            var src, copyIsArray, copy, name, options, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            // Handle a deep copy situation
            if (typeof target === "boolean") {
                deep = target;

                // skip the boolean and the target
                target = arguments[ i ] || {};
                i++;
            }

            // Handle case when target is a string or something (possible in deep copy)
            if (typeof target !== "object" && !__$$.isFunction(target)) {
                target = {};
            }

            // extend jQuery itself if only one argument is passed
            if (i === length) {
                target = this;
                i--;
            }

            for (; i < length; i++) {
                // Only deal with non-null/undefined values
                if ((options = arguments[ i ]) != null) {
                    // Extend the base object
                    for (name in options) {
                        src = target[ name ];
                        copy = options[ name ];

                        // Prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // Recurse if we're merging plain objects or arrays
                        if (deep && copy && ( __$$.isPlainObject(copy) || (copyIsArray = __$$.isArray(copy)) )) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && __$$.isArray(src) ? src : [];

                            } else {
                                clone = src && __$$.isPlainObject(src) ? src : {};
                            }

                            // Never move original objects, clone them
                            target[ name ] = __$$.extend(deep, clone, copy);

                            // Don't bring in undefined values
                        } else if (copy !== undefined) {
                            target[ name ] = copy;
                        }
                    }
                }
            }

            // Return the modified object
            return target;
        },

        ajax: function(opts) {

        },
        each:function (anObjectOrArray, callback) {
            if (this.isArray(anObjectOrArray)) {
                anObjectOrArray.forEach(function (each, idx) {
                    callback(idx, each);
                });
            }
            else {
                for (var property in anObjectOrArray) {
                    if (anObjectOrArray.hasOwnProperty(property)) {
                        callback(property, anObjectOrArray[property]);
                    }
                }
            }
        }
    };


    // === Core parts ============================================================
    console.log("*************************** 2");
    var baseCallbackId = new Date().valueOf();
    var idCount = 0;
    var pendingCallbacks = {};


    console.log("*************************** 3");

    function getVmID() {
        return 'jxcore';
    }

    function defaultEmptyCallback() {
    }

    function nextId(tag) {
        if ('undefined' == typeof tag || !tag)
            tag = RHO_ID_PARAM;

        return (tag + '#' + baseCallbackId + idCount++);
    }

    function toBool(value) {
        if (value && 'string' == typeof value) {
            return (value.toLowerCase() == "true")
        }
        return false;
    }
    console.log("*************************** 31");

    function prepareCallback(callback, /*opt*/ isPersistent, /*opt*/ id) {
        /*
         Rho.Log.info('prepareCallback.callback: type: ' + typeof callback,"JSC");
         Rho.Log.info('prepareCallback.callback: isPersistent: ' + isPersistent,"JSC");
         Rho.Log.info('prepareCallback.callback: id: ' + id,"JSC");
         */

        if ('string' == typeof callback)
            return callback;

        if ('function' != typeof callback)
            callback = defaultEmptyCallback;

        if ('undefined' == typeof id || !id)
            id = nextId();

        var data = {
            id: id,
            callback: callback,
            isPersistent: ('undefined' != typeof isPersistent) && isPersistent
        };

        pendingCallbacks[id] = data;

        /*
         var arr = [], p, i = 0;
         for (p in data) {
         arr[i++] = " " + p + " : " + data[p]+" ";
         }
         var str = arr.join(', ');

         Rho.Log.info('prepareCallback.callback: pendingCallbacks: {' + str + "}","JSC");
         */
        // store options for pending callback
        return API_CALLBACK_BASE_URL + id;
    }
    console.log("*************************** 32");

    function scanForInstances(value) {
        for (var prop in value) {
            if (!value.hasOwnProperty(prop)) continue;
            if ('object' == typeof value[prop]) {
                value[prop] = createInstances(value[prop]);
            }
        }
        return value;
    }

    function createInstances(value) {
        if ((value != null) && ('object' == typeof value)) {
            if (value[RHO_ID_PARAM] && value[RHO_CLASS_PARAM]) {
                return objectForClass(value[RHO_CLASS_PARAM], value[RHO_ID_PARAM]);
            } else {
                return scanForInstances(value);
            }
        }
        return value;
    }
    console.log("*************************** 33");

    function jsValue(result) {

        console.log("&&&&&& 1");
        if ('undefined' == typeof result)
            throw 'Invalid API JSON response';
        console.log("&&&&&& 2");

        if (null == result || 'object' != typeof result) {
            console.log("&&&&&& 3");
            return result;
        }
        console.log("&&&&&& 4");

        var value = __$$.extend(result instanceof Array ? [] : {}, result);
        console.log("&&&&&& 5");

        return createInstances(value);
    }

    function namesToProps(names) {
        var namesObj = {};
        if ("string" == typeof names) {
            names = names.split(/[\s\,]/);
        }
        if (names instanceof Array) {
            for (var i = 0; i < names.length; i++) {
                if (0 < names[i].length)
                    namesObj[names[i]] = null;
            }
        } else if (names instanceof Object) {
            namesObj = names;
        }
        return namesObj;
    }

    function namesToArray(names) {
        var namesArray = [];
        if ("string" == typeof names) {
            names = names.split(/[\s\,]/);
        }
        if (names instanceof Array) {
            for (var i = 0; i < names.length; i++) {
                if (0 < names[i].length)
                    namesArray.push(names[i]);
            }
        } else if (names instanceof Object) {
            for (var name in names) {
                if (names.hasOwnProperty(name) && 0 < name.length)
                    namesArray.push(name);
            }
        }
        return namesArray;
    }

    console.log("*************************** 34");


    var reqIdCount = 0;

    function wrapFunctions(key, value) {
        if ('function' != typeof value) return value;

        return RHO_CALLBACK_PARAM + ":" + prepareCallback(value, true);
    }


    console.log("*************************** 35");


    function commonReq(params) {

        var valueCallback = null;

        if ("number" == typeof params.valueCallbackIndex) {
            if (params.valueCallbackIndex < params.args.length - 1)
                throw 'Generated API method error: wrong position for value callback argument!';

            if (params.valueCallbackIndex == params.args.length - 1)
                valueCallback = params.args.pop();

            if (valueCallback && "function" != typeof valueCallback)
                throw 'Value callback should be a function!';
        }

        var persistentCallback = null;
        var persistentCallbackOptParams = null;

        if ("number" == typeof params.persistentCallbackIndex) {
            if (params.persistentCallbackIndex < params.args.length - 2)
                throw 'Generated API method error: wrong position for persistent callback argument!';

            if (params.persistentCallbackIndex == params.args.length - 2) {
                persistentCallbackOptParams = params.args.pop();
                persistentCallback = params.args.pop();
            } else if (params.persistentCallbackIndex == params.args.length - 1) {
                persistentCallback = params.args.pop();
            }

            if (persistentCallback && 'function' != typeof persistentCallback)
                throw 'Persistent callback should be a function!';

            if (persistentCallbackOptParams && 'string' != typeof persistentCallbackOptParams)
                throw 'Persistent callback optional parameters should be a string!';

            var persistentCallbackOptParams = persistentCallbackOptParams || null;

            if (persistentCallback)
                persistentCallback = prepareCallback(persistentCallback, true);
        }

        var cmd = { 'method': params.method, 'params': params.args };

        cmd[RHO_CLASS_PARAM] = params.module;
        cmd[RHO_ID_PARAM] = params.instanceId || null;
        cmd['jsonrpc'] = '2.0';
        cmd['id'] = reqIdCount++;

        if (persistentCallback) {
            cmd[RHO_CALLBACK_PARAM] = {
                id: persistentCallback,
                vmID: getVmID(),
                optParams: persistentCallbackOptParams
            };
        }

        var cmdText = JSON.stringify(cmd, wrapFunctions);
        //console.log(cmdText);

        var result = null;

        function handleResult(rawResult) {
            console.log("===== A");
            result = jsValue(rawResult);
            console.log("===== B");
            if (valueCallback) {
                console.log("===== C");
                valueCallback(result);
            }
            console.log("===== D");
        }

        function handleError(errObject) {
            throw errObject.message;
        }
        console.log("*************************** 5 a");

        console.log("*************************** Rho.platform.nativeApiCall = "+ typeof Rho.platform.nativeApiCall);


        Rho.platform.nativeApiCall(cmdText, null != valueCallback, function (result) {
            console.log("===== 1");
            if (result['error']) {
                console.log("===== 2");
                handleError(result['error']);
                console.log("===== 3");
            }
            else {
                console.log("===== 4");
                handleResult(result['result']);
                console.log("===== 5");
            }
        });
        console.log("*************************** 5 b");

        return (null != valueCallback) ? null : result;
    }

    console.log("*************************** 6");


    function apiReqFor(module) {
        return function (params) {
            params.args = Array.prototype.slice.call(params.args);
            if ('getProperties' == params.method && 0 < params.args.length) {
                params.args[0] = namesToArray(params.args[0]);
            }
            params.module = module;
            params.method = params.method;
            return commonReq(params);
        };
    }

    function extendSafely(destination, source, override) {
        var src = source;
        var dst = destination;
        var sourceIsFunc = false;

        if ('function' == typeof src) {
            if ('function' == typeof dst && !override)
                throw "Namespace definition conflict!";

            sourceIsFunc = true;
            src = destination;
            dst = source;
        }

        for (var prop in src) {
            if (!src.hasOwnProperty(prop)) continue;
            if (dst.hasOwnProperty(prop) && !override) continue;
            if ('prototype' == prop) {
                if(sourceIsFunc) continue;

                if('object' != typeof dst[prop])
                    dst[prop] = {};
                for (var subProp in src[prop]) {
                    if (!src[prop].hasOwnProperty(subProp)) continue;
                    dst[prop][subProp] = src[prop][subProp];
                }
                continue;
            }
            dst[prop] = src[prop];
        }
        return dst;
    }


    console.log("*************************** 7");


    function namespace(nsPathStr, membersObj, override) {

        console.log("------ 1");
        membersObj = membersObj || {};
        console.log("------ 2");

        var ns = global;
        var parts = nsPathStr.split(/[\:\.]/);
        var nsLog = '';
        console.log("------ 3");

        for (var i = 0; i < parts.length; i++) {
            var nsProp = parts[i];
            nsLog = nsLog + (i == 0 ? '' : '.') + nsProp;
            console.log("------  4");

            var subNs = ns[nsProp];
            if (!(subNs instanceof Object || 'undefined' == typeof subNs)) {
                throw "Namespace " + nsLog + " is already defined and it isn't an object!";
            }
            console.log("------  5");

            if (i == parts.length - 1) {
                if (ns[nsProp])
                    ns[nsProp] = extendSafely(ns[nsProp], membersObj, override);
                else
                    ns[nsProp] = membersObj;
            }
            console.log("------  6");
            ns[nsProp] = ns[nsProp] || {};
            ns = ns[nsProp];
            console.log("------  7");
        }
        console.log("------  8");
        return ns;
    }


    console.log("*************************** 8");

    // === Property proxy support ====================================================

    var propsSupport = {
        ffHackKeywords: false,
        ffHackMethod: false,
        js185: false
    };

    (function propertySupportCheck() {
/*        propsSupport.ffHackKeywords = (function supported_firefoxHack_keywords() {
            var testObj = {};
            var okGet = false;
            var okSet = false;
            try {
                testObj = {
                    get propGet() {
                        okGet = true;
                        return okGet;
                    },
                    set propSet(val) {
                        okSet = val;
                    }
                };
                testObj.propSet = testObj.propGet;
            } catch (ex) {};
            return okGet && okSet;
        })();*/

        propsSupport.ffHackMethod = (function supported_firefoxHack_method() {
            var testObj = {};
            var okGet = false;
            var okSet = false;
            try {
                testObj.__defineGetter__('propGet', function () {
                    okGet = true;
                    return okGet;
                });
                testObj.__defineSetter__('propSet', function (val) {
                    okSet = val;
                });

                testObj.propSet = testObj.propGet;
            } catch (ex) {};
            return okGet && okSet;
        })();

        propsSupport.js185 = (function supported_js185_standard() {
            var testObj = {};
            var okGet = false;
            var okSet = false;
            try {
                Object.defineProperty(testObj, 'propGet', {
                    get: function () {
                        okGet = true;
                        return okGet;
                    }
                });
                Object.defineProperty(testObj, 'propSet', {
                    set: function (val) {
                        okSet = val;
                    }
                });
                testObj.propSet = testObj.propGet;
            } catch (ex) {};
            return okGet && okSet;
        })();
    })();
    // at this point we have property support level already detected

    // Here is default (fallback option) implementation of property using explicit accessors.
    // It will be used in case we have no any support for natural props syntax in a browser.
    // Usage sample: obj.setSomething(123), var abc = obj.getSomething()
    // ====================================================================================
    var createPropProxy_fallback = function (obj, propDescr, getter, setter) {
        var propName = propDescr.split(':')[0];

        function accessorName(accessor, propDescr) {
            var names = propDescr.split(':');
            var propName = names[0];
            var getterName = names[1];
            var setterName = names[2];

            if (('get' == accessor) && getterName)
                return getterName;

            if (('set' == accessor) && setterName)
                return setterName;

            return accessor + propName.charAt(0).toUpperCase() + propName.slice(1);
        }

        if (null != getter && 'function' == typeof getter) {
            obj[accessorName('get', propDescr)] = getter;
        }
        if (null != setter && 'function' == typeof setter) {
            obj[accessorName('set', propDescr)] = setter;
        }
    };

    console.log("*************************** 9");


    var createPropProxy = createPropProxy_fallback;

    if (propsSupport.js185) {
        // the best case, js185 props are supported
        createPropProxy = function (obj, propDescr, getter, setter) {
            var propName = propDescr.split(':')[0];

            // TODO: implement enumeration of propProxy to extend target namespace with them.
            var js185PropDef = {configurable: true, enumerable: false /* true */};
            if (null != getter && 'function' == typeof getter) {
                js185PropDef['get'] = getter;
            }
            if (null != setter && 'function' == typeof setter) {
                js185PropDef['set'] = setter;
            }
            Object.defineProperty(obj, propName, js185PropDef);
        };
    } else if (propsSupport.ffHackMethod) {
        // backup option, props are supported with firefox hack
        createPropProxy = function (obj, propDescr, getter, setter) {
            var propName = propDescr.split(':')[0];

            obj.__defineGetter__(propName, getter);
            obj.__defineSetter__(propName, setter);
        };
    } else {
        // Sorry, no luck. We able provide just a default implementation with explicit accessors.
        // It is the best thing we can do in this case.
    }

    // ====================================================================================
    console.log("*************************** 10");

    function propAccessReqFunc(apiReqFunc, propName, rw, idFunc, customFunc) {
        var isSet = ('w' == rw);

        var propNameParts = propName.split(':');

        propName = propNameParts[0];
        var methodGet = propName;
        var methodSet = propName + '=';

        if (2 < propNameParts.length)
            methodSet = propNameParts[2];

        if (1 < propNameParts.length)
            methodGet = propNameParts[1];

        return function () {
            try {
                if ('function' == typeof customFunc)
                    return customFunc.apply(this, arguments);
            } catch(ex) {
                throw "Custom accessor function exception: " + ex;
            }

            return apiReqFunc({
                instanceId: ('function' == typeof idFunc) ? idFunc.apply(this, []) : NOT_INSTANCE_ID,
                args: arguments,
                method: isSet ? methodSet : methodGet,
                valueCallbackIndex: (isSet ? 1 : 0)
            });
        };
    }

    var incompatibleProps = [];

    // Properties bulk definition.
    // Sample:
    //
    //    Rho.util.createPropsProxy(Application, {
    //        'publicFolder': 'r',
    //        'startURI': 'rw',
    //        'version': 'r',
    //        'title': 'rw'
    //    }, apiReq);
    //
    function createPropsProxy(obj, propDefs, apiReq, idFunc) {
        if (!(propDefs instanceof Array))
            throw 'Property definitions list should be Array instance';

        for (var i=0; i<propDefs.length; i++) {
            var propDef = propDefs[i];
            var propAccess = propDef['propAccess'];

            var getter = (0 <= propAccess.indexOf('r')) ? propAccessReqFunc(apiReq, propDef['propName'], 'r', idFunc, propDef['customGet']) : null;
            var setter = (0 <= propAccess.indexOf('w')) ? propAccessReqFunc(apiReq, propDef['propName'], 'w', idFunc, propDef['customSet']) : null;

            try {
                createPropProxy(obj, propDef['propName'], getter, setter);
            } catch (ex) {
                // we unable to create property with this name, so log it
                incompatibleProps.push(name);
            }
            // create explicit accessors
            createPropProxy_fallback(obj, propDef['propName'], getter, setter);
        }
    }

    console.log("*************************** 11");

    // entity property support =======================================================

    function createRawPropsProxy(obj, propDefs, force_fallback ) {
        if (!(propDefs instanceof Array))
            throw 'Property definitions list should be Array instance';

        if (createPropProxy != createPropProxy_fallback || true == force_fallback) {
            for (var i=0; i<propDefs.length; i++) {
                var propDef = propDefs[i];

                try {
                    createPropProxy(obj, propDef['propName'], propDef['propGetter'], propDef['propSetter']);
                } catch (ex) {
                    // we unable to create property with this name, so log it
                    incompatibleProps.push(name);
                }
            }
        }
    }

    // === Method calls =========================================================

    function methodAccessReqFunc(nativeName, persistentCallbackIndex, valueCallbackIndex, apiReq, idFunc) {
        return function() {
            return apiReq({
                instanceId: ('function' == typeof idFunc) ? idFunc.apply(this, []) : NOT_INSTANCE_ID,
                args: arguments,
                method: nativeName,
                persistentCallbackIndex: persistentCallbackIndex,
                valueCallbackIndex: valueCallbackIndex
            });
        }
    }

    function createMethodsProxy(obj, methodDefs, apiReq, idFunc) {
        if (!(methodDefs instanceof Array))
            throw 'Property definitions list should be Array instance';

        for (var i=0; i<methodDefs.length; i++) {
            var methodDef = methodDefs[i];
            try {
                obj[methodDef['methodName']] = methodAccessReqFunc(
                    methodDef['nativeName'],
                    methodDef['persistentCallbackIndex'],
                    methodDef['valueCallbackIndex'],
                    apiReq, idFunc
                );
            } catch (ex) {
                // we unable to create property with this name, so log it..
                incompatibleProps.push(methodDef['methodName']);
            }
        }
    }

    console.log("*************************** 12");

    function namespaceAlias(ns, parent, alias) {
        if (!parent) throw 'No parent namespace for alias!';
        if (parent[alias]) throw 'Alias definition conflict!';

        parent[alias] = ns;
    }

    // === Factory handling =========================================================

    function objectForClass(className, id) {
        var instObject = {};
        instObject[RHO_CLASS_PARAM] = className;
        instObject[RHO_ID_PARAM] = id;
        return new (namespace(className))(instObject);
    }

    // === Modules loading implementation ============================================

    function appendDomElement(target, tagName, attributes) {
        var elm = document.createElement(tagName);
        for (var name in attributes) {
            if (!attributes.hasOwnProperty(name)) continue;
            elm.setAttribute(name, attributes[name]);
        }
        target.appendChild(elm);
    }



    function loadApiModules(moduleNames) {
    }

    // === Callback handler ==========================================================

    function callbackHandler(callbackId, resultObj) {
        var cbId = decodeURIComponent(callbackId);
        //console.log('Rho.callback_handler: callback for: ' +cbId);
        //console.log('Rho.callback_handler: resultObj: ' +resultObj);

        var opts = pendingCallbacks[cbId];

        if ('object' == typeof opts && opts) {
            //console.log('Rho.callback_handler: callback found!');

            if ('function' == typeof opts.callback) {
                var result = null;
                var err = null;
                if (resultObj) {
                    err = resultObj['error'];
                    if (!err)
                        result = jsValue(resultObj['result']);
                }
                opts.callback(result, err);
            }

            if (!opts.isPersistent)
                delete pendingCallbacks[cbId];
        }
    };

    // === Utility internal methods ==================================================
    console.log("*************************** 12");

    var rhoUtil = {
        flag: {
            API_AJAX_URL: '__rho_apiAjaxURL',
            USE_AJAX_BRIDGE: '__rho_useAjaxBridge',
            NATIVE_BRIDGE_TYPE: '__rho_nativeBridgeType'
        },
        loadApiModules: loadApiModules,
        namespace: namespace,
        namespaceAlias: namespaceAlias,
        apiReqFor: apiReqFor,
        namesToProps: namesToProps,
        namesToArray: namesToArray,
        createPropsProxy: createPropsProxy,
        createRawPropsProxy: createRawPropsProxy,
        createMethodsProxy: createMethodsProxy,
        methodAccessReqFunc: methodAccessReqFunc,
        incompatibleProps: incompatibleProps,
        rhoIdParam: function () { return RHO_ID_PARAM },
        rhoClassParam: function () { return RHO_CLASS_PARAM },
        nextId: nextId
    };

    var rhoPlatform = {
        id: {
            AJAX: 'ajax',
            AUTO: 'auto',
            RHOSIMULATOR: 'rhosimulator',
            ANDROID: 'android',
            IPHONE:  'iphone',
            WP8: 'wp8',
            WM: 'wm',
            WIN32: 'win32',
            JXCORE: 'jxcore'
        },
        nativeApiCall: "",
        nativeApiResult: function(){/* intentionally empty stub function */}
    }

    // === Public interface ==========================================================
    console.log("*************************** 13");

    var rho = {
        jQuery: __$$,
        util: rhoUtil,
        platform: rhoPlatform,
        callbackHandler: callbackHandler
    };

    // === js-to-native bridges ======================================================

    /* ========================================================================
     You can force bridge type will be used in a following ways:

     window[rhoUtil.flag.NATIVE_BRIDGE_TYPE] = rhoPlatform.id.ANDROID;
     window[rhoUtil.flag.NATIVE_BRIDGE_TYPE] = 'android';
     window['__rho_nativeBridgeType'] = 'android';

     Feel free to define it at any moment.
     ======================================================================== */

    var RHO_API_CALL_TAG = '__rhoNativeApiCall';
    var RHO_API_TAG = '__rhoNativeApi';

    var bridges = {};
    var addBridge = function(platformId, bridgeFactory) {
        bridges[platformId] = function() {
            var bridge = bridgeFactory();
            bridge.apiCall.platformId = platformId;
            return bridge;
        };
    };
    addBridge(rhoPlatform.id.JXCORE, function() {
        return {
            apiCall: function (cmdText, async, resultHandler) {
                console.log("+++ 1");
                var nativeApiResult = {};
                console.log("+++ 2");
                global.RhomobileEngine.tau_js_entry_point_result = null;
                console.log("+++ 3");
                process.natives.js_entry_point(cmdText);
                console.log("+++ 4");
                if (global.RhomobileEngine.tau_js_entry_point_result != null) {
                    console.log("+++ 5");
                    nativeApiResult = global.RhomobileEngine.tau_js_entry_point_result;
                    console.log("+++ 6");
                    global.RhomobileEngine.tau_js_entry_point_result = null;
                    console.log("+++ 7");
                }
                console.log("+++ 8");
                console.log("nativeApiResult type = "+ typeof nativeApiResult );
                console.log("nativeApiResult = "+nativeApiResult );
                console.log("resultHandler type = "+ typeof resultHandler );
                //var parsed = JSON.parse(nativeApiResult);
                console.log("+++ 9");
                resultHandler(nativeApiResult);
                console.log("+++ 10");
            }
        };
    });

    rhoPlatform.nativeApiCall = function() {
        // use forced bridge type value in case it defined,
        // otherwise use auto-detected bridge type
        var platformBridge = bridges[rhoPlatform.id.JXCORE];

        platformBridge().apiCall.apply(this, arguments);
    }

    //return rho;

    global.Rho = rho;
    console.log("*************************** 14");

}


initializeRhoAPI();
//var EB = Rho;



console.log("*************************** 15");


















console.log('@@@@@@@@@@@@@@@@@@   start eval Rho.System');










//function register_Rho_System($, rho, rhoUtil) {
(function ($, rho, rhoUtil) {
console.log("*************************** 100 01");

    var moduleNS = 'Rho.System';
    var apiReq = rhoUtil.apiReqFor(moduleNS);


    // === System class definition ===
    console.log("*************************** 100 02");

    function System() {
        var id = null;
        this.getId = function () {return id;};

        if (1 == arguments.length && arguments[0][rhoUtil.rhoIdParam()]) {
            if (moduleNS != arguments[0][rhoUtil.rhoClassParam()]) {
                throw "Wrong class instantiation!";
            }
            id = arguments[0][rhoUtil.rhoIdParam()];
        } else {
            id = rhoUtil.nextId();
            // constructor methods are following:

        }
    };
    console.log("*************************** 100 03");

    // === System instance properties ===

    rhoUtil.createPropsProxy(System.prototype, [
    ], apiReq, function(){ return this.getId(); });

    // === System instance methods ===

    rhoUtil.createMethodsProxy(System.prototype, [

    ], apiReq, function(){ return this.getId(); });



    rhoUtil.createRawPropsProxy(System.prototype, [
    ]);
    console.log("*************************** 100 04");

    // === System constants ===


            System.KEYBOARD_AUTOMATIC = 'automatic';

            System.KEYBOARD_HIDDEN = 'hidden';

            System.KEYBOARD_SHOWN = 'shown';

            System.PLATFORM_ANDROID = 'ANDROID';

            System.PLATFORM_IOS = 'APPLE';

            System.PLATFORM_WINDOWS_DESKTOP = 'WINDOWS_DESKTOP';

            System.PLATFORM_WM_CE = 'WINDOWS';

            System.PLATFORM_WP8 = 'WP8';

            System.REGKEY_CLASSES_ROOT = 'HKCR';

            System.REGKEY_CURRENT_USER = 'HKCU';

            System.REGKEY_LOCAL_MACHINE = 'HKLM';

            System.REGKEY_USERS = 'HKU';

            System.REGTYPE_BINARY = 'Binary';

            System.REGTYPE_DWORD = 'DWORD';

            System.REGTYPE_MULTI_SZ = 'MultiSZ';

            System.REGTYPE_SZ = 'String';

            System.SCREEN_LANDSCAPE = 'landscape';

            System.SCREEN_PORTRAIT = 'portrait';



            console.log("*************************** 100 05");

    // === System static properties ===

    rhoUtil.createPropsProxy(System, [
        { propName: 'main_window_closed', propAccess: 'r' }
      , { propName: 'platform', propAccess: 'r' }
      , { propName: 'hasCamera', propAccess: 'r' }
      , { propName: 'screenWidth', propAccess: 'r' }
      , { propName: 'screenHeight', propAccess: 'r' }
      , { propName: 'realScreenWidth', propAccess: 'r' }
      , { propName: 'realScreenHeight', propAccess: 'r' }
      , { propName: 'screenOrientation', propAccess: 'r' }
      , { propName: 'ppiX', propAccess: 'r' }
      , { propName: 'ppiY', propAccess: 'r' }
      , { propName: 'deviceOwnerEmail', propAccess: 'r' }
      , { propName: 'deviceOwnerName', propAccess: 'r' }
      , { propName: 'devicePushId', propAccess: 'r' }
      , { propName: 'phoneId', propAccess: 'r' }
      , { propName: 'deviceName', propAccess: 'r' }
      , { propName: 'osVersion', propAccess: 'r' }
      , { propName: 'locale', propAccess: 'r' }
      , { propName: 'country', propAccess: 'r' }
      , { propName: 'isEmulator', propAccess: 'r' }
      , { propName: 'isRhoSimulator', propAccess: 'r' }
      , { propName: 'hasCalendar', propAccess: 'r' }
      , { propName: 'isSymbolDevice', propAccess: 'r' }
      , { propName: 'oemInfo', propAccess: 'r' }
      , { propName: 'uuid', propAccess: 'r' }
      , { propName: 'applicationIconBadge', propAccess: 'rw' }
      , { propName: 'httpProxyURI', propAccess: 'rw' }
      , { propName: 'lockWindowSize', propAccess: 'rw' }
      , { propName: 'keyboardState', propAccess: 'rw' }
      , { propName: 'localServerPort', propAccess: 'r' }
      , { propName: 'freeServerPort', propAccess: 'r' }
      , { propName: 'screenAutoRotate', propAccess: 'rw' }
      , { propName: 'hasTouchscreen', propAccess: 'r' }
      , { propName: 'webviewFramework', propAccess: 'r' }
      , { propName: 'screenSleeping', propAccess: 'rw' }
      , { propName: 'hasNetwork', propAccess: 'r' }
      , { propName: 'hasWifiNetwork', propAccess: 'r' }
      , { propName: 'hasCellNetwork', propAccess: 'r' }
      , { propName: 'hasSqlite', propAccess: 'r' }
    ], apiReq);
    console.log("*************************** 100 06");

    // === System static methods ===

    rhoUtil.createMethodsProxy(System, [

          // function(/* const rho::String& */ applicationUrl, /* optional function */ oResult)
          { methodName: 'applicationInstall', nativeName: 'applicationInstall', valueCallbackIndex: 1 }

          // function(/* const rho::String& */ applicationName, /* optional function */ oResult)
        , { methodName: 'isApplicationInstalled', nativeName: 'isApplicationInstalled', valueCallbackIndex: 1 }

          // function(/* const rho::String& */ applicationName, /* optional function */ oResult)
        , { methodName: 'applicationUninstall', nativeName: 'applicationUninstall', valueCallbackIndex: 1 }

          // function(/* optional function */ oResult)
        , { methodName: 'getStartParams', nativeName: 'getStartParams', valueCallbackIndex: 0 }

          // function(/* const rho::String& */ url, /* optional function */ oResult)
        , { methodName: 'openUrl', nativeName: 'openUrl', valueCallbackIndex: 1 }

          // function(/* const rho::String& */ localPathToZip, /* const rho::String& */ password, /* const rho::String& */ outputFileName, /* optional function */ oResult)
        , { methodName: 'unzipFile', nativeName: 'unzipFile', valueCallbackIndex: 3 }

          // function(/* const rho::String& */ localPathToZip, /* const rho::String& */ localPathToFile, /* const rho::String& */ password, /* optional function */ oResult)
        , { methodName: 'zipFile', nativeName: 'zipFile', valueCallbackIndex: 3 }

          // function(/* const rho::String& */ localPathToZip, /* const rho::String& */ basePath, /* const rho::Vector<rho::String>& */ filePathsToZip, /* const rho::String& */ password, /* optional function */ oResult)
        , { methodName: 'zipFiles', nativeName: 'zipFiles', valueCallbackIndex: 4 }

          // function(/* const rho::Hashtable<rho::String, rho::String>& */ propertyMap, /* optional function */ oResult)
        , { methodName: 'setRegistrySetting', nativeName: 'setRegistrySetting', valueCallbackIndex: 1 }

          // function(/* const rho::Hashtable<rho::String, rho::String>& */ propertyMap, /* optional function */ oResult)
        , { methodName: 'getRegistrySetting', nativeName: 'getRegistrySetting', valueCallbackIndex: 1 }

          // function(/* const rho::Hashtable<rho::String, rho::String>& */ propertyMap, /* optional function */ oResult)
        , { methodName: 'deleteRegistrySetting', nativeName: 'deleteRegistrySetting', valueCallbackIndex: 1 }

          // function(/* int */ x, /* int */ y, /* int */ width, /* int */ height, /* optional function */ oResult)
        , { methodName: 'setWindowFrame', nativeName: 'setWindowFrame', valueCallbackIndex: 4 }

          // function(/* int */ x, /* int */ y, /* optional function */ oResult)
        , { methodName: 'setWindowPosition', nativeName: 'setWindowPosition', valueCallbackIndex: 2 }

          // function(/* int */ width, /* int */ height, /* optional function */ oResult)
        , { methodName: 'setWindowSize', nativeName: 'setWindowSize', valueCallbackIndex: 2 }

          // function(/* const rho::String& */ pathToFile, /* bool */ doNotBackup, /* optional function */ oResult)
        , { methodName: 'setDoNotBackupAttribute', nativeName: 'setDoNotBackupAttribute', valueCallbackIndex: 2 }

          // function(/* const rho::String& */ appName, /* const rho::String& */ params, /* bool */ blockingCall, /* optional function */ oResult)
        , { methodName: 'runApplication', nativeName: 'runApplication', valueCallbackIndex: 3 }

          // function(/* optional function */ oResult)
        , { methodName: 'hideSplashScreen', nativeName: 'hideSplashScreen', valueCallbackIndex: 0 }

          // function(/* const rho::String& */ propertyName, /* optional function */ oResult)
        , { methodName: 'getProperty', nativeName: 'getProperty', persistentCallbackIndex: 1, valueCallbackIndex: 3 }

          // function(/* const rho::Vector<rho::String>& */ arrayofNames, /* optional function */ oResult)
        , { methodName: 'getProperties', nativeName: 'getProperties', persistentCallbackIndex: 1, valueCallbackIndex: 3 }

          // function(/* optional function */ oResult)
        , { methodName: 'getAllProperties', nativeName: 'getAllProperties', persistentCallbackIndex: 0, valueCallbackIndex: 2 }

          // function(/* const rho::String& */ propertyName, /* const rho::String& */ propertyValue, /* optional function */ oResult)
        , { methodName: 'setProperty', nativeName: 'setProperty', valueCallbackIndex: 2 }

          // function(/* const rho::Hashtable<rho::String, rho::String>& */ propertyMap, /* optional function */ oResult)
        , { methodName: 'setProperties', nativeName: 'setProperties', valueCallbackIndex: 1 }

    ], apiReq);

    console.log("*************************** 100 07");

    // === System default instance support ===


    rhoUtil.namespace(moduleNS, System);


    console.log("*************************** 100 8");



//}

})(Rho.jQuery, Rho, Rho.util);

console.log("*************************** 100 9");

//register_Rho_System(Rho.jQuery, Rho, Rho.util);

console.log("*************************** 100 10");





















jsp = path.join(process.cwd(), 'api/Rho.Config.js' )
jsf = fs.readFileSync(jsp, 'utf8');
console.log('@@@@@@@@@@@@@@@@@@   start eval Rho.Config');
eval(jsf);

console.log('@@@@@@@@@@@@@@@@@@   Rho = '+typeof Rho);
console.log('@@@@@@@@@@@@@@@@@@   Rho.System = '+typeof Rho.System);
console.log('@@@@@@@@@@@@@@@@@@   Rho.getProperty = '+typeof Rho.System.getProperty);


Rho.System.getProperty("platform", function(res) {
    console.log('$$$$$$$$$ callback Rho.System.getProperty("platform") = '+res);
});

var pl = Rho.System.getProperty("platform");
console.log('@@@@@@@@@@@@@@@@@@   Rho.System.getProperty("platform") = '+pl);

var pl2 = Rho.System.getProperty("screenWidth");
console.log('@@@@@@@@@@@@@@@@@@   Rho.System.getProperty("screenWidth") = '+pl2);

var pl3 = Rho.System.screenHeight;
console.log('@@@@@@@@@@@@@@@@@@   Rho.System.screenHeight = '+pl3);

var pl5 = Rho.Config.getPropertyString("logserver");
console.log('@@@@@@@@@@@@@@@@@@   Rho.Config.getPropertyString("logserver") = '+pl5);
