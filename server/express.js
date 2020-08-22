module.exports = function(config) {
	var port=config["express-port"]
	const express = require('express');
	const app = express();

	app.use(express.static(__dirname + "/../client/"));
	app.use((req, res, next) => {
	  res.set('Cache-Control', 'no-store')
	  next()
	})
	app.get("/websocket/",function (req,res){
		res.send(String(config["websocket-port"]))
	})
	app.get("/host/",function (req,res){
		res.send(String(config["host"]))
	})
	app.listen(port, () => {
	  console.log(`Running: \x1b[35m\x1b[4mhttp://${config["host"]}:${port}\x1b[0m`);
	});
}
