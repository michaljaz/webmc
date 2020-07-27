/* jshint node: true */
"use strict";

var util = require("./lib/util.js");
var lib = {};

lib.getMacAddress     = require("./lib/getmacaddress.js");
lib.getAllInterfaces  = require("./lib/getallinterfaces.js");
lib.networkInterfaces = require("./lib/networkinterfaces.js");

// devices like en0 (mac), eth3 (linux), Ethernet (windows), etc. are preferred
var goodIfaces = new RegExp("^((en|eth)[0-9]+|ethernet)$", "i");

// https://github.com/scravy/node-macaddress/issues/32
var badIfaces = new RegExp("^(vboxnet[0-9]+)$", "i");

lib.one = function () {
    // one() can be invoked in several ways:
    // one() -> Promise<string>
    // one(iface: string) -> Promise<string>
    // one(iface: string, callback) -> async, yields a string
    // one(callback) -> async, yields a string
    var iface = null;
    var callback = null;
    if (arguments.length >= 1) {
        if (typeof arguments[0] === "function") {
            callback = arguments[0];
        } else if (typeof arguments[0] === "string") {
            iface = arguments[0];
        }
        if (arguments.length >= 2) {
            if (typeof arguments[1] === "function") {
                callback = arguments[1];
            }
        }
    }
    if (!callback) {
        return util.promisify(function (callback) {
            lib.one(iface, callback);
        });
    }
    if (iface) {
        lib.getMacAddress(iface, callback);
        return;
    }
    var ifaces = lib.networkInterfaces();
    var addresses = {};
    var best = [];
    var args = [];
    Object.keys(ifaces).forEach(function (name) {
        args.push(name);
        var score = 0;
        var iface = ifaces[name];
        if (typeof iface.mac === "string" && iface.mac !== "00:00:00:00:00:00") {
            addresses[name] = iface.mac;
            if (iface.ipv4 || iface.ipv6) {
                score += 1;
                if (iface.ipv4 && iface.ipv6) {
                    score += 1;
                }
            }
            if (goodIfaces.test(name)) {
                score += 2;
            }
            if (badIfaces.test(name)) {
                score -= 3;
            }
            best.push({
                name: name,
                score: score,
                mac: iface.mac
            });
        }
    });
    if (best.length > 0) {
        best.sort(function (left, right) {
            // the following will sort items with a higher score to the beginning
            var comparison = right.score - left.score;
            if (comparison !== 0) {
                return comparison;
            }
            if (left.name < right.name) {
                return -1;
            }
            if (left.name > right.name) {
                return 1;
            }
            return 0;
        });
        util.nextTick(callback.bind(null, null, best[0].mac));
        return;
    }
    args.push(lib.getAllInterfaces);
    var getMacAddress = function (d, cb) {
        if (addresses[d]) {
            cb(null, addresses[d]);
            return;
        }
        lib.getMacAddress(d, cb);
    };
    util.iterate(args, getMacAddress, callback);
};

lib.all = function (callback) {
    if (typeof callback !== "function") {
        return util.promisify(lib.all);
    }

    var ifaces = lib.networkInterfaces();
    var resolve = {};

    Object.keys(ifaces).forEach(function (iface) {
        if (!ifaces[iface].mac) {
            resolve[iface] = lib.getMacAddress.bind(null, iface);
        }
    });

    if (Object.keys(resolve).length === 0) {
        if (typeof callback === "function") {
            util.nextTick(callback.bind(null, null, ifaces));
        }
        return ifaces;
    }

    util.parallel(resolve, function (err, result) {
        Object.keys(result).forEach(function (iface) {
            ifaces[iface].mac = result[iface];
        });
        if (typeof callback === "function") {
            callback(null, ifaces);
        }
    });
    return null;
};

module.exports = lib;
