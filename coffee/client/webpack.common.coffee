
WebpackBar=require "webpackbar"

module.exports=
	entry: './js/index.js'
	output:
		path: "#{__dirname}/public"
		filename: 'bundle.js'
	performance:
		maxEntrypointSize: 1.5e6
		maxAssetSize: 1.5e6
	module:
		rules: [
			{
				loader: "worker-loader"
				test: /\.worker\.js$/
				options:
					filename: "[contenthash].js"
			}
		]
	plugins:[
		new WebpackBar()
	]
