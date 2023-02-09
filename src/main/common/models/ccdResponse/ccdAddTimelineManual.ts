export interface CCDAddTimelineManual {
  specResponseTimelineOfEvents: TimeLineOfEvents [];
}
export interface TimeLineOfEvents {
  value: TimeLineEventDetails
}
export interface TimeLineEventDetails {
  timelineDate: Date
  timelineDescription: string
}
