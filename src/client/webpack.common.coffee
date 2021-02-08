
WebpackBar=require "webpackbar"
UglifyJsPlugin=require "uglifyjs-webpack-plugin"
HtmlWebpackPlugin = require "html-webpack-plugin"
CopyPlugin = require "copy-webpack-plugin"
webpack=require "webpack"
LodashModuleReplacementPlugin = require 'lodash-webpack-plugin'

module.exports=
	performance:
		hints: false
	entry: [
		"#{__dirname}/scripts/index.coffee"
		"#{__dirname}/styles/style.scss"
		"#{__dirname}/styles/style.css"
		"bootstrap"
	]
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
			{
				test: /\.(scss)$/
				use: [
					{
						#Adds CSS to the DOM by injecting a `<style>` tag
						loader: 'style-loader'
					}
					{
						#Interprets `@import` and `url()` like `import/require()` and will resolve them
						loader: 'css-loader'
					}
					{
						#Loader for webpack to process CSS with PostCSS
						loader: 'postcss-loader'
						options: 
							plugins: ()->
								return [
									require 'autoprefixer'
								]
					}
					{
						#Loads a SASS/SCSS file and compiles it to CSS
						loader: 'sass-loader'
					}
				]
			}
			{
				test: /\.css$/i
				use: ["style-loader", "css-loader"]
			}
			{
				test: /\.(png|jpe?g|gif)$/i
				use: [
					{
						loader: 'file-loader'
					}
				]
			}
		]
	plugins:[
		new webpack.ProvidePlugin({
			$: 'jquery'
			jQuery: 'jquery'
		})
		new HtmlWebpackPlugin({
			filename: "index.html"
			template: "#{__dirname}/html/index.html"
			inject: "head"
			favicon: "#{__dirname}/assets/images/favicon.png"
		})
		new LodashModuleReplacementPlugin()
		new WebpackBar()
		new CopyPlugin({
			patterns: [
				{ from: "#{__dirname}/assets", to: "assets" }
			]
		})
	]