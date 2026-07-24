const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../../../citizenFeatures/response/steps/lipClaimantResponseSteps');
const {checkToggleEnabled} = require('../../../specClaimHelpers/api/testingSupport');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const dashboardNotifications = require('../../../specClaimHelpers/dashboardNotificationConstants');
const chai = require('chai');

const {assert} = chai;
const claimType = 'SmallClaims';
const claimantCCJRequestedTemplateId = 'edf3ac20-fb30-43ac-a0fd-dc72f9f37aaf';
const claimantCCJRequestedWelshTemplateId = '730f4e11-3cb0-43a7-aeeb-8373a28fbc1d';
// eslint-disable-next-line no-unused-vars
let claimRef, caseData, claimNumber;

Feature('Create Lip v Lip claim - Default Judgment (Judgment Requested state)').tag('@ui-judgment-buffer');

Scenario('Judgment Requested buffer notifications after a CCJ is requested - DTSCCI-5096 AC1-AC5 (English + Welsh)', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  const defendantName = await caseData.respondent1.partyName;
  const claimantName = await caseData.applicant1.partyName;
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  const claimantEmail = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    templateId: claimantCCJRequestedTemplateId,
    timeoutMs: 45000,
  });
  assert.equal(claimantEmail.templateId, claimantCCJRequestedTemplateId);
  await api.assertNoEmailSent(claimNumber, {
    recipientEmail: config.defendantCitizenUser.email,
    templateId: claimantCCJRequestedTemplateId,
    withinMs: 5000,
  });

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/claimant');
  await I.waitForContent('You requested a County Court Judgment against ' + defendantName, 60);
  const ac2 = dashboardNotifications.ccjRequestedBufferClaimant();
  await verifyNotificationTitleAndContent(claimNumber, ac2.title, ac2.content, claimRef);
  await I.see('View the claim');
  await I.see('Contact or apply to the court');
  await I.see('Help with fees');
  await I.click('Cymraeg');
  await I.waitForContent('Ddyfarniad Llys Sirol yn erbyn ' + defendantName, 30);
  const ac2Welsh = dashboardNotifications.ccjRequestedBufferClaimantWelsh();
  await verifyNotificationTitleAndContent(claimNumber, ac2Welsh.title, ac2Welsh.content, claimRef);
  await I.click('English');

  await I.click('Sign out');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard/' + claimRef + '/defendant');
  await I.waitForContent(claimantName + ' requested a County Court Judgment against you', 60);
  const ac5 = dashboardNotifications.ccjRequestedBufferDefendant();
  await verifyNotificationTitleAndContent(claimNumber, ac5.title, ac5.content, claimRef);
  await I.see('Respond to the claim');
  await I.see('View the claim');
  await I.see('Contact or apply to the court');
  await I.see('Help with fees');
  await I.click('Cymraeg');
  await I.waitForContent('Ddyfarniad Llys Sirol yn eich erbyn', 30);
  const ac5Welsh = dashboardNotifications.ccjRequestedBufferDefendantWelsh();
  await verifyNotificationTitleAndContent(claimNumber, ac5Welsh.title, ac5Welsh.content, claimRef);
  await I.click('English');

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

Scenario('AC3 (Welsh) - claimant who opted into Welsh receives the bilingual judgment-requested email when a CCJ is requested', async ({I, api}) => {
  if (!(await checkToggleEnabled('judgment-buffer'))) return;
  config.claimantCitizenUser.email = `claimantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  config.defendantCitizenUser.email = `defendantcitizen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@gmail.com`;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, false, 'Individual', 'BOTH', true);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await api.submitUploadTranslatedDoc('CLAIM_ISSUE');
  await api.amendRespondent1ResponseDeadline(config.systemUpdate2);

  await I.amOnPage('/dashboard?lang=en');
  await I.wait(2);
  await ClaimantResponseSteps.verifyDefaultJudgmentBuffer(claimRef);
  await api.waitForFinishedBusinessProcess();

  const welshEmail = await api.assertEmailSent(claimNumber, {
    recipientEmail: config.claimantCitizenUser.email,
    templateId: claimantCCJRequestedWelshTemplateId,
    timeoutMs: 45000,
  });
  assert.equal(welshEmail.templateId, claimantCCJRequestedWelshTemplateId);
  await api.assertNoEmailSent(claimNumber, {
    recipientEmail: config.defendantCitizenUser.email,
    templateId: claimantCCJRequestedWelshTemplateId,
    withinMs: 5000,
  });
});
