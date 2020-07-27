const { PartialReadError } = require('../utils')

function readI64 (buffer, offset) {
  if (offset + 8 > buffer.length) { throw new PartialReadError() }
  return {
    value: [buffer.readInt32BE(offset), buffer.readInt32BE(offset + 4)],
    size: 8
  }
}

function writeI64 (value, buffer, offset) {
  buffer.writeInt32BE(value[0], offset)
  buffer.writeInt32BE(value[1], offset + 4)
  return offset + 8
}

function readLI64 (buffer, offset) {
  if (offset + 8 > buffer.length) { throw new PartialReadError() }
  return {
    value: [buffer.readInt32LE(offset + 4), buffer.readInt32LE(offset)],
    size: 8
  }
}

function writeLI64 (value, buffer, offset) {
  buffer.writeInt32LE(value[0], offset + 4)
  buffer.writeInt32LE(value[1], offset)
  return offset + 8
}

function readU64 (buffer, offset) {
  if (offset + 8 > buffer.length) { throw new PartialReadError() }
  return {
    value: [buffer.readUInt32BE(offset), buffer.readUInt32BE(offset + 4)],
    size: 8
  }
}

function writeU64 (value, buffer, offset) {
  buffer.writeUInt32BE(value[0], offset)
  buffer.writeUInt32BE(value[1], offset + 4)
  return offset + 8
}

function readLU64 (buffer, offset) {
  if (offset + 8 > buffer.length) { throw new PartialReadError() }
  return {
    value: [buffer.readUInt32LE(offset + 4), buffer.readUInt32LE(offset)],
    size: 8
  }
}

function writeLU64 (value, buffer, offset) {
  buffer.writeUInt32LE(value[0], offset + 4)
  buffer.writeUInt32LE(value[1], offset)
  return offset + 8
}

function generateFunctions (bufferReader, bufferWriter, size, schema) {
  const reader = (buffer, offset) => {
    if (offset + size > buffer.length) { throw new PartialReadError() }
    const value = buffer[bufferReader](offset)
    return {
      value: value,
      size: size
    }
  }
  const writer = (value, buffer, offset) => {
    buffer[bufferWriter](value, offset)
    return offset + size
  }
  return [reader, writer, size, schema]
}

const nums = {
  'i8': ['readInt8', 'writeInt8', 1],
  'u8': ['readUInt8', 'writeUInt8', 1],
  'i16': ['readInt16BE', 'writeInt16BE', 2],
  'u16': ['readUInt16BE', 'writeUInt16BE', 2],
  'i32': ['readInt32BE', 'writeInt32BE', 4],
  'u32': ['readUInt32BE', 'writeUInt32BE', 4],
  'f32': ['readFloatBE', 'writeFloatBE', 4],
  'f64': ['readDoubleBE', 'writeDoubleBE', 8],
  'li8': ['readInt8', 'writeInt8', 1],
  'lu8': ['readUInt8', 'writeUInt8', 1],
  'li16': ['readInt16LE', 'writeInt16LE', 2],
  'lu16': ['readUInt16LE', 'writeUInt16LE', 2],
  'li32': ['readInt32LE', 'writeInt32LE', 4],
  'lu32': ['readUInt32LE', 'writeUInt32LE', 4],
  'lf32': ['readFloatLE', 'writeFloatLE', 4],
  'lf64': ['readDoubleLE', 'writeDoubleLE', 8]
}

const types = Object.keys(nums).reduce((types, num) => {
  types[num] = generateFunctions(nums[num][0], nums[num][1], nums[num][2], require('../../ProtoDef/schemas/numeric.json')[num])
  return types
}, {})
types['i64'] = [readI64, writeI64, 8, require('../../ProtoDef/schemas/numeric.json')['i64']]
types['li64'] = [readLI64, writeLI64, 8, require('../../ProtoDef/schemas/numeric.json')['li64']]
types['u64'] = [readU64, writeU64, 8, require('../../ProtoDef/schemas/numeric.json')['u64']]
types['lu64'] = [readLU64, writeLU64, 8, require('../../ProtoDef/schemas/numeric.json')['lu64']]

module.exports = types
