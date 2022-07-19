import {CaseEvent} from './caseEvent';


export interface EventDto {
  event: CaseEvent,
  caseDataUpdate: Map<string, string>
}
