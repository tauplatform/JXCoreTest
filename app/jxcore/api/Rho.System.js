
(function ($, rho, rhoUtil) {
    'use strict';

    var moduleNS = 'Rho.System';
    var apiReq = rhoUtil.apiReqFor(moduleNS);


    // === System class definition ===

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

    // === System instance properties ===

    rhoUtil.createPropsProxy(System.prototype, [
    ], apiReq, function(){ return this.getId(); });

    // === System instance methods ===

    rhoUtil.createMethodsProxy(System.prototype, [

    ], apiReq, function(){ return this.getId(); });



    rhoUtil.createRawPropsProxy(System.prototype, [
    ]);

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

    // === System default instance support ===


    rhoUtil.namespace(moduleNS, System);





})(Rho.jQuery, Rho, Rho.util);
