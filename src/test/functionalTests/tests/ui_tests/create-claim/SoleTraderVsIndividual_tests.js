const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData,legacyCaseReference,caseRef,selectedHWF;

Feature('Create Lip v Lip claim - SoleTrader vs Individual').tag('@ui-create-claim');

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - no interest - no hwf', async ({ I, api }) => {
  selectedHWF = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addSoleTraderClaimant();
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await caseData.respondent1ResponseDeadline;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
}).tag('@smoke');

// Removed redundant scenarios - now covered by integration tests:
// - "with standard interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - with hwf" - covered by claimIssueDashboard.integration.test.ts
// See: src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts