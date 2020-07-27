# endian-toggle

Toggle the byte ordering of a buffer.

[![build status](https://secure.travis-ci.org/substack/endian-toggle.png)](http://travis-ci.org/substack/endian-toggle)

# example

``` js
var toggle = require('endian-toggle');
var buf = new Buffer('abcd');

console.dir(buf);
console.dir(toggle(buf, 16));
```

***

```
<Buffer 61 62 63 64>
<Buffer 62 61 64 63>
```

# methods

``` js
var toggle = require('endian-toggle')
```

## toggle(buf, bits)

Return a new buffer from `buf` with toggled endianness at `bits` many bits.

# install

With [npm](https://npmjs.org) do:

```
npm install endian-toggle
```

# license

MIT
