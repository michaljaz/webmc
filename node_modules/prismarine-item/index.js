module.exports = loader

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  findItemOrBlockById = mcData.findItemOrBlockById
  version = mcData.version.majorVersion
  return Item
}

let findItemOrBlockById
let version

function Item (type, count, metadata, nbt) {
  if (type == null) return

  if (metadata instanceof Object && metadata !== null) {
    nbt = metadata
    metadata = 0
  }

  this.type = type
  this.count = count
  this.metadata = metadata == null ? 0 : metadata
  this.nbt = nbt || null

  const itemEnum = findItemOrBlockById(type)
  if (itemEnum) {
    this.name = itemEnum.name
    this.displayName = itemEnum.displayName
    if ('variations' in itemEnum) {
      for (var i in itemEnum.variations) {
        if (itemEnum.variations[i].metadata === metadata) { this.displayName = itemEnum.variations[i].displayName }
      }
    }
    this.stackSize = itemEnum.stackSize
  } else {
    this.name = 'unknown'
    this.displayName = 'unknown'
    this.stackSize = 1
  }
}

Item.equal = function (item1, item2) {
  if (item1 == null && item2 == null) {
    return true
  } else if (item1 == null) {
    return false
  } else if (item2 == null) {
    return false
  } else {
    return item1.type === item2.type &&
      item1.count === item2.count &&
      item1.metadata === item2.metadata
  }
}

Item.toNotch = function (item) {
  if (version === '1.13' || version === '1.14' || version === '1.15' || version === '1.16') {
    if (item == null) return { present: false }
    const notchItem = {
      present: true,
      itemId: item.type,
      itemCount: item.count
    }
    if (item.nbt && item.nbt.length !== 0) { notchItem.nbtData = item.nbt }
    return notchItem
  } else {
    if (item == null) return { blockId: -1 }
    const notchItem = {
      blockId: item.type,
      itemCount: item.count,
      itemDamage: item.metadata
    }
    if (item.nbt && item.nbt.length !== 0) { notchItem.nbtData = item.nbt }
    return notchItem
  }
}

Item.fromNotch = function (item) {
  if (version === '1.13' || version === '1.14' || version === '1.15' || version === '1.16') {
    if (item.present === false) return null
    return new Item(item.itemId, item.itemCount, item.nbtData)
  } else {
    if (item.blockId === -1) return null
    return new Item(item.blockId, item.itemCount, item.itemDamage, item.nbtData)
  }
}
