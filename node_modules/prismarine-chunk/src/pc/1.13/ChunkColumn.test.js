/* globals describe test expect */
const Block = require('prismarine-block')('1.13')
const mcData = require('minecraft-data')('1.13.2')
const ChunkColumn = require('./ChunkColumn')(Block, mcData)
const constants = require('../common/constants')

describe('ChunkColumn', () => {
  test('use function to initialize the chunk column', () => {
    const stateId = 20
    const block = Block.fromStateId(stateId, 1)
    const column = new ChunkColumn()
    column.initialize(() => { return block })

    let different = 0
    const p = { x: 0, y: 0, z: 0 }
    for (p.x = 0; p.x < constants.SECTION_WIDTH; p.x++) {
      for (p.y = 0; p.y < constants.CHUNK_HEIGHT; p.y++) {
        for (p.z = 0; p.z < constants.SECTION_WIDTH; p.z++) {
          different += column.getBlock(p).stateId !== stateId
        }
      }
    }
    // this is expensive and doesn't allow proper measurement if in the loops
    expect(different).toBe(0)
  })

  test('defaults to all air', () => {
    const column = new ChunkColumn()

    let different = 0
    const p = { x: 0, y: 0, z: 0 }
    for (p.y = 0; p.y < constants.CHUNK_HEIGHT; p.y++) {
      for (p.z = 0; p.z < constants.SECTION_WIDTH; p.z++) {
        for (p.x = 0; p.x < constants.SECTION_WIDTH; p.x++) {
          different += column.getBlock(p).stateId !== 0
        }
      }
    }
    expect(different).toBe(0)
  })

  test('loading empty chunk sections becomes air', () => {
    const column = new ChunkColumn()

    // allocate data for biomes
    const buffer = Buffer.alloc(constants.SECTION_WIDTH * constants.SECTION_HEIGHT * 4)
    let offset = 0
    for (let x = 0; x < constants.SECTION_WIDTH; ++x) {
      for (let z = 0; z < constants.SECTION_WIDTH; ++z) {
        buffer.writeInt32BE(1, offset)
        offset += 4
      }
    }

    column.load(buffer, 0x0000)

    let different = 0
    const p = { x: 0, y: 0, z: 0 }
    for (p.y = 0; p.y < constants.CHUNK_HEIGHT; p.y++) {
      for (p.z = 0; p.z < constants.SECTION_WIDTH; p.z++) {
        for (p.x = 0; p.x < constants.SECTION_WIDTH; p.x++) {
          different += column.getBlock(p).stateId !== 0
        }
      }
    }
    expect(different).toBe(0)
  })
})
