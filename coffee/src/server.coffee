module.exports=(type)->
	#biblioteki
	opn=require "opn"
	fs=require "fs"
	config=JSON.parse fs.readFileSync(__dirname+"/../config.json")
	http=require "http"
	express=require 'express'
	app=express()
	server=http.createServer(app)
	io=require("socket.io")(server)
	request = require 'request'
	mineflayer = require 'mineflayer'
	Chunk = require("prismarine-chunk")(config.realServer.version)
	vec3=require "vec3"
	Convert = require 'ansi-to-html'
	convert = new Convert()

	#początkowe zmienne
	sf={}
	socketInfo={}

	#Konfiguracja serwera express
	if type is "production"
		app.use express.static(__dirname + "/dist/")
	else
		app.use express.static(__dirname + "/client/")
	app.set 'view engine', 'ejs'
	app.set 'views', "#{__dirname}/views"
	app.get "/", (req,res)->
		res.render "index"
	app.use (req, res, next) ->
		res.set 'Cache-Control', 'no-store'
		next()
	server.listen config["port"],()->
		console.log "Server is running on \x1b[34m*:#{config["port"]}\x1b[0m"
		# opn("http://#{config.host}:#{config['express-port']}")

	#websocket
	io.sockets.on "connection", (socket)->
		socketInfo[socket.id]={}
		bot=socketInfo[socket.id]
		socket.on "initClient",(data)->
			console.log "[\x1b[32m+\x1b[0m] "+data.nick

			#Dodawanie informacji o graczu do socketInfo
			socketInfo[socket.id]=data
			socketInfo[socket.id].bot=mineflayer.createBot {
				host: config.realServer.ip
				port: config.realServer.port
				username: socketInfo[socket.id].nick
				version: config.realServer.version
			}
			bot=()->
				if socketInfo[socket.id] isnt undefined
					return socketInfo[socket.id].bot
				else
					return null
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
					# diamond=bot().inventory.slots[36]
					# ac=bot().inventory.slots[37]
					# console.log diamond,ac
					# bot().equip ac,"hand"
					# bot().heldItem.slot=37
					# console.log bot().updateHeldItem()
					# console.log bot().heldItem
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
				"diggingCompleted":(block)->
					emit ["diggingCompleted",block]
					return
				"diggingAborted":(block)->
					emit ["diggingAborted",block]
					return
			}
			for i of botEventMap
				((i)->
					socketInfo[socket.id].bot.on i, ()->
						if bot() isnt null
							botEventMap[i] arguments...
						return
				)(i)
			inv=""
			socketInfo[socket.id].int=setInterval ()->
				inv_new=JSON.stringify(bot().inventory.slots)
				if inv isnt inv_new
					inv=inv_new
					emit ["inventory",bot().inventory.slots]
				emit ["entities",bot().entities]
				return
			,10
			socketEventMap={
				"invc":(num)->
					item=bot().inventory.slots[num+36]
					if item isnt null
						console.log item
						try
							bot().equip item,"hand"
					else
						bot().unequip "hand"
					return
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
						console.log "[\x1b[31m-\x1b[0m] "+socketInfo[socket.id].nick
						socketInfo[socket.id].bot.end()
						delete socketInfo[socket.id]
					return
				"dig":(pos)->
					block=bot().blockAt(vec3(pos[0],pos[1]-16,pos[2]))
					if block isnt null
						digTime=bot().digTime(block)
						if bot().targetDigBlock isnt null
							console.log "Already digging..."
							bot().stopDigging()
						emit ["digTime",digTime,block]
						console.log "Start"
						bot().dig block,false,(xd)->
							if xd is undefined
								console.log "SUCCESS"
							else
								console.log "FAIL"
					return
				"stopDigging":(callback)->
					bot().stopDigging()
					return
			}
			for i of socketEventMap
				socket.on i,socketEventMap[i]
			return
		return
