module.exports=(mode)->
	opn=require "opn"
	fs=require "fs"
	config=JSON.parse fs.readFileSync "#{__dirname}/server.json"
	express=require("express")
	app=express()
	server=require("http").createServer(app)
	io=require("socket.io")(server)
	mineflayer = require "mineflayer"
	Chunk = require("prismarine-chunk")(config.version)
	vec3=require "vec3"
	Convert = require "ansi-to-html"
	convert = new Convert()
	helmet = require "helmet"

	port=process.env.PORT or 8080

	app.use helmet()

	if mode is "production"
		app.use express.static "#{__dirname}/client/dist"
	else
		webpack = require "webpack"
		middleware = require "webpack-dev-middleware"
		devconfig=require "#{__dirname}/client/webpack.dev.coffee"
		compiler = webpack devconfig
		app.use middleware compiler

	server.listen port,()->
		opn "http://localhost:#{port}"
		console.log "Server is running on \x1b[34m*:#{port}\x1b[0m"

	io.sockets.on "connection", (socket)->
		query=socket.handshake.query
		console.log "[\x1b[32m+\x1b[0m] #{query.nick}"
		heldItem=null

		bot=mineflayer.createBot {
			host: config.ip
			port: config.port
			username: query.nick
			version: config.version
		}

		emit=(array)->
			io.to(socket.id).emit array...

		bot._client.on "map_chunk",(packet)->
			cell=new Chunk()
			cell.load packet.chunkData,packet.bitMap,true,true
			emit ["mapChunk", cell.sections,packet.x,packet.z,packet.biomes]
			return
		bot._client.on "respawn",(packet)->
			emit ["dimension",packet.dimension.value.effects.value]
			return
		botEventMap=
			"heldItemChanged":(item)->
				heldItem=item
				return
			"login":()->
				emit ["dimension",bot.game.dimension]
				return
			"move":()->
				emit ["move",bot.entity.position]
				return
			"health":()->
				emit ["hp",bot.health]
				emit ["food",bot.food]
				return
			"spawn":()->
				emit ["spawn",bot.entity.yaw,bot.entity.pitch]
				return
			"kicked":(reason,loggedIn)->
				emit ["kicked",reason]
				return
			"message":(msg)->
				emit ["msg",convert.toHtml(msg.toAnsi())]
				return
			"experience":()->
				emit ["xp",bot.experience]
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
		for i of botEventMap
			((i)->
				bot.on i, ()->
					if bot isnt null
						botEventMap[i] arguments...
					return
			)(i)
		inv=""
		interval=setInterval ()->
			inv_new=JSON.stringify(bot.inventory.slots)
			if inv isnt inv_new
				inv=inv_new
				emit ["inventory",bot.inventory.slots]
			entities=[]
			for k,v of bot.entities
				if v.type is "mob"
					entities.push [v.position.x,v.position.y,v.position.z]
			emit ["entities",entities]
			return
		,10
		socketEventMap=
			"fly":(toggle)->
				if toggle
					bot.creative.startFlying()
				else
					bot.creative.stopFlying()
				return
			"blockPlace":(pos,vec)->
				block=bot.blockAt(new vec3(pos...))
				vecx=[
					[1,0,0]
					[-1,0,0]
					[0,1,0]
					[0,-1,0]
				]
				if heldItem isnt undefined and heldItem isnt null
					console.log heldItem
					bot.placeBlock block,new vec3(vec...),(r)->
						console.log r
						return
				return
			"invc":(num)->
				item=bot.inventory.slots[num+36]
				if item isnt null and item isnt undefined
					bot.equip item,"hand"
				else if heldItem isnt undefined
					bot.unequip "hand"
				return
			"move":(state,toggle)->
				bot.setControlState(state,toggle)
				return
			"command":(com)->
				bot.chat(com)
				return
			"rotate":(data)->
				bot.look data...
				return
			"disconnect":()->
				try
					clearInterval interval
					console.log "[\x1b[31m-\x1b[0m] #{query.nick}"
					bot.end()
				return
			"dig":(pos)->
				block=bot.blockAt(vec3(pos[0],pos[1]-16,pos[2]))
				if block isnt null
					digTime=bot.digTime(block)
					if bot.targetDigBlock isnt null
						console.log "Already digging..."
						bot.stopDigging()
					emit ["digTime",digTime,block]
					console.log "Start"
					bot.dig block,false,(xd)->
						if xd is undefined
							console.log "SUCCESS"
						else
							console.log "FAIL"
				return
			"stopDigging":(callback)->
				bot.stopDigging()
				return
		for i of socketEventMap
			socket.on i,socketEventMap[i]
		return
	return
