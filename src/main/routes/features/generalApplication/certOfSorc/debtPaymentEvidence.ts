import {IsDefined, IsIn, IsNotEmpty, MaxLength, ValidateIf} from 'class-validator';
import {debtPaymentOptions} from "routes/features/generalApplication/certOfSorc/debtPaymentOptions";

export class DebtPaymentEvidence {
  @IsDefined({message: 'ERRORS.OPTION_REQUIRED'})
  @IsIn(Object.values(debtPaymentOptions), {message: 'ERRORS.OPTION_REQUIRED'})
  evidence?: string;

  @ValidateIf(o => o.evidence === debtPaymentOptions.NO_EVIDENCE)
  @IsNotEmpty({message: 'ERRORS.SPECIFY_A_REASON'})
  @MaxLength(500, {message: 'ERRORS.TEXT_TOO_LONG'})
  provideDetails?: string;

  constructor(evidence?: string, provideDetails?: string) {
    this.evidence = evidence;
    this.provideDetails = provideDetails;
  }

}
