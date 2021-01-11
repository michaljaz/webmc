import {Block} from './../build/Block.js'
class CellTerrain
	constructor: (options)->
		@cellSize=options.cellSize
		@cells={}
		@loadedBlocks={}
	vec3: (x,y,z)->
		x=parseInt x
		y=parseInt y
		z=parseInt z
		return "#{x}:#{y}:#{z}"
	computeVoxelOffset: (voxelX,voxelY,voxelZ) ->
		x=voxelX %% @cellSize|0
		y=voxelY %% @cellSize|0
		z=voxelZ %% @cellSize|0
		return y*@cellSize*@cellSize+z*@cellSize+x;
	computeCellForVoxel: (voxelX,voxelY,voxelZ) ->
		cellX = Math.floor voxelX / @cellSize
		cellY = Math.floor voxelY / @cellSize
		cellZ = Math.floor voxelZ / @cellSize
		return [cellX,cellY,cellZ]
	addCellForVoxel:(voxelX,voxelY,voxelZ)->
		cellId=@vec3(@computeCellForVoxel(voxelX,voxelY,voxelZ)...)
		cell=@cells[cellId]
		if not cell
			cell=new Uint32Array @cellSize*@cellSize*@cellSize
			@cells[cellId]=cell
		return cell
	getCellForVoxel:(voxelX,voxelY,voxelZ)->
		cellId=@vec3(@computeCellForVoxel(voxelX, voxelY, voxelZ)...)
		return @cells[cellId]
	setVoxel:(voxelX,voxelY,voxelZ,value)->
		cell=@getCellForVoxel voxelX,voxelY,voxelZ
		if not cell
			cell=@addCellForVoxel voxelX,voxelY,voxelZ
		voff=@computeVoxelOffset voxelX,voxelY,voxelZ
		cell[voff]=value
		return
	getVoxel:(voxelX,voxelY,voxelZ)->
		cell=@getCellForVoxel voxelX,voxelY,voxelZ
		if not cell
			return 0
		voff=@computeVoxelOffset voxelX,voxelY,voxelZ
		return cell[voff]
	getCell:(cellX,cellY,cellZ)->
		return @cells[@vec3(x,y,z)]
	setCell:(cellX,cellY,cellZ,buffer)->
		@cells[@vec3(cellX,cellY,cellZ)]=buffer
	getBlock:(blockX,blockY,blockZ)->
		if @loadedBlocks[@getVoxel(blockX,blockY,blockZ)] is undefined
			@loadedBlocks[@getVoxel(blockX,blockY,blockZ)]=new Block.fromStateId @getVoxel(blockX,blockY,blockZ)
		return @loadedBlocks[@getVoxel(blockX,blockY,blockZ)]
export {CellTerrain}
