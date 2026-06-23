const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { settleClaimMarkPaidInFullDefendant } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { formattedDate } = require('../../../specClaimHelpers/api/dataHelper');

Feature('LRvLip - Settle Claim mark paid in full tests').tag('@civil-citizen-nightly, @ui-settle-claim');

Scenario('LR vs LiP - Claimant LR confirms the claim to be marked as settled', async ({ api }) => {  
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = await caseData.legacyCaseReference;

  await api.settleClaim(config.applicantSolicitorUser, 'NO');
  await api.waitForFinishedBusinessProcess();
  
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const date = formattedDate();
  const settleClaimMarkPaidInFullNotification = settleClaimMarkPaidInFullDefendant(date);
  await verifyNotificationTitleAndContent(claimNumber, settleClaimMarkPaidInFullNotification.title, settleClaimMarkPaidInFullNotification.content);
});