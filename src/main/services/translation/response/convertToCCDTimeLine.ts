import {DefendantTimeline} from "../../../common/form/models/timeLineOfEvents/defendantTimeline";
import {CCDTimeLineOfEvents} from "../../../common/models/ccdResponse/ccdTimeLineOfEvents";

export const toCCDTimeline = (timeline: DefendantTimeline): CCDTimeLineOfEvents[] => {
  const ccdTimelines: CCDTimeLineOfEvents[] = [];
  timeline.rows.forEach((row, index) => {
    const ccdTimeLine: CCDTimeLineOfEvents= {
      id: index.toString(),
      value:{
        timelineDate: row.date,
        timelineDescription: row.description,
      },
    };
    ccdTimelines.push(ccdTimeLine);
  });
  return ccdTimelines;
};