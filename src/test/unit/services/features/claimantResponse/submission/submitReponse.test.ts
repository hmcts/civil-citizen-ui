import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import * as ccdTranslationService from '../../../../../../main/services/translation/claimantResponse/ccdTranslation';
import {Claim} from '../../../../../../main/common/models/claim';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import {submitClaimantResponse} from 'services/features/claimantResponse/submission/submitClaimantResponse';
import nock from 'nock';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Party} from '../../../../../../main/common/models/party';
import {ClaimantResponse} from 'models/claimantResponse';
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/translation/claimantResponse/ccdTranslation');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id:'1'};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Submit claimant to ccd', ()=>{
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  const claimFromService = new Claim();
  claimFromService.respondent1 = new Party();
  beforeEach(() => {
    nock(citizenBaseUrl)
      .get('/cases/1')
      .reply(200, claimFromService);
  });
  it('should submit claimant response successfully when there are no errors', async ()=> {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseDJToCCD');
    //When
    await submitClaimantResponse(mockedAppRequest);
    //Then
    expect(spyOnTranslation).toHaveBeenCalled();
    if(!nock.isDone()) {
      nock.cleanAll();
    }
  });
  it('should rethrow error when there is an error with redis', async () =>{
    //Given
    mockGetCaseData.mockImplementation( async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(submitClaimantResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
  });
  it('should rethrow error when civil service returns 500', async () =>{
    //Given
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(500, {error:'error'});
    //Then
    await expect(submitClaimantResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
});
