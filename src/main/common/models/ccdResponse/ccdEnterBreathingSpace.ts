import {ClaimUpdate} from 'models/events/eventDto';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

export interface CCDBreathingSpaceEnterInfo {
  type?: BreathingSpaceType;
  reference?: string;
  start?: string;
  expectedEnd?: string | null;
}

export interface CCDEnterBreathingSpace extends ClaimUpdate {
  enterBreathing: CCDBreathingSpaceEnterInfo;
}
