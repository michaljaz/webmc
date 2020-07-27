'use strict'

const SubChunk = require('./subchunk')
const Vec3 = require('vec3')

const BIOME_ID_SIZE = 256
const HEIGHT_SIZE = 256 * 2

const BUFFER_SIZE = BIOME_ID_SIZE + HEIGHT_SIZE

module.exports = loader

function loader (mcVersion) {
  Block = require('prismarine-block')(mcVersion)
  Chunk.w = 16
  Chunk.l = 16
  Chunk.h = 256
  Chunk.BUFFER_SIZE = 3 + 256 + 512 + (16 * 10241)
  return Chunk
}

let Block

function exists (val) {
  return val !== undefined
}

class Chunk {
  constructor () {
    this.chunks = new Array(16)
    for (let i = 0; i < this.chunks.length; i++) {
      this.chunks[i] = new SubChunk()
    }

    this.data = Buffer.alloc(BUFFER_SIZE)
    this.data.fill(0)

    // init biome id
    for (let j = 0; j < 256; j++) {
      this.data[j] = 1
    }
  }

  toJson () {
    return JSON.stringify({ data: this.data, sections: this.chunks.map(section => section.toJson()) })
  }

  static fromJson (j) {
    const parsed = JSON.parse(j)
    const chunk = new Chunk()
    chunk.data = parsed.data
    chunk.chunks = parsed.sections.map(s => SubChunk.fromJson(s))
    return chunk
  }

  initialize (iniFunc) {
    const p = new Vec3(0, 0, 0)
    for (p.y = 0; p.y < Chunk.h; p.y++) {
      for (p.z = 0; p.z < Chunk.w; p.z++) {
        for (p.x = 0; p.x < Chunk.l; p.x++) {
          const block = iniFunc(p.x, p.y, p.z)
          this.setBlock(p, block)
        }
      }
    }
  }

  getBlock (pos) {
    const block = new Block(this.getBlockType(pos), this.getBiome(pos), this.getBlockData(pos))
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
    const chunk = this.chunks[pos.y >> 4]
    return chunk ? chunk.getBlockType(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z)) : 0
  }

  setBlockType (pos, type) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk && chunk.setBlockType(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z), type)
  }

  getBlockData (pos) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk ? chunk.getBlockData(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z)) : 0
  }

  setBlockData (pos, data) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk && chunk.setBlockData(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z), data)
  }

  getBlockLight (pos) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk ? chunk.getBlockLight(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z)) : 0
  }

  setBlockLight (pos, light) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk && chunk.setBlockLight(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z), light)
  }

  getSkyLight (pos) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk ? chunk.getSkyLight(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z)) : 15
  }

  setSkyLight (pos, light) {
    const chunk = this.chunks[pos.y >> 4]
    return chunk && chunk.setSkyLight(new Vec3(pos.x, pos.y - 16 * (pos.y >> 4), pos.z), light)
  }

  getBiomeColor (pos) {
    return { x: 0, y: 0, z: 0 }
  }

  setBiomeColor (pos, r, g, b) {
    // no longer a feature ;(
  }

  getBiome (pos) {
    return this.data.readUInt8((pos.z << 4) + (pos.x))
  }

  setBiome (pos, id) {
    this.data.writeUInt8(id, (pos.z << 4) + (pos.x))
  }

  getHeight (pos) {
    return this.data.readUInt8((pos.z << 4) + (pos.x))
  }

  setHeight (pos, height) {
    this.data.writeUInt8(height, (pos.z << 4) + (pos.x))
  }

  load (newData) {
    if (!Buffer.isBuffer(newData)) { throw (new Error('Data must be a buffer')) }

    let offset = 0
    const numberOfChunks = newData.readUInt8(offset)
    offset += 1

    if (((numberOfChunks * 10241) + 1) > newData.length) {
      throw (new Error(`Data buffer not correct size (was ${newData.length}, expected ${3 + 256 + 512 + (16 * 10241)})`))
    }

    for (let i = 0; i < numberOfChunks; i++) {
      this.chunks[i].load(newData.slice(offset, offset + 10241))
      offset += 10241
    }

    // ignore the rest
  }

  size () {
    let size = 1 // count of subchunks (byte)
    size += this.chunks.length * 10241 // all of the chunks and their size
    size += HEIGHT_SIZE
    size += BIOME_ID_SIZE
    size += 1 // border block count (byte)
    size += 1 // signed varint block extradata count
    return size
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
    let offset = 0

    const exportData = Buffer.alloc(this.size())
    exportData.fill(0)

    exportData.writeUInt8(this.chunks.length, offset)
    offset += 1

    for (let i = 0; i < this.chunks.length; i++) {
      const dump = this.chunks[i].dump()
      dump.copy(exportData, offset)
      offset += dump.length
    }

    this.data.copy(exportData, offset)
    offset += this.data.length

    exportData.writeUInt8(0, offset) // border block count
    offset += 1

    exportData.writeUInt8(0, offset) // signed varint ?! (extdata count)
    offset += 1

    return exportData
  }

  getMask () {
    return 0xFFFF
  }
}
