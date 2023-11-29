import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  BREATHING_SPACE_RESPITE_TYPE_URL,
  BREATHING_SPACE_RESPITE_END_DATE_URL,
} from '../../../../../main/routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import { NextFunction, Request, Response } from 'express';

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/routes/guards/breathingSpaceGuard', () => ({ breathingSpaceGuard: (req: Request, res: Response, next: NextFunction) => { next(); } }));

describe('Breathing Space - Debt Respite Type Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return has the debt respite type page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(BREATHING_SPACE_RESPITE_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.BREATHING_SPACE_DEBT_RESPITE_TYPE.TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_TYPE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeEach(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      await request(app).post(BREATHING_SPACE_RESPITE_TYPE_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('ERRORS.VALID_DEBT_RESPITE_OPTION'));
      });
    });

    it('should redirect to the debt respite end date page if option yes is selected', async () => {
      await request(app).post(BREATHING_SPACE_RESPITE_TYPE_URL).send({debtRespiteType: 'STANDARD'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(BREATHING_SPACE_RESPITE_END_DATE_URL);
        });
    });

    it('should redirect to the debt respite end date page if option no is selected', async () => {
      await request(app).post(BREATHING_SPACE_RESPITE_TYPE_URL).send({debtRespiteType: 'MENTAL_HEALTH'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(BREATHING_SPACE_RESPITE_END_DATE_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_TYPE_URL)
        .send({debtRespiteType: 'STANDARD'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
