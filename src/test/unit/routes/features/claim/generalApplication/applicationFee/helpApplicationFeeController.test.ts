import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_FEES} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {saveHelpWithFeesDetails} from 'services/features/generalApplication/generalApplicationService';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/services/features/generalApplication/fee/helpWithFeeService');
jest.mock('../../../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));

const mockGetCaseData = getDraftGAHWFDetails as jest.Mock;
const mockGetCaseDataFromStore = getCaseDataFromStore as jest.Mock;
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationIndex: jest.fn(),
  saveHelpWithFeesDetails: jest.fn(),
}));
const mockGetRedirectUrl = getRedirectUrl as jest.Mock;
const mockSaveHelpWithFeesDetails = saveHelpWithFeesDetails as jest.Mock;

const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
const ccdClaim = new Claim();
ccdClaim.generalApplications = [
  {
    'id': 'test',
    'value': {
      'caseLink': {
        'CaseReference': 'testApp1',
      },
    },
  },
];

describe('General Application - Do you want to apply for help with fees Page', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Do you want to apply for help with fees page', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      mockGetCaseDataFromStore.mockImplementation(async () => mockClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.WANT_TO_APPLY_HWF_TITLE'));
        });
    });

    it('should return Do you want to apply for help with fees page with not sync payment', async () => {
      const claim = mockClaim;
      claim.paymentSyncError = true;
      mockGetCaseData.mockImplementation(async () => claim);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING'));
          expect(res.text).toContain(t('PAGES.FEE_AMOUNT.SYNC_WARNING'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.WANT_TO_APPLY_HWF_TITLE'));
        });
    });

    it('should return Do you want to apply for help with fees page with request id', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      app.request.query = {
        id : '12345',
      };
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.WANT_TO_APPLY_HWF_TITLE'));
        });
    });

    it('should return Do you want to apply for help with fees option selection', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGAHwF.applyHelpWithFees = {option: YesNo.YES};
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      mockGetCaseDataFromStore.mockImplementation(async () => mockClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.APPLY_HELP_WITH_FEE.HEADING'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetRedirectUrl.mockImplementation(() => 'redirecturl');
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to Do you want to continue to apply for Help with Fees if option is YES', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetRedirectUrl.mockImplementation(() => GA_APPLY_HELP_WITH_FEES);
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEES);
        });
    });

    it('should show error message if no value selected', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .send({option: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.PAY_APPLICATION_FEE'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetRedirectUrl.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    it('should return http 500 when has error in the post method for save help with fee', async () => {
      mockSaveHelpWithFeesDetails.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_SELECTION)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
