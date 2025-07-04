const config = require('../../../config');
const {createAccount} = require('../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../specClaimHelpers/fixtures/queryTypes');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let caseData, claimNumber, claimRef;

Feature('QM - NOC - Claimant and Defendant Journey @regression-qm');

async function claimSetup(api) {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims', true, 'IndividualVOrganisation');
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
}

async function loginAndSelectClaim({I, user}) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
}

async function handleSolicitorQueries(qmSteps, caseId, solicitorUser, caseworkerUser, queryType, isHearingRelated) {
  const query = await qmSteps.raiseLRQuery(caseId, solicitorUser, queryType, isHearingRelated);
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  await qmSteps.followUpOnLRQuery(caseId, solicitorUser, query, queryType);
}

async function handleLipQueries(qmSteps, caseId, citizenUser, caseworkerUser, queryType, isHearingRelated) {
  const query = await qmSteps.raiseLipQuery(caseId, citizenUser, queryType, isHearingRelated);
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  await qmSteps.followUpOnLipQuery(caseId, citizenUser, query, queryType);
}

Before(async ({api}) => {
  await claimSetup(api);
});

Scenario('LR v LIP NOC Claimant and Defendant send message to court and follow up', async ({noc, qm, I}) => {
  await noc.requestNoticeOfChangeForApplicant1Solicitor(claimRef, config.applicantSolicitorUser);
  await handleSolicitorQueries(qm, claimRef, config.applicantSolicitorUser, config.ctscAdmin, PUBLIC_QUERY, false);

  await handleLipQueries(qm, claimRef, config.defendantCitizenUser, config.ctscAdmin, PUBLIC_QUERY, true);

  await loginAndSelectClaim({I, user: config.defendantCitizenUser});
  await ResponseSteps.verifyUserQueryInDashboard();
});

Scenario('LIP v LR NOC Claimant and Defendant send message to court and follow up', async ({noc, qm, I}) => {
  await noc.requestNoticeOfChangeForRespondent1Solicitor(claimRef, config.defendantSolicitorUser);
  await handleLipQueries(qm, claimRef, config.claimantCitizenUser, config.ctscAdmin, PUBLIC_QUERY, false);

  await handleSolicitorQueries(qm, claimRef, config.defendantSolicitorUser, config.ctscAdmin, PUBLIC_QUERY, true);

  await loginAndSelectClaim({I, user: config.claimantCitizenUser});
  await ResponseSteps.verifyUserQueryInDashboard();
});
