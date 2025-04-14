import {IsDefined} from 'class-validator';
import {ValidationArgs} from 'form/models/genericForm';
import {GenericYesNoCarmEmailConfirmation} from 'form/models/genericYesNoCarmEmailConfirmation';
import {CreateQuery} from 'models/queryManagement/createQuery';

export class Hint {
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

export class RadioButtonItems {
  hint: Hint;
  value: string;
  text: string;

  checked: boolean;

  constructor(value: string, text: string, hint?: string, checked= false) {
    this.hint = hint ? new Hint(hint) : undefined;
    this.value = value;
    this.text = text;
    this.checked = checked;
  }
}

export class WhatDoYouWantToDo {

  @IsDefined({ message: 'ERRORS.QUERY_MANAGEMENT_YOU_MUST_SELECT' })
    option?: WhatToDoTypeOption;
  items: RadioButtonItems[] ;

  constructor(option: WhatToDoTypeOption, radioButtonItems?: RadioButtonItems[] ) {
    this.option = option;
    this.items = radioButtonItems;
  }
}

const withMessage = (buildErrorFn: (messageName: string) => string) => {
  return (args: ValidationArgs<GenericYesNoCarmEmailConfirmation>): string => {
    return buildErrorFn(args.object.messageName);
  };
};

const generateErrorMessage = (messageName: string): string => {
  return messageName;
};

export class QualifyingQuestion {

  @IsDefined({message: withMessage(generateErrorMessage)})
    option?: QualifyingQuestionTypeOption;
  items: RadioButtonItems[] ;
  messageName?: string;

  constructor(option: QualifyingQuestionTypeOption, radioButtonItems?: RadioButtonItems[], messageName?: string ) {
    this.option = option;
    this.items = radioButtonItems;
    this.messageName = messageName;
  }
}

export enum WhatToDoTypeOption {
  CHANGE_CASE = 'CHANGE_CASE',
  GET_UPDATE = 'GET_UPDATE',
  SEND_UPDATE = 'SEND_UPDATE',
  SEND_DOCUMENTS = 'SEND_DOCUMENTS',
  SOLVE_PROBLEM = 'SOLVE_PROBLEM',
  MANAGE_HEARING = 'MANAGE_HEARING',
  GET_SUPPORT = 'GET_SUPPORT',
  FOLLOW_UP = 'FOLLOW_UP',
  SOMETHING_ELSE = 'SOMETHING_ELSE',
}

export enum QualifyingQuestionTypeOption {
  GENERAL_UPDATE  = 'GENERAL_UPDATE',
  CLAIM_NOT_PAID  = 'CLAIM_NOT_PAID',
  CLAIM_NOT_PAID_AFTER_JUDGMENT  = 'CLAIM_NOT_PAID_AFTER_JUDGMENT',
  PAID_OR_PARTIALLY_PAID_JUDGMENT= 'PAID_OR_PARTIALLY_PAID_JUDGMENT',
  SETTLE_CLAIM= 'SETTLE_CLAIM',
  AMEND_CLAIM_DETAILS= 'AMEND_CLAIM_DETAILS',
  CLAIM_ENDED= 'CLAIM_ENDED',
  SOLVE_PROBLEM_SOMETHING_ELSE= 'SOLVE_PROBLEM_SOMETHING_ELSE',
  SEND_UPDATE_SOMETHING_ELSE= 'SEND_UPDATE_SOMETHING_ELSE',
  MANAGE_HEARING_SOMETHING_ELSE= 'MANAGE_HEARING_SOMETHING_ELSE',
  ENFORCEMENT_REQUESTS='ENFORCEMENT_REQUESTS',
  CLAIM_DOCUMENTS_AND_EVIDENCE='CLAIM_DOCUMENTS_AND_EVIDENCE',
  SUBMIT_RESPONSE_CLAIM='SUBMIT_RESPONSE_CLAIM',
  SEE_THE_CLAIM_ON_MY_ACCOUNT='SEE_THE_CLAIM_ON_MY_ACCOUNT',
  VIEW_DOCUMENTS_ON_MY_ACCOUNT='VIEW_DOCUMENTS_ON_MY_ACCOUNT',
  CHANGE_THE_HEARING_DATE='CHANGE_THE_HEARING_DATE',
  CHANGE_SOMETHING_ABOUT_THE_HEARING='CHANGE_SOMETHING_ABOUT_THE_HEARING',
  ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING='ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING',
}

export class QueryManagement {
  whatDoYouWantToDo: WhatDoYouWantToDo;
  qualifyingQuestion : QualifyingQuestion;
  createQuery: CreateQuery;
}
