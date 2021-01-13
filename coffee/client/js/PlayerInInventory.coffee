import * as THREE from 'three'
class PlayerInInventory
	constructor:(game)->
		@game=game
		@renderer=new THREE.WebGLRenderer {
			canvas:@game.pcanvas
			PixelRatio:window.devicePixelRatio
		}
		@scene=new THREE.Scene
		@scene.background = new THREE.Color "black"
		light = new THREE.AmbientLight( 0xffffff )
		@scene.add( light );

		player=@game.al.get "player"
		playerTex=@game.al.get "playerTex"

		playerTex.magFilter=THREE.NearestFilter;
		player.children[0].material.map=playerTex;
		@scene.add( player )
		@camera = new THREE.PerspectiveCamera 70, 140/204, 0.1, 1000
		@camera.rotation.order="YXZ"
		@camera.position.z = 210
		@camera.position.y = 120
		$(window).mousemove (z)->
			xoff=z.pageX-window.innerWidth/2+112
			yoff=z.pageY-window.innerHeight/2+170
			left=xoff/(window.innerWidth/2-112)
			right=xoff/(window.innerWidth/2+112)
			top=yoff/(window.innerHeight/2-170)
			bottom=yoff/(window.innerHeight/2+170)
			wych_x=Math.PI/3
			wych_y=Math.PI/4
			if xoff>0
				player.rotation.y=wych_x*right
			else
				player.rotation.y=wych_x*left
			if yoff>0
				player.children[1].children[0].children[2].children[0].children[0].rotation.x=wych_y*bottom
			else
				player.children[1].children[0].children[2].children[0].children[0].rotation.x=wych_y*top
	render:()->
		@renderer.render @scene, @camera
	show:()->
		@game.pcanvas.style.display="block"
	hide:()->
		@game.pcanvas.style.display="none"
export {PlayerInInventory}
