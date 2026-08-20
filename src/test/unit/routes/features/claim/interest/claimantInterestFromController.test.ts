import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_INTEREST_DATE_URL, CLAIM_INTEREST_START_DATE_URL, CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {InterestClaimFromType} from 'form/models/claimDetails';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetInterest = getInterest as jest.Mock;
const mockSaveInterest = saveInterest as jest.Mock;

describe('Claimant Interest From Controller', () => {
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
    it('should render claimant interest from page', async () => {
      const res = await request(app).get(CLAIM_INTEREST_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('When are you claiming interest from?');
      expect(mockGetInterest).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should render date of birth page with values', async () => {
      mockGetInterest.mockResolvedValue({interestClaimFrom: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE});

      const res = await request(app).get(CLAIM_INTEREST_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('When are you claiming interest from?');
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_DATE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render claimant interest from page if there are form errors', async () => {
      const res = await request(app).post(CLAIM_INTEREST_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should redirect to the help with fees page', async () => {
      await request(app).post(CLAIM_INTEREST_DATE_URL)
        .send({'option': InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_HELP_WITH_FEES_URL);
          expect(mockSaveInterest).toHaveBeenCalledWith(
            expect.any(Object),
            InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE,
            'interestClaimFrom',
          );
        });
    });

    it('should redirect to the interest enter date from page', async () => {
      await request(app).post(CLAIM_INTEREST_DATE_URL)
        .send({'option': InterestClaimFromType.FROM_A_SPECIFIC_DATE})
        .expect((res: request.Response) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_INTEREST_START_DATE_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_DATE_URL)
        .send({'option': InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE})
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
