import {IsDefined, IsIn, MaxLength, ValidateIf} from 'class-validator';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';

export class BreathingSpaceEnterDraft {
  @IsDefined({message: 'ERRORS.BREATHING_SPACE_TYPE_REQUIRED'})
  @IsIn([BreathingSpaceType.MENTAL_HEALTH, BreathingSpaceType.STANDARD], {
    message: 'ERRORS.BREATHING_SPACE_TYPE_REQUIRED',
  })
    type?: BreathingSpaceType;

  @ValidateIf(o => o.reference !== undefined && o.reference !== null && String(o.reference).trim() !== '')
  @MaxLength(16, {message: 'ERRORS.BREATHING_SPACE_REFERENCE_INVALID'})
    reference?: string;

  start?: Date;
  expectedEnd?: Date | null = null;

  constructor(type?: string, reference?: string, start?: Date, expectedEnd?: Date | null) {
    this.type = type as BreathingSpaceType;
    this.reference = reference;
    this.start = start;
    this.expectedEnd = expectedEnd ?? null;
  }
}
