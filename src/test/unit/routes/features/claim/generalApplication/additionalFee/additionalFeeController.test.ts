import {app} from '../../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {GA_PAY_ADDITIONAL_FEE_URL} from 'routes/urls';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import { Claim } from 'common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {t} from 'i18next';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {GaServiceClient} from 'client/gaServiceClient';
import {ApplicationState} from 'models/generalApplication/applicationSummary';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
  getApplicationIndex: jest.fn(),
}));
jest.mock('../../../../../../../main/routes/guards/generalAplicationGuard',() => ({
  isGAForLiPEnabled: jest.fn((req, res, next) => {
    next();
  }),
}));
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
describe('General Application - Pay additional fee Page', () => {
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
      generalAppPBADetails: undefined,
      applicationFeeAmountInPence: undefined,
      parentClaimantIsApplicant: undefined,
      judicialDecision: undefined,
    },
    created_date: '',
    id: '',
    last_modified: '',
    state: undefined,
  };
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });
  beforeEach(()=> {
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
  });

  describe('on GET', () => {
    it('should return additional fee page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      applicationResponse.id = '1234567890';
      applicationResponse.state = ApplicationState.AWAITING_APPLICATION_PAYMENT,
      jest
        .spyOn(GaServiceClient.prototype, 'getApplicationsByCaseId')
        .mockResolvedValue([applicationResponse]);
      await request(app)
        .get(GA_PAY_ADDITIONAL_FEE_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('Additional fee'));
        });
    });

    it('should return 500 error page for redis failure', async () => {
      //Given
      mockGetCaseData.mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //When //Then
      await request(app)
        .get(GA_PAY_ADDITIONAL_FEE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
