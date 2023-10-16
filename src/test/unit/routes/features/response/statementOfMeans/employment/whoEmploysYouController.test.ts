import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {t} from 'i18next';
import {
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_COURT_ORDERS_URL,
  CITIZEN_SELF_EMPLOYED_URL,
} from '../../../../../../../main/routes/urls';
import {mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

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

const mockEmployed = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(mockRedisEmployed))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockEmployedAndSelfEmployed = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(mockRedisEmployedAndSelfEmployed))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

const mockSelfEmployed = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(mockRedisSelfEmployed))),
  ttl: jest.fn(() => Promise.resolve({})),
  expireat: jest.fn(() => Promise.resolve({})),
};

jest.mock('../../../../../../../main/modules/oidc');

describe('Who employs you', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return who employs you page successfully', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.WHO_EMPLOYS_YOU);
        });
    });

    it('should return who employs you page with data from redis', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.WHO_EMPLOYS_YOU);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
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
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: '', jobTitle: ''}]})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_ENTER_AT_LEAST_ONE_EMPLOYER'));
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return error message when jobTitle is empty', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: 'Test', jobTitle: ''}]})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.JOB_TITLE_REQUIRED'));
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should create statementOfMeans if empty', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should redirect to self-employment page when employment type is employed and self-employed', async () => {
      app.locals.draftStoreClient = mockEmployedAndSelfEmployed;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_SELF_EMPLOYED_URL);
        });
    });

    it('should redirect to courts order page when employment type is employed', async () => {
      app.locals.draftStoreClient = mockEmployed;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });

    it('should redirect to error page when employment type is self-employed and user is on this page', async () => {
      app.locals.draftStoreClient = mockSelfEmployed;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
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
