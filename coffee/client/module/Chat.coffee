class Chat
  constructor:(options)->
    _this=@
    @FPC=options.FPC
    @chatDiv = document.querySelector(".chat")
    @listen()
    return
  listen:()->
    _this=@
    window.addEventListener "wheel", (e)->
      if _this.FPC.gameState isnt "chat"
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
export {Chat}
