import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {SameRateInterestType} from 'form/models/claimDetails';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';
import {HowMuchContinueClaiming} from 'form/models/interest/howMuchContinueClaiming';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetInterest = getInterest as jest.Mock;
const mockSaveInterest = saveInterest as jest.Mock;

describe('How Much Continue Claiming Page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInterest.mockResolvedValue(new Interest());
    mockSaveInterest.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should return on how much continue claiming page successfully', async () => {
      await request(app)
        .get(CLAIM_INTEREST_HOW_MUCH_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.HOW_MUCH_CONTINUE.TITLE'));
        });

      expect(mockGetInterest).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_HOW_MUCH_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to help with fees page when interest is provided with 8% rate', async () => {
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
          dailyInterestAmount: null,
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_HELP_WITH_FEES_URL);
          expect(mockSaveInterest).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(HowMuchContinueClaiming),
            'howMuchContinueClaiming',
          );
        });
    });

    it('should redirect to help with fees page when interest is provided with specific daily rate', async () => {
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: 100.10,
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should return error when no option selected', async () => {
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: undefined,
          dailyInterestAmount: null,
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CHOOSE_TYPE_OF_INTEREST'));
        });

      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should return error when specific daily amount selected and not provided', async () => {
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: null,
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_AMOUNT'));
        });
    });

    it('should return error when specific daily amount selected and more than two decimal places', async () => {
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: 100.123,
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_TWO_DECIMAL_NUMBER'));
        });
    });

    it('should return status 500 when there is error', async () => {
      mockSaveInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: 100.10,
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
