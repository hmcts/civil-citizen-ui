import {CLAIM_FEE_URL} from 'routes/urls';

import nock from 'nock';
import request from 'supertest';
import config from 'config';
import {CivilServiceClient} from '../../../../../main/app/client/civilServiceClient';

const {app} = require('../../../../../main/app');

import {
  getClaimById,
  getRedisStoreForSession,
} from '../../../../../main/modules/utilityService';
import {Claim} from "models/claim";
import claim from "../../../../utils/mocks/civilClaimResponseMock.json";
import RedisStore from "connect-redis";
import Redis from "ioredis";

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

jest.mock('./../../../../main/app/client/civilServiceClient', () => ({
  submitClaimAfterPayment: jest.fn(),
}));

describe('Claim - Claim Submitted', () => {
  const idamServiceUrl: string = config.get('services.idam.url');
  const citizenRoleToken: string = config.get('citizenRoleToken');

  // const claimId = '1111111111';

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
      client: new Redis(),
    }));
  });

  describe('on GET', () => {
    it('should return claim submitted page', async () => {

      // app.locals.draftStoreClient = mockCivilClaim;
      const caseData = Object.assign(new Claim(), claim.case_data);
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);

      (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
        client: new Redis(),
      }));

      const CivilServiceClientServiceMock = jest
        .spyOn(CivilServiceClient.prototype, 'submitClaimAfterPayment');

      await request(app)
        .get(CLAIM_FEE_URL)
        .expect((res) => {
          expect(res.status).toBe(200)
          expect(CivilServiceClientServiceMock).toBeCalled();
        });
    });
  });
});
