import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {t} from 'i18next';
import {
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_COURT_ORDERS_URL,
  CITIZEN_SELF_EMPLOYED_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import fullAdmitPayBySetDateMock from '../../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const mockEmployer = {rows: [{employerName: 'Felipe', jobTitle: 'Developer'}]};

function getMockWithEmploymentType(employmentType: string[]) {
  return {
    'id': 1645882162449409,
    'case_data': {
      'respondent1': {
        'responseType': 'FULL_ADMISSION',
      },
      'fullAdmission': {
        'paymentIntention': {
          'paymentOption': 'BY_SET_DATE',
          'paymentDate': '2023-11-11T00:00:00.000Z',
        },
      },
      'statementOfMeans': {
        'employment': {
          'declared': true,
          'employmentType': employmentType,
        },
      },
    },
  };
}

const mockRedisEmployed = getMockWithEmploymentType(['EMPLOYED']);

const mockRedisEmployedAndSelfEmployed = getMockWithEmploymentType(['EMPLOYED', 'SELF-EMPLOYED']);

const mockRedisSelfEmployed = getMockWithEmploymentType(['SELF-EMPLOYED']);

jest.mock('../../../../../../../main/modules/oidc');

describe('Who employs you', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    it('should return who employs you page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.WHO_EMPLOYS_YOU);
        });
    });

    it('should return who employs you page with data from redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.WHO_EMPLOYS_YOU);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return error message when form is empty', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: '', jobTitle: ''}]})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_ENTER_AT_LEAST_ONE_EMPLOYER'));
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return error message when jobTitle is empty', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: 'Test', jobTitle: ''}]})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.JOB_TITLE_REQUIRED'));
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should create statementOfMeans if empty', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should redirect to self-employment page when employment type is employed and self-employed', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), mockRedisEmployedAndSelfEmployed.case_data);
      });
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_SELF_EMPLOYED_URL);
        });
    });

    it('should redirect to courts order page when employment type is employed', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), mockRedisEmployed.case_data);
      });
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });

    it('should redirect to error page when employment type is self-employed and user is on this page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), mockRedisSelfEmployed.case_data);
      });
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
