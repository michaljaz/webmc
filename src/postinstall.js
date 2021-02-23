var extract = require("extract-zip");
extract(
    `${__dirname}/assets/pack.zip`,
    { dir: `${__dirname}/assets/pack` },
    function (err) {
        console.log(err);
    }
);
