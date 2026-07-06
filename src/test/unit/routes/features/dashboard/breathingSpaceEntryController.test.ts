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
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_ENTER_URL,
  BREATHING_SPACE_INFO_URL,
} from 'routes/urls';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Breathing Space Entry Controller', () => {
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

  it('should return breathing space type and reference page', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .get(BREATHING_SPACE_ENTER_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter breathing space');
        expect(res.text).toContain('Breathing space type and reference');
        expect(res.text).toContain('What type of breathing space is it?');
        expect(res.text).toContain('Mental Health Crisis Moratorium');
        expect(res.text).toContain('Standard Breathing Space');
        expect(res.text).toContain('Reference number (optional)');
        expect(res.text).toContain('You can find this on the notification you received from the Insolvency Service');
        expect(res.text).toContain('Continue');
        expect(res.text).toContain('Previous');
        expect(res.text).toContain('Cancel');
        expect(res.text).toContain(BREATHING_SPACE_INFO_URL);
        expect(res.text).toContain(BREATHING_SPACE_CANCEL_URL);
      });
  });

  it('should re-render page with submitted values on post', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data);
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .post(BREATHING_SPACE_ENTER_URL)
      .send({
        type: BreathingSpaceType.STANDARD,
        reference: 'REF123',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('value="REF123"');
        expect(res.text).toContain(`value="${BreathingSpaceType.STANDARD}"`);
      });
  });
});
