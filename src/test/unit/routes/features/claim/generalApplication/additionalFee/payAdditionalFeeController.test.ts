import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {getRedirectUrl} from 'services/features/generalApplication/fee/helpWithFeeService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/services/features/generalApplication/fee/helpWithFeeService');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));

const mockGetCaseData = getDraftGAHWFDetails as jest.Mock;
const mockGetRedirectUrl = getRedirectUrl as jest.Mock;

describe('General Application - Pay additional fee Page', () => {
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
      await request(app)
        .get(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING'));
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.WANT_TO_APPLY_HWF_TITLE'));
        });
    });

    it('should return Do you want to apply for help with fees option selection', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGAHwF.applyHelpWithFees = {option: YesNo.YES};
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .get(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.HEADING'));
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
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
        .post(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to Do you want to continue to apply for Help with Fees if option is YES', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetRedirectUrl.mockImplementation(() => 'test');
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual('test');
        });
    });

    it('should show error message if no value selected', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
        .send({option: null})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.GENERAL_APPLICATION.APPLY_HELP_WITH_FEES'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockGetRedirectUrl.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_APPLY_HELP_ADDITIONAL_FEE_SELECTION_URL)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
