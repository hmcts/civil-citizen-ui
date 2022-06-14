import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {SEND_RESPONSE_BY_EMAIL_URL} from '../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Send your response by email', () => {
  const data = require('../../../../../utils/mocks/feeRangesMock.json');
  const feesUrl: string = config.get('feesUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    nock(feesUrl).get('/ranges/').reply(200, data);
  });

  describe('on GET', () => {
    test('should return send your response by email page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(SEND_RESPONSE_BY_EMAIL_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SEND_YOUR_RESPONSE_BY_EMAIL);
          expect(res.text).toContain('How to counterclaim');
          expect(res.text).toContain('View claim fees');
          expect(res.text).toContain('How to counterclaim');
          expect(res.text).toContain('Help and support');
          expect(res.text).toContain('Email');
          expect(res.text).toContain('Telephone');
        });
    });
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(SEND_RESPONSE_BY_EMAIL_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
