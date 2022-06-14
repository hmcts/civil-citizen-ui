const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns: [
    { from: path.join(__dirname, '../node_modules/govuk-frontend/govuk/assets/images'), to: 'assets/images' },
    { from: path.join(__dirname, '../node_modules/govuk-frontend/govuk/assets/fonts'), to: 'assets/fonts' },
  ],
});

module.exports = {
  plugins: [copyGovukTemplateAssets],
};
