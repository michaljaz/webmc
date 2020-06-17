function FirstPersonControls(_canvas,_camera,_micromove){
  var canvas=_canvas;
  var camera=_camera;
  var micromove=_micromove
  var kc={"w":87,"s":83,"a":65,"d":68,"space":32,"shift":16};
  var keys={}

  function ac(qx,qy,qa,qf){
    var m_x=-Math.sin(qa)*qf;
    var m_y=-Math.cos(qa)*qf;
    var r_x=qx-m_x;
    var r_y=qy-m_y;
    return {x:r_x,y:r_y};
  }
  $(document).click(function (){
    canvas=document.querySelector("canvas");
    canvas.requestPointerLock()
  })
  function lockChangeAlert() {
    if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas) {
      document.addEventListener("mousemove", updatePosition, false);
    }else{
      document.removeEventListener("mousemove", updatePosition, false);
    }
  }
  function updatePosition(e) {
    camera.rotation.x-=degtorad(e.movementY/10)
    camera.rotation.y-=degtorad(e.movementX/10)
    if(radtodeg(camera.rotation.x)<-90){
      camera.rotation.x=degtorad(-90)
    }
    if(radtodeg(camera.rotation.x)>90){
      camera.rotation.x=degtorad(90)
    }
  }
  function degtorad(deg){
    return deg*Math.PI/180;
  }
  function radtodeg(rad){
    return rad*180/Math.PI;
  }
  function camMicroMove(){
    if(keys[kc["w"]]){
      camera.position.x=ac(camera.position.x,camera.position.z,camera.rotation.y+degtorad(180),micromove).x;
      camera.position.z=ac(camera.position.x,camera.position.z,camera.rotation.y+degtorad(180),micromove).y;
    }
    if(keys[kc["s"]]){
      camera.position.x=ac(camera.position.x,camera.position.z,camera.rotation.y,micromove).x;
      camera.position.z=ac(camera.position.x,camera.position.z,camera.rotation.y,micromove).y;
    }
    if(keys[kc["a"]]){
      camera.position.x=ac(camera.position.x,camera.position.z,camera.rotation.y-degtorad(90),micromove).x;
      camera.position.z=ac(camera.position.x,camera.position.z,camera.rotation.y-degtorad(90),micromove).y;
    }
    if(keys[kc["d"]]){
      camera.position.x=ac(camera.position.x,camera.position.z,camera.rotation.y+degtorad(90),micromove).x;
      camera.position.z=ac(camera.position.x,camera.position.z,camera.rotation.y+degtorad(90),micromove).y;
    }
    if(keys[kc["space"]]){
      camera.position.y+=micromove;
    }
    if(keys[kc["shift"]]){
      camera.position.y-=micromove;
    }
  }
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  setInterval(function (){
    camMicroMove()
  })
  $(document).keydown(function (z){
    keys[z.keyCode]=true;
  })
  $(document).keyup(function (z){
    delete keys[z.keyCode];
  })
  $('body').append("<canvas id='xxdd'></canvas>")
  var p=document.getElementById("xxdd");
  var ctx=p.getContext("2d");
  $("#xxdd").attr("style","position:fixed;top:0px;left:0px")
  p.width=window.innerWidth
  p.height=window.innerHeight
  var cw=15;
  ctx.lineWidth=1
  ctx.beginPath();
  ctx.moveTo(window.innerWidth/2-cw,window.innerHeight/2);
  ctx.lineTo(window.innerWidth/2+cw,window.innerHeight/2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(window.innerWidth/2,window.innerHeight/2-cw);
  ctx.lineTo(window.innerWidth/2,window.innerHeight/2+cw);
  ctx.stroke()
}