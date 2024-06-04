const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
//const HearingFeeSteps = require('../../citizenFeatures/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../../citizenFeatures/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');

const claimType = 'FastTrack';
let claimRef;
let fiveWeeksFromToday;
//let hearingFeeDueDate;

Feature('Case progression - Lip v Lip - Hearing Fee journey - Fast Track');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(5);
    //hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'fastTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('Apply for Help with Fees Journey - Fast Track', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, '545', hearingFeeDueDate);
  }
}).tag('@regression-cp');

Scenario('Pay the Hearing Fee Journey - Fast Track', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    //HearingFeeSteps.payHearingFeeJourney(claimRef, '545', hearingFeeDueDate);
  }
}).tag('@regression-cp');
