export interface CCDCourtOrders {
  id?: string,
  value?: CCDCourtOrdersItem,
}

export interface CCDCourtOrdersItem {
  claimNumberText?: string,
  amountOwed?: number,
  monthlyInstalmentAmount?: number
}
