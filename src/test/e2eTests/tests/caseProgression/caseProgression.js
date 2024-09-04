const config = require('../../../config');
const CaseProgressionSteps = require('../../caseProgression/caseProgressionSteps');

const {toggleFlag} = require('../../commons/toggleFlag');

Feature('Case Progression journey').tag('@leo');

Scenario.only('upload documents claimant', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cui-case-progression', true);
    CaseProgressionSteps.start('0000000000000001');
    CaseProgressionSteps.typeOfDocument();
    CaseProgressionSteps.uploadDocuments();
    CaseProgressionSteps.checkAndSend();
    toggleFlag('cui-case-progression', false);
  }
});
