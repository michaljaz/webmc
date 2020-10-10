fs=require "fs"
opn=require "opn"
http=require "http"
server=http.createServer()
io=require("socket.io")(server)
express=require('express')
app=express();
term=require( 'terminal-kit' ).terminal
mineflayer = require('mineflayer')

exec=(cmd)->
	exec = require('child_process').exec;
	return new Promise (resolve, reject) ->
		exec cmd, (error, stdout, stderr) ->
			if error
				console.warn error
			resolve stdout ? stdout : stderr
			return
		return

config=JSON.parse fs.readFileSync(__dirname+"/config.json")

port=config["express-port"]

app.use express.static(__dirname + "/../client/")
app.use (req, res, next) ->
	res.set 'Cache-Control', 'no-store'
	next()
app.get "/websocket/",(req,res)->
	res.send String(config["websocket-port"])
app.get "/host/",(req,res)->
	res.send String(config["host"])
app.listen port

world={}
saveWorld=->
	fs.writeFileSync __dirname+"/savedWorld.json",JSON.stringify(world)
restoreWorld=->
	world=JSON.parse fs.readFileSync(__dirname+'/savedWorld.json')
restoreWorld()
players={}
socketInfo={}

io.sockets.on "connection", (socket)->
	socket.emit "firstLoad",world
	socket.on "initClient",(data)->
		socketInfo[socket.id]=data
		dolaczGracza socket.id
	socket.on "playerUpdate",(data)->
		players[socket.id]=data
		io.sockets.emit "playerUpdate",players
	socket.on "blockUpdate",(block)->
		world["#{block[0]}:#{block[1]}:#{block[2]}"]=block[3]
		if block[3] is 0
			delete world["#{block[0]}:#{block[1]}:#{block[2]}"]
		io.sockets.emit "blockUpdate",block
		saveWorld()
	socket.on "disconnect", ->
		odlaczGracza socket.id
		delete players[socket.id]
		delete socketInfo[socket.id]
server.listen config["websocket-port"]



term.windowTitle "web-minecraft console"
term.clear()
term.green (fs.readFileSync(__dirname+'/../src/asciiLogo'))

log=(message)->
	term("\n#{message}\n")
	return
stop=->
	term.brightGreen "\nServer stopped!\n"
	process.exit()
	return
help=->
	term.brightGreen("\n
help\t- pomoc\n
stop\t- zatrzymanie serwera\n
open\t- uruchomienie przeglądarki pod adresem serwera\n
copen\t- uruchamianie gry w przeglądarce chrome w wersji 'app'\n
list\t- wypisuje wszystkich aktywnych użytkowników\n
clear\t- czyści consolę\n
info\t- wypisuje informacje o serwerze\n
")
	return
info=->
	term "\n"
	term.table [
			[ "Typ serwera" , "Adres serwera" ] ,
			[ "Serwer websocket" , "#{config.host}:#{config["websocket-port"]}" ] ,
			[ "Serwer express" , "#{config.host}:#{config["express-port"]}" ] ,
			[ "Serwer minecraftowy" , "#{config.realServer.ip}:#{config.realServer.port}" ] ,
		] , {
			hasBorder: true ,
			contentHasMarkup: true ,
			borderChars: 'lightRounded' ,
			borderAttr: { color: 'blue' } ,
			textAttr: { bgColor: 'default' } ,
			firstRowTextAttr: { bgColor: 'blue' } ,
			width: 60 ,
			fit: true
		}
	return
com=(command)->
	if command is "stop"
		stop()
	else if command is "help" or command is "?"
		help()
	else if command is "clear"
		term.clear()
	else if command is "list"
		Object.keys(socketInfo).forEach (p)->
			term "\n#{p} (#{socketInfo[p].nick})"
	else if command is "open"
		opn("http://#{config["host"]}:#{config["express-port"]}")
	else if command is "copen"
		exec("google-chrome --app=http://#{config["host"]}:#{config["express-port"]}")
	else if command is "info"
		info()
	else if command isnt ""
		term.red "\nNieznana komenda. Użyj 'help' lub '?' aby uzyskać pomoc." 
	incon()
	return
incon=->
	term.green "\nserver> "
	term.inputField { 
		autoComplete: [
			'help' ,
			'stop' ,
			'?',
			'open',
			'clear',
			'info',
			'list',
			'copen'
		] ,
		autoCompleteHint: true ,
		autoCompleteMenu: true
	},( er , input )->
		com input
		return
term.on 'key' , ( name , matches , data )->
	if name is 'CTRL_C' 
		stop() 
	return
info()
incon()
dolaczGracza=(socketid)->
	socketInfo[socketid].bot=mineflayer.createBot {
		host: config.realServer.ip
		port: config.realServer.port
		username: socketInfo[socketid].nick
	}

	socketInfo[socketid].bot._client.on "map_chunk",(data)->
		io.to(socketid).emit "mapChunk",data
		return

	socketInfo[socketid].bot.on 'chat',(username, message)->
		if username is socketInfo[socketid].bot.username
			return
		socketInfo[socketid].bot.chat message
		return
	return
odlaczGracza=(socketid)->
	socketInfo[socketid].bot.end()
	return
