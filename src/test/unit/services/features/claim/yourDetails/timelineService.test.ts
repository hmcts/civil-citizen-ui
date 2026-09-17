import {getTimeline} from 'services/features/claim/yourDetails/timelineService';
import {ClaimDetails} from 'form/models/claim/details/claimDetails';
import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

jest.mock('modules/draft-store/draftStoreManagerService');

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
});

