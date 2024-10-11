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
  [ApplicationTypeOption.ADJOURN_HEARING]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.ADJOURN_HEARING'],
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_CLAIM', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_CLAIM_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.AMEND_A_STMT_OF_CASE'],
  [ApplicationTypeOption.EXTEND_TIME]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_MORE_TIME_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.EXTEND_TIME'],
  [ApplicationTypeOption.OTHER]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.NOT_ON_LIST', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_DO_SOMETHING_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.OTHER'],
  [ApplicationTypeOption.OTHER_OPTION]: ['', '', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.OTHER_OPTION'],
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RELIEF_PENALTY', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RELIEF_PENALTY_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.RELIEF_FROM_SANCTIONS'],
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SETTLING', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SETTLING_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.SETTLE_BY_CONSENT'],
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CANCEL_JUDGMENT_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.SET_ASIDE_JUDGEMENT'],
  [ApplicationTypeOption.STAY_THE_CLAIM]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_PAUSE_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.STAY_THE_CLAIM'],
  [ApplicationTypeOption.STRIKE_OUT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.STRIKE_OUT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_STRIKE_OUT_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.STRIKE_OUT'],
  [ApplicationTypeOption.SUMMARY_JUDGMENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SUMMARY_JUDGMENT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SUMMARY_JUDGMENT_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.SUMMARY_JUDGMENT'],
  [ApplicationTypeOption.UNLESS_ORDER]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.IMPOSE_SANCTION', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_IMPOSE_SANCTION_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.UNLESS_ORDER'],
  [ApplicationTypeOption.VARY_ORDER]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RECONSIDER', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RECONSIDER_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_ORDER'],
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_VARY_JUDGMENT_DESCRIPTION', 'PAGES.GENERAL_APPLICATION.SUMMARY.APPLICATION_TYPE_CCD.VARY_PAYMENT_TERMS_OF_JUDGMENT'],
  [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID]: ['PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CONFIRM_YOU_PAID', 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.CONFIRM_YOU_PAID_DESCRIPTION', 'Confirm CCJ debt paid'],
};
