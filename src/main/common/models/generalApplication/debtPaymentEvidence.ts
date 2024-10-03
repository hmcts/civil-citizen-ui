import {IsDefined, IsIn, IsNotEmpty, ValidateIf} from 'class-validator';
import {debtPaymentOptions} from 'models/generalApplication/debtPaymentOptions';

export class DebtPaymentEvidence {
  @IsDefined({message: 'ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'})
  @IsIn(Object.values(debtPaymentOptions), {message: 'ERRORS.SELECT_EVIDENCE_DEBT_PAYMENT'})
    debtPaymentOption?: string;

  @ValidateIf(o => o.debtPaymentOption === debtPaymentOptions.UNABLE_TO_PROVIDE_EVIDENCE_OF_FULL_PAYMENT)
  @IsNotEmpty({message: 'ERRORS.UNABLE_TO_PROVIDE_EVIDENCE'})
    provideDetails?: string;

  constructor(debtPaymentOption?: string, provideDetails?: string) {
    this.debtPaymentOption = debtPaymentOption;
    this.provideDetails = provideDetails;
  }
}
