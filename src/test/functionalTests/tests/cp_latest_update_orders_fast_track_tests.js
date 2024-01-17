const config = require('../../config');
const UploadEvidenceSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

const claimType = 'FastTrack';
let claimRef;

Feature.skip('Case progression journey - Verify latest Update page For an Order being Created');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'FAST_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef);
    await api.performAnAssistedOrder(config.judgeUserWithRegionId1, claimRef);
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

Scenario('Case progression journey - Fast Track - Verify latest Update page for an Order being Created', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    UploadEvidenceSteps.verifyAnOrderHasBeenMadeOnTheClaim(claimRef, claimType);
  }
}).tag('@regression');

AfterSuite(async  () => {
  await unAssignAllUsers();
});
