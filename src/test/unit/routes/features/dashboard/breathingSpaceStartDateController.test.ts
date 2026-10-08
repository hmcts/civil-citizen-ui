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
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import * as breathingSpaceEntryService from 'services/features/dashboard/breathingSpaceEntryService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('services/features/dashboard/breathingSpaceEntryService', () => {
  const actual = jest.requireActual('services/features/dashboard/breathingSpaceEntryService');
  return {
    ...actual,
    saveBreathingSpaceStartDate: jest.fn(),
  };
});

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

  const claimWithStandardType = () => Object.assign(new Claim(), claim.case_data, {
    breathingSpaceEnterDraft: new BreathingSpaceEnterDraft(BreathingSpaceType.STANDARD, 'REF123'),
  });

  const claimWithMentalHealthType = () => Object.assign(new Claim(), claim.case_data, {
    breathingSpaceEnterDraft: new BreathingSpaceEnterDraft(BreathingSpaceType.MENTAL_HEALTH, 'REF123'),
  });

  it('should show standard intro when standard type is selected', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithStandardType());
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
        expect(res.text).not.toContain('Previous');
        expect(res.text).toContain('Cancel');
        expect(res.text).toContain(BREATHING_SPACE_ENTER_URL);
        expect(res.text).toContain(BREATHING_SPACE_CANCEL_URL);
      });
  });

  it('should show mental health intro when mental health type is selected', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithMentalHealthType());
    await request(app)
      .get(BREATHING_SPACE_START_DATE_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Mental health crisis breathing space will start from today, unless you enter a different start date.');
        expect(res.text).toContain('It will remain until you lift it.');
        expect(res.text).toContain('When did breathing space start? (optional)');
      });
  });

  it('should save blank optional start date as today', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithStandardType());
    (breathingSpaceEntryService.saveBreathingSpaceStartDate as jest.Mock).mockResolvedValueOnce(undefined);
    const today = new Date();
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: '',
        month: '',
        year: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Breathing space start date');
        expect(res.text).toContain(`value="${today.getDate()}"`);
        expect(res.text).toContain(`value="${today.getMonth() + 1}"`);
        expect(res.text).toContain(`value="${today.getFullYear()}"`);
        expect(res.text).not.toContain('Start date must be a real date');
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).toHaveBeenCalled();
        const [, start] = (breathingSpaceEntryService.saveBreathingSpaceStartDate as jest.Mock).mock.calls[0];
        expect(start.getDate()).toBe(today.getDate());
        expect(start.getMonth()).toBe(today.getMonth());
        expect(start.getFullYear()).toBe(today.getFullYear());
      });
  });

  it('should save blank start date for mental health type', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithMentalHealthType());
    (breathingSpaceEntryService.saveBreathingSpaceStartDate as jest.Mock).mockResolvedValueOnce(undefined);
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: '',
        month: '',
        year: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).toHaveBeenCalledTimes(1);
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).toHaveBeenCalledWith(
          expect.anything(),
          expect.any(Date),
        );
      });
  });

  it('should accept a valid past start date and save it', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithStandardType());
    (breathingSpaceEntryService.saveBreathingSpaceStartDate as jest.Mock).mockResolvedValueOnce(undefined);
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: '15',
        month: '1',
        year: '2024',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Breathing space start date');
        expect(res.text).toContain('value="15"');
        expect(res.text).toContain('value="1"');
        expect(res.text).toContain('value="2024"');
        expect(res.text).not.toContain('Start date must be a real date');
        expect(res.text).not.toContain('Start date cannot be in the future');
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).toHaveBeenCalled();
      });
  });

  it('should show error when start date is not a real date', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithStandardType());
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: '35',
        month: '1',
        year: '2024',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Start date must be a real date');
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).not.toHaveBeenCalled();
      });
  });

  it('should show error when start date is incomplete', async () => {
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithStandardType());
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: '3',
        month: '10',
        year: '',
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Start date must include a year');
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).not.toHaveBeenCalled();
      });
  });

  it('should show error when start date is in the future', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    (getClaimById as jest.Mock).mockResolvedValueOnce(claimWithStandardType());
    await request(app)
      .post(BREATHING_SPACE_START_DATE_URL)
      .send({
        day: String(tomorrow.getDate()),
        month: String(tomorrow.getMonth() + 1),
        year: String(tomorrow.getFullYear()),
      })
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Start date cannot be in the future');
        expect(breathingSpaceEntryService.saveBreathingSpaceStartDate).not.toHaveBeenCalled();
      });
  });
});
