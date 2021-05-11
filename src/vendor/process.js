// shim for using process in browser
const process = module.exports = {}

process.nextTick = function (fun, ...args) {
  setTimeout(() => { fun(...args) }, 0)
}

process.title = 'browser'
process.browser = true
process.env = {}
process.argv = []
process.version = '' // empty string to avoid regexp issues
process.versions = {}

function noop () { }

process.on = noop
process.addListener = noop
process.once = noop
process.off = noop
process.removeListener = noop
process.removeAllListeners = noop
process.emit = noop
process.prependListener = noop
process.prependOnceListener = noop

process.listeners = function () { return [] }

process.binding = function () {
  throw new Error('process.binding is not supported')
}

process.cwd = function () { return '/' }
process.chdir = function () {
  throw new Error('process.chdir is not supported')
}
process.umask = function () { return 0 }
