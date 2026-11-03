import {AppRequest} from 'models/AppRequest';
import {req} from '../../../../utils/UserDetails';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {Claim} from 'models/claim';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';

jest.mock('modules/draft-store/response/responseDraftStoreService');

const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const appReq = <AppRequest>req;
appReq.params = {id: '12345'};

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

describe('Response Deadline Agreed Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setResponseDeadline', () => {
    it('should update claim and response draft when agreed deadline exists', async () => {
      const deadlineDate = new Date(2023, 6, 22);
      const claim = new Claim();
      jest.spyOn(CivilServiceClient.prototype, 'getAgreedDeadlineResponseDate').mockResolvedValueOnce(deadlineDate);
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await setResponseDeadline(claim, appReq);

      expect(claim.respondent1ResponseDeadline).toEqual(deadlineDate);
      expect(claim.respondentSolicitor1AgreedDeadlineExtension).toEqual(deadlineDate);
      expect(claim.responseDeadline).toBeDefined();
      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        appReq,
        '12345',
        expect.objectContaining({
          respondent1ResponseDeadline: deadlineDate,
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should not update draft when no agreed deadline is returned', async () => {
      const claim = new Claim();
      jest.spyOn(CivilServiceClient.prototype, 'getAgreedDeadlineResponseDate').mockResolvedValueOnce(undefined);
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));

      await setResponseDeadline(claim, appReq);

      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should throw when no response draft is found', async () => {
      const deadlineDate = new Date(2023, 6, 22);
      const claim = new Claim();
      jest.spyOn(CivilServiceClient.prototype, 'getAgreedDeadlineResponseDate').mockResolvedValueOnce(deadlineDate);
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(setResponseDeadline(claim, appReq))
        .rejects.toThrow('[responseDeadlineAgreedService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });
  });
});
