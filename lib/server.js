const express = require('express')
const app = express()
const netApi = require('./proxy.js')
const port = process.env.PORT || 8080
const cors = require('cors')
const fetch = require('node-fetch')

app.use(cors())
app.use(netApi({ allowOrigin: '*' }))

app.use("/proxyCheck",(req,res,next)=>{
	res.send("OK")
})

app.get("/getId",(req,res,next)=>{
	fetch(`https://api.mojang.com/users/profiles/minecraft/${req.query.nick}`)
		.then(data => data.json())
		.then(player => {res.send(player.id)})
		.catch(error =>{
			res.send("ERR")
		})
})

app.get("/getSkin",(req,res,next)=>{
	fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${req.query.id}?legacy=true`)
		.then(data => data.json())
		.then(player => {res.json(player)})
		.catch(error =>{
			res.send("ERR")
		})
})

app.listen(port, () => {
  console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`)
})

module.exports = { app, port }
