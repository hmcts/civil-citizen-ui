const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: path.join(__dirname, '../node_modules/govuk-frontend/dist/govuk/assets/images'), to: 'assets/images' },
    { from: path.join(__dirname, '../node_modules/govuk-frontend/dist/govuk/assets/fonts'), to: 'assets/fonts' },
    { from: path.join(__dirname, '../node_modules/govuk-frontend/dist/govuk/assets/manifest.json'), to: 'assets' },
  ],
});

module.exports = {
  plugins: [copyGovukTemplateAssets],
};
