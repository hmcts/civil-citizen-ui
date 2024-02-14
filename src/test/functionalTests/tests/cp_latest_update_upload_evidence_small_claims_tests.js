const config = require('../../config');
const CaseProgressionSteps = require('../features/caseProgression/steps/caseProgressionSteps');
const LoginSteps = require('../features/home/steps/login');
const {unAssignAllUsers} = require('./../specClaimHelpers/api/caseRoleAssignmentHelper');

const claimType = 'SmallClaims';
let claimRef;

Feature('Case progression journey - Verify latest Update page - Upload Evidence - Small Claims');

Before(async ({api}) => {
  //Once the CUI Release is done, we can remove this IF statement, so that tests will run on AAT as well.
  if (['preview', 'demo'].includes(config.runningEnv)) {
    claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser, '', claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType);
    await api.viewAndRespondToDefence(config.applicantSolicitorUser, config.defenceType.rejectAll, 'JUDICIAL_REFERRAL', 'SMALL_CLAIM');
    await api.performCaseProgressedToSDO(config.judgeUserWithRegionId1, claimRef, 'smallClaimsTrack');
    await LoginSteps.EnterUserCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  }
});

//Covered in cp_upload_evidence_small_claims_tests
Scenario('Case progression journey - Small Claims - Verify latest Update page For Evidence Upload', () => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    CaseProgressionSteps.verifyLatestUpdatePageForCaseProgressionState(claimRef, claimType);
  }
});

AfterSuite(async  () => {
  await unAssignAllUsers();
});
