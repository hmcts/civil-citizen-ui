/* eslint-disable no-unused-vars */
import {config} from '../../config';

// eslint-disable-next-line no-undef
Feature('CCD 1v1 API test @api-spec @api-spec-1v1');

// eslint-disable-next-line no-undef
Scenario('Create claim spec 1v1', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
});

// eslint-disable-next-line no-undef
Scenario('1v1 full admit', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
  await api_spec.defendantResponse(config.defendantSolicitorUser, 'FULL_ADMISSION');
});
// eslint-disable-next-line no-undef
Scenario('1v1 part admit', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
  await api_spec.defendantResponse(config.defendantSolicitorUser, 'PART_ADMISSION');
});
// eslint-disable-next-line no-undef
Scenario('1v1 counter claim', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
  await api_spec.defendantResponse(config.defendantSolicitorUser, 'COUNTER_CLAIM');
});
// eslint-disable-next-line no-undef
Scenario('Inform agreed extension date', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
  await api_spec.informAgreedExtensionDate(config.applicantSolicitorUser);
});
// eslint-disable-next-line no-undef
Scenario.skip('1v1 full defence claimant and defendant response', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser);
  await api_spec.defendantResponse(config.defendantSolicitorUser);
  await api_spec.claimantResponse(config.applicantSolicitorUser, 'FULL_DEFENCE', 'ONE_V_ONE',
    'AWAITING_APPLICANT_INTENTION');
});
// eslint-disable-next-line no-undef
Scenario('1v1 full admit claimant and defendant response', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser, 'FULL_ADMISSION');
  await api_spec.defendantResponse(config.defendantSolicitorUser, 'FULL_ADMISSION');
  await api_spec.claimantResponse(config.applicantSolicitorUser, 'FULL_ADMISSION', 'ONE_V_ONE',
    'AWAITING_APPLICANT_INTENTION');
});
// eslint-disable-next-line no-undef
Scenario('1v1 part admit defence claimant and defendant response', async ({I, api_spec}) => {
  await api_spec.createClaimWithRepresentedRespondent(config.applicantSolicitorUser, 'PART_ADMISSION');
  await api_spec.defendantResponse(config.defendantSolicitorUser, 'PART_ADMISSION');
  await api_spec.claimantResponse(config.applicantSolicitorUser, 'PART_ADMISSION', 'ONE_V_ONE',
    'AWAITING_APPLICANT_INTENTION');
});
