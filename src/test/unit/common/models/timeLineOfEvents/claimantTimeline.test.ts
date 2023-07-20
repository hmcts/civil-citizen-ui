import { ClaimantTimeline, MINIMUM_ROWS } from 'common/form/models/timeLineOfEvents/claimantTimeline';
import { TimelineRow } from 'common/form/models/timeLineOfEvents/timelineRow';

describe('ClaimantTimeline', () => {
  let timeline: ClaimantTimeline;
  let rows: TimelineRow[];

  beforeEach(() => {
    rows = [new TimelineRow(), new TimelineRow(), new TimelineRow()];
    timeline = new ClaimantTimeline(rows);
  });

  describe('buildEmptyForm', () => {
    it('should return a new instance with MINIMUM_ROWS rows when no rows are provided', async () => {
      //When
      const emptyTimeline = ClaimantTimeline.buildEmptyForm();

      //Then
      expect(emptyTimeline.rows.length).toBe(MINIMUM_ROWS);
    });
  });

  describe('buildPopulatedForm', () => {
    it('should return a new instance with MINIMUM_ROWS rows when less than MINIMUM_ROWS rows are provided', async () => {
      //When
      const populatedTimeline = ClaimantTimeline.buildPopulatedForm([new TimelineRow()]);

      //Then
      expect(populatedTimeline.rows.length).toBe(4);
    });

    it('should return a new instance with the same number of rows as provided when at least MINIMUM_ROWS rows are provided', async () => {
      //When
      const populatedTimeline = ClaimantTimeline.buildPopulatedForm(rows);

      //Then
      expect(populatedTimeline.rows.length).toBe(MINIMUM_ROWS);
    });
  });

  describe('filterOutEmptyRows', () => {
    it('should remove rows with no populated fields', async () => {
      //Given
      timeline.rows[0].description = 'Test description';

      //When
      timeline.filterOutEmptyRows();

      //Then
      expect(timeline.rows.length).toBe(1);
    });

    it('should not remove any rows when there are no rows', async () => {
      //Given
      timeline.rows = [];

      //When
      timeline.filterOutEmptyRows();

      //Then
      expect(timeline.rows.length).toBe(0);
    });
  });
});
