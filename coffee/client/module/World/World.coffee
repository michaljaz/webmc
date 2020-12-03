import * as THREE from './../build/three.module.js'
import {CellTerrain} from './CellTerrain.js'
import {AnimatedTextureAtlas} from './AnimatedTextureAtlas.js'

class World
	constructor: (options) ->
		_this=@
		@cellBlackList={}
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
		@cellUpdateTime=null
		@renderTime=100
		@renderer=options.renderer
		@neighbours=[[-1, 0, 0],[1, 0, 0],[0, -1, 0],[0, 1, 0],[0, 0, -1],[0, 0, 1]]

		#Utworzenie Workera do obliczania geometrii chunków
		@chunkWorker=new Worker "/module/World/chunk.worker.js", {type:'module'}
		@chunkWorker.onmessage=(message)->
			_this.updateCell message.data
		@chunkWorker.postMessage {
			type:'init'
			data:{
				blocksMapping: @al.get "blocksMapping"
				toxelSize: @toxelSize
				cellSize: @cellSize
				blocksTex: @al.get "blocksTex"
			}
		}

		#Utworzenie Workera do przekształcania bufforów otrzymanych z serwera
		@sectionsWorker=new Worker "/module/World/sections.worker.js", {type:'module'}
		@sectionsWorker.onmessage=(data)->
			result=data.data.result
			for i in result
				if i isnt null
					_this.setCell i.x,i.y,i.z,i.cell
		return
	setCell: (cellX,cellY,cellZ,buffer)->
		@_setCell cellX,cellY,cellZ,buffer
		@cellTerrain.setCell cellX,cellY,cellZ,buffer
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
	updateCellsAroundPlayer: (pos,radius)->
		#Updatowanie komórek wokół gracza w danym zasięgu
		_this=@
		if @cellUpdateTime isnt null and (performance.now()-@cellUpdateTime>@renderTime)
			#Ustawianie z defaultu, żeby każdy Mesh był wykasowywany
			cellBlackList={}
			for k,v of @cellMesh
				if v isnt "disposed"
					cellBlackList[k]=true
			cell=@cellTerrain.computeCellForVoxel (Math.floor pos.x),(Math.floor pos.y),(Math.floor pos.z)
			up=(x,y,z)->
				pcell=[cell[0]+x,cell[1]+y,cell[2]+z]
				cellId=_this.cellTerrain.vec3(pcell...)
				#Updatowanie mesha, jeśli był disposed lub potrzebuje updatu
				if _this.cellNeedsUpdate[cellId] or _this.cellMesh[cellId] is "disposed"

					if _this.cellNeedsUpdate[cellId]
						delete _this.cellNeedsUpdate[cellId]
					if _this.cellMesh[cellId] is "disposed"
						_this.cellMesh[cellId]="disposedX"
					_this._genCellGeo pcell...
				cellBlackList[cellId]=false
				return
			odw={}
			for i in [0..radius]
				for x in [-i..i]
					for y in [-i..i]
						for z in [-i..i]
							if not odw["#{x}:#{y}:#{z}"]
								up(x,y,z)
								odw["#{x}:#{y}:#{z}"]=true
			#Kasowanie Meshy, które mają znacznik .todel
			for i of cellBlackList
				if cellBlackList[i] is true
					@cellMesh[i].geometry.dispose()
					@cellMesh[i].material.dispose()
					@scene.remove @cellMesh[i]
					@cellMesh[i]="disposed"
			@renderer.renderLists.dispose()
	updateCell: (data)->
		#Updatowanie komórki z już obliczoną geometrią
		cellId=@cellTerrain.vec3 data.info...
		cell=data.cell
		mesh=@cellMesh[cellId]
		geometry=new THREE.BufferGeometry;
		geometry.setAttribute 'position',new THREE.BufferAttribute(new Float32Array(cell.positions), 3)
		geometry.setAttribute 'normal',new THREE.BufferAttribute(new Float32Array(cell.normals), 3)
		geometry.setAttribute 'uv',new THREE.BufferAttribute(new Float32Array(cell.uvs), 2)
		geometry.setAttribute 'color',new THREE.BufferAttribute(new Float32Array(cell.colors), 3)
		if mesh is undefined or mesh is "disposedX"
			@cellMesh[cellId]=new THREE.Mesh geometry,@material
			@cellMesh[cellId].frustumCulled = false
			_this=@
			@cellMesh[cellId].onAfterRender = ()->
				_this.cellMesh[cellId].frustumCulled = true
				_this.cellMesh[cellId].onAfterRender = ->
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
			voxel = @cellTerrain.getVoxel ix, iy, iz
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
	_computeSections: (sections,x,z,biomes)->
		#Wysyłanie do SectionsWorkera Buffora, który ma przekształcić w łatwiejszą postać
		@sectionsWorker.postMessage {
			type:"computeSections"
			data:{
				sections,x,z,biomes
			}
		}
export {World}
