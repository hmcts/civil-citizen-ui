import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  APPLY_HELP_WITH_FEES,
  APPLY_HELP_WITH_FEES_START,
  HEARING_FEE_APPLY_HELP_FEE_SELECTION,
} from 'routes/urls';
import {mockCivilClaim, mockCivilClaimWithFeeType} from '../../../../utils/mockDraftStore';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import * as helpWithFeesContentService from 'services/features/helpWithFees/applyHelpWithFeesService';
import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {ClaimSummarySection} from 'form/models/claimSummarySection';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Arrive on help with fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    it('should return populated help-with-fees page', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithFeeType;

      const claimMock = new Claim();
      claimMock.caseProgressionHearing = new CaseProgressionHearing();
      claimMock.caseProgressionHearing.hearingFeeInformation = new HearingFeeInformation();
      claimMock.caseProgressionHearing.hearingFeeInformation.hearingFee = {calculatedAmountInPence:'7000', version: 'text', code: '1'};
      claimMock.feeTypeHelpRequested = FeeType.HEARING;

      const spyOn = jest.spyOn(helpWithFeesContentService, 'getApplyHelpWithFeesContent');
      spyOn.mockImplementationOnce( () => {return [{  type: 'p', data: {text: ''}}] as ClaimSummarySection[];});

      await request(app)
        .get(APPLY_HELP_WITH_FEES)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('/apply-help-fee-selection'));
        });
    });
  });

  describe('on POST', () => {
    it('should show error if no option was chosen', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLY_HELP_WITH_FEES)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION'));
        });
    });

    it('should redirect to payments if option is NO & feeType is present', async () => {
      app.locals.draftStoreClient = mockCivilClaimWithFeeType;
      await request(app)
        .post(APPLY_HELP_WITH_FEES)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(HEARING_FEE_APPLY_HELP_FEE_SELECTION);
        });
    });

    it('should redirect to help with fees if option is YES', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .post(APPLY_HELP_WITH_FEES)
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(APPLY_HELP_WITH_FEES_START);
        });
    });
  });
});
