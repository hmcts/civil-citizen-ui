export enum DashboardTaskStatus {
  ACTION_NEEDED = 'Action needed',
  COMPLETE = 'Complete',
  DONE = 'Done',
  READY_TO_VIEW = 'Ready to r',
  NOT_AVAILABLE_YET = 'Not available yet',
  IN_PROGRESS = 'In progress',
  INACTIVE = 'Inactive',

}

export const TaskStatusColor: Record<DashboardTaskStatus, string> = {
  [DashboardTaskStatus.ACTION_NEEDED]:'govuk-tag--red',
  [DashboardTaskStatus.COMPLETE]: '',
  [DashboardTaskStatus.DONE]:'govuk-tag--green',
  [DashboardTaskStatus.READY_TO_VIEW]:'govuk-tag--red',
  [DashboardTaskStatus.NOT_AVAILABLE_YET]:'govuk-tag--grey',
  [DashboardTaskStatus.IN_PROGRESS]:'govuk-tag--yellow',
  [DashboardTaskStatus.INACTIVE]:'govuk-tag--grey',
};
