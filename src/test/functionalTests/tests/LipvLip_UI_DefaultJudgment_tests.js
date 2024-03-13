const config = require('../../config');

const LoginSteps = require('../features/home/steps/login');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../features/response/steps/lipClaimantResponseSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;

Feature('Create Lip v Lip claim -  Default Judgment');

Scenario('Create LipvLip claim and defendant not responded by deadline and Claimant raise Default Judgment', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.amendRespondent1ResponseDeadline(config.systemUpdate2);
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ClaimantResponseSteps.verifyDefaultJudgment(claimRef);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
