#!/usr/bin/env node

const dataSource = require('../minecraft-data/data/dataPaths')
const fs = require('fs')
const path = require('path')

const data = 'module.exports =\n{\n' + Object
  .keys(dataSource)
  .map(k1 =>
    "  '" + k1 + "': {\n" + Object
      .keys(dataSource[k1])
      .map(k2 =>
        "    '" + k2 + "': {" + '\n' + Object
          .keys(dataSource[k1][k2])
          .map(k3 => "      '" + k3 + "': require('./minecraft-data/data/" + dataSource[k1][k2][k3] + '/' + k3 + ".json')")
          .join(',\n') +
      '\n    }'
      )
      .join(',\n') +
    '\n  }'
  )
  .join(',\n') + '\n}\n'

fs.writeFileSync(path.join(__dirname, '/../data.js'), data)
