const steps  =  require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { isDashboardServiceToggleEnabled } = require('../../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { payClaimFee, hwfSubmission } = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData, legacyCaseReference, caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount=1600, claimFee=115, claimantPartyType = 'Company';

Feature('Create Lip v Lip claim - Company vs Org - @claimCreation').tag('@egression-r2');

Scenario('Create Claim -  Company vs Org - Fast track - no interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = false;
    StandardInterest = false;
    const defaultClaimFee = 455;
    const defaultClaimAmount = 9000;
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
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
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with standard interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
  }
});

Scenario('Create Claim -  Company vs Org - Fast track - with variable interest - with hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
  }
});