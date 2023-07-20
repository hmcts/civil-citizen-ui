import {toCCDResponseTimelineOfEvents} from 'services/translation/response/convertToCCDResponseTimelineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

describe('convert to response timeline of events', () => {

  it('returning proper value for converted timeline events', () => {
    // Given
    const events: DefendantTimeline = new DefendantTimeline([new TimelineRow(5, 11, 2022, 'Event 1')]);
    // When
    const result = toCCDResponseTimelineOfEvents(events);

    // Then
    expect(result.length).toEqual(1);
    expect(result[0].value.timelineDate).toEqual(new Date(events.rows[0].date.toString()));
    expect(result[0].value.timelineDescription).toEqual(events.rows[0].description);
  });
});
