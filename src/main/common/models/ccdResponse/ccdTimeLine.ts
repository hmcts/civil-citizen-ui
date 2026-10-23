import {ClaimantTimeline} from 'form/models/timeLineOfEvents/claimantTimeline';

export interface CCDTimeLineOfEvent {
  id?: string;
  value?: CCDTimeLineOfEventDetail;
}

export interface CCDTimeLineOfEventDetail {
  timelineDate?: string;
  timelineDay?: string;
  timelineMonth?: string;
  timelineYear?: string;
  timelineDescription?: string;
}

export const toCCDTimelineEvent = (timeline: ClaimantTimeline): CCDTimeLineOfEvent[] => {
  if (!timeline?.rows) return undefined;
  const ccdTimelines: CCDTimeLineOfEvent[] = [];
  timeline.rows.forEach((row, index) => {
    const ccdTimeLine: CCDTimeLineOfEvent = {
      id: index.toString(),
      value: {
        timelineDate: row.date ? row.date.toString().substring(0,10) : undefined,
        timelineDay: `${row.day}`,
        timelineMonth: `${row.month}`,
        timelineYear: `${row.year}`,
        timelineDescription: row.description,
      },
    };
    ccdTimelines.push(ccdTimeLine);
  });
  return ccdTimelines;
};
