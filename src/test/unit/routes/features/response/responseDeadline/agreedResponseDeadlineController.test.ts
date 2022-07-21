import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {
  AGREED_T0_MORE_TIME_URL,
  NEW_RESPONSE_DEADLINE_URL,
} from '../../../../../../main/routes/urls';
import {
  VALID_FOUR_DIGIT_YEAR,
  VALID_AGREED_RESPONSE_DATE,
  VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST,
  DATE_NOT_MORE_THAN_28_DAYS,
  // DATE_NOT_MORE_THAN_28_DAYS,
} from '../../../../../../main/common/form/validationErrors/errorMessageConstants';
import {
  mockCivilClaim,
  mockCivilClaimApplicantIndividualType,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Agreed response date', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeEach(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Exception', () => {
    test('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(AGREED_T0_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    test('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=9999')
        .send('month=12')
        .send('day=31')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET', () => {
    test('should return agreed response date page', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantIndividualType;
      await request(app)
        .get(AGREED_T0_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You have already agreed to more time to respond');
          expect(res.text).toContain('name="year" type="text"');
          expect(res.text).toContain('name="month" type="text"');
          expect(res.text).toContain('name="day" type="text"');
        });
    });
    test('should return payment date page with payment date loaded from Redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(AGREED_T0_MORE_TIME_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('You have already agreed to more time to respond');
          expect(res.text).toContain('name="year" type="text" value="2025"');
          expect(res.text).toContain('name="month" type="text" value="6"');
          expect(res.text).toContain('name="day" type="text" value="1"');
        });
    });
  });
  describe('on POST', () => {
    // mocking today's date
    const realDate = Date;
    beforeEach(() => {
      global.Date.now = jest.fn(() => new Date('2022-05-20T10:20:30Z').getTime());
    });

    afterEach(() => {
      global.Date = realDate;
    });
    test('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_AGREED_RESPONSE_DATE);
        });
    });
    test('should return error on agreed date in the past', async () => {
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=1999')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST);
        });
    });

    test('should return error on agreed date in the past', async () => {
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=2022')
        .send('month=05')
        .send('day=19')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_AGREED_RESPONSE_DATE_NOT_IN_THE_PAST);
        });
    });
    test('should return error on incorrect input', async () => {
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=199')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(VALID_FOUR_DIGIT_YEAR);
        });
    });
    test('should return error on agreed response date is bigger 28 days', async () => {
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=2022')
        .send('month=6')
        .send('day=13')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(DATE_NOT_MORE_THAN_28_DAYS);
        });
    });

    test('should accept the 28th day after the original response deadline as input and redirect to next page', async () => {
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=2022')
        .send('month=6')
        .send('day=12')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(NEW_RESPONSE_DEADLINE_URL);
        });
    });

    test('should accept the input date when it is less then 28 after original response deadline and redirect to next page', async () => {
      await request(app)
        .post(AGREED_T0_MORE_TIME_URL)
        .send('year=2022')
        .send('month=6')
        .send('day=11')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toBe(NEW_RESPONSE_DEADLINE_URL);
        });
    });
  });
});