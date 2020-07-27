const Section = require('./section')
const Vec3 = require('vec3').Vec3

const w = Section.w
const l = Section.l
const sh = Section.sh// section height
const sectionCount = 16
const h = sh * sectionCount

const BIOME_SIZE = w * l

module.exports = loader

function loader (mcVersion) {
  Block = require('prismarine-block')(mcVersion)
  Chunk.w = w
  Chunk.l = l
  Chunk.h = h
  return Chunk
}

let Block

const exists = function (val) {
  return val !== undefined
}

const getBiomeCursor = function (pos) {
  return (pos.z * w) + pos.x
}

function posInSection (pos) {
  return pos.modulus(new Vec3(w, l, sh))
}

function parseBitMap (bitMap) {
  const chunkIncluded = new Array(sectionCount)
  let chunkCount = 0
  for (let y = 0; y < sectionCount; ++y) {
    chunkIncluded[y] = bitMap & (1 << y)
    if (chunkIncluded[y]) chunkCount++
  }
  return { chunkIncluded, chunkCount }
}

class Chunk {
  constructor () {
    this.skyLightSent = true
    this.sections = new Array(sectionCount)
    for (let i = 0; i < sectionCount; i++) { this.sections[i] = new Section() }
    this.biome = Buffer.alloc(BIOME_SIZE)
    this.biome.fill(0)
  }

  toJson () {
    return JSON.stringify({ skyLightSent: this.skyLightSent, biome: this.biome.toJSON(), sections: this.sections.map(section => section.toJson()) })
  }

  static fromJson (j) {
    const parsed = JSON.parse(j)
    const chunk = new Chunk()
    chunk.skyLightSent = parsed.skyLightSent
    chunk.biome = Buffer.from(parsed.biome)
    chunk.sections = parsed.sections.map(s => Section.fromJson(s))
    return chunk
  }

  initialize (iniFunc) {
    let biome = 0
    for (let i = 0; i < sectionCount; i++) {
      this.sections[i].initialize((x, y, z, n) => {
        const block = iniFunc(x, y % sh, z, n)
        if (block == null) { return }
        if (y === 0 && sectionCount === 0) {
          this.biome.writeUInt8(block.biome.id || 0, biome)
          biome++
        }
      })
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

  getBiomeColor (pos) {
    return {
      r: 0,
      g: 0,
      b: 0
    }
  }

  setBiomeColor (pos, r, g, b) {

  }

  _getSection (pos) {
    return this.sections[pos.y >> 4]
  }

  getBlockStateId (pos) {
    const section = this._getSection(pos)
    return section ? section.getBlockStateId(posInSection(pos)) : 0
  }

  getBlockType (pos) {
    const section = this._getSection(pos)
    return section ? section.getBlockType(posInSection(pos)) : 0
  }

  getBlockData (pos) {
    const section = this._getSection(pos)
    return section ? section.getBlockData(posInSection(pos)) : 0
  }

  getBlockLight (pos) {
    const section = this._getSection(pos)
    return section ? section.getBlockLight(posInSection(pos)) : 0
  }

  getSkyLight (pos) {
    if (!this.skyLightSent) return 0
    const section = this._getSection(pos)
    return section ? section.getSkyLight(posInSection(pos)) : 15
  }

  getBiome (pos) {
    const cursor = getBiomeCursor(pos)
    return this.biome.readUInt8(cursor)
  }

  setBlockStateId (pos, stateId) {
    const section = this._getSection(pos)
    return section && section.setBlockStateId(posInSection(pos), stateId)
  }

  setBlockType (pos, id) {
    const data = this.getBlockData(pos)
    this.setBlockStateId(pos, (id << 4) | data)
  }

  setBlockData (pos, data) {
    const id = this.getBlockType(pos)
    this.setBlockStateId(pos, (id << 4) | data)
  }

  setBlockLight (pos, light) {
    const section = this._getSection(pos)
    return section && section.setBlockLight(posInSection(pos), light)
  }

  setSkyLight (pos, light) {
    const section = this._getSection(pos)
    return section && section.setSkyLight(posInSection(pos), light)
  }

  setBiome (pos, biome) {
    const cursor = getBiomeCursor(pos)
    this.biome.writeUInt8(biome, cursor)
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

  dump (bitMap = 0xFFFF, skyLightSent = true) {
    const SECTION_SIZE = Section.sectionSize(this.skyLightSent && skyLightSent)

    const { chunkIncluded, chunkCount } = parseBitMap(bitMap)
    const bufferLength = chunkCount * SECTION_SIZE + BIOME_SIZE
    const buffer = Buffer.alloc(bufferLength)
    let offset = 0
    let offsetLight = w * l * sectionCount * chunkCount * 2
    let offsetSkyLight = (this.skyLightSent && skyLightSent) ? w * l * sectionCount * chunkCount / 2 * 5 : undefined
    for (let i = 0; i < sectionCount; i++) {
      if (chunkIncluded[i]) {
        offset += this.sections[i].dump().copy(buffer, offset, 0, w * l * sh * 2)
        offsetLight += this.sections[i].dump().copy(buffer, offsetLight, w * l * sh * 2, w * l * sh * 2 + w * l * sh / 2)
        if (this.skyLightSent && skyLightSent) offsetSkyLight += this.sections[i].dump().copy(buffer, offsetSkyLight, w * l * sh / 2 * 5, w * l * sh / 2 * 5 + w * l * sh / 2)
      }
    }
    this.biome.copy(buffer, w * l * sectionCount * chunkCount * ((this.skyLightSent && skyLightSent) ? 3 : 5 / 2))
    return buffer
  }

  load (data, bitMap = 0xFFFF, skyLightSent = true, fullChunk = true) {
    if (!Buffer.isBuffer(data)) { throw (new Error('Data must be a buffer')) }

    this.skyLightSent = skyLightSent

    const SECTION_SIZE = Section.sectionSize(skyLightSent)

    const { chunkIncluded, chunkCount } = parseBitMap(bitMap)
    let offset = 0
    let offsetLight = w * l * sectionCount * chunkCount * 2
    let offsetSkyLight = (this.skyLightSent) ? w * l * sectionCount * chunkCount / 2 * 5 : undefined
    for (let i = 0; i < sectionCount; i++) {
      if (chunkIncluded[i]) {
        const sectionBuffer = Buffer.alloc(SECTION_SIZE)
        offset += data.copy(sectionBuffer, 0, offset, offset + w * l * sh * 2)
        offsetLight += data.copy(sectionBuffer, w * l * sh * 2, offsetLight, offsetLight + w * l * sh / 2)
        if (this.skyLightSent) offsetSkyLight += data.copy(sectionBuffer, w * l * sh * 5 / 2, offsetLight, offsetSkyLight + w * l * sh / 2)
        this.sections[i].load(sectionBuffer, skyLightSent)
      }
    }
    if (fullChunk) {
      data.copy(this.biome, w * l * sectionCount * chunkCount * (skyLightSent ? 3 : 5 / 2))
    }

    const expectedSize = SECTION_SIZE * chunkCount + (fullChunk ? w * l : 0)
    if (data.length !== expectedSize) { throw (new Error(`Data buffer not correct size (was ${data.length}, expected ${expectedSize})`)) }
  }

  getMask () {
    return 0xFFFF
  }
}
