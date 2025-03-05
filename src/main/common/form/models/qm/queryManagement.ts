import {IsDefined} from 'class-validator';

export class radioButtonItems{
  show: boolean;
  hint: string;
  pageRedirect: string;
  value: string;
  text: string;
  checked: boolean;

  constructor(value: string, text: string, pageRedirect: string, hint?: string, show= true) {
    this.show = show;
    this.hint = hint;
    this.pageRedirect = pageRedirect;
    this.value = value;
    this.text = text;
  }
}
export class WhatDoYouWantToDo {

  @IsDefined({ message: 'ERRORS.APPLICATION_TYPE_REQUIRED' })
    option?: WhatToDoTypeOption;
  items: radioButtonItems[] ;

  constructor(option: WhatToDoTypeOption, radioButtonItems?: radioButtonItems[] ) {
    this.option = option;
    this.items = radioButtonItems;
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

export class QueryManagement {
  whatDoYouWantToDo: WhatDoYouWantToDo;

}
