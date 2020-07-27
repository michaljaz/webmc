/**
 * Writes `value` into `buffer`
 * https://wiki.vg/Data_types#VarInt_and_VarLong
 *
 * @param {SmartBuffer} buffer
 * @param {*} value
 */
exports.write = (buffer, value) => {
  do {
    // would want to use the numeric separator but standardjs doesn't allow it
    let temp = value & 0b01111111
    value >>>= 7
    if (value !== 0) {
      // would want to use the numeric separator but standardjs doesn't allow it
      temp |= 0b10000000
    }
    buffer.writeUInt8(temp)
  } while (value !== 0)
}

/**
 * Reads into `buffer`
 * https://wiki.vg/Data_types#VarInt_and_VarLong
 *
 * @param {SmartBuffer} buffer
 */
exports.read = buffer => {
  let numRead = 0
  let result = 0
  let read
  do {
    read = buffer.readUInt8()
    // would want to use the numeric separator but standardjs doesn't allow it
    const value = read & 0b01111111
    result |= value << (7 * numRead)

    numRead++
    if (numRead > 5) {
      throw new Error('varint is too big')
    }
    // would want to use the numeric separator but standardjs doesn't allow it
  } while ((read & 0b10000000) !== 0)

  return result
}
