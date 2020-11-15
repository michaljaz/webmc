var nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
  mode:'production',
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    "module/index":'./src/client/module/index.js',
    "module/World/chunk.worker":'./src/client/module/World/chunk.worker.js',
    "module/World/sections.worker":"./src/client/module/World/sections.worker.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns:[
        {from: 'src/client/assets',to: 'assets'},
        {from: 'src/client/css',to: 'css'},
        {from: 'src/client/index.html',to: 'index.html'}
      ]
    })
  ]
};
