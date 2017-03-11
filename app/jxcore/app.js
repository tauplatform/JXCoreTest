// This JavaScript file runs on JXcore

var fs = require('fs');


if (!fs.existsSync(__dirname + "/node_modules")) {
  console.log("The node_modules folder not found. Please refer to www/jxcore/Install_modules.md");
  return;
}

var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World! (' + Date.now() + ")");
});

var server = app.listen(3000, function () {
  console.log("Express server is started. (port: 3000)");
});

var os = require('os');
var net = os.networkInterfaces();

//for (var ifc in net) {
//  var addrs = net[ifc];
//  for (var a in addrs) {
//    if (addrs[a].family == "IPv4") {
//      Mobile('addIp').call(addrs[a].address);
//    }
//  }
//}
