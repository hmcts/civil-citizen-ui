const config = require('../../config');

const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

// eslint-disable-next-line no-unused-vars
let claimRef;
let claimNumber;

Feature('Response with AdmitAll');

Before(async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

Scenario('Response with AdmitAll and Immediate payment @citizenUI @admitAll @liptest @nightly @test', async () => {
//TBA
});

AfterSuite(async () => {
  await unAssignAllUsers();
});
