/* eslint-env mocha */

'use strict'

const fs = require('fs')
const nbt = require('../nbt')
const expect = require('chai').expect

describe('nbt.parse', function () {
  function checkBigtest (data) {
    expect(data.value.stringTest.value).to.equal(
      'HELLO WORLD THIS IS A TEST STRING ÅÄÖ!')
    expect(data.value['nested compound test'].value).to.deep.equal({
      ham: {
        type: 'compound',
        value: {
          name: { type: 'string', value: 'Hampus' },
          value: { type: 'float', value: 0.75 }
        }
      },
      egg: {
        type: 'compound',
        value: {
          name: { type: 'string', value: 'Eggbert' },
          value: { type: 'float', value: 0.5 }
        }
      }
    })
  }

  it('parses a compressed NBT file', function (done) {
    fs.readFile('sample/bigtest.nbt.gz', function (error, data) {
      if (error) {
        throw error
      }
      nbt.parse(data, function (err, data) {
        if (err) {
          throw error
        }
        checkBigtest(data)
        done()
      })
    })
  })

  it('parses an uncompressed NBT file through parse()', function (done) {
    fs.readFile('sample/bigtest.nbt', function (error, data) {
      if (error) {
        throw error
      }
      nbt.parse(data, function (error, data) {
        if (error) {
          throw error
        }
        checkBigtest(data)
        done()
      })
    })
  })
})

describe('nbt.write', function () {
  it('writes an uncompressed NBT file', function (done) {
    fs.readFile('sample/bigtest.nbt', function (err, nbtdata) {
      if (err) {
        throw err
      }
      expect(nbt.writeUncompressed(require('../sample/bigtest'))).to.deep.equal(nbtdata)
      done()
    })
  })

  it('re-encodes it input perfectly', function () {
    const input = require('../sample/bigtest')
    const output = nbt.writeUncompressed(input)
    const decodedOutput = nbt.parseUncompressed(output)
    expect(decodedOutput).to.deep.equal(input)
  })
})
