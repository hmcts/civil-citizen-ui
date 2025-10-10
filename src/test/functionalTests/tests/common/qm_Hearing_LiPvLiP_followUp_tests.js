const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const { PUBLIC_QUERY } = require('../../specClaimHelpers/fixtures/queryTypes');

let caseData, claimNumber;
const claimType = 'SmallClaims';

Feature('QM - LIP - Follow up tests @qm').tag('@nightly');

Before(async () => {
  await Promise.all([
    createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password),
    createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password),
  ]);
});

async function loginAndOpenClaim(I, user, claimNumber) {
  await LoginSteps.EnterCitizenCredentials(user.email, user.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${user.email}`);
}

async function raiseAndRespondToQueries(qmSteps, caseId, citizenUser, caseworkerUser, queryType, isHearingRelated) {
  let query = await qmSteps.raiseLipQuery(caseId, citizenUser, queryType, isHearingRelated);
  query = await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  console.log(`Raised and responded to query of type: ${queryType}`);
  return query;
}

async function closeQuery(qmSteps, caseId, caseworkerUser, query, queryType) {
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType, true);
  console.log('Caseworker closed the query');
}

async function createLipClaim(api) {
  const claimRef = await api.createLiPClaim(
    config.claimantCitizenUser,
    claimType,
    true,
    'IndividualVOrganisation',
  );
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
  console.log(`Created LiP claim. Claim number: ${claimNumber}`);
  return claimRef;
}

Scenario('Claimant and Defendant send message to court and follow up and admin closes query', async ({ api, qm, I }) => {
  const caseId = await createLipClaim(api);

  await raiseAndRespondToQueries(
    qm,
    caseId,
    config.claimantCitizenUser,
    config.ctscAdmin,
    PUBLIC_QUERY,
    false,
  );

  await loginAndOpenClaim(I, config.claimantCitizenUser, claimNumber);
  await ResponseSteps.followUpMessage('Claimant Query', 'This query was raised by Claimant.', false);
  await ResponseSteps.verifyFollowUpMessage('Claimant Query');

  const latestQuery = await raiseAndRespondToQueries(
    qm,
    caseId,
    config.defendantCitizenUser,
    config.ctscAdmin,
    PUBLIC_QUERY,
    false,
  );

  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.followUpMessage('Defendant Query', 'This query was raised by Defendant.', false);
  await ResponseSteps.verifyFollowUpMessage('Defendant Query');

  await closeQuery(qm, caseId, config.ctscAdmin, latestQuery, PUBLIC_QUERY);
  await loginAndOpenClaim(I, config.defendantCitizenUser, claimNumber);
  await ResponseSteps.verifyClosedQuery('Defendant Query');
}).tag('@regression');
