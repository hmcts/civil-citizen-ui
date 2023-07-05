const {
  applicantSolicitorUser,
  Username,
  Password,
  runningEnv,
  defenceType,
  claimState,
  judgeUserWithRegionId3,
  sdoSelectionType
} = require('../../config');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../features/home/steps/login');

const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(applicantSolicitorUser);
  await LoginSteps.EnterUserCredentials(Username, Password);
});

Scenario('Response with RejectAll and AlreadyPaid @citizenUI @rejectAll @regression', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, rejectAll);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
  if (['preview', 'demo'].includes(runningEnv)) {
    await api.enterBreathingSpace(applicantSolicitorUser);
    await api.liftBreathingSpace(applicantSolicitorUser);
    await api.viewAndRespondToDefence(applicantSolicitorUser, defenceType.rejectAllAlreadyPaid, claimState.JUDICIAL_REFERRAL);
    await api.createSDO(judgeUserWithRegionId3, sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes);
  }
});

Scenario('Response with RejectAll and DisputeAll @citizenUI @rejectAll @regression', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('disputeAll');
  await ResponseSteps.EnterWhyYouDisagree(claimRef);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
  if (['preview', 'demo'].includes(runningEnv)) {
    await api.enterBreathingSpace(applicantSolicitorUser);
    await api.liftBreathingSpace(applicantSolicitorUser);
    await api.viewAndRespondToDefence(applicantSolicitorUser, defenceType.rejectAllDisputeAll, claimState.IN_MEDIATION);
    //mediation with claimant lr to be replaced with admin after bug CIV-9427
    await api.mediationUnsuccessful(applicantSolicitorUser);
    //Create sdo in this journey is broken and a bug CIV-9488
    //await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing);
  }
}).tag('@crossbrowser');
