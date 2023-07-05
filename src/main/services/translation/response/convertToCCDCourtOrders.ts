import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';

export const toCCDCourtOrders = (courtOrders: CourtOrders): CCDCourtOrders[] => {
  if (!courtOrders?.rows) return undefined;
  return courtOrders.rows.map((courtOrder: CourtOrder) => {
    return {
      value: {
        claimNumberText: courtOrder.claimNumber,
        amountOwed: courtOrder.amount*100,
        monthlyInstalmentAmount: courtOrder.instalmentAmount*100,
      },
    };
  });
};
