import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import request from 'supertest';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_CONTINUE_CLAIMING_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';
import {YesNo} from 'form/models/yesNo';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetInterest = getInterest as jest.Mock;
const mockSaveInterest = saveInterest as jest.Mock;

describe('Continue Claiming Interest page', () => {
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
    it('should return on continue claiming interest page successfully', async () => {
      await request(app)
        .get(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.CONTINUE_CLAIMING_INTEREST.TITLE'));
        });

      expect(mockGetInterest).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return status 500 when error thrown', async () => {
      mockGetInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should return error message when no option selected', async () => {
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CLAIM_INTEREST_REQUIRED'));
        });

      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should redirect to the How much do you want to continue claiming screen when option is Yes', async () => {
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .send({option: 'yes'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_INTEREST_HOW_MUCH_URL);
          expect(mockSaveInterest).toHaveBeenCalledWith(
            expect.any(Object),
            YesNo.YES,
            'continueClaimingInterest',
          );
        });
    });

    it('should redirect to the Help with fees screen when option is No', async () => {
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .send({option: 'no'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockSaveInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .send({option: 'yes'})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
