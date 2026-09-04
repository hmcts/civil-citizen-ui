import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

export class BreathingSpaceEnterInfo {
  type?: BreathingSpaceType;
  reference?: string;
  start?: Date;
  expectedEnd?: Date | null;

  constructor(
    type?: BreathingSpaceType,
    reference?: string,
    start?: Date,
    expectedEnd?: Date | null,
  ) {
    this.type = type;
    this.reference = reference;
    this.start = start;
    this.expectedEnd = expectedEnd;
  }
}
