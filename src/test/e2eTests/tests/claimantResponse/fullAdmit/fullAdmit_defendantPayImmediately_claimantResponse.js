const config = require('../../../../config');
const ClaimantResponseSteps = require('../../../claimantResponse/steps/claimantResponseSteps.js');
Feature('Full admit defendant pay immediately - @claimantResponse').tag('@e2e');

// TODO undo when part payment journey is restored
Scenario.skip('Claimant accepts - judgement by admission - pay immediately', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777741;
    ClaimantResponseSteps.judgementByAdmission(caseId);
    ClaimantResponseSteps.fullAdmitJudgementByAdmissionPayImmediatelyConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
