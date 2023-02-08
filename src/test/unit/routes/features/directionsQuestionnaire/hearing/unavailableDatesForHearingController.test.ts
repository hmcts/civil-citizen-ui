import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {
  mockCivilClaimWithExpertAndWitness,
  mockRedisFailure,
} from '../../../../../utils/mockDraftStore';
import {
  DQ_AVAILABILITY_DATES_FOR_HEARING_URL,
  DQ_PHONE_OR_VIDEO_HEARING_URL,
  DQ_UNAVAILABLE_FOR_HEARING_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {UnavailableDateType} from 'common/models/directionsQuestionnaire/hearing/unavailableDates';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Unavailable dates for hearing Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
  });

  describe('on GET', () => {
    it('should return unavailable dates for hearing page', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
      await request(app)
        .get(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Add a single date or longer period of time that you cannot attend a hearing');
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaimWithExpertAndWitness;
    });
    it('should display error when single/longer period option is not selected', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{ single: {} }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.SELECT_SINGLE_DATE_OR_PERIOD);
        });
    });

    it('should display error when single date is selected but no date is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {},
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no date is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {},
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no day is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: '',
                month: 3,
                year: 2023,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DAY_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no month is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: 3,
                month: '',
                year: 2023,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_MONTH_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but no year is provided', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: 3,
                month: 3,
                year: '',
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_YEAR_FOR_UNAVAILABILITY);
        });
    });

    it('should display error when single date is selected but date is in the past', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: 3,
                month: 3,
                year: 2022,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_UNAVAILABILITY_DATE_IN_FUTURE);
        });
    });

    it('should display error when single date is selected but date is beyond next 12 months', async () => {
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: 3,
                month: 3,
                year: 3022,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_UNAVAILABILITY_DATE_IN_NEXT_12_MOINTHS);
        });
    });

    it('should redirect next page if unavailable days are less than 30', async () => {
      const today = new Date();
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: today.getDate(),
                month: today.getMonth() + 1,
                year: today.getFullYear() + 1,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_PHONE_OR_VIDEO_HEARING_URL);
        });
    });

    it('should redirect next page if unavailable days are more than 30', async () => {
      const today = new Date();
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.LONGER_PERIOD,
            period: {
              start: {
                day: today.getDate(),
                month: today.getMonth() + 1,
                year: today.getFullYear() + 1,
              },
              end: {
                day: today.getDate(),
                month: today.getMonth() + 3,
                year: today.getFullYear() + 1,
              },
            },
          }],
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(DQ_UNAVAILABLE_FOR_HEARING_URL);
        });
    });

    it('should status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DQ_AVAILABILITY_DATES_FOR_HEARING_URL)
        .send({
          items: [{
            type: UnavailableDateType.SINGLE_DATE,
            single: {
              start: {
                day: 7,
                month: 2,
                year: 2024,
              },
            },
          }],
        })
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
