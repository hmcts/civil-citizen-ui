const config = require('../../config');
const LoginSteps = require('../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount, deleteAccount} = require('../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent} = require('../specClaimHelpers/e2e/dashboardHelper');
const {respondToClaim, defendantResponseFullAdmitPayImmediately} = require('../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
const claimAmount = 1500;
const claimFee = 80;
const deadline = '6 March 2024';
const claimTotalAmount = claimAmount + claimFee;

Feature('Smoke Test - Full admit');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Defendant full-admit pay-immediately journey', async ({I, api}) => {
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);

  const respondToClaimNotif = respondToClaim();
  await verifyNotificationTitleAndContent(claimNumber, respondToClaimNotif.title, respondToClaimNotif.content);
  await I.click(respondToClaimNotif.nextSteps);

  await api.performCitizenResponse(
    config.defendantCitizenUser,
    claimRef,
    claimType,
    config.defenceType.admitAllPayImmediateWithIndividual,
  );
  await api.waitForFinishedBusinessProcess();

  const fullAdmitNotif = defendantResponseFullAdmitPayImmediately(claimTotalAmount, deadline);
  await verifyNotificationTitleAndContent(claimNumber, fullAdmitNotif.title, fullAdmitNotif.content);
  await I.click(fullAdmitNotif.nextSteps);
  await I.click('Sign out');
}).tag('@smoketest');

AfterSuite(async () => {
  await deleteAccount(config.claimantCitizenUser.email);
  await deleteAccount(config.defendantCitizenUser.email);
});
