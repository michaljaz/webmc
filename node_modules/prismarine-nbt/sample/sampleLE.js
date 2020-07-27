const fs = require('fs')
const nbt = require('../nbt')

fs.readFile('level.dat', function (error, data) {
  if (error) {
    throw error
  }

  nbt.parse(data, true, function (error, result) {
    console.log(error)
    console.log(JSON.stringify(result, null, 2))
  })
})
