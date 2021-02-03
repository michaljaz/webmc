path=require "path"
fs=require "fs"
Canvas=require "canvas"

class AtlasCreator
	constructor:(options)->
		@pref=options.pref
		@oneFrame=options.oneFrame
		@toxelSize=options.toxelSize
		@loadPath=options.loadPath
		@buildPath=options.buildPath
		@atlasSize=options.atlasSize
		@canvas=Canvas.createCanvas @atlasSize*@toxelSize,@atlasSize*@toxelSize
		@ctx=@canvas.getContext '2d'
		@toxelX=1
		@toxelY=1
		@loadedImages=0
		@images={}
		@textureMapping={}
		@emptyDir()
		@firstLoad()
		return
	emptyDir:()->
		if not fs.existsSync @buildPath
			fs.mkdirSync @buildPath
		return
	firstLoad:()->
		_this=@
		fs.readdir @loadPath, (err, files)->
			totalImages=0
			files.forEach (file)->
				filePath="#{_this.loadPath}/#{file}"
				if path.extname(file) is ".png"
					totalImages+=1
				return
			_this.totalImages=totalImages
			files.forEach (file)->
				filePath="#{_this.loadPath}/#{file}"
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
		w=img.width/@toxelSize
		h=img.height/@toxelSize
		if @oneFrame
			@ctx.drawImage img,0,0,@toxelSize,@toxelSize,(@toxelX-1)*@toxelSize,(@toxelY-1)*@toxelSize, @toxelSize,@toxelSize
			@textureMapping["#{name.substr(0,name.length-4)}"]={x:@toxelX,y:@toxelY}
			@moveToxel()
		else
			if w>1 or h>1
				for i in [0..w-1]
					for j in [0..h-1]
						@ctx.drawImage img,i*@toxelSize,j*@toxelSize,@toxelSize,@toxelSize,(@toxelX-1)*@toxelSize,(@toxelY-1)*@toxelSize, @toxelSize,@toxelSize
						@textureMapping["#{name.substr(0,name.length-4)}@#{i}@#{j}"]={x:@toxelX,y:@toxelY}
						@moveToxel()
			else
				@ctx.drawImage img,(@toxelX-1)*@toxelSize,(@toxelY-1)*@toxelSize,@toxelSize,@toxelSize
				@textureMapping[name.substr(0,name.length-4)]={x:@toxelX,y:@toxelY}
				@moveToxel()
		return
	moveToxel:()->
		if @toxelX is @atlasSize
			@toxelX=1
			@toxelY+=1
		else
			@toxelX+=1
		return
	updateAtlas:(path)->

		console.log "\x1b[33m[#{@pref} Atlas]"
		console.log "\x1b[32mTotal images: #{@totalImages}"
		fs.writeFileSync "#{@buildPath}/#{@pref}-Atlas.png", @canvas.toBuffer('image/png')
		console.log "\x1b[33mFull atlas: #{@buildPath}/#{@pref}-Atlas.png"
		fs.writeFileSync "#{@buildPath}/#{@pref}-Mapping.json",JSON.stringify(@textureMapping,null,2)
		console.log "\x1b[33mFull atlas mapping: #{@buildPath}/#{@pref}-Mapping.json"
		console.log "\x1b[32mSuccessfully generated #{@canvas.width}x#{@canvas.height} Texture Atlas!\n\x1b[0m"
		return

module.exports=AtlasCreator