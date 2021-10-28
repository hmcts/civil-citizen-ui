const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const root = path.resolve(__dirname, './../../');
const sass = path.resolve(root, './main/assets/scss');
const images = path.resolve(root, './main/assets/images');

const copyLookAndFeelAssets = new CopyWebpackPlugin({
  patterns: [{ from: images, to: 'images' }],
});

module.exports = {
  paths: { root, sass },
  plugins: [ copyLookAndFeelAssets ],
};
