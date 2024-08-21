import {app} from '../../../../../../../main/app';
import {GA_APPLICATION_FEE_CONFIRMATION_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {GeneralApplication} from 'models/generalApplication/GeneralApplication';
import {ApplicationType, ApplicationTypeOption} from 'models/generalApplication/applicationType';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {YesNo} from 'form/models/yesNo';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;
const mockClaim = new Claim();
mockClaim.generalApplication = new GeneralApplication(new ApplicationType(ApplicationTypeOption.ADJOURN_HEARING));
mockClaim.generalApplication.helpWithFees = new GaHelpWithFees(YesNo.YES,'yes',
  new ApplyHelpFeesReferenceForm(YesNo.YES, 'HWF-176A-32B'));

describe('Pay GA Application Fee Confirmation Screen Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(launchDarkly, 'isGaForLipsEnabled').mockResolvedValue(true);
  });

  it('should return pay application fee confirmation page when HWF reference exists', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When //Then
    await request(app)
      .get(GA_APPLICATION_FEE_CONFIRMATION_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Your reference number');
      });
  });

  it('should return pay application fee confirmation page when HWF reference exists when flag is false ', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When //Then
    await request(app)
      .get(GA_APPLICATION_FEE_CONFIRMATION_URL)
      .query({additionalFeeTypeFlag: 'false'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Your reference number');
        expect(res.text).toContain('application fee');
      });
  });

  it('should return pay additional application fee confirmation page when HWF reference exists when flag is true ', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => mockClaim);
    //When //Then
    await request(app)
      .get(GA_APPLICATION_FEE_CONFIRMATION_URL)
      .query({additionalFeeTypeFlag: 'true'})
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Your reference number');
        expect(res.text).toContain('additional application fee');
      });
  });

  it('should return 500 error page for redis failure', async () => {
    //Given
    mockGetCaseData.mockImplementation(() => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //When //Then
    await request(app)
      .get(GA_APPLICATION_FEE_CONFIRMATION_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
