const config = require('../../config');
//const performSDOSteps = require('../features/caseProgression/steps/performSDO');
//const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');

let claimRef;

Feature('Case progression journey - Defendant & Claimant Response with RejectAll');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', 'FastTrack');
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  } else {
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser, '', 'FastTrack');
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, 'FastTrack');
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL');
  //performSDOSteps.loadSDOPage(claimRef);
  await api.getSDODocumentDetails(config.judgeUserWithRegionId1);
  //await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
  //await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef);
});

//Disabled the test due to the defect https://tools.hmcts.net/jira/browse/CIV-9730
Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  /*if (['preview', 'demo'].includes(config.runningEnv)) {
    UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef);
  }*/
}).tag('@regression');
