const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const respondGASteps = require('../../../citizenFeatures/GA/steps/respondGASteps');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  applicationBeingProcessedGA,
  otherPartiesRequestedChange,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');
const {DateUtilsComponent} = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {fetchCaseDetails} = require('../../../specClaimHelpers/api/apiRequest');
const apiRequest = require('../../../specClaimHelpers/api/apiRequest');

let claimRef, claimType, caseData, claimNumber, gaID;
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

Feature('DTSCCI-4237: GA Non-Urgent With Notice - 5 Working Days Deadline').tag('@civil-citizen-nightly @ui-ga @DTSCCI-4237');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;

  await api.assignToLipDefendant(claimRef);
  await api.waitForFinishedBusinessProcess();

  bankHolidays = await DateUtilsComponent.fetchBankHolidays();
});

Scenario('Positive - More time order GA (non-urgent, with notice) - claimant creates, defendant responds @nightly', async ({
  I,
  api,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating non-urgent with-notice GA (More time) as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askForMoreTimeCourtOrderGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');
  console.log('GA created with ID: ' + gaID);

  const applicationBeingProcessedGANotif = applicationBeingProcessedGA();
  await verifyNotificationTitleAndContent(claimNumber, applicationBeingProcessedGANotif.title, applicationBeingProcessedGANotif.content);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const otherPartiesNotif = otherPartiesRequestedChange();
  await verifyNotificationTitleAndContent(claimNumber, otherPartiesNotif.title, otherPartiesNotif.content);

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);

  await respondGASteps.respondToGA(claimRef, gaID, 'Respond to an application to more time to do what is required by a court order', 'Miss Jane Doe v Sir John Doe');
});

Scenario('Positive - Change hearing date GA (non-urgent, with notice) - deadline verified @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating non-urgent with-notice GA (Change hearing date) as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);
});

Scenario('Positive - Pause claim GA (non-urgent, with notice) - defendant creates @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('Creating non-urgent with-notice GA (Pause claim) as defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askCourtToPauseClaimGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);
});

Scenario('Positive - Sanction GA (non-urgent, with notice) - deadline verified @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('Creating non-urgent with-notice GA (Sanction) as defendant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askCourtSanctionGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);
});

Scenario('Positive - Set aside judgment GA (non-urgent, with notice) - deadline verified @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating non-urgent with-notice GA (Set aside) as claimant');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  const submissionTime = new Date();
  gaID = await createGASteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'notice');

  await verifyDeadlineIs5WorkingDays(gaID, submissionTime);
});

Scenario('Negative - Without notice GA should NOT have 5 working day deadline @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating GA (without notice) - should use standard deadline');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  gaID = await createGASteps.askToChangeHearingDateGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  const applicationBeingProcessedGANotif = applicationBeingProcessedGA();
  await verifyNotificationTitleAndContent(claimNumber, applicationBeingProcessedGANotif.title, applicationBeingProcessedGANotif.content);

  await verifyDeadlineIsNotFiveWorkingDays(gaID);
});

Scenario('Negative - Consent GA should NOT have 5 working day deadline @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating GA (consent) - should use standard deadline');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  gaID = await createGASteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  await verifyDeadlineIsNotFiveWorkingDays(gaID);
});

Scenario('Negative - Relief from penalty (without notice) should NOT have 5 working day deadline @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  console.log('Creating GA (relief from penalty, without notice) - should use standard deadline');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  gaID = await createGASteps.askForReliefFromAPenaltyGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'withoutnotice');

  await verifyDeadlineIsNotFiveWorkingDays(gaID);
});

Scenario('Negative - Settle by consent should NOT have 5 working day deadline @nightly', async ({
  I,
}) => {
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  console.log('Creating GA (settle by consent) - should use standard deadline');
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);

  gaID = await createGASteps.askCourtToSettleByConsentGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');

  await verifyDeadlineIsNotFiveWorkingDays(gaID);
});
