import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';

export interface CCDTimeLineOfEvent {
  id?: string;
  value?: CCDTimeLineOfEventDetail;
}

export interface CCDTimeLineOfEventDetail {
  timelineDate?: string;
  timelineDescription?: string;
}

export const toCCDTimelineEvent = (timeline: ClaimantTimeline): CCDTimeLineOfEvent[] => {
  if (!timeline?.rows) return undefined;
  const ccdTimelines: CCDTimeLineOfEvent[] = [];
  timeline.rows.forEach((row, index) => {
    const date=row.date.toString().substring(0,10);
    const ccdTimeLine: CCDTimeLineOfEvent = {
      id: index.toString(),
      value: {
        timelineDate: date,
        timelineDescription: row.description,
      },
    };
    ccdTimelines.push(ccdTimeLine);
  });
  return ccdTimelines;
};
