import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {COSC_FINAL_PAYMENT_DATE_URL} from 'routes/urls';
import {mockCivilClaim, mockNoStatementOfMeans} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('CCJ - defendant Payment date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return payment date page', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(COSC_FINAL_PAYMENT_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('name="year" type="text"');
          expect(res.text).toContain('name="month" type="text"');
          expect(res.text).toContain('name="day" type="text"');
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(COSC_FINAL_PAYMENT_DATE_URL)
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
    it('should return errors on no input : invalid month', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(COSC_FINAL_PAYMENT_DATE_URL)
        .send('year= 2023')
        .send('month=13')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
        });

    });

    it('should not return error on date in the past', async () => {
      await request(app)
        .post(COSC_FINAL_PAYMENT_DATE_URL)
        .send('year=1999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should show a message to add a valid payment date', async () => {
      await request(app)
        .post(COSC_FINAL_PAYMENT_DATE_URL)
        .send('year=9999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DATE_NOT_IN_THE_FUTURE);
        });
    });
  });
});
