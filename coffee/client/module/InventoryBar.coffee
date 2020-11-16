class InventoryBar
	constructor: (options)->
		@boxSize=options.boxSize
		@div=options.div
		@padding=options.padding
		@boxes=9
		@activeBox=1
		document.querySelector(@div).style="position:fixed;bottom:50px;left:50%;width:#{(@boxSize+2)*@boxes}px;margin-left:-#{@boxSize*@boxes/2}px;height:#{@boxSize}px;"
	setBox: (number,imageSrc)->
		if imageSrc is null
			imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
		$(".inv_box").eq(number-1).attr("src",imageSrc)
		return
	setFocus: (number,state)->
		if state
			$(".inv_box").eq(number-1).css("background","rgba(0,0,0,0.7)")
			$(".inv_box").eq(number-1).css("border","1px solid black")
		else
			$(".inv_box").eq(number-1).css("background","rgba(54,54,54,0.5)")
			$(".inv_box").eq(number-1).css("border","1px solid #363636")
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
	setHp: (points)->
		for i in [1..10]
			$(".hp").eq(i-1).attr("src","assets/images/heart/black.png")
		if points isnt 0
			for i in [1..(points+points%2)/2]
				$(".hp").eq(i-1).attr("src","assets/images/heart/red.png")
			if points%2 is 1
				$(".hp").eq((points+points%2)/2-1).attr("src","assets/images/heart/half.png")
		return
	setFood: (points)->
		for i in [1..10]
			$(".food").eq(10-i).attr("src","assets/images/hunger/black.png")
		if points isnt 0
			for i in [1..(points+points%2)/2]
				$(".food").eq(10-i).attr("src","assets/images/hunger/full.png")
			if points%2 is 1
				$(".food").eq(10-(points+points%2)/2).attr("src","assets/images/hunger/half.png")
		return
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
