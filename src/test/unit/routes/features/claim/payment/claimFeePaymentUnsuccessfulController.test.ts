import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {PAY_CLAIM_FEE_UNSUCCESSFUL_URL} from 'routes/urls';
import {
  mockCivilClaim, mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Claim fee payment confirmation', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving unsuccessful payment page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(PAY_CLAIM_FEE_UNSUCCESSFUL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
        });
    });
  });
});
