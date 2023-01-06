import {ClaimUpdate} from "models/events/eventDto";
import {DebtRespiteOptionType} from "models/breathingSpace/debtRespiteOptionType";

export interface CcdBreathingSpace extends ClaimUpdate{
  breathingSpaceEnterInfo: CCDBreathingSpace;
}

export class CCDBreathingSpace {
  enter: CCDBreathingSpaceEnter
}

export class CCDBreathingSpaceEnter {
  reference: string;
  start: Date;
  expectedEnd: Date;
  type: DebtRespiteOptionType
}
