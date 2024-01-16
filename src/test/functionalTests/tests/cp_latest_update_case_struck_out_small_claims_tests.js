const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

const claimType = 'SmallClaims';
let claimRef;

Feature.skip('Case progression - Case Struck Out journey - Small Claims');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    await api.performCaseHearingFeeUnpaid(config.hearingCenterAdminWithRegionId1, claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Small claims case is struck out due to hearing fee not being paid', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    UploadEvidenceSteps.verifyLatestUpdatePageForCaseStruckOut(claimRef, claimType);
  }
}).tag('@regression');

AfterSuite(async  () => {
  await unAssignAllUsers();
});
