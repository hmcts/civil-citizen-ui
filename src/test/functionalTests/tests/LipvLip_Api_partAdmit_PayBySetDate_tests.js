const config = require('../../config');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
//const LoginSteps = require('../features/home/steps/login');
//const ResponseToDefenceLipVsLipSteps = require('../features/createClaim/steps/responseToDefenceLipvLipSteps');

let claimRef, claimType;

Feature('Response with PartAdmit-PayBySetDate - Small Claims & Fast Track');

Scenario('Response with PartAdmit-PayBySetDate Small claims @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'SmallClaims';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
    await api.waitForFinishedBusinessProcess();
    //Claimant Response - accept the part admit - settle the claim
    //CIV-13233
    /*await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitImmediatePayment(claimRef, '456');
    await api.waitForFinishedBusinessProcess();*/
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-PayBySetDate Fast Track @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'FastTrack';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
    await api.waitForFinishedBusinessProcess();
    //Claimant Response - reject the part admit - move case to judicial referral
    /*await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.claimantRejectForDefRespPartAdmitImmediatePayment(claimRef, '569');
    await api.waitForFinishedBusinessProcess();*/
  }
}).tag('@regression-r2');