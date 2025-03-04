const config = require('../../../../config');
const ClaimantResponseSteps = require('../../../claimantResponse/steps/claimantResponseSteps.js');
const DefendantResponseSteps = require('../../../defendantResponse/defendantResponseSteps');
Feature('Part admit defendant pay by installments - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects claimant rejects and proposes alternate repayment plan', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777751;
    ClaimantResponseSteps.viewDefendantResponse(caseId);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId);
    ClaimantResponseSteps.proposeAlternativePaymentPlan(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantProposesRepaymentPlanConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects claimant accepts part admit and payment plan and formalises with CCJ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777752;
    ClaimantResponseSteps.viewDefendantResponse(caseId);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Request a CCJ');
    ClaimantResponseSteps.requestCCJ(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantRequestsCCJConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

// TODO undo this once the stop from choosing settlement agreement is removed
// Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects claimant accepts part admit and payment plan and formalises with SSA', async () => {
//   if (['preview', 'demo'].includes(config.runningEnv)) {
//     const caseId = 1777777777777753;
//     ClaimantResponseSteps.viewDefendantResponse(caseId);
//     ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
//     ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
//     ClaimantResponseSteps.formaliseRepayment(caseId, 'Sign a settlement agreement');
//     ClaimantResponseSteps.signSettlementAgreement(caseId);
//     ClaimantResponseSteps.checkAndSubmit(caseId);
//     ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
//     await ClaimantResponseSteps.resetWiremockScenario();
//   }
// });

Scenario('Response with PartAdmit-Defendant pay by installments - Defendant signs SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777754;
    DefendantResponseSteps.signSettlementAgreement(caseId);
    DefendantResponseSteps.partAdmitPayByInstallmentsDefendantSignsSettlementAgreementConfirmation();
    await DefendantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects part admit', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777755;
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
