import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  AGE_ELIGIBILITY_URL,
  DOB_URL,
  CITIZEN_PHONE_NUMBER_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {
  mockCivilClaim,
  mockCivilClaimUndefined,
  mockRedisFailure,
  mockNoStatementOfMeans,
  mockCivilClaimRespondentIndividualTypeWithPhoneNumber,
  mockCivilClaimRespondentIndividualTypeWithoutPhoneNumber,
  mockCivilClaimRespondentIndividualTypeWithCcdPhoneNumberFalse,
  mockCivilClaimApplicantIndividualType,
  mockDraftClaim,
} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');

describe('Citizen date of birth', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return citizen date of birth page empty when dont have information on redis ', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
          expect(res.text).not.toContain('NaN');
        });
    });
    it('should return citizen date of birth page with all information from redis', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
        });
    });
    it('should return citizen date of birth page with all information from redis when date of birth is stored as a string', async () => {
      app.locals.draftStoreClient = mockDraftClaim({
        case_data: {
          respondent1: {
            dateOfBirth: '2000-01-02',
          },
        },
      } as never);
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('value="2"');
          expect(res.text).toContain('value="1"');
          expect(res.text).toContain('value="2000"');
        });
    });
    it('should not render NaN when date of birth from redis is invalid', async () => {
      app.locals.draftStoreClient = mockDraftClaim({
        case_data: {
          respondent1: {
            dateOfBirth: {
              date: undefined,
            },
          },
        },
      } as never);
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
          expect(res.text).not.toContain('NaN');
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should create a new claim if redis gives undefined', async () => {
      app.locals.draftStoreClient = mockCivilClaimUndefined;
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should return error on year less than 1872', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });
    it('should return error on empty year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should return error on future date', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DATE'));
        });
    });
    it('should return error 4 digit year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date of birth must include a 4-digit year');
        });
    });
    it.each(['0', '00', '000'])('should return date of birth 4-digit year error when year is %s', async (invalidYear) => {
      await request(app)
        .post(DOB_URL)
        .send(`year=${invalidYear}`)
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date of birth must include a 4-digit year');
          expect(res.text).not.toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });
    it('should return date of birth valid month error when month is invalid', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=13')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date of birth must include a valid month');
          expect(res.text).not.toContain(t('ERRORS.VALID_MONTH'));
        });
    });
    it('should return date of birth valid day error when day is invalid', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=32')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date of birth must include a valid day');
          expect(res.text).not.toContain(t('ERRORS.VALID_DAY'));
        });
    });
    it.each([
      ['day', 'year=2000&month=1&day=0', 'Date of birth must include a valid day'],
      ['month', 'year=2000&month=0&day=1', 'Date of birth must include a valid month'],
    ])('should only return date of birth valid %s error when it is 0', async (_field, body, expectedError) => {
      await request(app)
        .post(DOB_URL)
        .send(body)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedError);
          expect(res.text).not.toContain(t('ERRORS.VALID_DATE'));
        });
    });
    it('should return date of birth day, month and year errors when all are invalid', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=0')
        .send('month=13')
        .send('day=40')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Date of birth must include a valid day');
          expect(res.text).toContain('Date of birth must include a valid month');
          expect(res.text).toContain('Date of birth must include a 4-digit year');
        });
    });
    it('should keep missing field errors when day and month are empty', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).not.toContain('Date of birth must include a valid day');
          expect(res.text).not.toContain('Date of birth must include a valid month');
        });
    });
    it('should return welsh date of birth 4-digit year error when year is invalid', async () => {
      await request(app)
        .post(DOB_URL)
        .query({lang: 'cy'})
        .send('year=0')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Rhaid i&#39;r dyddiad geni gynnwys blwyddyn 4 digid');
        });
    });
    it('should accept a valid input', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect to under 18 contact court page', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });
    it('should redirect to under 18 contact court page when has information on redis', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });
    it('should redirect to phone number page on valid DOB', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_PHONE_NUMBER_URL}`);
        });
    });
    it('should redirect to phone number page on valid DOB when has undefined on redis', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_PHONE_NUMBER_URL}`);
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
    describe('Redirect to phone-number or task-list screen', () => {
      it('should redirect to task-list screen if phone-number provided', async () => {
        app.locals.draftStoreClient = mockCivilClaimRespondentIndividualTypeWithPhoneNumber;
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
          });
      });
      it('should redirect to phone-number screen if phone-number NOT provided', async () => {
        app.locals.draftStoreClient = mockCivilClaimApplicantIndividualType;
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
      it('should redirect to phone-number screen if phone-number is empty', async () => {
        app.locals.draftStoreClient = mockCivilClaimRespondentIndividualTypeWithoutPhoneNumber;
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
      it('should redirect to phone-number screen if ccd phone number exist is false', async () => {
        app.locals.draftStoreClient = mockCivilClaimRespondentIndividualTypeWithCcdPhoneNumberFalse;
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
    });
  });
});
