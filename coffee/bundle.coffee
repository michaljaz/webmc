
#Bundle.js
"use strict"
import * as THREE from './module/build/three.module.js';
import {SkeletonUtils} from './module/jsm/utils/SkeletonUtils.js';
import {FBXLoader} from './module/jsm/loaders/FBXLoader.js';
import Stats from './module/jsm/libs/stats.module.js';
scene=null
materials=null
parameters=null
canvas=null
renderer=null
camera=null
gameState=null
terrain=null
cursor=null
FPC=null
socket=null
stats=null

class Terrain	
	constructor: (options) ->
		@cellSize=options.cellSize
		@cellsData={}
		@blocks=options.blocks
		@blocksMapping=options.blocksMapping
		@material=options.material
		@cells={}
		@models={}
		@camera=options.camera
		@scene=options.scene
		@toxelSize=27
		@neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]
	computeVoxelOffset: (voxelX,voxelY,voxelZ) ->
		x=voxelX %% @cellSize|0
		y=voxelY %% @cellSize|0
		z=voxelZ %% @cellSize|0
		return [x,y,z]
	computeCellForVoxel: (voxelX,voxelY,voxelZ) ->
		cellX = Math.floor voxelX / @cellSize
		cellY = Math.floor voxelY / @cellSize
		cellZ = Math.floor voxelZ / @cellSize
		return [cellX,cellY,cellZ]
	vec3: (x,y,z) ->
		if typeof x is "string"
			x=parseInt x
		if typeof y is "string"
			y=parseInt y
		if typeof z is "string"
			z=parseInt z
		return "#{x}:#{y}:#{z}"
	setVoxel: (voxelX,voxelY,voxelZ,value) ->
		voff=@computeVoxelOffset(voxelX,voxelY,voxelZ)
		cell=@computeCellForVoxel(voxelX,voxelY,voxelZ)
		cellId=@vec3(cell...)
		if @cellsData[cellId] is undefined
			@cellsData[cellId]={
				[@vec3 voff...]:value
			}
		else
			prevVox=@cellsData[cellId][@vec3(voff...)]
			if prevVox isnt value
				@cellsData[cellId][@vec3(voff...)]=value
				@cellsData[cellId].needsUpdate=true
				for nei of @neighbours
					neiCellId=@vec3 @computeCellForVoxel(voxelX+nei[0],voxelY+nei[1],voxelZ+nei[2])...
					try
						@cellsData[neiCellId].needsUpdate=true
		@cellsData[cellId].needsUpdate=true
		return
	getVoxel: (voxelX,voxelY,voxelZ) ->
		cell=@computeCellForVoxel(voxelX,voxelY,voxelZ)
		cellId=@vec3(cell...)
		voff=@computeVoxelOffset(voxelX,voxelY,voxelZ)
		voxId=@vec3(voff...)
		if @cellsData[cellId] isnt undefined
			voxel=@cellsData[cellId][voxId]
			if voxel isnt undefined
				return voxel
		return 0;
	updateCells: ->
		_this=@
		Object.keys(@cellsData).forEach (id)->
			if _this.cellsData[id].needsUpdate
				_this.updateCellMesh id.split(":")...
			return 
		return
	updateCellMesh: (cellX,cellY,cellZ) ->
		console.warn "Updating cell: #{cellX}:#{cellY}:#{cellZ}" 
		cellId=@vec3(cellX,cellY,cellZ)
		if @cellsData[cellId].needsUpdate
			mesh=@cells[cellId]
			geometry=@generateCellGeometry cellX,cellY,cellZ
			if mesh is undefined
				@cells[cellId]=new THREE.Mesh geometry,@material
				@scene.add @cells[cellId]
			else
				@cells[cellId].geometry=geometry
			@cellsData[cellId].needsUpdate=false;
		return
	generateCellGeometry: (cellX,cellY,cellZ) ->
		positions=[]
		normals=[]
		uvs=[]
		_this=@
		addFace=(type,pos,voxel)->
			faceVertex=_this.genBlockFace type,voxel
			for vertex in faceVertex
				vertex.pos[0]+=pos[0]
				vertex.pos[1]+=pos[1]
				vertex.pos[2]+=pos[2]
				positions.push vertex.pos... 
				normals.push vertex.norm...
				uvs.push vertex.uv... 
			return
		addGeo=(geo,pos)->
			posi=geo.attributes.position.array
			norm=geo.attributes.normal.array
			uv=geo.attributes.uv.array
			for i in [0..posi.length-1]
				positions.push posi[i]+pos[i%3]

			normals.push norm...
			uvs.push uv...
			return 
		for i in [0..@cellSize]
			for j in [0..@cellSize]
				for k in [0..@cellSize]
					pos=[cellX*@cellSize+i,cellY*@cellSize+j,cellZ*@cellSize+k]
					voxel=@getVoxel pos...

					if voxel
						if @blocks[voxel].isBlock
							if not @blocks[@getVoxel(pos[0]+1,pos[1],pos[2])].isBlock
								addFace "nx",pos,voxel
							if not @blocks[@getVoxel(pos[0]-1,pos[1],pos[2])].isBlock
								addFace "px",pos,voxel
							if not @blocks[@getVoxel(pos[0],pos[1]-1,pos[2])].isBlock
								addFace "ny",pos,voxel 
							if not @blocks[@getVoxel(pos[0],pos[1]+1,pos[2])].isBlock
								addFace "py",pos,voxel 
							if not @blocks[@getVoxel(pos[0],pos[1],pos[2]+1)].isBlock
								addFace "pz",pos,voxel 
							if not @blocks[@getVoxel(pos[0],pos[1],pos[2]-1)].isBlock
								addFace "nz",pos,voxel 
						else
							blockName=@blocks[voxel].name
							geo=@models[blockName]
							addGeo geo,pos
		cellGeometry=new THREE.BufferGeometry;
		cellGeometry.setAttribute 'position',new THREE.BufferAttribute(new Float32Array(positions), 3)
		cellGeometry.setAttribute 'normal',new THREE.BufferAttribute(new Float32Array(normals), 3)
		cellGeometry.setAttribute 'uv',new THREE.BufferAttribute(new Float32Array(uvs), 2)
		return cellGeometry
	genBlockFace: (type,voxel) ->
		blockName=@blocks[voxel]["faces"][type]
		try
			toxX=@blocksMapping[blockName]["x"]-1
			toxY=@blocksMapping[blockName]["y"]-1
		catch error
			toxX=@blocksMapping["debug"]["x"]-1
			toxY=27-@blocksMapping["debug"]["y"]
		
		q=1/@toxelSize
		x1=q*toxX
		y1=1-q*toxY-q
		x2=x1+q
		y2=y1+q
		uv=[[x1,y1],[x1,y2],[x2,y1],[x2,y2]]
		switch type
			when "pz"
				return [
					{ pos: [-0.5, -0.5,  0.5], norm: [ 0,  0,  1], uv: uv[0], },
					{ pos: [ 0.5, -0.5,  0.5], norm: [ 0,  0,  1], uv: uv[2], },
					{ pos: [-0.5,  0.5,  0.5], norm: [ 0,  0,  1], uv: uv[1], },
					{ pos: [-0.5,  0.5,  0.5], norm: [ 0,  0,  1], uv: uv[1], },
					{ pos: [ 0.5, -0.5,  0.5], norm: [ 0,  0,  1], uv: uv[2], },
					{ pos: [ 0.5,  0.5,  0.5], norm: [ 0,  0,  1], uv: uv[3], }
				]
			when "nx"
				return [
					{ pos: [ 0.5, -0.5,  0.5], norm: [ 1,  0,  0], uv: uv[0], },
					{ pos: [ 0.5, -0.5, -0.5], norm: [ 1,  0,  0], uv: uv[2], },
					{ pos: [ 0.5,  0.5,  0.5], norm: [ 1,  0,  0], uv: uv[1], },
					{ pos: [ 0.5,  0.5,  0.5], norm: [ 1,  0,  0], uv: uv[1], },
					{ pos: [ 0.5, -0.5, -0.5], norm: [ 1,  0,  0], uv: uv[2], },
					{ pos: [ 0.5,  0.5, -0.5], norm: [ 1,  0,  0], uv: uv[3], }
				]
			when "nz"
				return [
					{ pos: [ 0.5, -0.5, -0.5], norm: [ 0,  0, -1], uv: uv[0], },
					{ pos: [-0.5, -0.5, -0.5], norm: [ 0,  0, -1], uv: uv[2], },
					{ pos: [ 0.5,  0.5, -0.5], norm: [ 0,  0, -1], uv: uv[1], }, 
					{ pos: [ 0.5,  0.5, -0.5], norm: [ 0,  0, -1], uv: uv[1], },
					{ pos: [-0.5, -0.5, -0.5], norm: [ 0,  0, -1], uv: uv[2], },
					{ pos: [-0.5,  0.5, -0.5], norm: [ 0,  0, -1], uv: uv[3], }
				]
			when "px"
				return [
					{ pos: [-0.5, -0.5, -0.5], norm: [-1,  0,  0], uv: uv[0], },
					{ pos: [-0.5, -0.5,  0.5], norm: [-1,  0,  0], uv: uv[2], },
					{ pos: [-0.5,  0.5, -0.5], norm: [-1,  0,  0], uv: uv[1], },
					{ pos: [-0.5,  0.5, -0.5], norm: [-1,  0,  0], uv: uv[1], },
					{ pos: [-0.5, -0.5,  0.5], norm: [-1,  0,  0], uv: uv[2], },
					{ pos: [-0.5,  0.5,  0.5], norm: [-1,  0,  0], uv: uv[3], },
				]
			when "py"
				return [
					{ pos: [ 0.5,  0.5, -0.5], norm: [ 0,  1,  0], uv: uv[0], },
					{ pos: [-0.5,  0.5, -0.5], norm: [ 0,  1,  0], uv: uv[2], },
					{ pos: [ 0.5,  0.5,  0.5], norm: [ 0,  1,  0], uv: uv[1], },
					{ pos: [ 0.5,  0.5,  0.5], norm: [ 0,  1,  0], uv: uv[1], },
					{ pos: [-0.5,  0.5, -0.5], norm: [ 0,  1,  0], uv: uv[2], },
					{ pos: [-0.5,  0.5,  0.5], norm: [ 0,  1,  0], uv: uv[3], }
				]
			when "ny"
				return [
					{ pos: [ 0.5, -0.5,  0.5], norm: [ 0, -1,  0], uv: uv[0], },
					{ pos: [-0.5, -0.5,  0.5], norm: [ 0, -1,  0], uv: uv[2], },
					{ pos: [ 0.5, -0.5, -0.5], norm: [ 0, -1,  0], uv: uv[1], },
					{ pos: [ 0.5, -0.5, -0.5], norm: [ 0, -1,  0], uv: uv[1], },
					{ pos: [-0.5, -0.5,  0.5], norm: [ 0, -1,  0], uv: uv[2], },
					{ pos: [-0.5, -0.5, -0.5], norm: [ 0, -1,  0], uv: uv[3], }
				]
	intersectsRay: (start,end) ->
		start.x+=0.5
		start.y+=0.5
		start.z+=0.5
		end.x+=0.5
		end.y+=0.5
		end.z+=0.5
		dx = end.x - start.x
		dy = end.y - start.y
		dz = end.z - start.z
		lenSq = dx * dx + dy * dy + dz * dz
		len = Math.sqrt lenSq
		dx /= len
		dy /= len
		dz /= len
		t = 0.0;
		ix = Math.floor start.x
		iy = Math.floor start.y
		iz = Math.floor start.z
		stepX = if dx > 0 then 1 else -1
		stepY = if dy > 0 then 1 else -1
		stepZ = if dz > 0 then 1 else -1
		txDelta = Math.abs(1 / dx)
		tyDelta = Math.abs(1 / dy)
		tzDelta = Math.abs(1 / dz)
		xDist = if stepX > 0 then ix + 1 - start.x else start.x - ix
		yDist = if stepY > 0 then iy + 1 - start.y else start.y - iy
		zDist = if stepZ > 0 then iz + 1 - start.z else start.z - iz

		txMax = if txDelta < Infinity then txDelta * xDist else Infinity
		tyMax = if tyDelta < Infinity then tyDelta * yDist else Infinity
		tzMax = if tzDelta < Infinity then tzDelta * zDist else Infinity

		steppedIndex = -1
		while t <= len
			voxel = @getVoxel ix, iy, iz
			if voxel
				return {
					position: [
						start.x + t * dx,
						start.y + t * dy,
						start.z + t * dz,
					],
					normal: [
						if steppedIndex is 0 then -stepX else 0,
						if steppedIndex is 1 then -stepY else 0,
						if steppedIndex is 2 then -stepZ else 0,
					],
					voxel,
				}
			if txMax < tyMax
				if txMax < tzMax
					ix += stepX
					t = txMax
					txMax += txDelta
					steppedIndex = 0
				else
					iz += stepZ
					t = tzMax
					tzMax += tzDelta
					steppedIndex = 2
			else
				if tyMax < tzMax
					iy += stepY
					t = tyMax
					tyMax += tyDelta
					steppedIndex = 1
				else
					iz += stepZ
					t = tzMax
					tzMax += tzDelta
					steppedIndex = 2
		return null
	replaceWorld: (voxels)->
		_this=@
		Object.keys(voxels).forEach (id)->
			if voxels[id] isnt _this.getVoxel id.split(":")...
				_this.setVoxel id.split(":")...,voxels[id]
	getRayBlock: ->
		start = new THREE.Vector3().setFromMatrixPosition(@camera.matrixWorld)
		end = new THREE.Vector3().set(0,0, 1).unproject(@camera)
		intersection = @intersectsRay start, end
		if intersection
			posPlace = intersection.position.map (v, ndx) ->
				return v + intersection.normal[ndx] * 0.5
			posBreak = intersection.position.map (v, ndx) ->
				return v + intersection.normal[ndx] *-0.5
			return {posPlace,posBreak}
		else
			return false
