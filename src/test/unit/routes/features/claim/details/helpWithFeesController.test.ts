import {app} from '../app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {CLAIM_HELP_WITH_FEES_URL, CLAIM_TOTAL_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';

jest.mock('modules/oidc');
jest.mock('modules/draft-store');

describe('Claim Details - Help With Fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return Help With Fees page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(CLAIM_HELP_WITH_FEES_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.HELP_WITH_FEES.TITLE'));
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(CLAIM_HELP_WITH_FEES_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should redirect to total page when NO selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TOTAL_URL);
        });
    });
    it('should redirect to total page when YES selected', async () => {
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.YES, referenceNumber: 'test'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CLAIM_TOTAL_URL);
        });
    });
    it('should show error if no radio button selected', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION'));
        });
    });
    it('should show error if Yes selected and reference number is empty', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.HELP_WITH_FEES_REFERENCE_REQUIRED'));
        });
    });
    it('should return status 500 when error thrown', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(CLAIM_HELP_WITH_FEES_URL)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
