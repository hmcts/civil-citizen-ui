const config = require('../../config');

const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const {createAccount, deleteAccount} = require('./../specClaimHelpers/api/idamHelper');

let claimRef;
//let caseData;
let claimNumber;
let securityCode;

Feature('Response with AdmitAll');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.defendantCitizenUser, 'pinInPost');
  console.log('Claim has been created Successfully    <===>  ', claimRef);
  let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @liptest @nightly @test', async () => {
//TBA
});

AfterSuite(async () => {
  await unAssignAllUsers();
  await deleteAccount(config.defendantCitizenUser.email);
});