class AssetLoader
	constructor: (options)->
		@assets={}
	load: (assets,callback) ->
		_this=@
		textureLoader = new THREE.TextureLoader
		fbxl = new FBXLoader()
		assetsNumber=0
		assetsLoaded=0
		Object.keys(assets).forEach (p)->
			assetsNumber++
		Object.keys(assets).forEach (p)->
			type=assets[p].type
			path=assets[p].path
			dynamic=assets[p].dynamic;
			if dynamic
				path+="?"+THREE.MathUtils.generateUUID()
			if type is "texture"
				textureLoader.load path,(texture)->
					_this.assets[p]=texture
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
			if type is "text"
				$.get path,(data)->
					_this.assets[p]=data
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
			if type is "image"
				img = new Image
				img.onload= ->
					_this.assets[p]=img
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
				img.src=path
			if type is "fbx"
				fbxl.load path,(fbx)->
					_this.assets[p]=fbx
					assetsLoaded++;
					if assetsLoaded is assetsNumber
						callback()
		return this;
	get: (assetName)->
		return @assets[assetName]
class FirstPersonControls
	constructor: (options)->
		@kc={
			"w": 87,
			"s": 83,
			"a": 65,
			"d": 68,
			"space": 32,
			"shift": 16
		}
		@keys={}
		@canvas=options.canvas
		@camera=options.camera
		@micromove=options.micromove
	ac: (qx, qy, qa, qf)->
		m_x = -Math.sin(qa) * qf;
		m_y = -Math.cos(qa) * qf;
		r_x = qx - m_x;
		r_y = qy - m_y;
		return {
			x: r_x,
			y: r_y
		}
	camMicroMove: ->
		if @keys[@kc["w"]]
			@camera.position.x = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y + THREE.MathUtils.degToRad(180), @micromove).x
			@camera.position.z = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y + THREE.MathUtils.degToRad(180), @micromove).y
		if @keys[@kc["s"]]
			@camera.position.x = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y, @micromove).x
			@camera.position.z = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y, @micromove).y
		if @keys[@kc["a"]]
			@camera.position.x = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y - THREE.MathUtils.degToRad(90), @micromove).x
			@camera.position.z = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y - THREE.MathUtils.degToRad(90), @micromove).y
		if @keys[@kc["d"]]
			@camera.position.x = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y + THREE.MathUtils.degToRad(90), @micromove).x
			@camera.position.z = @ac(@camera.position.x, @camera.position.z, @camera.rotation.y + THREE.MathUtils.degToRad(90), @micromove).y
		if @keys[@kc["space"]]
			@camera.position.y += @micromove
		if @keys[@kc["shift"]]
			@camera.position.y -= @micromove
	lockPointer: ->
		@canvas.requestPointerLock()
		return
	updatePosition: (e)->
		FPC.camera.rotation.x -= THREE.MathUtils.degToRad e.movementY / 10
		FPC.camera.rotation.y -= THREE.MathUtils.degToRad e.movementX / 10
		if THREE.MathUtils.radToDeg FPC.camera.rotation.x < -90
			FPC.camera.rotation.x = THREE.MathUtils.degToRad -90
		if THREE.MathUtils.radToDeg FPC.camera.rotation.x > 90
			FPC.camera.rotation.x = THREE.MathUtils.degToRad 90
		return
	lockChangeAlert: ->
		if document.pointerLockElement is canvas or document.mozPointerLockElement is canvas
			document.addEventListener "mousemove", FPC.updatePosition, false
			$(".gameMenu").css "display", "none"
			gameState="game"

		else
			document.removeEventListener "mousemove", FPC.updatePosition, false
			$(".gameMenu").css "display", "block"
			gameState="menu"
		return
	listen: ->
		_this=this
		$(document).keydown	(z) ->
			_this.keys[z.keyCode] = true
			return
		$(document).keyup (z) ->
			delete _this.keys[z.keyCode]
			return
		$(".gameOn").click ->
			_this.lockPointer()
			return
		document.addEventListener 'pointerlockchange', _this.lockChangeAlert, false
		document.addEventListener 'mozpointerlockchange', _this.lockChangeAlert, false
		return @
