/* eslint-disable no-unused-vars */
const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/response/steps/responseToDefenceLipvLipSteps');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType;
let caseData;
let claimNumber;

Feature('Response with RejectAll-DisputeAll - Small Claims & Fast Track');

Scenario('Response with RejectAll-DisputeAll Small claims @citizenUI @rejectAll @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceDisputeAllSmallClaim(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).tag('@regression-cui-r2');

// Scenario('Response with RejectAll-DisputeAll Fast Track @citizenUI @rejectAll  - @api', async ({api}) => {
//   await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
//   claimType = 'FastTrack';
//   claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
//   caseData = await api.retrieveCaseData(config.adminUser, claimRef);
//   claimNumber = await caseData.legacyCaseReference;
//   await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllDisputeAllWithIndividual);
//   await api.waitForFinishedBusinessProcess();
//   await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
//   await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceDisputeAll(claimRef, claimNumber);
//   await api.waitForFinishedBusinessProcess();
// }).tag('@regression-cui-r2');
