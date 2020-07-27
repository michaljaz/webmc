const chunkImplementations = {
  pc: {
    1.8: require('./pc/1.8/chunk'),
    1.9: require('./pc/1.9/chunk'),
    '1.10': require('./pc/1.9/chunk'),
    1.11: require('./pc/1.9/chunk'),
    1.12: require('./pc/1.9/chunk'),
    1.13: require('./pc/1.13/chunk'),
    1.14: require('./pc/1.14/chunk'),
    1.15: require('./pc/1.15/chunk'),
    1.16: require('./pc/1.16/chunk')
  },
  pe: {
    0.14: require('./pe/0.14/chunk'),
    '1.0': require('./pe/1.0/chunk')
  }
}

module.exports = loader

function loader (mcVersion) {
  const mcData = require('minecraft-data')(mcVersion)
  try {
    return chunkImplementations[mcData.type][mcData.version.majorVersion](mcVersion)
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`[Prismarine-chunk] No chunk implementation for ${mcVersion} found`)
    } else {
      console.log(`Error found while loading ${mcData.type} - ${mcData.version.majorVersion} - ${mcVersion}`)
      throw e
    }
  }
}
