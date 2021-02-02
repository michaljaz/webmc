import * as THREE from 'three'
class Entities
	constructor:(game)->
		@game=game
		@mobMaterial = new THREE.MeshBasicMaterial {color: new THREE.Color "red" }
		@mobGeometry = new THREE.BoxGeometry 1, 1, 1
		@mobMaxCount=200
		@mobMesh=new THREE.InstancedMesh @mobGeometry,@mobMaterial,@mobMaxCount
		@mobMesh.instanceMatrix.setUsage THREE.DynamicDrawUsage
		@game.scene.add @mobMesh
		@dummy = new THREE.Object3D()
		return
	update:(entities)->
		offset=[-0.5,16,-0.5]
		mobs=0
		for i of entities
			if entities[i].type is "mob"
				mobs++
		@mobMesh.count=mobs
		mobs=0
		for i of entities
			if entities[i].type is "mob"
				@dummy.position.set entities[i].position.x+offset[0],entities[i].position.y+offset[1],entities[i].position.z+offset[2]
				@dummy.updateMatrix()
				@mobMesh.setMatrixAt mobs++, @dummy.matrix
		@mobMesh.instanceMatrix.needsUpdate = true
		return
export {Entities}
