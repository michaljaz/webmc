const BitArray = require('../common/BitArray')
const neededBits = require('../common/neededBits')
const constants = require('../common/constants')
const varInt = require('../common/varInt')

function getBlockIndex (pos) {
  return (pos.y << 8) | (pos.z << 4) | pos.x
}

class ChunkSection {
  constructor (options = {}) {
    if (options === null) {
      return
    }

    if (typeof options.solidBlockCount === 'undefined') {
      options.solidBlockCount = 0
      if (options.data) {
        for (let i = 0; i < constants.SECTION_VOLUME; i++) {
          if (options.data.get(i) !== 0) {
            options.solidBlockCount += 1
          }
        }
      }
    }

    if (!options.data) {
      options.data = new BitArray({
        bitsPerValue: 4,
        capacity: constants.SECTION_VOLUME
      })
    }

    if (!options.palette) {
      options.palette = [0]
    }

    if (!options.blockLight) {
      options.blockLight = new BitArray({
        bitsPerValue: 4,
        capacity: constants.SECTION_VOLUME
      })
    }

    if (!options.skyLight) {
      options.skyLight = new BitArray({
        bitsPerValue: 4,
        capacity: constants.SECTION_VOLUME
      })
    }

    this.data = options.data
    this.palette = options.palette
    this.isDirty = false
    this.blockLight = options.blockLight
    this.skyLight = options.skyLight
    this.solidBlockCount = options.solidBlockCount
  }

  toJson () {
    return JSON.stringify({
      data: this.data.toJson(),
      palette: this.palette,
      isDirty: this.isDirty,
      blockLight: this.blockLight.toJson(),
      skyLight: this.skyLight.toJson(),
      solidBlockCount: this.solidBlockCount
    })
  }

  static fromJson (j) {
    const parsed = JSON.parse(j)
    return new ChunkSection({
      data: BitArray.fromJson(parsed.data),
      palette: parsed.palette,
      blockLight: BitArray.fromJson(parsed.blockLight),
      skyLight: BitArray.fromJson(parsed.skyLight),
      solidBlockCount: parsed.solidBlockCount
    })
  }

  getBlock (pos) {
    // index in palette or block id
    // depending on if the global palette or the section palette is used
    let stateId = this.data.get(getBlockIndex(pos))

    if (this.palette !== null) {
      stateId = this.palette[stateId]
    }

    return stateId
  }

  setBlock (pos, stateId) {
    const blockIndex = getBlockIndex(pos)
    let palettedIndex
    if (this.palette !== null) {
      // if necessary, add the block to the palette
      const indexInPalette = this.palette.indexOf(stateId) // binarySearch(this.palette, stateId, cmp)
      if (indexInPalette >= 0) {
        // block already in our palette
        palettedIndex = indexInPalette
      } else {
        // get new block palette index
        this.palette.push(stateId)
        palettedIndex = this.palette.length - 1

        // check if resize is necessary
        const bitsPerValue = neededBits(palettedIndex)

        // if new block requires more bits than the current data array
        if (bitsPerValue > this.data.getBitsPerValue()) {
          // is value still enough for section palette
          if (bitsPerValue <= constants.MAX_BITS_PER_BLOCK) {
            this.data = this.data.resizeTo(bitsPerValue)
          } else {
            // switches to the global palette
            const newData = new BitArray({
              bitsPerValue: constants.GLOBAL_BITS_PER_BLOCK,
              capacity: constants.SECTION_VOLUME
            })
            for (let i = 0; i < constants.SECTION_VOLUME; i++) {
              const stateId = this.palette[this.data.get(i)]
              newData.set(i, stateId)
            }

            this.palette = null
            palettedIndex = stateId
            this.data = newData
          }
        }
      }
    } else {
      // uses global palette
      palettedIndex = stateId
    }

    const oldBlock = this.getBlock(pos)
    if (stateId === 0 && oldBlock !== 0) {
      this.solidBlockCount -= 1
    } else if (stateId !== 0 && oldBlock === 0) {
      this.solidBlockCount += 1
    }

    this.data.set(blockIndex, palettedIndex)
  }

  getBlockLight (pos) {
    return this.blockLight.get(getBlockIndex(pos))
  }

  getSkyLight (pos) {
    return this.skyLight.get(getBlockIndex(pos))
  }

  setBlockLight (pos, light) {
    return this.blockLight.set(getBlockIndex(pos), light)
  }

  setSkyLight (pos, light) {
    return this.skyLight.set(getBlockIndex(pos), light)
  }

  isEmpty () {
    return this.solidBlockCount === 0
  }

  // writes the complete section into a smart buffer object
  write (smartBuffer) {
    smartBuffer.writeUInt8(this.data.getBitsPerValue())

    // write palette
    if (this.palette !== null) {
      varInt.write(smartBuffer, this.palette.length)
      this.palette.forEach(paletteElement => {
        varInt.write(smartBuffer, paletteElement)
      })
    }

    // write the number of longs to be written
    varInt.write(smartBuffer, this.data.length())

    // write block data
    this.data.writeBuffer(smartBuffer)

    // write block light data
    this.blockLight.writeBuffer(smartBuffer)

    // write sky light data
    this.skyLight.writeBuffer(smartBuffer)
  }
}

module.exports = ChunkSection
