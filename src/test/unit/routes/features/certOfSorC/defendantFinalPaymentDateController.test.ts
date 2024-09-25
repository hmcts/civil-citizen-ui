import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {COSC_FINAL_PAYMENT_DATE_URL} from 'routes/urls';
import {mockCivilClaim, mockNoStatementOfMeans} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as launchDarkly from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {defendantFinalPaymentDateService} from '../../../../../main/services/features/generalApplication/certOfSorC/defendantFinalPaymentDateService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('CoSorS - defendant Payment date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    jest.spyOn(launchDarkly, 'isCUIReleaseTwoEnabled').mockResolvedValueOnce(true);
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return payment date page', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      jest.spyOn(defendantFinalPaymentDateService,'getDefendantResponse').mockReturnValue(Promise.resolve(null));
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
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      jest.spyOn(defendantFinalPaymentDateService,'savePaymentDate');
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
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      jest.spyOn(defendantFinalPaymentDateService,'savePaymentDate');
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
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      jest.spyOn(defendantFinalPaymentDateService,'savePaymentDate');
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
      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
      jest.spyOn(defendantFinalPaymentDateService,'savePaymentDate');
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
