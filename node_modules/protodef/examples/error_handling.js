const ProtoDef = require('protodef').ProtoDef
const Serializer = require('protodef').Serializer
const Parser = require('protodef').Parser

const exampleProtocol = require('./example_protocol.json')

const proto = new ProtoDef()
proto.addTypes(exampleProtocol)
const parser = new Parser(proto, 'packet')
const serializer = new Serializer(proto, 'packet')

serializer.write({
  name: 'entity_look',
  params: {
    'entityId': 1,
    'yaw': 1,
    'pitch': 1,
    'onGround': true
  }
})

parser.on('error', function (err) {
  console.log(err.stack)
  console.log(err.buffer)
})

parser.write(Buffer.from([0x17, 0x01, 0x01, 0x01, 0x01]))

serializer.pipe(parser)

parser.on('data', function (chunk) {
  console.log(JSON.stringify(chunk.data, null, 2))
})
