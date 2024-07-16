import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  DASHBOARD_CLAIMANT_URL,
  HEARING_FEE_CANCEL_JOURNEY,
} from 'routes/urls';
import {civilClaimResponseMock} from '../../../../../utils/mockDraftStore';
import {isCaseProgressionV1Enable} from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('Apply for help with fees', () => {
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

  describe('on GET', () => {
    it('should return to claimant dashboard', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), civilClaimResponseMock.case_data);
      });
      await request(app)
        .get(HEARING_FEE_CANCEL_JOURNEY)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DASHBOARD_CLAIMANT_URL);
        });
    });
  });
  it('should return http 302 when has error in the get method', async () => {
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app)
      .get(HEARING_FEE_CANCEL_JOURNEY)
      .expect((res) => {
        expect(res.status).toBe(302);
      });
  });
});
