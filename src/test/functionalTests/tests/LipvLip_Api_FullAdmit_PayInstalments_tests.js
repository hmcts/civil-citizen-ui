const config = require('../../config');
const LoginSteps = require('./../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ResponseSteps = require('../citizenFeatures/response/steps/lipDefendantResponseSteps');
const { isDashboardServiceToggleEnabled } = require('../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../specClaimHelpers/e2e/dashboardHelper');
const { respondToClaim, defendantResponseFullAdmitPayInstalments } = require('../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseData, claimNumber, claimRef, claimAmount = 1500, instalmentAmount = 100, date= "1 October 2025";

Feature('Create Lip v Lip claim -  Full Admit Pay by Instalments By Defendant');

Scenario('Create LipvLip claim and defendant response as FullAdmit pay by instalments - @api', async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
    if (isDashboardServiceEnabled) {
      const notification = respondToClaim();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayByInstallmentWithIndividual);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceEnabled) {
      const notification = defendantResponseFullAdmitPayInstalments(claimAmount, instalmentAmount, date);
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
    await ResponseSteps.SignOut();
  }
}).tag('@regression-r2');
