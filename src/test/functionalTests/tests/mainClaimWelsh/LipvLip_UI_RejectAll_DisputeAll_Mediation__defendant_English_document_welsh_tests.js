const I = actor();
const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const dontWantMoreTime = 'dontWantMoreTime';
const rejectAll = 'rejectAll';
const sharedData = require('../../sharedData');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
let claimNumber, claimType, claimRef, caseData;

Feature('Create Lip v Lip claim - Rejected All By defendant document welsh').tag('@reject-all');

Scenario('Create Lip v Lip claim - Rejected All By defendant document welsh', async ({api}) => {
  claimType = 'SmallClaims';
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, false, 'Individual');
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  const statusCell = `xpath=//table[contains(@class,"govuk-table")]
                    //tr[.//td[.//a[normalize-space()='${claimNumber}']]]/td[4]`;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('Wait for the defendant to respond.', statusCell);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await ResponseSteps.RespondToClaim(claimRef, 'en');
  await ResponseSteps.EnterPersonalDetails(claimRef, false);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('disputeAll');
  await ResponseSteps.EnterWhyYouDisagree(claimRef);
  await ResponseSteps.AddYourTimeLineEvents();
  await ResponseSteps.EnterYourEvidenceDetails();
  await ResponseSteps.EnterTelephoneMediationDetails();
  await ResponseSteps.ConfirmAltPhoneDetails();
  await ResponseSteps.ConfirmAltEmailDetails();
  await ResponseSteps.EnterUnavailableDates(claimRef);
  await ResponseSteps.EnterDQForSmallClaims(claimRef, true, 'both');
  sharedData.language = 'en';
  await ResponseSteps.CheckAndSubmit(claimRef, rejectAll);
  await I.click('Go to your account');
  await I.wait(5);
  await I.refreshPage();
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The documents are being translated.', statusCell);
  await I.click('Sign out');
  await api.submitUploadTranslatedDoc('DEFENDANT_RESPONSE');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.RejectAllClaimantToProceedResponse(claimRef, claimNumber, 'en');
  await I.click('Go to your account');
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The documents are being translated.', statusCell);
  await I.click('Sign out');
  await api.submitUploadTranslatedDoc('CLAIMANT_INTENTION');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('Your mediation appointment will be arranged within', statusCell);
}).tag('@cui-welsh @regression');
