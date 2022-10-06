/* eslint-disable no-unused-vars */
const config = require('../../config.js');
const mpScenario = 'ONE_V_ONE';

let civilCaseReference, gaCaseReference;

Feature('Create claim spec 1v1 API tests @test @api-tests');

Scenario('Create claim spec 1v1', async ({api}) => {
  civilCaseReference = await api.createSpecifiedClaim(
    config.applicantSolicitorUser, mpScenario);
  console.log('Civil Case created for CIVIL APPLICATIONS : ' + civilCaseReference);

});

AfterSuite(async ({api}) => {
  await api.cleanUp();
});

