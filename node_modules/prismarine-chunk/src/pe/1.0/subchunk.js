'use strict'

const readUInt4LE = require('uint4').readUInt4LE
const writeUInt4LE = require('uint4').writeUInt4LE

const BLOCK_SIZE = 16 * 16 * 16
const METADATA_SIZE = (16 * 16 * 16) / 2
const SKYLIGHT_SIZE = (16 * 16 * 16) / 2
const BLOCKLIGHT_SIZE = (16 * 16 * 16) / 2
const BUFFER_SIZE = 1 + (BLOCK_SIZE + METADATA_SIZE + BLOCKLIGHT_SIZE + SKYLIGHT_SIZE)

function getIndex (pos) {
  return 1 + ((pos.x * 256) + (pos.z * 16) + pos.y) // 1 + is for the version code :P
}

class SubChunk {
  constructor () {
    this.data = Buffer.alloc(BUFFER_SIZE)
    this.data.fill(0)
  }

  toJson () {
    return JSON.stringify({ data: this.data.toJSON() })
  }

  static fromJson (j) {
    const parsed = JSON.parse(j)
    const chunk = new SubChunk()
    chunk.data = Buffer.from(parsed.data)
    return chunk
  }

  getBlockType (pos) {
    return this.data.readUInt8(getIndex(pos))
  }

  setBlockType (pos, type) {
    this.data.writeUInt8(type, getIndex(pos))
  }

  getBlockLight (pos) {
    return readUInt4LE(this.data, BLOCK_SIZE + METADATA_SIZE + SKYLIGHT_SIZE + (getIndex(pos) / 2))
  }

  setBlockLight (pos, light) {
    writeUInt4LE(this.data, light, BLOCK_SIZE + METADATA_SIZE + SKYLIGHT_SIZE + (getIndex(pos) / 2))
  }

  getSkyLight (pos) {
    return readUInt4LE(this.data, BLOCK_SIZE + METADATA_SIZE + (getIndex(pos) / 2))
  }

  setSkyLight (pos, light) {
    writeUInt4LE(this.data, light, BLOCK_SIZE + METADATA_SIZE + (getIndex(pos) / 2))
  }

  getBlockData (pos) {
    return readUInt4LE(this.data, BLOCK_SIZE + (getIndex(pos) / 2))
  }

  setBlockData (pos, data) {
    writeUInt4LE(this.data, data, BLOCK_SIZE + (getIndex(pos) / 2))
  }

  load (data) {
    if (!Buffer.isBuffer(data)) { throw (new Error('Data must be a buffer')) }
    if (data.length !== BUFFER_SIZE) { throw (new Error(`Data buffer not correct size (was ${data.length}, expected ${BUFFER_SIZE})`)) }
    this.data = data
  }

  dump () {
    return this.data
  }
}

module.exports = SubChunk
