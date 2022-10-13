import {IsDefined, IsIn, MaxLength, ValidateIf} from 'class-validator';
import {NoMediationReasonOptions} from '../mediation/noMediationReasonOptions';

export class NoMediationReason {
  @IsDefined({message: 'ERRORS.OPTION_REQUIRED'})
  @IsIn(Object.values(NoMediationReasonOptions), {message: 'ERRORS.OPTION_REQUIRED'})
    iDoNotWantMediationReason?: string;

  @ValidateIf(o => o.iDoNotWantMediationReason === NoMediationReasonOptions.OTHER)
  @MaxLength(500, {message: 'ERRORS.TEXT_TOO_LONG'})
    otherReason?: string;

  constructor(iDoNotWantMediationReason?: string, otherReason?: string) {
    this.iDoNotWantMediationReason = iDoNotWantMediationReason;
    this.otherReason = otherReason;
  }

}
