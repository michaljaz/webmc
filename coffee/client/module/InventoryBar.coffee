
class InventoryBar
	constructor:(options)->
		for i in [0..9]
			$(".player_hp").append("<span class='hp'></span> ")
		for i in [0..9]
			$(".player_food").append("<span class='food'></span> ")
		for i in [1..9]
			$(".inv_bar").append("<span class='inv_box'></span> ")
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
	setFocus:(num)->
		$(".inv_cursor").css("left","calc(50vw - 253px + 55*#{num}px)")
	updateInv:(inv)->
		for i in [36..44]
			if inv[i] isnt null
				$(".inv_box").eq(i-36).css("background-image","url(/assets/items/#{inv[i].name}.png)")
			else
				$(".inv_box").eq(i-36).css("background-image","")
		return
	listen:()->
		focus=0
		@setFocus focus
		_this=@
		$(window).on 'wheel', (e)->
			if e.originalEvent.deltaY > 0
				focus++
			else
				focus--
			focus=focus %% 9
			_this.setFocus focus
export {InventoryBar}
