const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {claimantNotificationWithDefendantFullDefenceOrPartAdmitAlreadyPaid} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const partAdmit = 'partial-admission';
const rejectAll = 'rejectAll';

let claimRef, caseData, claimNumber, securityCode, paidDate;
const currentDate = new Date();
const paymentDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);

Feature('Multi and Intermediate Track - LIP - Defendant and Claimant Journey').tag('@ui-nightly-prod @ui-prod');

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

Scenario('MT Defendant responses', async ({api}) => {
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

Scenario('IT Defendant and Claimant responses', async ({api}) => {
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'Intermediate', false, 'DefendantCompany');
  console.log('LIP vs LIP claim has been created Successfully    <===>  ', claimRef);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  securityCode = caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterCompDetails(false);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, 'dontWantMoreTime');
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 15000, rejectAll);
  await ResponseSteps.VerifyPaidLessPage();
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll, caseData.totalClaimAmount);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterDQForIntTrackClaims(claimRef, false);
  await ResponseSteps.CheckAndSubmit(claimRef, rejectAll, 'Intermediate');
  await api.waitForFinishedBusinessProcess();

  // Respond as claimant user
  paidDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(paymentDate);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.RespondToClaimAsClaimant(claimRef, claimantNotificationWithDefendantFullDefenceOrPartAdmitAlreadyPaid(15000, paidDate));
  await ClaimantResponseSteps.verifyDefendantResponse();
  await ClaimantResponseSteps.isDefendantPaid('Yes', 15000);
  await ClaimantResponseSteps.settleTheClaim('No', 15000);
  await ResponseSteps.EnterClaimantDQForIntTrack(claimRef, false);
  await ClaimantResponseSteps.submitYourResponse();
});
