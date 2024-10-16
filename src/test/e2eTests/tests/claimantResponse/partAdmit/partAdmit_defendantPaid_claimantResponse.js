const config = require('../../../../config');
const ClaimantResponseSteps = require('../../../claimantResponse/steps/claimantResponseSteps.js');
Feature('Part admit defendant paid - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant settle the claim', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777777;
    ClaimantResponseSteps.viewDefendantResponse(caseId);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPaid(caseId, 'Yes');
    ClaimantResponseSteps.settleTheClaim(caseId, 'Yes');
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitSettleClaimConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant accepts payment but does not settle', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777778;
    ClaimantResponseSteps.viewDefendantResponse(caseId);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPaid(caseId, 'Yes');
    ClaimantResponseSteps.settleTheClaim(caseId, 'No');
    ClaimantResponseSteps.freeTelephoneMediation(caseId);
    ClaimantResponseSteps.fillDQ(caseId, false);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantDoesNotSettleConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant rejects amount paid and agrees to mediation', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777779;
    ClaimantResponseSteps.viewDefendantResponse(caseId);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPaid(caseId, 'No');
    ClaimantResponseSteps.freeTelephoneMediation(caseId);
    ClaimantResponseSteps.fillDQ(caseId, false);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantRejectsAndAgreesToMediationConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
