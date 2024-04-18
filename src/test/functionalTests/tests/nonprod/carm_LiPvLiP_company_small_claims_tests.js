const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const ClaimantResponseSteps = require('../../citizenFeatures/response/steps/lipClaimantResponseSteps');

const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
const rejectAll = 'rejectAll';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('LiP vs LiP - CARM - Claimant and Defendant Journey - Company');

Before(async () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('LiP Defendant Response with Reject all claim', async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled, 'Company');
    console.log('LIP vs LIP claim has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber =  caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await ResponseSteps.RespondToClaim(claimRef);
    await ResponseSteps.EnterCompDetails(carmEnabled);
    await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
    await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
    await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
    await ResponseSteps.EnterHowMuchYouHavePaid(claimRef, 500, rejectAll);
    await ResponseSteps.VerifyPaidLessPage();
    await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, rejectAll);
    await ResponseSteps.AddYourTimeLineEvents();
    await ResponseSteps.EnterYourEvidenceDetails();
    await ResponseSteps.EnterTelephoneMediationDetails();
    await ResponseSteps.ConfirmContactPerson();
    await ResponseSteps.ConfirmPhoneDetails();
    await ResponseSteps.ConfirmEmailDetails();
    await ResponseSteps.EnterUnavailableDates();
    await ResponseSteps.EnterDQForSmallClaims(claimRef, false);
    await ResponseSteps.verifyMediationDetailsInCYA(claimRef);
    await ResponseSteps.clickEmailChangeLink();
    await ResponseSteps.ConfirmAltEmailDetails();
    await ResponseSteps.clickSaveButton();
    await ResponseSteps.clickSaveButton();
    await ResponseSteps.verifyEditedEmailDetails();
    await ResponseSteps.fillStatementOfTruthAndSubmit();
    await ResponseSteps.VerifyConfirmationPage('RejectsAndLessThanClaimAmount');
  }
}).tag('@regression-carm');

Scenario('LiP Claimant Response with Reject all claim', async () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ClaimantResponseSteps.RespondToClaimAsClaimant(claimRef);
    await ClaimantResponseSteps.verifyDefendantResponse();
    await ClaimantResponseSteps.isDefendantPaid('No');
    await ResponseSteps.EnterTelephoneMediationDetails();
    await ResponseSteps.ConfirmContactPerson();
    await ResponseSteps.ConfirmPhoneDetails();
    await ResponseSteps.ConfirmEmailDetails();
    await ResponseSteps.EnterUnavailableDates();
    await ResponseSteps.EnterDQForSmallClaims(claimRef, false);
    await ClaimantResponseSteps.verifyMediationDetailsInCYA(claimRef);
    await ClaimantResponseSteps.clickEmailChangeLink();
    await ResponseSteps.ConfirmAltEmailDetails();
    await ResponseSteps.clickSaveButton();
    await ResponseSteps.clickSaveButton();
    await ClaimantResponseSteps.verifyEditedEmailDetails();
  }
}).tag('@regression-carm');

