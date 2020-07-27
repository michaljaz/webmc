/* eslint-env mocha */

'use strict'

const nbt = require('../nbt')
const expect = require('chai').expect

function write (type, packet) {
  return nbt.proto.createPacketBuffer(type, packet)
}

function read (type, buffer) {
  return nbt.proto.parsePacketBuffer(type, buffer).data
}

const testData = [
  {
    type: 'i8',
    description: '8-bit bytes',
    data: [
      {
        buffer: Buffer.from([0]),
        value: 0
      },
      {
        buffer: Buffer.from([127]),
        value: 127
      },
      {
        buffer: Buffer.from([-127]),
        value: -127
      }
    ]
  },
  {
    type: 'i16',
    description: '16-bit shorts',
    data: [
      {
        buffer: Buffer.from([0, 0]),
        value: 0
      },
      {
        buffer: Buffer.from([0, 255]),
        value: 255
      },
      {
        buffer: Buffer.from([-127, 255]),
        value: (-127 << 8) | 255
      }
    ]
  },
  {
    type: 'i32',
    description: '32-bit ints',
    data: [
      {
        buffer: Buffer.from([0, 0, 0, 0]),
        value: 0
      },
      {
        buffer: Buffer.from([0, 0, 0, 255]),
        value: 255
      },
      {
        buffer: Buffer.from([-127, 0, 0, 0]),
        value: -127 << 24
      }
    ]
  },
  {
    type: 'i64',
    description: '64-bit longs',
    data: [
      {
        buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
        value: [0, 0]
      },
      {
        buffer: Buffer.from([0, 0, 0, 0, 0, 0, 0, 255]),
        value: [0, 255]
      },
      {
        buffer: Buffer.from([-127, 0, 0, 0, 0, 0, 0, 0]),
        value: [-127 << 24, 0]
      }
    ]
  },
  {
    type: 'f32',
    description: '32-bit floats',
    data: [
      {
        buffer: Buffer.from([0x00, 0x00, 0x00, 0x00]),
        value: 0
      },
      {
        buffer: Buffer.from([0x3f, 0x80, 0x00, 0x00]),
        value: 1
      }
    ]
  },
  {
    type: 'f64',
    description: 'writes 64-bit doubles',
    data: [
      {
        buffer: Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        value: 0
      },
      {
        buffer: Buffer.from([0x3f, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
        value: 1
      }
    ]
  },
  {
    type: 'byteArray',
    description: '8-bit byte arrays',
    data: [
      {
        buffer: Buffer.from([0, 0, 0, 2, 1, 2]),
        value: [1, 2]
      },
      {
        buffer: Buffer.from([0, 0, 0, 4, 3, 4, 5, 6]),
        value: [3, 4, 5, 6]
      }
    ]
  },
  {
    type: 'intArray',
    description: '32-bit int arrays',
    data: [
      {
        buffer: Buffer.from([0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2]),
        value: [1, 2]
      },
      {
        buffer: Buffer.from([0, 0, 0, 4, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 5, 0, 0, 0, 6]),
        value: [3, 4, 5, 6]
      }
    ]
  },
  {
    type: 'shortString',
    description: 'strings',
    data: [
      {
        buffer: Buffer.from([0, 6, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x21]),
        value: 'Hello!'
      },
      {
        buffer: Buffer.from([0, 16, 0xE3, 0x81, 0x93, 0xE3, 0x82, 0x93, 0xE3, 0x81,
          0xAB, 0xE3, 0x81, 0xA1, 0xE3, 0x81, 0xAF, 0x21]),
        value: 'こんにちは!'
      }
    ]
  },
  {
    type: 'list',
    description: 'lists',
    data: [
      {
        buffer: Buffer.from([1, 0, 0, 0, 3, 1, 2, 3]),
        value: { type: 'byte', value: [1, 2, 3] }
      },
      {
        buffer: Buffer.from([8, 0, 0, 0, 2, 0, 5, 0x48, 0x65, 0x6C, 0x6C, 0x6F,
          0, 5, 0x57, 0x6F, 0x72, 0x6C, 0x64]),
        value: { type: 'string', value: ['Hello', 'World'] }
      }
    ]
  },
  {
    type: 'compound',
    description: 'compounds',
    data: [
      {
        buffer: Buffer.from([
          1, 0, 2, 0x61, 0x61, 1,
          9, 0, 2, 0x62, 0x62, 1, 0, 0, 0, 3, 1, 2, 3,
          0]),
        value: {
          aa: { type: 'byte', value: 1 },
          bb: { type: 'list', value: { type: 'byte', value: [1, 2, 3] } }
        }
      },
      {
        buffer: Buffer.from([
          1, 0, 2, 0x63, 0x63, 2,
          0]),
        value: {
          cc: { type: 'byte', value: 2 }
        }
      }
    ]
  }
]

describe('nbt.Writer', function () {
  testData.forEach(function (typeTest) {
    it('writes ' + typeTest.description, function () {
      typeTest.data.forEach(function (test) {
        expect(write(typeTest.type, test.value)).to.deep.equal(test.buffer)
      })
    })
  })
})

describe('nbt.Reader', function () {
  testData.forEach(function (typeTest) {
    it('reads ' + typeTest.description, function () {
      typeTest.data.forEach(function (test) {
        expect(read(typeTest.type, test.buffer)).to.deep.equal(test.value)
      })
    })
  })
})
