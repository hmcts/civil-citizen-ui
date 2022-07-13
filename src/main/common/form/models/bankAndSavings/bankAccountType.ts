import {BankAccountTypeValues} from './bankAccountTypeValues';

export class BankAccountType {
  readonly value: BankAccountTypeValues;
  readonly text: string;
  selected: boolean;

  constructor (value: BankAccountTypeValues, displayValue: string) {
    this.value = value;
    this.text = displayValue;
  }
}
