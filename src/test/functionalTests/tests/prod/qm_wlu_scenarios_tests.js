const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../specClaimHelpers/fixtures/queryTypes');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../commonFeatures/home/steps/login');

let caseData, claimNumber;

Feature('Query management - WLU Scenarios @qm').tag('@qm');

const claimType = 'SmallClaims';

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

async function loginAndOpenClaim(I, user, claimNumber) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${user.email}`);
}

async function raiseRespondAndFollowUpToLipQueriesScenario(qmSteps, caseId, citizenUser, caseworkerUser, queryType, isHearingRelated) {
  let query = await qmSteps.raiseLipQuery(caseId, citizenUser, queryType, isHearingRelated);
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  return await qmSteps.followUpOnLipQuery(caseId, citizenUser, query, queryType);
}

async function closeQuery(qmSteps, caseId, caseworkerUser, query, queryType) {
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType, true);
  console.log('Caseworker closed the query');
}

async function createLipClaim(api, claimantLanguage = 'ENGLISH'){
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, true, 'IndividualVOrganisation', claimantLanguage);
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;
  console.log('claim number', claimNumber);
  return claimRef;
}

Scenario('Welsh LIP v English LIP Query Management', async ({ I, api, qm }) => {
  const caseId = await createLipClaim(api, 'WELSH');
  await api.setCaseId(caseId);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseId);
  claimNumber = caseData.legacyCaseReference;
  console.log(`Created LiP claim. Claim number: ${claimNumber}`);
  await api.performCitizenResponse(config.defendantCitizenUser, caseId, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
  const latestQueryClaimant = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );

  const latestQueryDefendant = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );

  await closeQuery(qm, caseId, config.wluAdmin, latestQueryClaimant, PUBLIC_QUERY);
  await closeQuery(qm, caseId, config.wluAdmin, latestQueryDefendant, PUBLIC_QUERY);

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.clickOnViewMessages();
  await ResponseSteps.verifyQueryStatus('Claimant Query', 'You', 'Closed');
  await ResponseSteps.clickBackLink();
  await ResponseSteps.verifyQueryStatus('Defendant Query', 'Defendant', 'Closed');

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.clickOnViewMessages();
  await ResponseSteps.verifyQueryStatus('Claimant Query', 'Claimant', 'Closed');
  await ResponseSteps.clickBackLink();
  await ResponseSteps.verifyQueryStatus('Defendant Query', 'You', 'Closed');
});

Scenario('English LIP v Welsh LIP Query Management', async ({ api, qm }) => {
  const caseId = await createLipClaim(api);
  await api.performCitizenResponse(config.defendantCitizenUser, caseId, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany', 'WELSH');
  const latestQuery = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
});

Scenario('LR v Welsh LIP Query Management', async ({ api, noc, qm }) => {
  const caseId = await createLipClaim(api);
  await api.performCitizenResponse(config.defendantCitizenUser, caseId, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany', 'WELSH');
  await noc.requestNoticeOfChangeForApplicant1Solicitor(caseId, config.applicantSolicitorUser);
  const latestQuery = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
});

Scenario('Welsh LIP v LR Query Management', async ({ api, noc, qm, I}) => {
  const caseId = await createLipClaim(api, 'WELSH');
  await api.setCaseId(caseId);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseId);
  claimNumber = caseData.legacyCaseReference;
  console.log(`Created LiP claim. Claim number: ${claimNumber}`);
  await api.performCitizenResponse(config.defendantCitizenUser, caseId, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
  await noc.requestNoticeOfChangeForRespondent1SolicitorCompany(caseId, config.defendantSolicitorUser);
  const latestQuery = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.clickOnViewMessages();
  await ResponseSteps.verifyQueryStatus('Claimant Query', 'You', 'Closed');
});
