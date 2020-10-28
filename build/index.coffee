
el=require "electron"
fs=require "fs"

config=JSON.parse fs.readFileSync(__dirname+"/config.json")
require("./server")(config)

el.app.on 'ready', ()->
  size=el.screen.getPrimaryDisplay().size
  win = new el.BrowserWindow({ width:size.width, height:size.height,icon:__dirname+"/client/assets/images/icon.png"})
  win.setMenuBarVisibility(false)
  win.setAutoHideMenuBar(true)
  win.loadURL("http://#{config.host}:#{config['express-port']}")
