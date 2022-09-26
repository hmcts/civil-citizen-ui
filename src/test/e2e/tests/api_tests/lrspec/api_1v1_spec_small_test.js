/* eslint-disable no-unused-vars */

const config = require('../../../config.js');

Feature('CCD 1v1 API test @api-spec-small');

Scenario.skip('1v1 full defence claimant and defendant response small claim', async ({I, api_spec_small}) => {
  const defenceRoutes = ['FULL_DEFENCE', 'FULL_ADMISSION', 'PART_ADMISSION', 'COUNTER_CLAIM'];
  for (let i = 0; i < defenceRoutes.length; i++) {
    await api_spec_small.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
    await api_spec_small.defendantResponse(config.defendantSolicitorUser, defenceRoutes[i]);
    if ('COUNTER_CLAIM' !== defenceRoutes[i]) {
      // counter claim defense brings the case offline
      await api_spec_small.claimantResponse(config.applicantSolicitorUser);
    }
  }
});
