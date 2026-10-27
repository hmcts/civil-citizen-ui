import {
  getRejectAllOfClaim,
  saveRejectAllOfClaim,
} from '../../../../../main/services/features/response/rejectAllOfClaimService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {RejectAllOfClaim} from '../../../../../main/common/form/models/rejectAllOfClaim';
import {PartyType} from '../../../../../main/common/models/partyType';
import {RejectAllOfClaimType} from '../../../../../main/common/form/models/rejectAllOfClaimType';
import {AppRequest} from 'models/AppRequest';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

const mockGetResponseClaimById = getResponseClaimById as jest.Mock;
const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockUpdateResponseDraft = updateResponseDraft as jest.Mock;

const caseId = '1645882162449409';
const mockReq = {
  params: {id: caseId},
  session: {user: {id: 'user-1', accessToken: 'token'}},
} as unknown as AppRequest;

const mockDraftResult = (claim: Claim) => ({
  claimResponse: {id: 'draft-123', case_data: claim},
  rawResponse: {draftId: 'draft-123', payload: claim},
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '',
  expiresAt: '',
});

describe('rejectAllOfClaim service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get rejectAllOfClaim form model', () => {
    it('should return an empty form model when no data retrieved', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const result = await getRejectAllOfClaim(mockReq);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(result).not.toBeNull();
      expect(result.option).toBeUndefined();
    });

    it('should return populated form model when data exists', async () => {
      mockGetResponseClaimById.mockResolvedValue(createClaim());

      const result = await getRejectAllOfClaim(mockReq);

      expect(mockGetResponseClaimById).toHaveBeenCalledWith(mockReq, caseId);
      expect(result).not.toBeNull();
      expect(result.option).toBeTruthy();
      expect(result.option.length).toBe(11);
    });

    it('should rethrow when getResponseClaimById fails', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getRejectAllOfClaim(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('save rejectAllOfClaim data', () => {
    it('should save data successfully', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(createClaim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveRejectAllOfClaim(mockReq, new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({option: RejectAllOfClaimType.ALREADY_PAID}),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveRejectAllOfClaim(mockReq, new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID)))
        .rejects.toThrow('[rejectAllOfClaimService] no draft response found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should rethrow when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveRejectAllOfClaim(mockReq, new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});

function createClaim() {
  const claim = new Claim();
  claim.rejectAllOfClaim = new RejectAllOfClaim(RejectAllOfClaimType.ALREADY_PAID);
  claim.applicant1 = {
    type: PartyType.ORGANISATION,
    partyDetails: {
      partyName: 'Test',
      title: 'Mr.',
      firstName: 'TestName',
      lastName: 'TestLastName',
    },
  };

  return claim;
}
