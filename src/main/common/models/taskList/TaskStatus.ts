export enum TaskStatus {
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
}

export const TaskStatusColor: Record<TaskStatus, string> = {
  [TaskStatus.COMPLETE]: '',
  [TaskStatus.INCOMPLETE]:'govuk-tag--grey',
};
