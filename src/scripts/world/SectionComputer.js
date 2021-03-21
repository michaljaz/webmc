const modulo = function (a, b) {
  return ((+a % (b = +b)) + b) % b
}

class BitArray {
  constructor (options) {
    if (options === null) {
      return
    }
    if (!options.bitsPerValue > 0) {
      console.error('bits per value must at least 1')
    }
    if (!(options.bitsPerValue <= 32)) {
      console.error('bits per value exceeds 32')
    }
    const valuesPerLong = Math.floor(64 / options.bitsPerValue)
    const length = Math.ceil(options.capacity / valuesPerLong)
    if (!options.data) {
      options.data = Array(length * 2).fill(0)
    }
    const valueMask = (1 << options.bitsPerValue) - 1
    this.data = options.data
    this.capacity = options.capacity
    this.bitsPerValue = options.bitsPerValue
    this.valuesPerLong = valuesPerLong
    this.valueMask = valueMask
  }

  get (index) {
    if (!(index >= 0 && index < this.capacity)) {
      console.error('index is out of bounds')
    }
    const startLongIndex = Math.floor(index / this.valuesPerLong)
    const indexInLong =
            (index - startLongIndex * this.valuesPerLong) * this.bitsPerValue
    if (indexInLong >= 32) {
      const indexInStartLong = indexInLong - 32
      const startLong = this.data[startLongIndex * 2 + 1]
      return (startLong >>> indexInStartLong) & this.valueMask
    }
    const startLong = this.data[startLongIndex * 2]
    const indexInStartLong = indexInLong
    let result = startLong >>> indexInStartLong
    const endBitOffset = indexInStartLong + this.bitsPerValue
    if (endBitOffset > 32) {
      const endLong = this.data[startLongIndex * 2 + 1]
      result |= endLong << (32 - indexInStartLong)
    }
    return result & this.valueMask
  }
}

const ChunkDecoder = class ChunkDecoder {
  getBlockIndex (pos) {
    return (pos.y << 8) | (pos.z << 4) | pos.x
  }

  cvo (voxelX, voxelY, voxelZ) {
    const x = modulo(voxelX, 16) | 0
    const y = modulo(voxelY, 16) | 0
    const z = modulo(voxelZ, 16) | 0
    return y * 16 * 16 + z * 16 + x
  }

  computeSections (packet) {
    const sections = packet.sections
    let num = 0
    const result = []
    for (let j = 0; j < sections.length; j++) {
      const i = sections[j]
      num += 1
      if (i !== null) {
        const palette = i.palette
        const data = new BitArray(i.data)
        const cell = new Uint32Array(16 * 16 * 16)
        for (let x = 0; x < 16; x++) {
          for (let y = 0; y < 16; y++) {
            for (let z = 0; z < 16; z++) {
              cell[this.cvo(x, y, z)] = palette[data.get(this.getBlockIndex({ x, y, z }))]
            }
          }
        }
        result.push({
          x: packet.x,
          y: num,
          z: packet.z,
          cell
        })
      } else {
        result.push(null)
      }
    }
    return result
  }
}

const cd = new ChunkDecoder()

const SectionComputer = function (data) {
  return cd.computeSections(data)
}

export { SectionComputer }
