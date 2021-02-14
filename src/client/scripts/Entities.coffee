import * as THREE from 'three'
class Entities
	constructor:(game)->
		@game=game
		@mobMaterial = new THREE.MeshStandardMaterial {
			color: new THREE.Color "red"
		}
		@mobGeometry = new THREE.BoxGeometry 1, 1, 1
		@mobMaxCount=200
		@mobMesh=new THREE.InstancedMesh @mobGeometry,@mobMaterial,@mobMaxCount
		@mobMesh.instanceMatrix.setUsage THREE.DynamicDrawUsage
		@game.scene.add @mobMesh

		@playerMaterial = new THREE.MeshStandardMaterial {
			color: new THREE.Color "blue"
		}
		@playerGeometry = new THREE.BoxGeometry 1, 1, 1
		@playerMaxCount=200
		@playerMesh=new THREE.InstancedMesh @playerGeometry,@playerMaterial,@playerMaxCount
		@playerMesh.instanceMatrix.setUsage THREE.DynamicDrawUsage
		@game.scene.add @playerMesh
		
		@dummy = new THREE.Object3D()
		return
	update:(entities)->
		offset=[-0.5,16,-0.5]

		num_mobs=0
		for i of entities.mobs
			num_mobs++
		@mobMesh.count=num_mobs
		num_mobs=0
		for i of entities.mobs
			@dummy.position.set entities.mobs[i][0]+offset[0],entities.mobs[i][1]+offset[1],entities.mobs[i][2]+offset[2]
			@dummy.updateMatrix()
			@mobMesh.setMatrixAt num_mobs++, @dummy.matrix
		@mobMesh.instanceMatrix.needsUpdate = true

		num_players=0
		for i of entities.players
			if entities.players[i][0] isnt @game.nick
				num_players++
		@playerMesh.count=num_players
		num_players=0
		for i of entities.players
			if entities.players[i][0] isnt @game.nick
				@dummy.position.set entities.players[i][1]+offset[0],entities.players[i][2]+offset[1],entities.players[i][3]+offset[2]
				@dummy.updateMatrix()
				@playerMesh.setMatrixAt num_players++, @dummy.matrix
		@playerMesh.instanceMatrix.needsUpdate = true

		return
export {Entities}
