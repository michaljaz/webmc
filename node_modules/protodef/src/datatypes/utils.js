const assert = require('assert')

const { getCount, sendCount, calcCount, PartialReadError } = require('../utils')

module.exports = {
  'varint': [readVarInt, writeVarInt, sizeOfVarInt, require('../../ProtoDef/schemas/utils.json')['varint']],
  'bool': [readBool, writeBool, 1, require('../../ProtoDef/schemas/utils.json')['bool']],
  'pstring': [readPString, writePString, sizeOfPString, require('../../ProtoDef/schemas/utils.json')['pstring']],
  'buffer': [readBuffer, writeBuffer, sizeOfBuffer, require('../../ProtoDef/schemas/utils.json')['buffer']],
  'void': [readVoid, writeVoid, 0, require('../../ProtoDef/schemas/utils.json')['void']],
  'bitfield': [readBitField, writeBitField, sizeOfBitField, require('../../ProtoDef/schemas/utils.json')['bitfield']],
  'cstring': [readCString, writeCString, sizeOfCString, require('../../ProtoDef/schemas/utils.json')['cstring']],
  'mapper': [readMapper, writeMapper, sizeOfMapper, require('../../ProtoDef/schemas/utils.json')['mapper']]
}

function mapperEquality (a, b) {
  return a === b || parseInt(a) === parseInt(b)
}

function readMapper (buffer, offset, { type, mappings }, rootNode) {
  const { size, value } = this.read(buffer, offset, type, rootNode)
  let mappedValue = null
  const keys = Object.keys(mappings)
  for (let i = 0; i < keys.length; i++) {
    if (mapperEquality(keys[i], value)) {
      mappedValue = mappings[keys[i]]
      break
    }
  }
  if (mappedValue == null) throw new Error(value + ' is not in the mappings value')
  return {
    size: size,
    value: mappedValue
  }
}

function writeMapper (value, buffer, offset, { type, mappings }, rootNode) {
  const keys = Object.keys(mappings)
  let mappedValue = null
  for (let i = 0; i < keys.length; i++) {
    if (mapperEquality(mappings[keys[i]], value)) {
      mappedValue = keys[i]
      break
    }
  }
  if (mappedValue == null) throw new Error(value + ' is not in the mappings value')
  return this.write(mappedValue, buffer, offset, type, rootNode)
}

function sizeOfMapper (value, { type, mappings }, rootNode) {
  const keys = Object.keys(mappings)
  let mappedValue = null
  for (let i = 0; i < keys.length; i++) {
    if (mapperEquality(mappings[keys[i]], value)) {
      mappedValue = keys[i]
      break
    }
  }
  if (mappedValue == null) throw new Error(value + ' is not in the mappings value')
  return this.sizeOf(mappedValue, type, rootNode)
}

function readVarInt (buffer, offset) {
  let result = 0
  let shift = 0
  let cursor = offset

  while (true) {
    if (cursor + 1 > buffer.length) { throw new PartialReadError() }
    const b = buffer.readUInt8(cursor)
    result |= ((b & 0x7f) << shift) // Add the bits to our number, except MSB
    cursor++
    if (!(b & 0x80)) { // If the MSB is not set, we return the number
      return {
        value: result,
        size: cursor - offset
      }
    }
    shift += 7 // we only have 7 bits, MSB being the return-trigger
    assert.ok(shift < 64, 'varint is too big') // Make sure our shift don't overflow.
  }
}

function sizeOfVarInt (value) {
  let cursor = 0
  while (value & ~0x7F) {
    value >>>= 7
    cursor++
  }
  return cursor + 1
}

function writeVarInt (value, buffer, offset) {
  let cursor = 0
  while (value & ~0x7F) {
    buffer.writeUInt8((value & 0xFF) | 0x80, offset + cursor)
    cursor++
    value >>>= 7
  }
  buffer.writeUInt8(value, offset + cursor)
  return offset + cursor + 1
}

function readPString (buffer, offset, typeArgs, rootNode) {
  const { size, count } = getCount.call(this, buffer, offset, typeArgs, rootNode)
  const cursor = offset + size
  const strEnd = cursor + count
  if (strEnd > buffer.length) {
    throw new PartialReadError('Missing characters in string, found size is ' + buffer.length +
    ' expected size was ' + strEnd)
  }

  return {
    value: buffer.toString('utf8', cursor, strEnd),
    size: strEnd - offset
  }
}

