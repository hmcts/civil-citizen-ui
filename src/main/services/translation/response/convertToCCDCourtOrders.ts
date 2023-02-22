import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';

export const toCCDCourtOrders = (courtOrders: CourtOrders): CCDCourtOrders[] => {
  if (!courtOrders?.rows) return undefined;
  const ccdCourtOrders: CCDCourtOrders[] = [];
  courtOrders.rows.map((courtOrder: CourtOrder) => {
    const ccdCourtOrder: CCDCourtOrders = {
      value: {
        claimNumberText: courtOrder.claimNumber,
        amountOwed: courtOrder.amount,
        monthlyInstalmentAmount: courtOrder.instalmentAmount,
      },
    };
    ccdCourtOrders.push(ccdCourtOrder);
  });
  return ccdCourtOrders;
};
