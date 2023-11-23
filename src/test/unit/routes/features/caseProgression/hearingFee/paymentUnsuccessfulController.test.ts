import {
  PAY_HEARING_FEE_UNSUCCESSFUL_URL,
  DASHBOARD_CLAIMANT_URL
} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {app} from '../../../../../../main/app';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Hearing Fees - Payment Unsuccessful', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return hearing fees payment unsuccessful page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;

      await request(app)
        .get(PAY_HEARING_FEE_UNSUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Your payment was unsuccessful');
        });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(PAY_HEARING_FEE_UNSUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to claimant dashboard', async () => {
      await request(app)
        .post(PAY_HEARING_FEE_UNSUCCESSFUL_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL);
        });
    });
  });
});
