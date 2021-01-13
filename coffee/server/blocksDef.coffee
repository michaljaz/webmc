fs=require "fs"
Block=require("prismarine-block")("1.16.3")
maxStateId=17111
result=[]
for i in [0..maxStateId]
	if Block.fromStateId(i).boundingBox is "block"
		bbox=1
	else
		bbox=0
	result.push [Block.fromStateId(i).name,bbox]
console.log result
buildPath="#{__dirname}/../client/static/assets/blocks"

fs.writeFileSync "#{buildPath}/blocksDef.json", JSON.stringify(result)
