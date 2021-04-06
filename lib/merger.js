const fs = require('fs')
const path = require('path')

function merger (inputPath, buildPath) {
  const P = path.join(__dirname, inputPath)
  console.log(P)
  const result = {}
  fs.readdir(P, (_err, files) => {
    let totalImages = 0
    files.forEach((file) => {
      totalImages += 1
    })
    let loadedImages = 0
    files.forEach((file) => {
      const name = file.substr(0, file.length - 5)
      const filePath = path.join(P, file)
      fs.readFile(filePath, (err, data) => {
        loadedImages += 1
        if (err) throw err
        data = JSON.parse(data)
        result[name] = data
        if (loadedImages === totalImages) {
          fs.writeFileSync(path.join(__dirname, buildPath), JSON.stringify(result, null, 4))
        }
      })
    })
  })
}
merger('../assets/pack/assets/minecraft/models/block', '../src/assets/blocks/models.json')
merger('../assets/pack/assets/minecraft/blockstates', '../src/assets/blocks/blockStates.json')
