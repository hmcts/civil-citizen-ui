const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');

const claimType = 'SmallClaims';
let claimRef;


Feature('Case progression journey - Defendant & Claimant Response with RejectAll');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  } else {
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser, '', claimType);
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
});

Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef, claimType);
  }
}).tag('@regression');
