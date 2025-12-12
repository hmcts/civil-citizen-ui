const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
const nocSteps = require('../../../lrFeatures/noc/steps/nocSteps');
const { nocForLip } = require('../../../specClaimHelpers/dashboardNotificationConstants');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType;
let caseData;
let claimNumber, defendantName;

Feature('Response with RejectAll-AlreadyPaid-InFull - Small Claims & Fast Track').tag('@reject-all @nightly-prod');

Scenario('Response with RejectAll-AlreadyPaid-InFull Small claims and Claimant settle', async ({ api }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllAlreadyPaidInFullWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  // One of the step in the below method is commented until https://tools.hmcts.net/jira/browse/CIV-13496 is fixed
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceAlreadyPaidInFull(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Response with RejectAll-AlreadyPaid-InFull Fast Track and Claimant proceeds', async ({ I, api }) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  defendantName = await caseData.respondent1.partyName;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllAlreadyPaidInFullWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceAlreadyPaidInFull(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await nocSteps.requestNoticeOfChangeForRespondent1Solicitor(claimRef, defendantName, config.defendantSolicitorUser);
    await api.checkUserCaseAccess(config.defendantCitizenUser, false);
    await api.checkUserCaseAccess(config.defendantSolicitorUser, true);

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await I.amOnPage('/dashboard');
    await I.click(claimNumber);

    const nocForLipNotif = nocForLip(defendantName);
    await verifyNotificationTitleAndContent(claimNumber, nocForLipNotif.title, nocForLipNotif.content);
    await I.click(nocForLipNotif.nextSteps);
  }
});