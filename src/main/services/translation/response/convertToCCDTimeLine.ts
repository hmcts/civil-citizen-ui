import { DefendantTimeline } from "../../../common/form/models/timeLineOfEvents/defendantTimeline";
import { CCDTimeLineOfEvents } from "../../../common/models/ccdResponse/ccdTimeLineOfEvents";

export const toCCDTimeline = (timeline: DefendantTimeline): CCDTimeLineOfEvents[] => {
  const ccdTimeline: CCDTimeLineOfEvents[] = [];
  timeline.rows.forEach((row, index) => {
    ccdTimeline[index].id = index.toString();
    ccdTimeline[index].value.timelineDate = row.date;
    ccdTimeline[index].value.timelineDescription = row.description;
  });
  return ccdTimeline;
};