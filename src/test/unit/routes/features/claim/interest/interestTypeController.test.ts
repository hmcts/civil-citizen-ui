import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {
  CLAIM_INTEREST_RATE_URL,
  CLAIM_INTEREST_TOTAL_URL,
  CLAIM_INTEREST_TYPE_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {
  InterestClaimOptionsType,
} from 'form/models/claim/interest/interestClaimOptionsType';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Interest type controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should display interest type page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const response = await request(app).get(CLAIM_INTEREST_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('How do you want to claim interest?');
    });

    it('should return status 500 when error is thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIM_INTEREST_TYPE_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should display interest type page if there is no selection', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const response = await request(app).post(CLAIM_INTEREST_TYPE_URL);
      expect(response.status).toBe(200);
      expect(response.text).toContain('How do you want to claim interest?');
    });

    it('should redirect to the interest total if same rate for the whole period is selected', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).post(CLAIM_INTEREST_TYPE_URL).send({interestType: InterestClaimOptionsType.SAME_RATE_INTEREST}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_INTEREST_RATE_URL);
      });
    });

    it('should redirect to the break down interest if break down interest for different periods or items is selected', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).post(CLAIM_INTEREST_TYPE_URL).send({interestType: InterestClaimOptionsType.BREAK_DOWN_INTEREST}).then((response) => {
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(CLAIM_INTEREST_TOTAL_URL);
      });
    });

    it('should render page if non-existent party type is provided', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .post(CLAIM_INTEREST_TYPE_URL)
        .send({foo: 'blah'})
        .expect((response: Response) => {
          expect(response.status).toBe(200);
          expect(response.text).toContain(TestMessages.VALID_INTEREST_TYPE_OPTION);
        });
    });

    it('should return something went wrong page if redis failure occurs', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIM_INTEREST_TYPE_URL)
        .send({interestType: InterestClaimOptionsType.SAME_RATE_INTEREST})
        .expect((response: Response) => {
          expect(response.status).toBe(500);
          expect(response.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
