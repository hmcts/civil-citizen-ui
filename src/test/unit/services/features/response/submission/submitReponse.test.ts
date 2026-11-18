import * as ccdTranslationService from '../../../../../../main/services/translation/response/ccdTranslation';
import * as compareAddress from '../../../../../../main/services/features/response/submission/compareAddress';
import {Claim} from '../../../../../../main/common/models/claim';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import {submitResponse} from '../../../../../../main/services/features/response/submission/submitResponse';
import {getResponseClaimById} from 'modules/draft-store/response/responseDraftStoreService';
import nock from 'nock';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../../main/common/models/party';
import {CaseRole} from 'form/models/caseRoles';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {AppSession, UserDetails} from '../../../../../../main/common/models/AppRequest';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');
jest.mock('../../../../../../main/services/translation/response/ccdTranslation');
jest.mock('../../../../../../main/services/features/response/submission/compareAddress');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};
mockedAppRequest.session = <AppSession>{user: <UserDetails>{id: '1234'}};

const citizenBaseUrl: string = config.get('services.civilService.url');
const mockGetResponseClaimById = getResponseClaimById as jest.Mock;

describe('Submit response to ccd', () => {
  const claim = new Claim();
  claim.respondent1 = new Party();
  const claimFromService = new CivilClaimResponse('123', {});

  beforeEach(() => {
    jest.clearAllMocks();
    nock(citizenBaseUrl)
      .get('/cases/1')
      .reply(200, claimFromService);

    nock(citizenBaseUrl)
      .get('/cases/1/userCaseRoles')
      .reply(200, [CaseRole.DEFENDANT]);
  });

  it('should submit response successfully when there are no errors', async () => {
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/1234/event')
      .reply(200, {});
    mockGetResponseClaimById.mockResolvedValue(claim);
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateDraftResponseToCCD');
    const spyOnAddressComparison = jest.spyOn(compareAddress, 'addressHasChange');

    await submitResponse(mockedAppRequest);

    expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockedAppRequest, '1');
    expect(spyOnAddressComparison).toHaveBeenCalled();
    expect(spyOnTranslation).toHaveBeenCalled();
    if (!nock.isDone()) {
      nock.cleanAll();
      fail('did not submit event to civil service');
    }
  });

  it('should rethrow error when loading the response draft fails', async () => {
    mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

    await expect(submitResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });

  it('should rethrow error when civil service returns 500', async () => {
    mockGetResponseClaimById.mockResolvedValue(claim);
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/1234/event')
      .reply(500, {error: 'error'});

    await expect(submitResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
});
