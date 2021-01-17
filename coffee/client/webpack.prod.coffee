
merge=require "webpack-merge"
common=require "./webpack.common.js"
webpack=require "webpack"
module.exports=merge.merge common,
	devtool: 'source-map'
	mode: "production"
	plugins:[
		new webpack.DefinePlugin {
			PRODUCTION: JSON.stringify(true)
		}
	]
