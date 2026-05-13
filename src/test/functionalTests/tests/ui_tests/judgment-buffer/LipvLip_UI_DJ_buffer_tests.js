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
  await I.amOnPage('/dashboard');
  await I.waitForText(claimNumber, 60);
  await I.see('You requested a County Court Judgment');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.waitForText(claimNumber, 60);
  await I.see('requested a County Court Judgment against you');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/case/' + claimRef + '/ccj/confirmation');
  await I.click('Cymraeg');
  await I.waitForContent('Mae cais wedi\u2019i wneud am Ddyfarniad Llys Sirol. Byddwch yn cael gwybod pan fydd hyn wedi\u2019i gadarnhau.', 30);
});
