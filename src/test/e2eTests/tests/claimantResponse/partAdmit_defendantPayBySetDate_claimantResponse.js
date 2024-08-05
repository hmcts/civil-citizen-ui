const config = require('../../../config');
const ClaimantResponseSteps = require('../../claimantResponse/steps/claimantResponseSteps.js');
const DefendantResponseSteps = require('../../defendantResponse/defendantResponseSteps');
Feature('Part admit defendant pay by set date - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects claimant rejects and proposes alternate repayment plan', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777761;
    await ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    await ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId);
    await ClaimantResponseSteps.proposeAlternativePaymentPlan(caseId);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects claimant accepts part admit and payment plan and formalises with CCJ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777762;
    await ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    await ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    await ClaimantResponseSteps.formaliseRepayment(caseId, 'Request a CCJ');
    await ClaimantResponseSteps.requestCCJ(caseId);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantRequestsCCJConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects claimant accepts part admit and payment plan and formalises with SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777763;
    await ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    await ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    await ClaimantResponseSteps.formaliseRepayment(caseId, 'Sign a settlement agreement');
    await ClaimantResponseSteps.signSettlementAgreement(caseId);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Defendant signs SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777764;
      await DefendantResponseSteps.signSettlementAgreement(caseId);
      await DefendantResponseSteps.partAdmitPayBySetDateDefendantSignsSettlementAgreementConfirmation();
      await DefendantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by set date - Claimant rejects part admit', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777765;
    await ClaimantResponseSteps.viewDefendantResponse(caseId, true);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'No');
    await ClaimantResponseSteps.fillDQ(caseId, true);
    await ClaimantResponseSteps.checkAndSubmitSigned(caseId);
    await ClaimantResponseSteps.partAdmitClaimantDoesNotSettleConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
