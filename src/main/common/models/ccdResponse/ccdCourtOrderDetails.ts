export interface CCDCourtOrderDetails {
  id: string,
  value: {
    claimNumberText: string,
    amountOwed: string,
    monthlyInstalmentAmount: string,
  },
}
