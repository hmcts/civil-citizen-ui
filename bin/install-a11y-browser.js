#!/usr/bin/env node
const {execFileSync} = require('node:child_process');
const {dirname, resolve} = require('node:path');

// Pa11y owns the Puppeteer dependency. Yarn does not expose transitive bins as
// project commands, and a separately installed Puppeteer could pin another Chrome.
const manifestPath = require.resolve('puppeteer/package.json', {paths: [require.resolve('pa11y')]});
const manifest = require(manifestPath);
execFileSync(process.execPath, [resolve(dirname(manifestPath), manifest.bin), 'browsers', 'install', 'chrome'], {
  stdio: 'inherit',
});
