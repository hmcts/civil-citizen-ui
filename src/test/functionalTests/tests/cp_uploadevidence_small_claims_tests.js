const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

const claimType = 'SmallClaims';
let claimRef;

Feature('Case progression journey - Small Claims -Defendant & Claimant Response with RejectAll');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
  }
});

Scenario('Small Claims Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef, claimType);
  }
}).tag('@regression');

AfterSuite(async  () => {
  await unAssignAllUsers();
});