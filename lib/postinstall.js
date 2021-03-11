const decompress = require("decompress");
decompress(
    `${__dirname}/../assets/pack.zip`,
    `${__dirname}/../assets/pack`
).then(() => {
    console.log("done!");
});
const decompressTarxz = require("decompress-tarxz");

(async () => {
    await decompress(
        `${__dirname}/../assets/mineflayer.tar.xz`,
        `${__dirname}/../src/mineflayer`,
        {
            plugins: [decompressTarxz()],
        }
    );

    console.log("Files decompressed");
})();
