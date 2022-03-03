/**
 * Bank account type enum
 */
export class BankAccountType {
  static readonly CHOOSE = new BankAccountType('', 'Choose');
  static readonly CURRENT_ACCOUNT = new BankAccountType('CURRENT_ACCOUNT', 'Current account');
  static readonly SAVING_ACCOUNT = new BankAccountType('SAVINGS_ACCOUNT', 'Saving account');
  static readonly ISA = new BankAccountType('ISA', 'ISA');
  static readonly OTHER = new BankAccountType('OTHER', 'Other');

  readonly value: string;
  readonly text: string;

  constructor (value: string, displayValue: string) {
    this.value = value;
    this.text = displayValue;
  }

  static all (): BankAccountType[] {
    return [
      BankAccountType.CHOOSE,
      BankAccountType.CURRENT_ACCOUNT,
      BankAccountType.SAVING_ACCOUNT,
      BankAccountType.ISA,
      BankAccountType.OTHER,
    ];
  }
  static required (): BankAccountType[] {
    return [
      BankAccountType.CURRENT_ACCOUNT,
      BankAccountType.SAVING_ACCOUNT,
      BankAccountType.ISA,
      BankAccountType.OTHER,
    ];
  }

  static valueOf (value: string): BankAccountType {
    return BankAccountType.all()
      .filter(type => type.value === value)
      .pop();
  }
}
