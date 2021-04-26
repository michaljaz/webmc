function UrlParams (game) {
  const nameList = game.al.get('nameList').split('\n')
  const finalName = nameList[Math.floor(Math.random() * nameList.length)]
  game.nick = new URL(document.location).searchParams.get('nick')
  game.server = new URL(document.location).searchParams.get('server')
  game.proxy = new URL(document.location).searchParams.get('proxy')
  let reload = false
  if (game.nick === '' || game.nick === null) {
    reload = true
    game.nick = finalName
  }
  if (game.server === '' || game.server === null) {
    reload = true
    game.server = game.production ? game.servers.production : game.servers.development
  }
  if (game.proxy === '' || game.proxy === null) {
    reload = true
    if (game.production) {
      game.proxy = 'production'
    } else {
      game.proxy = 'local'
    }
  }
  if (document.location.protocol !== 'https:' && game.proxy === 'production') {
    console.error('Web-minecraft in production mode needs https!')
  }
  if (reload) {
    document.location.href = `?server=${game.server}&nick=${game.nick}&proxy=${game.proxy}`
  }
}

export { UrlParams }
