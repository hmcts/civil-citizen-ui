const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  hwfSubmission,
  updateHWFNum,
  hwfMoreInfoRequired,
  hwfFullRemission,
  waitForDefendantToRespond,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData,legacyCaseReference,caseRef,claimNumber,claimInterestFlag,StandardInterest,selectedHWF,
  claimAmount = 1600, claimFee = 115;

const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');

Feature('Create Lip v Lip claim - Individual vs Individual').tag('@ui-create-claim @civil-citizen-nightly');

Scenario('Create Claim -  Individual vs Individual - small claims - no interest - no hwf - GA (Ask for more time)', async ({
  I,
  api,
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
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  claimNumber = await caseData.legacyCaseReference;
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
  await api.assignToLipDefendant(caseRef);
  console.log('Creating GA app as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v mr defendant person');
  console.log('Creating GA app as defendant');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await createGASteps.askForMoreTimeCourtOrderGA(caseRef, 'Mr Claimant person v mr defendant person');
});

Scenario('Create Claim -  Individual vs Individual - small claims - with standard interest - no hwf', async ({
  I,
  api,
}) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = true;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(claimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(claimAmount, claimFee);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Create Claim -  Individual vs Individual - small claims - with variable interest - no hwf', async ({
  I,
  api,
}) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = false;
  const interestAmount = 10;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(claimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await api.waitForFinishedBusinessProcess();
  await steps.verifyAndPayClaimFee(claimAmount, claimFee, interestAmount);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Create Claim -  Individual vs Individual - small claims - with variable interest - with hwf', async ({ api }) => {
  selectedHWF = true;
  claimInterestFlag = true;
  StandardInterest = false;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const hwfSubmissionNotif = hwfSubmission();
  await verifyNotificationTitleAndContent(legacyCaseReference, hwfSubmissionNotif.title, hwfSubmissionNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.updateHWFNumber);
  const updateHWFNumNotif = updateHWFNum();
  await verifyNotificationTitleAndContent(legacyCaseReference, updateHWFNumNotif.title, updateHWFNumNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.moreInfoHWF);
  const hwfMoreInfoRequiredNotif = hwfMoreInfoRequired();
  await verifyNotificationTitleAndContent(legacyCaseReference, hwfMoreInfoRequiredNotif.title, hwfMoreInfoRequiredNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.fullRemission);
  const hwfFullRemissionNotif = hwfFullRemission(claimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, hwfFullRemissionNotif.title, hwfFullRemissionNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.feePayOutcome);
  const waitForDefResponseNotif = await waitForDefendantToRespond();
  await verifyNotificationTitleAndContent(legacyCaseReference, waitForDefResponseNotif.title, waitForDefResponseNotif.content);
}).tag('@civil-citizen-master @civil-citizen-pr');