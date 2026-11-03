export interface CCDTimeLineOfEvents {
  id?: string;
  value?: CCDTimeLineOfEventsItem;
}

export interface CCDTimeLineOfEventsItem {
  timelineDate?: Date;
  timelineDay?: string;
  timelineMonth?: string;
  timelineYear?: string;
  timelineDescription?: string;
}
