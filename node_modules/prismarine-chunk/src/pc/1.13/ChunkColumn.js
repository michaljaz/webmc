const SmartBuffer = require('smart-buffer').SmartBuffer
const ChunkSection = require('./ChunkSection')
const constants = require('../common/constants')
const BitArray = require('../common/BitArray')
const varInt = require('../common/varInt')

// wrap with func to provide version specific Block
module.exports = (Block, mcData) => {
  return class ChunkColumn {
    constructor () {
      this.sectionMask = 0
      this.sections = Array(constants.NUM_SECTIONS).fill(null)
      this.biomes = Array(
        constants.SECTION_WIDTH * constants.SECTION_WIDTH
      ).fill(1)
    }

    toJson () {
      return JSON.stringify({
        biomes: this.biomes,
        sectionMask: this.sectionMask,
        sections: this.sections.map(section => section === null ? null : section.toJson())
      })
    }

    static fromJson (j) {
      const parsed = JSON.parse(j)
      const chunk = new ChunkColumn()
      chunk.biomes = parsed.biomes
      chunk.sectionMask = parsed.sectionMask
      chunk.sections = parsed.sections.map(s => s === null ? null : ChunkSection.fromJson(s))
      return chunk
    }

    initialize (func) {
      const p = { x: 0, y: 0, z: 0 }
      for (p.y = 0; p.y < constants.CHUNK_HEIGHT; p.y++) {
        for (p.z = 0; p.z < constants.SECTION_WIDTH; p.z++) {
          for (p.x = 0; p.x < constants.SECTION_WIDTH; p.x++) {
            const block = func(p.x, p.y, p.z)
            this.setBlock(p, block)
          }
        }
      }
    }

    getBlock (pos) {
      const section = this.sections[getSectionIndex(pos)]
      const biome = this.getBiome(pos)
      if (!section) {
        return Block.fromStateId(0, biome)
      }
      const stateId = section.getBlock(toSectionPos(pos))
      const block = Block.fromStateId(stateId, biome)
      block.light = this.getBlockLight(pos)
      block.skyLight = this.getSkyLight(pos)
      return block
    }

    setBlock (pos, block) {
      if (typeof block.stateId !== 'undefined') {
        this.setBlockStateId(pos, block.stateId)
      }
      if (typeof block.biome !== 'undefined') {
        this.setBiome(pos, block.biome.id)
      }
      if (typeof block.skyLight !== 'undefined') {
        this.setSkyLight(pos, block.skyLight)
      }
      if (typeof block.light !== 'undefined') {
        this.setBlockLight(pos, block.light)
      }
    }

    getBlockType (pos) {
      const blockStateId = this.getBlockStateId(pos)
      return mcData.blocksByStateId[blockStateId].id
    }

    getBlockData (pos) {
      const blockStateId = this.getBlockStateId(pos)
      return mcData.blocksByStateId[blockStateId].metadata
    }

    getBlockStateId (pos) {
      const section = this.sections[getSectionIndex(pos)]
      return section ? section.getBlock(toSectionPos(pos)) : 0
    }

    getBlockLight (pos) {
      const section = this.sections[getSectionIndex(pos)]
      return section ? section.getBlockLight(toSectionPos(pos)) : 15
    }

    getSkyLight (pos) {
      const section = this.sections[getSectionIndex(pos)]
      return section ? section.getSkyLight(toSectionPos(pos)) : 15
    }

    getBiome (pos) {
      return this.biomes[getBiomeIndex(pos)]
    }

    getBiomeColor (pos) {
      // TODO
      return { r: 0, g: 0, b: 0 }
    }

    setBlockType (pos, id) {
      this.setBlockStateId(pos, mcData.blocks[id].minStateId)
    }

    setBlockData (pos, data) {
      this.setBlockStateId(pos, mcData.blocksByStateId[this.getBlockStateId(pos)].minStateId + data)
    }

    setBlockStateId (pos, stateId) {
      const sectionIndex = getSectionIndex(pos)
      if (sectionIndex < 0 || sectionIndex >= 16) return

      let section = this.sections[sectionIndex]
      if (!section) {
        // if it's air
        if (stateId === 0) {
          return
        }
        section = new ChunkSection()
        this.sectionMask |= 1 << sectionIndex
        this.sections[sectionIndex] = section
      }

      section.setBlock(toSectionPos(pos), stateId)
    }

    setBlockLight (pos, light) {
      const section = this.sections[getSectionIndex(pos)]
      return section && section.setBlockLight(toSectionPos(pos), light)
    }

    setSkyLight (pos, light) {
      const section = this.sections[getSectionIndex(pos)]
      return section && section.setSkyLight(toSectionPos(pos), light)
    }

    setBiome (pos, biome) {
      this.biomes[getBiomeIndex(pos)] = biome
    }

    setBiomeColor (pos, r, g, b) {
      // TODO
    }

    getMask () {
      return this.sectionMask
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
      const smartBuffer = new SmartBuffer()
      this.sections.forEach((section, i) => {
        if (section !== null && !section.isEmpty()) {
          section.write(smartBuffer)
        }
      })

      // write biome data
      this.biomes.forEach(biome => {
        smartBuffer.writeInt32BE(biome)
      })

      return smartBuffer.toBuffer()
    }

    load (data, bitMap = 0xffff, skyLightSent = true, fullChunk = true) {
      // make smartbuffer from node buffer
      // so that we doesn't need to maintain a cursor
      const reader = SmartBuffer.fromBuffer(data)

      this.sectionMask |= bitMap
      for (let y = 0; y < constants.NUM_SECTIONS; ++y) {
        // does `data` contain this chunk?
        if (!((bitMap >> y) & 1)) {
          // we can skip write a section if it isn't requested
          continue
        }

        // keep temporary palette
        let palette
        let skyLight

        // get number of bits a palette item use
        const bitsPerBlock = reader.readUInt8()

        // check if the section uses a section palette
        if (bitsPerBlock <= constants.MAX_BITS_PER_BLOCK) {
          palette = []
          // get number of palette items
          const numPaletteItems = varInt.read(reader)

          // save each palette item
          for (let i = 0; i < numPaletteItems; ++i) {
            palette.push(varInt.read(reader))
          }
        } else {
          // global palette is used
          palette = null
        }

        // number of items in data array
        const numLongs = varInt.read(reader)
        const dataArray = new BitArray({
          bitsPerValue: Math.ceil((numLongs * 64) / 4096),
          capacity: 4096
        }).readBuffer(reader)

        const blockLight = new BitArray({
          bitsPerValue: 4,
          capacity: 4096
        }).readBuffer(reader)

        if (skyLightSent) {
          skyLight = new BitArray({
            bitsPerValue: 4,
            capacity: 4096
          }).readBuffer(reader)
        }

        const section = new ChunkSection({
          data: dataArray,
          palette,
          blockLight,
          ...(skyLightSent ? { skyLight } : {})
        })
        this.sections[y] = section
      }

      // read biomes
      if (fullChunk) {
        const p = { x: 0, y: 0, z: 0 }
        for (p.z = 0; p.z < constants.SECTION_WIDTH; p.z++) {
          for (p.x = 0; p.x < constants.SECTION_WIDTH; p.x++) {
            this.setBiome(p, reader.readInt32BE())
          }
        }
      }
    }
  }
}

function getSectionIndex (pos) {
  return Math.floor(pos.y / 16)
}

function getBiomeIndex (pos) {
  return (pos.z * 16) | pos.x
}

function toSectionPos (pos) {
  return { x: pos.x, y: pos.y & 15, z: pos.z }
}
