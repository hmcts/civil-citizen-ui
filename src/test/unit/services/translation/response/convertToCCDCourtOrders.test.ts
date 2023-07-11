import {toCCDCourtOrders} from 'services/translation/response/convertToCCDCourtOrders';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';
import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';

describe('translate Court Orders to CCD model', () => {
  it('should return undefined if it is undefined', () => {
    //Given
    //When
    const output = toCCDCourtOrders(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return undefined if it is empty', () => {
    //Given
    const input = new CourtOrders();
    //When
    const output = toCCDCourtOrders(input);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return value if there is input', () => {
    //Given
    const courtOrderItem = new CourtOrder(1, 1,'test');
    const courtOrder : CourtOrder[] = [
      courtOrderItem,
    ];
    const input = new CourtOrders(true, courtOrder);
    const expected : CCDCourtOrders[] = [{
      value: {
        claimNumberText: 'test',
        amountOwed: 100,
        monthlyInstalmentAmount: 100,
      },
    }];
    //When
    const output = toCCDCourtOrders(input);
    //Then
    expect(output).toEqual(expected);
  });

  it('should return value if input is undefined', () => {
    //Given
    const courtOrderItem = new CourtOrder(undefined, undefined,undefined);
    const courtOrder : CourtOrder[] = [
      courtOrderItem,
    ];
    const input = new CourtOrders(true, courtOrder);
    const expected : CCDCourtOrders[] = [{
      value: {
        claimNumberText: undefined,
        amountOwed: undefined,
        monthlyInstalmentAmount: undefined,
      },
    }];
    //When
    const output = toCCDCourtOrders(input);
    //Then
    expect(output).toEqual(expected);
  });
});
