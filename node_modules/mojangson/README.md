# node-mojangson
[![NPM version](https://badge.fury.io/js/mojangson.svg)](http://badge.fury.io/js/mojangson) [![Build Status](https://circleci.com/gh/rom1504/node-mojangson.svg?style=shield)](https://circleci.com/gh/rom1504/node-mojangson)

node-mojangson is a mojangson parser.

## Mojangson specification
Mojangson is mojang's variant of json. It is basically json with the following changes :

 * array can be indexed (example : `[0:"v1",1:"v2",2:"v3"]`)
 * array and object can have trailing comma (example : `[5,4,3,]` and `{"a":5,"b":6,}`)
 * there can be string without quote (example : `{mykey:myvalue}`)
 * numbers can be suffixed by b, s, l, f, d, i or the same in upper case (example : `{number:5b}`)
 * mojangson stays a superset of json : every json is a mojangson

 Reference https://minecraft.gamepedia.com/Commands#Data_tags

## Parser
This parser is build using jison.

See the [grammar](grammar.jison) and the examples in the [test](test/test.js) for more information.

## Usage
Usage example :

```js
var mojangson=require("mojangson");
console.log(mojangson.parse("{mykey:myvalue}"));
```

The provided method mojangson.parse return a javascript object corresponding to the mojangson passed in input.


## History

### 0.2.4

* add support for double and int

### 0.2.3

* fix release about grammar.js still containing the cli

### 0.2.2

* disable jison cli to make mojangson compatible with browserify

### 0.2.1

* fix state conflict due to recent trailing comma fix

### 0.2.0

* Rename npm package to mojangson
* fix trailing comma in arrays

### 0.1.1

* better error displaying

### 0.1

* First release, basic functionnality