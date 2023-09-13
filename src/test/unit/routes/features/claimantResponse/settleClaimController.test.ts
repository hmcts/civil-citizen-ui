import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {
  CLAIMANT_RESPONSE_REJECTION_REASON_URL ,
  CLAIMANT_RESPONSE_SETTLE_CLAIM_URL,
  CLAIMANT_RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Claimant Response - Settle Claim Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return settle claim page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you want to settle the claim for the £20 the defendant has paid?');
      });
    });

    it('should return settle claim page when defendant paid full amount', async () => {
      const civilClaimResponseMockData = {
        'id': 1645882162449409,
        'case_data': {
          'rejectAllOfClaim': {
            'howMuchHaveYouPaid': {
              'amount': 110,
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
        get: jest.fn(() => Promise.resolve(JSON.stringify(civilClaimResponseMockData))),
        del: jest.fn(() => Promise.resolve({})),
      };

      await request(app).get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Do you agree the defendant has paid the £110 in full?');
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    beforeAll(() => {
      app.locals.draftStoreClient = mockCivilClaim;
    });

    it('should return error on empty post', async () => {
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(TestMessages.VALID_YES_OR_NO_OPTION);
      });
    });

    it('should redirect to the claimant response task-list if option yes is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_TASK_LIST_URL);
        });
    });

    it('should redirect to the claimant response reject reason page if option no is selected', async () => {
      await request(app).post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL).send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIMANT_RESPONSE_REJECTION_REASON_URL );
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_RESPONSE_SETTLE_CLAIM_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
