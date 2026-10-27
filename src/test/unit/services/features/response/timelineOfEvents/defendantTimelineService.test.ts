import {Claim} from '../../../../../../main/common/models/claim';
import {PartialAdmission} from '../../../../../../main/common/models/partialAdmission';
import {DefendantTimeline} from '../../../../../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {
  getDefendantTimeline,
  saveDefendantTimeline,
} from '../../../../../../main/services/features/response/timelineOfEvents/defendantTimelineService';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {TimelineRow} from '../../../../../../main/common/form/models/timeLineOfEvents/timelineRow';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {AppRequest} from 'models/AppRequest';

jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');

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

describe('defendantTimelineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPartialAdmitTimeline', () => {
    it('should return defendant timeline from partial admission when it exists', () => {
      //Given
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      const partialAdmission = new PartialAdmission();
      partialAdmission.timeline = new DefendantTimeline([new TimelineRow(17, 11, 2021, 'description')], 'comment');
      claim.partialAdmission = partialAdmission;
      //When
      const model = getDefendantTimeline(claim);
      //Then
      expect(model.rows.length).toBe(4);
      expect(model.rows[0].date).toEqual(partialAdmission.timeline.rows[0].date);
      expect(model.rows[0].description).toEqual(partialAdmission.timeline.rows[0].description);
      expect(model.comment).toEqual(partialAdmission.timeline.comment);
    });
    it('should return defendant timeline from full defence when it exists', () => {
      //Given
      const claim = new Claim();
      const rejectAllOfClaim = new RejectAllOfClaim();
      rejectAllOfClaim.timeline = new DefendantTimeline([new TimelineRow(17, 11, 2021, 'description')], 'comment');
      claim.rejectAllOfClaim = rejectAllOfClaim;
      //When
      const model = getDefendantTimeline(claim);
      //Then
      expect(model.rows.length).toBe(4);
      expect(model.rows[0].date).toEqual(rejectAllOfClaim.timeline.rows[0].date);
      expect(model.rows[0].description).toEqual(rejectAllOfClaim.timeline.rows[0].description);
      expect(model.comment).toEqual(rejectAllOfClaim.timeline.comment);
    });
    it('should return empty form when there is no defendant timeline in claim', () => {
      //Given
      const claim = new Claim();
      //When
      const model = getDefendantTimeline(claim);
      //Then
      expect(model.rows.length).toBe(4);
      expect(model.rows[0].date).toBeUndefined();
      expect(model.rows[0].description).toBeUndefined();
      expect(model.comment).toBeUndefined();
    });
  });

  describe('savePartialAdmitTimeline', () => {
    it('should save partial admission timeline successfully', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.PART_ADMISSION;
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveDefendantTimeline(
        mockReq,
        DefendantTimeline.buildPopulatedForm([new TimelineRow(12, 2, 2020, 'description')], 'comment'),
      );

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          partialAdmission: expect.objectContaining({
            timeline: expect.objectContaining({comment: 'comment'}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should save full defence timeline successfully', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(claim));
      mockUpdateResponseDraft.mockResolvedValue({});

      await saveDefendantTimeline(
        mockReq,
        DefendantTimeline.buildPopulatedForm([new TimelineRow(12, 2, 2020, 'description')], 'comment'),
      );

      expect(mockUpdateResponseDraft).toHaveBeenCalledWith(
        mockReq,
        caseId,
        expect.objectContaining({
          rejectAllOfClaim: expect.objectContaining({
            timeline: expect.objectContaining({comment: 'comment'}),
          }),
          draftClaimCreatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        'draft-123',
      );
    });

    it('should throw when no response draft is found', async () => {
      mockGetResponseDraft.mockResolvedValue(null);

      await expect(saveDefendantTimeline(
        mockReq,
        DefendantTimeline.buildPopulatedForm([new TimelineRow(12, 2, 2020, 'description')], 'comment'),
      )).rejects.toThrow('[defendantTimelineService] no response draft found');
      expect(mockUpdateResponseDraft).not.toHaveBeenCalled();
    });

    it('should throw an exception when updateResponseDraft fails', async () => {
      mockGetResponseDraft.mockResolvedValue(mockDraftResult(new Claim()));
      mockUpdateResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));

      await expect(saveDefendantTimeline(
        mockReq,
        DefendantTimeline.buildPopulatedForm([new TimelineRow(12, 2, 2020, 'description')], 'comment'),
      )).rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
