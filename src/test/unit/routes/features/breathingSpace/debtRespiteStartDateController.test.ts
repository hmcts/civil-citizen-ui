import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  BREATHING_SPACE_RESPITE_START_DATE_URL,
  BREATHING_SPACE_RESPITE_TYPE_URL,
} from 'routes/urls';
import {mockCivilClaim, mockCivilClaimUndefined, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import { NextFunction, Request, Response } from 'express';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/routes/guards/breathingSpaceGuard', () => ({ breathingSpaceGuard: (req: Request, res: Response, next: NextFunction) => { next(); } }));

describe('Claimant Response - Debt Respite When Start Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return debt when start page empty when dont have information on redis ', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('When did it start?');
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_START_DATE_URL)
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
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should move to next page on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .send('reason=')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should return error for day larger than 31', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
        .send('month=1')
        .send('day=32')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
        });
    });

    it('should return error for day no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
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
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
        .send('month=13')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
        });
    });

    it('should return error for month no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
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
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return error for year no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return error for year not smaller than 1872', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1500')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return error for date is future', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=2500')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Start date must not be after today');
        });
    });

    it('should accept a valid input', async () => {
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to what type is it page', async () => {
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${BREATHING_SPACE_RESPITE_TYPE_URL}`);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_START_DATE_URL)
        .send('year=1990')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
