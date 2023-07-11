import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';
import {convertToPenceFromString} from 'services/translation/claim/moneyConversation';

export const toCCDLoanCredit = (debtsItem: DebtItems[]): CCDLoanCredit[] => {
  if (!debtsItem?.length) return undefined;

  return debtsItem.map((debtsItem: DebtItems) => {
    return {
      value: {
        loanCardDebtDetail: debtsItem.debt,
        totalOwed: convertToPenceFromString(debtsItem.totalOwned),
        monthlyPayment: convertToPenceFromString(debtsItem.monthlyPayments),
      },
    };
  });
};
