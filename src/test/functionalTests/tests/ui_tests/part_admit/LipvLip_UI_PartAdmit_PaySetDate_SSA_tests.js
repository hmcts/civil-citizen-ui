const CreateLipvLipClaimSteps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';
const bySetDate = 'bySetDate';
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
let claimNumber, claimRef;

Feature('Create Lip v Lip claim -  Part Admit By Defendant and Accepted Repayment Plan By Claimant').tag('@part-admit @nightly-prod');

Scenario('Verify the Eligibility Check journey', async () => {
  //await CreateLipvLipClaimSteps.EligibilityCheckSteps();
});

Scenario('Create Claim by claimant', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreation();
  claimRef = await CreateLipvLipClaimSteps.CreateClaimCreation(true);
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
  console.log('The value of the Claim Number :', claimNumber);
  console.log('The value of the Security Code :', securityCode);
}).retry(1);

Scenario('Assign case to defendant', async ({api}) => {
  await api.assignToLipDefendant(claimRef);
});

Scenario('Defendant responds with part admit', async ({api}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, bySetDate);
  await ResponseSteps.EnterDateToPayOn();
  await ResponseSteps.EnterFinancialDetails(claimRef);
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmAltPhoneDetails();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.EnterUnavailableDates(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  await api.waitForFinishedBusinessProcess();
}).retry(1);

// TODO undo this once the stop from choosing settlement agreement is removed
Scenario.skip('Claimant responds as Accepted Repayment Plan By Claimant', async ({api}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfSettlementAndRepayment(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).retry(1);
