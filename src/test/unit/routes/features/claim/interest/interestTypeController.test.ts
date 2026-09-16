import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  CLAIM_INTEREST_RATE_URL,
  CLAIM_INTEREST_TOTAL_URL,
  CLAIM_INTEREST_TYPE_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  InterestClaimOptionsType,
} from 'form/models/claim/interest/interestClaimOptionsType';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const mockGetInterest = getInterest as jest.Mock;
const mockSaveInterest = saveInterest as jest.Mock;

describe('Interest type controller', () => {
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
    it('should display interest type page', async () => {
      const response = await request(app).get(CLAIM_INTEREST_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('How do you want to claim interest?');
      expect(mockGetInterest).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should return status 500 when error is thrown', async () => {
      mockGetInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .get(CLAIM_INTEREST_TYPE_URL)
        .expect((res: request.Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should display interest type page if there is no selection', async () => {
      const response = await request(app).post(CLAIM_INTEREST_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('How do you want to claim interest?');
      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should redirect to the interest total if same rate for the whole period is selected', async () => {
      await request(app)
        .post(CLAIM_INTEREST_TYPE_URL)
        .send({interestType: InterestClaimOptionsType.SAME_RATE_INTEREST})
        .then((response) => {
          expect(response.status).toBe(302);
          expect(response.header.location).toBe(CLAIM_INTEREST_RATE_URL);
          expect(mockSaveInterest).toHaveBeenCalledWith(
            expect.any(Object),
            InterestClaimOptionsType.SAME_RATE_INTEREST,
            'interestClaimOptions',
          );
        });
    });

    it('should redirect to the break down interest if break down interest for different periods or items is selected', async () => {
      await request(app)
        .post(CLAIM_INTEREST_TYPE_URL)
        .send({interestType: InterestClaimOptionsType.BREAK_DOWN_INTEREST})
        .then((response) => {
          expect(response.status).toBe(302);
          expect(response.header.location).toBe(CLAIM_INTEREST_TOTAL_URL);
          expect(mockSaveInterest).toHaveBeenCalledWith(
            expect.any(Object),
            InterestClaimOptionsType.BREAK_DOWN_INTEREST,
            'interestClaimOptions',
          );
        });
    });

    it('should render page if non-existent party type is provided', async () => {
      await request(app)
        .post(CLAIM_INTEREST_TYPE_URL)
        .send({foo: 'blah'})
        .expect((response: request.Response) => {
          expect(response.status).toBe(200);
          expect(response.text).toContain(TestMessages.VALID_INTEREST_TYPE_OPTION);
        });

      expect(mockSaveInterest).not.toHaveBeenCalled();
    });

    it('should return something went wrong page if save fails', async () => {
      mockSaveInterest.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app)
        .post(CLAIM_INTEREST_TYPE_URL)
        .send({interestType: InterestClaimOptionsType.SAME_RATE_INTEREST})
        .expect((response: request.Response) => {
          expect(response.status).toBe(500);
          expect(response.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
