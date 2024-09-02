import {IsNotEmpty} from 'class-validator';

export class CourtProposedDate {
  @IsNotEmpty({ message: 'ERRORS.VALID_YES_NO_SELECTION_VARIATION1' })
    decision?: CourtProposedDateOptions;

  constructor(decision?: CourtProposedDateOptions) {
    this.decision = decision;
  }
}

export enum CourtProposedDateOptions {
  ACCEPT_REPAYMENT_DATE = 'ACCEPT_REPAYMENT_DATE',
  JUDGE_REPAYMENT_DATE = 'JUDGE_REPAYMENT_DATE',
}
