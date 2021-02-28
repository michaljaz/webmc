var Chat;

Chat = class Chat {
  constructor(game) {
    var _this;
    this.game = game;
    this.chatDiv = document.querySelector(".chat");
    this.listen();
    this.history = [""];
    this.histState = 0;
    _this = this;
    $(".com_i").on("input", function () {
      _this.history[_this.history.length - 1] = $(".com_i").val();
      return console.log(_this.history);
    });
    return;
  }

  chatGoBack() {
    if (this.histState > 0) {
      this.histState--;
      $(".com_i").val(this.history[this.histState]);
    }
  }

  chatGoForward() {
    if (this.histState < this.history.length - 1) {
      this.histState++;
      $(".com_i").val(this.history[this.histState]);
    }
  }

  listen() {
    var _this;
    _this = this;
    window.addEventListener(
      "wheel",
      function (e) {
        if (_this.game.FPC.gameState !== "chat") {
          e.preventDefault();
        }
      },
      {
        passive: false,
      }
    );
    return this;
  }

  isElementScrolledToBottom(el) {
    if (el.scrollTop >= el.scrollHeight - el.offsetHeight) {
      return true;
    }
    return false;
  }

  scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
  }

  log(message) {
    let elem = document.createElement("div");
    elem.innerHTML = message+"<br>";
    this.chatDiv.append(elem);
    this.scrollToBottom(this.chatDiv);
  }

  command(com) {
    if (com !== "") {
      this.history[this.history.length - 1] = com;
      this.history.push("");
      this.histState = this.history.length - 1;
      console.log(this.history);
      return this.game.socket.emit("command", com);
    }
  }
};

export { Chat };
