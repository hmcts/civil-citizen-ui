import {Claim} from '.common/models/claim';
import {PartialAdmission} from '.common/models/partialAdmission';
import {DefendantTimeline} from '.common/form/models/timeLineOfEvents/defendantTimeline';
import {
  getPartialAdmitTimeline,
  savePartialAdmitTimeline,
} from '../../../../../../main/services/features/response/timelineOfEvents/defendantTimelineService';
import * as draftStoreService from '.modules/draft-store/draftStoreService';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {TimelineRow} from '.common/form/models/timeLineOfEvents/timelineRow';

jest.mock('.modules/draft-store');
jest.mock('.modules/draft-store/draftStoreService');

describe('defendantTimelineService', () => {
  describe('getPartialAdmitTimeline', () => {
    it('should return defendant timeline from claim when it exists', () => {
      //Given
      const claim = new Claim();
      const partialAdmission = new PartialAdmission();
      partialAdmission.timeline = new DefendantTimeline([new TimelineRow('17 November 2021', 'description')], 'comment');
      claim.partialAdmission = partialAdmission;
      //When
      const model = getPartialAdmitTimeline(claim);
      //Then
      expect(model.rows.length).toBe(4);
      expect(model.rows[0].date).toEqual(partialAdmission.timeline.rows[0].date);
      expect(model.rows[0].description).toEqual(partialAdmission.timeline.rows[0].description);
      expect(model.comment).toEqual(partialAdmission.timeline.comment);
    });
    it('should return empty form when there is no defendant timeline in claim', () => {
      //Given
      const claim = new Claim();
      //When
      const model = getPartialAdmitTimeline(claim);
      //Then
      expect(model.rows.length).toBe(4);
      expect(model.rows[0].date).toBeUndefined();
      expect(model.rows[0].description).toBeUndefined();
      expect(model.comment).toBeUndefined();
    });
  });
  describe('savePartialAdmitTimeline', () => {
    const mockGetCaseData = draftStoreService.getCaseDataFromStore as jest.Mock;
    it('should save partial admission timeline successfully', async () => {
      //Given
      mockGetCaseData.mockImplementation(async () => {
        return new Claim();
      });
      const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
      //When
      await savePartialAdmitTimeline('123', DefendantTimeline.buildPopulatedForm([new TimelineRow('12/02/2020', 'description')], 'comment'));
      //Then
      expect(spySave).toBeCalled();
    });
    it('should throw an exception when there is an error with redis', async () => {
      //When
      const mockSaveDraftClaim = draftStoreService.saveDraftClaim as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      //Then
      await expect(savePartialAdmitTimeline('123', DefendantTimeline.buildPopulatedForm([new TimelineRow('12/02/2020', 'description')], 'comment')))
        .rejects.toThrow(TestMessages.REDIS_FAILURE);
    });
  });
});
