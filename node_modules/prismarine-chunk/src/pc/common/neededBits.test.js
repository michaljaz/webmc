/* globals test describe */
const assert = require('assert')
const neededBits = require('./neededBits')

describe('neededBits', () => {
  test('returns correct amount of needed bits to represent value', () => {
    assert(neededBits(31), 5)
    assert(neededBits(31), 5)
    assert(neededBits(255), 8)
    assert(neededBits(256), 9)
    assert(neededBits(1), 1)
    assert(neededBits(2), 2)
    assert(neededBits(3), 2)
    assert(neededBits(4), 3)
  })
})
