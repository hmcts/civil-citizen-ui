const steps  =  require('../../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');
const config = require('../../../../config');

const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const { isDashboardServiceToggleEnabled } = require('../../../specClaimHelpers/api/testingSupport');
const { verifyNotificationTitleAndContent } = require('../../../specClaimHelpers/e2e/dashboardHelper');
const { payClaimFee, hwfSubmission, updateHWFNum, hwfPartRemission, hwfMoreInfoRequired, hwfFullRemission } = require('../../../specClaimHelpers/dashboardNotificationConstants');

let caseData, legacyCaseReference, caseRef, claimInterestFlag, StandardInterest, selectedHWF, claimAmount=1600, claimFee=115;

Feature('Create Lip v Company claim - Individual vs Company @claimCreation').tag('@regression-r2');

Scenario('Create Claim -  Individual vs Individual - small claims - no interest - no hwf', async ({I, api}) => {
    
});