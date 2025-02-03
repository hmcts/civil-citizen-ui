import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_WITH_FEE_REFERENCE, GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLICATION_FEE_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {
  saveHelpWithFeesDetails,
} from 'services/features/generalApplication/generalApplicationService';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));
jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', ()=> ({saveAndTriggerNotifyGaHwfEvent:jest.fn(), saveHelpWithFeesDetails:jest.fn() }));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));
const mockGetCaseData = getDraftGAHWFDetails as jest.Mock;
const mockSaveHelpWithFeesDetails = saveHelpWithFeesDetails as jest.Mock;

describe('General Application - Do you have a help with fees reference number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  let mockGAHwF: GaHelpWithFees;
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });
  beforeEach(() => {
    mockGAHwF = new GaHelpWithFees();
  });
  describe('on GET', () => {
    it('should return - Do you have a help with fees reference number page', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return do you have a help with fees reference number with option marked', async () => {
      mockGAHwF.helpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, 'HWF-123-86D');
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return 500 error page for redis failure', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {

    it('should return do you have a help with fees reference number with option marked', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .send({option: YesNo.YES,referenceNumber: 'HWF-123-86D'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to Do you want to continue to apply for Help with Fees if option is NO', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .query({additionalFeeTypeFlag: 'false'})
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEE_SELECTION+'?additionalFeeTypeFlag=false');
        });
    });

    it('should redirect to application fee confirmation page if option is YES', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .query({additionalFeeTypeFlag: 'false'})
        .send({option: YesNo.YES,referenceNumber: 'HWF-123-86D'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLICATION_FEE_CONFIRMATION_URL+'?additionalFeeTypeFlag=false');
        });
    });

    it('should redirect to additional application fee confirmation page if option is YES', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .query({additionalFeeTypeFlag: 'true'})
        .send({option: YesNo.YES,referenceNumber: 'HWF-123-86D'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLICATION_FEE_CONFIRMATION_URL+'?additionalFeeTypeFlag=true');
        });
    });

    it('should show error for additional application fee if help fee is not entered', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .query({additionalFeeTypeFlag: 'true'})
        .send({option: YesNo.YES, referenceNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.GENERAL_APPLICATION.PAY_ADDITIONAL_FEE.VALID_ENTER_REFERENCE_NUMBER'));
        });
    });

    it('should show error for application fee if help fee is not entered', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .query({additionalFeeTypeFlag: 'false'})
        .send({option: YesNo.YES, referenceNumber: ''})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_ENTER_REFERENCE_NUMBER_GA_HWF'));
        });
    });
    it('should show error message if no value selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockGAHwF);

      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION_ALT'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveHelpWithFeesDetails.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
