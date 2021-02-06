import {CellTerrain} from './CellTerrain.coffee'

terrain=null

class TerrainManager
	constructor: (options)->
		@cellSize=options.cellSize
		@cellTerrain=new CellTerrain {
			cellSize:@cellSize
			blocksDef:options.blocksDef
		}
		@toxelSize=options.toxelSize
		@q=1/@toxelSize
		@blocksMapping=options.blocksMapping
		@blocksTex=options.blocksTex
		@cellNeedsUpdate={}
		@loadedMeshes={}
		@undefinedBlock="black_shulker_box"
	genBlockFace: (type,block,pos)->
		if @blocksTex[block.name] isnt undefined or @blocksTex[String(block.stateId)] isnt undefined
			if @blocksTex[String(block.stateId)] isnt undefined
				xd=@blocksTex[String(block.stateId)]
			else
				xd=@blocksTex[block.name]
			if xd["all"] isnt undefined
				toxX=@blocksMapping[xd.all]["x"]
				toxY=@blocksMapping[xd.all]["y"]
			else if xd["side"] isnt undefined
				mapka={
					"py":"top"
					"ny":"bottom"
				}
				if mapka[type] isnt undefined
					toxX=@blocksMapping[xd[mapka[type]]]["x"]
					toxY=@blocksMapping[xd[mapka[type]]]["y"]
				else
					toxX=@blocksMapping[xd["side"]]["x"]
					toxY=@blocksMapping[xd["side"]]["y"]
			else
				toxX=@blocksMapping[xd[type]]["x"]
				toxY=@blocksMapping[xd[type]]["y"]
		else if block.name is "water"
			toxX=@blocksMapping["water_flow"]["x"]
			toxY=@blocksMapping["water_flow"]["y"]
		else if block.name is "lava"
			toxX=@blocksMapping["lava_flow"]["x"]
			toxY=@blocksMapping["lava_flow"]["y"]
		else if @blocksMapping[block.name]
			toxX=@blocksMapping[block.name]["x"]
			toxY=@blocksMapping[block.name]["y"]
		else
			toxX=@blocksMapping[@undefinedBlock]["x"]
			toxY=@blocksMapping[@undefinedBlock]["y"]
		li = [255,255,255]
		sh = [0,0,0]
		toxX-=1
		toxY-=1
		x1=@q*toxX
		y1=1-@q*toxY-@q
		x2=@q*toxX+@q
		y2=1-@q*toxY
		uv=[
			[x1,y1]
			[x1,y2]
			[x2,y1]
			[x2,y2]
		]
		switch type
			when "pz"
				return {
					pos:[-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1],  0.5+pos[2],0.5+pos[0],  0.5+pos[1],  0.5+pos[2]]
					norm:[0,  0,  1,0,  0,  1,0,  0,  1,0,  0,  1,0,  0,  1,0,  0,  1]
					uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
				}
			when "nx"
				return {
					pos:[ 0.5+pos[0], -0.5+pos[1],  0.5+pos[2], 0.5+pos[0], -0.5+pos[1], -0.5+pos[2],0.5+pos[0],  0.5+pos[1],  0.5+pos[2], 0.5+pos[0],  0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1], -0.5+pos[2], 0.5+pos[0],  0.5+pos[1], -0.5+pos[2]]
					norm:[ 1,  0,  0, 1,  0,  0, 1,  0,  0, 1,  0,  0, 1,  0,  0, 1,  0,  0]
					uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
				}
			when "nz"
				return {
					pos:[ 0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1], -0.5+pos[2],0.5+pos[0],  0.5+pos[1], -0.5+pos[2], 0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2]]
					norm:[ 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1]
					uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
				}
			when "px"
				return {
					pos:[-0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2]]
					norm:[-1,  0,  0,-1,  0,  0,-1,  0,  0,-1,  0,  0,-1,  0,  0,-1,  0,  0]
					uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
				}
			when "py"
				return {
					pos:[ 0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],0.5+pos[0],  0.5+pos[1],  0.5+pos[2], 0.5+pos[0],  0.5+pos[1],  0.5+pos[2],-0.5+pos[0],  0.5+pos[1], -0.5+pos[2],-0.5+pos[0],  0.5+pos[1],  0.5+pos[2]]
					norm:[ 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,  0, 0,  1,  0]
					uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
				}
			when "ny"
				return {
					pos:[ 0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],0.5+pos[0], -0.5+pos[1], -0.5+pos[2], 0.5+pos[0], -0.5+pos[1], -0.5+pos[2],-0.5+pos[0], -0.5+pos[1],  0.5+pos[2],-0.5+pos[0], -0.5+pos[1], -0.5+pos[2]]
					norm:[ 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,  0]
					uv:[uv[0]...,uv[2]...,uv[1]...,uv[1]...,uv[2]...,uv[3]...]
				}
	genCellGeo: (cellX,cellY,cellZ)->
		_this=@
		positions=[]
		normals=[]
		uvs=[]
		colors=[]
		aoColor=(type)->
			if type is 0
				return [0.9,0.9,0.9]
			else if type is 1
				return [0.7,0.7,0.7]
			else if type is 2
				return [0.5,0.5,0.5]
			else
				return [0.3,0.3,0.3]
		addFace=(type,pos)->
			faceVertex=_this.genBlockFace type,_this.cellTerrain.getBlock(pos...),pos
			positions.push faceVertex.pos...
			normals.push faceVertex.norm...
			uvs.push faceVertex.uv...
			# _this.cellTerrain.getBlock(pos[0],pos[1],pos[2])
			loaded={}
			for x in [-1..1]
				for y in [-1..1]
					for z in [-1..1]
						if (_this.cellTerrain.getBlock(pos[0]+x, pos[1]+y,pos[2]+z).boundingBox is "block")
							loaded["#{x}:#{y}:#{z}"]=1
						else
							loaded["#{x}:#{y}:#{z}"]=0
			col1=aoColor(0)
			col2=aoColor(0)
			col3=aoColor(0)
			col4=aoColor(0)
			if type is "py"
				col1=aoColor(loaded["1:1:-1"]+loaded["0:1:-1"]+loaded["1:1:0"])
				col2=aoColor(loaded["1:1:1"]+loaded["0:1:1"]+loaded["1:1:0"])
				col3=aoColor(loaded["-1:1:-1"]+loaded["0:1:-1"]+loaded["-1:1:0"])
				col4=aoColor(loaded["-1:1:1"]+loaded["0:1:1"]+loaded["-1:1:0"])
			if type is "ny"
				col2=aoColor(loaded["1:-1:-1"]+loaded["0:-1:-1"]+loaded["1:-1:0"])
				col1=aoColor(loaded["1:-1:1"]+loaded["0:-1:1"]+loaded["1:-1:0"])
				col4=aoColor(loaded["-1:-1:-1"]+loaded["0:-1:-1"]+loaded["-1:-1:0"])
				col3=aoColor(loaded["-1:-1:1"]+loaded["0:-1:1"]+loaded["-1:-1:0"])
			if type is "px"
				col1=aoColor(loaded["-1:-1:0"]+loaded["-1:-1:-1"]+loaded["-1:0:-1"])
				col2=aoColor(loaded["-1:1:0"]+loaded["-1:1:-1"]+loaded["-1:0:-1"])
				col3=aoColor(loaded["-1:-1:0"]+loaded["-1:-1:1"]+loaded["-1:0:1"])
				col4=aoColor(loaded["-1:1:0"]+loaded["-1:1:1"]+loaded["-1:0:1"])
			if type is "nx"
				col3=aoColor(loaded["1:-1:0"]+loaded["1:-1:-1"]+loaded["1:0:-1"])
				col4=aoColor(loaded["1:1:0"]+loaded["1:1:-1"]+loaded["1:0:-1"])
				col1=aoColor(loaded["1:-1:0"]+loaded["1:-1:1"]+loaded["1:0:1"])
				col2=aoColor(loaded["1:1:0"]+loaded["1:1:1"]+loaded["1:0:1"])
			if type is "pz"
				col1=aoColor(loaded["0:-1:1"]+loaded["-1:-1:1"]+loaded["-1:0:1"])
				col2=aoColor(loaded["0:1:1"]+loaded["-1:1:1"]+loaded["-1:0:1"])
				col3=aoColor(loaded["0:-1:1"]+loaded["1:-1:1"]+loaded["1:0:1"])
				col4=aoColor(loaded["0:1:1"]+loaded["1:1:1"]+loaded["1:0:1"])
			if type is "nz"
				col3=aoColor(loaded["0:-1:-1"]+loaded["-1:-1:-1"]+loaded["-1:0:-1"])
				col4=aoColor(loaded["0:1:-1"]+loaded["-1:1:-1"]+loaded["-1:0:-1"])
				col1=aoColor(loaded["0:-1:-1"]+loaded["1:-1:-1"]+loaded["1:0:-1"])
				col2=aoColor(loaded["0:1:-1"]+loaded["1:1:-1"]+loaded["1:0:-1"])

			colors.push col1...,col3...,col2...,col2...,col3...,col4...
			return
		for i in [0..@cellSize-1]
			for j in [0..@cellSize-1]
				for k in [0..@cellSize-1]
					pos=[cellX*@cellSize+i,cellY*@cellSize+j,cellZ*@cellSize+k]
					if @cellTerrain.getBlock(pos...).boundingBox is "block"
						if (@cellTerrain.getBlock(pos[0]+1,pos[1],pos[2]).boundingBox isnt "block")
							addFace "nx",pos
						if (@cellTerrain.getBlock(pos[0]-1,pos[1],pos[2]).boundingBox isnt "block")
							addFace "px",pos
						if (@cellTerrain.getBlock(pos[0],pos[1]-1,pos[2]).boundingBox isnt "block")
							addFace "ny",pos
						if (@cellTerrain.getBlock(pos[0],pos[1]+1,pos[2]).boundingBox isnt "block")
							addFace "py",pos
						if (@cellTerrain.getBlock(pos[0],pos[1],pos[2]+1).boundingBox isnt "block")
							addFace "pz",pos
						if (@cellTerrain.getBlock(pos[0],pos[1],pos[2]-1).boundingBox isnt "block")
							addFace "nz",pos
					else if @cellTerrain.getBlock(pos...).name is "water" or @cellTerrain.getBlock(pos...).name is "lava"
						if (@cellTerrain.getBlock(pos[0]+1,pos[1],pos[2]).name is "air")
							addFace "nx",pos
						if (@cellTerrain.getBlock(pos[0]-1,pos[1],pos[2]).name is "air")
							addFace "px",pos
						if (@cellTerrain.getBlock(pos[0],pos[1]-1,pos[2]).name is "air")
							addFace "ny",pos
						if (@cellTerrain.getBlock(pos[0],pos[1]+1,pos[2]).name is "air")
							addFace "py",pos
						if (@cellTerrain.getBlock(pos[0],pos[1],pos[2]+1).name is "air")
							addFace "pz",pos
						if (@cellTerrain.getBlock(pos[0],pos[1],pos[2]-1).name is "air")
							addFace "nz",pos
		return {
			positions
			normals
			uvs
			colors
		}

