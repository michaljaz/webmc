fs=require "fs"
config=require "./server.json"
pBlock=require("prismarine-block")(config.version)
atlasCreator=require "./atlasCreator.coffee"

new atlasCreator {
	pref:"items"
	toxelSize:50
	loadPath:"#{__dirname}/assets/items"
	buildPath:"#{__dirname}/client/assets/items"
	atlasSize:32
	oneFrame:false
}
new atlasCreator {
	pref:"blocks"
	toxelSize:16
	loadPath:"#{__dirname}/assets/blocks"
	buildPath:"#{__dirname}/client/assets/blocks"
	atlasSize:36
	oneFrame:false
}
new atlasCreator {
	pref:"blocksSnap"
	toxelSize:16
	loadPath:"#{__dirname}/assets/blocks"
	buildPath:"#{__dirname}/client/assets/blocks"
	atlasSize:27
	oneFrame:true
}

maxStateId=0
for i in [0..100000]
	block=pBlock.fromStateId i
	if block.type is undefined
		maxStateId=i-1
		break
console.log "\x1b[33mBlock max stateId: #{maxStateId}\x1b[0m"
result=[]
for i in [0..maxStateId]
	block=pBlock.fromStateId i
	result.push [
		block.name
		if block.boundingBox is "block" then 1 else 0
		if block.transparent then 1 else 0
	]
buildPath="#{__dirname}/client/assets/blocks/blocksDef.json"
fs.writeFileSync buildPath, JSON.stringify(result)
console.log "\x1b[32mGenerated blocksDefinitions: #{buildPath}\x1b[0m\n"

