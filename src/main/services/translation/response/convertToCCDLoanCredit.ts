import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';

export const toCCDLoanCredit = (debtsItem: DebtItems[]): CCDLoanCredit[] => {
  if (!debtsItem?.length) return undefined;

  return debtsItem.map((debtsItem: DebtItems) => {
    return {
      value: {
        loanCardDebtDetail: debtsItem.debt,
        totalOwed: Number(debtsItem.totalOwned)*100,
        monthlyPayment: Number(debtsItem.monthlyPayments)*100,
      },
    };
  });
};
