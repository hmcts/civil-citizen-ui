const config = require('../../../config');
const ClaimantResponseSteps = require('../../claimantResponse/steps/claimantResponseSteps.js');
Feature('Part admit defendant pay immediately - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-Defendant pay immediately - Claimant rejects and agrees to mediation', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777788;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'No');
    await ClaimantResponseSteps.freeTelephoneMediation(caseId);
    await ClaimantResponseSteps.fillDQ(caseId, false);
    await ClaimantResponseSteps.checkAndSubmitSigned(caseId);
    await ClaimantResponseSteps.partAdmitClaimantRejectsAndAgreesToMediationConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});
