const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {isDashboardServiceToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {payClaimFee, hwfSubmission} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData, legacyCaseReference, caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount = 1600,
  claimFee = 115, claimantPartyType = 'Org';

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Org vs Sole trader').tag('@create-claim @nightly-regression-r2');

Scenario('Create Claim -  Org vs Sole trader - Fast track - no interest - no hwf - GA (Ask for more time)', async ({
  I,
  api,
}) => {
  selectedHWF = false;
  claimInterestFlag = false;
  StandardInterest = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addOrgClaimant();
  await steps.addSoleTraderDefendant();
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = payClaimFee(defaultClaimFee);
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
    await I.click(notification.nextSteps);
  } else {
    await steps.clickPayClaimFee();
  }
  await steps.verifyAndPayClaimFee(defaultClaimAmount, 455);
  await api.waitForFinishedBusinessProcess();

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

Scenario('Create Claim -  Org vs Sole trader - Fast track - with standard interest - no hwf', async ({I, api}) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = true;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addOrgClaimant();
  await steps.addSoleTraderDefendant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = payClaimFee(claimFee);
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
    await I.click(notification.nextSteps);
  } else {
    await steps.clickPayClaimFee();
  }
  await steps.verifyAndPayClaimFee(claimAmount, claimFee);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Create Claim -  Org vs Sole trader - Fast track - with variable interest - no hwf', async ({I, api}) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = false;
  const standardInterestAmount = 10;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addOrgClaimant();
  await steps.addSoleTraderDefendant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = payClaimFee(claimFee);
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
    await I.click(notification.nextSteps);
  } else {
    await steps.clickPayClaimFee();
  }
  await steps.verifyAndPayClaimFee(claimAmount, claimFee, standardInterestAmount);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Create Claim -  Org vs Sole trader - Fast track - with variable interest - with hwf', async ({api}) => {
  selectedHWF = true;
  claimInterestFlag = true;
  StandardInterest = false;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addOrgClaimant();
  await steps.addSoleTraderDefendant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  if (isDashboardServiceEnabled) {
    const notification = hwfSubmission();
    await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
  }
});
