/** Babel config for babel-jest: transform ESM-only jsdom deps so Jest can load them. */
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
