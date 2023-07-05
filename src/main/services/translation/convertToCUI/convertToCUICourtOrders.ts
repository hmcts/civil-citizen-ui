import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';
import {toCUIBoolean} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUICourtOrders = (courtOrdersDeclared: YesNoUpperCamelCase, courtOrders: CCDCourtOrders[]): CourtOrders => {
  if (courtOrdersDeclared) return new CourtOrders(toCUIBoolean(courtOrdersDeclared), toCUICourtOrdersList(courtOrders));
};

const toCUICourtOrdersList = (ccdCourtOrders: CCDCourtOrders[]): CourtOrder[] => {
  if (ccdCourtOrders?.length)
  {
    return ccdCourtOrders.map((ccdCourtOrder: CCDCourtOrders) => {
      return new CourtOrder(
        ccdCourtOrder.value?.amountOwed/100,
        ccdCourtOrder.value?.monthlyInstalmentAmount/100,
        ccdCourtOrder.value?.claimNumberText);
    });
  }
};
