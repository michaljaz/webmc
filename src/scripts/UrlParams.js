import swal from 'sweetalert'

function UrlParams (game) {
  return new Promise((resolve) => {
    const nameList = game.al.get('nameList').split('\n')
    const finalName = nameList[Math.floor(Math.random() * nameList.length)]
    game.nick = new URL(document.location).searchParams.get('nick')
    game.server = new URL(document.location).searchParams.get('server')
    game.serverPort = new URL(document.location).searchParams.get('port')
    game.premium = new URL(document.location).searchParams.get('premium')
    game.proxy = {
      hostname: new URL(document.location).searchParams.get('proxyHost'),
      port: new URL(document.location).searchParams.get('proxyPort')
    }
    let reload = false
    if (game.nick === '' || game.nick === null) {
      reload = true
      game.nick = finalName
    }
    if (game.server === '' || game.server === null) {
      reload = true
      game.server = game.production
        ? game.servers.production[0]
        : game.servers.development[0]
    }
    if (game.serverPort === '' || game.serverPort === null) {
      reload = true
      game.serverPort = game.production
        ? game.servers.production[1]
        : game.servers.development[1]
    }
    if (game.premium === '' || game.premium === null) {
      reload = true
      game.premium = 'false'
    }
    if (game.proxy.hostname === '' || game.proxy.hostname === null) {
      reload = true
      game.proxy.hostname = game.production ? 'web-minecraft-proxy.herokuapp.com' : 'local'
    }
    if (game.proxy.port === '' || game.proxy.port === null) {
      reload = true
      game.proxy.port = game.production ? '80' : 'local'
    }
    if (reload) {
      document.location.href = `?server=${game.server}&port=${game.serverPort}&nick=${game.nick}&premium=${game.premium}&proxyHost=${game.proxy.hostname}&proxyPort=${game.proxy.port}`
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
