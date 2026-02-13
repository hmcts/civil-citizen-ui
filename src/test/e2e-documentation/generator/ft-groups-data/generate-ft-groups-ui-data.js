#!/usr/bin/env node

const path = require('path');
const { generateFunctionalGroupDocs } = require('./ft-group-data-gen');

const outputPath = path.join('src/test/e2e-documentation/results/ft-groups-data', 'ft-groups-ui-data.json');

const count = generateFunctionalGroupDocs({
  suiteType: 'ui',
  targetDir: 'src/test/functionalTests/tests/ui_tests',
  outputFile: outputPath,
});

console.log(`Wrote ${count} UI functional test groups to ${outputPath}`);
