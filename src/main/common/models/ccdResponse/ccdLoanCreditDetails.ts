export interface CCDLoanCreditDetails {
  id: string,
  value: {
    loanCardDebtDetail: string,
    monthlyPayment: string,
    totalOwed: string,
  },
}
