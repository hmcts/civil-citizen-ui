import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CLAIMANT_DOB_URL, CLAIMANT_PHONE_NUMBER_URL} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {
  addDaysToDate,
  formatDateToFullDate,
  getDOBforAgeFromCurrentTime,
} from 'common/utils/dateUtils';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import { Claim } from 'common/models/claim';
import noStatementOfMeansMock from '../../../../utils/mocks/noStatementOfMeansMock.json';

jest.mock('../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Claimant Date of Birth Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('on GET', () => {
    it('should render date of birth page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should render date of birth page with values', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), noStatementOfMeansMock.case_data);
      });
      const res = await request(app).get(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CLAIMANT_DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should render date of birth page if there are form errors', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const res = await request(app).post(CLAIMANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('What is your date of birth?');
    });

    it('should show validation error for claimant under 18', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      const today = new Date();
      const maxDate = formatDateToFullDate(addDaysToDate(getDOBforAgeFromCurrentTime(18), 1), 'en');
      await request(app).post(CLAIMANT_DOB_URL)
        .send({ day:today.getDate(), month:today.getMonth(), year: today.getFullYear() - 16 })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_ENTER_A_DATE_BEFORE', { maxDate }));
        });
    });

    it('should redirect to the claimant phone number page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app).post(CLAIMANT_DOB_URL)
        .send({day: 2, month: 3, year: 1980})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(CLAIMANT_PHONE_NUMBER_URL);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CLAIMANT_DOB_URL)
        .send({day: 4, month: 5, year: 1952})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
