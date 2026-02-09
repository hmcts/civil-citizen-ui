#!/usr/bin/env node

const path = require('path');
const { generateDocs } = require('./e2e-data-gen');

const outputPath = path.join('src/test/e2e-documentation/results/e2e-data', 'e2e-ui-data.json');

const count = generateDocs({
  suiteType: 'ui',
  targetDir: 'src/test/functionalTests/tests/ui_tests',
  outputFile: outputPath,
});

console.log(`Wrote ${count} UI scenarios to ${outputPath}`);
