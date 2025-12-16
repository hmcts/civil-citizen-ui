const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { caseOffline, caseOfflineAfterSDO } = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, notification;

Feature('LR v Lip - Case Offline Tests').tag('@ui-case-offline');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  notification = caseOffline();
});

//This needs investigation
Scenario.skip('Case is offline after caseworker performs Case proceeds in caseman event', async ({api}) => {
  await api.caseProceedsInCaseman();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
});

//This needs investigation
Scenario.skip('Case is taken offline after SDO for non early adopters', async ({api}) => {
  notification = caseOfflineAfterSDO();
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'IN_MEDIATION', 'SMALL_CLAIM', false);
  await api.mediationUnsuccessful(config.caseWorker, true, ['NOT_CONTACTABLE_CLAIMANT_ONE']);
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef,'smallClaimsTrack');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.claimantCitizenUser.password);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  await api.caseProceedsInCaseman();
}).tag('@case-progression @ui-prod');