class InventoryBar
	constructor: (options)->
		@boxSize=options.boxSize
		@div=options.div
		@padding=options.padding
		@boxes=options.boxes
		@activeBox=options.activeBox
		@setup()
	setup: ->
		result=""
		for i in [0..@boxes]
			result+="<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' width=#{@boxSize} height=#{@boxSize} class='inv_box_#{i}' style='border:1px solid black' alt=''>"
		document.querySelector(@div).style="position:fixed;bottom:3px;left:50%;width:#{(@boxSize+2)*@boxes}px;margin-left:-#{@boxSize*@boxes/2}px;height:#{@boxSize}px;"
		document.querySelector(@div).innerHTML=result
		return
	setBox: (number,imageSrc)->
		if imageSrc is null
			imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
		document.querySelector(".inv_box_#{number-1}").src=imageSrc
		return
	setFocus: (number,state)->
		if state
			document.querySelector(".inv_box_#{number-1}").style.background="rgba(0,0,0,0.7)"
			document.querySelector(".inv_box_#{number-1}").style.border="1px solid black"
		else
			document.querySelector(".inv_box_#{number-1}").style.background="rgba(54,54,54,0.5)"
			document.querySelector(".inv_box_#{number-1}").style.border="1px solid #363636"
		return
	setFocusOnly: (number)->
		for i in [1..@boxes]
			@setFocus i, i is number
		@activeBox=number
		return @
	moveBoxMinus: ->
		if @activeBox + 1 > @boxes
			@setFocusOnly 1
		else
			@setFocusOnly @activeBox + 1
		return
	moveBoxPlus: ->
		if @activeBox - 1 is 0
			@setFocusOnly @boxes
		else
			@setFocusOnly @activeBox - 1
	directBoxChange: (event)->
		code = event.keyCode
		if code >= 49 and code < 49 + @boxes
			@setFocusOnly code - 48
	setBoxes: (images)->
		for i in [0..images.length-1]
			@setBox i+1,images[i]
		return @
	listen: ->
		_this=@
		$(window).on 'wheel', (event) ->
			if event.originalEvent.deltaY < 0
				_this.moveBoxPlus()
			else
				_this.moveBoxMinus()
		$(document).keydown (z) ->
			_this.directBoxChange(z)
		return @
