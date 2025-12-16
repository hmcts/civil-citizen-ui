const config = require('../../../../config');
const CaseProgressionSteps = require('../../../citizenFeatures/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { claimStruckOut } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { addTrialArrangements, uploadHearingDocuments } = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'FastTrack';
let caseData, claimNumber, claimRef, taskListItem;

Feature('Case progression - Case Struck Out journey - Fast Track').tag('@ui-nightly-prod');

Before(async ({ api }) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef);
  await api.performCaseHearingFeeUnpaid(config.hearingCenterAdminWithRegionId2, claimRef);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Fast Track case is struck out due to hearing fee not being paid', async () => {
  const claimStruckOutNotif = claimStruckOut();
  await verifyNotificationTitleAndContent(claimNumber, claimStruckOutNotif.title, claimStruckOutNotif.content, claimRef);
  taskListItem = addTrialArrangements();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  taskListItem = uploadHearingDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
});