import {IsDefined, IsIn, MaxLength, ValidateIf} from 'class-validator';
import NoMediationReasonOptions from './noMediationReasonOptions';

export class ValidationErrors {
  static readonly OPTION_REQUIRED: string = 'Please select one reason';
  static readonly TEXT_TOO_LONG: string = 'Reason must be 500 characters or fewer';
}

export class NoMediationReason {
  @IsDefined({message: ValidationErrors.OPTION_REQUIRED})
  @IsIn(Object.values(NoMediationReasonOptions), {message: ValidationErrors.OPTION_REQUIRED})
    iDoNotWantMediationReason?: string;

  @ValidateIf(o => o.iDoNotWantMediationReason === NoMediationReasonOptions.OTHER)
  @MaxLength(500, {message: ValidationErrors.TEXT_TOO_LONG})
    otherReason?: string;

  constructor(iDoNotWantMediationReason?: string, otherReason?: string) {
    this.iDoNotWantMediationReason = iDoNotWantMediationReason;
    this.otherReason = otherReason;
  }

}
