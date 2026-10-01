export class BreathingSpaceLiftInfo {
  expectedEnd?: Date;
  reasonToLift?: string;

  constructor(expectedEnd?: Date, reasonToLift?: string) {
    this.expectedEnd = expectedEnd;
    this.reasonToLift = reasonToLift;
  }
}
