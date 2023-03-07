export interface CCDLoanCredit {
  id?: string,
  value?: CCDLoanCreditItem,
}

export interface CCDLoanCreditItem {
  loanCardDebtDetail?: string,
  totalOwed?: number,
  monthlyPayment?: number,
}
