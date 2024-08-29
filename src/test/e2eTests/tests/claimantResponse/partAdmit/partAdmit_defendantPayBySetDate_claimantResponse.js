const config = require('../../../../config');
const ClaimantResponseSteps = require('../../../claimantResponse/steps/claimantResponseSteps.js');
const DefendantResponseSteps = require('../../../defendantResponse/defendantResponseSteps');
Feature('Part admit defendant pay by set date - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects claimant rejects and proposes alternate repayment plan', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777761;
    ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId);
    ClaimantResponseSteps.proposeAlternativePaymentPlan(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects claimant accepts part admit and payment plan and formalises with CCJ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777762;
    ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Request a CCJ');
    ClaimantResponseSteps.requestCCJ(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantRequestsCCJConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects claimant accepts part admit and payment plan and formalises with SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777763;
    ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    ClaimantResponseSteps.formaliseRepayment(caseId, 'Sign a settlement agreement');
    ClaimantResponseSteps.signSettlementAgreement(caseId);
    ClaimantResponseSteps.checkAndSubmit(caseId);
    ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Defendant signs SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777764;
    DefendantResponseSteps.signSettlementAgreement(caseId);
    DefendantResponseSteps.partAdmitPayBySetDateDefendantSignsSettlementAgreementConfirmation();
    await DefendantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects part admit', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777765;
    ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'No');
    ClaimantResponseSteps.fillDQ(caseId, true);
    ClaimantResponseSteps.checkAndSubmitSigned(caseId);
    ClaimantResponseSteps.partAdmitClaimantDoesNotSettleConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
