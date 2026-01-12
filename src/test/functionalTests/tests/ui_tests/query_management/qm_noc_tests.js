const config = require('../../../../config');
const {createAccount} = require('../../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../../specClaimHelpers/fixtures/queryTypes');
const LoginSteps = require('../../../commonFeatures/home/steps/login');
const ResponseSteps = require('../../../citizenFeatures/response/steps/lipDefendantResponseSteps');

let caseData, claimNumber, claimRef;

Feature('QM - NOC - Claimant and Defendant Journey').tag('@ui-nightly-prod @ui-qm @ui-noc');

Before(async ({api}) => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);

  claimRef = await api.createLiPClaim(config.claimantCitizenUser, 'SmallClaims', true, 'IndividualVOrganisation');
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  claimNumber = caseData.legacyCaseReference;
});

Scenario('LR v LIP NOC Claimant and Defendant send message to court, follow up and admin closes query', async ({noc, qm, I}) => {
  await noc.requestNoticeOfChangeForApplicant1Solicitor(claimRef, config.applicantSolicitorUser);
  let solicitorQuery = await qm.raiseLRQuery(claimRef, config.applicantSolicitorUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(claimRef, config.ctscAdmin, solicitorQuery, PUBLIC_QUERY);
  solicitorQuery = await qm.followUpOnLRQuery(claimRef, config.applicantSolicitorUser, solicitorQuery, PUBLIC_QUERY);

  let latestQuery = await qm.raiseLipQuery(claimRef, config.defendantCitizenUser, PUBLIC_QUERY, true);
  await qm.respondToQuery(claimRef, config.ctscAdmin, latestQuery, PUBLIC_QUERY);
  latestQuery = await qm.followUpOnLipQuery(claimRef, config.defendantCitizenUser, latestQuery, PUBLIC_QUERY);

  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.verifyUserQueryInDashboard();

  await qm.respondToQuery(claimRef, config.ctscAdmin, latestQuery, PUBLIC_QUERY, true);
  console.log('Caseworker closed the query');
  await LoginSteps.EnterCitizenCredentials(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.verifyClosedQuery('Defendant Query');
});

Scenario('LIP v LR NOC Claimant and Defendant send message to court, follow up and admin closes query', async ({noc, qm, I}) => {
  await noc.requestNoticeOfChangeForRespondent1Solicitor(claimRef, config.defendantSolicitorUser);
  let claimantQuery = await qm.raiseLipQuery(claimRef, config.claimantCitizenUser, PUBLIC_QUERY, false);
  await qm.respondToQuery(claimRef, config.ctscAdmin, claimantQuery, PUBLIC_QUERY);
  claimantQuery = await qm.followUpOnLipQuery(claimRef, config.claimantCitizenUser, claimantQuery, PUBLIC_QUERY);

  let latestQuery = await qm.raiseLRQuery(claimRef, config.defendantSolicitorUser, PUBLIC_QUERY, true);
  await qm.respondToQuery(claimRef, config.ctscAdmin, latestQuery, PUBLIC_QUERY);
  latestQuery = await qm.followUpOnLRQuery(claimRef, config.defendantSolicitorUser, latestQuery, PUBLIC_QUERY);

  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.verifyUserQueryInDashboard();

  await qm.respondToQuery(claimRef, config.ctscAdmin, latestQuery, PUBLIC_QUERY, true);
  console.log('Caseworker closed the query');
  await LoginSteps.EnterCitizenCredentials(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await I.amOnPage('/dashboard');
  await I.click(claimNumber);
  await ResponseSteps.verifyClosedQuery('Defendant Query');
});
