import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_FEES, GA_APPLY_HELP_WITH_FEES_START} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getDraftGAHWFDetails, saveDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';
import {Claim} from 'models/claim';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/gaHwFeesDraftStore', () => ({
  saveDraftGAHWFDetails: jest.fn(),
  getDraftGAHWFDetails: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));

const mockGetCaseData = getDraftGAHWFDetails as jest.Mock;
const mockSaveCaseData = saveDraftGAHWFDetails as jest.Mock;
const gaFeeDetails = {
  calculatedAmountInPence: 1400,
  code: 'Fe124',
  version: 0,
};
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

describe('General Application - Do you want to continue to apply for Help with Fees', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return Do you want to continue to apply for Help with Fees page', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('Help with fees');
        });
    });

    it('should return Do you want to apply for help with fees option selection', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGAHwF.helpWithFeesRequested = YesNo.YES;
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('Help with fees');
        });
    });

    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should send the value and redirect', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to Apply for help with fees if option is YES', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .query({additionalFeeTypeFlag: 'false'})
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEES_START+'?additionalFeeTypeFlag=false');
        });
    });

    it('should redirect to Additional payment Apply for help with fees if option is YES', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .query({additionalFeeTypeFlag: 'true'})
        .send({option: YesNo.YES})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEES_START+'?additionalFeeTypeFlag=true');
        });
    });

    it('should redirect to Apply for help with fees if option is NO', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEE_SELECTION);
        });
    });
    it('should show error message if no value selected', async () => {
      const mockGAHwF = new GaHelpWithFees();
      mockGetCaseData.mockImplementation(async () => mockGAHwF);
      jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION_ALT'));
        });
    });

    it('should return http 500 when has error in the post method', async () => {
      mockSaveCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
