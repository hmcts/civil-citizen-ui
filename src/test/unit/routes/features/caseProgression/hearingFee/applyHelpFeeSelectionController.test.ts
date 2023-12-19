import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {APPLY_HELP_WITH_FEES, HEARING_FEE_APPLY_HELP_FEE_SELECTION, HEARING_FEE_PAYMENT_CREATION,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure, mockCivilClaimApplicantCompanyType} from '../../../../../utils/mockDraftStore';
import {mockCivilClaimHearingFee} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
const spyDel = jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore');

describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return resolving apply help fees page', async () => {
      app.locals.draftStoreClient = mockCivilClaimHearingFee;
      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing fee');
        });
    });

    it('should return resolving apply help fees page with no case progression data', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;

      spyDel.mockImplementation(() => {return null;});

      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing fee');
        });
    });

    it('should return resolving apply help fees page with option marked', async () => {
      app.locals.draftStoreClient = mockCivilClaimHearingFee;
      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing fee');
        });
    });

    it('should return 500 error page for redis failure', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
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
        .post(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION_UPPER'));
        });
    });

    it('should redirect to payments if option is NO', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(HEARING_FEE_PAYMENT_CREATION);
        });
    });

    it('should redirect to help with fees if option is YES', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(APPLY_HELP_WITH_FEES);
        });
    });
  });
});
