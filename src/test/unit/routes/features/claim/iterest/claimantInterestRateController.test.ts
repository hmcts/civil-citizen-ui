import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CLAIM_INTEREST_RATE_URL,
  CLAIM_INTEREST_DATE_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {SameRateInterestType} from 'form/models/claimDetails';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';
import {ClaimantInterestRate} from 'form/models/claim/interest/claimantInterestRate';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetInterest = getInterest as jest.Mock;
const mockSaveInterest = saveInterest as jest.Mock;

describe('Claimant Interest Rate', () => {
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
    it('should return on your claimant interest rate page successfully', async () => {
      await request(app)
        .get(CLAIM_INTEREST_RATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE'));
        });

      expect(mockGetInterest).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return 500 status code when error occurs', async () => {
      mockGetInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_RATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should redirect to task list when interest is provided with different rate', async () => {
      await request(app)
        .post(CLAIM_INTEREST_RATE_URL)
        .send({
          sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          differentRate: 40,
          reason: 'Reasons....',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_INTEREST_DATE_URL);
          expect(mockSaveInterest).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(ClaimantInterestRate),
            'sameRateInterestSelection',
          );
        });
    });

    it('should redirect to task list when interest is provided with 8% rate', async () => {
      await request(app)
        .post(CLAIM_INTEREST_RATE_URL)
        .send({
          sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
          differentRate: '',
          reason: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_INTEREST_DATE_URL);
        });
    });

    it('should return error when different interest selected and not provided', async () => {
      await request(app)
        .post(CLAIM_INTEREST_RATE_URL)
        .send({
          sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          differentRate: '',
          reason: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.RATE_CORRECT_THE_ONE_ENTERED'));
        });

      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should return error when different interest selected and not reasons not provided', async () => {
      await request(app)
        .post(CLAIM_INTEREST_RATE_URL)
        .send({
          sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          differentRate: 40,
          reason: '',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return error when negative interest rate is provided', async () => {
      const mockClaim = new Claim();
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(mockClaim));
      mockGetCaseDataFromStore.mockResolvedValue(mockClaim);

      await request(app)
        .post(CLAIM_INTEREST_RATE_URL)
        .send({
          sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          differentRate: -5,
          reason: 'Reasons....',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEREST_RATE);
          expect(res.header.location).toBeUndefined();
        });
    });

    it('should return status 500 when there is error', async () => {
      mockSaveInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_RATE_URL)
        .send({
          sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          differentRate: 40,
          reason: 'Reasons....',
        })
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
