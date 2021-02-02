require("coffeescript/register");
if(process.argv[2]==="dev"){
    require("./src/index.coffee")("development");
}else if(process.argv[2]==="prod"){
    require("./src/index.coffee")("production");
}else if(process.argv[2]==="preb"){
    require("./src/prebuild.coffee");
}else if(process.argv[2]==="items"){
    require("./src/itemDump.coffee");
}else if(process.argv[2]==="server"){
    require("./src/minecraft.coffee");
}