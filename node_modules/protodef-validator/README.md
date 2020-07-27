# ProtoDef-validator
[![NPM version](https://img.shields.io/npm/v/protodef-validator.svg)](http://npmjs.com/package/protodef-validator)
[![Build Status](https://circleci.com/gh/ProtoDef-io/node-protodef-validator/tree/master.svg?style=shield)](https://circleci.com/gh/ProtoDef-io/node-protodef-validator/tree/master)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/ProtoDef-io/node-protodef-validator)

Validate [ProtoDef](https://github.com/ProtoDef-io/ProtoDef) protocol definition in node

## Installing

```
npm install protodef-validator
```

## Usage

See [example](example.js)

## Command Line Interface

You can install this package globally with `npm install -g protodef-validator` and then run `protodef-validator someProtocol.json` to validate it.

## API

### Validator

Class to make validator instances

#### Validator.addType(name [,schema])

add the type `name` with schema `schema`

If `schema` isn't specified, use a default schema.

#### Validator.addTypes(schemas)

Add `schemas` which is an object with keys the name of the schemas and values the schema definitions.

#### Validator.validateType(type)

validates a type definition `type`

throws an exception if the type isn't correct

#### Validator.validateProtocol(protocol)

validates a protocol definition `protocol`

throws an exception if the protocol isn't correct

## History

### 1.2.3

* add .json suffix when requiring (for webpack)

### 1.2.2

* fix release

### 1.2.1

* update ajv and protodef

### 1.2.0

* allow : in switch keys

### 1.1.7

* properly define compareTo/compareToValue

### 1.1.6

* fix compareToValue switch property allowance

### 1.1.5

* properly normalize schema names

### 1.1.4

* normalize refs

### 1.1.3

* print errors again

### 1.1.2

* fix release

### 1.1.1

* recreate ajv instance to recompile if types were validated hence compiled

### 1.1.0

* check the datatypes have been defined
* make it possible to add types with a default schema
* better errors

### 1.0.2

* ignore already added types

### 1.0.1

* fix index.js

### 1.0.0

* can validate types and protocols
