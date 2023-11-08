import request from 'supertest';
import nock from 'nock';
import config from 'config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {app} from '../../../../../main/app';
import {CITIZEN_CONTACT_THEM_URL} from 'routes/urls';
import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import {Claim} from 'common/models/claim';

import claim from '../../../../utils/mocks/civilClaimResponseMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Claimant details', () => {
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
  describe('on GET', () => {
    it('should return contact claimant details from claim', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data);
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
      await request(app)
        .get(CITIZEN_CONTACT_THEM_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Claimant');
          expect(res.text).toContain('Address');
          expect(res.text).toContain('Phone:');
          expect(res.text).toContain('About claim');
          expect(res.text).toContain('Claimant name:');
          expect(res.text).toContain('Claim amount:');
          expect(res.text).toContain('Claim details:');
          expect(res.text).toContain('Contact us for help');
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.partyName);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine1);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine2);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.addressLine3);
          expect(res.text).toContain(claim.case_data.respondent1.partyDetails.primaryAddress.postCode);
        });
    });

  });
});
