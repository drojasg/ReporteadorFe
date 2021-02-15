const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

const outputDirectory = "dist";
const configCleverApp = {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.PORT' : JSON.stringify(process.env.PORT),
    'process.env.APP_ENV' : JSON.stringify(process.env.APP_ENV)
};

module.exports = {
    mode: process.env.NODE_ENV,
    entry: path.join(__dirname, '/src/client/index.js'),
    output: {
        path: path.join(__dirname, outputDirectory),
        filename: "bundle.js",
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader","sass-loader"]
            },
            {
                test: /\.(pdf|jpg|png|gif|svg|ico|woff|woff2|eot|ttf)$/,
                loader: "url-loader?limit=100000"
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        historyApiFallback: true,
        port: 5000,
        proxy: {
            "/api": {
                target : "http://bengine.dev.palace-resorts.local:" + process.env.PORT,
                pathRewrite: {
                  '^/api' : ''
                }
            }
        }
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            filename: "index.html",
            inject: 'body'
        }),
        new webpack.DefinePlugin(configCleverApp)
    ],
    resolve: {
        alias: {
            'react-router-dom': path.resolve('./node_modules/react-router-dom')
        }
    }
};
