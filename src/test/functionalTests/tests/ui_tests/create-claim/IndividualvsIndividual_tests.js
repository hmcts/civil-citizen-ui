const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  waitForDefendantToRespond,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData,legacyCaseReference,caseRef,claimNumber;
const defaultClaimFee = 455;
const defaultClaimAmount = 9000;

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Individual vs Individual').tag('@ui-create-claim @civil-citizen-nightly');

Scenario('Create Claim -  Individual vs Individual - small claims - no interest - no hwf - GA (Ask for more time)', async ({
  I,
  api,
}) => {
  selectedHWF = false;
  claimInterestFlag = false;
  StandardInterest = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  claimNumber = await caseData.legacyCaseReference;
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
  await api.assignToLipDefendant(caseRef);
  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v mr defendant person');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v mr defendant person');
}).tag('@civil-citizen-master @civil-citizen-pr @smoke');

// Removed redundant scenarios - now covered by integration tests:
// - "with standard interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - no hwf" - covered by claimIssueDashboard.integration.test.ts  
// - "with variable interest - with hwf" - covered by claimIssueDashboard.integration.test.ts
// See: src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts