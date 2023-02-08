import {YesNoUpperCamelCase} from "form/models/yesNo";

export interface CCDBankAccount {
  id?: string,
  value?: CCDBankAccountItem,
}

interface CCDBankAccountItem {
  accountType?: CCDBankAccountType,
  jointAccount?: YesNoUpperCamelCase,
  balance?: number,
}

export enum CCDBankAccountType {
  CURRENT = 'CURRENT',
  SAVINGS = 'SAVINGS',
  ISA = 'ISA',
  OTHER = 'OTHER',
}
