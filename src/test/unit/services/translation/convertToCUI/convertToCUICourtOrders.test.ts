import {toCUICourtOrders} from 'services/translation/convertToCUI/convertToCUICourtOrders';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {CCDCourtOrders} from 'models/ccdResponse/ccdCourtOrders';
import {CourtOrders} from 'form/models/statementOfMeans/courtOrders/courtOrders';
import {CourtOrder} from 'form/models/statementOfMeans/courtOrders/courtOrder';

describe('translate Court Orders to CUI model', () => {
  it('should return undefined if Court Orders doesnt exist', () => {
    //Given
    //When
    const output = toCUICourtOrders(undefined, undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Court Orders exist', () => {
    //Given
    const input : CCDCourtOrders[] = [
      {
        id: '1',
        value: {
          amountOwed: 10000,
          monthlyInstalmentAmount: 10000,
          claimNumberText: 'test',
        },
      },
    ];
    //When
    const output = toCUICourtOrders(YesNoUpperCamelCase.YES, input);
    //Then
    const courtOrders : CourtOrder[] = [
      new CourtOrder(100, 100, 'test'),
    ];
    const expected = new CourtOrders(true, courtOrders);
    expect(output).toEqual(expected);
  });

  it('should return data if Court Orders is No', () => {
    //Given
    const input : CCDCourtOrders[] = [
      {
        id: '1',
        value: {
          amountOwed: undefined,
          monthlyInstalmentAmount: undefined,
          claimNumberText: undefined,
        },
      },
    ];
    //When
    const output = toCUICourtOrders(YesNoUpperCamelCase.NO, input);
    //Then
    const courtOrders : CourtOrder[] = [
      new CourtOrder(undefined, undefined, undefined),
    ];
    const expected = new CourtOrders(false, courtOrders);
    expect(output).toEqual(expected);
  });

  it('should return data if Court Orders with value is undefined', () => {
    //Given
    const input : CCDCourtOrders[] = [
      {
        id: '1',
        value: undefined,
      },
    ];
    //When
    const output = toCUICourtOrders(YesNoUpperCamelCase.NO, input);
    //Then
    const courtOrders : CourtOrder[] = [
      new CourtOrder(undefined, undefined, undefined),
    ];
    const expected = new CourtOrders(false, courtOrders);
    expect(output).toEqual(expected);
  });

  it('should return data if Court Orders with value is undefined', () => {
    //Given
    //When
    const output = toCUICourtOrders(YesNoUpperCamelCase.NO, undefined);
    //Then
    const expected = new CourtOrders(false, undefined);
    expect(output).toEqual(expected);
  });
});
