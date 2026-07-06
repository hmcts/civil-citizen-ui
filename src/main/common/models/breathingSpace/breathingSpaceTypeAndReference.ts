import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

export class BreathingSpaceTypeAndReference {
  type?: BreathingSpaceType;
  reference?: string;

  constructor(type?: string, reference?: string) {
    this.type = type as BreathingSpaceType;
    this.reference = reference;
  }
}
