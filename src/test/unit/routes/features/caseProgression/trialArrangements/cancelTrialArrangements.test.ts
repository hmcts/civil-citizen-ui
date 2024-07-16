import {CANCEL_TRIAL_ARRANGEMENTS, DEFENDANT_SUMMARY_URL} from 'routes/urls';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import civilClaimResponseFastTrackMock from '../../../../../utils/mocks/civilClaimResponseFastTrackMock.json';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
const session = require('supertest-session');

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const testSession = session(app);

describe('Is case ready - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should redirect to defendant page', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return Object.assign(new Claim(), civilClaimResponseFastTrackMock.case_data);
    });
    //When
    await testSession
      .get(CANCEL_TRIAL_ARRANGEMENTS.replace(':id', claimId))
    //Then
      .expect((res: { status: unknown; header: {location: unknown} }) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(DEFENDANT_SUMMARY_URL.replace(':id', claimId));
      });
  });

  it('should return "Something went wrong" page when claim does not exist', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //When
    await testSession
      .get(CANCEL_TRIAL_ARRANGEMENTS.replace(':id', '1111'))
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(500);
      });
  });
});
