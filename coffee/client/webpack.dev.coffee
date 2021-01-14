
merge=require "webpack-merge"
common=require "./webpack.common.js"
module.exports=merge.merge common,
	devtool: 'inline-source-map'
	mode: "development"
	devServer:
		contentBase: "#{__dirname}/public"
		port: 8080
