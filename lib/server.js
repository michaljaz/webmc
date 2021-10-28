const express = require('express')
const app = express()
const netApi = require('./proxy.js')
const port = process.env.PORT || 8080
const cors = require('cors')

app.use(cors())
app.use(netApi({ allowOrigin: '*' }))

app.use("/proxyCheck",(req,res,next)=>{
	res.send("OK")
})

app.listen(port, () => {
  console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`)
})

module.exports = { app, port }
