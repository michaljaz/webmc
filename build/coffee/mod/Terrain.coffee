import * as THREE from './../../module/build/three.module.js'
import {CellTerrain} from './CellTerrain.js'
class Terrain
	constructor: (options) ->
		@cellSize=options.cellSize
		@cellTerrain=new CellTerrain {
			cellSize:@cellSize
		}
		# @cellTerrain.getBuffer(0,0,0)
		@cellsData={}
		@blocks=options.blocks
		@blocksMapping=options.blocksMapping
		@material=options.material
		@cells={}
		@models={}
		@camera=options.camera
		@scene=options.scene
		@toxelSize=options.toxelSize
		@neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]
		@worker=options.worker
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
		x=parseInt x
		y=parseInt y
		z=parseInt z
		return "#{x}:#{y}:#{z}"
	setVoxel: (voxelX,voxelY,voxelZ,value) ->
		@worker.setVoxel voxelX,voxelY,voxelZ,value
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
				for nei in @neighbours
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
				_this.worker.genCellGeo id.split(":")...
			return 
		return
	updateCell: (data)->
		# console.warn "SENDING  cell: #{data.info}" 
		cellId=@vec3 data.info...
		cell=data.cell
		if @cellsData[cellId]!=undefined
			if @cellsData[cellId].needsUpdate
				mesh=@cells[cellId]
				geometry=new THREE.BufferGeometry;
				geometry.setAttribute 'position',new THREE.BufferAttribute(new Float32Array(cell.positions), 3)
				geometry.setAttribute 'normal',new THREE.BufferAttribute(new Float32Array(cell.normals), 3)
				geometry.setAttribute 'uv',new THREE.BufferAttribute(new Float32Array(cell.uvs), 2)
				if mesh is undefined
					@cells[cellId]=new THREE.Mesh geometry,@material
					@scene.add @cells[cellId]
				else
					@cells[cellId].geometry=geometry
				@cellsData[cellId].needsUpdate=false
		return
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
				return (v + intersection.normal[ndx] * 0.5)
			posBreak = intersection.position.map (v, ndx) ->
				return (v + intersection.normal[ndx] *-0.5)
			return {posPlace,posBreak}
		else
			return false
export {Terrain}