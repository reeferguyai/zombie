const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/js/game.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'game.bundle.js',
        clean: true
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        port: 8080,
        hot: true
    },
    plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
    resolve: { extensions: ['.js'] }
};
