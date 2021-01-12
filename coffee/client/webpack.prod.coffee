
merge=require "webpack-merge"
common=require "./webpack.common.js"

module.exports=merge.merge common,
	mode: "production"
