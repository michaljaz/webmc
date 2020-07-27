const windows = require('./')('1.8')
const Item = require('prismarine-item')('1.8')

const inv = windows.createWindow(1, 'minecraft:inventory', 'inv', 36)

inv.updateSlot(10, new Item(256, 1))

console.log(inv.items())
