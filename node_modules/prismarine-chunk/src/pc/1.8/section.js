const { readUInt4LE, writeUInt4LE } = require('uint4')

const w = 16
const l = 16
const sh = 16// section height

const getArrayPosition = function (pos) {
  return pos.x + w * (pos.z + l * pos.y)
}

const getBlockCursor = function (pos) {
  return getArrayPosition(pos) * 2.0
}

const getBlockLightCursor = function (pos) {
  return getArrayPosition(pos) * 0.5 + w * l * sh * 2
}

const getSkyLightCursor = function (pos) {
  return getArrayPosition(pos) * 0.5 + w * l * sh / 2 * 5
}

class Section {
  constructor (skyLightSent = true) {
    const SECTION_SIZE = Section.sectionSize(skyLightSent)

    this.data = Buffer.alloc(SECTION_SIZE)
    this.data.fill(0)
  }

  toJson () {
    return this.data.toJSON()
  }

  static fromJson (j) {
    const section = new Section()
    section.data = Buffer.from(j)
    return section
  }

  static sectionSize (skyLightSent = true) {
    return (w * l * sh) * (skyLightSent ? 3 : 5 / 2)
  }

  initialize (iniFunc) {
    const skylight = w * l * sh / 2 * 5
    const light = w * l * sh * 2
    let n = 0
    for (let y = 0; y < sh; y++) {
      for (let z = 0; z < w; z++) {
        for (let x = 0; x < l; x++, n++) {
          const block = iniFunc(x, y, z, n)
          if (block == null) { continue }
          this.data.writeUInt16LE(block.type << 4 | block.metadata, n * 2)
          writeUInt4LE(this.data, block.light, n * 0.5 + light)
          writeUInt4LE(this.data, block.skyLight, n * 0.5 + skylight)
        }
      }
    }
  }

  getBiomeColor (pos) {
    return {
      r: 0,
      g: 0,
      b: 0
    }
  }

  setBiomeColor (pos, r, g, b) {

  }

  getBlockStateId (pos) {
    const cursor = getBlockCursor(pos)
    return this.data.readUInt16LE(cursor)
  }

  getBlockType (pos) {
    const cursor = getBlockCursor(pos)
    return this.data.readUInt16LE(cursor) >> 4
  }

  getBlockData (pos) {
    const cursor = getBlockCursor(pos)
    return this.data.readUInt16LE(cursor) & 15
  }

  getBlockLight (pos) {
    const cursor = getBlockLightCursor(pos)
    return readUInt4LE(this.data, cursor)
  }

  getSkyLight (pos) {
    const cursor = getSkyLightCursor(pos)
    return readUInt4LE(this.data, cursor)
  }

  setBlockStateId (pos, stateId) {
    const cursor = getBlockCursor(pos)
    this.data.writeUInt16LE(stateId, cursor)
  }

  setBlockType (pos, id) {
    const cursor = getBlockCursor(pos)
    const data = this.getBlockData(pos)
    this.data.writeUInt16LE((id << 4) | data, cursor)
  }

  setBlockData (pos, data) {
    const cursor = getBlockCursor(pos)
    const id = this.getBlockType(pos)
    this.data.writeUInt16LE((id << 4) | data, cursor)
  }

  setBlockLight (pos, light) {
    const cursor = getBlockLightCursor(pos)
    writeUInt4LE(this.data, light, cursor)
  }

  setSkyLight (pos, light) {
    const cursor = getSkyLightCursor(pos)
    writeUInt4LE(this.data, light, cursor)
  }

  dump () {
    return this.data
  }

  load (data, skyLightSent = true) {
    const SECTION_SIZE = Section.sectionSize(skyLightSent)

    if (!Buffer.isBuffer(data)) { throw (new Error('Data must be a buffer')) }
    if (data.length !== SECTION_SIZE) { throw (new Error(`Data buffer not correct size (was ${data.length}, expected ${SECTION_SIZE})`)) }
    this.data = data
  }
}

Section.w = w
Section.l = l
Section.sh = sh

module.exports = Section
