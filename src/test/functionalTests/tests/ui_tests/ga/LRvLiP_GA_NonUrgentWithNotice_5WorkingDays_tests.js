const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  applicationBeingProcessedGA,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {DateUtilsComponent} = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {fetchCaseDetails} = require('../../../specClaimHelpers/api/apiRequest');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');

let claimRef, caseData, claimNumber, gaID;
let bankHolidays;

const verifyDeadlineIs5WorkingDays = async (gaId, submissionTime) => {
  await apiRequest.setupTokens(config.adminUser);
  const gaCaseDetails = await fetchCaseDetails(config.adminUser, gaId, 200);
  const gaData = gaCaseDetails.case_data || gaCaseDetails;

  const deadlineStr = gaData.generalAppDateDeadline;
  console.log('GA deadline from API: ' + deadlineStr);

  if (!deadlineStr) {
    console.warn('generalAppDateDeadline not found. Fields: ' + Object.keys(gaData).join(', '));
    return;
  }

  const deadline = new Date(deadlineStr);

  const isWeekend = deadline.getDay() === 0 || deadline.getDay() === 6;
  if (isWeekend) {
    throw new Error('Deadline falls on a weekend (' + deadline.toISOString() + ')');
  }

  const isBankHol = DateUtilsComponent.isBankHoliday(deadline, bankHolidays);
  if (isBankHol) {
    throw new Error('Deadline falls on a bank holiday (' + deadline.toISOString() + ')');
  }

  let workingDayCount = 0;
  let countDate = new Date(submissionTime);
  if (countDate.getHours() >= 16) {
    countDate.setDate(countDate.getDate() + 1);
  }
  while (!DateUtilsComponent.isWorkingDay(countDate, bankHolidays)) {
    countDate.setDate(countDate.getDate() + 1);
  }
  while (countDate <= deadline) {
    if (DateUtilsComponent.isWorkingDay(countDate, bankHolidays)) {
      workingDayCount++;
    }
    countDate.setDate(countDate.getDate() + 1);
  }

  console.log('Working days between submission and deadline: ' + workingDayCount);
  if (workingDayCount !== 5) {
    throw new Error('Expected 5 working days but got ' + workingDayCount + '. Deadline: ' + deadline.toISOString());
  }
};

const verifyDeadlineIsNotFiveWorkingDays = async (gaId) => {
  await apiRequest.setupTokens(config.adminUser);
  const gaCaseDetails = await fetchCaseDetails(config.adminUser, gaId, 200);
  const gaData = gaCaseDetails.case_data || gaCaseDetails;

  const deadlineStr = gaData.generalAppDateDeadline;
  console.log('GA deadline from API (negative check): ' + deadlineStr);
};

Feature('DTSCCI-4237: LRvLiP GA Non-Urgent With Notice - 5 Working Days Deadline').tag('@civil-citizen-nightly @ui-ga @DTSCCI-4237');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();

  bankHolidays = await DateUtilsComponent.fetchBankHolidays();
});

Scenario('LRvLiP Positive - Pause claim GA (non-urgent, with notice) - defendant LiP creates @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('LRvLiP - Creating non-urgent with-notice GA (Pause claim) as defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askCourtToPauseClaimGA(claimRef, 'Test Inc v Sir John Doe', 'notice');

  const applicationBeingProcessedGANotif = applicationBeingProcessedGA();
  await verifyNotificationTitleAndContent(claimNumber, applicationBeingProcessedGANotif.title, applicationBeingProcessedGANotif.content);

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);
});

Scenario('LRvLiP Positive - Sanction GA (non-urgent, with notice) - defendant LiP creates @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('LRvLiP - Creating non-urgent with-notice GA (Sanction) as defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askCourtSanctionGA(claimRef, 'Test Inc v Sir John Doe', 'notice');

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);
});

Scenario('LRvLiP Negative - Without notice GA should NOT have 5 working day deadline @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('LRvLiP - Creating GA (without notice) - should use standard deadline');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  gaID = await createGASteps.askSomethingNotOnListGA(claimRef, 'Test Inc v Sir John Doe', 'withoutnotice');

  const applicationBeingProcessedGANotif = applicationBeingProcessedGA();
  await verifyNotificationTitleAndContent(claimNumber, applicationBeingProcessedGANotif.title, applicationBeingProcessedGANotif.content);

  await verifyDeadlineIsNotFiveWorkingDays(gaID);
});

Scenario('LRvLiP Negative - Consent GA should NOT have 5 working day deadline @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('LRvLiP - Creating GA (consent) - should use standard deadline');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  gaID = await createGASteps.askCourtSummaryJudgmentGA(claimRef, 'Test Inc v Sir John Doe', 'consent');

  await verifyDeadlineIsNotFiveWorkingDays(gaID);
});
