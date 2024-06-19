import request from 'supertest';
import nock from 'nock';
import config from 'config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import { app } from '../../../../../main/app';
import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import { Claim } from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {BREATHING_SPACE_INFO_URL} from 'routes/urls';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('View Defendant Information', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
      client: new Redis(),
    }));
  });
  it('should return Breathing Space Information ', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .get(BREATHING_SPACE_INFO_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Inform the court of a breathing space');
        expect(res.text).toContain('Related content');
        expect(res.text).toContain('What you need to do now');
      });
  });
});
