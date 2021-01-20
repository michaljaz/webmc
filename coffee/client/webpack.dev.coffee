
merge=require "webpack-merge"
common=require "#{__dirname}/webpack.common.js"
webpack=require "webpack"
module.exports=merge.merge common,
	devtool: 'inline-source-map'
	mode: "development"
	plugins:[
		new webpack.DefinePlugin {
			PRODUCTION: JSON.stringify(false)
		}
	]
