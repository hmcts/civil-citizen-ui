import {toCCDResponseTimelineOfEvents} from 'services/translation/response/convertToCCDResponseTimelineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';

describe('convert to response timeline of events', () => {

  it('returning proper value for converted timeline events', () => {
    const events: DefendantTimeline = {
      filterOutEmptyRows(): void {
        // require to be override
      },
      comment: '',
      rows: [
        {
          description: 'Some description',
          date: '2022-09-12',
          isEmpty(): boolean {
            return false;
          },
          isAtLeastOneFieldPopulated(): boolean {
            return true;
          },
        },
      ],
    };

    const result = toCCDResponseTimelineOfEvents(events);

    expect(result.length).toEqual(1);
    expect(result[0].value.timelineDate).toEqual(events.rows[0].date);
    expect(result[0].value.timelineDescription).toEqual(events.rows[0].description);
  });
});
