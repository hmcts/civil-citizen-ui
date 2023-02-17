export class CCDTimeLineOfEvents {
  id: string;
  value: CCDTimeLineOfEventsItem;
}

export interface CCDTimeLineOfEventsItem {
  timelineDate: string,
  timelineDescription: string,
}
