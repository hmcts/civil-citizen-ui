const config = require('../../../config');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

const createGAAppSteps = require('../../citizenFeatures/response/steps/createGAAppSteps');

const carmEnabled = false;
const manualPIP = 'yes';
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with RejectAll and DisputeAll @testing');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', '', carmEnabled, '', manualPIP);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode, manualPIP);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Response with RejectAll and DisputeAll @citizenUI @rejectAll @nightly', async ({api, I}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    console.log('Creating GA app as claimant');
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA(claimRef);
    console.log('Creating GA app as defendant');
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);
    await createGAAppSteps.askForMoreTimeCourtOrderGA(claimRef);
  }
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
  // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
  // await api.enterBreathingSpace(config.applicantSolicitorUser);
  // await api.liftBreathingSpace(config.applicantSolicitorUser);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAllDisputeAll, config.claimState.IN_MEDIATION);
  await api.mediationUnsuccessful(config.caseWorker);
  await api.createSDO(config.judgeUserWithRegionId3, config.sdoSelectionType.judgementSumSelectedYesAssignToSmallClaimsNoDisposalHearing);

}).tag('@regression-cui-r1');
