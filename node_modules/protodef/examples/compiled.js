const ProtoDef = require('protodef').ProtoDef
const { performance } = require('perf_hooks')
const { ProtoDefCompiler } = require('protodef').Compiler

const exampleProtocol = require('./example_protocol.json')
const mainType = 'packet'
const packetData = {
  name: 'entity_look',
  params: {
    'entityId': 1,
    'yaw': 1,
    'pitch': 1,
    'onGround': true,
    'position': {
      x: 42,
      y: 255,
      z: -1337
    }
  }
};

(async () => {
  const proto = new ProtoDef()
  proto.addTypes(exampleProtocol)

  const compiler = new ProtoDefCompiler()
  compiler.addTypesToCompile(exampleProtocol)
  const compiledProto = await compiler.compileProtoDef()

  const buffer = proto.createPacketBuffer(mainType, packetData)
  const result = compiledProto.parsePacketBuffer(mainType, buffer).data
  console.log(JSON.stringify(result, null, 2))
  const buffer2 = compiledProto.createPacketBuffer(mainType, packetData)
  const result2 = proto.parsePacketBuffer(mainType, buffer2).data
  console.log(JSON.stringify(result2, null, 2))

  const nbTests = 10000000
  console.log('Running ' + nbTests + ' tests')
  let start, time, ps

  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    let result = compiledProto.parsePacketBuffer(mainType, buffer).data
    compiledProto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write compiled: ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')

  start = performance.now()
  for (let i = 0; i < nbTests / 10; i++) { // less tests otherwise too long
    const result = proto.parsePacketBuffer(mainType, buffer).data
    proto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / 10 / time
  console.log('read / write parser: ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')
})()
