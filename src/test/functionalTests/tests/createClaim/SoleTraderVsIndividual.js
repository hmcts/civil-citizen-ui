const steps  =  require('../../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../config');

const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../features/home/steps/login');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { payClaimFee, hwfSubmission } = require('../../specClaimHelpers/dashboardNotificationConstants');

let caseData, legacyCaseReference, caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount=1600, claimFee=115;

Feature('Create Lip v Lip claim - SoleTrader vs Individual @claimCreation').tag('@regression-r2');

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - no interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = false;
    StandardInterest = false;
    const defaultClaimFee = 455;
    const defaultClaimAmount = 9000;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addSoleTraderClaimant();
    caseRef = await steps.checkAndSubmit(selectedHWF);
    caseData = await api.retrieveCaseData(config.adminUser, caseRef);
    legacyCaseReference = await caseData.legacyCaseReference;
    await caseData.respondent1ResponseDeadline;
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceToggleEnabled) {
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

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - with standard interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = true;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addSoleTraderClaimant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    caseRef = await steps.checkAndSubmit(selectedHWF);
    caseData = await api.retrieveCaseData(config.adminUser, caseRef);
    legacyCaseReference = await caseData.legacyCaseReference;
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceToggleEnabled) {
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

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - with variable interest - no hwf', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addSoleTraderClaimant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    caseRef = await steps.checkAndSubmit(selectedHWF);
    caseData = await api.retrieveCaseData(config.adminUser, caseRef);
    legacyCaseReference = await caseData.legacyCaseReference;
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceToggleEnabled) {
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

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - with variable interest - with hwf', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = true;
    claimInterestFlag = true;
    StandardInterest = false;
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    await steps.addSoleTraderClaimant();
    await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
    caseRef = await steps.checkAndSubmit(selectedHWF);
    caseData = await api.retrieveCaseData(config.adminUser, caseRef);
    legacyCaseReference = await caseData.legacyCaseReference;
    await api.setCaseId(caseRef);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceToggleEnabled) {
      const notification = hwfSubmission();
      await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
    }
  }
});