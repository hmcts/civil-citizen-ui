import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {CLAIM_INTEREST_DATE_URL, CLAIM_INTEREST_START_DATE_URL, CLAIM_HELP_WITH_FEES_URL} from 'routes/urls';
import {
  civilClaimResponseMock,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {InterestClaimFromType} from 'form/models/claimDetails';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import noStatementOfMeansMock from '../../../../../utils/mocks/noStatementOfMeansMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Claimant Interest From Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseMock.case_data);
    });
  });

  describe('on GET', () => {
    it('should render claimant interest from page', async () => {
      const res = await request(app).get(CLAIM_INTEREST_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('When are you claiming interest from?');
    });

    it('should render date of birth page with values', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });
      const res = await request(app).get(CLAIM_INTEREST_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('When are you claiming interest from?');
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_INTEREST_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render claimant interest from page if there are form errors', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).post(CLAIM_INTEREST_DATE_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('There was a problem');
    });

    it('should redirect to the help with fees page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });

      await request(app).post(CLAIM_INTEREST_DATE_URL)
        .send({'option': InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should redirect to the interest enter date from page', async () => {
      await request(app).post(CLAIM_INTEREST_DATE_URL)
        .send({'option': InterestClaimFromType.FROM_A_SPECIFIC_DATE})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIM_INTEREST_START_DATE_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_INTEREST_DATE_URL)
        .send({'option': InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
