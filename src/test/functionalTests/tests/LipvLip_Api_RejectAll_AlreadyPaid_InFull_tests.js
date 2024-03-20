const config = require('../../config');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../features/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../features/createClaim/steps/responseToDefenceLipvLipSteps');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType;
let caseData;
let claimNumber;

Feature('Response with RejectAll-AlreadyPaid-InFull - Small Claims & Fast Track');

Scenario('Response with RejectAll-AlreadyPaid-InFull Small claims and Claimant settle @citizenUI @rejectAll @nightly', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'SmallClaims';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllAlreadyPaidInFullWithIndividual);
    await api.waitForFinishedBusinessProcess();
    // Claimant Intent Defendant response page has typo: https://tools.hmcts.net/jira/browse/CIV-13248
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfFullDefenceAlreadyPaidInFull(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

Scenario('Response with RejectAll-AlreadyPaid-InFull Fast Track and Claimant proceeds @citizenUI @rejectAll @nightly', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'FastTrack';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.rejectAllAlreadyPaidInFullWithIndividual);
    await api.waitForFinishedBusinessProcess();
    // Claimant Intent Defendant response page has typo: https://tools.hmcts.net/jira/browse/CIV-13248
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnRejectionOfFullDefenceAlreadyPaidInFull(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
