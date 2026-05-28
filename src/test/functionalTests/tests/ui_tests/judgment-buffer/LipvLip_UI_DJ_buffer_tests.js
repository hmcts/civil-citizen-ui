const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('Create Lip v Lip claim - Default Judgment (Judgment Requested state)').tag('@ui-judgment-buffer');

Scenario('Create LipvLip claim, claimant raise CCJ - buffer banner shown (English + Welsh), claimant and defendant retain dashboard access', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
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
  await I.see('View the claim');
  await I.see('Contact or apply to the court');
  await I.see('Help with fees');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await I.waitForContent('requested a County Court Judgment against you', 60);
  await I.see('Respond to the claim');
  await I.see('View the claim');
  await I.see('Contact or apply to the court');
  await I.see('Help with fees');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/case/' + claimRef + '/ccj/confirmation');
  await I.click('Cymraeg');
  await I.waitForContent('Mae cais wedi’i wneud am Ddyfarniad Llys Sirol. Byddwch yn cael gwybod pan fydd hyn wedi’i gadarnhau.', 30);
});

Scenario('Defendant submits defence during JUDGMENT_REQUESTED buffer - pending CCJ cancelled, claimant gets cancellation notification (DTSCCI-5101)', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
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
  await I.waitForContent('The CCJ has been cancelled', 60);
  await I.see('The defendant has now submitted a response. The CCJ you requested has been cancelled.');
  await I.see('Response to the claim');
  await I.see('has rejected the claim');
  await I.see('You need to respond by');

  await I.click('Cymraeg');
  await I.waitForContent('Mae’r CCJ wedi cael ei ganslo.', 30);
  await I.see('Mae’r Dyfarniad Llys Sirol wnaethoch ofyn amdano wedi’i ganslo.');
  await I.click('English');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await I.waitForContent('Response to the claim', 60);
  await I.see('You have rejected the claim');
  await I.see('The court will contact you');
});
