import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';

export const toCCDCourtOrders = (courtOrders: CourtOrders): CCDCourtOrders[] => {
  if (!courtOrders?.rows) return undefined;
  return courtOrders.rows.map((courtOrder: CourtOrder) => {
    return {
      value: {
        claimNumberText: courtOrder.claimNumber,
        amountOwed: courtOrder.amount ? courtOrder.amount*100 : undefined,
        monthlyInstalmentAmount: courtOrder.instalmentAmount ? courtOrder.instalmentAmount*100 : undefined,
      },
    };
  });
};
