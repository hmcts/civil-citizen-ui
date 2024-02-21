const config = require('../../config');

const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');

let claimRef;
let claimType = 'FastTrack';
let caseData;
let claimNumber;
let securityCode;

Feature('Negative Scenarios for Defendant Response');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, null, claimType);
  console.log('claimRef has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Company personal detail error screen @nightly', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterCompanyDetailError(claimRef);
});

AfterSuite(async () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});
