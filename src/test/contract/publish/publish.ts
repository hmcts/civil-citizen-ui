import pact from '@pact-foundation/pact-node';
import * as git from 'git-rev-sync';

import { PACT_DIRECTORY_PATH } from '../utils';

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'http://localhost:80';
const PACT_CONSUMER_VERSION = process.env.PACT_CONSUMER_VERSION || git.short();
const PACT_BRANCH_NAME = process.env.PACT_BRANCH_NAME || 'Dev';

const opts = {
  pactFilesOrDirs: [PACT_DIRECTORY_PATH],
  pactBroker: PACT_BROKER_URL,
  consumerVersion: PACT_CONSUMER_VERSION,
  tags: [PACT_BRANCH_NAME],
};

pact.publishPacts(opts)
  .then(() => {
    console.log('Pact contract publishing complete!');
  })
  .catch(e => {
    console.log('Pact contract publishing failed: ', e);
  });
