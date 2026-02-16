const CreateLipvLipClaimSteps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
// const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const dontWantMoreTime = 'dontWantMoreTime';
const rejectAll = 'rejectAll';
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
let claimNumber, claimRef;

Feature('Create Lip v Lip claim - Rejected All By Defendant and Disputed By Claimant').tag('@ui-reject-all');

Scenario('01 Verify the Eligibility Check journey R2', async () => {
  //await CreateLipvLipClaimSteps.EligibilityCheckSteps();
});

Scenario('02 Create Claim', async ({ api }) => {
  const isCrossBrowser = process.env.IS_CROSSBROWSER;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreation();
  claimRef = await CreateLipvLipClaimSteps.CreateClaimCreation(false);
  claimRef = claimRef.replace(/-/g, '');
  console.log('The value of the claim reference : ' + claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  await CreateLipvLipClaimSteps.clickPayClaimFee();
  await CreateLipvLipClaimSteps.verifyAndPayClaimFee(1520, 115);
  if (!isCrossBrowser) {
    await api.waitForFinishedBusinessProcess();
    await api.adjustSubmittedDateForCarm(claimRef);
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    let securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
    console.log('The value of the Claim Number :' + claimNumber);
    console.log('The value of the Security Code :' + securityCode);
  }
}).retry(1).tag('@crossbrowser');

Scenario('03 Assign case to defendant', async ({ api }) => {
  await api.assignToLipDefendant(claimRef);
});

Scenario('04 Defendant responds with Rejected All', async ({ I, api }) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  // await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
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
  await I.click('Sign out');
  await api.waitForFinishedBusinessProcess();
});

Scenario('05 Claimant responds as Disputed By Claimant', async ({ api }) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAContinuationWithTheClaimPostDefendantRejection(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
});
