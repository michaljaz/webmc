#Terrain Worker

#load necessary models data (example: anvil-normals,uvs,positions)

addEventListener "message", (e)->
	console.log(e.data)
	return

#listen chunk sending (cellSize+2)^3 and response array of uvs,normals,positions

