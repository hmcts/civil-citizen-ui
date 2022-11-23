import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from 'app';
import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {CLAIM_CONTINUE_CLAIMING_INTEREST, CLAIM_TOTAL_INTEREST_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getInterest, saveInterest} from '../services/features/claim/interest/interestService';
import {Claim} from 'common/models/claim';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');
jest.mock('../services/features/claim/interest/interestService');
const getInterestMock = getInterest as jest.Mock;
const saveInterestMock = saveInterest as jest.Mock;

describe('Claim Total Interest Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should render total claim interest controller', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIM_TOTAL_INTEREST_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What is the total interest for your claim?');
      });
    });

    it('should render total claim interest controller with set data', async () => {
      getInterestMock.mockImplementationOnce(async () => {
        const claim = new Claim();
        claim.interest = {
          totalInterest: {
            amount: 8,
            reason: '99 reasons',
          },
        };
        return claim;
      });
      await request(app).get(CLAIM_TOTAL_INTEREST_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What is the total interest for your claim?');
      });
    });

    it('should return 500 status code when error occurs', async () => {
      getInterestMock.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).get(CLAIM_TOTAL_INTEREST_URL).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });

  describe('on POST', () => {
    it('should render page with errors', async () => {
      getInterestMock.mockImplementationOnce(async () => {
        return new Claim();
      });

      await request(app).post(CLAIM_TOTAL_INTEREST_URL).send({amount: '', reason: ''}).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Enter a valid amount');
        expect(res.text).toContain('You must tell us how you calculated the amount');
      });
    });

    it('should redirect to the continue claiming interest page', async () => {
      getInterestMock.mockImplementationOnce(async () => {
        return new Claim();
      });

      await request(app).post(CLAIM_TOTAL_INTEREST_URL).send({amount: '8', reason: '99 reasons'}).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toBe(CLAIM_CONTINUE_CLAIMING_INTEREST);
      });
    });

    it('should return 500 status code when error occurs', async () => {
      saveInterestMock.mockImplementationOnce(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app).post(CLAIM_TOTAL_INTEREST_URL).send({amount: '321', reason: 'my reason'}).expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
    });
  });
});
