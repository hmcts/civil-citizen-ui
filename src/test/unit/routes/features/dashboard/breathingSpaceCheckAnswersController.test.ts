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
  BREATHING_SPACE_CYA_URL,
  BREATHING_SPACE_ENTER_URL,
  BREATHING_SPACE_START_DATE_URL,
} from 'routes/urls';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Breathing Space Check Answers Controller', () => {
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

  it('should render check your answers with draft values', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data, {
      breathingSpaceEnterDraft: new BreathingSpaceEnterDraft(
        BreathingSpaceType.STANDARD,
        'REF123',
        new Date(2024, 0, 15),
        new Date(2024, 2, 15),
      ),
    });
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);

    await request(app)
      .get(BREATHING_SPACE_CYA_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Check your answers');
        expect(res.text).toContain('What type is it?');
        expect(res.text).toContain('Standard Breathing Space');
        expect(res.text).toContain('Reference number (optional)');
        expect(res.text).toContain('REF123');
        expect(res.text).toContain('Start date (optional)');
        expect(res.text).toContain('15 January 2024');
        expect(res.text).toContain('Change');
        expect(res.text).toContain('Continue');
        expect(res.text).not.toContain('Previous');
        expect(res.text).toContain('Cancel');
        expect(res.text).toContain(BREATHING_SPACE_ENTER_URL);
        expect(res.text).toContain(BREATHING_SPACE_START_DATE_URL);
        expect(res.text).toContain(BREATHING_SPACE_CANCEL_URL);
      });
  });

  it('should link back to the start date page', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data, {
      breathingSpaceEnterDraft: new BreathingSpaceEnterDraft(
        BreathingSpaceType.STANDARD,
        'REF123',
        new Date(2024, 0, 15),
      ),
    });
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);

    await request(app)
      .get(BREATHING_SPACE_CYA_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(BREATHING_SPACE_START_DATE_URL);
        expect(res.text).toContain('Change');
        expect(res.text).toContain(BREATHING_SPACE_ENTER_URL);
      });
  });

  it('should render mental health type label', async () => {
    const caseData = Object.assign(new Claim(), claim.case_data, {
      breathingSpaceEnterDraft: new BreathingSpaceEnterDraft(
        BreathingSpaceType.MENTAL_HEALTH,
        '',
        new Date(2024, 5, 1),
        null,
      ),
    });
    (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);

    await request(app)
      .get(BREATHING_SPACE_CYA_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mental Health Crisis Moratorium');
        expect(res.text).toContain('1 June 2024');
      });
  });
});
