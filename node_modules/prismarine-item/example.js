const Item = require('./')('1.8')

const ironShovelItem = new Item(256, 1)

console.log(ironShovelItem)

const notchItem = Item.toNotch(ironShovelItem)
console.log(notchItem)

console.log(Item.fromNotch(notchItem))

const Item113 = require('./')('1.13.2')

const ironShovelItem2 = new Item113(472, 1)

console.log(ironShovelItem2)

const notchItem2 = Item113.toNotch(ironShovelItem2)
console.log(notchItem2)

console.log(Item113.fromNotch(notchItem2))
