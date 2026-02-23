const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const { PUBLIC_QUERY } = require('../../../specClaimHelpers/fixtures/queryTypes');

let caseData, claimNumber;
const claimType = 'SmallClaims';

Feature('QM - LIP - Follow up tests').tag('@civil-citizen-nightly @ui-qm');

Before(async () => {
  await Promise.all([
    createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password),
    createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password),
  ]);
});

Scenario('Claimant and Defendant send message to court and follow up and admin closes query', async ({ api, qm, I }) => {
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
  const caseId = claimRef;

  const claimantQuery = await qm.raiseLipQuery(caseId, config.claimantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(caseId, config.ctscAdmin, claimantQuery, PUBLIC_QUERY);
  console.log(`Raised and responded to query of type: ${PUBLIC_QUERY}`);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${config.claimantCitizenUser.email}`);
  await ResponseSteps.followUpMessage('Claimant Query', 'This query was raised by Claimant.', false);
  await ResponseSteps.verifyFollowUpMessage('Claimant Query');

  let latestQuery = await qm.raiseLipQuery(caseId, config.defendantCitizenUser, PUBLIC_QUERY, false);
  latestQuery = await qm.respondToQuery(caseId, config.ctscAdmin, latestQuery, PUBLIC_QUERY);
  console.log(`Raised and responded to query of type: ${PUBLIC_QUERY}`);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${config.defendantCitizenUser.email}`);
  await ResponseSteps.followUpMessage('Defendant Query', 'This query was raised by Defendant.', false);
  await ResponseSteps.verifyFollowUpMessage('Defendant Query');

  await qm.respondToQuery(caseId, config.ctscAdmin, latestQuery, PUBLIC_QUERY, true);
  console.log('Caseworker closed the query');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${config.defendantCitizenUser.email}`);
  await ResponseSteps.verifyClosedQuery('Defendant Query');
}).tag('@civil-citizen-master @civil-citizen-pr');
