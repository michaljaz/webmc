var extract = require("extract-zip");
extract(
    `${__dirname}/assets/pack.zip`,
    { dir: `${__dirname}/assets/pack` },
    function (err) {
        // handle err
        console.log(err);
    }
);
