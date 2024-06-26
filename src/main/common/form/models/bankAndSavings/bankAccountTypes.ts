import {BankAccountType} from './bankAccountType';
import {BankAccountTypeValues} from '../../../form/models/bankAndSavings/bankAccountTypeValues';

export class BankAccountTypes{
  readonly CHOOSE = new BankAccountType(BankAccountTypeValues.CHOOSE, 'COMMON.CHOOSE');
  CURRENT_ACCOUNT : BankAccountType;
  SAVING_ACCOUNT :  BankAccountType;
  ISA : BankAccountType;
  OTHER : BankAccountType;

  constructor() {
    this.createRequiredTypes();
  }

  all (value:string): BankAccountType[] {
    this.createRequiredTypes();
    return this.selectAndGetBankAccountTypes(value);
  }

  private createRequiredTypes() {
    this.CURRENT_ACCOUNT = new BankAccountType(BankAccountTypeValues.CURRENT_ACCOUNT, 'PAGES.CITIZEN_BANK_ACCOUNTS.CURRENT_ACCOUNT');
    this.SAVING_ACCOUNT = new BankAccountType(BankAccountTypeValues.SAVINGS_ACCOUNT, 'PAGES.CITIZEN_BANK_ACCOUNTS.SAVINGS_ACCOUNT');
    this.ISA = new BankAccountType(BankAccountTypeValues.ISA, 'PAGES.CITIZEN_BANK_ACCOUNTS.ISA');
    this.OTHER = new BankAccountType(BankAccountTypeValues.OTHER, 'PAGES.CITIZEN_BANK_ACCOUNTS.OTHER');
  }

  selectAndGetBankAccountTypes(value?:string): BankAccountType[] {
    if(value) {
      this.selected(value);
    }
    return this.getAllBankBankAccountTypes();
  }
  getAllBankBankAccountTypes() : BankAccountType[] {
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
    return this.getAllBankBankAccountTypes()
      .filter(type => type.value === value)
      .pop();
  }

  selected (value: string) {
    this.valueOf(value).selected = true;
  }
}
