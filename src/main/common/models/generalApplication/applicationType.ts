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
  CONFIRM_CCJ_DEBT_PAID = 'CONFIRM_CCJ_DEBT_PAID',
}

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
  [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID]: 'Confirm CCJ debt paid',
};

export const LinKFromValues = {
  start: 'start',
  addAnotherApp: 'addAnotherApp',
};
