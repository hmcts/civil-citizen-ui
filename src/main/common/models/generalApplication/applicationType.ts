import {IsDefined, IsIn} from 'class-validator';

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

export type SelectedApplicationTypeOption = {
  applicationType: string;
  applicationTypeDescription: string;
  displayFromCcd: string;
};

const PERSISTABLE_APPLICATION_TYPE_OPTIONS: ApplicationTypeOption[] = Object.values(ApplicationTypeOption)
  .filter(applicationTypeOption => applicationTypeOption !== ApplicationTypeOption.OTHER_OPTION);

const OTHER_APPLICATION_TYPE_OPTIONS: ApplicationTypeOption[] = [
  ApplicationTypeOption.AMEND_A_STMT_OF_CASE,
  ApplicationTypeOption.SUMMARY_JUDGEMENT,
  ApplicationTypeOption.STRIKE_OUT,
  ApplicationTypeOption.STAY_THE_CLAIM,
  ApplicationTypeOption.UNLESS_ORDER,
  ApplicationTypeOption.SETTLE_BY_CONSENT,
  ApplicationTypeOption.OTHER,
];

const PERSISTABLE_APPLICATION_TYPE_OPTION_SET = new Set<unknown>(PERSISTABLE_APPLICATION_TYPE_OPTIONS);
const OTHER_APPLICATION_TYPE_OPTION_SET = new Set<unknown>(OTHER_APPLICATION_TYPE_OPTIONS);

export const getPersistableApplicationTypeOptions = (): ApplicationTypeOption[] => [...PERSISTABLE_APPLICATION_TYPE_OPTIONS];

export const getOtherApplicationTypeOptions = (): ApplicationTypeOption[] => [...OTHER_APPLICATION_TYPE_OPTIONS];

export const isPersistableApplicationTypeOption = (applicationTypeOption: unknown): applicationTypeOption is ApplicationTypeOption =>
  PERSISTABLE_APPLICATION_TYPE_OPTION_SET.has(applicationTypeOption);

export const isOtherApplicationTypeOption = (applicationTypeOption: unknown): applicationTypeOption is ApplicationTypeOption =>
  OTHER_APPLICATION_TYPE_OPTION_SET.has(applicationTypeOption);

export const getInvalidApplicationTypeIndex = (applicationTypes?: ApplicationType[]): number =>
  applicationTypes?.findIndex(applicationType => !isPersistableApplicationTypeOption(applicationType?.option)) ?? -1;

export const hasInvalidApplicationType = (applicationTypes?: ApplicationType[]): boolean =>
  getInvalidApplicationTypeIndex(applicationTypes) >= 0;

export const getDuplicateApplicationTypeIndex = (applicationTypes?: ApplicationType[]): number => {
  const seenApplicationTypeOptions = new Set<ApplicationTypeOption>();
  return applicationTypes?.findIndex((applicationType) => {
    const option = applicationType?.option;
    if (!option) {
      return false;
    }
    if (seenApplicationTypeOptions.has(option)) {
      return true;
    }
    seenApplicationTypeOptions.add(option);
    return false;
  }) ?? -1;
};

export const hasDuplicateApplicationType = (applicationTypes?: ApplicationType[]): boolean =>
  getDuplicateApplicationTypeIndex(applicationTypes) >= 0;

export const assertValidApplicationTypes = (applicationTypes?: ApplicationType[]): void => {
  if (!applicationTypes?.length || hasInvalidApplicationType(applicationTypes) || hasDuplicateApplicationType(applicationTypes)) {
    throw new Error('Invalid general application type selected');
  }
};

export class ApplicationType {
  @IsDefined({ message: 'ERRORS.APPLICATION_TYPE_REQUIRED' })
  @IsIn(PERSISTABLE_APPLICATION_TYPE_OPTIONS, { message: 'ERRORS.APPLICATION_TYPE_REQUIRED' })
    option?: ApplicationTypeOption;

  constructor(option?: ApplicationTypeOption) {
    this.option = option;
  }

  isOtherSelected(): boolean {
    return isOtherApplicationTypeOption(this.option);
  }

}

export const LinkFromValues = {
  start: 'start',
  addAnotherApp: 'addAnotherApp',
} as const;

export const LinKFromValues = LinkFromValues;

export enum ApplicationTypeOptionSelection {
  BY_APPLICATION_TYPE = 'BY_APPLICATION_TYPE',
  BY_APPLICATION_TYPE_DESCRIPTION = 'BY_APPLICATION_TYPE_DESCRIPTION',
  BY_APPLICATION_DISPLAY_FROM_CCD = 'BY_APPLICATION_DISPLAY_FROM_CCD'
}

