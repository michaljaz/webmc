const ProtoDef = require('protodef').ProtoDef
const { ProtoDefCompiler } = require('protodef').Compiler

const proto = new ProtoDef()
const compiler = new ProtoDefCompiler()

const testData = [
  {
    'kind': 'conditional',
    'data': require('../../ProtoDef/test/conditional.json')
  },
  {
    'kind': 'numeric',
    'data': require('../../ProtoDef/test/numeric.json')
  },
  {
    'kind': 'structures',
    'data': require('../../ProtoDef/test/structures.json')
  },
  {
    'kind': 'utils',
    'data': require('../../ProtoDef/test/utils.json')
  }
]

function arrayToBuffer (arr) {
  return Buffer.from(arr.map(e => parseInt(e)))
}

function transformValues (type, values) {
  return values.map(value => ({
    buffer: arrayToBuffer(value.buffer),
    value: type.indexOf('buffer') === 0 ? arrayToBuffer(value.value) : value.value,
    description: value.description
  }))
}

testData.forEach(tests => {
  tests.originalData = JSON.parse(JSON.stringify(tests.data))
  tests.data.forEach(test => {
    const subTypes = []
    if (test.subtypes) {
      test.subtypes.forEach((subtype, i) => {
        const type = test.type + '_' + i
        proto.addType(type, subtype.type)
        let types = {}
        types[type] = subtype.type
        compiler.addTypesToCompile(types)

        subtype.values = transformValues(test.type, subtype.values)
        subtype.type = type
        subTypes.push(subtype)
      })
    } else {
      test.values = transformValues(test.type, test.values)
      subTypes.push({ type: test.type, values: test.values })
    }
    test.subtypes = subTypes
  })
})

module.exports = {
  testData,
  proto,
  compiledProto: compiler.compileProtoDefSync()
}
