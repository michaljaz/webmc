const assert = require('assert')
const neededBits = require('./neededBits')

class BitArray {
  constructor (options) {
    if (options === null) {
      return
    }
    assert(options.bitsPerValue > 0, 'bits per value must at least 1')
    assert(options.bitsPerValue <= 32, 'bits per value exceeds 32')

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

  toJson () {
    return JSON.stringify({
      data: this.data,
      capacity: this.capacity,
      bitsPerValue: this.bitsPerValue,
      valuesPerLong: this.valuesPerLong,
      valueMask: this.valueMask
    })
  }

  static fromJson (j) {
    const parsed = JSON.parse(j)
    const bitarray = new BitArray(null)
    bitarray.data = parsed.data
    bitarray.capacity = parsed.capacity
    bitarray.bitsPerValue = parsed.bitsPerValue
    bitarray.valuesPerLong = parsed.valuesPerLong
    bitarray.valueMask = parsed.valueMask
    return bitarray
  }

  get (index) {
    assert(index >= 0 && index < this.capacity, 'index is out of bounds')

    const startLongIndex = Math.floor(index / this.valuesPerLong)
    const indexInLong = (index - startLongIndex * this.valuesPerLong) * this.bitsPerValue
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
      // Value stretches across multiple longs
      const endLong = this.data[startLongIndex * 2 + 1]
      result |= endLong << (32 - indexInStartLong)
    }
    return result & this.valueMask
  }

  set (index, value) {
    assert(index >= 0 && index < this.capacity, 'index is out of bounds')
    assert(value <= this.valueMask, 'value does not fit into bits per value')

    const startLongIndex = Math.floor(index / this.valuesPerLong)
    const indexInLong = (index - startLongIndex * this.valuesPerLong) * this.bitsPerValue
    if (indexInLong >= 32) {
      const indexInStartLong = indexInLong - 32
      this.data[startLongIndex * 2 + 1] =
      ((this.data[startLongIndex * 2 + 1] & ~(this.valueMask << indexInStartLong)) |
      ((value & this.valueMask) << indexInStartLong)) >>> 0
      return
    }
    const indexInStartLong = indexInLong

    // Clear bits of this value first
    this.data[startLongIndex * 2] =
      ((this.data[startLongIndex * 2] & ~(this.valueMask << indexInStartLong)) |
      ((value & this.valueMask) << indexInStartLong)) >>> 0
    const endBitOffset = indexInStartLong + this.bitsPerValue
    if (endBitOffset > 32) {
      // Value stretches across multiple longs
      this.data[startLongIndex * 2 + 1] =
        ((this.data[startLongIndex * 2 + 1] &
          ~((1 << (endBitOffset - 32)) - 1)) |
        (value >> (32 - indexInStartLong))) >>> 0
    }
  }

  resizeTo (newBitsPerValue) {
    assert(newBitsPerValue > 0, 'bits per value must at least 1')
    assert(newBitsPerValue <= 32, 'bits per value exceeds 32')

    const newArr = new BitArray({
      bitsPerValue: newBitsPerValue,
      capacity: this.capacity
    })
    for (let i = 0; i < this.capacity; ++i) {
      const value = this.get(i)
      if (neededBits(value) > newArr.getBitsPerValue()) {
        throw new Error(
          "existing value in BitArray can't fit in new bits per value"
        )
      }
      newArr.set(i, value)
    }

    return newArr
  }

  length () {
    return this.data.length / 2
  }

  readBuffer (smartBuffer) {
    for (let i = 0; i < this.data.length; i += 2) {
      this.data[i + 1] = smartBuffer.readUInt32BE()
      this.data[i] = smartBuffer.readUInt32BE()
    }
    return this
  }

  writeBuffer (smartBuffer) {
    for (let i = 0; i < this.data.length; i += 2) {
      smartBuffer.writeUInt32BE(this.data[i + 1])
      smartBuffer.writeUInt32BE(this.data[i])
    }
    return this
  }

  getBitsPerValue () {
    return this.bitsPerValue
  }
}

module.exports = BitArray
