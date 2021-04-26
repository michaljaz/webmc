const { port } = require('./server.js')
const { exec } = require('child_process')

exec(`./bin/pgrok -log=stdout -subdomain=web-minecraft-proxy ${port}`)
