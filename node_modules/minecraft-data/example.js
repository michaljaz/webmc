const mcData = require('minecraft-data')('1.8.8')

console.log(mcData.blocksByName.stone)
console.log(mcData.windows['minecraft:brewing_stand'])
console.log(mcData.version)
console.log(mcData.effectsByName.Haste)

console.log(mcData.mobs[62])
console.log(mcData.objects[62])

console.log(require('minecraft-data').versionsByMinecraftVersion.pc['1.8.8'])

console.log(require('minecraft-data').versionsByMinecraftVersion.pc['15w40b'])

console.log(require('minecraft-data').preNettyVersionsByProtocolVersion.pc[47])

console.log(require('minecraft-data').postNettyVersionsByProtocolVersion.pc[47][0])

console.log(require('minecraft-data')(47).version)

console.log(require('minecraft-data')('1.8').version)

console.log(require('minecraft-data')('15w40b').version)

console.log(require('minecraft-data')('0.30c').version)

console.log(require('minecraft-data')('pe_0.14').version)

console.log(require('minecraft-data')('pc_1.9').blocksByName.dirt)
console.log(require('minecraft-data')('pe_0.14').blocksByName.podzol)
console.log(require('minecraft-data')('pe_0.14').type)

console.log(require('minecraft-data')('1.8').enchantments[5])

console.log(require('minecraft-data').supportedVersions.pc)

console.log(require('minecraft-data')('1.12').language['options.sensitivity.max'])

console.log(require('minecraft-data')('1.13.2').blocksByStateId[3381])
