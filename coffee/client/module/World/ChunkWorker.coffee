import {CellTerrain} from './CellTerrain.js'
import {Block} from './../build/Block.js'
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
	genBlockFace: (type,block,pos)->
		if block.name is "water"
			toxX=@blocksMapping["water_flow"]["x"]
			toxY=@blocksMapping["water_flow"]["y"]
		else if @blocksMapping[block.name]
			toxX=@blocksMapping[block.name]["x"]
			toxY=@blocksMapping[block.name]["y"]
		else
			toxX=@blocksMapping["debug"]["x"]
			toxY=28-@blocksMapping["debug"]["y"]
		uv=@getToxel toxX,toxY
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
		addFace=(type,pos)->
			faceVertex=_this.genBlockFace type,_this.cellTerrain.getBlock(pos...),pos
			positions.push faceVertex.pos...
			normals.push faceVertex.norm...
			uvs.push faceVertex.uv...
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
					else if @cellTerrain.getBlock(pos...).name is "water"
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
		}

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
time=0
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
		terrain.cellTerrain.setVoxel data...
	genCellGeo: (data)->
		if ((terrain.cellTerrain.vec3 data...) of terrain.cellTerrain.cells) is true
			geo=terrain.genCellGeo data...
			postMessage {
				cell:geo
				info:data
			}
	setCell: (data)->
		terrain.cellTerrain.setCell data[0],data[1],data[2],data[3]
		terrain.cellTerrain.setBiome data[0],data[1],data[2],data[4]
}
