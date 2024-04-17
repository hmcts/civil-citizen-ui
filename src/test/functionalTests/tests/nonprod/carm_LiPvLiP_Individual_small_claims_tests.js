const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../citizenFeatures/response/steps/lipClaimantResponseSteps');

const claimType = 'SmallClaims';
const partAdmit = 'partial-admission';
const dontWantMoreTime = 'dontWantMoreTime';

const carmEnabled = true;
let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('LiP vs LiP - CARM - Claimant and Defendant Journey - Individual');

Before(async () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('LiP Defendant response with Part admit', async ({api}) => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, carmEnabled);
    console.log('LIP vs LIP claim has been created Successfully    <===>  '  , claimRef);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber =  caseData.legacyCaseReference;
    securityCode = caseData.respondent1PinToPostLRspec.accessCode;
    console.log('claim number', claimNumber);
    console.log('Security code', securityCode);
    await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await ResponseSteps.RespondToClaim(claimRef);
    await ResponseSteps.EnterPersonalDetails(claimRef, carmEnabled);
    await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
    await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
    await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
    await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit);
    await ResponseSteps.EnterWhyYouDisagreeTheClaimAmount(claimRef, partAdmit);
    await ResponseSteps.AddYourTimeLineEvents();
    await ResponseSteps.EnterYourEvidenceDetails();
    await ResponseSteps.EnterPaymentOption(claimRef, partAdmit, 'immediate');
    await ResponseSteps.EnterTelephoneMediationDetails();
    await ResponseSteps.ConfirmAltPhoneDetails();
    await ResponseSteps.ConfirmAltEmailDetails();
    await ResponseSteps.EnterUnavailableDates(claimRef);
    await ResponseSteps.EnterDQForSmallClaims(claimRef);
    await ResponseSteps.CheckAndSubmit(claimRef, partAdmit);
    await ResponseSteps.VerifyConfirmationPage('PartAdmitAndPayImmediately');
  }
}).tag('@regression-carm');

Scenario('LiP Claimant response with Part admit', async () => {
  if (['preview', 'demo'  ].includes(config.runningEnv)) {
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ClaimantResponseSteps.RespondToClaimAsClaimant(claimRef);
    await ClaimantResponseSteps.verifyDefendantResponse();
    await ClaimantResponseSteps.acceptOrRejectDefendantResponse('No');
    await ResponseSteps.EnterTelephoneMediationDetails();
    await ResponseSteps.ConfirmAltPhoneDetails();
    await ResponseSteps.ConfirmAltEmailDetails();
    await ResponseSteps.EnterUnavailableDates(claimRef);
    await ResponseSteps.EnterDQForSmallClaims(claimRef);
    await ClaimantResponseSteps.verifyClaimantMediationDetailsInCYA(claimRef);
    await ClaimantResponseSteps.submitClaimantResponse();
  }
}).tag('@regression-carm');
