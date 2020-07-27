/* eslint-env mocha */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

const Ajv = require('ajv')
const v = new Ajv({ verbose: true })

const Validator = require('protodef-validator')

Error.stackTraceLimit = 0

const data = ['biomes', 'instruments', 'items', 'materials', 'blocks', 'blockCollisionShapes', 'recipes', 'windows', 'entities', 'protocol', 'version', 'effects', 'enchantments', 'language', 'foods']

require('./version_iterator')(function (p, versionString) {
  describe('minecraft-data schemas ' + versionString, function () {
    this.timeout(60 * 1000)
    data.forEach(function (dataName) {
      let instance
      const pFile = path.join(p, dataName + '.json')
      if (fs.existsSync(pFile)) {
        instance = require(pFile)
      }
      if (instance) {
        it(dataName + '.json is valid', function () {
          if (dataName === 'protocol') {
            const validator = new Validator()

            validator.addType('entityMetadataItem', require('../../../schemas/protocol_types/entity_metadata_item.json'))
            validator.addType('entityMetadataLoop', require('../../../schemas/protocol_types/entity_metadata_loop.json'))
            validator.validateProtocol(instance)
          } else {
            const schema = require('../../../schemas/' + dataName + '_schema.json')
            const valid = v.validate(schema, instance)
            assert.ok(valid, JSON.stringify(v.errors, null, 2))
          }
        })
      }
    })
  })
})

const commonData = ['protocolVersions']
const minecraftTypes = ['pc', 'pe']

minecraftTypes.forEach(function (type) {
  describe('minecraft-data schemas of common data of ' + type, function () {
    this.timeout(60 * 1000)
    commonData.forEach(function (dataName) {
      it(dataName + '.json is valid', function () {
        const instance = require('../../../data/' + type + '/common/' + dataName + '.json')
        const schema = require('../../../schemas/' + dataName + '_schema.json')
        const valid = v.validate(schema, instance)
        assert.ok(valid, JSON.stringify(v.errors, null, 2))
      })
    })
  })
})
