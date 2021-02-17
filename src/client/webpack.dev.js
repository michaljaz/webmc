var merge = require("webpack-merge");
var common = require(`${__dirname}/webpack.common.js`);
var webpack = require("webpack");

module.exports = merge.merge(common, {
    devtool: "inline-source-map",
    mode: "development",
    plugins: [
        new webpack.DefinePlugin({
            PRODUCTION: JSON.stringify(false),
        }),
    ],
});
