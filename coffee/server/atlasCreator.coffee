path=require "path"
fs=require "fs"
Canvas=require "canvas"

module.exports=(pref,size,xpath,buildPath,totalImages,atlasSize,mini,miniAtlasSize)->
	createCanvas=Canvas.createCanvas
	loadImage=Canvas.loadImage
	Image=Canvas.Image

	toxelX=1
	toxelY=1
	miniX=1
	miniY=1
	loadedImages=0

	if not fs.existsSync buildPath
		fs.mkdirSync buildPath


	canvas=createCanvas atlasSize*size,atlasSize*size
	ctx=canvas.getContext '2d'

	images={}
	textureMapping={}
	miniMapping={}

	firstLoad=->
		fs.readdir xpath, (err, files)->
			files.forEach (file)->
				filePath="#{xpath}/#{file}"
				if path.extname(file) is ".png"
						addImageToLoad filePath,file
				return
			return
		return
	addImageToLoad=(filePath,name)->
		img=new Image
		img.onload=->
			images[name]=img
			loadedImages++
			if loadedImages is totalImages
					forEachToxel()
		img.src=filePath
	forEachToxel=->
		Object.keys(images).forEach (name)->
			img=images[name]
			addToxelToAtlas img,name
		updateAtlas()
	addToxelToAtlas=(img,name)->
		w=img.width/size
		h=img.height/size
		if w>1 or h>1
			for i in [0..w-1]
				for j in [0..h-1]
					ctx.drawImage img,i*size,j*size,size,size,(toxelX-1)*size, (toxelY-1)*size, size,size
					textureMapping[name.substr(0,name.length-4)+"@#{i}@#{j}"]={x:toxelX,y:toxelY}
					moveToxel()
		else
			ctx.drawImage img, (toxelX-1)*size, (toxelY-1)*size, size,size
			textureMapping[name.substr(0,name.length-4)]={x:toxelX,y:toxelY}
			moveToxel()
		if mini
			miniMapping[name.substr(0,name.length-4)]={x:miniX,y:miniY}
			if miniX is miniAtlasSize
				miniX=1
				miniY+=1
			else
				miniX+=1
	moveToxel=->
		if toxelX is atlasSize
			toxelX=1
			toxelY+=1
		else
			toxelX+=1
	updateAtlas=(path)->
		fs.writeFileSync "#{buildPath}/#{pref}Atlas-full.png", canvas.toBuffer('image/png')
		console.log "\x1b[33mSAVING: #{buildPath}/#{pref}Atlas-full.png"

		fs.writeFileSync "#{buildPath}/#{pref}Mapping-full.json",JSON.stringify(textureMapping,null,2)
		console.log "\x1b[33mSAVING: #{buildPath}/#{pref}Mapping-full.json"
		if mini
			fs.writeFileSync "#{buildPath}/#{pref}Mapping.json",JSON.stringify(miniMapping,null,2)
			console.log "\x1b[33mSAVING: #{buildPath}/#{pref}Mapping.json"

		console.log "\x1b[32mSuccessfully created #{canvas.width}x#{canvas.height} Texture Atlas!\n\x1b[0m"
	firstLoad()
	return
