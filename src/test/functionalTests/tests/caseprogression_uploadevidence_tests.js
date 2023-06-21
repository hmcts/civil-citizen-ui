const config = require('../../config');
const UploadEvidenceSteps = require('../features/response/steps/caseProgressionSteps');
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
});

Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', () => {
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
  UploadEvidenceSteps.initiateUploadEvidenceJourney(claimRef);
  /* ResponseSteps.RespondToClaim(claimRef);
   ResponseSteps.EnterPersonalDetails(claimRef);
   ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
   ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
   ResponseSteps.SelectOptionInRejectAllClaim('disputeAll');
   ResponseSteps.EnterWhyYouDisagree(claimRef);
   ResponseSteps.AddYourTimeLineEvents(true);
   ResponseSteps.EnterYourEvidenceDetails(true);
   ResponseSteps.EnterSkipTelephoneMediationDetails(claimRef);
   ResponseSteps.EnterNoOptionsForDQForSmallClaims(claimRef);
   ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
   await api.performViewAndRespondToDefence(config.applicantSolicitorUser, claimRef);*/
}).tag('@regression');
