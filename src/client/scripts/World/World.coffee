import * as THREE from 'three'
import {CellTerrain} from './CellTerrain.coffee'
import {AnimatedTextureAtlas} from './AnimatedTextureAtlas.coffee'

import chunkWorker from "./chunk.worker.coffee"
import sectionsWorker from "./sections.worker.coffee"

class World
	constructor: (game) ->
		_this=@
		@game=game
		@cellBlackList={}
		@cellMesh={}
		@cellNeedsUpdate={}
		@blocksDef=@game.al.get "blocksDef"
		@models={}
		@cellTerrain=new CellTerrain {cellSize:@game.cellSize,blocksDef:@blocksDef}
		@ATA=new AnimatedTextureAtlas @game
		@material=@ATA.material
		@cellUpdateTime=null
		@renderTime=100
		@neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]

		#Utworzenie Workera do obliczania geometrii chunków
		@chunkWorker=new chunkWorker
		@chunkWorker.onmessage=(message)->
			if message.data.type is "cellGeo"
				_this.updateCell message.data.data
			else if message.data.type is "removeCell"
				if _this.cellMesh[message.data.data] isnt undefined
					_this.cellMesh[message.data.data].geometry.dispose()
					_this.game.scene.remove _this.cellMesh[message.data.data]
					delete _this.cellMesh[message.data.data]
					_this.game.renderer.renderLists.dispose()
		@chunkWorker.postMessage {
			type:'init'
			data:{
				blocksMapping: @game.al.get "blocksMapping"
				toxelSize: @game.toxelSize
				cellSize: @game.cellSize
				blocksTex: @game.al.get "blocksTex"
				blocksDef: @blocksDef
			}
		}

		#Utworzenie Workera do przekształcania bufforów otrzymanych z serwera
		@sectionsWorker=new sectionsWorker
		@sectionsWorker.onmessage=(data)->
			result=data.data.result
			for i in result
				if i isnt null
					_this.setCell i.x,i.y,i.z,i.cell
		return
	setCell: (cellX,cellY,cellZ,buffer)->
		@_setCell cellX,cellY,cellZ,buffer
		@cellTerrain.setCell cellX,cellY,cellZ,buffer
	setBlock: (voxelX,voxelY,voxelZ,value) ->
		voxelX=parseInt voxelX
		voxelY=parseInt voxelY
		voxelZ=parseInt voxelZ
		if (@cellTerrain.getVoxel voxelX,voxelY,voxelZ) isnt value
			@_setVoxel voxelX,voxelY,voxelZ,value
		return
	resetWorld: ()->
		for i of @cellMesh
			if @cellMesh[i].geometry isnt undefined
				@cellMesh[i].geometry.dispose()
				@game.scene.remove @cellMesh[i]
			delete @cellMesh[i]
		@cellTerrain.cells={}
		@_resetWorld()
		return
	updateCell: (data)->
		#Updatowanie komórki z już obliczoną geometrią
		cellId=@cellTerrain.vec3 data.info...
		cell=data.cell
		mesh=@cellMesh[cellId]
		geometry=new THREE.BufferGeometry
		geometry.setAttribute 'position',new THREE.BufferAttribute(new Float32Array(cell.positions), 3)
		geometry.setAttribute 'normal',new THREE.BufferAttribute(new Float32Array(cell.normals), 3)
		geometry.setAttribute 'uv',new THREE.BufferAttribute(new Float32Array(cell.uvs), 2)
		geometry.setAttribute 'color',new THREE.BufferAttribute(new Float32Array(cell.colors), 3)
		geometry.matrixAutoUpdate=false
		if mesh is undefined
			@cellMesh[cellId]=new THREE.Mesh geometry,@material
			@cellMesh[cellId].matrixAutoUpdate=false
			@cellMesh[cellId].frustumCulled = false
			_this=@
			@cellMesh[cellId].onAfterRender = ()->
				_this.cellMesh[cellId].frustumCulled = true
				_this.cellMesh[cellId].onAfterRender = ->
			@game.scene.add @cellMesh[cellId]
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
			block = @cellTerrain.getBlock ix, iy, iz
			if block.name is "air" or block.name is "cave_air" or block.name is "void_air"
				voxel=0
			else
				voxel=1
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
		start = new THREE.Vector3().setFromMatrixPosition(@game.camera.matrixWorld)
		end = new THREE.Vector3().set(0,0, 1).unproject(@game.camera)
		intersection = @intersectsRay start, end
		if intersection
			posPlace = intersection.position.map (v, ndx) ->
				return Math.floor(v + intersection.normal[ndx] * 0.5)
			posBreak = intersection.position.map (v, ndx) ->
				return Math.floor(v + intersection.normal[ndx] *-0.5)
			return {
				posPlace
				posBreak
			}
		else
			return false
	_setCell: (cellX,cellY,cellZ,buffer,biome)->
		#Wysyłanie do ChunkWorkera informacji nowej komórce

		@cellUpdateTime=performance.now()
		@chunkWorker.postMessage {
			type:"setCell"
			data:[cellX,cellY,cellZ,buffer,biome]
		}
	_resetWorld: ()->
		@chunkWorker.postMessage {
			type:"resetWorld"
			data:null
		}
		return
	_setVoxel: (voxelX,voxelY,voxelZ,value)->
		#Wysyłanie do ChunkWorkera informacji o nowym Voxelu
		@chunkWorker.postMessage {
			type:"setVoxel"
			data:[voxelX,voxelY,voxelZ,value]
		}
	_genCellGeo: (cellX,cellY,cellZ)->
		#Wysyłanie do ChunkWorkera prośby o wygenerowanie geometrii komórki
		cellX=parseInt cellX
		cellY=parseInt cellY
		cellZ=parseInt cellZ
		@chunkWorker.postMessage {
			type:"genCellGeo"
			data:[cellX,cellY,cellZ]
		}
	_updateCellsAroundPlayer: (radius)->
		if @cellUpdateTime isnt null and (performance.now()-@cellUpdateTime>@renderTime)
			pos=@game.camera.position
			cell=@cellTerrain.computeCellForVoxel (Math.floor pos.x),(Math.floor pos.y),(Math.floor pos.z)
			@chunkWorker.postMessage {
				type:"updateCellsAroundPlayer"
				data:[cell,radius]
			}
		return
	_computeSections: (sections,x,z,biomes)->
		#Wysyłanie do SectionsWorkera Buffora, który ma przekształcić w łatwiejszą postać
		@sectionsWorker.postMessage {
			type:"computeSections"
			data:{
				sections,x,z,biomes
			}
		}
export {World}
