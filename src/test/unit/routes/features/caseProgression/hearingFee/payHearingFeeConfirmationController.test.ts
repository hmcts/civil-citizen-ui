import {app} from '../../../../../../main/app';
import {HEARING_FEE_CONFIRMATION_URL} from 'routes/urls';
import nock from 'nock';
import config from 'config';
import request from 'supertest';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import civilClaimResponseHearingFeeMock from '../../../../../utils/mocks/civilClaimResponseHearingFeeMock.json';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Pay Hearing Fee Confirmation Screen Controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });
  beforeEach(()=> {
    (isCaseProgressionV1Enable as jest.Mock).mockReturnValueOnce(true);
  });
  it('should return expected confirmation pay hearing fee page when claim exists', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseHearingFeeMock.case_data);
    });
    //When //Then
    await request(app)
      .get(HEARING_FEE_CONFIRMATION_URL)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Your reference number');
      });
  });

  it('should return 500 error page for redis failure', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //When //Then
    await request(app)
      .get(HEARING_FEE_CONFIRMATION_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});
