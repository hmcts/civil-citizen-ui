import {CCDBankAccount, CCDBankAccountType} from 'models/ccdResponse/ccdBankAccount';
import {CitizenBankAccount} from 'models/citizenBankAccount';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {BankAccountTypeValues} from 'form/models/bankAndSavings/bankAccountTypeValues';

export const toCCDBankAccountList = (citizenBankAccount: CitizenBankAccount[]): CCDBankAccount[] => {
  if (!citizenBankAccount?.length || citizenBankAccount?.length <= 0) return undefined;
  const ccdBankAccountList: CCDBankAccount[] = [];
  citizenBankAccount.forEach((citizenBankAccountItem, index) => {
    const ccdBankAccount: CCDBankAccount = {
      value: {
        accountType: toCCDBankAccountType(citizenBankAccountItem.typeOfAccount),
        jointAccount: toJointAccountCheck(citizenBankAccountItem.joint),
        balance: Number(citizenBankAccountItem.balance),
      },
    };
    ccdBankAccountList.push(ccdBankAccount);
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

const toJointAccountCheck = (joint: string): YesNoUpperCamelCase => {
  if (joint === 'true') {
    return YesNoUpperCamelCase.YES;
  } else if (joint === 'false') {
    return YesNoUpperCamelCase.NO;
  } else {
    return undefined;
  }
};
