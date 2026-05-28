const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('Create Lip v Lip claim - Default Judgment (Judgment Requested state)').tag('@ui-judgment-buffer');

Scenario('Create LipvLip claim, claimant raise CCJ - buffer banner shown (English + Welsh), claimant and defendant retain dashboard access', async ({I, api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await I.waitForContent('You requested a County Court Judgment', 60);
  // DTSCCI-5058 AC2 - claimant LiP retains same dashboard options as Awaiting Defendant Response state
  await I.see('View the claim');
  await I.see('Contact or apply to the court');
  await I.see('Help with fees');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await I.waitForContent('requested a County Court Judgment against you', 60);
  // DTSCCI-5058 AC3 / DTSCCI-5327 AC3 - defendant LiP retains same dashboard options as Awaiting Defendant Response state
  // Critical: 'Respond to the claim' must remain available so defendant can still submit defence during buffer
  await I.see('Respond to the claim');
  await I.see('View the claim');
  await I.see('Contact or apply to the court');
  await I.see('Help with fees');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/case/' + claimRef + '/ccj/confirmation');
  await I.click('Cymraeg');
  // TODO update Welsh banner to AC text 'Mae cais am ddyfarniad yn erbyn y diffynnydd wedi'i wneud. Byddwch yn cael gwybod pan roddir y dyfarniad hwn.' once dev fixes DTSCCI-5327 Welsh wording defect in cy.json (key JUDGMENT_REQUESTED).
  await I.waitForContent('Mae cais wedi\u2019i wneud am Ddyfarniad Llys Sirol. Byddwch yn cael gwybod pan fydd hyn wedi\u2019i gadarnhau.', 30);
});

Scenario('Defendant submits defence during JUDGMENT_REQUESTED buffer - pending CCJ cancelled, claimant gets cancellation notification (DTSCCI-5101)', async ({I, api}) => {
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();
  await I.click('Sign out');

  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  // DTSCCI-5101 AC5 - NEW cancellation banner for claimant
  await I.waitForContent('The CCJ has been cancelled', 60);
  await I.see('The defendant has now submitted a response. The CCJ you requested has been cancelled.');
  // DTSCCI-5101 AC3 + AC4 - dashboard status message + in-case notification UNCHANGED from defence-from-AWAITING-RESPONDENT flow.
  // TODO baseline-diff: capture these strings from a normal defence flow scenario and compare, instead of hand-asserting.
  await I.see('Response to the claim');
  await I.see('has rejected the claim');
  await I.see('You need to respond by');

  await I.click('Cymraeg');
  await I.waitForContent('Mae\u2019r CCJ wedi cael ei ganslo.', 30);
  await I.see('Mae\u2019r Dyfarniad Llys Sirol wnaethoch ofyn amdano wedi\u2019i ganslo.');
  await I.click('English');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  // DTSCCI-5101 AC3 + AC4 (defendant side) - dashboard tile UNCHANGED from defence-from-AWAITING-RESPONDENT flow
  await I.waitForContent('Response to the claim', 60);
  await I.see('You have rejected the claim');
  await I.see('The court will contact you');
});
