const config = require('../../../../config');
const ClaimantResponseSteps = require('../../../claimantResponse/steps/claimantResponseSteps.js');
const DefendantResponseSteps = require('../../../defendantResponse/defendantResponseSteps');
Feature('Full admit defendant pay by set date - @claimantResponse').tag('@e2e');

Scenario('claimant accepts full admit and formalises with CCJ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777721;
    ClaimantResponseSteps.viewDefendantResponseFullAdmit(caseId, 'bySetDate');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Request a CCJ');
    ClaimantResponseSteps.requestCCJ(caseId, true);
    ClaimantResponseSteps.verifyCheckYourAnswersForFullAdmitCCJ(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.fullAdmitClaimantRequestsCCJConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('claimant accepts part admit and formalises with SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777722;
    ClaimantResponseSteps.viewDefendantResponseFullAdmit(caseId, 'bySetDate');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Sign a settlement agreement');
    ClaimantResponseSteps.signSettlementAgreement(caseId, 'bySetDate');
    ClaimantResponseSteps.verifyCheckYourAnswersForFullAdmitSettlementAgreement(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    ClaimantResponseSteps.fullAdmitClaimantSignsSettlementAgreementConfirmationExtra(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Defendant signs SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777723;
    DefendantResponseSteps.signSettlementAgreement(caseId);
    DefendantResponseSteps.partAdmitPayBySetDateDefendantSignsSettlementAgreementConfirmation();
    await DefendantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Claimant rejects full admit', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777724;
    ClaimantResponseSteps.viewDefendantResponseFullAdmit(caseId, 'bySetDate');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId);
    ClaimantResponseSteps.proposeAlternativePaymentPlanInstallments(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.fullAdmitClaimantRejectsRepaymentPlan();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
