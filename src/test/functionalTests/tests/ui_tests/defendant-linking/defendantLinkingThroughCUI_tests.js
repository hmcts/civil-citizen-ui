const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const DefendantLinkingSteps = require('../../../caseworkerFeatures/defendantLinking/steps/defendantLinkingSteps');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {respondToClaim, defendantResponseFullAdmitPayImmediately} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
const claimAmount = 1500;
const claimFee = 80;
const deadline = '6 March 2024';
const claimTotalAmount = claimAmount + claimFee;

Feature('Defendant linking through CUI').tag('@civil-citizen-master ', '@civil-citizen-pr ','@civil-citizen-nightly ', '@ui-defendant-linking ', '@ui-full-admit @krishna');

Scenario.only('CTSC admin links a defendant to a LiP claim through CUI', async ({I, api}) => {
  // Create temporary claimant and defendant users.
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  /*
     * Create the claim without assigning the defendant through API.
     * The final false skips the existing API defendant assignment.
     */
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, false, 'Individual', undefined, false, false);

  const caseData = await api.retrieveCaseData(config.adminUser, claimRef);

  const claimNumber = caseData.legacyCaseReference;

  // Link the temporary defendant through Manage Case CUI.
  await DefendantLinkingSteps.LinkDefendantToClaimThroughCUI(claimRef, config.defendantCitizenUser.email);

  // Log in using the same temporary defendant account.
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  // Verify that the linked claim appears on the dashboard.
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);

  // Continue the Full Admit and pay immediately journey.
  const respondToClaimNotif = respondToClaim();

  await verifyNotificationTitleAndContent(claimNumber, respondToClaimNotif.title, respondToClaimNotif.content);

  await I.click(respondToClaimNotif.nextSteps);

  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayImmediateWithIndividual);

  await api.waitForFinishedBusinessProcess();

  const defendantFullAdmitPayImmediatelyNotif =
      defendantResponseFullAdmitPayImmediately(
        claimTotalAmount,
        deadline,
      );

  await verifyNotificationTitleAndContent(
    claimNumber,
    defendantFullAdmitPayImmediatelyNotif.title,
    defendantFullAdmitPayImmediatelyNotif.content,
  );

  await I.click(
    defendantFullAdmitPayImmediatelyNotif.nextSteps,
  );

  await I.click('Sign out');},
);
