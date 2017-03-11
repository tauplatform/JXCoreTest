
(function ($, rho, rhoUtil) {
    'use strict';

    var moduleNS = 'Rho.Config';
    var apiReq = rhoUtil.apiReqFor(moduleNS);


    // === Config class definition ===

    function Config() {
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

    // === Config instance properties ===

    rhoUtil.createPropsProxy(Config.prototype, [
    ], apiReq, function(){ return this.getId(); });

    // === Config instance methods ===

    rhoUtil.createMethodsProxy(Config.prototype, [
    
    ], apiReq, function(){ return this.getId(); });

    

    rhoUtil.createRawPropsProxy(Config.prototype, [
    ]);

    // === Config constants ===

    



    // === Config static properties ===

    rhoUtil.createPropsProxy(Config, [
        { propName: 'configPath', propAccess: 'rw' }
    ], apiReq);

    // === Config static methods ===

    rhoUtil.createMethodsProxy(Config, [
    
          // function(/* const rho::String& */ name, /* optional function */ oResult)
          { methodName: 'getPropertyString', nativeName: 'getPropertyString', valueCallbackIndex: 1 }
    
          // function(/* const rho::String& */ name, /* const rho::String& */ value, /* bool */ saveToFile, /* optional function */ oResult)
        , { methodName: 'setPropertyString', nativeName: 'setPropertyString', valueCallbackIndex: 3 }
    
          // function(/* const rho::String& */ name, /* optional function */ oResult)
        , { methodName: 'getPropertyInt', nativeName: 'getPropertyInt', valueCallbackIndex: 1 }
    
          // function(/* const rho::String& */ name, /* int */ value, /* bool */ saveToFile, /* optional function */ oResult)
        , { methodName: 'setPropertyInt', nativeName: 'setPropertyInt', valueCallbackIndex: 3 }
    
          // function(/* const rho::String& */ name, /* optional function */ oResult)
        , { methodName: 'getPropertyBool', nativeName: 'getPropertyBool', valueCallbackIndex: 1 }
    
          // function(/* const rho::String& */ name, /* bool */ value, /* bool */ saveToFile, /* optional function */ oResult)
        , { methodName: 'setPropertyBool', nativeName: 'setPropertyBool', valueCallbackIndex: 3 }
    
          // function(/* const rho::String& */ name, /* optional function */ oResult)
        , { methodName: 'isPropertyExists', nativeName: 'isPropertyExists', valueCallbackIndex: 1 }
    
          // function(/* const rho::String& */ name, /* bool */ saveToFile, /* optional function */ oResult)
        , { methodName: 'removeProperty', nativeName: 'removeProperty', valueCallbackIndex: 2 }
    
          // function(/* optional function */ oResult)
        , { methodName: 'loadFromFile', nativeName: 'loadFromFile', valueCallbackIndex: 0 }
    
    ], apiReq);

    // === Config default instance support ===
    

    rhoUtil.namespace(moduleNS, Config);

    

    

})(Rho.jQuery, Rho, Rho.util);
