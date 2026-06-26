const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { discontinuanceNoticeDefendant } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');
const { expect } = chai;

Feature('LRvLip - Claim discontinuance tests').tag('@civil-citizen-nightly, @ui-discontinue-claim');

Scenario('LR vs LiP - Claimant LR discontinues claim', async ({ api, I }) => {  
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = await caseData.legacyCaseReference;

  await api.discontinueClaim(config.applicantSolicitorUser, 'ONE_V_ONE_NO_P_NEEDED');
  await api.waitForFinishedBusinessProcess();
  
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const discontinuanceNotice = discontinuanceNoticeDefendant();
  await verifyNotificationTitleAndContent(claimNumber, discontinuanceNotice.title, discontinuanceNotice.content);
  const nextStepsUrl = await I.grabAttributeFrom(`//a[normalize-space()='${discontinuanceNotice.nextSteps}']`, 'href');
  expect(nextStepsUrl).to.include(`/case/${claimRef}/view-documents`);
  await I.click(discontinuanceNotice.nextSteps);
  await I.switchToNextTab();
});