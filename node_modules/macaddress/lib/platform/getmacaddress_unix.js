/* jshint node: true */
var execFile = require('child_process').execFile;

module.exports = function (iface, callback) {
    execFile("ifconfig", [iface], function (err, out) {
        if (err) {
            callback(err, null);
            return;
        }
        var match = /[a-f0-9]{2}(:[a-f0-9]{2}){5}/.exec(out.toLowerCase());
        if (!match) {
            callback("did not find a mac address", null);
            return;
        }
        callback(null, match[0].toLowerCase());
    });
};
