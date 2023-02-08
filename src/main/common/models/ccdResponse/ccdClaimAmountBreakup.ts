export interface CCDClaimAmountBreakup{
  id: string,
  value: CCDClaimAmountBreakupDetails,
}

interface CCDClaimAmountBreakupDetails{
  claimAmount: string,
  claimReason: string,
}
