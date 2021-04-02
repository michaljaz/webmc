import swal from 'sweetalert'

function UrlParams (game) {
  return new Promise((resolve) => {
    const nameList = game.al.get('nameList').split('\n')
    const finalName = nameList[Math.floor(Math.random() * nameList.length)]
    game.nick = new URL(document.location).searchParams.get('nick')
    game.server = new URL(document.location).searchParams.get('server')
    game.premium = new URL(document.location).searchParams.get('premium')
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
    if (game.premium === '' || game.premium === null) {
      reload = true
      game.premium = 'false'
    }
    if (game.proxy === '' || game.proxy === null) {
      reload = true
      if (game.production) {
        if (document.location.protocol === 'https:') {
          game.proxy = 'wss:web-minecraft-proxy.herokuapp.com:443'
        } else {
          game.proxy = 'ws:web-minecraft-proxy.herokuapp.com:80'
        }
      } else {
        game.proxy = 'local'
      }
    }
    if (reload) {
      document.location.href = `?server=${game.server}&nick=${game.nick}&premium=${game.premium}&proxy=${game.proxy}`
    } else {
      if (game.premium === 'true') {
        swal({
          text: 'Enter password for premium account',
          content: 'input',
          button: {
            text: 'Login'
          }
        }).then((password) => {
          resolve(password)
        })
      } else {
        resolve(null)
      }
    }
  })
}

export { UrlParams }
