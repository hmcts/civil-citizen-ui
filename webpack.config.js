const path = require('path');

const sourcePath = path.resolve(__dirname, 'src/main/');
const govukFrontend = require(path.resolve(__dirname, 'webpack/govukFrontend'));
const scss = require(path.resolve(__dirname,'webpack/scss'));
const HtmlWebpack = require(path.resolve(__dirname,'webpack/htmlWebpack'));
const nodeExternals = require('webpack-node-externals');

const devMode = process.env.NODE_ENV !== 'production';
const fileNameSuffix = devMode ? '-dev' : '.[contenthash]';
const filename = `[name]${fileNameSuffix}.js`;

module.exports = {
  plugins: [...govukFrontend.plugins, ...scss.plugins, ...HtmlWebpack.plugins ],
  entry: path.resolve(sourcePath, 'server.ts') ,
  mode: devMode ? 'development': 'production',
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [...scss.rules],
  },
  output: {
    path: path.resolve(__dirname, 'src/main/public/'),
    publicPath: '',
    filename,
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
    fallback: { "os": false },
    modules: [
      path.join(__dirname, 'node_modules')
    ],
  },
};
