import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import * as ccdTranslationService from '../../../../../../main/services/translation/claimantResponse/ccdTranslation';
import {Claim} from 'models/claim';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import {submitClaimantResponse} from 'services/features/claimantResponse/submission/submitClaimantResponse';
import nock from 'nock';
import config from 'config';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {Party} from 'models/party';
import {ClaimantResponse} from 'models/claimantResponse';
import { CaseState } from 'common/form/models/claimDetails';
import * as ccdTranslationForRequestJudement from 'services/translation/claimantResponse/ccdRequestJudgementTranslation';
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../../main/services/translation/claimantResponse/ccdTranslation');
jest.mock('../../../../../../main/services/translation/claimantResponse/ccdRequestJudgementTranslation');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id:'1'};

const citizenBaseUrl: string = config.get('services.civilService.url');
describe('Submit claimant to ccd', ()=>{
  const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
  let claim: Claim;
  const claimFromService = new Claim();
  claimFromService.respondent1 = new Party();
  beforeEach(() => {
    claim = new Claim();
    claim.claimantResponse = new ClaimantResponse();
    claim.totalClaimAmount = 500;
    nock(citizenBaseUrl)
      .get('/cases/1')
      .reply(200, claimFromService);
  });
  afterAll(() => {
    nock.cleanAll();
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
  it('should submit claimant response successfully when there are no errors for claimant request by admission', async () => {
    //Given
    nock(citizenBaseUrl)
      .post('/cases/1/citizen/undefined/event')
      .reply(200, {});
    mockGetCaseData.mockImplementation(async () => {
      claim.ccdState = CaseState.AWAITING_APPLICANT_INTENTION;
      return claim;
    });
    const spyOnTranslation = jest.spyOn(ccdTranslationForRequestJudement, 'translateClaimantResponseRequestJudgementByAdmissionOrDeterminationToCCD');
    //When
    await submitClaimantResponse(mockedAppRequest);
    //Then
    expect(spyOnTranslation).toHaveBeenCalled();
  });
});
