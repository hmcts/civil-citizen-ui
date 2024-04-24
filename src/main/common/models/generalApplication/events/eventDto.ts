import {CaseEvent} from './caseEvent';

export interface EventDto {
  event: CaseEvent,
  caseDataUpdate?: ApplicationUpdate
}

export interface ApplicationUpdate {
}
