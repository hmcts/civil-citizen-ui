const config = require('../../config');
const LoginSteps = require('../features/home/steps/login');
const HearingFeeSteps = require('../features/caseProgression/steps/hearingFeeSteps');
const DateUtilsComponent = require('../features/caseProgression/util/DateUtilsComponent');
const {createAccount} = require('./../specClaimHelpers/api/idamHelper');

const claimType = 'SmallClaims';
let claimRef;
let fiveWeeksFromToday;
let hearingFeeDueDate;

Feature('Case progression - Lip v Lip - Hearing Fee journey - Small Claims');

Before(async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    fiveWeeksFromToday = DateUtilsComponent.DateUtilsComponent.rollDateToCertainWeeks(5);
    hearingFeeDueDate = DateUtilsComponent.DateUtilsComponent.getPastDateInFormat(fiveWeeksFromToday);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.claimantLipRespondToDefence(config.claimantCitizenUser, claimRef, 'JUDICIAL_REFERRAL');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
    await api.performCaseProgressedToHearingInitiated(config.hearingCenterAdminWithRegionId1, claimRef, DateUtilsComponent.DateUtilsComponent.formatDateToYYYYMMDD(fiveWeeksFromToday));
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  }
});

Scenario('Apply for Help with Fees Journey - Small Claims', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    HearingFeeSteps.initiateApplyForHelpWithFeesJourney(claimRef, '123', hearingFeeDueDate);
  }
}).tag('@regression-cp');

Scenario('Pay the Hearing Fee Journey - Small Claims', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    HearingFeeSteps.payHearingFeeJourney(claimRef, '123', hearingFeeDueDate);
  }
}).tag('@regression-cp');
