const config = require('../../../config');
const ClaimantResponseSteps = require('../../claimantResponse/steps/claimantResponseSteps.js');
Feature('Part admit defendant pay immediately - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-Defendant pay immediately - Claimant rejects and agrees to mediation', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777788;
    ClaimantResponseSteps.viewDefendantResponse(caseId);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'No');
    ClaimantResponseSteps.freeTelephoneMediation(caseId);
    ClaimantResponseSteps.fillDQ(caseId, false);
    ClaimantResponseSteps.checkAndSubmitSigned(caseId);
    ClaimantResponseSteps.partAdmitClaimantRejectsAndAgreesToMediationConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
