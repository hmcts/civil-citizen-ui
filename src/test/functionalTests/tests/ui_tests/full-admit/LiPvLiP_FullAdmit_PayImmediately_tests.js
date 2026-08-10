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

Feature('Create Lip v Lip claim -  Full Admit and pay Immediately').tag('@civil-citizen-master @civil-citizen-pr @civil-citizen-nightly @ui-full-admit');

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
  await I.usePlaywrightTo('QA controlled CUI HTTP 500', async ({ page }) => {
    const currentUrl = page.url();

    await page.route(currentUrl, async route => {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'QA controlled CUI HTTP 500 - Internal Server Error',
      });
    });

    const response = await page.reload({ waitUntil: 'domcontentloaded' });

    if (!response || response.status() !== 500) {
      throw new Error('QA setup failed - expected controlled CUI HTTP 500');
    }

    throw new Error('CUI HTTP 500 - Internal Server Error');
  });
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayImmediateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  const defendantFullAdmitPayImmediatelyNotif = defendantResponseFullAdmitPayImmediately(claimTotalAmount, deadline);
  await verifyNotificationTitleAndContent(claimNumber, defendantFullAdmitPayImmediatelyNotif.title, defendantFullAdmitPayImmediatelyNotif.content);
  await I.click(defendantFullAdmitPayImmediatelyNotif.nextSteps);
  await I.click('Sign out');
});
