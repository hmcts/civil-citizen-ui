import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {getElementsByXPath} from '../../../../../../utils/xpathExtractor';
import {
  CITIZEN_WHO_EMPLOYS_YOU_URL,
  CITIZEN_COURT_ORDERS_URL,
  CITIZEN_SELF_EMPLOYED_URL,
} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {
  VALID_ENTER_AT_LEAST_ONE_EMPLOYER,
  VALID_ENTER_AN_EMPLOYER_NAME,
  VALID_ENTER_A_JOB_TITLE,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const mockEmployer = {rows: [{employerName: 'Felipe', jobTitle: 'Developer'}]};

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
      .reply(200, {id_token: citizenRoleToken});
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
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should return error message when form is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: '', jobTitle: ''}]})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_ENTER_AT_LEAST_ONE_EMPLOYER);
          expect(res.text).toContain('govuk-error-message');
        });
    });

    it('should return error message when employerName is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const response = await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: '', jobTitle: 'Test'}]});

      expect(response.status).toBe(200);

      const dom = new JSDOM(response.text);
      const htmlDocument = dom.window.document;
      const summaryErrors = getElementsByXPath("//a[@href='#rows[0][employerName]']", htmlDocument);
      const formGroupErrors = getElementsByXPath("//div[contains(@class,'govuk-form-group--error') and not(input)]/p", htmlDocument);
      const employerNameInputErrors = getElementsByXPath("//input[contains(@id,'rows[0][employerName]')]/preceding-sibling::p[@class='govuk-error-message']", htmlDocument);
      const jobTitleInputErrors = getElementsByXPath("//input[contains(@id,'rows[0][jobTitle]')]/preceding-sibling::p[@class='govuk-error-message']", htmlDocument);

      expect(summaryErrors.length).toBe(1);
      expect(summaryErrors[0].textContent).toBe(VALID_ENTER_AN_EMPLOYER_NAME);
      expect(formGroupErrors.length).toBe(0);
      expect(employerNameInputErrors.length).toBe(1);
      expect(employerNameInputErrors[0].textContent).toContain(VALID_ENTER_AN_EMPLOYER_NAME);
      expect(jobTitleInputErrors.length).toBe(0);
    });

    it('should return error message when jobTitle is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).post(CITIZEN_WHO_EMPLOYS_YOU_URL)
        .send({rows: [{employerName: 'Test', jobTitle: ''}]})
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
