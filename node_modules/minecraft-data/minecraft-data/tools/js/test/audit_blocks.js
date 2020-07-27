/* eslint-env mocha */

const fs = require('fs')
const path = require('path')

// checks for duplicates names and jumps in ids

require('./version_iterator')(function (p, versionString) {
  describe('audit blocks ' + versionString, function () {
    it('audit blocks', function () {
      let blocks
      const pFile = path.join(p, 'blocks.json')
      if (fs.existsSync(pFile)) {
        blocks = require(pFile)
      } else {
        console.log('No blocks for version ' + versionString)
      }
      if (blocks) {
        const all = []
        blocks.forEach(block => {
          all[block.id] = block
        })

        const displayNames = {}
        const names = {}
        for (let i = 0; i < all.length; ++i) {
          const block = all[i]
          if (block) {
            if (block.displayName == null) {
              console.log('Missing displayName:', i)
            } else {
              const otherBlock = displayNames[block.displayName]
              if (otherBlock) {
                console.log('Duplicate displayName:', otherBlock.id, 'and', block.id,
                  'both share', block.displayName)
              } else {
                displayNames[block.displayName] = block
              }
            }
            if (block.name == null) {
              console.log('Missing name:', i)
            } else {
              const otherBlock = names[block.name]
              if (otherBlock) {
                console.log('Duplicate name:', otherBlock.id, 'and', block.id,
                  'both share', block.name)
              } else {
                names[block.name] = block
              }
            }
          } else {
            console.log('Missing:', i)
          }
        }
      }
    })
  })
})
