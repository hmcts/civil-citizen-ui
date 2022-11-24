import {ClaimantTimeline} from '../../../common/form/models/timeLineOfEvents/claimantTimeline';
import {CCDTimeLineOfEvents} from '../../../common/models/ccdResponse/ccdTimeLineOfEvents';

export const toCCDTimeline = (timeline: ClaimantTimeline): CCDTimeLineOfEvents[] => {
  if (!timeline?.rows) return undefined;
  const ccdTimelines: CCDTimeLineOfEvents[] = [];
  timeline.rows.forEach((row, index) => {
    const ccdTimeLine: CCDTimeLineOfEvents = {
      id: index.toString(),
      value: {
        timelineDate: row.date,
        timelineDescription: row.description,
      },
    };
    ccdTimelines.push(ccdTimeLine);
  });
  return ccdTimelines;
};
