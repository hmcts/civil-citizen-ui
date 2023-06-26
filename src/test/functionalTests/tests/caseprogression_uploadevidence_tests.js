const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');

const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef);
  await api.performViewAndRespondToDefence(config.applicantSolicitorUser, claimRef);
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
  if (claimRef) {
    await LoginSteps.EnterUserCredentials(config.Username, config.Password);
  } else {
    console.log('claimRef has not been Created');
  }
});

Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef);
}).tag('@regression');
