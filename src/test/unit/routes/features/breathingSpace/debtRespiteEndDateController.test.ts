import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  BREATHING_SPACE_RESPITE_END_DATE_URL,
  BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL,
} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockCivilClaimUndefined, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import { NextFunction, Request, Response } from 'express';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/routes/guards/breathingSpaceGuard', () => ({ breathingSpaceGuard: (req: Request, res: Response, next: NextFunction) => { next(); } }));

describe('Expected end date page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return expected end date page empty when dont have information on redis ', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.DEBT_RESPITE_END_DATE.TITLE'));
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim response if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL);
        });
    });

    it('should move to next page on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const currentDate = new Date();
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send(`year=${currentDate.getFullYear()}`)
        .send(`month=${currentDate.getMonth() + 1}`)
        .send(`day=${currentDate.getDate() + 1}`)
        .send('reason=breathing space end')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL);
        });
    });

    it('should return error for day larger than 31', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=1')
        .send('day=32')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return error for day no input if other fields contain data', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=1')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return error for month larger than 12', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=13')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
        });
    });

    it('should return error for month no input if other fields contain data', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
        });
    });

    it('should return error for year not 4 digits', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return error for year no input if other fields contain data', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return error when year is larger than 9999', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=10000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return error for date is in past', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2020')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DEBT_RESPITE_END_DATE'));
        });
    });

    it('should accept a valid input', async () => {
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect check your answers page', async () => {
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${BREATHING_SPACE_RESPITE_CHECK_ANSWERS_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_END_DATE_URL)
        .send('year=2050')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
