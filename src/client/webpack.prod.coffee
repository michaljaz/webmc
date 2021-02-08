
merge=require "webpack-merge"
common=require "#{__dirname}/webpack.common.coffee"
webpack=require "webpack"
module.exports=merge.merge common,
	mode: "production"
	plugins:[
		new webpack.DefinePlugin {
			PRODUCTION: JSON.stringify(true)
		}
	]