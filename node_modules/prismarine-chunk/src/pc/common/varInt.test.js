/* globals describe, test */
const varInt = require('./varInt')
const SmartBuffer = require('smart-buffer').SmartBuffer
const assert = require('assert')

describe('varInt', () => {
  test('writes and reads correctly', () => {
    const writer = new SmartBuffer()

    // taken from https://wiki.vg/Data_types "Sample VarInts:" table
    varInt.write(writer, 0)
    varInt.write(writer, 1)
    varInt.write(writer, 2)
    varInt.write(writer, 127)
    varInt.write(writer, 128)
    varInt.write(writer, 255)
    varInt.write(writer, 2147483647)
    varInt.write(writer, -1)
    varInt.write(writer, -2147483648)

    const reader = SmartBuffer.fromBuffer(writer.toBuffer())
    assert.strictEqual(varInt.read(reader), 0)
    assert.strictEqual(varInt.read(reader), 1)
    assert.strictEqual(varInt.read(reader), 2)
    assert.strictEqual(varInt.read(reader), 127)
    assert.strictEqual(varInt.read(reader), 128)
    assert.strictEqual(varInt.read(reader), 255)
    assert.strictEqual(varInt.read(reader), 2147483647)
    assert.strictEqual(varInt.read(reader), -1)
    assert.strictEqual(varInt.read(reader), -2147483648)
  })
})
