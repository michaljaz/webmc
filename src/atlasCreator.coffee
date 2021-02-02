path=require "path"
fs=require "fs"
Canvas=require "canvas"

class AtlasCreator
	constructor:(options)->
		@pref=options.pref
		@size=options.size
		@xpath=options.xpath
		@buildPath=options.buildPath
		@totalImages=options.totalImages
		@atlasSize=options.atlasSize
		@mini=options.mini
		@miniAtlasSize=options.miniAtlasSize

		@canvas=Canvas.createCanvas @atlasSize*@size,@atlasSize*@size
		@ctx=@canvas.getContext '2d'
		@toxelX=1
		@toxelY=1
		@miniX=1
		@miniY=1
		@loadedImages=0
		@images={}
		@textureMapping={}
		@miniMapping={}
		@emptyDir()
		@firstLoad()
		return
	emptyDir:()->
		if not fs.existsSync @buildPath
			fs.mkdirSync @buildPath
		return
	firstLoad:()->
		_this=@
		fs.readdir @xpath, (err, files)->
			files.forEach (file)->
				filePath="#{_this.xpath}/#{file}"
				if path.extname(file) is ".png"
					# console.log filePath
					_this.addImageToLoad filePath,file
				return
			return
		return
	addImageToLoad:(filePath,name)->
		_this=@
		img=new Canvas.Image
		img.onload=->
			_this.images[name]=img
			_this.loadedImages++
			if _this.loadedImages is _this.totalImages
				_this.forEachToxel()
		img.src=filePath
		return
	forEachToxel:()->
		_this=@
		Object.keys(@images).forEach (name)->
			img=_this.images[name]
			_this.addToxelToAtlas img,name
			return
		@updateAtlas()
	addToxelToAtlas:(img,name)->
		w=img.width/@size
		h=img.height/@size
		if w>1 or h>1
			for i in [0..w-1]
				for j in [0..h-1]
					@ctx.drawImage img,i*@size,j*@size,@size,@size,(@toxelX-1)*@size,(@toxelY-1)*@size, @size,@size
					@textureMapping["#{name.substr(0,name.length-4)}@#{i}@#{j}"]={x:@toxelX,y:@toxelY}
					@moveToxel()
		else
			@ctx.drawImage img,(@toxelX-1)*@size,(@toxelY-1)*@size,@size,@size
			@textureMapping[name.substr(0,name.length-4)]={x:@toxelX,y:@toxelY}
			@moveToxel()
		if @mini
			@miniMapping[name.substr(0,name.length-4)]={x:@miniX,y:@miniY}
			if @miniX is @miniAtlasSize
				@miniX=1
				@miniY+=1
			else
				@miniX+=1
		return
	moveToxel:()->
		if @toxelX is @atlasSize
			@toxelX=1
			@toxelY+=1
		else
			@toxelX+=1
		return
	updateAtlas:(path)->
		fs.writeFileSync "#{@buildPath}/#{@pref}Atlas-full.png", @canvas.toBuffer('image/png')
		console.log "\x1b[33mFull atlas: #{@buildPath}/#{@pref}Atlas-full.png"
		fs.writeFileSync "#{@buildPath}/#{@pref}Mapping-full.json",JSON.stringify(@textureMapping,null,2)
		console.log "\x1b[33mFull atlas mapping: #{@buildPath}/#{@pref}Mapping-full.json"
		if @mini
			fs.writeFileSync "#{@buildPath}/#{@pref}Mapping.json",JSON.stringify(@miniMapping,null,2)
			console.log "\x1b[33mMini atlas mapping: #{@buildPath}/#{@pref}Mapping.json"
		console.log "\x1b[32mSuccessfully generated #{@canvas.width}x#{@canvas.height} Texture Atlas!\n\x1b[0m"
		return

module.exports=AtlasCreator