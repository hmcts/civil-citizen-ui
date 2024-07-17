import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_COURT_ORDERS_URL, CITIZEN_UNEMPLOYED_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import civilClaimResponseOptionNoMock from '../../../../../../utils/mocks/civilClaimResponseOptionNoMock.json';
import civilClaimResponseUnemploymentRetired
  from '../../../../../../utils/mocks/civilClaimResponseUnemploymentRetiredMock.json';
import civilClaimResponseUnemploymentOther
  from '../../../../../../utils/mocks/civilClaimResponseUnemploymentOtherMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Unemployment', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return unemployment page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully without statementofmeans', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should redirect to response task-list page without claim', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), undefined);
      });
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return unemployment page successfully without unemployment', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseOptionNoMock.case_data);
      });
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully when retired', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseUnemploymentRetired.case_data);
      });
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return unemployment page successfully when other', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseUnemploymentOther.case_data);
      });
      await request(app).get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you unemployed or retired?');
        });
    });
    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_UNEMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    beforeEach(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
    });
    it('should return error message when any option is selected', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send()
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_OPTION_SELECTION);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should redirect to court page option Retired is selected and without statementofmeans', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Retired'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should redirect to court page option Retired is selected', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Retired'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should redirect to response task-list page option Retired is selected without claim data in redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), undefined);
      });
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Retired'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return error message when option Other is selected and detail is empty', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Other'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DETAILS_REQUIRED);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when option Other is selected and detail is has details', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Other', details: 'Test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return error message when option Unemployed is selected and has year and month', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '5', months: '1'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return error message when option Unemployed is selected and year and month are empty', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_INTEGER);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when option Unemployed is selected and year is greater than 80', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '150', months: '1'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_BETWEEN_NUMBERS_0_80);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when option Unemployed is selected and month is greater than 11', async () => {
      await request(app).post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '1', months: '12'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_BETWEEN_NUMBERS_0_11);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_UNEMPLOYED_URL)
        .send({option: 'Unemployed', years: '1', months: '11'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
