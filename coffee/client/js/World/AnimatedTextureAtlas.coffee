import * as THREE from './../build/three.module.js'

class TextureAtlasCreator
	constructor: (options)->
		@textureX=options.textureX
		@textureMapping=options.textureMapping
		@size=36
		@willSize=27
	gen: (tick)->
		multi={}
		for i of @textureMapping
			if i.includes "@"
				xd=@decodeName i
				if multi[xd.pref] is undefined
					multi[xd.pref]=xd
				else
					multi[xd.pref].x=Math.max multi[xd.pref].x,xd.x
					multi[xd.pref].y=Math.max multi[xd.pref].y,xd.y
		canvasx = document.createElement 'canvas'
		ctx=canvasx.getContext "2d"
		canvasx.width=@willSize*16
		canvasx.height=@willSize*16
		toxelX=1
		toxelY=1
		for i of @textureMapping
			if i.includes "@"
				xd=@decodeName i
				if multi[xd.pref].loaded is undefined
					multi[xd.pref].loaded=true
					lol=@getToxelForTick tick,multi[xd.pref].x+1,multi[xd.pref].y+1
					texmap=@textureMapping["#{xd.pref}@#{lol.col}@#{lol.row}"]
					ctx.drawImage @textureX,(texmap.x-1)*16,(texmap.y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16
					toxelX++
					if toxelX>@willSize
						toxelX=1
						toxelY++
			else
				ctx.drawImage @textureX,(@textureMapping[i].x-1)*16,(@textureMapping[i].y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16
				toxelX++
				if toxelX>@willSize
					toxelX=1
					toxelY++
		return canvasx
	decodeName: (i)->
		m=null
		for j in [0..i.length-1]
			if i[j] is "@"
				m=j
				break
		pref=i.substr 0,m
		sub=i.substr m,i.length
		m2=null
		for j in [0..sub.length-1]
			if sub[j] is "@"
				m2=j
		x=parseInt sub.substr(1,m2-1)
		y=parseInt sub.substr(m2+1,sub.length)
		return {pref,x,y}
	getToxelForTick: (tick,w,h)->
		tick=tick%(w*h)+1
		#option1
		col=(tick-1)%w
		row=Math.ceil(tick/w)-1
		#option2
		col=Math.ceil(tick/h)-1
		row=(tick-1)%h;
		return {row,col}
class AnimatedTextureAtlas
	constructor:(options)->
		_this=@
		@al=options.al
		@material=new THREE.MeshStandardMaterial({
			side: 0
			map:null
			vertexColors: true
		})
		xd=true
		@material.onBeforeCompile=(shader)->
			#Uniforms
			shader.uniforms.u_fogColor={value:[0.8, 0.9, 1, 1]}
			shader.uniforms.u_fogAmount={value:0.1}
			shader.uniforms.time={value:0}

			#Fragment shader
			shader.fragmentShader=[
				"uniform vec4 u_fogColor;"
				"uniform float u_fogAmount;"
				shader.fragmentShader
			].join("\n")
			# # shader.fragmentShader="uniform vec4 fogColor;\nuniform float fogAmount;\n"+shader.fragmentShader
			shader.fragmentShader=shader.fragmentShader.replace(
				"gl_FragColor = vec4( outgoingLight, diffuseColor.a );"
				[
					"gl_FragColor = vec4( outgoingLight, diffuseColor.a );"
					"gl_FragColor = mix(gl_FragColor,u_fogColor,u_fogAmount);"
				].join("\n")
			)

			materialShader = shader
			return
		@atlasCreator=new TextureAtlasCreator({
			textureX:@al.get "blocksAtlasFull"
			textureMapping:@al.get "blocksMappingFull"
		})
		savedTextures=[]
		for i in [0..9]
			t=@atlasCreator.gen(i).toDataURL()
			tekstura=new THREE.TextureLoader().load t
			tekstura.magFilter = THREE.NearestFilter
			tekstura.minFilter = THREE.NearestFilter
			savedTextures.push tekstura
		tickq=0
		setInterval(()->
			tickq++
			tekst=savedTextures[tickq%9]
			_this.material.map=tekst
			_this.material.map.needsUpdate=true
			return
		,100)

export {AnimatedTextureAtlas,TextureAtlasCreator}
