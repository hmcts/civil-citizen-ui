const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { orderMade } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { ordersAndNotices } = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, taskListItem, notification;

Feature('Case progression journey - Lip v Lip - Verify Dashboard For an Order being Created - Small Claims').tag('@case-progression');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'IN_MEDIATION');
  await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'smallClaimsTrack');
  await api.performAnAssistedOrder(config.judgeUserWithRegionId1, claimRef);
  await api.waitForFinishedBusinessProcess();
});

//Note: this test doesnt work at all, if we do it the original way, it creates the same notification as orderMadeLA which other test already check so its redundant, if we try GENERATE ORDER NOTIFICATION CAMUNDA process, it fails due to final order documents.
Scenario.skip('Case progression journey - Small Claims - Claimant and Defendant verify Dashboard an Order being Created', async ({I}) => {
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
}).tag('@nightly-prod');

