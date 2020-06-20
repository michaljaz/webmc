export class FirstPersonControls {
  constructor(options) {
    this.kc = {
      "w": 87,
      "s": 83,
      "a": 65,
      "d": 68,
      "space": 32,
      "shift": 16
    };
    this.keys = {}
    this.canvas = options.canvas
    this.camera = options.camera;
    this.micromove = options.micromove
  }
  ac(qx, qy, qa, qf) {
    var m_x = -Math.sin(qa) * qf;
    var m_y = -Math.cos(qa) * qf;
    var r_x = qx - m_x;
    var r_y = qy - m_y;
    return {
      x: r_x,
      y: r_y
    };
  }
  degtorad(deg) {
    return deg * Math.PI / 180;
  }
  radtodeg(rad) {
    return rad * 180 / Math.PI;
  }
  camMicroMove() {
    // console.log(this.micromove)
    if (this.keys[this.kc["w"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(180), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(180), this.micromove).y;
    }
    if (this.keys[this.kc["s"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y, this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y, this.micromove).y;
    }
    if (this.keys[this.kc["a"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y - this.degtorad(90), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y - this.degtorad(90), this.micromove).y;
    }
    if (this.keys[this.kc["d"]]) {
      this.camera.position.x = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(90), this.micromove).x;
      this.camera.position.z = this.ac(this.camera.position.x, this.camera.position.z, this.camera.rotation.y + this.degtorad(90), this.micromove).y;
    }
    if (this.keys[this.kc["space"]]) {
      this.camera.position.y += this.micromove;
    }
    if (this.keys[this.kc["shift"]]) {
      this.camera.position.y -= this.micromove;
    }
  }
  lockPointer() {
    this.canvas.requestPointerLock()
  }
}
