import nock from 'nock';
import config from 'config';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import * as ccdTranslationService from '../../../../../main/services/translation/claimantResponse/claimantResponseCCDTranslation';
import {Claim} from '../../../../../main/common/models/claim';
import * as requestModels from '../../../../../main/common/models/AppRequest';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {submitClaimantResponse} from 'services/features/claimantResponse/submitClaimantResponse';
import {YesNo} from 'common/form/models/yesNo';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/services/translation/claimantResponse/claimantResponseCCDTranslation');

declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Submit claimant response to ccd', () => {
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  const claim = new Claim();
  claim.claimantResponse = new ClaimantResponse();
  claim.claimantResponse.hasPartAdmittedBeenAccepted = {option: YesNo.YES};
  it('should submit claimant response successfully when there are no errors', async () => {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationService, 'translateClaimantResponseToCCD');
    //When
    await submitClaimantResponse(mockedAppRequest);
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
    await expect(submitClaimantResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
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
    await expect(submitClaimantResponse(mockedAppRequest)).rejects.toThrow(TestMessages.REQUEST_FAILED);
  });
});
