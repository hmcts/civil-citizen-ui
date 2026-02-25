/**
 * Babel config used by babel-jest to transform ESM-only node_modules
 * (e.g. @exodus/bytes, html-encoding-sniffer) pulled in by jsdom.
 */
module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
};
