
addEventListener "message", (e)->
	fn = handlers[e.data.type]
	if not fn
		throw new Error('no handler for type: ' + e.data.type)
	fn(e.data.data)
	return
State={
	init:null
	world:{}
}
handlers={
	init:(data)->
		console.log("WORKER: Successfully loaded assets!")
		State.init=data
		return
	setVoxel:(data)->
		State.world["#{data.voxelX}:#{data.voxelY}:#{data.voxelZ}"]=data.value
		console.log "WORKER: Voxel saved!",State.world
	genCellGeo:(data)->
		console.log "Ready to generate cell geometry"
		positions=[]
		normals=[]
		uvs=[]
		return
}