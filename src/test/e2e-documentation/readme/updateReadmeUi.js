#!/usr/bin/env node

const path = require('path');
const { updateReadmeSection } = require('./support/updateReadmeSection');

const repoRoot = path.resolve(__dirname, '..', '..', '..', '..');
const defaultJsonPath = path.join(repoRoot, 'src/test/e2e-documentation/results/codeceptjs-ui-tests.json');
const markers = {
  start: '<!-- UI_TESTS_TABLE_START -->',
  end: '<!-- UI_TESTS_TABLE_END -->'
};

const jsonArg = process.argv[2];

updateReadmeSection({
  jsonPath: jsonArg,
  defaultJsonPath,
  startMarker: markers.start,
  endMarker: markers.end
});

console.log('README.md updated with latest UI test table');
