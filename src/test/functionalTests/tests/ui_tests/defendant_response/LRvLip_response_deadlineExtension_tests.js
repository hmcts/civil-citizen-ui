const config = require('../../../../config');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const CitizenDashboardSteps = require('../../../citizenFeatures/citizenDashboard/steps/citizenDashboard');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');

const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';

let claimRef;
let caseData;
let claimNumber;
let securityCode;

Feature('Extended Response Time').tag('@ui-nightly-prod');

Before(async ({api}) => {
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  claimRef = await api.createSpecifiedClaim(config.applicantSolicitorUser);
  console.log('Claim has been created Successfully    <===>  ', claimRef);
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = await caseData.legacyCaseReference;
  securityCode = await caseData.respondent1PinToPostLRspec.accessCode;
  console.log('claim number', claimNumber);
  console.log('Security code', securityCode);
  await ResponseSteps.AssignCaseToLip(claimNumber, securityCode);
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await CitizenDashboardSteps.VerifyClaimOnDashboard(claimNumber);
});

//Skipped dependant on the release DTSCCI-2558
Scenario.skip('No response submitted, date agreed upon request time', async () => {
  await ResponseSteps.RespondToClaim(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, iHaveAlreadyAgreedMoretime);
  await ResponseSteps.DefendantSummaryPage(claimRef);
});
