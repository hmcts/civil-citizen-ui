#!/usr/bin/env node

const path = require('path');
const { generateDocs } = require('./e2e-data-gen');

const outputPath = path.join('src/test/e2e-documentation/results/e2e-data', 'e2e-api-data.json');

const count = generateDocs({
  suiteType: 'api',
  targetDir: 'src/test/functionalTests/tests/api_tests',
  outputFile: outputPath,
});

console.log(`Wrote ${count} API scenarios to ${outputPath}`);
