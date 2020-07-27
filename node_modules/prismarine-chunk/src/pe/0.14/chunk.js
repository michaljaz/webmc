'use strict'

const Vec3 = require('vec3').Vec3
const w = 16
const l = 16
const h = 128
const BLOCK_DATA_SIZE = w * l * h
const REGULAR_DATA_SIZE = BLOCK_DATA_SIZE / 2
const SKYLIGHT_DATA_SIZE = BLOCK_DATA_SIZE / 2
const BLOCKLIGHT_DATA_SIZE = BLOCK_DATA_SIZE / 2
const ADDITIONAL_DATA_SIZE_DIRTY = w * l
const ADDITIONAL_DATA_SIZE_COLOR = w * l * 4
const BUFFER_SIZE = BLOCK_DATA_SIZE + REGULAR_DATA_SIZE + SKYLIGHT_DATA_SIZE + BLOCKLIGHT_DATA_SIZE + ADDITIONAL_DATA_SIZE_COLOR + ADDITIONAL_DATA_SIZE_DIRTY

const readUInt4LE = require('uint4').readUInt4LE
const writeUInt4LE = require('uint4').writeUInt4LE

module.exports = loader

function loader (mcVersion) {
  Block = require('prismarine-block')(mcVersion)
  Chunk.w = w
  Chunk.l = l
  Chunk.h = h
  Chunk.BUFFER_SIZE = BUFFER_SIZE
  return Chunk
}

let Block

function exists (val) {
  return val !== undefined
}

const getArrayPosition = function (pos) {
  return pos.x + w * (pos.z + l * pos.y)
}

const getBlockCursor = function (pos) {
  return getArrayPosition(pos)
}

const getBlockDataCursor = function (pos) {
  return BLOCK_DATA_SIZE + getArrayPosition(pos) * 0.5
}

const getBlockLightCursor = function (pos) {
  return BLOCK_DATA_SIZE + REGULAR_DATA_SIZE + getArrayPosition(pos) * 0.5
}

const getSkyLightCursor = function (pos) {
  return BLOCK_DATA_SIZE + REGULAR_DATA_SIZE + SKYLIGHT_DATA_SIZE + getArrayPosition(pos) * 0.5
}

const getHeightMapCursor = function (pos) {
  return BLOCK_DATA_SIZE + REGULAR_DATA_SIZE + SKYLIGHT_DATA_SIZE + BLOCKLIGHT_DATA_SIZE + (pos.z * w) + pos.x
}

const getBiomeCursor = function (pos) {
  return BLOCK_DATA_SIZE + REGULAR_DATA_SIZE + SKYLIGHT_DATA_SIZE + BLOCKLIGHT_DATA_SIZE + ADDITIONAL_DATA_SIZE_DIRTY + ((pos.z * w) + pos.x) * 4
}

class Chunk {
  constructor () {
    this.data = Buffer.alloc(BUFFER_SIZE)

    this.data.fill(0)
  }

  toJson () {
    return JSON.stringify({ data: this.data.toJSON() })
  }

  static fromJson (j) {
    const parsed = JSON.parse(j)
    const chunk = new Chunk()
    chunk.data = Buffer.from(parsed.data)
    return chunk
  }

  initialize (iniFunc) {
    const p = new Vec3(0, 0, 0)
    for (p.y = 0; p.y < h; p.y++) {
      for (p.z = 0; p.z < w; p.z++) {
        for (p.x = 0; p.x < l; p.x++) {
          const block = iniFunc(p.x, p.y, p.z)
          this.setBlock(p, block)
        }
      }
    }
  }

  getBlock (pos) {
    var block = new Block(this.getBlockType(pos), this.getBiome(pos), this.getBlockData(pos))
    block.light = this.getBlockLight(pos)
    block.skyLight = this.getSkyLight(pos)
    return block
  }

  setBlock (pos, block) {
    if (exists(block.type)) { this.setBlockType(pos, block.type) }
    if (exists(block.metadata)) { this.setBlockData(pos, block.metadata) }
    if (exists(block.biome)) { this.setBiome(pos, block.biome.id) }
    if (exists(block.skyLight)) { this.setSkyLight(pos, block.skyLight) }
    if (exists(block.light)) { this.setBlockLight(pos, block.light) }
  }

  getBlockType (pos) {
    if (pos.y < 0 || pos.y >= 256) return 0
    return this.data.readUInt8(getBlockCursor(pos))
  }

  setBlockType (pos, id) {
    if (pos.y < 0 || pos.y >= 256) return
    this.data.writeUInt8(id, getBlockCursor(pos))
  }

  getBlockData (pos) {
    if (pos.y < 0 || pos.y >= 256) return 0
    return readUInt4LE(this.data, getBlockDataCursor(pos))
  }

  setBlockData (pos, data) {
    if (pos.y < 0 || pos.y >= 256) return
    writeUInt4LE(this.data, data, getBlockDataCursor(pos))
  }

  getBlockLight (pos) {
    if (pos.y < 0 || pos.y >= 256) return 0
    return readUInt4LE(this.data, getBlockLightCursor(pos))
  }

  setBlockLight (pos, light) {
    if (pos.y < 0 || pos.y >= 256) return
    writeUInt4LE(this.data, light, getBlockLightCursor(pos))
  }

  getSkyLight (pos) {
    if (pos.y < 0 || pos.y >= 256) return 0
    return readUInt4LE(this.data, getSkyLightCursor(pos))
  }

  setSkyLight (pos, light) {
    if (pos.y < 0 || pos.y >= 256) return
    writeUInt4LE(this.data, light, getSkyLightCursor(pos))
  }

  getBiomeColor (pos) {
    var color = this.data.readInt32BE(getBiomeCursor(pos)) & 0xFFFFFF

    return {
      r: (color >> 16),
      g: ((color >> 8) & 0xFF),
      b: (color & 0xFF)
    }
  }

  setBiomeColor (pos, r, g, b) {
    this.data.writeInt32BE((this.data.readInt32BE(getBiomeCursor(pos)) & 0xFF000000) |
      ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0XFF), getBiomeCursor(pos))
  }

  getBiome (pos) {
    return (this.data.readInt32BE(getBiomeCursor(pos)) & 0xFF000000) >> 24
  }

  setBiome (pos, id) {
    this.data.writeInt32BE((this.data.readInt32BE(getBiomeCursor(pos)) & 0xFFFFFF) | (id << 24), getBiomeCursor(pos))
  }

  getHeight (pos) {
    return this.data.readUInt8(getHeightMapCursor(pos))
  }

  setHeight (pos, value) {
    this.data.writeUInt8(value, getHeightMapCursor(pos))
  }

  load (data) {
    if (!Buffer.isBuffer(data)) { throw (new Error('Data must be a buffer')) }
    if (data.length !== BUFFER_SIZE) { throw (new Error(`Data buffer not correct size (was ${data.length}, expected ${BUFFER_SIZE})`)) }
    this.data = data
  }

  // These methods do nothing, and are present only for API compatibility
  dumpBiomes () {

  }

  dumpLight () {

  }

  loadLight () {

  }

  loadBiomes () {

  }

  dump () {
    return this.data
  }

  getMask () {
    return 0xFFFF
  }
}
