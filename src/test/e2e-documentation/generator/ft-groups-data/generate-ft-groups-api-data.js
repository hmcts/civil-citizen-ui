#!/usr/bin/env node

const path = require('path');
const { generateFunctionalGroupDocs } = require('./ft-group-data-gen');

const outputPath = path.join('src/test/e2e-documentation/results/ft-groups-data', 'ft-groups-api-data.json');

const count = generateFunctionalGroupDocs({
  suiteType: 'api',
  targetDir: 'src/test/functionalTests/tests/api_tests',
  outputFile: outputPath,
});

console.log(`Wrote ${count} API functional test groups to ${outputPath}`);
