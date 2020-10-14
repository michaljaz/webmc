util=require "util"
exec=require('child_process').exec
fs=require "fs"
process = require 'child_process'

wget=(url,result)->
	child=exec 'curl '+url+' > '+result, (error, stdout, stderr)->
		if error isnt null
			console.log 'exec error: '+error
server=__dirname+"/../minecraft"
server_jar=__dirname+"/../minecraft/server.jar"
eula_txt=__dirname+"/../minecraft/eula.txt"
start_sh=__dirname+"/../minecraft/start.sh"
if not fs.existsSync server_jar
	console.log "Downloading server jar..."
	wget 'https://cdn.getbukkit.org/spigot/spigot-1.16.1.jar', server_jar
else
	console.log "Server.jar already exist"

console.log "Writing start.sh file..."
fs.writeFileSync start_sh,"#!/bin/bash\ncd #{server}\njava -jar #{server_jar} nogui"

console.log "RUNNING SERVER!"

process.spawn("#{start_sh}", [], { stdio: 'inherit' })
