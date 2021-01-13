
merge=require "webpack-merge"
common=require "./webpack.common.js"

module.exports=merge.merge common,
	devtool: 'source-map'
	mode: "production"
