const WebpackBar = require("webpackbar");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
    entry: {
        main: `${__dirname}/scripts/index.js`,
        bootstrap: [`${__dirname}/styles/style.scss`, "bootstrap"],
    },
    output: {
        path: `${__dirname}/dist`,
        filename: "[contenthash].js",
    },
    performance: {
        hints: false,
        maxEntrypointSize: 1.5e6,
        maxAssetSize: 1.5e6,
    },
    module: {
        rules: [
            {
                loader: "worker-loader",
                test: /\.worker\.js$/,
                options: {
                    filename: "[contenthash].js",
                },
            },
            {
                test: /\.(scss)$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "sass-loader",
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader",
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: "file-loader",
                    },
                ],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: `${__dirname}/html/index.html`,
            inject: "head",
            favicon: `${__dirname}/assets/images/favicon.png`,
        }),
        new LodashModuleReplacementPlugin(),
        new WebpackBar(),
        new CopyPlugin({
            patterns: [
                {
                    from: `${__dirname}/assets`,
                    to: "assets",
                },
            ],
        }),
    ],
};
