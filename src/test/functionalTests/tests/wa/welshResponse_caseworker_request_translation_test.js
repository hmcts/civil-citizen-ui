const config = require('../../../config');
const ResponseSteps = require('../../features/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../features/home/steps/login');
const DashboardSteps = require('../../features/dashboard/steps/dashboard');
const {unAssignAllUsers} = require('../../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('../../specClaimHelpers/api/idamHelper');

const dontWantMoreTime = 'dontWantMoreTime';
const bySetDate = 'bySetDate';

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

Scenario('Response with PartAdmit-AlreadyPaid @citizenUI @partAdmit @regression @nightly', async ({api}) => {
    await ResponseSteps.RespondToClaim(claimRef, 'cy');
    await ResponseSteps.EnterPersonalDetails(claimRef, false, 'cy');
    await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
});

AfterSuite(async () => {
    await unAssignAllUsers();
    await deleteAccount(config.defendantCitizenUser.email);
});