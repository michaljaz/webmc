# New datatypes

You can create new datatypes for Protodef.

Three functions need to be created to define a datatype.

An optional `schema` property can be added to validate whether the type is used properly in new types.
It must be defined as a json schema. See the [ProtoDef](https://github.com/ProtoDef-io/ProtoDef) repo for schema examples of existing types.

## read

read takes 4 arguments:

* buffer : the buffer from which to read the data
* offset : where to start reading the buffer
* typeArgs : (optional) the arguments passed to the type
* context :  (optional) an object to get values previously read in the containing type

It must returns an object with two values:
* value : the read value
* size : the number of bytes read by the buffer

Example: 

That read function has 2 typeArgs : type and endVal.
It increases the value of a cursor in order to eventually return the size.
The PartialReadError error needs to be thrown if buffer doesn't contain enough bytes.

```js
function readEntityMetadata(buffer, offset, {type,endVal}) {
  let cursor = offset;
  const metadata = [];
  let item;
  while(true) {
    if(offset+1>buffer.length)
      throw new PartialReadError();
    item = buffer.readUInt8(cursor);
    if(item === endVal) {
      return {
        value: metadata,
        size: cursor + 1 - offset
      };
    }
    const results = this.read(buffer, cursor, type, {});
    metadata.push(results.value);
    cursor += results.size;
  }
}
```

Useful function: this.read which takes 5 arguments:

* buffer : the buffer from which to read the data
* offset : where to start reading the buffer
* type : the type to read
* typeArgs : (optional) the arguments passed to the type
* context :  (optional) an object to get values previously read in the containing type

Can be used to read already existing datatype.

## write

write takes 5 arguments:

* value : the value to be written
* buffer : the buffer to write in
* offset : the offset at which to write in the buffer
* typeArgs : (optional) the arguments passed to the type
* context :  (optional) an object to get values previously read in the containing type

It must return the offset increased with the number of bytes written.

Example:

This write function updates the offset at each this.write called.
```js
function writeEntityMetadata(value, buffer, offset, {type,endVal}) {
  const self = this;
  value.forEach(function(item) {
    offset = self.write(item, buffer, offset, type, {});
  });
  buffer.writeUInt8(endVal, offset);
  return offset + 1;
}
```

Useful function: this.write which takes 6 arguments:

* value : the value to be written
* buffer : the buffer to write in
* offset : the offset at which to write in the buffer
* type : the type to write
* typeArgs : (optional) the arguments passed to the type
* context :  (optional) an object to get values previously written in the containing type

## sizeOf

sizeOf takes 3 arguments:

* value : the value for which to compute the buffer size
* typeArgs : (optional) the arguments passed to the type
* context :  (optional) an object to get values previously read in the containing type

It must return the size of the buffer needed to write the given value.

Example:

This sizeOf function calls this.sizeOf to get the size of each value and return the sum.
```js
function sizeOfEntityMetadata(value, {type}) {
  let size = 1;
  for(let i = 0; i < value.length; ++i) {
    size += this.sizeOf(value[i], type, {});
  }
  return size;
}
```

Useful function : this.sizeOf which takes 4 arguments:

* value : the value for which to compute the buffer size
* type : the type to get the size of
* typeArgs : (optional) the arguments passed to the type
* context :  (optional) an object to get values previously written in the containing type
