var axios = require("axios");

var JSSoup = require("jssoup").default;

var fs = require("fs");

if (!fs.existsSync(`${__dirname}/assets/items/`)) {
    fs.mkdirSync(`${__dirname}/assets/items/`);
}

var removeBg = function () {
    var dir_path, replaceColor;
    replaceColor = require("replace-color");
    fs = require("fs");
    removeBg = function (filePath) {
        return replaceColor(
            {
                image: filePath,
                colors: {
                    type: "rgb",
                    targetColor: [139, 139, 139],
                    replaceColor: [0, 0, 0, 0],
                },
            },
            function (err, jimpObject) {
                if (err) {
                    return console.log(err);
                }
                return jimpObject.write(filePath, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                });
            }
        );
    };
    dir_path = `${__dirname}/assets/items/`;
    return fs.readdir(dir_path, function (err, files) {
        files.forEach(function (file) {
            var filePath;
            filePath = `${__dirname}/assets/items/` + file;
            removeBg(filePath);
        });
    });
};

axios({
    method: "GET",
    url: "https://www.digminecraft.com/lists/item_id_list_pc.php",
    encoding: "utf-8",
}).then(function (r) {
    var i, ile, j, k, l, last, len, ref, ref1, req, soup, war, zal;
    soup = new JSSoup(r.data);
    last = null;
    ile = 0;
    zal = 0;
    req = function (type, url) {
        var file;
        file = fs.createWriteStream(`${__dirname}/assets/items/${type}.png`);
        axios({
            method: "GET",
            url,
            responseType: "stream",
        })
            .then(function (r) {
                console.log(`\x1b[32m${type} \x1b[33m${url}\x1b[0m`);
                r.data.pipe(file);
                zal += 1;
                if (ile === zal) {
                    console.log("\x1b[32mRemoving gray backgrounds...\x1b[0m");
                    removeBg();
                }
            })
            .catch(function () {
                console.log("Reconnecting...");
                return req(type, url);
            });
    };
    ref = soup.findAll("td");
    for (k = 0, len = ref.length; k < len; k++) {
        i = ref[k];
        if (i.text !== "&nbsp;" && i.text.includes("minecraft:")) {
            ile += 1;
            war = 0;
            for (
                j = l = 0, ref1 = i.text.length - 1;
                0 <= ref1 ? l <= ref1 : l >= ref1;
                j = 0 <= ref1 ? ++l : --l
            ) {
                if (i.text[j] === "(") {
                    war = j;
                }
            }
            req(
                i.text.substr(war + 11).split(")")[0],
                `https://www.digminecraft.com${last}`
            );
        } else if (i.find("img") !== void 0) {
            last = i.find("img").attrs["data-src"];
        }
    }
});
