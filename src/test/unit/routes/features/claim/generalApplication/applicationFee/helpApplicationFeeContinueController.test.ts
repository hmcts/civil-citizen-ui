import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_APPLY_HELP_WITH_FEE_SELECTION, GA_APPLY_HELP_WITH_FEES, GA_APPLY_HELP_WITH_FEES_START} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';
import {CivilServiceClient} from 'client/civilServiceClient';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockSaveCaseData = saveDraftClaim as jest.Mock;

const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
mockClaim.generalApplication.agreementFromOtherParty = YesNo.YES;
mockClaim.generalApplication.informOtherParties = new InformOtherParties();
mockClaim.generalApplication.informOtherParties.option = YesNo.NO;
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

const applicationResponse: ApplicationResponse = {
  case_data: {
    applicationTypes: undefined,
    generalAppType: undefined,
    generalAppRespondentAgreement: undefined,
    generalAppInformOtherParty: undefined,
    generalAppAskForCosts: undefined,
    generalAppDetailsOfOrder: undefined,
    generalAppReasonsOfOrder: undefined,
    generalAppEvidenceDocument: undefined,
    gaAddlDoc: undefined,
    generalAppHearingDetails: undefined,
    generalAppStatementOfTruth: undefined,
    generalAppPBADetails: {
      fee: {
        code: 'FEE0443',
        version: '2',
        calculatedAmountInPence: '10800',
      },
      paymentDetails: {
        status: 'SUCCESS',
        reference: undefined,
      },
      serviceRequestReference: undefined,
    },
    applicationFeeAmountInPence: undefined,
    parentClaimantIsApplicant: undefined,
    judicialDecision: undefined,
  },
  created_date: '',
  id: '',
  last_modified: '',
  state: undefined,
};

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
      mockGetCaseData.mockImplementation(async () => mockClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
      await request(app)
        .get(GA_APPLY_HELP_WITH_FEES)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Application fee');
          expect(res.text).toContain('Help with fees');
        });
    });

    it('should return Do you want to apply for help with fees option selection', async () => {
      mockClaim.generalApplication.helpWithFees = new GaHelpWithFees();
      mockClaim.generalApplication.helpWithFees.helpWithFeesRequested = YesNo.YES;
      mockGetCaseData.mockImplementation(async () => mockClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
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
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({option: new GenericYesNo(YesNo.YES)})
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });

    it('should redirect to Apply for help with fees if option is YES', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
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
      mockGetCaseData.mockImplementation(async () => mockClaim);
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
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({option: YesNo.NO})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(GA_APPLY_HELP_WITH_FEE_SELECTION);
        });
    });
    it('should show error message if no value selected', async () => {

      mockGetCaseData.mockImplementation(async () => mockClaim);
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValue(ccdClaim);
      jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValueOnce(applicationResponse);
      await request(app)
        .post(GA_APPLY_HELP_WITH_FEES)
        .send({})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YES_NO_SELECTION_UPPER'));
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
