import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as ccdTranslationService from 'services/translation/breathingSpace/ccdTranslation';
import {Claim} from 'common/models/claim';
import * as requestModels from 'common/models/AppRequest';
import nock from 'nock';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {submitBreathingSpace} from 'services/features/breathingSpace/submission/submitBreathingSpace';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/translation/breathingSpace/ccdTranslation');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Submit breathing space to ccd', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claimFromService = new Claim();
  claimFromService.claimDetails = new ClaimDetails();
  claimFromService.claimDetails.breathingSpace = {
    debtRespiteReferenceNumber: {
      referenceNumber: '0000',
    },
  };
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  claim.claimDetails.breathingSpace = {
    debtRespiteReferenceNumber: {
      referenceNumber: '0000',
    },
  };

  beforeEach(() => {
    nock(citizenBaseUrl)
      .get('/cases/1')
      .reply(200, claimFromService);
  });
  it('should submit response successfully when there are no errors', async ()=> {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateBreathingSpaceToCCD');
    //When
    await submitBreathingSpace(mockedAppRequest);
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
    await expect(submitBreathingSpace(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
    await expect(submitBreathingSpace(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
});
