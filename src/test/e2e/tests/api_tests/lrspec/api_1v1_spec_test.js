/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const config = require('../../../config.js');

Feature('CCD 1v1 API test @api-spec @api-spec-1v1');

Scenario('Create claim spec 1v1', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
});
