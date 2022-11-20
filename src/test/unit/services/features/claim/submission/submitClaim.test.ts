import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import * as ccdTranslationService from '../../../../../../main/services/translation/claim/ccdTranslation';
import {Claim} from '../../../../../../main/common/models/claim';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import {submitClaim} from '../../../../../../main/services/features/claim/submission/submitClaim';
import nock from 'nock';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../../main/common/models/party';
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/translation/response/ccdTranslation');
jest.mock('../../../../../../main/services/features/response/submission/compareAddress');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Submit claim to ccd', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claim = new Claim();
  claim.respondent1 = new Party();
  const claimFromService = new Claim();
  claimFromService.respondent1 = new Party();
  beforeEach(() => {
    nock(citizenBaseUrl)
      .get('/cases/1')
      .reply(200, claimFromService);
  });
  it('should submit claim successfully when there are no errors', async () => {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateDraftClaimToCCD');
    //When
    await submitClaim(mockedAppRequest);
    //Then
    expect(spyOnTranslation).toHaveBeenCalled();
    if (!nock.isDone()) {
      nock.cleanAll();
      fail('did not submit event to civil service');
    }
  });
  it('should rethrow error when there is an error with redis', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(submitClaim(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
  it('should rethrow error when civil service returns 500', async () => {
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(500, {error: 'error'});
    //Then
    await expect(submitClaim(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
});
