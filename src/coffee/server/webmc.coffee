
fs=require "fs"
http=require "http"
server=http.createServer()
io=require("socket.io")(server)
express=require 'express' 
app=express();

sf={}

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

server.listen config["websocket-port"]


io.sockets.on "connection", (socket)->
	socket.on "initClient",(data)->
		try
			sf.onjoin socket.id,data
	socket.on "playerUpdate",(data)->
		try
			sf.onplayerUpdate data
	socket.on "blockUpdate",(block)->
		try
			sf.onblockUpdate block...
	socket.on "disconnect", ->
		try
			sf.onleave socket.id
module.exports={
	on:(type,f)->
		if type=="join"
			sf.onjoin=f
		if type=="leave"
			sf.onleave=f
		if type=="blockUpdate"
			sf.onblockUpdate=f
		if type=="playerUpdate"
			sf.onplayerUpdate=f
	send:(socketid,message,data)->
		io.to(socketid).emit message,data
	broadcast:(message,data)->
		io.sockets.emit message,data
	config
}