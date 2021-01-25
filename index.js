require("coffeescript/register");
if(process.argv[2]==="dev"){
    require("./src/server/server.coffee")("development");
}else if(process.argv[2]==="prod"){
    require("./src/server/server.coffee")("production");
}else if(process.argv[2]==="preb"){
    require("./src/server/prebuild.coffee");
}