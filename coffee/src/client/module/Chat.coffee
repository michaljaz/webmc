class Chat
	constructor:(game)->
		@game=game
		@chatDiv=document.querySelector(".chat")
		@listen()
		@history=[""]
		@histState=0
		_this=@
		$(".com_i").on "input",()->
			_this.history[_this.history.length-1]=$(".com_i").val()
			console.log _this.history
		return
	chatGoBack:()->
		if @histState > 0
			@histState--
			$(".com_i").val @history[@histState]
		return
	chatGoForward:()->
		if @histState < @history.length-1
			@histState++
			$(".com_i").val @history[@histState]
		return
	listen:()->
		_this=@
		window.addEventListener "wheel", (e)->
			if _this.game.FPC.gameState isnt "chat"
				e.preventDefault()
			return
		, {passive: false}
		return @
	isElementScrolledToBottom:(el)->
		if el.scrollTop >= (el.scrollHeight - el.offsetHeight)
			return true
		return false
	scrollToBottom:(el)->
		el.scrollTop = el.scrollHeight
		return
	log:(message)->
		$(".chat").append "<span>#{message}<br></span>"
		@scrollToBottom @chatDiv
		return

	command:(com)->
		if com isnt ""
			@history[@history.length-1]=com
			@history.push ""
			@histState=@history.length-1
			console.log @history
			@game.socket.emit "command",com
export {Chat}
