const steps = require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  payClaimFee,
  updateHWFNum,
  hwfSubmission,
  hwfPartRemission,
  waitForDefendantToRespond
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData,legacyCaseReference,caseRef,claimInterestFlag,StandardInterest,selectedHWF,claimAmount = 1600,
  claimFee = 115;

Feature('Create Lip v Lip claim - SoleTrader vs Individual').tag('@create-claim');

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - no interest - no hwf', async ({ I, api }) => {
  selectedHWF = false;
  claimInterestFlag = false;
  StandardInterest = false;
  const defaultClaimFee = 455;
  const defaultClaimAmount = 9000;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addSoleTraderClaimant();
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await caseData.respondent1ResponseDeadline;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(defaultClaimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(defaultClaimAmount, defaultClaimFee);
  await api.waitForFinishedBusinessProcess();
});

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - with standard interest - no hwf', async ({
  I,
  api
}) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = true;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addSoleTraderClaimant();
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

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - with variable interest - no hwf', async ({
  I,
  api
}) => {
  selectedHWF = false;
  claimInterestFlag = true;
  StandardInterest = false;
  const standardInterestAmount = 10;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addSoleTraderClaimant();
  await steps.updateClaimAmount(claimAmount, claimInterestFlag, StandardInterest, selectedHWF);
  caseRef = await steps.checkAndSubmit(selectedHWF);
  caseData = await api.retrieveCaseData(config.adminUser, caseRef);
  legacyCaseReference = await caseData.legacyCaseReference;
  await api.setCaseId(caseRef);
  await api.waitForFinishedBusinessProcess();
  const payClaimFeeNotif = payClaimFee(claimFee);
  await verifyNotificationTitleAndContent(legacyCaseReference, payClaimFeeNotif.title, payClaimFeeNotif.content);
  await I.click(payClaimFeeNotif.nextSteps);
  await steps.verifyAndPayClaimFee(claimAmount, claimFee, standardInterestAmount);
  await api.waitForFinishedBusinessProcess();
}).tag('@e2e-prod');

Scenario('Create Claim -  SoleTrader vs Individual - Fast Track - with variable interest - with hwf', async ({ api }) => {
  selectedHWF = true;
  claimInterestFlag = true;
  StandardInterest = false;
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await steps.createClaimDraftViaTestingSupport();
  await steps.addSoleTraderClaimant();
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
  await api.submitHwfEventForUser(config.hwfEvents.partRemission);
  const hwfPartRemissionNotif = hwfPartRemission();
  await verifyNotificationTitleAndContent(legacyCaseReference, hwfPartRemissionNotif.title, hwfPartRemissionNotif.content);
  await api.submitHwfEventForUser(config.hwfEvents.feePayOutcome);
  const waitForDefRespondNotif = await waitForDefendantToRespond();
  await verifyNotificationTitleAndContent(legacyCaseReference, waitForDefRespondNotif.title, waitForDefRespondNotif.content);
});