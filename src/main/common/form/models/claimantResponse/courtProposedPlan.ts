import {IsNotEmpty} from 'class-validator';

export class CourtProposedPlan {
  @IsNotEmpty({message: 'ERRORS.ACCEPT_REPAYMENT_PLAN'})
    decision?: CourtProposedPlanOptions;

  constructor(decision?: CourtProposedPlanOptions) {
    this.decision = decision;
  }
}

export enum CourtProposedPlanOptions {
  ACCEPT_REPAYMENT_PLAN = 'ACCEPT_REPAYMENT_PLAN',
  JUDGE_REPAYMENT_PLAN = 'JUDGE_REPAYMENT_PLAN',
}
