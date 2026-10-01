import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

export class BreathingSpaceEnterInfo {
  type?: BreathingSpaceType;
  reference?: string;
  start?: Date;

  constructor(
    type?: BreathingSpaceType,
    reference?: string,
    start?: Date,
  ) {
    this.type = type;
    this.reference = reference;
    this.start = start;
  }
}
