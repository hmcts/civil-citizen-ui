const config = require('../../../../config');
const ClaimantResponseSteps = require('../../../claimantResponse/steps/claimantResponseSteps.js');
const DefendantResponseSteps = require('../../../defendantResponse/defendantResponseSteps');
Feature('Full admit defendant pay by installments - @claimantResponse').tag('@e2e');

Scenario('claimant accepts full admit and payment plan and formalises with CCJ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777731;
    await ClaimantResponseSteps.viewDefendantResponseFullAdmit(caseId);
    ClaimantResponseSteps.acceptOrRejectFullAdmitInstalmentsRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Request a CCJ');
    ClaimantResponseSteps.requestCCJ(caseId, true);
    ClaimantResponseSteps.verifyCheckYourAnswersForFullAdmitCCJ(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.fullAdmitClaimantRequestsCCJConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});
// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('claimant accepts full admit and payment plan and formalises with SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777732;
    await ClaimantResponseSteps.viewDefendantResponseFullAdmit(caseId);
    ClaimantResponseSteps.acceptOrRejectFullAdmitInstalmentsRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Sign a settlement agreement');
    ClaimantResponseSteps.signSettlementAgreement(caseId, 'installments');
    ClaimantResponseSteps.verifyCheckYourAnswersForFullAdmitSettlementAgreement(caseId, 'installments');
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    ClaimantResponseSteps.fullAdmitClaimantSignsSettlementAgreementConfirmationExtra(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Defendant signs SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777733;
    DefendantResponseSteps.signSettlementAgreement(caseId);
    DefendantResponseSteps.partAdmitPayByInstallmentsDefendantSignsSettlementAgreementConfirmation();
    await DefendantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Claimant rejects full admit - proposes alternate repayment plan', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777734;
    await ClaimantResponseSteps.viewDefendantResponseFullAdmit(caseId);
    ClaimantResponseSteps.acceptOrRejectFullAdmitInstalmentsRepaymentPlan(caseId);
    ClaimantResponseSteps.proposeAlternativePaymentPlanInstallments(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.fullAdmitClaimantRejectsInstallmentsRepaymentPlan();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
