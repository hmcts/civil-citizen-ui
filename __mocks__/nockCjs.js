// nock is ESM (transpiled by babel-jest); expose the callable nock function as a CommonJS export.
const path = require('path');
const nockModule = require(path.join(__dirname, '..', 'node_modules', 'nock', 'dist', 'index.js'));
const nock = nockModule.default || nockModule;

module.exports = Object.assign(nock, nockModule, {default: nock});
