import {AppRequest} from 'models/AppRequest';
import {Claim} from 'models/claim';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {getTimeline, saveTimeline} from 'services/features/claim/yourDetails/timelineService';
import {getDraftClaim, updateDraftClaim} from 'modules/draft-store/draftStoreManagerService';
import {CivilClaimResponse} from 'models/civilClaimResponse';
import {DraftClaimManagerResult} from 'models/draft/draftClaim';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

jest.mock('modules/draft-store/draftStoreManagerService');

const mockGetDraftClaim = getDraftClaim as jest.Mock;
const mockUpdateDraftClaim = updateDraftClaim as jest.Mock;

const mockReq = {
  session: {
    user: {id: '123'},
    draftId: 'draft-123',
  },
} as unknown as AppRequest;

const createMockManagerResult = (claim: Claim, createdAt = '2026-08-01T10:00:00.000Z'): DraftClaimManagerResult => ({
  claimResponse: {
    id: '123',
    case_data: claim,
  } as unknown as CivilClaimResponse,
  rawResponse: {
    draftId: 'draft-123',
    payload: claim,
  } as unknown as DraftClaimManagerResult['rawResponse'],
  createdAt,
  updatedAt: '2026-08-01T11:00:00.000Z',
  expiresAt: '2026-09-01T10:00:00.000Z',
});

describe('Timeline service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTimeline', () => {
    it('should return an empty form when claim details are missing', () => {
      const result = getTimeline(undefined as unknown as ClaimDetails);
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should return an empty form when timeline is missing', () => {
      const result = getTimeline(new ClaimDetails());
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should return a populated form when timeline exists', () => {
      const claimDetails = new ClaimDetails();
      claimDetails.timeline = ClaimantTimeline.buildPopulatedForm([
        TimelineRow.buildPopulatedForm(1, 3, 2023, 'event'),
      ]);
      const result = getTimeline(claimDetails);
      expect(result.rows[0].description).toEqual('event');
    });
  });

  describe('saveTimeline', () => {
    const timeline = ClaimantTimeline.buildPopulatedForm([
      TimelineRow.buildPopulatedForm(1, 3, 2023, 'event'),
    ]);

    it('should save timeline and create claimDetails when missing', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTimeline(mockReq, timeline);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          claimDetails: expect.objectContaining({
            timeline,
          }),
        }),
        'draft-123',
      );
    });

    it('should map createdAt when missing on save', async () => {
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim(), '2026-08-01T10:00:00.000Z'));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTimeline(mockReq, timeline);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(
        mockReq,
        expect.objectContaining({
          draftClaimCreatedAt: new Date('2026-08-01T10:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should use rawResponse draftId when session has none', async () => {
      const reqWithoutDraftId = {session: {user: {id: '123'}}} as unknown as AppRequest;
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(new Claim()));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTimeline(reqWithoutDraftId, timeline);

      expect(mockUpdateDraftClaim).toHaveBeenCalledWith(reqWithoutDraftId, expect.any(Claim), 'draft-123');
    });

    it('should not overwrite existing draftClaimCreatedAt', async () => {
      const claim = new Claim();
      claim.draftClaimCreatedAt = new Date('2020-01-01T00:00:00.000Z');
      mockGetDraftClaim.mockResolvedValue(createMockManagerResult(claim));
      mockUpdateDraftClaim.mockResolvedValue({});

      await saveTimeline(mockReq, timeline);

      expect(mockUpdateDraftClaim.mock.calls[0][1].draftClaimCreatedAt).toEqual(new Date('2020-01-01T00:00:00.000Z'));
    });

    it('should throw when no draft exists', async () => {
      mockGetDraftClaim.mockResolvedValue(null);

      await expect(saveTimeline(mockReq, timeline)).rejects.toThrow('[timelineService] no draft claim found');
    });

    it('should throw when the manager fails', async () => {
      mockGetDraftClaim.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveTimeline(mockReq, timeline)).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});



