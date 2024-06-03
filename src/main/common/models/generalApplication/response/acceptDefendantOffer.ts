import { IsDate, IsNotEmpty, Max, Min, Validate, ValidateIf } from 'class-validator';
import { GenericYesNo } from 'common/form/models/genericYesNo';
import { YesNo } from 'common/form/models/yesNo';
import { OptionalDateFourDigitValidator } from 'common/form/validators/optionalDateFourDigitValidator';
import { OptionalDateInPastValidator } from 'common/form/validators/optionalDateInPastValidator';
import { DateConverter } from 'common/utils/dateConverter';

export class AcceptDefendantOffer {

  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_ACCEPT' })
    option?: GenericYesNo;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_CHOOSE' })
    type?: ProposedPaymentPlanOption;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_INSTALMENT' })
    amountPerMonth?: string;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_NOT_ACCEPT' })
    reasonProposedInstalment?: string;
    
    // @ValidateIf(o => (o.day && o.month && o.year && o.day <32 && o.month<13 && o.year > 999))
    // @ValidateIf(o => (o.day <32 && o.month<13 && o.year > 999))
  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE && o.day <32 && o.month<13 && o.year > 999)
  @IsDate({message: 'ERRORS.VALID_DATE'})
  @Validate(OptionalDateInPastValidator, {message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.FUTURE_DATE'})
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_IN_FULL' })
    proposedSetDate?: Date;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @Min(1872,{message:'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @Min(1,{message:'ERRORS.VALID_MONTH'})
  @Max(12,{message:'ERRORS.VALID_MONTH'})
    month: number;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @Min(1,{message:'ERRORS.VALID_DAY'})
  @Max(31,{message:'ERRORS.VALID_DAY'})
    day: number;

  @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_NOT_ACCEPT' })
    reasonProposedSetDate?: string;

  constructor(
    option?: GenericYesNo,
    type?: ProposedPaymentPlanOption,
    amountPerMonth?: string,
    reasonProposedInstalment?: string,
    year?: string,
    month?: string,
    day?: string,
    reasonProposedSetDate?: string,
  ) {
    this.option = option;
    this.type = type;
    this.amountPerMonth = amountPerMonth;
    this.reasonProposedInstalment = reasonProposedInstalment;
    this.reasonProposedSetDate = reasonProposedSetDate;
    this.proposedSetDate = DateConverter.convertToDate(year, month, day);
  }
}

// export class ProposedPaymentPlan {
//   @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
//     type?: ProposedPaymentPlanOption;

//   @ValidateIf(o => o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
//   @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
//     amountPerMonth?: string;

//   @ValidateIf(o => o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
//   @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
//     reasonProposedInstalment?: string;

//   @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
//   @ValidateIf(o => (o.day && o.month && o.year && o.day <32 && o.month<13 && o.year > 999))
//   @IsDate({message: 'ERRORS.VALID_DATE'})
//   @Validate(OptionalDateInPastValidator, {message: 'ERRORS.GENERAL_APPLICATION.X'})
//   @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
//     proposedSetDate?: Date;

//   @Min(1872,{message:'ERRORS.VALID_YEAR'})
//   @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
//     year: number;

//   @Min(1,{message:'ERRORS.VALID_MONTH'})
//   @Max(12,{message:'ERRORS.VALID_MONTH'})
//     month: number;

//   @Min(1,{message:'ERRORS.VALID_DAY'})
//   @Max(31,{message:'ERRORS.VALID_DAY'})
//     day: number;

//   @ValidateIf(o => o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
//   @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.X' })
//     reasonProposedSetDate?: string;

//   constructor(
//     type?: ProposedPaymentPlanOption,
//     amountPerMonth?: string,
//     reasonProposedInstalment?: string,
//     reasonProposedSetDate?: string,
//     year?: string,
//     month?: string,
//     day?: string,
//   ) {
//     this.type = type;
//     this.amountPerMonth = amountPerMonth;
//     this.reasonProposedInstalment = reasonProposedInstalment;
//     this.reasonProposedSetDate = reasonProposedSetDate;
//     this.proposedSetDate = DateConverter.convertToDate(year, month, day);
//   }
// }

export enum ProposedPaymentPlanOption {
  ACCEPT_INSTALMENTS = 'ACCEPT_INSTALMENTS',
  PROPOSE_BY_SET_DATE = 'PROPOSE_BY_SET_DATE',
}