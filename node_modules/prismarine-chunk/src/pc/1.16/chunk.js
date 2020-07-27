const constants = require('../common/constants')

function loader (mcVersion) {
  const Block = require('prismarine-block')(mcVersion)
  const mcData = require('minecraft-data')(mcVersion)

  const Chunk = require('./ChunkColumn')(Block, mcData)
  // expose for test purposes
  Chunk.h = constants.CHUNK_HEIGHT
  return Chunk
}

module.exports = loader
