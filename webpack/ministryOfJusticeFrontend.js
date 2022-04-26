const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const packageJson = require.resolve('@ministryofjustice/frontend/package.json');
const root = path.resolve(packageJson, '..', 'moj');
const sass = path.resolve(root, 'all.scss');
const javascript = path.resolve(root, 'all.js');
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const images = path.resolve(assets, 'images');

const copyMojTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: images, to: 'assets/images' },
  ],
});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyMojTemplateAssets],
};
