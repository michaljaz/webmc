const merge = require('webpack-merge')
const [config1, config2] = require('./webpack.common.js')
const webpack = require('webpack')

module.exports = [
  merge.merge(config1, {
    devtool: 'inline-source-map',
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        'window.PRODUCTION': JSON.stringify(false)
      })
    ]
  }),
  merge.merge(config2, {
    devtool: 'inline-source-map',
    mode: 'development'
  })
]
