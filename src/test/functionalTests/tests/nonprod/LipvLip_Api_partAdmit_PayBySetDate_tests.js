const config = require('../../../config');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const ResponseToDefenceLipVsLipSteps = require('../../citizenFeatures/createClaim/steps/responseToDefenceLipvLipSteps');
// eslint-disable-next-line no-unused-vars
const yesIWantMoretime = 'yesIWantMoretime';

let claimRef, claimType, claimNumber;

Feature('Response with PartAdmit-PayBySetDate - Small Claims & Fast Track');

Scenario('Response with PartAdmit-PayBySetDate Small claims @debug @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'SmallClaims';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
    await api.waitForFinishedBusinessProcess();

    //Claimant response below here
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDate(claimRef, '456', claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-PayBySetDate Fast Track @debug @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'FastTrack';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
    await api.waitForFinishedBusinessProcess();
    
    //Claimant response below here
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDate(claimRef, '3456', claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');

Scenario('Response with PartAdmit-PayBySetDate Small claims Reject repayment plan Request CCJ @citizenUI @partAdmit @nightly - @api', async ({api}) => {
  if (['preview', 'demo'].includes(config.runningEnv)) {
    await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
    claimType = 'SmallClaims';
    claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType);
    await api.performCitizenResponse(config.defendantCitizenUser, claimRef, claimType, config.defenceType.partAdmitWithPartPaymentOnSpecificDateWithIndividual);
    await api.waitForFinishedBusinessProcess();

    //Claimant response below here
    let caseData = await api.retrieveCaseData(config.adminUser, claimRef);
    claimNumber = await caseData.legacyCaseReference;

    await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
    await ResponseToDefenceLipVsLipSteps.claimantAcceptForDefRespPartAdmitPayBySetDateRejectRepaymentPlanCCJ(claimRef, '456', claimNumber);
    await api.waitForFinishedBusinessProcess();
  }
}).tag('@regression-r2');
