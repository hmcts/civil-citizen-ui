import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';

export const toCCDLoanCredit = (debtsItem: DebtItems[]): CCDLoanCredit[] => {
  if (!debtsItem?.length) return undefined;

  const ccdLoanCreditList: CCDLoanCredit[] = [];
  debtsItem.map((debtsItem: DebtItems) => {
    const ccdLoanCredit: CCDLoanCredit = {
      value: {
        loanCardDebtDetail: debtsItem.debt,
        totalOwed: Number(debtsItem.totalOwned),
        monthlyPayment: Number(debtsItem.monthlyPayments),
      },
    };
    ccdLoanCreditList.push(ccdLoanCredit);
  });

  return ccdLoanCreditList;
};
