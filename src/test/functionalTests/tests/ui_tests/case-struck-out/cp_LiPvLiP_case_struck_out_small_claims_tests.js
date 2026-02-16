const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent, verifyTasklistLinkAndState } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { claimStruckOut } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { uploadHearingDocuments } = require('../../../specClaimHelpers/dashboardTasklistConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, taskListItem;

Feature('Case progression - Lip v Lip - Case Struck Out journey - Fast Track').tag('@ui-nightly-prod @ui-case-struck-out');

Before(async ({ api }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'IN_MEDIATION');
  await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'smallClaimsTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef);
  await api.performCaseHearingFeeUnpaid(config.hearingCenterAdminWithRegionId2, claimRef);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Small Claims LiPvLiP case is struck out due to hearing fee not being paid', async () => {
  //Claimant verifies dashboard
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  const claimStruckOutNotif = claimStruckOut();
  await verifyNotificationTitleAndContent(claimNumber, claimStruckOutNotif.title, claimStruckOutNotif.content, claimRef);
  taskListItem = uploadHearingDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
  //Defendant verifies dashboard
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await verifyNotificationTitleAndContent(claimNumber, claimStruckOutNotif.title, claimStruckOutNotif.content, claimRef);
  taskListItem = uploadHearingDocuments();
  await verifyTasklistLinkAndState(taskListItem.title, taskListItem.locator, 'Inactive');
});