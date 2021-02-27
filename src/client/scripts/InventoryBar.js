class InventoryBar {
    constructor(game) {
        this.game = game;
        for (let i = 0; i < 10; i++) {
            $(".player_hp").append("<span class='hp'></span> ");
        }
        for (let i = 0; i < 10; i++) {
            $(".player_food").append("<span class='food'></span> ");
        }
        for (let i = 1; i < 10; i++) {
            $(".inv_bar").append(
                "<span class='inv_box item' data-texture=''></span> "
            );
        }
    }

    setGamemode(gamemode) {
        // mineflayer doesn't currently include support for spectator mode
        if (gamemode === "creative") {
            $(
                (gamemode === "spectator" ? ".inv_bar, .inv_cursor" : "") +
                    ".player_hp, .player_food, .xp_bar_empty, xp_bar"
            ).css("display", "none");
        } else {
            $(".player_hp, .player_food, .xp_bar_empty, xp_bar").css(
                "display",
                "initial"
            );
        }
    }

    setHp(points) {
        var lista = {};
        for (let i = 1; i <= 10; i++) {
            lista[i - 1] = "empty";
            $(".hp")
                .eq(i - 1)
                .removeClass("empty");
            $(".hp")
                .eq(i - 1)
                .removeClass("full");
            $(".hp")
                .eq(i - 1)
                .removeClass("half");
        }
        if (points !== 0) {
            for (let i = 1; i <= (points + (points % 2)) / 2; i++) {
                lista[i - 1] = "full";
            }
            if (points % 2 === 1) {
                lista[(points + (points % 2)) / 2 - 1] = "half";
            }
        }
        for (let i = 1; i <= 10; i++) {
            $(".hp")
                .eq(i - 1)
                .addClass(lista[i - 1]);
        }
    }

    setFood(points) {
        var lista = {};
        for (var i = 1; i <= 10; i++) {
            lista[10 - i] = "empty";
            $(".food")
                .eq(10 - i)
                .removeClass("empty");
            $(".food")
                .eq(10 - i)
                .removeClass("full");
            $(".food")
                .eq(10 - i)
                .removeClass("half");
        }
        if (points !== 0) {
            for (let i = 1; i <= (points + (points % 2)) / 2; i++) {
                lista[10 - i] = "full";
            }
            if (points % 2 === 1) {
                lista[10 - (points + (points % 2)) / 2] = "half";
            }
        }
        for (let i = 1; i <= 10; i++) {
            $(".food")
                .eq(10 - i)
                .addClass(lista[10 - i]);
        }
    }

    setXp(level, progress) {
        if (level === 0) {
            $(".player_xp").hide();
        } else {
            $(".player_xp").show();
            $(".player_xp").text(level);
        }
        return $(".xp_bar").css("width", `${500 * progress}px`);
    }

    setFocus(num) {
        $(".inv_cursor").css("left", `calc(50vw - 253px + 55*${num}px)`);
        this.game.socket.emit("invc", num);
    }

    updateInv(inv) {
        for (var i = 36; i <= 44; i++) {
            if (inv[i] !== null) {
                $(".inv_box")
                    .eq(i - 36)
                    .attr("data-texture", inv[i].name);
                $(".inv_box")
                    .eq(i - 36)
                    .attr("data-amount", String(inv[i].count));
            } else {
                $(".inv_box")
                    .eq(i - 36)
                    .attr("data-texture", "");
                $(".inv_box")
                    .eq(i - 36)
                    .attr("data-amount", "0");
            }
        }
    }

    update() {
        var list = $(".item");
        for (var i = 0; i < list.length; i++) {
            var url;
            if ($(list[i]).attr("data-texture") === "") {
                url = "";
            } else {
                url = "/assets/items/items-Atlas.png";
                let tex = 43;
                let items = this.game.al.get("itemsMapping");
                $(list[i]).css("background-repeat", "no-repeat");
                let pos = items[$(list[i]).attr("data-texture")];
                $(list[i]).css(
                    "background-position",
                    `-${(pos.x - 1) * tex}px -${(pos.y - 1) * tex}px`
                );
                $(list[i]).css("background-size", `calc(1600px * ${tex / 50})`);
            }
            $(list[i]).css("background-image", `url(${url})`);
            $(list[i]).html(
                "<div style='z-index:99;text-align:right;position:relative;bottom:-22px;color:white;font-weight:bold;'>" +
                    $(list[i]).attr("data-amount") +
                    "</div>"
            );
            if (
                $(list[i]).attr("data-amount") === "0" ||
                $(list[i]).attr("data-amount") === "1"
            ) {
                $(list[i]).html(
                    "<div style='z-index:99;text-align:right;position:relative;bottom:-22px;color:white;font-weight:bold;'>&#8291</div>"
                );
            }
        }
    }
}

export { InventoryBar };
