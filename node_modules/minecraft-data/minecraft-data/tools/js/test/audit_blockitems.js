/* eslint-env mocha */

const fs = require('fs')
const path = require('path')

require('./version_iterator')(function (p, versionString) {
  describe('audit blockitems ' + versionString, function () {
    it('audit blockitems', function () {
      const itemsFile = path.join(p, 'items.json')
      if (!fs.existsSync(itemsFile)) return
      const items = require(itemsFile)

      const blocksFile = path.join(p, 'blocks.json')
      if (!fs.existsSync(blocksFile)) return
      const blocks = require(blocksFile)

      if (items[0].id === 0) return

      let rewriteItems = false
      for (const block of blocks) {
        let blockitem = null
        for (const item of items) {
          if (item.name === block.name) {
            blockitem = item
            break
          }
        }
        if (!blockitem) {
          console.log('Missing item for block ' + block.name)
          rewriteItems = true
          items.push({
            id: block.id,
            displayName: block.displayName,
            name: block.name,
            stackSize: 64
          })
        }
      }

      items.sort((a, b) => { return a.id - b.id })

      // Automatically fix item data, if necessary
      if (rewriteItems) {
        fs.writeFileSync(itemsFile, JSON.stringify(items, null, 2))
      }
    })
  })
})
