const config = require('../../../config');
const CaseProgressionSteps = require('../../caseProgression/caseProgressionSteps');

const HelpWithFees = require('../../caseProgression/helpWithFees');
const TrialArrangements = require('../../caseProgression/trialArragement');

Feature('Case Progression journey').tag('@e2e');

Scenario('upload documents', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.start('0000000000000001');
    CaseProgressionSteps.typeOfDocument();
    CaseProgressionSteps.uploadDocuments();
    CaseProgressionSteps.checkAndSend();
  }
});

Scenario('help with fees', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    HelpWithFees.applyHelpWithFees('0000000000000002');
    HelpWithFees.start();
    HelpWithFees.referenceNumber();
  }
});

Scenario('trial Arrangement', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    TrialArrangements.start('0000000000000003');
    TrialArrangements.isCaseReady();
    TrialArrangements.hasAnythingChanged();
    TrialArrangements.hearingDurationOtherInfo();
    TrialArrangements.checkYourAnswers();
  }
});
