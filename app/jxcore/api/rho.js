


global.RhomobileEngine = {}

global.Rhoz = {};
global.Rhoz.System = {};
global.Rhoz.System.getS = function () {
    return "79.99";
};
global.Rhoz.System.getProperty = function(propName, callback) {
    //console.log("call Rho.System.getProperty()");
    //var jscallstr = "{\"method\":\"getProperty\",\"params\":[\""+propName+"\"],\"__rhoClass\":\"Rho.System\",\"__rhoID\":\"0\",\"jsonrpc\":\"2.0\",\"id\":4,\"__rhoCallback\":{\"id\":\"__rhoJXCID#5\",\"vmID\":\"0\",\"optParams\":null}}";
    var jscallstr = "{\"method\":\"getProperty\",\"params\":[\""+propName+"\"],\"__rhoClass\":\"Rho.System\",\"__rhoID\":\"0\",\"jsonrpc\":\"2.0\",\"id\":4}";

    global.RhomobileEngine.tau_js_entry_point_result = null;

    process.natives.js_entry_point(jscallstr, "callbackID");

    //console.log("%%%%%%%%%%%%%%%%% "+global.RhomobileEngine.tau_js_entry_point_result);

    if (global.RhomobileEngine.tau_js_entry_point_result != null) {
        var returned = global.RhomobileEngine.tau_js_entry_point_result["result"];

        //console.log("js_entry_point() for Rho.System.getProperty() return = ", returned);

        return returned;
    }
    //Mobile('js_entry_point').call(jscallstr, function(br){
    //    console.log("js_entry_point() for Rho.System.getProperty() return = ", br);
    //});
};
