// import { IsDefined, IsNotEmpty, ValidateIf } from 'class-validator';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { YesNo } from 'common/form/models/yesNo';

export class AcceptDefendantOffer {

  // @ValidateIf(o => o.option == YesNo.NO)
  // @IsDefined({ message: 'ERRORS.GENERAL_APPLICATION.RESPONDENT_AGREEMENT.EXPLAIN_WHY_DISAGREE_APPLICATION' })
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    option?: GenericYesNo;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    proposedPaymentPlan?: ProposedPaymentPlan;

  constructor(
    option?: GenericYesNo,
    proposedPaymentPlan?: ProposedPaymentPlan,
  ) {
    this.option = option;
    this.proposedPaymentPlan = proposedPaymentPlan;
  }
}


export class ProposedPaymentPlan {
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    type?: ProposedPaymentPlanOption;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    amountPerMonth?: string;
  @ValidateIf(o => o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    reasonProposedInstalment?: string;
  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    proposedSetDate?: Date;
  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
    reasonProposedSetDate?: string;

  constructor(
    type?: ProposedPaymentPlanOption,
    amountPerMonth?: string,
    reasonProposedInstalment?: string,
    proposedSetDate?: Date,
    reasonProposedSetDate?: string,
  ) {
    this.type = type;
    this.amountPerMonth = amountPerMonth;
    this.reasonProposedInstalment = reasonProposedInstalment;
    this.proposedSetDate = proposedSetDate;
    this.reasonProposedSetDate = reasonProposedSetDate;
  }
}

export enum ProposedPaymentPlanOption {
  ACCEPT_INSTALMENTS = 'ACCEPT_INSTALMENTS',
  PROPOSE_BY_SET_DATE = 'PROPOSE_BY_SET_DATE',
}