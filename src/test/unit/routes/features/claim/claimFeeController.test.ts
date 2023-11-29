import {CLAIM_FEE_URL} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const {app} = require('../../../../../main/app');

import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import {Claim} from 'models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {mockCivilClaim} from '../../../../utils/mockDraftStore';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Claim - Claim Submitted', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');
  app.locals.draftStoreClient = mockCivilClaim;

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
      client: new Redis(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should return claim submitted page', async () => {

      const caseData = Object.assign(new Claim(), claim.case_data);
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);

      (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
        client: new Redis(),
      }));

      const spySave = jest.spyOn(CivilServiceClient.prototype, 'submitClaimAfterPayment');

      await request(app)
        .get(CLAIM_FEE_URL)
        .expect((res) => {
          expect(spySave).toBeCalled();
        });
    });
  });
});
