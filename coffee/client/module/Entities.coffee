import * as THREE from './build/three.module.js'
class Entities
	constructor:(options)->
		@scene=options.scene
		@saved={}
		@nick=options.nick
		@TWEEN=options.TWEEN
	update:(entities)->
		offset=[-0.5,16,-0.5]
		for i of entities
			if entities[i].username isnt @nick
				pos=[entities[i].position.x+offset[0],entities[i].position.y+offset[1],entities[i].position.z+offset[2]]
				if @saved[entities[i].uuid] is undefined
					console.log entities[i]
					if entities[i].name is "item"
						material = new THREE.MeshBasicMaterial( {color: new THREE.Color("blue")} )
						geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 )
					else
						material = new THREE.MeshBasicMaterial( {color: new THREE.Color("red")} )
						geometry = new THREE.BoxGeometry( 1, 1, 1 )
					cube = new THREE.Mesh( geometry, material )
					@scene.add(cube)
					@saved[entities[i].uuid]=cube
					@saved[entities[i].uuid].position.set pos...
					@saved[entities[i].uuid].active=true
				else
					@saved[entities[i].uuid].position.set pos...
					@saved[entities[i].uuid].active=true
		for i of @saved
			if @saved[i].active is false
				@scene.remove @saved[i]
				delete @saved[i]
		for i of @saved
			@saved[i].active=false
export {Entities}
