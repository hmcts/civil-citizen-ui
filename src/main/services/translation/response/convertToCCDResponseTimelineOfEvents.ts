import {TimeLineOfEvents} from 'models/timelineOfEvents/timeLineOfEvents';
import {CCDTimeLineOfEvents} from 'models/ccdResponse/ccdTimeLineOfEvents';

export const toCCDResponseTimelineOfEvents = (events: TimeLineOfEvents []): CCDTimeLineOfEvents [] => {
  const ccdEvents: CCDTimeLineOfEvents[] = [];

  for(let i = 0; i < events.length; i++) {
    const e = events[i];

    ccdEvents[i] = new CCDTimeLineOfEvents();
    ccdEvents[i].id = e.id;
    ccdEvents[i].value = e.value;
  }

  return [...ccdEvents];
};
