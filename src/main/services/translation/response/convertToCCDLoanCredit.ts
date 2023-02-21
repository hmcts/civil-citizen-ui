import {CCDLoanCredit} from 'models/ccdResponse/ccdLoanCredit';
import {DebtItems} from 'form/models/statementOfMeans/debts/debtItems';

export const toCCDLoanCredit = (debtsItem: DebtItems[]): CCDLoanCredit[] => {
  if (!debtsItem?.length) return undefined;

  const ccdLoanCreditList: CCDLoanCredit[] = [];
  debtsItem.forEach((item, index) => {
    const ccdLoanCredit: CCDLoanCredit = {
      value: {
        loanCardDebtDetail: item.debt,
        totalOwed: Number(item.totalOwned),
        monthlyPayment: Number(item.monthlyPayments),
      },
    };
    ccdLoanCreditList.push(ccdLoanCredit);
  });

  return ccdLoanCreditList;
};
