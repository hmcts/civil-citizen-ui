import {CCDTimeLineOfEvents, CCDTimeLineOfEventsItem} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

export const toCCDResponseTimelineOfEvents = (events: DefendantTimeline): CCDTimeLineOfEvents [] => {
  const ccdEvents: CCDTimeLineOfEvents[] = [];

  const timelineRows: TimelineRow [] = events?.rows;

  for(let i = 0; i < timelineRows?.length; i++) {
    const e = timelineRows[i];

    ccdEvents[i] = <CCDTimeLineOfEvents>{};
    ccdEvents[i].value = <CCDTimeLineOfEventsItem>{};
    ccdEvents[i].value.timelineDate = e.date;
    ccdEvents[i].value.timelineDescription = e.description;
  }

  return ccdEvents;
};
