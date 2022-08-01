import {BankAccount} from './bankAccount';
import {ValidateNested} from 'class-validator';

const MINIMUM_ROWS = 2;
export class BankAccounts {
  @ValidateNested()
    accounts:BankAccount[];

  constructor(accounts : BankAccount[]) {
    this.accounts = accounts;
  }

  public getOnlyCompletedAccounts(): BankAccount[] {
    if(this.hasAccounts()) {
      return this.accounts.filter(account => account.typeOfAccount !=='' && account.joint !== '' && account.balance!== '' );
    }
  }

  private hasAccounts() {
    return this.accounts?.length > 0;
  }

  public addEmptyRowsIfNotEnough() {
    if(this.accounts.length < MINIMUM_ROWS){
      for(let i = 0; i < MINIMUM_ROWS - this.accounts.length; i++){
        this.accounts.push(new BankAccount());
      }
    }
  }
}
