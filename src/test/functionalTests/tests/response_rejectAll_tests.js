const config =  require('../../config');
const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');

const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with RejectAll');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  if (claimRef) {
    await LoginSteps.EnterUserCredentials(config.Username, config.Password);
  } else {
    console.log('claimRef has not been Created');
  }
});

Scenario('Response with RejectAll and AlreadyPaid @citizenUI @rejectAll @test', async ({api}) => {
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
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await api.enterBreathingSpace(config.applicantSolicitorUser);
    await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAllAlreadyPaid, config.claimState.JUDICIAL_REFERRAL);
    await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes);
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
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await api.enterBreathingSpace(config.applicantSolicitorUser);
    await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAllDisputeAll, config.claimState.IN_MEDIATION);
    //mediation with claimant lr to be replaced with admin after bug CIV-9427
    await api.mediationUnsuccessful(config.applicantSolicitorUser);
    //Create sdo in this journey is broken and a bug CIV-9488
    //await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing);
  }
});
