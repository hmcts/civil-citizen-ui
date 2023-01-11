import {CaseEvent} from './caseEvent';
import {BreathingSpace} from "models/breathingSpace";

export interface EventDto {
  event: CaseEvent,
  caseDataUpdate?: ClaimUpdate
}

export interface ClaimUpdate {
  respondentSolicitor1AgreedDeadlineExtension?:Date;
}

export interface EventBreathing{
  event: CaseEvent,
  breathingSpec: BreathingSpace
}

