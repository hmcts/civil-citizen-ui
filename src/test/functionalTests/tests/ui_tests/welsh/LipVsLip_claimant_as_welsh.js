const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  respondToClaim,
  defendantResponseFullAdmitPayImmediately,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let caseData,claimNumber,claimRef,claimAmount = 1500,claimFee = 80,deadline = '6 March 2024';
let claimTotalAmount = claimAmount + claimFee;

Feature('Create Lip v Lip claim claimant as welsh -  Full Admit and pay Immediately ').tag('@ui-full-admit');

Scenario('Create LipvLip claim and defendant response as FullAdmit and pay immediately', async ({ I, api }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, false, 'Individual', 'BOTH', true);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  const statusCell = `xpath=//table[contains(@class,"govuk-table")]
                    //tr[.//td[.//a[normalize-space()='${claimNumber}']]]/td[4]`;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await CitizenDashboardSteps.VerifyStatusOnDashboard('The documents are being translated.', statusCell);
  await api.submitUploadTranslatedDoc('CLAIM_ISSUE');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  const respondToClaimNotif = respondToClaim();
  await verifyNotificationTitleAndContent(claimNumber, respondToClaimNotif.title, respondToClaimNotif.content);
  await I.click(respondToClaimNotif.nextSteps);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayImmediateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await api.submitUploadTranslatedDoc('DEFENDANT_RESPONSE');
  const claimantNotification = defendantResponseFullAdmitPayImmediately(claimTotalAmount, deadline);
  await verifyNotificationTitleAndContent(claimNumber, claimantNotification.title, claimantNotification.content);
  await I.click(claimantNotification.nextSteps);
  await I.click('Sign out');
}).tag('@cui-welsh @ui-prod');