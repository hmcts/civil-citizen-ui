const config = require('../../config');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';

let claimRef;
let claimType = 'FastTrack';
let caseData;
let claimNumber;
let securityCode;

Feature('Response with PartAdmit - FastTrack');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, null, claimType);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Response with PartAdmit-AlreadyPaid @citizenUI @partAdmit @nightly', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterCompanyDetails();
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterDQForFastTrack(claimRef, false);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit, claimType);
}).tag('@regression-cui-r1');

AfterSuite(async () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});
