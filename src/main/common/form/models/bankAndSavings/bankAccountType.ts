/**
 * Bank account type enum
 */
export class BankAccountType {

  readonly value: string;
  readonly text: string;
  selected: boolean;

  constructor (value: string, displayValue: string) {
    this.value = value;
    this.text = displayValue;
  }

}
