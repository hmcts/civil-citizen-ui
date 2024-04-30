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

export const selectedApplicationType: Partial<{ [key in ApplicationTypeOption]: string; }> = {
  [ApplicationTypeOption.ADJOURN_HEARING]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING',
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_CLAIM',
  [ApplicationTypeOption.EXTEND_TIME]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME',
  [ApplicationTypeOption.PROCEEDS_IN_HERITAGE]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.OTHER',
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RELIEF_PENALTY',
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SETTLING',
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT',
  [ApplicationTypeOption.STAY_THE_CLAIM]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE',
  [ApplicationTypeOption.STRIKE_OUT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.STRIKE_OUT',
  [ApplicationTypeOption.SUMMARY_JUDGEMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SUMMARY_JUDGMENT',
  [ApplicationTypeOption.UNLESS_ORDER]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.IMPOSE_SANCTION',
  [ApplicationTypeOption.VARY_ORDER]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RECONSIDER',
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT',
}
