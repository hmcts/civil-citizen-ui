import {BankAccounts} from '../../../../../common/form/models/bankAndSavings/bankAccounts';
import {CitizenBankAccount} from '../../../../../common/models/citizenBankAccount';
import {BankAccount} from '../../../../../common/form/models/bankAndSavings/bankAccount';

export function convertFormToCitizenBankAccount(bankAccountForm: BankAccounts): CitizenBankAccount[] {
  if (bankAccountsExist) {
    const accounts = bankAccountForm.getOnlyCompletedAccounts();
    if (accounts?.length > 0) {
      return accounts.map(account => (new CitizenBankAccount(account.typeOfAccount, account.joint, account.balance)));
    }
  }
}

export function convertCitizenBankAccountsToForm(citizenBankAccounts: CitizenBankAccount[]): BankAccounts {
  if (citizenBankAccounts?.length > 0) {
    const accountsForForm = citizenBankAccounts.map(account => new BankAccount(account.typeOfAccount, String(account.joint), account.balance));
    const bankAccountForm = new BankAccounts(accountsForForm);
    bankAccountForm.addEmptyRowsIfNotEnough();
    return bankAccountForm;
  }
  return new BankAccounts([new BankAccount(), new BankAccount()]);
}

function bankAccountsExist(bankAccountForm: BankAccounts): boolean {
  return bankAccountForm?.accounts?.length > 0;
}
