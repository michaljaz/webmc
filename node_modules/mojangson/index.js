var parser = require("./grammar").parser;

module.exports={parse:function(text){
  try {
    return parser.parse(text);
  }
  catch(e) {
    console.log("Error parsing text '"+text+"'");
    throw e;
  }
}};
