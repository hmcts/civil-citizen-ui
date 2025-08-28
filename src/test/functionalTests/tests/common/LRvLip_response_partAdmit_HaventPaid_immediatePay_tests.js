const config = require('../../../config');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const partAdmit = 'partial-admission';
const immediatePayment = 'immediate';
const dontWantMoreTime = 'dontWantMoreTime';
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with PartAdmit-havent paid and Immediate payment - Small Claims').tag('@part-admit @nightly');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
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

Scenario('Response with PartAdmit-havent paid and Immediate payment', async ({api}) => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, immediatePayment);
  //await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef); - before carm screens
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmAltPhoneDetails();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.EnterUnavailableDates(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
  // await api.enterBreathingSpace(config.applicantSolicitorUser);
  // await api.liftBreathingSpace(config.applicantSolicitorUser);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediately, config.claimState.IN_MEDIATION);
  await api.mediationSuccessful(config.caseWorker);
})
