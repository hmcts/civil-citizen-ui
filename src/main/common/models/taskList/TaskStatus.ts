export enum TaskStatus {
  ACTION_NEEDED = 'ACTION_NEEDED',
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
  DONE = 'DONE',
  READY_TO_VIEW = 'READY_TO_VIEW',
  NOT_AVAILABLE_YET = 'NOT_AVAILABLE_YET',
  IN_PROGRESS = 'IN_PROGRESS',
}

export const TaskStatusColor: Record<TaskStatus, string> = {
  [TaskStatus.ACTION_NEEDED]:'govuk-tag--red',
  [TaskStatus.COMPLETE]: '',
  [TaskStatus.INCOMPLETE]:'govuk-tag--grey',
  [TaskStatus.DONE]:'govuk-tag--green',
  [TaskStatus.READY_TO_VIEW]:'govuk-tag--red',
  [TaskStatus.NOT_AVAILABLE_YET]:'govuk-tag--grey',
  [TaskStatus.IN_PROGRESS]:'govuk-tag--yellow',
};
