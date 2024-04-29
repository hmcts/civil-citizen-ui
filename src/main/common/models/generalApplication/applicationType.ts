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
  ADJOURN_HEARING = 'ADJOURN_HEARING',
  AMEND_A_STMT_OF_CASE = 'AMEND_A_STMT_OF_CASE',
  EXTEND_TIME = 'EXTEND_TIME',
  OTHER = 'OTHER',
  PROCEEDS_IN_HERITAGE = 'PROCEEDS_IN_HERITAGE',
  RELIEF_FROM_SANCTIONS = 'RELIEF_FROM_SANCTIONS',
  SETTLE_BY_CONSENT = 'SETTLE_BY_CONSENT',
  SET_ASIDE_JUDGEMENT = 'SET_ASIDE_JUDGEMENT',
  STAY_THE_CLAIM = 'STAY_THE_CLAIM',
  STRIKE_OUT = 'STRIKE_OUT',
  SUMMARY_JUDGEMENT = 'SUMMARY_JUDGEMENT',
  UNLESS_ORDER = 'UNLESS_ORDER',
  VARY_ORDER = 'VARY_ORDER',
  VARY_PAYMENT_TERMS_OF_JUDGMENT = 'VARY_PAYMENT_TERMS_OF_JUDGMENT',
}

export const selectedApplicationType: Partial<{ [key in ApplicationTypeOption]: string; }> = {
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_A_JUDGMENT',
}
