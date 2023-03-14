import {CCDTimeLineOfEvents, CCDTimeLineOfEventsItem} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {stringDateToObject} from 'common/utils/dateUtils';

export const toCCDResponseTimelineOfEvents = (events: DefendantTimeline): CCDTimeLineOfEvents [] => {
  const ccdEvents: CCDTimeLineOfEvents[] = [];

  const timelineRows: TimelineRow [] = events?.rows;

  for(let i = 0; i < timelineRows?.length; i++) {
    const e = timelineRows[i];

    ccdEvents[i] = <CCDTimeLineOfEvents>{};
    ccdEvents[i].value = <CCDTimeLineOfEventsItem>{};
    //TODO temporary solution
    // it works with date like 25 September 2022, 25 Sept 2022
    // so just validation for input date format need to be added
    ccdEvents[i].value.timelineDate = stringDateToObject(e.date);
    ccdEvents[i].value.timelineDescription = e.description;
  }

  return ccdEvents;
};
