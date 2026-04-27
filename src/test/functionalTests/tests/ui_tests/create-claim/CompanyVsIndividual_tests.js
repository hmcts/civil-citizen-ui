const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  hwfSubmission,
  waitForDefendantToRespond,
  hwfNoRemission,
  updateHWFNum,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

let caseData,legacyCaseReference,caseRef,claimInterestFlag,StandardInterest,selectedHWF,claimAmount = 1600,
  claimFee = 115,claimantPartyType = 'Company';

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Company vs Individual').tag('@ui-create-claim');

Scenario('Create Claim -  Company vs Individual - small claims - no interest - no hwf - GA (Ask for more time)', async ({
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
  await steps.addCompanyClaimant();
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  const claimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, claimFeeNotif.title, claimFeeNotif.content);
  await I.click(claimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
  const waitForDefResponseNotif = await waitForDefendantToRespond();
  await verifyNotificationTitleAndContent(legacyCaseReference, waitForDefResponseNotif.title, waitForDefResponseNotif.content);
  await api.assignToLipDefendant(caseRef);
  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Claimant Org name v mr defendant person', undefined, 'company');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Claimant Org name v mr defendant person');
});

// Removed redundant scenarios - now covered by integration tests:
// - "with standard interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - with hwf" - covered by claimIssueDashboard.integration.test.ts
// See: src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts