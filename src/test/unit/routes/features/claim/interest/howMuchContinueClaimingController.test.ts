import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import request from 'supertest';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {SameRateInterestType} from 'form/models/claimDetails';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('How Much Continue Claiming Page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return on how much continue claiming page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIM_INTEREST_HOW_MUCH_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.HOW_MUCH_CONTINUE.TITLE'));
        });
    });

    it('should return 500 status code when error occurs', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_INTEREST_HOW_MUCH_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to help with fees page when interest is provided with 8% rate', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
          dailyInterestAmount: null,
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should redirect to help with fees page when interest is provided with specific daily rate', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: 100.10,
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should return error when no option selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: undefined,
          dailyInterestAmount: null,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.CHOOSE_TYPE_OF_INTEREST'));
        });
    });

    it('should return error when specific daily amount selected and not provided', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: null,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_AMOUNT'));
        });
    });

    it('should return error when specific daily amount selected and more than two decimal places', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: 100.123,
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_TWO_DECIMAL_NUMBER'));
        });
    });

    it('should return status 500 when there is error', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_INTEREST_HOW_MUCH_URL)
        .send({
          option: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE,
          dailyInterestAmount: 100.10,
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