class TextureAtlasCreator
	constructor: (options)->
		@textureX=options.textureX
		@textureMapping=options.textureMapping
		@size=36
		@willSize=27
	gen: (tick)->
		multi={}
		for i of @textureMapping
			if i.includes "@"
				xd=@decodeName i
				if multi[xd.pref] is undefined
					multi[xd.pref]=xd
				else
					multi[xd.pref].x=Math.max multi[xd.pref].x,xd.x
					multi[xd.pref].y=Math.max multi[xd.pref].y,xd.y
		canvasx = document.createElement 'canvas'
		ctx=canvasx.getContext "2d"
		canvasx.width=@willSize*16
		canvasx.height=@willSize*16

		toxelX=1
		toxelY=1
		
		for i of @textureMapping	
			if i.includes "@"
				xd=@decodeName i
				if multi[xd.pref].loaded is undefined
					multi[xd.pref].loaded=true
					lol=@getToxelForTick tick,multi[xd.pref].x+1,multi[xd.pref].y+1

					texmap=@textureMapping["#{xd.pref}@#{lol.col}@#{lol.row}"]
					ctx.drawImage @textureX,(texmap.x-1)*16,(texmap.y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16
					toxelX++
					if toxelX>@willSize
						toxelX=1
						toxelY++
			else
				ctx.drawImage @textureX,(@textureMapping[i].x-1)*16,(@textureMapping[i].y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16
				toxelX++
				if toxelX>@willSize
					toxelX=1
					toxelY++
		return canvasx
	decodeName: (i)->
		m=null
		for j in [0..i.length-1]
			if i[j] is "@"
				m=j
				break
		pref=i.substr 0,m
		sub=i.substr m,i.length
		m2=null
		for j in [0..sub.length-1]
			if sub[j] is "@"
				m2=j
		x=parseInt sub.substr(1,m2-1)
		y=parseInt sub.substr(m2+1,sub.length)
		return {pref,x,y}
	getToxelForTick: (tick,w,h)->
		tick=tick%(w*h)+1
		#option1
		col=(tick-1)%w
		row=Math.ceil(tick/w)-1
		#option2
		col=Math.ceil(tick/h)-1
		row=(tick-1)%h;
		return {row,col}  

init = ()-> 
	canvas=document.querySelector '#c'
	renderer=new THREE.WebGLRenderer({
		canvas
		PixelRatio:window.devicePixelRatio
		})
	scene=new THREE.Scene
	scene.background=new THREE.Color "lightblue"
	camera = new THREE.PerspectiveCamera 75, 2, 0.1, 64*5
	camera.rotation.order = "YXZ"
	camera.position.set 26, 26, 26

	ambientLight=new THREE.AmbientLight 0xcccccc
	scene.add ambientLight
	directionalLight = new THREE.DirectionalLight 0x333333, 2
	directionalLight.position.set(1, 1, 0.5).normalize()
	scene.add directionalLight 
	fbxl = new FBXLoader
	gameState="menu"

	#Snowflakes
	geometry = new THREE.BufferGeometry
	vertices = []
	materials=[]
	sprite1 = al.get "snowflake1" 
	sprite2 = al.get "snowflake2" 
	sprite3 = al.get "snowflake3" 
	sprite4 = al.get "snowflake4" 
	sprite5 = al.get "snowflake5" 
	for i in [0..1000]
		x = Math.random() * 2000 - 1000
		y = Math.random() * 2000 - 1000
		z = Math.random() * 2000 - 1000
		vertices.push x, y, z
	geometry.setAttribute 'position', new THREE.Float32BufferAttribute( vertices, 3 )
	parameters = [
		[[ 1.0, 0.2, 0.5 ], sprite2, 20 ],
		[[ 0.95, 0.1, 0.5 ], sprite3, 15 ],
		[[ 0.90, 0.05, 0.5 ], sprite1, 10 ],
		[[ 0.85, 0, 0.5 ], sprite5, 8 ],
		[[ 0.80, 0, 0.5 ], sprite4, 5 ]
	]
	for i in [0..parameters.length-1]
		color=parameters[ i ][ 0 ]
		sprite = parameters[ i ][ 1 ]
		size = parameters[ i ][ 2 ]
		materials[ i ] = new THREE.PointsMaterial { 
			size: size
			map: sprite
			blending: THREE.AdditiveBlending
			depthTest: false
			transparent: true 
		}
		materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] )
		particles = new THREE.Points geometry, materials[ i ]
		particles.rotation.x = Math.random() * 6
		particles.rotation.y = Math.random() * 6
		particles.rotation.z = Math.random() * 6
		scene.add particles
	for i in [0..materials.length-1]
		materials[ i ].map = parameters[ i ][ 1 ]
		materials[ i ].needsUpdate = true

	#Clouds
	clouds=al.get "clouds"
	clouds.scale.x=0.1
	clouds.scale.y=0.1
	clouds.scale.z=0.1
	clouds.position.y=100
	scene.add clouds

	#Ghast1
	ghast=al.get "ghastF"
	texturex1 = al.get "ghast"
	texturex1.magFilter = THREE.NearestFilter
	ghast.children[1].material.map=texturex1
    
	ghast.children[0].children[0].scale.set 0.01,0.01,0.01 
	ghast.children[1].material.color=new THREE.Color 0xffffff
	mat=ghast.children[1].material.clone()
	scene.add ghast

	#Ghast2
	ghast2=SkeletonUtils.clone ghast
	texturex2 = al.get "ghastS"
	texturex2.magFilter = THREE.NearestFilter

	ghast2.children[1].material=mat
	ghast2.children[1].material.map=texturex2
	ghast2.position.set 3,0,0
	scene.add ghast2

	#Player
	playerObject=al.get "player"
	texturex = al.get "steve"
	texturex.magFilter = THREE.NearestFilter
	playerObject.children[1].scale.set 1,1,1
	playerObject.children[1].position.set 25,25,25
	playerObject.children[0].material.map=texturex
	playerObject.children[0].material.color=new THREE.Color 0xffffff
	playerObject.children[1].scale.set 0.5,0.5,0.5

	#Animated Material
	worldMaterial=new THREE.MeshStandardMaterial({
		side: 0
		map:null
	})    
	atlasCreator=new TextureAtlasCreator({
		textureX:al.get "textureAtlasX"
		textureMapping:al.get "textureMappingX"
	})
    
	savedTextures=[]
	for i in [0..9]
		t=atlasCreator.gen(i).toDataURL()
		tekstura=new THREE.TextureLoader().load t
		tekstura.magFilter = THREE.NearestFilter
		savedTextures.push tekstura
	tickq=0
	setInterval(()->
		tickq++
		tekst=savedTextures[tickq%9]
		worldMaterial.map=tekst
		worldMaterial.map.needsUpdate=true
		return
	,100)

	#setup terrain
	terrain=new Terrain({
		cellSize:16
		blocks:al.get "blocks"
		blocksMapping:al.get "textureMappingJson"
		material:worldMaterial
		scene
		camera
	})
	#Load Custom blocks models
	blocks=al.get "blocks"
	modelsNumber=0
	modelsLoaded=0
	modelsToLoad=[]
	Object.keys(blocks).forEach (p)->
		if not blocks[p].isBlock and p isnt 0
			modelPath="assets/models/#{blocks[p].model}"
			modelsNumber++
			modelsToLoad.push(blocks[p])
		return
	for i in [0..modelsToLoad.length-1]
		(()->
			block=modelsToLoad[i]
			if block.name isnt "air"
				fbxl.load "assets/models/#{block.model}",( object )->
					geometry=object.children[0].geometry
					if block.name is "anvil"
						geometry.rotateX -Math.PI/2
						geometry.translate 0,0.17,0 
						geometry.translate 0,-0.25,0 
					terrain.models[block.name]=geometry
					modelsLoaded++
					if modelsLoaded is modelsNumber
						console.log "Custom blocks models loaded!"
					return
			return
		)()

	#Socket.io setup
	socket=io.connect "http://localhost:35565"
	socket.on "connect",()->
		console.log "Połączono z serverem!"
		return
	socket.on "blockUpdate",(block)->
		terrain.setVoxel block...
		return

	#Socket.io players
	playersx={}
	socket.on "playerUpdate",(players)->
		sockets={}
		Object.keys(players).forEach (p)->
			sockets[p]=true
			if playersx[p] is undefined and p isnt socket.id
				playersx[p]=SkeletonUtils.clone playerObject
				scene.add playersx[p]
			try
				playersx[p].children[1].position.set players[p].x,players[p].y-0.5,players[p].z
				playersx[p].children[1].children[0].children[0].children[0].children[2].rotation.x=players[p].xyaw
				playersx[p].children[1].children[0].rotation.z=players[p].zyaw
			return
		Object.keys(playersx).forEach (p)->
			if sockets[p] is undefined
				scene.remove playersx[p]
				delete playersx[p]
			return
		return

	#Socket.io first world load
	socket.on "firstLoad",(v)->
		console.log "Otrzymano pakiet świata!"
		terrain.replaceWorld v
		$(".initLoading").css "display","none"
		stats = new Stats();
		stats.showPanel(0);
		document.body.appendChild stats.dom
		return
	#Inventory Bar
	inv_bar = new InventoryBar({
		boxSize: 60
		boxes: 9
		padding: 4
		div: ".inventoryBar"
		activeBox: 1
	}).setBoxes([
		"assets/images/grass_block.png",
		"assets/images/stone.png",
		"assets/images/oak_planks.png",
		"assets/images/smoker.gif",
		"assets/images/anvil.png",
		"assets/images/brick.png",
		"assets/images/furnace.png",
		"assets/images/bookshelf.png",
		"assets/images/tnt.png"
	]).setFocusOnly(1).listen()
	#First Person Controls
	FPC = new FirstPersonControls({
		canvas: document.querySelector("#c")
		camera
		micromove: 0.3
	}).listen()
	#Raycast cursor
	cursor=new THREE.LineSegments(
		new THREE.EdgesGeometry(
			new THREE.BoxGeometry 1, 1, 1
		),
		new THREE.LineBasicMaterial {
			color: 0x000000,
			linewidth: 0.5
		}
	)
	scene.add cursor
	#jquery events
	$(document).mousedown (e)->
		if gameState is "game"
			rayBlock=terrain.getRayBlock()
			if rayBlock
				if e.which is 1
					voxelId=0
					pos=rayBlock.posBreak
				else
					voxelId=inv_bar.activeBox
					pos=rayBlock.posPlace
				socket.emit "blockUpdate",[pos...,voxelId]
		return
	animate()
	return
