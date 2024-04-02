const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const ResponseToDefenceLipVsLipSteps  =  require('../features/createClaim/steps/responseToDefenceLipvLipSteps');
const dontWantMoreTime = 'dontWantMoreTime';
const rejectAll = 'rejectAll';
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
let claimNumber, claimRef;

Feature('Create Lip v Lip claim - Rejected All By Defendant and Disputed By Claimant');

Scenario('Verify the Eligibility Check journey @citizenUIR2', async () => {
  //await CreateLipvLipClaimSteps.EligibilityCheckSteps();
});

Scenario('Create Claim', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreation();
    claimRef = await CreateLipvLipClaimSteps.CreateClaimCreation(false);
    claimRef = claimRef.replace(/-/g, '');
    console.log('The value of the claim reference : ' + claimRef);
    await api.setCaseId(claimRef);
    await api.waitForFinishedBusinessProcess();
    await CreateLipvLipClaimSteps.clickPayClaimFee();
    await CreateLipvLipClaimSteps.verifyAndPayClaimFee(1520, 115);
    await api.waitForFinishedBusinessProcess();
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    let securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
    console.log('The value of the Claim Number :' + claimNumber);
    console.log('The value of the Security Code :' + securityCode);
  }
}).retry(1).tag('@regression-r2');

Scenario('Assign case to defendant', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await api.assignToLipDefendant(claimRef);
  }
}).tag('@regression-r2');

Scenario('Defendant responds with Rejected All', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await DashboardSteps.VerifyClaimOnDashboard(claimNumber);
    await ResponseSteps.RespondToClaim(claimRef);
    await ResponseSteps.EnterPersonalDetails(claimRef);
    await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
    await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
    await ResponseSteps.SelectOptionInRejectAllClaim('disputeAll');
    await ResponseSteps.EnterWhyYouDisagree(claimRef);
    await ResponseSteps.AddYourTimeLineEvents();
    await ResponseSteps.EnterYourEvidenceDetails();
    await ResponseSteps.EnterFreeTelephoneMediationDetails(claimRef);
    await ResponseSteps.EnterDQForSmallClaims(claimRef);
    await ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
    await ResponseSteps.SignOut();
    await api.waitForFinishedBusinessProcess();
  }
}).retry(1).tag('@regression-r2');

Scenario('Claimant responds as Disputed By Claimant', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAContinuationWithTheClaimPostDefendantRejection(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).retry(1).tag('@regression-r2');