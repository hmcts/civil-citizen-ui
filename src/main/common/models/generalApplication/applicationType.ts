import {IsDefined} from 'class-validator';

export class ApplicationType {
  @IsDefined({ message: 'ERRORS.APPLICATION_TYPE_REQUIRED' })
    option?: ApplicationTypeOption;

  constructor(option?: ApplicationTypeOption) {
    this.option = option;
  }

  isOtherSelected(): boolean {
    return this.option === ApplicationTypeOption.AMEND_A_STMT_OF_CASE ||
      this.option === ApplicationTypeOption.SUMMARY_JUDGMENT ||
      this.option === ApplicationTypeOption.STRIKE_OUT ||
      this.option === ApplicationTypeOption.STAY_THE_CLAIM ||
      this.option === ApplicationTypeOption.UNLESS_ORDER ||
      this.option === ApplicationTypeOption.SETTLE_BY_CONSENT ||
      this.option === ApplicationTypeOption.OTHER;
  }

}

export enum ApplicationTypeOption {
  STRIKE_OUT = 'STRIKE_OUT',
  SUMMARY_JUDGMENT = 'SUMMARY_JUDGMENT',
  STAY_THE_CLAIM = 'STAY_THE_CLAIM',
  EXTEND_TIME = 'EXTEND_TIME',
  AMEND_A_STMT_OF_CASE = 'AMEND_A_STMT_OF_CASE',
  RELIEF_FROM_SANCTIONS = 'RELIEF_FROM_SANCTIONS',
  SET_ASIDE_JUDGEMENT = 'SET_ASIDE_JUDGEMENT',
  SETTLE_BY_CONSENT = 'SETTLE_BY_CONSENT',
  VARY_ORDER = 'VARY_ORDER',
  ADJOURN_HEARING = 'ADJOURN_HEARING',
  UNLESS_ORDER = 'UNLESS_ORDER',
  OTHER_OPTION = 'OTHER_OPTION',
  OTHER = 'OTHER',
  VARY_PAYMENT_TERMS_OF_JUDGMENT = 'VARY_PAYMENT_TERMS_OF_JUDGMENT',
  CONFIRM_YOU_PAID_CCJ = 'CONFIRM_YOU_PAID_CCJ',
}

export const selectedApplicationType: Partial<{ [key in ApplicationTypeOption]: string; }> = {
  [ApplicationTypeOption.ADJOURN_HEARING]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING',
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_CLAIM',
  [ApplicationTypeOption.EXTEND_TIME]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME',
  [ApplicationTypeOption.OTHER]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.NOT_ON_LIST',
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RELIEF_PENALTY',
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SETTLING',
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT',
  [ApplicationTypeOption.STAY_THE_CLAIM]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE',
  [ApplicationTypeOption.STRIKE_OUT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.STRIKE_OUT',
  [ApplicationTypeOption.SUMMARY_JUDGMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SUMMARY_JUDGMENT',
  [ApplicationTypeOption.UNLESS_ORDER]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.IMPOSE_SANCTION',
  [ApplicationTypeOption.VARY_ORDER]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RECONSIDER',
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT',
  [ApplicationTypeOption.CONFIRM_YOU_PAID_CCJ]: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CONFIRM_YOU_PAID_CCJ',
};

export const selectedApplicationTypeDescription: Partial<{ [key in ApplicationTypeOption]: string; }> = {
  [ApplicationTypeOption.ADJOURN_HEARING]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION',
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_CLAIM_DESCRIPTION',
  [ApplicationTypeOption.EXTEND_TIME]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_MORE_TIME_DESCRIPTION',
  [ApplicationTypeOption.OTHER]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_DO_SOMETHING_DESCRIPTION',
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RELIEF_PENALTY_DESCRIPTION',
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SETTLING_DESCRIPTION',
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CANCEL_JUDGMENT_DESCRIPTION',
  [ApplicationTypeOption.STAY_THE_CLAIM]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_PAUSE_DESCRIPTION',
  [ApplicationTypeOption.STRIKE_OUT]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_STRIKE_OUT_DESCRIPTION',
  [ApplicationTypeOption.SUMMARY_JUDGMENT]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SUMMARY_JUDGMENT_DESCRIPTION',
  [ApplicationTypeOption.UNLESS_ORDER]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_IMPOSE_SANCTION_DESCRIPTION',
  [ApplicationTypeOption.VARY_ORDER]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RECONSIDER_DESCRIPTION',
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_VARY_JUDGMENT_DESCRIPTION',
};

export const GeneralApplicationTypesDisplayFromCCD: { [key in ApplicationTypeOption]: string } = {
  [ApplicationTypeOption.ADJOURN_HEARING]: 'Adjourn a hearing',
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: 'Amend a statement of case',
  [ApplicationTypeOption.EXTEND_TIME]: 'Extend time',
  [ApplicationTypeOption.OTHER]: 'Other',
  [ApplicationTypeOption.OTHER_OPTION]: 'Other option',
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: 'Relief from sanctions',
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: 'Set aside judgment',
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: 'Settle by consent',
  [ApplicationTypeOption.STAY_THE_CLAIM]: 'Stay the claim',
  [ApplicationTypeOption.STRIKE_OUT]: 'Strike out',
  [ApplicationTypeOption.SUMMARY_JUDGMENT]: 'Summary judgment',
  [ApplicationTypeOption.UNLESS_ORDER]: 'Unless order',
  [ApplicationTypeOption.VARY_ORDER]: 'Vary order',
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: 'Vary payment terms of judgment',
  [ApplicationTypeOption.CONFIRM_YOU_PAID_CCJ]: 'Confirm you\'ve paid a judgment debt',
};

export const LinKFromValues = {
  start: 'start',
  addAnotherApp: 'addAnotherApp',
};
