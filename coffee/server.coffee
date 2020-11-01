module.exports=(config)->
	fs=require "fs"
	http=require "http"
	server=http.createServer()
	io=require("socket.io")(server)
	express=require 'express'
	app=express();
	mineflayer = require 'mineflayer'
	Chunk = require("prismarine-chunk")("1.16.1")
	vec3=require "vec3"

	sf={}
	port=config["express-port"]
	world={}
	#Zapisywanie i odczytywanie świata
	saveWorld=->
		fs.writeFileSync __dirname+"/savedWorld.json",JSON.stringify(world)
	restoreWorld=->
		world=JSON.parse fs.readFileSync(__dirname+'/savedWorld.json')

	restoreWorld()

	players={}
	socketInfo={}

	app.use express.static(__dirname + "/client/")
	app.use (req, res, next) ->
		res.set 'Cache-Control', 'no-store'
		next()
	app.get "/websocket/",(req,res)->
		res.send String(config["websocket-port"])
	app.get "/host/",(req,res)->
		res.send String(config["host"])
	app.listen port

	server.listen config["websocket-port"]

	#On connect
	io.sockets.on "connection", (socket)->

		#Trying to run special functions
		socket.on "initClient",(data)->
			console.log "[+] "+data.nick
			#init socketInfo
			socketInfo[socket.id]=data

			#socketInfo add Bot
			socketInfo[socket.id].bot=mineflayer.createBot {
				host: config.realServer.ip
				port: config.realServer.port
				username: socketInfo[socket.id].nick
			}
			#On recieve real Map Chunk
			socketInfo[socket.id].bot._client.on "map_chunk",(packet)->

				cell=new Chunk()
				cell.load packet.chunkData,packet.bitMap,false,true
				io.to(socket.id).emit "mapChunk", cell.sections,packet.x,packet.z

				# console.log packet
				return

			socketInfo[socket.id].bot.on 'chat',(username, message)->
				if username is socketInfo[socket.id].bot.username
					return
				socketInfo[socket.id].bot.chat message
				return
			#first world load
			io.to(socket.id).emit "firstLoad",world
			return
		socket.on "playerUpdate",(data)->
			players[socket.id]=data
			io.sockets.emit "playerUpdate", players
		socket.on "blockUpdate",(block)->
			world["#{block[0]}:#{block[1]}:#{block[2]}"]=block[3]
			if block[3] is 0
				delete world["#{block[0]}:#{block[1]}:#{block[2]}"]
			io.sockets.emit "blockUpdate",block
			saveWorld()
		socket.on "disconnect", ->
			console.log "[-] "+socketInfo[socket.id].nick

			#end bot session
			socketInfo[socket.id].bot.end()
			#delete socketinfo
			delete players[socket.id]
			delete socketInfo[socket.id]
			return
