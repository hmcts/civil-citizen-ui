const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {
  mediationUnsuccessfulClaimant1NonAttendance,
  mediationCARMClaimantDefendant,
  mediationUnsuccessfulNOTClaimant1NonContactable,
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

Feature('LR - CARM - Mediation Journey').tag('@civil-citizen-nightly @ui-mediation');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

// LR Individual vs LiP Organisation
Scenario('LR vs LiP Unsuccessful Mediation - LIP not contactable', async ({ api, noc }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'IndividualVOrganisation');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await noc.requestNoticeOfChangeForApplicant1Solicitor(claimRef, config.applicantSolicitorUser);
  await api.checkUserCaseAccess(config.claimantCitizenUser, false);
  await api.checkUserCaseAccess(config.applicantSolicitorUser, true);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantOrganisation');
  await api.claimantLrRespondToDefence(config.applicantSolicitorUser, claimRef, 'IN_MEDIATION');
  await api.mediationUnsuccessful(mediationAdmin, true, ['NOT_CONTACTABLE_DEFENDANT_ONE']);
  await api.waitForFinishedBusinessProcess();

  // Before uploading Mediation doc
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, defNotification.title, defNotification.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  // After LR uploaded Mediation doc
  await api.uploadMediationDocumentsExui(config.applicantSolicitorUser, claimRef);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification1 = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, defNotification1.title, defNotification1.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Action needed', true);
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  // After LIP uploaded Mediation doc
  await api.uploadMediationDocumentsCui(config.defendantCitizenUser, claimRef);
  await api.uploadMediationDocumentsExui(config.applicantSolicitorUser, claimRef);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification2 = mediationUnsuccessfulClaimant1NonAttendance();
  await verifyNotificationTitleAndContent(claimNumber, defNotification2.title, defNotification2.content);
  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'In progress', true);
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
});

Scenario('LR vs LiP Unsuccessful Mediation - LR not contactable', async ({ api, noc }) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'IndividualVOrganisation');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await noc.requestNoticeOfChangeForApplicant1Solicitor(claimRef, config.applicantSolicitorUser);
  await api.checkUserCaseAccess(config.claimantCitizenUser, false);
  await api.checkUserCaseAccess(config.applicantSolicitorUser, true);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantOrganisation');
  await api.claimantLrRespondToDefence(config.applicantSolicitorUser, claimRef, 'IN_MEDIATION');
  await api.mediationUnsuccessful(mediationAdmin, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
  await api.waitForFinishedBusinessProcess();

  // Before uploading Mediation doc
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const defNotification1 = mediationCARMClaimantDefendant();
  await verifyNotificationTitleAndContent(claimNumber, defNotification1.title, defNotification1.content);
  const defNotification2 = mediationUnsuccessfulNOTClaimant1NonContactable();
  await verifyNotificationTitleAndContent('', defNotification2.title, defNotification2.content);

  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Not available yet');
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');

  // After LR uploaded Mediation doc
  await api.uploadMediationDocumentsExui(config.applicantSolicitorUser, claimRef);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  const mediationCARMClaimantDefendantNotif = mediationCARMClaimantDefendant();
  await verifyNotificationTitleAndContent(claimNumber, mediationCARMClaimantDefendantNotif.title, mediationCARMClaimantDefendantNotif.content);

  taskListItem = viewMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Available', true);
  taskListItem = uploadMediationDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = viewMediationSettlementAgreement();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
});