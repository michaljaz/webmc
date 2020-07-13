class InventoryBar {
  constructor(options) {
    this.boxSize = options.boxSize;
    this.div = options.div;
    this.padding = options.padding;
    this.boxes = options.boxes;
    this.setup()
    this.activeBox = options.activeBox
  }
  setup() {
    const {
      boxes,
      boxSize,
      padding
    } = this;
    // console.warn("InventoryBar created!")
    var result = ``;
    for (var i = 0; i < boxes; i++) {
      result += `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" width=${boxSize} height=${boxSize} class="inv_box_${i}" style="border:1px solid black" alt="">`
    }
    document.querySelector(this.div).style=`position:fixed;bottom:3px;left:50%;width:${(boxSize+2)*boxes}px;margin-left:-${boxSize*boxes/2}px;height:${boxSize}px;`
    document.querySelector(this.div).innerHTML=result
  }
  setBox(number, imageSrc) {
    if (imageSrc == null) {
      imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }
    document.querySelector(`.inv_box_${number-1}`).src=imageSrc
  }
  setFocus(number, state) {

    if (state) {
      document.querySelector(`.inv_box_${number-1}`).style.background="rgba(0,0,0,0.7)"
      document.querySelector(`.inv_box_${number-1}`).style.border="1px solid black"
    } else {
      document.querySelector(`.inv_box_${number-1}`).style.background="rgba(54,54,54,0.5)"
      document.querySelector(`.inv_box_${number-1}`).style.border="1px solid #363636"
    }
  }
  setFocusOnly(number) {
    const {
      boxes
    } = this;
    for (var i = 1; i <= boxes; i++) {
      this.setFocus(i, i == number)
    }
    this.activeBox = number
  }
  moveBoxMinus() {
    if (this.activeBox + 1 > this.boxes) {
      this.setFocusOnly(1);
    } else {
      this.setFocusOnly(this.activeBox + 1);
    }
  }
  moveBoxPlus() {
    if (this.activeBox - 1 == 0) {
      this.setFocusOnly(this.boxes);
    } else {
      this.setFocusOnly(this.activeBox - 1);
    }
  }
  directBoxChange(event) {
    var code = event.keyCode
    if (code >= 49 && code < 49 + this.boxes) {
      this.setFocusOnly(code - 48)
    }
  }
}
export {InventoryBar}