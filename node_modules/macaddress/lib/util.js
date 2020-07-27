/* jshint node: true */
"use strict";

var lib = {};

var nextTick = process.nextTick || global.setImmediate || global.setTimeout;
lib.nextTick = function (func) {
    nextTick(func);
};

lib.parallel = function (tasks, done) {
    var results = [];
    var errs = [];
    var length = 0;
    var doneLength = 0;
    function doneIt(ix, err, result) {
        if (err) {
            errs[ix] = err;
        } else {
            results[ix] = result;
        }
        doneLength += 1;
        if (doneLength >= length) {
            done(errs.length > 0 ? errs : errs, results);
        }
    }
    Object.keys(tasks).forEach(function (key) {
        length += 1;
        var task = tasks[key];
        lib.nextTick(function () {
            task(doneIt.bind(null, key), 1);
        });
    });
};

lib.promisify = function (func) {
    return new Promise(function (resolve, reject) {
        func(function (err, data) {
            if (err) {
                if (!err instanceof Error) {
                    err = new Error(err);
                }
                reject(err);
                return;
            }
            resolve(data);
        });
    });
};

lib.iterate = function (args, func, callback) {
    var errors = [];
    var f = function () {
        if (args.length === 0) {
            lib.nextTick(callback.bind(null, errors));
            return;
        }
        var arg = args.shift();
        if (typeof arg === "function") {
            arg(function (err, res) {
                if (err) {
                    errors.push(err);
                } else {
                    while (res.length > 0) {
                        args.unshift(res.pop());
                    }
                }
                f();
            });
            return;
        }
        func(arg, function (err, res) {
            if (err) {
                errors.push(err);
                f();
            } else {
                lib.nextTick(callback.bind(null, null, res));
            }
        });
    };
    lib.nextTick(f);
};

module.exports = lib;
