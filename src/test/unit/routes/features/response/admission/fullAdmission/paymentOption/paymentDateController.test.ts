import {app} from '../../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {CITIZEN_PAYMENT_DATE_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  mockCivilClaim,
  mockNoStatementOfMeans,
  mockRedisFailure,
} from '../../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../../main/modules/oidc');

describe('Payment date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on Exception', () => {
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=12')
        .send('day=31')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET', () => {
    it('should return payment date page', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(CITIZEN_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What date will you pay on?');
          expect(res.text).toContain('name="year" type="text"');
          expect(res.text).toContain('name="month" type="text"');
          expect(res.text).toContain('name="day" type="text"');
        });
    });
    it('should return payment date page with payment date loaded from Redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('What date will you pay on?');
          expect(res.text).toContain('name="year" type="text" value="2025"');
          expect(res.text).toContain('name="month" type="text" value="6"');
          expect(res.text).toContain('name="day" type="text" value="1"');
        });
    });
  });
  describe('on POST', () => {
    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_PAYMENT_DATE_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
        });
    });

    it('should return error on date in the past', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_DATE_URL)
        .send('year=1999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DATE_NOT_IN_PAST);
        });
    });

    it('should redirect to claim task list page on valid payment date', async () => {
      await request(app)
        .post(CITIZEN_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${RESPONSE_TASK_LIST_URL}`);
        });
    });
  });
});
