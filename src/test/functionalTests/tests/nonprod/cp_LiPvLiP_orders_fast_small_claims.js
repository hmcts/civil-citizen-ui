const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { orderMade } = require('../../specClaimHelpers/dashboardNotificationConstants');
const { ordersAndNotices } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, taskListItem, notification;

Feature('Case progression journey - Lip v Lip - Verify Dashboard For an Order being Created - Small Claims');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
    await api.performAnAssistedOrder(config.judgeUserWithRegionId1, claimRef);
    await api.waitForFinishedBusinessProcess();
  }
});

Scenario('Case progression journey - Small Claims - Claimant and Defendant verify Dashboard an Order being Created', async ({I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    if (isDashboardServiceEnabled) {
      //Claimant verifies dashboard
      await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
      notification = orderMade();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
      taskListItem = ordersAndNotices();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
      await I.click(notification.nextSteps);
      await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
      await I.click(claimNumber);
      await I.dontSee(notification.title);
      //Defendant verifies dashboard
      await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
      notification = orderMade();
      await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
      taskListItem = ordersAndNotices();
      await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
      await I.click(notification.nextSteps);
      await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
      await I.click(claimNumber);
      await I.dontSee(notification.title);
    }
  }
}).tag('@nightly-regression-cp');

