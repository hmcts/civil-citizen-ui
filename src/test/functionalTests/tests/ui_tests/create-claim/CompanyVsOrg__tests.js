const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { payClaimFee } = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData,legacyCaseReference,caseRef,selectedHWF,claimantPartyType = 'Company';
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Company vs Org').tag('@ui-create-claim');

Scenario('Create Claim -  Company vs Org - Fast track - no interest - no hwf - GA (Ask for more time)', async ({
  I,
  api,
}) => {
  selectedHWF = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.addOrgDefendant();
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
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
  await I.click(legacyCaseReference);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Claimant Org name v Defendant Org name', 'withoutnotice', 'company');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Claimant Org name v Defendant Org name', 'withoutnotice', 'company');
}).tag('@smoke');

// Removed redundant scenarios - now covered by integration tests:
// - "with standard interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - no hwf" - covered by claimIssueDashboard.integration.test.ts
// - "with variable interest - with hwf" - covered by claimIssueDashboard.integration.test.ts
// See: src/integration-test/routes/dashboard/claimIssueDashboard.integration.test.ts