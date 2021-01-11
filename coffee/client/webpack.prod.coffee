
buildPath="#{__dirname}/public"

module.exports=(env)->
	mode: "production"
	entry: './js/index.js'
	output:
		path: buildPath
		filename: 'bundle.js'
	performance:
		maxEntrypointSize: 1.5e6
		maxAssetSize: 1.5e6
	stats:
		modules: false
	module:
		rules: [
			{
				loader: "worker-loader"
				test: /\.worker\.js$/
				options:
					filename: "[contenthash].js"
			}
		]
