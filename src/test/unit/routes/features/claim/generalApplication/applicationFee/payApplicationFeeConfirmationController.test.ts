import {app} from '../../../../../../../main/app';
import {GA_APPLICATION_FEE_CONFIRMATION_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {TestMessages} from '../../../../../../utils/errorMessageTestConstants';
import * as launchDarkly from '../../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {GaHelpWithFees} from 'models/generalApplication/gaHelpWithFees';
import {YesNo} from 'form/models/yesNo';
import {getDraftGAHWFDetails} from 'modules/draft-store/gaHwFeesDraftStore';

jest.mock('../../../../../../../main/modules/oidc');
jest.mock('../../../../../../../main/modules/draft-store');
jest.mock('../../../../../../../main/modules/draft-store/draftStoreService');
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

const gaHwFDetails = new GaHelpWithFees({option: YesNo.YES}, 'yes',
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
    mockGetCaseData.mockImplementation(async () => gaHwFDetails);
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
    mockGetCaseData.mockImplementation(async () => gaHwFDetails);
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
    mockGetCaseData.mockImplementation(async () => gaHwFDetails);
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
