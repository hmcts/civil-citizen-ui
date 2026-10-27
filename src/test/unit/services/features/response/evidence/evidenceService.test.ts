import {getEvidence, saveEvidence} from '../../../../../../main/services/features/response/evidence/evidenceService';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Claim} from '../../../../../../main/common/models/claim';
import {EvidenceType} from '../../../../../../main/common/models/evidence/evidenceType';
import {Evidence} from '../../../../../../main/common/form/models/evidence/evidence';
import {EvidenceItem} from '../../../../../../main/common/form/models/evidence/evidenceItem';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {DefendantEvidence} from 'models/evidence/evidence';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');

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

const COMMENT = 'Nam ac ante id turpis elementum laoreet. Nunc a erat nec eros iaculis lobortis ut in quam.';
const EVIDENCE_ITEM = [
  {'type': EvidenceType.CONTRACTS_AND_AGREEMENTS, 'description': 'Test evidence details'},
  {'type': null, 'description': ''},
  {'type': null, 'description': ''},
  {'type': null, 'description': ''},
];

const EVIDENCE_ITEM_EMPTY: EvidenceItem[] = [
  {'type': null, 'description': ''},
  {'type': null, 'description': ''},
  {'type': null, 'description': ''},
  {'type': null, 'description': ''}];

describe('Evidence Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvidence', () => {
    it('should get empty form when no data exist', async () => {
      const claim = new Claim();
      claim.evidence = <DefendantEvidence>{};
      claim.evidence.evidenceItem = EVIDENCE_ITEM_EMPTY;
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getEvidence(mockReq);

      expect(form.comment).toBeUndefined();
      expect(form.evidenceItem).toEqual(EVIDENCE_ITEM_EMPTY);
    });

    it('should get empty form when evidence does not exist', async () => {
      mockGetResponseClaimById.mockResolvedValue(new Claim());

      const form = await getEvidence(mockReq);

      expect(form).toEqual(new Evidence());
    });

    it('should return populated form when evidence exists', async () => {
      const claim = new Claim();
      claim.evidence = {
        comment: COMMENT,
        evidenceItem: EVIDENCE_ITEM,
      };
      mockGetResponseClaimById.mockResolvedValue(claim);

      const form = await getEvidence(mockReq);

      expect(form.comment).toEqual(COMMENT);
      expect(form.evidenceItem).toEqual(EVIDENCE_ITEM);
    });

    it('should rethrow error when error occurs', async () => {
      mockGetResponseClaimById.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(getEvidence(mockReq)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });

  describe('saveEvidence', () => {
    const eventItems: EvidenceItem[] = [];
    beforeEach(() => {
      eventItems.length = 0;
      eventItems.push({type: EvidenceType.CONTRACTS_AND_AGREEMENTS, description: 'Test evidence details'});
    });

    it('should save evidence data successfully when claim exists', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveEvidence(mockReq, new Evidence(COMMENT, eventItems));

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          evidence: expect.objectContaining({comment: COMMENT}),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveEvidence(mockReq, new Evidence(COMMENT, eventItems)))
        .rejects.toThrow('[evidenceService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should rethrow error when error occurs on save claim', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveEvidence(mockReq, new Evidence(COMMENT, eventItems)))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
