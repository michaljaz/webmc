const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  entry: {
    main: path.join(__dirname, 'scripts/index.js'),
    bootstrap: [path.join(__dirname, 'styles/style.scss'), 'bootstrap']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[contenthash].js'
  },
  performance: {
    hints: false,
    maxEntrypointSize: 1.5e6,
    maxAssetSize: 1.5e6
  },
  resolve: {
    alias: {
      'minecraft-protocol': path.resolve(__dirname, '../node_modules/minecraft-protocol/src/index.js'),
      express: false,
      net: path.resolve(__dirname, 'vendor/browser.js'),
      fs: 'memfs'
    },
    fallback: {
      zlib: require.resolve('browserify-zlib'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      events: require.resolve('events/'),
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      path: require.resolve('path-browserify'),
      constants: require.resolve('constants-browserify'),
      os: require.resolve('os-browserify/browser'),
      http: require.resolve('http-browserify'),
      https: require.resolve('https-browserify'),
      timers: require.resolve('timers-browserify'),
      // fs: require.resolve("fs-memory/singleton"),
      child_process: false,
      perf_hooks: path.resolve(__dirname, 'vendor/perf_hooks_replacement.js'),
      dns: path.resolve(__dirname, 'vendor/dns.js')
    }
  },
  module: {
    rules: [
      {
        loader: 'worker-loader',
        test: /\.worker\.js$/,
        options: {
          filename: '[contenthash].js'
        }
      },
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: path.join(__dirname, '/vendor/process.js')
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '/html/index.html'),
      inject: 'head',
      favicon: path.join(__dirname, 'assets/images/favicon.png')
    }),

    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new LodashModuleReplacementPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, 'assets'),
          to: 'assets'
        }
      ]
    })
  ]
}
