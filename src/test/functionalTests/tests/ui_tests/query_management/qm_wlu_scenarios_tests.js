const config = require('../../../../config');
const { createAccount } = require('../../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../../specClaimHelpers/fixtures/queryTypes');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const LoginSteps = require('../../../commonFeatures/home/steps/login');

let caseData, claimNumber;

Feature('Query management - WLU Scenarios').tag('@e2e-qm');

const claimType = 'SmallClaims';

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});
Scenario('Welsh LIP v English LIP Query Management', async ({ I, api, qm }) => {
  const caseId = await api.createLiPClaim(config.claimantCitizenUser, claimType, true, 'IndividualVOrganisation', 'WELSH');
  await api.setCaseId(caseId);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseId);
  claimNumber = caseData.legacyCaseReference;
  console.log(`Created LiP claim. Claim number: ${claimNumber}`);
  await api.performCitizenResponse(
    config.defendantCitizenUser,
    caseId,
    claimType,
    config.defenceType.rejectAllSmallClaimsCarm,
    'DefendantCompany',
  );

  let latestQueryClaimant = await qm.raiseLipQuery(caseId, config.claimantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQueryClaimant, PUBLIC_QUERY);
  latestQueryClaimant = await qm.followUpOnLipQuery(caseId, config.claimantCitizenUser, latestQueryClaimant, PUBLIC_QUERY);

  let latestQueryDefendant = await qm.raiseLipQuery(caseId, config.defendantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQueryDefendant, PUBLIC_QUERY);
  latestQueryDefendant = await qm.followUpOnLipQuery(caseId, config.defendantCitizenUser, latestQueryDefendant, PUBLIC_QUERY);

  await qm.respondToQuery(caseId, config.wluAdmin, latestQueryClaimant, PUBLIC_QUERY, true);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQueryDefendant, PUBLIC_QUERY, true);
  console.log('Caseworker closed the queries');

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${config.claimantCitizenUser.email}`);
  await ResponseSteps.clickOnViewMessages();
  await ResponseSteps.verifyQueryStatus('Claimant Query', 'You', 'Closed');
  await ResponseSteps.clickBackLink();
  await ResponseSteps.verifyQueryStatus('Defendant Query', 'Defendant', 'Closed');

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${config.defendantCitizenUser.email}`);
  await ResponseSteps.clickOnViewMessages();
  await ResponseSteps.verifyQueryStatus('Claimant Query', 'Claimant', 'Closed');
  await ResponseSteps.clickBackLink();
  await ResponseSteps.verifyQueryStatus('Defendant Query', 'You', 'Closed');
});

Scenario('English LIP v Welsh LIP Query Management', async ({ api, qm }) => {
  const caseId = await api.createLiPClaim(config.claimantCitizenUser, claimType, true, 'IndividualVOrganisation');
  await api.setCaseId(caseId);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseId);
  claimNumber = caseData.legacyCaseReference;
  await api.performCitizenResponse(
    config.defendantCitizenUser,
    caseId,
    claimType,
    config.defenceType.rejectAllSmallClaimsCarm,
    'DefendantCompany',
    'WELSH',
  );
  let latestQuery = await qm.raiseLipQuery(caseId, config.defendantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
  latestQuery = await qm.followUpOnLipQuery(caseId, config.defendantCitizenUser, latestQuery, PUBLIC_QUERY);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY, true);
  console.log('Caseworker closed the query');
});

Scenario('LR v Welsh LIP Query Management', async ({ api, noc, qm }) => {
  const caseId = await api.createLiPClaim(config.claimantCitizenUser, claimType, true, 'IndividualVOrganisation');
  await api.setCaseId(caseId);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseId);
  claimNumber = caseData.legacyCaseReference;
  await api.performCitizenResponse(
    config.defendantCitizenUser,
    caseId,
    claimType,
    config.defenceType.rejectAllSmallClaimsCarm,
    'DefendantCompany',
    'WELSH',
  );
  await noc.requestNoticeOfChangeForApplicant1Solicitor(caseId, config.applicantSolicitorUser);
  let latestQuery = await qm.raiseLipQuery(caseId, config.defendantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
  latestQuery = await qm.followUpOnLipQuery(caseId, config.defendantCitizenUser, latestQuery, PUBLIC_QUERY);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY, true);
  console.log('Caseworker closed the query');
});

Scenario('Welsh LIP v LR Query Management', async ({ api, noc, qm, I}) => {
  const caseId = await api.createLiPClaim(config.claimantCitizenUser, claimType, true, 'IndividualVOrganisation', 'WELSH');
  await api.setCaseId(caseId);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, caseId);
  claimNumber = caseData.legacyCaseReference;
  console.log(`Created LiP claim. Claim number: ${claimNumber}`);
  await api.performCitizenResponse(
    config.defendantCitizenUser,
    caseId,
    claimType,
    config.defenceType.rejectAllSmallClaimsCarm,
    'DefendantCompany',
  );
  await noc.requestNoticeOfChangeForRespondent1SolicitorCompany(caseId, config.defendantSolicitorUser);
  let latestQuery = await qm.raiseLipQuery(caseId, config.claimantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
  latestQuery = await qm.followUpOnLipQuery(caseId, config.claimantCitizenUser, latestQuery, PUBLIC_QUERY);
  await qm.respondToQuery(caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY, true);
  console.log('Caseworker closed the query');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  console.log(`Opened claim dashboard for user: ${config.claimantCitizenUser.email}`);
  await ResponseSteps.clickOnViewMessages();
  await ResponseSteps.verifyQueryStatus('Claimant Query', 'You', 'Closed');
});
