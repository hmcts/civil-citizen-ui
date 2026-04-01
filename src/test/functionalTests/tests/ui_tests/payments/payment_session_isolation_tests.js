const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const HearingFeeSteps = require('../../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const createGASteps = require('../../../citizenFeatures/GA/steps/createGASteps');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {payTheHearingFeeClaimant, hearingFeePaidFull} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'FastTrack';
const hearingFeeAmount = '619';
let caseData, claimNumber, claimRef, notification, fiveWeeksFromToday, hearingFeeDueDate;

/**
 * DTSCCI-4177: Payment Session Race Condition
 *
 * Old behaviour (bug): Redis key = claimId + userIdForPayment
 *   → concurrent payments (hearing fee + GA fee) on same claim overwrite each other
 *   → user gets "unauthorised" or "Case not found" after completing payment
 *
 * New behaviour (fix): Redis key = claimId + feeType + userIdForPayment
 *   → each fee type has isolated session in Redis
 *
 * These tests verify payment journeys complete without "unauthorised" errors.
 */
Feature('Payment Session Isolation - DTSCCI-4177').tag('@civil-citizen-pr @civil-citizen-nightly @ui-payments');

Before(async ({api}) => {
  fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(10);
  hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
  await api.waitForFinishedBusinessProcess();
});

Scenario('Hearing fee payment redirects to correct confirmation — not unauthorised @payment-session', async ({I, api}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  notification = payTheHearingFeeClaimant(hearingFeeAmount, hearingFeeDueDate);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  await I.click(notification.nextSteps);
  await HearingFeeSteps.payHearingFeeJourney(hearingFeeAmount);
  await api.waitForFinishedBusinessProcess();
  await I.dontSee('Unauthorised');
  await I.dontSee('Something went wrong');
  notification = hearingFeePaidFull();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
});

Scenario('GA fee payment redirects to correct confirmation — not unauthorised @payment-session', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log('Creating GA and paying fee for claim:', claimRef);
  await createGASteps.askToSetAsideJudgementGA(claimRef, 'Miss Jane Doe v Sir John Doe', 'consent');
  await I.dontSee('Unauthorised');
  await I.dontSee('Something went wrong');
});

Scenario('Abandon hearing fee payment, retry — no stale session @payment-session', async ({I, api}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  notification = payTheHearingFeeClaimant(hearingFeeAmount, hearingFeeDueDate);
  await I.click(notification.nextSteps);
  // Abandon — go back to dashboard without completing payment
  await I.amOnPage('/dashboard');
  await I.wait(2);
  await I.click(claimNumber);
  // Retry payment
  await I.click(notification.nextSteps);
  await HearingFeeSteps.payHearingFeeJourney(hearingFeeAmount);
  await api.waitForFinishedBusinessProcess();
  await I.dontSee('Unauthorised');
  await I.dontSee('Something went wrong');
  notification = hearingFeePaidFull();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
});
