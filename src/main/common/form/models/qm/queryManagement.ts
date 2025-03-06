import {IsDefined} from 'class-validator';

export class Hint {
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

export class radioButtonItems{
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
