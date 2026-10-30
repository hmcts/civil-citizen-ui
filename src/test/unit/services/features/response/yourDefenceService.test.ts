import {saveYourDefence} from '../../../../../main/services/features/response/yourDefenceService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {RejectAllOfClaimType} from '../../../../../main/common/form/models/rejectAllOfClaimType';
import {RejectAllOfClaim} from '../../../../../main/common/form/models/rejectAllOfClaim';
import {PartyType} from '../../../../../main/common/models/partyType';
import {Defence} from '../../../../../main/common/form/models/defence';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../main/modules/draft-store/response/responseDraftStoreService');

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

describe('rejectAllOfClaim defence service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('save rejectAllOfClaim defence', () => {
    it('should save data successfully', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(createClaim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveYourDefence(mockReq, new Defence('Test'));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({
            defence: expect.objectContaining({text: 'Test'}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save data successfully without rejectAllOfClaim', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveYourDefence(mockReq, new Defence('Test'));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({
            defence: expect.objectContaining({text: 'Test'}),
          }),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveYourDefence(mockReq, new Defence('Test')))
        .rejects.toThrow('[yourDefenceService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should fail when updateResponseDraft throws an error', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveYourDefence(mockReq, new Defence('Test')))
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
  claim.rejectAllOfClaim = new RejectAllOfClaim();

  return claim;
}
