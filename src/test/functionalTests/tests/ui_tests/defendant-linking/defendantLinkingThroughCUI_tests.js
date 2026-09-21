const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const DefendantLinkingSteps = require('../../../caseworkerFeatures/defendantLinking/steps/defendantLinkingSteps');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {respondToClaim, defendantResponseFullAdmitPayImmediately} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
let claimAmount = 1500, claimFee = 80, deadline = '6 March 2024';
let claimTotalAmount = claimAmount + claimFee;

Feature('Defendant linking through CUI').tag('@civil-citizen-pr');

Scenario.skip('CTSC admin links a defendant to a LiP claim through Manage Case', async ({I, api}) => {
  const {claimantUser, defendantUser} = await createScenarioUsers();

  const claimRef = await api.createLiPClaim(claimantUser, claimType, false, 'Individual', undefined, false, false);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;

  await DefendantLinkingSteps.LinkDefendantToClaimAsCTSCAdmin(claimRef, defendantUser.email);
  await LoginSteps.EnterCitizenCredentials(defendantUser.email, defendantUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);

  await completeFullAdmitPayImmediatelyJourney(I, api, claimRef, claimNumber, defendantUser);
});

Scenario('Defendant links a LiP claim using claim number and security code through CUI', async ({I, api}) => {
  const {claimantUser, defendantUser} = await createScenarioUsers();

  const claimRef = await api.createLiPClaim(claimantUser, claimType, false, 'Individual', undefined, false, false);
  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;
  const securityCode = caseData.respondent1PinToPostLRspec?.accessCode;

  if (!securityCode) {
    throw new Error(`Security code was not generated for case ${claimRef}`);
  }

  const loggedInBeforeSecurityCode =
    await ResponseSteps.AssignCaseToLipSupportingBothJourneys(
      claimNumber,
      securityCode,
      defendantUser,
    );

  if (loggedInBeforeSecurityCode) {
    /*
     * HMCTS Access journey:
     * Login already happened before entering the security code.
     */
    await I.amOnPage('/dashboard');
  } else {
    /*
     * Legacy journey:
     * Security code was entered before authentication.
     */
    await LoginSteps.EnterCitizenCredentials(
      defendantUser.email,
      defendantUser.password,
      true,
    );
  }
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
  await completeFullAdmitPayImmediatelyJourney(I, api, claimRef, claimNumber, defendantUser);
}).tag('@thin-full-stack');

async function createScenarioUsers() {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const claimantUser = {
    ...config.claimantCitizenUser,
    email: createUniqueEmail(config.claimantCitizenUser.email, `claimantcitizen-${uniqueId}`),
  };

  const defendantUser = {
    ...config.defendantCitizenUser,
    email: createUniqueEmail(config.defendantCitizenUser.email, `defendantcitizen-${uniqueId}`),
  };

  await createAccount(claimantUser.email, claimantUser.password);
  await createAccount(defendantUser.email, defendantUser.password);

  return {claimantUser, defendantUser};
}

function createUniqueEmail(baseEmail, uniqueLocalPart) {
  const emailParts = baseEmail.split('@');

  if (emailParts.length !== 2) {
    throw new Error(`Invalid test-user email configured: ${baseEmail}`);
  }

  return `${uniqueLocalPart}@${emailParts[1]}`;
}

async function completeFullAdmitPayImmediatelyJourney(I, api, claimRef, claimNumber, defendantUser) {
  const respondToClaimNotif = respondToClaim();

  await verifyNotificationTitleAndContent(claimNumber, respondToClaimNotif.title, respondToClaimNotif.content);
  await I.click(respondToClaimNotif.nextSteps);

  await api.performCitizenResponse(
    defendantUser,
    claimRef,
    claimType,
    config.defenceType.admitAllPayImmediateWithIndividual,
  );

  await api.waitForFinishedBusinessProcess();

  const defendantFullAdmitPayImmediatelyNotif = defendantResponseFullAdmitPayImmediately(claimTotalAmount, deadline);

  await verifyNotificationTitleAndContent(
    claimNumber,
    defendantFullAdmitPayImmediatelyNotif.title,
    defendantFullAdmitPayImmediatelyNotif.content,
  );

  await I.click(defendantFullAdmitPayImmediatelyNotif.nextSteps);
  await I.click('Sign out');
}
