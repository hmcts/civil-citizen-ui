const config = require('../../../../config');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');

const admitAll = 'full-admission';
const immediatePayment = 'immediate';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
const manualPIP = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with AdmitAll').tag('@nightly-prod');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, 'pinInPost', '', carmEnabled, '', manualPIP);
  console.log('Claim has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode, manualPIP);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password, manualPIP);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Response with AdmitAll and Immediate payment', async ({api}) => {
  await CitizenDashboardSteps.CitizenDashboardPage();
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, immediatePayment);
  await ResponseSteps.CheckAndSubmit(claimRef, admitAll);
  // commenting until this is fixed https://tools.hmcts.net/jira/browse/CIV-9655
  // await api.enterBreathingSpace(config.applicantSolicitorUser);
  // await api.liftBreathingSpace(config.applicantSolicitorUser);
  await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.admitAllPayImmediate);
});
