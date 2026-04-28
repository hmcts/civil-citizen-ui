const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const HearingFeeSteps = require('../../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {verifyNotificationTitleAndContent} = require('../../../specClaimHelpers/e2e/dashboardHelper');
const {
  hearingScheduled,
  payTheHearingFeeClaimant,
  hearingFeePaidFull,
  goToHearingClaimant,
  orderMade,
} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'FastTrack';
const feeAmount = '619';
let caseData, claimNumber, claimRef, notification, fiveWeeksFromToday, hearingFeeDueDate, hearingDate;

Feature('Dashboard notification delete - regression sentinel for OptimisticLockException fix - DTSCCI-5278')
  .tag('@civil-citizen-nightly @ui-notifications @DTSCCI-5278');

Scenario('Hearing fee paid clears the "Pay the hearing fee" notification and shows "Hearing fee paid"', async ({I, api}) => {
  fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(10);
  hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
  hearingDate = DateUtilsComponent.DateUtilsComponent.formatDateToSpecifiedDateFormat(fiveWeeksFromToday);
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
  await api.performCaseProgressedToSDO(config.judgeUserWithRegionId2, claimRef, 'fastTrack');
  await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId2, claimRef,
    DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
  await api.waitForFinishedBusinessProcess();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);

  notification = hearingScheduled(hearingDate);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
  notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);

  await I.click(notification.nextSteps);
  await HearingFeeSteps.payHearingFeeJourney(feeAmount);
  await api.waitForFinishedBusinessProcess();

  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  notification = payTheHearingFeeClaimant(feeAmount, hearingFeeDueDate);
  await I.dontSee(notification.title);
  notification = hearingFeePaidFull();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
});

Scenario('Order made clears the judicial referral notification on claimant and defendant dashboards', async ({I, api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'JUDICIAL_REFERRAL');
  await api.waitForFinishedBusinessProcess();

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  notification = goToHearingClaimant();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);

  await api.performAnAssistedOrder(config.judgeUserWithRegionId2, claimRef);
  await api.waitForFinishedBusinessProcess();

  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  notification = goToHearingClaimant();
  await I.dontSee(notification.title);
  notification = orderMade();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);

  // Defendant has no pre-SDO judicial-referral notification in the full-defence flow,
  // so we only assert the new orderMade notification appears (delete-then-record path).
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.click(claimNumber);
  notification = orderMade();
  await verifyNotificationTitleAndContent(claimNumber, notification.title, notification.content, claimRef);
});
