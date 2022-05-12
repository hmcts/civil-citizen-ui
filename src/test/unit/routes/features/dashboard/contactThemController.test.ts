import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';

import {CITIZEN_CONTACT_THEM_URL} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');


describe('Claimant details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    test('should return contact claimant details from claim', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claimant');
          expect(res.text).toContain('Address');
          expect(res.text).toContain('Phone:');
          expect(res.text).toContain('Email:');
          expect(res.text).toContain('About claim');
          expect(res.text).toContain('Claimant name:');
          expect(res.text).toContain('Claim amount:');
          expect(res.text).toContain('Claim details:');
          expect(res.text).toContain('Contact us for help');
          expect(res.text).toContain(claim.case_data.applicant1.partyName);
          expect(res.text).toContain(claim.case_data.applicant1.primaryAddress.AddressLine1);
          expect(res.text).toContain(claim.case_data.applicant1.primaryAddress.AddressLine2);
          expect(res.text).toContain(claim.case_data.applicant1.primaryAddress.AddressLine3);
          expect(res.text).toContain(claim.case_data.applicant1.primaryAddress.PostCode);
        });
    });

    test('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
