/**
 * Gives the number of bits needed to represent the value
 * @param {number} value
 * @returns {number} bits
 */
function neededBits (value) {
  return 32 - Math.clz32(value)
}

module.exports = neededBits
