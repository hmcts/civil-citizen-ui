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
      this.option === ApplicationTypeOption.PROCEEDS_IN_HERITAGE
  }

}

export enum ApplicationTypeOption {
  STRIKE_OUT = 'Strike out',
  SUMMARY_JUDGEMENT = 'Summary judgment',
  STAY_THE_CLAIM = 'Stay the claim',
  EXTEND_TIME = 'Extend time',
  AMEND_A_STMT_OF_CASE = 'Amend a statement of case',
  RELIEF_FROM_SANCTIONS = 'Relief from sanctions',
  PROCEEDS_IN_HERITAGE = 'Proceeds In Heritage',
  SET_ASIDE_JUDGEMENT = 'Set aside judgment',
  SETTLE_BY_CONSENT = 'Settle by consent',
  VARY_ORDER = 'Vary order',
  ADJOURN_HEARING = 'Adjourn a hearing',
  UNLESS_ORDER = 'Unless order',
  OTHER = 'Other',
  VARY_PAYMENT_TERMS_OF_JUDGMENT = 'Vary payment terms of judgment',
}
