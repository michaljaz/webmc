webmc=require "./webmc"
mineflayer = require 'mineflayer'
vec3=require "vec3"
fs=require "fs"
Chunk = require("prismarine-chunk")("1.16.1")
vec3=require "vec3"

world={}

saveWorld=->
	fs.writeFileSync __dirname+"/savedWorld.json",JSON.stringify(world)
restoreWorld=->
	world=JSON.parse fs.readFileSync(__dirname+'/savedWorld.json')

restoreWorld()
players={}
socketInfo={}

webmc.on "blockUpdate", (x,y,z,v)->
	world["#{x}:#{y}:#{z}"]=v
	if v is 0
		delete world["#{x}:#{y}:#{z}"]
	webmc.broadcast "blockUpdate",[x,y,z,v]
	saveWorld()

webmc.on "join", (socketid,data)->
	console.log "NEW: "+socketid
	#init socketInfo
	socketInfo[socketid]=data

	#socketInfo add Bot
	socketInfo[socketid].bot=mineflayer.createBot {
		host: webmc.config.realServer.ip
		port: webmc.config.realServer.port
		username: socketInfo[socketid].nick
	}

	socketInfo[socketid].bot._client.on "map_chunk",(packet)->

		# cell=new Chunk()
		# cell.load packet.chunkData,packet.bitMap,false,true
		# console.log cell.fromJson
		webmc.send socketid, "mapChunk", packet

		# console.log packet
		return
	socketInfo[socketid].bot.on 'chat',(username, message)->
		if username is socketInfo[socketid].bot.username
			return
		socketInfo[socketid].bot.chat message
		return
	#first world load
	webmc.send socketid,"firstLoad",world


	return
webmc.on "leave", (socketid)->
	console.log "DIS: "+socketid

	#end bot session
	socketInfo[socketid].bot.end()
	#delete socketinfo
	delete players[socket.id]
	delete socketInfo[socket.id]

	return
webmc.on "playerUpdate",(data)->
	players[socket.id]=data
	webmc.broadcast "playerUpdate", data
