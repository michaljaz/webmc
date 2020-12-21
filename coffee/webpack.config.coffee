nodeExternals=require "webpack-node-externals"
CopyWebpackPlugin=require "copy-webpack-plugin"
path=require "path"
module.exports=
	mode:"production"
	target: "node"
	externals: [nodeExternals()]
	entry:
		"module/index":"./src/client/module/index.js"
		"module/World/chunk.worker":"./src/client/module/World/chunk.worker.js"
		"module/World/sections.worker":"./src/client/module/World/sections.worker.js"
	output:
		path:path.resolve "#{__dirname}/src/dist/"
	module:
		rules:[
			{
				test: /\.js$/
				exclude: /node_modules/
				use:
					loader: "babel-loader"
			}
		]
	plugins: [
		new CopyWebpackPlugin {
			patterns:[
				{from: 'src/client/assets',to: 'assets'}
				{from: 'src/client/css',to: 'css'}
			]
		}
	]
