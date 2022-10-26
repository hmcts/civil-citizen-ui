import { CourtOrder } from "../../../common/form/models/statementOfMeans/courtOrders/courtOrder";
import { CCDCourtOrderDetails } from "../../../common/models/ccdResponse/ccdCourtOrderDetails";

export const convertToCCDCourtOrderDetails = (courtOrders: CourtOrder[]): CCDCourtOrderDetails[] => {
  const ccdCourtOrders: CCDCourtOrderDetails[] = [];
  courtOrders.forEach((courtOrder, index) => {
    const ccdCourtOrder: CCDCourtOrderDetails = {
      id: index.toString(),
      value: {
        claimNumberText: courtOrder.claimNumber,
        amountOwed: courtOrder.amount.toString(),
        monthlyInstalmentAmount: courtOrder.instalmentAmount.toString(),
      }
    };
    ccdCourtOrders.push(ccdCourtOrder)
  })
  return ccdCourtOrders;
};
