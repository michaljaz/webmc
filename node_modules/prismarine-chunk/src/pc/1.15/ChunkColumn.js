const SmartBuffer = require('smart-buffer').SmartBuffer
const ChunkSection = require('./ChunkSection')
const constants = require('../common/constants')
const varInt = require('../common/varInt')

const BitArray = require('../common/BitArray')

// wrap with func to provide version specific Block
module.exports = (Block, mcData) => {
  return class ChunkColumn {
    constructor () {
      this.sectionMask = 0
      this.sections = Array(constants.NUM_SECTIONS).fill(null)
      this.biomes = Array(4 * 4 * 64).fill(127)
      this.skyLightMask = 0
      this.blockLightMask = 0
      this.skyLightSections = Array(constants.NUM_SECTIONS + 2).fill(null)
      this.blockLightSections = Array(constants.NUM_SECTIONS + 2).fill(null)
    }

    toJson () {
      return JSON.stringify({
        biomes: this.biomes,
        sectionMask: this.sectionMask,
        sections: this.sections.map(section => section === null ? null : section.toJson()),
        skyLightMask: this.skyLightMask,
        blockLightMask: this.blockLightMask,
        skyLightSections: this.skyLightSections.map(section => section === null ? null : section.toJson()),
        blockLightSections: this.blockLightSections.map(section => section === null ? null : section.toJson())
      })
    }

    static fromJson (j) {
      const parsed = JSON.parse(j)
      const chunk = new ChunkColumn()
      chunk.biomes = parsed.biomes
      chunk.sectionMask = parsed.sectionMask
      chunk.sections = parsed.sections.map(s => s === null ? null : ChunkSection.fromJson(s))
      chunk.skyLightMask = parsed.skyLightMask
      chunk.blockLightMask = parsed.blockLightMask
      chunk.skyLightSections = parsed.skyLightSections.map(s => s === null ? null : BitArray.fromJson(s))
      chunk.blockLightSections = parsed.blockLightSections.map(s => s === null ? null : BitArray.fromJson(s))
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
      const section = this.blockLightSections[getLightSectionIndex(pos)]
      return section ? section.get(getSectionBlockIndex(pos)) : 0
    }

    getSkyLight (pos) {
      const section = this.skyLightSections[getLightSectionIndex(pos)]
      return section ? section.get(getSectionBlockIndex(pos)) : 0
    }

    getBiome (pos) {
      if (pos.y < 0 || pos.y >= 256) return 0
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
      const sectionIndex = getLightSectionIndex(pos)
      let section = this.blockLightSections[sectionIndex]

      if (section === null) {
        if (light === 0) {
          return
        }
        section = new BitArray({
          bitsPerValue: 4,
          capacity: 4096
        })
        this.blockLightMask |= 1 << sectionIndex
        this.blockLightSections[sectionIndex] = section
      }

      section.set(getSectionBlockIndex(pos), light)
    }

    setSkyLight (pos, light) {
      const sectionIndex = getLightSectionIndex(pos)
      let section = this.skyLightSections[sectionIndex]

      if (section === null) {
        if (light === 0) {
          return
        }
        section = new BitArray({
          bitsPerValue: 4,
          capacity: 4096
        })
        this.skyLightMask |= 1 << sectionIndex
        this.skyLightSections[sectionIndex] = section
      }

      section.set(getSectionBlockIndex(pos), light)
    }

    setBiome (pos, biome) {
      if (pos.y < 0 || pos.y >= 256) return
      this.biomes[getBiomeIndex(pos)] = biome
    }

    setBiomeColor (pos, r, g, b) {
      // TODO
    }

    getMask () {
      return this.sectionMask
    }

    dump () {
      const smartBuffer = new SmartBuffer()
      this.sections.forEach((section, i) => {
        if (section !== null && !section.isEmpty()) {
          section.write(smartBuffer)
        }
      })
      return smartBuffer.toBuffer()
    }

    loadBiomes (biomes) {
      this.biomes = biomes
    }

    dumpBiomes (biomes) {
      return this.biomes
    }

    load (data, bitMap = 0xffff) {
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

        const solidBlockCount = reader.readInt16BE()

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
        varInt.read(reader) // numLongs
        const dataArray = new BitArray({
          bitsPerValue: bitsPerBlock,
          capacity: 4096
        }).readBuffer(reader)

        const section = new ChunkSection({
          data: dataArray,
          palette,
          solidBlockCount
        })
        this.sections[y] = section
      }
    }

    loadLight (data, skyLightMask, blockLightMask, emptySkyLightMask = 0, emptyBlockLightMask = 0) {
      const reader = SmartBuffer.fromBuffer(data)

      // Read sky light
      this.skyLightMask |= skyLightMask
      for (let y = 0; y < constants.NUM_SECTIONS + 2; y++) {
        if (!((skyLightMask >> y) & 1)) {
          continue
        }
        varInt.read(reader) // always 2048
        this.skyLightSections[y] = new BitArray({
          bitsPerValue: 4,
          capacity: 4096
        }).readBuffer(reader)
      }

      // Read block light
      this.blockLightMask |= blockLightMask
      for (let y = 0; y < constants.NUM_SECTIONS + 2; y++) {
        if (!((blockLightMask >> y) & 1)) {
          continue
        }
        varInt.read(reader) // always 2048
        this.blockLightSections[y] = new BitArray({
          bitsPerValue: 4,
          capacity: 4096
        }).readBuffer(reader)
      }
    }

    dumpLight () {
      const smartBuffer = new SmartBuffer()

      this.skyLightSections.forEach((section, i) => {
        if (section !== null) {
          varInt.write(smartBuffer, 2048)
          section.writeBuffer(smartBuffer)
        }
      })

      this.blockLightSections.forEach((section, i) => {
        if (section !== null) {
          varInt.write(smartBuffer, 2048)
          section.writeBuffer(smartBuffer)
        }
      })

      return smartBuffer.toBuffer()
    }
  }
}

function getSectionIndex (pos) {
  return Math.floor(pos.y / 16)
}

function getLightSectionIndex (pos) {
  return Math.floor(pos.y / 16) + 1
}

function getBiomeIndex (pos) {
  return ((pos.y >> 2) & 63) << 4 | ((pos.z >> 2) & 3) << 2 | ((pos.x >> 2) & 3)
}

function toSectionPos (pos) {
  return { x: pos.x, y: pos.y & 15, z: pos.z }
}

function getSectionBlockIndex (pos) {
  return ((pos.y & 15) << 8) | (pos.z << 4) | pos.x
}
