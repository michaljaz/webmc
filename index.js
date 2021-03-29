const express = require('express')
const app = express()
const helmet = require('helmet')
const compression = require('compression')
const port = process.env.PORT || 8080
const netApi = require('@misioxd/net-browserify')
const path = require('path')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const devconfig = require('./src/webpack.dev.js')
const compiler = webpack(devconfig)

app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(netApi({ allowOrigin: '*' }))
app.use(middleware(compiler))

app.listen(port, function () {
  return console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`)
})
