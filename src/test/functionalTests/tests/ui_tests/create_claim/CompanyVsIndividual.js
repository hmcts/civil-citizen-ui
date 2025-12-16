const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  hwfSubmission,
  waitForDefendantToRespond,
  hwfNoRemission,
  updateHWFNum
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

let caseData,legacyCaseReference,caseRef,claimInterestFlag,StandardInterest,selectedHWF,claimAmount = 1600,
  claimFee = 115,claimantPartyType = 'Company';

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Company vs Individual').tag('@e2e-create-claim');

Scenario('Create Claim -  Company vs Individual - small claims - no interest - no hwf - GA (Ask for more time)', async ({
  I,
  api
}) => {
  selectedHWF = false;
  claimInterestFlag = false;
  StandardInterest = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  const claimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, claimFeeNotif.title, claimFeeNotif.content);
  await I.click(notification.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
  const waitForDefResponseNotif = await waitForDefendantToRespond();
  await verifyNotificationTitleAndContent(legacyCaseReference, waitForDefResponseNotif.title, waitForDefResponseNotif.content);
  await api.assignToLipDefendant(caseRef);
  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Claimant Org name v mr defendant person', undefined, 'company');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(legacyCaseReference);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Claimant Org name v mr defendant person');
});

Scenario('Create Claim -  Company vs Individual - small claims - with standard interest - no hwf', async ({ I, api }) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = true;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const claimFeeNotif = payClaimFee(claimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, claimFeeNotif.title, claimFeeNotif.content);
  await I.click(notification.nextSteps);
  await steps.verifyAndPayClaimFee(claimAmount, claimFee);
  await api.waitForFinishedBusinessProcess();
  const waitForDefResponseNotif = await waitForDefendantToRespond(caseData.respondent1.partyName, await caseData.respondent1ResponseDeadline);
  await verifyNotificationTitleAndContent(legacyCaseReference, waitForDefResponseNotif.title, waitForDefResponseNotif.content);
});

Scenario('Create Claim -  Company vs Individual - small claims - with variable interest - no hwf', async ({ I, api }) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = false;
  const standardInterestAmount = 10;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(claimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(claimAmount, claimFee, standardInterestAmount);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Create Claim -  Company vs Individual - small claims - with variable interest - with hwf', async ({ api }) => {
  selectedHWF = true;
  claimInterestFlag = true;
  StandardInterest = false;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addCompanyClaimant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF, claimantPartyType);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const hwfSubmissionNotif = hwfSubmission();
  await verifyNotificationTitleAndContent(legacyCaseReference, hwfSubmissionNotif.title, hwfSubmissionNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.updateHWFNumber);
  const updateHWFNumNotif = updateHWFNum();
  await verifyNotificationTitleAndContent(legacyCaseReference, updateHWFNumNotif.title, updateHWFNumNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.noRemission);
  const hwfNoRemissionNotif = hwfNoRemission();
  await verifyNotificationTitleAndContent(legacyCaseReference, hwfNoRemissionNotif.title, hwfNoRemissionNotif.content);
});