export enum ApplicationState {
  AWAITING_RESPONDENT_RESPONSE = 'AWAITING_RESPONDENT_RESPONSE',
  AWAITING_APPLICATION_PAYMENT = 'AWAITING_APPLICATION_PAYMENT',
  APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION = 'APPLICATION_SUBMITTED_AWAITING_JUDICIAL_DECISION',
  APPLICATION_ADD_PAYMENT = 'APPLICATION_ADD_PAYMENT',
}

export enum ApplicationStatus {
IN_PROGRESS = 'IN_PROGRESS',
TO_DO = 'TO_DO',
}

export class ApplicationSummary {
  state: ApplicationState;
  status: ApplicationStatus;
  statusColor?: string;
  types: string;
  id: string;
  createdDate: string;
  applicationUrl: string;
}

export const StatusColor: Record<ApplicationStatus, string> = {
  [ApplicationStatus.IN_PROGRESS]: 'govuk-tag--green',
  [ApplicationStatus.TO_DO]: 'govuk-tag--red',
};
