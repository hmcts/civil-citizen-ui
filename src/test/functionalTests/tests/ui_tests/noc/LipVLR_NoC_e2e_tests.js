const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const nocSteps = require('../../../lrFeatures/noc/steps/nocSteps.js');
const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  nocForLip,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let claimRef, caseData, selectedHWF, legacyCaseReference, defendantName, camundaEvent, expectedState;

Feature('Lip v LR e2e Tests').tag('@ui-nightly-prod @ui-noc');

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
  defendantName = await caseData.respondent1.partyName;
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
  await api.assignToLipDefendant(claimRef);
});

Scenario('LipVLR - NoC and DefendantLR respond as DefenceAll', async ({
  I,
  api,
}) => {
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);

  camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
  expectedState = 'AWAITING_APPLICANT_INTENTION';
  await api.defendantLRResponse(config.defendantSolicitorUser, 'FULL_DEFENCE', camundaEvent, expectedState);
}).tag('@civil-citizen-master @civil-citizen-pr');

Scenario('LipVLR - NoC and DefendantLR respond as AdmitAll', async ({
  I,
  api,
}) => {
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);

  camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
  expectedState = 'PROCEEDS_IN_HERITAGE_SYSTEM';
  await api.defendantLRResponse(config.defendantSolicitorUser, 'FULL_ADMISSION', camundaEvent, expectedState);
});

Scenario('LipVLR - NoC and DefendantLR respond as PartAdmit', async ({
  I,
  api,
}) => {
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);

  camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
  expectedState = 'PROCEEDS_IN_HERITAGE_SYSTEM';
  await api.defendantLRResponse(config.defendantSolicitorUser, 'PART_ADMISSION', camundaEvent, expectedState);
});

Scenario('LipVLR - NoC and DefendantLR respond as CounterClaim', async ({
  I,
  api,
}) => {
  await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
  await api.checkUserCaseAccess(config.defendantCitizenUser, false);
  await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);

  const nocForLipNotif = nocForLip(defendantName);
  await verifyNotificationTitleAndContent(legacyCaseReference, nocForLipNotif.title, nocForLipNotif.content);
  await I.click(nocForLipNotif.nextSteps);

  camundaEvent = 'APPLY_NOC_DECISION_DEFENDANT_LIP';
  expectedState = 'PROCEEDS_IN_HERITAGE_SYSTEM';
  await api.defendantLRResponse(config.defendantSolicitorUser, 'COUNTER_CLAIM', camundaEvent, expectedState);
});