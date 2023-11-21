import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  APPLY_HELP_WITH_FEES_REFERENCE,
  HEARING_FEE_CONFIRMATION_URL,
} from 'routes/urls';
import {
  mockCivilClaim, mockCivilClaimDocumentUploaded,
  mockRedisFailure,
  mockRedisWithoutAdmittedPaymentAmount,
} from '../../../../../utils/mockDraftStore';
import {mockCivilClaimHearingFee} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('services/features/caseProgression/hearingFee/hearingFeeService');
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving apply help fees reference page', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(APPLY_HELP_WITH_FEES_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return resolving apply help fees page with no case progression data', async () => {
      app.locals.draftStoreClient = mockRedisWithoutAdmittedPaymentAmount;
      await request(app)
        .get(APPLY_HELP_WITH_FEES_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return resolving apply help fees reference page with option marked', async () => {
      app.locals.draftStoreClient = mockCivilClaimHearingFee;
      await request(app)
        .get(APPLY_HELP_WITH_FEES_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return page if no case progression data', async () => {
      app.locals.draftStoreClient = mockCivilClaimDocumentUploaded;
      await request(app)
        .get(APPLY_HELP_WITH_FEES_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(APPLY_HELP_WITH_FEES_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should show error if there is no option', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLY_HELP_WITH_FEES_REFERENCE)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION_UPPER'));
        });
    });

    it('should redirect to confirmation if option is NO', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLY_HELP_WITH_FEES_REFERENCE)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(HEARING_FEE_CONFIRMATION_URL);
        });
    });

    it('should redirect to confirmation and save data if option is YES', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLY_HELP_WITH_FEES_REFERENCE)
        .send({option: YesNo.YES, referenceNumber: 'ABC11ACB112'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(HEARING_FEE_CONFIRMATION_URL);
        });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .post(APPLY_HELP_WITH_FEES_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
