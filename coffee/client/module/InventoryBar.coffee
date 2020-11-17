class InventoryBar
	setHp: (points)->
		lista={}
		for i in [1..10]
			lista[i-1]="empty"
			$(".hp").eq(i-1).removeClass("empty")
			$(".hp").eq(i-1).removeClass("full")
			$(".hp").eq(i-1).removeClass("half")
		if points isnt 0
			for i in [1..(points+points%2)/2]
				lista[i-1]="full"
			if points%2 is 1
				lista[(points+points%2)/2-1]="half"
		for i in [1..10]
			$(".hp").eq(i-1).addClass(lista[i-1])
		return
	setFood: (points)->
		lista={}
		for i in [1..10]
			lista[10-i]="empty"
			$(".food").eq(10-i).removeClass("empty")
			$(".food").eq(10-i).removeClass("full")
			$(".food").eq(10-i).removeClass("half")
		if points isnt 0
			for i in [1..(points+points%2)/2]
				lista[10-i]="full"
			if points%2 is 1
				lista[10-(points+points%2)/2]="half"
		for i in [1..10]
			$(".food").eq(10-i).addClass(lista[10-i])
		return
	setXp: (level,progress)->
		$(".player_xp").text level
		$(".xp_bar").css "width","#{500*progress}px"
	listen: ->
		_this=@
		# $(window).on 'wheel', (event) ->
		# 	if event.originalEvent.deltaY < 0
		# 		_this.moveBoxPlus()
		# 	else
		# 		_this.moveBoxMinus()
		# $(document).keydown (z) ->
		# 	_this.directBoxChange(z)
		return @
export {InventoryBar}
