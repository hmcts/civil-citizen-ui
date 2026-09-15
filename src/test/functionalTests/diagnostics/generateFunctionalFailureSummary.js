#!/usr/bin/env node

const { writeSummary } = require('./functionalFailureDiagnostics');

const reportDir = process.env.FUNCTIONAL_DIAGNOSTICS_REPORT_DIR || 'test-results/functional';
const reportPrefix = process.env.FUNCTIONAL_DIAGNOSTICS_REPORT_PREFIX || process.env.MOCHAWESOME_REPORTFILENAME || null;
const outputFile = process.env.FUNCTIONAL_DIAGNOSTICS_OUTPUT_FILE || `${reportDir}/functional-failure-summary.json`;

try {
  const { summary } = writeSummary({ reportDir, reportPrefix, outputFile });
  console.log(`Functional failure summary written to ${outputFile} with ${summary.failures.length} failed test(s).`);
} catch (error) {
  console.error(`Failed to generate functional failure summary: ${error.message}`);
  process.exit(1);
}
