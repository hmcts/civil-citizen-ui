const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  respondToClaim,
  defendantResponseFullAdmitPayImmediately,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseData, claimNumber, claimRef, claimAmount = 1500, claimFee = 80, deadline = '6 March 2024';
let claimTotalAmount = claimAmount + claimFee;

Feature('Create Lip v Lip claim -  Full Admit and pay Immediately').tag('@nightly-prod');

Scenario('Create LipvLip claim and defendant response as FullAdmit and pay immediately', async ({I, api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  const respondToClaimNotif = respondToClaim();
  await verifyNotificationTitleAndContent(claimNumber, respondToClaimNotif.title, respondToClaimNotif.content);
  await I.click(respondToClaimNotif.nextSteps);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayImmediateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  const defendantFullAdmitPayImmediatelyNotif = defendantResponseFullAdmitPayImmediately(claimTotalAmount, deadline);
  await verifyNotificationTitleAndContent(claimNumber, defendantFullAdmitPayImmediatelyNotif.title, defendantFullAdmitPayImmediatelyNotif.content);
  await I.click(defendantFullAdmitPayImmediatelyNotif.nextSteps);
  await I.click('Sign out');
}).tag('@api-prod');
