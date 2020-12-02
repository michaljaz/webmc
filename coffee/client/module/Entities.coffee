import * as THREE from './build/three.module.js'
class Entities
	constructor:(options)->
		@scene=options.scene
		@nick=options.nick
		@TWEEN=options.TWEEN
		@mobMeshMaterial = new THREE.MeshBasicMaterial {color: new THREE.Color "red" }
		@mobMeshGeometry = new THREE.BoxGeometry 1, 1, 1
		@maxCount=200
		@mobMesh=new THREE.InstancedMesh @mobMeshGeometry,@mobMeshMaterial,@maxCount
		@mobMesh.instanceMatrix.setUsage THREE.DynamicDrawUsage
		@scene.add @mobMesh
		@dummy = new THREE.Object3D()
		return
	update:(entities)->
		offset=[-0.5,16,-0.5]
		num=0
		for i of entities
			if entities[i].type is "mob"
				num++
		@mobMesh.count=num
		num=0
		for i of entities
			if entities[i].type is "mob"
				@dummy.position.set entities[i].position.x+offset[0],entities[i].position.y+offset[1],entities[i].position.z+offset[2]
				@dummy.updateMatrix()
				@mobMesh.setMatrixAt num++, @dummy.matrix
		@mobMesh.instanceMatrix.needsUpdate = true
		return
export {Entities}
