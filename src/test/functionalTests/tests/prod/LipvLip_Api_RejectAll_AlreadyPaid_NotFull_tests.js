const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType;
let caseData;
let claimNumber;

Feature('Response with RejectAll-AlreadyPaid-NotFull - Small Claims & Fast Track');

Scenario('Response with RejectAll-AlreadyPaid-NotFull Small claims And Claimant Proceeds @citizenUI @rejectAll @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'SmallClaims';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllAlreadyPaidNotFullWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  // One of the step in the below method is commented until https://tools.hmcts.net/jira/browse/CIV-13496 is fixed
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceAlreadyPaidNotInFull(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).tag('@regression-parallel-2-cui-r2');

Scenario('Response with RejectAll-AlreadyPaid-NotFull Fast Track And Claimant Settle @citizenUI @rejectAll @nightly - @api', async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimType = 'FastTrack';
  claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllAlreadyPaidNotFullWithIndividual);
  await api.waitForFinishedBusinessProcess();
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceAlreadyPaidNotInFull(claimRef, claimNumber);
  await api.waitForFinishedBusinessProcess();
}).tag('@regression-parallel-2-cui-r2');
