const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const {PUBLIC_QUERY} = require('../../specClaimHelpers/fixtures/queryTypes');

let caseData;

Feature('Query management - LIP Journeys @regression-qm');

const claimType = 'SmallClaims';

Before(async () => {
  await createAccount(config.claimantCitizenUser.email, config.claimantCitizenUser.password);
  await createAccount(config.defendantCitizenUser.email, config.defendantCitizenUser.password);
});

async function raiseRespondAndFollowUpToSolicitorQueriesScenario(qmSteps, caseId, solicitorUser, caseworkerUser, queryType, isHearingRelated) {
  const query = await qmSteps.raiseLRQuery(caseId, solicitorUser, queryType, isHearingRelated);
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  await qmSteps.followUpOnLRQuery(caseId, solicitorUser, query, queryType);
}

async function raiseRespondAndFollowUpToLipQueriesScenario(qmSteps, caseId, citizenUser, caseworkerUser, queryType, isHearingRelated) {
  const query = await qmSteps.raiseLipQuery(caseId, citizenUser, queryType, isHearingRelated);
  await qmSteps.respondToQuery(caseId, caseworkerUser, query, queryType);
  await qmSteps.followUpOnLipQuery(caseId, citizenUser, query, queryType);
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

Scenario('LR v LIP Query Management', async ({ api, qm }) => {
  const caseId = await createLipClaim(api);
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.ctscAdmin,
    PUBLIC_QUERY, false,
  );
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.ctscAdmin,
    PUBLIC_QUERY, true,
  );
});

Scenario('LR v LIP Query Management', async ({ api, noc, qm }) => {
  const caseId = await createLipClaim(api);
  await noc.requestNoticeOfChangeForApplicant1Solicitor(caseId, config.applicantSolicitorUser);
  await raiseRespondAndFollowUpToSolicitorQueriesScenario(qm, caseId,
    config.applicantSolicitorUser, config.ctscAdmin,
    PUBLIC_QUERY, false,
  );
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.defendantCitizenUser, config.ctscAdmin,
    PUBLIC_QUERY, true,
  );
});

Scenario('LIP v LR Query Management', async ({ api, noc, qm }) => {
  const caseId = await createLipClaim(api);
  await noc.requestNoticeOfChangeForRespondent1Solicitor(caseId, config.defendantSolicitorUser);
  await raiseRespondAndFollowUpToLipQueriesScenario(qm, caseId,
    config.claimantCitizenUser, config.ctscAdmin,
    PUBLIC_QUERY, false,
  );
  await raiseRespondAndFollowUpToSolicitorQueriesScenario(qm, caseId,
    config.defendantSolicitorUser, config.ctscAdmin,
    PUBLIC_QUERY, true,
  );
});

