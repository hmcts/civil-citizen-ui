const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');
const {createAccount} = require('./../specClaimHelpers/api/idamHelper');
const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');

Feature('Create Lip v Lip claim');

Scenario('Verify the Eligibility Check journey @citizenUIR2', async () => {
  await CreateLipvLipClaimSteps.EligibilityCheckSteps();
});

Scenario.only('Create Claim For Under 25000', async () => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreation();
  await CreateLipvLipClaimSteps.CreateClaimCreation();
}).tag('@regression');
