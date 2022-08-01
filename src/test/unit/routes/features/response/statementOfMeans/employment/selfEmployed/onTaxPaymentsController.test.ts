import {app} from '../../../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {CITIZEN_COURT_ORDERS_URL, ON_TAX_PAYMENTS_URL} from '../../../../../../../../main/routes/urls';
import {TestMessages} from '../../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../../utils/mockDraftStore';
import {
  VALID_OWED_AMOUNT_REQUIRED,
  VALID_REASON_REQUIRED,
  VALID_TWO_DECIMAL_NUMBER,
  VALID_YES_NO_SELECTION,
} from '../../../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {YesNo} from '../../../../../../../../main/common/form/models/yesNo';

jest.mock('../../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../../main/modules/draft-store');

describe('on tax payments', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeEach(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  describe('on Get', () => {
    it('should return on tax payment page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(ON_TAX_PAYMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Are you behind on tax payments?');
        });
    });
    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(ON_TAX_PAYMENTS_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on Post', () => {
    it('should return error when no option is not selected', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_YES_NO_SELECTION);
        });
    });
    it('should return errors when no option yes is selected and amount and reason are not defined', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: null, reason: undefined})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OWED_AMOUNT_REQUIRED);
          expect(res.text).toContain(VALID_REASON_REQUIRED);
        });
    });
    it('should return errors when option yes is selected and amount is 0', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 0, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OWED_AMOUNT_REQUIRED);
        });
    });
    it('should return errors when option yes is selected and amount is -1', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: -1, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_OWED_AMOUNT_REQUIRED);
        });
    });
    it('should return errors when option yes is selected and amount is abc', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 'abc', reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_TWO_DECIMAL_NUMBER);
        });
    });
    it('should return errors when option yes is selected and amount has more than two decimal places', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.4444, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_TWO_DECIMAL_NUMBER);
        });
    });
    it('should return errors when option yes is selected and reason is not selected', async () => {
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.44, reason: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_REASON_REQUIRED);
        });
    });
    it('should redirect with valid input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CITIZEN_COURT_ORDERS_URL);
        });
    });
    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(ON_TAX_PAYMENTS_URL)
        .send({option: YesNo.YES, amountYouOwe: 44.4, reason: 'reason'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
