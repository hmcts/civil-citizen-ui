const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../specClaimHelpers/fixtures/queryTypes');

let caseData;

Feature('Query management - WLU Scenarios @regression-qm');

const claimType = 'SmallClaims';

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

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

Scenario('Welsh LIP v English LIP Query Management', async ({ api, qm }) => {
  const caseId = await createLipClaim(api, 'WELSH');
  await api.performCitizenResponse(config.defendantCitizenUser, caseId, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
  await api.updateClaimantLanguagePreference(caseId, config.ctscAdmin);
  const latestQuery = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
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

Scenario('Welsh LIP v LR Query Management', async ({ api, noc, qm }) => {
  const caseId = await createLipClaim(api, 'WELSH');
  await api.performCitizenResponse(config.defendantCitizenUser, caseId, claimType, config.defenceType.rejectAllSmallClaimsCarm, 'DefendantCompany');
  await noc.requestNoticeOfChangeForRespondent1SolicitorCompany(caseId, config.defendantSolicitorUser);
  const latestQuery = await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, latestQuery, PUBLIC_QUERY);
});