handlers=
	init:(data)->
		terrain=new TerrainManager {
			models:data.models
			blocks:data.blocks
			blocksMapping:data.blocksMapping
			toxelSize:data.toxelSize
			cellSize:data.cellSize
			blocksTex:data.blocksTex
			blocksDef:data.blocksDef
		}
		return
	setVoxel:(data)->
		terrain.cellTerrain.setVoxel data...
		#TODO: cellNeedsUpdate update
		cellId=terrain.cellTerrain.vec3 terrain.cellTerrain.computeCellForVoxel(data[0],data[1],data[2])...
		terrain.cellNeedsUpdate[cellId]=true
		neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]
		for nei in neighbours
			neiCellId=terrain.cellTerrain.vec3 terrain.cellTerrain.computeCellForVoxel(data[0]+nei[0],data[1]+nei[1],data[2]+nei[2])...
			terrain.cellNeedsUpdate[neiCellId]=true
		return
	genCellGeo: (data)->
		if ((terrain.cellTerrain.vec3 data...) of terrain.cellTerrain.cells) is true
			p1=performance.now()
			geo=terrain.genCellGeo data...
			p2=performance.now()
			postMessage {
				type:"cellGeo"
				data:
					cell:geo
					info:data
					p:performance.now()
			}
		return
	setCell: (data)->
		neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]
		terrain.cellNeedsUpdate[terrain.cellTerrain.vec3 data[0],data[1],data[2]]=true
		terrain.cellTerrain.setCell data[0],data[1],data[2],data[3]
		for nei in neighbours
			neiCellId=terrain.cellTerrain.vec3(data[0]+nei[0],data[1]+nei[1],data[2]+nei[2])
			terrain.cellNeedsUpdate[neiCellId]=true
		return
	resetWorld: (data)->
		console.log "RESET WORLD!"
		terrain.cellTerrain.cells={}
		return
	updateCellsAroundPlayer:(data)->
		cell=data[0]
		radius=data[1]
		odw={}
		cellBlackList={}
		for k,v of terrain.loadedMeshes
			if v is true 
				cellBlackList[k]=true
		for i in [0..radius]
			for x in [-i..i]
				for y in [-i..i]
					for z in [-i..i]
						if not odw["#{x}:#{y}:#{z}"]
							odw["#{x}:#{y}:#{z}"]=true
							pcell=[cell[0]+x,cell[1]+y,cell[2]+z]
							cellId=terrain.cellTerrain.vec3 pcell...
							cellBlackList[cellId]=false
							gen=false
							if terrain.cellNeedsUpdate[cellId]
								delete terrain.cellNeedsUpdate[cellId]
								handlers.genCellGeo pcell
								gen=true
							if terrain.loadedMeshes[cellId] is "disposed"
								if not gen
									handlers.genCellGeo pcell
							terrain.loadedMeshes[cellId]=true
		for k,v of cellBlackList
			if v is true
				terrain.loadedMeshes[k]="disposed"
				postMessage {
					type:"removeCell"
					data:k
				}
		return

addEventListener "message", (e)->
	fn = handlers[e.data.type]
	if not fn
		throw new Error "no handler for type: #{e.data.type}"
	fn e.data.data
	return

