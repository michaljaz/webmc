UInt4
===

Read and write half-bytes to buffers

Usage
===

**Basic usage**

ES5
```js
var readUInt4  = require('uint4').read;
var writeUint4 = require('uint4').write;

var buffer = new Buffer(4);

writeUInt4(buffer, 3, 0.0);
writeUInt4(buffer, 7, 0.5);

readUInt4(buffer, 0.0); // 3
readUint4(buffer, 0.5); // 7
```

ES6
```js
var {readUInt4, writeUint4} = require('uint4');

var buffer = new Buffer(4);

writeUInt4(buffer, 5, 0.0);
writeUInt4(buffer, 4, 0.5);

readUInt4(buffer, 0.0); // 5
readUint4(buffer, 0.5); // 4
```

**BE and LE APIs**

ES6

```js
var { readUInt4LE, writeUInt4BE, readUInt4BE, writeUInt4BE } = require('uint4');

var buffer = new Buffer(4);

// BE

buffer.fill(0);
writeUInt4BE(buffer, 4, 0);

buffer; // <Buffer 40 00 00 00>
readUInt4BE(buffer, 0); // 4

// LE

buffer.fill(0);
writeUInt4LE(buffer, 4, 0);

buffer; // <Buffer 04 00 00 00>
readUInt4LE(buffer, 0); // 4
```

License
===

MIT
