# node-minecraft-data
[![NPM version](https://badge.fury.io/js/minecraft-data.svg)](http://badge.fury.io/js/minecraft-data)
[![Tonic](https://img.shields.io/badge/tonic-try%20it-blue.svg)](https://tonicdev.com/npm/minecraft-data)
[![Build Status](https://circleci.com/gh/PrismarineJS/node-minecraft-data/tree/master.svg?style=shield)](https://circleci.com/gh/PrismarineJS/node-minecraft-data/tree/master)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/PrismarineJS/node-minecraft-data)

node-minecraft-data provides easy access to [minecraft-data](https://github.com/PrismarineJS/minecraft-data) in node.js.

The objective of this module is to make easier to look for information in minecraft-data in node.

## Features

For example it's often useful to :

* find blocks by id
* find items by name
* find block or item by name
* find block or item by id

## Example

```js
const mcData=require("minecraft-data")("1.8.8")

console.log(mcData.blocksByName["stone"])
console.log(mcData.windows["minecraft:brewing_stand"])
console.log(mcData.version)
console.log(mcData.effectsByName["Haste"])
```

## Documentation

 * See [doc/api.md](doc/api.md)
 * See [doc/history.md](doc/history.md)
