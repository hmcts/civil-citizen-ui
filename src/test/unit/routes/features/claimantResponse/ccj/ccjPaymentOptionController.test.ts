import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {app} from '../../../../../../main/app';
import {
  CCJ_DEFENDANT_PAYMENT_DATE_URL,
  CCJ_PAYMENT_OPTIONS_URL,
  CCJ_REPAYMENT_PLAN_INSTALMENTS_URL,
  CCJ_CHECK_AND_SEND_URL,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from "client/civilServiceClient";
import {Claim} from "models/claim";

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('CCJ - Payment option', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return ccj payment option', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      jest
        .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
        .mockReturnValue(
          new Promise((resolve) => resolve(mockCivilClaim  as unknown as Claim)),
        );
      const res = await request(app).get(CCJ_PAYMENT_OPTIONS_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Payment Option');
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CCJ_PAYMENT_OPTIONS_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should validate when option is not selected', async () => {
      await request(app)
        .post(CCJ_PAYMENT_OPTIONS_URL)
        .send('')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_CCJ_PAYMENT_OPTION'));
        });
    });
    it('should redirect to check and send page when immediately option is selected', async () => {
      await request(app)
        .post(CCJ_PAYMENT_OPTIONS_URL)
        .send('type=IMMEDIATELY')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CCJ_CHECK_AND_SEND_URL);
        });
    });
    it('should redirect to repayment plan page when instalments option is selected', async () => {
      await request(app)
        .post(CCJ_PAYMENT_OPTIONS_URL)
        .send('type=INSTALMENTS')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CCJ_REPAYMENT_PLAN_INSTALMENTS_URL);
        });
    });
    it('should redirect to by set date page when by set date option is selected', async () => {
      await request(app)
        .post(CCJ_PAYMENT_OPTIONS_URL)
        .send('type=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CCJ_DEFENDANT_PAYMENT_DATE_URL);
        });
    });
    it('should return 500 status when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CCJ_PAYMENT_OPTIONS_URL)
        .send('type=BY_SET_DATE')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
