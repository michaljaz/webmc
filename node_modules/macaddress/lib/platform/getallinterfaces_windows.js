/* jshint node: true */
'use strict';

var execFile = require('child_process').execFile;

module.exports = function (callback) {
    execFile("wmic", ["nic", "get", "NetConnectionID"], function (err, out) {
        if (err) {
            callback(err, null);
            return;
        }
        var ifaces = out.trim().replace(/\s{2,}/g, "\n").split("\n").slice(1);
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
