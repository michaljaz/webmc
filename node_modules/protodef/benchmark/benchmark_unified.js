/* eslint-env mocha */

const { testData, proto, compiledProto } = require('../test/dataTypes/prepareTests')
const Benchmark = require('benchmark')

it('read/write', function () {
  this.timeout(1000 * 60 * 10)
  const suite = new Benchmark.Suite()
  suite.add('read/write', function () {
    testData.forEach(tests => {
      tests.data.forEach(test => {
        test.subtypes.forEach(subType => {
          subType.values.forEach((value) => {
            proto.parsePacketBuffer(subType.type, value.buffer)
            proto.createPacketBuffer(subType.type, value.value)
          })
        })
      })
    })
  })
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .run({ 'async': false })
})

it('read/write (compiled)', function () {
  this.timeout(1000 * 60 * 10)
  const suite = new Benchmark.Suite()
  suite.add('read/write (compiled)', function () {
    testData.forEach(tests => {
      tests.data.forEach(test => {
        test.subtypes.forEach(subType => {
          subType.values.forEach((value) => {
            compiledProto.parsePacketBuffer(subType.type, value.buffer)
            compiledProto.createPacketBuffer(subType.type, value.value)
          })
        })
      })
    })
  })
    .on('cycle', function (event) {
      console.log(String(event.target))
    })
    .run({ 'async': false })
})
