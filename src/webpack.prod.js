const merge = require('webpack-merge')
const [config1, config2] = require('./webpack.common.js')
const webpack = require('webpack')

module.exports = [
  merge.merge(config1, {
    mode: 'production',
    plugins: [
      new webpack.DefinePlugin({
        'window.PRODUCTION': JSON.stringify(true)
      })
    ]
  }),
  merge.merge(config2, {
    mode: 'production'
  })
]
