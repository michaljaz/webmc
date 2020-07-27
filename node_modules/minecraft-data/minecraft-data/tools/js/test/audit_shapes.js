/* eslint-env mocha */

const fs = require('fs')
const path = require('path')

// checks if bounding boxes data in blocks.json is consistent with blockCollisionShapes.json

require('./version_iterator')(function (p, versionString) {
  describe('audit block shapes ' + versionString, function () {
    const blockFile = path.join(p, 'blocks.json')
    if (!fs.existsSync(blockFile)) {
      return // Only audit shape where block exists
    }
    it('audit bb', function () {
      const shapeFile = path.join(p, 'blockCollisionShapes.json')
      if (!fs.existsSync(shapeFile)) {
        console.log('No collision shapes for version ' + versionString)
        return
      }

      const blocks = require(blockFile)
      const shapes = require(shapeFile)

      const blockByName = {}

      // Check bijection between blocks and shapes

      // Check that every block have a shape
      blocks.forEach(block => {
        blockByName[block.name] = block
        const shape = shapes.blocks[block.name]
        if (shape === undefined) {
          console.log('missing shape for block: ' + block.name)
        }
      })

      // Check that every shape have a block
      for (const key of Object.keys(shapes.blocks)) {
        const block = blockByName[key]
        if (block === undefined) {
          console.log('missing block for shape: ' + key)
        }
      }

      // Check every shape is present
      const usedShapes = {}
      for (let value of Object.values(shapes.blocks)) {
        if (!(value instanceof Array)) value = [value]
        for (let shape of value) {
          if (shapes.shapes[shape] === undefined) {
            console.log('missing shape: ' + shape)
          }
          usedShapes[shape] = true
        }
      }

      // Check every shape is used
      for (const key of Object.keys(shapes.shapes)) {
        if (!usedShapes[key]) {
          console.log('unused shape: ' + key)
        }
      }

      // Check block bounding box is consistent with shape
      let rewriteBlocks = false
      blocks.forEach(block => {
        blockByName[block.name] = block
        const shape = shapes.blocks[block.name]
        if (shape !== undefined) {
          if (block.boundingBox === 'empty') {
            if (shape !== 0) {
              console.log('Inconsistent BB for block ' + block.name + ' (expected empty got ' + shape + ')')
              block.boundingBox = 'block'
              rewriteBlocks = true
            }
          } else if (block.boundingBox === 'block') {
            if (shape === 0) {
              console.log('Inconsistent BB for block ' + block.name + ' (expected block got ' + shape + ')')
              block.boundingBox = 'empty'
              rewriteBlocks = true
            }
          } else {
            console.log('Unknown BB: ' + block.boundingBox + ' for block ' + block.name)
          }
        }
      })

      // Automatically fix block data, if necessary
      if (rewriteBlocks) {
        fs.writeFileSync(blockFile, JSON.stringify(blocks, null, 2))
      }
    })
  })
})
