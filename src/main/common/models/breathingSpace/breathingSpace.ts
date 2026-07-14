export enum BreathingSpaceType {
  STANDARD = 'STANDARD',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
}

export class BreathingSpaceEnterInfo {
  type?: BreathingSpaceType;
  reference?: string;
  start?: Date;
}

export class BreathingSpaceLiftInfo {
  expectedEnd?: Date;
  actualEnd?: Date;
  externalReference?: string;
  liftEvent?: string;
  liftReason?: string;
}

export class BreathingSpace {
  enter?: BreathingSpaceEnterInfo;
  lift?: BreathingSpaceLiftInfo;
}
