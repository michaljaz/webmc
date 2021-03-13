const opn = require('open')
const express = require('express')
const app = express()
const helmet = require('helmet')
const compression = require('compression')
const port = process.env.PORT || 8080
const netApi = require('net-browserify')
const path = require('path')

app.use(
  helmet({
    contentSecurityPolicy: false
  })
)
app.use(netApi({ allowOrigin: '*' }))
app.use(compression())

const mode = process.argv[2]
if (mode === 'production') {
  app.use(express.static(path.join(__dirname, 'src/dist')))
} else if (mode === 'development') {
  const webpack = require('webpack')
  const middleware = require('webpack-dev-middleware')
  const devconfig = require('./src/webpack.dev.js')
  const compiler = webpack(devconfig)
  app.use(middleware(compiler))
} else {
  console.log('Incorrect mode!')
}
app.listen(port, function () {
  opn(`http://localhost:${port}`)
  return console.log(`Server is running on \x1b[34m*:${port}\x1b[0m`)
})
