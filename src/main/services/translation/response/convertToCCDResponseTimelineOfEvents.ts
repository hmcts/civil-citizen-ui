import {CCDTimeLineOfEvents, CCDTimeLineOfEventsItem} from 'models/ccdResponse/ccdTimeLineOfEvents';
import {DefendantTimeline} from 'form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from 'form/models/timeLineOfEvents/timelineRow';
import {Claim} from 'models/claim';

export const toCCDResponseTimelineOfEvents = (claim: Claim): CCDTimeLineOfEvents [] => {
  const events: DefendantTimeline = claim.isPartialAdmission()
    ? claim.partialAdmission?.timeline
    : claim.rejectAllOfClaim?.timeline;
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
