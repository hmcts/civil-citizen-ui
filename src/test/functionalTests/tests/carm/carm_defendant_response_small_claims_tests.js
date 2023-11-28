const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require("../../features/dashboard/steps/dashboard");
const ResponseSteps = require("../../features/response/steps/lipDefendantResponseSteps");

const claimType = 'SmallClaims';
const carmEnabled = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('CARM - LiP Defendant Journey - Small claims track');

Before(async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType, carmEnabled);
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber =  caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  }else{
    claimRef = await api.createSpecifiedClaimLRvLR(config.applicantSolicitorUser);
    console.log('claimRef has been created Successfully    <===>  '  , claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantLRCitizenUser.email, config.defendantLRCitizenUser.password);
  }
});

Scenario('Response with PartAdmit-AlreadyPaid @citizenUI @partAdmit @regression @nightly', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  // await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  // await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  // await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  // await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  // await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  // await ResponseSteps.AddYourTimeLineEvents();
  // await ResponseSteps.EnterYourEvidenceDetails();
  // await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  // await ResponseSteps.EnterDQForSmallClaims(claimRef);
  // await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  // if (['preview', 'demo'  ].includes(config.runningEnv)) {
  //   // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
  //   // await api.enterBreathingSpace(config.applicantSolicitorUser);
  //   // await api.liftBreathingSpace(config.applicantSolicitorUser);
  //   await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.partAdmitAmountPaid, config.claimState.JUDICIAL_REFERRAL);
  //   await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing);
  // }
}).tag('@123');
