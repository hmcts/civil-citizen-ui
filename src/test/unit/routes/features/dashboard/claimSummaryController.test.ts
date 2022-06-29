import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';

import {DEFENDANT_SUMMARY_URL} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claim summary', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on GET', () => {
    test('should return claim summary', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(DEFENDANT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(200);

          expect(res.text).toContain('Mr. Jan Clark v Version 1');
          expect(res.text).toContain('000MC009');
          expect(res.text).toContain('Latest update');
          expect(res.text).toContain('Documents');
        });
    });

    test('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DEFENDANT_SUMMARY_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({error: TestMessages.REDIS_FAILURE});
        });
    });
  });
});
