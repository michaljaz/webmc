
addEventListener "message", (e)->
	mess=e.data
	if mess.type is "assets"
		console.log mess.data
	return