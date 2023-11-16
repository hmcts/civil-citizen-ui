const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');
const LoginSteps = require('../features/home/steps/login');
const config = require('../../config');

const userLoggedIn = 'userLoggedIn';
const userNotLoggedIn = 'userNotLoggedIn';
const claimantPartyTypeInd = 'individual';
Feature('Create Lip v Lip claim');

Scenario('Verify the Eligibility Check journey @citizenUIR2', async () => {
  await CreateLipvLipClaimSteps.VerifyEligibilityCheckSteps(userNotLoggedIn);
});

Scenario('Create LipvLip claim with IndvInd and small claims @citizenUIR2', async () => {
  await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.EligibilityCheckSteps(userLoggedIn);
  await CreateLipvLipClaimSteps.EnterYourDetails(claimantPartyTypeInd);
});
