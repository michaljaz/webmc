class TextureAtlasCreator {
  constructor(options){
    this.textureX=options.textureX;
    this.textureMapping=options.textureMapping
    this.size=36
    this.willSize=27
  }
  gen(tick){
    const {textureX,textureMapping,size,willSize} = this;
    var multi={}
    for(var i in textureMapping){
      if(i.includes("@")){
        var xd=this.decodeName(i);
        if(multi[xd.pref]==undefined){
          multi[xd.pref]=xd;
        }else{
          multi[xd.pref].x=Math.max(multi[xd.pref].x,xd.x)
          multi[xd.pref].y=Math.max(multi[xd.pref].y,xd.y)
        }
        // console.log(xd)
      }
    }

    var canvas = document.createElement('canvas');
    var ctx=canvas.getContext("2d")
    canvas.width=willSize*16
    canvas.height=willSize*16

    var toxelX=1;
    var toxelY=1;


    for(var i in textureMapping){
      if(i.includes("@")){
        var xd=this.decodeName(i);
        if(multi[xd.pref].loaded==undefined){
          // console.log(xd.pref,multi[xd.pref].x+1,multi[xd.pref].y+1)
          multi[xd.pref].loaded=true
          //add toxel to canvas

          var lol=this.getToxelForTick(tick,multi[xd.pref].x+1,multi[xd.pref].y+1)

          var texmap=textureMapping[`${xd.pref}@${lol.col}@${lol.row}`]
          // console.log(`${xd.pref}@${lol.col}@${lol.row}`)
          ctx.drawImage(textureX,(texmap.x-1)*16,(texmap.y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16)

          toxelX++;
          if(toxelX>willSize){
            toxelX=1;
            toxelY++;
          }
        }
        // console.log(xd.pref)
      }else{
        // console.log(i)
        //add toxel to canvas
        ctx.drawImage(textureX,(textureMapping[i].x-1)*16,(textureMapping[i].y-1)*16,16,16,(toxelX-1)*16,(toxelY-1)*16,16,16)

        toxelX++;
        if(toxelX>willSize){
          toxelX=1;
          toxelY++;
        }
      }
    }
    return canvas
  }
  decodeName(i){
    var m=null;
    for(var j=0;j<i.length;j++){
      if(i[j]=="@"){
        m=j;
        break;
      }
    }
    var pref=i.substr(0,m);
    var sub=i.substr(m,i.length)
    var m2=null;
    for(var j=0;j<sub.length;j++){
      if(sub[j]=="@"){
        m2=j;
      }
    }
    var x=parseInt(sub.substr(1,m2-1))

    var y=parseInt(sub.substr(m2+1,sub.length))
    // console.log(pref,x,y)
    return {pref,x,y}
  }
  getToxelForTick(tick,w,h){
    tick=tick%(w*h)+1;
    // console.log(tick)
    //option1
      var col=(tick-1)%w;
      var row=Math.ceil(tick/w)-1;
    //option2
      // var col=Math.ceil(tick/h)-1;
      // var row=(tick-1)%h;
    return {
      row,
      col
    }
  }  
}
export {TextureAtlasCreator};