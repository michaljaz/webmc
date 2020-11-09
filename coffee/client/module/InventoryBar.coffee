class InventoryBar
	constructor: (options)->
		@boxSize=options.boxSize
		@div=options.div
		@padding=options.padding
		@boxes=9
		@activeBox=1
		document.querySelector(@div).style="position:fixed;bottom:30px;left:50%;width:#{(@boxSize+2)*@boxes}px;margin-left:-#{@boxSize*@boxes/2}px;height:#{@boxSize}px;"
	setBox: (number,imageSrc)->
		if imageSrc is null
			imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
		document.querySelector(".inv_box_#{number}").src=imageSrc
		return
	setFocus: (number,state)->
		if state
			document.querySelector(".inv_box_#{number}").style.background="rgba(0,0,0,0.7)"
			document.querySelector(".inv_box_#{number}").style.border="1px solid black"
		else
			document.querySelector(".inv_box_#{number}").style.background="rgba(54,54,54,0.5)"
			document.querySelector(".inv_box_#{number}").style.border="1px solid #363636"
		return
	setFocusOnly: (number)->
		for i in [1..@boxes]
			@setFocus i, i is number
		@activeBox=number
		return @
	moveBoxMinus: ->
		if @activeBox + 1 > @boxes
			@setFocusOnly 1
		else
			@setFocusOnly @activeBox + 1
		return
	moveBoxPlus: ->
		if @activeBox - 1 is 0
			@setFocusOnly @boxes
		else
			@setFocusOnly @activeBox - 1
	directBoxChange: (event)->
		code = event.keyCode
		if code >= 49 and code < 49 + @boxes
			@setFocusOnly code - 48
	setBoxes: (images)->
		for i in [0..images.length-1]
			@setBox i+1,images[i]
		return @
	setHealth: (points)->
		for i in [1..10]
			document.querySelector(".he_#{i}").src="assets/images/heart/black.png"
		if points isnt 0
			for i in [1..(points+points%2)/2]
				document.querySelector(".he_#{i}").src="assets/images/heart/red.png"
			if points%2 is 1
				document.querySelector(".he_#{(points+points%2)/2}").src="assets/images/heart/half.png"
	listen: ->
		_this=@
		$(window).on 'wheel', (event) ->
			if event.originalEvent.deltaY < 0
				_this.moveBoxPlus()
			else
				_this.moveBoxMinus()
		$(document).keydown (z) ->
			_this.directBoxChange(z)
		return @

export {InventoryBar}
