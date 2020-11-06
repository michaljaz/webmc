import {CellTerrain} from './CellTerrain.js'

console.log "CHUNK WORKER STARTED!"

class TerrainManager
	constructor: (options)->
		@toxelSize=options.toxelSize
		@q=1/@toxelSize
		@blocks=options.blocks
		@blocksMapping=options.blocksMapping
		@cellSize=options.cellSize
		@models=options.models
		@cellTerrain=new CellTerrain {
			cellSize:@cellSize
		}
	getToxel: (x,y)->
		x-=1
		y-=1
		x1=@q*x
		y1=1-@q*y-@q
		x2=@q*x+@q
		y2=1-@q*y
		return [
			[x1,y1]
			[x1,y2]
			[x2,y1]
			[x2,y2]
		]
	vec3: (x,y,z) ->
		if typeof x is "string"
			x=parseInt x
		if typeof y is "string"
			y=parseInt y
		if typeof z is "string"
			z=parseInt z
		return "#{x}:#{y}:#{z}"
	genBlockFace: (type,voxel)->

		try
			blockName=@blocks[voxel]["faces"][type]
			toxX=@blocksMapping[blockName]["x"]
			toxY=@blocksMapping[blockName]["y"]
		catch e
			toxX=@blocksMapping["debug"]["x"]
			toxY=28-@blocksMapping["debug"]["y"]
		uv=@getToxel toxX,toxY
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
	genCellGeo: (cellX,cellY,cellZ)->
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
			posi=geo.position.array
			norm=geo.normal.array
			uv=geo.uv.array
			for i in [0..posi.length-1]
				positions.push posi[i]+pos[i%3]
			normals.push norm...
			uvs.push uv...
			return
		for i in [0..@cellSize-1]
			for j in [0..@cellSize-1]
				for k in [0..@cellSize-1]
					pos=[cellX*@cellSize+i,cellY*@cellSize+j,cellZ*@cellSize+k]
					voxel=@getVoxel pos...
					if voxel
						if @blocks[voxel] is undefined or @blocks[voxel].isBlock
							if not (@blocks[@getVoxel(pos[0]+1,pos[1],pos[2])] is undefined or @blocks[@getVoxel(pos[0]+1,pos[1],pos[2])].isBlock)
								addFace "nx",pos,voxel
							if not (@blocks[@getVoxel(pos[0]-1,pos[1],pos[2])] is undefined or @blocks[@getVoxel(pos[0]-1,pos[1],pos[2])].isBlock)
								addFace "px",pos,voxel
							if not (@blocks[@getVoxel(pos[0],pos[1]-1,pos[2])] is undefined or @blocks[@getVoxel(pos[0],pos[1]-1,pos[2])].isBlock)
								addFace "ny",pos,voxel
							if not (@blocks[@getVoxel(pos[0],pos[1]+1,pos[2])] is undefined or @blocks[@getVoxel(pos[0],pos[1]+1,pos[2])].isBlock)
								addFace "py",pos,voxel
							if not (@blocks[@getVoxel(pos[0],pos[1],pos[2]+1)] is undefined or @blocks[@getVoxel(pos[0],pos[1],pos[2]+1)].isBlock)
								addFace "pz",pos,voxel
							if not (@blocks[@getVoxel(pos[0],pos[1],pos[2]-1)] is undefined or @blocks[@getVoxel(pos[0],pos[1],pos[2]-1)].isBlock)
								addFace "nz",pos,voxel
						else
							geo=@models[@blocks[voxel].model]
							addGeo geo,pos
		return {
			positions
			normals
			uvs
		}
	setVoxel: (voxelX,voxelY,voxelZ,value)->
		@cellTerrain.setVoxel voxelX,voxelY,voxelZ,value
		return
	getVoxel: (voxelX,voxelY,voxelZ)->
		return @cellTerrain.getVoxel voxelX,voxelY,voxelZ

addEventListener "message", (e)->
	fn = handlers[e.data.type]
	if not fn
		throw new Error('no handler for type: ' + e.data.type)
	fn(e.data.data)
	return
State={
	init:null
	world:{}
}
terrain=null
handlers={
	init:(data)->
		State.init=data
		terrain=new TerrainManager {
			models:data.models
			blocks:data.blocks
			blocksMapping:data.blocksMapping
			toxelSize:data.toxelSize
			cellSize:data.cellSize
		}
		return
	setVoxel:(data)->
		terrain.setVoxel data...
	genCellGeo: (data)->
		if ((terrain.cellTerrain.vec3 data...) of terrain.cellTerrain.cells) is true
			geo=terrain.genCellGeo data...
			# if terrain.cellTerrain.cells[terrain.cellTerrain.vec3 data...] isnt undefined
			postMessage {
				cell:geo
				info:data
			}
	setCell: (data)->
		terrain.cellTerrain.cells["#{data[0]}:#{data[1]}:#{data[2]}"]=data[3]
}
