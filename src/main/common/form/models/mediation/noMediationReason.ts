import {IsDefined, IsIn, MaxLength, ValidateIf} from 'class-validator';
import NoMediationReasonOptions from './noMediationReasonOptions';

import {OPTION_REQUIRED, TEXT_TOO_LONG} from '../../../../../main/common/form/validationErrors/errorMessageConstants';

export class NoMediationReason {
  @IsDefined({message: OPTION_REQUIRED})
  @IsIn(Object.values(NoMediationReasonOptions), {message: OPTION_REQUIRED})
    iDoNotWantMediationReason?: string;

  @ValidateIf(o => o.iDoNotWantMediationReason === NoMediationReasonOptions.OTHER)
  @MaxLength(500, {message: TEXT_TOO_LONG})
    otherReason?: string;

  constructor(iDoNotWantMediationReason?: string, otherReason?: string) {
    this.iDoNotWantMediationReason = iDoNotWantMediationReason;
    this.otherReason = otherReason;
  }

}
