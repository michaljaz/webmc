import * as THREE from 'three'
class Entities
	constructor:(game)->
		@game=game
		@material = new THREE.MeshStandardMaterial {
			color: new THREE.Color "red"
		}
		@mobGeometry = new THREE.BoxGeometry 1, 1, 1
		@mobMaxCount=200
		@mobMesh=new THREE.InstancedMesh @mobGeometry,@material,@mobMaxCount
		@mobMesh.instanceMatrix.setUsage THREE.DynamicDrawUsage
		@game.scene.add @mobMesh
		@dummy = new THREE.Object3D()
		return
	update:(entities)->
		offset=[-0.5,16,-0.5]
		mobs=0
		for i of entities
			mobs++
		@mobMesh.count=mobs
		mobs=0
		for i of entities
			@dummy.position.set entities[i][0]+offset[0],entities[i][1]+offset[1],entities[i][2]+offset[2]
			@dummy.updateMatrix()
			@mobMesh.setMatrixAt mobs++, @dummy.matrix
		@mobMesh.instanceMatrix.needsUpdate = true
		return
export {Entities}
