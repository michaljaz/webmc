/* eslint-env mocha */

const expect = require('chai').expect
const Validator = require('jsonschema').Validator
const v = new Validator()
const assert = require('assert')

const { testData, proto, compiledProto } = require('./prepareTests')

function testValue (type, value, buffer) {
  it('writes', function () {
    expect(proto.createPacketBuffer(type, value)).to.deep.equal(buffer)
  })
  it('reads', function () {
    const actualResult = proto.parsePacketBuffer(type, buffer)
    if (value === null) { assert.ok(actualResult.data === undefined) } else { expect(actualResult.data).to.deep.equal(value) }
    expect(actualResult.metadata.size).to.deep.equal(buffer.length)
  })
  it('writes (compiled)', function () {
    expect(compiledProto.createPacketBuffer(type, value)).to.deep.equal(buffer)
  })
  it('reads (compiled)', function () {
    const actualResult = compiledProto.parsePacketBuffer(type, buffer)
    if (value === null) { assert.ok(actualResult.data === undefined) } else { expect(actualResult.data).to.deep.equal(value) }
    expect(actualResult.metadata.size).to.deep.equal(buffer.length)
  })
}

function testType (type, values) {
  if (values.length === 0) {
    it.skip('Has no tests', () => {

    })
  }
  values.forEach((value) => {
    if (value.description) {
      describe(value.description, () => {
        testValue(type, value.value, value.buffer)
      })
    } else { testValue(type, value.value, value.buffer) }
  })
  if (type !== 'void') {
    it('reads 0 bytes and throw a PartialReadError', () => {
      try {
        proto.parsePacketBuffer(type, Buffer.alloc(0))
      } catch (e) {
        if (!e.partialReadError) { throw e }
        return
      }
      throw Error('no PartialReadError thrown')
    })

    it('reads 0 bytes and throw a PartialReadError (compiled)', () => {
      try {
        compiledProto.parsePacketBuffer(type, Buffer.alloc(0))
      } catch (e) {
        if (!e.partialReadError) { throw e }
        return
      }
      throw Error('no PartialReadError thrown')
    })
  }
}

testData.forEach(tests => {
  describe(tests.kind, () => {
    it('validates the json schema', () => {
      const schema = require('../../ProtoDef/test/datatype_tests_schema.json')
      v.addSchema(require('../../ProtoDef/schemas/datatype'), 'dataType')
      const result = v.validate(tests.originalData, schema)
      assert.strictEqual(result.errors.length, 0, require('util').inspect(result.errors, { 'depth': null }))
    })

    tests.data.forEach(test => {
      describe(test.type, () => {
        test.subtypes.forEach((subtype) => {
          if (subtype.description) {
            describe(subtype.description, () => {
              testType(subtype.type, subtype.values)
            })
          } else { testType(test.type, subtype.values) }
        })
      })
    })
  })
})
