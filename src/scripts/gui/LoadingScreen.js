import $ from 'jquery'

class LoadingScreen {
  constructor (game) {
    this.game = game
  }

  show (text) {
    $('.loadingText').text(text)
    $('.initLoading').css('display', 'block')
  }

  hide () {
    $('.initLoading').css('display', 'none')
  }
}

export { LoadingScreen }
