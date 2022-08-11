import {
  submitExtendedResponseDeadline,
} from '../../../../../../main/services/features/response/responseDeadline/extendResponseDeadlineService';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import nock from 'nock';
import config from 'config';
import {ResponseOptions} from '../../../../../../main/common/form/models/responseDeadline';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id:'1'};
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
//const mockSaveCaseDataFromStore = draftStoreService.saveDraftClaim as jest.Mock;
const claim = new Claim();
claim.applicant1 = {
  partyName: 'Mr. James Bond',
  type: CounterpartyType.INDIVIDUAL,
};
claim.responseDeadline = {
  agreedResponseDeadline : new Date(),
  calculatedResponseDeadline: new Date(),
  option: ResponseOptions.ALREADY_AGREED,
};
const citizenBaseUrl: string = config.get('services.civilService.url');
describe('Extend ResponseDeadline Service', ()=>{
  describe('submitExtendedResponseDeadline', ()=>{
    it('should submit event when task is incomplete', async ()=> {
      //Given
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/undefined/event')
        .reply(200, {});
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      const spy = spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await submitExtendedResponseDeadline(mockedAppRequest);
      //Then
      if(!nock.isDone()) {
        fail('did not submit event to civil service');
        nock.cleanAll();
      }

      expect(spy).toHaveBeenCalled();
    });
    it('should not submit event when task is complete', async ()=>{
      //Given
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      const spy = spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await submitExtendedResponseDeadline(mockedAppRequest);
      //Then
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
