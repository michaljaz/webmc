
WebpackBar=require "webpackbar"
UglifyJsPlugin=require "uglifyjs-webpack-plugin"
HtmlWebpackPlugin = require "html-webpack-plugin"
CopyPlugin = require "copy-webpack-plugin"
webpack=require "webpack"
LodashModuleReplacementPlugin = require 'lodash-webpack-plugin'

module.exports=
	stats:"detailed"
	performance:
		hints: false
	entry: "#{__dirname}/coffee/index.coffee"
	output:
		path: "#{__dirname}/dist"
		filename: '[contenthash].js'
	performance:
		maxEntrypointSize: 1.5e6
		maxAssetSize: 1.5e6
	module:
		rules: [
			{
				loader: "worker-loader"
				test: /\.worker\.coffee$/
				options:
					filename: "[contenthash].js"
			}
			{
				test: /\.coffee$/
				loader: 'coffee-loader'
			}
		]
	plugins:[
		new HtmlWebpackPlugin({
			filename: "index.html"
			template: "#{__dirname}/static/html/index.html"
			inject: "head"
		})
		new LodashModuleReplacementPlugin()
		new WebpackBar()
		new CopyPlugin({
			patterns: [
				{ from: "#{__dirname}/static/assets", to: "assets" }
				{ from: "#{__dirname}/static/css", to: "css" }
			]
		})
	]