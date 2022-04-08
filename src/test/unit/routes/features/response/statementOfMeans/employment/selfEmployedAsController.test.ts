import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_SELF_EMPLOYED_URL,ON_TAX_PAYMENTS_URL} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {
  JOB_TITLE_REQUIRED,
  ANNUAL_TURNOVER_REQUIRED,
  AMOUNT_INVALID_DECIMALS,
  VALID_POSITIVE_NUMBER,
} from '../../../../../../../main/common/form/validationErrors/errorMessageConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');

describe('Self Employed As', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });
});

describe('on Get', () => {
  test('should return on self employed page successfully', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(CITIZEN_SELF_EMPLOYED_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('What are you self-employed as?');
      });
  });
  test('should return 500 status code when error occurs', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .get(CITIZEN_SELF_EMPLOYED_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });
});

describe('on Post', () => {
  test('should return error when no input text is filled', async () => {
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send('')
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(JOB_TITLE_REQUIRED);
        expect(res.text).toContain(ANNUAL_TURNOVER_REQUIRED);
      });
  });
  test('should return errors when job title is defined and amount is not defined', async () => {
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: 'Developer', annualTurnover: undefined})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(ANNUAL_TURNOVER_REQUIRED);
      });
  });
  test('should return errors when job title is defined and amount is -1', async () => {
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: 'Developer', annualTurnover: -1})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(VALID_POSITIVE_NUMBER);
      });
  });
  test('should return errors when job title is defined and amount is 0', async () => {
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: 'Developer', annualTurnover: 0})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(ANNUAL_TURNOVER_REQUIRED);
      });
  });
  test('should return errors when job title is defined and amount has more than two decimal places', async () => {
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: 'Developer', annualTurnover: 50.555})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(AMOUNT_INVALID_DECIMALS);
      });
  });
  test('should return errors when job title is not defined and amount is defined', async () => {
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: undefined, annualTurnover: 70000})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(JOB_TITLE_REQUIRED);
      });
  });
  test('should redirect with valid input', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: 'Developer', annualTurnover: 70000})
      .expect((res) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(ON_TAX_PAYMENTS_URL);
      });
  });
  test('should return status 500 when there is error', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app)
      .post(CITIZEN_SELF_EMPLOYED_URL)
      .send({jobTitle: 'Developer', annualTurnover: 70000})
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({error: TestMessages.REDIS_FAILURE});
      });
  });
});
