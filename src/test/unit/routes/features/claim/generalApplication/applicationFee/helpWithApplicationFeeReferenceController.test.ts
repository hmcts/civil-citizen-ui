import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_WITH_FEE_REFERENCE, GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLICATION_FEE_CONFIRMATION_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {
  saveHelpWithFeesDetails,
} from 'services/features/generalApplication/generalApplicationService';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/services/features/generalApplication/generalApplicationService', ()=> ({saveAndTriggerNotifyGaHwfEvent:jest.fn(), saveHelpWithFeesDetails:jest.fn() }));

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveHelpWithFeesDetails = saveHelpWithFeesDetails as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
describe('General Application - Do you have a help with fees reference number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  describe('on GET', () => {
    it('should return - Do you have a help with fees reference number page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Do you have a help with fees reference number?');
        });
    });

    it('should return do you have a help with fees reference number with option marked', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      mockClaim.generalApplication.helpWithFees = new GaHelpWithFees();
      mockClaim.generalApplication.helpWithFees.helpFeeReferenceNumberForm = new ApplyHelpFeesReferenceForm(YesNo.YES, 'HWF-123-86D');
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
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .send({option: YesNo.YES,referenceNumber: 'HWF-123-86D'})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to Do you want to continue to apply for Help with Fees if option is NO', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
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
      mockGetCaseData.mockImplementation(async () => mockClaim);
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
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .query({additionalFeeTypeFlag: 'true'})
        .send({option: YesNo.YES,referenceNumber: 'HWF-123-86D'})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLICATION_FEE_CONFIRMATION_URL+'?additionalFeeTypeFlag=true');
        });
    });

    it('should show error message if no value selected', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      //jest.spyOn(CivilServiceClient.prototype, 'getGeneralApplicationFee').mockResolvedValueOnce(gaFeeDetails);

      await request(app)
        .post(GA_APPLY_HELP_WITH_FEE_REFERENCE)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION_UPPER'));
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
