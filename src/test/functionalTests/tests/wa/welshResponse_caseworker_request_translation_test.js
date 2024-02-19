const config = require('../../../config');
const ResponseSteps = require('../../features/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../features/home/steps/login');
const DashboardSteps = require('../../features/dashboard/steps/dashboard');
const {unAssignAllUsers} = require('../../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('../../specClaimHelpers/api/idamHelper');

const dontWantMoreTime = 'dontWantMoreTime';
const bySetDate = 'bySetDate';
const partAdmit = 'partial-admission';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Response with PartAdmit - Small Claims');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Welsh Response with PartAdmit Then Caseworker Request Transational - SetDate @citizenUI @partAdmit @regression @nightly @kiyron', async () => {
  await ResponseSteps.RespondToClaim(claimRef, 'cy');
  await ResponseSteps.EnterPersonalDetails(claimRef, false);
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
});

AfterSuite(async () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});