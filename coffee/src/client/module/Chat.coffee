class Chat
	constructor:(game)->
		@game=game
		@chatDiv = document.querySelector(".chat")
		@listen()
		@history=[]
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
		atBottom = @isElementScrolledToBottom(@chatDiv)
		$(".chat").append(message+"<br>")
		if atBottom
			@scrollToBottom(@chatDiv)
		return
	command:(com)->
		if com isnt ""
			@history.push com
			@game.socket.emit "command",com
export {Chat}
