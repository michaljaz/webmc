const ProtoDef = require('./protodef')
const proto = new ProtoDef()

module.exports = {
  ProtoDef: ProtoDef,
  Serializer: require('./serializer').Serializer,
  Parser: require('./serializer').Parser,
  FullPacketParser: require('./serializer').FullPacketParser,
  Compiler: require('./compiler'),
  types: proto.types,
  utils: require('./utils')
}
