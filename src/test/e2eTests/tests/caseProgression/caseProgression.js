const config = require('../../../config');
//const CaseProgressionSteps = require('../../caseProgression/caseProgressionSteps');

const {toggleFlag} = require('../../commons/toggleFlag');
const HelpWithFees = require('../../caseProgression/helpWithFees');
const TrialArrangements = require('../../caseProgression/trialArragement');

Feature('Case Progression journey').tag('@e2e');

/*Scenario('upload documents', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cui-case-progression', true);
    CaseProgressionSteps.start('0000000000000001');
    CaseProgressionSteps.typeOfDocument();
    CaseProgressionSteps.uploadDocuments();
    CaseProgressionSteps.checkAndSend();
    toggleFlag('cui-case-progression', false);
  }
});
*/
Scenario('help with fees', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cui-case-progression', true);
    HelpWithFees.applyHelpWithFees('0000000000000002');
    HelpWithFees.start();
    HelpWithFees.referenceNumber();
    toggleFlag('cui-case-progression', false);
  }
});

Scenario('trial Arrangement', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    toggleFlag('cui-case-progression', true);
    TrialArrangements.start('0000000000000003');
    TrialArrangements.isCaseReady();
    TrialArrangements.hasAnythingChanged();
    TrialArrangements.hearingDurationOtherInfo();
    TrialArrangements.checkYourAnswers();
    toggleFlag('cui-case-progression', false);
  }
});
