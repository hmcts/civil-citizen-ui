#!/usr/bin/env node

const path = require('path');
const { generateDocs } = require('./support/codeceptjs-doc-gen');

const outputPath = path.join('src/test/e2e-documentation/results', 'codeceptjs-ui-tests.json');

const count = generateDocs({
  suiteType: 'ui',
  targetDir: 'src/test/functionalTests/tests/ui_tests',
  outputFile: outputPath
});

console.log(`Wrote ${count} UI scenarios to ${outputPath}`);
