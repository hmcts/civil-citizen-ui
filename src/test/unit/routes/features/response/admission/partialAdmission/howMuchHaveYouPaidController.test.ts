import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {CITIZEN_AMOUNT_YOU_PAID_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {ResponseType} from 'form/models/responseType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('How Much Have You Paid', () => {
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
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({amount: 50, totalClaimAmount: 110, year: '2022', month: '1', day: '31', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET', () => {
    it('should return how much have you paid page', async () => {
      const civilClaimResponseMock = {
        'case_data': {
          'respondent1': {
            'responseType': ResponseType.PART_ADMISSION,
          },
          'partialAdmission': {
            'alreadyPaid': {
              'option': 'yes',
            },
          },
        },
      };
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
      };
      await request(app)
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid the claimant?');
        });
    });

    it('should return how much have you paid with payment amount loaded from Redis', async () => {
      const civilClaimResponseMock = {
        'case_data': {
          'respondent1': {
            'responseType': ResponseType.PART_ADMISSION,
          },
          'partialAdmission': {
            'alreadyPaid': {
              'option': 'yes',
            },
            'paymentIntention': {
              'paymentDate': '2025-06-01T00:00:00.000Z',
            },
            'howMuchDoYouOwe': {
              'amount': 500,
            },
            'howMuchHaveYouPaid': {
              'amount': 20,
              'totalClaimAmount': 110,
              'date': '2022-01-01T00:00:00.000Z',
              'day': '1',
              'month': '1',
              'year': '2022',
              'text': 'text',
            },
          },
        },
      };
      app.locals.draftStoreClient = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
      };
      await request(app)
        .get(CITIZEN_AMOUNT_YOU_PAID_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much have you paid the claimant?');
          expect(res.text).toContain('name="amount" type="number" spellcheck="false" value="20"');
          expect(res.text).toContain('name="year" type="text" value="2022"');
          expect(res.text).toContain('name="month" type="text" value="1"');
          expect(res.text).toContain('name="day" type="text" value="1"');
        });
    });
  });

  describe('on POST', () => {
    it('should return errors on no input', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({
          amount: undefined,
          totalClaimAmount: undefined,
          year: undefined,
          month: undefined,
          day: undefined,
          text: undefined,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
          expect(res.text).toContain(TestMessages.VALID_DAY);
          expect(res.text).toContain(TestMessages.VALID_MONTH);
          expect(res.text).toContain(TestMessages.VALID_YEAR);
          expect(res.text).toContain(TestMessages.ENTER_PAYMENT_EXPLANATION);
        });
    });
    it('should return error on date in future', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({amount: 20, totalClaimAmount: 110, year: '2040', month: '1', day: '1', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_DATE_IN_PAST);
        });
    });
    it('should return error for a 2 digit year', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({amount: 20, totalClaimAmount: 110, year: '22', month: '1', day: '1', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_FOUR_DIGIT_YEAR);
        });
    });
    it('should redirect to claim task list page on valid amount, date in past, text', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_AMOUNT_YOU_PAID_URL)
        .send({amount: 20, totalClaimAmount: 110, year: '2022', month: '1', day: '1', text: 'text'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${RESPONSE_TASK_LIST_URL}`);
        });
    });
  });
});
