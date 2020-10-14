fs=require "fs"
fs.writeFile "#{__dirname}/../.gitignore", '.gitignore\nnode_modules', (err)->
	if err 
		return console.log err