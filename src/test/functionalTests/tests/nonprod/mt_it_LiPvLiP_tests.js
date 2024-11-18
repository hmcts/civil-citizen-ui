const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');

const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');

const partAdmit = 'partial-admission';
const rejectAll = 'rejectAll';

let claimRef, caseData, claimNumber, securityCode;

Feature('Multi and Intermediate Track - LIP - Defendant and Claimant Journey @nightly @minti');

Before(async () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('MT Defendant and Claimant responses', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
    await ResponseSteps.EnterPersonalDetails(claimRef, true);
    await ResponseSteps.EnterYourOptionsForDeadline(claimRef, 'dontWantMoreTime');
    await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
    await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
    await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 100000);
    await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
    await ResponseSteps.AddYourTimeLineEvents();
    await ResponseSteps.EnterYourEvidenceDetails();
    await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, 'immediate');
    await ResponseSteps.EnterDQForMultiTrackClaims(claimRef);
    await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-minti').tag('@nightly');

Scenario('IT Defendant and Claimant responses', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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
    await ResponseSteps.EnterCompDetails(true);
    await ResponseSteps.EnterYourOptionsForDeadline(claimRef, 'dontWantMoreTime');
    await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
    await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
    await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 15000, rejectAll);
    await ResponseSteps.VerifyPaidLessPage();
    await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll);
    await ResponseSteps.AddYourTimeLineEvents();
    await ResponseSteps.EnterYourEvidenceDetails();
    await ResponseSteps.EnterDQForIntTrackClaims(claimRef, false);
    await ResponseSteps.CheckAndSubmit(claimRef, rejectAll, 'Intermediate');
    await api.waitForFinishedBusinessProcess();

    // Respond as claimant user CIV-14655
    // To do later
    // await LoginSteps.EnterCitizenCredentials(config.applicantSolicitorUser.email, config.applicantSolicitorUser.password);
    // await ResponseSteps.RespondToClaim(claimRef);

  }
}).tag('@regression-minti').tag('@nightly');
