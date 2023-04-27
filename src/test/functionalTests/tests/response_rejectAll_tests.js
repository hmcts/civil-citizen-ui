const config =  require('../../config');
const  ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const  LoginSteps =  require('../features/home/steps/login');

const rejectAll = 'rejectAll';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  LoginSteps.EnterUserCredentials(config.Username, config.Password);
});

Scenario('Response with RejectAll and AlreadyPaid @citizenUI @rejectAll @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, rejectAll);
  ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterYourEvidenceDetails();
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.EnterDQForSmallClaims(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
});

Scenario('Response with RejectAll and DisputeAll @citizenUI @rejectAll @regression', () => {
  ResponseSteps.RespondToClaim(claimRef);
  ResponseSteps.EnterPersonalDetails(claimRef);
  ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  ResponseSteps.SelectOptionInRejectAllClaim('disputeAll');
  ResponseSteps.EnterWhyYouDisagree(claimRef);
  ResponseSteps.AddYourTimeLineEvents();
  ResponseSteps.EnterYourEvidenceDetails();
  ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  ResponseSteps.EnterDQForSmallClaims(claimRef);
  ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
});
