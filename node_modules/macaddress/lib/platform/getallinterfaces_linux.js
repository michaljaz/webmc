/* jshint node: true */
var execFile = require('child_process').execFile;

module.exports = function (callback) {
    execFile("/bin/ls", ["/sys/class/net"], function (err, out) {
        if (err) {
            callback(err, null);
            return;
        }
        var ifaces = out.split(/[ \t]+/);
        var result = [];
        for (var i = 0; i < ifaces.length; i += 1) {
            var iface = ifaces[i].trim();
            if (iface !== "") {
                result.push(iface);
            }
        }
        callback(null, result);
    });
};
