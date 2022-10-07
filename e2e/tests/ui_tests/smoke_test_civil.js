/* eslint-disable no-unused-vars */
const config = require('../../config.js');
const mpScenario = 'ONE_V_ONE';

let parentCaseNumber, childCaseNumber;

Feature('CUI Ex Smoke tests');

Scenario.skip('CUI Ex Tests', async ({I, api}) => {
  parentCaseNumber = await api.createUnspecifiedClaim(
    config.applicantSolicitorUser, mpScenario, 'Company');
  await api.notifyClaim(config.applicantSolicitorUser, mpScenario, parentCaseNumber);
  await api.notifyClaimDetails(config.applicantSolicitorUser, parentCaseNumber);
}).retry(0);

AfterSuite(async ({api}) => {
  await api.cleanUp();
});
