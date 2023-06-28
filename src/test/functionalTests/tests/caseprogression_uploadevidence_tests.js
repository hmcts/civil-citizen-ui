const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');

let claimRef;

Feature('Case progression journey - Defendant & Claimant Response with RejectAll');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll,'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
    if (claimRef) {
      await LoginSteps.EnterUserCredentials(config.Username, config.Password);
    } else {
      console.log('claimRef has not been Created');
    }
  }
});

Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef);
  }
}).tag('@regression @crossbrowser');