export const getApplicationTypeOptionByTypeAndDescription = (applicationOption: ApplicationTypeOption, applicationTypeOptionSelection: ApplicationTypeOptionSelection) => {

  const selectedApplicationTypeByOptionElement = selectedApplicationTypeByOptions[applicationOption];
  if (selectedApplicationTypeByOptionElement) {
    switch (applicationTypeOptionSelection) {
      case ApplicationTypeOptionSelection.BY_APPLICATION_TYPE:
        return selectedApplicationTypeByOptionElement.applicationType;
      case  ApplicationTypeOptionSelection.BY_APPLICATION_TYPE_DESCRIPTION:
        return selectedApplicationTypeByOptionElement.applicationTypeDescription;
      case ApplicationTypeOptionSelection.BY_APPLICATION_DISPLAY_FROM_CCD:
        return selectedApplicationTypeByOptionElement.displayFromCcd;
      default:
        return undefined;
    }
  }
  return undefined;
};

export const getApplicationTypeOptionByDisplayValue = (displayValue?: string): ApplicationTypeOption | undefined =>
  (Object.keys(selectedApplicationTypeByOptions) as ApplicationTypeOption[])
    .find(key => selectedApplicationTypeByOptions[key]?.displayFromCcd === displayValue);

export const selectedApplicationTypeByOptions: Partial<Record<ApplicationTypeOption, SelectedApplicationTypeOption>> = {
  [ApplicationTypeOption.ADJOURN_HEARING]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_HEARING',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_HEARING_DESCRIPTION',
    displayFromCcd: 'Adjourn a hearing',
  },
  [ApplicationTypeOption.AMEND_A_STMT_OF_CASE]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CHANGE_CLAIM',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CHANGE_CLAIM_DESCRIPTION',
    displayFromCcd: 'Amend a statement of case',
  },
  [ApplicationTypeOption.EXTEND_TIME]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.MORE_TIME',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_MORE_TIME_DESCRIPTION',
    displayFromCcd: 'Extend time',
  },
  [ApplicationTypeOption.OTHER]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.NOT_ON_LIST',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_DO_SOMETHING_DESCRIPTION',
    displayFromCcd: 'Other',
  },
  [ApplicationTypeOption.OTHER_OPTION]: {
    applicationType: '',
    applicationTypeDescription: '',
    displayFromCcd: 'Other option',
  },
  [ApplicationTypeOption.RELIEF_FROM_SANCTIONS]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RELIEF_PENALTY',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RELIEF_PENALTY_DESCRIPTION',
    displayFromCcd: 'Relief from sanctions',
  },
  [ApplicationTypeOption.SETTLE_BY_CONSENT]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SETTLING',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SETTLING_DESCRIPTION',
    displayFromCcd: 'Settle by consent',
  },
  [ApplicationTypeOption.SET_ASIDE_JUDGEMENT]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CANCEL_JUDGMENT',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_CANCEL_JUDGMENT_DESCRIPTION',
    displayFromCcd: 'Set aside judgment',
  },
  [ApplicationTypeOption.STAY_THE_CLAIM]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.PAUSE',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_PAUSE_DESCRIPTION',
    displayFromCcd: 'Stay the claim',
  },
  [ApplicationTypeOption.STRIKE_OUT]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.STRIKE_OUT',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_STRIKE_OUT_DESCRIPTION',
    displayFromCcd: 'Strike out',
  },
  [ApplicationTypeOption.SUMMARY_JUDGEMENT]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.SUMMARY_JUDGMENT',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_SUMMARY_JUDGMENT_DESCRIPTION',
    displayFromCcd: 'Summary judgment',
  },
  [ApplicationTypeOption.UNLESS_ORDER]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.IMPOSE_SANCTION',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_IMPOSE_SANCTION_DESCRIPTION',
    displayFromCcd: 'Unless order',
  },
  [ApplicationTypeOption.VARY_ORDER]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.RECONSIDER',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_RECONSIDER_DESCRIPTION',
    displayFromCcd: 'Vary order',
  },
  [ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.VARY_JUDGMENT',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.ASK_VARY_JUDGMENT_DESCRIPTION',
    displayFromCcd: 'Vary payment terms of judgment',
  },
  [ApplicationTypeOption.CONFIRM_CCJ_DEBT_PAID]: {
    applicationType: 'PAGES.GENERAL_APPLICATION.SELECTED_APPLICATION_TYPE.CONFIRM_YOU_PAID_CCJ',
    applicationTypeDescription: 'PAGES.GENERAL_APPLICATION.SELECT_TYPE.CONFIRM_YOU_PAID_DESCRIPTION',
    displayFromCcd: 'Confirm you\'ve paid a judgment debt',
  },
};
