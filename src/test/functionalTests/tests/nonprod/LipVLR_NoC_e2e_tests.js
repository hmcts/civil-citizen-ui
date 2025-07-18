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
} = require('../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, caseData, selectedHWF, legacyCaseReference, defendantName, isDashboardServiceEnabled, camundaEvent, expectedState;

Feature('Lip v LR e2e Tests').tag('@api @noc @regression');

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
    defendantName = await caseData.respondent1.partyName;
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

Scenario('LipVLR - NoC and DefendantLR respond as DefenceAll @citizenUI @noc', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
    expectedState = 'AWAITING_APPLICANT_INTENTION';
    await api.defendantLRResponse(config.defendantSolicitorUser, 'FULL_DEFENCE', camundaEvent, expectedState);
  }
});

Scenario('LipVLR - NoC and DefendantLR respond as AdmitAll @citizenUI @noc', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
    expectedState = 'PROCEEDS_IN_HERITAGE_SYSTEM';
    await api.defendantLRResponse(config.defendantSolicitorUser, 'FULL_ADMISSION', camundaEvent, expectedState);
  }
});

Scenario('LipVLR - NoC and DefendantLR respond as PartAdmit @citizenUI - @api @noc @nightly', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
    expectedState = 'PROCEEDS_IN_HERITAGE_SYSTEM';
    await api.defendantLRResponse(config.defendantSolicitorUser, 'PART_ADMISSION', camundaEvent, expectedState);
  }
});

Scenario('LipVLR - NoC and DefendantLR respond as CounterClaim @citizenUI - @api @noc @nightly', async ({
  I,
  api,
}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
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

    camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
    expectedState = 'PROCEEDS_IN_HERITAGE_SYSTEM';
    await api.defendantLRResponse(config.defendantSolicitorUser, 'COUNTER_CLAIM', camundaEvent, expectedState);
  }
});
