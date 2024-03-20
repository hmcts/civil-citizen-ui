const config = require('../../config');
const {createAccount} = require('../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../features/home/steps/login');
const ResponseToDefenceLipVsLipSteps = require('../features/createClaim/steps/responseToDefenceLipvLipSteps');

let claimRef, claimType;
let caseData;
let claimNumber;

Feature('Response with PartAdmit-AlreadyPaid - Small Claims & Fast Track');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant settle the claim @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'SmallClaims';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
    await api.waitForFinishedBusinessProcess();
    //Claimant Intent Confirmation page is broken: https://tools.hmcts.net/jira/browse/CIV-13241
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaid(claimRef, claimNumber, 'disagree');
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-AlreadyPaid Fast Track and Claimant Not to settle the claim @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'FastTrack';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaidAndProceed(claimRef, claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-AlreadyPaid Small claims and Claimant decides to go for Mediation @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'SmallClaims';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitAmountPaidWithIndividual);
    await api.waitForFinishedBusinessProcess();
    await LoginSteps.EnterUserCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.ResponseToDefenceStepsAsAnAcceptanceOfPartAdmitAlreadyPaidGoToMediation(claimRef, claimNumber, 'disagree');
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
