import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_INTEREST_END_DATE_URL, CLAIM_INTEREST_START_DATE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';
import {InterestStartDate} from 'form/models/interest/interestStartDate';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetInterest = getInterest as jest.Mock;
const mockSaveInterest = saveInterest as jest.Mock;

describe('interest start date', () => {
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
    it('should return interest start date page empty when there is no saved interest start date', async () => {
      await request(app)
        .get(CLAIM_INTEREST_START_DATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.INTEREST_START_DATE);
        });

      expect(mockGetInterest).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_START_DATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should save interest start date when the form is valid', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });

      expect(mockSaveInterest).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(InterestStartDate),
        'interestStartDate',
      );
    });

    it('should return errors on no input', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .send('reason=')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
          expect(res.text).toMatch(/Enter why you(?:'|\u2019|&#39;|&apos;)re claiming from this date/);
        });

      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should return error on year less than 1872', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return error on empty year', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return error on future date', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CORRECT_DATE_NOT_IN_FUTURE'));
        });
    });

    it('should return error 4 digit year', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res: request.Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should accept a valid input', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to interest end date page', async () => {
      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CLAIM_INTEREST_END_DATE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_START_DATE_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .send('reason=test')
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
