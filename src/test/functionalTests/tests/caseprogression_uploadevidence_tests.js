const config =  require('../../config');
const  ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const  LoginSteps =  require('../features/home/steps/login');

const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef);
  await api.performViewAndRespondToDefence(config.applicantSolicitorUser, claimRef);
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with RejectAll and DisputeAll For the Case Progression and Hearing Scheduled Process To Complete', async ({api}) => {
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
