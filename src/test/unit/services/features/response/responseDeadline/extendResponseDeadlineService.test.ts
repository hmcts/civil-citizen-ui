import {
  submitExtendedResponseDeadline,
} from 'services/features/response/responseDeadline/extendResponseDeadlineService';
import * as requestModels from '../../../../../../main/common/models/AppRequest';
import * as draftStoreService from '../../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import nock from 'nock';
import config from 'config';
import {ResponseOptions} from 'form/models/responseDeadline';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/modules/draft-store/draftStoreService');
declare const appRequest: requestModels.AppRequest;
const mockedAppRequest = requestModels as jest.Mocked<typeof appRequest>;
mockedAppRequest.params = {id: '1'};
const mockGetCaseDataFromStore = draftStoreService.getCaseDataFromStore as jest.Mock;
const claim = new Claim();
claim.applicant1 = {
  partyDetails: {
    partyName: 'Mr. James Bond',
  },
  type: PartyType.INDIVIDUAL,
};
claim.responseDeadline = {
  agreedResponseDeadline: new Date(),
  calculatedResponseDeadline: new Date(),
  option: ResponseOptions.ALREADY_AGREED,
};
const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Extend ResponseDeadline Service', () => {
  describe('submitExtendedResponseDeadline', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should submit event when task is incomplete', async () => {
      //Given
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/undefined/event')
        .reply(200, {});
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await submitExtendedResponseDeadline(mockedAppRequest);
      //Then
      if (!nock.isDone()) {
        nock.cleanAll();
      }
      expect(spy).toHaveBeenCalled();
    });

    it('should not submit event when task is complete', async () => {
      //Given
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      mockGetCaseDataFromStore.mockImplementation(async () => claim);
      const spy = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await submitExtendedResponseDeadline(mockedAppRequest);
      //Then
      expect(spy).not.toHaveBeenCalled();
      spy.mockClear();
    });

    it('should rethrow exception when redis throws exception', async () => {
      //Given
      mockGetCaseDataFromStore.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(submitExtendedResponseDeadline(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
