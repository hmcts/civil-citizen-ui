const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');
/*const {createAccount} = require('./../specClaimHelpers/api/idamHelper');
const config = require('../../config');*/
const LoginSteps = require('../features/home/steps/login');
const config = require('../../config');
/*const {unAssignAllUsers} = require('../specClaimHelpers/api/caseRoleAssignmentHelper');
const {deleteAccount} = require('../specClaimHelpers/api/idamHelper');*/

Feature('Create Lip v Lip claim');

Scenario('Verify the Eligibility Check journey @citizenUIR2', async () => {
  await CreateLipvLipClaimSteps.EligibilityCheckSteps();
});

Scenario.only('Create Claim For Under 25000', async ({api}) => {
  //await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterUserCredentials('civilmoneyclaimsdemo@gmail.com', 'Password12!');
  await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreation();
  let claimRef =  await CreateLipvLipClaimSteps.CreateClaimCreation();
  claimRef = claimRef.replace(/-/g, '');
  console.log('The value of the claim reference : ' +claimRef);
  let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  let claimNumber = await caseData.legacyCaseReference;
  let securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console('The value of the Claim Number :'+ claimNumber);
  console('The value of the Security Code :'+ securityCode);
  pause();
}).tag('@regression');
