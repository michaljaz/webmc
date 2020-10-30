
opn=require "opn"
fs=require "fs"
config=JSON.parse fs.readFileSync(__dirname+"/config.json")
require("./server")(config)

opn("http://#{config.host}:#{config['express-port']}")
