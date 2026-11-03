export interface TimeLineOfEvents {
  id: string,
  value: TimeLineOfEventDetails,
}

export interface TimeLineOfEventDetails {
  timelineDate: string,
  timelineDay?: string,
  timelineMonth?: string,
  timelineYear?: string,
  timelineDescription: string,
}
