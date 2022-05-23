import request from 'supertest';
import {app} from '../../../../../../main/app';
import config from 'config';
import {CLAIM_DETAILS} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {mockClaim as mockResponse} from '../../../../../utils/mockClaim';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {mockCivilClaim, mockCivilClaimUndefined} from '../../../../../utils/mockDraftStore';

jest.mock('../../../../../../main/modules/oidc');

const nock = require('nock');

describe('Confirm Details page', () => {
  const idamUrl: string = config.get('idamUrl');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    test('should return your claim details page with default values', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(400);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
          expect(res.text).toContain(TestMessages.CLAIM_NUMBER);
        });
    });
    test('should return your claim details page with values from civil-service', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, mockResponse);
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
        });
      expect(spyRedisSave).toBeCalled();
    });
    test('should retrieve claim from redis when claim exists in redis', async () => {
      nock('http://localhost:4000')
        .get('/cases/1111')
        .reply(200, mockResponse);
      app.locals.draftStoreClient = mockCivilClaim;
      const spyRedisSave = spyOn(draftStoreService, 'saveDraftClaim');
      await request(app)
        .get('/case/1111/response/claim-details')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(CLAIM_DETAILS);
        });
      expect(spyRedisSave).not.toBeCalled();
    });
  });
});

