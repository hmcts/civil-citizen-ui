export enum TaskStatus {
  COMPLETE = 'COMPLETE',
  INCOMPLETE = 'INCOMPLETE',
  DONE = 'DONE',
  READY_TO_VIEW = 'READY_TO_VIEW',
  NOT_AVAILABLE_YET = 'NOT_AVAILABLE_YET',
  IN_PROGRESS = 'IN_PROGRESS',
}

/*export const TaskStatusColor = {
  DONE: { text: TaskStatus.DONE, class: 'govuk-tag--green' },
  READY_TO_VIEW: { text: TaskStatus.READY_TO_VIEW, class: 'govuk-tag--red' },
  NOT_AVAILABLE_YET: { text: TaskStatus.NOT_AVAILABLE_YET, class: 'govuk-tag--grey' },
  IN_PROGRESS: { text: TaskStatus.IN_PROGRESS, class: 'govuk-tag--yellow' },
};*/

export const TaskStatusColor: Record<TaskStatus, string> = {
  [TaskStatus.COMPLETE]: 'govuk-tag--green',
  [TaskStatus.INCOMPLETE]:'govuk-tag--green',
  [TaskStatus.DONE]:'govuk-tag--green',
  [TaskStatus.READY_TO_VIEW]:'govuk-tag--green',
  [TaskStatus.NOT_AVAILABLE_YET]:'govuk-tag--green',
  [TaskStatus.IN_PROGRESS]:'govuk-tag--green',
};
