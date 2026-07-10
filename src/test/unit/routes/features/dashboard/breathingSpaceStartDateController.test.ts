import request from 'supertest';
import nock from 'nock';
import config from 'config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import {app} from '../../../../../main/app';
import {
  getClaimById,
  getRedisStoreForSession,
} from 'modules/utilityService';
import {Claim} from 'common/models/claim';
import claim from '../../../../utils/mocks/civilClaimResponseMock.json';
import {
  BREATHING_SPACE_CANCEL_URL,
  BREATHING_SPACE_ENTER_URL,
  BREATHING_SPACE_START_DATE_URL,
} from 'routes/urls';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceTypeAndReference} from 'models/breathingSpace/breathingSpaceTypeAndReference';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Breathing Space Start Date Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    (getRedisStoreForSession as jest.Mock).mockReturnValue(new RedisStore({
      client: new Redis(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should show standard intro when standard type is selected', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data, {
      breathingSpaceTypeAndReference: new BreathingSpaceTypeAndReference(BreathingSpaceType.STANDARD, 'REF123'),
    });
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .get(BREATHING_SPACE_START_DATE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter breathing space');
        expect(res.text).toContain('Breathing space start date');
        expect(res.text).toContain('Breathing space will start from today, unless you enter a different start date.');
        expect(res.text).not.toContain('It will remain until you lift it.');
        expect(res.text).toContain('When did breathing space start? (optional)');
        expect(res.text).toContain('Enter the date it started, not the date you received the notification.');
        expect(res.text).toContain('Continue');
        expect(res.text).toContain('Previous');
        expect(res.text).toContain('Cancel');
        expect(res.text).toContain(BREATHING_SPACE_ENTER_URL);
        expect(res.text).toContain(BREATHING_SPACE_CANCEL_URL);
      });
  });

  it('should show mental health intro when mental health type is selected', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data, {
      breathingSpaceTypeAndReference: new BreathingSpaceTypeAndReference(BreathingSpaceType.MENTAL_HEALTH, 'REF123'),
    });
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .get(BREATHING_SPACE_START_DATE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mental health crisis breathing space will start from today, unless you enter a different start date.');
        expect(res.text).toContain('It will remain until you lift it.');
        expect(res.text).toContain('When did breathing space start? (optional)');
      });
  });

  it('should re-render start date page on post for happy path', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data, {
      breathingSpaceTypeAndReference: new BreathingSpaceTypeAndReference(BreathingSpaceType.STANDARD, 'REF123'),
    });
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: '15',
        month: '11',
        year: '2026',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Breathing space start date');
        expect(res.text).toContain('value="15"');
        expect(res.text).toContain('value="11"');
        expect(res.text).toContain('value="2026"');
      });
  });
});
