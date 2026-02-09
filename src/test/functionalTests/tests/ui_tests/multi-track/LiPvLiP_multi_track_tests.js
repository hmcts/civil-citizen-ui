const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

const partAdmit = 'partial-admission';

let claimRef, caseData, claimNumber, securityCode;

Feature('Multi and Intermediate Track - LIP - Defendant and Claimant Journey').tag('@ui-nightly-prod @ui-multi-track');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('LiP vs LiP Multi claim', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Multi');
  console.log('LIP vs LIP MT claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterPersonalDetails(claimRef, false);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, 'dontWantMoreTime');
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 100000, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit, caseData.totalClaimAmount);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, 'immediate');
  await ResponseSteps.EnterDQForMultiTrackClaims(claimRef);
  await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
  await api.waitForFinishedBusinessProcess();
});
