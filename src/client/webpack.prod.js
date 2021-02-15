var common, merge, webpack;

merge = require("webpack-merge");

common = require(`${__dirname}/webpack.common.js`);

webpack = require("webpack");

module.exports = merge.merge(common, {
  mode: "production",
  plugins: [
    new webpack.DefinePlugin({
      PRODUCTION: JSON.stringify(true),
    }),
  ],
});
