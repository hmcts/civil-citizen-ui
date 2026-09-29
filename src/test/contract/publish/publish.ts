import pact from '@pact-foundation/pact-node';
import * as git from 'git-rev-sync';
import { dirname } from 'path';

const { canonicalize, validate } = require('../artifacts');

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'http://localhost:80';
const PACT_CONSUMER_VERSION = process.env.PACT_CONSUMER_VERSION || git.long();
const PACT_BRANCH_NAME = process.env.PACT_BRANCH_NAME || process.env.CHANGE_BRANCH || process.env.BRANCH_NAME || git.branch();

const opts = {
  pactBroker: PACT_BROKER_URL,
  consumerVersion: PACT_CONSUMER_VERSION,
  tags: [PACT_BRANCH_NAME],
  branch: PACT_BRANCH_NAME,
};

Promise.resolve()
  .then(() => {
    if (!PACT_BRANCH_NAME.trim() || PACT_BRANCH_NAME === 'HEAD') {
      throw new Error('Set PACT_BRANCH_NAME to the consumer source branch');
    }
    const pactFiles = validate();
    canonicalize(dirname(pactFiles[0]));
    return pact.publishPacts({ ...opts, pactFilesOrDirs: validate() });
  })
  .then(() => {
    console.log('Pact contract publishing complete!');
  })
  .catch(e => {
    console.error('Pact contract publishing failed: ', e);
    process.exitCode = 1;
  });
