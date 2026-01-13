const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const nocSteps = require('../../../lrFeatures/noc/steps/nocSteps.js');
const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  nocForLip,
  nocForLipCaseGoesOffline,
  responseToTheClaim,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, caseData, selectedHWF, legacyCaseReference, defendantName;
const claimType = 'SmallClaims';

Feature('Lip v LR Post Defendant Response e2e Tests').tag('@ui-noc @ui-nightly-prod');

Before(async ({ I, api }) => {
  selectedHWF = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  claimRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
  await api.assignToLipDefendant(claimRef);
});

Scenario('LipVLR - DefendantLip respond as DefenceAll and NoC - Case stays online', async ({
  I,
  api,
}) => {
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  defendantName = await caseData.respondent1.partyName;

  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);

  const responseToTheClaimNotif = responseToTheClaim(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, responseToTheClaimNotif.title, responseToTheClaimNotif.content);
  await I.click(responseToTheClaimNotif.nextSteps);
}).tag('@ui-noc');

Scenario('LipVLR - DefendantLip respond as AdmitAll and NoC - Case goes offline', async ({
  I,
  api,
}) => {
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayBySetDateWithIndividual);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  defendantName = await caseData.respondent1.partyName;

  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipCaseGoesOfflineNotif = nocForLipCaseGoesOffline(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipCaseGoesOfflineNotif.title, nocForLipCaseGoesOfflineNotif.content);
}).tag('@ui-noc');

Scenario('LipVLR - DefendantLR respond as PartAdmit and NoC - Case goes offline', async ({
  I,
  api,
}) => {
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentAsPerInstallmentPlanWithIndividual);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  defendantName = await caseData.respondent1.partyName;

  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipCaseGoesOfflineNotif = nocForLipCaseGoesOffline(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipCaseGoesOfflineNotif.title, nocForLipCaseGoesOfflineNotif.content);
}).tag('@ui-noc');