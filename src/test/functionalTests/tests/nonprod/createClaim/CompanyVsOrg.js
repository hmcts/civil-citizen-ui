const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');
const testTimeHelper = require('../../../helpers/test_time_helper');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {isDashboardServiceToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {payClaimFee, hwfSubmission} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData, legacyCaseReference, caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount = 1600,
  claimFee = 115, claimantPartyType = 'Company';
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Company vs Org - @claimCreation ').tag('@regression-r2');

Scenario('Create Claim -  Company vs Org - Fast track - no interest - no hwf - GA (Ask for more time)', async ({
  I,
  api,
}) => {
  await testTimeHelper.addTestStartTime('Create Claim -  Company vs Org - Fast track - no interest - no hwf - GA (Ask for more time)');
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
  await steps.addCompanyClaimant();
  await steps.addOrgDefendant();
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
  await testTimeHelper.addTestEndTime('Create Claim -  Company vs Org - Fast track - no interest - no hwf - GA (Ask for more time)');
});

Scenario('Create Claim -  Company vs Org - Fast track - with standard interest - no hwf', async ({I, api}) => {
  await testTimeHelper.addTestStartTime('Create Claim -  Company vs Org - Fast track - with standard interest - no hwf');
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = true;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.addOrgDefendant();
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
  await testTimeHelper.addTestEndTime('Create Claim -  Company vs Org - Fast track - with standard interest - no hwf');
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - no hwf', async ({I, api}) => {
  await testTimeHelper.addTestStartTime('Create Claim -  Company vs Org - Fast track - with variable interest - no hwf');
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = false;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.addOrgDefendant();
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
  await testTimeHelper.addTestEndTime('Create Claim -  Company vs Org - Fast track - with variable interest - no hwf');
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - with hwf', async ({api}) => {
  await testTimeHelper.addTestStartTime('Create Claim -  Company vs Org - Fast track - with variable interest - with hwf');
  selectedHWF = true;
  claimInterestFlag = true;
  StandardInterest = false;
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.addOrgDefendant();
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
  await testTimeHelper.addTestEndTime('Create Claim -  Company vs Org - Fast track - with variable interest - with hwf');
});
