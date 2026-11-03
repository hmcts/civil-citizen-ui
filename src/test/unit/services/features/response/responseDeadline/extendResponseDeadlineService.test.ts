import {
  submitExtendedResponseDeadline,
} from 'services/features/response/responseDeadline/extendResponseDeadlineService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from 'models/claim';
import {PartyType} from 'models/partyType';
import nock from 'nock';
import config from 'config';
import {ResponseOptions} from 'form/models/responseDeadline';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {AppRequest, AppSession, UserDetails} from 'models/AppRequest';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const mockedAppRequest = {
  params: {id: '1'},
  session: <AppSession>{user: <UserDetails>{id: '1234'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

const createClaim = (): Claim => {
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
  return claim;
};

const citizenBaseUrl: string = config.get('services.civilService.url');

describe('Extend ResponseDeadline Service', () => {
  describe('submitExtendedResponseDeadline', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should submit event when task is incomplete', async () => {
      nock(citizenBaseUrl)
        .post('/cases/1/citizen/1234/event')
        .reply(200, {});
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(createClaim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await submitExtendedResponseDeadline(mockedAppRequest);

      if (!nock.isDone()) {
        nock.cleanAll();
      }
      expect(mockUpdateResponseDraft).toHaveBeenCalled();
    });

    it('should not submit event when task is complete', async () => {
      const claim = createClaim();
      claim.respondentSolicitor1AgreedDeadlineExtension = new Date();
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await submitExtendedResponseDeadline(mockedAppRequest);

      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(submitExtendedResponseDeadline(mockedAppRequest))
        .rejects.toThrow('[extendResponseDeadlineService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should rethrow exception when getResponseDraft fails', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(submitExtendedResponseDeadline(mockedAppRequest)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
