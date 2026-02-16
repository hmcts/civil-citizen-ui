const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { orderMade } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { ordersAndNotices } = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, taskListItem;

Feature('Case progression journey - Verify latest Update page For an Order being Created - Small Claims').tag('@ui-nightly-prod @ui-orders');

Before(async ({ api }) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'IN_MEDIATION', 'SMALL_CLAIM');
  await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'smallClaimsTrack');
  await api.performAnAssistedOrder(config.judgeUserWithRegionId2, claimRef);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Case progression journey - Small Claims - Verify latest Update page for an Order being Created', async ({ I }) => {
  const orderMadeNotif = orderMade();
  await verifyNotificationTitleAndContent(claimNumber, orderMadeNotif.title, orderMadeNotif.content, claimRef);
  taskListItem = ordersAndNotices();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  await I.click(orderMadeNotif.nextSteps);
  await ResponseSteps.SignOut();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.click(claimNumber);
  await I.dontSee(orderMadeNotif.content);
});