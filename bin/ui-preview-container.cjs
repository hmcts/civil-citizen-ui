// Explicit configuration, with no host credentials or .env inheritance.
const {isolatedEnvironment} = require('./ui-preview.cjs');
const config = isolatedEnvironment('http://wiremock:8080', '/tmp');
Object.assign(process.env, config, {
  UI_PREVIEW_CONTAINER: 'true', PORT: '3001',
  NODE_OPTIONS: '--require=/app/bin/ui-preview-network.cjs',
});
require('ts-node/register/transpile-only');
require('tsconfig-paths/register');
require('../src/main/server.ts');
