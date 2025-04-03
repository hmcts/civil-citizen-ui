const config = require('../../../config');
const CaseProgressionSteps = require('../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { orderMade } = require('../../specClaimHelpers/dashboardNotificationConstants');
const { ordersAndNotices } = require('../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'FastTrack';
let caseData, claimNumber, claimRef, taskListItem;

Feature('Case progression journey - Verify latest Update page For an Order being Created - Fast Track').tag('@case-progression');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
  await api.performAnAssistedOrder(config.judgeUserWithRegionId1, claimRef);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Case progression journey - Fast Track - Verify latest Update page for an Order being Created', async ({I}) => {
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    const notification = orderMade();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = ordersAndNotices();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    await I.click(notification.nextSteps);
    await ResponseSteps.SignOut();
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.click(claimNumber);
    await I.dontSee(notification.title);
  } else {
    CaseProgressionSteps.verifyAnOrderHasBeenMadeOnTheClaim(claimRef, claimType);
  }
}).tag('@skip-regression-cp');

