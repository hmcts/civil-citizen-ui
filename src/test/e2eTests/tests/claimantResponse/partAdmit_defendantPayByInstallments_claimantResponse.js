const config = require('../../../config');
const ClaimantResponseSteps = require('../../claimantResponse/steps/claimantResponseSteps.js');
const DefendantResponseSteps = require('../../defendantResponse/defendantResponseSteps');
Feature('Part admit defendant pay by installments - @claimantResponse').tag('@e2e');

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects claimant rejects and proposes alternate repayment plan', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777751;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    await ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId);
    await ClaimantResponseSteps.proposeAlternativePaymentPlan(caseId);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantProposesRepaymentPlanConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects claimant accepts part admit and payment plan and formalises with CCJ', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777752;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    await ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    await ClaimantResponseSteps.formaliseRepayment(caseId, 'Request a CCJ');
    await ClaimantResponseSteps.requestCCJ(caseId);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantRequestsCCJConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects claimant accepts part admit and payment plan and formalises with SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777753;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'Yes');
    await ClaimantResponseSteps.acceptOrRejectRepaymentPlan(caseId, 'Yes');
    await ClaimantResponseSteps.formaliseRepayment(caseId, 'Sign a settlement agreement');
    await ClaimantResponseSteps.signSettlementAgreement(caseId);
    await ClaimantResponseSteps.checkAndSubmit(caseId);
    await ClaimantResponseSteps.partAdmitClaimantSignsSettlementAgreementConfirmation(caseId);
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by installments - Defendant signs SSA', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777754;
      await DefendantResponseSteps.signSettlementAgreement(caseId);
      await DefendantResponseSteps.partAdmitPayByInstallmentsDefendantSignsSettlementAgreementConfirmation();
      await DefendantResponseSteps.resetWiremockScenario();
  }
});

Scenario('Response with PartAdmit-Defendant pay by installments - Claimant rejects part admit', async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const caseId = 1777777777777755;
    await ClaimantResponseSteps.viewDefendantResponse(caseId);
    await ClaimantResponseSteps.acceptOrRejectPartAdmitPayImmediately(caseId, 'No');
    await ClaimantResponseSteps.freeTelephoneMediation(caseId);
    await ClaimantResponseSteps.fillDQ(caseId, false);
    await ClaimantResponseSteps.checkAndSubmitSigned(caseId);
    await ClaimantResponseSteps.partAdmitClaimantRejectsAndAgreesToMediationConfirmation();
    await ClaimantResponseSteps.resetWiremockScenario();
  }
});

AfterSuite(async () => {
  await ClaimantResponseSteps.resetWiremockScenario();
});
