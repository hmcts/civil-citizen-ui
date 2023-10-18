import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_OWED_AMOUNT_URL, RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {mockCivilClaim, mockNoStatementOfMeans, mockRedisFailure} from '../../../../../../utils/mockDraftStore';
import {ResponseType} from 'common/form/models/responseType';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../../main/modules/oidc');

describe('Partial Admit - How much money do you admit you owe? Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should redirect to task list when part admit and amount not defined', async () => {
      app.locals.draftStoreClient = mockNoStatementOfMeans;
      await request(app)
        .get(CITIZEN_OWED_AMOUNT_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should display page successfully', async () => {
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
      const mockCivilClaim = {
        set: jest.fn(() => Promise.resolve({})),
        get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMock))),
      };

      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CITIZEN_OWED_AMOUNT_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('How much money do you admit you owe?');
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CITIZEN_OWED_AMOUNT_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should show errors when no amount is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    it('should show errors when amount 0 is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 0})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    it('should show errors when more than 2 decimals provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 10.123})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    it('should show errors when negative amount is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: -110})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    it('should show errors when non-numeric amount is provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 'abc'})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_VALID_AMOUNT);
        });
    });
    it('should show errors when provided amount is bigger than Claim amount', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 9999999999999})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
        });
    });
    it('should show errors when provided amount is equal to Claim amount', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 110})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.AMOUNT_LESS_THAN_CLAIMED);
        });
    });
    it('should redirect page when proper amount provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 100})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
        });
    });
    it('should return http 500 when has error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CITIZEN_OWED_AMOUNT_URL)
        .send({amount: 200})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
