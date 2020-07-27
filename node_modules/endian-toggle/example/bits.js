var toggle = require('../');
var buf = new Buffer('abcd');

console.dir(buf);
console.dir(toggle(buf, 16));
