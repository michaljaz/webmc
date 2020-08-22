module.exports = function(port) {
	const express = require('express');
	const app = express();

	app.use(express.static(__dirname + "/../client/"));
	app.use((req, res, next) => {
	  res.set('Cache-Control', 'no-store')
	  next()
	})
	app.listen(port, () => {
	  console.log(`Running: \x1b[35m\x1b[4mhttp://localhost:${port}\x1b[0m`);
	});
}
