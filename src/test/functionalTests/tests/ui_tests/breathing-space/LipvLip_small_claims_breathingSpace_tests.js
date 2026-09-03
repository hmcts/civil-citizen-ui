const config = require('../../../../config');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const DateUtilsComponent = require('../../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const enterIntoBSSteps = require('../../../citizenFeatures/breathingSpace/steps/enterIntoBSSteps');
const {enterIntoStandardBS, defendantBS, enterIntoMentalHealthBS} = require('../../../specClaimHelpers/dashboardNotificationConstants');

const claimType = 'SmallClaims';
let caseData, claimNumber, claimRef, currentDay, currentMonth, currentYear;

Feature('Breathing Space - Lip v Lip - Small claims').tag('@civil-citizen-nightly @ui-breathing-space');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
});

Scenario('Claimant Lip enters into Standard Breathing Space when case is in Mediation', async ({I, api}) => {
  await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, false, 'IN_MEDIATION');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  const currentDate = await DateUtilsComponent.DateUtilsComponent.getCurrentDateReturnIndividuals();
  currentDay= currentDate.day;
  currentMonth= currentDate.month;
  currentYear= currentDate.year;
  const type = 'Standard Breathing Space';
  await enterIntoBSSteps.enterIntoBS(type, claimRef, currentDay, currentMonth, currentYear);
  const enterIntoStandardBSNotif = enterIntoStandardBS();
  await verifyNotificationTitleAndContent(claimNumber, enterIntoStandardBSNotif.title, enterIntoStandardBSNotif.content, claimRef);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  const defendantBSNotif = defendantBS();
  await verifyNotificationTitleAndContent(claimNumber, defendantBSNotif.title, defendantBSNotif.content, claimRef);
});

Scenario('Claimant Lip enters into Mental Health Breathing Space when case is in Claimant Intention', async ({I}) => {
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  const currentDate = await DateUtilsComponent.DateUtilsComponent.getCurrentDateReturnIndividuals();
  currentDay= currentDate.day;
  currentMonth= currentDate.month;
  currentYear= currentDate.year;
  const type = 'Mental Health Crisis Moratorium Breathing Space';
  await enterIntoBSSteps.enterIntoBS(type, claimRef, currentDay, currentMonth, currentYear);
  const enterIntoMentalHealthBSNotif = enterIntoMentalHealthBS();
  await verifyNotificationTitleAndContent(claimNumber, enterIntoMentalHealthBSNotif.title, enterIntoMentalHealthBSNotif.content, claimRef);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  const defendantBSNotif = defendantBS();
  await verifyNotificationTitleAndContent(claimNumber, defendantBSNotif.title, defendantBSNotif.content, claimRef);
});

