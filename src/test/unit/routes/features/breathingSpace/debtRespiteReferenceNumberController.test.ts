import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL,
  BREATHING_SPACE_RESPITE_START_DATE_URL,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import { NextFunction, Request, Response } from 'express';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/routes/guards/breathingSpaceGuard', () => ({ breathingSpaceGuard: (req: Request, res: Response, next: NextFunction) => { next(); } }));
describe('Debt Respite Reference Number Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return intention to proceed page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you have a Debt Respite Scheme reference number?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL)
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

    it('should redirect to start date debit respite page when there is NO data', async () => {
      await request(app).post(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL).expect((res) => {
        expect(res.status).toBe(302);
        expect(res.get('location')).toBe(BREATHING_SPACE_RESPITE_START_DATE_URL);
      });
    });

    it('should redirect to start date debit respite page when there is data ', async () => {
      await request(app).post(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL).send({referenceNumber: '12345'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(BREATHING_SPACE_RESPITE_START_DATE_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(BREATHING_SPACE_RESPITE_REFERENCE_NUMBER_URL)
        .send({referenceNumber: '1234'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
