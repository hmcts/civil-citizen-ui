import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';

import {DEFENDANT_SUMMARY_URL} from '../../../../../main/routes/urls';
import {
  mockCivilClaim,
  mockRedisFailure,
  mockCivilClaimUndefined,
} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {mockClaim as mockResponse} from '../../../../utils/mockClaim';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';

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
    test('should return claim summary from redis when claim exists on redis', async () => {
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

    test('should return your claim summary from civil-service and save it to redis when claim is not existing on redis', async () => {
      nock('http://localhost:4000')
        .get('/cases/5129')
        .reply(200, mockResponse);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get(DEFENDANT_SUMMARY_URL.replace(':id', '5129'))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Mrs Jane Clark v Mrs Richards Mary');
          expect(res.text).toContain('497MC585');
          expect(res.text).toContain('Latest update');
          expect(res.text).toContain('Documents');
        });
      expect(spyRedisSave).toBeCalled();
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
