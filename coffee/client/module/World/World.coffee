import * as THREE from './../build/three.module.js'
import {CellTerrain} from './CellTerrain.js'
import {AnimatedTextureAtlas} from './AnimatedTextureAtlas.js'

class World
	constructor: (options) ->
		_this=@
		@cellMesh={}
		@cellNeedsUpdate={}
		@models={}
		@cellSize=options.cellSize
		@camera=options.camera
		@scene=options.scene
		@toxelSize=options.toxelSize
		@al=options.al
		@cellTerrain=new CellTerrain {cellSize:@cellSize}
		@ATA=new AnimatedTextureAtlas {al:@al}
		@material=@ATA.material
		@neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]
		@chunkWorker=new Worker "/module/World/ChunkWorker.js", {type:'module'}
		@chunkWorker.onmessage=(message)->
			_this.updateCell message.data
		@chunkWorker.postMessage {
			type:'init'
			data:{
				models:{
					anvil:{
						@al.get("anvil").children[0].geometry.attributes...
					}
				}
				blocks: @al.get "blocks"
				blocksMapping: @al.get "blocksMapping"
				toxelSize: @toxelSize
				cellSize: @cellSize
			}
		}
		@sectionsWorker=new Worker "/module/World/SectionsWorker.js", {type:'module'}
		@sectionsWorker.onmessage=(data)->
			result=data.data.result
			for i in result
				if i isnt null
					_this.setCell i.x,i.y,i.z,i.data
	setCell: (cellX,cellY,cellZ,buffer)->
		@_setCell cellX,cellY,cellZ,buffer
		@cellTerrain.cells[@cellTerrain.vec3(cellX,cellY,cellZ)]=buffer
		@cellNeedsUpdate[@cellTerrain.vec3(cellX,cellY,cellZ)]=true
		for nei in @neighbours
			neiCellId=@cellTerrain.vec3(cellX+nei[0],cellY+nei[1],cellZ+nei[2])
			@cellNeedsUpdate[neiCellId]=true
	setBlock: (voxelX,voxelY,voxelZ,value) ->
		voxelX=parseInt voxelX
		voxelY=parseInt voxelY
		voxelZ=parseInt voxelZ
		if (@cellTerrain.getVoxel voxelX,voxelY,voxelZ) isnt value
			@_setVoxel voxelX,voxelY,voxelZ,value
			@cellTerrain.setVoxel voxelX,voxelY,voxelZ,value
			cellId=@cellTerrain.vec3 @cellTerrain.computeCellForVoxel(voxelX,voxelY,voxelZ)...
			@cellNeedsUpdate[cellId]=true
			for nei in @neighbours
				neiCellId=@cellTerrain.vec3 @cellTerrain.computeCellForVoxel(voxelX+nei[0],voxelY+nei[1],voxelZ+nei[2])...
				@cellNeedsUpdate[neiCellId]=true
		return
	getBlock: (voxelX,voxelY,voxelZ) ->
		return @cellTerrain.getVoxel voxelX,voxelY,voxelZ
	updateCellsAroundPlayer: (pos,radius)->
		for k,v of @cellMesh
			v.visible=false
		cell=@cellTerrain.computeCellForVoxel (Math.floor pos.x),(Math.floor pos.y),(Math.floor pos.z)
		for i in [-radius..radius]
			for j in [-radius..radius]
				for k in [-radius..radius]
					pcell=[cell[0]+i,cell[1]+j,cell[2]+k]
					try
						@cellMesh[@cellTerrain.vec3(pcell...)].visible=true
					if @cellNeedsUpdate[@cellTerrain.vec3(pcell...)]
						@_genCellGeo pcell...
						delete @cellNeedsUpdate[@cellTerrain.vec3(pcell...)]
	updateCell: (data)->
		cellId=@cellTerrain.vec3 data.info...
		cell=data.cell
		mesh=@cellMesh[cellId]
		geometry=new THREE.BufferGeometry;
		geometry.setAttribute 'position',new THREE.BufferAttribute(new Float32Array(cell.positions), 3)
		geometry.setAttribute 'normal',new THREE.BufferAttribute(new Float32Array(cell.normals), 3)
		geometry.setAttribute 'uv',new THREE.BufferAttribute(new Float32Array(cell.uvs), 2)
		if mesh is undefined
			@cellMesh[cellId]=new THREE.Mesh geometry,@material
			@scene.add @cellMesh[cellId]
		else
			@cellMesh[cellId].geometry=geometry
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
			voxel = @getBlock ix, iy, iz
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
	_setCell: (cellX,cellY,cellZ,buffer)->
		@chunkWorker.postMessage {
			type:"setCell"
			data:[cellX,cellY,cellZ,buffer]
		}
	_setVoxel: (voxelX,voxelY,voxelZ,value)->
		@chunkWorker.postMessage {
			type:"setVoxel"
			data:[voxelX,voxelY,voxelZ,value]
		}
	_genCellGeo: (cellX,cellY,cellZ)->
		cellX=parseInt cellX
		cellY=parseInt cellY
		cellZ=parseInt cellZ
		@chunkWorker.postMessage {
			type:"genCellGeo"
			data:[cellX,cellY,cellZ]
		}
	_computeSections: (sections,x,z)->
		@sectionsWorker.postMessage {
			type:"computeSections"
			data:{
				sections,x,z
			}
		}
export {World}