render = ->
	time = Date.now() * 0.00005
	for i in [0..scene.children.length-1]
		object = scene.children[ i ]
		if object instanceof THREE.Points
			object.rotation.y = time * ( if i < 4 then i + 1 else - ( i + 1 ) )
	for i in [0..materials.length-1]
		color = parameters[ i ][ 0 ]
		h = ( 360 * ( color[ 0 ] + time ) % 360 ) / 360
		materials[ i ].color.setHSL h, color[ 1 ], color[ 2 ]

	#Resize canvas
	width=window.innerWidth
	height=window.innerHeight
	if canvas.width isnt width or canvas.height isnt height
		canvas.width=width
		canvas.height=height
		renderer.setSize width,height,false
		camera.aspect = width / height
		camera.updateProjectionMatrix()
	if gameState is "game"
		socket.emit "playerUpdate", {
			x:camera.position.x
			y:camera.position.y
			z:camera.position.z
			xyaw:-camera.rotation.x
			zyaw:camera.rotation.y+Math.PI
		}
		FPC.camMicroMove()
	renderer.render scene, camera
	terrain.updateCells()
	#update cursor
	rayBlock=terrain.getRayBlock()
	if rayBlock
		pos=rayBlock.posBreak
		pos[0]=Math.floor pos[0]
		pos[1]=Math.floor pos[1]
		pos[2]=Math.floor pos[2]
		cursor.position.set pos...
		cursor.visible=true
	else
		cursor.visible=false
	return
animate = ->
	try
		stats.begin()
	render()
	try
		stats.end()
	requestAnimationFrame animate
	return

al=new AssetLoader
$.get "assets/assetLoader.json?#{THREE.MathUtils.generateUUID()}", (assets)->
	al.load assets,()->
		console.log "AssetLoader: done loading!"
		init()
		
		return
	,al
	return