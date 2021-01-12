
merge=require "webpack-merge"
common=require "./webpack.common.js"
module.exports=merge.merge common,
	mode: "development"
	entry: './js/index.js'
	devtool: 'inline-source-map'
	devServer:
		contentBase: "#{__dirname}/public"
		port: 8080
