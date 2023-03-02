import {CCDTimeLineOfEvents, CCDTimeLineOfEventsItem} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';

export const toCCDResponseTimelineOfEvents = (events: DefendantTimeline): CCDTimeLineOfEvents [] => {
  const ccdEvents: CCDTimeLineOfEvents[] = [];

  const timelineRows: TimelineRow [] = events?.rows;

  for(let i = 0; i < timelineRows?.length; i++) {
    const e = timelineRows[i];

    ccdEvents[i] = new CCDTimeLineOfEvents();
    ccdEvents[i].value = new CCDTimeLineOfEventsItem();
    //TODO temporary solution
    // it works with date like 25 September 2022, 25 Sept 2022
    // so just validation for input date format need to be added
    ccdEvents[i].value.timelineDate = formatDate(new Date(Date.parse(e.date)));
    ccdEvents[i].value.timelineDescription = e.description;
  }

  return ccdEvents;
};

const formatDate = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};
