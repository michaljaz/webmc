const express = require('express')
const app = express()
const netApi = require('@misioxd/net-browserify')
const port = process.env.PORT || 8080

app.use(netApi({ allowOrigin: '*' }))

app.listen(port, () => {
  console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`)
})

module.exports = { app, port }
