const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');
const {createAccount} = require('./../specClaimHelpers/api/idamHelper');
const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const ResponseToDefenceLipVsLipSteps  =  require('../features/createClaim/steps/responseToDefenceLipvLipSteps');
/*const {unAssignAllUsers} = require('../specClaimHelpers/api/caseRoleAssignmentHelper');
const {deleteAccount} = require('../specClaimHelpers/api/idamHelper');*/
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';
const bySetDate = 'bySetDate';

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
  console.log('The value of the Claim Number :'+ claimNumber);
  console.log('The value of the Security Code :'+ securityCode);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.assignToLipDefendant(claimRef);
  await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, bySetDate);
  await ResponseSteps.EnterDateToPayOn();
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  await ResponseSteps.SignOut();
  await LoginSteps.EnterUserCredentials('civilmoneyclaimsdemo@gmail.com', 'Password12!');
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceSteps(claimRef,claimNumber);

  pause();
}).tag('@regression');
