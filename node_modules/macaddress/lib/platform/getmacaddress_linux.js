/* jshint node: true */
var execFile = require('child_process').execFile;

module.exports = function (iface, callback) {
    execFile("/bin/cat", ["/sys/class/net/" + iface + "/address"], function (err, out) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, out.trim().toLowerCase());
    });
};
