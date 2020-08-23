const fs = require('fs');
const opn=require("opn");



var config = JSON.parse(fs.readFileSync(__dirname+'/config.json'))

require("./server/websocket.js")(config)
require("./server/express.js")(config)

// opn(`http://${config["host"]}:${config["express-port"]}`)
const stripEof = require('strip-eof');
var term = require( 'terminal-kit' ).terminal ;
term.clear()
term.green((fs.readFileSync(__dirname+'/src/asciiLogo')))
info()
// // Get some user input

incon()

function stop(){
	term.brightGreen("\nServer stopped!\n")
		process.exit()
}
function help(){
	term.brightGreen(`
help\t- pomoc
stop\t- zatrzymanie serwera
open\t- uruchomienie przeglądarki pod adresem serwera
clear\t- czyści consolę
info\t- wypisuje informacje o serwerze
`)
}
function info(){
	term.gray(`\nSerwer websocket działa pod adresem: http://${config["host"]}:${config["websocket-port"]}\n`)
	term.bold.magenta(`Serwer WWW działa pod adresem: http://${config["host"]}:${config["express-port"]}\n`)
}

function com(command){
	if(command=="stop"){
		stop()
	}else if(command=="help" || command=="?"){
		help()
	}else if(command=="clear"){
		term.clear()
	}else if(command=="open"){
		opn(`http://${config["host"]}:${config["express-port"]}`)
	}else if(command=="info"){
		info()
	}else if(command!=""){
		term.red("\nNieznana komenda. Użyj 'help' lub '?' aby uzyskać pomoc.")
	}
	incon()
}
function incon(){
	term.green( "\nserver> " ) ;
	term.inputField(
		{
			autoComplete: [
				'help' ,
				'stop' ,
				'?',
				'open',
				'clear',
				'info'
			] ,
			autoCompleteHint: true ,
			autoCompleteMenu: true ,
		},
	    function( er , input ) {
	        com(input)
	    }
	)
}
term.on( 'key' , function( name , matches , data ) {
	if ( name === 'CTRL_C' ) { stop() }
} ) ;

