import {toCUIDependents} from 'services/translation/convertToCUI/convertToCUIDependents';
import {CCDPartnerAndDependent} from 'models/ccdResponse/ccdPartnerAndDependent';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Dependants} from 'form/models/statementOfMeans/dependants/dependants';
import {NumberOfChildren} from 'form/models/statementOfMeans/dependants/numberOfChildren';

describe('translate Dependents to CUI model', () => {
  it('should return undefined if Dependents doesnt exist', () => {
    //Given
    //When
    const output = toCUIDependents(undefined);
    //Then
    expect(output).toBe(undefined);
  });

  it('should return data if Dependents exist', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      haveAnyChildrenRequired: YesNoUpperCamelCase.YES,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: ('1'),
        numberOfElevenToFifteen: ('1'),
        numberOfSixteenToNineteen: ('1'),
      },
    };
    //When
    const output = toCUIDependents(input);
    //Then
    const expected = new Dependants(true, new NumberOfChildren(1, 1, 1));
    expect(output).toEqual(expected);
  });

  it('should return data if Dependents is No and undefined age group', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      haveAnyChildrenRequired: YesNoUpperCamelCase.NO,
      howManyChildrenByAgeGroup: {
        numberOfUnderEleven: undefined,
        numberOfElevenToFifteen: undefined,
        numberOfSixteenToNineteen: undefined,
      },
    };
    //When
    const output = toCUIDependents(input);
    //Then
    const expected = new Dependants(false, new NumberOfChildren(NaN, NaN, NaN));
    expect(output).toEqual(expected);
  });

  it('should return data if Dependents is No and undefined', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      haveAnyChildrenRequired: YesNoUpperCamelCase.NO,
      howManyChildrenByAgeGroup: undefined,
    };
    //When
    const output = toCUIDependents(input);
    //Then
    const expected = new Dependants(false, undefined);
    expect(output).toEqual(expected);
  });

  it('should return undefined if Dependents is undefined', () => {
    //Given
    const input : CCDPartnerAndDependent = {
      haveAnyChildrenRequired: undefined,
      howManyChildrenByAgeGroup: undefined,
    };
    //When
    const output = toCUIDependents(input);
    //Then
    const expected = new Dependants(undefined, undefined);
    expect(output).toEqual(expected);
  });
});
