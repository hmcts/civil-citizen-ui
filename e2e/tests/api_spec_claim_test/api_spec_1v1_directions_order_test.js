/* eslint-disable no-unused-vars */
const config = require('../../config.js');
const mpScenario = 'ONE_V_ONE';

let civilCaseReference, gaCaseReference;

Feature('GA SPEC Claim 1v1 Judge Make Order Directions Order API tests @test @api-tests');

Scenario('Judge makes decision 1V1 - DIRECTIONS ORDER', async ({api}) => {
  civilCaseReference = await api.createSpecifiedClaim(
    config.applicantSolicitorUser, mpScenario);
  console.log('Civil Case created for CIVIL APPLICATIONS : ' + civilCaseReference);

});

AfterSuite(async ({api}) => {
  await api.cleanUp();
});

