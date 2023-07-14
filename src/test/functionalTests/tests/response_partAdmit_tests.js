const config =  require('../../config');
const ResponseSteps  =  require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

const partAdmit = 'partial-admission';
const immediatePayment = 'immediate';
const bySetDate = 'bySetDate';
const repaymentPlan = 'repaymentPlan';
const dontWantMoreTime = 'dontWantMoreTime';
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with PartAdmit');

Before(async ({api}) => {
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  '  , claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('Response with PartAdmit-AlreadyPaid @citizenUI @partAdmit @regression', async ({api}) => {
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.partAdmitAmountPaid, config.claimState.JUDICIAL_REFERRAL);
    //Bug CIV-9440
    //await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoTrialHearing);
  }
});

Scenario('Response with PartAdmit-havent paid and Immediate payment @citizenUI @partAdmit @regression', async ({api}) => {
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, immediatePayment);
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediately, config.claimState.IN_MEDIATION);
    //mediation with claimant lr to be replaced with admin after bug CIV-9427
    await api.mediationSuccessful(config.applicantSolicitorUser);
  }
});

Scenario('Response with PartAdmit and Date to PayOn @citizenUI @partAdmit @regression', async ({api}) => {
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, bySetDate);
  await ResponseSteps.EnterDateToPayOn();
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.partAdmitWithPartPaymentOnSpecificDate, config.claimState.PROCEEDS_IN_HERITAGE_SYSTEM);
    //Bug CIV-9440
    //await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedNoAssignToSmallClaimsYes);
  }
});

Scenario('Response with PartAdmit and Repayment plan @citizenUI @partAdmit @nightly', async ({api}) => {
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, repaymentPlan);
  await ResponseSteps.EnterRepaymentPlan(claimRef);
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
    // await api.enterBreathingSpace(config.applicantSolicitorUser);
    // await api.liftBreathingSpace(config.applicantSolicitorUser);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlan, config.claimState.PROCEEDS_IN_HERITAGE_SYSTEM);
    //Bug CIV-9440
    //await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedNoAssignToFastTrackYes);
  }
});
