
buildPath="#{__dirname}/public"

module.exports=(env)->
	mode: if (env and env.prod) then 'production' else 'development'
	entry: './js/index.js'
	output:
		path: buildPath
		filename: 'bundle.js'
	performance:
		maxEntrypointSize: 1.5e6
		maxAssetSize: 1.5e6
	stats:
		modules: false
	devtool: 'cheap-source-map'
	devServer:
		contentBase: buildPath
		inline: true
		host: "0.0.0.0"
		stats: "minimal"
	module:
		rules: [
			{
				loader: "worker-loader"
				test: /\.worker\.js$/
				options:
					filename: "[contenthash].js"
			}
		]
