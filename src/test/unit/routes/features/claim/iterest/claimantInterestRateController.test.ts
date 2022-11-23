import request from 'supertest';
import {app} from 'app';
import nock from 'nock';
import config from 'config';
import {
  CLAIMANT_INTEREST_RATE_URL,
  CLAIMANT_INTEREST_DATE_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {SameRateInterestType} from 'common/form/models/claimDetails';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Claimant Interest Rate', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return on your claimant interest rate page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIMANT_INTEREST_RATE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIMANT_INTEREST_RATE.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIMANT_INTEREST_RATE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    it('should redirect to task list when interest is provided with different rate', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_INTEREST_RATE_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          rate: 40,
          reason: 'Reasons....',
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_INTEREST_DATE_URL);
        });
    });

    it('should redirect to task list when interest is provided with 8% rate', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_INTEREST_RATE_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
          rate: '',
          reason: '',
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIMANT_INTEREST_DATE_URL);
        });
    });

    it('should return error when different interest selected and not provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_INTEREST_RATE_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          rate: '',
          reason: '',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return error when different interest selected and not reasons not provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIMANT_INTEREST_RATE_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          rate: 40,
          reason: '',
        })
        .expect((res) => {
          expect(res.status).toBe(200);
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIMANT_INTEREST_RATE_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          rate: 40,
          reason: 'Reasons....',
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
