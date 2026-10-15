import {ClaimUpdate} from 'models/events/eventDto';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

export interface CCDBreathingSpaceEnterInfo {
  type?: BreathingSpaceType;
  reference?: string;
  start?: string;
}

export interface CCDBreathingSpaceLiftInfo {
  expectedEnd?: string;
  reasonToLift?: string;
}

export interface CCDEnterBreathingSpace extends ClaimUpdate {
  enterBreathing: CCDBreathingSpaceEnterInfo;
}

export interface CCDLiftBreathingSpace extends ClaimUpdate {
  liftBreathing: CCDBreathingSpaceLiftInfo;
}
