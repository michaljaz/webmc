# ProtoDef
[![NPM version](https://img.shields.io/npm/v/protodef.svg)](http://npmjs.com/package/protodef)
[![Discord](https://img.shields.io/badge/chat-on%20discord-brightgreen.svg)](https://discord.gg/GsEFRM8)
[![Gitter](https://img.shields.io/badge/chat-on%20gitter-brightgreen.svg)](https://gitter.im/PrismarineJS/general)
[![Irc](https://img.shields.io/badge/chat-on%20irc-brightgreen.svg)](https://irc.gitter.im/)
[![Build Status](https://img.shields.io/circleci/project/github/ProtoDef-io/node-protodef/master.svg)](https://circleci.com/gh/ProtoDef-io/node-protodef)
[![Tonic](https://img.shields.io/badge/tonic-try%20it-blue.svg)](https://tonicdev.com/npm/protodef)
[![Try it on gitpod](https://img.shields.io/badge/try-on%20gitpod-brightgreen.svg)](https://gitpod.io/#https://github.com/ProtoDef-io/node-protodef)

This is a node.js module to simplify defining, reading and writing binary blobs,
whether they be internet protocols or files.

## Installing

```
npm install ProtoDef
```


## Usage

See [example](example.js)

## Documentation

See the language independent [ProtoDef](https://github.com/ProtoDef-io/ProtoDef) specification.

* [api.md](doc/api.md) documents the exposed functions and classes
* [compiler.md](doc/compiler.md) documents the ProtoDef Compiler
* [datatypes.md](https://github.com/ProtoDef-io/ProtoDef/blob/master/doc/datatypes.md) documents the default datatypes provided by Protodef.
* [newDatatypes.md](doc/newDatatypes.md) explains how to create new datatypes for protodef
* [history.md](doc/history.md) is the releases history

## Projects Using ProtoDef

* [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) defines a protocol.json by minecraft version and use ProtoDef to serialize and parse packets
  * the protocol.json files are stored in [minecraft-data](https://github.com/PrismarineJS/minecraft-data/blob/master/data/pc/1.8/protocol.json)
  * and they can be visualized automatically in this [doc](http://prismarinejs.github.io/minecraft-data/?d=protocol)
* [prismarine-nbt](https://github.com/PrismarineJS/prismarine-nbt) defined a nbt.json to parse and serialize the NBT format
* [mineflayer](https://github.com/PrismarineJS/mineflayer/blob/master/lib/plugins/command_block.js) uses ProtoDef to parse plugin messages
* [minecraft-protocol-forge](https://github.com/PrismarineJS/node-minecraft-protocol-forge) parses and serialize forge plugin messages
* [node-raknet](https://github.com/mhsjlw/node-raknet) describe the raknet protocol in a protocol.json and uses ProtoDef to read it
* [minecraft-classic-protocol](https://github.com/mhsjlw/minecraft-classic-protocol) defines the classic minecraft protocol with ProtoDef
* [pocket-minecraft-protocol](https://github.com/mhsjlw/pocket-minecraft-protocol) defines the minecraft pocket edition protocol

