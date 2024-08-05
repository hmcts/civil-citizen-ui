const config = require('../../../config');
const ClaimantResponseSteps = require('../../claimantResponse/steps/claimantResponseSteps.js');
Feature('Part admit defendant paid - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant settle the claim', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777777;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPaid(caseId, 'Yes');
    await ClaimantResponseSteps.settleTheClaim(caseId, 'Yes');
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitSettleClaimConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant accepts payment but does not settle', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777778;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPaid(caseId, 'Yes');
    await ClaimantResponseSteps.settleTheClaim(caseId, 'No');
    await ClaimantResponseSteps.freeTelephoneMediation(caseId);
    await ClaimantResponseSteps.fillDQ(caseId, false);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantDoesNotSettleConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant rejects amount paid and agrees to mediation', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777779;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPaid(caseId, 'No');
    await ClaimantResponseSteps.freeTelephoneMediation(caseId);
    await ClaimantResponseSteps.fillDQ(caseId, false);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantRejectsAndAgreesToMediationConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});
