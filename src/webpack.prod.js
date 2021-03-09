var merge = require("webpack-merge");
var common = require(`${__dirname}/webpack.common.js`);
var webpack = require("webpack");

module.exports = merge.merge(common, {
    mode: "production",
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(true),
        }),
    ],
});
