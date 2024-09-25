import {IsDefined, IsIn, IsNotEmpty, ValidateIf} from 'class-validator';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';

export class DebtPaymentEvidence {
  @IsDefined({message: 'ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'})
  @IsIn(Object.values(debtPaymentOptions), {message: 'ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'})
    evidence?: string;

  @ValidateIf(o => o.evidence === debtPaymentOptions.NO_EVIDENCE)
  @IsNotEmpty({message: 'ERRORS.UNABLE_TO_PROVIDE_EVIDENCE'})
    provideDetails?: string;

  constructor(evidence?: string, provideDetails?: string) {
    this.evidence = evidence;
    this.provideDetails = provideDetails;
  }
}
