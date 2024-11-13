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
      this.option === ApplicationTypeOption.OTHER;
  }

}

export enum ApplicationTypeOption {
  STRIKE_OUT = 'STRIKE_OUT',
  SUMMARY_JUDGEMENT = 'SUMMARY_JUDGEMENT',
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

export const LinKFromValues = {
  start: 'start',
  addAnotherApp: 'addAnotherApp',
};

export enum ApplicationTypeOptionSelection {
  BY_APPLICATION_TYPE = 'BY_APPLICATION_TYPE',
  BY_APPLICATION_TYPE_DESCRIPTION = 'BY_APPLICATION_TYPE_DESCRIPTION',
  BY_APPLICATION_DISPLAY_FROM_CCD = 'BY_APPLICATION_DISPLAY_FROM_CCD'
}

export const getApplicationTypeOptionByTypeAndDescription = (applicationOption: ApplicationTypeOption, applicationTypeOptionSelection: ApplicationTypeOptionSelection) => {

  const selectedApplicationTypeByOptionElement: [string, string, string] = selectedApplicationTypeByOptions[applicationOption];
  if (selectedApplicationTypeByOptionElement) {
    switch (applicationTypeOptionSelection) {
      case ApplicationTypeOptionSelection.BY_APPLICATION_TYPE:
        return selectedApplicationTypeByOptionElement[0];
      case  ApplicationTypeOptionSelection.BY_APPLICATION_TYPE_DESCRIPTION:
        return selectedApplicationTypeByOptionElement[1];
      case ApplicationTypeOptionSelection.BY_APPLICATION_DISPLAY_FROM_CCD:
        return selectedApplicationTypeByOptionElement[2];
      default:
        return undefined;
    }
  }
  return undefined;
};

export const selectedApplicationTypeByOptions: Partial<{ [key in ApplicationTypeOption]: [string, string, string]; }> = {
  [ApplicationTypeOption.ADJOURN_HEARING]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION', 'Adjourn a hearing'],
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_CLAIM', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_CLAIM_DESCRIPTION', 'Amend a statement of case'],
  [ApplicationTypeOption.EXTEND_TIME]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_MORE_TIME_DESCRIPTION', 'Extend time'],
  [ApplicationTypeOption.OTHER]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.NOT_ON_LIST', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_DO_SOMETHING_DESCRIPTION', 'Other'],
  [ApplicationTypeOption.OTHER_OPTION]: ['', '', 'Other option'],
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RELIEF_PENALTY', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RELIEF_PENALTY_DESCRIPTION', 'Relief from sanctions'],
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SETTLING', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SETTLING_DESCRIPTION', 'Settle by consent'],
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CANCEL_JUDGMENT_DESCRIPTION', 'Set aside judgment'],
  [ApplicationTypeOption.STAY_THE_CLAIM]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_PAUSE_DESCRIPTION', 'Stay the claim'],
  [ApplicationTypeOption.STRIKE_OUT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.STRIKE_OUT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_STRIKE_OUT_DESCRIPTION', 'Strike out'],
  [ApplicationTypeOption.SUMMARY_JUDGEMENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SUMMARY_JUDGMENT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SUMMARY_JUDGMENT_DESCRIPTION', 'Summary judgment'],
  [ApplicationTypeOption.UNLESS_ORDER]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.IMPOSE_SANCTION', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_IMPOSE_SANCTION_DESCRIPTION', 'Unless order'],
  [ApplicationTypeOption.VARY_ORDER]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RECONSIDER', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RECONSIDER_DESCRIPTION', 'Vary order'],
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_VARY_JUDGMENT_DESCRIPTION', 'Vary payment terms of judgment'],
  [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CONFIRM_YOU_PAID_CCJ', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.CONFIRM_YOU_PAID_DESCRIPTION', 'Confirm you\'ve paid a judgment debt'],
};
