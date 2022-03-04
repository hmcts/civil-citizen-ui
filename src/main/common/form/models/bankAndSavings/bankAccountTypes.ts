import { BankAccountType } from './bankAccountType';

export class BankAccountTypes{
  readonly CHOOSE = new BankAccountType('', 'Choose');
  CURRENT_ACCOUNT = new BankAccountType('CURRENT_ACCOUNT', 'Current account');
  SAVING_ACCOUNT = new BankAccountType('SAVINGS_ACCOUNT', 'Saving account');
  ISA = new BankAccountType('ISA', 'ISA');
  OTHER = new BankAccountType('OTHER', 'Other');

  all (value?: string): BankAccountType[] {
    if(value) {
      this.selected(value);
    }
    return [
      this.CHOOSE,
      this.CURRENT_ACCOUNT,
      this.SAVING_ACCOUNT,
      this.ISA,
      this.OTHER,
    ];
  }
  required (): BankAccountType[] {
    return [
      this.CURRENT_ACCOUNT,
      this.SAVING_ACCOUNT,
      this.ISA,
      this.OTHER,
    ];
  }

  valueOf (value: string): BankAccountType {
    return this.all()
      .filter(type => type.value === value)
      .pop();
  }

  selected (value: string) {
    this.valueOf(value).selected = true;
  }
}
