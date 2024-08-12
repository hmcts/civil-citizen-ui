const config = require('../../../config');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = false;
const manualPIP = 'yes';
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with RejectAll and AlreadyPaid');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', '', carmEnabled, '', manualPIP);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Response with RejectAll and AlreadyPaid @citizenUI @rejectAll @nightly', async ({api}) => {
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
  // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
  // await api.enterBreathingSpace(config.applicantSolicitorUser);
  // await api.liftBreathingSpace(config.applicantSolicitorUser);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAllAlreadyPaid, config.claimState.JUDICIAL_REFERRAL);
  await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsYes);
}).tag('@regression-cui-r1');