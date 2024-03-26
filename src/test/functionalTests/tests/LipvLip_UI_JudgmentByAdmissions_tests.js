const config = require('../../config');

const LoginSteps = require('../commonFeatures/home/steps/login');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const ClaimantResponseSteps = require('../citizenFeatures/response/steps/lipClaimantResponseSteps');

const claimType = 'SmallClaims';
// eslint-disable-next-line no-unused-vars
let claimRef;

Feature('Create Lip v Lip claim -  Judgment by Admissions');

Scenario('Create LipvLip claim and defendant responded FullAdmit and PayImmediately and Claimant raise Judgment by Admissions', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    // During Defendant response itself, update the payment deadline to past date
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.admitAllPayImmediateWithIndividual);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ClaimantResponseSteps.verifyJudgmentByAdmission(claimRef);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
