import {CCDBankAccount, CCDBankAccountType} from 'models/ccdResponse/ccdBankAccount';
import {CitizenBankAccount} from 'models/citizenBankAccount';
import {BankAccountTypeValues} from 'form/models/bankAndSavings/bankAccountTypeValues';
import {toCCDYesNoFromBooleanString} from 'services/translation/response/convertToCCDYesNo';

export const toCCDBankAccountList = (citizenBankAccount: CitizenBankAccount[]): CCDBankAccount[] => {
  if (!citizenBankAccount?.length) return undefined;
  const ccdBankAccountList =
  citizenBankAccount.map((citizenBankAccountItem: CitizenBankAccount) => {
    return {
      value: {
        accountType: toCCDBankAccountType(citizenBankAccountItem.typeOfAccount),
        jointAccount: toCCDYesNoFromBooleanString(citizenBankAccountItem.joint),
        balance: Number(citizenBankAccountItem.balance),
      },
    };
  });
  return ccdBankAccountList;
};

const toCCDBankAccountType = (typeOfAccount: string): CCDBankAccountType => {
  switch (typeOfAccount) {
    case BankAccountTypeValues.CURRENT_ACCOUNT:
      return CCDBankAccountType.CURRENT;
    case BankAccountTypeValues.SAVINGS_ACCOUNT:
      return CCDBankAccountType.SAVINGS;
    case BankAccountTypeValues.ISA:
      return CCDBankAccountType.ISA;
    case BankAccountTypeValues.OTHER:
      return CCDBankAccountType.OTHER;
    default:
      return undefined;
  }
};
