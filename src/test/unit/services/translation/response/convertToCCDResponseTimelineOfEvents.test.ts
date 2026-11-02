import {toCCDResponseTimelineOfEvents} from 'services/translation/response/convertToCCDResponseTimelineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {Claim} from 'models/claim';
import {PartialAdmission} from 'models/partialAdmission';
import {Party} from 'models/party';
import {ResponseType} from 'form/models/responseType';
import {RejectAllOfClaim} from 'form/models/rejectAllOfClaim';

describe('convert to response timeline of events', () => {

  it('returning proper value for converted timeline events part admit', () => {
    // Given
    const claim: Claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    claim.partialAdmission = new PartialAdmission();
    const events: DefendantTimeline = new DefendantTimeline([new TimelineRow(5, 11, 2022, 'Event 1')]);
    claim.partialAdmission.timeline = events;
    // When
    const result = toCCDResponseTimelineOfEvents(claim);

    // Then
    expect(result.length).toEqual(1);
    expect(result[0].value.timelineDate).toEqual(new Date(events.rows[0].date.toString()));
    expect(result[0].value.timelineDescription).toEqual(events.rows[0].description);
  });

  it('returning proper value for converted timeline events full defence', () => {
    // Given
    const claim: Claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    const events: DefendantTimeline = new DefendantTimeline([new TimelineRow(5, 11, 2022, 'Event 1')]);
    claim.rejectAllOfClaim.timeline = events;
    // When
    const result = toCCDResponseTimelineOfEvents(claim);

    // Then
    expect(result.length).toEqual(1);
    expect(result[0].value.timelineDate).toEqual(new Date(events.rows[0].date.toString()));
    expect(result[0].value.timelineDescription).toEqual(events.rows[0].description);
  });

  it('returning day, month and year for converted timeline events', () => {
    // Given
    const claim: Claim = new Claim();
    claim.respondent1 = new Party();
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    claim.rejectAllOfClaim.timeline = new DefendantTimeline([
      new TimelineRow(5, 11, 2022, 'Event 1'),
      new TimelineRow(undefined, 6, 2023, 'Event 2'),
    ]);
    // When
    const result = toCCDResponseTimelineOfEvents(claim);

    // Then
    expect(result[0].value).toMatchObject({timelineDay: '5', timelineMonth: '11', timelineYear: '2022'});
    expect(result[1].value).toEqual({
      timelineDate: undefined,
      timelineDay: undefined,
      timelineMonth: '6',
      timelineYear: '2023',
      timelineDescription: 'Event 2',
    });
  });
});
