import {CCDTimeLineOfEvents, CCDTimeLineOfEventsItem} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';

export const toCCDResponseTimelineOfEvents = (events: DefendantTimeline): CCDTimeLineOfEvents [] => {
  const ccdEvents: CCDTimeLineOfEvents[] = [];

  for(let i = 0; i < events.rows.length; i++) {
    const e = events.rows[i];

    ccdEvents[i] = new CCDTimeLineOfEvents();
    ccdEvents[i].value = new CCDTimeLineOfEventsItem();
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
