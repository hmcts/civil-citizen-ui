const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const nocSteps = require('../../lrFeatures/noc/steps/nocSteps.js');
const steps = require('../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const {verifyNotificationTitleAndContent} = require('../../specClaimHelpers/e2e/dashboardHelper');
const {isDashboardServiceToggleEnabled} = require('../../specClaimHelpers/api/testingSupport');
const {
  payClaimFee,
  nocForLip,
  nocForLipCaseGoesOffline,
  responseToTheClaim,
} = require('../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, caseData, selectedHWF, legacyCaseReference, defendantName, isDashboardServiceEnabled;
const claimType = 'SmallClaims';

Feature('Lip v LR Post Defendant Response e2e Tests').tag('@nightly');

Before(async ({I, api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    selectedHWF = false;
    const defaultClaimFee = 455;
    const defaultClaimAmount = 9000;
    isDashboardServiceEnabled = await isDashboardServiceToggleEnabled();
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await steps.createClaimDraftViaTestingSupport();
    claimRef = await steps.checkAndSubmit(selectedHWF);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    legacyCaseReference = await caseData.legacyCaseReference;
    await api.setCaseId(claimRef);
    await api.waitForFinishedBusinessProcess();
    if (isDashboardServiceEnabled) {
      const notification = payClaimFee(defaultClaimFee);
      await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
      await I.click(notification.nextSteps);
    } else {
      await steps.clickPayClaimFee();
    }
    await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
    await api.waitForFinishedBusinessProcess();
    await api.assignToLipDefendant(claimRef);
  }
});

Scenario('LipVLR - DefendantLip respond as DefenceAll and NoC - Case stays online @citizenUI', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    if (isDashboardServiceEnabled) {
      const notification = nocForLip(defendantName);
      await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }

    if (isDashboardServiceEnabled) {
      const notification = responseToTheClaim(defendantName);
      await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
      await I.click(notification.nextSteps);
    }
  }
});

Scenario('LipVLR - DefendantLip respond as AdmitAll and NoC - Case goes offline @citizenUI', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    if (isDashboardServiceEnabled) {
      const notification = nocForLipCaseGoesOffline(defendantName);
      await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
    }
  }
});

Scenario('LipVLR - DefendantLR respond as PartAdmit and NoC - Case goes offline @citizenUI', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    if (isDashboardServiceEnabled) {
      const notification = nocForLipCaseGoesOffline(defendantName);
      await verifyNotificationTitleAndContent(legacyCaseReference, notification.title, notification.content);
    }
  }
});
