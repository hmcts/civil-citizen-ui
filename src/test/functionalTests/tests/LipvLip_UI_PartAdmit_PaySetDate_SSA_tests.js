const CreateLipvLipClaimSteps  =  require('../features/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const DashboardSteps = require('../features/dashboard/steps/dashboard');
const ResponseSteps = require('../features/response/steps/lipDefendantResponseSteps');
const ResponseToDefenceLipVsLipSteps  =  require('../features/createClaim/steps/responseToDefenceLipvLipSteps');
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';
const bySetDate = 'bySetDate';
const {createAccount} = require('../specClaimHelpers/api/idamHelper');

Feature('Create Lip v Lip claim -  Part Admit By Defendant and Accepted Repayment Plan By Claimant');

Scenario('Verify the Eligibility Check journey @citizenUIR2', async () => {
  await CreateLipvLipClaimSteps.EligibilityCheckSteps();
});

Scenario('Create Claim - Part Admit By Defendant and Accepted Repayment Plan By Claimant(Sign settlement Agreement)', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await CreateLipvLipClaimSteps.EligibilityCheckStepsForClaimCreation();
    let claimRef = await CreateLipvLipClaimSteps.CreateClaimCreation(true);
    claimRef = claimRef.replace(/-/g, '');
    console.log('The value of the claim reference : ' + claimRef);
    await api.setCaseId(claimRef);
    await api.waitForFinishedBusinessProcess();
    await CreateLipvLipClaimSteps.payClaimFee();
    await api.waitForFinishedBusinessProcess();
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    let claimNumber = await caseData.legacyCaseReference;
    let securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
    console.log('The value of the Claim Number :' + claimNumber);
    console.log('The value of the Security Code :' + securityCode);
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
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfSettlementAndRepayment(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
