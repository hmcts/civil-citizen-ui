
import { DebtItems } from "../../../common/form/models/statementOfMeans/debts/debtItems";
import { CCDLoanCreditDetails } from "../../../common/models/ccdResponse/ccdLoanCreditDetails";

export const convertToCCDLoanCreditDetails = (debtItems: DebtItems[]): CCDLoanCreditDetails[] => {
  const ccdLoanCrediDetails: CCDLoanCreditDetails[] = [];
  debtItems.forEach((debtItem, index) => {
    const ccdLoanCrediDetail: CCDLoanCreditDetails = {
      id: index.toString(),
      value: {
        loanCardDebtDetail: debtItem.debt,
        monthlyPayment: debtItem.monthlyPayments,
        totalOwed: debtItem.totalOwned,
      }
    };
    ccdLoanCrediDetails.push(ccdLoanCrediDetail)
  })
  return ccdLoanCrediDetails;
};
