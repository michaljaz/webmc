
axios = require 'axios'
JSSoup = require('jssoup').default
fs = require 'fs'

if not fs.existsSync "#{__dirname}/assets/items/"
  fs.mkdirSync "#{__dirname}/assets/items/"

removeBg=()->
	replaceColor = require 'replace-color'
	fs=require "fs"

	removeBg=(filePath)->
		replaceColor {
			image: filePath
			colors: {
				type: 'rgb'
				targetColor: [139, 139, 139]
				replaceColor: [0,0,0,0]
			}
		}, (err, jimpObject)->
			if err
				return console.log err
			jimpObject.write filePath, (err) ->
				if err
					return console.log err

	dir_path="#{__dirname}/assets/items/"
	fs.readdir dir_path, (err, files)->
		files.forEach (file)->
			filePath="#{__dirname}/assets/items/"+file
			removeBg filePath
			return
		return
axios({
	method: 'GET'
	url: "https://www.digminecraft.com/lists/item_id_list_pc.php"
	encoding: "utf-8"
}).then (r)->
	soup=new JSSoup r.data
	map={}
	last=null
	ile=0
	zal=0
	req=(type,url)->
		file=fs.createWriteStream "#{__dirname}/assets/items/#{type}.png"
		axios({
			method:"GET"
			url
			responseType:"stream"
		}).then (r)->
			console.log "\x1b[32m#{type} \x1b[33m#{url}\x1b[0m"
			r.data.pipe file
			zal+=1
			if ile is zal
				console.log "\x1b[32mRemoving gray backgrounds...\x1b[0m"
				removeBg()
			return
		.catch (e)->
			console.log "Reconnecting..."
			req type,url
		return
	for i in soup.findAll("td")
		if (i.text isnt "&nbsp;") and (i.text.includes "minecraft:")
			ile+=1
			title=i.text.split("(")[0]
			war=0
			for j in [0..i.text.length-1]
				if i.text[j] is "("
					war=j
			req((i.text.substr war+11).split(")")[0],"https://www.digminecraft.com#{last}")
		else if i.find("img") isnt undefined
			last=i.find("img").attrs["data-src"]
	return

