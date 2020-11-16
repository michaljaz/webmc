var nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require("path");
module.exports = {
  mode:'production',
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    "module/index":'./src/client/module/index.js',
    "module/World/chunk.worker":'./src/client/module/World/chunk.worker.js',
    "module/World/sections.worker":"./src/client/module/World/sections.worker.js"
  },
  output:{
    path:path.resolve(__dirname+"/src/dist/")
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
