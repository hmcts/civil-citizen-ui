import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_WHO_EMPLOYS_YOU_URL, CITIZEN_COURT_ORDER_URL, CITIZEN_SELF_EMPLOYED_URL} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {VALID_ENTER_AT_LEAST_ONE_EMPLOYER, VALID_ENTER_AN_EMPLOYER_NAME, VALID_ENTER_A_JOB_TITLE} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

const mockEmployer = { employers: [{ employerName: 'Felipe', jobTitle: 'Developer' }] };

const mockRedisEmployed = {
  'id': 1645882162449409,
  'case_data': {
    'statementOfMeans': {
      'employment': {
        'declared': true,
        'employmentType': ['EMPLOYED'],
      },
    },
  },
};

const mockRedisEmployedAndSelfEmployed = {
  'id': 1645882162449409,
  'case_data': {
    'statementOfMeans': {
      'employment': {
        'declared': true,
        'employmentType': ['EMPLOYED', 'SELF-EMPLOYED'],
      },
    },
  },
};

const mockRedisSelfEmployed = {
  'id': 1645882162449409,
  'case_data': {
    'statementOfMeans': {
      'employment': {
        'declared': true,
        'employmentType': ['SELF-EMPLOYED'],
      },
    },
  },
};


const mockEmployed = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(mockRedisEmployed))),
};

const mockEmployedAndSelfEmployed = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(mockRedisEmployedAndSelfEmployed))),
};

const mockSelfEmployed = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(JSON.stringify(mockRedisSelfEmployed))),
};

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Who employs you', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
  describe('on Get', () => {
    it('should return who employs you page successfully', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.WHO_EMPLOYS_YOU);
        });
    });
    it('should return who employs you page with data from redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.WHO_EMPLOYS_YOU);
          expect(res.text).toContain('Felipe');
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
  describe('on Post', () => {
    it('should return error message when form is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({ employers: [{ employerName: '', jobTitle: '' }] })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_AT_LEAST_ONE_EMPLOYER);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when employerName is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({ employers: [{ employerName: '', jobTitle: 'Test' }] })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_AN_EMPLOYER_NAME);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should return error message when jobTitle is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({ employers: [{ employerName: 'Test', jobTitle: '' }] })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_A_JOB_TITLE);
          expect(res.text).toContain('govuk-error-message');
        });
    });
    it('should create statementOfMeans if empty', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
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
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDER_URL);
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
    test('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send(mockEmployer)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.body).toMatchObject({ error: TestMessages.REDIS_FAILURE });
        });
    });
  });
});
