# Datatypes

Protodef has a number of useful default datatypes.

## Conditional

### switch

switch make it possible to choose a datatype depending on the value of an other field. 
It is similar to the switch/case syntax.
It takes 3 arguments:

* compareTo : the value is the other field
* compareToValue : an optional property (it's either compareTo or compareToValue) that allows the comparison to be made with a value instead of an other field
* fields : an object mapping the values to the types
* default : an optional property saying the type taken if the value doesn't fit into the cases

Example: 

A switch which can encode a byte, a varint, a float or a string depending on "someField".
If the value of someField is different, then the value encoded is of type void.

```json
[
  "switch",
  {
    "compareTo": "someField",
    "fields": {
      "0": "i8",
      "1": "varint",
      "2": "f32",
      "3": "string"
      },
    "default": "void"  
   }
]
```

Example of value: `4.5`

### option

option represents a simple optional type. It's encoded as a boolean indicating whether the value is there or not.
It's similar to the Optional type in java or Maybe in haskell.
It takes only one argument : the type of the value.

Example:

An option of value string

```json
[
  "option",
  "cstring"
]
```

Example of value: `"my string"`

## Numeric

These datatypes don't take any arguments. They represent numbers.

| Name    | Size in bytes | Example of value    | Also called                  |
| ---     | ---           | ---                 | ---                          |
| i8      | 1             | -125                | byte                         |
| u8      | 1             | 255                 | unsigned byte                |
| i16     | 2             | -32000              | short                        | 
| u16     | 2             | 60000               | unsigned short               |
| i32     | 4             | -2000000000         | int                          |
| u32     | 4             | 3000000000          | unsigned int                 |
| f32     | 4             | 4.5                 | float                        |
| f64     | 8             | 4.5                 | double                       |
| i64     | 8             | 1                   | long                         |
| u64     | 8             | 1                   | unsigned long                |
| li8     | 1             | -125                | little endian byte           |
| lu8     | 1             | 255                 | little endian unsigned byte  |
| li16    | 2             | -32000              | little endian short          | 
| lu16    | 2             | 60000               | little endian unsigned short |
| li32    | 4             | -2000000000         | little endian int            |
| lu32    | 4             | 3000000000          | little endian unsigned int   |
| lf32    | 4             | 4.5                 | little endian float          |
| lf64    | 8             | 4.5                 | little endian double         |
| li64    | 8             | 1                   | little endian long           |
| lu64    | 8             | 1                   | little endian unsigned long  |

## Structures

### array

array represents a list of values. 

It takes for arguments:

* type : the type of the element
* countType : the type of the length prefix
* count : optional (either count or countType), a reference to the field counting the elements, or a fixed size (an integer)

See [Counting](#counting)

Example:

An array of int prefixed by a short length.
```json
[
  "array",
  {
    "countType": "i16",
    "type": "i32"
  }
]
```

Example of value: `[1,2,3,4]`

### count

It represents a count field for an array or a buffer. 

Example:

A count for a field name records, of type short.
```json
[
    "count",
    {
      "type": "i16",
      "countFor": "records"
    }
]
```

Example of value: `5`

### container

It represents a list of named values. It takes for argument these values with their types and names.

Example:

A container with fields of type int, int, ushort and ushort.
```json
[
    "container",
    [
      {
        "name": "x",
        "type": "i32"
      },
      {
        "name": "z",
        "type": "i32"
      },
      {
        "name": "bitMap",
        "type": "u16"
      },
      {
        "name": "addBitMap",
        "type": "u16"
      }
    ]
]
```

Example of value: `{"x":10,"z":10,"bitMap":10,"addBitMap":10}`

## Utils

### varint

A variable-length number representation.

Size: between 1 and 5

Example of value : `5`

### bool

A boolean, encoded in one byte.

Example of value : `true`

### pstring

A length prefixed string. It takes one argument : the type of the length prefix. 
It is usually used to define a "string" type that can be used without argument.

The count can also be defined in different ways, see [Counting](#counting).

Example:

A string length prefixed by a varint.
```json
[
    "pstring",{
        "countType":"varint"
      }
]
```

Example of value: `"my string"`

### buffer

buffer represents a Buffer

It takes for arguments:

* countType : the type of the length prefix
* count : optional (either count or countType), a reference to the field counting the elements, or a fixed size (an integer)

See [Counting](#counting)

Example:

An buffer prefixed by a varint length.
```json
[
    "buffer",
    {
      "countType": "varint"
    }
]
```

Example of value: `new Buffer([0x01,0x02,0x03])`

### void

void represents an empty value. It has a size of 0.

Example of value: `undefined`

### bitfield

bitfield represents a list of value with sizes that are not a multiple of 8bits.
It takes for argument a list of values with:
* a size
* a name
* signed
The sum of the sizes must be a multiple of 8.

Example:

3 values, x, y and z with sizes in bits : 26, 12, 26. Notice that 26+12+26=64.
```json
["bitfield", [
      { "name": "x", "size": 26, "signed": true },
      { "name": "y", "size": 12, "signed": true },
      { "name": "z", "size": 26, "signed": true }
    ]]
```

Example of value: `{"x":10,"y":10,"z":10}`

### cstring

cstring represents a null terminated string. Similar to strings in C.

Example of value: "my string"

### mapper

mappers maps values. It takes as argument the type of the input, and a mappings object with the values to map.

Example:

Maps a byte to a string, 1 to "byte", 2 to "short", 3 to "int", 4 to "long".
```json
[
    "mapper",
    {
      "type": "i8",
      "mappings": {
        "1": "byte",
        "2": "short",
        "3": "int",
        "4": "long"
      }
    }
]
```

Example of value: `3`

# Common datatypes arguments

## Counting

* countType : the type of the length prefix
* count : optional (either count or countType), a reference to the field counting the elements, or a fixed size (an integer)
