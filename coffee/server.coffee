module.exports=(type)->
	#biblioteki
	opn=require "opn"
	fs=require "fs"
	config=JSON.parse fs.readFileSync(__dirname+"/../config.json")
	http=require "http"
	server=http.createServer()
	io=require("socket.io")(server)
	express=require 'express'
	app=express();
	mineflayer = require 'mineflayer'
	Chunk = require("prismarine-chunk")(config.realServer.version)
	vec3=require "vec3"
	Convert = require 'ansi-to-html'
	convert = new Convert()

	opn("http://#{config.host}:#{config['express-port']}")

	#początkowe zmienne
	sf={}
	port=config["express-port"]
	socketInfo={}

	#Konfiguracja serwera express
	if type is "production"
		app.use express.static(__dirname + "/dist/")
	else
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

	#websocket
	io.sockets.on "connection", (socket)->
		socketInfo[socket.id]={}
		bot=socketInfo[socket.id]
		socket.on "initClient",(data)->
			console.log "[+] "+data.nick

			#Dodawanie informacji o graczu do socketInfo
			socketInfo[socket.id]=data
			socketInfo[socket.id].bot=mineflayer.createBot {
				host: config.realServer.ip
				port: config.realServer.port
				username: socketInfo[socket.id].nick
				version: config.realServer.version
			}
			bot=()->
				return socketInfo[socket.id].bot
			emit=(array)->
				io.to(socket.id).emit array...
			#Eventy otrzymywane z serwera minecraftowego
			bot()._client.on "map_chunk",(packet)->
				cell=new Chunk()
				cell.load packet.chunkData,packet.bitMap,false,true
				emit ["mapChunk", cell.sections,packet.x,packet.z,packet.biomes]
				return
			botEventMap={
				"move":()->
					emit ["move",bot().entity.position]
					return
				"health":()->
					emit ["hp",bot().health]
					emit ["food",bot().food]
					return
				"spawn":()->
					emit ["spawn",bot().entity.yaw,bot().entity.pitch]
					return
				"kicked":(reason,loggedIn)->
					emit ["kicked",reason]
					return
				"message":(msg)->
					emit ["msg",convert.toHtml(msg.toAnsi())]
					return
				"experience":()->
					emit ["xp",bot().experience]
					return
				"blockUpdate":(oldb,newb)->
					emit ["blockUpdate",[newb.position.x,newb.position.y,newb.position.z,newb.stateId]]
					return
			}
			for i of botEventMap
				socketInfo[socket.id].bot.on i, botEventMap[i]

			inv=""
			socketInfo[socket.id].int=setInterval ()->
				inv_new=JSON.stringify(bot().inventory.slots)
				if inv isnt inv_new
					inv=inv_new
					emit "inventory",bot().inventory.slots
			,100
			socketEventMap={
				"move":(state,toggle)->
					bot().setControlState(state,toggle)
					return
				"command":(com)->
					bot().chat(com)
					return
				"rotate":(data)->
					bot().look data...
					return
				"disconnect":()->
					try
						clearInterval socketInfo[socket.id].int
						console.log "[-] "+socketInfo[socket.id].nick
						socketInfo[socket.id].bot.end()
						delete socketInfo[socket.id]
					return
			}
			for i of socketEventMap
				socket.on i,socketEventMap[i]
