import config from 'config';
import nock from 'nock';
import {app} from '../../../../../../main/app';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import request from 'supertest';
import {
  CLAIM_HELP_WITH_FEES_URL,
  CLAIM_INTEREST_CONTINUE_CLAIMING_URL,
  CLAIM_INTEREST_HOW_MUCH_URL,
} from '../../../../../../main/routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Continue Claiming Interest page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  app.request.cookies = {eligibilityCompleted: true};

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return on continue claiming interest page successfully', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app).get(CLAIM_INTEREST_CONTINUE_CLAIMING_URL).expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CLAIM_JOURNEY.CONTINUE_CLAIMING_INTEREST.TITLE'));
      });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
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

    it('should return error message when no option selected', async () => {
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION'));
        });
    });

    it('should redirect to the How much do you want to continue claiming screen when option is Yes', async () => {
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_INTEREST_HOW_MUCH_URL);
        });
    });

    it('should redirect to the Help with fees screen when option is No', async () => {
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .send({option: 'no'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_HELP_WITH_FEES_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_INTEREST_CONTINUE_CLAIMING_URL)
        .send({option: 'yes'})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
