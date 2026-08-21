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
  BREATHING_SPACE_CONFIRMATION_URL,
  DASHBOARD_CLAIMANT_URL,
} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {caseNumberPrettify} from 'common/utils/stringUtils';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {
  getBreathingSpaceConfirmationNextContent,
  getBreathingSpaceConfirmationPanelTitle,
} from 'services/features/dashboard/breathingSpaceEntryService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
  getRedisStoreForSession: jest.fn(),
}));

describe('Breathing Space Confirmation Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claimId = '1645882162449409';

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

  describe('confirmation copy helpers', () => {
    it('should return type-specific panel titles', () => {
      expect(getBreathingSpaceConfirmationPanelTitle(BreathingSpaceType.MENTAL_HEALTH))
        .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_APPLIED');
      expect(getBreathingSpaceConfirmationPanelTitle(BreathingSpaceType.STANDARD))
        .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_APPLIED');
      expect(getBreathingSpaceConfirmationPanelTitle(undefined))
        .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_APPLIED');
    });

    it('should return what-happens-next content for today and past start dates', () => {
      const today = new Date();
      const past = new Date(2024, 0, 15);

      expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.STANDARD, today))
        .toEqual({key: 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_NEXT_NOW'});
      expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.STANDARD, past).key)
        .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_NEXT_FROM');
      expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.STANDARD, past).variables?.startDate)
        .toBeDefined();
      expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.MENTAL_HEALTH, today))
        .toEqual({key: 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_NEXT_NOW'});
      expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.MENTAL_HEALTH, past).key)
        .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_NEXT_FROM');
    });
  });

  describe('on GET', () => {
    it('should render confirmation page matching design content', async () => {
      const caseData = Object.assign(new Claim(), claim.case_data);
      (getClaimById as jest.Mock).mockResolvedValueOnce(caseData);

      await request(app)
        .get(BREATHING_SPACE_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Standard breathing space applied');
          expect(res.text).toContain('Case number:');
          expect(res.text).toContain(caseNumberPrettify(caseData.legacyCaseReference));
          expect(res.text).toContain('We have sent you a confirmation email.');
          expect(res.text).toContain('What happens next');
          expect(res.text).toContain('Breathing space will now be active. You can lift it when you know when it will end.');
          expect(res.text).toContain('Return to your case summary');
          expect(res.text).toContain(constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL));
          expect(res.text).toContain('Help and support');
        });
    });

    it('should return http 500 when getClaimById fails', async () => {
      (getClaimById as jest.Mock).mockRejectedValueOnce(new Error('Redis failure'));

      await request(app)
        .get(BREATHING_SPACE_CONFIRMATION_URL.replace(':id', claimId))
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
