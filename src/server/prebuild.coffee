fs=require "fs"
config=require "./server.json"
pBlock=require("prismarine-block")(config.version)
atlasCreator=require "./atlasCreator.coffee"

maxStateId=0
for i in [0..100000]
    block=pBlock.fromStateId i
    if block.type is undefined
        maxStateId=i-1
        break
console.log "\x1b[33mBlock max stateId: #{maxStateId}\x1b[0m"
result=[]
for i in [0..maxStateId]
	if pBlock.fromStateId(i).boundingBox is "block"
		bbox=1
	else
		bbox=0
	result.push [pBlock.fromStateId(i).name,bbox]
buildPath="#{__dirname}/../client/static/assets/blocks/blocksDef.json"
fs.writeFileSync buildPath, JSON.stringify(result)
console.log "\x1b[32mGenerated blocksDefinitions: #{buildPath}\x1b[0m\n"

new atlasCreator {
    pref:"items"
    size:50
    xpath:"#{__dirname}/items"
    buildPath:"#{__dirname}/../client/static/assets/items"
    totalImages:975
    atlasSize:32
    mini:false
    miniAtlasSize:0
}
new atlasCreator {
    pref:"blocks"
    size:16
    xpath:"#{__dirname}/blocks"
    buildPath:"#{__dirname}/../client/static/assets/blocks"
    totalImages:694
    atlasSize:36
    mini:true
    miniAtlasSize:27
}

