# Prismarine-NBT
[![NPM version](https://img.shields.io/npm/v/prismarine-nbt.svg)](http://npmjs.com/package/prismarine-nbt)
[![Build Status](https://img.shields.io/circleci/project/PrismarineJS/prismarine-nbt/master.svg)](https://circleci.com/gh/PrismarineJS/prismarine-nbt)

Prismarine-NBT is a JavaScript parser and serializer for [NBT](http://wiki.vg/NBT) archives, for use with [Node.js](http://nodejs.org/).


## Usage

```js
var fs = require('fs'),
    nbt = require('prismarine-nbt');

fs.readFile('bigtest.nbt', function(error, data) {
    if (error) throw error;

    nbt.parse(data, function(error, data) {
        console.log(data.value.stringTest.value);
        console.log(data.value['nested compound test'].value);
    });
});
```

If the data is gzipped, it is automatically decompressed first.

## API

### writeUncompressed(value,[isLittleEndian])

Returns a buffer with a serialized nbt `value`. If isLittleEndian is passed and is true, write little endian nbt (mcpe).

### parseUncompressed(data,[isLittleEndian])

Takes a buffer `data` and returns a parsed nbt value. If isLittleEndian is passed and is true, read little endian nbt (mcpe).

### parse(data,[isLittleEndian], callback)

Takes an optionally compressed `data` and provide a parsed nbt value in the `callback(err,value)`.
If isLittleEndian is passed and is true, read little endian nbt (mcpe).

### simplify(nbt)

Returns a simplified nbt representation : keep only the value to remove one level.
This loses the types so you cannot use the resulting representation to write it back to nbt.

### proto

Provide the protodef instance used to parse and serialize nbt.

### protoLE

Provide the protodef instance used to parse and serialize little endian nbt.
