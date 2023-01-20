import {CaseEvent} from './caseEvent';

export interface EventDto<T> {
  event: CaseEvent,
  caseDataUpdate?: T
}

export interface ClaimUpdate {
  respondentSolicitor1AgreedDeadlineExtension?:Date;
}


