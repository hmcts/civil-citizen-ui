const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType;

Feature('Response with PartAdmit-PayImmediately - Small Claims & Fast Track');

Scenario('Response with PartAdmit-PayImmediately Small claims @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant Response - accept the part admit - settle the claim
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitImmediatePayment(claimRef, '200');
  await api.waitForFinishedBusinessProcess();
}).tag('@regression-2-cui-r2');

Scenario('Response with PartAdmit-PayImmediately Fast Track @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitHaventPaidPartiallyWantsToPayImmediatelyWithIndividual);
  await api.waitForFinishedBusinessProcess();
  //Claimant Response - reject the part admit - move case to judicial referral
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.claimantRejectForDefRespPartAdmitImmediatePayment(claimRef, '569');
  await api.waitForFinishedBusinessProcess();
});
