# prismarine-windows

[![Build Status](https://github.com/PrismarineJS/prismarine-windows/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-windows/actions?query=workflow%3A%22CI%22)

Represent minecraft windows

## Usage

```js
const windows = require('./')('1.8')
const Item = require('prismarine-item')('1.8')

const inv = windows.createWindow(1, 'minecraft:inventory', 'inv', 36)

inv.updateSlot(10, new Item(256, 1))

console.log(inv.items())

```

## API

### windows.createWindow(id, type, title, slotCount = undefined)

Create a window with:
 * `id` - the window id
 * `type` - this can be a string or a numeric id depending on the mcVersion
 * `title` - the title of the window
 * `slotCount` - used to set the number of slots for mcVersion prior to 1.14, ignored in 1.14

### windows.Window (base class)

#### window.id

#### window.type

#### window.title

"Inventory", "Chest", "Large chest", "Crafting", "Furnace", or "Trap"

#### window.slots

Map of slot index to `Item` instance.

#### window.selectedItem

In vanilla client, this is the item you are holding with the mouse cursor.

#### window.findInventoryItem(item, metadata, [notFull])

 * `item` - numerical id or name that you are looking for
 * `metadata` -  metadata value that you are looking for. `null`
   means unspecified.
 * `notFull` - (optional) - if `true`, means that the returned
   item should not be at its `stackSize`.

#### window.count(itemType, [metadata])

Returns how many you have in the inventory section of the window.

 * `itemType` - numerical id that you are looking for
 * `metadata` - (optional) metadata value that you are looking for.
   defaults to unspecified

#### window.items()

Returns a list of `Item` instances from the inventory section of the window.

#### window.emptySlotCount()

#### window "windowUpdate" (slot, oldItem, newItem)

Fired whenever any slot in the window changes for any reason.
Watching `bot.inventory.on("windowUpdate")` is the best way to watch for changes in your inventory.

 * `slot` - index of changed slot.
 * `oldItem`, `newItem` - either an [`Item`](#mineflayeritem) instance or `null`.

`newItem === window.slots[slot]`.

#### window.containerCount(itemType, [metadata])
Returns how many items there are in the top section of the window.

 * `itemType` - numerical id that you are looking for
 * `metadata` - (optional) metadata value that you are looking for.
   defaults to unspecified

## History

### 1.6.0

* Add ability to find items by name (thanks @Naomi)

### 1.5.0

* 1.16.0 compat (thanks @DrakoTrogdor)

### 1.4.0

* typescript definitions (thanks @IdanHo)

### 1.3.0

* 1.15 support

### 1.2.0

bunch of changes by Karang :
* refactored
* more windows for both 1.14 and before

### 1.1.1

* fix for tossed item when crafted (thanks @karang)

### 1.1.0

* added support for villager trading windows (thanks @plexigras)

### 1.0.1

* bump mcdata

### 1.0.0

* bump dependencies

### 0.0.0

* Import from mineflayer
