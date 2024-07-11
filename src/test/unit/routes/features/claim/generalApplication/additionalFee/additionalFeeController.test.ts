import request from 'supertest';
import {app} from '../../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {GA_ADDITIONAL_FEE_URL} from 'routes/urls';
import {t} from 'i18next';
import * as generalApplicationService from 'services/features/generalApplication/generalApplicationService';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getApplicationFromGAService: jest.fn(),
}));
const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
describe('Arrive on additional fee', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

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
    },
    created_date: '',
    id: '',
    last_modified: '',
    state: undefined,
  };

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    jest.spyOn(generalApplicationService, 'getApplicationFromGAService').mockResolvedValue(applicationResponse);
  });

  describe('on GET', () => {
    it('should return additional fee page', async () => {
      mockGetCaseData.mockImplementation(async () => mockClaim);
      await request(app)
        .get(GA_ADDITIONAL_FEE_URL)
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
        .get(GA_ADDITIONAL_FEE_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
