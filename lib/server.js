const express = require('express')
const app = express()
const netApi = require('./proxy.js')
const port = process.env.PORT || 8080
const cors = require('cors')
const axios = require('axios');

app.use(cors())
app.use(netApi({ allowOrigin: '*' }))

app.use("/proxyCheck",(req,res,next)=>{
	res.send("OK")
})

app.get("/getId",(req,res,next)=>{
	axios.get(`https://api.mojang.com/users/profiles/minecraft/${req.query.nick}`,{responseType: 'json'})
  .then(function (response) {
		if(response.status==204){
			res.send('ERR')
		}else{
			res.send(response.data.id)
		}
  })
  .catch(function (error) {
    res.send("ERR")
  })
})

app.get("/getSkin",(req,res,next)=>{
	axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${req.query.id}?legacy=true`,{responseType: 'json'})
  .then(function (response) {
		res.json(response.data)
  })
  .catch(function (error) {
    res.send("ERR")
  })
})

app.listen(port, () => {
  console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`)
})

module.exports = { app, port }
