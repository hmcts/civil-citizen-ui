import { IsDate, IsNotEmpty, Max, Min, Validate, ValidateIf } from 'class-validator';
import { YesNo } from 'common/form/models/yesNo';
import { OptionalDateFourDigitValidator } from 'common/form/validators/optionalDateFourDigitValidator';
import { OptionalDateNotInPastValidator } from 'common/form/validators/optionalDateNotInPastValidator';
import { DateConverter } from 'common/utils/dateConverter';

export class AcceptDefendantOffer {

  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_ACCEPT' })
    option?: YesNo;

  @ValidateIf(o => o.option === YesNo.NO)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_CHOOSE' })
    type?: ProposedPaymentPlanOption;

  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_INSTALMENT' })
    amountPerMonth?: string;

  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.ACCEPT_INSTALMENTS)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_NOT_ACCEPT' })
    reasonProposedInstalment?: string;
    
  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE && o.day <32 && o.month<13 && o.year > 999)
  @Validate(OptionalDateNotInPastValidator, {message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.FUTURE_DATE'})
  @IsDate({message: 'ERRORS.VALID_DATE'})
    proposedSetDate?: Date;

  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @Min(1872,{message:'ERRORS.VALID_YEAR'})
  @Validate(OptionalDateFourDigitValidator, {message: 'ERRORS.VALID_FOUR_DIGIT_YEAR'})
    year: number;

  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @Min(1,{message:'ERRORS.VALID_MONTH'})
  @Max(12,{message:'ERRORS.VALID_MONTH'})
    month: number;

  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @Min(1,{message:'ERRORS.VALID_DAY'})
  @Max(31,{message:'ERRORS.VALID_DAY'})
    day: number;

  @ValidateIf(o => o.option === YesNo.NO && o.type === ProposedPaymentPlanOption.PROPOSE_BY_SET_DATE)
  @IsNotEmpty({ message: 'ERRORS.GENERAL_APPLICATION.ACCEPT_DEFENDANT_OFFER.ERROR_NOT_ACCEPT' })
    reasonProposedSetDate?: string;

  constructor(
    option?: YesNo,
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
    this.day = Number(day);
    this.month = Number(month);
    this.year = Number(year);
    this.proposedSetDate = DateConverter.convertToDate(year, month, day);
  }
}

export enum ProposedPaymentPlanOption {
  ACCEPT_INSTALMENTS = 'ACCEPT_INSTALMENTS',
  PROPOSE_BY_SET_DATE = 'PROPOSE_BY_SET_DATE',
}
