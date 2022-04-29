import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';

import {CLAIMANT_DETAILS_URL} from '../../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');


describe('Claimant details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    test('should return citizen phone number page with all information from redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIMANT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(claim.applicant1.partyName);
          expect(res.text).toContain(claim.applicant1.primaryAddress.AddressLine1);
          expect(res.text).toContain(claim.applicant1.primaryAddress.AddressLine2);
          expect(res.text).toContain(claim.applicant1.primaryAddress.AddressLine3);
          expect(res.text).toContain(claim.applicant1.primaryAddress.PostCode);
        });
    });

    test('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_DETAILS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
