const config = require('../../../../config');

const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {
  claimantResponseToTheClaimForJBABySetDate,
  defendantCanSeeAjudgmentHasBeenMadeAgainstYouNotificationforJBA,
  claimantResponseConfirmIfAJudgmentDebtHasBeenPaid,
  defendantViewtheCOSCCertificate,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef, claimNumber, notification, caseData;

Feature('Create Lip v Lip claim -  Judgment by Admissions').tag('@civil-citizen-nightly @ui-jba');

// TODO undo when part payment journey is restored
Scenario('Create LipvLip claim and defendant responded FullAdmit and PayImmediately and Claimant raise Judgment by Admissions', async ({api, I}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  // During Defendant response itself, update the payment deadline to past date
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  //await ClaimantResponseSteps.verifyJudgmentByAdmission(claimRef);
  notification = claimantResponseToTheClaimForJBABySetDate();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await ClaimantResponseSteps.verifyResponseToTheClaimforJBASetDate();
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.waitForFinishedBusinessProcess();
  notification = defendantCanSeeAjudgmentHasBeenMadeAgainstYouNotificationforJBA();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await ResponseToDefenceLipVsLipSteps.ConfirmYouHavePaidAJudgmentCCJDebt(claimRef, claimNumber);
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  notification = claimantResponseConfirmIfAJudgmentDebtHasBeenPaid();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await ResponseToDefenceLipVsLipSteps.ConfirmThatYouHaveBeenpPaidforCoSC(claimRef, claimNumber);
  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await api.waitForFinishedBusinessProcess();
  notification = defendantViewtheCOSCCertificate();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content);
  await I.click(notification.nextSteps);
  await api.waitForFinishedBusinessProcess();
});
