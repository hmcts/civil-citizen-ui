import {toCCDResponseTimelineOfEvents} from 'services/translation/response/convertToCCDResponseTimelineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {formatStringDate} from 'common/utils/dateUtils';

describe('convert to response timeline of events', () => {

  it('returning proper value for converted timeline events', () => {
    // Given
    const events: DefendantTimeline = new DefendantTimeline([new TimelineRow('5 November 2022', 'Event 1')]);
    // When
    const result = toCCDResponseTimelineOfEvents(events);

    // Then
    expect(result.length).toEqual(1);
    expect(result[0].value.timelineDate).toEqual(formatStringDate(events.rows[0].date));
    expect(result[0].value.timelineDescription).toEqual(events.rows[0].description);
  });
});
