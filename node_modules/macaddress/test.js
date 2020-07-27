/* jshint node: true */
'use strict';

var macaddress = require('./index.js');

macaddress.one(function (err, mac) {
  if (err || !/[a-f0-9]{2}(:[a-f0-9]{2}){5}/.test(mac)) {
    console.log(mac + " does not work");
    throw err || mac;
  }
  console.log("Mac address for this host: %s", mac);
});

macaddress.all(function (err, all) {
  if (err) {
    throw err;
  }
  console.log(JSON.stringify(all, null, 2));
});

console.log(JSON.stringify(macaddress.networkInterfaces(), null, 2));

if (typeof Promise !== 'undefined') {
  macaddress.one().then(function (result) {
    console.log("Mac address for this host using Promises: %s", result);
  });
  macaddress.all().then(function (result) {
    console.log("all() using promises");
    console.log(JSON.stringify(result, null, 2));
  });
}
