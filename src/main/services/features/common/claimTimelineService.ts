import {Claim} from 'models/claim';
import {TimeLineOfEventDetails} from 'models/timelineOfEvents/timeLineOfEvents';
import {formatTimelineDate} from 'common/utils/dateUtils';

const getClaimTimeline = (claim: Claim, lng: string) : TimeLineOfEventDetails[] => {
  const timeline : TimeLineOfEventDetails[] = [];
  if (claim.timelineOfEvents) {
    claim.timelineOfEvents.forEach(event => timeline.push({
      timelineDate: formatTimelineDate({
        date: event.value.timelineDate,
        day: event.value.timelineDay,
        month: event.value.timelineMonth,
        year: event.value.timelineYear,
      }, lng),
      timelineDescription: event.value.timelineDescription,
    }));
  }
  return timeline;
};

export {
  getClaimTimeline,
};