function writePString (value, buffer, offset, typeArgs, rootNode) {
  const length = Buffer.byteLength(value, 'utf8')
  offset = sendCount.call(this, length, buffer, offset, typeArgs, rootNode)
  buffer.write(value, offset, length, 'utf8')
  return offset + length
}

function sizeOfPString (value, typeArgs, rootNode) {
  const length = Buffer.byteLength(value, 'utf8')
  const size = calcCount.call(this, length, typeArgs, rootNode)
  return size + length
}

function readBool (buffer, offset) {
  if (offset + 1 > buffer.length) throw new PartialReadError()
  const value = buffer.readInt8(offset)
  return {
    value: !!value,
    size: 1
  }
}

function writeBool (value, buffer, offset) {
  buffer.writeInt8(+value, offset)
  return offset + 1
}

function readBuffer (buffer, offset, typeArgs, rootNode) {
  const { size, count } = getCount.call(this, buffer, offset, typeArgs, rootNode)
  offset += size
  if (offset + count > buffer.length) throw new PartialReadError()
  return {
    value: buffer.slice(offset, offset + count),
    size: size + count
  }
}

function writeBuffer (value, buffer, offset, typeArgs, rootNode) {
  offset = sendCount.call(this, value.length, buffer, offset, typeArgs, rootNode)
  value.copy(buffer, offset)
  return offset + value.length
}

function sizeOfBuffer (value, typeArgs, rootNode) {
  const size = calcCount.call(this, value.length, typeArgs, rootNode)
  return size + value.length
}

function readVoid () {
  return {
    value: undefined,
    size: 0
  }
}

function writeVoid (value, buffer, offset) {
  return offset
}

function generateBitMask (n) {
  return (1 << n) - 1
}

function readBitField (buffer, offset, typeArgs) {
  const beginOffset = offset
  let curVal = null
  let bits = 0
  const results = {}
  results.value = typeArgs.reduce((acc, { size, signed, name }) => {
    let currentSize = size
    let val = 0
    while (currentSize > 0) {
      if (bits === 0) {
        if (buffer.length < offset + 1) { throw new PartialReadError() }
        curVal = buffer[offset++]
        bits = 8
      }
      const bitsToRead = Math.min(currentSize, bits)
      val = (val << bitsToRead) | (curVal & generateBitMask(bits)) >> (bits - bitsToRead)
      bits -= bitsToRead
      currentSize -= bitsToRead
    }
    if (signed && val >= 1 << (size - 1)) { val -= 1 << size }
    acc[name] = val
    return acc
  }, {})
  results.size = offset - beginOffset
  return results
}
function writeBitField (value, buffer, offset, typeArgs) {
  let toWrite = 0
  let bits = 0
  typeArgs.forEach(({ size, signed, name }) => {
    const val = value[name]
    if ((!signed && val < 0) || (signed && val < -(1 << (size - 1)))) { throw new Error(value + ' < ' + signed ? (-(1 << (size - 1))) : 0) } else if ((!signed && val >= 1 << size) ||
        (signed && val >= (1 << (size - 1)) - 1)) { throw new Error(value + ' >= ' + signed ? (1 << size) : ((1 << (size - 1)) - 1)) }
    while (size > 0) {
      const writeBits = Math.min(8 - bits, size)
      toWrite = toWrite << writeBits |
        ((val >> (size - writeBits)) & generateBitMask(writeBits))
      size -= writeBits
      bits += writeBits
      if (bits === 8) {
        buffer[offset++] = toWrite
        bits = 0
        toWrite = 0
      }
    }
  })
  if (bits !== 0) { buffer[offset++] = toWrite << (8 - bits) }
  return offset
}

function sizeOfBitField (value, typeArgs) {
  return Math.ceil(typeArgs.reduce((acc, { size }) => {
    return acc + size
  }, 0) / 8)
}

function readCString (buffer, offset) {
  let size = 0
  while (offset + size < buffer.length && buffer[offset + size] !== 0x00) { size++ }
  if (buffer.length < offset + size + 1) { throw new PartialReadError() }

  return {
    value: buffer.toString('utf8', offset, offset + size),
    size: size + 1
  }
}

function writeCString (value, buffer, offset) {
  const length = Buffer.byteLength(value, 'utf8')
  buffer.write(value, offset, length, 'utf8')
  offset += length
  buffer.writeInt8(0x00, offset)
  return offset + 1
}

function sizeOfCString (value) {
  const length = Buffer.byteLength(value, 'utf8')
  return length + 1
}
