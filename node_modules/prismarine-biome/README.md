# prismarine-biome
[![NPM version](https://img.shields.io/npm/v/prismarine-biome.svg)](http://npmjs.com/package/prismarine-biome)
[![Build Status](https://circleci.com/gh/PrismarineJS/prismarine-biome/tree/master.svg?style=shield)](https://circleci.com/gh/PrismarineJS/prismarine-biome/tree/master)

Represent a minecraft biome with its associated data

## Usage

```js
const Biome=require("prismarine-biome")("1.8");

const ocean=new Biome(0);

console.log(ocean);
```

## API

### Biome

#### biome.id

Numerical id.

#### biome.color

#### biome.height

#### biome.name

#### biome.rainfall

#### biome.temperature

## History

### 1.1.0

* typescript definitions (thanks @IdanHo)

### 1.0.1

* bump mcdata

### 1.0.0

* bump mcdata major

### 0.1.0

* Import from mineflayer