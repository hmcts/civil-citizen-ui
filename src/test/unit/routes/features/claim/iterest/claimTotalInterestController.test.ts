import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_INTEREST_TOTAL_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getInterest, saveInterest} from 'services/features/claim/interest/interestService';
import {Interest} from 'form/models/interest/interest';
import {TotalInterest} from 'form/models/interest/totalInterest';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('services/features/claim/interest/interestService');
jest.mock('routes/guards/claimIssueTaskListGuard', () => ({
  claimIssueTaskListGuard: jest.fn((req, res, next) => next()),
}));

const getInterestMock = getInterest as jest.Mock;
const saveInterestMock = saveInterest as jest.Mock;

describe('Claim Total Interest Controller', () => {
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
    getInterestMock.mockResolvedValue(new Interest());
    saveInterestMock.mockResolvedValue(undefined);
  });

  describe('on GET', () => {
    it('should render total claim interest controller', async () => {
      await request(app).get(CLAIM_INTEREST_TOTAL_URL).expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What is the total interest for your claim?');
      });

      expect(getInterestMock).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should render total claim interest controller with set data', async () => {
      const interest = new Interest();
      interest.totalInterest = new TotalInterest('8', '99 reasons');
      getInterestMock.mockResolvedValue(interest);

      await request(app).get(CLAIM_INTEREST_TOTAL_URL).expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What is the total interest for your claim?');
      });
    });

    it('should return 500 status code when error occurs', async () => {
      getInterestMock.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app).get(CLAIM_INTEREST_TOTAL_URL).expect((res: request.Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render page with errors', async () => {
      await request(app).post(CLAIM_INTEREST_TOTAL_URL).send({amount: '', reason: ''}).expect((res: request.Response) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter total interest amount');
        expect(res.text).toContain('Enter how you calculated the amount');
      });

      expect(saveInterestMock).not.toHaveBeenCalled();
    });

    it('should redirect to the continue claiming interest page', async () => {
      await request(app).post(CLAIM_INTEREST_TOTAL_URL).send({amount: '8', reason: '99 reasons'}).expect((res: request.Response) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_HELP_WITH_FEES_URL);
        expect(saveInterestMock).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(TotalInterest),
          'totalInterest',
        );
      });
    });

    it('should return 500 status code when error occurs', async () => {
      saveInterestMock.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await request(app).post(CLAIM_INTEREST_TOTAL_URL).send({amount: '321', reason: 'my reason'}).expect((res: request.Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
