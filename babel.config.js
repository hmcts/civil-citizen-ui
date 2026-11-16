/** Babel config for babel-jest: transform ESM-only jsdom deps so Jest can load them. */

// Rewrites `import.meta` (unsupported in CommonJS) to an equivalent object built from `__filename`.
const transformImportMeta = ({ template }) => ({
  visitor: {
    MetaProperty(path) {
      const { meta, property } = path.node;
      if (meta.name !== 'import' || property.name !== 'meta') {
        return;
      }
      path.replaceWith(template.expression.ast`({
        url: require('url').pathToFileURL(__filename).href,
        filename: __filename,
        dirname: __dirname,
        resolve: (specifier) => require('url').pathToFileURL(require.resolve(specifier)).href,
      })`);
    },
  },
});

module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
  plugins: [transformImportMeta],
};
