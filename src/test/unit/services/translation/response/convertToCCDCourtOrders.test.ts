import {toCCDCourtOrders} from "services/translation/response/convertToCCDCourtOrders";
import {CourtOrders} from "form/models/statementOfMeans/courtOrders/courtOrders";
import {CourtOrder} from "form/models/statementOfMeans/courtOrders/courtOrder";
import {CCDCourtOrders} from "models/ccdResponse/ccdCourtOrders";

describe('translate Court Orders to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    const output = toCCDCourtOrders(undefined);
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is empty', () => {
    const output = toCCDCourtOrders(new CourtOrders());
    expect(output).toBe(undefined);
  });

  it('should return value if there is input', () => {
    const courtOrderItem = new CourtOrder(123, 123,'test');
    const courtOrder : CourtOrder[] = [
      courtOrderItem
    ]
    const input = new CourtOrders(true, courtOrder)
    const expected : CCDCourtOrders[] = [{
      value: {
        claimNumberText: 'test',
        amountOwed: 123,
        monthlyInstalmentAmount: 123,
      }
    }]

    const output = toCCDCourtOrders(input);
    expect(output).toEqual(expected);
  });

  it('should return value if input is undefined', () => {
    const courtOrderItem = new CourtOrder(undefined, undefined,undefined);
    const courtOrder : CourtOrder[] = [
      courtOrderItem
    ]
    const input = new CourtOrders(true, courtOrder)
    const expected : CCDCourtOrders[] = [{
      value: {
        claimNumberText: undefined,
        amountOwed: undefined,
        monthlyInstalmentAmount: undefined,
      }
    }]

    const output = toCCDCourtOrders(input);
    expect(output).toEqual(expected);
  });
});
