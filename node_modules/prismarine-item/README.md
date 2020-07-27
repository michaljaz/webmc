# prismarine-item
[![NPM version](https://img.shields.io/npm/v/prismarine-item.svg)](http://npmjs.com/package/prismarine-item)
[![Build Status](https://github.com/PrismarineJS/prismarine-item/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-item/actions?query=workflow%3A%22CI%22)

Represent a minecraft item with its associated data

## Usage

```js
const Item=require("prismarine-item")("1.8");

const ironShovelItem=new Item(256,1);

console.log(ironShovelItem);

const notchItem=Item.toNotch(ironShovelItem);
console.log(notchItem);

console.log(Item.fromNotch(notchItem));
```

## API

### Item(type, count[, metadata], nbt)

#### Item.toNotch(item)

Take an `item` in the format of the minecraft packets and return an `Item` instance.

#### Item.fromNotch(item)

Take an `Item` instance and return it in the format of the minecraft packets.

#### item.type

Numerical id.

#### item.count

#### item.metadata

Number which represents different things depending on the item.
See http://www.minecraftwiki.net/wiki/Data_values#Data

#### item.nbt

Buffer.

#### item.name

#### item.displayName

#### item.stackSize

#### item.equal(otherItem)

Return true if items are equal.


## History

### 1.5.0

* 1.16 support (thanks @DrakoTrogdor)

### 1.4.0

* typescripts definitions (thanks @IdanHo)

### 1.3.0

* 1.15 support

### 1.2.0

* 1.14 support

### 1.1.1

* allow unknown items

### 1.1.0

* 1.13 support

### 1.0.2

* make nbt default to null
* display the item id if it is not found in minecraft data

### 1.0.1

* bump mcdata

### 1.0.0

* bump dependencies

### 0.0.0

* Import from mineflayer
