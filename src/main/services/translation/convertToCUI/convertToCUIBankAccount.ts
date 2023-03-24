import {CitizenBankAccount} from 'models/citizenBankAccount';
import {CCDBankAccount, CCDBankAccountType} from 'models/ccdResponse/ccdBankAccount';
import {BankAccountTypeValues} from 'form/models/bankAndSavings/bankAccountTypeValues';
import {toCUIBooleanString} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIBankAccount = (ccdBankAccount: CCDBankAccount[]): CitizenBankAccount[] => {
  if (!ccdBankAccount?.length) return undefined;
  const citizenBankAccountList =
    ccdBankAccount.map((ccdBankAccount: CCDBankAccount) => {
      return {
        typeOfAccount: toCUIBankAccountType(ccdBankAccount.value?.accountType),
        joint: toCUIBooleanString(ccdBankAccount.value?.jointAccount),
        balance: ccdBankAccount.value?.balance?.toString(),
      };
    });
  return citizenBankAccountList;
};

const toCUIBankAccountType = (typeOfAccount: string): BankAccountTypeValues => {
  switch (typeOfAccount) {
    case CCDBankAccountType.CURRENT:
      return BankAccountTypeValues.CURRENT_ACCOUNT;
    case CCDBankAccountType.SAVINGS:
      return BankAccountTypeValues.SAVINGS_ACCOUNT;
    case CCDBankAccountType.ISA:
      return BankAccountTypeValues.ISA;
    case CCDBankAccountType.OTHER:
      return BankAccountTypeValues.OTHER;
    default:
      return undefined;
  }
};
