const config = require('../../config');

const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');
const LoginSteps =  require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');

// eslint-disable-next-line no-unused-vars
let claimRef;

Feature('Create LiP claim');

Before(async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimRef);
});

Scenario('create lip claim @citizenUI @liptest @nightly @test', async () => {
//TBA
});

AfterSuite(async () => {
  await unAssignAllUsers();
});
