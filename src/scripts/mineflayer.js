process.versions.node = '14.0.0'
global.Buffer = global.Buffer || require('buffer').Buffer

export default function (protocol, proxyHost, proxyPort, botConfig) {
  require('net').setProxy({ hostname: proxyHost, port: proxyPort, protocol })
  return require('mineflayer').createBot(botConfig)
}
