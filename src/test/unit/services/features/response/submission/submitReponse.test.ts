import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import * as ccdTranslationService from '../../../../../../main/services/translation/response/ccdTranslation';
import {Claim} from '../../../../../../main/common/models/claim';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import {submitResponse} from '../../../../../../main/services/features/response/submission/submitResponse';
import nock from 'nock';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/translation/response/ccdTranslation');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id:'1'};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Submit response to ccd', ()=>{
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claim = new Claim();

  it('should submit response successfully when there are no errors', async ()=> {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateDraftResponseToCCD');
    //When
    await submitResponse(mockedAppRequest);
    //Then
    expect(spyOnTranslation).toHaveBeenCalled();
    if(!nock.isDone()) {
      nock.cleanAll();
      fail('did not submit event to civil service');
    }
  });
  it('should rethrow error when there is an error with redis', async () =>{
    //Given
    mockGetCaseData.mockImplementation( async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    //Then
    await expect(submitResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
    await expect(submitResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
});
