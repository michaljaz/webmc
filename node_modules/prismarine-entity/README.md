# prismarine-entity
[![NPM version](https://img.shields.io/npm/v/prismarine-entity.svg)](http://npmjs.com/package/prismarine-entity)
[![Build Status](https://circleci.com/gh/PrismarineJS/prismarine-entity/tree/master.svg?style=shield)](https://circleci.com/gh/PrismarineJS/prismarine-entity/tree/master)

Represent a minecraft entity

## Usage

```js
var Entity=require("prismarine-entity");

var entity=new Entity(0);

console.log(entity);
```

## API

### Entity

Entities represent players, mobs, and objects.

#### entity.id

#### entity.type

Choices:

 * `player`
 * `mob`
 * `object`
 * `global` - lightning
 * `orb` - experience orb.
 * `other` - introduced with a recent Minecraft update and not yet recognized or used by a third-party mod

#### entity.username

If the entity type is `player`, this field will be set.

#### entity.mobType

If the entity type is `mob`, this field will be set.

#### entity.displayName

Field set for mob and object. A long name in multiple words.

#### entity.entityType

Field set for mob and object. The numerical type of the entity (1,2,...)

#### entity.kind

Field set for mob and object. The kind of entity (for example Hostile mobs, Passive mobs, NPCs).

#### entity.name

Field set for mob and object. A short name for the entity.

#### entity.objectType

If the entity type is `object`, this field will be set.

#### entity.count

If the entity type is `orb`, this field will be how much experience you
get from collecting the orb.

#### entity.position

#### entity.velocity

#### entity.yaw

#### entity.pitch

#### entity.height

#### entity.onGround

#### entity.equipment[5]

 * `0` - held item
 * `1` - shoes
 * `2` - legging
 * `3` - torso
 * `4` - head
 

#### entity.heldItem

Equivalent to `entity.equipment[0]`.

#### entity.metadata

See http://wiki.vg/Entities#Entity_Metadata_Format for more details.

#### entity.health
The health of the player, default: 20

#### entity.food
The food of the player, default: 20

#### entity.player
The player

## History

### 1.0.0

* typescript definitions (thanks @IdanHo)

### 0.2.0
* extend EventEmitter

### 0.1.0

* Import from mineflayer