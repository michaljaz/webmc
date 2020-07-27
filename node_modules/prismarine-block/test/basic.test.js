/* eslint-env jest */

const Block = require('../')('1.15.2')
const mcData = require('minecraft-data')('1.15.2')

// https://minecraft.gamepedia.com/Breaking#Blocks_by_hardness
describe('Dig time', () => {
  test('dirt by hand', () => {
    const block = Block.fromStateId(mcData.blocksByName.dirt.defaultState, 0)
    const time = block.digTime(null, false, false, false)
    expect(time).toBe(750)
  })
})
