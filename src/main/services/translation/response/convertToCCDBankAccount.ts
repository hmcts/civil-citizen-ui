import { CitizenBankAccount } from "common/models/citizenBankAccount";
import { CCDBankAccount } from "../../../common/models/ccdResponse/ccdBankAccount";

export const toCCDBankAccount = (bankAccounts: CitizenBankAccount[]): CCDBankAccount[] => {
  const ccdBankAccounts: CCDBankAccount[] = [];
  bankAccounts.forEach((bankAccount, index) => {
    ccdBankAccounts[index].id = index.toString();
    ccdBankAccounts[index].value.balance = parseInt(bankAccount.balance);
    ccdBankAccounts[index].value.jointAccount = bankAccount.joint.toUpperCase();
    ccdBankAccounts[index].value.accountType = bankAccount.typeOfAccount;
  });
  return ccdBankAccounts;
};
