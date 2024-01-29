const config = require('../../config');
const CaseProgressionSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;

Feature('Case progression journey - Upload Evidence - Defendant & Claimant Response with RejectAll - Fast Track ');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Fast Track Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.initiateUploadEvidenceJourney(claimRef, claimType);
  }
}).tag('@regression');

AfterSuite(async  () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});
