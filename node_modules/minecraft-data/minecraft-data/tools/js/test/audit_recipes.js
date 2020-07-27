/* eslint-env mocha */

const fs = require('fs')
const path = require('path')

// counts the number of recipes with a shape, without one and with an outShape

require('./version_iterator')(function (p, versionString) {
  describe('audit recipes ' + versionString, function () {
    it('audit recipes', function () {
      let recipes
      const pFile = path.join(p, 'recipes.json')
      if (fs.existsSync(pFile)) {
        recipes = require(pFile)
      } else {
        console.log('No recipes for version ' + versionString)
      }
      if (recipes) {
        let shapeCount = 0
        let shapelessCount = 0
        let outShapeCount = 0
        Object.keys(recipes).forEach(key => {
          const list = recipes[key]
          for (let i = 0; i < list.length; ++i) {
            const recipe = list[i]
            if (recipe.inShape != null) {
              shapeCount += 1
            } else if (recipe.ingredients != null) {
              shapelessCount += 1
            } else {
              console.log('inShape or ingredients required:', key)
            }
            if (recipe.outShape) outShapeCount += 1
          }
        })

        console.log('normal recipes:', shapeCount)
        console.log('shapeless recipes:', shapelessCount)
        console.log('how many have an outShape:', outShapeCount)
      }
    })
  })
})
