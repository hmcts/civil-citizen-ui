const config = require('../../../config');

const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const CreateLipvLipClaimSteps  = require('../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
// eslint-disable-next-line no-unused-vars
let claimRef;

// After CUI R2 release, OCMC tests are not needed to run in the pipeline. Hence added the ignore tag.
Feature('Create Lip v Lip claim -  Full Admit and pay Immediately');

Scenario('Create OCMC case and view it in preview @ocmc', async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentialsOCMC(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreationOCMC();
  let claimRef = await CreateLipvLipClaimSteps.CreateClaimCreationOCMC(false);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.CheckOCMCcasePreview(claimRef);
}).tag('@ignore');
