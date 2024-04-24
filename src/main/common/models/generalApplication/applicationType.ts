import {IsDefined} from 'class-validator';

export class ApplicationType {
  @IsDefined({ message: 'ERRORS.APPLICATION_TYPE_REQUIRED' })
    option?: ApplicationTypeOption;

  constructor(option?: ApplicationTypeOption) {
    this.option = option;
  }

  isOtherSelected(): boolean {
    return this.option === ApplicationTypeOption.AMEND_A_STMT_OF_CASE ||
      this.option === ApplicationTypeOption.SUMMARY_JUDGEMENT ||
      this.option === ApplicationTypeOption.STRIKE_OUT ||
      this.option === ApplicationTypeOption.STAY_THE_CLAIM ||
      this.option === ApplicationTypeOption.UNLESS_ORDER ||
      this.option === ApplicationTypeOption.SETTLE_BY_CONSENT ||
      this.option === ApplicationTypeOption.PROCEEDS_IN_HERITAGE;
  }

}

export enum ApplicationTypeOption {
  STRIKE_OUT = 'STRIKE_OUT', 
  SUMMARY_JUDGEMENT = 'SUMMARY_JUDGEMENT', 
  STAY_THE_CLAIM = 'STAY_THE_CLAIM', 
  EXTEND_TIME = 'EXTEND_TIME', 
  AMEND_A_STMT_OF_CASE = 'AMEND_A_STMT_OF_CASE', 
  RELIEF_FROM_SANCTIONS = 'RELIEF_FROM_SANCTIONS', 
  PROCEEDS_IN_HERITAGE = 'PROCEEDS_IN_HERITAGE', 
  SET_ASIDE_JUDGEMENT = 'SET_ASIDE_JUDGEMENT', 
  SETTLE_BY_CONSENT = 'SETTLE_BY_CONSENT', 
  VARY_ORDER = 'VARY_ORDER', 
  ADJOURN_HEARING = 'ADJOURN_HEARING', 
  UNLESS_ORDER = 'UNLESS_ORDER', 
  OTHER = 'OTHER', 
  VARY_PAYMENT_TERMS_OF_JUDGMENT = 'VARY_PAYMENT_TERMS_OF_JUDGMENT', 
}
