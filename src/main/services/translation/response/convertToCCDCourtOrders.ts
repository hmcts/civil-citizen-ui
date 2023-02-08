import {CCDCourtOrders} from "models/ccdResponse/ccdCourtOrders";
import {CourtOrders} from "form/models/statementOfMeans/courtOrders/courtOrders";

export const toCCDCourtOrders = (courtOrders: CourtOrders): CCDCourtOrders[] => {
  if (!courtOrders?.rows) return undefined;
  const ccdCourtOrders: CCDCourtOrders[] = [];
  courtOrders.rows.forEach((row, index) => {
    const ccdCourtOrder: CCDCourtOrders = {
      value: {
        claimNumberText: row.claimNumber,
        amountOwed: row.amount,
        monthlyInstalmentAmount: row.instalmentAmount,
      },
    }
    ccdCourtOrders.push(ccdCourtOrder)
  })
  return ccdCourtOrders;
}
