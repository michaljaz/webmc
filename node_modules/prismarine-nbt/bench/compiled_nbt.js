const ProtoDef = require('protodef').ProtoDef
const { performance } = require('perf_hooks')
const assert = require('assert')
const { ProtoDefCompiler } = require('protodef').Compiler
const fs = require('fs')

const mainType = 'nbt'

fs.readFile('../sample/bigtest.nbt', async (error, buffer) => {
  if (error) {
    throw error
  }

  const proto = new ProtoDef()
  proto.addTypes(require('../compound'))
  proto.addTypes(require('../nbt.json'))

  const compiler = new ProtoDefCompiler()
  compiler.addTypes(require('../compiler-compound'))
  compiler.addTypesToCompile(require('../nbt.json'))
  const compiledProto = await compiler.compileProtoDef()

  const result = compiledProto.parsePacketBuffer(mainType, buffer).data
  const result2 = proto.parsePacketBuffer(mainType, buffer).data

  const buffer2 = compiledProto.createPacketBuffer(mainType, result)
  const result3 = proto.parsePacketBuffer(mainType, buffer2).data

  assert.deepStrictEqual(result, result2)
  assert.deepStrictEqual(result2, result3)
  assert.strictEqual(buffer.length, buffer2.length)

  const nbTests = 10000
  console.log('Running ' + nbTests + ' tests')

  let start, time, ps

  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    const result = compiledProto.parsePacketBuffer(mainType, buffer).data
    compiledProto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write compiled: ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')

  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    const result = proto.parsePacketBuffer(mainType, buffer).data
    proto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write parser: ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')

  // Closure optimized:
  const optimizedProto = await compiler.compileProtoDef({ optimize: true })
  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    const result = optimizedProto.parsePacketBuffer(mainType, buffer).data
    optimizedProto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write compiled (+closure): ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')
})
