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
import { VIEW_DEFENDANT_INFO } from 'routes/urls';

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
      .reply(200, { id_token: citizenRoleToken });
    (getRedisStoreForSession as jest.Mock).mockReturnValueOnce(new RedisStore({
      client: new Redis(),
    }));
  });
  it('should return contact defendant details from claim ', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .get(VIEW_DEFENDANT_INFO)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('View information about the defendant');
        expect(res.text).toContain('Phone:');
        expect(res.text).toContain('Contact us for help');
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.partyName);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine1);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine2);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine3);
        expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.postCode);
      });
  });
})