const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const RequestForReconsideraionSteps = require('../../citizenFeatures/caseProgression/steps/requestForReconsiderationSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const StringUtilsComponent = require('../../citizenFeatures/caseProgression/util/StringUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const { isDashboardServiceToggleEnabled } = require('../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../specClaimHelpers/e2e/dashboardHelper');
const { orderMadeLA, reviewRequested, commentMadeOnRequest} = require('../../specClaimHelpers/dashboardNotificationConstants');
const { ordersAndNotices } = require('../../specClaimHelpers/dashboardTasklistConstants');
const ViewOrderAndNotices = require('../../citizenFeatures/caseProgression/pages/viewOrdersAndNotices');

const viewOrdersAndNoticesPage = new ViewOrderAndNotices();
const claimType = 'SmallClaimsThousand';
const claimAmount = '£1,000';
let caseData, claimNumber, claimRef, taskListItem, notification, deadline, todayDate, formattedCaseId;

Feature('Case progression - Request for reconsideration')

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'IN_MEDIATION', 'SMALL_CLAIM');
  await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
  await api.performCaseProgressedToSDO(config.legalAdvisor, claimRef, claimType);
  await api.waitForFinishedBusinessProcess();
  deadline = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(1));
  formattedCaseId = StringUtilsComponent.StringUtilsComponent.formatClaimReferenceToAUIDisplayFormat(claimRef);
  todayDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(new Date());
});

Scenario('Claimant LR performs Request for reconsideration and Defendant LiP adds a comment', async ({I, api}) => {
  //claimant performs request for reconsideration
  await api.performRequestForReconsideration(config.applicantSolicitorUser, claimRef);
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    //defendant adds a comment to the claimant's request
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    notification = reviewRequested(deadline);
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await I.click(notification.nextSteps);
    await RequestForReconsideraionSteps.initiateAddYourComments(formattedCaseId, claimAmount, 'Test Inc');
    taskListItem = ordersAndNotices();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    await I.click(taskListItem.title);
    await viewOrdersAndNoticesPage.verifyPageContent(formattedCaseId, claimAmount);
    await viewOrdersAndNoticesPage.checkRequestToReviewOrder('defendant', todayDate);
    await viewOrdersAndNoticesPage.checkRequestToReviewOrder('claimant', todayDate);
  }
}).tag('@nightly');

Scenario('Defendant LiP performs Request for reconsideration and Claimant adds a comment', async ({I, api}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
  if (isDashboardServiceEnabled) {
    //defendant performs request for reconsideration
    notification = orderMadeLA();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    await I.click(notification.nextSteps);
    await RequestForReconsideraionSteps.initiateRequestForReconsideration(formattedCaseId, claimAmount, 'Test Inc', deadline);
    //defendant checks claimant's comment
    await api.performRequestForReconsideration(config.applicantSolicitorUser, claimRef);
    I.refreshPage();
    notification = commentMadeOnRequest();
    await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
    taskListItem = ordersAndNotices();
    await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
    await I.click(taskListItem.title);
    await viewOrdersAndNoticesPage.verifyPageContent(formattedCaseId, claimAmount);
    await viewOrdersAndNoticesPage.checkRequestToReviewOrder('claimant', todayDate);
    await viewOrdersAndNoticesPage.checkRequestToReviewOrder('defendant', todayDate);
  }
}).tag('@nightly');
