import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {
  AGREED_TO_MORE_TIME_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../../../../main/routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimApplicantIndividualType,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');

describe('Agreed response date', () => {
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
        .get(AGREED_TO_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=9999')
        .send('month=12')
        .send('day=25')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET', () => {
    it('should return agreed response date page', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantIndividualType;
      await request(app)
        .get(AGREED_TO_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You have already agreed to more time to respond');
          expect(res.text).toContain('name="year" type="text"');
          expect(res.text).toContain('name="month" type="text"');
          expect(res.text).toContain('name="day" type="text"');
        });
    });
    it('should return agreed response date with payment date loaded from Redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(AGREED_TO_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You have already agreed to more time to respond');
          expect(res.text).toContain('name="year" type="text" value="2025"');
          expect(res.text).toContain('name="month" type="text" value="6"');
          expect(res.text).toContain('name="day" type="text" value="1"');
        });
    });
    it('should show error when draft store throws error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).get(AGREED_TO_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AGREED_RESPONSE_DATE);
        });
    });
    it('should return error on agreed date in the past', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=1999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST);
        });
    });

    it('should return error on agreed date in the past', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=2022')
        .send('month=05')
        .send('day=10')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST);
        });
    });
    it('should return error on incorrect input', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=199')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
        });
    });
    it('should return error on agreed response date is bigger 28 days', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=2050')
        .send('month=6')
        .send('day=13')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.DATE_NOT_MORE_THAN_28_DAYS);
        });
    });

    it('should accept the 28th day after the original response deadline as input and redirect to next page', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=2025')
        .send('month=6')
        .send('day=12')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(NEW_RESPONSE_DEADLINE_URL);
        });
    });

    it('should accept the input date when it is less then 28 after original response deadline and redirect to next page', async () => {
      await request(app)
        .post(AGREED_TO_MORE_TIME_URL)
        .send('year=2025')
        .send('month=6')
        .send('day=11')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(NEW_RESPONSE_DEADLINE_URL);
        });
    });
    it('should show error when draft store throws error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app).post(AGREED_TO_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
