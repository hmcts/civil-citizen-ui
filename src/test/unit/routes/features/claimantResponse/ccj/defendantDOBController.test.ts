import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {t} from 'i18next';
import {app} from '../../../../../../main/app';
import {
  CCJ_DEFENDANT_DOB_URL,
  CCJ_PAID_AMOUNT_URL,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('CCJ - Defendant`s date of birth', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return Defendant`s date of birth', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const res = await request(app).get(CCJ_DEFENDANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain('Do you know the defendant&#39;s date of birth?');
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).get(CCJ_DEFENDANT_DOB_URL);
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL);
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.VALID_OPTION_SELECTION);
    });

    it('should return error on empty dob', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL)
        .send({
          option: 'yes',
          dob: {day: '', month: '', year: ''},
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('ERRORS.VALID_DAY'));
      expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
      expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
    });

    it('should return error on current year - 150 years ', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL)
        .send({
          option: 'yes',
          dob: {day: '', month: '', year: '1800'},
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('ERRORS.VALID_DAY'));
      expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
      expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
    });

    it('should return error 4 digit year', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL)
        .send({
          option: 'yes',
          dob: {day: '', month: '', year: '555'},
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('ERRORS.VALID_DAY'));
      expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
      expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
    });

    it('should return error with dob less then 18', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL)
        .send({
          option: 'yes',
          dob: {day: '11', month: '11', year: '2021'},
        });
      expect(res.status).toBe(200);
      expect(res.text).toContain(TestMessages.VALID_ENTER_A_DATE_BEFORE);
    });

    it('should redirect to paid amount if option yes is selected with valid date', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL)
        .send({
          option: 'yes',
          dob: {day: '11', month: '11', year: '2000'},
        });
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAID_AMOUNT_URL);
    });

    it('should redirect to paid amount page if option no is selected', async () => {
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL).send({option: 'no'});
      expect(res.status).toBe(302);
      expect(res.get('location')).toBe(CCJ_PAID_AMOUNT_URL);
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      const res = await request(app).post(CCJ_DEFENDANT_DOB_URL)
        .send({option: 'no'});
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
