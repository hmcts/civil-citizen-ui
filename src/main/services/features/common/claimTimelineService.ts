import {Claim} from 'models/claim';
import {TimeLineOfEventDetails} from 'models/timelineOfEvents/timeLineOfEvents';
import {formatDateToFullDate} from 'common/utils/dateUtils';

const getClaimTimeline = (claim: Claim, lng: string) : TimeLineOfEventDetails[] => {
  const timeline : TimeLineOfEventDetails[] = [];
  if (claim.timelineOfEvents) {
    claim.timelineOfEvents.forEach(event => timeline.push({
      timelineDate: formatDateToFullDate(new Date(event.value.timelineDate), lng),
      timelineDescription: event.value.timelineDescription,
    }));
  }
  return timeline;
};

export {
  getClaimTimeline,
};
