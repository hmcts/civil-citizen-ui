const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../specClaimHelpers/fixtures/queryTypes');

let caseData;

Feature('Query management - LIP Journeys @local-testing');

const claimType = 'SmallClaims';

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

async function raiseRespondAndFollowUpToLipQueriesScenario(qmSteps, caseId, citizenUser, caseworkerUser, queryType, isHearingRelated) {
  const query = await qmSteps.raiseLipQuery(caseId, citizenUser, queryType, isHearingRelated);
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  await qmSteps.followUpOnLipQuery(caseId, citizenUser, query, queryType);
}

async function closeQuery(qmSteps, caseId, caseworkerUser, query, queryType) {
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType, true);
  console.log('Caseworker closed the query');
}

async function createLipClaim(api){
  const claimRef = await api.createLiPClaim(config.claimantCitizenUser, claimType, true, 'IndividualVOrganisation');
  await api.setCaseId(claimRef);
  await api.waitForFinishedBusinessProcess();
  caseData = await api.retrieveCaseData(config.adminUser, claimRef);
  const claimNumber = caseData.legacyCaseReference;
  console.log('claim number', claimNumber);
  return claimRef;
}

Scenario('Welsh LIP v English LIP Query Management', async ({ api, qm }) => {
  const caseId = await createLipClaim(api);
  await api.updateClaimantLanguagePreference(caseId, config.ctscAdmin, 'WELSH');
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
});

Scenario('English LIP v Welsh LIP Query Management', async ({ api, qm }) => {
  const caseId = await createLipClaim(api);
  await api.updateDefendantLanguagePreference(caseId, config.ctscAdmin, 'WELSH');
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, PUBLIC_QUERY, PUBLIC_QUERY);
});

Scenario('LR v Welsh LIP Query Management', async ({ api, noc, qm }) => {
  const caseId = await createLipClaim(api);
  await noc.requestNoticeOfChangeForApplicant1Solicitor(caseId, config.applicantSolicitorUser);
  await api.updateDefendantLanguagePreference(caseId, config.ctscAdmin, 'WELSH');
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, PUBLIC_QUERY, PUBLIC_QUERY);
});

Scenario('Welsh LIP v LR Query Management', async ({ api, noc, qm }) => {
  const caseId = await createLipClaim(api);
  await noc.requestNoticeOfChangeForRespondent1Solicitor(caseId, config.defendantSolicitorUser);
  await api.updateClaimantLanguagePreference(caseId, config.ctscAdmin, 'WELSH');
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.wluAdmin,
    PUBLIC_QUERY, false,
  );
  await closeQuery(qm, caseId, config.wluAdmin, PUBLIC_QUERY, PUBLIC_QUERY);
});
