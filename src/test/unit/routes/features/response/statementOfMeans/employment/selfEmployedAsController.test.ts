import {app} from '../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_SELF_EMPLOYED_URL, ON_TAX_PAYMENTS_URL} from '../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockRedisFailure, mockResponseFullAdmitPayBySetDate} from '../../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('Self Employed As', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Get', () => {
    it('should return on self employed page successfully', async () => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
      await request(app).get(CITIZEN_SELF_EMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.SELF_EMPLOYED.TITLE'));
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_SELF_EMPLOYED_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockResponseFullAdmitPayBySetDate;
    });
    it('should return error when no input text is filled', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.JOB_TITLE_REQUIRED'));
          expect(res.text).toContain(t('ERRORS.ANNUAL_TURNOVER_REQUIRED'));
        });
    });
    it('should return errors when job title is defined and amount is not defined', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: 'Developer', annualTurnover: undefined})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ANNUAL_TURNOVER_REQUIRED'));
        });
    });
    it('should return errors when job title is defined and amount is -1', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: 'Developer', annualTurnover: -1})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('enter a negative number');
        });
    });
    it('should return errors when job title is defined and amount is 0', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: 'Developer', annualTurnover: 0})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ANNUAL_TURNOVER_REQUIRED'));
        });
    });
    it('should return errors when job title is defined and amount has more than two decimal places', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: 'Developer', annualTurnover: 50.555})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.AMOUNT_INVALID_DECIMALS'));
        });
    });
    it('should return errors when job title is not defined and amount is defined', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: undefined, annualTurnover: 70000})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.JOB_TITLE_REQUIRED'));
        });
    });
    it('should redirect with valid input', async () => {
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: 'Developer', annualTurnover: 70000})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(ON_TAX_PAYMENTS_URL);
        });
    });
    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_SELF_EMPLOYED_URL)
        .send({jobTitle: 'Developer', annualTurnover: 70000})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(t('ERRORS.SOMETHING_WENT_WRONG'));
        });
    });
  });
});
