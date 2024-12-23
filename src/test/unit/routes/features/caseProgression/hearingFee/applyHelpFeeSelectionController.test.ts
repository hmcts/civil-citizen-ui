import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {APPLY_HELP_WITH_FEES, HEARING_FEE_APPLY_HELP_FEE_SELECTION,
} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure, mockCivilClaimApplicantCompanyType} from '../../../../../utils/mockDraftStore';
import {mockCivilClaimHearingFee} from '../../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {Session} from 'express-session';
import {getRedirectUrl} from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';

jest.mock('services/features/caseProgression/hearingFee/applyHelpFeeSelectionService');
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const spyDel = jest.spyOn(draftStoreService, 'deleteDraftClaimFromStore');

describe('Apply for help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });
  describe('on GET', () => {
    it('should return resolving apply help fees page', async () => {
      app.locals.draftStoreClient = mockCivilClaimHearingFee;
      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing');
        });
    });

    it('should return resolving apply help fees page with no case progression data', async () => {
      app.locals.draftStoreClient = mockCivilClaimApplicantCompanyType;

      spyDel.mockImplementation(() => {return null;});

      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing');
        });
    });

    it('should return resolving apply help fees page with option marked', async () => {
      app.locals.draftStoreClient = mockCivilClaimHearingFee;
      await request(app)
        .get(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Hearing');
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
      const mockHearingFeePaymentRedirectInfo = {
        status: 'initiated',
        nextUrl: 'https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960',
      };
      app.request['session'] = {user: {id: 'jfkdljfd'}} as unknown as Session;
      (getRedirectUrl as jest.Mock).mockResolvedValue(mockHearingFeePaymentRedirectInfo.nextUrl);
      await request(app)
        .post(HEARING_FEE_APPLY_HELP_FEE_SELECTION)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(mockHearingFeePaymentRedirectInfo.nextUrl);
        });
    });

    it('should redirect to help with fees if option is YES', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      (getRedirectUrl as jest.Mock).mockResolvedValue(APPLY_HELP_WITH_FEES);
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
