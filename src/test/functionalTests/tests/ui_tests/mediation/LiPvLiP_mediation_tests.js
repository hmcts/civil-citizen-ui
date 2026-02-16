const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {
  mediationUnsuccessfulNOTClaimant1NonContactable,
  mediationUnsuccessfulClaimant1NonAttendance,
  mediationSuccessful,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {
  verifyNotificationTitleAndContent,
  verifyTasklistLinkAndState,
} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  viewMediationDocuments,
  uploadMediationDocuments,
  viewMediationSettlementAgreement,
} = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
const carmEnabled = true;
let claimRef, caseData, claimNumber, securityCode, taskListItem;

let mediationAdmin = config.localMediationTests ? config.hearingCenterAdminLocal : config.caseWorker;

Feature('LiP - CARM - Mediation Journey').tag('@ui-nightly-prod @ui-mediation');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

// LiP Individual vs LiP Company
Scenario('LiP vs LiP Unsuccessful Mediation with Upload Documents', async ({ api }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'DefendantCompany');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'IN_MEDIATION');
  await api.mediationUnsuccessful(mediationAdmin, true, ['NOT_CONTACTABLE_DEFENDANT_ONE']);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const mediationUnsuccessfulNOTClaimant1NonContactableNotif = mediationUnsuccessfulNOTClaimant1NonContactable();
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulNOTClaimant1NonContactableNotif.title, mediationUnsuccessfulNOTClaimant1NonContactableNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, defNotification.title, defNotification.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  await api.uploadMediationDocumentsCui(config.defendantCitizenUser, claimRef);
  await api.waitForFinishedBusinessProcess();

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotificationAfterUpload = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, defNotificationAfterUpload.title, defNotificationAfterUpload.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const notificationAfterDefUpload = mediationUnsuccessfulNOTClaimant1NonContactable();
  await verifyNotificationTitleAndContent(claimNumber, notificationAfterDefUpload.title, notificationAfterDefUpload.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
}).tag('@ui-prod');

Scenario('LiP vs LiP Unsuccessful Mediation with other options', async ({ api }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'DefendantCompany');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'IN_MEDIATION');
  await api.mediationUnsuccessful(mediationAdmin, true, ['PARTY_WITHDRAWS', 'APPOINTMENT_NOT_ASSIGNED', 'APPOINTMENT_NO_AGREEMENT']);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const mediationUnsuccessfulNOTClaimant1NonContactableNotif = mediationUnsuccessfulNOTClaimant1NonContactable();
  await verifyNotificationTitleAndContent(claimNumber, mediationUnsuccessfulNOTClaimant1NonContactableNotif.title, mediationUnsuccessfulNOTClaimant1NonContactableNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification = mediationUnsuccessfulNOTClaimant1NonContactable();
  await verifyNotificationTitleAndContent(claimNumber, defNotification.title, defNotification.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
});

// LiP Individual vs LiP Sole Trader
Scenario('LiP vs LiP Successful Mediation', async ({ api }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'DefendantSoleTrader');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantSoleTrader');
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, true, 'IN_MEDIATION');
  await api.mediationSuccessful(mediationAdmin, true);
  await api.waitForFinishedBusinessProcess();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const mediationSuccessfulNotif = mediationSuccessful();
  await verifyNotificationTitleAndContent(claimNumber, mediationSuccessfulNotif.title, mediationSuccessfulNotif.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification = mediationSuccessful();
  await verifyNotificationTitleAndContent(claimNumber, defNotification.title, defNotification.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
});