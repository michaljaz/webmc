const fs = require('fs')
const path = require('path')

const MODELS = path.join(__dirname, '../assets/pack/assets/minecraft/models/block')
console.log(MODELS)
const result = {}
fs.readdir(MODELS, (_err, files) => {
  let totalImages = 0
  files.forEach((file) => {
    totalImages += 1
  })
  let loadedImages = 0
  files.forEach((file) => {
    const name = file.substr(0, file.length - 5)
    const filePath = path.join(MODELS, file)
    fs.readFile(filePath, (err, data) => {
      loadedImages += 1
      if (err) throw err
      data = JSON.parse(data)
      result[name] = data
      if (loadedImages === totalImages) {
        fs.writeFileSync(path.join(__dirname, '../src/assets/blocks/models.json'), JSON.stringify(result, null, 4))
      }
    })
  })
})
